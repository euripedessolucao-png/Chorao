// lib/validation/auto-syllable-fixer.ts - VERSÃO BACKEND
import { countPoeticSyllables } from "./syllable-counter-brasileiro"

export interface CorrectionResult {
  original: string
  corrected: string
  syllablesBefore: number
  syllablesAfter: number
  method: "contraction" | "needs_rewrite"
  needsRewrite: boolean
}

/**
 * NÃO CORTA VERSOS - apenas aplica contrações naturais
 * Se não resolver, marca para REESCRITA COMPLETA
 */
export function autoFixLineToMaxSyllables(line: string, maxSyllables: number): CorrectionResult {
  const originalSyllables = countPoeticSyllables(line)

  if (originalSyllables <= maxSyllables) {
    return {
      original: line,
      corrected: line,
      syllablesBefore: originalSyllables,
      syllablesAfter: originalSyllables,
      method: "contraction",
      needsRewrite: false,
    }
  }

  const contractions: [RegExp, string][] = [
    [/\bvocê\b/gi, "cê"],
    [/\bestou\b/gi, "tô"],
    [/\bestá\b/gi, "tá"],
    [/\bestão\b/gi, "tão"],
    [/\bpara\b/gi, "pra"],
    [/\bde\s+amor\b/gi, "d'amor"],
    [/\bque\s+eu\b/gi, "qu'eu"],
  ]

  let currentLine = line
  for (const [pattern, replacement] of contractions) {
    const testLine = currentLine.replace(pattern, replacement)
    const testSyllables = countPoeticSyllables(testLine)

    if (testSyllables <= maxSyllables) {
      return {
        original: line,
        corrected: testLine,
        syllablesBefore: originalSyllables,
        syllablesAfter: testSyllables,
        method: "contraction",
        needsRewrite: false,
      }
    }
    currentLine = testLine
  }

  console.log(`[v0] ⚠️  Linha precisa de REESCRITA: "${line.substring(0, 50)}..." (${originalSyllables} sílabas)`)

  return {
    original: line,
    corrected: line,
    syllablesBefore: originalSyllables,
    syllablesAfter: originalSyllables,
    method: "needs_rewrite",
    needsRewrite: true,
  }
}

export function reviewAndFixAllLines(
  lyrics: string,
  maxSyllables: number,
): {
  fixedLyrics: string
  corrections: CorrectionResult[]
  needsFullRewrite: boolean
} {
  const lines = lyrics.split("\n")
  const fixedLines: string[] = []
  const corrections: CorrectionResult[] = []
  let linesNeedingRewrite = 0

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("###") || line.trim().startsWith("(")) {
      fixedLines.push(line)
      continue
    }

    const result = autoFixLineToMaxSyllables(line, maxSyllables)

    if (result.needsRewrite) {
      linesNeedingRewrite++
    }

    if (result.corrected !== result.original) {
      corrections.push(result)
      console.log(
        `[AutoFixer] 🔧 ${result.original} → ${result.corrected} (${result.syllablesBefore}→${result.syllablesAfter} sílabas)`,
      )
    }

    fixedLines.push(result.corrected)
  }

  const needsFullRewrite = linesNeedingRewrite > 0

  return {
    fixedLyrics: fixedLines.join("\n"),
    corrections,
    needsFullRewrite,
  }
}
