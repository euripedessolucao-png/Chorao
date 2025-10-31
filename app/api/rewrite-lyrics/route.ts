// app/api/rewrite-lyrics/route.ts - VERSÃO CORRIGIDA
import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { formatInstrumentationForAI } from "@/lib/normalized-genre"
import { LineStacker } from "@/lib/utils/line-stacker"
import { UnifiedSyllableManager } from "@/lib/syllable-management/unified-syllable-manager"
import { parseLyricSections } from "@/lib/validation/parser"

// 🎵 TIPOS DE BLOCO MUSICAL
interface MusicBlock {
  type: "INTRO" | "VERSE" | "PRE_CHORUS" | "CHORUS" | "BRIDGE" | "OUTRO"
  content: string
  lines: string[]
  score: number
}

// 🎯 GERAR MÚLTIPLAS OPÇÕES DE CADA PARTE (CORRIGIDO)
async function generateBlockVariations(
  blockType: MusicBlock["type"],
  genre: string,
  theme: string,
  originalLyrics: string,
  count = 2, // Reduzido para melhor performance
): Promise<MusicBlock[]> {
  
  const lineTargets = {
    INTRO: 4,
    VERSE: 4,
    PRE_CHORUS: 3,
    CHORUS: 4,
    BRIDGE: 4,
    OUTRO: 3
  }

  const prompts = {
    INTRO: `Crie ${count} opções de INTRO (${lineTargets.INTRO} linhas) para música ${genre} sobre "${theme}".

Letra original como referência:
"${originalLyrics.substring(0, 200)}..."

INSTRUÇÕES:
- ${lineTargets.INTRO} linhas cada opção
- Máximo 10 sílabas por linha
- Crie atmosfera emocional
- Use linguagem natural brasileira

FORMATO:
Opção 1:
Linha 1
Linha 2
Linha 3
Linha 4

Opção 2:
Linha 1
Linha 2
Linha 3
Linha 4`,

    VERSE: `Crie ${count} opções de VERSO (${lineTargets.VERSE} linhas) para música ${genre} sobre "${theme}".

Letra original como referência:
"${originalLyrics.substring(0, 200)}..."

INSTRUÇÕES:
- ${lineTargets.VERSE} linhas cada opção  
- Máximo 11 sílabas por linha
- Conte parte da história
- Desenvolva o tema "${theme}"

FORMATO:
Opção 1:
Linha 1
Linha 2  
Linha 3
Linha 4

Opção 2:
Linha 1
Linha 2
Linha 3
Linha 4`,

    CHORUS: `Crie ${count} opções de REFRÃO (${lineTargets.CHORUS} linhas) para música ${genre} sobre "${theme}".

Letra original como referência:
"${originalLyrics.substring(0, 200)}..."

INSTRUÇÕES:
- ${lineTargets.CHORUS} linhas cada opção
- Máximo 12 sílabas por linha
- Seja memorável e emocional
- Fácil de cantar junto

FORMATO:
Opção 1:
Linha 1
Linha 2
Linha 3
Linha 4

Opção 2:
Linha 1
Linha 2
Linha 3
Linha 4`
  }

  try {
    const prompt = prompts[blockType] || prompts.VERSE
    
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.7,
      maxTokens: 500,
    })

    console.log(`[BlockGen] ${blockType} generated:`, text?.substring(0, 100))
    
    // Processar as opções geradas
    return processGeneratedBlocks(text || "", blockType, count, lineTargets[blockType])
  } catch (error) {
    console.error(`[BlockGen] Erro em ${blockType}:`, error)
    return generateFallbackBlocks(blockType, theme, lineTargets[blockType], count)
  }
}

// 🧩 PROCESSAR BLOCO GERADOS (CORRIGIDO)
function processGeneratedBlocks(
  text: string, 
  blockType: MusicBlock["type"], 
  count: number,
  targetLines: number
): MusicBlock[] {
  const blocks: MusicBlock[] = []
  const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0)

  let currentBlock: string[] = []
  let inOption = false

  for (const line of lines) {
    // Detecta início de uma nova opção
    if (line.match(/^(Opção|Option|Versão|Variação)\s*\d+/i)) {
      if (currentBlock.length >= 2) { // Aceita blocos com pelo menos 2 linhas
        blocks.push(createMusicBlock(blockType, currentBlock))
      }
      currentBlock = []
      inOption = true
      continue
    }

    // Se está dentro de uma opção e a linha não é numeração ou marcador
    if (inOption && !line.match(/^\d+[\.\)]/) && !line.match(/^[-*]/)) {
      currentBlock.push(line)
      
      // Se atingiu o número target de linhas, finaliza o bloco
      if (currentBlock.length >= targetLines) {
        blocks.push(createMusicBlock(blockType, currentBlock))
        currentBlock = []
        inOption = false
        
        if (blocks.length >= count) break
      }
    }
  }

  // Adiciona o último bloco se tiver conteúdo
  if (currentBlock.length >= 2 && blocks.length < count) {
    blocks.push(createMusicBlock(blockType, currentBlock))
  }

  return blocks.slice(0, count)
}

function createMusicBlock(type: MusicBlock["type"], lines: string[]): MusicBlock {
  const content = lines.join("\n")
  return {
    type,
    content,
    lines,
    score: calculateBlockScore(content)
  }
}

// 🆘 GERAR BLOCOS DE FALLBACK
function generateFallbackBlocks(
  blockType: MusicBlock["type"], 
  theme: string, 
  lineCount: number,
  count: number
): MusicBlock[] {
  const blocks: MusicBlock[] = []
  
  const templates = {
    INTRO: [
      `Pensando em ${theme}\nNo silêncio da emoção\nUm sentimento que cresce\nDentro do coração`,
      `Começando essa história\nCom verdade e emoção\nFalando sobre ${theme}\nCom todo o coração`
    ],
    VERSE: [
      `A vida me ensinou\nSobre ${theme} e emoção\nCada momento vivido\nTem um novo significado`,
      `Caminhando em frente\nCom ${theme} no pensamento\nSuperando desafios\nAprendendo a cada momento`
    ],
    CHORUS: [
      `É ${theme} no coração\nUma linda emoção\nCantando com sentimento\nNessa canção`,
      `${theme} que me inspira\nMeu coração suspira\nUma história bonita\nQue nunca termina`
    ]
  }

  const template = templates[blockType] || templates.VERSE
  
  for (let i = 0; i < count && i < template.length; i++) {
    const lines = template[i].split("\n")
    blocks.push(createMusicBlock(blockType, lines))
  }

  return blocks
}

// 📊 CALCULAR SCORE DO BLOCO (MELHORADO)
function calculateBlockScore(content: string): number {
  const lines = content.split("\n").filter(line => line.trim())
  let score = 60 // Base mais alta

  // Bônus por número adequado de linhas
  if (lines.length >= 3 && lines.length <= 6) {
    score += 20
  }

  // Bônus por diversidade vocabular
  const words = content.toLowerCase().split(/\s+/).filter(word => word.length > 2)
  const uniqueWords = new Set(words)
  score += Math.min(uniqueWords.size, 15)

  // Penalidade por linhas muito curtas
  const shortLines = lines.filter(line => line.length < 4).length
  score -= shortLines * 5

  return Math.min(100, Math.max(30, score))
}

// 🏗️ MONTAR COMBINAÇÕES (CORRIGIDO)
function assembleCombinations(blocks: Record<string, MusicBlock[]>): string[] {
  const combinations: string[] = []
  
  // Estrutura simplificada e mais flexível
  const structures = [
    ["INTRO", "VERSE", "CHORUS", "VERSE", "CHORUS", "OUTRO"],
    ["VERSE", "CHORUS", "VERSE", "CHORUS", "BRIDGE", "CHORUS"],
    ["INTRO", "VERSE", "CHORUS", "BRIDGE", "CHORUS", "OUTRO"]
  ]

  const sectionLabels: Record<string, string> = {
    INTRO: "Intro",
    VERSE: "Verso",
    PRE_CHORUS: "Pré-Refrão", 
    CHORUS: "Refrão",
    BRIDGE: "Ponte",
    OUTRO: "Outro"
  }

  for (const structure of structures) {
    let lyrics = ""
    let verseCount = 1
    let chorusCount = 1

    for (const sectionType of structure) {
      const availableBlocks = blocks[sectionType] || []
      if (availableBlocks.length > 0) {
        // Seleciona o melhor bloco disponível
        const bestBlock = availableBlocks.reduce((best, current) => 
          current.score > best.score ? current : best
        )

        let label = sectionLabels[sectionType] || sectionType
        
        // Numera versos e refrões
        if (sectionType === "VERSE") {
          label = `Verso ${verseCount}`
          verseCount++
        } else if (sectionType === "CHORUS") {
          label = `Refrão ${chorusCount}`
          chorusCount++
        }

        lyrics += `[${label}]\n${bestBlock.content}\n\n`
      }
    }

    if (lyrics.trim()) {
      combinations.push(lyrics.trim())
    }
  }

  return combinations.length > 0 ? combinations : [generateSimpleFallbackLyric()]
}

// 🏆 SELECIONAR MELHOR COMBINAÇÃO (CORRIGIDO)
async function selectBestCombination(combinations: string[], genre: string): Promise<string> {
  if (combinations.length === 0) {
    return generateSimpleFallbackLyric()
  }

  let bestScore = 0
  let bestLyrics = combinations[0]

  for (const lyrics of combinations) {
    try {
      // Valida sílabas primeiro
      const validated = await UnifiedSyllableManager.processSongWithBalance(lyrics)
      
      // Score por estrutura
      const sections = parseLyricSections(validated)
      const structureScore = Math.min(sections.length * 10, 40)
      
      // Score por linhas válidas
      const totalLines = validated.split("\n").filter(line => {
        const trimmed = line.trim()
        return trimmed && !trimmed.startsWith("[") && !trimmed.startsWith("(")
      }).length
      const lineScore = Math.min(totalLines * 2, 30)
      
      const totalScore = structureScore + lineScore

      if (totalScore > bestScore) {
        bestScore = totalScore
        bestLyrics = validated
      }
    } catch (error) {
      console.error("[Selection] Erro avaliando combinação:", error)
    }
  }

  console.log(`🎯 Melhor combinação selecionada: ${bestScore} pontos`)
  return bestLyrics
}

// 🎼 GERAR LETRA SIMPLES DE FALLBACK
function generateSimpleFallbackLyric(): string {
  return `[Intro]
Começando essa canção
Com muito sentimento

[Verso 1]
A vida é uma jornada
Cheia de aprendizado
Cada dia é uma página
De um livro especial

[Refrão]
Cantando com alegria
Com o coração em paz
Uma música que acalma
E nunca vai acabar

[Verso 2]
Os momentos são únicos
As memórias ficarão
No álbum da vida
Sempre lembraremos

[Refrão]
Cantando com alegria  
Com o coração em paz
Uma música que acalma
E nunca vai acabar

[Outro]
Até a próxima vez`
}

export async function POST(request: NextRequest) {
  let genre = "Sertanejo"
  let theme = "Música"
  let title = "Música Renascida"

  try {
    const { originalLyrics, genre: requestGenre, theme: requestTheme, title: requestTitle } = await request.json()

    genre = requestGenre || "Sertanejo"
    theme = requestTheme || "Música" 
    title = requestTitle || `${theme} - ${genre}`

    if (!originalLyrics?.trim()) {
      return NextResponse.json({ error: "Letra original é obrigatória" }, { status: 400 })
    }

    console.log(`[API] 🎵 Iniciando reescrita por partes: ${genre} - "${theme}"`)

    // 🎯 1. GERAR OPÇÕES DE BLOCOS PRINCIPAIS (reduzido para performance)
    console.log("[API] 🎲 Gerando blocos principais...")
    
    const mainBlockTypes: MusicBlock["type"][] = ["INTRO", "VERSE", "CHORUS", "OUTRO"]
    const allBlocks: Record<string, MusicBlock[]> = {}

    for (const blockType of mainBlockTypes) {
      try {
        allBlocks[blockType] = await generateBlockVariations(blockType, genre, theme, originalLyrics, 2)
        console.log(`[API] ✅ ${blockType}: ${allBlocks[blockType].length} opções geradas`)
      } catch (error) {
        console.error(`[API] ❌ Erro em ${blockType}:`, error)
        allBlocks[blockType] = generateFallbackBlocks(blockType, theme, 4, 2)
      }
    }

    // 🧩 2. MONTAR COMBINAÇÕES
    console.log("[API] 🧩 Montando combinações...")
    const combinations = assembleCombinations(allBlocks)
    console.log(`[API] ✅ ${combinations.length} combinações criadas`)

    // 🏆 3. SELECIONAR MELHOR
    console.log("[API] 🏆 Selecionando melhor combinação...")
    let finalLyrics = await selectBestCombination(combinations, genre)

    // ✨ 4. APLICAR FORMATAÇÃO E MELHORIAS
    console.log("[API] ✨ Aplicando melhorias...")
    
    // Aplica stack de linhas se disponível
    try {
      const stackingResult = LineStacker.stackLines(finalLyrics)
      finalLyrics = stackingResult.stackedLyrics
    } catch (error) {
      console.log("[API] ℹ️ LineStacker não disponível, continuando...")
    }

    // 🎸 5. ADICIONAR INSTRUMENTAÇÃO
    try {
      if (!finalLyrics.includes("(Instrumentation)")) {
        const instrumentation = formatInstrumentationForAI(genre, finalLyrics)
        finalLyrics = `${finalLyrics}\n\n${instrumentation}`
      }
    } catch (error) {
      console.log("[API] ℹ️ Instrumentação não disponível, continuando...")
    }

    const totalLines = finalLyrics.split("\n").filter(line => line.trim()).length
    console.log(`[API] 🎉 CONCLUÍDO: "${title}" - ${totalLines} linhas`)

    return NextResponse.json({
      success: true,
      lyrics: finalLyrics,
      title: title,
      metadata: {
        genre,
        theme, 
        totalLines,
        quality: "BLOCK_ASSEMBLED",
        method: "BLOCK_GENERATION",
        timestamp: new Date().toISOString()
      },
    })

  } catch (error) {
    console.error("[API] ❌ Erro crítico:", error)
    
    // Fallback robusto
    const emergencyLyrics = generateSimpleFallbackLyric()

    return NextResponse.json({
      success: true,
      lyrics: emergencyLyrics,
      title: title,
      metadata: {
        genre,
        theme,
        totalLines: emergencyLyrics.split("\n").filter(line => line.trim()).length,
        quality: "FALLBACK",
        method: "EMERGENCY",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      },
    })
  }
}

export async function GET() {
  return NextResponse.json({ 
    error: "Método não permitido",
    message: "Use POST para reescrever letras"
  }, { status: 405 })
}
