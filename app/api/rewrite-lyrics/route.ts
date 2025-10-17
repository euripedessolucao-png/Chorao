import { generateText } from "ai"
import { NextResponse } from "next/server"
import { BACHATA_BRASILEIRA_2024 } from "@/lib/genres/bachata_brasileira_2024"
import { SERTANEJO_MODERNO_2024 } from "@/lib/genres/sertanejo_moderno_2024"
import { GENRE_CONFIGS, detectSubGenre, getGenreRhythm } from "@/lib/genre-config"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { validateLyricsSyllables } from "@/lib/validation/syllable-counter"
import { SyllableEnforcer } from "@/lib/validation/syllableEnforcer"
import { LineStacker } from "@/lib/utils/line-stacker"
import { MetaComposer } from "@/lib/meta-composer"

// ✅ FUNÇÕES AUXILIARES (fora do export async function POST)

function extractChorusesFromInstructions(instructions?: string): string[] | null {
  if (!instructions) return null

  const chorusMatches = instructions.match(/refr[ãa]o[:\s]*([^\.]+)/gi)
  if (!chorusMatches) return null

  const choruses: string[] = []
  
  chorusMatches.forEach(match => {
    const chorusText = match.replace(/refr[ãa]o[:\s]*/gi, '').trim()
    if (chorusText && chorusText.length > 10) {
      choruses.push(chorusText)
    }
  })

  return choruses.length > 0 ? choruses : null
}

function extractThemeFromLyrics(lyrics: string): string {
  const lines = lyrics.split('\n').filter(line => 
    line.trim() && !line.startsWith('[') && !line.startsWith('(') && !line.includes('Instrumentos:')
  )
  
  if (lines.length === 0) return 'Amor'
  
  const firstLines = lines.slice(0, 3).join(' ').toLowerCase()
  
  if (firstLines.includes('amor') || firstLines.includes('coração') || firstLines.includes('amar')) return 'Amor'
  if (firstLines.includes('saudade') || firstLines.includes('lembrança') || firstLines.includes('nostalgia')) return 'Saudade'
  if (firstLines.includes('festa') || firstLines.includes('dançar') || firstLines.includes('noite')) return 'Festa'
  if (firstLines.includes('vida') || firstLines.includes('tempo') || firstLines.includes('caminho')) return 'Vida'
  
  return 'Amor'
}

function extractMoodFromLyrics(lyrics: string): string {
  const lines = lyrics.split('\n').filter(line => 
    line.trim() && !line.startsWith('[') && !line.startsWith('(') && !line.includes('Instrumentos:')
  )
  
  if (lines.length === 0) return 'Romântico'
  
  const text = lines.join(' ').toLowerCase()
  
  if (text.includes('triste') || text.includes('chor') || text.includes('sof')) return 'Melancólico'
  if (text.includes('alegria') || text.includes('feliz') || text.includes('sorri')) return 'Alegre'
  if (text.includes('paixão') || text.includes('amor') || text.includes('beij')) return 'Romântico'
  if (text.includes('raiva') || text.includes('ódio') || text.includes('machuc')) return 'Intenso'
  
  return 'Romântico'
}

function applyFinalFormatting(lyrics: string, genre: string, metrics?: any): string {
  let formattedLyrics = lyrics

  if (!formattedLyrics.includes("(Instrumentos:")) {
    const subGenreInfo = detectSubGenre('')
    const defaultRhythm = getGenreRhythm(genre)
    const finalRhythm = subGenreInfo.rhythm || defaultRhythm
    
    const instrumentList = `(Instrumentos: ${subGenreInfo.instruments || "guitar, bass, drums, keyboard"} | BPM: ${subGenreInfo.bpm || metrics?.bpm || 100} | Ritmo: ${finalRhythm} | Estilo: ${genre})`
    formattedLyrics = formattedLyrics.trim() + "\n\n" + instrumentList
  }

  formattedLyrics = capitalizeLines(formattedLyrics)
  return formattedLyrics
}

// ✅ FUNÇÃO DE REWRITE NORMAL
async function rewriteNormally(
  letraOriginal: string,
  generoConversao: string,
  additionalRequirements?: string,
  conservarImagens?: boolean,
  polirSemMexer?: boolean,
  metrics?: any
): Promise<string> {
  
  const genreLower = generoConversao.toLowerCase()
  const isBachata = genreLower.includes("bachata")
  const isSertanejoRaiz = genreLower.includes("sertanejo raiz") || genreLower.includes("sertanejo-raiz")
  const isSertanejoModerno = genreLower.includes("sertanejo") && !isSertanejoRaiz

  const subGenreInfo = detectSubGenre(additionalRequirements)
  const defaultRhythm = getGenreRhythm(generoConversao)
  const finalRhythm = subGenreInfo.rhythm || defaultRhythm

  let genreConfig
  if (isBachata) {
    genreConfig = BACHATA_BRASILEIRA_2024
  } else if (isSertanejoRaiz) {
    genreConfig = GENRE_CONFIGS["Sertanejo Raiz"]
  } else if (isSertanejoModerno) {
    genreConfig = SERTANEJO_MODERNO_2024
  } else {
    genreConfig = GENRE_CONFIGS[generoConversao as keyof typeof GENRE_CONFIGS]
  }

  console.log(`[RewriteNormally] Reescrevendo para: ${generoConversao}`)

  const instrumentMatch = letraOriginal.match(/\(Instruments?:\s*\[([^\]]+)\]/i)
  const originalInstruments = instrumentMatch ? instrumentMatch[1].trim() : null

  const prompt = `You are a professional Brazilian music composer specializing in ${generoConversao}.

TASK: Create an improved version of the lyrics below, maintaining the same story and theme.

ORIGINAL LYRICS:
${letraOriginal}

UNIVERSAL RULES:

1. LANGUAGE:
   - Sung lyrics: Brazilian Portuguese (colloquial)
   - Performance instructions: English in [brackets]
   - Backing vocals: (Backing: "text") in parentheses
   - Instruments: English in final line

2. CLEAN FORMAT:
   - [SECTION - Performance instructions in English]
   - Lyrics in Portuguese (no brackets)
   - One verse per line (stacked)
   - (Backing: "text") when needed

3. SYLLABLE LIMIT (12 maximum):
   - Maximum 12 poetic syllables per verse
   - Use contractions: você→cê, está→tá, para→pra
   - Complete phrases always

4. STRUCTURE ${isSertanejoModerno ? "A, B, C" : "STANDARD"} (3:00-3:30):
   - [INTRO - Instructions, (8-12 SECONDS)]
   - [VERSE 1${isSertanejoModerno ? " - A" : ""} - Instructions] (4-8 lines)
   - [PRE-CHORUS - Instructions] (2-4 lines)
   - [CHORUS${isSertanejoModerno ? " - B" : ""} - Instructions] (4 lines)
   - [VERSE 2${isSertanejoModerno ? " - A" : ""} - Instructions] (4-8 lines)
   - [PRE-CHORUS - Instructions]
   - [CHORUS${isSertanejoModerno ? " - B" : ""} - Instructions]
   - [BRIDGE${isSertanejoModerno ? " - C" : ""} - Instructions] (4-6 lines)
   - [SOLO - Instrument, (8-16 SECONDS)]
   - [FINAL CHORUS${isSertanejoModerno ? " - B" : ""} - Instructions]
   - [OUTRO - Instructions] (2-4 lines)
   - (Instrumentos: list | BPM: number | Ritmo: ${finalRhythm} | Estilo: ${generoConversao})

5. CATCHY CHORUS (Priority):
   - First line = memorable hook
   - 4 lines maximum, 8-10 syllables each
   - Simple, direct, easy to sing

REWRITING INSTRUCTIONS:
${conservarImagens ? "- Preserve images and metaphors exactly" : "- Improve images while maintaining theme"}
${polirSemMexer ? "- Keep structure, only polish" : "- Adapt to hit song structure"}
- Preserve central emotional message
- Keep characters and situations
- Maximum 12 syllables per verse
- Intense Brazilian colloquial language
${additionalRequirements ? `\nSPECIAL REQUIREMENTS:\n${additionalRequirements}` : ""}

Create the improved version now:`

  console.log("[RewriteNormally] Iniciando reescrita...")

  let finalLyrics = ""
  let attempt = 0
  const maxAttempts = 3

  while (attempt < maxAttempts) {
    attempt++
    console.log(`[RewriteNormally] Tentativa ${attempt}/${maxAttempts}`)

    try {
      const { text } = await generateText({
        model: "openai/gpt-4o",
        prompt:
          attempt > 0
            ? `${prompt}\n\nATENTION: Previous attempt had verses >12 syllables. REGENERE with MAXIMUM 12 syllables per verse.`
            : prompt,
        temperature: 0.8,
      })

      let lyrics = text.trim()

      // Remove duplicate titles
      lyrics = lyrics.replace(/^(?:Título|Title):\s*.+$/gm, "").trim()
      lyrics = lyrics.replace(/^\*\*(?:Título|Title):\s*.+\*\*$/gm, "").trim()

      // ✅ VALIDAÇÃO E CORREÇÃO AUTOMÁTICA DE SÍLABAS
      console.log(`[RewriteNormally] Aplicando imposição rigorosa de sílabas...`)
      const syllableEnforcement = { min: 7, max: 11, ideal: 9 }

      const enforcedResult = await SyllableEnforcer.enforceSyllableLimits(
        lyrics, 
        syllableEnforcement, 
        generoConversao
      )

      if (enforcedResult.corrections > 0) {
        console.log(`[RewriteNormally] ${enforcedResult.corrections} linhas corrigidas automaticamente`)
        enforcedResult.violations.forEach(v => {
          console.log(`[RewriteNormally] CORRIGIDO: ${v}`)
        })
        
        lyrics = enforcedResult.correctedLyrics
      } else {
        console.log(`[RewriteNormally] Todas as linhas respeitam o limite de sílabas!`)
      }

      // ✅ APLICA EMPILHAMENTO PROFISSIONAL
      console.log("[Stacker] Aplicando empilhamento profissional...")
      const stackingResult = LineStacker.stackLines(lyrics)
      lyrics = stackingResult.stackedLyrics

      console.log(`[Stacker] Score de empilhamento: ${(stackingResult.stackingScore * 100).toFixed(1)}%`)
      stackingResult.improvements.forEach(imp => console.log(`[Stacker] ${imp}`))

      finalLyrics = lyrics
      break

    } catch (error) {
      console.error(`[RewriteNormally] Erro na tentativa ${attempt}:`, error)
      if (attempt === maxAttempts) {
        throw error
      }
    }
  }

  return finalLyrics
}

// ✅ ROTA PRINCIPAL
export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.letraOriginal || body.letraOriginal.trim().length === 0) {
      return NextResponse.json({ error: "Letra original é obrigatória para reescrita" }, { status: 400 })
    }

    if (!body.generoConversao) {
      return NextResponse.json({ error: "Gênero é obrigatório para reescrita" }, { status: 400 })
    }

    const {
      letraOriginal,
      generoConversao,
      conservarImagens,
      polirSemMexer,
      metrics,
      formattingStyle,
      additionalRequirements,
      advancedMode,
      selectedChoruses,
    } = body

    // ✅ EXTRAI refrões selecionados se existirem
    const extractedChoruses = selectedChoruses || extractChorusesFromInstructions(additionalRequirements)

    let finalLyrics: string

    // ✅ DECISÃO INTELIGENTE: Preservar refrões ou reescrita normal
    if (extractedChoruses && extractedChoruses.length > 0) {
      console.log(`[RewriteLyrics] 🎯 Modo preservação ativo: ${extractedChoruses.length} refrões selecionados`)
      
      // ✅ USA META-COMPOSER com refrões preservados
      finalLyrics = await MetaComposer.rewriteWithPreservedChoruses(
        letraOriginal,
        extractedChoruses,
        { 
          genre: generoConversao, 
          theme: extractThemeFromLyrics(letraOriginal),
          mood: extractMoodFromLyrics(letraOriginal),
          additionalRequirements,
          syllableTarget: { min: 7, max: 11, ideal: 9 }
        },
        { min: 7, max: 11, ideal: 9 }
      )
    } else {
      console.log(`[RewriteLyrics] Modo reescrita normal para: ${generoConversao}`)
      
      // ✅ FALLBACK: reescrita normal (sem refrões selecionados)
      finalLyrics = await rewriteNormally(
        letraOriginal,
        generoConversao,
        additionalRequirements,
        conservarImagens,
        polirSemMexer,
        metrics
      )
    }

    // ✅ APLICA FORMATAÇÃO FINAL
    finalLyrics = applyFinalFormatting(finalLyrics, generoConversao, metrics)

    console.log("[RewriteLyrics] Reescrita concluída!")

    return NextResponse.json({
      letra: finalLyrics,
      metadata: {
        preservedChoruses: extractedChoruses?.length || 0,
        mode: extractedChoruses ? "preservation" : "normal"
      }
    })

  } catch (error) {
    console.error("[RewriteLyrics] Erro ao reescrever letra:", error)

    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"

    return NextResponse.json(
      {
        error: "Erro ao reescrever letra",
        details: errorMessage,
        suggestion: "Tente novamente ou simplifique a letra original",
      },
      { status: 500 },
    )
  }
}
