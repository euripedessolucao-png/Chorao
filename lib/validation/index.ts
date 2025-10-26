// lib/validation/index.ts

/**
 * BARREL EXPORT - VALIDAÇÃO
 *
 * Exporta todos os validadores e utilitários de validação
 */

// ========== VALIDAÇÃO DE SÍLABAS ==========
export {
  countPoeticSyllables, // Contagem fonética musical (recomendada)
  countPortugueseSyllables, // Alias para compatibilidade
  validateLyricsSyllables, // Valida toda a letra com limite de sílabas (8–12 por padrão)
  type SyllableValidationResult,
} from "./syllable-counter-brasileiro"

// NOTA: validateSyllableLimit foi removido — use validateLyricsSyllables com parâmetros

// ========== VALIDAÇÃO DE NARRATIVA ==========
export {
  validateNarrativeFlow, // Começo, meio e fim
  validateVerseContribution, // Cada verso contribui
  type NarrativeValidationResult,
} from "./narrative-validator"

// ========== VALIDAÇÃO DE RIMAS ==========
export {
  analyzeRhyme, // Análise detalhada de rimas
  analyzeLyricsRhymeScheme, // Esquema de rimas da letra
  validateRhymesForGenre, // Valida rimas por gênero
} from "./rhyme-validator"

export {
  enhanceLyricsRhymes, // Melhora qualidade das rimas
  generateRhymeReport, // Relatório completo
  quickRhymeCheck, // Verificação rápida
  suggestRhymingWords, // Sugestões de palavras que rimam
  type RhymeEnhancementResult,
} from "./rhyme-enhancer"

// ========== VALIDAÇÃO DE ESTRUTURA ==========
export { validateSertanejoLyrics } from "./validateLyrics"

// Validadores de integridade
export { validateVerseIntegrity } from "./verse-integrity-validator"
export { validateSertanejoModerno } from "./sertanejo-moderno-validator"

// Validadores de estrutura
export { validateChorus } from "./validateChorus"

// Validador Multi-Camadas
export {
  validateAllLayers,
  validateSingleVerse,
  type MultiLayerValidationResult,
  type LayerResult,
} from "./multi-layer-validator"

// Utilitários de validação
export {
  isChorusLine,
  isVerseLine,
  isBridgeLine,
  shouldSkipValidation,
} from "./validation-utils"
