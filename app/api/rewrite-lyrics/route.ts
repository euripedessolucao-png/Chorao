import { NextResponse } from "next/server"
import { MetaComposer } from "@/lib/orchestrator/meta-composer"
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

    console.log("[v0] 🎼 Gerando reescrita com MetaComposer...")

    const result = await MetaComposer.compose({
      genre,
      theme,
      mood,
      additionalRequirements,
      originalLyrics: lyrics,
      applyFinalPolish: true,
      useTerceiraVia: true,
    })

    console.log("[v0] ✅ Reescrita concluída - Score:", result.metadata.finalScore)

    let rewrittenLyrics = result.lyrics
    rewrittenLyrics = capitalizeLines(rewrittenLyrics)

    return NextResponse.json({
      letra: rewrittenLyrics,
      titulo: result.title,
      metadata: result.metadata,
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
