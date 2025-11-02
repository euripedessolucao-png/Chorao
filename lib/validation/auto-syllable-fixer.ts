import { countPoeticSyllables } from "./syllable-counter-brasileiro"

export interface CorrectionResult {
  original: string
  corrected: string
  syllablesBefore: number
  syllablesAfter: number
  method: "contraction" | "simplification" | "semantic" | "manual"
}

export function autoFixLineToMaxSyllables(line: string, maxSyllables: number): CorrectionResult {
  const originalSyllables = countPoeticSyllables(line)

  if (originalSyllables <= maxSyllables) {
    return {
      original: line,
      corrected: line,
      syllablesBefore: originalSyllables,
      syllablesAfter: originalSyllables,
      method: "manual",
    }
  }

  // ESTRATÉGIA 1: Contrações naturais (igual ao frontend)
  const contractions: [RegExp, string][] = [
    [/\bpara\b/g, "pra"],
    [/\bvocê\b/g, "cê"],
    [/\bestá\b/g, "tá"],
    [/\bestou\b/g, "tô"],
    [/\bde\s+o\b/g, "do"],
    [/\bde\s+a\b/g, "da"],
    [/\bem\s+o\b/g, "no"],
    [/\bem\s+a\b/g, "na"],
    [/\bcom\s+o\b/g, "co"],
    [/\bcom\s+a\b/g, "ca"],
  ]

  let currentLine = line
  for (const [pattern, replacement] of contractions) {
    const testLine = currentLine.replace(pattern, replacement)
    const testSyllables = countPoeticSyllables(testLine)

    if (testSyllables <= maxSyllables && testSyllables > 0) {
      return {
        original: line,
        corrected: testLine,
        syllablesBefore: originalSyllables,
        syllablesAfter: testSyllables,
        method: "contraction",
      }
    }
    currentLine = testLine
  }

  // ESTRATÉGIA 2: Simplificação semântica
  const simplified = simplifyLineSemantically(line, maxSyllables)
  const simplifiedSyllables = countPoeticSyllables(simplified)

  if (simplifiedSyllables <= maxSyllables) {
    return {
      original: line,
      corrected: simplified,
      syllablesBefore: originalSyllables,
      syllablesAfter: simplifiedSyllables,
      method: "simplification",
    }
  }

  // ESTRATÉGIA 3: Fallback - cortar palavras desnecessárias
  const fallback = applyFallbackCorrection(line, maxSyllables)

  return {
    original: line,
    corrected: fallback,
    syllablesBefore: originalSyllables,
    syllablesAfter: countPoeticSyllables(fallback),
    method: "semantic",
  }
}

function simplifyLineSemantically(line: string, maxSyllables: number): string {
  const simplifications: [RegExp, string][] = [
    [/\bsem\s+rumo\s+e\s+cansado\b/g, "coração cansado"],
    [/\blembranças\s+de\s+dor\b/g, "marcas de dor"],
    [/\bseu\s+brilho\s+encantado\b/g, "teu brilho raro"],
    [/\bsilêncio\s+profundo\b/g, "silêncio mudo"],
    [/\bsaudade\s+a\s+vagar\b/g, "saudade no ar"],
    [/\bnão\s+podia\s+falar\b/g, "não disse ainda"],
    [/\binstante\s+passageiro\b/g, "instante breve"],
    [/\bdesespero\b/g, "sofrer"],
  ]

  let result = line
  for (const [pattern, replacement] of simplifications) {
    result = result.replace(pattern, replacement)
    if (countPoeticSyllables(result) <= maxSyllables) {
      break
    }
  }

  return result
}

function applyFallbackCorrection(line: string, maxSyllables: number): string {
  const words = line.split(/\s+/)
  let result = line

  // Remove palavras menos importantes progressivamente
  const removableWords = ["que", "um", "uma", "o", "a", "os", "as", "de", "da", "do", "em", "no", "na"]

  for (const word of removableWords) {
    const testLine = result.replace(new RegExp(`\\s+${word}\\s+`, "g"), " ")
    const testSyllables = countPoeticSyllables(testLine)

    if (testSyllables <= maxSyllables) {
      return testLine.trim()
    }
    result = testLine
  }

  return result.trim()
}

export function reviewAndFixAllLines(
  lyrics: string,
  maxSyllables: number,
): {
  fixedLyrics: string
  corrections: CorrectionResult[]
} {
  const lines = lyrics.split("\n")
  const fixedLines: string[] = []
  const corrections: CorrectionResult[] = []

  for (const line of lines) {
    // Skip section headers and empty lines
    if (!line.trim() || line.trim().startsWith("###") || line.trim().startsWith("(")) {
      fixedLines.push(line)
      continue
    }

    const result = autoFixLineToMaxSyllables(line, maxSyllables)

    if (result.corrected !== result.original) {
      corrections.push(result)
      console.log(
        `[AutoFixer] 🔧 ${result.original} → ${result.corrected} (${result.syllablesBefore}→${result.syllablesAfter} sílabas)`,
      )
    }

    fixedLines.push(result.corrected)
  }

  return {
    fixedLyrics: fixedLines.join("\n"),
    corrections,
  }
}
