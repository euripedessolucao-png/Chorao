import { type NextRequest, NextResponse } from "next/server"
import { MetaComposer } from "@/lib/orchestrator/meta-composer"
import { MegaAggressiveCorrector } from "@/lib/orchestrator/mega-aggressive-corrector"
export const maxDuration = 60

export async function POST(request: NextRequest) {
  console.log("[v0] 🔍 INÍCIO DA ROTA REWRITE-LYRICS COM METACOMPOSER")

  try {
    console.log("[v0] 📥 Recebendo requisição de reescrita...")

    const body = await request.json()
    console.log("[v0] 📦 Body recebido:", {
      hasLetraOriginal: !!body.letraOriginal,
      genero: body.genero,
      tema: body.tema,
      humor: body.humor,
      additionalRequirements: !!body.additionalRequirements,
    })

    const { letraOriginal, genero, humor, tema, additionalRequirements, titulo, formattingStyle, performanceMode } = body

    if (!letraOriginal?.trim()) {
      console.error("[v0] ❌ Letra original vazia")
      return NextResponse.json({ error: "Letra original é obrigatória" }, { status: 400 })
    }

    if (!genero || typeof genero !== "string" || !genero.trim()) {
      console.error("[v0] ❌ Gênero inválido:", genero)
      return NextResponse.json({ error: "Gênero é obrigatório e deve ser uma string válida" }, { status: 400 })
    }

    console.log("[v0] ✅ Validação de parâmetros OK")
    console.log("[v0] 🚀 Iniciando MetaComposer para reescrita...")

    // ✅ METACOMPOSER LIGADO COM ELISÕES INTELIGENTES!
    const result = await MetaComposerWithAggressiveCorrection.compose({
      genre: genero,
      theme: tema || "Amor",
      mood: humor || "Romântico",
      originalLyrics: letraOriginal, // ✅ MODO REESCRITA
      syllableTarget: { min: 7, max: 11, ideal: 9 },
      useIntelligentElisions: true, // ✅ ELISÕES LIGADAS!
      performanceMode: performanceMode || (formattingStyle === "performatico" ? "performance" : "standard"),
      additionalRequirements: additionalRequirements,
      applyFinalPolish: true,
      useTerceiraVia: true
    })

    console.log("[v0] ✅ MetaComposer concluído com sucesso!")
    console.log("[v0] 📊 Resultado:", {
      titulo: result.title,
      tamanhoLetra: result.lyrics.length,
      score: result.metadata.finalScore,
      elisõesAplicadas: result.metadata.intelligentElisionsApplied,
      performanceMode: result.metadata.performanceMode
    })

    return NextResponse.json({
      letra: result.lyrics,
      titulo: result.title,
      metadata: {
        ...result.metadata,
        reescrita: true,
        generoAplicado: genero
      },
    })
  } catch (error) {
    console.error("[v0] ❌ Erro no MetaComposer:", error)
    console.error("[v0] Stack trace:", error instanceof Error ? error.stack : "N/A")

    return NextResponse.json(
      {
        error: "Erro interno ao reescrever letra com MetaComposer",
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
