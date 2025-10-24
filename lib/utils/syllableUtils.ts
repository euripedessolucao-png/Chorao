// lib/utils/syllableUtils.ts (ou nome similar)

// ✅ CORRIGIDO: importa do contador PRECISO
import { 
  countPoeticSyllables, 
  countPortugueseSyllables, 
  validateLyricsSyllables 
} from "../validation/syllable-counter-brasileiro"

// Restante do arquivo permanece igual
export const countSyllables = countPoeticSyllables
export { countPoeticSyllables }
export { countPortugueseSyllables }
export { validateLyricsSyllables }

export default {
  countSyllables,
  countPoeticSyllables,
  countPortugueseSyllables,
  validateLyricsSyllables,
}
