// app/api/rewrite-lyrics/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { buildGenreRulesPrompt } from "@/lib/validation/genre-rules-builder"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter-brasileiro"
import { getUniversalRhymeRules } from "@/lib/validation/universal-rhyme-rules"
import { formatInstrumentationForAI } from "@/lib/normalized-genre"
import { LineStacker } from "@/lib/utils/line-stacker"
import { validateSyllablesByGenre } from "@/lib/validation/absolute-syllable-enforcer"
import { fixLineToMaxSyllables } from "@/lib/validation/local-syllable-fixer"

// ✅ Importação correta do genre-config
import { GENRE_CONFIGS } from "@/lib/genre-config"

// ✅ Função tipo-segura para acessar configurações
function getMaxSyllables(genre: string): number {
  // ✅ Acesso seguro ao genre config
  const genreConfig = (GENRE_CONFIGS as any)[genre]
  
  if (!genreConfig?.prosody_rules?.syllable_count) {
    return 12 // Fallback padrão
  }

  const syllableCount = genreConfig.prosody_rules.syllable_count

  if ("absolute_max" in syllableCount) {
    return syllableCount.absolute_max as number
  }

  if ("without_comma" in syllableCount) {
    const withoutComma = syllableCount.without_comma as { acceptable_up_to?: number; max?: number }
    return withoutComma.acceptable_up_to || withoutComma.max || 12
  }

  if ("with_comma" in syllableCount) {
    const withComma = syllableCount.with_comma as { total_max?: number }
    return withComma.total_max || 12
  }

  return 12
}

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

    // ✅ Configurações do gênero - AGORA CORRETO
    const maxSyllables = getMaxSyllables(genre)
    const rhymeRules = getUniversalRhymeRules(genre)
    const genreRules = buildGenreRulesPrompt(genre)

    const prompt = `Você é um compositor brasileiro especializado em ${genre}.

TAREFA: Reescrever COMPLETAMENTE a letra abaixo para ${genre}, mantendo a essência.

🎯 REGRA ABSOLUTA: 
- CADA VERSO deve ser uma FRASE COMPLETA
- NUNCA corte versos no meio
- Cada linha deve fazer sentido SOZINHA

LETRA ORIGINAL (apenas como inspiração):
${originalLyrics}

TEMA: ${theme || "Gratidão a Deus"}
HUMOR: ${mood || "Alegre e reverente"}

${additionalRequirements ? `⚡ REQUISITOS ESPECIAIS:\n${additionalRequirements}` : ""}

📏 REGRAS TÉCNICAS:
- Máximo ${maxSyllables} sílabas por verso
- Versos COMPLETOS e COERENTES
- Linguagem natural brasileira
- ${rhymeRules.requirePerfectRhymes ? "Rimas perfeitas" : "Rimas naturais"}

${genreRules.fullPrompt}

🎵 ESTRUTURA DA MÚSICA:
${
  performanceMode === "performance" 
    ? `[INTRO] (2-4 linhas)
[VERSE 1] (4-6 linhas)  
[PRE-CHORUS] (2-4 linhas)
[CHORUS] (4-6 linhas)
[VERSE 2] (4-6 linhas)
[CHORUS] (4-6 linhas)
[BRIDGE] (4-6 linhas)
[CHORUS] (4-6 linhas)
[OUTRO] (2-4 linhas)`
    : `[Intro] (2-4 linhas)
[Verso 1] (4-6 linhas)
[Pré-Refrão] (2-4 linhas)
[Refrão] (4-6 linhas)
[Verso 2] (4-6 linhas)
[Refrão] (4-6 linhas)
[Ponte] (4-6 linhas)
[Refrão] (4-6 linhas)
[Outro] (2-4 linhas)`
}

🚫 PROIBIDO:
- Versos incompletos como "por cada" ou "que me" ou "sempre a"
- Frases cortadas no meio
- Pontuação de continuação no final dos versos

✅ OBRIGATÓRIO:
- Cada verso = frase completa com sujeito + verbo
- Refrão memorável (repetido 3 vezes)
- Mensagem clara e emocional
- Adaptação fiel ao gênero ${genre}

Retorne APENAS a letra reescrita completa, sem explicações.`

    console.log(`[API] 🔄 Gerando letra com ${maxSyllables} sílabas máximas...`)

    // ✅ GERAÇÃO SIMPLES
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.8,
    })

    let finalLyrics = capitalizeLines(text)

    // ✅ LIMPEZA BÁSICA
    finalLyrics = finalLyrics
      .split("\n")
      .filter(line => {
        const trimmed = line.trim()
        return !trimmed.startsWith("Retorne") && 
               !trimmed.startsWith("REGRAS") && 
               !trimmed.includes("Explicação") &&
               !trimmed.includes("```") &&
               trimmed.length > 0
      })
      .join("\n")
      .trim()

    // ✅ CORREÇÃO AUTOMÁTICA DE SÍLABAS
    console.log("[API] 🔧 Aplicando correção de sílabas...")
    const lines = finalLyrics.split("\n")
    const correctedLines: string[] = []
    let corrections = 0

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("(") || trimmed.startsWith("[")) {
        correctedLines.push(line)
        continue
      }

      const lineWithoutBrackets = trimmed.replace(/\[.*?\]/g, "").replace(/\(.*?\)/g, "").trim()
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
      console.log(`[API] ✅ ${corrections} verso(s) corrigido(s)`)
      finalLyrics = correctedLines.join("\n")
    }

    // ✅ EMPILHAMENTO DE LINHAS
    console.log("[API] 📚 Empilhando versos...")
    const stackingResult = LineStacker.stackLines(finalLyrics)
    finalLyrics = stackingResult.stackedLyrics

    // ✅ INSTRUMENTAÇÃO
    console.log("[API] 🎸 Adicionando instrumentação...")
    const instrumentation = formatInstrumentationForAI(genre, finalLyrics)
    finalLyrics = `${finalLyrics}\n\n${instrumentation}`

    // ✅ VALIDAÇÃO FINAL
    const finalValidation = validateSyllablesByGenre(finalLyrics, genre)
    const finalLineCount = finalLyrics.split('\n').filter(line => line.trim().length > 0).length

    console.log(`[API] ✅ Geração concluída: ${finalLineCount} linhas`)
    console.log(`[API] ✅ Sílabas válidas: ${finalValidation.violations.length === 0 ? '100%' : 'com erros'}`)

    return NextResponse.json({
      success: true,
      lyrics: finalLyrics,
      title: title || `${theme || "Reescrita"} - ${genre}`,
      metadata: {
        genre,
        performanceMode,
        maxSyllables,
        totalLines: finalLineCount,
        syllableCorrections: corrections,
        syllableViolations: finalValidation.violations.length,
        stackingScore: stackingResult.stackingScore,
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
