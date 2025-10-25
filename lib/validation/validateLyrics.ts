import type { ParsedSection } from "./parser"
import { SERTANEJO_RULES, countSyllables, hasForbiddenElement, hasVisualElement } from "./sertanejoRules"
import { countPoeticSyllables as countPortugueseSyllables } from "./syllable-counter-brasileiro"

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

/**
 * Reconstrói versos quebrados por quebra de linha manual (ex: "no meu\ntravesseiro")
 * para contagem silábica precisa.
 */
function reconstructVerses(lines: string[]): string[] {
  const reconstructed: string[] = []
  let currentVerse = ""

  for (const rawLine of lines) {
    const line = rawLine.trim()

    // Ignora linhas de metadados
    if (
      !line ||
      line.startsWith("[") ||
      line.startsWith("(") ||
      line.startsWith("Title:") ||
      line.startsWith("Instrumentos:")
    ) {
      if (currentVerse) {
        reconstructed.push(currentVerse)
        currentVerse = ""
      }
      continue
    }

    // Se a linha anterior termina com pontuação forte, inicia novo verso
    if (currentVerse && /[.!?…]$/.test(currentVerse.trim())) {
      reconstructed.push(currentVerse)
      currentVerse = line
    } else {
      // Concatena com espaço (remove quebra artificial)
      currentVerse = currentVerse ? `${currentVerse} ${line}` : line
    }
  }

  if (currentVerse) {
    reconstructed.push(currentVerse)
  }

  return reconstructed
}

export function validateLyricsSyllables(
  lyrics: string,
  maxSyllables = 11,
): {
  valid: boolean
  violations: Array<{ line: string; syllables: number; lineNumber: number; suggestions: string[] }>
} {
  const rawLines = lyrics.split("\n")
  const reconstructedLines = reconstructVerses(rawLines)
  const violations: Array<{ line: string; syllables: number; lineNumber: number; suggestions: string[] }> = []

  // Mapeia linha reconstruída para número original (aproximado)
  let originalLineIndex = 0
  for (const verse of reconstructedLines) {
    const syllables = countPortugueseSyllables(verse)
    if (syllables > maxSyllables) {
      // Encontra a primeira linha original que compõe este verso
      let lineNumber = originalLineIndex + 1
      violations.push({
        line: verse,
        syllables,
        lineNumber,
        suggestions: [],
      })
    }
    // Avança índice original (simplificado)
    originalLineIndex += verse.split(" ").length > 8 ? 2 : 1
  }

  return {
    valid: violations.length === 0,
    violations,
  }
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

    // Reconstrói versos para validação silábica precisa
    const reconstructedLines = reconstructVerses(section.lines)

    // Verifica elementos proibidos (linha por linha original)
    for (const line of section.lines) {
      if (hasForbiddenElement(line)) {
        sectionIssues.push(`Linha com clichê ultrapassado: "${line}"`)
        sectionValid = false
        score -= 5
      }
    }

    // Validação específica por tipo de seção
    if (section.type === "chorus") {
      const lineCount = reconstructedLines.length

      if (lineCount !== 2 && lineCount !== 4) {
        sectionIssues.push(`Refrão deve ter 2 ou 4 linhas (tem ${lineCount})`)
        sectionValid = false
        score -= 15
      }

      // Elemento visual obrigatório
      const hasVisual = reconstructedLines.some((line) => hasVisualElement(line))
      if (!hasVisual) {
        warnings.push("Refrão sem elemento visual para clipe")
        score -= 10
      }

      // Métrica: máximo 10 sílabas ideal, 11 aceitável, 12 erro
      for (const line of reconstructedLines) {
        const syllables = countPortugueseSyllables(line)
        if (syllables > 12) {
          sectionIssues.push(`Linha excede limite humano (${syllables} sílabas): "${line}"`)
          score -= 10
        } else if (syllables > 11) {
          warnings.push(`Linha acima do recomendado (${syllables} sílabas): "${line}"`)
          score -= 3
        } else if (syllables < 8 || syllables > 10) {
          warnings.push(`Linha fora da faixa ideal (${syllables} sílabas; ideal: 8–10): "${line}"`)
        }
      }
    } else if (section.type === "verse" || section.type === "bridge") {
      // Versos e pontes: ideal 8–10, aceitável até 11
      for (const line of reconstructedLines) {
        const syllables = countPortugueseSyllables(line)
        if (syllables > 12) {
          sectionIssues.push(`Linha inviável para canto (${syllables} sílabas): "${line}"`)
          score -= 8
        } else if (syllables > 11) {
          warnings.push(`Linha longa demais (${syllables} sílabas): "${line}"`)
          score -= 2
        } else if (syllables < 8 || syllables > 10) {
          warnings.push(`Linha fora da faixa ideal (${syllables} sílabas; ideal: 8–10): "${line}"`)
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
