/**
 * VALIDADOR DE PONTUAÇÃO PARA LETRAS MUSICAIS BRASILEIRAS
 * Baseado nas regras do LETRAS.MUS.BR e Musixmatch
 */

export interface PunctuationValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  correctedLyrics: string
}

export class PunctuationValidator {
  // ✅ Pontuação permitida em letras musicais
  private static readonly ALLOWED_PUNCTUATION = [",", "?", "!", "...", "-", "—"]

  // ❌ Pontuação proibida no fim de verso
  private static readonly FORBIDDEN_AT_END = [".", ",", ";", ":"]

  // ✅ Pontuação permitida no fim de verso
  private static readonly ALLOWED_AT_END = ["?", "!", "..."]

  /**
   * Valida e corrige pontuação de uma letra musical
   */
  static validate(lyrics: string): PunctuationValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const lines = lyrics.split("\n")
    const correctedLines: string[] = []

    lines.forEach((line, index) => {
      const trimmed = line.trim()

      // Ignora linhas vazias e marcadores de seção
      if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(")) {
        correctedLines.push(line)
        return
      }

      let correctedLine = trimmed
      const lineNumber = index + 1

      const lastChar = trimmed.slice(-1)
      const lastThreeChars = trimmed.slice(-3)

      // Verifica reticências
      if (lastThreeChars === "...") {
        // ✅ Reticências são permitidas
        correctedLines.push(line)
        return
      }

      // Verifica pontuação proibida no fim
      if (this.FORBIDDEN_AT_END.includes(lastChar)) {
        errors.push(`Linha ${lineNumber}: Pontuação "${lastChar}" não permitida no fim de verso`)
        // Remove pontuação proibida
        correctedLine = trimmed.slice(0, -1).trim()
      }

      const commaCount = (trimmed.match(/,/g) || []).length
      if (commaCount > 3) {
        warnings.push(
          `Linha ${lineNumber}: Muitas vírgulas (${commaCount}). Use apenas para separar elementos gramaticais, não pausas musicais.`,
        )
      }

      const ellipsisCount = (trimmed.match(/\.\.\./g) || []).length
      if (ellipsisCount > 1) {
        warnings.push(`Linha ${lineNumber}: Múltiplas reticências. Use apenas uma por verso.`)
      }

      correctedLines.push(correctedLine)
    })

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      correctedLyrics: correctedLines.join("\n"),
    }
  }

  /**
   * Corrige automaticamente pontuação de uma letra
   */
  static autoCorrect(lyrics: string): string {
    const result = this.validate(lyrics)
    return result.correctedLyrics
  }

  /**
   * Verifica se uma linha tem pontuação válida
   */
  static isLineValid(line: string): boolean {
    const trimmed = line.trim()

    // Ignora linhas vazias e marcadores
    if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(")) {
      return true
    }

    const lastChar = trimmed.slice(-1)
    const lastThreeChars = trimmed.slice(-3)

    // Reticências são válidas
    if (lastThreeChars === "...") {
      return true
    }

    // Verifica se termina com pontuação proibida
    if (this.FORBIDDEN_AT_END.includes(lastChar)) {
      return false
    }

    return true
  }
}
