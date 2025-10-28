interface GenreIsolationResult {
  valid: boolean
  violations: string[]
  warnings: string[]
}

/**
 * Valida se a letra contém elementos de outros gêneros
 */
export function validateGenreIsolation(lyrics: string, targetGenre: string): GenreIsolationResult {
  const violations: string[] = []
  const warnings: string[] = []

  const lowerLyrics = lyrics.toLowerCase()

  // Gospel não pode ter elementos de Sertanejo
  if (targetGenre.toLowerCase().includes("gospel")) {
    // Verifica instrumentação proibida
    const forbiddenInstruments = ["accordion", "sanfona", "viola caipira", "zabumba"]
    forbiddenInstruments.forEach((inst) => {
      if (lowerLyrics.includes(inst)) {
        violations.push(`Gospel não deve usar ${inst} (instrumento de sertanejo/forró)`)
      }
    })

    // Verifica audience cues de sertanejo
    const forbiddenCues = ["tá ligado", "bicho!", "véio!", "é nóis!"]
    forbiddenCues.forEach((cue) => {
      if (lowerLyrics.includes(cue)) {
        violations.push(`Gospel não deve usar "${cue}" (audience cue de sertanejo)`)
      }
    })

    // Verifica elementos de linguagem de sertanejo
    const forbiddenWords = ["biquíni", "pix", "story", "boteco", "pickup", "zap", "rolê"]
    forbiddenWords.forEach((word) => {
      if (lowerLyrics.includes(word)) {
        violations.push(`Gospel não deve usar "${word}" (elemento de sertanejo moderno)`)
      }
    })
  }

  // Sertanejo não pode ter elementos de Gospel
  if (targetGenre.toLowerCase().includes("sertanejo")) {
    const gospelWords = ["altar", "graça", "senhor", "deus", "fé", "oração", "amém", "aleluia"]
    let gospelWordCount = 0
    gospelWords.forEach((word) => {
      if (lowerLyrics.includes(word)) {
        gospelWordCount++
      }
    })

    if (gospelWordCount >= 3) {
      warnings.push(
        `Sertanejo com muitos elementos religiosos (${gospelWordCount} palavras). Considere usar Gospel se o tema é religioso.`,
      )
    }
  }

  return {
    valid: violations.length === 0,
    violations,
    warnings,
  }
}

/**
 * Remove elementos de outros gêneros da letra
 */
export function cleanGenreCrossContamination(lyrics: string, targetGenre: string): string {
  let cleaned = lyrics

  if (targetGenre.toLowerCase().includes("gospel")) {
    // Remove audience cues de sertanejo
    cleaned = cleaned.replace(/$$Audience: "Tá ligado!"$$/gi, "")
    cleaned = cleaned.replace(/$$Audience: "Bicho!"$$/gi, "")
    cleaned = cleaned.replace(/$$Audience: "Véio!"$$/gi, "")
    cleaned = cleaned.replace(/$$Audience: "É nóis!"$$/gi, "")

    // Remove instrumentação de sertanejo
    cleaned = cleaned.replace(/accordion/gi, "Keyboard")
    cleaned = cleaned.replace(/sanfona/gi, "Piano")
    cleaned = cleaned.replace(/viola caipira/gi, "Acoustic Guitar")

    // Remove palavras de sertanejo moderno
    cleaned = cleaned.replace(/\bbiquíni\b/gi, "")
    cleaned = cleaned.replace(/\bPIX\b/gi, "")
    cleaned = cleaned.replace(/\bstory\b/gi, "")
    cleaned = cleaned.replace(/\bboteco\b/gi, "")
    cleaned = cleaned.replace(/\bpickup\b/gi, "")
  }

  // Remove linhas vazias extras
  cleaned = cleaned.replace(/\n\n\n+/g, "\n\n")

  return cleaned.trim()
}
