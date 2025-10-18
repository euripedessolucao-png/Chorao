import { NextResponse } from "next/server"
import { MetaComposer } from "@/lib/orchestrator/meta-composer"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log('🔍 DEBUG - Body completo:', JSON.stringify(body, null, 2))

    // ✅ PROCURA A LETRA EM QUALQUER PARÂMETRO
    let finalLyrics = ''
    let finalGenero = ''
    
    // Procura por letra em qualquer campo que possa conter
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string' && value.length > 10) {
        // Se for um texto longo, provavelmente é a letra
        if (value.length > 50 && !finalLyrics) {
          finalLyrics = value
          console.log(`📝 Letra encontrada no campo: "${key}"`)
        }
      }
      
      // Procura por gênero
      if (typeof value === 'string' && 
          ['sertanejo', 'mpb', 'funk', 'forró', 'rock', 'pop', 'gospel']
            .some(genre => value.toLowerCase().includes(genre))) {
        finalGenero = value
        console.log(`🎵 Gênero encontrado no campo: "${key}" = "${value}"`)
      }
    }

    // ✅ SE NÃO ENCONTROU, TENTA OS CAMPOS MAIS COMUNS
    if (!finalLyrics) {
      finalLyrics = body.lyrics || body.letra || body.text || body.content || ''
    }

    if (!finalGenero) {
      finalGenero = body.genero || body.genre || body.style || body.tipo || ''
    }

    const finalTema = body.tema || body.theme || body.subject || "Reescrita"
    const finalHumor = body.humor || body.mood || body.emocao || "Adaptado"
    const selectedChoruses = body.selectedChoruses || body.choruses || body.refroes || []
    const additionalReqs = body.additionalRequirements || body.requisitos || ''
    const universalPolish = body.universalPolish !== false

    console.log('🎯 PARÂMETROS IDENTIFICADOS:', {
      finalLyrics: finalLyrics ? `✅ ${finalLyrics.length} chars` : '❌ NÃO ENCONTRADA',
      finalGenero: finalGenero || '❌ NÃO ENCONTRADO',
      finalTema,
      finalHumor,
      selectedChoruses: selectedChoruses.length,
      additionalReqsLength: additionalReqs.length,
      allParams: Object.keys(body)
    })

    // ✅ VALIDAÇÃO FINAL
    if (!finalLyrics || finalLyrics.trim().length < 10) {
      return NextResponse.json({ 
        error: "Letra não encontrada ou muito curta",
        details: `Parâmetros recebidos: ${Object.keys(body).join(', ')}`,
        suggestion: "Certifique-se de enviar a letra no parâmetro 'lyrics' ou 'letra'",
        debug: {
          receivedParams: Object.keys(body),
          lyricsFound: !!finalLyrics,
          lyricsLength: finalLyrics?.length,
          lyricsPreview: finalLyrics?.substring(0, 100)
        }
      }, { status: 400 })
    }

    if (!finalGenero) {
      return NextResponse.json({ 
        error: "Gênero não encontrado",
        details: `Parâmetros recebidos: ${Object.keys(body).join(', ')}`,
        suggestion: "Envie o gênero no parâmetro 'genero' ou 'genre'",
        debug: {
          receivedParams: Object.keys(body)
        }
      }, { status: 400 })
    }

    console.log(`[Rewrite] ✅ Iniciando reescrita - Gênero: ${finalGenero}, Letra: ${finalLyrics.length} chars`)

    // ✅ CONFIGURAÇÃO DE SÍLABAS
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

    // ✅ CONSTRÓI OS REQUISITOS DE REESCRITA ESPECÍFICOS
    const rewriteRequirements = `
REESCRITA DE LETRA EXISTENTE - ${finalGenero.toUpperCase()}

📝 LETRA ORIGINAL PARA REESCREVER (MANTENHA A ESSÊNCIA):
${finalLyrics}

🎯 OBJETIVO DA REESCRITA:
1. MANTENHA a história, narrativa e essência da letra original
2. APERFEIÇOE a estrutura, métrica e rimas
3. USE os refrões/hooks fornecidos abaixo
4. MELHORE a fluência e cantabilidade
5. PRESERVE o tom emocional: ${finalHumor}

🎵 REFRÕES/HOOKS PARA USAR (OBRIGATÓRIO):
${selectedChoruses.length > 0 ? selectedChoruses.map((chorus: string, i: number) => 
  `REFRÃO ${i+1}:\n${chorus.split('/').map(line => `• ${line.trim()}`).join('\n')}`
).join('\n\n') : 'Nenhum refrão específico fornecido'}

${additionalReqs ? `\n⚡ REQUISITOS ADICIONAIS:\n${additionalReqs}` : ''}

📋 REGRAS DA REESCRITA:
- NÃO invente nova história - APERFEIÇOE a existente
- NÃO altere o significado original drasticamente
- INTEGRE os refrões fornecidos naturalmente
- MANTENHA personagens, situações e narrativa
- USE contrações: "cê", "tô", "pra", "tá"
- FOCO em melhorar estrutura e fluência

🎼 ESTRUTURA SUGERIDA:
- Versos que desenvolvem a história original
- REFRÕES fornecidos nos momentos certos
- Ponte que conecta com a narrativa existente
- Final coerente com o início

IMPORTANTE: Esta é uma REESCRITA, não uma NOVA COMPOSIÇÃO!`
    
    const compositionRequest = {
      genre: finalGenero,
      theme: finalTema,
      mood: finalHumor,
      syllableTarget: getSyllableConfig(finalGenero),
      applyFinalPolish: universalPolish,
      preservedChoruses: selectedChoruses,
      additionalRequirements: rewriteRequirements
    }

    // ✅ TIMEOUT
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 45000)
    )

    const compositionPromise = MetaComposer.compose(compositionRequest)
    const result = await Promise.race([compositionPromise, timeoutPromise])

    console.log(`[Rewrite] ✅ Concluído! Score: ${result.metadata.finalScore}`)

    return NextResponse.json({
      letra: result.lyrics,
      titulo: result.title,
      metadata: {
        score: result.metadata.finalScore,
        polishingApplied: result.metadata.polishingApplied,
        preservedChorusesUsed: result.metadata.preservedChorusesUsed,
        chorusPreservation: result.metadata.chorusPreservation
      }
    })

  } catch (error) {
    console.error("[Rewrite] Erro:", error)
    
    return NextResponse.json(
      {
        error: "Erro na reescrita",
        details: error instanceof Error ? error.message : "Erro desconhecido",
        suggestion: "Tente novamente com menos refrões selecionados"
      },
      { status: 500 }
    )
  }
}
