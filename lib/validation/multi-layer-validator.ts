// lib/validation/multi-layer-validator.ts - NOVO ARQUIVO

export interface MultiLayerValidationResult {
  isValid: boolean
  overallScore: number
  blockers: string[]
  suggestions: string[]
  layerScores: {
    grammar: number
    emotion: number
    structure: number
    theme: number
  }
}

export function validateAllLayers(lyrics: string, genre: string, theme: string): MultiLayerValidationResult {
  const blockers: string[] = []
  const suggestions: string[] = []
  
  let grammarScore = 100
  let emotionScore = 100
  let structureScore = 100
  let themeScore = 100

  const lines = lyrics.split('\n').filter(line => line.trim())

  // CAMADA 1: GRAMÁTICA BÁSICA
  const grammarIssues = validateGrammarLayer(lines)
  if (grammarIssues.length > 0) {
    blockers.push(...grammarIssues.slice(0, 2)) // Limita blockers
    grammarScore -= grammarIssues.length * 10
  }

  // CAMADA 2: EMOÇÃO E FLUXO
  const emotionIssues = validateEmotionLayer(lines, genre)
  emotionScore -= emotionIssues.length * 5
  suggestions.push(...emotionIssues)

  // CAMADA 3: ESTRUTURA
  const structureIssues = validateStructureLayer(lyrics)
  structureScore -= structureIssues.length * 8

  // CAMADA 4: TEMA
  const themeIssues = validateThemeLayer(lyrics, theme)
  themeScore -= themeIssues.length * 7
  suggestions.push(...themeIssues)

  const overallScore = Math.round(
    (grammarScore + emotionScore + structureScore + themeScore) / 4
  )

  return {
    isValid: blockers.length === 0 && overallScore >= 70,
    overallScore,
    blockers,
    suggestions: suggestions.slice(0, 3), // Limita sugestões
    layerScores: {
      grammar: grammarScore,
      emotion: emotionScore,
      structure: structureScore,
      theme: themeScore
    }
  }
}

function validateGrammarLayer(lines: string[]): string[] {
  const issues: string[] = []
  
  lines.forEach((line, index) => {
    const trimmed = line.trim()
    
    if (!trimmed || trimmed.startsWith('[') || trimmed.startsWith('(')) {
      return
    }

    // Verifica frases incompletas
    if (isIncompletePhrase(trimmed)) {
      issues.push(`Linha ${index + 1}: Frase parece incompleta`)
    }

    // Verifica repetição excessiva
    if (hasExcessiveRepetition(trimmed)) {
      issues.push(`Linha ${index + 1}: Repetição excessiva de palavras`)
    }
  })

  return issues
}

function validateEmotionLayer(lines: string[], genre: string): string[] {
  const suggestions: string[] = []
  let emotionalLines = 0

  lines.forEach((line, index) => {
    if (!line.trim() || line.startsWith('[') || line.startsWith('(')) return

    if (hasEmotionalContent(line)) {
      emotionalLines++
    }

    // Sugestões específicas por gênero
    if (genre.toLowerCase().includes('sertanejo') && isTooAbstract(line)) {
      suggestions.push(`Linha ${index + 1}: Muito abstrata para sertanejo - tente algo mais concreto`)
    }
  })

  const emotionalRatio = emotionalLines / lines.length
  if (emotionalRatio < 0.3) {
    suggestions.push('Poucas linhas com conteúdo emocional - tente aumentar a carga emocional')
  }

  return suggestions
}

function validateStructureLayer(lyrics: string): string[] {
  const issues: string[] = []
  
  const sections = lyrics.split('\n').filter(line => 
    line.trim().startsWith('[') && line.trim().endsWith(']')
  )
  
  if (sections.length < 3) {
    issues.push('Estrutura muito simples - considere adicionar mais seções (verso, refrão, ponte)')
  }

  const hasChorus = sections.some(section => 
    section.toLowerCase().includes('chorus') || section.toLowerCase().includes('refrão')
  )
  
  if (!hasChorus) {
    issues.push('Letra sem refrão identificado - refrão é essencial para música')
  }

  return issues
}

function validateThemeLayer(lyrics: string, theme: string): string[] {
  const suggestions: string[] = []
  const themeWords = theme.toLowerCase().split(/\s+/).filter(word => word.length > 3)
  
  if (themeWords.length === 0) return suggestions

  const lyricsLower = lyrics.toLowerCase()
  let themeMatches = 0

  themeWords.forEach(word => {
    if (lyricsLower.includes(word)) {
      themeMatches++
    }
  })

  const matchRatio = themeMatches / themeWords.length
  if (matchRatio < 0.5) {
    suggestions.push(`Pouca conexão com o tema "${theme}" - tente incorporar mais palavras relacionadas`)
  }

  return suggestions
}

// FUNÇÕES AUXILIARES
function isIncompletePhrase(line: string): boolean {
  const incompletePatterns = [
    /\b(e|a|o|que|de|em|com|pra|pro|no|na)\s*$/i,
    /[,-]\s*$/,
    /^\s*\w+\s+[e|a|o]\s*$/i
  ]
  
  return incompletePatterns.some(pattern => pattern.test(line))
}

function hasExcessiveRepetition(line: string): boolean {
  const words = line.toLowerCase().split(/\s+/)
  const wordCount: Record<string, number> = {}
  
  words.forEach(word => {
    if (word.length > 2) {
      wordCount[word] = (wordCount[word] || 0) + 1
    }
  })
  
  return Object.values(wordCount).some(count => count > 2)
}

function hasEmotionalContent(line: string): boolean {
  const emotionalWords = [
    'amor', 'dor', 'saudade', 'coração', 'vida', 'alma', 'sonho',
    'fé', 'esperança', 'medo', 'verdade', 'mentira', 'partir', 'ficar'
  ]
  
  return emotionalWords.some(word => line.toLowerCase().includes(word))
}

function isTooAbstract(line: string): boolean {
  const abstractWords = [
    'vida', 'amor', 'paz', 'alegria', 'esperança', 'fé',
    'destino', 'universo', 'eternidade', 'infinito'
  ]
  
  const words = line.toLowerCase().split(/\s+/)
  const abstractCount = words.filter(word => abstractWords.includes(word)).length
  
  return abstractCount >= 2
}
