import { generateText } from "ai"
import { NextResponse } from "next/server"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { MetaComposer } from "@/lib/orchestrator/meta-composer"

// ✅ CONFIGURAÇÃO SIMPLES POR GÊNERO
const GENRE_CONFIG = {
  "Sertanejo": { min: 9, max: 11, ideal: 10 },
  "Sertanejo Moderno": { min: 9, max: 11, ideal: 10 },
  "Sertanejo Universitário": { min: 9, max: 11, ideal: 10 },
  "MPB": { min: 7, max: 12, ideal: 9 },
  "Funk": { min: 6, max: 10, ideal: 8 },
  "Forró": { min: 8, max: 11, ideal: 9 },
  "default": { min: 7, max: 11, ideal: 9 }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log('🎵 [Generate-Lyrics] Parâmetros:', {
      genero: body.genero,
      tema: body.tema,
      humor: body.humor
    })

    const {
      genero,
      humor,
      tema,
      additionalRequirements,
      universalPolish = true,
      selectedChoruses = [],
    } = body

    // ✅ VALIDAÇÃO SIMPLES
    if (!genero) {
      return NextResponse.json({ 
        error: "Gênero é obrigatório",
        suggestion: "Selecione um gênero musical"
      }, { status: 400 })
    }

    if (!tema) {
      return NextResponse.json({ 
        error: "Tema é obrigatório", 
        suggestion: "Digite um tema para a música"
      }, { status: 400 })
    }

    // ✅ CONFIGURAÇÃO AUTOMÁTICA
    const syllableTarget = GENRE_CONFIG[genero as keyof typeof GENRE_CONFIG] || GENRE_CONFIG.default
    console.log(`[Generate-Lyrics] ${genero}: ${syllableTarget.min}-${syllableTarget.max}s`)

    // ✅ COMPOSIÇÃO SIMPLES
    const compositionRequest = {
      genre: genero,
      theme: tema,
      mood: humor || "Adaptado",
      additionalRequirements: additionalRequirements || '',
      syllableTarget: syllableTarget,
      applyFinalPolish: universalPolish,
      preservedChoruses: selectedChoruses
    }

    const result = await MetaComposer.compose(compositionRequest)
    
    // ✅ FORMATAÇÃO FINAL
    let finalLyrics = result.lyrics
    if (!finalLyrics.includes("(Instrumentos:")) {
      const instrumentList = `(Instrumentos: guitar, bass, drums, keyboard | Estilo: ${genero})`
      finalLyrics = finalLyrics.trim() + "\n\n" + instrumentList
    }
    finalLyrics = capitalizeLines(finalLyrics)

    console.log(`[Generate-Lyrics] ✅ Letra gerada! Score: ${result.metadata.finalScore}`)

    return NextResponse.json({
      letra: finalLyrics,
      titulo: result.title,
      metadata: {
        score: result.metadata.finalScore,
        polishingApplied: result.metadata.polishingApplied,
        preservedChorusesUsed: result.metadata.preservedChorusesUsed
      }
    })
    
  } catch (error) {
    console.error("[Generate-Lyrics] Erro:", error)

    return NextResponse.json(
      {
        error: "Erro ao gerar letra",
        details: error instanceof Error ? error.message : "Erro desconhecido",
        suggestion: "Tente novamente com um tema diferente"
      },
      { status: 500 }
    )
  }
}
