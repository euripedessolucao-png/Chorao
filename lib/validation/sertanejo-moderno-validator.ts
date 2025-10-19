/**
 * VALIDADOR ESPECÍFICO PARA SERTANEJO MODERNO 2025
 *
 * Baseado em análise de hits atuais e feedback de especialistas.
 * Este validador detecta e corrige problemas técnicos específicos do gênero.
 *
 * REGRAS CRÍTICAS - NÃO ALTERAR SEM CONSULTA:
 * - Máximo 11 sílabas por verso (ideal 7-11)
 * - Máximo 3 rimas consecutivas com mesma terminação
 * - Pré-refrão deve ter frases completas
 * - Refrão final deve ter variação emocional
 */

import { countPoeticSyllables } from "@/lib/validation/syllable-counter"

export interface SertanejoValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
  score: number // 0-100
}

export interface SertanejoVerse {
  text: string
  syllables: number
  rhymeEnding: string
}

/**
 * Valida uma letra completa de sertanejo moderno
 */
export function validateSertanejoModerno(lyrics: string): SertanejoValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []
  let score = 100

  const sections = parseLyricSections(lyrics)

  // VALIDAÇÃO 1: Métrica de sílabas (7-11, ideal 10-11)
  const syllableIssues = validateSyllables(sections)
  if (syllableIssues.errors.length > 0) {
    errors.push(...syllableIssues.errors)
    score -= syllableIssues.errors.length * 10
  }
  if (syllableIssues.warnings.length > 0) {
    warnings.push(...syllableIssues.warnings)
    score -= syllableIssues.warnings.length * 5
  }

  // VALIDAÇÃO 2: Rimas repetitivas
  const rhymeIssues = validateRhymeVariety(sections)
  if (rhymeIssues.errors.length > 0) {
    errors.push(...rhymeIssues.errors)
    score -= rhymeIssues.errors.length * 15
  }
  suggestions.push(...rhymeIssues.suggestions)

  // VALIDAÇÃO 3: Pré-refrão completo
  const preChorusIssues = validatePreChorus(sections)
  if (preChorusIssues.errors.length > 0) {
    errors.push(...preChorusIssues.errors)
    score -= preChorusIssues.errors.length * 10
  }

  // VALIDAÇÃO 4: Variação no refrão final
  const chorusVariation = validateChorusVariation(sections)
  if (!chorusVariation.hasVariation) {
    warnings.push('Refrão final deve ter variação emocional (ex: "ficar" → "viver")')
    suggestions.push(...chorusVariation.suggestions)
    score -= 10
  }

  // VALIDAÇÃO 5: Estrutura A-B-C moderna
  const structureIssues = validateModernStructure(sections)
  if (structureIssues.errors.length > 0) {
    errors.push(...structureIssues.errors)
    score -= structureIssues.errors.length * 5
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    score: Math.max(0, score),
  }
}

/**
 * Valida métrica de sílabas (7-11, ideal 10-11)
 */
function validateSyllables(sections: Map<string, string[]>) {
  const errors: string[] = []
  const warnings: string[] = []

  const MAX_SYLLABLES_ABSOLUTE = 11

  for (const [sectionName, lines] of sections.entries()) {
    lines.forEach((line, index) => {
      const syllables = countPoeticSyllables(line)

      // ERRO: Mais de 11 sílabas
      if (syllables > MAX_SYLLABLES_ABSOLUTE) {
        errors.push(
          `${sectionName} linha ${index + 1}: ${syllables} sílabas (máximo ${MAX_SYLLABLES_ABSOLUTE}). ` +
            `Linha: "${line}"`,
        )
      }

      // AVISO: Menos de 7 ou exatamente 11 sílabas
      if (syllables < 7) {
        warnings.push(`${sectionName} linha ${index + 1}: ${syllables} sílabas (mínimo ideal 7)`)
      } else if (syllables === MAX_SYLLABLES_ABSOLUTE) {
        warnings.push(`${sectionName} linha ${index + 1}: ${syllables} sílabas (no limite, ideal 10)`)
      }
    })
  }

  return { errors, warnings }
}

/**
 * Valida variedade de rimas (máximo 3 consecutivas com mesma terminação)
 */
function validateRhymeVariety(sections: Map<string, string[]>) {
  const errors: string[] = []
  const suggestions: string[] = []

  for (const [sectionName, lines] of sections.entries()) {
    const rhymeEndings = lines.map((line) => extractRhymeEnding(line))

    // Detecta sequências de 4+ rimas iguais
    let consecutiveCount = 1
    let currentRhyme = rhymeEndings[0]

    for (let i = 1; i < rhymeEndings.length; i++) {
      if (rhymeEndings[i] === currentRhyme) {
        consecutiveCount++

        if (consecutiveCount >= 4) {
          errors.push(
            `${sectionName}: ${consecutiveCount} rimas consecutivas em "-${currentRhyme}" ` +
              `(máximo 3). Varie as terminações para evitar monotonia.`,
          )

          suggestions.push(`Sugestão: Alterne rimas. Ex: AABB ou ABAB em vez de AAAA`)
        }
      } else {
        consecutiveCount = 1
        currentRhyme = rhymeEndings[i]
      }
    }
  }

  return { errors, suggestions }
}

/**
 * Valida se pré-refrão tem frases completas
 */
function validatePreChorus(sections: Map<string, string[]>) {
  const errors: string[] = []

  const preChorus = sections.get("PRE-CHORUS") || sections.get("PRÉ-REFRÃO")
  if (!preChorus) return { errors }

  preChorus.forEach((line, index) => {
    // Detecta verbos sem complemento
    const incompletePatterns = [
      /\b(eleva|releva|celebra|revela)\s*$/i, // Verbos transitivos sem objeto
      /\b(que|pra|com|sem)\s*$/i, // Preposições no final
      /,\s*$/, // Vírgula no final (frase incompleta)
    ]

    for (const pattern of incompletePatterns) {
      if (pattern.test(line.trim())) {
        errors.push(`Pré-refrão linha ${index + 1}: Frase incompleta. ` + `"${line}" parece não ter complemento.`)
      }
    }
  })

  return { errors }
}

/**
 * Valida variação no refrão final
 */
function validateChorusVariation(sections: Map<string, string[]>) {
  const suggestions: string[] = []

  const choruses: string[][] = []
  for (const [sectionName, lines] of sections.entries()) {
    if (sectionName.includes("CHORUS") || sectionName.includes("REFRÃO")) {
      choruses.push(lines)
    }
  }

  if (choruses.length < 2) {
    return { hasVariation: true, suggestions }
  }

  // Compara primeiro e último refrão
  const firstChorus = choruses[0].join("\n")
  const lastChorus = choruses[choruses.length - 1].join("\n")

  const hasVariation = firstChorus !== lastChorus

  if (!hasVariation) {
    suggestions.push(
      "Refrão final idêntico ao primeiro. Sugestões de variação:",
      '- Trocar verbo final: "ficar" → "viver" ou "morar"',
      '- Adicionar intensificador: "eu quero" → "eu vou"',
      '- Mudar perspectiva: "nesse chão" → "nesse meu chão"',
    )
  }

  return { hasVariation, suggestions }
}

/**
 * Valida estrutura A-B-C moderna do sertanejo
 */
function validateModernStructure(sections: Map<string, string[]>) {
  const errors: string[] = []

  const sectionNames = Array.from(sections.keys())

  // Estrutura esperada: VERSE → PRE-CHORUS → CHORUS
  const hasVerse = sectionNames.some((s) => s.includes("VERSE") || s.includes("VERSO"))
  const hasPreChorus = sectionNames.some((s) => s.includes("PRE-CHORUS") || s.includes("PRÉ-REFRÃO"))
  const hasChorus = sectionNames.some((s) => s.includes("CHORUS") || s.includes("REFRÃO"))

  if (!hasVerse) {
    errors.push("Estrutura incompleta: faltam versos (VERSE)")
  }
  if (!hasPreChorus) {
    errors.push("Estrutura incompleta: falta pré-refrão (PRE-CHORUS) - essencial no sertanejo moderno")
  }
  if (!hasChorus) {
    errors.push("Estrutura incompleta: falta refrão (CHORUS)")
  }

  return { errors }
}

/**
 * Extrai terminação de rima de uma linha
 */
function extractRhymeEnding(line: string): string {
  const words = line.trim().split(/\s+/)
  const lastWord = words[words.length - 1].replace(/[.,!?;:()[\]]/g, "").toLowerCase()

  // Extrai últimas 2-3 letras como terminação
  return lastWord.slice(-2)
}

/**
 * Parseia letra em seções
 */
function parseLyricSections(lyrics: string): Map<string, string[]> {
  const sections = new Map<string, string[]>()
  const lines = lyrics.split("\n")

  let currentSection = "UNKNOWN"
  let currentLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()

    // Detecta cabeçalho de seção
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      // Salva seção anterior
      if (currentLines.length > 0) {
        sections.set(currentSection, currentLines)
      }

      // Inicia nova seção
      currentSection = trimmed.slice(1, -1).split("-")[0].trim()
      currentLines = []
    } else if (trimmed && !trimmed.startsWith("(")) {
      // Adiciona linha (ignora instruções entre parênteses)
      currentLines.push(trimmed)
    }
  }

  // Salva última seção
  if (currentLines.length > 0) {
    sections.set(currentSection, currentLines)
  }

  return sections
}

/**
 * Corrige automaticamente problemas detectados
 */
export async function autoCorrectSertanejoIssues(
  lyrics: string,
  validationResult: SertanejoValidationResult,
): Promise<string> {
  const correctedLyrics = lyrics

  // TODO: Implementar correções automáticas baseadas nos erros detectados
  // Por enquanto, retorna a letra original com sugestões nos comentários

  return correctedLyrics
}
