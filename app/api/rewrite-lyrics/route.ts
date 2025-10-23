import { type NextRequest, NextResponse } from "next/server"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"

export const maxDuration = 60

export async function POST(request: NextRequest) {
  console.log("[v0] 🔍 INÍCIO DA ROTA REWRITE-LYRICS")

  try {
    console.log("[v0] 📥 Recebendo requisição de reescrita...")

    const body = await request.json()
    console.log("[v0] 📦 Body recebido:", {
      hasLetraOriginal: !!body.letraOriginal,
      genero: body.genero,
      tema: body.tema,
      humor: body.humor,
    })

    const { letraOriginal, genero, humor, tema, additionalRequirements, titulo } = body

    if (!letraOriginal?.trim()) {
      console.error("[v0] ❌ Letra original vazia")
      return NextResponse.json({ error: "Letra original é obrigatória" }, { status: 400 })
    }

    if (!genero || typeof genero !== "string" || !genero.trim()) {
      console.error("[v0] ❌ Gênero inválido:", genero)
      return NextResponse.json({ error: "Gênero é obrigatório e deve ser uma string válida" }, { status: 400 })
    }

    console.log("[v0] ✅ Validação de parâmetros OK")

    const finalLyrics = capitalizeLines(letraOriginal)
    console.log("[v0] ✅ Reescrita concluída (modo teste)! Tamanho da letra:", finalLyrics.length)

    return NextResponse.json({
      letra: finalLyrics,
      titulo: titulo || "Letra Reescrita (Teste)",
      metadata: {
        iterations: 1,
        finalScore: 100,
        polishingApplied: false,
        testMode: true,
      },
    })
  } catch (error) {
    console.error("[v0] ❌ Erro catastrófico na reescrita:", error)
    console.error("[v0] Stack trace:", error instanceof Error ? error.stack : "N/A")

    return NextResponse.json(
      {
        error: "Erro interno ao reescrever letra",
        message: error instanceof Error ? error.message : "Erro desconhecido",
        stack: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: "Método não permitido. Use POST." }, { status: 405 })
}
