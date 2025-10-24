// lib/validation/lyrics-auditor.ts

import { countPortugueseSyllables } from "./syllable-counter"
import { PunctuationValidator } from "./punctuation-validator"

/**
 * Audita letras de música para garantir qualidade
 */
export class LyricsAuditor {
  static audit(
    lyrics: string,
    genre: string,
    theme: string,
  ): {
    isApproved: boolean
    score: number
    shouldRegenerate: boolean
    issues: Array<{ type: string; severity: string; message: string }>
    recommendations: string[]
  } {
    console.log("[LyricsAuditor] 🔍 Iniciando auditoria completa...")

    const issues: Array<{ type: string; severity: string; message: string }> = []
    const recommendations: string[] = []
    let score = 100

    // 1. Auditoria de sílabas
    const syllableIssues = this.auditSyllables(lyrics)
    if (syllableIssues.length > 0) {
      score -= syllableIssues.length * 5
      syllableIssues.forEach((issue) => {
        issues.push({
          type: "syllable",
          severity: "high",
          message: issue,
        })
      })
      recommendations.push("Ajustar versos para 7-11 sílabas")
    }

    // 2. Auditoria de pontuação
    const punctuationResult = PunctuationValidator.validate(lyrics)
    if (!punctuationResult.isValid) {
      score -= punctuationResult.errors.length * 2
      punctuationResult.errors.forEach((error) => {
        issues.push({
          type: "punctuation",
          severity: "medium",
          message: error.message,
        })
      })
      recommendations.push("Corrigir pontuação")
    }

    // 3. Auditoria de estrutura
    const structureIssues = this.auditStructure(lyrics)
    if (structureIssues.length > 0) {
      score -= structureIssues.length * 3
      structureIssues.forEach((issue) => {
        issues.push({
          type: "structure",
          severity: "medium",
          message: issue,
        })
      })
      recommendations.push("Melhorar estrutura da letra")
    }

    // 4. Auditoria de repetições
    const repetitionIssues = this.auditRepetitions(lyrics)
    if (repetitionIssues.length > 0) {
      score -= repetitionIssues.length * 2
      repetitionIssues.forEach((issue) => {
        issues.push({
          type: "repetition",
          severity: "low",
          message: issue,
        })
      })
      recommendations.push("Reduzir repetições excessivas")
    }

    // 5. Auditoria de coerência temática
    const themeScore = this.auditTheme(lyrics, theme)
    if (themeScore < 70) {
      score -= (100 - themeScore) * 0.3
      issues.push({
        type: "theme",
        severity: "medium",
        message: `Coerência temática baixa: ${themeScore}/100`,
      })
      recommendations.push("Fortalecer conexão com o tema")
    }

    const finalScore = Math.max(0, Math.min(100, score))
    const isApproved = finalScore >= 70
    const shouldRegenerate = finalScore < 50

    console.log(`[LyricsAuditor] 📊 Score final: ${finalScore.toFixed(1)}/100`)
    console.log(`[LyricsAuditor] ${isApproved ? "✅ APROVADA" : "❌ REPROVADA"}`)

    return {
      isApproved,
      score: finalScore,
      shouldRegenerate,
      issues,
      recommendations,
    }
  }

  private static auditSyllables(lyrics: string): string[] {
    const issues: string[] = []
    const lines = lyrics.split("\n")

    lines.forEach((line, index) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(")) {
        return
      }

      const syllables = countPortugueseSyllables(trimmed)
      if (syllables < 7) {
        issues.push(`Linha ${index + 1}: muito curta (${syllables} sílabas)`)
      } else if (syllables > 11) {
        issues.push(`Linha ${index + 1}: muito longa (${syllables} sílabas)`)
      }
    })

    return issues
  }

  private static auditStructure(lyrics: string): string[] {
    const issues: string[] = []

    const hasVerso = /\[Verso/i.test(lyrics)
    const hasRefrao = /\[Refrão\]|\[Chorus\]/i.test(lyrics)

    if (!hasVerso) {
      issues.push("Falta marcação de versos")
    }
    if (!hasRefrao) {
      issues.push("Falta marcação de refrão")
    }

    const lines = lyrics.split("\n").filter((l) => l.trim())
    if (lines.length < 8) {
      issues.push("Letra muito curta")
    }

    return issues
  }

  private static auditRepetitions(lyrics: string): string[] {
    const issues: string[] = []
    const lines = lyrics
      .split("\n")
      .filter((l) => l.trim() && !l.startsWith("[") && !l.startsWith("("))
      .map((l) => l.trim().toLowerCase())

    const lineCount = new Map<string, number>()
    lines.forEach((line) => {
      lineCount.set(line, (lineCount.get(line) || 0) + 1)
    })

    lineCount.forEach((count, line) => {
      if (count > 4 && line.length > 10) {
        issues.push(`Linha repetida ${count} vezes: "${line.substring(0, 30)}..."`)
      }
    })

    return issues
  }

  private static auditTheme(lyrics: string, theme: string): number {
    const lyricsLower = lyrics.toLowerCase()
    const themeLower = theme.toLowerCase()
    const themeWords = themeLower.split(/\s+/)

    let matches = 0
    themeWords.forEach((word) => {
      if (word.length > 3 && lyricsLower.includes(word)) {
        matches++
      }
    })

    const themeScore = Math.min(100, (matches / themeWords.length) * 100 + 50)
    return themeScore
  }
}
