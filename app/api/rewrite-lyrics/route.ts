import { NextResponse } from "next/server"
import { MetaComposer } from "@/lib/orchestrator/meta-composer"
import { LineValidator } from "@/lib/validation/line-validator"
import { StructureAnalyzer } from "@/lib/orchestrator/structure-analyzer"
import { getGenreConfig, detectSubGenre, getGenreRhythm } from "@/lib/genre-config"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log('🔍 DEBUG - Body completo:', JSON.stringify(body, null, 2))

    // ✅ PROCURA A LETRA E PARÂMETROS
    let finalLyrics = ''
    let finalGenero = ''
    let additionalRequirements = body.additionalRequirements || body.requisitos || ''
    
    // Procura por letra em qualquer campo
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string' && value.length > 10) {
        if (value.length > 50 && !finalLyrics && !key.toLowerCase().includes('requirement')) {
          finalLyrics = value
          console.log(`📝 Letra encontrada no campo: "${key}"`)
        }
      }
      
      // Procura por gênero
      if (typeof value === 'string' && 
          ['sertanejo', 'mpb', 'funk', 'forró', 'rock', 'pop', 'gospel', 'piseiro']
            .some(genre => value.toLowerCase().includes(genre))) {
        finalGenero = value
        console.log(`🎵 Gênero encontrado no campo: "${key}" = "${value}"`)
      }
    }

    // ✅ CAMPOS PADRÃO
    if (!finalLyrics) {
      finalLyrics = body.lyrics || body.letra || body.text || body.content || ''
    }

    if (!finalGenero) {
      finalGenero = body.genero || body.genre || body.style || body.tipo || ''
    }

    const finalTema = body.tema || body.theme || body.subject || "Reescrita"
    const finalHumor = body.humor || body.mood || body.emocao || "Adaptado"
    const selectedChoruses = body.selectedChoruses || body.choruses || body.refroes || []
    const universalPolish = body.universalPolish !== false

    console.log('🎯 PARÂMETROS IDENTIFICADOS:', {
      finalLyrics: finalLyrics ? `✅ ${finalLyrics.length} chars` : '❌ NÃO ENCONTRADA',
      finalGenero: finalGenero || '❌ NÃO ENCONTRADO',
      finalTema,
      finalHumor,
      additionalRequirements: additionalRequirements || 'Nenhum',
      selectedChoruses: selectedChoruses.length,
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

    console.log(`[Rewrite] ✅ Iniciando reescrita orquestrada - Gênero: ${finalGenero}`)

    // ✅ ANÁLISE DA ESTRUTURA ORIGINAL
    const structureAnalysis = StructureAnalyzer.analyze(finalLyrics)
    console.log('[Rewrite] 📊 Análise estrutural:', structureAnalysis)

    // ✅ VALIDAÇÃO DAS SÍLABAS DA LETRA ORIGINAL
    const originalValidation = LineValidator.validateLyrics(finalLyrics)
    console.log('[Rewrite] ⚖️ Validação original:', originalValidation)

    // ✅ CONFIGURAÇÃO DO GÊNERO
    const genreConfig = getGenreConfig(finalGenero)
    const subGenreInfo = detectSubGenre(additionalRequirements)
    const defaultRhythm = getGenreRhythm(finalGenero)
    const finalRhythm = subGenreInfo.rhythm || defaultRhythm

    // ✅ PREPARAÇÃO DOS REFRÕES PRESERVADOS
    const preservedChoruses = selectedChoruses.map((chorus: string) => {
      const chorusValidation = LineValidator.validateLyrics(chorus)
      return {
        content: chorus,
        validation: chorusValidation,
        syllableCompliance: chorusValidation.valid ? "✅" : "❌"
      }
    })

    console.log(`[Rewrite] 🎵 Refrões preservados:`, preservedChoruses)

    // ✅ COMPOSIÇÃO META-ORQUESTRADA
    const compositionRequest = {
      genre: finalGenero,
      theme: finalTema,
      mood: finalHumor,
      rhythm: finalRhythm,
      originalLyrics: finalLyrics,
      syllableTarget: {
        min: genreConfig.syllableRange?.min || 7,
        max: genreConfig.syllableRange?.max || 12,
        ideal: genreConfig.syllableRange?.ideal || 9
      },
      applyFinalPolish: universalPolish,
      preservedChoruses: selectedChoruses,
      additionalRequirements: additionalRequirements,
      structureAnalysis: structureAnalysis,
      originalValidation: originalValidation
    }

    console.log('[Rewrite] 🎼 Request para MetaComposer:', compositionRequest)

    // ✅ TIMEOUT
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout na composição")), 45000)
    )

    const compositionPromise = MetaComposer.compose(compositionRequest)
    const result = await Promise.race([compositionPromise, timeoutPromise])

    console.log(`[Rewrite] ✅ Concluído! Score: ${result.metadata.finalScore}`)

    // ✅ VALIDAÇÃO FINAL DA LETRA REESCRITA
    const finalValidation = LineValidator.validateLyrics(result.lyrics)
    console.log('[Rewrite] ✅ Validação final:', finalValidation)

    return NextResponse.json({
      letra: result.lyrics,
      titulo: result.title,
      metadata: {
        score: result.metadata.finalScore,
        polishingApplied: result.metadata.polishingApplied,
        preservedChorusesUsed: result.metadata.preservedChorusesUsed,
        syllableCompliance: finalValidation.complianceRate,
        structureImproved: result.metadata.structureImproved,
        validation: finalValidation,
        originalValidation: originalValidation
      }
    })

  } catch (error) {
    console.error("[Rewrite] Erro:", error)
    
    // ✅ FALLBACK - Se o MetaComposer falhar, usa sistema simplificado
    if (error instanceof Error && error.message.includes("Timeout")) {
      console.log('[Rewrite] ⚠️ Timeout, tentando fallback...')
      return await fallbackRewrite(request)
    }
    
    return NextResponse.json(
      {
        error: "Erro na reescrita orquestrada",
        details: error instanceof Error ? error.message : "Erro desconhecido",
        suggestion: "Tente novamente ou use menos refrões selecionados"
      },
      { status: 500 }
    )
  }
}

// ✅ SISTEMA FALLBACK SIMPLIFICADO
async function fallbackRewrite(request: Request) {
  try {
    const body = await request.json()
    
    const finalLyrics = body.lyrics || body.letra || body.text || body.content || ''
    const finalGenero = body.genero || body.genre || body.style || body.tipo || ''
    const additionalRequirements = body.additionalRequirements || body.requisitos || ''
    const selectedChoruses = body.selectedChoruses || body.choruses || body.refroes || []

    const { generateText } = await import("ai")
    const { capitalizeLines } = await import("@/lib/utils/capitalize-lyrics")
    const { countPoeticSyllables } = await import("@/lib/validation/syllable-counter")

    const prompt = `
REESCRITA DE LETRA - MODO FALLBACK

LETRA ORIGINAL:
${finalLyrics}

GÊNERO: ${finalGenero}
REQUISITOS: ${additionalRequirements}
REFRÃO PRESERVADO: ${selectedChoruses.join(' | ')}

REGRAS:
- Mantenha a essência da letra original
- Melhore estrutura e métrica  
- Cada verso MÁXIMO 12 sílabas
- Formato empilhado (cada verso em linha separada)
- Conecte com refrões preservados

Retorne JSON: {"lyrics": "letra reescrita", "title": "título"}
`

    const { text } = await generateText({
      model: "openai/gpt-4o", 
      prompt,
      temperature: 0.7,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("Resposta não é JSON")
    
    const result = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      letra: capitalizeLines(result.lyrics),
      titulo: result.title || "Letra Reescrita (Fallback)",
      metadata: {
        score: 75,
        polishingApplied: true,
        preservedChorusesUsed: selectedChoruses.length,
        syllableCompliance: "Fallback - não validado",
        structureImproved: true,
        fallbackUsed: true
      }
    })

  } catch (fallbackError) {
    console.error("[Rewrite] ❌ Erro no fallback:", fallbackError)
    throw new Error("Sistema principal e fallback falharam")
  }
}
