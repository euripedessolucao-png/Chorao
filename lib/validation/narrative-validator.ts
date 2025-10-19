/**
 * VALIDADOR DE NARRATIVA FLUÍDA
 *
 * Garante que a letra tem:
 * - Começo, meio e fim claros
 * - Continuidade entre versos
 * - Cada verso contribui para a história
 * - Sem cortes abruptos ou mudanças de assunto
 */

export interface NarrativeValidationResult {
  isValid: boolean
  hasBeginning: boolean
  hasMiddle: boolean
  hasEnd: boolean
  hasContinuity: boolean
  abruptChanges: Array<{ fromLine: number; toLine: number; reason: string }>
  score: number
  feedback: string[]
}

/**
 * Valida se a letra tem narrativa fluída e coerente
 */
export function validateNarrativeFlow(lyrics: string, genre: string): NarrativeValidationResult {
  const lines = lyrics
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("[") && !l.startsWith("(") && !l.includes("Instruments:"))

  const result: NarrativeValidationResult = {
    isValid: false,
    hasBeginning: false,
    hasMiddle: false,
    hasEnd: false,
    hasContinuity: true,
    abruptChanges: [],
    score: 0,
    feedback: [],
  }

  if (lines.length < 8) {
    result.feedback.push("Letra muito curta para ter narrativa completa")
    return result
  }

  const lyricsLower = lyrics.toLowerCase()

  // COMEÇO: Apresentação da situação/personagem
  result.hasBeginning =
    lyricsLower.includes("[intro") ||
    lyricsLower.includes("[verse 1") ||
    lyricsLower.includes("[verso 1") ||
    lyricsLower.includes("[part a")

  // MEIO: Desenvolvimento da história
  result.hasMiddle =
    lyricsLower.includes("[verse 2") ||
    lyricsLower.includes("[verso 2") ||
    lyricsLower.includes("[bridge") ||
    lyricsLower.includes("[ponte") ||
    lyricsLower.includes("[part a2")

  // FIM: Conclusão ou resolução
  result.hasEnd =
    lyricsLower.includes("[outro") ||
    lyricsLower.includes("[final") ||
    (lyricsLower.match(/\[chorus\]/gi) || []).length >= 2 || // Refrão repetido indica fim
    (lyricsLower.match(/\[refrão\]/gi) || []).length >= 2 ||
    lyricsLower.includes("[part b")

  const abruptChanges = detectAbruptChanges(lines)
  result.abruptChanges = abruptChanges
  result.hasContinuity = abruptChanges.length === 0

  let score = 0

  if (result.hasBeginning) score += 30
  if (result.hasMiddle) score += 30
  if (result.hasEnd) score += 20
  if (result.hasContinuity) score += 20

  result.score = score
  result.isValid = score >= 70 && result.hasBeginning && result.hasEnd

  if (!result.hasBeginning) {
    result.feedback.push("Falta apresentação clara no início (Verse 1 ou Intro)")
  }
  if (!result.hasMiddle) {
    result.feedback.push("Falta desenvolvimento da história (Verse 2 ou Bridge)")
  }
  if (!result.hasEnd) {
    result.feedback.push("Falta conclusão ou resolução (Outro ou Chorus final)")
  }
  if (!result.hasContinuity) {
    result.feedback.push(`Detectadas ${abruptChanges.length} mudanças abruptas na narrativa`)
  }

  return result
}

/**
 * Detecta mudanças abruptas de assunto entre versos
 */
function detectAbruptChanges(lines: string[]): Array<{ fromLine: number; toLine: number; reason: string }> {
  const changes: Array<{ fromLine: number; toLine: number; reason: string }> = []

  for (let i = 0; i < lines.length - 1; i++) {
    const currentLine = lines[i].toLowerCase()
    const nextLine = lines[i + 1].toLowerCase()

    // Ignora linhas muito curtas
    if (currentLine.split(" ").length < 3 || nextLine.split(" ").length < 3) {
      continue
    }

    // Detecta mudança abrupta de tema
    const hasCommonWords = checkCommonWords(currentLine, nextLine)
    const hasTemporalContinuity = checkTemporalContinuity(currentLine, nextLine)
    const hasEmotionalContinuity = checkEmotionalContinuity(currentLine, nextLine)

    if (!hasCommonWords && !hasTemporalContinuity && !hasEmotionalContinuity) {
      changes.push({
        fromLine: i + 1,
        toLine: i + 2,
        reason: "Mudança abrupta de assunto sem conexão aparente",
      })
    }
  }

  return changes
}

/**
 * Verifica se há palavras em comum entre duas linhas
 */
function checkCommonWords(line1: string, line2: string): boolean {
  const words1 = new Set(
    line1
      .split(" ")
      .filter((w) => w.length > 3)
      .map((w) => w.replace(/[,.!?]/g, "")),
  )
  const words2 = line2
    .split(" ")
    .filter((w) => w.length > 3)
    .map((w) => w.replace(/[,.!?]/g, ""))

  // Se há pelo menos 1 palavra em comum (exceto artigos/preposições)
  return words2.some((w) => words1.has(w))
}

/**
 * Verifica continuidade temporal (conectores, tempos verbais)
 */
function checkTemporalContinuity(line1: string, line2: string): boolean {
  const temporalConnectors = [
    "então",
    "depois",
    "agora",
    "hoje",
    "ontem",
    "amanhã",
    "quando",
    "enquanto",
    "mas",
    "porém",
    "e",
    "aí",
    "daí",
  ]

  return temporalConnectors.some((connector) => line2.includes(connector))
}

/**
 * Verifica continuidade emocional (mesma emoção ou progressão lógica)
 */
function checkEmotionalContinuity(line1: string, line2: string): boolean {
  const emotionalWords = {
    positive: ["feliz", "alegre", "amor", "sorriso", "festa", "dança", "celebra", "viva"],
    negative: ["triste", "dor", "sofr", "chora", "saudade", "solidão", "perdi", "foi embora"],
    neutral: ["lembra", "pensa", "sabe", "vê", "olha", "sente"],
  }

  const getEmotion = (line: string): string | null => {
    if (emotionalWords.positive.some((w) => line.includes(w))) return "positive"
    if (emotionalWords.negative.some((w) => line.includes(w))) return "negative"
    if (emotionalWords.neutral.some((w) => line.includes(w))) return "neutral"
    return null
  }

  const emotion1 = getEmotion(line1)
  const emotion2 = getEmotion(line2)

  // Continuidade se mesma emoção ou transição lógica (negative → neutral → positive)
  if (!emotion1 || !emotion2) return true // Sem emoção clara = assume continuidade
  if (emotion1 === emotion2) return true // Mesma emoção
  if (emotion1 === "negative" && emotion2 === "neutral") return true // Transição lógica
  if (emotion1 === "neutral" && emotion2 === "positive") return true // Transição lógica

  return false
}

/**
 * Valida se cada verso contribui para a história
 */
export function validateVerseContribution(lyrics: string): {
  isValid: boolean
  emptyVerses: number[]
  repetitiveVerses: number[]
  feedback: string[]
} {
  const lines = lyrics
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("[") && !l.startsWith("(") && !l.includes("Instruments:"))

  const emptyVerses: number[] = []
  const repetitiveVerses: number[] = []
  const feedback: string[] = []

  lines.forEach((line, index) => {
    if (line.split(" ").length < 3) {
      emptyVerses.push(index + 1)
    }
  })

  const seenLines = new Map<string, number[]>()
  lines.forEach((line, index) => {
    const normalized = line.toLowerCase().trim()
    if (!seenLines.has(normalized)) {
      seenLines.set(normalized, [])
    }
    seenLines.get(normalized)!.push(index + 1)
  })

  seenLines.forEach((occurrences, line) => {
    if (occurrences.length > 2) {
      // Repetido mais de 2x (não é refrão)
      repetitiveVerses.push(...occurrences)
      feedback.push(`Verso repetido ${occurrences.length}x: "${line.substring(0, 50)}..."`)
    }
  })

  if (emptyVerses.length > 0) {
    feedback.push(`${emptyVerses.length} versos muito curtos ou vazios`)
  }

  const isValid = emptyVerses.length === 0 && repetitiveVerses.length < 3

  return {
    isValid,
    emptyVerses,
    repetitiveVerses,
    feedback,
  }
}
