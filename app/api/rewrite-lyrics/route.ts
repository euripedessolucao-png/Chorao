import { generateText } from "ai"
import { NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { countPortugueseSyllables, ADVANCED_BRAZILIAN_METRICS, type GenreName } from "@/lib/third-way-converter"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { letraOriginal, generoConversao, conservarImagens, polirSemMexer, metrics } = body

    const metricInfo = metrics
      ? `\n\nMÉTRICA DO GÊNERO:
- Sílabas por linha: ${metrics.syllablesPerLine}
- BPM: ${metrics.bpm}
- Estrutura: ${metrics.structure}`
      : ""

    const isSertanejoModerno = generoConversao.includes("Sertanejo Moderno") || generoConversao.includes("Feminejo")

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
      ? `FORMATO DE SAÍDA OBRIGATÓRIO:
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

(Instruments: [lista de instrumentos em inglês] | BPM: ${metrics?.bpm || 90} | Style: ${generoConversao})`
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

(Instruments: [lista de instrumentos em inglês] | BPM: ${metrics?.bpm || 100} | Style: ${generoConversao})`

    const prompt = `Você é um compositor profissional especializado em ${generoConversao}.

LETRA ORIGINAL PARA REESCREVER:
${letraOriginal}

INSTRUÇÕES DE REESCRITA:
${conservarImagens ? "- CONSERVE as imagens e metáforas originais" : "- CRIE novas imagens e metáforas"}
${polirSemMexer ? "- MANTENHA a estrutura original, apenas aprimorando" : "- ADAPTE a estrutura para ${generoConversao}"}
- Preserve a mensagem emocional central
- Adapte o vocabulário para ${generoConversao}
- ESCREVA VERSOS COMPLETOS (não apenas palavras soltas)
- Cada linha deve ser uma frase completa e coerente${metricInfo}${regrasSertanejoModerno}

${formatoEstrutura}

IMPORTANTE: 
- A LETRA COMPLETA (parte cantada) deve ser SEMPRE em PORTUGUÊS
- INSTRUÇÕES e INSTRUMENTOS em INGLÊS
- ESCREVA VERSOS COMPLETOS, não apenas palavras soltas
- O título deve ser derivado do refrão (2-4 palavras impactantes)
- Retorne APENAS a letra formatada completa, sem comentários adicionais.`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: prompt,
      temperature: 0.7,
    })

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
      // Pular cabeçalhos, instruções e linhas vazias
      if (line.startsWith("[") || line.startsWith("(") || line.startsWith("Título:") || !line.trim()) {
        return line
      }

      // Validar métrica da linha
      const currentSyllables = countPortugueseSyllables(line)

      // Se a métrica está próxima do alvo (±2 sílabas), manter a linha original
      if (Math.abs(currentSyllables - targetSyllables) <= 2) {
        return line
      }

      // Se a métrica está muito fora, tentar ajustar minimamente
      if (currentSyllables > targetSyllables + 2) {
        // Comprimir: remover artigos desnecessários
        return line
          .replace(/\b(o|a|os|as)\s/gi, "")
          .replace(/\bpara\b/gi, "pra")
          .replace(/\bestá\b/gi, "tá")
      } else if (currentSyllables < targetSyllables - 2) {
        // Expandir: adicionar adjetivos sutis
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
