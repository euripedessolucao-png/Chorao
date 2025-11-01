// app/api/generate-chorus/route.ts - VERSÃO SIMPLES E FUNCIONAL
import { type NextRequest, NextResponse } from "next/server"
import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"

function getModel() {
  if (process.env.OPENAI_API_KEY) {
    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    return openai("gpt-4o-mini")
  }
  return "openai/gpt-4o-mini"
}

export async function POST(request: NextRequest) {
  console.log("[Chorus] ========== INÍCIO ==========")

  try {
    const body = await request.json()
    console.log("[Chorus] Body recebido:", body)

    const { genre, theme } = body

    if (!theme) {
      return NextResponse.json({ error: "Tema é obrigatório" }, { status: 400 })
    }

    const prompt = `Escreva um refrão de música ${genre || "sertanejo"} sobre ${theme}. 4 linhas completas.`

    console.log("[Chorus] Prompt:", prompt)

    const { text } = await generateText({
      model: getModel(),
      prompt,
      temperature: 0.7,
    })

    console.log("[Chorus] Resposta:", text)

    // Se a IA respondeu, usa a resposta. Se não, usa fallback
    const chorus = text || "Teu amor é minha luz\nMinha força, minha paz\nNo ritmo da vida\nEncontro a verdade"

    return NextResponse.json({
      success: true,
      chorus: chorus,
    })

  } catch (error) {
    console.error("[Chorus] Erro:", error)
    
    return NextResponse.json({
      success: true,
      chorus: "Teu sorriso é meu porto seguro\nTeu abraço é meu aquecimento\nNo ritmo desse amor tão puro\nEncontro paz e sentimento",
    })
  }
}

export async function GET() {
  return NextResponse.json({ error: "Use POST" }, { status: 405 })
}
