import { generateText } from "ai"
import { NextResponse } from "next/server"
import { BACHATA_BRASILEIRA_2024 } from "@/lib/genres/bachata_brasileira_2024"
import { SERTANEJO_MODERNO_2024 } from "@/lib/genres/sertanejo_moderno_2024"
import { GENRE_CONFIGS, detectSubGenre, getGenreRhythm } from "@/lib/genre-config"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { validateLyricsSyllables } from "@/lib/validation/syllableUtils"

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
    } = body

    const genreLower = generoConversao.toLowerCase()
    const isBachata = genreLower.includes("bachata")
    const isSertanejoRaiz = genreLower.includes("sertanejo raiz") || genreLower.includes("sertanejo-raiz")
    const isSertanejoModerno = genreLower.includes("sertanejo") && !isSertanejoRaiz
    const isSertanejo = isSertanejoRaiz || isSertanejoModerno

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

    console.log(`[v0] Reescrevendo para: ${generoConversao}`)

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

    console.log("[v0] Iniciando reescrita...")

    let finalLyrics = ""
    let attempt = 0
    const maxAttempts = 3

    while (attempt < maxAttempts) {
      attempt++
      console.log(`[v0] Tentativa ${attempt}/${maxAttempts}`)

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

        // Validate syllables
        const validation = validateLyricsSyllables(lyrics, 12)

        if (validation.valid) {
          console.log(`[v0] Validação passou na tentativa ${attempt}`)
          finalLyrics = lyrics
          break
        } else {
          console.log(`[v0] ${validation.linesWithIssues} versos excedem 12 sílabas`)
          validation.violations.forEach((v) => {
            console.log(`[v0]   Linha ${v.line}: "${v.text}" (${v.syllables} sílabas)`)
          })

          if (attempt === maxAttempts) {
            console.log(`[v0] Máximo de tentativas. Retornando melhor resultado.`)
            finalLyrics = lyrics
          }
        }
      } catch (error) {
        console.error(`[v0] Erro na tentativa ${attempt}:`, error)
        if (attempt === maxAttempts) {
          throw error
        }
      }
    }

    // Add instruments if missing
    if (!finalLyrics.includes("(Instrumentos:")) {
      const instrumentList = `(Instrumentos: ${subGenreInfo.instruments || originalInstruments || "guitar, bass, drums, keyboard"} | BPM: ${subGenreInfo.bpm || metrics?.bpm || 100} | Ritmo: ${finalRhythm} | Estilo: ${generoConversao})`
      finalLyrics = finalLyrics.trim() + "\n\n" + instrumentList
    }

    finalLyrics = capitalizeLines(finalLyrics)

    console.log("[v0] Reescrita concluída!")

    return NextResponse.json({
      letra: finalLyrics,
    })
  } catch (error) {
    console.error("[v0] Erro ao reescrever letra:", error)

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
