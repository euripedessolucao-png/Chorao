/**
 * Sistema Terceira Via
 *
 * Sistema de validação e correção em três camadas para garantir
 * que as letras geradas respeitam as métricas específicas de cada gênero.
 *
 * As três vias são:
 * 1. Validação inicial (preventiva)
 * 2. Correção automática (corretiva)
 * 3. Regeneração inteligente (adaptativa)
 */

import { countPoeticSyllables } from "../validation/syllable-counter-brasileiro"
import { autoFixLineToMaxSyllables } from "../validation/auto-syllable-fixer"
import { GENRE_METRICS, type GenreName } from "../orchestrator/meta-composer"

export interface TerceiraViaConfig {
  genre: string
  minSyllables: number
  maxSyllables: number
  allowPeaks?: boolean
  strictMode?: boolean
}

export interface ValidationResult {
  isValid: boolean
  errors: LineError[]
  warnings: LineWarning[]
  statistics: {
    totalLines: number
    validLines: number
    averageSyllables: number
    outOfRangeLines: number
  }
}

export interface LineError {
  lineNumber: number
  line: string
  syllableCount: number
  expectedRange: { min: number; max: number }
  severity: "error" | "warning"
}

export interface LineWarning {
  lineNumber: number
  message: string
}

export interface CorrectionResult {
  originalLyrics: string
  correctedLyrics: string
  corrections: Array<{
    lineNumber: number
    original: string
    corrected: string
    syllablesBefore: number
    syllablesAfter: number
  }>
  success: boolean
}

/**
 * Primeira Via: Validação
 * Verifica se a letra está dentro das métricas do gênero
 */
export function validateMetrics(lyrics: string, config: TerceiraViaConfig): ValidationResult {
  const lines = lyrics.split("\n").filter((l) => l.trim().length > 0)
  const errors: LineError[] = []
  const warnings: LineWarning[] = []
  let totalSyllables = 0
  let validLines = 0

  lines.forEach((line, index) => {
    const syllables = countPoeticSyllables(line)
    totalSyllables += syllables

    if (syllables < config.minSyllables || syllables > config.maxSyllables) {
      const severity = config.allowPeaks && syllables <= config.maxSyllables + 2 ? "warning" : "error"

      errors.push({
        lineNumber: index + 1,
        line,
        syllableCount: syllables,
        expectedRange: { min: config.minSyllables, max: config.maxSyllables },
        severity,
      })

      if (severity === "warning") {
        warnings.push({
          lineNumber: index + 1,
          message: `Pico de ${syllables} sílabas (permitido para ênfase)`,
        })
      }
    } else {
      validLines++
    }
  })

  const isValid = config.strictMode ? errors.length === 0 : errors.filter((e) => e.severity === "error").length === 0

  return {
    isValid,
    errors,
    warnings,
    statistics: {
      totalLines: lines.length,
      validLines,
      averageSyllables: Math.round(totalSyllables / lines.length),
      outOfRangeLines: errors.filter((e) => e.severity === "error").length,
    },
  }
}

/**
 * Segunda Via: Correção Automática
 * Tenta corrigir automaticamente as linhas fora da métrica
 */
export function applyAutomaticCorrection(lyrics: string, config: TerceiraViaConfig): CorrectionResult {
  const lines = lyrics.split("\n").filter((l) => l.trim().length > 0)
  const correctedLines: string[] = []
  const corrections: CorrectionResult["corrections"] = []

  lines.forEach((line, index) => {
    const syllablesBefore = countPoeticSyllables(line)

    if (syllablesBefore > config.maxSyllables) {
      // Tenta corrigir linha longa
      const fixed = autoFixLineToMaxSyllables(line, config.maxSyllables)
      const syllablesAfter = countPoeticSyllables(fixed)

      if (syllablesAfter <= config.maxSyllables) {
        correctedLines.push(fixed)
        corrections.push({
          lineNumber: index + 1,
          original: line,
          corrected: fixed,
          syllablesBefore,
          syllablesAfter,
        })
      } else {
        correctedLines.push(line) // Não conseguiu corrigir
      }
    } else if (syllablesBefore < config.minSyllables) {
      // Linha muito curta - mantém como está (requer regeneração)
      correctedLines.push(line)
    } else {
      // Linha OK
      correctedLines.push(line)
    }
  })

  const correctedLyrics = correctedLines.join("\n")
  const validation = validateMetrics(correctedLyrics, config)

  return {
    originalLyrics: lyrics,
    correctedLyrics,
    corrections,
    success: validation.isValid,
  }
}

/**
 * Terceira Via: Análise e Sugestões
 * Para casos que não podem ser corrigidos automaticamente
 */
export function analyzeAndSuggest(
  lyrics: string,
  config: TerceiraViaConfig,
): {
  needsRegeneration: boolean
  problematicLines: number[]
  suggestions: string[]
} {
  const validation = validateMetrics(lyrics, config)
  const problematicLines = validation.errors.filter((e) => e.severity === "error").map((e) => e.lineNumber)

  const suggestions: string[] = []

  if (validation.statistics.averageSyllables > config.maxSyllables) {
    suggestions.push("Use contrações naturais (está → tá, para → pra)")
    suggestions.push("Simplifique expressões longas")
    suggestions.push("Evite adjetivos desnecessários")
  }

  if (validation.statistics.averageSyllables < config.minSyllables) {
    suggestions.push("Adicione detalhes descritivos")
    suggestions.push("Use expressões mais completas")
    suggestions.push("Expanda metáforas")
  }

  const needsRegeneration = problematicLines.length > validation.statistics.totalLines * 0.3

  return {
    needsRegeneration,
    problematicLines,
    suggestions,
  }
}

/**
 * Função principal: Aplica todo o sistema Terceira Via
 */
export function applyTerceiraVia(lyrics: string, genre: string): CorrectionResult {
  // Normaliza o gênero para obter as métricas
  const genreKey = normalizeGenreKey(genre)
  const metrics = GENRE_METRICS[genreKey] || {
    minSyllables: 8,
    maxSyllables: 12,
    flexibility: "moderate",
    allowPeaks: false,
  }

  const config: TerceiraViaConfig = {
    genre,
    minSyllables: metrics.minSyllables,
    maxSyllables: metrics.maxSyllables,
    allowPeaks: metrics.allowPeaks,
    strictMode: metrics.flexibility === "low",
  }

  console.log("[Terceira Via] Iniciando validação e correção")
  console.log("[Terceira Via] Gênero:", genre)
  console.log("[Terceira Via] Métrica:", `${config.minSyllables}-${config.maxSyllables} sílabas`)

  // Primeira Via: Valida
  const validation = validateMetrics(lyrics, config)
  console.log("[Terceira Via] Validação inicial:", validation.statistics)

  if (validation.isValid) {
    console.log("[Terceira Via] ✓ Letra válida, nenhuma correção necessária")
    return {
      originalLyrics: lyrics,
      correctedLyrics: lyrics,
      corrections: [],
      success: true,
    }
  }

  // Segunda Via: Corrige automaticamente
  console.log("[Terceira Via] Aplicando correções automáticas...")
  const correction = applyAutomaticCorrection(lyrics, config)
  console.log("[Terceira Via] Correções aplicadas:", correction.corrections.length)

  if (correction.success) {
    console.log("[Terceira Via] ✓ Correção automática bem-sucedida")
    return correction
  }

  // Terceira Via: Analisa e sugere
  const analysis = analyzeAndSuggest(correction.correctedLyrics, config)
  console.log("[Terceira Via] Análise:", {
    needsRegeneration: analysis.needsRegeneration,
    problematicLines: analysis.problematicLines.length,
  })

  return {
    ...correction,
    success: false,
  }
}

/**
 * Normaliza o nome do gênero
 */
function normalizeGenreKey(genre: string): GenreName {
  const genreMap: Record<string, GenreName> = {
    sertanejo: "Sertanejo Moderno",
    sertanejo_moderno: "Sertanejo Moderno",
    "sertanejo moderno": "Sertanejo Moderno",
    funk: "Funk",
    piseiro: "Piseiro",
    mpb: "MPB",
    pop: "Pop Brasileiro",
    pop_brasileiro: "Pop Brasileiro",
    "pop brasileiro": "Pop Brasileiro",
    rock: "Rock Brasileiro",
    rock_brasileiro: "Rock Brasileiro",
    "rock brasileiro": "Rock Brasileiro",
    samba: "Samba",
    forro: "Forró",
    forró: "Forró",
    gospel: "Gospel",
    bachata: "Bachata Brasileira",
    bachata_brasileira: "Bachata Brasileira",
    "bachata brasileira": "Bachata Brasileira",
  }

  const normalized = genre.toLowerCase().trim()
  return genreMap[normalized] || "Pop Brasileiro"
}
