// Adicione esta função ao lib/validation/syllable-counter.ts se não existir

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
