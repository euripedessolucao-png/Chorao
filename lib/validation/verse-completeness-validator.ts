/**
 * Validador de Completude de Versos
 * Garante que versos não sejam cortados ou incompletos
 */

interface VerseCompletenessResult {
  valid: boolean
  incompleteVerses: Array<{
    line: string
    lineNumber: number
    reason: string
  }>
  warnings: string[]
  score: number
}

/**
 * Valida se os versos estão completos e não cortados
 */
export function validateVerseCompleteness(lyrics: string): VerseCompletenessResult {
  const lines = lyrics.split("\n")
  const incompleteVerses: Array<{ line: string; lineNumber: number; reason: string }> = []
  const warnings: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const lineNumber = i + 1

    // Ignora linhas vazias, tags de seção e instrumentação
    if (!line || line.startsWith("[") || line.startsWith("(")) {
      continue
    }

    // Remove tags inline para análise
    const cleanLine = line.replace(/\[.*?\]/g, "").trim()
    if (!cleanLine) continue

    // Verifica se o verso termina abruptamente (sem pontuação ou palavra completa)
    if (cleanLine.endsWith("-") || cleanLine.endsWith(",")) {
      incompleteVerses.push({
        line: cleanLine,
        lineNumber,
        reason: "Verso parece incompleto (termina com hífen ou vírgula)",
      })
    }

    // Verifica se o verso é muito curto (menos de 3 palavras pode indicar corte)
    const words = cleanLine.split(/\s+/).filter((w) => w.length > 0)
    if (words.length < 3 && !cleanLine.match(/^(Ah|Oh|Ei|Hey|Yeah|Uh|Hum)$/i)) {
      warnings.push(`Linha ${lineNumber}: Verso muito curto (${words.length} palavras) - "${cleanLine}"`)
    }

    // Verifica se há palavras cortadas (terminam com hífen sem espaço)
    if (cleanLine.match(/\w+-$/)) {
      incompleteVerses.push({
        line: cleanLine,
        lineNumber,
        reason: "Palavra cortada no final do verso",
      })
    }

    // Verifica se há elipses que podem indicar corte
    if (cleanLine.endsWith("...") && i < lines.length - 1) {
      const nextLine = lines[i + 1].trim()
      if (nextLine && !nextLine.startsWith("[") && !nextLine.startsWith("(")) {
        warnings.push(`Linha ${lineNumber}: Elipse pode indicar continuação - "${cleanLine}"`)
      }
    }
  }

  const score = incompleteVerses.length === 0 ? 100 : Math.max(0, 100 - incompleteVerses.length * 20)

  return {
    valid: incompleteVerses.length === 0,
    incompleteVerses,
    warnings,
    score,
  }
}

/**
 * Corrige versos incompletos automaticamente
 */
export function fixIncompleteVerses(lyrics: string): { fixed: string; changes: string[] } {
  const lines = lyrics.split("\n")
  const changes: string[] = []
  const fixedLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Mantém linhas vazias, tags e instrumentação
    if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(")) {
      fixedLines.push(line)
      continue
    }

    let fixed = line

    // Remove hífens finais
    if (trimmed.endsWith("-")) {
      fixed = trimmed.slice(0, -1).trim()
      changes.push(`Linha ${i + 1}: Removido hífen final`)
    }

    // Remove vírgulas finais desnecessárias
    if (trimmed.endsWith(",") && i === lines.length - 1) {
      fixed = trimmed.slice(0, -1).trim()
      changes.push(`Linha ${i + 1}: Removida vírgula final`)
    }

    fixedLines.push(fixed)
  }

  return {
    fixed: fixedLines.join("\n"),
    changes,
  }
}
