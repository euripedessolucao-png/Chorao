// lib/rules/rule-engine.ts

import { UNIVERSAL_RULES, getRhymeRulesForGenre, buildUniversalRulesPrompt } from "./universal-rules"
import { getGenreConfig } from "../genre-config"
import { validateFullLyricAgainstForcing } from "../validation/anti-forcing-validator"
import { validateRhymesForGenre } from "../validation/rhyme-validator"
import { countPoeticSyllables } from "../validation/syllable-counter-brasileiro" // ✅ CORRIGIDO

export interface RuleValidationResult {
  valid: boolean
  score: number // 0-100
  errors: string[]
  warnings: string[]
  suggestions: string[]
  details: {
    language_check: boolean
    syllable_check: boolean
    rhyme_check: boolean
    anti_forcing_check: boolean
    genre_check: boolean
  }
}

export async function validateWithAllRules(
  lyrics: string,
  genre: string,
  additionalRequirements?: string,
): Promise<RuleValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []

  const details = {
    language_check: true,
    syllable_check: true,
    rhyme_check: true,
    anti_forcing_check: true,
    genre_check: true,
  }

  // 1. Validar Anti-Forçação
  const forcingResult = validateFullLyricAgainstForcing(lyrics, genre)
  if (!forcingResult.valid) {
    details.anti_forcing_check = false
    if (forcingResult.forcedWords.length > 0) {
      errors.push(`Palavras forçadas detectadas: ${forcingResult.forcedWords.join(", ")}`)
    }
  }

  // 2. Validar Rimas
  const rhymeResult = validateRhymesForGenre(lyrics, genre)
  const rhymeRules = getRhymeRulesForGenre(genre)

  const totalRhymes = rhymeResult.analysis.quality.length
  const richRhymes = rhymeResult.analysis.quality.filter((q) => q.type === "rica").length
  const falseRhymes = rhymeResult.analysis.quality.filter((q) => q.type === "falsa" && q.score === 0).length

  const richRhymePercentage = totalRhymes > 0 ? richRhymes / totalRhymes : 0
  const falseRhymePercentage = totalRhymes > 0 ? falseRhymes / totalRhymes : 0

  if (richRhymePercentage < rhymeRules.min_rich_rhymes) {
    details.rhyme_check = false
    errors.push(
      `Rimas ricas insuficientes: ${(richRhymePercentage * 100).toFixed(0)}% ` +
        `(mínimo ${(rhymeRules.min_rich_rhymes * 100).toFixed(0)}%)`,
    )
  }

  if (falseRhymePercentage > rhymeRules.max_false_rhymes) {
    details.rhyme_check = false
    errors.push(
      `Rimas falsas em excesso: ${(falseRhymePercentage * 100).toFixed(0)}% ` +
        `(máximo ${(rhymeRules.max_false_rhymes * 100).toFixed(0)}%)`,
    )
  }

  // 3. Validar Sílabas - USANDO O CONTADOR CORRETO
  const lines = lyrics.split("\n").filter((line) => line.trim() && !line.startsWith("["))
  lines.forEach((line, index) => {
    const syllables = countPoeticSyllables(line) // ✅ AGORA CORRETO
    if (syllables > UNIVERSAL_RULES.syllables.max_syllables) {
      details.syllable_check = false
      errors.push(`Linha ${index + 1}: ${syllables} sílabas (máximo ${UNIVERSAL_RULES.syllables.max_syllables})`)
    }
  })

  // 4. Validar Linguagem (palavras proibidas do gênero)
  const genreConfig = getGenreConfig(genre)
  const lyricsLower = lyrics.toLowerCase()

  if (genreConfig.language_rules.forbidden) {
    Object.entries(genreConfig.language_rules.forbidden).forEach(([category, words]) => {
      (words as string[]).forEach((word: string) => {
        if (lyricsLower.includes(word.toLowerCase())) {
          details.language_check = false
          warnings.push(`Palavra proibida (${category}): "${word}"`)
        }
      })
    })
  }

  // Calcular score
  const checksPassedCount = Object.values(details).filter(Boolean).length
  const score = (checksPassedCount / 5) * 100

  return {
    valid: errors.length === 0,
    score,
    errors,
    warnings,
    suggestions,
    details,
  }
}

// REMOVIDO: function countSyllables() - não é mais necessário

export { buildUniversalRulesPrompt, getRhymeRulesForGenre, UNIVERSAL_RULES }
