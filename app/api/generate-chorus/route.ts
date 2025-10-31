// app/api/rewrite-lyrics/route.ts - INTEGRADO COM GERADOR DE REFRÕES
import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { formatInstrumentationForAI } from "@/lib/normalized-genre"
import { LineStacker } from "@/lib/utils/line-stacker"
import { UnifiedSyllableManager } from "@/lib/syllable-management/unified-syllable-manager"

// 🎵 TIPOS DE BLOCO MUSICAL
interface MusicBlock {
  type: 'INTRO' | 'VERSE' | 'PRE_CHORUS' | 'CHORUS' | 'BRIDGE' | 'OUTRO'
  content: string
  score: number
}

// 🎯 GERAR REFRÕES USANDO O SISTEMA EXISTENTE
async function generateChorusOptions(genre: string, theme: string, mood: string): Promise<MusicBlock[]> {
  try {
    const prompt = `Você é um compositor PROFISSIONAL especializado em REFRÕES DE HIT.

🎯 MISSÃO: Criar 3 REFRÕES COMERCIAIS para:
- Gênero: ${genre}
- Tema: ${theme}
- Humor: ${mood || "neutro"}

📏 REGRAS:
- Máximo 12 sílabas por verso
- 4-6 versos por refrão
- MEMORÁVEL e REPETITIVO
- Gancho emocional forte

Gere 3 opções de REFRÃO (apenas os versos, sem formatação):`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.8,
    })

    // Processar os refrões gerados
    return processChorusOptions(text || '', genre)
  } catch (error) {
    console.error("[Chorus] Erro ao gerar refrões:", error)
    return []
  }
}

// 🧩 PROCESSAR REFRÕES GERADOS
function processChorusOptions(text: string, genre: string): MusicBlock[] {
  const blocks: MusicBlock[] = []
  const lines = text.split('\n').filter(line => {
    const trimmed = line.trim()
    return trimmed && 
           !trimmed.startsWith('Gênero:') && 
           !trimmed.startsWith('Tema:') &&
           !trimmed.match(/^(Opção|Refrão|\d+[\.\)])/i)
  })

  let currentChorus: string[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed) {
      currentChorus.push(trimmed)
      
      // Considerar refrão completo com 4-6 linhas
      if (currentChorus.length >= 4) {
        const content = currentChorus.join('\n')
        blocks.push({
          type: 'CHORUS',
          content: content,
          score: calculateChorusScore(content, genre)
        })
        currentChorus = []
        
        if (blocks.length >= 3) break
      }
    }
  }

  return blocks
}

// 📊 CALCULAR SCORE DO REFRÃO
function calculateChorusScore(content: string, genre: string): number {
  const lines = content.split('\n').filter(line => line.trim())
  let score = 60 // Base

  // Bônus por número de linhas ideal (4-6)
  if (lines.length >= 4 && lines.length <= 6) score += 20

  // Bônus por repetição (gancho memorável)
  const firstLine = lines[0]?.toLowerCase() || ''
  if (lines.some(line => line.toLowerCase().includes(firstLine.split(' ')[0]))) {
    score += 10
  }

  // Bônus por estrutura de rima
  if (hasGoodRhymeStructure(lines)) score += 10

  return Math.min(score, 100)
}

// 🎵 VERIFICAR ESTRUTURA DE RIMA
function hasGoodRhymeStructure(lines: string[]): boolean {
  if (lines.length < 4) return false

  // Verificar se as linhas pares rimam (estrutura comum)
  const evenLines = lines.filter((_, index) => index % 2 === 1) // Linhas 2, 4, 6...
  if (evenLines.length >= 2) {
    const lastWords = evenLines.map(line => {
      const words = line.trim().split(/\s+/)
      return words[words.length - 1]?.toLowerCase() || ''
    })
    
    // Verificar se pelo menos duas linhas pares terminam com som similar
    const uniqueEndings = new Set(lastWords.map(word => word.slice(-3)))
    return uniqueEndings.size < lastWords.length
  }

  return false
}

// 🎲 GERAR OUTROS BLOCOS BASEADOS NO REFRÃO ESCOLHIDO
async function generateOtherBlocks(
  selectedChorus: string,
  blockType: 'INTRO' | 'VERSE' | 'BRIDGE' | 'OUTRO',
  genre: string,
  theme: string,
  originalLyrics: string
): Promise<MusicBlock[]> {
  const prompts = {
    INTRO: `Crie 2 opções de INTRO (4 linhas) para ${genre} que prepare para este REFRÃO:
"${selectedChorus}"

Tema: ${theme}
Letra original de inspiração: "${originalLyrics.substring(0, 200)}..."

INTRO que leve naturalmente para o refrão:`,

    VERSE: `Crie 2 opções de VERSO (4 linhas) para ${genre} que construa para este REFRÃO:
"${selectedChorus}"

Tema: ${theme}
Letra original: "${originalLyrics.substring(0, 200)}..."

VERSO que desenvolva a história para o refrão:`,

    BRIDGE: `Crie 2 opções de PONTE (4 linhas) para ${genre} que complemente este REFRÃO:
"${selectedChorus}"

Tema: ${theme}
Letra original: "${originalLyrics.substring(0, 200)}..."

PONTE que dê virada emocional antes do refrão final:`,

    OUTRO: `Crie 2 opções de OUTRO (2-4 linhas) para ${genre} que feche após este REFRÃO:
"${selectedChorus}"

Tema: ${theme}
Letra original: "${originalLyrics.substring(0, 200)}..."

OUTRO que resolva a emocão do refrão:`
  }

  const { text } = await generateText({
    model: "openai/gpt-4o-mini",
    prompt: prompts[blockType],
    temperature: 0.7,
  })

  return processGeneratedBlocks(text || '', blockType, 2)
}

// 🧩 PROCESSAR BLOCOS GERADOS
function processGeneratedBlocks(text: string, blockType: MusicBlock['type'], count: number): MusicBlock[] {
  const lines = text.split('\n').filter(line => {
    const trimmed = line.trim()
    return trimmed && !trimmed.match(/^(Opção|Crie|\d+[\.\)])/i)
  })

  const blocks: MusicBlock[] = []
  let currentBlock: string[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed) {
      currentBlock.push(trimmed)
      
      if (currentBlock.length >= (blockType === 'OUTRO' ? 2 : 4)) {
        blocks.push({
          type: blockType,
          content: currentBlock.join('\n'),
          score: 70 + Math.random() * 20 // Score base com variação
        })
        currentBlock = []
        
        if (blocks.length >= count) break
      }
    }
  }
  
  return blocks.slice(0, count)
}

// 🏗️ MONTAR MÚSICA COMPLETA
async function assembleCompleteSong(
  chorus: MusicBlock,
  otherBlocks: Record<string, MusicBlock[]>,
  genre: string
): Promise<string> {
  const structure = [
    { type: 'INTRO', label: 'Intro' },
    { type: 'VERSE', label: 'Verso 1' },
    { type: 'CHORUS', label: 'Refrão' },
    { type: 'VERSE', label: 'Verso 2' },
    { type: 'CHORUS', label: 'Refrão' },
    { type: 'BRIDGE', label: 'Ponte' },
    { type: 'CHORUS', label: 'Refrão Final' },
    { type: 'OUTRO', label: 'Outro' }
  ]

  let lyrics = ''

  for (const section of structure) {
    if (section.type === 'CHORUS') {
      lyrics += `[${section.label}]\n${chorus.content}\n\n`
    } else {
      const availableBlocks = otherBlocks[section.type] || []
      if (availableBlocks.length > 0) {
        // Selecionar o bloco com melhor score
        const bestBlock = availableBlocks.reduce((best, current) => 
          current.score > best.score ? current : best
        )
        lyrics += `[${section.label}]\n${bestBlock.content}\n\n`
      }
    }
  }

  // Aplicar correção de sílabas
  return await UnifiedSyllableManager.processSongWithBalance(lyrics.trim(), genre)
}

export async function POST(request: NextRequest) {
  let genre = "Sertanejo"
  let theme = "Música"
  let title = "Música em Processamento"

  try {
    const { 
      originalLyrics, 
      genre: requestGenre, 
      theme: requestTheme, 
      title: requestTitle,
      mood = "neutro"
    } = await request.json()

    genre = requestGenre || "Sertanejo"
    theme = requestTheme || "Música" 
    title = requestTitle || `${theme} - ${genre}`

    if (!originalLyrics?.trim()) {
      return NextResponse.json({ error: "Letra original é obrigatória" }, { status: 400 })
    }

    console.log(`[API] 🎵 Reescrita com refrão central: ${genre}`)

    // 🎯 1. GERAR OPÇÕES DE REFRÃO (PONTO DE PARTIDA)
    console.log("[API] 🎶 Gerando refrões...")
    const chorusOptions = await generateChorusOptions(genre, theme, mood)
    
    if (chorusOptions.length === 0) {
      throw new Error("Não foi possível gerar refrões")
    }

    // Selecionar melhor refrão
    const bestChorus = chorusOptions.reduce((best, current) => 
      current.score > best.score ? current : best
    )
    console.log(`[API] ✅ Refrão selecionado: ${bestChorus.score} pontos`)

    // 🧩 2. GERAR OUTROS BLOCOS BASEADOS NO REFRÃO
    console.log("[API] 🧩 Gerando blocos complementares...")
    const otherBlocks: Record<string, MusicBlock[]> = {}
    
    const blockTypes: ('INTRO' | 'VERSE' | 'BRIDGE' | 'OUTRO')[] = ['INTRO', 'VERSE', 'BRIDGE', 'OUTRO']
    
    for (const blockType of blockTypes) {
      otherBlocks[blockType] = await generateOtherBlocks(
        bestChorus.content,
        blockType,
        genre,
        theme,
        originalLyrics
      )
      console.log(`[API] ✅ ${blockType}: ${otherBlocks[blockType].length} opções`)
    }

    // 🏗️ 3. MONTAR MÚSICA COMPLETA
    console.log("[API] 🏗️ Montando música completa...")
    let finalLyrics = await assembleCompleteSong(bestChorus, otherBlocks, genre)

    // ✨ 4. FORMATAÇÃO FINAL
    console.log("[API] ✨ Aplicando formatação...")
    const stackingResult = LineStacker.stackLines(finalLyrics)
    finalLyrics = stackingResult.stackedLyrics

    // 🎸 5. INSTRUMENTAÇÃO
    if (!finalLyrics.includes("(Instrumentation)")) {
      const instrumentation = formatInstrumentationForAI(genre, finalLyrics)
      finalLyrics = `${finalLyrics}\n\n${instrumentation}`
    }

    const totalLines = finalLyrics.split('\n').filter(line => line.trim()).length
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
        chorusScore: bestChorus.score
      },
    })

  } catch (error) {
    console.error("[API] ❌ Erro:", error)
    
    // 🆘 FALLBACK
    const emergencyLyrics = `[Intro]
Sistema de reescrita com refrão central
Gerando a parte mais importante primeiro
Em breve estará otimizada

[Refrão]
Começando pelo coração da música
O refrão que define a emoção
Construindo versos ao redor
Para criação com direção

[Outro]
Processo em refinamento

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
        method: "TRADITIONAL"
      },
    })
  }
}

export async function GET() {
  return NextResponse.json({ error: "Método não permitido" }, { status: 405 })
}
