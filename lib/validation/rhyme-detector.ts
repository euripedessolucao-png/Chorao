/**
 * Extrai a última palavra significativa de um verso (ignora preposições)
 */
export function getLastSignificantWord(line: string): string {
  const cleaned = line.trim().replace(/[.,!?;:]$/, "")
  const words = cleaned.split(/\s+/)

  // Palavras a ignorar no final
  const ignorable = new Set(["de", "da", "do", "no", "na", "em", "a", "o", "que", "pra", "pro", "para"])

  for (let i = words.length - 1; i >= 0; i--) {
    const word = words[i]?.toLowerCase() || ""
    if (word && !ignorable.has(word)) {
      return word
    }
  }

  return words[words.length - 1] || ""
}

/**
 * Extrai o sufixo fonético para comparação de rimas
 */
export function getRhymeSuffix(word: string): string {
  const normalized = word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos

  // Pega as últimas 2-3 letras (sufixo fonético)
  return normalized.slice(-3)
}

/**
 * Verifica se duas palavras rimam
 */
export function doWordsRhyme(word1: string, word2: string): boolean {
  if (!word1 || !word2) return false
  if (word1 === word2) return false // Mesma palavra não conta como rima

  const suffix1 = getRhymeSuffix(word1)
  const suffix2 = getRhymeSuffix(word2)

  return suffix1 === suffix2
}

/**
 * Encontra versos que rimam com o verso dado
 */
export function findRhymingLines(targetLine: string, allLines: string[]): string[] {
  const targetWord = getLastSignificantWord(targetLine)
  const rhyming: string[] = []

  for (const line of allLines) {
    if (line === targetLine) continue
    if (!line.trim() || line.startsWith("[") || line.startsWith("(")) continue

    const lineWord = getLastSignificantWord(line)
    if (doWordsRhyme(targetWord, lineWord)) {
      rhyming.push(line)
    }
  }

  return rhyming
}

/**
 * Verifica se um verso tem rima com outros versos
 */
export function hasRhyme(line: string, allLines: string[]): boolean {
  return findRhymingLines(line, allLines).length > 0
}
