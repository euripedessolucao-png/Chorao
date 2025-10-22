/**
 * SpaceNormalizer - Normaliza espaços em textos
 *
 * Remove espaços duplicados, espaços antes de pontuação,
 * e garante formatação consistente.
 */

export class SpaceNormalizer {
  /**
   * Normaliza espaços em uma linha de texto
   */
  static normalizeLine(line: string): string {
    console.log(`[SpaceNormalizer] 🔍 Normalizando linha: "${line.substring(0, 50)}..."`)

    const normalized = line
      .replace(/\s+/g, " ") // Remove espaços duplicados/triplicados
      .replace(/\s+([.,!?;:…])/g, "$1") // Remove espaço antes de pontuação
      .replace(/([.,!?;:…])\s*([.,!?;:…])/g, "$1$2") // Remove espaço entre pontuações
      .replace(/\s+$/g, "") // Remove espaços no final
      .replace(/^\s+/g, "") // Remove espaços no início
      .trim()

    if (line !== normalized) {
      console.log(`[SpaceNormalizer] ✅ Linha normalizada: "${normalized.substring(0, 50)}..."`)
    }

    return normalized
  }

  /**
   * Normaliza espaços em uma letra completa
   */
  static normalizeLyrics(lyrics: string): string {
    console.log(`[SpaceNormalizer] 🚀 Normalizando letra completa...`)
    const lines = lyrics.split("\n")
    const normalizedLines = lines.map((line) => this.normalizeLine(line))
    const result = normalizedLines.join("\n")
    console.log(`[SpaceNormalizer] ✅ Letra normalizada`)
    return result
  }

  /**
   * Valida se uma linha tem espaços duplicados
   */
  static hasMultipleSpaces(line: string): boolean {
    return /\s{2,}/.test(line)
  }

  /**
   * Conta quantos espaços duplicados existem em uma linha
   */
  static countMultipleSpaces(line: string): number {
    const matches = line.match(/\s{2,}/g)
    return matches ? matches.length : 0
  }

  /**
   * Relatório de normalização
   */
  static getNormalizationReport(
    original: string,
    normalized: string,
  ): {
    hadIssues: boolean
    spacesRemoved: number
    linesAffected: number
  } {
    const originalLines = original.split("\n")
    const normalizedLines = normalized.split("\n")

    let spacesRemoved = 0
    let linesAffected = 0

    for (let i = 0; i < originalLines.length; i++) {
      const originalSpaces = this.countMultipleSpaces(originalLines[i])
      if (originalSpaces > 0) {
        spacesRemoved += originalSpaces
        linesAffected++
      }
    }

    return {
      hadIssues: spacesRemoved > 0,
      spacesRemoved,
      linesAffected,
    }
  }
}
