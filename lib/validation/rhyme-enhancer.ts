/**
 * Sistema de aprimoramento de rimas para o MetaComposer
 * Integração com o Sistema Universal de Qualidade
 */

import { analyzeRhyme, analyzeLyricsRhymeScheme, validateRhymesForGenre, RhymeQuality } from "./rhyme-validator"

export interface RhymeEnhancementResult {
  enhancedLyrics: string
  originalScore: number
  enhancedScore: number
  improvements: string[]
  rhymeAnalysis: ReturnType<typeof analyzeLyricsRhymeScheme>
}

/**
 * Aprimora as rimas de uma letra mantendo o significado original
 */
export async function enhanceLyricsRhymes(
  lyrics: string,
  genre: string,
  originalTheme: string,
  creativityLevel: number = 0.7
): Promise<RhymeEnhancementResult> {
  
  const lines = lyrics.split("\n")
  const enhancedLines: string[] = []
  const improvements: string[] = []
  
  const originalAnalysis = analyzeLyricsRhymeScheme(lyrics)
  let improvementCount = 0

  // Analisa pares de linhas para melhorar rimas
  for (let i = 0; i < lines.length - 1; i += 2) {
    const line1 = lines[i]
    const line2 = lines[i + 1]
    
    // Mantém linhas de estrutura e metadata
    if (line1.startsWith('[') || line1.startsWith('(') || 
        line1.includes('Instrumentos:') || line1.includes('BPM:') ||
        !line1.trim()) {
      enhancedLines.push(line1)
      if (line2) enhancedLines.push(line2)
      continue
    }

    const word1 = getLastWord(line1)
    const word2 = getLastWord(line2)
    
    if (word1 && word2) {
      const currentRhyme = analyzeRhyme(word1, word2)
      
      // Se a rima precisa de melhoria
      if (currentRhyme.score < getMinimumRhymeScore(genre)) {
        const enhancedPair = await enhanceRhymePair(
          line1, 
          line2, 
          genre, 
          originalTheme,
          creativityLevel
        )
        
        if (enhancedPair && enhancedPair.improved) {
          enhancedLines.push(enhancedPair.line1)
          enhancedLines.push(enhancedPair.line2)
          improvementCount++
          improvements.push(`Melhorada rima: "${word1}" + "${word2}" → ${enhancedPair.newRhymeType}`)
        } else {
          enhancedLines.push(line1)
          enhancedLines.push(line2)
        }
      } else {
        enhancedLines.push(line1)
        enhancedLines.push(line2)
      }
    } else {
      enhancedLines.push(line1)
      if (line2) enhancedLines.push(line2)
    }
  }

  const enhancedLyrics = enhancedLines.join('\n')
  const enhancedAnalysis = analyzeLyricsRhymeScheme(enhancedLyrics)

  return {
    enhancedLyrics,
    originalScore: originalAnalysis.score,
    enhancedScore: enhancedAnalysis.score,
    improvements,
    rhymeAnalysis: enhancedAnalysis
  }
}

/**
 * Aprimora um par de linhas para melhorar a rima
 */
async function enhanceRhymePair(
  line1: string,
  line2: string,
  genre: string,
  theme: string,
  creativity: number
): Promise<{ line1: string; line2: string; improved: boolean; newRhymeType?: string } | null> {
  
  const word1 = getLastWord(line1)
  const word2 = getLastWord(line2)
  
  if (!word1 || !word2) return null

  try {
    // Aqui você implementaria a chamada para a IA
    // Por enquanto, retornamos um mock para demonstração
    const enhanced = await mockRhymeEnhancement(line1, line2, genre, theme)
    
    if (enhanced) {
      const newRhyme = analyzeRhyme(getLastWord(enhanced.line1), getLastWord(enhanced.line2))
      return {
        line1: enhanced.line1,
        line2: enhanced.line2,
        improved: newRhyme.score > 60,
        newRhymeType: newRhyme.type
      }
    }
  } catch (error) {
    console.error('Erro ao aprimorar rima:', error)
  }

  return null
}

/**
 * Mock para demonstração - na implementação real, chamaria a IA
 */
async function mockRhymeEnhancement(
  line1: string,
  line2: string,
  genre: string,
  theme: string
): Promise<{ line1: string; line2: string } | null> {
  
  // Simula processamento
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const word1 = getLastWord(line1)
  const word2 = getLastWord(line2)
  
  // Mapeamento simples de melhorias
  const improvements: Record<string, string> = {
    'coração': 'canção',
    'paixão': 'ilusão', 
    'amor': 'calor',
    'dor': 'flor',
    'viver': 'esquecer',
    'partir': 'sofri',
    'sentir': 'dormir'
  }
  
  const improvedWord1 = improvements[word1] || word1
  const improvedWord2 = improvements[word2] || word2
  
  if (improvedWord1 !== word1 || improvedWord2 !== word2) {
    return {
      line1: line1.replace(new RegExp(`${word1}$`), improvedWord1),
      line2: line2.replace(new RegExp(`${word2}$`), improvedWord2)
    }
  }
  
  return null
}

/**
 * Obtém score mínimo de rima por gênero
 */
function getMinimumRhymeScore(genre: string): number {
  const genreLower = genre.toLowerCase()
  
  if (genreLower.includes('sertanejo raiz')) return 80
  if (genreLower.includes('mpb')) return 70
  if (genreLower.includes('sertanejo')) return 60
  if (genreLower.includes('pagode') || genreLower.includes('samba')) return 50
  if (genreLower.includes('funk') || genreLower.includes('trap')) return 30
  
  return 40 // Padrão para outros gêneros
}

/**
 * Extrai última palavra de uma linha
 */
function getLastWord(line: string): string {
  const cleaned = line.replace(/[^\wáàâãéèêíìîóòôõúùûç\s]/gi, "").trim()
  const words = cleaned.split(/\s+/)
  return words[words.length - 1] || ""
}

/**
 * Gera relatório detalhado de rimas
 */
export function generateRhymeReport(lyrics: string, genre: string) {
  const analysis = analyzeLyricsRhymeScheme(lyrics)
  const validation = validateRhymesForGenre(lyrics, genre)
  
  const rhymeTypes = analysis.quality.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return {
    overallScore: analysis.score,
    rhymeDistribution: rhymeTypes,
    scheme: analysis.scheme,
    validation: {
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings
    },
    suggestions: analysis.suggestions,
    qualityBreakdown: analysis.quality.map((q, i) => ({
      line: i + 1,
      type: q.type,
      score: q.score,
      explanation: q.explanation
    }))
  }
}
