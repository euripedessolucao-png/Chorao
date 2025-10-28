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
import { validateGenreIsolation, cleanGenreCrossContamination } from "@/lib/validation/genre-isolation-validator"

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

    const genreIsolationInstructions = getGenreIsolationInstructions(genre)

    const prompt = `Você é um compositor brasileiro especializado em ${genre}.

TAREFA: Reescrever COMPLETAMENTE a letra abaixo mantendo a essência mas adaptando para ${genre}.

🎯 LIMITAÇÕES CRÍTICAS DE TAMANHO:
- LETRA COMPLETA deve ter ENTRE 25-35 LINHAS
- NUNCA corte versos no meio - cada verso DEVE ser completo
- Se a letra original for longa, selecione os versos mais importantes
- Mantenha a estrutura completa: Intro, Versos, Refrão, Ponte, Outro
- REFRÃO deve aparecer PELO MENOS 3 VEZES (padrão música comercial)

LETRA ORIGINAL:
${originalLyrics}

TEMA: ${theme || "Manter tema original"}
HUMOR: ${mood || "Manter humor original"}

${additionalReqsSection}

${genreIsolationInstructions}

REGRAS DE MÉTRICA:
- Máximo: ${maxSyllables} sílabas por verso (limite absoluto)
- Use contrações naturais ("cê", "pra", "tô")
- Versos curtos são permitidos
- NUNCA exceda ${maxSyllables} sílabas (limite humano de canto)

REGRAS DE RIMA:
- ${rhymeRules.requirePerfectRhymes ? "Rimas perfeitas obrigatórias" : "Rimas naturais aceitáveis"}
- ${rhymeRules.minRichRhymePercentage > 0 ? `Mínimo ${rhymeRules.minRichRhymePercentage}% rimas ricas` : ""}

${genreRules.fullPrompt}

ESTRUTURA OBRIGATÓRIA (COMPLETA):
${
  performanceMode === "performance"
    ? `[INTRO]
[VERSE 1]
[PRE-CHORUS] 
[CHORUS]
[VERSE 2]
[CHORUS]
[BRIDGE]
[CHORUS]
[OUTRO]`
    : `[Intro]
[Verso 1]
[Pré-Refrão]
[Refrão]
[Verso 2]
[Refrão]
[Ponte]
[Refrão]
[Outro]`
}

🚫 PROIBIDO ABSOLUTAMENTE:
- Cortar versos no meio
- Deixar frases incompletas como "cada novo" ou "onde posso" ou "do que"
- Terminar com pontuação de continuação (..., -, —)
- Escrever letra incompleta ou sem estrutura
- Ignorar o refrão ou repeti-lo menos de 3 vezes

✅ OBRIGATÓRIO:
- Cada verso deve fazer sentido sozinho e ter final claro
- Se um verso não cabe na métrica, REESCREVA-O completamente
- Mantenha a mensagem central da letra original
- Adapte linguagem e estilo para ${genre}
- Refrão memorável e repetível
- Evite clichês ("coraçãozinho", "lágrimas no rosto")
- ${performanceMode === "performance" ? "Tags em inglês, versos em português" : "Tags em português"}
${additionalRequirements ? "\n- CUMPRA TODOS OS REQUISITOS ADICIONAIS ACIMA (OBRIGATÓRIO)" : ""}

📏 CONTROLE DE TAMANHO:
- Letra FINAL deve ter ENTRE 25-35 linhas totais
- Se preciso, resuma a letra original mas mantenha a ESSÊNCIA
- NÃO pode ser muito curta (menos de 25 linhas)
- NÃO pode ser muito longa (mais de 35 linhas)

Retorne APENAS a letra reescrita COMPLETA, sem explicações.`

    console.log(`[API] 🔄 Reescrevendo com limite máximo de ${maxSyllables} sílabas...`)
    if (additionalRequirements) {
      console.log(`[API] ⚠️ REQUISITOS ADICIONAIS OBRIGATÓRIOS DETECTADOS`)
    }

    // ✅ GERAÇÃO PRIMÁRIA - com temperatura mais baixa para manter estrutura
    const { text: initialText } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.7, // Reduzido para manter coesão
    })

    let finalLyrics = capitalizeLines(initialText)

    // ✅ VERIFICAÇÃO DE COMPLETUDE - se a letra está muito curta, regera
    const lineCount = finalLyrics.split('\n').filter(line => line.trim().length > 0).length
    if (lineCount < 20) {
      console.log(`[API] ⚠️ Letra muito curta (${lineCount} linhas), regenerando...`)
      
      const retryPrompt = `${prompt}

🚨 ATENÇÃO: A letra gerada anteriormente estava MUITO CURTA (apenas ${lineCount} linhas).
Gere uma versão COMPLETA com 25-35 linhas, mantendo TODA a estrutura obrigatória.`

      const { text: retryText } = await generateText({
        model: "openai/gpt-4o-mini", 
        prompt: retryPrompt,
        temperature: 0.8,
      })
      finalLyrics = capitalizeLines(retryText)
    }

    // ✅ LIMPEZA DE LINHAS INDESEJADAS
    finalLyrics = finalLyrics
      .split("\n")
      .filter(
        (line) =>
          !line.trim().startsWith("Retorne") && 
          !line.trim().startsWith("REGRAS") && 
          !line.includes("Explicação") &&
          !line.includes("```")
      )
      .join("\n")
      .trim()

    console.log("[API] 🔍 Validando isolamento de gênero...")
    const isolationValidation = validateGenreIsolation(finalLyrics, genre)
    if (!isolationValidation.valid) {
      console.log(`[API] ⚠️ ${isolationValidation.violations.length} violação(ões) de isolamento detectada(s)`)
      isolationValidation.violations.forEach((v) => console.log(`[API]   - ${v}`))
      console.log("[API] 🔧 Limpando contaminação entre gêneros...")
      finalLyrics = cleanGenreCrossContamination(finalLyrics, genre)
    }

    console.log("[API] 📝 Validando completude dos versos...")
    const verseValidation = validateVerseCompleteness(finalLyrics)
    if (!verseValidation.valid || verseValidation.warnings.length > 0) {
      console.log("[API] 🔧 Corrigindo versos incompletos...")
      const verseFixResult = await fixIncompleteVerses(finalLyrics, genre, theme)
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

    const finalValidation = validateSyllablesByGenre(finalLyrics, genre)
    const validityRatio = finalValidation.violations.length === 0 ? 1 : 0
    const finalScore = Math.round(validityRatio * 100)

    const finalVerseValidation = validateVerseCompleteness(finalLyrics)
    const finalLineCount = finalLyrics.split('\n').filter(line => line.trim().length > 0).length

    console.log(`[API] ✅ Validação final: ${finalScore}% dentro da métrica (${genre})`)
    console.log(`[API] ✅ Completude dos versos: ${finalVerseValidation.score}%`)
    console.log(`[API] ✅ Tamanho final: ${finalLineCount} linhas`)

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
        genreIsolationViolations: isolationValidation.violations.length,
        genreIsolationWarnings: isolationValidation.warnings.length,
        totalLines: finalLineCount,
        structureComplete: finalLineCount >= 25 && finalLineCount <= 35,
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

function getGenreIsolationInstructions(genre: string): string {
  const lowerGenre = genre.toLowerCase()

  if (lowerGenre.includes("gospel")) {
    return `
⚠️ ISOLAMENTO DE GÊNERO - GOSPEL:
- NUNCA use instrumentos de sertanejo: sanfona, accordion, viola caipira
- NUNCA use audience cues de sertanejo: "Tá ligado!", "Bicho!", "Véio!", "É nóis!"
- NUNCA use palavras de sertanejo moderno: biquíni, PIX, story, boteco, pickup, zap, rolê
- USE instrumentos de gospel: Piano, Acoustic Guitar, Bass, Drums, Keyboard, Strings
- USE audience cues de gospel: "Amém", "Aleluia", "Glória a Deus"
- Mantenha tom reverente e inspirador, não coloquial de sertanejo
`
  }

  if (lowerGenre.includes("sertanejo")) {
    return `
⚠️ ISOLAMENTO DE GÊNERO - SERTANEJO:
- NUNCA use linguagem religiosa excessiva (altar, graça, senhor, deus, fé, oração)
- Se o tema é religioso, considere usar Gospel ao invés de Sertanejo
- USE instrumentos de sertanejo: Viola Caipira, Accordion, Acoustic Guitar, Bass, Drums
- USE audience cues de sertanejo: "Tá ligado!", "Bicho!", "Véio!", "É nóis!"
- Mantenha tom coloquial e brasileiro, não reverente
`
  }

  return ""
}

export async function GET() {
  return NextResponse.json({ error: "Método não permitido" }, { status: 405 })
}
