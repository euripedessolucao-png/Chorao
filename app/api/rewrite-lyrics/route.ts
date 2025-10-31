// app/api/rewrite-lyrics/route.ts - NOVA ABORDAGEM POR PARTES
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

// 🎯 GERAR MÚLTIPLAS OPÇÕES DE CADA PARTE
async function generateBlockVariations(
  blockType: MusicBlock["type"],
  genre: string,
  theme: string,
  originalLyrics: string,
  count = 3,
): Promise<MusicBlock[]> {
  const prompts = {
    INTRO: `Crie ${count} opções de INTRO (4 linhas) para ${genre} baseada nesta letra:
"${originalLyrics}"

Tema: ${theme}
Crie atmosfera emocional. Máximo 10 sílabas.

Opções de INTRO:`,

    VERSE: `Crie ${count} opções de VERSO (4 linhas) para ${genre} baseada nesta letra:
"${originalLyrics}"

Tema: ${theme}
Conte parte da história. Máximo 11 sílabas.

Opções de VERSO:`,

    CHORUS: `Crie ${count} opções de REFRÃO (4-6 linhas) para ${genre} baseada nesta letra:
"${originalLyrics}"

Tema: ${theme}  
Seja memorável e emocional. Máximo 12 sílabas.

Opções de REFRÃO:`,

    BRIDGE: `Crie ${count} opções de PONTE (4 linhas) para ${genre} baseada nesta letra:
"${originalLyrics}"

Tema: ${theme}
Momento de reflexão. Máximo 11 sílabas.

Opções de PONTE:`,

    OUTRO: `Crie ${count} opções de OUTRO (2-4 linhas) para ${genre} baseada nesta letra:
"${originalLyrics}"

Tema: ${theme}
Fecho emocional. Máximo 9 sílabas.

Opções de OUTRO:`,
  }

  const { text } = await generateText({
    model: "openai/gpt-4o-mini",
    prompt: prompts[blockType],
    temperature: 0.8,
  })

  // Processar as opções geradas
  return processGeneratedBlocks(text || "", blockType, count)
}

// 🧩 PROCESSAR BLOCO GERADOS
function processGeneratedBlocks(text: string, blockType: MusicBlock["type"], count: number): MusicBlock[] {
  const lines = text.split("\n").filter((line) => line.trim() && !line.match(/^(Opções|Crie|\d+\.)/))
  const blocks: MusicBlock[] = []

  let currentBlock: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith("[") && !trimmed.startsWith("(")) {
      currentBlock.push(trimmed)

      // Considerar bloco completo com 4-6 linhas
      if (currentBlock.length >= 4) {
        blocks.push({
          type: blockType,
          content: currentBlock.join("\n"),
          score: calculateBlockScore(currentBlock.join("\n")),
        })
        currentBlock = []

        if (blocks.length >= count) break
      }
    }
  }

  return blocks.slice(0, count)
}

// 📊 CALCULAR SCORE DO BLOCO
function calculateBlockScore(content: string): number {
  const lines = content.split("\n").filter((line) => line.trim())
  let score = 50 // Base

  // Bônus por número de linhas
  score += Math.min(lines.length * 5, 20)

  // Bônus por diversidade de palavras
  const words = content.split(/\s+/).filter((word) => word.length > 2)
  const uniqueWords = new Set(words.map((w) => w.toLowerCase()))
  score += Math.min(uniqueWords.size * 2, 20)

  // Bônus por estrutura completa
  if (lines.length >= 4) score += 10

  return Math.min(score, 100)
}

// 🏗️ MONTAR COMBINAÇÕES
function assembleCombinations(blocks: Record<string, MusicBlock[]>): string[] {
  const combinations: string[] = []
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

  // Gerar 3 combinações diferentes
  for (let combo = 0; combo < 3; combo++) {
    let lyrics = ""

    for (const section of structure) {
      const availableBlocks = blocks[section.type] || []
      if (availableBlocks.length > 0) {
        // Selecionar bloco baseado no score e variação
        const selectedIndex = combo % availableBlocks.length
        const selectedBlock = availableBlocks[selectedIndex]

        lyrics += `[${section.label}]\n${selectedBlock.content}\n\n`
      }
    }

    combinations.push(lyrics.trim())
  }

  return combinations
}

// 🏆 SELECIONAR MELHOR COMBINAÇÃO
async function selectBestCombination(combinations: string[], genre: string): Promise<string> {
  let bestScore = 0
  let bestLyrics = combinations[0]

  for (const lyrics of combinations) {
    const validated = await UnifiedSyllableManager.processSongWithBalance(lyrics)
    const syllableScore = calculateSyllableScore(validated)

    // Score por tamanho e estrutura
    const lines = validated.split("\n").filter((line) => line.trim() && !line.startsWith("["))
    const structureScore = Math.min(lines.length * 2, 50)

    const totalScore = syllableScore + structureScore

    if (totalScore > bestScore) {
      bestScore = totalScore
      bestLyrics = validated
    }
  }

  console.log(`🎯 Melhor combinação: ${bestScore} pontos`)
  return bestLyrics
}

// 📏 CALCULAR SCORE DE SÍLABAS
function calculateSyllableScore(lyrics: string): number {
  const lines = lyrics.split("\n").filter((line) => {
    const trimmed = line.trim()
    return trimmed && !trimmed.startsWith("[") && !trimmed.startsWith("(")
  })

  let validLines = 0
  lines.forEach((line) => {
    // Considerar válido se não tiver problemas óbvios
    if (!line.match(/\b(e|a|o|que|de|em|com)\s*$/i) && line.length > 5) {
      validLines++
    }
  })

  return (validLines / lines.length) * 50
}

export async function POST(request: NextRequest) {
  let genre = "Sertanejo"
  let theme = "Música"
  let title = "Música em Processamento"

  try {
    const { originalLyrics, genre: requestGenre, theme: requestTheme, title: requestTitle } = await request.json()

    genre = requestGenre || "Sertanejo"
    theme = requestTheme || "Música"
    title = requestTitle || `${theme} - ${genre}`

    if (!originalLyrics?.trim()) {
      return NextResponse.json({ error: "Letra original é obrigatória" }, { status: 400 })
    }

    console.log(`[API] 🎵 Gerando por partes: ${genre}`)

    // 🎯 1. GERAR MÚLTIPLAS OPÇÕES DE CADA PARTE
    console.log("[API] 🎲 Gerando variações de blocos...")

    const blockTypes: MusicBlock["type"][] = ["INTRO", "VERSE", "CHORUS", "BRIDGE", "OUTRO"]
    const allBlocks: Record<string, MusicBlock[]> = {}

    for (const blockType of blockTypes) {
      allBlocks[blockType] = await generateBlockVariations(blockType, genre, theme, originalLyrics, 3)
      console.log(`[API] ✅ ${blockType}: ${allBlocks[blockType].length} opções`)
    }

    // 🧩 2. MONTAR COMBINAÇÕES
    console.log("[API] 🧩 Montando combinações...")
    const combinations = assembleCombinations(allBlocks)

    // 🏆 3. SELECIONAR MELHOR
    console.log("[API] 🏆 Selecionando melhor combinação...")
    let finalLyrics = await selectBestCombination(combinations, genre)

    // ✨ 4. FORMATAÇÃO FINAL
    console.log("[API] ✨ Aplicando formatação...")
    const stackingResult = LineStacker.stackLines(finalLyrics)
    finalLyrics = stackingResult.stackedLyrics

    // 🎸 5. INSTRUMENTAÇÃO
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
        quality: "BLOCK_ASSEMBLED",
        method: "BLOCK_GENERATION",
      },
    })
  } catch (error) {
    console.error("[API] ❌ Erro:", error)

    // 🆘 FALLBACK TRADICIONAL
    const emergencyLyrics = `[Intro]
Música sendo reconstruída por partes
Com nova abordagem criativa
Em breve estará perfeita
Combinando as melhores opções

[Refrão]
Sistema de geração por blocos
Criando variações únicas
Selecionando o melhor conjunto
Para música autêntica

[Outro]
Processo em andamento

(Instrumentation)
(Genre: ${genre})`

    return NextResponse.json({
      success: true,
      lyrics: emergencyLyrics,
      title: title,
      metadata: {
        genre,
        totalLines: 8,
        quality: "FALLBACK",
        method: "TRADITIONAL",
      },
    })
  }
}

export async function GET() {
  return NextResponse.json({ error: "Método não permitido" }, { status: 405 })
}
