// lib/validation/syllable-enforcer.ts

/**
 * SISTEMA DE ENFORÇAMENTO DE SÍLABAS PARA LETRAS MUSICAIS
 * Corrige versos com excesso de sílabas, preservando rima, emoção e gênero.
 */

import { countPoeticSyllables } from "./syllable-counter-brasileiro"
import { SyllableSuggestionEngine } from "./syllable-suggestion-engine"
import { generateText } from "ai"

export interface SyllableEnforcement {
  min: number
  max: number
  ideal: number
}

export class SyllableEnforcer {
  private static readonly STRICT_MAX_SYLLABLES = 12 // 12 é limite absoluto em música
  private static readonly MAX_AI_ATTEMPTS = 1 // evita loops caros

  /**
   * Aplica limites de sílabas com correção inteligente
   */
  static async enforceSyllableLimits(
    lyrics: string,
    enforcement: SyllableEnforcement,
    genre: string,
  ): Promise<{ correctedLyrics: string; corrections: number; violations: string[] }> {
    const lines = lyrics.split("\n")
    const correctedLines: string[] = []
    let corrections = 0
    const violations: string[] = []

    // Usa limite rigoroso (máx 12), mas respeita min/ideal do enforcement
    const strictMax = Math.min(enforcement.max, this.STRICT_MAX_SYLLABLES)

    for (let i = 0; i < lines.length; i++) {
      const originalLine = lines[i]

      if (this.shouldSkipLine(originalLine)) {
        correctedLines.push(originalLine)
        continue
      }

      const syllables = countPoeticSyllables(originalLine)

      if (syllables >= enforcement.min && syllables <= strictMax) {
        correctedLines.push(originalLine)
      } else {
        const violationMsg = `Linha ${i + 1}: "${originalLine}" (${syllables}s)`
        violations.push(violationMsg)
        console.log(`[SyllableEnforcer] Corrigindo: ${violationMsg}`)

        const correctedLine = await this.correctSyllableLine(
          originalLine,
          syllables,
          { ...enforcement, max: strictMax },
          genre,
          i,
          lines,
        )

        correctedLines.push(correctedLine)
        if (correctedLine !== originalLine) corrections++
      }
    }

    return {
      correctedLyrics: correctedLines.join("\n"),
      corrections,
      violations,
    }
  }

  /**
   * Corrige uma linha com múltiplas estratégias, em ordem de preferência
   */
  private static async correctSyllableLine(
    line: string,
    currentSyllables: number,
    enforcement: SyllableEnforcement,
    genre: string,
    lineIndex: number,
    allLines: string[],
  ): Promise<string> {
    // 1. Tenta correções automáticas com o motor de sugestões
    const suggestion = SyllableSuggestionEngine.generateSuggestion(line, enforcement.max)
    if (suggestion && suggestion.syllables.after <= enforcement.max) {
      console.log(`[SyllableEnforcer] ✅ Correção automática: "${suggestion.suggestion}"`)
      return suggestion.suggestion
    }

    // 2. Se falhar, usa IA — mas com contexto de rima
    const nextRhymeLine = this.findNextRhymeLine(lineIndex, allLines)
    const rhymeScheme = nextRhymeLine ? this.extractRhyme(nextRhymeLine) : this.extractRhyme(line)

    const correctedLine = await this.aiCorrectWithRhymeContext(line, currentSyllables, enforcement, genre, rhymeScheme)

    return correctedLine || line
  }

  /**
   * Usa IA com contexto de rima explícito
   */
  private static async aiCorrectWithRhymeContext(
    line: string,
    syllables: number,
    enforcement: SyllableEnforcement,
    genre: string,
    requiredRhyme: string,
  ): Promise<string | null> {
    const prompt = `Você é um compositor profissional de música brasileira.

GENÊNERO: ${genre}
OBJETIVO: Reescrever a linha abaixo com no máximo ${enforcement.max} sílabas, PRESERVANDO:
- A rima final com o som "${requiredRhyme}"
- O significado emocional e narrativo
- A naturalidade da fala cantada

TÉCNICAS PERMITIDAS:
- Contrações naturais: "cê", "tá", "pra", "tô"
- Sinônimos poéticos mais curtos
- Reestruturação suave da frase

PROIBIDO:
- Alterar o som da última sílaba tônica
- Usar gírias artificiais ("pq", "vlw")
- Perder a essência da mensagem

LINHA ORIGINAL (${syllables}s): "${line}"

→ Retorne APENAS a linha corrigida, sem aspas, sem explicações.`

    try {
      const { text } = await generateText({
        model: "openai/gpt-4o-mini", // mais barato e rápido para essa tarefa
        prompt,
        temperature: 0.4,
      })

      const corrected = text.trim().replace(/^["']|["']$/g, "")

      // Valida: se a correção NÃO rima, rejeita
      if (!this.rhymes(corrected, requiredRhyme)) {
        console.warn(`[SyllableEnforcer] IA gerou linha que não rima: "${corrected}"`)
        return null
      }

      // Valida sílabas
      if (countPoeticSyllables(corrected) > enforcement.max) {
        console.warn(`[SyllableEnforcer] IA gerou linha longa: ${countPoeticSyllables(corrected)}s`)
        return null
      }

      return corrected
    } catch (error) {
      console.error("[SyllableEnforcer] Erro na IA:", error)
      return null
    }
  }

  /**
   * Extrai a rima (últimas 2-3 letras da última palavra tônica)
   */
  private static extractRhyme(line: string): string {
    const words = line
      .trim()
      .split(/\s+/)
      .filter((w) => w)
    if (words.length === 0) return ""

    const lastWord = words[words.length - 1].toLowerCase().replace(/[^\wáàâãéèêíìîóòôõúùû]/g, "")
    if (lastWord.length < 2) return lastWord

    // Pega as últimas 2 ou 3 letras (dependendo do tamanho)
    return lastWord.length >= 3 ? lastWord.slice(-3) : lastWord.slice(-2)
  }

  /**
   * Verifica se duas linhas rimam (comparação simples por sufixo)
   */
  private static rhymes(line1: string, rhymeSuffix: string): boolean {
    const extracted = this.extractRhyme(line1)
    return extracted.endsWith(rhymeSuffix) || rhymeSuffix.endsWith(extracted)
  }

  /**
   * Encontra a próxima linha que rima (para contexto)
   */
  private static findNextRhymeLine(currentIndex: number, allLines: string[]): string | null {
    // Procura nas próximas 4 linhas por uma que não seja tag
    for (let i = currentIndex + 1; i < Math.min(currentIndex + 5, allLines.length); i++) {
      const line = allLines[i].trim()
      if (line && !this.shouldSkipLine(line)) {
        return line
      }
    }
    return null
  }

  /**
   * Verifica se a linha deve ser ignorada
   */
  private static shouldSkipLine(line: string): boolean {
    const trimmed = line.trim()
    return (
      !trimmed ||
      trimmed.startsWith("[") ||
      trimmed.startsWith("(") ||
      trimmed.startsWith("Title:") ||
      trimmed.startsWith("Titulo:") ||
      trimmed.startsWith("Instrucao:") ||
      trimmed.startsWith("Instrumentos:")
    )
  }

  /**
   * Validação rápida sem correção
   */
  static validateLyrics(lyrics: string, enforcement: SyllableEnforcement) {
    const lines = lyrics.split("\n").filter((line) => line.trim() && !this.shouldSkipLine(line))

    const strictMax = Math.min(enforcement.max, this.STRICT_MAX_SYLLABLES)
    const stats = {
      totalLines: lines.length,
      withinLimit: 0,
      problems: [] as Array<{ line: string; syllables: number }>,
    }

    for (const line of lines) {
      const syllables = countPoeticSyllables(line)
      if (syllables >= enforcement.min && syllables <= strictMax) {
        stats.withinLimit++
      } else {
        stats.problems.push({ line, syllables })
      }
    }

    return {
      valid: stats.problems.length === 0,
      compliance: stats.totalLines > 0 ? stats.withinLimit / stats.totalLines : 1,
      ...stats,
    }
  }
}
