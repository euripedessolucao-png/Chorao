// components/index.ts

/**
 * BARREL EXPORT - COMPONENTES E UTILITÁRIOS
 * 
 * Exporta todos os componentes e utilitários principais para importação simplificada
 * Use: import { HookGenerator, InspirationManager, validateLyricsSyllables } from '@/components'
 */

// Componentes principais
export { HookGenerator } from './hook-generator'
export { InspirationManager } from './inspiration-manager'

// Validadores de sílabas
export { 
  countPoeticSyllables, 
  countPortugueseSyllables,
  validateSyllableLimit,
  validateLyricsSyllables,
  type SyllableValidationResult
} from '../lib/validation/syllable-counter-brasileiro'

// Enforçador de sílabas
export { SyllableEnforcer } from '../lib/validation/syllableEnforcer'

// Validadores de integridade
export { validateVerseIntegrity } from '../lib/validation/verse-integrity-validator'
export { validateSertanejoModerno } from '../lib/validation/sertanejo-moderno-validator'

// Validadores de narrativa
export {
  validateNarrativeFlow,
  validateVerseContribution,
  type NarrativeValidationResult
} from '../lib/validation/narrative-validator'

// Validadores de rimas
export { 
  analyzeRhyme, 
  analyzeLyricsRhymeScheme, 
  validateRhymesForGenre 
} from '../lib/validation/rhyme-validator'

export { 
  enhanceLyricsRhymes, 
  generateRhymeReport, 
  quickRhymeCheck, 
  suggestRhymingWords 
} from '../lib/validation/rhyme-enhancer'

// Validadores de estrutura
export { validateSertanejoLyrics } from '../lib/validation/validateLyrics'
export { validateChorus } from '../lib/validation/validateChorus'

// Validador Multi-Camadas
export {
  validateAllLayers,
  validateSingleVerse,
  type MultiLayerValidationResult,
  type LayerResult
} from '../lib/validation/multi-layer-validator'

// Utilitários de validação
export { 
  isChorusLine,
  isVerseLine, 
  isBridgeLine,
  shouldSkipValidation 
} from '../lib/validation/validation-utils'
