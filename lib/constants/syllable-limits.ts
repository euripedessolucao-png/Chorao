/**
 * LIMITES DE SÍLABAS - CONFIGURAÇÃO CENTRAL
 *
 * Este arquivo centraliza TODOS os limites de sílabas do sistema.
 * Baseado na redondilha maior (7 sílabas) da música brasileira.
 *
 * IMPORTANTE: Qualquer mudança aqui afeta TODO o sistema.
 */

export const SYLLABLE_LIMITS = {
  // Limite absoluto para TODOS os gêneros
  ABSOLUTE_MIN: 7,
  ABSOLUTE_MAX: 11,
  IDEAL: 10,

  // Limites por gênero (podem ser mais restritivos, nunca mais permissivos)
  SERTANEJO: {
    min: 7,
    max: 11,
    ideal: 10,
  },
  BACHATA: {
    min: 7,
    max: 11,
    ideal: 10,
  },
  FORRO: {
    min: 7,
    max: 11,
    ideal: 9,
  },
  FUNK: {
    min: 6,
    max: 10,
    ideal: 8,
  },
  SAMBA: {
    min: 7,
    max: 11,
    ideal: 10,
  },
  MPB: {
    min: 7,
    max: 11,
    ideal: 10,
  },
  ROCK: {
    min: 7,
    max: 11,
    ideal: 9,
  },
  POP: {
    min: 7,
    max: 11,
    ideal: 10,
  },
  GOSPEL: {
    min: 7,
    max: 11,
    ideal: 10,
  },
} as const

/**
 * Retorna os limites de sílabas para um gênero específico
 */
export function getSyllableLimits(genre?: string) {
  if (!genre) {
    return {
      min: SYLLABLE_LIMITS.ABSOLUTE_MIN,
      max: SYLLABLE_LIMITS.ABSOLUTE_MAX,
      ideal: SYLLABLE_LIMITS.IDEAL,
    }
  }

  const genreKey = genre
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[^A-Z_]/g, "")
  const limits = SYLLABLE_LIMITS[genreKey as keyof typeof SYLLABLE_LIMITS]

  if (limits && typeof limits === "object") {
    return limits
  }

  return {
    min: SYLLABLE_LIMITS.ABSOLUTE_MIN,
    max: SYLLABLE_LIMITS.ABSOLUTE_MAX,
    ideal: SYLLABLE_LIMITS.IDEAL,
  }
}
