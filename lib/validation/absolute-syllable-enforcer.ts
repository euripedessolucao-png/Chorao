/**
 * VALIDADOR ABSOLUTO DE SÍLABAS
 * REGRA INEGOCIÁVEL: Máximo 11 sílabas por verso
 * Acima disso não é possível ser cantada!
 */

import { countPoeticSyllables } from "./syllable-counter"

export class AbsoluteSyllableEnforcer {
  private static readonly ABSOLUTE_MAX_SYLLABLES = 11

  /**
   * Valida se TODOS os versos têm no máximo 11 sílabas
   * Retorna false se encontrar QUALQUER verso com mais de 11 sílabas
   */
  static validate(lyrics: string): {
    isValid: boolean
    violations: Array<{ line: string; syllables: number; lineNumber: number }>
    message: string
  } {
    const lines = lyrics.split("\n")
    const violations: Array<{ line: string; syllables: number; lineNumber: number }> = []

    lines.forEach((line, index) => {
      const trimmed = line.trim()

      // Ignora tags, instruções e linhas vazias
      if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(") || trimmed.includes("Instruments:")) {
        return
      }

      const syllables = countPoeticSyllables(trimmed)
      if (syllables > this.ABSOLUTE_MAX_SYLLABLES) {
        violations.push({
          line: trimmed,
          syllables,
          lineNumber: index + 1,
        })
      }
    })

    const isValid = violations.length === 0

    let message = ""
    if (!isValid) {
      message = `❌ BLOQUEADO: ${violations.length} verso(s) com mais de ${this.ABSOLUTE_MAX_SYLLABLES} sílabas. Acima disso não é possível ser cantada!`
      violations.forEach((v) => {
        message += `\n  Linha ${v.lineNumber}: "${v.line}" (${v.syllables} sílabas)`
      })
    } else {
      message = `✅ APROVADO: Todos os versos têm no máximo ${this.ABSOLUTE_MAX_SYLLABLES} sílabas`
    }

    return {
      isValid,
      violations,
      message,
    }
  }

  /**
   * Força TODOS os versos a terem no máximo 11 sílabas
   * Remove palavras agressivamente se necessário
   */
  static enforce(lyrics: string): {
    correctedLyrics: string
    corrections: number
    details: Array<{ original: string; corrected: string; syllablesBefore: number; syllablesAfter: number }>
  } {
    const lines = lyrics.split("\n")
    const correctedLines: string[] = []
    const details: Array<{ original: string; corrected: string; syllablesBefore: number; syllablesAfter: number }> = []
    let corrections = 0

    for (const line of lines) {
      const trimmed = line.trim()

      // Ignora tags, instruções e linhas vazias
      if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(") || trimmed.includes("Instruments:")) {
        correctedLines.push(line)
        continue
      }

      const syllablesBefore = countPoeticSyllables(trimmed)

      if (syllablesBefore > this.ABSOLUTE_MAX_SYLLABLES) {
        const corrected = this.forceMaxSyllables(trimmed)
        const syllablesAfter = countPoeticSyllables(corrected)

        correctedLines.push(corrected)
        corrections++

        details.push({
          original: trimmed,
          corrected,
          syllablesBefore,
          syllablesAfter,
        })

        console.log(`[AbsoluteSyllableEnforcer] 🔧 FORÇADO: ${syllablesBefore} → ${syllablesAfter} sílabas`)
        console.log(`  Original: "${trimmed}"`)
        console.log(`  Corrigido: "${corrected}"`)
      } else {
        correctedLines.push(line)
      }
    }

    return {
      correctedLyrics: correctedLines.join("\n"),
      corrections,
      details,
    }
  }

  /**
   * Força um verso a ter no máximo 11 sílabas
   * Remove palavras agressivamente até atingir o limite
   */
  private static forceMaxSyllables(line: string): string {
    let current = line
    let currentSyllables = countPoeticSyllables(current)

    // Técnica 1: Remove artigos
    if (currentSyllables > this.ABSOLUTE_MAX_SYLLABLES) {
      current = current
        .replace(/\b(o|a|os|as|um|uma|uns|umas)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim()
      currentSyllables = countPoeticSyllables(current)
    }

    // Técnica 2: Remove possessivos
    if (currentSyllables > this.ABSOLUTE_MAX_SYLLABLES) {
      current = current
        .replace(/\b(meu|minha|meus|minhas)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim()
      currentSyllables = countPoeticSyllables(current)
    }

    // Técnica 3: Remove advérbios
    if (currentSyllables > this.ABSOLUTE_MAX_SYLLABLES) {
      current = current
        .replace(/\b(muito|mais|ainda|hoje|sempre|nunca)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim()
      currentSyllables = countPoeticSyllables(current)
    }

    // Técnica 4: Remove conectivos
    if (currentSyllables > this.ABSOLUTE_MAX_SYLLABLES) {
      current = current
        .replace(/\b(mas|e|que|quando|porque)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim()
      currentSyllables = countPoeticSyllables(current)
    }

    // Técnica 5: Remove última palavra (drástico)
    while (currentSyllables > this.ABSOLUTE_MAX_SYLLABLES) {
      const words = current.split(" ")
      if (words.length <= 2) break // Não remove se sobrar apenas 2 palavras

      words.pop()
      current = words.join(" ")
      currentSyllables = countPoeticSyllables(current)
    }

    return current.trim()
  }
}
