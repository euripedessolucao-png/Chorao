// lib/validation/lyrics-auditor.ts

import { countPoeticSyllables } from "./syllable-counter-brasileiro" // ✅ CORRETO
import { PunctuationValidator } from "./punctuation-validator"
import { GENRE_CONFIGS } from "@/lib/genre-config" // ✅ Usa regras reais

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

    // 1. Auditoria de sílabas (com métrica por gênero)
    const syllableIssues = this.auditSyllables(lyrics, genre)
    if (syllableIssues.length > 0) {
      score -= syllableIssues.length * 5
      syllableIssues.forEach((issue) => {
        issues.push({
          type: "syllable",
          severity: "high",
          message: issue,
        })
      })
      recommendations.push("Ajustar versos conforme métrica do gênero")
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
    const structureIssues = this.auditStructure(lyrics, genre)
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
        message: `Coerência temática baixa: ${themeScore.toFixed(0)}/100`,
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

  private static auditSyllables(lyrics: string, genre: string): string[] {
    const issues: string[] = []
    const lines = lyrics.split("\n")

    // Obtém métrica real do gênero
    const config = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS]
    let minSyllables = 5
    let maxSyllables = 12

    if (config) {
      const rules = config.prosody_rules.syllable_count
      if ("absolute_max" in rules) {
        maxSyllables = rules.absolute_max
        minSyllables = Math.max(4, maxSyllables - 5)
      } else if ("without_comma" in rules) {
        minSyllables = rules.without_comma.min
        maxSyllables = rules.without_comma.acceptable_up_to
      }
    }

    lines.forEach((line, index) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(")) {
        return
      }

      const syllables = countPoeticSyllables(trimmed)
      if (syllables < minSyllables) {
        issues.push(`Linha ${index + 1}: muito curta (${syllables} sílabas, mínimo ${minSyllables})`)
      } else if (syllables > maxSyllables) {
        issues.push(`Linha ${index + 1}: muito longa (${syllables} sílabas, máximo ${maxSyllables})`)
      }
    })

    return issues
  }

  private static auditStructure(lyrics: string, genre: string): string[] {
    const issues: string[] = []

    const hasVerse = /\[Verse|\[Verso/i.test(lyrics)
    const hasChorus = /\[Chorus|\[Refrão/i.test(lyrics)

    if (!hasVerse) {
      issues.push("Falta marcação de versos")
    }
    if (!hasChorus) {
      issues.push("Falta marcação de refrão")
    }

    // Valida número de linhas por seção com base no gênero
    const config = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS]
    if (config) {
      const verses = lyrics.match(/\[Verse|\[Verso/gi)?.length || 0
      const choruses = lyrics.match(/\[Chorus|\[Refrão/gi)?.length || 0

      if (verses === 0 && choruses === 0) {
        issues.push("Estrutura mínima não encontrada")
      }
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
      if (line.length > 5) { // Ignora linhas muito curtas
        lineCount.set(line, (lineCount.get(line) || 0) + 1)
      }
    })

    lineCount.forEach((count, line) => {
      if (count > 3) { // Reduzido de 4 para 3 (mais sensível)
        issues.push(`Linha repetida ${count} vezes: "${line.substring(0, 30)}..."`)
      }
    })

    return issues
  }

  private static auditTheme(lyrics: string, theme: string): number {
    if (!theme.trim()) return 80 // Tema vazio = score neutro

    const lyricsLower = lyrics.toLowerCase()
    const themeLower = theme.toLowerCase()
    const themeWords = themeLower
      .split(/\s+/)
      .filter(word => word.length > 2) // Ignora palavras muito curtas

    if (themeWords.length === 0) return 80

    let matches = 0
    themeWords.forEach((word) => {
      if (lyricsLower.includes(word)) {
        matches++
      }
    })

    // Score mínimo de 50, máximo de 100
    const themeScore = Math.min(100, Math.max(50, (matches / themeWords.length) * 50 + 50))
    return themeScore
  }
}
