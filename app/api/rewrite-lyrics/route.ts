import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { buildGenreRulesPrompt } from "@/lib/validation/genre-rules-builder"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter-brasileiro"
import { getUniversalRhymeRules } from "@/lib/validation/universal-rhyme-rules"
import {
  formatSertanejoPerformance,
  shouldUsePerformanceFormat,
} from "@/lib/formatters/sertanejo-performance-formatter"
import { formatInstrumentationForAI } from "@/lib/normalized-genre"
import { LineStacker } from "@/lib/utils/line-stacker"
import { enhanceLyricsRhymes } from "@/lib/validation/rhyme-enhancer"
import { validateRhymesForGenre } from "@/lib/validation/rhyme-validator"
import { validateSyllablesByGenre } from "@/lib/validation/absolute-syllable-enforcer"
import { fixLineToMaxSyllables } from "@/lib/validation/local-syllable-fixer"
import { validateVerseCompleteness, fixIncompleteVerses } from "@/lib/validation/verse-completeness-validator"

export async function POST(request: NextRequest) {
  try {
    const {
      originalLyrics,
      genre,
      mood,
      theme,
      additionalRequirements,
      title,
      performanceMode = "standard",
    } = await request.json()

    if (!originalLyrics?.trim()) {
      return NextResponse.json({ error: "Letra original é obrigatória" }, { status: 400 })
    }
    if (!genre || typeof genre !== "string" || !genre.trim()) {
      return NextResponse.json({ error: "Gênero é obrigatório" }, { status: 400 })
    }

    console.log(`[API] 🎵 Reescrevendo letra para: ${genre}`)

    // ✅ Usa validateSyllablesByGenre como fonte única da verdade
    const syllableValidation = validateSyllablesByGenre("", genre)
    const maxSyllables = syllableValidation.maxSyllables

    const rhymeRules = getUniversalRhymeRules(genre)
    const genreRules = buildGenreRulesPrompt(genre)

    const prompt = `Você é um compositor brasileiro especializado em ${genre}.

TAREFA: Reescrever a letra abaixo mantendo a essência mas adaptando para ${genre}.

LETRA ORIGINAL:
${originalLyrics}

TEMA: ${theme || "Manter tema original"}
HUMOR: ${mood || "Manter humor original"}
${additionalRequirements ? `REQUISITOS: ${additionalRequirements}` : ""}

REGRAS DE MÉTRICA:
- Máximo: ${maxSyllables} sílabas por verso (limite absoluto)
- Use contrações naturais ("cê", "pra", "tô")
- Versos curtos são permitidos
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

REGRAS CRÍTICAS:
- NUNCA corte versos no meio
- Cada verso deve ser completo e fazer sentido sozinho
- Mantenha a mensagem central da letra original
- Adapte linguagem e estilo para ${genre}
- Refrão memorável e repetível
- Evite clichês ("coraçãozinho", "lágrimas no rosto")
- ${performanceMode === "performance" ? "Tags em inglês, versos em português" : "Tags em português"}

Retorne APENAS a letra reescrita, sem explicações.`

    console.log(`[API] 🔄 Reescrevendo com limite máximo de ${maxSyllables} sílabas...`)

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.8,
    })

    let finalLyrics = capitalizeLines(text)

    finalLyrics = finalLyrics
      .split("\n")
      .filter(
        (line) =>
          !line.trim().startsWith("Retorne") && !line.trim().startsWith("REGRAS") && !line.includes("Explicação"),
      )
      .join("\n")
      .trim()

    console.log("[API] 📝 Validando completude dos versos...")
    const verseValidation = validateVerseCompleteness(finalLyrics)
    if (!verseValidation.valid || verseValidation.warnings.length > 0) {
      console.log("[API] 🔧 Corrigindo versos incompletos...")
      const verseFixResult = fixIncompleteVerses(finalLyrics)
      if (verseFixResult.changes.length > 0) {
        console.log(`[API] ✅ ${verseFixResult.changes.length} verso(s) corrigido(s)`)
        finalLyrics = verseFixResult.fixed
      }
    }

    console.log("[API] 🎵 Validando qualidade das rimas...")
    const rhymeValidation = validateRhymesForGenre(finalLyrics, genre)
    if (!rhymeValidation.valid || rhymeValidation.warnings.length > 0) {
      console.log("[API] 🔧 Melhorando rimas automaticamente...")
      const rhymeEnhancement = await enhanceLyricsRhymes(finalLyrics, genre, theme || "reescrita", 0.7)
      if (rhymeEnhancement.improvements.length > 0) {
        console.log(`[API] ✅ ${rhymeEnhancement.improvements.length} rima(s) melhorada(s)`)
        finalLyrics = rhymeEnhancement.enhancedLyrics
      }
    }

    console.log("[API] 🔧 Aplicando correção automática de sílabas...")
    const lines = finalLyrics.split("\n")
    const correctedLines: string[] = []
    let corrections = 0

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("(") || trimmed.startsWith("[")) {
        correctedLines.push(line)
        continue
      }

      const lineWithoutBrackets = trimmed.replace(/\[.*?\]/g, "").trim()
      if (!lineWithoutBrackets) {
        correctedLines.push(line)
        continue
      }

      const syllables = countPoeticSyllables(lineWithoutBrackets)
      if (syllables > maxSyllables) {
        const fixed = fixLineToMaxSyllables(trimmed, maxSyllables)
        correctedLines.push(fixed)
        corrections++
      } else {
        correctedLines.push(line)
      }
    }

    if (corrections > 0) {
      console.log(`[API] ✅ ${corrections} verso(s) corrigido(s) automaticamente`)
      finalLyrics = correctedLines.join("\n")
    }

    console.log("[API] 📚 Empilhando versos...")
    const stackingResult = LineStacker.stackLines(finalLyrics)
    if (stackingResult.improvements.length > 0) {
      console.log(`[API] ✅ ${stackingResult.improvements.length} verso(s) empilhado(s)`)
    }
    finalLyrics = stackingResult.stackedLyrics

    if (shouldUsePerformanceFormat(genre, performanceMode)) {
      console.log("[API] 🎭 Aplicando formatação de performance...")
      finalLyrics = formatSertanejoPerformance(finalLyrics, genre)
    }

    console.log("[API] 🎸 Adicionando instrumentação...")
    const instrumentation = formatInstrumentationForAI(genre, finalLyrics)
    finalLyrics = `${finalLyrics}\n\n${instrumentation}`

    // ✅ Validação final com o mesmo sistema usado no front-end
    const finalValidation = validateSyllablesByGenre(finalLyrics, genre)
    const validityRatio = finalValidation.violations.length === 0 ? 1 : 0
    const finalScore = Math.round(validityRatio * 100)

    const finalVerseValidation = validateVerseCompleteness(finalLyrics)

    console.log(`[API] ✅ Validação final: ${finalScore}% dentro da métrica (${genre})`)
    console.log(`[API] ✅ Completude dos versos: ${finalVerseValidation.score}%`)

    return NextResponse.json({
      success: true,
      lyrics: finalLyrics,
      title: title || `${theme || "Reescrita"} - ${genre}`,
      metadata: {
        finalScore,
        genre,
        performanceMode,
        maxSyllables,
        syllableCorrections: corrections,
        stackingScore: stackingResult.stackingScore,
        syllableViolations: finalValidation.violations.length,
        verseCompletenessScore: finalVerseValidation.score,
        incompleteVerses: finalVerseValidation.incompleteVerses.length,
      },
    })
  } catch (error) {
    console.error("[API] ❌ Erro na reescrita:", error)
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
