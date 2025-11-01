// app/api/generate-chorus/route.ts - VERSÃO SUPER SIMPLES
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
    console.log("[Chorus] Body recebido:", JSON.stringify(body, null, 2))

    const { genre, theme } = body

    console.log("[Chorus] Gênero:", genre)
    console.log("[Chorus] Tema:", theme)

    if (!theme) {
      return NextResponse.json({ error: "Tema é obrigatório" }, { status: 400 })
    }

    // ✅ PROMPT CURTO E DIRETO - MESMO ESTILO DA REESCRITA
    const prompt = `Escreva um refrão de música ${genre || "sertanejo"} sobre ${theme}. 4 linhas.`

    console.log("[Chorus] Prompt:", prompt)
    console.log("[Chorus] Chamando generateText...")

    const { text } = await generateText({
      model: getModel(),
      prompt,
      temperature: 0.7,
    })

    console.log("[Chorus] Resposta recebida:", text)

    if (!text) {
      throw new Error("IA não retornou resposta")
    }

    // ✅ LIMPEZA SIMPLES - MESMO ESTILO DA REESCRITA
    const cleanedText = text.replace(/"/g, '').trim()

    console.log("[Chorus] Texto limpo:", cleanedText)

    // ✅ SEMPRE RETORNA 1 REFRÃO - SIMPLES
    const choruses = [cleanedText]

    console.log("[Chorus] ========== FIM ==========")

    return NextResponse.json({
      success: true,
      choruses: choruses,
      metadata: {
        genre: genre || "Sertanejo Moderno Masculino",
        theme,
        totalChoruses: 1
      },
    })

  } catch (error) {
    console.error("[Chorus] ❌ ERRO:", error)

    // ✅ FALLBACK SIMPLES
    const fallbackChoruses = ["Teu amor é minha luz\nMinha força, minha paz\nNo ritmo da vida\nEncontro a verdade"]
    
    return NextResponse.json({
      success: true,
      choruses: fallbackChoruses,
      metadata: {
        genre: "Sertanejo Moderno Masculino",
        theme: "amor",
        totalChoruses: 1
      },
    })
  }
}

export async function GET() {
  return NextResponse.json({ error: "Use POST" }, { status: 405 })
}
