import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { buildGenreRulesPrompt } from "@/lib/validation/genre-rules-builder"
import { getUniversalRhymeRules } from "@/lib/validation/universal-rhyme-rules"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter-brasileiro"
import {
  formatSertanejoPerformance,
  shouldUsePerformanceFormat,
} from "@/lib/formatters/sertanejo-performance-formatter"
import { formatInstrumentationForAI } from "@/lib/normalized-genre"
import { LineStacker } from "@/lib/utils/line-stacker"
import { enhanceLyricsRhymes } from "@/lib/validation/rhyme-enhancer"
import { validateRhymesForGenre } from "@/lib/validation/rhyme-validator"
import { validateSyllablesByGenre } from "@/lib/validation/absolute-syllable-enforcer" // ✅

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

    // ✅ Obtém métrica DIRETAMENTE do genre-config.ts
    const syllableValidation = validateSyllablesByGenre("", genre)
    const maxSyllables = syllableValidation.maxSyllables
    const minSyllables = 8 // padrão seguro; pode ser refinado se necessário

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
- NUNCA exceda ${maxSyllables} sílabas (limite humano de canto)

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

    // Validação e melhoria de rimas
    console.log("[API] 🎵 Validando qualidade das rimas...")
    const rhymeValidation = validateRhymesForGenre(finalLyrics, genre)
    if (!rhymeValidation.valid || rhymeValidation.warnings.length > 0) {
      console.log("[API] 🔧 Melhorando rimas automaticamente...")
      const rhymeEnhancement = await enhanceLyricsRhymes(finalLyrics, genre, theme, 0.7)
      if (rhymeEnhancement.improvements.length > 0) {
        console.log(`[API] ✅ ${rhymeEnhancement.improvements.length} rima(s) melhorada(s)`)
        finalLyrics = rhymeEnhancement.enhancedLyrics
      }
    }

    // Correção de sílabas
    console.log("[API] 🔧 Aplicando correção automática de sílabas...")
    const enforcementResult = AbsoluteSyllableEnforcer.validateAndFix(finalLyrics)
    if (enforcementResult.corrections > 0) {
      console.log(`[API] ✅ ${enforcementResult.corrections} verso(s) corrigido(s) automaticamente`)
      finalLyrics = enforcementResult.correctedLyrics
    }

    // Empilhamento
    console.log("[API] 📚 Empilhando versos...")
    const stackResult = LineStacker.stackLines(finalLyrics)
    if (stackResult.improvements.length > 0) {
      console.log(`[API] ✅ ${stackResult.improvements.length} verso(s) empilhado(s)`)
    }
    finalLyrics = stackResult.stackedLyrics

    // Pós-geração: Sertanejo Raiz
    if (genre.toLowerCase().includes("raiz")) {
      const forbiddenInstruments = ["electric guitar", "808", "synth", "drum machine", "bateria eletrônica"]
      const lowerLyrics = finalLyrics.toLowerCase()
      if (forbiddenInstruments.some((inst) => lowerLyrics.includes(inst))) {
        finalLyrics = finalLyrics
          .replace(/electric guitar/gi, "acoustic guitar")
          .replace(/808|drum machine|bateria eletrônica/gi, "light percussion")
          .replace(/synth/gi, "sanfona")
      }
    }

    // Formatação de performance
    if (shouldUsePerformanceFormat(genre, performanceMode)) {
      console.log("[API] 🎭 Aplicando formatação de performance...")
      finalLyrics = formatSertanejoPerformance(finalLyrics, genre)
    }

    const instrumentation = formatInstrumentationForAI(genre, finalLyrics)
    finalLyrics = `${finalLyrics}\n\n${instrumentation}`

    // ✅ Validação final usando o mesmo limite do gênero
    const finalValidation = validateSyllablesByGenre(finalLyrics, genre)
    const validityRatio = finalValidation.violations.length === 0 ? 1 : 0
    const finalScore = Math.round(validityRatio * 100)

    console.log(`[API] ✅ Validação final: ${finalScore}% dentro da métrica (${genre})`)

    return NextResponse.json({
      lyrics: finalLyrics,
      title: title || `${theme} - ${genre}`,
      meta: {
        finalScore,
        genre,
        performanceMode,
        syllableRange: { min: minSyllables, max: maxSyllables },
        syllableCorrections: enforcementResult.corrections,
        syllableViolations: finalValidation.violations.length,
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
