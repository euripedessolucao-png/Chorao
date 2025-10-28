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

🎯 REGRA ABSOLUTA - VERSOS COMPLETOS:
- CADA VERSO deve ser uma FRASE COMPLETA com começo, meio e FIM
- NUNCA corte versos no meio como "Abençoado sou, por cada" ou "Teus presentes são grandes, não posso"
- Cada linha deve fazer sentido SOZINHA
- Termine CADA verso com pontuação final (. ! ?) ou vírgula natural

LETRA ORIGINAL PARA INSPIRAÇÃO:
${originalLyrics}

TEMA: ${theme || "Manter tema original"}
HUMOR: ${mood || "Manter humor original"}

${additionalReqsSection}

${genreIsolationInstructions}

REGRAS DE MÉTRICA:
- Máximo: ${maxSyllables} sílabas por verso (limite absoluto)
- Ideal: 8-10 sílabas por verso
- Use contrações naturais ("cê", "pra", "tô", "tá")
- Se não couber, REESCREVA o verso inteiro, NÃO CORTE

REGRAS DE RIMA:
- ${rhymeRules.requirePerfectRhymes ? "Rimas perfeitas obrigatórias" : "Rimas naturais aceitáveis"}
- ${rhymeRules.minRichRhymePercentage > 0 ? `Mínimo ${rhymeRules.minRichRhymePercentage}% rimas ricas` : ""}

${genreRules.fullPrompt}

ESTRUTURA OBRIGATÓRIA (COMPLETA):
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

🚫 PROIBIDO ABSOLUTAMENTE - EXEMPLOS DO QUE NÃO FAZER:
- ❌ "Abençoado sou, por cada" (INCOMPLETO)
- ❌ "Teus presentes são grandes, não posso" (INCOMPLETO) 
- ❌ "Levanta a voz, dá graças, vem comigo" (INCOMPLETO)
- ❌ "No coração a alegria, não podemos" (INCOMPLETO)
- ❌ Terminar com "por cada", "não posso", "sempre a nos", "vamos juntos"
- ❌ Frases sem verbo principal
- ❌ Versos que dependem do próximo para fazer sentido

✅ EXEMPLOS DO QUE FAZER - VERSOS COMPLETOS:
- ✅ "Abençoado sou por cada dádiva Tua"
- ✅ "Teus presentes são grandes, não posso negar"
- ✅ "Levanta a voz e dá graças, vem comigo"
- ✅ "No coração a alegria não pode caber"
- ✅ Cada verso = frase completa com sujeito + verbo + complemento

REGRAS DE COMPOSIÇÃO:
1. CADA VERSO = FRASE COMPLETA
2. Sujeito + verbo + complemento em CADA linha
3. Pontuação correta no final de CADA verso
4. Se não couber na métrica, REESCREVA completamente
5. Mantenha a mensagem central da letra original
6. Refrão memorável e repetível (4-6 linhas COMPLETAS)
7. ${performanceMode === "performance" ? "Tags em inglês, versos em português" : "Tags em português"}

📏 CONTROLE DE QUALIDADE:
- Letra FINAL: 25-35 linhas totais
- TODOS os versos devem ser frases COMPLETAS
- Estrutura completa com todas as seções
- Refrão repetido 3 vezes (igual nas 3 repetições)

Retorne APENAS a letra reescrita COMPLETA com VERSOS COMPLETOS, sem explicações.`

    console.log(`[API] 🔄 Reescrevendo com limite máximo de ${maxSyllables} sílabas...`)
    if (additionalRequirements) {
      console.log(`[API] ⚠️ REQUISITOS ADICIONAIS OBRIGATÓRIOS DETECTADOS`)
    }

    // ✅ GERAÇÃO COM VALIDAÇÃO EM LOOP
    let finalLyrics = ""
    let attempts = 0
    let hasCompleteVerses = false

    while (attempts < 3 && !hasCompleteVerses) {
      attempts++
      console.log(`[API] 🔄 Tentativa ${attempts} de geração...`)

      const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt: attempts === 1 ? prompt : `${prompt}\n\n🚨 TENTATIVA ${attempts}: A letra anterior tinha versos incompletos. Gere TODOS os versos COMPLETOS agora!`,
        temperature: 0.7,
      })

      finalLyrics = capitalizeLines(text)

      // ✅ VERIFICAÇÃO RÁPIDA DE VERSOS INCOMPLETOS
      const incompletePatterns = [
        /por cada$/i, /não posso$/i, /sempre a nos$/i, /vamos juntos$/i, 
        /comigo$/i, /podemos$/i, /do meu$/i, /cada novo$/i, /onde posso$/i
      ]
      
      const lines = finalLyrics.split('\n')
      let hasIncomplete = false
      
      for (const line of lines) {
        const cleanLine = line.replace(/\[.*?\]/g, "").replace(/\(.*?\)/g, "").trim()
        if (cleanLine && incompletePatterns.some(pattern => pattern.test(cleanLine))) {
          console.log(`[API] ⚠️ Verso incompleto detectado: "${cleanLine}"`)
          hasIncomplete = true
          break
        }
      }

      if (!hasIncomplete) {
        hasCompleteVerses = true
        console.log(`[API] ✅ Todos os versos estão completos na tentativa ${attempts}`)
      } else if (attempts < 3) {
        console.log(`[API] 🔄 Regenerando devido a versos incompletos...`)
      }
    }

    // ✅ LIMPEZA DE LINHAS INDESEJADAS
    finalLyrics = finalLyrics
      .split("\n")
      .filter(
        (line) =>
          !line.trim().startsWith("Retorne") && 
          !line.trim().startsWith("REGRAS") && 
          !line.includes("Explicação") &&
          !line.includes("```") &&
          line.trim().length > 0
      )
      .join("\n")
      .trim()

    // ✅ VALIDAÇÃO E CORREÇÃO AUTOMÁTICA
    console.log("[API] 🔍 Validando isolamento de gênero...")
    const isolationValidation = validateGenreIsolation(finalLyrics, genre)
    if (!isolationValidation.valid) {
      console.log(`[API] ⚠️ ${isolationValidation.violations.length} violação(ões) de isolamento detectada(s)`)
      finalLyrics = cleanGenreCrossContamination(finalLyrics, genre)
    }

    console.log("[API] 📝 Validando completude dos versos...")
    const verseValidation = validateVerseCompleteness(finalLyrics)
    if (!verseValidation.valid) {
      console.log("[API] 🔧 Corrigindo versos incompletos automaticamente...")
      const verseFixResult = await fixIncompleteVerses(finalLyrics, genre, theme)
      if (verseFixResult.changes.length > 0) {
        console.log(`[API] ✅ ${verseFixResult.changes.length} verso(s) corrigido(s)`)
        finalLyrics = verseFixResult.fixed
      }
    }

    console.log("[API] 🎵 Validando qualidade das rimas...")
    const rhymeValidation = validateRhymesForGenre(finalLyrics, genre)
    if (!rhymeValidation.valid) {
      console.log("[API] 🔧 Melhorando rimas automaticamente...")
      const rhymeEnhancement = await enhanceLyricsRhymes(finalLyrics, genre, theme || "reescrita", 0.7)
      if (rhymeEnhancement.improvements.length > 0) {
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
      console.log(`[API] ✅ ${corrections} verso(s) corrigido(s) automaticamente`)
      finalLyrics = correctedLines.join("\n")
    }

    // ✅ FORMATAÇÃO FINAL
    if (shouldUsePerformanceFormat(genre, performanceMode)) {
      console.log("[API] 🎭 Aplicando formatação de performance...")
      finalLyrics = formatSertanejoPerformance(finalLyrics, genre)
    }

    console.log("[API] 🎸 Adicionando instrumentação...")
    const instrumentation = formatInstrumentationForAI(genre, finalLyrics)
    finalLyrics = `${finalLyrics}\n\n${instrumentation}`

    // ✅ MÉTRICAS FINAIS
    const finalValidation = validateSyllablesByGenre(finalLyrics, genre)
    const finalVerseValidation = validateVerseCompleteness(finalLyrics)
    const finalLineCount = finalLyrics.split('\n').filter(line => line.trim().length > 0).length

    console.log(`[API] ✅ Validação final: ${finalVerseValidation.score}% versos completos`)
    console.log(`[API] ✅ Tamanho final: ${finalLineCount} linhas`)

    return NextResponse.json({
      success: true,
      lyrics: finalLyrics,
      title: title || `${theme || "Reescrita"} - ${genre}`,
      metadata: {
        finalScore: finalVerseValidation.score,
        genre,
        performanceMode,
        maxSyllables,
        syllableCorrections: corrections,
        verseCompletenessScore: finalVerseValidation.score,
        incompleteVerses: finalVerseValidation.incompleteVerses.length,
        totalLines: finalLineCount,
        structureComplete: finalLineCount >= 20,
        generationAttempts: attempts,
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
- USE instrumentos de gospel: Piano, Acoustic Guitar, Bass, Drums, Keyboard, Strings
- USE audience cues de gospel: "Amém", "Aleluia", "Glória a Deus"
- Mantenha tom reverente e inspirador
`
  }

  if (lowerGenre.includes("sertanejo")) {
    return `
⚠️ ISOLAMENTO DE GÊNERO - SERTANEJO:
- NUNCA use linguagem religiosa excessiva (altar, graça, senhor, deus, fé, oração)
- USE instrumentos de sertanejo: Viola Caipira, Accordion, Acoustic Guitar, Bass, Drums
- USE audience cues de sertanejo: "Tá ligado!", "Bicho!", "Véio!", "É nóis!"
- Mantenha tom coloquial e brasileiro
`
  }

  return ""
}

export async function GET() {
  return NextResponse.json({ error: "Método não permitido" }, { status: 405 })
}
