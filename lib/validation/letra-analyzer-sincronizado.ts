import { countPoeticSyllables } from "./syllable-counter"

/**
 * Analisador de Letras Sincronizado com o Contador do Aplicativo
 *
 * Usa EXATAMENTE o mesmo método countPoeticSyllables do aplicativo
 * para garantir que não haja falsos positivos na validação.
 */

export interface VerseAnalysis {
  line: string
  syllables: number
  isValid: boolean
  lineNumber: number
}

export interface LyricAnalysisResult {
  totalVerses: number
  correctVerses: number
  incorrectVerses: number
  accuracy: number
  violations: VerseAnalysis[]
  summary: string
}

/**
 * Analisa letra completa usando o contador oficial do aplicativo
 */
export function analyzeLyricWithOfficialCounter(lyrics: string, maxSyllables = 11): LyricAnalysisResult {
  const lines = lyrics.split("\n")
  const violations: VerseAnalysis[] = []
  let totalVerses = 0
  let correctVerses = 0

  lines.forEach((line, index) => {
    const trimmedLine = line.trim()

    // Ignora linhas vazias, tags, instruções e comentários
    if (
      !trimmedLine ||
      trimmedLine.startsWith("[") ||
      trimmedLine.startsWith("(") ||
      trimmedLine.startsWith("Title:") ||
      trimmedLine.startsWith("Instrumentos:") ||
      trimmedLine.startsWith("Instruments:")
    ) {
      return
    }

    // Conta sílabas usando o contador oficial
    const syllables = countPoeticSyllables(trimmedLine)
    const isValid = syllables <= maxSyllables

    totalVerses++

    if (isValid) {
      correctVerses++
    } else {
      violations.push({
        line: trimmedLine,
        syllables,
        isValid: false,
        lineNumber: index + 1,
      })
    }
  })

  const incorrectVerses = totalVerses - correctVerses
  const accuracy = totalVerses > 0 ? (correctVerses / totalVerses) * 100 : 0

  // Gera resumo detalhado
  const summary = generateDetailedSummary(totalVerses, correctVerses, incorrectVerses, accuracy, violations)

  return {
    totalVerses,
    correctVerses,
    incorrectVerses,
    accuracy,
    violations,
    summary,
  }
}

/**
 * Gera resumo detalhado da análise
 */
function generateDetailedSummary(
  total: number,
  correct: number,
  incorrect: number,
  accuracy: number,
  violations: VerseAnalysis[],
): string {
  let summary = `\n📊 ANÁLISE COMPLETA (Contador Oficial do Aplicativo)\n`
  summary += `═══════════════════════════════════════════════════\n\n`

  summary += `✅ Versos corretos: ${correct}/${total} (${accuracy.toFixed(2)}%)\n`
  summary += `❌ Versos incorretos: ${incorrect}/${total} (${(100 - accuracy).toFixed(2)}%)\n\n`

  if (violations.length > 0) {
    summary += `🔍 VERSOS COM MAIS DE 11 SÍLABAS:\n`
    summary += `─────────────────────────────────────────────────\n\n`

    violations.forEach((v, i) => {
      summary += `${i + 1}. Linha ${v.lineNumber}: ${v.syllables} sílabas\n`
      summary += `   "${v.line}"\n\n`
    })
  }

  if (accuracy === 100) {
    summary += `🎉 PERFEITO! Todos os versos têm máximo 11 sílabas!\n`
  } else if (accuracy >= 80) {
    summary += `⚠️ BOM! Mas ainda precisa corrigir ${incorrect} verso(s).\n`
  } else if (accuracy >= 60) {
    summary += `⚠️ REGULAR. Precisa melhorar ${incorrect} verso(s).\n`
  } else {
    summary += `❌ CRÍTICO! Muitos versos precisam de correção.\n`
  }

  return summary
}

/**
 * Valida se uma linha específica está correta
 */
export function validateLineWithOfficialCounter(
  line: string,
  maxSyllables = 11,
): { isValid: boolean; syllables: number } {
  const syllables = countPoeticSyllables(line)
  return {
    isValid: syllables <= maxSyllables,
    syllables,
  }
}
