// lib/validation/anti-forcing-validator.ts

/**
 * VALIDADOR ANTI-FORÇAÇÃO
 *
 * Previne uso forçado de palavras-chave sem contexto natural
 */

export interface AntiForcingRule {
  keyword: string
  context: string[]
  minDistance: number
}

/**
 * Valida uma linha específica contra forçação de palavras-chave
 */
export function validateAgainstForcing(line: string, genre: string): { valid: boolean; issues: string[] } {
  // Stub: sempre retorna válido por enquanto
  return {
    valid: true,
    issues: [],
  }
}

/**
 * Valida letra completa contra forçação de palavras-chave
 */
export function validateFullLyricAgainstForcing(
  lyrics: string,
  genre: string,
): { valid: boolean; forcedWords: string[]; suggestions: string[] } {
  // Stub: sempre retorna válido por enquanto
  return {
    valid: true,
    forcedWords: [],
    suggestions: [],
  }
}

/**
 * Retorna regras anti-forçação específicas por gênero
 */
export function getAntiForcingRulesForGenre(genre: string): AntiForcingRule[] {
  // Stub: retorna array vazio por enquanto
  return []
}
