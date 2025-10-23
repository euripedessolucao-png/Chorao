/**
 * VALIDADORES - BARREL EXPORT
 *
 * Centraliza todos os exports de validação para simplificar imports.
 * Use: import { validateVerseIntegrity, SyllableEnforcer } from '@/lib/validation'
 */

// Contadores e validadores de sílabas
export { 
  countPoeticSyllables, 
  countPortugueseSyllables, 
  validateLyricsSyllables,
  validateSyllableLimit 
} from "./syllable-counter"

export { SyllableEnforcer } from "./syllableEnforcer"

// Validadores de integridade
export { validateVerseIntegrity } from "./verse-integrity-validator"
export { validateSertanejoModerno } from "./sertanejo-moderno-validator"

// Validadores de rimas
export { 
  analyzeRhyme, 
  analyzeLyricsRhymeScheme, 
  validateRhymesForGenre 
} from "./rhyme-validator"

export { 
  enhanceLyricsRhymes, 
  generateRhymeReport, 
  quickRhymeCheck, 
  suggestRhymingWords 
} from "./rhyme-enhancer"

// Validadores de estrutura
export { validateSertanejoLyrics } from "./validateLyrics"
export { validateChorus } from "./validateChorus"

// Regras específicas
export type { UniversalRhymeRules } from "./universal-rhyme-rules"
export { getUniversalRhymeRules } from "./universal-rhyme-rules"

// Tipos comuns
export type { SyllableValidationResult } from "./syllable-counter"
export type { VerseValidationResult } from "./verse-integrity-validator"
export type { SertanejoValidationResult } from "./sertanejo-moderno-validator"
export type { RhymeAnalysis, RhymeScheme } from "./rhyme-validator"
export type { RhymeEnhancementResult } from "./rhyme-enhancer"

// Utilitários de validação
export { 
  isChorusLine,
  isVerseLine, 
  isBridgeLine,
  shouldSkipValidation 
} from "./validation-utils"
