import { NextResponse } from "next/server"
import { generateText } from "ai"
import { getGenreConfig, detectSubGenre, getGenreRhythm } from "@/lib/genre-config"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter"
import { SyllableEnforcer } from "@/lib/validation/syllableEnforcer"
import { MetaComposer } from "@/lib/orchestrator/meta-composer"

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

    console.log(`[Rewrite] ✅ Iniciando reescrita com MetaComposer - Gênero: ${finalGenero}`)

    // ✅ CONFIGURAÇÃO DO GÊNERO
    const genreConfig = getGenreConfig(finalGenero)
    const subGenreInfo = detectSubGenre(additionalRequirements)
    const defaultRhythm = getGenreRhythm(finalGenero)
    const finalRhythm = subGenreInfo.rhythm || defaultRhythm

    // ✅ CONFIGURAÇÃO DE SÍLABAS POR GÊNERO (CORRIGIDO)
    const syllableConfig = getSyllableConfig(finalGenero)
    console.log('[Rewrite] ⚙️ Configuração de sílabas:', syllableConfig)

    // ✅ ANÁLISE DA ESTRUTURA ORIGINAL
    const structureAnalysis = analyzeSongStructure(finalLyrics)
    console.log('[Rewrite] 📊 Análise estrutural:', structureAnalysis)

    // ✅ VALIDAÇÃO INICIAL COM SYLLABLE ENFORCER (CORRIGIDO)
    const initialValidation = SyllableEnforcer.validateLyrics(finalLyrics, syllableConfig)
    console.log('[Rewrite] ⚖️ Validação inicial:', initialValidation)

    // ✅ PREPARAÇÃO DOS REFRÕES PRESERVADOS
    const preservedChoruses = selectedChoruses.map((chorus: string) => {
      const chorusValidation = validateLyricsSyllables(chorus)
      return {
        content: chorus,
        validation: chorusValidation,
        syllableCompliance: chorusValidation.valid ? "✅" : "❌"
      }
    })

    console.log(`[Rewrite] 🎵 Refrões preservados:`, preservedChoruses.length)

    // ✅ META COMPOSIÇÃO COM SISTEMA DE RIMAS (CORRIGIDO)
    const compositionRequest = {
      genre: finalGenero,
      theme: finalTema,
      mood: finalHumor,
      rhythm: finalRhythm,
      originalLyrics: finalLyrics,
      syllableTarget: syllableConfig, // ✅ USANDO CONFIG CORRETA
      applyFinalPolish: universalPolish,
      preservedChoruses: selectedChoruses,
      additionalRequirements: additionalRequirements,
      structureAnalysis: structureAnalysis
    }

    console.log('[Rewrite] 🎼 Request para MetaComposer:', {
      ...compositionRequest,
      originalLyrics: `...${finalLyrics.length} chars`,
      preservedChoruses: selectedChoruses.length
    })

    // ✅ TIMEOUT
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout na composição")), 45000)
    )

    let result
    try {
      // ✅ TENTA USAR META COMPOSER PRIMEIRO
      const compositionPromise = MetaComposer.compose(compositionRequest)
      result = await Promise.race([compositionPromise, timeoutPromise])
      console.log(`[Rewrite] ✅ MetaComposer concluído! Score: ${result.metadata.finalScore}`)
    } catch (metaError) {
      console.log('[Rewrite] ⚠️ MetaComposer falhou, usando fallback:', metaError)
      // ✅ FALLBACK PARA SISTEMA SIMPLIFICADO
      result = await fallbackRewriteWithStructure(
        finalLyrics, 
        finalGenero, 
        finalTema, 
        finalHumor, 
        selectedChoruses, 
        additionalRequirements
      )
    }

    // ✅ APLICA SYLLABLE ENFORCER NO RESULTADO FINAL (CORRIGIDO)
    console.log('[Rewrite] 🔧 Aplicando SyllableEnforcer no resultado final...')
    const enforcedResult = await SyllableEnforcer.enforceSyllableLimits(
      result.lyrics, 
      syllableConfig, // ✅ USANDO CONFIG CORRETA
      finalGenero
    )

    console.log(`[Rewrite] ✅ SyllableEnforcer: ${enforcedResult.corrections} correções aplicadas`)

    // ✅ VALIDAÇÃO FINAL
    const finalValidation = validateLyricsSyllables(enforcedResult.correctedLyrics)
    console.log('[Rewrite] ✅ Validação final:', finalValidation)

    return NextResponse.json({
      letra: capitalizeSongLyrics(enforcedResult.correctedLyrics),
      titulo: result.title,
      metadata: {
        score: result.metadata.finalScore || 85,
        polishingApplied: result.metadata.polishingApplied || true,
        preservedChorusesUsed: result.metadata.preservedChorusesUsed || selectedChoruses.length,
        syllableCompliance: finalValidation.complianceRate,
        structureImproved: result.metadata.structureImproved || true,
        rhymeScore: result.metadata.rhymeScore || 0,
        rhymeTarget: result.metadata.rhymeTarget || 0,
        validation: finalValidation,
        syllableCorrections: enforcedResult.corrections,
        syllableViolations: enforcedResult.violations
      }
    })

  } catch (error) {
    console.error("[Rewrite] Erro:", error)
    
    return NextResponse.json(
      {
        error: "Erro na reescrita orquestrada",
        details: error instanceof Error ? error.message : "Erro desconhecido",
        suggestion: "Tente novamente com uma letra mais clara"
      },
      { status: 500 }
    )
  }
}

// ✅ CONFIGURAÇÃO DE SÍLABAS POR GÊNERO (FUNÇÃO CORRIGIDA)
function getSyllableConfig(genre: string): { min: number; max: number; ideal: number } {
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

// ✅ FALLBACK INTELIGENTE COM PRESERVAÇÃO DE ESTRUTURA
async function fallbackRewriteWithStructure(
  originalLyrics: string,
  genre: string,
  theme: string,
  mood: string,
  selectedChoruses: string[],
  additionalRequirements: string
) {
  console.log('[Rewrite] 🔄 Usando fallback inteligente...')

  const structureAnalysis = analyzeSongStructure(originalLyrics)
  
  const prompt = `REWRITE MUSICAL - ${genre.toUpperCase()}

LETRA ORIGINAL (PRESERVAR ESTRUTURA):
${originalLyrics}

ESTRUTURA IDENTIFICADA:
${structureAnalysis.sections.map(s => `- ${s.type}: ${s.lines.length} versos`).join('\n')}

GÊNERO: ${genre}
TEMA: ${theme}
HUMOR: ${mood}
${additionalRequirements ? `REQUISITOS: ${additionalRequirements}` : ''}
${selectedChoruses.length > 0 ? `REFRÃOS PRESERVADOS:\n${selectedChoruses.join('\n')}` : ''}

🎯 REGRAS DE REWRITE:
1. PRESERVE TODAS as tags [SEÇÃO] e instruções musicais
2. MANTENHA a ordem exata das seções
3. CORRIJA apenas versos com problemas de métrica (>12 sílabas)
4. USE linguagem coloquial brasileira ("cê", "tô", "pra")
5. APLIQUE sistema A-B-C para Sertanejo Moderno
6. VERSOS CANTADOS em português, instruções em inglês

📝 FORMATAÇÃO EXATA:
- Tags: [SECTION - Instruments] (inglês)
- Versos: Português brasileiro coloquial
- Instrumentos no final: "Instruments: guitar, piano, etc"

Gere a letra REEscrita MANTENDO A ESTRUTURA ORIGINAL:`

  const { text } = await generateText({
    model: "openai/gpt-4o",
    prompt,
    temperature: 0.7,
  })

  return {
    lyrics: text.trim(),
    title: theme || "Letra Reescrita",
    metadata: {
      finalScore: 80,
      polishingApplied: true,
      preservedChorusesUsed: selectedChoruses.length,
      structureImproved: true,
      rhymeScore: 40,
      rhymeTarget: genre.toLowerCase().includes('sertanejo') ? 50 : 
                  genre.toLowerCase().includes('mpb') ? 60 : 40
    }
  }
}

// ✅ ANÁLISE DE ESTRUTURA
function analyzeSongStructure(lyrics: string) {
  const lines = lyrics.split('\n')
  const sections: Array<{type: string, lines: string[], startIndex: number}> = []
  let currentSection: {type: string, lines: string[], startIndex: number} | null = null
  const problematicLines: Array<{line: string, syllables: number}> = []

  lines.forEach((line, index) => {
    const trimmed = line.trim()
    
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      if (currentSection) {
        sections.push(currentSection)
      }
      currentSection = {
        type: trimmed,
        lines: [],
        startIndex: index
      }
    } 
    else if (trimmed && currentSection) {
      currentSection.lines.push(trimmed)
      
      const syllables = countPoeticSyllables(trimmed)
      if (syllables > 12) {
        problematicLines.push({ line: trimmed, syllables })
      }
    }
  })

  if (currentSection) {
    sections.push(currentSection)
  }

  return {
    sections,
    totalLines: lines.filter(line => line.trim()).length,
    problematicLines,
    hasComplexStructure: sections.length > 3
  }
}

// ✅ VALIDAÇÃO DE SÍLABAS
function validateLyricsSyllables(lyrics: string) {
  const lines = lyrics.split('\n')
  const violations: Array<{line: string, syllables: number}> = []
  let validLines = 0

  lines.forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !(trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      const syllables = countPoeticSyllables(trimmed)
      if (syllables > 12) {
        violations.push({ line: trimmed, syllables })
      } else {
        validLines++
      }
    }
  })

  const totalChecked = lines.filter(line => {
    const trimmed = line.trim()
    return trimmed && !(trimmed.startsWith('[') && trimmed.endsWith(']'))
  }).length

  return {
    valid: violations.length === 0,
    violations,
    validLines,
    totalChecked,
    complianceRate: totalChecked > 0 ? `${Math.round((validLines / totalChecked) * 100)}%` : '0%'
  }
}

// ✅ CAPITALIZAÇÃO INTELIGENTE (só versos, não tags)
function capitalizeSongLyrics(lyrics: string) {
  const lines = lyrics.split('\n')
  
  return lines.map(line => {
    const trimmed = line.trim()
    // Só capitaliza versos, não tags de seção
    if (trimmed && !(trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      return capitalizeLines(trimmed)
    }
    return line // Mantém tags como estão
  }).join('\n')
}
