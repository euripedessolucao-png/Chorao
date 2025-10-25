/**
 * Arquivo de compatibilidade - Re-exporta funções do syllable-counter.ts
 *
 * Este arquivo existe para manter compatibilidade com código legado
 * que pode estar importando de syllableUtils.
 *
 * IMPORTANTE: Use sempre lib/validation/syllable-counter.ts diretamente
 * para novos códigos, pois ele contém o contador reformulado e preciso.
 */

import { countPoeticSyllables, countPortugueseSyllables, validateLyricsSyllables } from "../validation/syllable-counter"

/**
 * @deprecated Use countPoeticSyllables do syllable-counter.ts
 */
export const countSyllables = countPoeticSyllables

/**
 * Conta sílabas poéticas (até a última tônica)
 */
export { countPoeticSyllables }

/**
 * Conta sílabas gramaticais (todas as sílabas)
 */
export { countPortugueseSyllables }

/**
 * Valida sílabas de uma letra completa
 */
export { validateLyricsSyllables }

/**
 * Exportação default para compatibilidade
 */
export default {
  countSyllables,
  countPoeticSyllables,
  countPortugueseSyllables,
  validateLyricsSyllables,
}
