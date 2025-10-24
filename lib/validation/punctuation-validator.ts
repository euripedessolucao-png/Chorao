// lib/validation/punctuation-validator.ts

/**
 * Valida e corrige pontuação em letras de música
 */
export class PunctuationValidator {
  static validate(lyrics: string): {
    isValid: boolean
    errors: Array<{ line: number; message: string }>
    correctedLyrics: string
  } {
    const lines = lyrics.split("\n")
    const errors: Array<{ line: number; message: string }> = []
    const correctedLines: string[] = []

    lines.forEach((line, index) => {
      let corrected = line

      // Corrige reticências mal formatadas
      if (corrected.includes(". . .")) {
        corrected = corrected.replace(/\. \. \./g, "...")
        errors.push({ line: index + 1, message: "Reticências mal formatadas" })
      }

      // Corrige espaços antes de pontuação
      corrected = corrected.replace(/\s+([.,!?;:])/g, "$1")

      // Corrige falta de espaço após pontuação
      corrected = corrected.replace(/([.,!?;:])([^\s\n])/g, "$1 $2")

      // Corrige múltiplos espaços
      corrected = corrected.replace(/ {2,}/g, " ")

      // Corrige pontuação excessiva
      corrected = corrected.replace(/!{3,}/g, "!")
      corrected = corrected.replace(/\?{3,}/g, "?")
      corrected = corrected.replace(/\.{4,}/g, "...")

      // Corrige espaços em marcações
      corrected = corrected.replace(/\[(\s+)/g, "[")
      corrected = corrected.replace(/(\s+)\]/g, "]")
      corrected = corrected.replace(/\((\s+)/g, "(")
      corrected = corrected.replace(/(\s+)\)/g, ")")

      if (corrected !== line) {
        errors.push({ line: index + 1, message: "Pontuação corrigida" })
      }

      correctedLines.push(corrected)
    })

    return {
      isValid: errors.length === 0,
      errors,
      correctedLyrics: correctedLines.join("\n"),
    }
  }

  static hasProblems(lyrics: string): boolean {
    const result = this.validate(lyrics)
    return !result.isValid
  }

  static fix(lyrics: string): string {
    const result = this.validate(lyrics)
    return result.correctedLyrics
  }
}
