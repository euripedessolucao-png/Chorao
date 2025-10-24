/**
 * VALIDADOR DE REPETIÇÕES
 * Detecta e corrige repetições indesejadas de palavras
 */

export class RepetitionValidator {
  /**
   * Detecta repetições de palavras ou frases
   */
  static validate(lyrics: string): {
    isValid: boolean
    repetitions: Array<{ line: string; repeated: string; lineNumber: number }>
  } {
    const lines = lyrics.split("\n")
    const repetitions: Array<{ line: string; repeated: string; lineNumber: number }> = []

    lines.forEach((line, index) => {
      const trimmed = line.trim()

      // Ignora tags, instruções e linhas vazias
      if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(") || trimmed.includes("Instruments:")) {
        return
      }

      // Detecta repetições de 2-3 palavras consecutivas
      const words = trimmed.split(/\s+/)

      for (let i = 0; i < words.length - 1; i++) {
        // Verifica repetição de 2 palavras
        if (i < words.length - 3) {
          const phrase1 = `${words[i]} ${words[i + 1]}`
          const phrase2 = `${words[i + 2]} ${words[i + 3]}`

          if (phrase1.toLowerCase() === phrase2.toLowerCase()) {
            repetitions.push({
              line: trimmed,
              repeated: phrase1,
              lineNumber: index + 1,
            })
          }
        }

        // Verifica repetição de 3 palavras
        if (i < words.length - 5) {
          const phrase1 = `${words[i]} ${words[i + 1]} ${words[i + 2]}`
          const phrase2 = `${words[i + 3]} ${words[i + 4]} ${words[i + 5]}`

          if (phrase1.toLowerCase() === phrase2.toLowerCase()) {
            repetitions.push({
              line: trimmed,
              repeated: phrase1,
              lineNumber: index + 1,
            })
          }
        }
      }
    })

    return {
      isValid: repetitions.length === 0,
      repetitions,
    }
  }

  /**
   * Remove repetições de palavras ou frases
   */
  static fix(lyrics: string): {
    correctedLyrics: string
    corrections: number
  } {
    const lines = lyrics.split("\n")
    const correctedLines: string[] = []
    let corrections = 0

    for (const line of lines) {
      const trimmed = line.trim()

      // Ignora tags, instruções e linhas vazias
      if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(") || trimmed.includes("Instruments:")) {
        correctedLines.push(line)
        continue
      }

      let corrected = trimmed

      // Remove repetições de 2 palavras
      const twoWordPattern = /\b(\w+\s+\w+)\s+\1\b/gi
      if (twoWordPattern.test(corrected)) {
        corrected = corrected.replace(twoWordPattern, "$1")
        corrections++
        console.log(`[RepetitionValidator] 🔧 Removida repetição de 2 palavras`)
        console.log(`  Original: "${trimmed}"`)
        console.log(`  Corrigido: "${corrected}"`)
      }

      // Remove repetições de 3 palavras
      const threeWordPattern = /\b(\w+\s+\w+\s+\w+)\s+\1\b/gi
      if (threeWordPattern.test(corrected)) {
        corrected = corrected.replace(threeWordPattern, "$1")
        corrections++
        console.log(`[RepetitionValidator] 🔧 Removida repetição de 3 palavras`)
        console.log(`  Original: "${trimmed}"`)
        console.log(`  Corrigido: "${corrected}"`)
      }

      correctedLines.push(corrected)
    }

    return {
      correctedLyrics: correctedLines.join("\n"),
      corrections,
    }
  }
}
