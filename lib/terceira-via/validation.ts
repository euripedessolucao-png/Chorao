// lib/terceira-via/validation.ts

import { countPoeticSyllables } from "../validation/syllable-counter-brasileiro"
import type { GenreConfig } from "../terceira-via"

/**
 * Valida se a linha melhorada é realmente uma melhoria válida
 *
 * Critérios de validação:
 * - Não pode estar vazia
 * - Deve ser diferente da original
 * - Deve respeitar as restrições de sílabas do gênero
 * - Deve ter comprimento razoável
 */
export function isValidImprovement(originalLine: string, improvedLine: string, genreConfig: GenreConfig): boolean {
  // 1. Validação básica: não pode estar vazia
  if (!improvedLine || !improvedLine.trim()) {
    return false
  }

  const trimmedOriginal = originalLine.trim()
  const trimmedImproved = improvedLine.trim()

  // 2. Deve ser diferente da original
  if (trimmedOriginal === trimmedImproved) {
    return false
  }

  // 3. Não pode ser muito curta (mínimo 3 caracteres)
  if (trimmedImproved.length < 3) {
    return false
  }

  // 4. Validação de sílabas (se configurado)
  if (genreConfig.syllableRange) {
    const syllableCount = countPoeticSyllables(trimmedImproved)
    const { min, max } = genreConfig.syllableRange

    // Permite uma margem de 1 sílaba para flexibilidade
    if (syllableCount < min - 1 || syllableCount > max + 1) {
      console.log(`[Validation] ⚠️ Linha fora da faixa de sílabas: ${syllableCount} (esperado: ${min}-${max})`)
      return false
    }
  }

  // 5. Não pode ser excessivamente longa (máximo 200 caracteres)
  if (trimmedImproved.length > 200) {
    return false
  }

  // 6. Não pode conter apenas pontuação ou caracteres especiais
  const hasLetters = /[a-záàâãéèêíïóôõöúçñ]/i.test(trimmedImproved)
  if (!hasLetters) {
    return false
  }

  return true
}
