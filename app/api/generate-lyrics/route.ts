// app/api/generate-lyrics/route.ts - VERSÃO COMPLETAMENTE CORRIGIDA
import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
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
- APENAS as linhas do refrão, sem explicações

Gere 3 opções de REFRÃO (apenas as linhas):`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.8,
    })

    return processChorusOptions(text || "", genre)
  } catch (error) {
    console.error("[Chorus] Erro:", error)
    return generateFallbackChoruses(genre, theme)
  }
}

// 🧩 PROCESSAR REFRÕES GERADOS
function processChorusOptions(text: string, genre: string): MusicBlock[] {
  const blocks: MusicBlock[] = []
  
  // Limpeza agressiva
  const cleanText = text
    .replace(/^(Opção|Refrão|\d+[.)])/gmi, '')
    .replace(/\*\*.*?\*\*/g, '')
    .replace(/".*?"/g, '')
    .replace(/^.*exemplo.*$/gmi, '')
    .trim()

  const lines = cleanText.split("\n")
    .map(line => line.trim())
    .filter(line => {
      return line && 
             line.length > 5 && 
             !line.match(/^(Opção|Refrão|\d+[.)])/i) &&
             !line.includes('**') &&
             !line.includes('Exemplo')
    })

  let currentChorus: string[] = []

  for (const line of lines) {
    if (line) {
      currentChorus.push(line)

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

// 🆘 FALLBACK PARA REFRÕES
function generateFallbackChoruses(genre: string, theme: string): MusicBlock[] {
  const fallbacks = [
    `Seu amor é minha direção\nNa escuridão da solidão\nCada olhar, cada emoção\nRenova meu coração`,
    `Te encontrei no caminho\nE tudo fez sentido\nSeu abraço é meu destino\nO amor que eu sempre quis`,
    `Nessa vida de aventuras\nEncontrei razão pura\nSeu sorriso me assegura\nUm futuro de doçura`
  ]

  return fallbacks.map(content => ({
    type: "CHORUS",
    content,
    score: 70
  }))
}

// 🎲 GERAR OUTROS BLOCOS BASEADOS NO REFRÃO
async function generateOtherBlocks(
  selectedChorus: string,
  blockType: "INTRO" | "VERSE" | "BRIDGE" | "OUTRO",
  genre: string,
  theme: string,
): Promise<MusicBlock[]> {
  
  const prompts = {
    INTRO: `Crie INTRO (4 linhas) para ${genre} que prepare para este REFRÃO. APENAS 4 linhas:

"${selectedChorus.substring(0, 100)}"

Tema: ${theme}
4 LINHAS APENAS:`,

    VERSE: `Crie VERSO (4 linhas) para ${genre} que construa para este REFRÃO. APENAS 4 linhas:

"${selectedChorus.substring(0, 100)}"

Tema: ${theme}
4 LINHAS APENAS:`,

    BRIDGE: `Crie PONTE (4 linhas) para ${genre} que complemente este REFRÃO. APENAS 4 linhas:

"${selectedChorus.substring(0, 100)}"

Tema: ${theme}
4 LINHAS APENAS:`,

    OUTRO: `Crie OUTRO (2-4 linhas) para ${genre} que feche após este REFRÃO. APENAS as linhas:

"${selectedChorus.substring(0, 100)}"

Tema: ${theme}
LINHAS FINAIS APENAS:`,
  }

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: prompts[blockType],
      temperature: 0.7,
    })

    return processGeneratedBlocks(text || "", blockType)
  } catch (error) {
    console.error(`[Block] Erro em ${blockType}:`, error)
    return [generateFallbackBlock(blockType, theme)]
  }
}

// 🧩 PROCESSAR BLOCOS GERADOS
function processGeneratedBlocks(text: string, blockType: MusicBlock["type"]): MusicBlock[] {
  
  // Limpeza agressiva
  const cleanText = text
    .replace(/^(NOVO|VERSO|INTRO|PONTE|OUTRO).*?[\n:]/gi, '')
    .replace(/\*\*.*?\*\*/g, '')
    .replace(/".*?"/g, '')
    .replace(/^.*APENAS.*$/gmi, '')
    .replace(/^.*LINHAS.*$/gmi, '')
    .trim()

  const lines = cleanText.split("\n")
    .map(line => line.trim())
    .filter(line => {
      return line && 
             line.length >= 5 && 
             !line.match(/^[\[\(]/) &&
             !line.match(/^(NOVO|VERSO|INTRO|PONTE|OUTRO|APENAS|LINHAS)/i) &&
             !line.includes('**')
    })
    .slice(0, blockType === "OUTRO" ? 4 : 4)

  if (lines.length >= (blockType === "OUTRO" ? 2 : 3)) {
    return [{
      type: blockType,
      content: lines.join("\n"),
      score: calculateBlockScore(lines.join("\n")),
    }]
  }

  return [generateFallbackBlock(blockType, "")]
}

// 🆘 FALLBACK PARA BLOCOS - CORREÇÃO DEFINITIVA
function generateFallbackBlock(blockType: MusicBlock["type"], theme: string): MusicBlock {
  // ✅ CORREÇÃO: Usar switch case em vez de objeto para evitar problemas de tipo
  switch (blockType) {
    case "INTRO":
      return {
        type: blockType,
        content: `Pensando em você\nNo silêncio da emoção\nUm sentimento que nasce\nDentro do coração`,
        score: 65
      }
    case "VERSE":
      return {
        type: blockType,
        content: `A vida me mostrou\nCaminhos a seguir\nCom você ao meu lado\nSou capaz de sorrir`,
        score: 65
      }
    case "PRE_CHORUS":
      return {
        type: blockType,
        content: `E agora o coração\nPrepara pra emoção\nDo que está por vir\nNesse novo amor`,
        score: 65
      }
    case "BRIDGE":
      return {
        type: blockType,
        content: `E o tempo vai passando\nTrazendo aprendizado\nCada momento contigo\nÉ um sonho realizado`,
        score: 65
      }
    case "OUTRO":
      return {
        type: blockType,
        content: `Até amanhã\nMeu amor sem fim`,
        score: 65
      }
    case "CHORUS":
      return {
        type: blockType,
        content: `Seu amor me transforma\nMinha vida se reforma\nNesse sentimento puro\nQue no peito fica duro`,
        score: 65
      }
    default:
      return {
        type: "VERSE",
        content: `A vida segue em frente\nCom novos aprendizados\nCada dia é diferente\nCheio de sentimentos`,
        score: 65
      }
  }
}

// 📊 CALCULAR SCORE DO BLOCO
function calculateBlockScore(content: string): number {
  const lines = content.split("\n").filter((line) => line.trim())
  let score = 70 // Base

  if (lines.length >= 4) score += 10

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
      } else {
        // Fallback para seção faltante
        const fallback = generateFallbackBlock(section.type as any, "")
        lyrics += `[${section.label}]\n${fallback.content}\n\n`
      }
    }
  }

  try {
    return await UnifiedSyllableManager.processSongWithBalance(lyrics.trim())
  } catch (error) {
    console.error("[Assemble] Erro corrigindo sílabas:", error)
    return lyrics.trim()
  }
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
    try {
      const stackingResult = LineStacker.stackLines(finalLyrics)
      finalLyrics = stackingResult.stackedLyrics
    } catch (error) {
      console.log("[API] ℹ️ LineStacker não disponível")
    }

    // 🎸 INSTRUMENTAÇÃO
    try {
      if (!finalLyrics.includes("(Instrumentation)")) {
        const instrumentation = formatInstrumentationForAI(genre, finalLyrics)
        finalLyrics = `${finalLyrics}\n\n${instrumentation}`
      }
    } catch (error) {
      console.log("[API] ℹ️ Instrumentação não disponível")
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
Começando essa jornada
Com sentimentos na estrada
Uma história pra contar
E no coração guardar

[Refrão]
Vou cantando essa emoção
Com toda a inspiração
Uma música que nasce
E no peito permanece

[Verso 1]
Cada verso que se escreve
É um pedaço que se move
Na dança das palavras
Que a alma celebra

[Refrão]
Vou cantando essa emoção
Com toda a inspiração
Uma música que nasce
E no peito permanece

[Outro]
Até a próxima canção

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
  return NextResponse.json({ 
    error: "Método não permitido",
    message: "Use POST para gerar letras"
  }, { status: 405 })
}
