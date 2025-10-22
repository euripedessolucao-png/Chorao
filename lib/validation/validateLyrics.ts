import type { ParsedSection } from "./parser"
import { SERTANEJO_RULES, countSyllables, hasForbiddenElement, hasVisualElement } from "./sertanejoRules"

export interface ValidationResult {
  isValid: boolean
  score: number
  errors: string[]
  warnings: string[]
  sections: {
    type: string
    valid: boolean
    issues: string[]
  }[]
}

export function validateSertanejoLyrics(sections: ParsedSection[]): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const sectionResults: ValidationResult["sections"] = []
  let score = 100

  // Verifica estrutura mínima
  const hasVerse = sections.some((s) => s.type === "verse")
  const hasChorus = sections.some((s) => s.type === "chorus")

  if (!hasVerse) {
    errors.push("Falta pelo menos um verso (PART A)")
    score -= 30
  }

  if (!hasChorus) {
    errors.push("Falta refrão (PART B ou CHORUS)")
    score -= 30
  }

  // Valida cada seção
  for (const section of sections) {
    const sectionIssues: string[] = []
    let sectionValid = true

    // Verifica elementos proibidos
    for (const line of section.lines) {
      if (hasForbiddenElement(line)) {
        sectionIssues.push(`Linha com clichê ultrapassado: "${line}"`)
        sectionValid = false
        score -= 5
      }
    }

    // Verifica prosódia no refrão
    if (section.type === "chorus") {
      const lineCount = section.lines.length

      if (lineCount !== 2 && lineCount !== 4) {
        sectionIssues.push(`Refrão deve ter 2 ou 4 linhas (tem ${lineCount})`)
        sectionValid = false
        score -= 15
      }

      // Verifica se tem elemento visual
      const hasVisual = section.lines.some((line) => hasVisualElement(line))
      if (!hasVisual) {
        warnings.push("Refrão sem elemento visual para clipe")
        score -= 10
      }

      // Verifica métrica
      for (const line of section.lines) {
        const syllables = countSyllables(line)
        if (syllables > SERTANEJO_RULES.chorusStructure.maxSyllablesPerLine) {
          sectionIssues.push(`Linha muito longa (${syllables} sílabas): "${line}"`)
          score -= 5
        }
      }
    }

    sectionResults.push({
      type: section.type,
      valid: sectionValid,
      issues: sectionIssues,
    })

    if (sectionIssues.length > 0) {
      errors.push(...sectionIssues)
    }
  }

  return {
    isValid: score >= 70 && errors.length === 0,
    score: Math.max(0, score),
    errors,
    warnings,
    sections: sectionResults,
  }
}
// ADICIONE esta função ao final do lib/validation/validateLyrics.ts

import { countPoeticSyllables } from "./syllable-counter"

export function validateLyricsSyllables(
  lyrics: string,
  maxSyllables = 11,
): {
  valid: boolean
  violations: Array<{ line: string; syllables: number; lineNumber: number; suggestions: string[] }>
} {
  const lines = lyrics.split("\n")
  const violations: Array<{ line: string; syllables: number; lineNumber: number; suggestions: string[] }> = []

  lines.forEach((line, index) => {
    if (
      line.trim() &&
      !line.startsWith("[") &&
      !line.startsWith("(") &&
      !line.startsWith("Title:") &&
      !line.startsWith("Instrumentos:")
    ) {
      if (line.trim().endsWith(",")) {
        return // Enjambement é válido
      }

      const syllables = countPoeticSyllables(line)
      if (syllables > maxSyllables) {
        violations.push({
          line: line.trim(),
          syllables: syllables,
          lineNumber: index + 1,
          suggestions: [] // Por enquanto vazio, pode adicionar depois
        })
      }
    }
  })

  return {
    valid: violations.length === 0,
    violations,
  }
}
