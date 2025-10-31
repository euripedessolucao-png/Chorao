// app/api/rewrite-lyrics/route.ts - VERSÃO MELHORADA
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
  originalContext?: string
}

// 🎯 GERAR BLOCO PRESERVANDO CONTEXTO ORIGINAL
async function generateBlockVariations(
  blockType: MusicBlock["type"],
  genre: string,
  theme: string,
  originalLyrics: string,
  originalSection: string,
  count = 2,
): Promise<MusicBlock[]> {
  
  const lineTargets = {
    INTRO: 4,
    VERSE: 4,
    PRE_CHORUS: 3,
    CHORUS: 4,
    BRIDGE: 4,
    OUTRO: 3
  }

  // PROMPTS MELHORADOS - PRESERVANDO ELEMENTOS ORIGINAIS
  const prompts = {
    VERSE: `Reescreva esta SEÇÃO ORIGINAL mantendo os MESMOS ELEMENTOS CHAVE, mas no estilo ${genre}:

SEÇÃO ORIGINAL (preserve estas ideias):
"${originalSection}"

INSTRUÇÕES CRÍTICAS:
- MANTENHA: "${extractKeyElements(originalSection)}"
- Estilo: ${genre} 
- ${lineTargets.VERSE} linhas no máximo
- Máximo 11 sílabas por linha
- Linguagem natural brasileira
- NÃO REPITA frases de outras seções

FORMATO:
Linha 1 (mantendo elementos-chave)
Linha 2 (desenvolvendo a ideia)
Linha 3 (com emoção genuína)
Linha 4 (conclusão natural)`,

    CHORUS: `Reescreva este REFRÃO ORIGINAL mantendo a ESSÊNCIA EMOCIONAL, mas no estilo ${genre}:

REFRÃO ORIGINAL (preserve o sentimento):
"${originalSection}"

INSTRUÇÕES CRÍTICAS:
- MANTENHA o sentimento: "${extractEmotionalCore(originalSection)}"
- Estilo: ${genre}
- ${lineTargets.CHORUS} linhas no máximo  
- Máximo 12 sílabas por linha
- Seja MEMORÁVEL mas ORIGINAL
- Fácil de cantar junto

FORMATO:
Linha 1 (gancho emocional)
Linha 2 (desenvolvimento)
Linha 3 (profundidade)
Linha 4 (conclusão forte)`,

    BRIDGE: `Reescreva esta PONTE ORIGINAL mantendo a MUDANÇA PERSPECTIVA, mas no estilo ${genre}:

PONTE ORIGINAL (preserve a virada):
"${originalSection}"

INSTRUÇÕES CRÍTICAS:
- MANTENHA: "${extractPerspectiveShift(originalSection)}"
- Estilo: ${genre}
- ${lineTargets.BRIDGE} linhas no máximo
- Máximo 11 sílabas por linha
- Momento de REFLEXÃO PROFUNDA
- Mude a perspectiva

FORMATO:
Linha 1 (nova perspectiva)
Linha 2 (reflexão)
Linha 3 (insight)
Linha 4 (preparação para final)`
  }

  // Fallback para tipos não especificados
  const defaultPrompt = `Reescreva esta seção no estilo ${genre}, mantendo a essência da original:

"${originalSection}"

INSTRUÇÕES:
- ${lineTargets[blockType]} linhas
- Máximo ${blockType === 'CHORUS' ? 12 : 11} sílabas
- Mantenha o sentimento original
- Linguagem natural brasileira`

  try {
    const prompt = prompts[blockType] || defaultPrompt
    
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.8, // Mais criativo
    })

    console.log(`[BlockGen] ${blockType} reescrito:`, text?.substring(0, 150))
    
    return processGeneratedBlocks(text || "", blockType, count, lineTargets[blockType], originalSection)
  } catch (error) {
    console.error(`[BlockGen] Erro em ${blockType}:`, error)
    return generateContextualFallbackBlocks(blockType, originalSection, lineTargets[blockType], count)
  }
}

// 🧠 FUNÇÕES PARA EXTRAIR ELEMENTOS CHAVE
function extractKeyElements(section: string): string {
  const lines = section.split('\n').filter(line => 
    line.trim() && !line.startsWith('[') && !line.startsWith('(')
  )
  
  // Extrai palavras concretas e emocionais
  const keyWords = lines.flatMap(line => 
    line.split(/\s+/).filter(word => 
      word.length > 3 && 
      !['que', 'com', 'para', 'meu', 'minha', 'esse', 'essa'].includes(word.toLowerCase())
    )
  ).slice(0, 5)
  
  return keyWords.join(', ') || 'sentimento principal'
}

function extractEmotionalCore(section: string): string {
  const emotionalWords = ['amor', 'abraço', 'sorriso', 'alegria', 'lugar', 'coração', 'felicidade', 'renova']
  const lines = section.split('\n')
  
  for (const line of lines) {
    const found = emotionalWords.find(word => line.toLowerCase().includes(word))
    if (found) return found
  }
  
  return 'emoção central'
}

function extractPerspectiveShift(section: string): string {
  if (section.includes('eternidade') || section.includes('sempre')) return 'transformação temporal'
  if (section.includes('pensei') || section.includes('achava')) return 'mudança de pensamento'
  return 'nova perspectiva'
}

// 🧩 PROCESSAR BLOCO COM CONTEXTO
function processGeneratedBlocks(
  text: string, 
  blockType: MusicBlock["type"], 
  count: number,
  targetLines: number,
  originalContext: string
): MusicBlock[] {
  const blocks: MusicBlock[] = []
  const lines = text.split("\n").map(line => line.trim()).filter(line => 
    line.length > 0 && 
    !line.startsWith('INSTRUÇÕES') && 
    !line.startsWith('FORMATO') &&
    !line.startsWith('SEÇÃO') &&
    !line.startsWith('REFRÃO') &&
    !line.startsWith('PONTE')
  )

  let currentBlock: string[] = []

  for (const line of lines) {
    // Pula linhas de instrução e marcadores
    if (line.match(/^(Linha|Opção|Option|Versão)/i)) continue
    
    // Adiciona linha se for conteúdo real
    if (line.length > 10 && !line.match(/^\d/)) {
      currentBlock.push(line)
      
      if (currentBlock.length >= targetLines) {
        blocks.push({
          type: blockType,
          content: currentBlock.join("\n"),
          lines: [...currentBlock],
          score: calculateContextualScore(currentBlock.join("\n"), originalContext),
          originalContext
        })
        currentBlock = []
        
        if (blocks.length >= count) break
      }
    }
  }

  // Adiciona bloco incompleto se for bom
  if (currentBlock.length >= 2 && blocks.length < count) {
    blocks.push({
      type: blockType,
      content: currentBlock.join("\n"),
      lines: [...currentBlock],
      score: calculateContextualScore(currentBlock.join("\n"), originalContext),
      originalContext
    })
  }

  return blocks.slice(0, count)
}

// 📊 SCORE MELHORADO - AVALIA CONTEXTO
function calculateContextualScore(content: string, originalContext: string): number {
  const lines = content.split("\n").filter(line => line.trim())
  let score = 50 // Base

  // Bônus por preservação de contexto
  const originalWords = originalContext.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  const contentWords = content.toLowerCase().split(/\s+/)
  
  const preservedWords = originalWords.filter(word => 
    contentWords.some(cw => cw.includes(word) || word.includes(cw))
  ).length
  
  score += Math.min(preservedWords * 8, 30)

  // Bônus por estrutura adequada
  if (lines.length >= 3 && lines.length <= 6) {
    score += 15
  }

  // Penalidade por repetição excessiva
  const allWords = content.toLowerCase().split(/\s+/)
  const uniqueWords = new Set(allWords.filter(w => w.length > 2))
  const repetitionRatio = uniqueWords.size / allWords.length
  
  if (repetitionRatio < 0.3) score -= 20
  else if (repetitionRatio > 0.6) score += 10

  return Math.min(100, Math.max(20, score))
}

// 🆘 FALLBACK CONTEXTUAL
function generateContextualFallbackBlocks(
  blockType: MusicBlock["type"], 
  originalSection: string,
  lineCount: number,
  count: number
): MusicBlock[] {
  const blocks: MusicBlock[] = []
  
  // Extrai elementos da seção original para fallback inteligente
  const keyElements = extractKeyElements(originalSection)
  const emotionalCore = extractEmotionalCore(originalSection)
  
  const templates = {
    VERSE: [
      `Lembrando da ${keyElements.split(',')[0] || 'história'}\nDo ${emotionalCore} que ficou\nCada momento guardado\nNo peito que se abriu`,
      `No caminho da ${keyElements.split(',')[0] || 'vida'}\nO ${emotionalCore} renasceu\nTrazendo nova esperança\nPro coração que cresceu`
    ],
    CHORUS: [
      `É ${emotionalCore} que me guia\nNessa estrada da vida\nSeu ${keyElements.split(',')[0] || 'olhar'} me ilumina\nE a dor é esquecida`,
      `${emotionalCore} verdadeiro\nNo seu ${keyElements.split(',')[0] || 'abraço'} inteiro\nMeu coração encontra\nO caminho primeiro`
    ],
    BRIDGE: [
      `E o ${emotionalCore} que era sonho\nVirou realidade agora\nTransformou meu ${keyElements.split(',')[0] || 'caminho'}\nNuma linda aurora`,
      `Pensando no ${keyElements.split(',')[0] || 'passado'}\nVejo como mudou\nO ${emotionalCore} trouxe\nO amor que me salvou`
    ]
  }

  const template = templates[blockType] || templates.VERSE
  
  for (let i = 0; i < count && i < template.length; i++) {
    const lines = template[i].split("\n")
    blocks.push({
      type: blockType,
      content: template[i],
      lines,
      score: 65, // Score decente para fallback
      originalContext: originalSection
    })
  }

  return blocks
}

// 🏗️ MONTAR COMBINAÇÕES PRESERVANDO ESTRUTURA ORIGINAL
function assembleCombinations(
  blocks: Record<string, MusicBlock[]>, 
  originalStructure: string[]
): string[] {
  const combinations: string[] = []
  
  const sectionLabels: Record<string, string> = {
    INTRO: "Intro",
    VERSE: "Verso",
    PRE_CHORUS: "Pré-Refrão", 
    CHORUS: "Refrão",
    BRIDGE: "Ponte",
    OUTRO: "Outro"
  }

  // Usa a estrutura original como base
  for (let combo = 0; combo < 2; combo++) {
    let lyrics = ""
    let verseCount = 1
    let chorusCount = 1

    for (const sectionType of originalStructure) {
      const availableBlocks = blocks[sectionType] || []
      if (availableBlocks.length > 0) {
        // Seleciona baseado no score de contexto
        const bestBlock = availableBlocks.reduce((best, current) => 
          current.score > best.score ? current : best
        )

        let label = sectionLabels[sectionType] || sectionType
        
        // Numera adequadamente
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

// 🎼 DETECTAR ESTRUTURA ORIGINAL
function detectOriginalStructure(lyrics: string): string[] {
  const sections = parseLyricSections(lyrics)
  const structure: string[] = []
  
  for (const section of sections) {
    structure.push(section.type.toUpperCase() as any)
  }
  
  return structure.length > 0 ? structure : ["INTRO", "VERSE", "CHORUS", "VERSE", "CHORUS", "BRIDGE", "CHORUS", "OUTRO"]
}

// 🏆 SELECIONAR MELHOR COMBINAÇÃO (MELHORADO)
async function selectBestCombination(combinations: string[], genre: string, originalLyrics: string): Promise<string> {
  if (combinations.length === 0) {
    return generateSimpleFallbackLyric()
  }

  let bestScore = 0
  let bestLyrics = combinations[0]

  for (const lyrics of combinations) {
    try {
      const validated = await UnifiedSyllableManager.processSongWithBalance(lyrics)
      
      // Score por preservação de elementos originais
      const originalWords = originalLyrics.toLowerCase().split(/\s+/).filter(w => w.length > 3)
      const currentWords = validated.toLowerCase().split(/\s+/)
      const preserved = originalWords.filter(ow => 
        currentWords.some(cw => cw.includes(ow) || ow.includes(cw))
      ).length
      
      const preservationScore = Math.min((preserved / originalWords.length) * 40, 40)
      
      // Score por estrutura
      const sections = parseLyricSections(validated)
      const structureScore = Math.min(sections.length * 5, 30)
      
      const totalScore = preservationScore + structureScore

      if (totalScore > bestScore) {
        bestScore = totalScore
        bestLyrics = validated
      }
    } catch (error) {
      console.error("[Selection] Erro avaliando combinação:", error)
    }
  }

  console.log(`🎯 Melhor combinação selecionada: ${bestScore} pontos (preservação: ${bestScore})`)
  return bestLyrics
}

// 🎼 GERAR LETRA SIMPLES DE FALLBACK (mantido)
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

    console.log(`[API] 🎵 Iniciando reescrita INTELIGENTE: ${genre}`)

    // 🎯 1. ANALISAR ESTRUTURA ORIGINAL
    console.log("[API] 🔍 Analisando estrutura original...")
    const originalSections = parseLyricSections(originalLyrics)
    const originalStructure = detectOriginalStructure(originalLyrics)
    console.log(`[API] 📊 Estrutura detectada:`, originalStructure)

    // 🎯 2. GERAR BLOCOS COM CONTEXTO
    console.log("[API] 🎲 Gerando blocos contextuais...")
    const allBlocks: Record<string, MusicBlock[]> = {}

    for (const section of originalSections) {
      const blockType = section.type.toUpperCase() as MusicBlock["type"]
      
      try {
        allBlocks[blockType] = await generateBlockVariations(
          blockType, 
          genre, 
          theme, 
          originalLyrics,
          section.raw, // Passa a seção original completa
          2
        )
        console.log(`[API] ✅ ${blockType}: ${allBlocks[blockType].length} opções contextuais`)
      } catch (error) {
        console.error(`[API] ❌ Erro em ${blockType}:`, error)
        allBlocks[blockType] = generateContextualFallbackBlocks(blockType, section.raw, 4, 2)
      }
    }

    // 🧩 3. MONTAR COMBINAÇÕES PRESERVANDO ESTRUTURA
    console.log("[API] 🧩 Montando combinações contextuais...")
    const combinations = assembleCombinations(allBlocks, originalStructure)
    console.log(`[API] ✅ ${combinations.length} combinações criadas`)

    // 🏆 4. SELECIONAR MELHOR (COM PRESERVAÇÃO)
    console.log("[API] 🏆 Selecionando melhor combinação...")
    let finalLyrics = await selectBestCombination(combinations, genre, originalLyrics)

    // ✨ 5. APLICAR MELHORIAS
    console.log("[API] ✨ Aplicando melhorias finais...")
    
    try {
      const stackingResult = LineStacker.stackLines(finalLyrics)
      finalLyrics = stackingResult.stackedLyrics
    } catch (error) {
      console.log("[API] ℹ️ LineStacker não disponível")
    }

    // 🎸 6. INSTRUMENTAÇÃO
    try {
      if (!finalLyrics.includes("(Instrumentation)")) {
        const instrumentation = formatInstrumentationForAI(genre, finalLyrics)
        finalLyrics = `${finalLyrics}\n\n${instrumentation}`
      }
    } catch (error) {
      console.log("[API] ℹ️ Instrumentação não disponível")
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
        quality: "CONTEXTUAL_REWRITE",
        method: "INTELLIGENT_BLOCKS",
        timestamp: new Date().toISOString(),
        originalStructure
      },
    })

  } catch (error) {
    console.error("[API] ❌ Erro crítico:", error)
    
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
