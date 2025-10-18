import { NextResponse } from "next/server"
import { generateText } from "ai"
import { getGenreConfig, detectSubGenre, getGenreRhythm } from "@/lib/genre-config"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log('🎵 [Create-Song] Parâmetros recebidos:', {
      genero: body.genero,
      tema: body.tema,
      humor: body.humor,
      additionalRequirements: body.additionalRequirements ? '✅' : '❌',
      includeChorus: body.includeChorus !== false,
      includeHook: body.includeHook !== false
    })

    const {
      genero,
      humor,
      tema,
      additionalRequirements = "",
      includeChorus = true,
      includeHook = true,
      universalPolish = true,
    } = body

    // ✅ VALIDAÇÃO
    if (!genero || !genero.trim()) {
      return NextResponse.json({ 
        error: "Gênero é obrigatório",
        suggestion: "Selecione um gênero musical"
      }, { status: 400 })
    }

    if (!tema || !tema.trim()) {
      return NextResponse.json({ 
        error: "Tema é obrigatório", 
        suggestion: "Digite um tema para inspirar a música"
      }, { status: 400 })
    }

    // ✅ CONFIGURAÇÃO DO GÊNERO
    const genreConfig = getGenreConfig(genero)
    const subGenreInfo = detectSubGenre(additionalRequirements)
    const defaultRhythm = getGenreRhythm(genero)
    const finalRhythm = subGenreInfo.rhythm || defaultRhythm
    const syllableConfig = getSyllableConfig(genero)

    console.log(`[Create-Song] Config: ${genero} | ${finalRhythm} | ${syllableConfig.min}-${syllableConfig.max}s`)

    // ✅ ETAPA 1: GERAR REFRÃO PRIMEIRO (SE SOLICITADO)
    let generatedChorus = null
    if (includeChorus) {
      console.log('[Create-Song] 🎵 Gerando refrão...')
      generatedChorus = await generateChorus({
        genre: genero,
        theme: tema,
        mood: humor,
        additionalRequirements: additionalRequirements
      })
    }

    // ✅ ETAPA 2: GERAR HOOK (SE SOLICITADO)
    let generatedHook = null
    if (includeHook) {
      console.log('[Create-Song] 🎣 Gerando hook...')
      generatedHook = await generateHook({
        genre: genero,
        theme: tema,
        mood: humor,
        additionalRequirements: additionalRequirements
      })
    }

    // ✅ ETAPA 3: CRIAR MÚSICA COMPLETA COM OS ELEMENTOS
    console.log('[Create-Song] 🎼 Criando música completa...')
    const completeSong = await generateCompleteSong({
      genre: genero,
      theme: tema,
      mood: humor,
      additionalRequirements: additionalRequirements,
      syllableConfig: syllableConfig,
      rhythm: finalRhythm,
      generatedChorus: generatedChorus,
      generatedHook: generatedHook
    })

    // ✅ ETAPA 4: LIMPEZA E FORMATAÇÃO
    console.log('[Create-Song] 🧹 Limpando e formatando letra...')
    let cleanedLyrics = cleanLyrics(completeSong)
    
    // ✅ ETAPA 5: APLICAR POLIMENTO FINAL (APENAS NOS VERSOS)
    let finalLyrics = cleanedLyrics
    if (universalPolish) {
      console.log('[Create-Song] ✨ Aplicando polimento final...')
      finalLyrics = await applyFinalPolish(finalLyrics, genero, syllableConfig)
    }

    finalLyrics = capitalizeLines(finalLyrics)

    // ✅ METADADOS COMPLETOS COM VALIDAÇÃO CORRETA
    const validation = validateLyrics(finalLyrics, syllableConfig)
    
    const metadata = {
      score: calculateSongScore(finalLyrics, syllableConfig),
      structure: "Completa (Intro-Verse-Chorus-Bridge-Outro)",
      syllableCompliance: validation.complianceRate,
      validation: validation,
      genre: genero,
      rhythm: finalRhythm,
      includes: {
        chorus: includeChorus,
        hook: includeHook,
        chorusVariations: generatedChorus?.variations?.length || 0,
        hookVariations: generatedHook?.variations?.length || 0
      }
    }

    console.log(`[Create-Song] ✅ Música criada! Score: ${metadata.score}`)
    console.log(`[Create-Song] 📊 Validação: ${validation.complianceRate} compliance`)

    return NextResponse.json({
      letra: finalLyrics,
      titulo: extractTitle(finalLyrics, tema),
      metadata: metadata,
      elements: {
        chorus: generatedChorus,
        hook: generatedHook
      }
    })
    
  } catch (error) {
    console.error("[Create-Song] Erro:", error)

    return NextResponse.json(
      {
        error: "Erro ao criar música",
        details: error instanceof Error ? error.message : "Erro desconhecido",
        suggestion: "Tente novamente com um tema diferente"
      },
      { status: 500 }
    )
  }
}

// ✅ LIMPEZA INTELIGENTE DA LETRA
function cleanLyrics(lyrics: string): string {
  const lines = lyrics.split('\n')
  const cleanedLines: string[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // ❌ REMOVE: Linhas que são comentários ou instruções da IA
    if (
      // Comentários da IA
      trimmed.startsWith('Claro!') ||
      trimmed.startsWith('Aqui está') ||
      trimmed.startsWith('🎵') ||
      trimmed.includes('Gênero:') ||
      trimmed.includes('Sílaba') ||
      trimmed.includes('sílabas') ||
      // Linhas de correção
      trimmed.includes('frase corrigida') ||
      trimmed.match(/^\d+sílabas/) ||
      // Emojis isolados
      trimmed.match(/^[🎵🎼🎤🎹🎸🥁]\s*/) ||
      // Linhas vazias ou apenas pontuação
      !trimmed ||
      trimmed === '---' ||
      trimmed === '**Instrumentos:**' ||
      trimmed === '---'
    ) {
      continue // Remove a linha completamente
    }
    
    // ✅ MANTÉM: Linhas normais da música
    cleanedLines.push(line)
  }
  
  return cleanedLines.join('\n').trim()
}

// ✅ VALIDAÇÃO INTELIGENTE - SÓ CONTA VERSOS REAIS
function validateLyrics(lyrics: string, syllableConfig: { min: number; max: number; ideal: number }) {
  const lines = lyrics.split('\n')
  const validation = {
    totalLines: 0,
    analyzedLines: 0,
    compliantLines: 0,
    violations: [] as Array<{line: string, syllables: number}>,
    complianceRate: "0%"
  }

  for (const line of lines) {
    const trimmed = line.trim()
    validation.totalLines++

    // ✅ SÓ ANALISA LINHAS QUE SÃO VERSOS CANTADOS
    if (isLyricLine(trimmed)) {
      validation.analyzedLines++
      const syllables = countPoeticSyllables(trimmed)
      
      if (syllables >= syllableConfig.min && syllables <= syllableConfig.max) {
        validation.compliantLines++
      } else {
        validation.violations.push({ line: trimmed, syllables })
      }
    }
  }

  validation.complianceRate = validation.analyzedLines > 0 
    ? `${Math.round((validation.compliantLines / validation.analyzedLines) * 100)}%` 
    : "0%"

  return validation
}

// ✅ VERIFICA SE É UMA LINHA DE VERSO (NÃO TAG/INSTRUÇÃO)
function isLyricLine(line: string): boolean {
  const trimmed = line.trim()
  
  // ❌ NÃO É VERSO SE:
  if (
    !trimmed || // Linha vazia
    trimmed.startsWith('[') || // [INTRO], [VERSE], etc.
    trimmed.startsWith('(') || // (Violão dedilhado)
    trimmed.includes('Instruments:') || // Lista de instrumentos
    trimmed.includes('Instrumentos:') || // Lista de instrumentos
    trimmed.startsWith('---') || // Separadores
    trimmed.match(/^[🎵🎼🎤🎹🎸🥁]/) || // Emojis musicais
    trimmed.match(/^[0-9]+ª?/) || // Números (1., 2., etc.)
    trimmed.includes('**') // Markdown bold
  ) {
    return false
  }
  
  // ✅ É VERSO SE:
  // - Tem texto normal
  // - Não é tag/instrução
  // - Não é formatação especial
  return true
}

// ✅ POLIMENTO FINAL INTELIGENTE (SÓ NOS VERSOS)
async function applyFinalPolish(lyrics: string, genre: string, syllableConfig: { min: number; max: number; ideal: number }) {
  const lines = lyrics.split('\n')
  const polishedLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    
    // ✅ PRESERVA TAGS, INSTRUÇÕES E FORMATAÇÃO
    if (!isLyricLine(trimmed)) {
      polishedLines.push(line)
      continue
    }
    
    // ✅ SÓ CORRIGE VERSOS COM PROBLEMAS DE SÍLABAS
    const syllables = countPoeticSyllables(trimmed)
    if (syllables > syllableConfig.max) {
      try {
        const corrected = await correctLine(trimmed, syllableConfig.ideal, genre)
        polishedLines.push(corrected)
        console.log(`[Polish] Corrigido: "${trimmed}" (${syllables}s) → "${corrected}" (${countPoeticSyllables(corrected)}s)`)
      } catch (error) {
        polishedLines.push(line) // Mantém original se falhar
      }
    } else {
      polishedLines.push(line)
    }
  }
  
  let polishedLyrics = polishedLines.join('\n')
  
  // ✅ GARANTE INSTRUMENTOS NO FINAL
  if (!polishedLyrics.includes("(Instruments:") && !polishedLyrics.includes("(Instrumentos:")) {
    const instruments = getGenreInstruments(genre)
    polishedLyrics += `\n\n(Instruments: ${instruments})`
  }
  
  return polishedLyrics
}

// ✅ CORREÇÃO DE LINHA (SEM COMENTÁRIOS)
async function correctLine(line: string, targetSyllables: number, genre: string): Promise<string> {
  const prompt = `CORREÇÃO SILENCIOSA - ${genre.toUpperCase()}

LINHA: "${line}"
SÍLABAS ATUAIS: ${countPoeticSyllables(line)}
ALVO: ${targetSyllables} sílabas

REESCREVA APENAS A LINHA para ter ${targetSyllables} sílabas, mantendo significado e estilo ${genre}.

RETORNE APENAS A LINHA CORRIGIDA, SEM COMENTÁRIOS:`

  const { text } = await generateText({
    model: "openai/gpt-4o-mini",
    prompt,
    temperature: 0.3,
    maxTokens: 30
  })

  // ✅ LIMPA QUALQUER COMENTÁRIO QUE A IA POSSA ADICIONAR
  const cleaned = text.trim()
    .replace(/^["']|["']$/g, '') // Remove aspas
    .replace(/^🎵\s*/, '') // Remove emojis
    .replace(/^.*?:/, '') // Remove prefixos como "Corrigido:"
    .split('\n')[0] // Pega apenas a primeira linha

  return cleaned || line
}

// ✅ FUNÇÕES RESTANTES (MANTIDAS)
async function generateChorus(params: { genre: string; theme: string; mood?: string; additionalRequirements?: string }) {
  const prompt = `CRIAÇÃO DE REFRÃO ORIGINAL - ${params.genre.toUpperCase()}

TEMA: ${params.theme}
HUMOR: ${params.mood || "adaptável"}
${params.additionalRequirements ? `REQUISITOS: ${params.additionalRequirements}` : ''}

Crie 3 variações de REFRÃO ORIGINAL (4 linhas cada, máximo 12 sílabas por linha).

RETORNE APENAS JSON:
{
  "variations": [
    {
      "chorus": "Linha 1\\nLinha 2\\nLinha 3\\nLinha 4",
      "style": "Estilo",
      "score": 9
    }
  ],
  "bestOptionIndex": 0
}`

  const { text } = await generateText({ model: "openai/gpt-4o", prompt, temperature: 0.8 })
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  return jsonMatch ? JSON.parse(jsonMatch[0]) : null
}

async function generateHook(params: { genre: string; theme: string; mood?: string; additionalRequirements?: string }) {
  const prompt = `CRIAÇÃO DE HOOK - ${params.genre.toUpperCase()}

TEMA: ${params.theme}
${params.additionalRequirements ? `REQUISITOS: ${params.additionalRequirements}` : ''}

Crie 3 hooks (1 linha cada, máximo 12 sílabas).

RETORNE APENAS JSON:
{
  "variations": [
    {
      "hook": "Frase do hook",
      "style": "Estilo", 
      "score": 9
    }
  ],
  "bestOptionIndex": 0
}`

  const { text } = await generateText({ model: "openai/gpt-4o", prompt, temperature: 0.9 })
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  return jsonMatch ? JSON.parse(jsonMatch[0]) : null
}

async function generateCompleteSong(params: { genre: string; theme: string; mood?: string; additionalRequirements?: string; syllableConfig: any; rhythm: string; generatedChorus?: any; generatedHook?: any }) {
  const chorusContext = params.generatedChorus ? `REFRÃO SUGERIDO: ${params.generatedChorus.variations?.[0]?.chorus}` : ''
  const hookContext = params.generatedHook ? `HOOK SUGERIDO: ${params.generatedHook.variations?.[0]?.hook}` : ''

  const prompt = `CRIE MÚSICA ${params.genre.toUpperCase()} SOBRE: ${params.theme}

${params.additionalRequirements ? `REQUISITOS: ${params.additionalRequirements}` : ''}
${chorusContext}
${hookContext}

ESTRUTURA: [INTRO] → [VERSE 1] → [PRE-CHORUS] → [CHORUS] → [VERSE 2] → [CHORUS] → [BRIDGE] → [CHORUS] → [OUTRO]

RETORNE APENAS A LETRA, SEM COMENTÁRIOS:`

  const { text } = await generateText({ model: "openai/gpt-4o", prompt, temperature: 0.7 })
  return text.trim()
}

function calculateSongScore(lyrics: string, syllableConfig: { min: number; max: number; ideal: number }): number {
  const validation = validateLyrics(lyrics, syllableConfig)
  if (validation.analyzedLines === 0) return 75
  const complianceRate = validation.compliantLines / validation.analyzedLines
  return Math.min(95, 70 + (complianceRate * 25))
}

function extractTitle(lyrics: string, theme: string): string {
  const lines = lyrics.split('\n')
  for (const line of lines) {
    if (isLyricLine(line) && line.trim()) {
      return line.trim().split(' ').slice(0, 4).join(' ')
    }
  }
  return theme || "Nova Música"
}

function getSyllableConfig(genre: string) {
  const configs = {
    "Sertanejo": { min: 9, max: 11, ideal: 10 },
    "MPB": { min: 7, max: 12, ideal: 9 },
    "Funk": { min: 6, max: 10, ideal: 8 },
    "default": { min: 7, max: 11, ideal: 9 }
  }
  return configs[genre] || configs.default
}

function getGenreInstruments(genre: string): string {
  const instruments = {
    "Sertanejo": "acoustic guitar, viola, bass, drums, accordion",
    "MPB": "nylon guitar, piano, bass, light percussion", 
    "Funk": "drum machine, synth bass, samples, electronic beats",
    "default": "guitar, bass, drums, keyboard"
  }
  return instruments[genre] || instruments.default
}
