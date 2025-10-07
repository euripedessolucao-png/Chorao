// lib/metrics-utils.ts
import { ADVANCED_BRAZILIAN_METRICS, type GenreName } from "./third-way-converter"

export const countPortugueseSyllables = (text: string): number => {
  const cleanText = text.toLowerCase().replace(/[^a-záàâãéèêíïóôõöúçñ]/g, '')
  const syllables = cleanText.match(/[aeiouáàâãéèêíïóôõöúçñ]+/g)
  return syllables ? syllables.length : 0
}

export const validateMetrics = (lyrics: string, genre: GenreName) => {
  const metrics = ADVANCED_BRAZILIAN_METRICS[genre] || ADVANCED_BRAZILIAN_METRICS.default
  const expectedSyllables = metrics.syllablesPerLine
  
  const lines = lyrics.split('\n').filter(line => {
    const trimmed = line.trim()
    return trimmed && !trimmed.startsWith('[') && !trimmed.startsWith('(')
  })

  const problematicLines = lines
    .map((line, index) => {
      const syllables = countPortugueseSyllables(line)
      return { line, syllables, expected: expectedSyllables, index }
    })
    .filter(item => item.syllables !== expectedSyllables)

  return problematicLines.length > 0 ? problematicLines : null
}

export const fixMetrics = (lyrics: string, targetSyllables: number): string => {
  const lines = lyrics.split('\n')
  
  return lines.map(line => {
    if (line.startsWith('[') || line.startsWith('(') || !line.trim()) {
      return line
    }
    
    const currentSyllables = countPortugueseSyllables(line)
    
    if (currentSyllables === targetSyllables) {
      return line
    }
    
    if (currentSyllables < targetSyllables) {
      return line + ' amor'
    } else {
      return line.split(' ').slice(0, -1).join(' ')
    }
  }).join('\n')
}
