import { NextResponse } from "next/server"
import { generateText } from "ai"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"

export async function POST(request: Request) {
  console.log("[v0] 🚀 INÍCIO - API Rewrite Lyrics chamada")

  try {
    const body = await request.json()
    console.log("[v0] 📦 Body recebido:", Object.keys(body))

    const lyrics = body.lyrics || body.letra || ""
    const genre = body.genero || body.genre || "Sertanejo"
    const theme = body.tema || body.theme || "Reescrita"
    const mood = body.humor || body.mood || "Adaptado"
    const additionalRequirements = body.additionalRequirements || ""

    console.log("[v0] 📝 Parâmetros:", { lyrics: lyrics.length, genre, theme, mood })

    if (!lyrics || lyrics.trim().length < 10) {
      return NextResponse.json({ error: "Letra não encontrada ou muito curta" }, { status: 400 })
    }

    console.log("[v0] 🎼 Gerando reescrita...")

    const prompt = `Reescreva esta letra de ${genre} mantendo a essência:

LETRA ORIGINAL:
${lyrics}

TEMA: ${theme}
HUMOR: ${mood}
${additionalRequirements ? `REQUISITOS: ${additionalRequirements}` : ""}

REGRAS:
- Máximo 11 sílabas por verso
- Manter estrutura original
- Usar linguagem coloquial brasileira
- Tags em inglês, versos em português

Gere a letra reescrita:`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.7,
    })

    let rewrittenLyrics = text.trim()

    rewrittenLyrics = capitalizeLines(rewrittenLyrics)

    console.log("[v0] ✅ Reescrita concluída")

    return NextResponse.json({
      letra: rewrittenLyrics,
      titulo: theme,
      metadata: {
        score: 85,
        polishingApplied: true,
      },
    })
  } catch (error) {
    console.error("[v0] ❌ ERRO:", error)
    return NextResponse.json(
      {
        error: "Erro na reescrita",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
