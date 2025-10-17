/**
 * Contador de Sílabas Poéticas em Português Brasileiro
 */

const VOWELS = "aeiouáàâãéèêíìîóòôõúùû"
const VOWEL_REGEX = /[aeiouáàâãéèêíìîóòôõúùû]/i

const TONIC_PATTERNS = [
  /á|é|í|ó|ú/i,
  /ão|ões|ãe/i,
]

export function countPoeticSyllables(line: string): number {
  const cleanLine = line
    .replace(/\[.*?\]/g, "")
    .replace(/\(.*?\)/g, "")
    .trim()

  if (!cleanLine) return 0

  const words = cleanLine.split(/\s+/).filter((w) => w.length > 0)
  if (words.length === 0) return 0

  let totalSyllables = 0

  for (let i = 0; i < words.length; i++) {
    const word = words[i].toLowerCase()
    const nextWord = i < words.length - 1 ? words[i + 1].toLowerCase() : ""

    let wordSyllables = countGrammaticalSyllables(word)

    if (nextWord && endsWithVowel(word) && startsWithVowel(nextWord)) {
      wordSyllables -= 0.5
    }

    totalSyllables += wordSyllables
  }

  const lastTonicPosition = findLastTonicSyllable(cleanLine)
  return Math.round(Math.min(totalSyllables, lastTonicPosition))
}

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
    } else {
      inVowelGroup = false
    }
  }

  return Math.max(1, count)
}

function endsWithVowel(word: string): boolean {
  const clean = word.replace(/[^\wáàâãéèêíìîóòôõúùûç]/gi, "")
  if (!clean) return false
  return VOWEL_REGEX.test(clean[clean.length - 1])
}

function startsWithVowel(word: string): boolean {
  const clean = word.replace(/[^\wáàâãéèêíìîóòôõúùûç]/gi, "")
  if (!clean) return false

  if (clean[0].toLowerCase() === "h" && clean.length > 1) {
    return VOWEL_REGEX.test(clean[1])
  }

  return VOWEL_REGEX.test(clean[0])
}

function findLastTonicSyllable(line: string): number {
  const words = line.split(/\s+/)
  let syllableCount = 0
  let lastTonicPosition = 0

  for (const word of words) {
    const wordSyllables = countGrammaticalSyllables(word)

    if (/[áàâãéèêíìîóòôõúùû]/i.test(word)) {
      lastTonicPosition = syllableCount + wordSyllables
    } else {
      lastTonicPosition = syllableCount + Math.max(1, wordSyllables - 1)
    }

    syllableCount += wordSyllables
  }

  return Math.max(1, lastTonicPosition)
}

export function validateSyllableLimit(line: string, maxSyllables = 12): boolean {
  const count = countPoeticSyllables(line)
  return count <= maxSyllables
}

export function validateLyricsSyllables(
  lyrics: string,
  maxSyllables = 12,
): {
  valid: boolean
  violations: Array<{ line: string; syllables: number; lineNumber: number }>
} {
  const lines = lyrics.split("\n")
  const violations: Array<{ line: string; syllables: number; lineNumber: number }> = []

  lines.forEach((line, index) => {
    if (
      line.trim() &&
      !line.startsWith("[") &&
      !line.startsWith("(") &&
      !line.startsWith("Title:") &&
      !line.startsWith("Instrumentos:")
    ) {
      const syllables = countPoeticSyllables(line)
      if (syllables > maxSyllables) {
        violations.push({
          line: line.trim(),
          syllables,
          lineNumber: index + 1,
        })
      }
    }
  })

  return {
    valid: violations.length === 0,
    violations,
  }
}
