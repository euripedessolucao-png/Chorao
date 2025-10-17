import { generateText } from "ai"
import { NextResponse } from "next/server"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { SyllableEnforcer } from "@/lib/validation/syllableEnforcer"
import { LineStacker } from "@/lib/utils/line-stacker"
import { MetaComposer } from "@/lib/orchestrator/meta-composer"

// ✅ FUNÇÕES AUXILIARES
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

function extractThemeFromInput(tema: string, inspiracao?: string): string {
  if (tema.toLowerCase().includes('amor') || tema.toLowerCase().includes('coração')) return 'Amor'
  if (tema.toLowerCase().includes('saudade') || tema.toLowerCase().includes('nostalgia')) return 'Saudade'
  if (tema.toLowerCase().includes('festa') || tema.toLowerCase().includes('celebração')) return 'Festa'
  if (tema.toLowerCase().includes('vida') || tema.toLowerCase().includes('caminho')) return 'Vida'
  if (inspiracao?.toLowerCase().includes('amor')) return 'Amor'
  return tema
}

function extractMoodFromInput(humor?: string, emocoes?: string[]): string {
  if (humor) {
    if (humor.toLowerCase().includes('triste') || humor.toLowerCase().includes('melancólico')) return 'Melancólico'
    if (humor.toLowerCase().includes('alegre') || humor.toLowerCase().includes('feliz')) return 'Alegre'
    if (humor.toLowerCase().includes('romântico') || humor.toLowerCase().includes('paixão')) return 'Romântico'
    if (humor.toLowerCase().includes('raiva') || humor.toLowerCase().includes('intenso')) return 'Intenso'
  }
  
  if (emocoes && emocoes.length > 0) {
    if (emocoes.some(e => e.toLowerCase().includes('triste'))) return 'Melancólico'
    if (emocoes.some(e => e.toLowerCase().includes('alegre'))) return 'Alegre'
    if (emocoes.some(e => e.toLowerCase().includes('amor'))) return 'Romântico'
  }
  
  return 'Romântico'
}

function applyFinalFormatting(lyrics: string, genero: string, metrics?: any): string {
  let formattedLyrics = lyrics

  if (!formattedLyrics.includes("(Instrumentos:")) {
    const instrumentList = `(Instrumentos: guitar, bass, drums, keyboard | BPM: ${metrics?.bpm || 100} | Ritmo: ${genero} | Estilo: ${genero})`
    formattedLyrics = formattedLyrics.trim() + "\n\n" + instrumentList
  }

  formattedLyrics = capitalizeLines(formattedLyrics)
  return formattedLyrics
}

// ✅ FUNÇÃO DE GERAÇÃO NORMAL
async function generateNormally(
  genero: string,
  humor: string,
  tema: string,
  criatividade: string,
  inspiracao?: string,
  metaforas?: string,
  emocoes: string[] = [],
  additionalRequirements?: string,
  syllableTarget = { min: 7, max: 11, ideal: 9 },
  metrics = { bpm: 100, structure: "VERSO-REFRAO" }
): Promise<string> {
  
  console.log(`[GenerateNormally] Gerando letra para: ${genero} - ${tema}`)

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

  console.log("[GenerateNormally] Iniciando geração...")

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
  console.log(`[GenerateNormally] Aplicando imposição rigorosa de sílabas...`)
  const syllableEnforcement = syllableTarget

  const enforcedResult = await SyllableEnforcer.enforceSyllableLimits(
    lyrics,
    syllableEnforcement,
    genero
  )

  if (enforcedResult.corrections > 0) {
    console.log(`[GenerateNormally] ${enforcedResult.corrections} linhas corrigidas automaticamente`)
    enforcedResult.violations.forEach(v => {
      console.log(`[GenerateNormally] CORRIGIDO: ${v}`)
    })
    lyrics = enforcedResult.correctedLyrics
  } else {
    console.log(`[GenerateNormally] Todas as linhas respeitam o limite de sílabas!`)
  }

  // ✅ APLICA EMPILHAMENTO PROFISSIONAL
  console.log("[Stacker] Aplicando empilhamento profissional...")
  const stackingResult = LineStacker.stackLines(lyrics)
  lyrics = stackingResult.stackedLyrics

  console.log(`[Stacker] Score de empilhamento: ${(stackingResult.stackingScore * 100).toFixed(1)}%`)
  stackingResult.improvements.forEach(imp => console.log(`[Stacker] ${imp}`))

  return lyrics
}

// ✅ ROTA PRINCIPAL
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
      selectedChoruses, // ✅ NOVO: Refrões selecionados para preservar
    } = body

    if (!genero) {
      return NextResponse.json({ error: "Gênero é obrigatório" }, { status: 400 })
    }

    if (!tema) {
      return NextResponse.json({ error: "Tema é obrigatório" }, { status: 400 })
    }

    // ✅ EXTRAI refrões selecionados se existirem (sempre retorna array)
    const extractedChoruses = selectedChoruses || extractChorusesFromInstructions(additionalRequirements) || []

    let finalLyrics: string

    // ✅ DECISÃO INTELIGENTE: Preservar refrões ou geração normal
    if (extractedChoruses.length > 0) {
      console.log(`[Generate] 🎯 Modo preservação ativo: ${extractedChoruses.length} refrões selecionados`)
      
      // ✅ USA META-COMPOSER com refrões preservados
      finalLyrics = await MetaComposer.rewriteWithPreservedChoruses(
        "", // Letra original vazia para criação
        extractedChoruses,
        { 
          genre: genero,
          theme: extractThemeFromInput(tema, inspiracao),
          mood: extractMoodFromInput(humor, emocoes),
          additionalRequirements,
          syllableTarget,
          preservedChoruses: extractedChoruses
        },
        syllableTarget
      )
    } else {
      console.log(`[Generate] Modo geração normal para: ${genero} - ${tema}`)
      
      // ✅ FALLBACK: geração normal (sem refrões selecionados)
      finalLyrics = await generateNormally(
        genero,
        humor || 'Romântico',
        tema,
        criatividade,
        inspiracao,
        metaforas,
        emocoes,
        additionalRequirements,
        syllableTarget,
        metrics
      )
    }

    // ✅ APLICA FORMATAÇÃO FINAL
    finalLyrics = applyFinalFormatting(finalLyrics, genero, metrics)

    console.log("[Generate] Geração concluída!")

    return NextResponse.json({
      letra: finalLyrics,
      titulo: titulo || extractTitleFromLyrics(finalLyrics),
      metadata: {
        preservedChoruses: extractedChoruses.length,
        mode: extractedChoruses.length > 0 ? "preservation" : "normal"
      }
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
