// lib/validation/validation-utils.ts

/**
 * Utilitários para validação de letras
 * 
 * NOTA: estas funções detectam APENAS cabeçalhos de seção (ex: "[Chorus]"),
 * não classificam versos dentro de seções.
 */

/**
 * Verifica se a linha é um cabeçalho de REFRÃO
 */
export function isChorusLine(line: string): boolean {
  const trimmed = line.trim().toLowerCase()
  return (
    trimmed.startsWith("[chorus") ||
    trimmed.startsWith("[refrão") ||
    trimmed.startsWith("chorus:") ||
    trimmed.startsWith("refrão:")
  )
}

/**
 * Verifica se a linha é um cabeçalho de VERSO
 */
export function isVerseLine(line: string): boolean {
  const trimmed = line.trim().toLowerCase()
  return (
    trimmed.startsWith("[verse") ||
    trimmed.startsWith("[verso") ||
    trimmed.startsWith("verse:") ||
    trimmed.startsWith("verso:")
  )
}

/**
 * Verifica se a linha é um cabeçalho de PONTE
 */
export function isBridgeLine(line: string): boolean {
  const trimmed = line.trim().toLowerCase()
  return (
    trimmed.startsWith("[bridge") ||
    trimmed.startsWith("[ponte") ||
    trimmed.startsWith("bridge:") ||
    trimmed.startsWith("ponte:")
  )
}

/**
 * Verifica se a linha deve ser ignorada na validação métrica
 */
export function shouldSkipValidation(line: string): boolean {
  const trimmed = line.trim()

  if (!trimmed) return true

  // Cabeçalhos de seção: [Verse], [Chorus], etc.
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) return true

  // Instruções de performance: (Audience: "..."), (Performance: ...)
  if (trimmed.startsWith("(") && trimmed.endsWith(")")) return true

  // Metadados técnicos
  if (
    trimmed.startsWith("Title:") ||
    trimmed.startsWith("Instrumentos:") ||
    trimmed.startsWith("BPM:") ||
    trimmed.startsWith("Key:") ||
    trimmed.startsWith("Genre:") ||
    trimmed.startsWith("Style:")
  ) {
    return true
  }

  return false
}
