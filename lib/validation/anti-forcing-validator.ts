// lib/validation/index.ts

/**
 * SISTEMA DE VALIDAÇÃO PARA COMPOSIÇÃO BRASILEIRA
 *
 * Validações completas para música brasileira:
 * - Sílabas poéticas (até última tônica)
 * - Narrativa fluída
 * - Rimas por gênero
 * - Anti-forçação de palavras
 * - Estrutura musical
 * - Gramática portuguesa
 */

// ========== VALIDAÇÃO DE SÍLABAS ==========
export {
  countPoeticSyllables, // Contagem até última sílaba tônica
  countPortugueseSyllables, // Contagem gramatical completa
  validateSyllableLimit, // Valida limite por verso
  validateLyricsSyllables, // Valida sílabas da letra inteira
  hasEnjambement, // Detecta enjambement
  validateVerseWithEnjambement, // Valida verso com continuação
  type SyllableValidationResult,
} from "./syllable-counter-brasileiro"

export { SyllableEnforcer } from "./syllableEnforcer"

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

// ========== VALIDAÇÃO ANTI-FORÇAÇÃO ==========
export {
  validateAgainstForcing, // Valida linha específica
  validateFullLyricAgainstForcing, // Valida letra completa
  getAntiForcingRulesForGenre, // Regras por gênero
  type AntiForcingRule,
} from "./anti-forcing-validator"

// ========== VALIDAÇÃO DE ESTRUTURA ==========
export { validateSertanejoLyrics } from "./validateLyrics"
export { validateChorus } from "./validateChorus"
export { validateVerseIntegrity } from "./verse-integrity-validator"
export { validateSertanejoModerno } from "./sertanejo-moderno-validator"

// ========== VALIDAÇÃO MULTI-CAMADAS ==========
export {
  validateAllLayers, // Validação completa em 6 camadas
  validateSingleVerse, // Validação por verso
  type MultiLayerValidationResult,
  type LayerResult,
} from "./multi-layer-validator"

// ========== REGRAS ESPECÍFICAS POR GÊNERO ==========
export type { UniversalRhymeRules } from "./universal-rhyme-rules"
export { getUniversalRhymeRules } from "./universal-rhyme-rules"

// ========== TIPOS COMUNS ==========
export type {
  VerseValidationResult,
  SertanejoValidationResult,
} from "./sertanejo-moderno-validator"

// ========== UTILITÁRIOS ==========
export {
  isChorusLine, // Detecta linha de coro
  isVerseLine, // Detecta linha de verso
  isBridgeLine, // Detecta linha de ponte
  shouldSkipValidation, // Linhas que pulam validação
} from "./validation-utils"
