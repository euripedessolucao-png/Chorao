import { type NextRequest, NextResponse } from "next/server"
import { MetaComposer } from "@/lib/orchestrator/meta-composer"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"

export async function POST(request: NextRequest) {
  try {
    const {
      letraOriginal,
      genero,
      humor,
      tema,
      criatividade,
      formattingStyle,
      additionalRequirements,
      advancedMode,
      universalPolish,
      syllableTarget,
      metrics,
      emocoes,
      inspiracao,
      metaforas,
      titulo,
      performanceMode,
    } = await request.json()

    // Validações básicas
    if (!letraOriginal?.trim()) {
      return NextResponse.json({ error: "Letra original é obrigatória" }, { status: 400 })
    }

    if (!genero) {
      return NextResponse.json({ error: "Gênero é obrigatório" }, { status: 400 })
    }

    console.log("[v0] 🎵 Iniciando reescrita com MetaComposer...")
    console.log("[v0] 📊 Parâmetros:", {
      genero,
      tema: tema || "Não especificado",
      humor: humor || "Não especificado",
      performanceMode: performanceMode || "standard",
    })

    const compositionRequest = {
      genre: genero,
      theme: tema || "Reescrita melhorada",
      mood: humor || "Adaptado ao tema",
      additionalRequirements: `REESCRITA DA LETRA ORIGINAL:
${letraOriginal}

${additionalRequirements || ""}

INSTRUÇÕES:
- Melhore a qualidade mantendo o tema e estrutura
- Corrija problemas de métrica e rimas
- Mantenha a essência da letra original`,
      syllableTarget: syllableTarget || { min: 9, max: 11, ideal: 10 },
      applyFinalPolish: universalPolish !== false,
    }

    const result = await MetaComposer.compose(compositionRequest)

    const finalLyrics = capitalizeLines(result.lyrics)

    console.log("[v0] ✅ Reescrita concluída com MetaComposer!")
    console.log("[v0] 📝 Resultado:", {
      titulo: result.title,
      score: result.metadata.finalScore,
    })

    return NextResponse.json({
      letra: finalLyrics,
      titulo: result.title || titulo || "Sem Título",
      metadata: {
        performanceMode: performanceMode || "standard",
        score: result.metadata.finalScore,
        polishingApplied: result.metadata.polishingApplied,
        iterations: result.metadata.iterations || 1,
        rhymeScore: result.metadata.rhymeScore,
        rhymeTarget: result.metadata.rhymeTarget,
      },
    })
  } catch (error) {
    console.error("[v0] 💥 Erro na reescrita:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro interno ao reescrever letra",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    )
  }
}

// Handler para método não permitido
export async function GET() {
  return NextResponse.json({ error: "Método não permitido. Use POST." }, { status: 405 })
}
