/**
 * Contador de Sílabas Poéticas em Português Brasileiro
 *
 * REGRAS:
 * 1. Conta até a última sílaba tônica (ignora átonas finais)
 * 2. Elisão/Sinalefa: une vogais entre palavras
 * 3. Crase: une vogais idênticas
 * 4. Ditongos e tritongos contam como 1 sílaba
 */

// Vogais para detecção de elisão
const VOWELS = "aeiouáàâãéèêíìîóòôõúùû"
const VOWEL_REGEX = /[aeiouáàâãéèêíìîóòôõúùû]/i

// Sílabas tônicas comuns em português
const TONIC_PATTERNS = [
  /á|é|í|ó|ú/i, // Vogais acentuadas são sempre tônicas
  /ão|ões|ãe/i, // Terminações nasais tônicas
]

/**
 * Conta sílabas poéticas de uma linha
 * @param line Linha de texto para contar
 * @returns Número de sílabas poéticas
 */
export function countPoeticSyllables(line: string): number {
  // Remove marcadores estruturais e limpa a linha
  const cleanLine = line
    .replace(/\[.*?\]/g, "") // Remove [VERSE], [CHORUS], etc.
    .replace(/\(.*?\)/g, "") // Remove (instruções)
    .trim()

  if (!cleanLine) return 0

  // Separa em palavras
  const words = cleanLine.split(/\s+/).filter((w) => w.length > 0)
  if (words.length === 0) return 0

  let totalSyllables = 0

  for (let i = 0; i < words.length; i++) {
    const word = words[i].toLowerCase()
    const nextWord = i < words.length - 1 ? words[i + 1].toLowerCase() : ""

    // Conta sílabas gramaticais da palavra
    let wordSyllables = countGrammaticalSyllables(word)

    // Aplica elisão/sinalefa se a palavra termina com vogal
    // e a próxima começa com vogal
    if (nextWord && endsWithVowel(word) && startsWithVowel(nextWord)) {
      // Une as vogais, reduz 1 sílaba
      wordSyllables -= 0.5 // Redução parcial para não ser muito agressivo
    }

    totalSyllables += wordSyllables
  }

  // Encontra a última sílaba tônica e conta até ela
  const lastTonicPosition = findLastTonicSyllable(cleanLine)

  // Arredonda e garante que não conta além da última tônica
  return Math.round(Math.min(totalSyllables, lastTonicPosition))
}

/**
 * Conta sílabas gramaticais de uma palavra
 */
function countGrammaticalSyllables(word: string): number {
  // Remove pontuação
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
      // Já estamos em grupo de vogais, não incrementa
    } else {
      inVowelGroup = false
    }
  }

  return Math.max(1, count) // Mínimo 1 sílaba por palavra
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
 * Verifica se palavra começa com vogal (ou H mudo + vogal)
 */
function startsWithVowel(word: string): boolean {
  const clean = word.replace(/[^\wáàâãéèêíìîóòôõúùûç]/gi, "")
  if (!clean) return false

  // H inicial é mudo em português
  if (clean[0].toLowerCase() === "h" && clean.length > 1) {
    return VOWEL_REGEX.test(clean[1])
  }

  return VOWEL_REGEX.test(clean[0])
}

/**
 * Encontra a posição da última sílaba tônica
 */
function findLastTonicSyllable(line: string): number {
  const words = line.split(/\s+/)
  let syllableCount = 0
  let lastTonicPosition = 0

  for (const word of words) {
    const wordSyllables = countGrammaticalSyllables(word)

    // Verifica se tem vogal acentuada (sempre tônica)
    if (/[áàâãéèêíìîóòôõúùû]/i.test(word)) {
      lastTonicPosition = syllableCount + wordSyllables
    } else {
      // Assume que a última palavra tem tônica na penúltima sílaba (padrão português)
      lastTonicPosition = syllableCount + Math.max(1, wordSyllables - 1)
    }

    syllableCount += wordSyllables
  }

  return Math.max(1, lastTonicPosition)
}

/**
 * Valida se uma linha respeita o limite de 12 sílabas
 */
export function validateSyllableLimit(line: string, maxSyllables = 12): boolean {
  const count = countPoeticSyllables(line)
  return count <= maxSyllables
}

/**
 * Valida todas as linhas de uma letra
 */
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
    // Ignora linhas estruturais
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
