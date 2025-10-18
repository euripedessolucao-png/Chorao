import { NextResponse } from "next/server"
import { MetaComposer } from "@/lib/orchestrator/meta-composer"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { lyrics, genero, tema, humor, selectedChoruses, universalPolish = true } = body

    if (!lyrics || !genero) {
      return NextResponse.json({ error: "Letra e gênero são obrigatórios" }, { status: 400 })
    }

    console.log(`[Rewrite] Iniciando reescrita para: ${genero}`)
    console.log(`[Rewrite] Refrões selecionados: ${selectedChoruses?.length || 0}`)

    // ✅ CONFIGURAÇÃO RÁPIDA
    const getSyllableConfig = (genre: string) => {
      const configs = {
        "Sertanejo": { min: 9, max: 11, ideal: 10 },
        "Sertanejo Moderno": { min: 9, max: 11, ideal: 10 },
        "Sertanejo Universitário": { min: 9, max: 11, ideal: 10 },
        "MPB": { min: 7, max: 12, ideal: 9 },
        "Bossa Nova": { min: 7, max: 12, ideal: 9 },
        "Funk": { min: 6, max: 10, ideal: 8 },
        "Pagode": { min: 7, max: 11, ideal: 9 },
        "Samba": { min: 7, max: 11, ideal: 9 },
        "Forró": { min: 8, max: 11, ideal: 9 },
        "Axé": { min: 6, max: 10, ideal: 8 },
        "Rock": { min: 7, max: 11, ideal: 9 },
        "Pop": { min: 7, max: 11, ideal: 9 },
        "Gospel": { min: 8, max: 11, ideal: 9 },
        "default": { min: 7, max: 11, ideal: 9 }
      }
      return configs[genre as keyof typeof configs] || configs.default
    }

    const compositionRequest = {
      genre: genero,
      theme: tema || "Reescrita",
      mood: humor || "Adaptado",
      syllableTarget: getSyllableConfig(genero),
      applyFinalPolish: universalPolish,
      preservedChoruses: selectedChoruses || [],
      additionalRequirements: "Reescreva mantendo a essência mas melhorando a estrutura e métrica"
    }

    // ✅ TIMEOUT PREVENTIVO - 45 segundos
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout na reescrita - processo muito longo")), 45000)
    )

    const compositionPromise = MetaComposer.compose(compositionRequest)

    const result = await Promise.race([compositionPromise, timeoutPromise])

    console.log(`[Rewrite] ✅ Reescrita concluída! Score: ${result.metadata.finalScore}`)

    return NextResponse.json({
      letra: result.lyrics,
      titulo: result.title,
      metadata: {
        score: result.metadata.finalScore,
        polishingApplied: result.metadata.polishingApplied,
        preservedChorusesUsed: result.metadata.preservedChorusesUsed
      }
    })

  } catch (error) {
    console.error("[Rewrite] Erro:", error)
    
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
    
    // ✅ SUGESTÕES ESPECÍFICAS
    let suggestion = "Tente novamente"
    if (errorMessage.includes("Timeout")) {
      suggestion = "Tente com menos refrões selecionados ou desative o polimento universal"
    } else if (errorMessage.includes("API")) {
      suggestion = "Problema temporário com o serviço. Tente novamente em alguns segundos"
    }
    
    return NextResponse.json(
      {
        error: "Erro na reescrita",
        details: errorMessage,
        suggestion
      },
      { status: 500 }
    )
  }
}
