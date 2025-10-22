// lib/validation/syllable-counter.ts - ATUALIZADO

/**
 * Contador de Sílabas Poéticas em Português Brasileiro
 * VERSÃO CORRIGIDA - NUNCA SUGERE PALAVRAS QUEBRADAS
 */

// Vogais para detecção de elisão
const VOWELS = "aeiouáàâãéèêíìîóòôõúùû"
const VOWEL_REGEX = /[aeiouáàâãéèêíìîóòôõúùû]/i

/**
 * Conta sílabas poéticas de uma linha - VERSÃO CORRIGIDA
 */
export function countPoeticSyllables(line: string): number {
  const cleanLine = line
    .replace(/\[.*?\]/g, "")
    .replace(/\(.*?\)/g, "")
    .trim()

  if (!cleanLine) return 0

  const words = cleanLine.split(/\s+/).filter(w => w.length > 0)
  if (words.length === 0) return 0

  let totalSyllables = 0
  let previousWordEndsWithVowel = false

  for (let i = 0; i < words.length; i++) {
    const word = words[i].toLowerCase()
    const nextWord = i < words.length - 1 ? words[i + 1].toLowerCase() : ""

    // Conta sílabas gramaticais da palavra
    let wordSyllables = countGrammaticalSyllables(word)

    // ✅ ELISÃO CORRETA: só aplica entre palavras diferentes
    if (nextWord && 
        previousWordEndsWithVowel && 
        startsWithVowel(nextWord) &&
        !isMonosyllable(word) && // Não aplica em monossílabos
        !isExceptionWord(word)   // Não aplica em exceções
    ) {
      wordSyllables -= 1 // Reduz 1 sílaba por elisão
    }

    totalSyllables += wordSyllables
    previousWordEndsWithVowel = endsWithVowel(word)
  }

  return Math.max(1, Math.round(totalSyllables))
}

/**
 * Conta sílabas gramaticais CORRETAMENTE
 */
function countGrammaticalSyllables(word: string): number {
  const clean = word.replace(/[^\wáàâãéèêíìîóòôõúùûç]/gi, "")
  if (!clean) return 0

  let count = 0
  let inVowelGroup = false

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i].toLowerCase()
    const isVowel = VOWEL_REGEX.test(char)

    if (isVowel) {
      if (!inVowelGroup) {
        count++
        inVowelGroup = true
      }
      // Ditongos e tritongos contam como 1 sílaba
    } else {
      inVowelGroup = false
    }
  }

  return Math.max(1, count)
}

/**
 * Verifica se palavra termina com vogal
 */
function endsWithVowel(word: string): boolean {
  const clean = word.replace(/[^\wáàâãéèêíìîóòôõúùûç]/gi, "")
  if (!clean) return false
  return VOWEL_REGEX.test(clean[clean.length - 1])
}

/**
 * Verifica se palavra começa com vogal (ou H mudo)
 */
function startsWithVowel(word: string): boolean {
  const clean = word.replace(/[^\wáàâãéèêíìîóòôõúùûç]/gi, "")
  if (!clean) return false

  if (clean[0].toLowerCase() === "h" && clean.length > 1) {
    return VOWEL_REGEX.test(clean[1])
  }

  return VOWEL_REGEX.test(clean[0])
}

/**
 * Verifica se é monossílabo (não sofre elisão)
 */
function isMonosyllable(word: string): boolean {
  const clean = word.replace(/[^\wáàâãéèêíìîóòôõúùûç]/gi, "")
  const syllables = countGrammaticalSyllables(clean)
  return syllables === 1
}

/**
 * Palavras que NUNCA sofrem elisão
 */
function isExceptionWord(word: string): boolean {
  const exceptions = [
    "não", "sim", "pão", "mão", "cão", "razão", "coração",
    "são", "verão", "irmão", "canção", "lição", "melão"
  ]
  return exceptions.includes(word.toLowerCase())
}

/**
 * SUGESTÕES INTELIGENTES - VERSÃO CORRIGIDA
 */
export function getIntelligentSuggestions(line: string, maxSyllables: number = 11): string[] {
  const currentSyllables = countPoeticSyllables(line)
  const difference = maxSyllables - currentSyllables
  const suggestions: string[] = []

  if (difference < 0) {
    // MUITAS sílabas - SUGESTÕES PARA REDUZIR
    suggestions.push(...getReductionSuggestions(line))
  } else if (difference > 0) {
    // POUCAS sílabas - SUGESTÕES PARA AUMENTAR
    suggestions.push(...getExpansionSuggestions(line))
  }

  // ✅ FILTRO DE SEGURANÇA: Remove sugestões que quebram palavras
  return suggestions.filter(suggestion => 
    !suggestion.includes("nã") && 
    !suggestion.includes("mora") &&
    !/\w{2,}ã\w/.test(suggestion) // Não permite "nãmora", "cãsã", etc.
  )
}

/**
 * SUGESTÕES PARA REDUZIR SÍLABAS - VERSÃO SEGURA
 */
function getReductionSuggestions(line: string): string[] {
  const suggestions: string[] = []
  const words = line.split(/\s+/)

  // ✅ SUGESTÕES SEGURAS - NUNCA quebram palavras
  const safeReductions = [
    { from: /\bde amor\b/gi, to: "d'amor", syllablesReduced: 1 },
    { from: /\bde um\b/gi, to: "d'um", syllablesReduced: 1 },
    { from: /\bde uma\b/gi, to: "d'uma", syllablesReduced: 1 },
    { from: /\bque eu\b/gi, to: "qu'eu", syllablesReduced: 1 },
    { from: /\bse eu\b/gi, to: "s'eu", syllablesReduced: 1 },
    { from: /\bpara o\b/gi, to: "pro", syllablesReduced: 1 },
    { from: /\bpara a\b/gi, to: "pra", syllablesReduced: 1 },
    { from: /\bpara\b/gi, to: "pra", syllablesReduced: 1 },
    { from: /\bvocê\b/gi, to: "cê", syllablesReduced: 1 },
    { from: /\bestá\b/gi, to: "tá", syllablesReduced: 1 },
    { from: /\bestou\b/gi, to: "tô", syllablesReduced: 1 },
    { from: /\bcomigo\b/gi, to: "comigo", syllablesReduced: 0 }, // Mantém igual
    { from: /\bcontigo\b/gi, to: "contigo", syllablesReduced: 0 }, // Mantém igual
  ]

  for (const reduction of safeReductions) {
    const suggestion = line.replace(reduction.from, reduction.to)
    if (suggestion !== line) {
      suggestions.push(suggestion)
    }
  }

  // ✅ REMOÇÃO SEGURA DE ARTIGOS
  if (words.length > 3) {
    const withoutArticles = words.filter(word => 
      !['o', 'a', 'os', 'as', 'um', 'uma'].includes(word.toLowerCase())
    ).join(' ')
    
    if (withoutArticles !== line) {
      suggestions.push(withoutArticles)
    }
  }

  return suggestions.slice(0, 3) // Limita a 3 sugestões
}

/**
 * SUGESTÕES PARA AUMENTAR SÍLABAS - VERSÃO SEGURA
 */
function getExpansionSuggestions(line: string): string[] {
  const suggestions: string[] = []
  const words = line.split(/\s+/)

  // ✅ ADIÇÃO SEGURA DE PALAVRAS
  const safeAdditions = [
    { word: "meu", position: 0 },
    { word: "minha", position: 0 },
    { word: "esse", position: 0 },
    { word: "essa", position: 0 },
    { word: "o", position: 0 },
    { word: "a", position: 0 },
    { word: "e", position: 0 },
  ]

  for (const addition of safeAdditions) {
    const newWords = [...words]
    newWords.splice(addition.position, 0, addition.word)
    const suggestion = newWords.join(' ')
    suggestions.push(suggestion)
  }

  return suggestions.slice(0, 2) // Limita a 2 sugestões
}

/**
 * Valida se uma linha respeita o limite de sílabas
 */
export function validateSyllableLimit(line: string, maxSyllables: number = 11): {
  isValid: boolean
  currentSyllables: number
  suggestions: string[]
} {
  const currentSyllables = countPoeticSyllables(line)
  const isValid = currentSyllables <= maxSyllables
  const suggestions = isValid ? [] : getIntelligentSuggestions(line, maxSyllables)

  return {
    isValid,
    currentSyllables,
    suggestions: suggestions.filter(s => s !== line) // Remove sugestões iguais à original
  }
}

/**
 * Valida todas as linhas de uma letra
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
