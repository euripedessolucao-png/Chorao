import { generateText } from "ai"
import { NextResponse } from "next/server"
import { BACHATA_BRASILEIRA_2024 } from "@/lib/genres/bachata_brasileira_2024"
import { SERTANEJO_MODERNO_2024 } from "@/lib/genres/sertanejo_moderno_2024"
import { GENRE_CONFIGS } from "@/lib/genre-config"
import { getAntiForcingRulesForGenre } from "@/lib/validation/anti-forcing-validator"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { validateRhymesForGenre } from "@/lib/validation/rhyme-validator"
import { buildUniversalRulesPrompt } from "@/lib/rules/universal-rules"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      letraOriginal,
      generoConversao,
      conservarImagens,
      polirSemMexer,
      metrics,
      formattingStyle,
      additionalRequirements,
    } = body

    const isBachata = generoConversao.toLowerCase().includes("bachata")
    const isSertanejo = generoConversao.toLowerCase().includes("sertanejo")
    const isPerformanceMode = formattingStyle === "performatico"

    const genreConfig = isBachata
      ? BACHATA_BRASILEIRA_2024
      : isSertanejo
        ? SERTANEJO_MODERNO_2024
        : GENRE_CONFIGS[generoConversao as keyof typeof GENRE_CONFIGS]

    const instrumentMatch = letraOriginal.match(/\(Instruments?:\s*\[([^\]]+)\]/i)
    const originalInstruments = instrumentMatch ? instrumentMatch[1].trim() : null

    const hasPerformanceMode =
      /\[(?:INTRO|VERSE|CHORUS|BRIDGE|OUTRO)\s*-\s*[^\]]+\]/.test(letraOriginal) || isPerformanceMode

    const antiForcingRules = getAntiForcingRulesForGenre(generoConversao)
    const antiForcingExamples = antiForcingRules
      .slice(0, 3)
      .map((rule) => `- "${rule.keyword}": ${rule.description}`)
      .join("\n")

    const universalRulesPrompt = buildUniversalRulesPrompt(generoConversao)

    const metricInfo = metrics
      ? `\n\nMÉTRICA DO GÊNERO:
- Sílabas por linha: ${metrics.syllablesPerLine}
- Máximo absoluto: ${metrics.maxSyllables || metrics.syllablesPerLine + 2}
- BPM: ${metrics.bpm}
- Estrutura: ${metrics.structure}`
      : ""

    const formatoEstrutura = isPerformanceMode
      ? `FORMATO DE SAÍDA OBRIGATÓRIO (MODO PERFORMÁTICO):
Título: [título derivado do refrão - 2 a 4 palavras impactantes]

[INTRO - Descrição detalhada da instrumentação, atmosfera e entrada musical]

[VERSE 1 - Descrição da voz, instrumentação e ritmo]
[primeiro verso completo - 4 linhas em português]

[CHORUS - Descrição da energia, instrumentos e dinâmica]
[refrão completo em português]
(Performance: [direções de palco se houver])

[VERSE 2 - Descrição das mudanças musicais]
[segundo verso completo em português]

[BRIDGE - Descrição da pausa dramática e mudança]
[ponte completa em português]

[FINAL CHORUS - Descrição da energia máxima]
[refrão final em português]

[OUTRO - Descrição do fade out e encerramento]
[encerramento completo em português]

(Instruments: [lista completa de instrumentos em inglês] | BPM: ${metrics?.bpm || 100} | Style: ${generoConversao})`
      : `FORMATO DE SAÍDA OBRIGATÓRIO:
Título: [título derivado do refrão]

[INTRO]
[introdução em português]

[VERSO 1]
[primeiro verso completo em português]

[REFRÃO]
[refrão principal completo em português]

[VERSO 2]
[segundo verso completo em português]

[PONTE]
[transição em português]

[OUTRO]
[encerramento em português]

(Instruments: [lista de instrumentos] | BPM: ${metrics?.bpm || 100} | Style: ${generoConversao})`

    const prompt = `${universalRulesPrompt}

Você é um compositor profissional especializado em ${generoConversao}.

LETRA ORIGINAL PARA REESCREVER:
${letraOriginal}

INSTRUÇÕES DE REESCRITA:
${conservarImagens ? "- CONSERVE as imagens e metáforas originais" : "- CRIE novas imagens e metáforas"}
${polirSemMexer ? "- MANTENHA a estrutura original, apenas aprimorando" : "- ADAPTE a estrutura para ${generoConversao}"}
- Preserve a mensagem emocional central
- Adapte o vocabulário para ${generoConversao}
- ESCREVA VERSOS COMPLETOS (não apenas palavras soltas)
- Cada linha deve ser uma frase completa e coerente
- NUNCA concatene palavras (ex: "nãsãnossas" está ERRADO, use "não são nossas")
- SEMPRE escreva palavras completas e corretas
${isBachata ? "- RESPEITE O LIMITE DE 12 SÍLABAS POR LINHA (máximo absoluto)" : ""}
${hasPerformanceMode ? "- MANTENHA as descrições performáticas detalhadas entre colchetes" : ""}
${originalInstruments ? `- INCLUA a lista de instrumentos no final: ${originalInstruments}` : ""}${metricInfo}

FORMATAÇÃO DE VERSOS (IMPORTANTE):
- EMPILHE os versos em linhas separadas (um verso por linha)
- EXCEÇÃO: Combine versos na mesma linha SOMENTE quando se completam semanticamente
- Exemplo CORRETO (empilhado):
  Você diz que me ama
  Mas não mostra
- Exemplo CORRETO (completam-se):
  Você diz que me ama, mas não mostra
- MOTIVO: Facilita contagem visual de versos e detecção de erros
- Esta regra vale para TODOS os gêneros (exceto quando versos se completam)

REGRAS DO GÊNERO:
${JSON.stringify(genreConfig?.language_rules || {}, null, 2)}

${formatoEstrutura}

IMPORTANTE: 
- A LETRA COMPLETA (parte cantada) deve ser SEMPRE em PORTUGUÊS
- INSTRUÇÕES e INSTRUMENTOS em INGLÊS
- ESCREVA VERSOS COMPLETOS, não apenas palavras soltas
- NUNCA concatene ou quebre palavras
- SEMPRE escreva frases completas e gramaticalmente corretas
${isBachata ? "- CADA LINHA DEVE TER NO MÁXIMO 12 SÍLABAS" : ""}
- SEMPRE inclua a lista de instrumentos no final
- Retorne APENAS a letra formatada completa, sem comentários adicionais.`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt: prompt,
      temperature: 0.7,
    })

    let finalLyrics = text.trim()

    const rhymeValidation = validateRhymesForGenre(finalLyrics, generoConversao)

    if (!rhymeValidation.valid) {
      console.log("[v0] ⚠️ Avisos de rima:", rhymeValidation.warnings)
      console.log("[v0] ❌ Erros de rima:", rhymeValidation.errors)
      console.log("[v0] 📊 Score de rima:", rhymeValidation.analysis.score)
      console.log("[v0] 📋 Esquema de rimas:", rhymeValidation.analysis.scheme.join(""))

      if (generoConversao.toLowerCase().includes("sertanejo raiz")) {
        const richRhymePercentage =
          rhymeValidation.analysis.quality.filter((q) => q.type === "rica").length /
          rhymeValidation.analysis.quality.length

        if (richRhymePercentage < 0.5) {
          console.log(
            `[v0] 🔄 Regenerando: Sertanejo Raiz precisa de 50% rimas ricas, atual: ${(richRhymePercentage * 100).toFixed(0)}%`,
          )

          const rhymeFeedback = `
ATENÇÃO: A letra anterior teve apenas ${(richRhymePercentage * 100).toFixed(0)}% de rimas ricas.
Sertanejo Raiz EXIGE pelo menos 50% de rimas ricas.

CORRIJA usando estes exemplos:
- "porteira/bananeira" (substantivos concretos) ✓
- "viola/sacola" (substantivos concretos) ✓
- "sertão/coração" (substantivos) ✓
- "jardim/capim" (substantivos da natureza) ✓

EVITE:
- "amor/dor" (muito abstrato e pobre)
- "paixão/razão" (muito abstrato e pobre)
- Palavras que não rimam perfeitamente
`

          const { text: regeneratedText } = await generateText({
            model: "openai/gpt-4o",
            prompt: prompt + rhymeFeedback,
            temperature: 0.8,
          })

          finalLyrics = regeneratedText.trim()

          const secondValidation = validateRhymesForGenre(finalLyrics, generoConversao)
          console.log("[v0] 🔄 Segunda validação - Score:", secondValidation.analysis.score)
          console.log("[v0] 🔄 Segunda validação - Esquema:", secondValidation.analysis.scheme.join(""))
        }
      }
    } else {
      console.log("[v0] ✅ Rimas validadas com sucesso!")
      console.log("[v0] 📊 Score de rima:", rhymeValidation.analysis.score)
      console.log("[v0] 📋 Esquema de rimas:", rhymeValidation.analysis.scheme.join(""))
    }

    let extractedTitle = ""
    const titleMatch = finalLyrics.match(/^Título:\s*(.+)$/m)
    if (titleMatch?.[1]) {
      extractedTitle = titleMatch[1].trim()
    } else {
      const chorusMatch = finalLyrics.match(/\[(?:CHORUS|REFRÃO)[^\]]*\]\s*\n([^\n]+)/i)
      if (chorusMatch?.[1]) {
        extractedTitle = chorusMatch[1].trim().split(" ").slice(0, 4).join(" ")
        finalLyrics = `Título: ${extractedTitle}\n\n${finalLyrics}`
      }
    }

    if (!finalLyrics.includes("(Instruments:")) {
      const instrumentList = originalInstruments
        ? `(Instruments: [${originalInstruments}] | BPM: ${metrics?.bpm || 100} | Style: ${generoConversao})`
        : `(Instruments: [${isBachata ? "electric guitar, synthesizer, electronic drums, accordion" : "guitar, bass, drums, keyboard"}] | BPM: ${metrics?.bpm || 100} | Style: ${generoConversao})`

      finalLyrics = finalLyrics.trim() + "\n\n" + instrumentList
    }

    finalLyrics = capitalizeLines(finalLyrics)

    return NextResponse.json({
      letra: finalLyrics,
      titulo: extractedTitle,
      rhymeAnalysis: rhymeValidation.analysis,
      rhymeWarnings: rhymeValidation.warnings,
    })
  } catch (error) {
    console.error("[v0] Error rewriting lyrics:", error)

    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"

    return NextResponse.json(
      {
        error: "Erro ao reescrever letra.",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
