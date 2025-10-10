import { generateText } from "ai"
import { NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"

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
[INTRO]
[texto da introdução]

[PART A – Verse 1]
[primeiro verso - 4 linhas]

[PART B – Chorus]
[refrão - 2 ou 4 linhas]

[PART A2 – Verse 2]  
[segundo verso - 4 linhas]

[PART C – Bridge]
[ponte - 2 linhas]

[PART B – Chorus]
[refrão]

[PART B – Chorus]
[refrão repetido]

[OUTRO]
[encerramento - 2 linhas]`
      : `FORMATO DE SAÍDA OBRIGATÓRIO:
[INTRO]
[texto da introdução]

[VERSO 1]
[primeiro verso]

[PRÉ-REFRÃO]
[preparação para o refrão]

[REFRÃO]
[refrão principal]

[VERSO 2]
[segundo verso]

[PONTE]
[seção de transição]

[OUTRO]
[encerramento]`

    const prompt = `Você é um compositor profissional especializado em ${generoConversao}.

LETRA ORIGINAL PARA REESCREVER:
${letraOriginal}

INSTRUÇÕES DE REESCRITA:
${conservarImagens ? "- CONSERVE as imagens e metáforas originais" : "- CRIE novas imagens e metáforas"}
${polirSemMexer ? "- MANTENHA a estrutura original, apenas aprimorando" : "- ADAPTE a estrutura para ${generoConversao}"}
- Preserve a mensagem emocional central
- Adapte o vocabulário para ${generoConversao}${metricInfo}${regrasSertanejoModerno}

${formatoEstrutura}

(Instruments: [lista de instrumentos em inglês] | BPM: ${metrics?.bpm || "adequado"} | Style: ${generoConversao})

IMPORTANTE: 
- A LETRA (parte cantada) deve ser SEMPRE em PORTUGUÊS
- INSTRUÇÕES e INSTRUMENTOS em INGLÊS
- Retorne APENAS a letra formatada, sem comentários adicionais.`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: prompt,
      temperature: 0.7,
    })

    return NextResponse.json({ letra: text })
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
