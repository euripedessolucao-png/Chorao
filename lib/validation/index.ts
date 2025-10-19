/**
 * VALIDADORES - BARREL EXPORT
 *
 * Centraliza todos os exports de validação para simplificar imports.
 * Use: import { validateVerseIntegrity, SyllableEnforcer } from '@/lib/validation'
 */

// Contadores e validadores de sílabas
export { countPoeticSyllables, countPortugueseSyllables } from "./syllable-counter"
export { SyllableEnforcer } from "./syllableEnforcer"

// Validadores de integridade
export { validateVerseIntegrity } from "./verse-integrity-validator"
export { validateSertanejoModerno } from "./sertanejo-moderno-validator"

// Validadores de rimas
export { analyzeRhyme, analyzeLyricsRhymeScheme, validateRhymesForGenre } from "./rhyme-validator"
export { enhanceRhymes } from "./rhyme-enhancer"

// Validadores de estrutura
export { validateLyrics } from "./validateLyrics"
export { validateChorus } from "./validateChorus"

// Regras específicas
export { UNIVERSAL_RHYME_RULES } from "./universal-rhyme-rules"
