import type { ChorusOption } from "./parser"
import { SERTANEJO_RULES, hasVisualElement, hasForbiddenElement, extractHook } from "./sertanejoRules"
import { countPoeticSyllables } from "./syllable-counter" // ← CORREÇÃO: Importar do lugar correto

export interface ChorusValidation {
  isValid: boolean
  score: number
  stickyHookFound: string | null
  isVisual: boolean
  errors: string[]
}

export interface ChorusBatchResult {
  all: Array<ChorusOption & { validation: ChorusValidation }>
  valid: Array<ChorusOption & { validation: ChorusValidation }>
  best: (ChorusOption & { validation: ChorusValidation }) | null
}

export function validateChorus(chorus: ChorusOption): ChorusValidation {
  const errors: string[] = []
  let score = 100

  // Verifica estrutura (2 ou 4 linhas)
  const lineCount = chorus.lines.length
  if (lineCount !== 2 && lineCount !== 4) {
    errors.push(`Deve ter 2 ou 4 linhas (tem ${lineCount})`)
    score -= 30
  }

  // Verifica elementos proibidos
  for (const line of chorus.lines) {
    if (hasForbiddenElement(line)) {
      errors.push(`Clichê ultrapassado: "${line}"`)
      score -= 20
    }
  }

  // Verifica elemento visual
  const isVisual = chorus.lines.some((line) => hasVisualElement(line))
  if (!isVisual) {
    errors.push("Sem elemento visual para clipe")
    score -= 15
  }

  // Verifica gancho chiclete
  const hook = extractHook(chorus.lines)
  if (!hook) {
    errors.push("Sem gancho chiclete de 2-4 palavras")
    score -= 15
  }

  // Verifica prosódia (métrica) - ✅ CORREÇÃO: countSyllables → countPoeticSyllables
  for (const line of chorus.lines) {
    const syllables = countPoeticSyllables(line)
    if (syllables > SERTANEJO_RULES.chorusStructure.maxSyllablesPerLine) {
      errors.push(`Linha muito longa (${syllables} sílabas)`)
      score -= 10
    }
  }

  return {
    isValid: score >= 70 && errors.length === 0,
    score: Math.max(0, score),
    stickyHookFound: hook,
    isVisual,
    errors,
  }
}

export function validateChorusBatch(choruses: ChorusOption[]): ChorusBatchResult {
  const validated = choruses.map((chorus) => ({
    ...chorus,
    validation: validateChorus(chorus),
  }))

  const valid = validated.filter((c) => c.validation.isValid)
  const best =
    valid.length > 0
      ? valid.reduce((prev, curr) => (curr.validation.score > prev.validation.score ? curr : prev))
      : null

  return { all: validated, valid, best }
}
