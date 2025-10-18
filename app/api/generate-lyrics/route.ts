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

    // ✅ ETAPA 4: APLICAR POLIMENTO FINAL
    let finalLyrics = completeSong
    if (universalPolish) {
      console.log('[Create-Song] ✨ Aplicando polimento final...')
      finalLyrics = await applyFinalPolish(finalLyrics, genero, syllableConfig)
    }

    finalLyrics = capitalizeLines(finalLyrics)

    // ✅ METADADOS COMPLETOS
    const metadata = {
      score: calculateSongScore(finalLyrics, syllableConfig),
      structure: "Completa (Intro-Verse-Chorus-Bridge-Outro)",
      syllableCompliance: getComplianceRate(finalLyrics, syllableConfig),
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

// ✅ GERADOR DE REFRÃO
async function generateChorus(params: {
  genre: string;
  theme: string;
  mood?: string;
  additionalRequirements?: string;
}) {
  const prompt = `CRIAÇÃO DE REFRÃO ORIGINAL - ${params.genre.toUpperCase()}

TEMA: ${params.theme}
HUMOR: ${params.mood || "adaptável"}
${params.additionalRequirements ? `REQUISITOS: ${params.additionalRequirements}` : ''}

Crie 3 variações de REFRÃO ORIGINAL que:
- Sejam AUTÔNOMOS (não precisam de contexto)
- Tenham GANCHO memorável na primeira linha
- Usem linguagem coloquial brasileira
- Máximo 12 sílabas por linha
- 4 linhas por refrão

FORMATO JSON:
{
  "variations": [
    {
      "chorus": "Linha 1 (gancho)\\nLinha 2\\nLinha 3\\nLinha 4",
      "style": "Estilo",
      "score": 8-10,
      "hookLine": "Linha do gancho"
    }
  ],
  "bestOptionIndex": 0
}`

  const { text } = await generateText({
    model: "openai/gpt-4o",
    prompt,
    temperature: 0.8,
  })

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  return jsonMatch ? JSON.parse(jsonMatch[0]) : null
}

// ✅ GERADOR DE HOOK
async function generateHook(params: {
  genre: string;
  theme: string;
  mood?: string;
  additionalRequirements?: string;
}) {
  const prompt = `CRIAÇÃO DE HOOK/GANCHO - ${params.genre.toUpperCase()}

TEMA: ${params.theme}
HUMOR: ${params.mood || "adaptável"}
${params.additionalRequirements ? `REQUISITOS: ${params.additionalRequirements}` : ''}

Crie 3 variações de HOOK/GANCHO que:
- Sejam frases ÚNICAS e IMPACTANTES
- Grudem na cabeça imediatamente
- Representem o tema principal
- Máximo 12 sílabas
- Linguagem coloquial brasileira

FORMATO JSON:
{
  "variations": [
    {
      "hook": "Frase completa do hook",
      "style": "Estilo",
      "score": 8-10,
      "explanation": "Por que esse hook funciona"
    }
  ],
  "bestOptionIndex": 0
}`

  const { text } = await generateText({
    model: "openai/gpt-4o",
    prompt,
    temperature: 0.9,
  })

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  return jsonMatch ? JSON.parse(jsonMatch[0]) : null
}

// ✅ GERADOR DE MÚSICA COMPLETA
async function generateCompleteSong(params: {
  genre: string;
  theme: string;
  mood?: string;
  additionalRequirements?: string;
  syllableConfig: { min: number; max: number; ideal: number };
  rhythm: string;
  generatedChorus?: any;
  generatedHook?: any;
}) {
  
  const chorusContext = params.generatedChorus ? `
REFRÃO GERADO (USE ESTE OU CRIE UM SIMILAR):
${params.generatedChorus.variations?.[params.generatedChorus.bestOptionIndex || 0]?.chorus || ''}
` : ''

  const hookContext = params.generatedHook ? `
HOOK GERADO (INTEGRE NA MÚSICA):
${params.generatedHook.variations?.[params.generatedHook.bestOptionIndex || 0]?.hook || ''}
` : ''

  const prompt = `CRIAÇÃO DE MÚSICA COMPLETA - ${params.genre.toUpperCase()}

TEMA: ${params.theme}
HUMOR: ${params.mood || "adaptável"}
RITMO: ${params.rhythm}
SÍLABAS: ${params.syllableConfig.min}-${params.syllableConfig.max} por verso
${params.additionalRequirements ? `REQUISITOS: ${params.additionalRequirements}` : ''}
${chorusContext}
${hookContext}

🎵 CRIE UMA MÚSICA COMPLETA ORIGINAL:

ESTRUTURA PROFISSIONAL:
[INTRO] → [VERSE 1] → [PRE-CHORUS] → [CHORUS] → [VERSE 2] → [CHORUS] → [BRIDGE] → [CHORUS] → [OUTRO]

REGRAS:
- Letra 100% em português brasileiro coloquial
- Versos com ${params.syllableConfig.ideal} sílabas (máx ${params.syllableConfig.max})
- Ganchos memoráveis
- Desenvolvimento narrativo
- ${params.generatedChorus ? 'Use o refrão fornecido ou similar' : 'Crie refrão original'}
- ${params.generatedHook ? 'Integre o hook fornecido' : 'Crie hooks naturais'}

FORMATAÇÃO:
- Tags em inglês: [INTRO], [VERSE], [CHORUS], etc.
- Versos em português
- Instruções musicais entre parênteses
- Lista de instrumentos no final

Gere a MÚSICA COMPLETA:`

  const { text } = await generateText({
    model: "openai/gpt-4o",
    prompt,
    temperature: 0.7,
  })

  return text.trim()
}

// ✅ POLIMENTO FINAL
async function applyFinalPolish(lyrics: string, genre: string, syllableConfig: { min: number; max: number; ideal: number }) {
  const lines = lyrics.split('\n')
  const polishedLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    
    if (shouldPreserveLine(trimmed)) {
      polishedLines.push(line)
      continue
    }
    
    if (!trimmed) {
      polishedLines.push(line)
      continue
    }
    
    const syllables = countPoeticSyllables(trimmed)
    if (syllables > syllableConfig.max) {
      try {
        const corrected = await correctLine(trimmed, syllableConfig.ideal, genre)
        polishedLines.push(corrected)
      } catch (error) {
        polishedLines.push(line)
      }
    } else {
      polishedLines.push(line)
    }
  }
  
  let polishedLyrics = polishedLines.join('\n')
  
  // ✅ GARANTE INSTRUMENTOS
  if (!polishedLyrics.includes("(Instruments:")) {
    const instruments = getGenreInstruments(genre)
    polishedLyrics += `\n\n(Instruments: ${instruments})`
  }
  
  return polishedLyrics
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
    "MPB": "nylon guitar, piano, bass, light percussion",
    "Funk": "drum machine, synth bass, samples, electronic beats",
    "Forró": "accordion, triangle, zabumba, bass",
    "Rock": "electric guitar, bass, drums, keyboard",
    "Pop": "synth, drum machine, bass, piano"
  }
  return instruments[genre] || "guitar, bass, drums, keyboard"
}

async function correctLine(line: string, targetSyllables: number, genre: string): Promise<string> {
  const prompt = `Corrija para ${targetSyllables} sílabas: "${line}" | Gênero: ${genre}`
  const { text } = await generateText({
    model: "openai/gpt-4o-mini",
    prompt,
    temperature: 0.3,
  })
  return text.trim() || line
}

function calculateSongScore(lyrics: string, syllableConfig: { min: number; max: number; ideal: number }): number {
  const lines = lyrics.split('\n').filter(line => {
    const trimmed = line.trim()
    return trimmed && !(trimmed.startsWith('[') || trimmed.startsWith('('))
  })

  if (lines.length === 0) return 75

  let compliantLines = 0
  lines.forEach(line => {
    const syllables = countPoeticSyllables(line)
    if (syllables >= syllableConfig.min && syllables <= syllableConfig.max) {
      compliantLines++
    }
  })

  const complianceRate = compliantLines / lines.length
  return Math.min(95, 70 + (complianceRate * 25))
}

function getComplianceRate(lyrics: string, syllableConfig: { min: number; max: number; ideal: number }): string {
  const lines = lyrics.split('\n').filter(line => {
    const trimmed = line.trim()
    return trimmed && !(trimmed.startsWith('[') || trimmed.startsWith('('))
  })

  if (lines.length === 0) return "0%"

  let compliantLines = 0
  lines.forEach(line => {
    const syllables = countPoeticSyllables(line)
    if (syllables >= syllableConfig.min && syllables <= syllableConfig.max) {
      compliantLines++
    }
  })

  return `${Math.round((compliantLines / lines.length) * 100)}%`
}

function extractTitle(lyrics: string, theme: string): string {
  const chorusMatch = lyrics.match(/\[CHORUS[^\]]*\][\s\r\n]*([^\r\n]+)/i)
  if (chorusMatch?.[1]) {
    return chorusMatch[1].trim().split(' ').slice(0, 4).join(' ')
  }
  return theme || "Nova Música"
}

function shouldPreserveLine(line: string): boolean {
  const trimmed = line.trim()
  return (
    !trimmed ||
    trimmed.startsWith('[') ||
    trimmed.startsWith('(') ||
    trimmed.includes('Instruments:')
  )
}
