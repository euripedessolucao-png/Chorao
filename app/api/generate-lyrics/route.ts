// app/api/generate-lyrics/route.ts

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

export async function POST(request: NextRequest) {
  try {
    const {
      genre, // ✅ nomes consistentes
      mood,
      theme,
      additionalRequirements = "",
      performanceMode = "standard",
      title,
    } = await request.json()

    // ✅ Validação robusta
    if (!genre || typeof genre !== "string" || !genre.trim()) {
      return NextResponse.json({ error: "Gênero é obrigatório" }, { status: 400 })
    }
    if (!theme || typeof theme !== "string" || !theme.trim()) {
      return NextResponse.json({ error: "Tema é obrigatório" }, { status: 400 })
    }

    console.log(`[API] 🎵 Criando letra para: ${genre} | Tema: ${theme}`)

    // ✅ Obtém métricas reais
    const genreMetrics = getGenreMetrics(genre)

    const maxSyllables = Math.min(genreMetrics.syllableRange.max, 12)
    const minSyllables = genreMetrics.syllableRange.min
    const rhymeRules = getUniversalRhymeRules(genre)

    // ✅ Constrói prompt com métrica realista
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
      model: "openai/gpt-4o-mini", // ✅ mais rápido e barato
      prompt,
      temperature: 0.85, // Aumentado para melhor criatividade
    })

    // ✅ Processamento pós-geração
    let finalLyrics = capitalizeLines(text)

    // Remove explicações da IA
    finalLyrics = finalLyrics
      .split("\n")
      .filter(
        (line) =>
          !line.trim().startsWith("Retorne") && !line.trim().startsWith("REGRAS") && !line.includes("Explicação"),
      )
      .join("\n")
      .trim()

    if (shouldUsePerformanceFormat(genre, performanceMode)) {
      finalLyrics = formatSertanejoPerformance(finalLyrics)
    }

    // ✅ Validação de métrica
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

function getGenreInstruments(genre: string): string {
  const instruments: Record<string, string> = {
    Sertanejo: "acoustic guitar, viola, bass, drums, accordion",
    "Sertanejo Moderno": "acoustic guitar, electric guitar, synth, bass, drums",
    MPB: "nylon guitar, piano, bass, light percussion",
    Funk: "drum machine, synth bass, samples",
    Forró: "accordion, triangle, zabumba, bass",
    Rock: "electric guitar, bass, drums, keyboard",
    Pop: "synth, drum machine, bass, piano",
    default: "guitar, bass, drums, keyboard",
  }
  return instruments[genre] || instruments.default
}

function getGenreBPM(genre: string): string {
  const bpms: Record<string, string> = {
    Sertanejo: "72",
    "Sertanejo Moderno": "85",
    MPB: "90",
    Funk: "110",
    Forró: "120",
    Rock: "130",
    Pop: "100",
    default: "100",
  }
  return bpms[genre] || bpms.default
}

export async function GET() {
  return NextResponse.json({ error: "Método não permitido" }, { status: 405 })
}
