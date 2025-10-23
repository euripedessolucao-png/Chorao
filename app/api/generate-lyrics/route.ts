import { NextResponse } from "next/server"
import { generateText } from "ai"
import { getGenreConfig, detectSubGenre, getGenreRhythm } from "@/lib/genre-config"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { buildGenreRulesPrompt } from "@/lib/validation/genre-rules-builder"

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

    console.log("[v0] 🎵 [Create-Song] Parâmetros recebidos:", {
      genero: body.genero,
      tema: body.tema,
      humor: body.humor,
    })

    const { genero, humor, tema, additionalRequirements = "", performanceMode = "standard" } = body

    if (!genero || typeof genero !== "string" || !genero.trim()) {
      console.error("[v0] ❌ Gênero inválido:", genero)
      return NextResponse.json({ error: "Gênero é obrigatório e deve ser uma string válida" }, { status: 400 })
    }

    if (!tema || typeof tema !== "string" || !tema.trim()) {
      console.error("[v0] ❌ Tema inválido:", tema)
      return NextResponse.json({ error: "Tema é obrigatório e deve ser uma string válida" }, { status: 400 })
    }

    let genreRules
    try {
      genreRules = buildGenreRulesPrompt(genero)
      console.log("[v0] ✅ Regras de gênero construídas com sucesso")
    } catch (error) {
      console.error("[v0] ❌ Erro ao construir regras de gênero:", error)
      return NextResponse.json(
        {
          error: "Erro ao processar regras do gênero",
          details: error instanceof Error ? error.message : "Erro desconhecido",
        },
        { status: 500 },
      )
    }

    // ✅ CONFIGURAÇÃO DO GÊNERO
    const genreConfig = getGenreConfig(genero)
    const subGenreInfo = detectSubGenre(additionalRequirements)
    const defaultRhythm = getGenreRhythm(genero)
    const finalRhythm = subGenreInfo.rhythm || defaultRhythm

    const prompt = `Você é um compositor brasileiro especializado em ${genero}.

TAREFA: Criar uma música completa com estrutura profissional.

TEMA: ${tema}
HUMOR: ${humor || "Adaptado ao tema"}
${additionalRequirements ? `REQUISITOS: ${additionalRequirements}` : ""}

${genreRules.fullPrompt}

ESTRUTURA OBRIGATÓRIA:
[INTRO]
[VERSE 1]
4 linhas (máx 11 sílabas cada)

[PRE-CHORUS]
2 linhas (máx 11 sílabas cada)

[CHORUS]
4 linhas (máx 11 sílabas cada, gancho forte)

[VERSE 2]
4 linhas (máx 11 sílabas cada)

[CHORUS]
(repetir o mesmo refrão)

[BRIDGE]
4 linhas (máx 11 sílabas cada)

[CHORUS]
(repetir o mesmo refrão)

[OUTRO]

REGRAS CRÍTICAS:
- MÁXIMO 11 SÍLABAS POÉTICAS por linha
- Rimas naturais (ABAB ou AABB)
- Linguagem brasileira autêntica
- Evite clichês de IA
- Refrão memorável e repetível

Retorne a letra completa com as tags de seção.`

    console.log("[v0] 🎵 Gerando letra com OpenAI...")

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt: prompt,
      temperature: 0.8,
    })

    console.log("[v0] ✅ Letra gerada com sucesso!")

    const finalLyrics = capitalizeLines(text)

    return NextResponse.json({
      letra: finalLyrics,
      titulo: `${tema} - ${genero}`,
      metadata: {
        score: 85,
        genre: genero,
        rhythm: finalRhythm,
        performanceMode: performanceMode,
      },
    })
  } catch (error) {
    console.error("[v0] ❌ Erro ao criar música:", error)
    return NextResponse.json(
      {
        error: "Erro ao criar música",
        details: error instanceof Error ? error.message : "Erro desconhecido",
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

// ✅ CONSTRÓI REQUISITOS
function buildCompleteRequirements(
  baseRequirements: string,
  generatedChorus: ChorusData | null,
  generatedHook: HookData | null,
  performanceMode: string,
): string {
  let requirements = baseRequirements

  const performanceInstruction =
    performanceMode === "performance"
      ? `🎭 MODO PERFORMÁTICO ATIVADO:
- TAGS EM INGLÊS: [SECTION - Instruments]
- VERSOS EM PORTUGUÊS: Apenas a parte cantada
- BACKING VOCALS: (Backing: "Oh, oh") em inglês
- INSTRUMENTOS: Descrições detalhadas em inglês`
      : `📝 MODO PADRÃO:
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
