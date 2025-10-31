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

  // CORREÇÃO: ADICIONAR TODOS OS TIPOS DE PROMPTS
  const prompts = {
    INTRO: `Reescreva esta INTRO ORIGINAL mantendo a ATMOSFERA, mas no estilo ${genre}:

INTRO ORIGINAL:
"${originalSection}"

INSTRUÇÕES:
- MANTENHA a atmosfera: "${extractKeyElements(originalSection)}"
- Estilo: ${genre}
- ${lineTargets.INTRO} linhas no máximo
- Máximo 10 sílabas por linha
- Crie clima emocional

FORMATO:
Linha 1 (atmosfera)
Linha 2 (contexto)
Linha 3 (emoção)
Linha 4 (transição)`,

    VERSE: `Reescreva esta SEÇÃO ORIGINAL mantendo os MESMOS ELEMENTOS CHAVE, mas no estilo ${genre}:

SEÇÃO ORIGINAL (preserve estas ideias):
"${originalSection}"

INSTRUÇÕES:
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

    PRE_CHORUS: `Reescreva este PRÉ-REFRÃO ORIGINAL mantendo a TENSÃO, mas no estilo ${genre}:

PRÉ-REFRÃO ORIGINAL:
"${originalSection}"

INSTRUÇÕES:
- MANTENHA a tensão emocional
- Estilo: ${genre}
- ${lineTargets.PRE_CHORUS} linhas no máximo
- Máximo 11 sílabas por linha
- Prepare para o refrão
- Crie expectativa

FORMATO:
Linha 1 (preparação)
Linha 2 (tensão)
Linha 3 (clímax)`,

    CHORUS: `Reescreva este REFRÃO ORIGINAL mantendo a ESSÊNCIA EMOCIONAL, mas no estilo ${genre}:

REFRÃO ORIGINAL (preserve o sentimento):
"${originalSection}"

INSTRUÇÕES:
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

INSTRUÇÕES:
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
Linha 4 (preparação para final)`,

    OUTRO: `Reescreva este OUTRO ORIGINAL mantendo o FECHO EMOCIONAL, mas no estilo ${genre}:

OUTRO ORIGINAL:
"${originalSection}"

INSTRUÇÕES:
- MANTENHA o fecho emocional
- Estilo: ${genre}
- ${lineTargets.OUTRO} linhas no máximo
- Máximo 9 sílabas por linha
- Sensação de conclusão
- Deixe marca emocional

FORMATO:
Linha 1 (resumo)
Linha 2 (emoção final)
Linha 3 (despedida)`
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
    // CORREÇÃO: Agora todos os tipos têm prompts
    const prompt = prompts[blockType] || defaultPrompt
    
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.8,
    })

    console.log(`[BlockGen] ${blockType} reescrito:`, text?.substring(0, 150))
    
    return processGeneratedBlocks(text || "", blockType, count, lineTargets[blockType], originalSection)
  } catch (error) {
    console.error(`[BlockGen] Erro em ${blockType}:`, error)
    return generateContextualFallbackBlocks(blockType, originalSection, lineTargets[blockType], count)
  }
}

// 🧠 FUNÇÕES PARA EXTRAIR ELEMENTOS CHAVE (mantidas iguais)
function extractKeyElements(section: string): string {
  const lines = section.split('\n').filter(line => 
    line.trim() && !line.startsWith('[') && !line.startsWith('(')
  )
  
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

// 🧩 PROCESSAR BLOCO COM CONTEXTO (mantido igual)
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
    if (line.match(/^(Linha|Opção|Option|Versão)/i)) continue
    
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

// 📊 SCORE MELHORADO - AVALIA CONTEXTO (mantido igual)
function calculateContextualScore(content: string, originalContext: string): number {
  const lines = content.split("\n").filter(line => line.trim())
  let score = 50

  const originalWords = originalContext.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  const contentWords = content.toLowerCase().split(/\s+/)
  
  const preservedWords = originalWords.filter(word => 
    contentWords.some(cw => cw.includes(word) || word.includes(cw))
  ).length
  
  score += Math.min(preservedWords * 8, 30)

  if (lines.length >= 3 && lines.length <= 6) {
    score += 15
  }

  const allWords = content.toLowerCase().split(/\s+/)
  const uniqueWords = new Set(allWords.filter(w => w.length > 2))
  const repetitionRatio = uniqueWords.size / allWords.length
  
  if (repetitionRatio < 0.3) score -= 20
  else if (repetitionRatio > 0.6) score += 10

  return Math.min(100, Math.max(20, score))
}

// 🆘 FALLBACK CONTEXTUAL (mantido igual)
function generateContextualFallbackBlocks(
  blockType: MusicBlock["type"], 
  originalSection: string,
  lineCount: number,
  count: number
): MusicBlock[] {
  const blocks: MusicBlock[] = []
  
  const keyElements = extractKeyElements(originalSection)
  const emotionalCore = extractEmotionalCore(originalSection)
  
  const templates = {
    INTRO: [
      `No começo dessa história\nO ${emotionalCore} surgiu\nTransformando a ${keyElements.split(',')[0] || 'vida'}\nQue em mim sempre existiu`,
      `Iniciando essa jornada\nCom ${emotionalCore} no olhar\nA ${keyElements.split(',')[0] || 'estrada'} se abre\nPronta pra me levar`
    ],
    VERSE: [
      `Lembrando da ${keyElements.split(',')[0] || 'história'}\nDo ${emotionalCore} que ficou\nCada momento guardado\nNo peito que se abriu`,
      `No caminho da ${keyElements.split(',')[0] || 'vida'}\nO ${emotionalCore} renasceu\nTrazendo nova esperança\nPro coração que cresceu`
    ],
    PRE_CHORUS: [
      `E agora o coração\nPrepara pro momento\nDo ${emotionalCore} que vem\nCom novo sentimento`,
      `O instante chegou\nTudo vai mudar\nO ${emotionalCore} transforma\nE faz renovar`
    ],
    CHORUS: [
      `É ${emotionalCore} que me guia\nNessa estrada da vida\nSeu ${keyElements.split(',')[0] || 'olhar'} me ilumina\nE a dor é esquecida`,
      `${emotionalCore} verdadeiro\nNo seu ${keyElements.split(',')[0] || 'abraço'} inteiro\nMeu coração encontra\nO caminho primeiro`
    ],
    BRIDGE: [
      `E o ${emotionalCore} que era sonho\nVirou realidade agora\nTransformou meu ${keyElements.split(',')[0] || 'caminho'}\nNuma linda aurora`,
      `Pensando no ${keyElements.split(',')[0] || 'passado'}\nVejo como mudou\nO ${emotionalCore} trouxe\nO amor que me salvou`
    ],
    OUTRO: [
      `E assim termina\nEssa melodia\nCom ${emotionalCore} no peito\nPra sempre em meu dia`,
      `Até a próxima vez\nCom ${emotionalCore} e paz\nA música continua\nNo coração demais`
    ]
  }

  const template = templates[blockType] || templates.VERSE
  
  for (let i = 0; i < count && i < template.length; i++) {
    const lines = template[i].split("\n")
    blocks.push({
      type: blockType,
      content: template[i],
      lines,
      score: 65,
      originalContext: originalSection
    })
  }

  return blocks
}

// 🏗️ MONTAR COMBINAÇÕES PRESERVANDO ESTRUTURA ORIGINAL (mantido igual)
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

  for (let combo = 0; combo < 2; combo++) {
    let lyrics = ""
    let verseCount = 1
    let chorusCount = 1

    for (const sectionType of originalStructure) {
      const availableBlocks = blocks[sectionType] || []
      if (availableBlocks.length > 0) {
        const bestBlock = availableBlocks.reduce((best, current) => 
          current.score > best.score ? current : best
        )

        let label = sectionLabels[sectionType] || sectionType
        
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

// 🎼 DETECTAR ESTRUTURA ORIGINAL (mantido igual)
function detectOriginalStructure(lyrics: string): string[] {
  const sections = parseLyricSections(lyrics)
  const structure: string[] = []
  
  for (const section of sections) {
    structure.push(section.type.toUpperCase() as any)
  }
  
  return structure.length > 0 ? structure : ["INTRO", "VERSE", "CHORUS", "VERSE", "CHORUS", "BRIDGE", "CHORUS", "OUTRO"]
}

// 🏆 SELECIONAR MELHOR COMBINAÇÃO (mantido igual)
async function selectBestCombination(combinations: string[], genre: string, originalLyrics: string): Promise<string> {
  if (combinations.length === 0) {
    return generateSimpleFallbackLyric()
  }

  let bestScore = 0
  let bestLyrics = combinations[0]

  for (const lyrics of combinations) {
    try {
      const validated = await UnifiedSyllableManager.processSongWithBalance(lyrics)
      
      const originalWords = originalLyrics.toLowerCase().split(/\s+/).filter(w => w.length > 3)
      const currentWords = validated.toLowerCase().split(/\s+/)
      const preserved = originalWords.filter(ow => 
        currentWords.some(cw => cw.includes(ow) || ow.includes(cw))
      ).length
      
      const preservationScore = Math.min((preserved / originalWords.length) * 40, 40)
      
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

  console.log(`🎯 Melhor combinação selecionada: ${bestScore} pontos`)
  return bestLyrics
}

// 🎼 GERAR LETRA SIMPLES DE FALLBACK (mantido igual)
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

// ✅ POST E GET (mantidos iguais)
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

    const originalSections = parseLyricSections(originalLyrics)
    const originalStructure = detectOriginalStructure(originalLyrics)
    console.log(`[API] 📊 Estrutura detectada:`, originalStructure)

    const allBlocks: Record<string, MusicBlock[]> = {}

    for (const section of originalSections) {
      const blockType = section.type.toUpperCase() as MusicBlock["type"]
      
      try {
        allBlocks[blockType] = await generateBlockVariations(
          blockType, 
          genre, 
          theme, 
          originalLyrics,
          section.raw,
          2
        )
        console.log(`[API] ✅ ${blockType}: ${allBlocks[blockType].length} opções contextuais`)
      } catch (error) {
        console.error(`[API] ❌ Erro em ${blockType}:`, error)
        allBlocks[blockType] = generateContextualFallbackBlocks(blockType, section.raw, 4, 2)
      }
    }

    const combinations = assembleCombinations(allBlocks, originalStructure)
    console.log(`[API] ✅ ${combinations.length} combinações criadas`)

    let finalLyrics = await selectBestCombination(combinations, genre, originalLyrics)

    try {
      const stackingResult = LineStacker.stackLines(finalLyrics)
      finalLyrics = stackingResult.stackedLyrics
    } catch (error) {
      console.log("[API] ℹ️ LineStacker não disponível")
    }

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
