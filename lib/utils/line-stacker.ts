import { countPoeticSyllables } from "@/lib/validation/syllable-counter-brasileiro"

export interface StackingResult {
  stackedLyrics: string
  stackingScore: number
  improvements: string[]
}

export class LineStacker {
  private static readonly MAX_SYLLABLES = 12

  /**
   * Formata letra no padrão profissional brasileiro: UM VERSO POR LINHA
   * QUEBRA VERSOS LONGOS (>12 sílabas) EM MÚLTIPLAS LINHAS
   */
  static stackLines(lyrics: string): StackingResult {
    const lines = lyrics.split("\n")
    const formattedLines: string[] = []
    const improvements: string[] = []

    for (const line of lines) {
      const trimmed = line.trim()

      // Mantém tags, linhas vazias e instruções
      if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(")) {
        formattedLines.push(line)
        continue
      }

      const syllables = countPoeticSyllables(trimmed)

      if (syllables > this.MAX_SYLLABLES) {
        const broken = this.breakLongLine(trimmed)
        formattedLines.push(...broken)
        improvements.push(`✓ Quebrado verso longo (${syllables}s): "${trimmed.substring(0, 40)}..."`)
        continue
      }

      // Divide versos com vírgula em duas linhas (regra do empilhamento brasileiro)
      if (trimmed.includes(",")) {
        const parts = trimmed.split(",")
        if (parts.length === 2) {
          const cleanPart1 = parts[0].trim()
          const cleanPart2 = parts[1].trim()

          if (cleanPart1 && cleanPart2) {
            const syllables1 = countPoeticSyllables(cleanPart1)
            const syllables2 = countPoeticSyllables(cleanPart2)

            // Só divide se ambas as partes ficarem dentro do limite
            if (syllables1 <= this.MAX_SYLLABLES && syllables2 <= this.MAX_SYLLABLES) {
              formattedLines.push(cleanPart1 + ",")
              formattedLines.push(cleanPart2)
              improvements.push(`✓ Dividido em duas linhas: "${cleanPart1}, / ${cleanPart2}"`)
              continue
            }
          }
        }
      }

      // Mantém verso inteiro
      formattedLines.push(trimmed)
    }

    return {
      stackedLyrics: formattedLines.join("\n"),
      stackingScore: this.calculateStackingScore(formattedLines),
      improvements,
    }
  }

  /**
   * QUEBRA LINHA LONGA EM MÚLTIPLAS LINHAS
   */
  private static breakLongLine(line: string): string[] {
    const words = line.split(" ")
    const result: string[] = []
    let currentLine = ""

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const syllables = countPoeticSyllables(testLine)

      if (syllables <= this.MAX_SYLLABLES) {
        currentLine = testLine
      } else {
        // Linha atual está cheia, salva e começa nova
        if (currentLine) {
          result.push(currentLine)
        }
        currentLine = word
      }
    }

    // Adiciona última linha
    if (currentLine) {
      result.push(currentLine)
    }

    return result.length > 0 ? result : [line]
  }

  private static calculateStackingScore(lines: string[]): number {
    const contentLines = lines.filter((l) => l.trim() && !l.startsWith("[") && !l.startsWith("("))

    if (contentLines.length === 0) return 1

    // Pontuação: quanto mais versos dentro do limite ideal (6-12 sílabas), melhor
    const validLines = contentLines.filter((line) => {
      const syllables = countPoeticSyllables(line.replace(/,$/, ""))
      return syllables >= 6 && syllables <= this.MAX_SYLLABLES
    })

    return validLines.length / contentLines.length
  }
}
