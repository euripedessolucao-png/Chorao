import { generateText } from "ai"
import { NextResponse } from "next/server"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { SyllableEnforcer } from "@/lib/validation/syllableEnforcer"
import { MetaComposer } from "@/lib/orchestrator/meta-composer"

// ✅ CONFIGURAÇÃO UNIVERSAL DE QUALIDADE POR GÊNERO
const GENRE_QUALITY_CONFIG = {
  "Sertanejo": { min: 9, max: 11, ideal: 10 },
  "Sertanejo Moderno": { min: 9, max: 11, ideal: 10 },
  "Sertanejo Universitário": { min: 9, max: 11, ideal: 10 },
  "MPB": { min: 7, max: 12, ideal: 9 },
  "Funk": { min: 6, max: 10, ideal: 8 },
  "Forró": { min: 8, max: 11, ideal: 9 },
  "default": { min: 7, max: 11, ideal: 9 }
}

// ✅ OBTÉM CONFIGURAÇÃO DE SÍLABAS POR GÊNERO
function getSyllableConfig(genero: string) {
  return GENRE_QUALITY_CONFIG[genero as keyof typeof GENRE_QUALITY_CONFIG] || GENRE_QUALITY_CONFIG.default
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
    const syllableTarget = getSyllableConfig(genero)
    console.log(`[Generate-Lyrics] ${genero}: ${syllableTarget.min}-${syllableTarget.max}s`)

    let finalLyrics: string
    let generationMode = "normal"

    // ✅ DECISÃO: COM OU SEM REFRÕES PRESERVADOS
    if (selectedChoruses.length > 0) {
      console.log(`[Generate-Lyrics] 🎯 Com ${selectedChoruses.length} refrões`)
      generationMode = "preservation"
      
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
      finalLyrics = result.lyrics
      
    } else {
      // ✅ GERAÇÃO NORMAL
      console.log(`[Generate-Lyrics] 🎵 Geração normal`)
      generationMode = "normal"
      
      const compositionRequest = {
        genre: genero,
        theme: tema,
        mood: humor || "Adaptado",
        additionalRequirements,
        syllableTarget: syllableTarget,
        applyFinalPolish: universalPolish
      }

      const result = await MetaComposer.compose(compositionRequest)
      finalLyrics = result.lyrics
    }

    // ✅ FORMATAÇÃO FINAL
    finalLyrics = applyFinalFormatting(finalLyrics, genero)

    console.log(`[Generate-Lyrics] ✅ Concluído! Modo: ${generationMode}`)

    return NextResponse.json({
      letra: finalLyrics,
      titulo: extractTitleFromLyrics(finalLyrics),
      metadata: {
        generationMode,
        genre: genero
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

// ✅ FORMATAÇÃO SIMPLES
function applyFinalFormatting(lyrics: string, genero: string): string {
  let formattedLyrics = lyrics

  if (!formattedLyrics.includes("(Instrumentos:")) {
    const instrumentList = `(Instrumentos: guitar, bass, drums, keyboard | Estilo: ${genero})`
    formattedLyrics = formattedLyrics.trim() + "\n\n" + instrumentList
  }

  formattedLyrics = capitalizeLines(formattedLyrics)
  return formattedLyrics
}

// ✅ EXTRAI TÍTULO
function extractTitleFromLyrics(lyrics: string): string {
  const chorusMatch = lyrics.match(/\[(?:CHORUS|REFRÃO)[^\]]*\]\s*\n([^\n]+)/i)
  if (chorusMatch?.[1]) {
    return chorusMatch[1].trim().split(" ").slice(0, 4).join(" ")
  }
  return "Composição Musical"
}
