// app/api/generate-lyrics/route.ts

import { NextRequest, NextResponse } from "next/server"
import { MetaComposer } from "@/lib/orchestrator/meta-composer"
import {
  formatSertanejoPerformance,
  shouldUsePerformanceFormat,
} from "@/lib/formatters/sertanejo-performance-formatter"
import { formatInstrumentationForAI } from "@/lib/normalized-genre"
import { validateSyllablesByGenre } from "@/lib/validation/absolute-syllable-enforcer"
import { LineStacker } from "@/lib/utils/line-stacker"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      genre,
      theme,
      mood,
      additionalRequirements,
      creativity = "equilibrado",
      applyFinalPolish = true,
      preservedChoruses = [],
      rhythm,
      performanceMode = "standard",
      useTerceiraVia = true,
      useIntelligentElisions = true,
    } = body

    console.log("🎵 Recebendo requisição de composição:", {
      genre,
      theme,
      mood,
      creativity,
      performanceMode,
    })

    // Validação básica
    if (!genre || !theme) {
      return NextResponse.json(
        { error: "Gênero e tema são obrigatórios" },
        { status: 400 }
      )
    }

    // Composição principal
    const compositionResult = await MetaComposer.compose({
      genre,
      theme,
      mood: mood || "adaptável",
      additionalRequirements,
      creativity,
      applyFinalPolish,
      preservedChoruses,
      rhythm,
      performanceMode,
      useTerceiraVia,
      useIntelligentElisions,
      syllableTarget: {
        min: 7,
        max: 11,
        ideal: 9,
      },
    })

    // Validação final de sílabas
    const syllableValidation = validateSyllablesByGenre(compositionResult.lyrics, genre)
    
    if (!syllableValidation.isValid) {
      console.warn("⚠️ Validação de sílabas falhou:", syllableValidation.message)
      
      // Ainda retorna a letra, mas com aviso no metadata
      compositionResult.metadata.syllableViolations = syllableValidation.violations
      compositionResult.metadata.syllableMessage = syllableValidation.message
    }

    // Aplica formatação de performance se necessário
    let finalLyrics = compositionResult.lyrics
    if (shouldUsePerformanceFormat(genre, performanceMode)) {
      finalLyrics = formatSertanejoPerformance(finalLyrics)
    }

    // Stack de linhas para melhor legibilidade
    const stackingResult = LineStacker.stackLines(finalLyrics)
    finalLyrics = stackingResult.stackedLyrics

    console.log("✅ Composição finalizada com sucesso!")
    console.log(`📊 Métricas: Score ${compositionResult.metadata.finalScore.toFixed(1)}`)

    return NextResponse.json({
      success: true,
      lyrics: finalLyrics,
      title: compositionResult.title,
      metadata: {
        ...compositionResult.metadata,
        syllableValidation: {
          isValid: syllableValidation.isValid,
          message: syllableValidation.message,
          maxSyllables: syllableValidation.maxSyllables,
        },
      },
    })

  } catch (error) {
    console.error("❌ Erro na composição:", error)
    
    return NextResponse.json(
      { 
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    )
  }
}
