// app/api/rewrite-lyrics/route.ts - COM LOGS DE DEBUG EXTENSIVOS
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
  console.log("[v0] ========== INÍCIO DA REESCRITA ==========")

  try {
    const body = await request.json()
    console.log("[v0] Body recebido:", JSON.stringify(body, null, 2))

    const { originalLyrics, genre, theme, title, mood, additionalRequirements } = body

    console.log("[v0] Letra original (primeiros 100 chars):", originalLyrics?.substring(0, 100))
    console.log("[v0] Gênero:", genre)
    console.log("[v0] Tema:", theme)
    console.log("[v0] Título:", title)

    if (!originalLyrics?.trim()) {
      console.log("[v0] ❌ ERRO: Letra original vazia")
      return NextResponse.json({ error: "Letra original é obrigatória" }, { status: 400 })
    }

    // Prompt simples e direto para reescrita
    const prompt = `Você é um compositor profissional de ${genre || "música brasileira"}.

TAREFA: Reescreva a letra abaixo melhorando a qualidade, mas mantendo a estrutura e essência.

LETRA ORIGINAL:
${originalLyrics}

INSTRUÇÕES:
- Mantenha a mesma estrutura (Intro, Versos, Refrão, etc)
- Melhore as rimas e a métrica
- Use vocabulário mais rico
- Mantenha o tema: ${theme || "o tema original"}
${mood ? `- Tom emocional: ${mood}` : ""}
${additionalRequirements ? `- Requisitos: ${additionalRequirements}` : ""}

IMPORTANTE: Retorne APENAS a letra reescrita, sem explicações.`

    console.log("[v0] Prompt criado (primeiros 200 chars):", prompt.substring(0, 200))
    console.log("[v0] Chamando generateText...")

    const { text } = await generateText({
      model: getModel(),
      prompt,
      temperature: 0.7,
    })

    console.log("[v0] Resposta recebida (primeiros 200 chars):", text?.substring(0, 200))
    console.log("[v0] Tamanho da resposta:", text?.length)

    if (!text || text.trim().length === 0) {
      console.log("[v0] ❌ ERRO: Resposta vazia da IA")
      throw new Error("IA retornou resposta vazia")
    }

    // Limpar a resposta
    const cleanedLyrics = text.replace(/^"|"$/g, "").replace(/"\s*$/gm, "").replace(/^\s*"/gm, "").trim()

    console.log("[v0] Letra limpa (primeiros 200 chars):", cleanedLyrics.substring(0, 200))
    console.log("[v0] ========== FIM DA REESCRITA ==========")

    return NextResponse.json({
      success: true,
      lyrics: cleanedLyrics,
      letra: cleanedLyrics,
      title: title || `${theme || "Música"} - ${genre || "Reescrita"}`,
      titulo: title || `${theme || "Música"} - ${genre || "Reescrita"}`,
      metadata: {
        genre,
        theme,
        method: "REESCRITA_SIMPLES",
        polishingApplied: true,
      },
    })
  } catch (error) {
    console.error("[v0] ❌ ERRO FATAL:", error)
    console.error("[v0] Stack trace:", error instanceof Error ? error.stack : "N/A")

    return NextResponse.json(
      {
        error: "Erro ao reescrever letra",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json(
    {
      error: "Método não permitido",
      message: "Use POST para processar letras",
    },
    { status: 405 },
  )
}
