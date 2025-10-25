import { NextResponse } from "next/server"
import { MetaComposer, type CompositionRequest } from "@/lib/orchestrator/meta-composer"

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

export const maxDuration = 60 // 60 segundos para geração completa

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log("[v0] 🎵 [Generate-Lyrics] Parâmetros recebidos:", {
      genero: body.genero,
      tema: body.tema,
      humor: body.humor,
    })

    const { genero, humor, tema, additionalRequirements = "" } = body

    if (!genero || typeof genero !== "string" || !genero.trim()) {
      console.error("[v0] ❌ Gênero inválido:", genero)
      return NextResponse.json({ error: "Gênero é obrigatório e deve ser uma string válida" }, { status: 400 })
    }

    if (!tema || typeof tema !== "string" || !tema.trim()) {
      console.error("[v0] ❌ Tema inválido:", tema)
      return NextResponse.json({ error: "Tema é obrigatório e deve ser uma string válida" }, { status: 400 })
    }

    const compositionRequest: CompositionRequest = {
      genre: genero,
      theme: tema,
      mood: humor || "adaptável",
      additionalRequirements,
      creativity: "equilibrado",
      applyFinalPolish: true,
      performanceMode: "standard",
      useTerceiraVia: false,
    }

    console.log("[v0] 🎵 Gerando letra com MetaComposer...")

    const result = await MetaComposer.compose(compositionRequest)

    console.log("[v0] ✅ Letra gerada com sucesso!")

    return NextResponse.json({
      letra: result.lyrics,
      titulo: result.title,
      metadata: result.metadata,
    })
  } catch (error) {
    console.error("[v0] ❌ Erro ao criar música:", error)
    return NextResponse.json(
      {
        error: "Erro ao criar música",
        details: error instanceof Error ? error.message : "Erro desconhecido",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

// ✅ EXTRAI LINHAS DO REFRÃO
function extractChorusLines(lyrics: string): string {
  const lines = lyrics.split("\n")
  const verseLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith("[") && !trimmed.startsWith("(") && !trimmed.includes("Instruments:")) {
      verseLines.push(trimmed)
      if (verseLines.length >= 4) break // Pega até 4 linhas
    }
  }

  return verseLines.slice(0, 4).join("\n")
}

// ✅ EXTRAI PRIMEIRA LINHA (PARA HOOK)
function extractFirstLine(lyrics: string): string {
  const lines = lyrics.split("\n")
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith("[") && !trimmed.startsWith("(") && !trimmed.includes("Instruments:")) {
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
  const lines = lyrics.split("\n")
  const formattedLines: string[] = []

  let currentSection = ""
  let hasInstruments = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed) {
      formattedLines.push("")
      continue
    }

    // ✅ Remove símbolos indesejados (**, ##, etc)
    let cleanedLine = trimmed
      .replace(/\*\*/g, "") // Remove **
      .replace(/##/g, "") // Remove ##
      .replace(/\[\/\//g, "[") // Remove [//
      .replace(/\/\/\]/g, "]") // Remove //]
      .trim()

    // ✅ Detecta se já tem instrumentos (evita duplicação)
    if (cleanedLine.includes("(Instruments:") || cleanedLine.includes("(Instrumentos:")) {
      hasInstruments = true
      // ✅ Garante que instrumentos estão em inglês
      cleanedLine = cleanedLine
        .replace(/\(Instrumentos:/gi, "(Instruments:")
        .replace(/Ritmo:/gi, "Rhythm:")
        .replace(/Estilo:/gi, "Style:")
      formattedLines.push(cleanedLine)
      continue
    }

    // ✅ TAGS DE SEÇÃO EM INGLÊS
    if (cleanedLine.startsWith("[") && cleanedLine.endsWith("]")) {
      currentSection = cleanedLine
      const performanceTag = convertToPerformanceTag(cleanedLine, genre)
      formattedLines.push(performanceTag)
      continue
    }

    // ✅ INSTRUÇÕES MUSICAIS EM INGLÊS (Backing vocals, etc)
    if (cleanedLine.startsWith("(") && cleanedLine.endsWith(")")) {
      // ✅ Garante formato correto de backing vocals
      if (cleanedLine.toLowerCase().includes("backing")) {
        cleanedLine = cleanedLine.replace(/backing:/gi, "Backing:")
      }
      formattedLines.push(cleanedLine)
      continue
    }

    // ✅ VERSOS CANTADOS EM PORTUGUÊS (limpos de símbolos)
    formattedLines.push(cleanedLine)
  }

  let formattedLyrics = formattedLines.join("\n")

  // ✅ Adiciona instrumentos APENAS se não existir (evita duplicação)
  if (!hasInstruments) {
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
  const englishTag = tag
    .replace(/\[INTRO\]/gi, "[INTRO]")
    .replace(/\[VERSO\]/gi, "[VERSE]")
    .replace(/\[VERSO\s+\d+\]/gi, "[VERSE]")
    .replace(/\[REFRÃO\]/gi, "[CHORUS]")
    .replace(/\[PRÉ-REFRÃO\]/gi, "[PRE-CHORUS]")
    .replace(/\[PONTE\]/gi, "[BRIDGE]")
    .replace(/\[SOLO\]/gi, "[SOLO]")
    .replace(/\[FINAL\]/gi, "[OUTRO]")
    .replace(/\[OUTRO\]/gi, "[OUTRO]")

  // ✅ ADICIONA INSTRUMENTOS PERFORMÁTICOS
  if (englishTag === "[INTRO]") {
    return `[INTRO - ${getIntroInstruments(genre)}]`
  }
  if (englishTag === "[VERSE]") {
    return `[VERSE 1 - ${getVerseInstruments(genre)}]`
  }
  if (englishTag === "[PRE-CHORUS]") {
    return `[PRE-CHORUS - ${getPreChorusInstruments(genre)}]`
  }
  if (englishTag === "[CHORUS]") {
    return `[CHORUS - ${getChorusInstruments(genre)}]`
  }
  if (englishTag === "[BRIDGE]") {
    return `[BRIDGE - ${getBridgeInstruments(genre)}]`
  }
  if (englishTag === "[SOLO]") {
    return `[SOLO - ${getSoloInstruments(genre)}]`
  }
  if (englishTag === "[OUTRO]") {
    return `[OUTRO - ${getOutroInstruments(genre)}]`
  }

  return englishTag
}

// ✅ FUNÇÕES DE INSTRUMENTOS (mantidas da versão anterior)
function getIntroInstruments(genre: string): string {
  const instruments: { [key: string]: string } = {
    Sertanejo: "Slow acoustic guitar, harmonica",
    "Sertanejo Moderno": "Acoustic guitar, synth pads",
    MPB: "Nylon guitar, light percussion",
    Funk: "Synth intro, drum machine",
    Rock: "Electric guitar riff, drums",
    Pop: "Synth intro, electronic beats",
  }
  return instruments[genre] || "Acoustic guitar, pads"
}

function getVerseInstruments(genre: string): string {
  const instruments: { [key: string]: string } = {
    Sertanejo: "Acoustic guitar, soft drums",
    "Sertanejo Moderno": "Acoustic guitar, electric bass, drums",
    MPB: "Nylon guitar, bass, light drums",
    Funk: "Drum machine, synth bass",
    Rock: "Electric guitar, bass, drums",
    Pop: "Piano, synth, drums",
  }
  return instruments[genre] || "Guitar, bass, drums"
}

function getPreChorusInstruments(genre: string): string {
  const instruments: { [key: string]: string } = {
    Sertanejo: "Rhodes keyboard, soft percussion",
    "Sertanejo Moderno": "Synth pads, percussion",
    MPB: "Piano, percussion",
    Funk: "Synth build-up, hi-hats",
    Rock: "Guitar arpeggios, cymbals",
    Pop: "Synth layers, drum fills",
  }
  return instruments[genre] || "Keys, percussion"
}

function getChorusInstruments(genre: string): string {
  const instruments: { [key: string]: string } = {
    Sertanejo: "Accordion, handclaps offbeat",
    "Sertanejo Moderno": "Full band, handclaps",
    MPB: "Full arrangement, percussion",
    Funk: "Full synth, heavy drums",
    Rock: "Full band, power chords",
    Pop: "Full production, backing vocals",
  }
  return instruments[genre] || "Full band"
}

function getBridgeInstruments(genre: string): string {
  const instruments: { [key: string]: string } = {
    Sertanejo: "Hammond organ, slide guitar",
    "Sertanejo Moderno": "Strings, electric guitar",
    MPB: "Strings, flute",
    Funk: "Synth breakdown, bass solo",
    Rock: "Guitar solo, organ",
    Pop: "Synth breakdown, vocal effects",
  }
  return instruments[genre] || "Strings, guitar"
}

function getSoloInstruments(genre: string): string {
  const instruments: { [key: string]: string } = {
    Sertanejo: "Tenor saxophone, blue note",
    "Sertanejo Moderno": "Electric guitar solo",
    MPB: "Nylon guitar solo",
    Funk: "Synth solo",
    Rock: "Electric guitar solo",
    Pop: "Synth solo",
  }
  return instruments[genre] || "Guitar solo"
}

function getOutroInstruments(genre: string): string {
  const instruments: { [key: string]: string } = {
    Sertanejo: "Fingerstyle viola caipira, synth pads",
    "Sertanejo Moderno": "Acoustic guitar, synth pads",
    MPB: "Nylon guitar, light strings",
    Funk: "Synth fade out",
    Rock: "Guitar feedback fade",
    Pop: "Synth fade, vocal echoes",
  }
  return instruments[genre] || "Guitar, pads"
}

// ✅ FORMATAÇÃO PADRÃO
function applyStandardFormatting(lyrics: string, genre: string): string {
  let formatted = lyrics

  // ✅ CORRIGE TAGS PARA INGLÊS
  formatted = formatted
    .replace(/\[INTRO\]/gi, "[INTRO]")
    .replace(/\[VERSO\]/gi, "[VERSE]")
    .replace(/\[REFRÃO\]/gi, "[CHORUS]")
    .replace(/\[PONTE\]/gi, "[BRIDGE]")
    .replace(/\[FINAL\]/gi, "[OUTRO]")

  // ✅ GARANTE INSTRUMENTOS EM INGLÊS
  if (!formatted.includes("(Instruments:")) {
    const instruments = getGenreInstruments(genre)
    formatted += `\n\n(Instruments: ${instruments})`
  }

  return formatted
}

// ✅ FUNÇÕES AUXILIARES
function getSyllableConfig(genre: string): { min: number; max: number; ideal: number } {
  const configs: { [key: string]: { min: number; max: number; ideal: number } } = {
    Sertanejo: { min: 9, max: 11, ideal: 10 },
    "Sertanejo Moderno": { min: 9, max: 11, ideal: 10 },
    MPB: { min: 7, max: 12, ideal: 9 },
    Funk: { min: 6, max: 10, ideal: 8 },
    Forró: { min: 8, max: 11, ideal: 9 },
    Rock: { min: 7, max: 11, ideal: 9 },
    Pop: { min: 7, max: 11, ideal: 9 },
    default: { min: 7, max: 11, ideal: 9 },
  }
  return configs[genre] || configs.default
}

function getGenreInstruments(genre: string): string {
  const instruments: { [key: string]: string } = {
    Sertanejo: "acoustic guitar, viola, bass, drums, accordion",
    "Sertanejo Moderno": "acoustic guitar, electric guitar, synth, bass, drums, accordion",
    MPB: "nylon guitar, piano, bass, light percussion",
    Funk: "drum machine, synth bass, samples, electronic beats",
    Forró: "accordion, triangle, zabumba, bass",
    Rock: "electric guitar, bass, drums, keyboard",
    Pop: "synth, drum machine, bass, piano, electronic elements",
    default: "guitar, bass, drums, keyboard",
  }
  return instruments[genre] || instruments.default
}

function getGenreBPM(genre: string): string {
  const bpms: { [key: string]: string } = {
    Sertanejo: "72",
    "Sertanejo Moderno": "85",
    MPB: "90",
    Funk: "110",
    Forró: "120",
    Rock: "130",
    Pop: "100",
    default: "100",
  }
  return bpms[genre] || bpms.default
}

function getPerformanceStyle(genre: string): string {
  const styles: { [key: string]: string } = {
    Sertanejo: "Sertanejo Raiz",
    "Sertanejo Moderno": "Modern Sertanejo",
    MPB: "MPB Classic",
    Funk: "Brazilian Funk",
    Forró: "Forró Pé-de-Serra",
    Rock: "Rock Nacional",
    Pop: "Brazilian Pop",
    default: "Original",
  }
  return styles[genre] || styles.default
}
