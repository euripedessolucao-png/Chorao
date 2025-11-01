import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { buildGenreRulesPrompt } from "@/lib/validation/genre-rules-builder"
import { enforceSyllableLimitAll } from "@/lib/validation/intelligent-rewriter"
import { getUniversalRhymeRules } from "@/lib/validation/universal-rhyme-rules"
import {
  formatSertanejoPerformance,
  shouldUsePerformanceFormat,
} from "@/lib/formatters/sertanejo-performance-formatter"
import { formatInstrumentationForAI } from "@/lib/normalized-genre"
import { LineStacker } from "@/lib/utils/line-stacker"
import { enhanceLyricsRhymes } from "@/lib/validation/rhyme-enhancer"
import { validateRhymesForGenre } from "@/lib/validation/rhyme-validator"
import { GENRE_CONFIGS, getSyllableLimitsForGenre } from "@/lib/genre-config"
import { cleanLyricsFromAI } from "@/lib/utils/remove-quotes-and-clean"

function getMaxSyllables(genre: string): number {
  const genreConfig = (GENRE_CONFIGS as any)[genre]
  if (!genreConfig?.prosody_rules?.syllable_count) return 12
  const syllableCount = genreConfig.prosody_rules.syllable_count
  if ("absolute_max" in syllableCount) return syllableCount.absolute_max as number
  if ("without_comma" in syllableCount) {
    const withoutComma = syllableCount.without_comma as { acceptable_up_to?: number; max?: number }
    return withoutComma.acceptable_up_to || withoutComma.max || 12
  }
  return 12
}

function smartFixIncompleteLines(lyrics: string): string {
  console.log("[SmartCorrector] 🔧 Aplicando correção inteligente")

  const lines = lyrics.split("\n")
  const fixedLines: string[] = []
  let corrections = 0

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim()

    if (!line || line.startsWith("### [") || line.startsWith("(Instrumentation)") || line.startsWith("(Genre)")) {
      fixedLines.push(line)
      continue
    }

    line = line.replace(/^"|"$/g, "").trim()

    const cleanLine = line
      .replace(/\[.*?\]/g, "")
      .replace(/$$.*?$$/g, "")
      .trim()
    if (!cleanLine) {
      fixedLines.push(line)
      continue
    }

    const words = cleanLine.split(/\s+/).filter((w) => w.length > 0)

    const isIncomplete =
      words.length < 3 ||
      /[,-]$/.test(cleanLine) ||
      /\b(e|do|por|me|te|em|a|o|de|da|no|na|com|se|tão|que|um|uma|uns|umas)\s*$/i.test(cleanLine)

    if (isIncomplete && words.length > 0) {
      console.log(`[SmartCorrector] 📝 Ajustando verso: "${cleanLine}"`)

      let fixedLine = line.replace(/[,-]\s*$/, "").trim()

      const lastWord = words[words.length - 1].toLowerCase()

      const completions: Record<string, string> = {
        coração: "aberto e grato",
        vida: "que recebo de Ti",
        gratidão: "transbordando em mim",
        amor: "que nunca falha",
        fé: "que me sustenta",
        alegria: "que inunda minha alma",
        paz: "que acalma o coração",
      }

      if (completions[lastWord]) {
        fixedLine += " " + completions[lastWord]
      } else {
        const genericCompletions = ["com muito amor", "e gratidão", "pra sempre vou lembrar", "nunca vou esquecer"]
        fixedLine += " " + genericCompletions[Math.floor(Math.random() * genericCompletions.length)]
      }

      if (!/[.!?]$/.test(fixedLine)) {
        fixedLine = fixedLine.replace(/[.,;:]$/, "") + "."
      }

      if (lines[i].trim().startsWith('"')) {
        fixedLine = `"${fixedLine}"`
      }

      console.log(`[SmartCorrector] ✅ CORRIGIDO: "${fixedLine}"`)
      fixedLines.push(fixedLine)
      corrections++
    } else {
      fixedLines.push(line)
    }
  }

  console.log(`[SmartCorrector] 🎉 CORREÇÃO CONCLUÍDA: ${corrections} versos corrigidos`)
  return fixedLines.join("\n")
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

    console.log(`[API] 🎵 Iniciando reescrita para: ${genre}`)

    const syllableLimits = getSyllableLimitsForGenre(genre)
    const maxSyllables = syllableLimits.max
    const idealSyllables = syllableLimits.ideal

    const rhymeRules = getUniversalRhymeRules(genre)
    const genreRules = buildGenreRulesPrompt(genre)

    const prompt = `COMPOSITOR PROFISSIONAL BRASILEIRO - ${genre.toUpperCase()}

🎯 ESTRATÉGIA: VERSOS COMPLETOS PRIMEIRO, RIMAS DEPOIS

📝 REGRA DE OURO: 
CADA VERSO = FRASE COMPLETA (sujeito + verbo + complemento)
NUNCA use aspas nas linhas

✅ EXEMPLOS DE VERSOS COMPLETOS (SEM ASPAS):
Hoje eu venho aqui de coração aberto
Com gratidão transbordando em meu peito
Teu amor me renova a cada amanhecer
A vida é uma bênção que eu agradeço
Nos braços de Deus encontro meu abrigo

🚫 NUNCA FAÇA ISSO:
"Coração aberto" ❌ (incompleto + aspas)
"De gratidão" ❌ (incompleto + aspas)
"Renovando a cada" ❌ (incompleto + aspas)

LETRA ORIGINAL (inspiração):
${originalLyrics}

TEMA: ${theme || "Gratidão divina"}
HUMOR: ${mood || "Reverente e alegre"}
GÊNERO: ${genre}

${additionalRequirements ? `REQUISITOS ADICIONAIS: ${additionalRequirements}` : ""}

📏 MÉTRICA MUSICAL:
- Ideal: ${idealSyllables} sílabas por verso
- Máximo ABSOLUTO: ${maxSyllables} sílabas (NUNCA ultrapassar)
- Mínimo: ${syllableLimits.min} sílabas
- ${rhymeRules.requirePerfectRhymes ? "Rimas perfeitas quando possível" : "Rimas naturais (bônus, não obrigação)"}
- Linguagem apropriada para ${genre}
- Versos autocontidos e completos
- NUNCA use aspas nas linhas

🎵 ESTRUTURA:
${
  performanceMode === "performance"
    ? `### [INTRO] (4 linhas)
### [VERSO 1] (6 linhas)  
### [PRÉ-REFRAO] (4 linhas)
### [REFRAO] (6 linhas)
### [VERSO 2] (6 linhas)
### [REFRAO] (6 linhas)
### [PONTE] (6 linhas)
### [REFRAO] (6 linhas)
### [OUTRO] (4 linhas)`
    : `### [Intro] (4 linhas)
### [Verso 1] (6 linhas)
### [Pré-Refrão] (4 linhas)
### [Refrão] (6 linhas)
### [Verso 2] (6 linhas)
### [Refrão] (6 linhas)
### [Ponte] (6 linhas)
### [Refrão] (6 linhas)
### [Outro] (4 linhas)`
}

💡 PRIORIDADES (EM ORDEM):
1. VERSOS COMPLETOS (mais importante)
2. Dentro do limite de ${maxSyllables} sílabas
3. Rimas naturais (bônus)

IMPORTANTE: Retorne APENAS as linhas da letra, SEM aspas, SEM explicações.

Gere a letra agora:`

    console.log(`[API] 🔄 Solicitando geração da IA...`)

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.7,
    })

    let finalLyrics = cleanLyricsFromAI(text)
    finalLyrics = capitalizeLines(finalLyrics)
    console.log("[API] 📝 Resposta bruta recebida")

    console.log("[API] 🔧 Aplicando correção inteligente...")
    finalLyrics = smartFixIncompleteLines(finalLyrics)

    finalLyrics = finalLyrics
      .split("\n")
      .filter((line) => {
        const trimmed = line.trim()
        return (
          !trimmed.startsWith("Retorne") &&
          !trimmed.startsWith("REGRAS") &&
          !trimmed.includes("Explicação") &&
          !trimmed.includes("```") &&
          trimmed.length > 0
        )
      })
      .join("\n")
      .trim()

    console.log("[API] 🎵 Validando qualidade das rimas...")
    const rhymeValidation = validateRhymesForGenre(finalLyrics, genre)
    if (!rhymeValidation.valid || rhymeValidation.warnings.length > 0) {
      console.log("[API] 🔧 Melhorando rimas automaticamente...")
      const rhymeEnhancement = await enhanceLyricsRhymes(finalLyrics, genre, theme || "tema", 0.7)
      if (rhymeEnhancement.improvements.length > 0) {
        console.log(`[API] ✅ ${rhymeEnhancement.improvements.length} rima(s) melhorada(s)`)
        finalLyrics = rhymeEnhancement.enhancedLyrics
      }
    }

    console.log("[API] 🎤 Aplicando reescrita inteligente com elisões para canto...")
    finalLyrics = await enforceSyllableLimitAll(finalLyrics, maxSyllables)

    console.log("[API] 📚 Aplicando empilhamento...")
    const stackingResult = LineStacker.stackLines(finalLyrics)
    finalLyrics = stackingResult.stackedLyrics

    if (shouldUsePerformanceFormat(genre, performanceMode)) {
      finalLyrics = formatSertanejoPerformance(finalLyrics, genre)
    }

    console.log("[API] 🎸 Adicionando instrumentação...")
    const instrumentation = formatInstrumentationForAI(genre, finalLyrics)
    finalLyrics = `${finalLyrics}\n\n${instrumentation}`

    const totalLines = finalLyrics.split("\n").filter((line) => line.trim().length > 0).length
    console.log(`[API] 🎉 PROCESSO CONCLUÍDO: ${totalLines} linhas`)

    return NextResponse.json({
      success: true,
      lyrics: finalLyrics,
      title: title || `${theme || "Música"} - ${genre}`,
      metadata: {
        genre,
        performanceMode,
        maxSyllables,
        idealSyllables,
        totalLines,
        quality: "COMPLETE_VERSES_FIRST",
      },
    })
  } catch (error) {
    console.error("[API] ❌ Erro crítico:", error)
    return NextResponse.json(
      {
        error: "Falha na geração da letra",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: "Método não permitido" }, { status: 405 })
}
