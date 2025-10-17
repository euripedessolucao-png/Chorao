import { generateText } from "ai"
import { NextResponse } from "next/server"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { SyllableEnforcer } from "@/lib/validation/syllableEnforcer"
import { LineStacker } from "@/lib/utils/line-stacker"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      genero,
      humor,
      tema,
      criatividade = "equilibrado",
      inspiracao,
      metaforas,
      emocoes = [],
      titulo,
      formattingStyle = "performatico",
      additionalRequirements,
      advancedMode = false,
      syllableTarget = { min: 7, max: 11, ideal: 9 },
      metrics = { bpm: 100, structure: "VERSO-REFRAO" },
    } = body

    if (!genero) {
      return NextResponse.json({ error: "Gênero é obrigatório" }, { status: 400 })
    }

    if (!tema) {
      return NextResponse.json({ error: "Tema é obrigatório" }, { status: 400 })
    }

    console.log(`[Generate] Gerando letra para: ${genero} - ${tema}`)

    const temperature = criatividade === "conservador" ? 0.5 : criatividade === "ousado" ? 0.9 : 0.7

    const emotionsText = emocoes.length > 0 ? `Emoções: ${emocoes.join(", ")}` : ""
    const inspirationText = inspiracao ? `Inspiração: ${inspiracao}` : ""
    const metaphorsText = metaforas ? `Metáforas relacionadas: ${metaforas}` : ""

    const prompt = `You are a professional Brazilian music composer specializing in ${genero}.

TASK: Create an original song lyrics based on the theme and requirements below.

THEME: ${tema}
MOOD: ${humor || "varies with the story"}
${emotionsText}
${inspirationText}
${metaphorsText}

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

4. STANDARD STRUCTURE (3:00-3:30):
   - [INTRO - Instructions, (8-12 SECONDS)]
   - [VERSE 1 - Instructions] (4-8 lines)
   - [PRE-CHORUS - Instructions] (2-4 lines)
   - [CHORUS - Instructions] (4 lines)
   - [VERSE 2 - Instructions] (4-8 lines)
   - [PRE-CHORUS - Instructions]
   - [CHORUS - Instructions]
   - [BRIDGE - Instructions] (4-6 lines)
   - [SOLO - Instrument, (8-16 SECONDS)]
   - [FINAL CHORUS - Instructions]
   - [OUTRO - Instructions] (2-4 lines)
   - (Instrumentos: list | BPM: ${metrics.bpm || 100} | Ritmo: ${genero} | Estilo: ${genero})

5. CATCHY CHORUS (Priority):
   - First line = memorable hook
   - 4 lines maximum, 8-10 syllables each
   - Simple, direct, easy to sing

CREATIVITY LEVEL: ${criatividade}
${additionalRequirements ? `\nSPECIAL REQUIREMENTS:\n${additionalRequirements}` : ""}

Create the original song now:`

    console.log("[Generate] Iniciando geração...")

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature,
    })

    let lyrics = text.trim()

    // Remove duplicate titles
    lyrics = lyrics.replace(/^(?:Título|Title):\s*.+$/gm, "").trim()
    lyrics = lyrics.replace(/^\*\*(?:Título|Title):\s*.+\*\*$/gm, "").trim()

    // ✅ VALIDAÇÃO E CORREÇÃO AUTOMÁTICA DE SÍLABAS
    console.log(`[Generate] Aplicando imposição rigorosa de sílabas...`)
    const syllableEnforcement = syllableTarget

    const enforcedResult = await SyllableEnforcer.enforceSyllableLimits(
      lyrics,
      syllableEnforcement,
      genero
    )

    if (enforcedResult.corrections > 0) {
      console.log(`[Generate] ${enforcedResult.corrections} linhas corrigidas automaticamente`)
      enforcedResult.violations.forEach(v => {
        console.log(`[Generate] CORRIGIDO: ${v}`)
      })
      lyrics = enforcedResult.correctedLyrics
    } else {
      console.log(`[Generate] Todas as linhas respeitam o limite de sílabas!`)
    }

    // ✅ APLICA EMPILHAMENTO PROFISSIONAL
    console.log("[Stacker] Aplicando empilhamento profissional...")
    const stackingResult = LineStacker.stackLines(lyrics)
    lyrics = stackingResult.stackedLyrics

    console.log(`[Stacker] Score de empilhamento: ${(stackingResult.stackingScore * 100).toFixed(1)}%`)
    stackingResult.improvements.forEach(imp => console.log(`[Stacker] ${imp}`))

    // Add instruments if missing
    if (!lyrics.includes("(Instrumentos:")) {
      const instrumentList = `(Instrumentos: guitar, bass, drums, keyboard | BPM: ${metrics.bpm || 100} | Ritmo: ${genero} | Estilo: ${genero})`
      lyrics = lyrics.trim() + "\n\n" + instrumentList
    }

    lyrics = capitalizeLines(lyrics)

    console.log("[Generate] Geração concluída!")

    return NextResponse.json({
      letra: lyrics,
      titulo: titulo || extractTitleFromLyrics(lyrics),
    })
  } catch (error) {
    console.error("[Generate] Erro ao gerar letra:", error)

    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"

    return NextResponse.json(
      {
        error: "Erro ao gerar letra",
        details: errorMessage,
        suggestion: "Tente novamente com um tema mais específico",
      },
      { status: 500 },
    )
  }
}

function extractTitleFromLyrics(lyrics: string): string {
  const titleMatch = lyrics.match(/^Titulo:\s*(.+)$/m)
  if (titleMatch?.[1]) return titleMatch[1].trim()

  const chorusMatch = lyrics.match(/\[(?:CHORUS|REFRÃO)[^\]]*\]\s*\n([^\n]+)/i)
  if (chorusMatch?.[1]) {
    return chorusMatch[1].trim().split(" ").slice(0, 4).join(" ")
  }

  return "Sem Título"
}
