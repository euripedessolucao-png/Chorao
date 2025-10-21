/**
 * VALIDADOR DE INTEGRIDADE DE PALAVRAS
 * Garante que nenhuma palavra está cortada ou incompleta
 */

export class WordIntegrityValidator {
  // Lista de palavras comuns que NÃO devem aparecer sem acentos
  private static readonly WORDS_REQUIRING_ACCENTS: Record<string, string> = {
    nao: "não",
    voce: "você",
    esta: "está",
    ate: "até",
    cafe: "café",
    pe: "pé",
    so: "só",
    la: "lá",
    ca: "cá",
    ja: "já",
    seguranca: "segurança",
    esperanca: "esperança",
    raca: "raça",
    laco: "laço",
    heranca: "herança",
    musica: "música",
    historia: "história",
    memoria: "memória",
  }

  // Padrões que indicam palavras cortadas
  private static readonly INCOMPLETE_WORD_PATTERNS = [
    /\b\w+ç\b/i, // Palavras terminando em "ç" sem "a" ou "o" (seguranç, esperanç)
    /\b\w+ã\b/i, // Palavras terminando em "ã" sem "o" (nã)
    /\b\w+á\b(?!s?\b)/i, // Palavras terminando em "á" sem "s" opcional (lá, cá são válidas)
    /\b\w+é\b(?!s?\b)/i, // Palavras terminando em "é" sem "s" opcional (pé, café são válidas)
    /\b\w+í\b(?!s?\b)/i, // Palavras terminando em "í" sem "s" opcional
    /\b\w+ó\b(?!s?\b)/i, // Palavras terminando em "ó" sem "s" opcional (só é válida)
    /\b\w+ú\b(?!s?\b)/i, // Palavras terminando em "ú" sem "s" opcional
  ]

  /**
   * Valida se todas as palavras estão completas e com acentuação correta
   */
  static validate(lyrics: string): {
    isValid: boolean
    errors: Array<{ line: string; word: string; suggestion?: string; lineNumber: number }>
    message: string
  } {
    const lines = lyrics.split("\n")
    const errors: Array<{ line: string; word: string; suggestion?: string; lineNumber: number }> = []

    lines.forEach((line, index) => {
      const trimmed = line.trim()

      // Ignora tags, instruções e linhas vazias
      if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(") || trimmed.includes("Instruments:")) {
        return
      }

      // Verifica palavras sem acentos que deveriam ter
      const words = trimmed.split(/\s+/)
      words.forEach((word) => {
        const cleanWord = word.replace(/[.,!?;:]/g, "").toLowerCase()

        // Verifica se é uma palavra que deveria ter acento
        if (this.WORDS_REQUIRING_ACCENTS[cleanWord]) {
          errors.push({
            line: trimmed,
            word: cleanWord,
            suggestion: this.WORDS_REQUIRING_ACCENTS[cleanWord],
            lineNumber: index + 1,
          })
        }

        // Verifica padrões de palavras cortadas
        for (const pattern of this.INCOMPLETE_WORD_PATTERNS) {
          if (pattern.test(cleanWord)) {
            // Exceções: palavras válidas que terminam com acento
            const validExceptions = ["lá", "cá", "já", "pé", "só", "fé", "dó", "ré", "mi", "fá", "si"]
            if (!validExceptions.includes(cleanWord)) {
              errors.push({
                line: trimmed,
                word: cleanWord,
                lineNumber: index + 1,
              })
            }
          }
        }
      })

      // Verifica se a linha termina abruptamente (sem pontuação e sem sentido)
      const lastWord = words[words.length - 1]?.replace(/[.,!?;:]/g, "").toLowerCase()
      if (lastWord && this.seemsIncomplete(lastWord, trimmed)) {
        errors.push({
          line: trimmed,
          word: lastWord,
          lineNumber: index + 1,
        })
      }
    })

    const isValid = errors.length === 0

    let message = ""
    if (!isValid) {
      message = `❌ BLOQUEADO: ${errors.length} palavra(s) incompleta(s) ou sem acentuação`
      errors.forEach((e) => {
        if (e.suggestion) {
          message += `\n  Linha ${e.lineNumber}: "${e.word}" → "${e.suggestion}"`
        } else {
          message += `\n  Linha ${e.lineNumber}: "${e.word}" parece incompleta`
        }
      })
    } else {
      message = `✅ APROVADO: Todas as palavras estão completas e com acentuação correta`
    }

    return {
      isValid,
      errors,
      message,
    }
  }

  /**
   * Corrige automaticamente palavras sem acentos
   */
  static fix(lyrics: string): {
    correctedLyrics: string
    corrections: number
    details: Array<{ original: string; corrected: string }>
  } {
    let corrected = lyrics
    const details: Array<{ original: string; corrected: string }> = []
    let corrections = 0

    // Corrige palavras sem acentos
    for (const [wrong, correct] of Object.entries(this.WORDS_REQUIRING_ACCENTS)) {
      const regex = new RegExp(`\\b${wrong}\\b`, "gi")
      if (regex.test(corrected)) {
        const original = corrected
        corrected = corrected.replace(regex, correct)
        corrections++
        details.push({ original: wrong, corrected: correct })
        console.log(`[WordIntegrityValidator] 🔧 Corrigido: "${wrong}" → "${correct}"`)
      }
    }

    return {
      correctedLyrics: corrected,
      corrections,
      details,
    }
  }

  /**
   * Verifica se uma palavra parece incompleta baseado no contexto
   */
  private static seemsIncomplete(word: string, line: string): boolean {
    // Se a linha termina com preposição, provavelmente está incompleta
    const endsWithPreposition = /\b(na|no|da|do|em|de|pra|pro|com|sem|por)\s*$/i.test(line)
    if (endsWithPreposition) return true

    // Se a palavra tem menos de 3 caracteres e não é comum, pode estar incompleta
    if (word.length < 3) {
      const commonShortWords = [
        "eu",
        "tu",
        "me",
        "te",
        "se",
        "lá",
        "cá",
        "já",
        "pé",
        "só",
        "fé",
        "dó",
        "ré",
        "mi",
        "fá",
        "si",
        "é",
        "há",
      ]
      if (!commonShortWords.includes(word)) return true
    }

    return false
  }
}
