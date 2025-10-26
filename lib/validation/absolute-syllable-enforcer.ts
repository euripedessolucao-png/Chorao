// lib/validation/absolute-syllable-enforcer.ts

import { countPoeticSyllables } from "./syllable-counter-brasileiro"
import { GENRE_CONFIGS } from "@/lib/genre-config"
import { fixLineToMaxSyllables } from "./local-syllable-fixer"

// ✅ CLASSE ATUALIZADA — agora usa correção inteligente e limite por gênero
export class AbsoluteSyllableEnforcer {
  // Mantido para compatibilidade, mas NÃO usado nas novas funções
  private static readonly ABSOLUTE_MAX_SYLLABLES = 11

  /**
   * Validação simples (mantida para compatibilidade)
   */
  static validate(lyrics: string) {
    const lines = lyrics.split("\n")
    const violations = []
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(")) continue
      const syllables = countPoeticSyllables(trimmed)
      if (syllables > 12) { // ✅ Atualizado para 12
        violations.push({ line: trimmed, syllables, lineNumber: lines.indexOf(line) + 1 })
      }
    }
    return {
      isValid: violations.length === 0,
      violations,
      message:
        violations.length === 0
          ? "✅ APROVADO: Todos os versos têm no máximo 12 sílabas"
          : `❌ BLOQUEADO: ${violations.length} verso(s) com mais de 12 sílabas`,
    }
  }

  /**
   * Correção automática com correção local inteligente
   */
  static validateAndFix(lyrics: string): {
    correctedLyrics: string
    corrections: number
    details: string[]
  } {
    const lines = lyrics.split("\n")
    const correctedLines: string[] = []
    let corrections = 0
    const details: string[] = []

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(")) {
        correctedLines.push(line)
        continue
      }

      const originalSyllables = countPoeticSyllables(trimmed)
      if (originalSyllables <= 12) {
        correctedLines.push(line)
        continue
      }

      // Correção inteligente com limite de 12
      const fixed = fixLineToMaxSyllables(trimmed, 12)
      const finalSyllables = countPoeticSyllables(fixed)

      if (finalSyllables <= 12 && finalSyllables < originalSyllables) {
        correctedLines.push(fixed)
        corrections++
        details.push(`Corrigido: ${originalSyllables} → ${finalSyllables} sílabas`)
      } else {
        correctedLines.push(trimmed)
        details.push(`⚠️ Não foi possível corrigir (${originalSyllables}s)`)
      }
    }

    return {
      correctedLyrics: correctedLines.join("\n"),
      corrections,
      details,
    }
  }
}

/**
 * Validação por gênero — agora usa o limite absoluto de cada gênero
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
  let maxSyllables = 12 // padrão seguro

  if (config?.prosody_rules?.syllable_count) {
    const rules = config.prosody_rules.syllable_count
    if ("absolute_max" in rules) {
      maxSyllables = rules.absolute_max
    } else if ("without_comma" in rules && rules.without_comma.acceptable_up_to) {
      maxSyllables = rules.without_comma.acceptable_up_to
    }
  }

  const lines = lyrics.split("\n")
  const violations = []

  for (const [index, line] of lines.entries()) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(")) continue

    const syllables = countPoeticSyllables(trimmed)
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
