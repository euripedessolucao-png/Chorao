export const BRAZILIAN_GENRE_METRICS = {
  "Sertanejo Moderno": { syllablesPerLine: 6, bpm: 90, structure: "VERSO-REFRAO-PONTE" },
  Sertanejo: { syllablesPerLine: 7, bpm: 85, structure: "VERSO-REFRAO-PONTE" },
  "Sertanejo Universitário": { syllablesPerLine: 6, bpm: 95, structure: "VERSO-REFRAO" },
  "Sertanejo Sofrência": { syllablesPerLine: 8, bpm: 75, structure: "VERSO-REFRAO-PONTE" },
  "Sertanejo Raiz": { syllablesPerLine: 10, bpm: 80, structure: "VERSO-REFRAO" },
  Pagode: { syllablesPerLine: 7, bpm: 100, structure: "VERSO-REFRAO" },
  Samba: { syllablesPerLine: 7, bpm: 105, structure: "VERSO-REFRAO-PONTE" },
  Forró: { syllablesPerLine: 8, bpm: 120, structure: "VERSO-REFRAO" },
  Axé: { syllablesPerLine: 6, bpm: 130, structure: "VERSO-REFRAO" },
  MPB: { syllablesPerLine: 9, bpm: 90, structure: "VERSO-REFRAO-PONTE" },
  "Bossa Nova": { syllablesPerLine: 8, bpm: 70, structure: "VERSO-REFRAO" },
  Rock: { syllablesPerLine: 8, bpm: 115, structure: "VERSO-REFRAO-SOLO" },
  Pop: { syllablesPerLine: 7, bpm: 110, structure: "VERSO-REFRAO-PONTE" },
  Funk: { syllablesPerLine: 6, bpm: 125, structure: "REFRAO-VERSO" },
  Gospel: { syllablesPerLine: 8, bpm: 85, structure: "VERSO-REFRAO-PONTE" },
  default: { syllablesPerLine: 8, bpm: 100, structure: "VERSO-REFRAO" },
} as const

export type GenreName = keyof typeof BRAZILIAN_GENRE_METRICS

export function countPortugueseSyllables(word: string): number {
  if (!word.trim()) return 0

  const cleanWord = word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zà-úâ-ûã-õä-üç]/g, "")

  if (cleanWord.length === 0) return 0

  let syllableCount = 0
  let i = 0

  while (i < cleanWord.length) {
    const currentChar = cleanWord[i]

    if ("aeiouáéíóúâêîôûàèìòùãõ".includes(currentChar)) {
      syllableCount++

      if (i + 1 < cleanWord.length) {
        const nextChar = cleanWord[i + 1]
        if (
          ("aeo".includes(currentChar) && "iu".includes(nextChar)) ||
          ("iu".includes(currentChar) && "aeo".includes(nextChar))
        ) {
          i++
        }
      }
    }
    i++
  }

  return Math.max(1, syllableCount)
}

export function validateMetrics(lyrics: string, genre: string) {
  if (!genre || !lyrics) return null

  const metrics = BRAZILIAN_GENRE_METRICS[genre as GenreName] || BRAZILIAN_GENRE_METRICS.default
  const maxSyllables = metrics.syllablesPerLine

  const lines = lyrics.split("\n").filter((line) => {
    const trimmed = line.trim()
    return trimmed && !trimmed.startsWith("[") && !trimmed.startsWith("(") && !trimmed.includes("Instrumental:")
  })

  const problematicLines = lines
    .map((line, index) => ({
      line,
      syllables: countPortugueseSyllables(line),
      index,
    }))
    .filter((item) => item.syllables > maxSyllables)

  return problematicLines
}

export function fixMetrics(lyrics: string, maxSyllables: number): string {
  return lyrics
    .split("\n")
    .map((line) => {
      if (countPortugueseSyllables(line) > maxSyllables) {
        const words = line.split(" ")
        if (words.length > 2) {
          const mid = Math.floor(words.length / 2)
          return words.slice(0, mid).join(" ") + "\n" + words.slice(mid).join(" ")
        }
      }
      return line
    })
    .join("\n")
}
