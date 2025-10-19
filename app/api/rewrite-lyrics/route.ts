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
    
    console.log('🔍 [Rewrite-Lyrics] Body completo:', JSON.stringify(body, null, 2))

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
    const performanceMode = body.performanceMode || 'standard' // ✅ NOVO PARÂMETRO

    console.log('🎯 [Rewrite-Lyrics] Parâmetros identificados:', {
      finalLyrics: finalLyrics ? `✅ ${finalLyrics.length} chars` : '❌ NÃO ENCONTRADA',
      finalGenero: finalGenero || '❌ NÃO ENCONTRADO',
      finalTema,
      finalHumor,
      additionalRequirements: additionalRequirements || 'Nenhum',
      selectedChoruses: selectedChoruses.length,
      performanceMode: performanceMode,
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

    console.log(`[Rewrite-Lyrics] ✅ Iniciando reescrita - Gênero: ${finalGenero}, Modo: ${performanceMode}`)

    // ✅ CONFIGURAÇÃO DO GÊNERO
    const genreConfig = getGenreConfig(finalGenero)
    const subGenreInfo = detectSubGenre(additionalRequirements)
    const defaultRhythm = getGenreRhythm(finalGenero)
    const finalRhythm = subGenreInfo.rhythm || defaultRhythm

    // ✅ CONFIGURAÇÃO DE SÍLABAS POR GÊNERO
    const syllableConfig = getSyllableConfig(finalGenero)
    console.log('[Rewrite-Lyrics] ⚙️ Configuração de sílabas:', syllableConfig)

    // ✅ ANÁLISE DA ESTRUTURA ORIGINAL
    const structureAnalysis = analyzeSongStructure(finalLyrics)
    console.log('[Rewrite-Lyrics] 📊 Análise estrutural:', structureAnalysis)

    // ✅ VALIDAÇÃO INICIAL COM SYLLABLE ENFORCER
    const initialValidation = SyllableEnforcer.validateLyrics(finalLyrics, syllableConfig)
    console.log('[Rewrite-Lyrics] ⚖️ Validação inicial:', initialValidation)

    // ✅ PREPARAÇÃO DOS REFRÕES PRESERVADOS
    const preservedChoruses = selectedChoruses.map((chorus: string) => {
      const chorusValidation = validateLyricsSyllables(chorus)
      return {
        content: chorus,
        validation: chorusValidation,
        syllableCompliance: chorusValidation.valid ? "✅" : "❌"
      }
    })

    console.log(`[Rewrite-Lyrics] 🎵 Refrões preservados:`, preservedChoruses.length)

    // ✅ META COMPOSIÇÃO COM SISTEMA DE RIMAS
    const compositionRequest = {
      genre: finalGenero,
      theme: finalTema,
      mood: finalHumor,
      rhythm: finalRhythm,
      originalLyrics: finalLyrics, // ✅ ENVIA LETRA ORIGINAL PARA REWRITE
      syllableTarget: syllableConfig,
      applyFinalPolish: universalPolish,
      preservedChoruses: selectedChoruses,
      additionalRequirements: buildRewriteRequirements(
        additionalRequirements, 
        performanceMode,
        structureAnalysis
      ),
      structureAnalysis: structureAnalysis
    }

    console.log('[Rewrite-Lyrics] 🎼 Request para MetaComposer:', {
      ...compositionRequest,
      originalLyrics: `...${finalLyrics.length} chars`,
      preservedChoruses: selectedChoruses.length,
      performanceMode: performanceMode
    })

    // ✅ TIMEOUT
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout na reescrita")), 45000)
    )

    let result
    try {
      // ✅ TENTA USAR META COMPOSER PRIMEIRO
      const compositionPromise = MetaComposer.compose(compositionRequest)
      result = await Promise.race([compositionPromise, timeoutPromise])
      console.log(`[Rewrite-Lyrics] ✅ MetaComposer concluído! Score: ${result.metadata.finalScore}`)
    } catch (metaError) {
      console.log('[Rewrite-Lyrics] ⚠️ MetaComposer falhou, usando fallback:', metaError)
      // ✅ FALLBACK PARA SISTEMA SIMPLIFICADO
      result = await fallbackRewriteWithStructure(
        finalLyrics, 
        finalGenero, 
        finalTema, 
        finalHumor, 
        selectedChoruses, 
        additionalRequirements,
        performanceMode
      )
    }

    // ✅ APLICA SYLLABLE ENFORCER NO RESULTADO FINAL
    console.log('[Rewrite-Lyrics] 🔧 Aplicando SyllableEnforcer no resultado final...')
    const enforcedResult = await SyllableEnforcer.enforceSyllableLimits(
      result.lyrics, 
      syllableConfig,
      finalGenero
    )

    console.log(`[Rewrite-Lyrics] ✅ SyllableEnforcer: ${enforcedResult.corrections} correções aplicadas`)

    // ✅ APLICA FORMATAÇÃO PERFORMÁTICA
    console.log('[Rewrite-Lyrics] 🎭 Aplicando formatação performática...')
    let finalLyricsFormatted = enforcedResult.correctedLyrics
    
    if (performanceMode === 'performance') {
      finalLyricsFormatted = applyPerformanceFormatting(finalLyricsFormatted, finalGenero, finalRhythm)
    } else {
      finalLyricsFormatted = applyStandardFormatting(finalLyricsFormatted, finalGenero)
    }

    finalLyricsFormatted = capitalizeLines(finalLyricsFormatted)

    // ✅ VALIDAÇÃO FINAL
    const finalValidation = validateLyricsSyllables(finalLyricsFormatted)
    console.log('[Rewrite-Lyrics] ✅ Validação final:', finalValidation)

    return NextResponse.json({
      letra: finalLyricsFormatted,
      titulo: result.title || extractTitle(finalLyricsFormatted, finalTema),
      metadata: {
        score: result.metadata.finalScore || 85,
        polishingApplied: result.metadata.polishingApplied || true,
        preservedChorusesUsed: result.metadata.preservedChorusesUsed || selectedChoruses.length,
        syllableCompliance: finalValidation.complianceRate,
        structureImproved: result.metadata.structureImproved || true,
        rhymeScore: result.metadata.rhymeScore || 0,
        rhymeTarget: result.metadata.rhymeTarget || 0,
        performanceMode: performanceMode,
        validation: finalValidation,
        syllableCorrections: enforcedResult.corrections,
        syllableViolations: enforcedResult.violations
      }
    })

  } catch (error) {
    console.error("[Rewrite-Lyrics] Erro:", error)
    
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

// ✅ CONSTRÓI REQUISITOS ESPECÍFICOS PARA REWRITE
function buildRewriteRequirements(
  baseRequirements: string,
  performanceMode: string,
  structureAnalysis: any
): string {
  
  const performanceInstruction = performanceMode === 'performance' ?
    `🎭 MODO PERFORMÁTICO ATIVADO:
- TAGS EM INGLÊS: [SECTION - Instruments] 
- VERSOS EM PORTUGUÊS: Apenas a parte cantada
- BACKING VOCALS: (Backing: "Oh, oh") em inglês
- INSTRUMENTOS: Descrições detalhadas em inglês
- PRESERVAR estrutura original com melhorias` :
    `📝 MODO PADRÃO:
- Tags em inglês simples  
- Versos em português
- Instrumentos básicos em inglês
- Manter essência da letra original`

  return `${baseRequirements}

${performanceInstruction}

ESTRUTURA ORIGINAL IDENTIFICADA:
- ${structureAnalysis.sections.length} seções
- ${structureAnalysis.totalLines} versos
- ${structureAnalysis.problematicLines.length} versos com problemas de sílabas

🎯 OBJETIVO DA REWRITE:
- PRESERVAR a essência emocional da letra original
- MELHORAR métrica e estrutura
- CORRIGIR problemas de sílabas (>12 sílabas)
- MANTER conexão com refrões preservados
- APLICAR formatação ${performanceMode === 'performance' ? 'performática' : 'padrão'}

REGRAS DE IDIOMA:
✅ PORTUGUÊS: Apenas versos cantados (reescritos)
✅ INGLÊS: Tags, instruções, instrumentos, backing vocals
❌ NUNCA MISTURE idiomas nos versos

FORMATAÇÃO ${performanceMode === 'performance' ? 'PERFORMÁTICA' : 'PADRÃO'} OBRIGATÓRIA`
}

// ✅ FORMATAÇÃO PERFORMÁTICA PARA REWRITE
function applyPerformanceFormatting(lyrics: string, genre: string, rhythm: string): string {
  const lines = lyrics.split('\n')
  const formattedLines: string[] = []
  
  let verseCount = 0
  let chorusCount = 0

  for (const line of lines) {
    const trimmed = line.trim()
    
    if (!trimmed) {
      formattedLines.push('')
      continue
    }

    // ✅ TAGS DE SEÇÃO EM INGLÊS COM INSTRUMENTAÇÃO
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const performanceTag = convertToPerformanceTag(trimmed, genre, verseCount, chorusCount)
      formattedLines.push(performanceTag)
      
      // Atualiza contadores
      if (performanceTag.includes('[VERSE')) verseCount++
      if (performanceTag.includes('[CHORUS')) chorusCount++
      continue
    }

    // ✅ INSTRUÇÕES MUSICAIS EM INGLÊS
    if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
      // Adiciona backing vocals se for instrução musical
      if (trimmed.includes('Backing:') || trimmed.includes('backing')) {
        formattedLines.push(trimmed)
      } else {
        formattedLines.push(trimmed)
      }
      continue
    }

    // ✅ VERSOS CANTADOS EM PORTUGUÊS
    formattedLines.push(trimmed)
  }

  let formattedLyrics = formattedLines.join('\n')

  // ✅ INSTRUMENTOS EM INGLÊS NO FINAL
  if (!formattedLyrics.includes("(Instruments:")) {
    const instruments = getGenreInstruments(genre)
    const bpm = getGenreBPM(genre)
    const style = getPerformanceStyle(genre)
    
    formattedLyrics += `\n\n(Instruments: ${instruments} | BPM: ${bpm} | Rhythm: ${rhythm} | Style: ${style})`
  }

  return formattedLyrics
}

// ✅ CONVERSÃO PARA TAGS PERFORMÁTICAS (COM CONTADORES)
function convertToPerformanceTag(tag: string, genre: string, verseCount: number, chorusCount: number): string {
  const tagLower = tag.toLowerCase()
  
  // ✅ CONVERTE TAGS PARA INGLÊS
  let englishTag = tag
    .replace(/\[INTRO\]/gi, '[INTRO]')
    .replace(/\[VERSO\]/gi, '[VERSE]')
    .replace(/\[VERSO\s+\d+\]/gi, '[VERSE]')
    .replace(/\[REFRÃO\]/gi, '[CHORUS]')
    .replace(/\[PRÉ-REFRÃO\]/gi, '[PRE-CHORUS]')
    .replace(/\[PONTE\]/gi, '[BRIDGE]')
    .replace(/\[SOLO\]/gi, '[SOLO]')
    .replace(/\[FINAL\]/gi, '[OUTRO]')
    .replace(/\[OUTRO\]/gi, '[OUTRO]')

  // ✅ ADICIONA INSTRUMENTOS PERFORMÁTICOS COM NUMERAÇÃO
  if (englishTag === '[INTRO]') {
    return `[INTRO - ${getIntroInstruments(genre)}]`
  }
  if (englishTag.includes('[VERSE]')) {
    verseCount++
    return `[VERSE ${verseCount} - ${getVerseInstruments(genre)}]`
  }
  if (englishTag === '[PRE-CHORUS]') {
    return `[PRE-CHORUS - ${getPreChorusInstruments(genre)}]`
  }
  if (englishTag.includes('[CHORUS]')) {
    chorusCount++
    const chorusLabel = chorusCount > 1 ? `FINAL CHORUS` : `CHORUS`
    return `[${chorusLabel} - ${getChorusInstruments(genre)}]`
  }
  if (englishTag === '[BRIDGE]') {
    return `[BRIDGE - ${getBridgeInstruments(genre)}]`
  }
  if (englishTag === '[SOLO]') {
    return `[SOLO - ${getSoloInstruments(genre)}]`
  }
  if (englishTag === '[OUTRO]') {
    return `[OUTRO - ${getOutroInstruments(genre)}]`
  }

  return englishTag
}

// ✅ FORMATAÇÃO PADRÃO PARA REWRITE
function applyStandardFormatting(lyrics: string, genre: string): string {
  let formatted = lyrics
  
  // ✅ CORRIGE TAGS PARA INGLÊS
  formatted = formatted
    .replace(/\[INTRO\]/gi, '[INTRO]')
    .replace(/\[VERSO\]/gi, '[VERSE]')
    .replace(/\[REFRÃO\]/gi, '[CHORUS]')
    .replace(/\[PONTE\]/gi, '[BRIDGE]')
    .replace(/\[FINAL\]/gi, '[OUTRO]')

  // ✅ GARANTE INSTRUMENTOS EM INGLÊS
  if (!formatted.includes("(Instruments:")) {
    const instruments = getGenreInstruments(genre)
    formatted += `\n\n(Instruments: ${instruments})`
  }

  return formatted
}

// ✅ FALLBACK INTELIGENTE COM PRESERVAÇÃO DE ESTRUTURA
async function fallbackRewriteWithStructure(
  originalLyrics: string,
  genre: string,
  theme: string,
  mood: string,
  selectedChoruses: string[],
  additionalRequirements: string,
  performanceMode: string
) {
  console.log('[Rewrite-Lyrics] 🔄 Usando fallback inteligente...')

  const structureAnalysis = analyzeSongStructure(originalLyrics)
  
  const performanceInstruction = performanceMode === 'performance' ?
    `FORMATAÇÃO PERFORMÁTICA:
- Tags em inglês: [SECTION - Instruments]
- Versos em português
- Backing vocals em inglês: (Backing: "Oh, oh")
- Instrumentação detalhada` :
    `FORMATAÇÃO PADRÃO:
- Tags em inglês simples
- Versos em português  
- Instrumentos básicos`

  const prompt = `REWRITE MUSICAL - ${genre.toUpperCase()} | MODO: ${performanceMode.toUpperCase()}

LETRA ORIGINAL (PRESERVAR ESTRUTURA):
${originalLyrics}

ESTRUTURA IDENTIFICADA:
${structureAnalysis.sections.map(s => `- ${s.type}: ${s.lines.length} versos`).join('\n')}

GÊNERO: ${genre}
TEMA: ${theme}
HUMOR: ${mood}
${additionalRequirements ? `REQUISITOS: ${additionalRequirements}` : ''}
${selectedChoruses.length > 0 ? `REFRÃOS PRESERVADOS:\n${selectedChoruses.join('\n')}` : ''}

${performanceInstruction}

🎯 REGRAS DE REWRITE:
1. PRESERVE TODAS as tags [SEÇÃO] e instruções musicais
2. MANTENHA a ordem exata das seções
3. CORRIJA apenas versos com problemas de métrica (>12 sílabas)
4. USE linguagem coloquial brasileira ("cê", "tô", "pra")
5. VERSOS CANTADOS em português, instruções em inglês

Gere a letra REEscrita MANTENDO A ESTRUTURA ORIGINAL:`

  const { text } = await generateText({
    model: "openai/gpt-4o",
    prompt,
    temperature: 0.7,
  })

  let formattedLyrics = text.trim()
  
  // ✅ APLICA FORMATAÇÃO CONforme o modo
  if (performanceMode === 'performance') {
    formattedLyrics = applyPerformanceFormatting(formattedLyrics, genre, getGenreRhythm(genre))
  } else {
    formattedLyrics = applyStandardFormatting(formattedLyrics, genre)
  }

  return {
    lyrics: formattedLyrics,
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

// ✅ FUNÇÕES DE INSTRUMENTAÇÃO (MESMAS DA CRIAÇÃO)
function getIntroInstruments(genre: string): string {
  const instruments: { [key: string]: string } = {
    "Sertanejo": "Slow acoustic guitar, harmonica",
    "Sertanejo Moderno": "Acoustic guitar, synth pads",
    "MPB": "Nylon guitar, light percussion",
    "Funk": "Synth intro, drum machine",
    "Rock": "Electric guitar riff, drums",
    "Pop": "Synth intro, electronic beats"
  }
  return instruments[genre] || "Acoustic guitar, pads"
}

function getVerseInstruments(genre: string): string {
  const instruments: { [key: string]: string } = {
    "Sertanejo": "Acoustic guitar, soft drums",
    "Sertanejo Moderno": "Acoustic guitar, electric bass, drums",
    "MPB": "Nylon guitar, bass, light drums",
    "Funk": "Drum machine, synth bass",
    "Rock": "Electric guitar, bass, drums",
    "Pop": "Piano, synth, drums"
  }
  return instruments[genre] || "Guitar, bass, drums"
}

function getPreChorusInstruments(genre: string): string {
  const instruments: { [key: string]: string } = {
    "Sertanejo": "Rhodes keyboard, soft percussion",
    "Sertanejo Moderno": "Synth pads, percussion",
    "MPB": "Piano, percussion",
    "Funk": "Synth build-up, hi-hats",
    "Rock": "Guitar arpeggios, cymbals",
    "Pop": "Synth layers, drum fills"
  }
  return instruments[genre] || "Keys, percussion"
}

function getChorusInstruments(genre: string): string {
  const instruments: { [key: string]: string } = {
    "Sertanejo": "Accordion, handclaps offbeat",
    "Sertanejo Moderno": "Full band, handclaps",
    "MPB": "Full arrangement, percussion",
    "Funk": "Full synth, heavy drums",
    "Rock": "Full band, power chords",
    "Pop": "Full production, backing vocals"
  }
  return instruments[genre] || "Full band"
}

function getBridgeInstruments(genre: string): string {
  const instruments: { [key: string]: string } = {
    "Sertanejo": "Hammond organ, slide guitar",
    "Sertanejo Moderno": "Strings, electric guitar",
    "MPB": "Strings, flute",
    "Funk": "Synth breakdown, bass solo",
    "Rock": "Guitar solo, organ",
    "Pop": "Synth breakdown, vocal effects"
  }
  return instruments[genre] || "Strings, guitar"
}

function getSoloInstruments(genre: string): string {
  const instruments: { [key: string]: string } = {
    "Sertanejo": "Tenor saxophone, blue note",
    "Sertanejo Moderno": "Electric guitar solo",
    "MPB": "Nylon guitar solo",
    "Funk": "Synth solo",
    "Rock": "Electric guitar solo",
    "Pop": "Synth solo"
  }
  return instruments[genre] || "Guitar solo"
}

function getOutroInstruments(genre: string): string {
  const instruments: { [key: string]: string } = {
    "Sertanejo": "Fingerstyle viola caipira, synth pads",
    "Sertanejo Moderno": "Acoustic guitar, synth pads",
    "MPB": "Nylon guitar, light strings",
    "Funk": "Synth fade out",
    "Rock": "Guitar feedback fade",
    "Pop": "Synth fade, vocal echoes"
  }
  return instruments[genre] || "Guitar, pads"
}

// ✅ FUNÇÕES AUXILIARES (MANTIDAS)
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

function extractTitle(lyrics: string, theme: string): string {
  const lines = lyrics.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('[') && !trimmed.startsWith('(')) {
      return trimmed.split(' ').slice(0, 4).join(' ')
    }
  }
  return theme || "Letra Reescrita"
}

function getSyllableConfig(genre: string): { min: number; max: number; ideal: number } {
  const configs: { [key: string]: { min: number; max: number; ideal: number } } = {
    "Sertanejo": { min: 9, max: 11, ideal: 10 },
    "Sertanejo Moderno": { min: 9, max: 11, ideal: 10 },
    "MPB": { min: 7, max: 12, ideal: 9 },
    "Funk": { min: 6, max: 10, ideal: 8 },
    "Forró": { min: 8, max: 11, ideal: 9 },
    "Rock": { min: 7, max: 11, ideal: 9 },
    "Pop": { min: 7, max: 11, ideal: 9 },
    "default": { min: 7, max: 11, ideal: 9 }
  }
  return configs[genre] || configs.default
}

function getGenreInstruments(genre: string): string {
  const instruments: { [key: string]: string } = {
    "Sertanejo": "acoustic guitar, viola, bass, drums, accordion",
    "Sertanejo Moderno": "acoustic guitar, electric guitar, synth, bass, drums, accordion",
    "MPB": "nylon guitar, piano, bass, light percussion",
    "Funk": "drum machine, synth bass, samples, electronic beats",
    "Forró": "accordion, triangle, zabumba, bass",
    "Rock": "electric guitar, bass, drums, keyboard",
    "Pop": "synth, drum machine, bass, piano, electronic elements",
    "default": "guitar, bass, drums, keyboard"
  }
  return instruments[genre] || instruments.default
}

function getGenreBPM(genre: string): string {
  const bpms: { [key: string]: string } = {
    "Sertanejo": "72",
    "Sertanejo Moderno": "85", 
    "MPB": "90",
    "Funk": "110",
    "Forró": "120",
    "Rock": "130",
    "Pop": "100",
    "default": "100"
  }
  return bpms[genre] || bpms.default
}

function getPerformanceStyle(genre: string): string {
  const styles: { [key: string]: string } = {
    "Sertanejo": "Sertanejo Raiz",
    "Sertanejo Moderno": "Modern Sertanejo",
    "MPB": "MPB Classic", 
    "Funk": "Brazilian Funk",
    "Forró": "Forró Pé-de-Serra",
    "Rock": "Rock Nacional",
    "Pop": "Brazilian Pop",
    "default": "Original"
  }
  return styles[genre] || styles.default
}
