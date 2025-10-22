/**
 * VALIDADORES - BARREL EXPORT
 *
 * Centraliza todos os exports de validação para simplificar imports.
 * Use: import { validateVerseIntegrity, SyllableEnforcer } from '@/lib/validation'
 */

// Contadores e validadores de sílabas
export { countPoeticSyllables, countPortugueseSyllables } from "./syllable-counter"
export { SyllableEnforcer } from "./syllableEnforcer"
export { Syllable-counter } from "./app/api/validation/syllable-counter"


// Validadores de integridade
export { validateVerseIntegrity } from "./verse-integrity-validator"
export { validateSertanejoModerno } from "./sertanejo-moderno-validator"

// Validadores de rimas
export { analyzeRhyme, analyzeLyricsRhymeScheme, validateRhymesForGenre } from "./rhyme-validator"
export { enhanceLyricsRhymes, generateRhymeReport, quickRhymeCheck, suggestRhymingWords } from "./rhyme-enhancer"

// Validadores de estrutura
export { validateSertanejoLyrics } from "./validateLyrics"
export { validateChorus } from "./validateChorus"

// Regras específicas
export type { UniversalRhymeRules } from "./universal-rhyme-rules"
export { getUniversalRhymeRules } from "./universal-rhyme-rules"
