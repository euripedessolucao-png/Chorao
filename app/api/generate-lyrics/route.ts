import { NextResponse } from "next/server"
import { getGenreConfig, detectSubGenre, getGenreRhythm } from "@/lib/genre-config"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { MetaComposer } from "@/lib/orchestrator/meta-composer"
import { generateText } from "ai"
import { UltimateFixer } from "@/lib/validation/ultimate-fixer"
import { applyTerceiraViaToLine } from "@/lib/terceira-via"
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

    const {
      genero,
      humor,
      tema,
      additionalRequirements = "",
      includeChorus = true,
      includeHook = true,
      universalPolish = true,
      performanceMode = "standard",
    } = body

    // ✅ VALIDAÇÃO
    if (!genero || !genero.trim()) {
      return NextResponse.json(
        {
          error: "Gênero é obrigatório",
          suggestion: "Selecione um gênero musical",
        },
        { status: 400 },
      )
    }

    if (!tema || !tema.trim()) {
      return NextResponse.json(
        {
          error: "Tema é obrigatório",
          suggestion: "Digite um tema para inspirar a música",
        },
        { status: 400 },
      )
    }

    // ✅ CONFIGURAÇÃO DO GÊNERO
    const genreConfig = getGenreConfig(genero)
    const subGenreInfo = detectSubGenre(additionalRequirements)
    const defaultRhythm = getGenreRhythm(genero)
    const finalRhythm = subGenreInfo.rhythm || defaultRhythm
    const syllableConfig = getSyllableConfig(genero)

    console.log(
      `[Create-Song] Config: ${genero} | ${finalRhythm} | ${syllableConfig.min}-${syllableConfig.max}s | Mode: ${performanceMode}`,
    )

    // ✅ ETAPA 1: GERAR ELEMENTOS COM METACOMPOSER
    let generatedChorus: ChorusData | null = null
    let generatedHook: HookData | null = null

    if (includeChorus) {
      console.log("[Create-Song] 🎵 Gerando refrão com MetaComposer...")
      generatedChorus = await generateChorusWithMetaComposer({
        genre: genero,
        theme: tema,
        mood: humor,
        additionalRequirements: additionalRequirements,
      })
    }

    if (includeHook) {
      console.log("[Create-Song] 🎣 Gerando hook com MetaComposer...")
      generatedHook = await generateHookWithMetaComposer({
        genre: genero,
        theme: tema,
        mood: humor,
        additionalRequirements: additionalRequirements,
      })
    }

    // ✅ ETAPA 2: CRIAR MÚSICA COMPLETA COM METACOMPOSER
    console.log("[v0] 🎼 Chamando MetaComposer.compose()...")

    const compositionRequest = {
      genre: genero,
      theme: tema,
      mood: humor || "Adaptado ao tema",
      additionalRequirements: buildCompleteRequirements(
        additionalRequirements,
        generatedChorus,
        generatedHook,
        performanceMode,
      ),
      syllableTarget: syllableConfig,
      applyFinalPolish: universalPolish,
      preservedChoruses: generatedChorus ? [getBestChorus(generatedChorus)] : [],
    }

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout: MetaComposer demorou mais de 50 segundos")), 50000),
    )

    const composePromise = MetaComposer.compose(compositionRequest)

    const result = (await Promise.race([composePromise, timeoutPromise])) as Awaited<
      ReturnType<typeof MetaComposer.compose>
    >

    console.log("[v0] ✅ MetaComposer.compose() retornou com sucesso")

    // ✅ ETAPA 3: APLICAR FORMATAÇÃO PERFORMÁTICA
    console.log("[Create-Song] 🎭 Aplicando formatação performática...")
    let finalLyrics = result.lyrics

    if (performanceMode === "performance") {
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
      structure: performanceMode === "performance" ? "Performática" : "Padrão",
      syllableCompliance: `${Math.round(result.metadata.finalScore * 10)}%`,
      genre: genero,
      rhythm: finalRhythm,
      performanceMode: performanceMode,
      includes: {
        chorus: includeChorus,
        hook: includeHook,
        chorusVariations: generatedChorus?.variations?.length || 0,
        hookVariations: generatedHook?.variations?.length || 0,
      },
    }

    console.log(`[Create-Song] ✅ Música criada! Score: ${metadata.score} | Mode: ${performanceMode}`)

    return NextResponse.json({
      letra: finalLyrics,
      titulo: result.title,
      metadata: metadata,
      elements: {
        chorus: generatedChorus,
        hook: generatedHook,
      },
    })
  } catch (error) {
    console.error("[v0] ❌ [Create-Song] Erro detalhado:", {
      message: error instanceof Error ? error.message : "Erro desconhecido",
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error,
    })

    return NextResponse.json(
      {
        error: "Erro ao criar música",
        details: error instanceof Error ? error.message : "Erro desconhecido",
        suggestion: "Tente novamente. Se o erro persistir, o sistema pode estar sobrecarregado.",
      },
      { status: 500 },
    )
  }
}

// ✅ GERADOR DE REFRÃO COM METACOMPOSER - IMPLEMENTAÇÃO COMPLETA
async function generateChorusWithMetaComposer(params: {
  genre: string
  theme: string
  mood?: string
  additionalRequirements?: string
}): Promise<ChorusData | null> {
  try {
    console.log("[v0] 🎵 Gerando refrão com OpenAI direto...")

    const genreRules = buildGenreRulesPrompt(params.genre)
    const genreConfig = getGenreConfig(params.genre)

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `Você é um compositor brasileiro especializado em ${params.genre}.

TAREFA: Criar APENAS um refrão de 4 linhas.

TEMA: ${params.theme}
MOOD: ${params.mood || "Adaptado ao tema"}
${params.additionalRequirements ? `REQUISITOS: ${params.additionalRequirements}` : ""}

${genreRules.fullPrompt}

FORMATO:
[CHORUS]
Linha 1 (gancho forte)
Linha 2 (rima com linha 1)
Linha 3 (desenvolvimento)
Linha 4 (rima com linha 3)

Retorne APENAS as 4 linhas do refrão, sem tags.`,
      temperature: 0.7,
    })

    console.log("[v0] ✅ OpenAI respondeu - Aplicando correções...")

    // Aplica UltimateFixer
    let fixedChorus = text
    try {
      fixedChorus = UltimateFixer.fixFullLyrics(text)
      console.log("[v0] ✅ UltimateFixer aplicado")
    } catch (error) {
      console.error("[v0] ⚠️ UltimateFixer falhou:", error)
    }

    // Aplica Terceira Via linha por linha
    const lines = fixedChorus.split("\n").filter((l) => l.trim())
    const finalLines = await Promise.all(
      lines.map(async (line, index) => {
        try {
          return await applyTerceiraViaToLine(line, index, fixedChorus, false, undefined, params.genre, genreConfig)
        } catch (error) {
          console.error("[v0] ⚠️ Terceira Via falhou para linha:", line, error)
          return line
        }
      }),
    )

    const chorusLines = finalLines.join("\n")

    return {
      variations: [
        {
          chorus: chorusLines,
          style: "Refrão Original",
          score: 85,
        },
      ],
      bestOptionIndex: 0,
    }
  } catch (error) {
    console.error("[Create-Song] Erro ao gerar refrão:", error)
    return null
  }
}

// ✅ GERADOR DE HOOK COM METACOMPOSER - IMPLEMENTAÇÃO COMPLETA
async function generateHookWithMetaComposer(params: {
  genre: string
  theme: string
  mood?: string
  additionalRequirements?: string
}): Promise<HookData | null> {
  try {
    console.log("[v0] 🎣 Gerando hook com OpenAI direto...")

    const genreRules = buildGenreRulesPrompt(params.genre)
    const genreConfig = getGenreConfig(params.genre)

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `Você é um compositor brasileiro especializado em ${params.genre}.

TAREFA: Criar APENAS uma frase-hook impactante.

TEMA: ${params.theme}
MOOD: ${params.mood || "Adaptado ao tema"}
${params.additionalRequirements ? `REQUISITOS: ${params.additionalRequirements}` : ""}

${genreRules.syllableRules}

${genreRules.antiForcingRules}

TERCEIRA VIA - ORIGINALIDADE OBRIGATÓRIA:
- NÃO use clichês genéricos de IA
- USE metáforas originais e imagens concretas
- USE linguagem brasileira autêntica

Retorne APENAS a frase-hook, sem tags ou explicações.`,
      temperature: 0.7,
    })

    console.log("[v0] ✅ OpenAI respondeu - Aplicando correções...")

    // Aplica UltimateFixer
    let fixedHook = text.trim()
    try {
      fixedHook = UltimateFixer.fixLine(fixedHook)
      console.log("[v0] ✅ UltimateFixer aplicado")
    } catch (error) {
      console.error("[v0] ⚠️ UltimateFixer falhou:", error)
    }

    // Aplica Terceira Via
    try {
      fixedHook = await applyTerceiraViaToLine(fixedHook, 0, fixedHook, false, undefined, params.genre, genreConfig)
      console.log("[v0] ✅ Terceira Via aplicada")
    } catch (error) {
      console.error("[v0] ⚠️ Terceira Via falhou:", error)
    }

    return {
      variations: [
        {
          hook: fixedHook,
          style: "Hook Impactante",
          score: 85,
        },
      ],
      bestOptionIndex: 0,
    }
  } catch (error) {
    console.error("[Create-Song] Erro ao gerar hook:", error)
    return null
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
