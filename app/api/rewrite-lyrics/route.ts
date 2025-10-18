import { NextResponse } from "next/server"
import { MetaComposer } from "@/lib/orchestrator/meta-composer"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log('🔍 DEBUG - Body recebido:', {
      keys: Object.keys(body),
      lyricsType: typeof body.lyrics,
      lyricsLength: body.lyrics?.length,
      lyricsPreview: body.lyrics?.substring(0, 100) + '...',
      genero: body.genero || body.genre,
      selectedChoruses: body.selectedChoruses?.length
    })

    // ✅ PARÂMETROS FLEXÍVEIS
    const {
      lyrics, 
      genero, genre,
      tema, theme,  
      humor, mood,
      selectedChoruses, 
      universalPolish = true 
    } = body

    // ✅ VALORES FINAIS
    const finalGenero = genero || genre
    const finalTema = tema || theme || "Reescrita"
    const finalHumor = humor || mood || "Adaptado"
    const finalLyrics = lyrics?.trim()

    // ✅ VALIDAÇÃO DETALHADA
    if (!finalLyrics) {
      console.error('❌ VALIDAÇÃO FALHOU - Letra:', {
        lyrics: lyrics,
        isNull: lyrics === null,
        isUndefined: lyrics === undefined,
        isEmpty: lyrics === '',
        isString: typeof lyrics === 'string',
        trimmed: finalLyrics
      })
      
      return NextResponse.json({ 
        error: "Letra é obrigatória",
        details: `Recebido: ${typeof lyrics} - "${lyrics?.substring(0, 50)}..."`,
        suggestion: "Verifique se a letra foi colada corretamente"
      }, { status: 400 })
    }

    if (finalLyrics.length < 10) {
      return NextResponse.json({ 
        error: "Letra muito curta",
        details: `A letra deve ter pelo menos 10 caracteres (recebido: ${finalLyrics.length})`,
        suggestion: "Cole uma letra completa para reescrever"
      }, { status: 400 })
    }

    if (!finalGenero) {
      return NextResponse.json({ 
        error: "Gênero é obrigatório",
        details: "Selecione um gênero musical",
        suggestion: "Escolha um gênero como Sertanejo, MPB, Funk, etc."
      }, { status: 400 })
    }

    console.log(`[Rewrite] ✅ Validação passada - Iniciando para: ${finalGenero}`)
    console.log(`[Rewrite] Letra: ${finalLyrics.length} chars, Refrões: ${selectedChoruses?.length || 0}`)

    // ✅ CONFIGURAÇÃO SIMPLES
    const getSyllableConfig = (genre: string) => {
      const configs: { [key: string]: { min: number; max: number; ideal: number } } = {
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
        "Gospel": { min: 8, max: 11, ideal: 9 }
      }
      return configs[genre] || { min: 7, max: 11, ideal: 9 }
    }

    const compositionRequest = {
      genre: finalGenero,
      theme: finalTema,
      mood: finalHumor,
      syllableTarget: getSyllableConfig(finalGenero),
      applyFinalPolish: universalPolish,
      preservedChoruses: selectedChoruses || [],
      additionalRequirements: "Reescreva esta letra mantendo a essência mas melhorando a estrutura, métrica e fluência"
    }

    // ✅ TIMEOUT PREVENTIVO
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout - processo muito longo")), 45000)
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
    
    let suggestion = "Tente novamente"
    if (errorMessage.includes("Timeout")) {
      suggestion = "Tente com menos refrões selecionados ou uma letra mais curta"
    } else if (errorMessage.includes("Letra")) {
      suggestion = "Verifique se a letra foi colada corretamente"
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
