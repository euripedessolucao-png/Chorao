// lib/validation/syllableEnforcer.ts

/**
 * SISTEMA DE SÍLABAS - EXPORTAÇÃO CORRIGIDA
 * Mantém compatibilidade com imports existentes
 */

import { countPoeticSyllables } from "./syllable-counter"
import { generateText } from "ai"

export interface SyllableEnforcement {
  min: number
  max: number
  ideal: number
}

// ✅ EXPORTA a classe atual como default
export class SyllableEnforcer {
  private static readonly STRICT_MAX_SYLLABLES = 11
  private static readonly MAX_CORRECTION_ATTEMPTS = 2

  /**
   * IMPOSIÇÃO RIGOROSA MAS INTELIGENTE DE SÍLABAS
   * Versão atualizada que preserva rimas
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

    // ✅ USAR LIMITE RIGOROSO
    const strictEnforcement = { ...enforcement, max: this.STRICT_MAX_SYLLABLES }

    for (let i = 0; i < lines.length; i++) {
      const originalLine = lines[i]

      if (this.shouldSkipLine(originalLine)) {
        correctedLines.push(originalLine)
        continue
      }

      const syllables = countPoeticSyllables(originalLine)

      if (syllables >= strictEnforcement.min && syllables <= strictEnforcement.max) {
        correctedLines.push(originalLine)
      } else {
        violations.push(`Linha ${i + 1}: "${originalLine}" -> ${syllables}s`)

        console.log(`[SyllableEnforcer] Corrigindo linha ${i + 1}: "${originalLine}" (${syllables}s)`)

        const correctedLine = await this.correctSyllableLine(originalLine, syllables, strictEnforcement, genre)

        correctedLines.push(correctedLine)
        corrections++
      }
    }

    return {
      correctedLyrics: correctedLines.join("\n"),
      corrections,
      violations,
    }
  }

  /**
   * CORREÇÃO INTELIGENTE - PRESERVA RIMAS
   */
  private static async correctSyllableLine(
    line: string,
    currentSyllables: number,
    enforcement: SyllableEnforcement,
    genre: string,
  ): Promise<string> {
    // ✅ PRIMEIRO: Tenta correções automáticas que preservam rimas
    const autoCorrected = this.applySmartCorrections(line, enforcement.max)
    const autoSyllables = countPoeticSyllables(autoCorrected)

    if (autoSyllables <= enforcement.max) {
      console.log(`[SyllableEnforcer] Correção automática: "${line}" -> "${autoCorrected}"`)
      return autoCorrected
    }

    // ✅ SEGUNDO: Se ainda longa, usa IA com foco em preservar rimas
    const correctionPrompt = this.buildSmartCorrectionPrompt(line, currentSyllables, enforcement, genre)

    try {
      const { text: correctedLine } = await generateText({
        model: "openai/gpt-4o",
        prompt: correctionPrompt,
        temperature: 0.3,
      })

      const correctedText = correctedLine.trim().replace(/^["']|["']$/g, "")
      return correctedText
    } catch (error) {
      console.error("[SyllableEnforcer] Erro na correção:", error)
      return this.applyEmergencyCorrection(line, enforcement.max)
    }
  }

  /**
   * CORREÇÕES INTELIGENTES - PRESERVA RIMAS
   */
  private static applySmartCorrections(line: string, maxSyllables: number): string {
    const words = line.split(" ")

    // ✅ PRESERVA RIMA: Nunca remove as últimas 2 palavras
    if (words.length > 4 && countPoeticSyllables(line) > maxSyllables) {
      // Tenta reduzir do MEIO, mantendo início e fim
      const middleReduction = [
        words[0],
        ...words.slice(-3), // Mantém as 3 últimas palavras (onde está a rima)
      ].join(" ")

      if (countPoeticSyllables(middleReduction) <= maxSyllables) {
        return middleReduction
      }
    }

    let corrected = line

    // ✅ CONTRACÕES SEGURAS (não afetam rimas)
    const contractions = [
      { from: /\bvocê\b/gi, to: "cê" },
      { from: /\bestá\b/gi, to: "tá" },
      { from: /\bpara\b/gi, to: "pra" },
      { from: /\bestou\b/gi, to: "tô" },
    ]

    contractions.forEach(({ from, to }) => {
      corrected = corrected.replace(from, to)
    })

    return corrected
  }

  /**
   * CORREÇÃO DE EMERGÊNCIA - PRESERVA RIMAS
   */
  private static applyEmergencyCorrection(line: string, maxSyllables: number): string {
    console.log(`[SyllableEnforcer] ⚠️ Correção de emergência DESABILITADA para: "${line}"`)
    console.log(`[SyllableEnforcer] ℹ️ Retornando linha original - IA deve regenerar`)

    // NÃO remove palavras - isso quebra a gramática
    // A IA deve regenerar a linha inteira se necessário
    return line
  }

  /**
   * PROMPT INTELIGENTE - PRESERVA RIMAS
   */
  private static buildSmartCorrectionPrompt(
    line: string,
    syllables: number,
    enforcement: SyllableEnforcement,
    genre: string,
  ): string {
    return `CORREÇÃO MUSICAL INTELIGENTE - PRESERVE RIMAS

LINHA: "${line}"
SÍLABAS ATUAIS: ${syllables} (MÁXIMO: ${enforcement.max})

REESCREVA esta linha com MÁXIMO ${enforcement.max} sílabas PRESERVANDO:
- A RIMA da linha original
- O SIGNIFICADO principal  
- A NATURALIDADE da linguagem

TÉCNICAS:
• Use contrações: "cê", "tá", "pra", "tô"
• Simplifique palavras do MEIO, nunca do FINAL
• Mantenha a essência emocional

EXEMPLO:
"Meu coração dispara quando você chega perto" (13s)
→ "Coração acelera quando cê vem perto" (9s) ✅ RIMA PRESERVADA

GÊNERO: ${genre}

→ (APENAS A LINHA CORRIGIDA)`
  }

  /**
   * Verifica se linha deve ser pulada na validação
   */
  private static shouldSkipLine(line: string): boolean {
    const trimmed = line.trim()
    return (
      !trimmed ||
      trimmed.startsWith("[") ||
      trimmed.startsWith("(") ||
      trimmed.startsWith("Titulo:") ||
      trimmed.startsWith("Instrucao:") ||
      trimmed.includes("Instrucao:")
    )
  }

  /**
   * VALIDAÇÃO RÁPIDA - MÉTODO QUE ESTAVA FALTANDO!
   */
  static validateLyrics(lyrics: string, enforcement: SyllableEnforcement) {
    const lines = lyrics.split("\n").filter((line) => line.trim() && !this.shouldSkipLine(line))

    // ✅ USAR LIMITE RIGOROSO
    const strictEnforcement = { ...enforcement, max: this.STRICT_MAX_SYLLABLES }

    const stats = {
      totalLines: lines.length,
      withinLimit: 0,
      problems: [] as Array<{ line: string; syllables: number }>,
    }

    lines.forEach((line) => {
      const syllables = countPoeticSyllables(line)
      if (syllables >= strictEnforcement.min && syllables <= strictEnforcement.max) {
        stats.withinLimit++
      } else {
        stats.problems.push({ line, syllables })
      }
    })

    return {
      valid: stats.problems.length === 0,
      compliance: stats.totalLines > 0 ? stats.withinLimit / stats.totalLines : 1,
      ...stats,
    }
  }
}
