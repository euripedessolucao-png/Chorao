import { generateText } from "ai"
import { NextResponse } from "next/server"
import { openai } from '@ai-sdk/openai'

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

    // ✅ DETERMINA O FORMATO BASEADO NO GÊNERO
    const isSertanejoModerno = generoConversao.includes("Sertanejo Moderno") || 
                               generoConversao.includes("Feminejo")
    
    const formatoEstrutura = isSertanejoModerno 
      ? `FORMATO DE SAÍDA OBRIGATÓRIO:
[INTRO]
[texto da introdução]

[PART A – Verse 1]
[primeiro verso - 4 linhas]

[PART B – Chorus]
[refrão - 4 linhas]

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

    // ✅ PROMPT DINÂMICO
    const prompt = `Você é um compositor profissional especializado em ${generoConversao}.

LETRA ORIGINAL PARA REESCREVER:
${letraOriginal}

INSTRUÇÕES DE REESCRITA:
${conservarImagens ? "- CONSERVE as imagens e metáforas originais" : "- CRIE novas imagens e metáforas"}
${polirSemMexer ? "- MANTENHA a estrutura original, apenas aprimorando" : "- ADAPTE a estrutura para ${generoConversao}"}
- Preserve a mensagem emocional central
- Adapte o vocabulário para ${generoConversao}${metricInfo}

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
      maxTokens: 1500,
    })

    return NextResponse.json({ letra: text })
  } catch (error) {
    console.error("[v0] Error rewriting lyrics:", error)
    return NextResponse.json({ 
      error: "Erro ao reescrever letra.",
      details: error.message 
    }, { status: 500 })
  }
}
