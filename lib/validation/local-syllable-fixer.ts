// lib/validation/local-syllable-fixer.ts

import { countPoeticSyllables } from "./syllable-counter-brasileiro"

/**
 * Corrige uma linha para respeitar o limite máximo de sílabas,
 * usando estratégias semânticas e fonéticas (não apenas regex).
 */
export function fixLineToMaxSyllables(line: string, maxSyllables = 12): string {
  if (!line?.trim()) return line

  const current = countPoeticSyllables(line)
  if (current <= maxSyllables) return line

  // Estratégia 1: Remover advérbios/adjetivos redundantes
  let fixed = line
    .replace(/\b(agora|muito|bem|realmente|totalmente|mesmo)\s+/gi, "")
    .replace(/\s+(próprio|própria)\b/gi, "")

  if (countPoeticSyllables(fixed) <= maxSyllables) return fixed

  // Estratégia 2: Simplificar "que + cê/ele/você + verbo" → verbo direto
  fixed = line
    .replace(/\bque\s+cê\s+(\w+)/gi, "$1")
    .replace(/\bque\s+agora\s+cê\s+(\w+)/gi, "$1")
    .replace(/\bque\s+você\s+(\w+)/gi, "$1")
    .replace(/\bque\s+ele\s+(\w+)/gi, "$1")
    .replace(/\bque\s+(\w+)/gi, "$1") // fallback genérico

  if (countPoeticSyllables(fixed) <= maxSyllables) return fixed

  // Estratégia 3: Remover frases vazias
  fixed = line
    .replace(/\bo que é\s+/gi, "")
    .replace(/\ba gente\s+/gi, "nós ")
    .replace(/\bpra\s+ser\s+/gi, "pra ")

  if (countPoeticSyllables(fixed) <= maxSyllables) return fixed

  // Estratégia 4: Contrações naturais (último recurso)
  fixed = line
    .replace(/\bvocê\b/gi, "cê")
    .replace(/\bestá\b/gi, "tá")
    .replace(/\bestou\b/gi, "tô")
    .replace(/\bpara\b/gi, "pra")
    .replace(/\bde\s+a\b/gi, "da")
    .replace(/\bde\s+o\b/gi, "do")

  if (countPoeticSyllables(fixed) <= maxSyllables) return fixed

  // Fallback: trunca mantendo verbo + objeto
  const words = line.trim().split(/\s+/)
  let safeLine = ""
  for (let i = 0; i < words.length; i++) {
    const test = safeLine ? `${safeLine} ${words[i]}` : words[i]
    if (countPoeticSyllables(test) > maxSyllables) break
    safeLine = test
  }
  return safeLine || words.slice(0, 3).join(" ")
}
