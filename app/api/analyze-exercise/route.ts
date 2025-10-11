import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { exercise, userAnswer, aiPrompt } = await request.json()

    if (!userAnswer || !aiPrompt) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `${aiPrompt}\n\nExercício: ${exercise}\n\nResposta do usuário:\n${userAnswer}\n\nForneça uma análise detalhada e construtiva em português do Brasil.`,
      temperature: 0.7,
      maxTokens: 500,
    })

    return NextResponse.json({ analysis: text })
  } catch (error) {
    console.error("Error analyzing exercise:", error)
    return NextResponse.json({ error: "Erro ao analisar exercício" }, { status: 500 })
  }
}
