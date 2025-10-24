import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { buildGenreRulesPrompt } from "@/lib/validation/genre-rules-builder"
import { getGenreMetrics } from "@/lib/metrics/brazilian-metrics"
import { getUniversalRhymeRules } from "@/lib/validation/universal-rhyme-rules"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter-brasileiro"
import {
  formatSertanejoPerformance,
  shouldUsePerformanceFormat,
} from "@/lib/formatters/sertanejo-performance-formatter"
import { formatInstrumentationForAI } from "@/lib/normalized-genre"

export async function POST(request: NextRequest) {
  try {
    const {
      genre,
      mood,
      theme,
      additionalRequirements = "",
      performanceMode = "standard",
      title,
    } = await request.json()

    if (!genre || typeof genre !== "string" || !genre.trim()) {
      return NextResponse.json({ error: "Gênero é obrigatório" }, { status: 400 })
    }
    if (!theme || typeof theme !== "string" || !theme.trim()) {
      return NextResponse.json({ error: "Tema é obrigatório" }, { status: 400 })
    }

    console.log(`[API] 🎵 Criando letra para: ${genre} | Tema: ${theme}`)

    const genreMetrics = getGenreMetrics(genre)
    const maxSyllables = Math.min(genreMetrics.syllableRange.max, 12)
    const minSyllables = genreMetrics.syllableRange.min
    const rhymeRules = getUniversalRhymeRules(genre)

    const genreRules = buildGenreRulesPrompt(genre)
    const prompt = `Você é um compositor brasileiro especializado em ${genre}.

TAREFA: Criar uma música completa com estrutura profissional.

TEMA: ${theme}
HUMOR: ${mood || "Adaptado ao tema"}
${additionalRequirements ? `REQUISITOS: ${additionalRequirements}` : ""}

REGRAS DE MÉTRICA:
- Versos: ${minSyllables}–${maxSyllables} sílabas
- Use contrações naturais ("cê", "pra", "tô")
- Evite versos com mais de ${maxSyllables} sílabas

REGRAS DE RIMA:
- ${rhymeRules.requirePerfectRhymes ? "Rimas perfeitas obrigatórias" : "Rimas naturais aceitáveis"}
- ${rhymeRules.minRichRhymePercentage > 0 ? `Mínimo ${rhymeRules.minRichRhymePercentage}% rimas ricas` : ""}

${genreRules.fullPrompt}

ESTRUTURA:
${
  performanceMode === "performance"
    ? "[INTRO]\n[VERSE 1]\n[PRE-CHORUS]\n[CHORUS]\n[VERSE 2]\n[CHORUS]\n[BRIDGE]\n[CHORUS]\n[OUTRO]"
    : "[Intro]\n[Verso 1]\n[Pré-Refrão]\n[Refrão]\n[Verso 2]\n[Refrão]\n[Ponte]\n[Refrão]\n[Outro]"
}

REGRAS:
- Refrão memorável e repetível
- Linguagem brasileira autêntica
- Evite clichês ("coraçãozinho", "lágrimas no rosto")
- ${performanceMode === "performance" ? "Tags em inglês, versos em português" : "Tags em português"}

Retorne APENAS a letra, sem explicações.`

    console.log(`[API] 🎵 Gerando com métrica ${minSyllables}-${maxSyllables} sílabas...`)

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.85,
    })

    let finalLyrics = capitalizeLines(text)

    // Remove explicações da IA
    finalLyrics = finalLyrics
      .split("\n")
      .filter(
        (line) =>
          !line.trim().startsWith("Retorne") &&
          !line.trim().startsWith("REGRAS") &&
          !line.includes("Explicação"),
      )
      .join("\n")
      .trim()

    // 🔁 PÓS-GERAÇÃO: Validação e correção para Sertanejo Raiz
    if (genre.toLowerCase().includes("raiz")) {
      const forbiddenInstruments = ["electric guitar", "808", "synth", "drum machine", "bateria eletrônica"]
      const lowerLyrics = finalLyrics.toLowerCase()
      if (forbiddenInstruments.some(inst => lowerLyrics.includes(inst))) {
        // Substitui termos proibidos por alternativas acústicas
        finalLyrics = finalLyrics
          .replace(/electric guitar/gi, "acoustic guitar")
          .replace(/808|drum machine|bateria eletrônica/gi, "light percussion")
          .replace(/synth/gi, "sanfona")
      }
    }

    // Aplica formatação de performance se necessário
    if (shouldUsePerformanceFormat(genre, performanceMode)) {
      finalLyrics = formatSertanejoPerformance(finalLyrics, genre)
    }

    const instrumentation = formatInstrumentationForAI(genre)
    finalLyrics = `${finalLyrics}\n\n${instrumentation}`

    // Validação de métrica
    const lines = finalLyrics.split("\n")
    let validLines = 0
    let totalLines = 0

    for (const line of lines) {
      if (line.trim() && !line.startsWith("[") && !line.startsWith("(")) {
        totalLines++
        const syllables = countPoeticSyllables(line)
        if (syllables >= minSyllables && syllables <= maxSyllables) {
          validLines++
        }
      }
    }

    const validityRatio = totalLines > 0 ? validLines / totalLines : 1
    const finalScore = Math.round(validityRatio * 100)

    console.log(`[API] ✅ Validação: ${finalScore}% dentro da métrica`)

    return NextResponse.json({
      lyrics: finalLyrics,
      title: title || `${theme} - ${genre}`,
      meta: {
        finalScore,
        genre,
        performanceMode,
        syllableRange: { min: minSyllables, max: maxSyllables },
      },
    })
  } catch (error) {
    console.error("[API] ❌ Erro na criação:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro interno",
        details: process.env.NODE_ENV === "development" ? (error as any)?.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: "Método não permitido" }, { status: 405 })
}
