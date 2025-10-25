/**
 * VALIDADOR ABSOLUTO DE SÍLABAS
 * REGRA INEGOCIÁVEL: Máximo 11 sílabas por verso
 * Acima disso não é possível ser cantada!
 */

import { countPoeticSyllables } from "./syllable-counter"
import { IntelligentSyllableReducer } from "./intelligent-syllable-reducer"

export class AbsoluteSyllableEnforcer {
  private static readonly ABSOLUTE_MAX_SYLLABLES = 11

  /**
   * Valida se TODOS os versos têm no máximo 11 sílabas
   * Retorna false se encontrar QUALQUER verso com mais de 11 sílabas
   */
  static validate(lyrics: string): {
    isValid: boolean
    violations: Array<{ line: string; syllables: number; lineNumber: number }>
    message: string
  } {
    const lines = lyrics.split("\n")
    const violations: Array<{ line: string; syllables: number; lineNumber: number }> = []

    lines.forEach((line, index) => {
      const trimmed = line.trim()

      // Ignora tags, instruções e linhas vazias
      if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(") || trimmed.includes("Instruments:")) {
        return
      }

      const syllables = countPoeticSyllables(trimmed)
      if (syllables > this.ABSOLUTE_MAX_SYLLABLES) {
        violations.push({
          line: trimmed,
          syllables,
          lineNumber: index + 1,
        })
      }
    })

    const isValid = violations.length === 0

    let message = ""
    if (!isValid) {
      message = `❌ BLOQUEADO: ${violations.length} verso(s) com mais de ${this.ABSOLUTE_MAX_SYLLABLES} sílabas. Acima disso não é possível ser cantada!`
      violations.forEach((v) => {
        message += `\n  Linha ${v.lineNumber}: "${v.line}" (${v.syllables} sílabas)`
      })
    } else {
      message = `✅ APROVADO: Todos os versos têm no máximo ${this.ABSOLUTE_MAX_SYLLABLES} sílabas`
    }

    return {
      isValid,
      violations,
      message,
    }
  }

  /**
   * Força TODOS os versos a terem no máximo 11 sílabas
   * Remove palavras agressivamente se necessário
   */
  static enforce(lyrics: string): {
    correctedLyrics: string
    corrections: number
    details: Array<{ original: string; corrected: string; syllablesBefore: number; syllablesAfter: number }>
  } {
    const lines = lyrics.split("\n")
    const correctedLines: string[] = []
    const details: Array<{ original: string; corrected: string; syllablesBefore: number; syllablesAfter: number }> = []
    let corrections = 0

    for (const line of lines) {
      const trimmed = line.trim()

      // Ignora tags, instruções e linhas vazias
      if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(") || trimmed.includes("Instruments:")) {
        correctedLines.push(line)
        continue
      }

      const syllablesBefore = countPoeticSyllables(trimmed)

      if (syllablesBefore > this.ABSOLUTE_MAX_SYLLABLES) {
        const corrected = this.forceMaxSyllables(trimmed)
        const syllablesAfter = countPoeticSyllables(corrected)

        correctedLines.push(corrected)
        corrections++

        details.push({
          original: trimmed,
          corrected,
          syllablesBefore,
          syllablesAfter,
        })

        console.log(`[AbsoluteSyllableEnforcer] 🔧 FORÇADO: ${syllablesBefore} → ${syllablesAfter} sílabas`)
        console.log(`  Original: "${trimmed}"`)
        console.log(`  Corrigido: "${corrected}"`)
      } else {
        correctedLines.push(line)
      }
    }

    return {
      correctedLyrics: correctedLines.join("\n"),
      corrections,
      details,
    }
  }

  /**
   * Força um verso a ter no máximo 11 sílabas
   * NUNCA corta palavras - apenas reformula ou regenera
   */
  private static forceMaxSyllables(line: string): string {
    let current = line
    let currentSyllables = countPoeticSyllables(current)

    // Melhor retornar com erro do que entregar palavra cortada
    const originalLine = line

    // Técnica 1: Remove artigos
    if (currentSyllables > this.ABSOLUTE_MAX_SYLLABLES) {
      const attempt = current
        .replace(/\b(o|a|os|as|um|uma|uns|umas)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim()

      if (this.isValidLine(attempt)) {
        current = attempt
        currentSyllables = countPoeticSyllables(current)
      }
    }

    // Técnica 2: Remove possessivos
    if (currentSyllables > this.ABSOLUTE_MAX_SYLLABLES) {
      const attempt = current
        .replace(/\b(meu|minha|meus|minhas)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim()

      if (this.isValidLine(attempt)) {
        current = attempt
        currentSyllables = countPoeticSyllables(current)
      }
    }

    // Técnica 3: Remove advérbios
    if (currentSyllables > this.ABSOLUTE_MAX_SYLLABLES) {
      const attempt = current
        .replace(/\b(muito|mais|ainda|hoje|sempre|nunca)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim()

      if (this.isValidLine(attempt)) {
        current = attempt
        currentSyllables = countPoeticSyllables(current)
      }
    }

    // Técnica 4: Remove conectivos
    if (currentSyllables > this.ABSOLUTE_MAX_SYLLABLES) {
      const attempt = current
        .replace(/\b(mas|e|que|quando|porque)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim()

      if (this.isValidLine(attempt)) {
        current = attempt
        currentSyllables = countPoeticSyllables(current)
      }
    }

    // NUNCA remove palavras - isso corta o verso

    if (currentSyllables > this.ABSOLUTE_MAX_SYLLABLES) {
      console.error(`[AbsoluteSyllableEnforcer] ❌ FALHA: Não conseguiu corrigir sem cortar palavras`)
      console.error(`  Original: "${originalLine}" (${countPoeticSyllables(originalLine)} sílabas)`)
      console.error(`  Tentativa: "${current}" (${currentSyllables} sílabas)`)
      console.error(`  AÇÃO: Retornando original - verso precisa ser REGENERADO`)
      return originalLine // Retorna original para ser detectado pela auditoria
    }

    return current.trim()
  }

  /**
   * Verifica se uma linha é válida (não tem palavras cortadas)
   */
  private static isValidLine(line: string): boolean {
    // Verifica se não termina com preposição
    if (/\b(na|no|da|do|em|de|pra|pro|com|sem|por)\s*$/i.test(line)) {
      return false
    }

    // Verifica se não tem palavras obviamente cortadas
    const words = line.split(/\s+/)
    for (const word of words) {
      const clean = word.replace(/[.,!?;:]/g, "")
      // Palavras com menos de 2 caracteres (exceto pronomes comuns)
      if (clean.length < 2 && !["é", "e", "a", "o"].includes(clean.toLowerCase())) {
        return false
      }
    }

    return true
  }

  /**
   * Valida e corrige automaticamente versos com mais de 11 sílabas
   * Usa técnicas poéticas inteligentes para reduzir sílabas
   */
  static validateAndFix(lyrics: string): {
    isValid: boolean
    correctedLyrics: string
    corrections: number
    details: string[]
  } {
    console.log("[AbsoluteSyllableEnforcer] 🔍 Validando e corrigindo letra...")

    const validation = this.validate(lyrics)

    if (validation.isValid) {
      console.log("[AbsoluteSyllableEnforcer] ✅ Letra já está perfeita!")
      return {
        isValid: true,
        correctedLyrics: lyrics,
        corrections: 0,
        details: [],
      }
    }

    console.log(
      `[AbsoluteSyllableEnforcer] 🔧 Aplicando correção inteligente em ${validation.violations.length} verso(s)...`,
    )

    const reductionResult = IntelligentSyllableReducer.reduceLyrics(lyrics, this.ABSOLUTE_MAX_SYLLABLES)

    // Valida resultado da correção
    const revalidation = this.validate(reductionResult.result)

    if (revalidation.isValid) {
      console.log(
        `[AbsoluteSyllableEnforcer] ✅ Correção bem-sucedida! ${reductionResult.versesModified} verso(s) corrigido(s)`,
      )
      return {
        isValid: true,
        correctedLyrics: reductionResult.result,
        corrections: reductionResult.versesModified,
        details: [`${reductionResult.totalReductionsApplied} técnicas aplicadas`],
      }
    }

    // Se correção inteligente falhou, tenta correção agressiva
    console.warn("[AbsoluteSyllableEnforcer] ⚠️ Correção inteligente não resolveu todos os problemas")
    console.warn("[AbsoluteSyllableEnforcer] 🔨 Tentando correção agressiva...")

    const enforcedResult = this.enforce(reductionResult.result)
    const finalValidation = this.validate(enforcedResult.correctedLyrics)

    if (finalValidation.isValid) {
      console.log("[AbsoluteSyllableEnforcer] ✅ Correção agressiva bem-sucedida!")
      return {
        isValid: true,
        correctedLyrics: enforcedResult.correctedLyrics,
        corrections: enforcedResult.corrections,
        details: enforcedResult.details.map((d) => `${d.original} → ${d.corrected}`),
      }
    }

    // Se tudo falhou, retorna erro
    console.error("[AbsoluteSyllableEnforcer] ❌ FALHA TOTAL - Não foi possível corrigir")
    return {
      isValid: false,
      correctedLyrics: lyrics,
      corrections: 0,
      details: ["Correção falhou - regeneração necessária"],
    }
  }
}
