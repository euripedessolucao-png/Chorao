import { generateText } from "ai"
import { NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { countPortugueseSyllables, ADVANCED_BRAZILIAN_METRICS, type GenreName } from "@/lib/third-way-converter"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      genero,
      humor,
      tema,
      criatividade,
      hook,
      inspiracao,
      metaforas,
      emocoes,
      titulo,
      metrics,
      chorusSelected,
      formattingStyle,
    } = body

    const chorusInfo =
      chorusSelected && chorusSelected.length > 0
        ? `\n\nREFRÕES SELECIONADOS PARA USAR NA LETRA:
${chorusSelected
  .map(
    (c: any, i: number) => `
Refrão ${i + 1}:
${c.lines.join("\n")}
`,
  )
  .join("\n")}

IMPORTANTE: Use estes refrões EXATAMENTE como fornecidos na seção [PART B – Chorus] da letra.`
        : ""

    const metricInfo = metrics
      ? `\n\nMÉTRICA DO GÊNERO:
- Sílabas por linha: ${metrics.syllablesPerLine}
- BPM: ${metrics.bpm}
- Estrutura: ${metrics.structure}`
      : ""

    const isSertanejoModerno = genero.includes("Sertanejo Moderno") || genero.includes("Feminejo")
    const isPerformanceMode = formattingStyle === "performatico"

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

    const formatoEstrutura = isSertanejoModerno
      ? isPerformanceMode
        ? `FORMATO DE SAÍDA OBRIGATÓRIO (MODO PERFORMÁTICO):
Título: ${titulo || "[título derivado do refrão - 2 a 4 palavras impactantes]"}

[INTRO - Descrição detalhada da instrumentação, atmosfera e entrada musical]

[PART A – Verse 1 - Descrição da voz, instrumentação e ritmo]
[primeiro verso completo - 4 linhas em português]

[PART B – Chorus - Descrição da energia, instrumentos e dinâmica]
[refrão completo - 2 ou 4 linhas em português]
(Performance: [direções de palco se houver])
(Audience: [interação com público se houver])

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

(Instruments: [lista completa de instrumentos em inglês] | BPM: ${metrics?.bpm || 90} | Style: ${genero})`
        : `FORMATO DE SAÍDA OBRIGATÓRIO:
Título: ${titulo || "[título derivado do refrão - 2 a 4 palavras impactantes]"}

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

(Instruments: [lista de instrumentos em inglês] | BPM: ${metrics?.bpm || 90} | Style: ${genero})`
      : isPerformanceMode
        ? `FORMATO DE SAÍDA OBRIGATÓRIO (MODO PERFORMÁTICO):
Título: ${titulo || "[título derivado do refrão - 2 a 4 palavras impactantes]"}

[INTRO - Descrição detalhada da instrumentação, atmosfera e entrada musical]

[VERSO 1 - Descrição da voz, instrumentação e ritmo]
[primeiro verso completo em português]

[PRÉ-REFRÃO - Descrição da preparação e build-up]
[preparação para o refrão em português]

[REFRÃO - Descrição da energia, instrumentos e dinâmica]
[refrão principal completo em português]
(Performance: [direções de palco se houver])

[VERSO 2 - Descrição das mudanças musicais]
[segundo verso completo em português]

[PONTE - Descrição da pausa dramática e mudança]
[seção de transição em português]

[OUTRO - Descrição do fade out e encerramento]
[encerramento completo em português]

(Instruments: [lista completa de instrumentos em inglês] | BPM: ${metrics?.bpm || 100} | Style: ${genero})`
        : `FORMATO DE SAÍDA OBRIGATÓRIO:
Título: ${titulo || "[título derivado do refrão - 2 a 4 palavras impactantes]"}

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

${isPerformanceMode ? `(Instruments: [lista de instrumentos em inglês] | BPM: ${metrics?.bpm || 100} | Style: ${genero})` : ""}`

    const prompt = `Você é um compositor profissional especializado em ${genero}.

CRIE UMA LETRA ORIGINAL COM:
Gênero: ${genero}
Humor: ${humor || "variado"}
Tema: ${tema || "universal"}
${hook ? `Hook sugerido: ${hook}` : ""}
${inspiracao ? `Inspiração: ${inspiracao}` : ""}
${metaforas ? `Metáforas: ${metaforas}` : ""}
${emocoes && emocoes.length > 0 ? `Emoções: ${emocoes.join(", ")}` : ""}${metricInfo}${chorusInfo}${regrasSertanejoModerno}

${formatoEstrutura}

IMPORTANTE: 
- A LETRA COMPLETA (parte cantada) deve ser SEMPRE em PORTUGUÊS
- INSTRUÇÕES e INSTRUMENTOS em INGLÊS
- ESCREVA VERSOS COMPLETOS, não apenas palavras soltas
- O título deve ser derivado do refrão (2-4 palavras impactantes)
- Seja criativo e autêntico no estilo ${genero}
- Retorne APENAS a letra formatada completa, sem comentários adicionais.`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: prompt,
      temperature:
        criatividade === "conservador"
          ? 0.5
          : criatividade === "equilibrado"
            ? 0.7
            : criatividade === "ousado"
              ? 0.9
              : 0.7,
    })

    const genreKey = (
      genero.includes("Sertanejo Moderno")
        ? "Sertanejo Moderno"
        : genero.includes("Sertanejo Universitário")
          ? "Sertanejo Universitário"
          : genero.includes("Pagode")
            ? "Pagode"
            : genero.includes("Funk")
              ? "Funk"
              : genero.includes("MPB")
                ? "MPB"
                : genero.includes("Pop")
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
    if (!titulo && !finalLyrics.includes("Título:")) {
      const chorusMatch = finalLyrics.match(/\[(?:PART B|REFRÃO)[^\]]*\]\s*\n([^\n]+)/i)
      if (chorusMatch && chorusMatch[1]) {
        const chorusLine = chorusMatch[1].trim()
        const titleWords = chorusLine.split(" ").slice(0, 4).join(" ")
        finalLyrics = `Título: ${titleWords}\n\n${finalLyrics}`
      }
    }

    if (isPerformanceMode && !finalLyrics.includes("(Instruments:")) {
      const instrumentList = `(Instruments: [guitar, bass, drums, keyboard, synthesizer] | BPM: ${metrics?.bpm || 100} | Style: ${genero})`
      finalLyrics = finalLyrics + "\n\n" + instrumentList
    }

    return NextResponse.json({ letra: finalLyrics })
  } catch (error) {
    console.error("[v0] Error generating lyrics:", error)

    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"

    return NextResponse.json(
      {
        error: "Erro ao gerar letra.",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
