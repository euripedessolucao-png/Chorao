/**
 * VALIDADOR DE INTEGRIDADE DE VERSOS
 *
 * Detecta problemas além da contagem de sílabas:
 * - Versos incompletos (sem verbo, muito curtos)
 * - Versos quebrados (aspas abertas, vírgulas soltas)
 * - Versos com mais de 11 sílabas (LIMITE ABSOLUTO)
 */

import { countPoeticSyllables } from "./syllable-counter-brasileiro"

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

const ABSOLUTE_MAX_SYLLABLES = 11

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

  // Versos como "Vou medo, sem falha!" ou "Você decote um charme"
  const hasInvalidStructure = /\b(vou|vai|você|ele|ela)\s+(sem|com|de|da|do)\s+\w+\b/i.test(trimmed)
  if (hasInvalidStructure && !hasValidVerb(trimmed)) {
    issues.push("Estrutura gramatical inválida (falta verbo principal)")
  }

  // "Vou um dia calou..." ou "Mas um desastre alarde!"
  const hasIncompletePhrase = /\b(vou|vai|mas|e|ou)\s+\w+\s+(calou|alarde|decote)\b/i.test(trimmed)
  if (hasIncompletePhrase) {
    issues.push("Frase incompleta ou sem sentido")
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

  if (!hasValidVerb(trimmed) && words.length >= 3) {
    issues.push("Sem verbo identificável ou verbo mal conjugado")
  }

  return issues
}

function hasValidVerb(text: string): boolean {
  // Verbos comuns em português (presente, passado, futuro, gerúndio, infinitivo)
  const verbPatterns = [
    // Verbos ser/estar
    /\b(sou|é|são|era|eram|foi|foram|será|serão|sendo|ser|estou|está|estão|estava|estavam|esteve|estiveram|estará|estarão|estando|estar)\b/i,
    // Verbos ter/haver
    /\b(tenho|tem|têm|tinha|tinham|teve|tiveram|terá|terão|tendo|ter|há|havia|houve|haverá|havendo|haver)\b/i,
    // Verbos fazer/ir/vir
    /\b(faço|faz|fazem|fazia|faziam|fez|fizeram|fará|farão|fazendo|fazer|vou|vai|vão|ia|iam|foi|foram|irá|irão|indo|ir|venho|vem|vêm|vinha|vinham|veio|vieram|virá|virão|vindo|vir)\b/i,
    // Verbos querer/poder/dever
    /\b(quero|quer|querem|queria|queriam|quis|quiseram|quererá|quererão|querendo|querer|posso|pode|podem|podia|podiam|pôde|puderam|poderá|poderão|podendo|poder|devo|deve|devem|devia|deviam|deveu|deveram|deverá|deverão|devendo|dever)\b/i,
    // Verbos regulares -ar
    /\b\w+(ando|ar|ava|avam|ou|aram|ará|arão|aria|ariam)\b/i,
    // Verbos regulares -er
    /\b\w+(endo|er|ia|iam|eu|eram|erá|erão|eria|eriam)\b/i,
    // Verbos regulares -ir
    /\b\w+(indo|ir|ia|iam|iu|iram|irá|irão|iria|iriam)\b/i,
  ]

  return verbPatterns.some((pattern) => pattern.test(text))
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

    // ERRO CRÍTICO: Mais de 11 sílabas
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
