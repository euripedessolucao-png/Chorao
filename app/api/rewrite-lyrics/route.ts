import { NextResponse } from "next/server"
import { MetaComposer } from "@/lib/orchestrator/meta-composer"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"

export async function POST(request: Request) {
  console.log("[v0] 🚀 INÍCIO - API Rewrite Lyrics chamada")

  try {
    const body = await request.json()
    console.log("[v0] 📦 Body recebido completo:", JSON.stringify(body, null, 2))

    const lyrics = body.lyrics || body.letra || body.letraOriginal || ""
    const genre = body.genero || body.genre || "Sertanejo"
    const theme = body.tema || body.theme || "Reescrita"
    const mood = body.humor || body.mood || "Adaptado"
    const additionalRequirements = body.additionalRequirements || ""

    console.log("[v0] 📝 Letra recebida (primeiros 100 chars):", lyrics.substring(0, 100))
    console.log("[v0] 📝 Tamanho da letra:", lyrics.length)
    console.log("[v0] 📝 Parâmetros:", { genre, theme, mood })

    if (!lyrics || lyrics.trim().length < 10) {
      console.log("[v0] ❌ ERRO: Letra muito curta ou vazia")
      return NextResponse.json({ error: "Letra não encontrada ou muito curta" }, { status: 400 })
    }

    console.log("[v0] ✅ Validação passou - iniciando MetaComposer...")

    const result = await MetaComposer.compose({
      genre,
      theme,
      mood,
      additionalRequirements,
      originalLyrics: lyrics,
      applyFinalPolish: true,
      useTerceiraVia: true,
    })

    console.log("[v0] ✅ MetaComposer concluído - Score:", result.metadata.finalScore)
    console.log("[v0] 📝 Letra gerada (primeiros 200 chars):", result.lyrics.substring(0, 200))

    let rewrittenLyrics = result.lyrics
    rewrittenLyrics = capitalizeLines(rewrittenLyrics)

    console.log("[v0] ✅ Retornando resultado final")

    return NextResponse.json({
      letra: rewrittenLyrics,
      titulo: result.title,
      metadata: result.metadata,
    })
  } catch (error) {
    console.error("[v0] ❌ ERRO CRÍTICO:", error)
    console.error("[v0] ❌ Stack trace:", error instanceof Error ? error.stack : "Sem stack trace")
    return NextResponse.json(
      {
        error: "Erro na reescrita",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
