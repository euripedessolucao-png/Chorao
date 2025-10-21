/**
 * Contador de Sílabas Poéticas em Português Brasileiro
 *
 * REGRAS DA ESCANSÃO POÉTICA BRASILEIRA:
 * 1. Conta-se até a última sílaba tônica (descarta átonas finais)
 * 2. Sinalefa/Elisão: vogais adjacentes se juntam em uma sílaba
 * 3. Enjambement: versos com vírgula podem continuar no próximo
 */

const VOWELS = "aeiouáàâãéèêíìîóòôõúùû"
const VOWEL_REGEX = /[aeiouáàâãéèêíìîóòôõúùû]/i

const TONIC_MARKERS = /[áéíóúâêôãõ]/i

export function countPoeticSyllables(line: string): number {
  // Remove tags e instruções
  const cleanLine = line
    .replace(/\[.*?\]/g, "")
    .replace(/$$.*?$$/g, "")
    .trim()

  if (!cleanLine) return 0

  const words = cleanLine.split(/\s+/).filter((w) => w.length > 0)
  if (words.length === 0) return 0

  let totalSyllables = 0

  for (let i = 0; i < words.length; i++) {
    const word = words[i].toLowerCase()
    const nextWord = i < words.length - 1 ? words[i + 1].toLowerCase() : ""

    let wordSyllables = countGrammaticalSyllables(word)

    // Sinalefa: junta vogais adjacentes entre palavras
    if (nextWord && endsWithVowel(word) && startsWithVowel(nextWord)) {
      wordSyllables -= 0.5 // Reduz meia sílaba para compensar junção
    }

    totalSyllables += wordSyllables
  }

  const lastTonicPosition = findLastTonicSyllable(cleanLine)

  // Retorna o menor valor entre total gramatical e posição da última tônica
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
      // Ditongos crescentes (ia, ie, io, ua, ue, uo) contam como 1 sílaba
      // Já está coberto pelo inVowelGroup
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

  // H inicial não tem som em português
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

    // Se a palavra tem acento gráfico, a tônica está marcada
    if (TONIC_MARKERS.test(word)) {
      lastTonicPosition = syllableCount + wordSyllables
    } else {
      // Regra padrão: palavras paroxítonas (maioria em português)
      // A tônica é a penúltima sílaba
      lastTonicPosition = syllableCount + Math.max(1, wordSyllables - 1)
    }

    syllableCount += wordSyllables
  }

  return Math.max(1, lastTonicPosition)
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
