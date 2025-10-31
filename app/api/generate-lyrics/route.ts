// app/api/generate-lyrics/route.ts - NOVA VERSÃO SIMPLIFICADA
import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { formatInstrumentationForAI } from "@/lib/normalized-genre"
import { LineStacker } from "@/lib/utils/line-stacker"
import { UnifiedSyllableManager } from "@/lib/syllable-management/unified-syllable-manager"

// 🎵 TIPOS DE BLOCO MUSICAL
interface MusicBlock {
  type: "INTRO" | "VERSE" | "PRE_CHORUS" | "CHORUS" | "BRIDGE" | "OUTRO"
  content: string
  score: number
}

// 🎯 GERAR REFRÕES COMO PONTO CENTRAL
async function generateChorusOptions(genre: string, theme: string, mood: string): Promise<MusicBlock[]> {
  try {
    const prompt = `Crie 3 opções de REFRÃO memorável para ${genre} sobre "${theme}"

REGRAS:
- 4-6 linhas por refrão
- Máximo 12 sílabas por verso  
- Gancho emocional forte
- Fácil de cantar junto
- Linguagem natural brasileira

Exemplo bom:
"Teu abraço é meu porto seguro
Onde encontro paz e futuro
Cada instante ao teu lado
É um presente abençoado"

Gere 3 opções de REFRÃO:`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.8,
    })

    return processChorusOptions(text || "", genre)
  } catch (error) {
    console.error("[Chorus] Erro:", error)
    return []
  }
}

// 🧩 PROCESSAR REFRÕES GERADOS
function processChorusOptions(text: string, genre: string): MusicBlock[] {
  const blocks: MusicBlock[] = []
  const lines = text.split("\n").filter((line) => {
    const trimmed = line.trim()
    return trimmed && !trimmed.match(/^(Opção|Refrão|\d+[.)])/i)
  })

  let currentChorus: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed) {
      currentChorus.push(trimmed)

      if (currentChorus.length >= 4) {
        const content = currentChorus.join("\n")
        blocks.push({
          type: "CHORUS",
          content: content,
          score: calculateBlockScore(content),
        })
        currentChorus = []

        if (blocks.length >= 3) break
      }
    }
  }

  return blocks
}

// 🎲 GERAR OUTROS BLOCOS BASEADOS NO REFRÃO
async function generateOtherBlocks(
  selectedChorus: string,
  blockType: "INTRO" | "VERSE" | "BRIDGE" | "OUTRO",
  genre: string,
  theme: string,
): Promise<MusicBlock[]> {
  const prompts = {
    INTRO: `Crie INTRO (4 linhas) para ${genre} que prepare para este REFRÃO:
"${selectedChorus}"

Tema: ${theme}
Crie atmosfera emocional. Máximo 10 sílabas.

INTRO:`,

    VERSE: `Crie VERSO (4 linhas) para ${genre} que construa para este REFRÃO:
"${selectedChorus}"

Tema: ${theme}
Conte parte da história. Máximo 11 sílabas.

VERSO:`,

    BRIDGE: `Crie PONTE (4 linhas) para ${genre} que complemente este REFRÃO:
"${selectedChorus}"

Tema: ${theme}
Momento de reflexão. Máximo 11 sílabas.

PONTE:`,

    OUTRO: `Crie OUTRO (2-4 linhas) para ${genre} que feche após este REFRÃO:
"${selectedChorus}"

Tema: ${theme}
Fecho emocional. Máximo 9 sílabas.

OUTRO:`,
  }

  const { text } = await generateText({
    model: "openai/gpt-4o-mini",
    prompt: prompts[blockType],
    temperature: 0.7,
  })

  return processGeneratedBlocks(text || "", blockType)
}

// 🧩 PROCESSAR BLOCOS GERADOS
function processGeneratedBlocks(text: string, blockType: MusicBlock["type"]): MusicBlock[] {
  const lines = text.split("\n").filter((line) => {
    const trimmed = line.trim()
    return trimmed && !trimmed.startsWith("[") && !trimmed.startsWith("(")
  })

  const blocks: MusicBlock[] = []
  const currentBlock: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed) {
      currentBlock.push(trimmed)

      const minLines = blockType === "OUTRO" ? 2 : 4
      if (currentBlock.length >= minLines) {
        blocks.push({
          type: blockType,
          content: currentBlock.join("\n"),
          score: calculateBlockScore(currentBlock.join("\n")),
        })
        break // Uma opção por bloco para simplicidade
      }
    }
  }

  return blocks
}

// 📊 CALCULAR SCORE DO BLOCO
function calculateBlockScore(content: string): number {
  const lines = content.split("\n").filter((line) => line.trim())
  let score = 70 // Base

  // Bônus por número de linhas ideal
  if (lines.length >= 4) score += 10

  // Bônus por versos completos
  const completeLines = lines.filter((line) => line.length > 5 && !line.match(/\b(e|a|o|que|de|em|com)\s*$/i))
  score += (completeLines.length / lines.length) * 20

  return Math.min(score, 100)
}

// 🏗️ MONTAR MÚSICA COMPLETA
async function assembleCompleteSong(
  chorus: MusicBlock,
  otherBlocks: Record<string, MusicBlock[]>,
  genre: string,
): Promise<string> {
  const structure = [
    { type: "INTRO", label: "Intro" },
    { type: "VERSE", label: "Verso 1" },
    { type: "CHORUS", label: "Refrão" },
    { type: "VERSE", label: "Verso 2" },
    { type: "CHORUS", label: "Refrão" },
    { type: "BRIDGE", label: "Ponte" },
    { type: "CHORUS", label: "Refrão Final" },
    { type: "OUTRO", label: "Outro" },
  ]

  let lyrics = ""

  for (const section of structure) {
    if (section.type === "CHORUS") {
      lyrics += `[${section.label}]\n${chorus.content}\n\n`
    } else {
      const availableBlocks = otherBlocks[section.type] || []
      if (availableBlocks.length > 0) {
        lyrics += `[${section.label}]\n${availableBlocks[0].content}\n\n`
      }
    }
  }

  return await UnifiedSyllableManager.processSongWithBalance(lyrics.trim())
}

export async function POST(request: NextRequest) {
  let genre = "Sertanejo"
  let theme = "Música"
  let title = "Música em Processamento"

  try {
    const {
      genre: requestGenre,
      theme: requestTheme,
      title: requestTitle,
      mood = "neutro",
      additionalRequirements = "",
    } = await request.json()

    genre = requestGenre || "Sertanejo"
    theme = requestTheme || "Música"
    title = requestTitle || `${theme} - ${genre}`

    if (!genre) {
      return NextResponse.json({ error: "Gênero é obrigatório" }, { status: 400 })
    }

    console.log(`[API] 🎵 Gerando música com refrão central: ${genre}`)

    // 🎶 Gerando refrões...
    console.log("[API] 🎶 Gerando refrões...")
    const chorusOptions = await generateChorusOptions(genre, theme, mood)

    if (chorusOptions.length === 0) {
      throw new Error("Não foi possível gerar refrões")
    }

    // Selecionar melhor refrão
    const bestChorus = chorusOptions.reduce((best, current) => (current.score > best.score ? current : best))
    console.log(`[API] ✅ Refrão selecionado: ${bestChorus.score} pontos`)

    // 🧩 Gerando blocos complementares...
    console.log("[API] 🧩 Gerando blocos complementares...")
    const otherBlocks: Record<string, MusicBlock[]> = {}

    const blockTypes: ("INTRO" | "VERSE" | "BRIDGE" | "OUTRO")[] = ["INTRO", "VERSE", "BRIDGE", "OUTRO"]

    for (const blockType of blockTypes) {
      otherBlocks[blockType] = await generateOtherBlocks(bestChorus.content, blockType, genre, theme)
      console.log(`[API] ✅ ${blockType}: ${otherBlocks[blockType].length} opções`)
    }

    // 🏗️ Montando música completa...
    console.log("[API] 🏗️ Montando música completa...")
    let finalLyrics = await assembleCompleteSong(bestChorus, otherBlocks, genre)

    // ✨ Aplicando formatação...
    console.log("[API] ✨ Aplicando formatação...")
    const stackingResult = LineStacker.stackLines(finalLyrics)
    finalLyrics = stackingResult.stackedLyrics

    // 🎸 INSTRUMENTAÇÃO
    if (!finalLyrics.includes("(Instrumentation)")) {
      const instrumentation = formatInstrumentationForAI(genre, finalLyrics)
      finalLyrics = `${finalLyrics}\n\n${instrumentation}`
    }

    const totalLines = finalLyrics.split("\n").filter((line) => line.trim()).length
    console.log(`[API] 🎉 CONCLUÍDO: ${totalLines} linhas`)

    return NextResponse.json({
      success: true,
      lyrics: finalLyrics,
      title: title,
      metadata: {
        genre,
        totalLines,
        quality: "CHORUS_CENTERED",
        method: "CHORUS_FIRST",
        chorusScore: bestChorus.score,
      },
    })
  } catch (error) {
    console.error("[API] ❌ Erro:", error)

    // 🆘 FALLBACK SIMPLES
    const emergencyLyrics = `[Intro]
Música sendo criada com nova abordagem
Começando pelo refrão central
Para qualidade garantida

[Refrão]
Sistema de geração inteligente
Construindo em torno do coração
Refrão forte como base
Versos que completam a emoção

[Verso 1]
Cada parte gerada com cuidado
Para criar uma história completa
Com começo, meio e fim
Na mais pura conexão

[Refrão]
Sistema de geração inteligente
Construindo em torno do coração
Refrão forte como base
Versos que completam a emoção

[Outro]
Processo em finalização

(Instrumentation)
(Genre: ${genre})`

    return NextResponse.json({
      success: true,
      lyrics: emergencyLyrics,
      title: title,
      metadata: {
        genre,
        totalLines: 12,
        quality: "FALLBACK",
        method: "TRADITIONAL",
      },
    })
  }
}

export async function GET() {
  return NextResponse.json({ error: "Método não permitido" }, { status: 405 })
}
