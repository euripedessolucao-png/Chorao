import { generateText } from "ai"
import { NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { countPortugueseSyllables, ADVANCED_BRAZILIAN_METRICS, type GenreName } from "@/lib/third-way-converter"
import { validateBachataLine } from "@/lib/validation/bachataSyllableValidator"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { letraOriginal, generoConversao, conservarImagens, polirSemMexer, metrics, formattingStyle } = body

    const isBachata = generoConversao.toLowerCase().includes("bachata")
    const isPerformanceMode = formattingStyle === "performatico"

    // Extrair lista de instrumentos da letra original
    const instrumentMatch = letraOriginal.match(/$$Instruments?:\s*\[([^\]]+)\][^$$]*\)/i)
    const originalInstruments = instrumentMatch ? instrumentMatch[0] : null

    // Detectar se tem formato performático (com descrições detalhadas)
    const hasPerformanceMode =
      /\[(?:INTRO|VERSE|CHORUS|BRIDGE|OUTRO)\s*-\s*[^\]]+\]/.test(letraOriginal) || isPerformanceMode

    const metricInfo = metrics
      ? `\n\nMÉTRICA DO GÊNERO:
- Sílabas por linha: ${metrics.syllablesPerLine}
- BPM: ${metrics.bpm}
- Estrutura: ${metrics.structure}`
      : ""

    const isSertanejoModerno = generoConversao.includes("Sertanejo Moderno") || generoConversao.includes("Feminejo")

    const regrasBachata = isBachata
      ? `\n\nREGRAS ESPECÍFICAS DE BACHATA BRASILEIRA MODERNA 2024-2025:

**PROSÓDIA E MÉTRICA (OBRIGATÓRIO):**
- Máximo ABSOLUTO: 12 sílabas por linha
- Ideal: 8-10 sílabas por linha
- Com vírgula (cesura): máx 7 sílabas antes + 7 depois = 14 total
- Sem vírgula: 5-7 sílabas (ideal), aceitável até 12
- NUNCA exceder 12 sílabas em uma linha sem cesura

**ESTRUTURA:**
- Versos: 4 linhas
- Refrão: 2 ou 4 linhas (NUNCA 3)
- Ponte: 2 linhas

**LINGUAGEM:**
- Tom: Sensual, suave, romântico
- Elementos permitidos: dança, corpo, música, noite, beijo, ritmo
- Elementos proibidos: vulgaridade, drama excessivo, clichês melodramáticos
- Estilo: Metáforas suaves, imagens concretas

**FORMATO PERFORMÁTICO (OBRIGATÓRIO):**
${
  hasPerformanceMode
    ? `- MANTENHA o formato performático com descrições detalhadas de palco
- Cada seção deve ter instruções de performance entre colchetes
- Exemplo: [INTRO - Clean, bachata-style electric guitar riff plays a sensual melody; a soft synth pad builds atmosphere]
- Inclua direções de palco, instrumentação, e atmosfera`
    : "- Use formato padrão com marcadores simples"
}

**INSTRUMENTAÇÃO:**
- SEMPRE inclua a lista de instrumentos no final
- Formato: (Instruments: [electric guitar, synthesizer, electronic drums, accordion] | BPM: ${metrics?.bpm || 110} | Style: Bachata Moderna)
${originalInstruments ? `- Use esta lista original: ${originalInstruments}` : ""}`
      : ""

    const regrasSertanejoModerno = isSertanejoModerno
      ? `\n\nREGRAS ESPECÍFICAS DE SERTANEJO MODERNO 2024-2025:

**REFRÃO (OBRIGATÓRIO):**
- Estrutura: 2 ou 4 linhas (NUNCA 3)
- Prosódia: Com vírgula (máx 6 sílabas antes + 6 depois = 12 total), Sem vírgula (5-7 sílabas, aceitável até 8)
- Linguagem: Tom de empoderamento (feminejo) ou vulnerabilidade com força (masculino)
- Elementos permitidos: referências concretas (biquíni, PIX, story, boteco, pickup, praia)
- Elementos proibidos: metáforas abstratas, vitimização, ódio/vingança, machismo, saudade obsessiva
- Requisitos comerciais: hook curto (2-4 palavras), visual para clipe, repetível, fechamento emocional positivo

**ELEMENTOS PROIBIDOS:**
- "coração no chão", "mundo desabou", "lágrimas", "chorar por você"
- Metáforas abstratas sem imagem visual
- Vitimização ou dependência emocional
- Saudade obsessiva ou melodramática

**ELEMENTOS MODERNOS (USE):**
- "dona de mim", "meu troco", "minha vida, minhas regras"
- Referências visuais: biquíni, story, PIX, boteco, praia
- Empoderamento e independência
- Imagens concretas e cinematográficas`
      : ""

    const formatoEstrutura =
      isBachata && (hasPerformanceMode || isPerformanceMode)
        ? `FORMATO DE SAÍDA OBRIGATÓRIO (MODO PERFORMÁTICO):
Título: [título derivado do refrão - 2 a 4 palavras impactantes]

[INTRO - Descrição detalhada da instrumentação, atmosfera e entrada musical]

[VERSE 1 - Descrição da voz, instrumentação e ritmo]
[primeiro verso completo - 4 linhas em português, máx 12 sílabas cada]

[CHORUS - Descrição da energia, instrumentos e dinâmica]
[refrão completo - 2 ou 4 linhas em português, máx 12 sílabas cada]
(Performance: [direções de palco se houver])
(Audience: [interação com público se houver])

[VERSE 2 - Descrição das mudanças musicais]
[segundo verso completo - 4 linhas em português, máx 12 sílabas cada]

[CHORUS - Descrição da repetição com variações]
[refrão repetido completo em português]

[BRIDGE - Descrição da pausa dramática e mudança]
[ponte completa - 2 linhas em português, máx 12 sílabas cada]

[SOLO - Descrição do solo instrumental com duração]

[FINAL CHORUS - Descrição da energia máxima]
[refrão final com variações em português]

[OUTRO - Descrição do fade out e encerramento]
[encerramento completo em português]

(Instruments: [lista completa de instrumentos em inglês] | BPM: ${metrics?.bpm || 110} | Style: ${generoConversao})`
        : isSertanejoModerno
          ? isPerformanceMode
            ? `FORMATO DE SAÍDA OBRIGATÓRIO (MODO PERFORMÁTICO):
Título: [título derivado do refrão - 2 a 4 palavras impactantes]

[INTRO - Descrição detalhada da instrumentação, atmosfera e entrada musical]

[PART A – Verse 1 - Descrição da voz, instrumentação e ritmo]
[primeiro verso completo - 4 linhas em português]

[PART B – Chorus - Descrição da energia, instrumentos e dinâmica]
[refrão completo - 2 ou 4 linhas em português]

[PART A2 – Verse 2 - Descrição das mudanças musicais]  
[segundo verso completo - 4 linhas em português]

[PART C – Bridge - Descrição da pausa dramática e mudança]
[ponte completa - 2 linhas em português]

[PART B – Chorus - Descrição da repetição com variações]
[refrão repetido completo em português]

[PART B – Chorus - Descrição da energia máxima]
[refrão repetido completo em português]

[OUTRO - Descrição do fade out e encerramento]
[encerramento completo - 2 linhas em português]

(Instruments: [lista de instrumentos em inglês] | BPM: ${metrics?.bpm || 90} | Style: ${generoConversao})`
            : `FORMATO DE SAÍDA OBRIGATÓRIO:
Título: [título derivado do refrão - 2 a 4 palavras impactantes]

[INTRO]
[texto da introdução em português]

[PART A – Verse 1]
[primeiro verso completo - 4 linhas em português]

[PART B – Chorus]
[refrão completo - 2 ou 4 linhas em português]

[PART A2 – Verse 2]  
[segundo verso completo - 4 linhas em português]

[PART C – Bridge]
[ponte completa - 2 linhas em português]

[PART B – Chorus]
[refrão repetido completo em português]

[PART B – Chorus]
[refrão repetido completo em português]

[OUTRO]
[encerramento completo - 2 linhas em português]

${isPerformanceMode ? `(Instruments: [lista de instrumentos em inglês] | BPM: ${metrics?.bpm || 90} | Style: ${generoConversao})` : ""}`
          : isPerformanceMode
            ? `FORMATO DE SAÍDA OBRIGATÓRIO (MODO PERFORMÁTICO):
Título: [título derivado do refrão - 2 a 4 palavras impactantes]

[INTRO - Descrição detalhada da instrumentação, atmosfera e entrada musical]

[VERSO 1 - Descrição da voz, instrumentação e ritmo]
[primeiro verso completo em português]

[PRÉ-REFRÃO - Descrição da preparação e build-up]
[preparação para o refrão em português]

[REFRÃO - Descrição da energia, instrumentos e dinâmica]
[refrão principal completo em português]

[VERSO 2 - Descrição das mudanças musicais]
[segundo verso completo em português]

[PONTE - Descrição da pausa dramática e mudança]
[seção de transição em português]

[OUTRO - Descrição do fade out e encerramento]
[encerramento completo em português]

(Instruments: [lista completa de instrumentos em inglês] | BPM: ${metrics?.bpm || 100} | Style: ${generoConversao})`
            : `FORMATO DE SAÍDA OBRIGATÓRIO:
Título: [título derivado do refrão - 2 a 4 palavras impactantes]

[INTRO]
[texto da introdução em português]

[VERSO 1]
[primeiro verso completo em português]

[PRÉ-REFRÃO]
[preparação para o refrão em português]

[REFRÃO]
[refrão principal completo em português]

[VERSO 2]
[segundo verso completo em português]

[PONTE]
[seção de transição em português]

[OUTRO]
[encerramento completo em português]

${isPerformanceMode ? `(Instruments: [lista de instrumentos em inglês] | BPM: ${metrics?.bpm || 100} | Style: ${generoConversao})` : ""}`

    const prompt = `Você é um compositor profissional especializado em ${generoConversao}.

LETRA ORIGINAL PARA REESCREVER:
${letraOriginal}

INSTRUÇÕES DE REESCRITA:
${conservarImagens ? "- CONSERVE as imagens e metáforas originais" : "- CRIE novas imagens e metáforas"}
${polirSemMexer ? "- MANTENHA a estrutura original, apenas aprimorando" : "- ADAPTE a estrutura para ${generoConversao}"}
- Preserve a mensagem emocional central
- Adapte o vocabulário para ${generoConversao}
- ESCREVA VERSOS COMPLETOS (não apenas palavras soltas)
- Cada linha deve ser uma frase completa e coerente
${isBachata ? "- RESPEITE O LIMITE DE 12 SÍLABAS POR LINHA (máximo absoluto)" : ""}
${hasPerformanceMode ? "- MANTENHA as descrições performáticas detalhadas entre colchetes" : ""}
${originalInstruments ? `- INCLUA a lista de instrumentos no final: ${originalInstruments}` : ""}${metricInfo}${regrasBachata}${regrasSertanejoModerno}

${formatoEstrutura}

IMPORTANTE: 
- A LETRA COMPLETA (parte cantada) deve ser SEMPRE em PORTUGUÊS
- INSTRUÇÕES e INSTRUMENTOS em INGLÊS
- ESCREVA VERSOS COMPLETOS, não apenas palavras soltas
- O título deve ser derivado do refrão (2-4 palavras impactantes)
${isBachata ? "- CADA LINHA DEVE TER NO MÁXIMO 12 SÍLABAS (verifique cuidadosamente)" : ""}
${hasPerformanceMode ? "- MANTENHA descrições detalhadas de palco, instrumentação e atmosfera" : ""}
- SEMPRE inclua a lista de instrumentos no final no formato: (Instruments: [...] | BPM: ... | Style: ...)
- Retorne APENAS a letra formatada completa, sem comentários adicionais.`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: prompt,
      temperature: 0.7,
    })

    if (isBachata) {
      const lines = text.split("\n")
      const validatedLines = lines.map((line) => {
        // Pular cabeçalhos, instruções e linhas vazias
        if (line.startsWith("[") || line.startsWith("(") || line.startsWith("Título:") || !line.trim()) {
          return line
        }

        // Validar com o validador de Bachata
        const validation = validateBachataLine(line, "verse")

        // Se a linha excede 12 sílabas, tentar comprimir
        if (validation.syllableCount > 12) {
          let compressed = line
            .replace(/\bvocê\b/gi, "cê")
            .replace(/\bestá\b/gi, "tá")
            .replace(/\bpara\b/gi, "pra")
            .replace(/\b(o|a|os|as)\s/gi, "")

          // Verificar novamente
          const revalidation = validateBachataLine(compressed, "verse")
          if (revalidation.syllableCount <= 12) {
            return compressed
          }

          // Se ainda está longo, remover palavras desnecessárias
          const words = compressed.split(" ")
          if (words.length > 3) {
            compressed = words.slice(0, -1).join(" ")
          }

          return compressed
        }

        return line
      })

      let finalLyrics = validatedLines.join("\n")

      if (!finalLyrics.includes("(Instruments:")) {
        const instrumentList =
          originalInstruments ||
          `(Instruments: [electric guitar, synthesizer, electronic drums, accordion] | BPM: ${metrics?.bpm || 110} | Style: ${generoConversao})`
        finalLyrics = finalLyrics + "\n\n" + instrumentList
      }

      return NextResponse.json({ letra: finalLyrics })
    }

    // Processamento para outros gêneros (código original)
    const genreKey = (
      generoConversao.includes("Sertanejo Moderno")
        ? "Sertanejo Moderno"
        : generoConversao.includes("Sertanejo Universitário")
          ? "Sertanejo Universitário"
          : generoConversao.includes("Pagode")
            ? "Pagode"
            : generoConversao.includes("Funk")
              ? "Funk"
              : generoConversao.includes("MPB")
                ? "MPB"
                : generoConversao.includes("Pop")
                  ? "Pop"
                  : "default"
    ) as GenreName

    const targetMetrics = ADVANCED_BRAZILIAN_METRICS[genreKey] || ADVANCED_BRAZILIAN_METRICS.default
    const targetSyllables = targetMetrics.syllablesPerLine

    const lines = text.split("\n")
    const optimizedLines = lines.map((line) => {
      if (line.startsWith("[") || line.startsWith("(") || line.startsWith("Título:") || !line.trim()) {
        return line
      }

      const currentSyllables = countPortugueseSyllables(line)

      if (Math.abs(currentSyllables - targetSyllables) <= 2) {
        return line
      }

      if (currentSyllables > targetSyllables + 2) {
        return line
          .replace(/\b(o|a|os|as)\s/gi, "")
          .replace(/\bpara\b/gi, "pra")
          .replace(/\bestá\b/gi, "tá")
      } else if (currentSyllables < targetSyllables - 2) {
        const expanders = ["meu", "minha", "tão"]
        const randomExpander = expanders[Math.floor(Math.random() * expanders.length)]
        return line + " " + randomExpander
      }

      return line
    })

    const optimizedLyrics = optimizedLines.join("\n")

    let finalLyrics = optimizedLyrics
    if (!finalLyrics.includes("Título:")) {
      const chorusMatch = finalLyrics.match(/\[(?:PART B|REFRÃO)[^\]]*\]\s*\n([^\n]+)/i)
      if (chorusMatch && chorusMatch[1]) {
        const chorusLine = chorusMatch[1].trim()
        const titleWords = chorusLine.split(" ").slice(0, 4).join(" ")
        finalLyrics = `Título: ${titleWords}\n\n${finalLyrics}`
      }
    }

    if (!finalLyrics.includes("(Instruments:")) {
      const instrumentList =
        originalInstruments ||
        `(Instruments: [guitar, bass, drums, keyboard] | BPM: ${metrics?.bpm || 100} | Style: ${generoConversao})`
      finalLyrics = finalLyrics + "\n\n" + instrumentList
    }

    return NextResponse.json({ letra: finalLyrics })
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
