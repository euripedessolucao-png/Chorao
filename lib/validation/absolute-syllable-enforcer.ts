// lib/validation/absolute-syllable-enforcer.ts

import { countPoeticSyllables } from "./syllable-counter-brasileiro"
import { GENRE_CONFIGS } from "@/lib/genre-config"

// ✅ MANTENHA A CLASSE ANTIGA (para compatibilidade)
export class AbsoluteSyllableEnforcer {
  private static readonly ABSOLUTE_MAX_SYLLABLES = 11

  static validate(lyrics: string) {
    const lines = lyrics.split("\n")
    const violations = []
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(")) continue
      const syllables = countPoeticSyllables(trimmed)
      if (syllables > this.ABSOLUTE_MAX_SYLLABLES) {
        violations.push({ line: trimmed, syllables, lineNumber: lines.indexOf(line) + 1 })
      }
    }
    return {
      isValid: violations.length === 0,
      violations,
      message:
        violations.length === 0
          ? "✅ APROVADO: Todos os versos têm no máximo 11 sílabas"
          : `❌ BLOQUEADO: ${violations.length} verso(s) com mais de 11 sílabas`,
    }
  }

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

      // Skip empty lines, tags, and metadata
      if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(")) {
        correctedLines.push(line)
        continue
      }

      const syllables = countPoeticSyllables(trimmed)

      if (syllables <= this.ABSOLUTE_MAX_SYLLABLES) {
        correctedLines.push(line)
        continue
      }

      // Apply automatic corrections
      let fixed = trimmed
      const originalSyllables = syllables

      // Try contractions first
      const contractions = [
        [/você/gi, "cê"],
        [/para o/gi, "pro"],
        [/para a/gi, "pra"],
        [/para/gi, "pra"],
        [/está/gi, "tá"],
        [/estou/gi, "tô"],
        [/estava/gi, "tava"],
        [/estavam/gi, "tavam"],
        [/porque/gi, "pq"],
        [/agora/gi, "agora"],
      ]

      for (const [regex, replacement] of contractions) {
        const test = fixed.replace(regex, replacement as string)
        const testSyllables = countPoeticSyllables(test)
        if (testSyllables <= this.ABSOLUTE_MAX_SYLLABLES) {
          fixed = test
          break
        }
      }

      // If still too long, try splitting at comma
      if (countPoeticSyllables(fixed) > this.ABSOLUTE_MAX_SYLLABLES && fixed.includes(",")) {
        const parts = fixed.split(",").map((p) => p.trim())
        if (parts.length === 2) {
          const part1Syllables = countPoeticSyllables(parts[0])
          const part2Syllables = countPoeticSyllables(parts[1])

          if (part1Syllables <= this.ABSOLUTE_MAX_SYLLABLES && part2Syllables <= this.ABSOLUTE_MAX_SYLLABLES) {
            correctedLines.push(parts[0])
            correctedLines.push(parts[1])
            corrections++
            details.push(`Dividido: "${trimmed}" → "${parts[0]}" + "${parts[1]}"`)
            continue
          }
        }
      }

      const finalSyllables = countPoeticSyllables(fixed)
      if (finalSyllables < originalSyllables) {
        corrections++
        details.push(`Corrigido: ${originalSyllables}→${finalSyllables} sílabas: "${trimmed}"`)
      }

      correctedLines.push(fixed)
    }

    return {
      correctedLyrics: correctedLines.join("\n"),
      corrections,
      details,
    }
  }
}

// ✅ ADICIONE A FUNÇÃO NOVA (com suporte a gênero)
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
  let maxSyllables = 11

  if (config) {
    const rules = config.prosody_rules.syllable_count
    if ("absolute_max" in rules) {
      maxSyllables = rules.absolute_max
    } else if ("without_comma" in rules) {
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
