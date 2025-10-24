/**
 * Utilitários para validação de letras
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

export function isVerseLine(line: string): boolean {
  const trimmed = line.trim().toLowerCase()
  return (
    trimmed.startsWith("[verse") ||
    trimmed.startsWith("[verso") ||
    trimmed.startsWith("verse:") ||
    trimmed.startsWith("verso:")
  )
}

export function isBridgeLine(line: string): boolean {
  const trimmed = line.trim().toLowerCase()
  return (
    trimmed.startsWith("[bridge") ||
    trimmed.startsWith("[ponte") ||
    trimmed.startsWith("bridge:") ||
    trimmed.startsWith("ponte:")
  )
}

export function shouldSkipValidation(line: string): boolean {
  const trimmed = line.trim()

  // Pula linhas vazias
  if (!trimmed) return true

  // Pula marcadores de seção
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) return true

  // Pula instruções
  if (trimmed.startsWith("(") && trimmed.endsWith(")")) return true

  // Pula metadados
  if (
    trimmed.startsWith("Title:") ||
    trimmed.startsWith("Instrumentos:") ||
    trimmed.startsWith("BPM:") ||
    trimmed.startsWith("Key:")
  )
    return true

  return false
}
