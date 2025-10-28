// lib/validation/absolute-syllable-enforcer.ts

import { countPoeticSyllables } from "./syllable-counter-brasileiro"
import { GENRE_CONFIGS } from "@/lib/genre-config"

/**
 * ✅ FUNÇÃO ÚNICA DE VALIDAÇÃO - Usa genre-config.ts como fonte da verdade
 *
 * Validação por gênero com limite absoluto de cada gênero
 * - Não impõe mínimo de sílabas (permite versos curtos como "Só paga IPVA" = 4 sílabas)
 * - Máximo de 12 sílabas (absolute_max do genre-config)
 * - Ignora texto dentro de [colchetes] (instrumentação)
 */
export function validateSyllablesByGenre(
  lyrics: string,
  genre: string,
): {
  isValid: boolean
  violations: Array<{ line: string; syllables: number; lineNumber: number }>
  message: string
  maxSyllables: number
} {
  const config = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS]
  let maxSyllables = 12 // padrão seguro (absolute_max)

  if (config?.prosody_rules?.syllable_count) {
    const rules = config.prosody_rules.syllable_count
    if ("absolute_max" in rules) {
      maxSyllables = rules.absolute_max
    } else if ("with_comma" in rules && rules.with_comma.total_max) {
      maxSyllables = rules.with_comma.total_max
    } else if ("without_comma" in rules && rules.without_comma.acceptable_up_to) {
      maxSyllables = rules.without_comma.acceptable_up_to
    }
  }

  const lines = lyrics.split("\n")
  const violations = []

  for (const [index, line] of lines.entries()) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith("(")) continue

    // Remove texto dentro de [colchetes] antes de contar
    const lineWithoutBrackets = trimmed.replace(/\[.*?\]/g, "").trim()
    if (!lineWithoutBrackets) continue // Se sobrou só colchetes, ignora

    const syllables = countPoeticSyllables(lineWithoutBrackets)
    if (syllables > maxSyllables) {
      violations.push({ line: trimmed, syllables, lineNumber: index + 1 })
    }
  }

  const isValid = violations.length === 0
  const message = isValid
    ? `✅ APROVADO: Todos os versos respeitam o limite de ${maxSyllables} sílabas (${genre})`
    : `❌ BLOQUEADO: ${violations.length} verso(s) com mais de ${maxSyllables} sílabas (${genre})`

  return { isValid, violations, message, maxSyllables }
}
