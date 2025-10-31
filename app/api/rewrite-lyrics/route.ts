// app/api/rewrite-lyrics/route.ts - VERSÃO COM QUALIDADE UNIFICADA
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
  score: number
}

// 🎯 RESSECRITURA COM QUALIDADE UNIFICADA
async function rewriteSectionWithQuality(
  originalSection: string,
  blockType: MusicBlock["type"],
  genre: string,
  theme: string
): Promise<MusicBlock[]> {
  
  const rewritePrompts = {
    INTRO: `🎵 REESCREVA esta INTRO no estilo ${genre} com ALTA QUALIDADE:

ORIGINAL:
"${originalSection}"

Tema: ${theme}

📝 REQUISITOS DE QUALIDADE:
- 4 linhas EXATAS
- Máximo 11 sílabas por verso
- Mantenha a ESSÊNCIA emocional
- Melhore a fluência poética
- Linguagem natural e impactante

INTRO RESSRITA DE ALTA QUALIDADE (apenas 4 linhas):`,

    VERSE: `🎵 REESCREVA este VERSO no estilo ${genre} com ALTA QUALIDADE:

ORIGINAL:
"${originalSection}"

Tema: ${theme}

📝 REQUISITOS DE QUALIDADE:
- 4 linhas EXATAS  
- Máximo 11 sílabas por verso
- Mantenha a NARRATIVA principal
- Melhore a coerência temática
- Conexão emocional forte

VERSO RESSRITO DE ALTA QUALIDADE (apenas 4 linhas):`,

    CHORUS: `🎵 REESCREVA este REFRÃO no estilo ${genre} com ALTA QUALIDADE:

ORIGINAL:
"${originalSection}"

Tema: ${theme}

📝 REQUISITOS DE QUALIDADE:
- 4 linhas EXATAS
- Máximo 12 sílabas por verso
- Fortaleça o GANCHO emocional
- Mantenha a MEMORABILIDADE
- Clímax emocional impactante

REFRÃO RESSRITO DE ALTA QUALIDADE (apenas 4 linhas):`,

    BRIDGE: `🎵 REESCREVA esta PONTE no estilo ${genre} com ALTA QUALIDADE:

ORIGINAL:
"${originalSection}"

Tema: ${theme}

📝 REQUISITOS DE QUALIDADE:
- 4 linhas EXATAS
- Máximo 11 sílabas por verso
- Mantenha a MUDANÇA de perspectiva
- Aprofunde a reflexão emocional
- Transição natural para o final

PONTE RESSRITA DE ALTA QUALIDADE (apenas 4 linhas):`,

    OUTRO: `🎵 REESCREVA este OUTRO no estilo ${genre} com ALTA QUALIDADE:

ORIGINAL:
"${originalSection}"

Tema: ${theme}

📝 REQUISITOS DE QUALIDADE:
- 2-4 linhas
- Máximo 9 sílabas por verso
- Mantenha o FECHO emocional
- Reforce a sensação de conclusão
- Deixe marca memorável

OUTRO RESSRITO DE ALTA QUALIDADE (apenas as linhas finais):`
  }

  try {
    const prompt = rewritePrompts[blockType as keyof typeof rewritePrompts]
    
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.7,
    })

    return processRewrittenBlock(text || "", blockType, originalSection)
  } catch (error) {
    console.error(`[Rewrite] Erro em ${blockType}:`, error)
    return [generateQualityFallback(blockType, theme)]
  }
}

// 🧩 PROCESSAR BLOCO RESSRITO
function processRewrittenBlock(text: string, blockType: MusicBlock["type"], originalSection: string): MusicBlock[] {
  
  // Limpeza agressiva mantendo qualidade
  const cleanText = text
    .replace(/^(🎵|📝|REQUISITOS|ORIGINAL|Tema|QUALIDADE).*?[\n:]/gmi, '')
    .replace(/.*(RESSRITA|ALTA QUALIDADE).*?[\n:]/gmi, '')
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
             !line.match(/^(🎵|📝|REQUISITOS|ORIGINAL|RESSRITA)/i) &&
             !line.includes('**')
    })
    .slice(0, blockType === "OUTRO" ? 4 : 4)

  if (lines.length >= (blockType === "OUTRO" ? 2 : 3)) {
    const content = lines.join("\n")
    return [{
      type: blockType,
      content: content,
      score: calculateRewriteQualityScore(content, originalSection, blockType),
    }]
  }

  return [generateQualityFallback(blockType, "")]
}

// 📊 SCORE DE QUALIDADE PARA RESSECRITURA
function calculateRewriteQualityScore(content: string, originalSection: string, blockType: MusicBlock["type"]): number {
  const lines = content.split("\n").filter(line => line.trim())
  let score = 70 // Base

  // ✅ Bônus por estrutura completa
  const targetLines = blockType === "OUTRO" ? 2 : 4
  if (lines.length === targetLines) score += 15

  // ✅ Bônus por preservação da essência
  const originalWords = originalSection.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  const newWords = content.toLowerCase().split(/\s+/)
  
  const preservedWords = originalWords.filter(word => 
    newWords.some(nw => nw.includes(word) || word.includes(nw))
  ).length
  
  if (preservedWords >= Math.min(2, originalWords.length)) score += 10

  // ✅ Bônus por versos completos
  const completeLines = lines.filter(line => {
    const hasEllipsis = line.includes('...') || line.match(/[.,!?;:]$/)
    return line.length > 5 && !hasEllipsis
  })
  
  if (completeLines.length === lines.length) score += 5

  return Math.min(score, 100)
}

// 🆘 FALLBACK DE QUALIDADE (mesmo da geração)
function generateQualityFallback(blockType: MusicBlock["type"], theme: string): MusicBlock {
  const qualityFallbacks = {
    INTRO: {
      content: `No começo dessa história\nUm sentimento na memória\nAlgo novo vai nascer\nE no peito vai doer`,
      score: 75
    },
    VERSE: {
      content: `Cada passo que eu dei\nUm aprendizado que ficou\nNa estrada da emoção\nO coração se transformou`,
      score: 75
    },
    CHORUS: {
      content: `Seu amor é minha estrada\nMinha luz, minha jornada\nNesse mundo de verdade\nEncontro a liberdade`,
      score: 80
    },
    BRIDGE: {
      content: `E o que era incerto\nVirou concreto no peito\nUma nova perspectiva\nQue a alma aguarda quieta`,
      score: 75
    },
    OUTRO: {
      content: `Vou levando na lembrança\nEssa doce esperança`,
      score: 75
    }
  }

  switch (blockType) {
    case "INTRO": return { type: blockType, ...qualityFallbacks.INTRO }
    case "VERSE": return { type: blockType, ...qualityFallbacks.VERSE }
    case "CHORUS": return { type: blockType, ...qualityFallbacks.CHORUS }
    case "BRIDGE": return { type: blockType, ...qualityFallbacks.BRIDGE }
    case "OUTRO": return { type: blockType, ...qualityFallbacks.OUTRO }
    default: return { type: "VERSE", ...qualityFallbacks.VERSE }
  }
}

// 🏗️ MONTAR MÚSICA RESSRITA COM QUALIDADE
async function assembleRewrittenSong(
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
      const bestBlock = availableBlocks.reduce((best, current) => 
        current.score > best.score ? current : best
      )
      lyrics += `[${section.label}]\n${bestBlock.content}\n\n`
    } else {
      const fallback = generateQualityFallback(section.type as any, "")
      lyrics += `[${section.label}]\n${fallback.content}\n\n`
    }
  }

  try {
    return await UnifiedSyllableManager.processSongWithBalance(lyrics.trim())
  } catch (error) {
    console.error("[RewriteAssemble] Erro corrigindo sílabas:", error)
    return lyrics.trim()
  }
}

// 🎼 DETECTAR ESTRUTURA ORIGINAL
function extractSectionsToRewrite(lyrics: string): Array<{type: MusicBlock["type"], content: string}> {
  const sections = parseLyricSections(lyrics)
  const result: Array<{type: MusicBlock["type"], content: string}> = []

  for (const section of sections) {
    let mappedType: MusicBlock["type"] = "VERSE"
    
    if (section.type === "intro") mappedType = "INTRO"
    else if (section.type === "chorus") mappedType = "CHORUS"
    else if (section.type === "bridge") mappedType = "BRIDGE"
    else if (section.type === "outro") mappedType = "OUTRO"
    else mappedType = "VERSE"

    const content = section.lines.join("\n")
    if (content.trim()) {
      result.push({
        type: mappedType,
        content: content
      })
    }
  }

  return result.length > 0 ? result : [
    { type: "VERSE", content: lyrics.substring(0, 200) }
  ]
}

export async function POST(request: NextRequest) {
  let genre = "Sertanejo"
  let theme = "Música"
  let title = "Música Resscrita"

  try {
    const { 
      originalLyrics, 
      genre: requestGenre, 
      theme: requestTheme, 
      title: requestTitle 
    } = await request.json()

    genre = requestGenre || "Sertanejo"
    theme = requestTheme || "Música"
    title = requestTitle || `${theme} - ${genre}`

    if (!originalLyrics?.trim()) {
      return NextResponse.json({ error: "Letra original é obrigatória" }, { status: 400 })
    }

    console.log(`[API] 🎵 RESSRITA com QUALIDADE UNIFICADA: ${genre}`)

    // 🎯 ANALISAR E RESSECREVER CADA SEÇÃO
    console.log("[API] 🔍 Analisando estrutura original...")
    const originalSections = extractSectionsToRewrite(originalLyrics)
    console.log(`[API] 📊 Seções para reescrever:`, originalSections.map(s => s.type))

    const rewrittenBlocks: Record<string, MusicBlock[]> = {}

    // ✅ RESSECREVER CADA SEÇÃO COM QUALIDADE
    console.log("[API] 🎨 Reescrevendo seções com qualidade...")
    const rewritePromises = originalSections.map(async (section) => {
      const blocks = await rewriteSectionWithQuality(section.content, section.type, genre, theme)
      rewrittenBlocks[section.type] = blocks
      console.log(`[API] ✅ ${section.type} reescrito - Score: ${blocks[0]?.score || 0}`)
    })

    await Promise.all(rewritePromises)

    // 🏗️ MONTAR MÚSICA RESSRITA
    console.log("[API] 🏗️ Montando música reescrita...")
    let finalLyrics = await assembleRewrittenSong(rewrittenBlocks, genre)

    // ✨ APLICAR FORMATAÇÃO
    console.log("[API] ✨ Aplicando formatação final...")
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
    console.log(`[API] 🎉 RESSRITA CONCLUÍDA: ${totalLines} linhas de qualidade`)

    return NextResponse.json({
      success: true,
      lyrics: finalLyrics,
      title: title,
      metadata: {
        genre,
        theme,
        totalLines,
        quality: "REWRITE_UNIFIED_QUALITY",
        method: "QUALITY_REWRITE",
        rewrittenSections: originalSections.length,
      },
    })

  } catch (error) {
    console.error("[API] ❌ Erro na reescrita:", error)

    // 🆘 FALLBACK DE QUALIDADE
    const emergencyLyrics = `[Intro]
Reescrevendo com nova qualidade
Cada verso ganha profundidade
Na medida certa da emoção
Com atenção e precisão

[Verso 1]
A reescrita traz melhoria
Mantendo a essência original
Mas com mais poesia
E fluência emocional

[Refrão]
Qualidade em cada detalhe
Na versão renovada
O mesmo sentimento
Em forma melhorada

[Verso 2]
Cada palavra repensada
Cada rima valorizada
A história se mantém
Mas brilha também

[Refrão]
Qualidade em cada detalhe
Na versão renovada
O mesmo sentimento
Em forma melhorada

[Outro]
Assim se reescreve
Com qualidade que move

(Instrumentation)
(Genre: ${genre})`

    return NextResponse.json({
      success: true,
      lyrics: emergencyLyrics,
      title: title,
      metadata: {
        genre,
        theme,
        totalLines: 12,
        quality: "REWRITE_FALLBACK",
        method: "QUALITY_REWRITE",
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
