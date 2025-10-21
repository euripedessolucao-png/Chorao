/**
 * Contador de Sílabas Poéticas em Português Brasileiro - REFORMULADO
 *
 * REGRAS DA ESCANSÃO POÉTICA BRASILEIRA:
 * 1. Conta-se até a última sílaba tônica (descarta átonas finais)
 * 2. Sinalefa/Elisão: vogais adjacentes se juntam em uma sílaba
 * 3. Enjambement: versos com vírgula podem continuar no próximo
 *
 * REFORMULAÇÃO COMPLETA:
 * - Contagem precisa de sílabas gramaticais
 * - Identificação correta da última tônica
 * - Tratamento de ditongos e hiatos
 * - Validação rigorosa para letras musicais
 */

const VOWELS = "aeiouáàâãéèêíìîóòôõúùû"
const VOWEL_REGEX = /[aeiouáàâãéèêíìîóòôõúùû]/i

const TONIC_MARKERS = /[áéíóúâêôãõ]/i

const OXITONAS = new Set([
  "café",
  "você",
  "até",
  "sofá",
  "avó",
  "avô",
  "bebê",
  "português",
  "inglês",
  "francês",
  "alemão",
  "japonês",
  "chinês",
  "amor",
  "calor",
  "dor",
  "flor",
  "senhor",
  "doutor",
  "professor",
  "diretor",
  "ator",
  "cantor",
  "escritor",
  "pintor",
  "escultor",
])

const PROPAROXITONAS = new Set([
  "música",
  "público",
  "lâmpada",
  "pássaro",
  "árvore",
  "número",
  "último",
  "único",
  "mágico",
  "lógico",
  "físico",
  "químico",
  "matemática",
  "gramática",
  "sintática",
  "semântica",
])

/**
 * Conta sílabas poéticas (até a última tônica)
 */
export function countPoeticSyllables(line: string): number {
  // Remove tags e instruções
  const cleanLine = line
    .replace(/\[.*?\]/g, "")
    .replace(/$$.*?$$/g, "")
    .trim()

  if (!cleanLine) return 0

  const words = cleanLine.split(/\s+/).filter((w) => w.length > 0)
  if (words.length === 0) return 0

  let totalGrammaticalSyllables = 0
  const wordSyllableCounts: number[] = []

  for (let i = 0; i < words.length; i++) {
    const word = words[i].toLowerCase()
    const nextWord = i < words.length - 1 ? words[i + 1].toLowerCase() : ""

    let wordSyllables = countGrammaticalSyllables(word)

    // Sinalefa: junta vogais adjacentes entre palavras
    if (nextWord && endsWithVowel(word) && startsWithVowel(nextWord)) {
      wordSyllables -= 0.5 // Reduz meia sílaba para compensar junção
    }

    wordSyllableCounts.push(wordSyllables)
    totalGrammaticalSyllables += wordSyllables
  }

  const lastTonicPosition = findLastTonicSyllableAccurate(words, wordSyllableCounts)

  const poeticCount = Math.round(Math.min(totalGrammaticalSyllables, lastTonicPosition))

  console.log(
    `[SyllableCounter] "${cleanLine}" = ${poeticCount} sílabas (gramatical: ${Math.round(totalGrammaticalSyllables)}, última tônica: ${lastTonicPosition})`,
  )

  return poeticCount
}

/**
 * Conta sílabas gramaticais de uma palavra - REFORMULADO
 */
function countGrammaticalSyllables(word: string): number {
  const clean = word.replace(/[^\wáàâãéèêíìîóòôõúùûç]/gi, "")
  if (!clean) return 0

  let count = 0
  let inVowelGroup = false
  let previousWasVowel = false

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i].toLowerCase()
    const nextChar = i < clean.length - 1 ? clean[i + 1].toLowerCase() : ""
    const isVowel = VOWEL_REGEX.test(char)

    if (isVowel) {
      const isHiato = previousWasVowel && isStrongVowel(char) && isStrongVowel(clean[i - 1])

      if (!inVowelGroup || isHiato) {
        count++
        inVowelGroup = true
      }

      previousWasVowel = true
    } else {
      inVowelGroup = false
      previousWasVowel = false
    }
  }

  return Math.max(1, count)
}

/**
 * Verifica se é vogal forte (a, e, o)
 */
function isStrongVowel(char: string): boolean {
  return /[aeoáàâãéèêóòô]/i.test(char)
}

/**
 * Encontra posição da última sílaba tônica com precisão - REFORMULADO
 */
function findLastTonicSyllableAccurate(words: string[], syllableCounts: number[]): number {
  let syllablePosition = 0
  let lastTonicPosition = 0

  for (let i = 0; i < words.length; i++) {
    const word = words[i].toLowerCase()
    const wordSyllables = syllableCounts[i]
    const cleanWord = word.replace(/[^\wáàâãéèêíìîóòôõúùûç]/gi, "")

    if (TONIC_MARKERS.test(word)) {
      // Tem acento gráfico - tônica está marcada
      const accentPosition = findAccentPosition(cleanWord)
      lastTonicPosition = syllablePosition + accentPosition
    } else if (OXITONAS.has(cleanWord)) {
      // Palavra oxítona - última sílaba é tônica
      lastTonicPosition = syllablePosition + wordSyllables
    } else if (PROPAROXITONAS.has(cleanWord)) {
      // Palavra proparoxítona - antepenúltima sílaba é tônica
      lastTonicPosition = syllablePosition + Math.max(1, wordSyllables - 2)
    } else {
      // Regra padrão: paroxítona (penúltima sílaba é tônica)
      lastTonicPosition = syllablePosition + Math.max(1, wordSyllables - 1)
    }

    syllablePosition += wordSyllables
  }

  return Math.max(1, Math.round(lastTonicPosition))
}

/**
 * Encontra posição do acento gráfico na palavra
 */
function findAccentPosition(word: string): number {
  let syllableCount = 0
  let inVowelGroup = false

  for (let i = 0; i < word.length; i++) {
    const char = word[i]
    const isVowel = VOWEL_REGEX.test(char)

    if (isVowel) {
      if (!inVowelGroup) {
        syllableCount++
        inVowelGroup = true
      }

      // Se encontrou acento, retorna posição atual
      if (TONIC_MARKERS.test(char)) {
        return syllableCount
      }
    } else {
      inVowelGroup = false
    }
  }

  return syllableCount
}

function endsWithVowel(word: string): boolean {
  const clean = word.replace(/[^\wáàâãéèêíìîóòôõúùûç]/gi, "")
  if (!clean) return false
  return VOWEL_REGEX.test(clean[clean.length - 1])
}

function startsWithVowel(word: string): boolean {
  const clean = word.replace(/[^\wáàâãéèêíìîóòôõúùûç]/gi, "")
  if (!clean) return false

  // H inicial não tem som em português
  if (clean[0].toLowerCase() === "h" && clean.length > 1) {
    return VOWEL_REGEX.test(clean[1])
  }

  return VOWEL_REGEX.test(clean[0])
}

export function validateSyllableLimit(line: string, maxSyllables = 11): boolean {
  // Ignora validação se linha termina com vírgula (enjambement)
  if (line.trim().endsWith(",")) {
    return true // Enjambement é válido - verso continua no próximo
  }

  const count = countPoeticSyllables(line)
  return count <= maxSyllables
}

export function validateLyricsSyllables(
  lyrics: string,
  maxSyllables = 11,
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
      if (line.trim().endsWith(",")) {
        return // Enjambement é válido
      }

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

export { countPoeticSyllables as countPortugueseSyllables }
