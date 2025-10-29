import { countPoeticSyllables } from "./syllable-counter-brasileiro"

/**
 * Aplica contrações naturais brasileiras para reduzir sílabas
 */
function applyContractions(text: string): string {
  return text
    .replace(/\bvocê\b/gi, "cê")
    .replace(/\bpara\b/gi, "pra")
    .replace(/\bestou\b/gi, "tô")
    .replace(/\bestá\b/gi, "tá")
    .replace(/\bestão\b/gi, "tão")
    .replace(/\bestamos\b/gi, "tamo")
    .replace(/\besta\b/gi, "ta")
    .replace(/\bpelo\b/gi, "pro")
    .replace(/\bpela\b/gi, "pra")
    .replace(/\bpelos\b/gi, "pros")
    .replace(/\bpelas\b/gi, "pras")
    .replace(/\bagora\b/gi, "gora")
    .replace(/\bembora\b/gi, "bora")
}

/**
 * Corrige uma linha para o máximo de sílabas especificado
 */
export function fixLineToMaxSyllables(line: string, maxSyllables: number): string {
  // Remove tags e parênteses para contagem
  const cleanLine = line
    .replace(/\[.*?\]/g, "")
    .replace(/$$.*?$$/g, "")
    .trim()

  if (!cleanLine) return line

  let currentSyllables = countPoeticSyllables(cleanLine)

  // Se já está dentro do limite, retorna original
  if (currentSyllables <= maxSyllables) {
    return line
  }

  // Tenta aplicar contrações
  const withContractions = applyContractions(line)
  const contractedClean = withContractions
    .replace(/\[.*?\]/g, "")
    .replace(/$$.*?$$/g, "")
    .trim()
  currentSyllables = countPoeticSyllables(contractedClean)

  if (currentSyllables <= maxSyllables) {
    return withContractions
  }

  // Se ainda está longo, tenta quebrar em vírgula
  const words = contractedClean.split(/\s+/)
  if (words.length > 4) {
    const midPoint = Math.floor(words.length / 2)
    const firstHalf = words.slice(0, midPoint).join(" ")
    const secondHalf = words.slice(midPoint).join(" ")

    const firstSyllables = countPoeticSyllables(firstHalf)
    const secondSyllables = countPoeticSyllables(secondHalf)

    if (firstSyllables <= maxSyllables && secondSyllables <= maxSyllables) {
      // Preserva tags se existirem
      const tags = line.match(/\[.*?\]/g) || []
      const tagStr = tags.length > 0 ? tags.join(" ") + " " : ""
      return `${tagStr}${firstHalf},\n${secondHalf}`
    }
  }

  // Se não conseguiu corrigir, retorna com contrações
  return withContractions
}
