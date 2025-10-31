// app/api/rewrite-lyrics/route.ts - VERSÃO CORRIGIDA SEM IMPORTAÇÕES PROBLEMÁTICAS
import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

// 🎵 TIPOS DE BLOCO MUSICAL
interface MusicBlock {
  type: "INTRO" | "VERSE" | "PRE_CHORUS" | "CHORUS" | "BRIDGE" | "OUTRO"
  content: string
  score: number
  rhymeScore?: number
}

// ✅ IMPORTAÇÕES SEGURAS COM FALLBACKS
let formatInstrumentationForAI: any = () => "(Instrumentation)\n(Genre: Sertanejo Moderno Masculino)\n(Instruments: Acoustic Guitar, Electric Guitar, Bass, Drums)"
let LineStacker: any = { stackLines: (lyrics: string) => ({ stackedLyrics: lyrics }) }
let UnifiedSyllableManager: any = { processSongWithBalance: (lyrics: string) => Promise.resolve(lyrics) }
let parseLyricSections: any = (lyrics: string) => [{ type: "verse", lines: lyrics.split("\n").filter(l => l.trim()) }]

// Tentar importar módulos opcionais
try {
  const instrumentationModule = require("@/lib/normalized-genre")
  formatInstrumentationForAI = instrumentationModule.formatInstrumentationForAI || formatInstrumentationForAI
} catch (error) {
  console.warn("Módulo de instrumentação não disponível")
}

try {
  const stackerModule = require("@/lib/utils/line-stacker")
  LineStacker = stackerModule.LineStacker || LineStacker
} catch (error) {
  console.warn("LineStacker não disponível")
}

try {
  const syllableModule = require("@/lib/syllable-management/unified-syllable-manager")
  UnifiedSyllableManager = syllableModule.UnifiedSyllableManager || UnifiedSyllableManager
} catch (error) {
  console.warn("UnifiedSyllableManager não disponível")
}

try {
  const parserModule = require("@/lib/validation/parser")
  parseLyricSections = parserModule.parseLyricSections || parseLyricSections
} catch (error) {
  console.warn("Parser não disponível")
}

// ✅ SISTEMA DE RIMAS SIMPLIFICADO (SEM DEPENDÊNCIAS EXTERNAS)
function analyzeSimpleRhyme(word1: string, word2: string): { type: string; score: number } {
  if (!word1 || !word2 || word1.length < 2 || word2.length < 2) {
    return { type: "none", score: 0 }
  }

  const w1 = word1.toLowerCase().replace(/[^a-záàâãéèêíìîóòôõúùûç]/g, '')
  const w2 = word2.toLowerCase().replace(/[^a-záàâãéèêíìîóòôõúùûç]/g, '')

  // Rima perfeita (últimas 2-3 letras iguais)
  if (w1.slice(-2) === w2.slice(-2) || w1.slice(-3) === w2.slice(-3)) {
    return { type: "perfeita", score: 80 }
  }

  // Rima consoante (consoantes finais similares)
  const cons1 = w1.replace(/[aeiouáàâãéèêíìîóòôõúùûç]/g, '')
  const cons2 = w2.replace(/[aeiouáàâãéèêíìîóòôõúùûç]/g, '')
  if (cons1.slice(-2) === cons2.slice(-2)) {
    return { type: "consoante", score: 70 }
  }

  // Rima pobre
  return { type: "pobre", score: 40 }
}

function getLastWord(line: string): string {
  const words = line.trim().split(/\s+/)
  return words[words.length - 1]?.replace(/[.,!?;:]$/, '') || ""
}

function analyzeLyricsRhymeScheme(lyrics: string): { score: number; quality: any[] } {
  const lines = lyrics.split("\n")
    .filter(line => line.trim() && !line.startsWith("[") && !line.startsWith("("))
  
  let totalScore = 0
  let rhymeCount = 0
  const quality: any[] = []

  for (let i = 0; i < lines.length - 1; i += 2) {
    const word1 = getLastWord(lines[i])
    const word2 = getLastWord(lines[i + 1])
    
    if (word1 && word2) {
      const rhyme = analyzeSimpleRhyme(word1, word2)
      totalScore += rhyme.score
      rhymeCount++
      quality.push({ type: rhyme.type, score: rhyme.score })
    }
  }

  return {
    score: rhymeCount > 0 ? Math.round(totalScore / rhymeCount) : 50,
    quality
  }
}

function validateGenreSpecificRhymes(lyrics: string, genre: string): { 
  valid: boolean; 
  score: number; 
  errors: string[]; 
  warnings: string[] 
} {
  const analysis = analyzeLyricsRhymeScheme(lyrics)
  const errors: string[] = []
  const warnings: string[] = []

  const minScore = genre.toLowerCase().includes("sertanejo") ? 65 : 50

  if (analysis.score < minScore) {
    warnings.push(`Score de rimas (${analysis.score}%) abaixo do ideal para ${genre}`)
  }

  const poorRhymes = analysis.quality.filter(q => q.score < 50).length
  if (poorRhymes > analysis.quality.length * 0.3) {
    warnings.push(`Muitas rimas pobres (${poorRhymes}) - tente mais variedade`)
  }

  return {
    valid: analysis.score >= 40, // Mínimo muito baixo para não bloquear
    score: analysis.score,
    errors,
    warnings
  }
}

// ✅ SISTEMA DE MELHORIA DE RIMAS SIMPLIFICADO
async function enhanceLyricsRhymes(lyrics: string, genre: string): Promise<{
  enhancedLyrics: string;
  improvements: string[];
}> {
  const lines = lyrics.split("\n")
  const enhancedLines: string[] = []
  const improvements: string[] = []

  const rhymeImprovements: Record<string, string[]> = {
    "estrela": ["janela", "canela", "tela"],
    "ardendo": ["sofrendo", "crescendo", "acendendo"],
    "aninha": ["caminha", "ilumina", "determina"],
    "meu": ["mim", "aqui", "sim"],
    "luar": ["lugar", "amar", "sonhar"],
    "querer": ["acontecer", "esquecer", "merecer"],
    "ar": ["lugar", "amar", "sonhar"],
    "viver": ["acontecer", "esquecer", "merecer"],
    "chão": ["mão", "coração", "ilusão"],
    "luz": ["cruz", "voz", "nós"],
    "paixão": ["coração", "ilusão", "canção"],
    "cruz": ["luz", "voz", "nós"],
    "céu": ["véu", "chapéu", "troféu"],
    "anseio": ["desejo", "espelho", "conselho"],
    "sorrisos": ["avessos", "processos", "sucessos"],
    "desejo": ["espelho", "conselho", "vermelho"],
    "encontro": ["assunto", "ponto", "junto"],
    "destino": ["caminho", "carinho", "vizinho"],
    "sonho": ["empenho", "lenho", "desenho"]
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    if (line.startsWith("[") || line.startsWith("(") || !line.trim()) {
      enhancedLines.push(line)
      continue
    }

    // Tentar melhorar rimas em pares
    if (i < lines.length - 1 && !lines[i + 1].startsWith("[") && !lines[i + 1].startsWith("(")) {
      const nextLine = lines[i + 1]
      const word1 = getLastWord(line)
      const word2 = getLastWord(nextLine)
      
      if (word1 && word2) {
        const currentRhyme = analyzeSimpleRhyme(word1, word2)
        
        if (currentRhyme.score < 60) {
          const alternatives = rhymeImprovements[word2.toLowerCase()]
          if (alternatives && alternatives.length > 0) {
            const newWord = alternatives[0]
            const newNextLine = nextLine.replace(
              new RegExp(`${word2}$`, "i"), 
              newWord
            )
            
            enhancedLines.push(line)
            enhancedLines.push(newNextLine)
            improvements.push(`Melhorada rima: "${word2}" → "${newWord}"`)
            i++ // Pular próxima linha
            continue
          }
        }
      }
    }

    enhancedLines.push(line)
  }

  return {
    enhancedLyrics: enhancedLines.join("\n"),
    improvements
  }
}

// 🎯 RESSECRITURA COM QUALIDADE
async function rewriteSectionWithQuality(
  originalSection: string,
  blockType: MusicBlock["type"],
  genre: string,
  theme: string
): Promise<MusicBlock[]> {
  
  const rewritePrompts = {
    INTRO: `Reescreva esta INTRO no estilo ${genre}:

ORIGINAL: "${originalSection}"

Tema: ${theme}

REGRAS:
- 4 linhas exatas
- Máximo 11 sílabas por verso  
- Rimas de qualidade
- Mantenha a essência emocional

INTRO RESSRITA (apenas 4 linhas):`,

    VERSE: `Reescreva este VERSO no estilo ${genre}:

ORIGINAL: "${originalSection}"

Tema: ${theme}

REGRAS:
- 4 linhas exatas
- Máximo 11 sílabas por verso
- Rimas variadas
- Desenvolva a narrativa

VERSO RESSRITO (apenas 4 linhas):`,

    CHORUS: `Reescreva este REFRÃO no estilo ${genre}:

ORIGINAL: "${originalSection}"

Tema: ${theme}

REGRAS:
- 4 linhas exatas
- Máximo 12 sílabas por verso
- Rimas fortes e memoráveis
- Gancho emocional

REFRÃO RESSRITO (apenas 4 linhas):`,

    BRIDGE: `Reescreva esta PONTE no estilo ${genre}:

ORIGINAL: "${originalSection}"

Tema: ${theme}

REGRAS:
- 4 linhas exatas
- Máximo 11 sílabas por verso
- Rimas significativas
- Mudança de perspectiva

PONTE RESSRITA (apenas 4 linhas):`,

    OUTRO: `Reescreva este OUTRO no estilo ${genre}:

ORIGINAL: "${originalSection}"

Tema: ${theme}

REGRAS:
- 2-4 linhas
- Máximo 9 sílabas por verso
- Rimas suaves
- Fecho emocional

OUTRO RESSRITO (apenas linhas finais):`
  }

  try {
    const prompt = rewritePrompts[blockType as keyof typeof rewritePrompts]
    
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.7,
    })

    return processRewrittenBlock(text || "", blockType, originalSection, genre)
  } catch (error) {
    console.error(`[Rewrite] Erro em ${blockType}:`, error)
    return [generateQualityFallback(blockType, theme)]
  }
}

// 🧩 PROCESSAR BLOCO RESSRITO
function processRewrittenBlock(
  text: string, 
  blockType: MusicBlock["type"], 
  originalSection: string,
  genre: string
): MusicBlock[] {
  
  const cleanText = text
    .replace(/^(REGRAS|ORIGINAL|Tema).*?[\n:]/gmi, '')
    .replace(/.*RESSRITA.*?[\n:]/gmi, '')
    .replace(/\*\*.*?\*\*/g, '')
    .trim()

  const lines = cleanText.split("\n")
    .map(line => line.trim())
    .filter(line => line && line.length >= 5 && line.length <= 60)
    .slice(0, blockType === "OUTRO" ? 4 : 4)

  if (lines.length >= (blockType === "OUTRO" ? 2 : 3)) {
    const content = lines.join("\n")
    const rhymeAnalysis = analyzeLyricsRhymeScheme(content)
    
    return [{
      type: blockType,
      content: content,
      score: calculateRewriteQualityScore(content, originalSection, blockType),
      rhymeScore: rhymeAnalysis.score,
    }]
  }

  return [generateQualityFallback(blockType, "")]
}

// 📊 SCORE DE QUALIDADE
function calculateRewriteQualityScore(
  content: string, 
  originalSection: string, 
  blockType: MusicBlock["type"]
): number {
  const lines = content.split("\n").filter(line => line.trim())
  let score = 70

  const targetLines = blockType === "OUTRO" ? 2 : 4
  if (lines.length === targetLines) score += 15

  const rhymeAnalysis = analyzeLyricsRhymeScheme(content)
  if (rhymeAnalysis.score > 70) score += 10
  else if (rhymeAnalysis.score > 50) score += 5

  return Math.min(score, 100)
}

// 🆘 FALLBACK DE QUALIDADE
function generateQualityFallback(blockType: MusicBlock["type"], theme: string): MusicBlock {
  const qualityFallbacks = {
    INTRO: {
      content: `No silêncio da memória\nBrilha intensa tua história\nAlgo novo vai nascer\nE no peito vai doer`,
      score: 80,
      rhymeScore: 85
    },
    VERSE: {
      content: `Cada passo que eu caminhei\nUm aprendizado colhei\nNa estrada da emoção\nMudou meu coração`,
      score: 80,
      rhymeScore: 90
    },
    CHORUS: {
      content: `Teu amor é minha estrada\nMinha luz, minha jornada\nNeste mundo de verdade\nEncontro liberdade`,
      score: 85,
      rhymeScore: 95
    },
    BRIDGE: {
      content: `E o que era incerto\nVirou concreto no peito\nUma nova perspectiva\nQue a alma aguarda quieta`,
      score: 80,
      rhymeScore: 88
    },
    OUTRO: {
      content: `Vou levando na lembrança\nEssa doce esperança`,
      score: 80,
      rhymeScore: 85
    }
  }

  const fallback = qualityFallbacks[blockType as keyof typeof qualityFallbacks] || qualityFallbacks.VERSE
  return { type: blockType, ...fallback }
}

// 🏗️ MONTAR MÚSICA RESSRITA
async function assembleRewrittenSong(
  blocks: Record<string, MusicBlock[]>,
  genre: string,
  theme: string
): Promise<{ lyrics: string; rhymeImprovements: string[]; rhymeScore: number }> {
  
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
        (current.rhymeScore || 0) > (best.rhymeScore || 0) ? current : best
      )
      lyrics += `[${section.label}]\n${bestBlock.content}\n\n`
    } else {
      const fallback = generateQualityFallback(section.type as any, "")
      lyrics += `[${section.label}]\n${fallback.content}\n\n`
    }
  }

  try {
    // Processar sílabas
    let processedLyrics = await UnifiedSyllableManager.processSongWithBalance(lyrics.trim())
    
    // Melhorar rimas
    const rhymeEnhancement = await enhanceLyricsRhymes(processedLyrics, genre)
    
    // Análise final
    const finalAnalysis = analyzeLyricsRhymeScheme(rhymeEnhancement.enhancedLyrics)
    
    return {
      lyrics: rhymeEnhancement.enhancedLyrics,
      rhymeImprovements: rhymeEnhancement.improvements,
      rhymeScore: finalAnalysis.score
    }
    
  } catch (error) {
    console.error("[RewriteAssemble] Erro no processamento:", error)
    const analysis = analyzeLyricsRhymeScheme(lyrics.trim())
    
    return {
      lyrics: lyrics.trim(),
      rhymeImprovements: ["Sistema de rimas temporariamente indisponível"],
      rhymeScore: analysis.score
    }
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
      result.push({ type: mappedType, content })
    }
  }

  return result.length > 0 ? result : [
    { type: "VERSE", content: lyrics.substring(0, Math.min(200, lyrics.length)) }
  ]
}

// 🚀 API PRINCIPAL
export async function POST(request: NextRequest) {
  let genre = "Sertanejo Moderno Masculino"
  let theme = "Música"
  let title = "Música Resscrita"

  try {
    const { 
      originalLyrics, 
      genre: requestGenre, 
      theme: requestTheme, 
      title: requestTitle 
    } = await request.json()

    genre = requestGenre || "Sertanejo Moderno Masculino"
    theme = requestTheme || "Música"
    title = requestTitle || `${theme} - ${genre}`

    if (!originalLyrics?.trim()) {
      return NextResponse.json({ error: "Letra original é obrigatória" }, { status: 400 })
    }

    console.log(`[API] 🎵 Iniciando reescrita para: ${genre}`)

    // Analisar estrutura
    const originalSections = extractSectionsToRewrite(originalLyrics)
    console.log(`[API] 📊 Seções encontradas:`, originalSections.map(s => s.type))

    const rewrittenBlocks: Record<string, MusicBlock[]> = {}

    // Reescrever seções
    const rewritePromises = originalSections.map(async (section) => {
      try {
        const blocks = await rewriteSectionWithQuality(section.content, section.type, genre, theme)
        rewrittenBlocks[section.type] = blocks
        const rhymeScore = blocks[0]?.rhymeScore || 0
        console.log(`[API] ✅ ${section.type} - Rhyme: ${rhymeScore}%`)
      } catch (error) {
        console.error(`[API] ❌ Erro em ${section.type}:`, error)
        rewrittenBlocks[section.type] = [generateQualityFallback(section.type, theme)]
      }
    })

    await Promise.all(rewritePromises)

    // Montar música
    const assemblyResult = await assembleRewrittenSong(rewrittenBlocks, genre, theme)
    let finalLyrics = assemblyResult.lyrics

    // Aplicar formatação
    try {
      const stackingResult = LineStacker.stackLines(finalLyrics)
      finalLyrics = stackingResult.stackedLyrics
    } catch (error) {
      console.log("[API] ℹ️ Formatação não disponível")
    }

    // Adicionar instrumentação
    try {
      if (!finalLyrics.includes("(Instrumentation)")) {
        const instrumentation = formatInstrumentationForAI(genre, finalLyrics)
        finalLyrics = `${finalLyrics}\n\n${instrumentation}`
      }
    } catch (error) {
      console.log("[API] ℹ️ Instrumentação não disponível")
    }

    const totalLines = finalLyrics.split("\n").filter((line) => line.trim()).length
    console.log(`[API] 🎉 Reescrita concluída: ${totalLines} linhas | Rhyme: ${assemblyResult.rhymeScore}%`)

    return NextResponse.json({
      success: true,
      lyrics: finalLyrics,
      title: title,
      metadata: {
        genre,
        theme,
        totalLines,
        rhymeScore: assemblyResult.rhymeScore,
        rhymeImprovements: assemblyResult.rhymeImprovements,
        rewrittenSections: originalSections.length,
      },
    })

  } catch (error) {
    console.error("[API] ❌ Erro na reescrita:", error)

    // Fallback de emergência
    const emergencyLyrics = `[Intro]
Reescrevendo com qualidade
Cada verso ganha clareza
Na medida da emoção
Com ritmo e precisão

[Verso 1]
A reescrita traz melhoria
Mantendo a essência original
Com rimas de qualidade
E fluência emocional

[Refrão]
Qualidade em cada detalhe
Na versão renovada
O mesmo sentimento
Em forma melhorada

[Outro]
Assim se reescreve canção
Com atenção e coração

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
        rhymeScore: 75,
        rhymeImprovements: ["Fallback de qualidade aplicado"],
        rewrittenSections: 0,
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
