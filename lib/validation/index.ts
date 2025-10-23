// components/index.ts

/**
 * BARREL EXPORT - COMPONENTES E UTILITÁRIOS
 *
 * Exporta todos os componentes e utilitários principais para importação simplificada
 * Use: import { HookGenerator, InspirationManager, validateLyricsSyllables } from '@/components'
 */

// Componentes principais
export { HookGenerator } from "./hook-generator"
export { InspirationManager } from "./inspiration-manager"

// ========== VALIDAÇÃO DE SÍLABAS ==========
export {
  countPoeticSyllables, // Contagem até última sílaba tônica
  countPortugueseSyllables, // Contagem gramatical completa
  validateSyllableLimit, // Valida limite por verso
  validateLyricsSyllables, // Valida sílabas da letra inteira
  hasEnjambement, // Detecta enjambement
  validateVerseWithEnjambement, // Valida verso com continuação
  type SyllableValidationResult,
} from "../lib/validation/syllable-counter-brasileiro"

export { SyllableEnforcer } from "../lib/validation/syllableEnforcer"

// ========== VALIDAÇÃO DE NARRATIVA ==========
export {
  validateNarrativeFlow, // Começo, meio e fim
  validateVerseContribution, // Cada verso contribui
  type NarrativeValidationResult,
} from "../lib/validation/narrative-validator"

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
// Funções anti-forcing não implementadas ainda

// ========== VALIDAÇÃO DE ESTRUTURA ==========
export { validateSertanejoLyrics } from "./validateLyrics"

// Validadores de integridade
export { validateVerseIntegrity } from "../lib/validation/verse-integrity-validator"
export { validateSertanejoModerno } from "../lib/validation/sertanejo-moderno-validator"

// Validadores de estrutura
export { validateChorus } from "../lib/validation/validateChorus"

// Validador Multi-Camadas
export {
  validateAllLayers,
  validateSingleVerse,
  type MultiLayerValidationResult,
  type LayerResult,
} from "../lib/validation/multi-layer-validator"

// Utilitários de validação
export {
  isChorusLine,
  isVerseLine,
  isBridgeLine,
  shouldSkipValidation,
} from "../lib/validation/validation-utils"
