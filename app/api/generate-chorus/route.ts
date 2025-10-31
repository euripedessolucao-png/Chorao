// app/api/generate-lyrics/route.ts - VERSÃO COM QUALIDADE UNIFICADA
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

// 🎯 GERAR QUALQUER BLOCO COM MESMA QUALIDADE - CORREÇÃO PRINCIPAL
async function generateBlockWithQuality(
  blockType: MusicBlock["type"],
  genre: string,
  theme: string,
  context?: string
): Promise<MusicBlock[]> {
  
  const qualityPrompts = {
    INTRO: `🎵 Crie uma INTRO PROFISSIONAL para ${genre} sobre "${theme}"

📝 REQUISITOS DE QUALIDADE:
- 4 linhas EXATAS
- Máximo 11 sílabas por verso
- ATMOSFERA EMOCIONAL forte
- PREPARE para o desenvolvimento da música
- Linguagem natural e poética

${context ? `CONTEXTO: ${context}` : ''}

INTRO DE ALTA QUALIDADE (apenas 4 linhas):`,

    VERSE: `🎵 Crie um VERSO PROFISSIONAL para ${genre} sobre "${theme}"

📝 REQUISITOS DE QUALIDADE:
- 4 linhas EXATAS  
- Máximo 11 sílabas por verso
- DESENVOLVA a narrativa
- CONECTE emocionalmente
- Coerência temática forte

${context ? `CONTEXTO: ${context}` : ''}

VERSO DE ALTA QUALIDADE (apenas 4 linhas):`,

    CHORUS: `🎵 Crie um REFRÃO PROFISSIONAL para ${genre} sobre "${theme}"

📝 REQUISITOS DE QUALIDADE:
- 4 linhas EXATAS
- Máximo 12 sílabas por verso
- GANCHO MEMORÁVEL obrigatório
- REPETITIVO mas natural
- CLÍMAX emocional

${context ? `CONTEXTO: ${context}` : ''}

REFRÃO DE ALTA QUALIDADE (apenas 4 linhas):`,

    BRIDGE: `🎵 Crie uma PONTE PROFISSIONAL para ${genre} sobre "${theme}"

📝 REQUISITOS DE QUALIDADE:
- 4 linhas EXATAS
- Máximo 11 sílabas por verso
- MUDANÇA de perspectiva
- PROFUNDIDADE emocional
- PREPARE para o final

${context ? `CONTEXTO: ${context}` : ''}

PONTE DE ALTA QUALIDADE (apenas 4 linhas):`,

    OUTRO: `🎵 Crie um OUTRO PROFISSIONAL para ${genre} sobre "${theme}"

📝 REQUISITOS DE QUALIDADE:
- 2-4 linhas
- Máximo 9 sílabas por verso
- FECHO emocional satisfatório
- SENSação de conclusão
- DEIXE marca no ouvinte

${context ? `CONTEXTO: ${context}` : ''}

OUTRO DE ALTA QUALIDADE (apenas as linhas finais):`
  }

  try {
    const prompt = qualityPrompts[blockType]
    
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.7,
    })

    return processQualityBlock(text || "", blockType)
  } catch (error) {
    console.error(`[QualityBlock] Erro em ${blockType}:`, error)
    return [generateQualityFallback(blockType, theme)]
  }
}

// 🧩 PROCESSAR BLOCO DE QUALIDADE
function processQualityBlock(text: string, blockType: MusicBlock["type"]): MusicBlock[] {
  
  // Limpeza mantendo apenas conteúdo de qualidade
  const cleanText = text
    .replace(/^(🎵|📝|REQUISITOS|CONTEXTO|QUALIDADE).*?[\n:]/gmi, '')
    .replace(/.*(PROFISSIONAL|ALTA QUALIDADE).*?[\n:]/gmi, '')
    .replace(/\*\*.*?\*\*/g, '')
    .replace(/".*?"/g, '')
    .replace(/^.*(linhas|verso).*$/gmi, '')
    .trim()

  const lines = cleanText.split("\n")
    .map(line => line.trim())
    .filter(line => {
      return line && 
             line.length >= 5 && 
             line.length <= 60 &&
             !line.match(/^[\[\(]/) &&
             !line.match(/^(🎵|📝|REQUISITOS|QUALIDADE|PROFISSIONAL)/i) &&
             !line.includes('**')
    })
    .slice(0, blockType === "OUTRO" ? 4 : 4) // Máximo 4 linhas para consistência

  if (lines.length >= (blockType === "OUTRO" ? 2 : 3)) {
    const content = lines.join("\n")
    return [{
      type: blockType,
      content: content,
      score: calculateQualityScore(content, blockType),
    }]
  }

  return [generateQualityFallback(blockType, "")]
}

// 📊 SCORE DE QUALIDADE UNIFICADO
function calculateQualityScore(content: string, blockType: MusicBlock["type"]): number {
  const lines = content.split("\n").filter(line => line.trim())
  let score = 75 // Base mais alta para qualidade

  // ✅ Bônus por estrutura completa
  const targetLines = blockType === "OUTRO" ? 2 : 4
  if (lines.length === targetLines) score += 15

  // ✅ Bônus por versos completos (sem cortes)
  const completeLines = lines.filter(line => {
    const hasEllipsis = line.includes('...') || line.match(/[.,!?;:]$/)
    return line.length > 5 && !hasEllipsis
  })
  
  if (completeLines.length === lines.length) score += 10

  // ✅ Bônus por diversidade vocabular
  const words = content.toLowerCase().split(/\s+/).filter(word => word.length > 2)
  const uniqueWords = new Set(words)
  if (uniqueWords.size / words.length > 0.6) score += 5

  return Math.min(score, 100)
}

// 🆘 FALLBACK DE QUALIDADE
function generateQualityFallback(blockType: MusicBlock["type"], theme: string): MusicBlock {
  const qualityFallbacks = {
    INTRO: {
      content: `No começo dessa história\nUm sentimento na memória\nAlgo novo vai nascer\nE no peito vai doer`,
      score: 80
    },
    VERSE: {
      content: `Cada passo que eu dei\nUm aprendizado que ficou\nNa estrada da emoção\nO coração se transformou`,
      score: 80
    },
    CHORUS: {
      content: `Seu amor é minha estrada\nMinha luz, minha jornada\nNesse mundo de verdade\nEncontro a liberdade`,
      score: 85
    },
    BRIDGE: {
      content: `E o que era incerto\nVirou concreto no peito\nUma nova perspectiva\nQue a alma aguarda quieta`,
      score: 80
    },
    OUTRO: {
      content: `Vou levando na lembrança\nEssa doce esperança`,
      score: 80
    },
    PRE_CHORUS: {
      content: `E agora tudo muda\nO coração se influencia\nUm novo sentimento\nToma conta do momento`,
      score: 80
    }
  }

  switch (blockType) {
    case "INTRO": return { type: blockType, ...qualityFallbacks.INTRO }
    case "VERSE": return { type: blockType, ...qualityFallbacks.VERSE }
    case "CHORUS": return { type: blockType, ...qualityFallbacks.CHORUS }
    case "BRIDGE": return { type: blockType, ...qualityFallbacks.BRIDGE }
    case "OUTRO": return { type: blockType, ...qualityFallbacks.OUTRO }
    case "PRE_CHORUS": return { type: blockType, ...qualityFallbacks.PRE_CHORUS }
    default: return { type: "VERSE", ...qualityFallbacks.VERSE }
  }
}

// 🏗️ MONTAR MÚSICA COM QUALIDADE UNIFICADA
async function assembleQualitySong(
  blocks: Record<string, MusicBlock[]>,
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
    const availableBlocks = blocks[section.type] || []
    if (availableBlocks.length > 0) {
      // ✅ SEMPRE pegar o melhor bloco disponível
      const bestBlock = availableBlocks.reduce((best, current) => 
        current.score > best.score ? current : best
      )
      lyrics += `[${section.label}]\n${bestBlock.content}\n\n`
    } else {
      // ✅ Fallback de qualidade para seção faltante
      const fallback = generateQualityFallback(section.type as any, "")
      lyrics += `[${section.label}]\n${fallback.content}\n\n`
    }
  }

  try {
    return await UnifiedSyllableManager.processSongWithBalance(lyrics.trim())
  } catch (error) {
    console.error("[QualityAssemble] Erro corrigindo sílabas:", error)
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
    } = await request.json()

    genre = requestGenre || "Sertanejo"
    theme = requestTheme || "Música"
    title = requestTitle || `${theme} - ${genre}`

    if (!genre) {
      return NextResponse.json({ error: "Gênero é obrigatório" }, { status: 400 })
    }

    console.log(`[API] 🎵 Gerando música com QUALIDADE UNIFICADA: ${genre}`)

    // 🎯 GERAR TODOS OS BLOCOS COM MESMA QUALIDADE
    console.log("[API] 🎶 Gerando blocos de alta qualidade...")
    const allBlocks: Record<string, MusicBlock[]> = {}

    const blockTypes: MusicBlock["type"][] = ["INTRO", "VERSE", "CHORUS", "BRIDGE", "OUTRO"]

    // ✅ GERAR PARALELAMENTE COM MESMO PADRÃO DE QUALIDADE
    const generationPromises = blockTypes.map(async (blockType) => {
      const blocks = await generateBlockWithQuality(blockType, genre, theme)
      allBlocks[blockType] = blocks
      console.log(`[API] ✅ ${blockType}: ${blocks.length} bloco(s) - Score: ${blocks[0]?.score || 0}`)
    })

    await Promise.all(generationPromises)

    // 🏗️ MONTAR MÚSICA COMPLETA
    console.log("[API] 🏗️ Montando música com qualidade unificada...")
    let finalLyrics = await assembleQualitySong(allBlocks, genre)

    // ✨ APLICAR FORMATAÇÃO
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
    console.log(`[API] 🎉 CONCLUÍDO: ${totalLines} linhas de qualidade unificada`)

    return NextResponse.json({
      success: true,
      lyrics: finalLyrics,
      title: title,
      metadata: {
        genre,
        totalLines,
        quality: "UNIFIED_QUALITY",
        method: "QUALITY_FIRST",
      },
    })
  } catch (error) {
    console.error("[API] ❌ Erro:", error)

    // 🆘 FALLBACK DE QUALIDADE
    const emergencyLyrics = `[Intro]
Com qualidade desde o início
Cada parte bem construída
Na medida certa da emoção
Com sentimento e precisão

[Verso 1]
Versos que contam histórias
Com palavras necessárias
Nem mais nem menos que o essencial
No ritmo do sentimental

[Refrão]
Qualidade em cada detalhe
Na rima que não falha
No verso que emociona
E no peito ecoa e soa

[Verso 2]
Desenvolvendo a narrativa
Com coerência expressiva
Cada linha tem seu lugar
Para melhor se expressar

[Refrão]
Qualidade em cada detalhe
Na rima que não falha
No verso que emociona
E no peito ecoa e soa

[Outro]
Assim se faz canção
Com atenção e coração

(Instrumentation)
(Genre: ${genre})`

    return NextResponse.json({
      success: true,
      lyrics: emergencyLyrics,
      title: title,
      metadata: {
        genre,
        totalLines: 12,
        quality: "QUALITY_FALLBACK",
        method: "QUALITY_FIRST",
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
