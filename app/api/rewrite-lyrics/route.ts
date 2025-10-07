import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { letraOriginal, generoConversao, conservarImagens, polirSemMexer, metrics } = body

    const metricInfo = metrics
      ? `\n\nIMPORTANTE - Métrica do Gênero ${generoConversao}:
- Cada linha deve ter aproximadamente ${metrics.syllablesPerLine} sílabas
- Ritmo: ${metrics.bpm} BPM
- Estrutura: ${metrics.structure}
- Mantenha a métrica consistente em toda a letra reescrita`
      : ""

    const prompt = `Você é um compositor profissional especializado em reescrever e adaptar letras de músicas para diferentes gêneros musicais brasileiros.

Letra Original:
${letraOriginal}

Tarefa: Reescreva esta letra para o gênero ${generoConversao}

Instruções:
${conservarImagens ? "- Mantenha as imagens e metáforas originais sempre que possível" : "- Sinta-se livre para criar novas imagens e metáforas"}
${polirSemMexer ? "- Mantenha a estrutura original, apenas polindo a linguagem" : "- Adapte a estrutura conforme necessário para o novo gênero"}
- Preserve a mensagem e emoção central da letra original
- Adapte o vocabulário e estilo para o gênero ${generoConversao}
- Mantenha a qualidade poética e lírica
- Formate claramente com [INTRO], [VERSO 1], [REFRÃO], etc.${metricInfo}

Retorne APENAS a letra reescrita, sem comentários adicionais.`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: prompt,
      temperature: 0.7,
    })

    return NextResponse.json({ letra: text })
  } catch (error) {
    console.error("[v0] Error rewriting lyrics:", error)
    return NextResponse.json({ error: "Erro ao reescrever letra. Por favor, tente novamente." }, { status: 500 })
  }
}
