/**
 * VALIDADOR DE INTEGRIDADE DE VERSOS
 *
 * Detecta problemas além da contagem de sílabas:
 * - Versos incompletos (sem verbo, muito curtos)
 * - Versos quebrados (aspas abertas, vírgulas soltas)
 * - Versos com mais de 12 sílabas (LIMITE ABSOLUTO)
 */

import { countPoeticSyllables } from "./syllable-counter"

export interface VerseIssue {
  line: number
  text: string
  issues: string[]
  syllables: number
  severity: "error" | "warning"
}

export interface VerseValidationResult {
  valid: boolean
  issues: VerseIssue[]
  totalVerses: number
  brokenVerses: number
  longVerses: number
}

const ABSOLUTE_MAX_SYLLABLES = 12

/**
 * Detecta se um verso está incompleto ou quebrado
 */
function detectBrokenVerse(text: string): string[] {
  const issues: string[] = []
  const trimmed = text.trim()

  // Verso muito curto (menos de 3 palavras)
  const words = trimmed.split(/\s+/).filter((w) => w.length > 0)
  if (words.length < 3) {
    issues.push("Verso muito curto (menos de 3 palavras)")
  }

  // Aspas abertas sem fechar
  const openQuotes = (trimmed.match(/"/g) || []).length
  if (openQuotes % 2 !== 0) {
    issues.push("Aspas não fechadas")
  }

  // Vírgula no final sem continuação
  if (trimmed.endsWith(",")) {
    issues.push("Vírgula no final sugere verso incompleto")
  }

  // Começa com letra minúscula (pode indicar continuação de verso anterior)
  if (trimmed.length > 0 && trimmed[0] === trimmed[0].toLowerCase() && !/^[0-9]/.test(trimmed)) {
    issues.push("Começa com minúscula (possível continuação)")
  }

  // Termina com preposição ou artigo (verso incompleto)
  const lastWord = words[words.length - 1]?.toLowerCase()
  const incompletEndings = [
    "de",
    "da",
    "do",
    "das",
    "dos",
    "em",
    "na",
    "no",
    "nas",
    "nos",
    "a",
    "o",
    "as",
    "os",
    "um",
    "uma",
    "uns",
    "umas",
    "para",
    "por",
    "com",
    "sem",
  ]
  if (lastWord && incompletEndings.includes(lastWord)) {
    issues.push(`Termina com "${lastWord}" (verso incompleto)`)
  }

  // Falta verbo (verso sem ação)
  const hasVerb =
    /\b(é|são|foi|eram|está|estão|tem|têm|faz|fazem|vai|vão|vem|vêm|quer|querem|pode|podem|deve|devem|sou|somos|era|fosse|seja|sejam|tenho|temos|faço|fazemos|vou|vamos|venho|vimos|quero|queremos|posso|podemos|devo|devemos|ando|amos|indo|imos|endo|emos|ar|er|ir|ou|am|aram|ava|avam|ia|iam)\b/i.test(
      trimmed,
    )
  if (!hasVerb && words.length >= 3) {
    issues.push("Sem verbo identificável")
  }

  return issues
}

/**
 * Valida integridade de todos os versos da letra
 */
export function validateVerseIntegrity(lyrics: string): VerseValidationResult {
  const lines = lyrics.split("\n")
  const issues: VerseIssue[] = []
  let totalVerses = 0
  let brokenVerses = 0
  let longVerses = 0

  lines.forEach((line, index) => {
    const trimmed = line.trim()

    // Ignora linhas vazias, tags e instruções
    if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(") || trimmed.includes("Instrumental")) {
      return
    }

    totalVerses++
    const syllables = countPoeticSyllables(trimmed)
    const verseIssues = detectBrokenVerse(trimmed)

    // ERRO CRÍTICO: Mais de 12 sílabas
    if (syllables > ABSOLUTE_MAX_SYLLABLES) {
      longVerses++
      issues.push({
        line: index + 1,
        text: trimmed,
        issues: [`❌ ${syllables} sílabas (máximo: ${ABSOLUTE_MAX_SYLLABLES})`],
        syllables,
        severity: "error",
      })
    }

    // AVISO: Verso quebrado/incompleto
    if (verseIssues.length > 0) {
      brokenVerses++
      issues.push({
        line: index + 1,
        text: trimmed,
        issues: verseIssues,
        syllables,
        severity: "warning",
      })
    }
  })

  return {
    valid: issues.filter((i) => i.severity === "error").length === 0,
    issues,
    totalVerses,
    brokenVerses,
    longVerses,
  }
}

/**
 * Formata relatório de validação para exibição
 */
export function formatValidationReport(result: VerseValidationResult): string {
  if (result.valid && result.brokenVerses === 0) {
    return `✅ Letra validada: ${result.totalVerses} versos OK`
  }

  let report = `⚠️ Problemas encontrados:\n\n`

  if (result.longVerses > 0) {
    report += `❌ ${result.longVerses} verso(s) com mais de ${ABSOLUTE_MAX_SYLLABLES} sílabas\n`
  }

  if (result.brokenVerses > 0) {
    report += `⚠️ ${result.brokenVerses} verso(s) incompleto(s) ou quebrado(s)\n`
  }

  report += `\nDetalhes:\n`
  result.issues.forEach((issue) => {
    report += `\nLinha ${issue.line}: "${issue.text}"\n`
    report += `  Sílabas: ${issue.syllables}\n`
    issue.issues.forEach((i) => (report += `  • ${i}\n`))
  })

  return report
}
