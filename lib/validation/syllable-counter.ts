// lib/validation/syllable-counter.ts

/**
 * Conta sílabas poéticas em texto português (implementação básica)
 * TODO: Substituir pela implementação completa do syllable-counter-brasileiro.ts
 */
export function countPoeticSyllables(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  
  const cleanText = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z\s]/g, ' ') // Mantém apenas letras e espaços
    .replace(/\s+/g, ' ')
    .trim();
  
  if (!cleanText) return 0;
  
  // Divisão básica em sílabas - implementação simplificada
  const words = cleanText.split(/\s+/);
  let totalSyllables = 0;
  
  for (const word of words) {
    if (word.length === 0) continue;
    
    // Conta vogais como aproximação de sílabas
    const vowelMatches = word.match(/[aeiou]/gi);
    const syllableCount = vowelMatches ? vowelMatches.length : 1;
    
    // Mínimo 1 sílaba por palavra
    totalSyllables += Math.max(1, syllableCount);
  }
  
  return totalSyllables;
}

/**
 * Conta sílabas gramaticais (todas as sílabas)
 */
export function countPortugueseSyllables(text: string): number {
  return countPoeticSyllables(text); // Implementação básica
}

/**
 * Valida o limite de sílabas para uma linha de letra
 */
export interface SyllableValidationResult {
  valid: boolean
  violations: Array<{
    line: string
    syllables: number
    lineNumber: number
    suggestions: string[]
  }>
}

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
): SyllableValidationResult {
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
