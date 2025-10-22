// SUBSTITUA estas funções no seu lib/validation/syllable-counter.ts

export function validateSyllableLimit(line: string, maxSyllables = 11): {
  isValid: boolean
  currentSyllables: number
  suggestions: string[]
} {
  // Ignora validação se linha termina com vírgula (enjambement)
  if (line.trim().endsWith(",")) {
    return {
      isValid: true,
      currentSyllables: 0,
      suggestions: []
    }
  }

  const count = countPoeticSyllables(line)
  const isValid = count <= maxSyllables
  
  // Gerar sugestões básicas se não for válido
  const suggestions = isValid ? [] : generateBasicSuggestions(line, maxSyllables)

  return {
    isValid,
    currentSyllables: count,
    suggestions
  }
}

// ADICIONE esta função auxiliar (cole no final do arquivo, antes do export final)
function generateBasicSuggestions(line: string, maxSyllables: number): string[] {
  const suggestions: string[] = []
  const words = line.split(' ')
  
  // Contrações comuns
  const contractions: [string, string][] = [
    [' para ', ' pra '],
    [' você ', ' cê '],
    [' está ', ' tá '],
    [' estou ', ' tô '],
    [' de ', ' d' ],
    [' que ', ' q' ],
  ]
  
  for (const [from, to] of contractions) {
    if (line.includes(from)) {
      const suggestion = line.replace(new RegExp(from, 'g'), to)
      const syllables = countPoeticSyllables(suggestion)
      if (syllables <= maxSyllables) {
        suggestions.push(suggestion)
      }
    }
  }
  
  // Sugestão: remover última palavra se possível
  if (words.length > 2) {
    const withoutLast = words.slice(0, -1).join(' ')
    const syllables = countPoeticSyllables(withoutLast)
    if (syllables <= maxSyllables && syllables > 0) {
      suggestions.push(withoutLast)
    }
  }
  
  return suggestions.slice(0, 3)
}

export function validateLyricsSyllables(
  lyrics: string,
  maxSyllables = 11,
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
      if (line.trim().endsWith(",")) {
        return // Enjambement é válido
      }

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
