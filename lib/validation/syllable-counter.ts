/**
 * Valida o limite de sílabas para uma linha de letra
 */
export function validateSyllableLimit(
  line: string, 
  maxSyllables: number = 11
): {
  isValid: boolean
  currentSyllables: number
  suggestions: string[]
} {
  const syllables = countPoeticSyllables(line)
  const suggestions: string[] = []
  
  if (syllables > maxSyllables) {
    suggestions.push(
      `Remova ${syllables - maxSyllables} sílaba(s) - tente encurtar palavras`,
      `Use contrações: "está" → "tá", "para" → "pra"`,
      `Remova artigos ou preposições desnecessárias`
    )
  } else if (syllables < maxSyllables) {
    suggestions.push(
      `Adicione ${maxSyllables - syllables} sílaba(s) - expanda palavras ou adicione artigos`,
      `Use palavras mais descritivas`,
      `Adicione advérbios ou adjetivos`
    )
  }
  
  return {
    isValid: syllables === maxSyllables,
    currentSyllables: syllables,
    suggestions
  }
}

/**
 * Valida sílabas de uma letra completa
 */
export function validateLyricsSyllables(
  lyrics: string,
  maxSyllables: number = 11,
): {
  valid: boolean
  violations: Array<{ line: string; syllables: number; lineNumber: number; suggestions: string[] }>
} {
  const lines = lyrics.split("\n")
  const violations: Array<{ line: string; syllables: number; lineNumber: number; suggestions: string[] }> = []

  lines.forEach((line, index) => {
    if (
      line.trim() &&
      !line.startsWith("[") &&
      !line.startsWith("(") &&
      !line.startsWith("Title:") &&
      !line.startsWith("Instrumentos:")
    ) {
      const validation = validateSyllableLimit(line, maxSyllables)
      if (!validation.isValid) {
        violations.push({
          line: line.trim(),
          syllables: validation.currentSyllables,
          lineNumber: index + 1,
          suggestions: validation.suggestions
        })
      }
    }
  })

  return {
    valid: violations.length === 0,
    violations,
  }
}
