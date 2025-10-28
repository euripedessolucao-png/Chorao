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
import { validateSyllablesByGenre } from "@/lib/validation/absolute-syllable-enforcer"
import { fixLineToMaxSyllables } from "@/lib/validation/local-syllable-fixer"

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

    const syllableValidation = validateSyllablesByGenre("", genre)
    const maxSyllables = syllableValidation.maxSyllables

    const rhymeRules = getUniversalRhymeRules(genre)
    const genreRules = buildGenreRulesPrompt(genre)

    const additionalReqsSection = additionalRequirements?.trim()
      ? `
⚠️ REQUISITOS ADICIONAIS (OBRIGATÓRIOS - NÃO PODEM SER IGNORADOS):
${additionalRequirements}

ATENÇÃO CRÍTICA SOBRE HOOKS E REFRÕES ESCOLHIDOS:
- Se houver [HOOK] nos requisitos acima, você DEVE usar esse hook LITERALMENTE na música
- Se houver [CHORUS] ou [REFRÃO] nos requisitos acima, você DEVE usar esse refrão LITERALMENTE como O REFRÃO da música
- NÃO crie um novo refrão se já foi fornecido um - USE O FORNECIDO
- NÃO crie um novo hook se já foi fornecido um - USE O FORNECIDO
- Os VERSOS devem ser escritos para COMPLETAR e CONECTAR com o hook/refrão escolhido
- A letra deve ser construída EM TORNO do hook/refrão fornecido, não ignorá-lo
- Você DEVE seguir TODOS os outros requisitos adicionais acima
- Os requisitos adicionais têm prioridade ABSOLUTA sobre qualquer outra instrução
`
      : ""

    const prompt = `Você é um compositor brasileiro especializado em ${genre}.

TAREFA: Criar uma música completa com estrutura profissional.

TEMA: ${theme}
HUMOR: ${mood || "Adaptado ao tema"}

${additionalReqsSection}

REGRAS DE MÉTRICA:
- Máximo: ${maxSyllables} sílabas por verso (limite absoluto)
- Use contrações naturais ("cê", "pra", "tô")
- Versos curtos são permitidos (ex: "Só paga IPVA" = 4 sílabas)
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
- NUNCA corte versos no meio - cada verso DEVE ser completo e terminar com palavra completa
- NUNCA deixe frases incompletas como "cada novo" ou "onde posso" ou "do que"
- Cada verso deve fazer sentido sozinho e ter um final claro
- Se um verso não cabe na métrica, REESCREVA-O completamente, não corte no meio
- Refrão memorável e repetível
- Linguagem brasileira autêntica
- Evite clichês ("coraçãozinho", "lágrimas no rosto")
- ${performanceMode === "performance" ? "Tags em inglês, versos em português" : "Tags em português"}
${additionalRequirements ? "\n- CUMPRA TODOS OS REQUISITOS ADICIONAIS ACIMA (OBRIGATÓRIO)" : ""}

Retorne APENAS a letra, sem explicações.`

    console.log(`[API] 🎵 Gerando com limite máximo de ${maxSyllables} sílabas...`)
    if (additionalRequirements) {
      console.log(`[API] ⚠️ REQUISITOS ADICIONAIS OBRIGATÓRIOS DETECTADOS`)
    }

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.85,
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
        maxSyllables,
        syllableCorrections: corrections,
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
