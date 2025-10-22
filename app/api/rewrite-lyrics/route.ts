// app/api/rewrite-lyrics/route.ts - CORRIGIDO

import { NextRequest, NextResponse } from "next/server"
import { MetaComposer } from "@/lib/orchestrator/meta-composer"

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
      performanceMode
    } = await request.json()

    // Validações básicas
    if (!letraOriginal?.trim()) {
      return NextResponse.json(
        { error: "Letra original é obrigatória" },
        { status: 400 }
      )
    }

    if (!genero) {
      return NextResponse.json(
        { error: "Gênero é obrigatório" },
        { status: 400 }
      )
    }

    console.log("🎵 [API Rewrite] Iniciando reescrita...")
    console.log("📊 Parâmetros:", {
      genero,
      tema: tema || "Não especificado",
      humor: humor || "Não especificado",
      performanceMode: performanceMode || "standard"
    })

    // Prepara request para o MetaComposer
    const compositionRequest = {
      genre: genero,
      theme: tema || "Amor",
      mood: humor || "Romântico",
      originalLyrics: letraOriginal,
      additionalRequirements: additionalRequirements || "",
      creativity: criatividade || "equilibrado",
      applyFinalPolish: universalPolish ?? true,
      syllableTarget: syllableTarget || { min: 7, max: 11, ideal: 9 },
      performanceMode: performanceMode || "standard",
      useTerceiraVia: true
    }

    // Executa a composição
    const result = await MetaComposer.compose(compositionRequest)

    console.log("✅ [API Rewrite] Reescrita concluída com sucesso!")
    console.log("📝 Resultado:", {
      titulo: result.title,
      performanceMode: result.metadata.performanceMode,
      score: result.metadata.finalScore
    })

    // Retorna resposta formatada
    return NextResponse.json({
      letra: result.lyrics,
      titulo: result.title,
      metadata: {
        performanceMode: result.metadata.performanceMode,
        score: result.metadata.finalScore,
        polishingApplied: result.metadata.polishingApplied,
        iterations: result.metadata.iterations
      }
    })

  } catch (error) {
    console.error("💥 [API Rewrite] Erro na reescrita:", error)
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro interno ao reescrever letra",
        details: process.env.NODE_ENV === "development" ? error : undefined
      },
      { status: 500 }
    )
  }
}

// Handler para método não permitido
export async function GET() {
  return NextResponse.json(
    { error: "Método não permitido. Use POST." },
    { status: 405 }
  )
}
