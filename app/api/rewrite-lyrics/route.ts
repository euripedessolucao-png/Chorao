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

    if (!body.letraOriginal || body.letraOriginal.trim().length === 0) {
      return NextResponse.json({ error: "Letra original é obrigatória para reescrita" }, { status: 400 })
    }

    if (!body.generoConversao) {
      return NextResponse.json({ error: "Gênero é obrigatório para reescrita" }, { status: 400 })
    }

    const {
      letraOriginal,
      generoConversao,
      conservarImagens,
      polirSemMexer,
      metrics,
      formattingStyle,
      additionalRequirements,
    } = body

    const genreLower = generoConversao.toLowerCase()
    const isBachata = genreLower.includes("bachata")
    const isSertanejoRaiz = genreLower.includes("sertanejo raiz") || genreLower.includes("sertanejo-raiz")
    const isSertanejoModerno = genreLower.includes("sertanejo") && !isSertanejoRaiz
    const isSertanejo = isSertanejoRaiz || isSertanejoModerno
    const isPerformanceMode = formattingStyle === "performatico"

    let genreConfig
    if (isBachata) {
      genreConfig = BACHATA_BRASILEIRA_2024
    } else if (isSertanejoRaiz) {
      genreConfig = GENRE_CONFIGS["Sertanejo Raiz"]
    } else if (isSertanejoModerno) {
      genreConfig = SERTANEJO_MODERNO_2024
    } else {
      genreConfig = GENRE_CONFIGS[generoConversao as keyof typeof GENRE_CONFIGS]
    }

    console.log(`[v0] 🎵 Gênero detectado: ${generoConversao}`)
    console.log(`[v0] 🎯 É Sertanejo Raiz? ${isSertanejoRaiz}`)
    console.log(`[v0] 🎯 É Sertanejo Moderno? ${isSertanejoModerno}`)

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
NÃO INCLUA "Título:" no início - será adicionado automaticamente.

[INTRO - Descrição detalhada da instrumentação, atmosfera e entrada musical]

[VERSE 1 - Descrição da voz, instrumentação e ritmo]
[primeiro verso completo - 8 linhas em português]

[PRE-CHORUS - Preparação emocional]
[pré-refrão - 2-4 linhas em português]

[CHORUS - Descrição da energia, instrumentos e dinâmica]
[refrão completo - 4 linhas em português]

[VERSE 2 - Descrição das mudanças musicais]
[segundo verso completo - 8 linhas em português]

[PRE-CHORUS - Preparação emocional]
[pré-refrão - 2-4 linhas em português]

[CHORUS - Repete com mesma energia]
[refrão completo - 4 linhas em português]

[BRIDGE - Descrição da pausa dramática e mudança]
[ponte completa - 8 linhas em português]

[SOLO - Descrição do solo instrumental, 8-16 segundos]

[FINAL CHORUS - Descrição da energia máxima]
[refrão final - 4 linhas em português]

[OUTRO - Descrição do fade out e encerramento]
[encerramento completo - 4 linhas em português]

(Instrumentos: [lista completa de instrumentos em inglês] | BPM: ${metrics?.bpm || 100} | Ritmo: [ritmo específico] | Estilo: ${generoConversao})`
      : `FORMATO DE SAÍDA OBRIGATÓRIO:
NÃO INCLUA "Título:" no início - será adicionado automaticamente.

[INTRO]
[introdução em português]

[VERSE 1]
[primeiro verso completo - 8 linhas em português]

[PRE-CHORUS]
[pré-refrão - 2-4 linhas em português]

[CHORUS]
[refrão principal - 4 linhas em português]

[VERSE 2]
[segundo verso completo - 8 linhas em português]

[PRE-CHORUS]
[pré-refrão - 2-4 linhas em português]

[CHORUS]
[refrão repete - 4 linhas em português]

[BRIDGE]
[transição - 8 linhas em português]

[SOLO]
[momento instrumental]

[FINAL CHORUS]
[refrão final - 4 linhas em português]

[OUTRO]
[encerramento - 4 linhas em português]

(Instrumentos: [lista de instrumentos] | BPM: ${metrics?.bpm || 100} | Ritmo: [ritmo específico] | Estilo: ${generoConversao})`

    const prompt = `${universalRulesPrompt}

Você é um compositor profissional especializado em ${generoConversao}.

⚠️ TAREFA: REESCREVER A LETRA ABAIXO (NÃO CRIAR UMA NOVA!)
- Mantenha a MESMA HISTÓRIA e TEMA CENTRAL
- Mantenha a MESMA ESTRUTURA NARRATIVA
- Mantenha os MESMOS PERSONAGENS e SITUAÇÕES
- APENAS melhore a qualidade poética e as rimas

LETRA ORIGINAL PARA REESCREVER:
${letraOriginal}

INSTRUÇÕES DE REESCRITA:
${conservarImagens ? "- CONSERVE as imagens e metáforas originais EXATAMENTE" : "- MELHORE as imagens mantendo o tema"}
${polirSemMexer ? "- MANTENHA a estrutura original, apenas aprimorando rimas e poesia" : "- ADAPTE a estrutura para ${generoConversao}"}
- Preserve a mensagem emocional central EXATAMENTE
- Mantenha os mesmos personagens e situações
- Adapte o vocabulário para ${generoConversao}
- ESCREVA FRASES COMPLETAS E COERENTES (não corte frases no meio)
- Cada linha deve ser uma frase completa ou parte natural de uma frase maior
- NUNCA concatene palavras (ex: "nãsãnossas" está ERRADO, use "não são nossas")
- SEMPRE escreva palavras completas e corretas
- PRIORIZE frases completas sobre limite de sílabas
${isBachata ? "- IDEAL: 8-12 sílabas por linha (mas frases completas são mais importantes)" : ""}
${hasPerformanceMode ? "- MANTENHA as descrições performáticas detalhadas entre colchetes" : ""}
${originalInstruments ? `- INCLUA a lista de instrumentos no final: ${originalInstruments}` : ""}${metricInfo}

${
  isSertanejoRaiz
    ? `
🎯 ATENÇÃO ESPECIAL - SERTANEJO RAIZ:
- MÍNIMO 50% de RIMAS RICAS (classes gramaticais diferentes)
- ZERO rimas falsas permitidas
- Use rimas concretas: porteira/bananeira, viola/sacola, sertão/coração
- EVITE rimas abstratas: amor/dor, paixão/razão
- Cada par de rimas DEVE ser perfeito (som completo igual)
`
    : ""
}

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
- REESCREVA a letra original, NÃO crie uma nova
- Mantenha a MESMA história e personagens
- A LETRA COMPLETA (parte cantada) deve ser SEMPRE em PORTUGUÊS
- INSTRUÇÕES e INSTRUMENTOS em INGLÊS
- ESCREVA FRASES COMPLETAS E COERENTES
- NUNCA corte frases no meio para respeitar sílabas
- NUNCA concatene ou quebre palavras
- SEMPRE escreva frases completas e gramaticalmente corretas
${isBachata ? "- IDEAL: 8-12 sílabas por linha (mas frases completas têm prioridade)" : ""}
- SEMPRE inclua a lista de instrumentos no final
- Retorne APENAS a letra formatada completa, sem comentários adicionais.`

    console.log("[v0] Iniciando reescrita de letra...")

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt: prompt,
      temperature: 0.7,
    })

    const refusalPhrases = [
      "I'm sorry, I can't assist",
      "I cannot assist",
      "I'm unable to",
      "I can't help with that",
      "I cannot help with that",
      "I'm not able to",
      "I cannot provide",
      "I can't provide",
    ]

    const isRefusal = refusalPhrases.some((phrase) => text.toLowerCase().includes(phrase.toLowerCase()))

    let finalLyrics = ""

    if (isRefusal) {
      console.error("[v0] ❌ API recusou o pedido. Tentando com prompt sanitizado...")
      console.error("[v0] 📝 Resposta da API:", text.substring(0, 200))

      const simplifiedPrompt = `Você é um compositor profissional de ${generoConversao}.

Reescreva esta letra mantendo a mensagem emocional:

${letraOriginal}

Instruções:
- Mantenha o tema e emoção
- Use linguagem natural e poética
- Escreva frases completas e coerentes
- NUNCA corte frases no meio
- Formato: Título, versos, refrão, ponte
- Inclua instrumentos no final

Retorne apenas a letra formatada.`

      const { text: retryText } = await generateText({
        model: "openai/gpt-4o",
        prompt: simplifiedPrompt,
        temperature: 0.7,
      })

      const isRetryRefusal = refusalPhrases.some((phrase) => retryText.toLowerCase().includes(phrase.toLowerCase()))

      if (isRetryRefusal) {
        console.error("[v0] ❌ Segunda tentativa também foi recusada")
        return NextResponse.json(
          {
            error: "Não foi possível processar esta letra",
            details:
              "O conteúdo pode conter palavras ou temas que não podem ser processados. Por favor, revise a letra original e tente novamente com um conteúdo diferente.",
          },
          { status: 400 },
        )
      }

      finalLyrics = retryText.trim()
    } else {
      finalLyrics = text.trim()
    }

    finalLyrics = finalLyrics.replace(/^(?:Título|Title):\s*.+$/gm, "").trim()
    finalLyrics = finalLyrics.replace(/^\*\*(?:Título|Title):\s*.+\*\*$/gm, "").trim()
    finalLyrics = finalLyrics.replace(/^#+\s*(?:Título|Title):\s*.+$/gm, "").trim()

    const rhymeValidation = validateRhymesForGenre(finalLyrics, generoConversao)

    if (!rhymeValidation.valid) {
      console.log("[v0] ⚠️ Avisos de rima:", rhymeValidation.warnings)
      console.log("[v0] ❌ Erros de rima:", rhymeValidation.errors)
      console.log("[v0] 📊 Score de rima:", rhymeValidation.analysis.score)
      console.log("[v0] 📋 Esquema de rimas:", rhymeValidation.analysis.scheme.join(""))

      const totalRhymes = rhymeValidation.analysis.quality.length
      const richRhymes = rhymeValidation.analysis.quality.filter((q) => q.type === "rica").length
      const falseRhymes = rhymeValidation.analysis.quality.filter((q) => q.type === "falsa").length
      const richRhymePercentage = totalRhymes > 0 ? richRhymes / totalRhymes : 0
      const falseRhymePercentage = totalRhymes > 0 ? falseRhymes / totalRhymes : 0

      console.log(`[v0] 📊 Rimas ricas: ${(richRhymePercentage * 100).toFixed(0)}%`)
      console.log(`[v0] 📊 Rimas falsas: ${(falseRhymePercentage * 100).toFixed(0)}%`)

      if (isSertanejoRaiz && (richRhymePercentage < 0.5 || falseRhymePercentage > 0)) {
        console.log(
          `[v0] 🔄 REGENERANDO: Sertanejo Raiz não atende requisitos (${(richRhymePercentage * 100).toFixed(0)}% ricas, ${(falseRhymePercentage * 100).toFixed(0)}% falsas)`,
        )

        let attempts = 0
        const maxAttempts = 3
        let bestLyrics = finalLyrics
        let bestRichPercentage = richRhymePercentage

        while (attempts < maxAttempts && (richRhymePercentage < 0.5 || falseRhymePercentage > 0)) {
          attempts++
          console.log(`[v0] 🔄 Tentativa ${attempts}/${maxAttempts}`)

          const rhymeFeedback = `
⚠️ CORREÇÃO OBRIGATÓRIA - TENTATIVA ${attempts}/${maxAttempts}:
A letra anterior teve apenas ${(richRhymePercentage * 100).toFixed(0)}% de rimas ricas e ${(falseRhymePercentage * 100).toFixed(0)}% de rimas falsas.

SERTANEJO RAIZ EXIGE:
✓ Mínimo 50% de rimas ricas (classes gramaticais diferentes)
✓ Zero rimas falsas

EXEMPLOS DE RIMAS RICAS CORRETAS:
- "porteira" (substantivo) / "bananeira" (substantivo) ✓
- "viola" (substantivo) / "sacola" (substantivo) ✓
- "sertão" (substantivo) / "coração" (substantivo) ✓
- "jardim" (substantivo) / "capim" (substantivo) ✓
- "estrada" (substantivo) / "madrugada" (substantivo) ✓

EVITE RIMAS POBRES:
✗ "amor/dor" (ambos substantivos abstratos)
✗ "paixão/razão" (ambos substantivos abstratos)
✗ "cantando/amando" (ambos gerúndios)

MANTENHA A MESMA HISTÓRIA DA LETRA ORIGINAL!
Apenas MELHORE as rimas mantendo o tema e personagens.
`

          const { text: regeneratedText } = await generateText({
            model: "openai/gpt-4o",
            prompt: prompt + rhymeFeedback,
            temperature: 0.8 + attempts * 0.1, // Aumenta temperatura a cada tentativa
          })

          finalLyrics = regeneratedText.trim()

          const secondValidation = validateRhymesForGenre(finalLyrics, generoConversao)
          const newRichRhymes = secondValidation.analysis.quality.filter((q) => q.type === "rica").length
          const newTotalRhymes = secondValidation.analysis.quality.length
          const newRichPercentage = newTotalRhymes > 0 ? newRichRhymes / newTotalRhymes : 0
          const newFalseRhymes = secondValidation.analysis.quality.filter((q) => q.type === "falsa").length
          const newFalsePercentage = newTotalRhymes > 0 ? newFalseRhymes / newTotalRhymes : 0

          console.log(`[v0] 🔄 Tentativa ${attempts} - Rimas ricas: ${(newRichPercentage * 100).toFixed(0)}%`)
          console.log(`[v0] 🔄 Tentativa ${attempts} - Rimas falsas: ${(newFalsePercentage * 100).toFixed(0)}%`)
          console.log(`[v0] 🔄 Tentativa ${attempts} - Score: ${secondValidation.analysis.score}`)

          // Guardar a melhor tentativa
          if (newRichPercentage > bestRichPercentage) {
            bestLyrics = finalLyrics
            bestRichPercentage = newRichPercentage
          }

          // Se atingiu os requisitos, parar
          if (newRichPercentage >= 0.5 && newFalsePercentage === 0) {
            console.log(`[v0] ✅ Requisitos atingidos na tentativa ${attempts}!`)
            break
          }
        }

        // Se não conseguiu atingir requisitos, usar a melhor tentativa
        if (richRhymePercentage < 0.5 || falseRhymePercentage > 0) {
          console.log(
            `[v0] ⚠️ Não conseguiu atingir 50% após ${maxAttempts} tentativas. Usando melhor resultado: ${(bestRichPercentage * 100).toFixed(0)}%`,
          )
          finalLyrics = bestLyrics
        }
      }
    } else {
      console.log("[v0] ✅ Rimas validadas com sucesso!")
      console.log("[v0] 📊 Score de rima:", rhymeValidation.analysis.score)
      console.log("[v0] 📋 Esquema de rimas:", rhymeValidation.analysis.scheme.join(""))
    }

    let extractedTitle = ""
    const chorusMatch = finalLyrics.match(/\[(?:CHORUS|REFRÃO)[^\]]*\]\s*\n([^\n]+)/i)
    if (chorusMatch?.[1]) {
      extractedTitle = chorusMatch[1].trim().split(" ").slice(0, 4).join(" ")
    }

    if (extractedTitle) {
      finalLyrics = `Título: ${extractedTitle}\n\n${finalLyrics}`
    }

    if (!finalLyrics.includes("(Instruments:")) {
      const instrumentList = originalInstruments
        ? `(Instruments: [${originalInstruments}] | BPM: ${metrics?.bpm || 100} | Ritmo: [ritmo específico] | Estilo: ${generoConversao})`
        : `(Instruments: [${isBachata ? "electric guitar, synthesizer, electronic drums, accordion" : "guitar, bass, drums, keyboard"}] | BPM: ${metrics?.bpm || 100} | Ritmo: [ritmo específico] | Estilo: ${generoConversao})`

      finalLyrics = finalLyrics.trim() + "\n\n" + instrumentList
    }

    finalLyrics = capitalizeLines(finalLyrics)

    console.log("[v0] ✅ Reescrita concluída com sucesso")

    return NextResponse.json({
      letra: finalLyrics,
      titulo: extractedTitle,
      rhymeAnalysis: rhymeValidation.analysis,
      rhymeWarnings: rhymeValidation.warnings,
    })
  } catch (error) {
    console.error("[v0] ❌ Error rewriting lyrics:", error)

    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"

    return NextResponse.json(
      {
        error: "Erro ao reescrever letra",
        details: errorMessage,
        suggestion: "Tente novamente ou simplifique a letra original",
      },
      { status: 500 },
    )
  }
}
