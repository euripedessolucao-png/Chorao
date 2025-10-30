import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { buildGenreRulesPrompt } from "@/lib/validation/genre-rules-builder"
import { getUniversalRhymeRules } from "@/lib/validation/universal-rhyme-rules"
import { enforceSyllableLimitAll } from "@/lib/validation/intelligent-rewriter"
import {
  formatSertanejoPerformance,
  shouldUsePerformanceFormat,
} from "@/lib/formatters/sertanejo-performance-formatter"
import { formatInstrumentationForAI } from "@/lib/normalized-genre"
import { LineStacker } from "@/lib/utils/line-stacker"
import { enhanceLyricsRhymes } from "@/lib/validation/rhyme-enhancer"
import { validateRhymesForGenre } from "@/lib/validation/rhyme-validator"
import { GENRE_CONFIGS } from "@/lib/genre-config"

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

function superFixIncompleteLines(lyrics: string): string {
  console.log("[SuperCorrector] 🚀 INICIANDO CORREÇÃO SUPER-EFETIVA")

  const lines = lyrics.split("\n")
  const fixedLines: string[] = []
  let corrections = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (!line || line.startsWith("### [") || line.startsWith("(Instrumentation)") || line.startsWith("(Genre)")) {
      fixedLines.push(line)
      continue
    }

    const cleanLine = line
      .replace(/\[.*?\]/g, "")
      .replace(/$$.*?$$/g, "")
      .replace(/^"|"$/g, "")
      .trim()
    if (!cleanLine) {
      fixedLines.push(line)
      continue
    }

    const words = cleanLine.split(/\s+/).filter((w) => w.length > 0)
    const lastWord = words[words.length - 1]?.toLowerCase() || ""

    const isIncomplete =
      words.length < 3 ||
      /[,-]$/.test(cleanLine) ||
      /\b(e|a|o|que|com|pra|pro|num|numa|de|da|do|em|no|na|por|me|te|se|um|uma)\s*$/i.test(cleanLine) ||
      /^(a|e|o|que|com|pra|de|da|do|em|no|na|por|me|te|se|um|uma)$/i.test(cleanLine)

    if (isIncomplete && words.length > 0) {
      console.log(`[SuperCorrector] 🚨 VERSO INCOMPLETO: "${cleanLine}"`)

      let fixedLine = line.replace(/[,-]\s*$/, "").trim()

      const specificCompletions: Record<string, string> = {
        e: "com amor",
        a: "minha vida",
        que: "Deus me deu",
        com: "muito amor",
        pra: "viver",
        pro: "meu bem",
        me: "ajudar",
        te: "amar",
        se: "entregar",
        um: "presente",
        uma: "bênção",
        no: "coração",
        na: "alma",
        de: "gratidão",
        do: "Senhor",
        da: "minha vida",
        em: "Deus",
        por: "tudo",
      }

      let matched = false
      for (const [pattern, completion] of Object.entries(specificCompletions)) {
        if (cleanLine.toLowerCase().endsWith(pattern)) {
          fixedLine = fixedLine.slice(0, -pattern.length).trim() + " " + completion
          matched = true
          break
        }
      }

      if (!matched && specificCompletions[lastWord]) {
        fixedLine += " " + specificCompletions[lastWord]
      } else if (!matched) {
        const genericCompletions = [
          "com gratidão no coração",
          "e amor infinito",
          "pra sempre Te louvar",
          "com fé e esperança",
          "que renova minha alma",
        ]
        fixedLine += " " + genericCompletions[Math.floor(Math.random() * genericCompletions.length)]
      }

      if (!/[.!?]$/.test(fixedLine)) {
        fixedLine = fixedLine.replace(/[.,;:]$/, "") + "."
      }

      console.log(`[SuperCorrector] ✅ CORRIGIDO: "${fixedLine}"`)
      fixedLines.push(fixedLine)
      corrections++
    } else {
      fixedLines.push(line)
    }
  }

  console.log(`[SuperCorrector] 🎉 CORREÇÃO CONCLUÍDA: ${corrections} versos corrigidos`)
  return fixedLines.join("\n")
}

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

    const maxSyllables = getMaxSyllables(genre)
    const rhymeRules = getUniversalRhymeRules(genre)
    const genreRules = buildGenreRulesPrompt(genre)

    const additionalReqsSection = additionalRequirements?.trim()
      ? `
⚠️ REQUISITOS ADICIONAIS (OBRIGATÓRIOS):
${additionalRequirements}
`
      : ""

    const prompt = `COMPOSITOR PROFISSIONAL BRASILEIRO - ${genre.toUpperCase()}

🎯 OBJETIVO PRINCIPAL: Criar VERSOS COMPLETOS e COERENTES

📝 REGRA DE OURO: 
CADA VERSO = FRASE COMPLETA (sujeito + verbo + complemento)

✅ EXEMPLOS DE VERSOS COMPLETOS:
"Hoje eu venho aqui de coração aberto" 
"Com gratidão transbordando em meu peito"
"Teu amor me renova a cada amanhecer"
"A vida é uma bênção que eu agradeço"
"Nos braços de Deus encontro meu abrigo"

🚫 EVITAR VERSOS INCOMPLETOS:
"Coração aberto" ❌ (incompleto)
"De gratidão" ❌ (incompleto) 
"Renovando a cada" ❌ (incompleto)

TEMA: ${theme}
HUMOR: ${mood || "Adaptado ao tema"}
GÊNERO: ${genre}

${additionalReqsSection}

📏 TÉCNICA MUSICAL BRASILEIRA:
- Máximo ${maxSyllables} sílabas por verso
- ${rhymeRules.requirePerfectRhymes ? "Rimas perfeitas" : "Rimas naturais"}
- Linguagem apropriada para ${genre}
- Versos autocontidos e completos
- Emoção genuína e autenticidade

${genreRules.fullPrompt}

🎵 ESTRUTURA SUGERIDA:
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

💡 DICA CRÍTICA: 
Pense em CADA VERSO como uma mini-história completa
Se ficar muito longo, REESCREVA completamente mantendo a mensagem
Mantenha a naturalidade da língua portuguesa brasileira

Gere a letra com VERSOS COMPLETOS e EMOCIONALMENTE IMPACTANTES:`

    console.log(`[API] 🎵 Gerando com limite máximo de ${maxSyllables} sílabas...`)

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.85,
    })

    let finalLyrics = capitalizeLines(text)

    console.log("[API] 🔧 Aplicando correção super-efetiva de versos incompletos...")
    finalLyrics = superFixIncompleteLines(finalLyrics)

    finalLyrics = finalLyrics
      .split("\n")
      .filter(
        (line) =>
          !line.trim().startsWith("Retorne") && !line.trim().startsWith("REGRAS") && !line.includes("Explicação"),
      )
      .join("\n")
      .trim()

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

    console.log("[API] 🎤 Aplicando reescrita inteligente com elisões para canto...")
    finalLyrics = await enforceSyllableLimitAll(finalLyrics, maxSyllables)

    console.log("[API] 📚 Empilhando versos...")
    const stackResult = LineStacker.stackLines(finalLyrics)
    if (stackResult.improvements.length > 0) {
      console.log(`[API] ✅ ${stackResult.improvements.length} verso(s) empilhado(s)`)
    }
    finalLyrics = stackResult.stackedLyrics

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

    if (shouldUsePerformanceFormat(genre, performanceMode)) {
      console.log("[API] 🎭 Aplicando formatação de performance...")
      finalLyrics = formatSertanejoPerformance(finalLyrics, genre)
    }

    const instrumentation = formatInstrumentationForAI(genre, finalLyrics)
    finalLyrics = `${finalLyrics}\n\n${instrumentation}`

    const totalLines = finalLyrics.split("\n").filter((line) => line.trim().length > 0).length
    console.log(`[API] 🎉 PROCESSO CONCLUÍDO: ${totalLines} linhas`)

    return NextResponse.json({
      lyrics: finalLyrics,
      title: title || `${theme} - ${genre}`,
      meta: {
        genre,
        performanceMode,
        maxSyllables,
        totalLines,
        syllableCorrections: 0, // Agora feito pelo intelligent-rewriter
        quality: "PROCESSED",
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
