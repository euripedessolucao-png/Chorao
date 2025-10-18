import { NextResponse } from "next/server"
import { getGenreConfig, detectSubGenre, getGenreRhythm } from "@/lib/genre-config"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { MetaComposer } from "@/lib/orchestrator/meta-composer"

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

    // ✅ ETAPA 1: GERAR REFRÃO PRIMEIRO (SE SOLICITADO) - USANDO METACOMPOSER
    let generatedChorus = null
    if (includeChorus) {
      console.log('[Create-Song] 🎵 Gerando refrão com MetaComposer...')
      generatedChorus = await generateChorusWithMetaComposer({
        genre: genero,
        theme: tema,
        mood: humor,
        additionalRequirements: additionalRequirements
      })
    }

    // ✅ ETAPA 2: GERAR HOOK (SE SOLICITADO) - USANDO METACOMPOSER
    let generatedHook = null
    if (includeHook) {
      console.log('[Create-Song] 🎣 Gerando hook com MetaComposer...')
      generatedHook = await generateHookWithMetaComposer({
        genre: genero,
        theme: tema,
        mood: humor,
        additionalRequirements: additionalRequirements
      })
    }

    // ✅ ETAPA 3: CRIAR MÚSICA COMPLETA COM METACOMPOSER
    console.log('[Create-Song] 🎼 Criando música completa com MetaComposer...')
    
    const compositionRequest = {
      genre: genero,
      theme: tema,
      mood: humor || "Adaptado ao tema",
      additionalRequirements: buildCompleteRequirements(
        additionalRequirements, 
        generatedChorus, 
        generatedHook
      ),
      syllableTarget: syllableConfig,
      applyFinalPolish: universalPolish,
      preservedChoruses: generatedChorus ? [getBestChorus(generatedChorus)] : [],
      // ❌ NÃO envia originalLyrics - força criação do zero!
    }

    const result = await MetaComposer.compose(compositionRequest)

    // ✅ ETAPA 4: LIMPEZA E FORMATAÇÃO FINAL
    let finalLyrics = cleanLyrics(result.lyrics)
    finalLyrics = applyFinalFormatting(finalLyrics, genero)
    finalLyrics = capitalizeLines(finalLyrics)

    // ✅ METADADOS COMPLETOS
    const metadata = {
      score: result.metadata.finalScore,
      polishingApplied: result.metadata.polishingApplied,
      rhymeScore: result.metadata.rhymeScore,
      rhymeTarget: result.metadata.rhymeTarget,
      structure: "Completa (MetaComposer)",
      syllableCompliance: `${Math.round(result.metadata.finalScore * 10)}%`,
      genre: genero,
      rhythm: finalRhythm,
      includes: {
        chorus: includeChorus,
        hook: includeHook,
        chorusVariations: generatedChorus?.variations?.length || 0,
        hookVariations: generatedHook?.variations?.length || 0
      }
    }

    console.log(`[Create-Song] ✅ Música criada com MetaComposer! Score: ${metadata.score}`)

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

// ✅ GERADOR DE REFRÃO COM METACOMPOSER
async function generateChorusWithMetaComposer(params: {
  genre: string;
  theme: string;
  mood?: string;
  additionalRequirements?: string;
}) {
  
  const chorusRequest = {
    genre: params.genre,
    theme: params.theme,
    mood: params.mood || "Adaptado",
    additionalRequirements: `CRIAR REFRÃO ORIGINAL - NÃO É REWRITE

TEMA: ${params.theme}
${params.additionalRequirements ? `REQUISITOS: ${params.additionalRequirements}` : ''}

Crie 3 variações de refrão AUTÔNOMO (não precisa de contexto):
- 4 linhas cada, máximo 12 sílabas por linha
- Gancho memorável na primeira linha
- Linguagem coloquial brasileira
- Funcione como refrão independente`,
    syllableTarget: getSyllableConfig(params.genre),
    applyFinalPolish: true,
    preservedChoruses: [], // Cria do zero
  }

  try {
    const result = await MetaComposer.compose(chorusRequest)
    
    // Formata como o formato esperado do refrão
    return {
      variations: [
        {
          chorus: extractChorusFromLyrics(result.lyrics),
          style: "Refrão Original",
          score: Math.round(result.metadata.finalScore * 10)
        }
      ],
      bestOptionIndex: 0,
      metadata: result.metadata
    }
  } catch (error) {
    console.error('[Create-Song] Erro ao gerar refrão com MetaComposer:', error)
    return null
  }
}

// ✅ GERADOR DE HOOK COM METACOMPOSER
async function generateHookWithMetaComposer(params: {
  genre: string;
  theme: string;
  mood?: string;
  additionalRequirements?: string;
}) {
  
  const hookRequest = {
    genre: params.genre,
    theme: params.theme,
    mood: params.mood || "Adaptado", 
    additionalRequirements: `CRIAR HOOK/GANCHO ÚNICO - FRASE IMPACTANTE

TEMA: ${params.theme}
${params.additionalRequirements ? `REQUISITOS: ${params.additionalRequirements}` : ''}

Crie 3 hooks (1 linha cada):
- Máximo 12 sílabas
- Grude na cabeça imediatamente
- Represente o tema principal
- Linguagem coloquial brasileira`,
    syllableTarget: getSyllableConfig(params.genre),
    applyFinalPolish: true,
    preservedChoruses: [],
  }

  try {
    const result = await MetaComposer.compose(hookRequest)
    
    return {
      variations: [
        {
          hook: extractFirstLine(result.lyrics),
          style: "Hook Impactante", 
          score: Math.round(result.metadata.finalScore * 10)
        }
      ],
      bestOptionIndex: 0,
      metadata: result.metadata
    }
  } catch (error) {
    console.error('[Create-Song] Erro ao gerar hook com MetaComposer:', error)
    return null
  }
}

// ✅ CONSTRÓI REQUISITOS COMPLETOS PARA O METACOMPOSER
function buildCompleteRequirements(
  baseRequirements: string, 
  generatedChorus: any, 
  generatedHook: any
): string {
  
  let requirements = baseRequirements
  
  requirements += `

🎵 CRIAÇÃO DE MÚSICA ORIGINAL - NÃO É REWRITE!

ESTRUTURA COMPLETA:
[INTRO] → [VERSE 1] → [PRE-CHORUS] → [CHORUS] → [VERSE 2] → [CHORUS] → [BRIDGE] → [CHORUS] → [OUTRO]

REGRAS DE CRIAÇÃO:
- Letra 100% ORIGINAL em português brasileiro
- Ganchos memoráveis
- Desenvolvimento narrativo natural
- Emoção autêntica
- Linguagem coloquial: "cê", "tô", "pra", "tá"
`

  if (generatedChorus) {
    requirements += `\n- Use o refrão sugerido ou crie um similar`
  }
  
  if (generatedHook) {
    requirements += `\n- Integre o hook sugerido naturalmente`
  }

  requirements += `\n\nFORMATAÇÃO:
- Tags em inglês: [INTRO], [VERSE], [CHORUS], etc.
- Versos em português
- Instruções musicais entre parênteses
- Lista de instrumentos no final`

  return requirements
}

// ✅ FUNÇÕES AUXILIARES
function getBestChorus(chorusData: any): string {
  if (!chorusData?.variations?.[0]?.chorus) return ""
  return chorusData.variations[0].chorus
}

function extractChorusFromLyrics(lyrics: string): string {
  const chorusMatch = lyrics.match(/\[CHORUS[^\]]*\][\s\r\n]*([^\r\n]+[\s\r\n]+[^\r\n]+[\s\r\n]+[^\r\n]+[\s\r\n]+[^\r\n]+)/i)
  if (chorusMatch?.[1]) {
    return chorusMatch[1].trim()
  }
  
  // Fallback: pega as primeiras 4 linhas que parecem versos
  const lines = lyrics.split('\n').filter(line => 
    line.trim() && 
    !line.startsWith('[') && 
    !line.startsWith('(') &&
    !line.includes('Instruments:')
  ).slice(0, 4)
  
  return lines.join('\\n')
}

function extractFirstLine(lyrics: string): string {
  const lines = lyrics.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('[') && !trimmed.startsWith('(')) {
      return trimmed
    }
  }
  return ""
}

function cleanLyrics(lyrics: string): string {
  const lines = lyrics.split('\n')
  const cleanedLines: string[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // Remove comentários da IA
    if (
      trimmed.startsWith('Claro!') ||
      trimmed.startsWith('Aqui está') ||
      trimmed.startsWith('🎵') ||
      trimmed.includes('Gênero:') ||
      trimmed.includes('sílabas') ||
      !trimmed
    ) {
      continue
    }
    
    cleanedLines.push(line)
  }
  
  return cleanedLines.join('\n').trim()
}

function applyFinalFormatting(lyrics: string, genre: string): string {
  let formatted = lyrics
  
  // Garante instrumentos
  if (!formatted.includes("(Instruments:")) {
    const instruments = getGenreInstruments(genre)
    formatted += `\n\n(Instruments: ${instruments})`
  }
  
  return formatted
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
    "MPB": "nylon guitar, piano, bass, light percussion",
    "Funk": "drum machine, synth bass, samples, electronic beats", 
    "Forró": "accordion, triangle, zabumba, bass",
    "Rock": "electric guitar, bass, drums, keyboard",
    "Pop": "synth, drum machine, bass, piano",
    "default": "guitar, bass, drums, keyboard"
  }
  return instruments[genre] || instruments.default
}
