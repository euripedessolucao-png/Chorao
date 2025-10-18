import { NextResponse } from "next/server"
import { generateText } from "ai"
import { getGenreConfig, detectSubGenre, getGenreRhythm } from "@/lib/genre-config"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { MetaComposer } from "@/lib/orchestrator/meta-composer"

// ✅ INTERFACES PARA TIPAGEM
interface ChorusVariation {
  chorus: string
  style: string
  score: number
}

interface HookVariation {
  hook: string
  style: string
  score: number
}

interface ChorusData {
  variations: ChorusVariation[]
  bestOptionIndex: number
}

interface HookData {
  variations: HookVariation[]
  bestOptionIndex: number
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log('🎵 [Create-Song] Parâmetros recebidos:', {
      genero: body.genero,
      tema: body.tema,
      humor: body.humor,
      additionalRequirements: body.additionalRequirements ? '✅' : '❌',
      includeChorus: body.includeChorus !== false,
      includeHook: body.includeHook !== false,
      performanceMode: body.performanceMode || 'standard'
    })

    const {
      genero,
      humor,
      tema,
      additionalRequirements = "",
      includeChorus = true,
      includeHook = true,
      universalPolish = true,
      performanceMode = 'standard'
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

    console.log(`[Create-Song] Config: ${genero} | ${finalRhythm} | ${syllableConfig.min}-${syllableConfig.max}s | Mode: ${performanceMode}`)

    // ✅ ETAPA 1: GERAR ELEMENTOS COM METACOMPOSER
    let generatedChorus: ChorusData | null = null
    let generatedHook: HookData | null = null

    if (includeChorus) {
      console.log('[Create-Song] 🎵 Gerando refrão com MetaComposer...')
      generatedChorus = await generateChorusWithMetaComposer({
        genre: genero,
        theme: tema,
        mood: humor,
        additionalRequirements: additionalRequirements
      })
    }

    if (includeHook) {
      console.log('[Create-Song] 🎣 Gerando hook com MetaComposer...')
      generatedHook = await generateHookWithMetaComposer({
        genre: genero,
        theme: tema,
        mood: humor,
        additionalRequirements: additionalRequirements
      })
    }

    // ✅ ETAPA 2: CRIAR MÚSICA COMPLETA COM METACOMPOSER
    console.log('[Create-Song] 🎼 Criando música completa com MetaComposer...')
    
    const compositionRequest = {
      genre: genero,
      theme: tema,
      mood: humor || "Adaptado ao tema",
      additionalRequirements: buildCompleteRequirements(
        additionalRequirements, 
        generatedChorus, 
        generatedHook,
        performanceMode
      ),
      syllableTarget: syllableConfig,
      applyFinalPolish: universalPolish,
      preservedChoruses: generatedChorus ? [getBestChorus(generatedChorus)] : [],
    }

    const result = await MetaComposer.compose(compositionRequest)

    // ✅ ETAPA 3: APLICAR FORMATAÇÃO PERFORMÁTICA
    console.log('[Create-Song] 🎭 Aplicando formatação performática...')
    let finalLyrics = result.lyrics
    
    if (performanceMode === 'performance') {
      finalLyrics = applyPerformanceFormatting(finalLyrics, genero, finalRhythm)
    } else {
      finalLyrics = applyStandardFormatting(finalLyrics, genero)
    }

    finalLyrics = capitalizeLines(finalLyrics)

    // ✅ METADADOS COMPLETOS COM TIPAGEM CORRETA
    const metadata = {
      score: result.metadata.finalScore,
      polishingApplied: result.metadata.polishingApplied,
      rhymeScore: result.metadata.rhymeScore,
      rhymeTarget: result.metadata.rhymeTarget,
      structure: performanceMode === 'performance' ? "Performática" : "Padrão",
      syllableCompliance: `${Math.round(result.metadata.finalScore * 10)}%`,
      genre: genero,
      rhythm: finalRhythm,
      performanceMode: performanceMode,
      includes: {
        chorus: includeChorus,
        hook: includeHook,
        chorusVariations: generatedChorus?.variations?.length || 0,
        hookVariations: generatedHook?.variations?.length || 0
      }
    }

    console.log(`[Create-Song] ✅ Música criada! Score: ${metadata.score} | Mode: ${performanceMode}`)

    return NextResponse.json({
      letra: finalLyrics,
      titulo: result.title,
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

// ✅ GERADOR DE REFRÃO COM METACOMPOSER - IMPLEMENTAÇÃO COMPLETA
async function generateChorusWithMetaComposer(params: {
  genre: string;
  theme: string;
  mood?: string;
  additionalRequirements?: string;
}): Promise<ChorusData | null> {
  
  const chorusRequest = {
    genre: params.genre,
    theme: params.theme,
    mood: params.mood || "Adaptado",
    additionalRequirements: `CRIAR APENAS REFRÃO - 4 LINHAS

TEMA: ${params.theme}
${params.additionalRequirements ? `REQUISITOS: ${params.additionalRequirements}` : ''}

Crie UM refrão forte:
- 4 linhas, máximo 12 sílabas por linha
- Gancho memorável na primeira linha
- Linguagem coloquial brasileira
- Tema: ${params.theme}`,
    syllableTarget: getSyllableConfig(params.genre),
    applyFinalPolish: true,
    preservedChoruses: [],
  }

  try {
    const result = await MetaComposer.compose(chorusRequest)
    const chorusLines = extractChorusLines(result.lyrics)
    
    return {
      variations: [
        {
          chorus: chorusLines,
          style: "Refrão Original",
          score: Math.round(result.metadata.finalScore * 10)
        }
      ],
      bestOptionIndex: 0
    }
  } catch (error) {
    console.error('[Create-Song] Erro ao gerar refrão:', error)
    return null
  }
}

// ✅ GERADOR DE HOOK COM METACOMPOSER - IMPLEMENTAÇÃO COMPLETA
async function generateHookWithMetaComposer(params: {
  genre: string;
  theme: string;
  mood?: string;
  additionalRequirements?: string;
}): Promise<HookData | null> {
  
  const hookRequest = {
    genre: params.genre,
    theme: params.theme,
    mood: params.mood || "Adaptado",
    additionalRequirements: `CRIAR APENAS UMA FRASE-HOOK

TEMA: ${params.theme}
${params.additionalRequirements ? `REQUISITOS: ${params.additionalRequirements}` : ''}

Crie UMA frase-hook impactante:
- 1 linha apenas, máximo 12 sílabas
- Grude na cabeça imediatamente
- Represente o tema principal: ${params.theme}
- Linguagem coloquial brasileira`,
    syllableTarget: getSyllableConfig(params.genre),
    applyFinalPolish: true,
    preservedChoruses: [],
  }

  try {
    const result = await MetaComposer.compose(hookRequest)
    const hookLine = extractFirstLine(result.lyrics)
    
    return {
      variations: [
        {
          hook: hookLine,
          style: "Hook Impactante",
          score: Math.round(result.metadata.finalScore * 10)
        }
      ],
      bestOptionIndex: 0
    }
  } catch (error) {
    console.error('[Create-Song] Erro ao gerar hook:', error)
    return null
  }
}

// ✅ EXTRAI LINHAS DO REFRÃO
function extractChorusLines(lyrics: string): string {
  const lines = lyrics.split('\n')
  const verseLines: string[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && 
        !trimmed.startsWith('[') && 
        !trimmed.startsWith('(') &&
        !trimmed.includes('Instruments:')) {
      verseLines.push(trimmed)
      if (verseLines.length >= 4) break // Pega até 4 linhas
    }
  }
  
  return verseLines.slice(0, 4).join('\\n')
}

// ✅ EXTRAI PRIMEIRA LINHA (PARA HOOK)
function extractFirstLine(lyrics: string): string {
  const lines = lyrics.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && 
        !trimmed.startsWith('[') && 
        !trimmed.startsWith('(') &&
        !trimmed.includes('Instruments:')) {
      return trimmed
    }
  }
  return "Hook impactante"
}

// ✅ PEGA MELHOR REFRÃO
function getBestChorus(chorusData: ChorusData): string {
  if (!chorusData?.variations?.[0]?.chorus) return ""
  return chorusData.variations[0].chorus
}

// ✅ FORMATAÇÃO PERFORMÁTICA (TAGS EM INGLÊS, VERSOS EM PORTUGUÊS)
function applyPerformanceFormatting(lyrics: string, genre: string, rhythm: string): string {
  const lines = lyrics.split('\n')
  const formattedLines: string[] = []
  
  let currentSection = ''

  for (const line of lines) {
    const trimmed = line.trim()
    
    if (!trimmed) {
      formattedLines.push('')
      continue
    }

    // ✅ TAGS DE SEÇÃO EM INGLÊS
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      currentSection = trimmed
      const performanceTag = convertToPerformanceTag(trimmed, genre)
      formattedLines.push(performanceTag)
      continue
    }

    // ✅ INSTRUÇÕES MUSICAIS EM INGLÊS
    if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
      formattedLines.push(trimmed)
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

// ✅ CONVERSÃO PARA TAGS PERFORMÁTICAS EM INGLÊS
function convertToPerformanceTag(tag: string, genre: string): string {
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

  // ✅ ADICIONA INSTRUMENTOS PERFORMÁTICOS
  if (englishTag === '[INTRO]') {
    return `[INTRO - ${getIntroInstruments(genre)}]`
  }
  if (englishTag === '[VERSE]') {
    return `[VERSE 1 - ${getVerseInstruments(genre)}]`
  }
  if (englishTag === '[PRE-CHORUS]') {
    return `[PRE-CHORUS - ${getPreChorusInstruments(genre)}]`
  }
  if (englishTag === '[CHORUS]') {
    return `[CHORUS - ${getChorusInstruments(genre)}]`
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

// ✅ FUNÇÕES DE INSTRUMENTOS (mantidas da versão anterior)
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

// ✅ FORMATAÇÃO PADRÃO
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

// ✅ CONSTRÓI REQUISITOS
function buildCompleteRequirements(
  baseRequirements: string, 
  generatedChorus: ChorusData | null, 
  generatedHook: HookData | null,
  performanceMode: string
): string {
  
  let requirements = baseRequirements
  
  const performanceInstruction = performanceMode === 'performance' ?
    `🎭 MODO PERFORMÁTICO ATIVADO:
- TAGS EM INGLÊS: [SECTION - Instruments]
- VERSOS EM PORTUGUÊS: Apenas a parte cantada
- BACKING VOCALS: (Backing: "Oh, oh") em inglês
- INSTRUMENTOS: Descrições detalhadas em inglês` :
    `📝 MODO PADRÃO:
- Tags em inglês simples
- Versos em português
- Instrumentos básicos em inglês`

  requirements += `

${performanceInstruction}

ESTRUTURA COMPLETA:
[INTRO] → [VERSE 1] → [PRE-CHORUS] → [CHORUS] → [VERSE 2] → [CHORUS] → [BRIDGE] → [CHORUS] → [OUTRO]

REGRAS DE IDIOMA:
✅ PORTUGUÊS: Apenas versos cantados
✅ INGLÊS: Tags, instruções, instrumentos, backing vocals
❌ NUNCA MISTURE idiomas nos versos`

  if (generatedChorus) {
    requirements += `\n- Use o refrão sugerido ou crie um similar`
  }
  
  if (generatedHook) {
    requirements += `\n- Integre o hook sugerido naturalmente`
  }

  return requirements
}

// ✅ FUNÇÕES AUXILIARES
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
