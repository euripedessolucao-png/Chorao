// app/api/rewrite-lyrics/route.ts - VERSÃO SEM MAX_TOKENS
import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { formatInstrumentationForAI } from "@/lib/normalized-genre"
import { LineStacker } from "@/lib/utils/line-stacker"
import { UnifiedSyllableManager } from "@/lib/syllable-management/unified-syllable-manager"
import { parseLyricSections } from "@/lib/validation/parser"

// 🎵 TIPOS DE BLOCO MUSICAL
interface MusicBlock {
  type: "VERSE" | "CHORUS" | "BRIDGE" | "OUTRO"
  content: string
  lines: string[]
  score: number
}

// 🎯 GERAR BLOCO - VERSÃO SEM MAX_TOKENS
async function generateBlockVariations(
  blockType: MusicBlock["type"],
  genre: string,
  originalSection: string,
): Promise<MusicBlock[]> {
  
  const lineTargets = {
    VERSE: 4,
    CHORUS: 4,
    BRIDGE: 4,
    OUTRO: 2
  }

  // PROMPTS SUPER RESTRITIVOS - COM LIMITAÇÃO EXPLÍCITA NO TEXTO
  const prompts = {
    VERSE: `Escreva APENAS 4 linhas para um VERSO ${genre}. NADA mais. Apenas as 4 linhas:

Original: "${originalSection.substring(0, 100)}"

4 LINHAS APENAS:`,

    CHORUS: `Escreva APENAS 4 linhas para um REFRÃO ${genre}. NADA mais. Apenas as 4 linhas:

Original: "${originalSection.substring(0, 100)}"

4 LINHAS APENAS:`,

    BRIDGE: `Escreva APENAS 4 linhas para uma PONTE ${genre}. NADA mais. Apenas as 4 linhas:

Original: "${originalSection.substring(0, 100)}"

4 LINHAS APENAS:`,

    OUTRO: `Escreva APENAS 2 linhas para um OUTRO ${genre}. NADA mais. Apenas as 2 linhas:

Original: "${originalSection.substring(0, 100)}"

2 LINHAS APENAS:`
  }

  try {
    const prompt = prompts[blockType]
    
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.2, // Muito baixo para menos criatividade
      // REMOVIDO: maxTokens: 100 - Vercel não suporta
    })

    console.log(`[BlockGen] ${blockType} resposta crua:`, text)
    
    const processed = processBlockText(text || "", blockType, lineTargets[blockType])
    return processed.length > 0 ? [processed[0]] : [generateStrictFallback(blockType, originalSection)]
  } catch (error) {
    console.error(`[BlockGen] Erro em ${blockType}:`, error)
    return [generateStrictFallback(blockType, originalSection)]
  }
}

// 🧩 PROCESSAMENTO SUPER RESTRITIVO (mantido igual)
function processBlockText(
  text: string, 
  blockType: MusicBlock["type"],
  targetLines: number
): MusicBlock[] {
  
  // EXTREMA limpeza - remove TUDO que não for linha de letra
  const cleanText = text
    .replace(/^(NOVO|REESCRITO|VERSO|REFRÃO|PONTE|OUTRO).*?[\n:]/gi, '')
    .replace(/\*\*.*?\*\*/g, '')
    .replace(/".*?"/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/^Claro!.*$/gmi, '')
    .replace(/^Aqui.*$/gmi, '')
    .replace(/^.*[Rr]eescrit[ao].*$/gmi, '')
    .replace(/^.*REFRÃO REESCRITO.*$/gmi, '')
    .replace(/^.*SEÇÃO REESCRITA.*$/gmi, '')
    .replace(/^.*tá ponte.*$/gmi, '')
    .replace(/^.*ó!.*$/gmi, '')
    .replace(/^.*APENAS.*$/gmi, '')
    .replace(/^.*LINHAS.*$/gmi, '')
    .replace(/^.*NADA mais.*$/gmi, '')
    .trim()

  console.log(`[Process] ${blockType} após limpeza:`, cleanText)

  // Extrai APENAS linhas que parecem verso de música
  const lines = cleanText
    .split("\n")
    .map(line => line.trim())
    .filter(line => {
      return line && 
             line.length >= 5 && 
             line.length <= 50 &&
             !line.match(/^[\[\(]/) && // Não começa com [ ou (
             !line.match(/^[0-9]/) && // Não começa com número
             !line.match(/^["']/) && // Não começa com aspas
             !line.includes('**') &&
             !line.match(/^(NOVO|VERSO|REFRÃO|PONTE|OUTRO|APENAS|LINHAS|NADA)/i) &&
             !line.match(/REESCRITO/i) &&
             !line.match(/Claro!/i) &&
             !line.match(/Aqui/i) &&
             !line.match(/ó!/i)
    })
    .slice(0, targetLines) // Pega apenas as primeiras X linhas

  console.log(`[Process] ${blockType} linhas finais:`, lines)

  if (lines.length >= 2) {
    return [{
      type: blockType,
      content: lines.join("\n"),
      lines: lines,
      score: 80
    }]
  }

  return []
}

// 🆘 FALLBACK SUPER CONSERVADOR (mantido igual)
function generateStrictFallback(
  blockType: MusicBlock["type"],
  originalSection: string
): MusicBlock {
  
  // Extrai as primeiras linhas limpas da seção original como fallback
  const originalLines = originalSection
    .split("\n")
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('[') && !line.startsWith('('))
    .slice(0, 4)

  const fallbacks = {
    VERSE: originalLines.length >= 4 ? originalLines : [
      "Na estrada da vida",
      "Encontrei você",
      "Meu coração bate",
      "Só pra te ver"
    ],
    CHORUS: [
      "Seu amor me guia",
      "Sua luz me traz",
      "Nessa melodia",
      "Que nunca se faz"
    ],
    BRIDGE: [
      "E o tempo passou",
      "Tudo mudou",
      "O amor ficou",
      "E me transformou"
    ],
    OUTRO: [
      "Até amanhã",
      "Meu amor sem fim"
    ]
  }

  const lines = fallbacks[blockType]
  
  return {
    type: blockType,
    content: lines.join("\n"),
    lines: lines,
    score: 60
  }
}

// 🏗️ MONTAR LETRA COMPLETA (mantido igual)
function assembleLyric(blocks: Record<string, MusicBlock[]>): string {
  let lyrics = ""
  let verseCount = 1
  let chorusCount = 1

  // Estrutura fixa e simples
  const structure: MusicBlock["type"][] = ["VERSE", "CHORUS", "VERSE", "CHORUS", "BRIDGE", "CHORUS", "OUTRO"]

  for (const sectionType of structure) {
    const availableBlocks = blocks[sectionType] || []
    if (availableBlocks.length > 0) {
      const block = availableBlocks[0] // Pega o primeiro bloco

      let label = ""
      if (sectionType === "VERSE") {
        label = `Verso ${verseCount}`
        verseCount++
      } else if (sectionType === "CHORUS") {
        label = `Refrão ${chorusCount}`
        chorusCount++
      } else if (sectionType === "BRIDGE") {
        label = "Ponte"
      } else if (sectionType === "OUTRO") {
        label = "Outro"
      }

      lyrics += `[${label}]\n${block.content}\n\n`
    }
  }

  return lyrics.trim()
}

// 🎼 DETECTAR SEÇÕES ORIGINAIS (mantido igual)
function extractOriginalSections(lyrics: string): Array<{type: MusicBlock["type"], content: string}> {
  const sections = parseLyricSections(lyrics)
  const result: Array<{type: MusicBlock["type"], content: string}> = []

  for (const section of sections) {
    let mappedType: MusicBlock["type"] = "VERSE"
    
    if (section.type === "chorus") mappedType = "CHORUS"
    else if (section.type === "bridge") mappedType = "BRIDGE" 
    else if (section.type === "outro") mappedType = "OUTRO"
    else mappedType = "VERSE"

    // Extrai apenas o conteúdo das linhas
    const content = section.lines.join("\n")
    if (content.trim()) {
      result.push({
        type: mappedType,
        content: content
      })
    }
  }

  return result.length > 0 ? result : [
    { type: "VERSE", content: "Conteúdo do verso original" },
    { type: "CHORUS", content: "Conteúdo do refrão original" }
  ]
}

// ✅ POST PRINCIPAL - VERSÃO SIMPLIFICADA (mantido igual)
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

    console.log(`[API] 🎵 Iniciando reescrita SUPER RESTRITA: ${genre}`)

    // Extrai seções da original
    const originalSections = extractOriginalSections(originalLyrics)
    console.log(`[API] 📊 Seções extraídas:`, originalSections.map(s => s.type))

    const allBlocks: Record<string, MusicBlock[]> = {}

    // Processa CADA seção individualmente
    for (const section of originalSections) {
      try {
        const blocks = await generateBlockVariations(section.type, genre, section.content)
        allBlocks[section.type] = blocks
        console.log(`[API] ✅ ${section.type}: ${blocks.length} bloco`)
      } catch (error) {
        console.error(`[API] ❌ Erro em ${section.type}:`, error)
        allBlocks[section.type] = [generateStrictFallback(section.type, section.content)]
      }
    }

    // Monta a letra final
    const finalLyrics = assembleLyric(allBlocks)
    console.log(`[API] 🧩 Letra montada: ${finalLyrics.split('\n').length} linhas`)

    // Aplica correções de sílabas
    let processedLyrics = finalLyrics
    try {
      processedLyrics = await UnifiedSyllableManager.processSongWithBalance(finalLyrics)
    } catch (error) {
      console.log("[API] ℹ️ Correção de sílabas não disponível")
    }

    // Adiciona instrumentação
    try {
      if (!processedLyrics.includes("(Instrumentation)")) {
        const instrumentation = formatInstrumentationForAI(genre, processedLyrics)
        processedLyrics = `${processedLyrics}\n\n${instrumentation}`
      }
    } catch (error) {
      console.log("[API] ℹ️ Instrumentação não disponível")
    }

    console.log(`[API] 🎉 CONCLUÍDO: "${title}"`)

    return NextResponse.json({
      success: true,
      lyrics: processedLyrics,
      title: title,
      metadata: {
        genre,
        theme, 
        totalLines: processedLyrics.split("\n").filter(line => line.trim()).length,
        quality: "STRICT_REWRITE",
        method: "SUPER_RESTRICTIVE",
        timestamp: new Date().toISOString()
      },
    })

  } catch (error) {
    console.error("[API] ❌ Erro crítico:", error)
    
    // Fallback extremamente simples
    const emergencyLyrics = `[Verso 1]
Vou escrevendo essa história
Com sentimento e verdade
Cada verso, cada linha
É um pedaço de saudade

[Refrão 1]
Cantando pro coração
Com amor e emoção
Uma música que fica
No peito como canção

[Outro]
Até a próxima vez`

    return NextResponse.json({
      success: true,
      lyrics: emergencyLyrics,
      title: title,
      metadata: {
        genre,
        theme,
        totalLines: emergencyLyrics.split("\n").filter(line => line.trim()).length,
        quality: "FALLBACK",
        method: "EMERGENCY"
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
