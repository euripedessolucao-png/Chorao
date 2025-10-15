// lib/validation/validateLyrics.ts - VERSÃO ATUALIZADA
import type { ParsedSection } from "./parser"
import { SERTANEJO_RULES, countSyllables, hasForbiddenElement, hasVisualElement } from "./sertanejoRules"
import { validateLyricsSyllables, SyllableValidationResult } from "./syllable-validator"

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
  syllableValidation: SyllableValidationResult // ✅ NOVO
}

export function validateSertanejoLyrics(sections: ParsedSection[]): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const sectionResults: ValidationResult["sections"] = []
  let score = 100

  // ✅ PRIMEIRO: Validação universal de sílabas
  const fullLyrics = sections.map(section => section.lines.join('\n')).join('\n')
  const syllableValidation = validateLyricsSyllables(fullLyrics, 12)

  // Adiciona violações de sílabas aos erros
  syllableValidation.violations.forEach(violation => {
    errors.push(`Linha ${violation.lineNumber}: "${violation.line}" (${violation.syllableCount} sílabas) → ${violation.suggestion}`)
    score -= 8 // Penalidade por violação de sílaba
  })

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

      // ✅ VALIDAÇÃO DE SÍLABAS ESPECÍFICA PARA REFRÃO
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
    syllableValidation // ✅ INCLUI VALIDAÇÃO DE SÍLABAS
  }
}

// ✅ VALIDADOR UNIVERSAL PARA TODOS OS GÊNEROS
export function validateLyricsUniversal(lyrics: string, genre?: string): ValidationResult {
  const syllableValidation = validateLyricsSyllables(lyrics, 12)
  
  const errors: string[] = []
  const warnings: string[] = []
  let score = 100

  // Penalidades por violações de sílabas
  syllableValidation.violations.forEach(violation => {
    errors.push(`SÍLABAS: "${violation.line}" (${violation.syllableCount} sílabas)`)
    score -= 10
  })

  // Verificações básicas universais
  if (!lyrics.includes('[CHORUS]') && !lyrics.includes('[REFRÃO]')) {
    warnings.push('Possível falta de refrão identificável')
    score -= 15
  }

  if (lyrics.length < 100) {
    warnings.push('Letra muito curta para uma música completa')
    score -= 10
  }

  return {
    isValid: syllableValidation.isValid && score >= 70,
    score,
    errors,
    warnings,
    sections: [], // Seções seriam parseadas separadamente
    syllableValidation
  }
}
