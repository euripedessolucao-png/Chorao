/**
 * Motor de Sugestões Inteligentes para Correção de Sílabas
 *
 * Analisa versos com problemas e sugere correções automáticas
 * mantendo o contexto e a narrativa
 */

import { countPoeticSyllables } from "./syllable-counter"

export interface SyllableSuggestion {
  original: string
  suggestion: string
  syllables: {
    before: number
    after: number
  }
  strategy: "contraction" | "synonym" | "reformulation" | "simplification"
  explanation: string
}

export class SyllableSuggestionEngine {
  // Contrações comuns do português brasileiro
  private static readonly CONTRACTIONS: Record<string, string> = {
    você: "cê",
    está: "tá",
    estava: "tava",
    estou: "tô",
    para: "pra",
    porque: "pq",
    também: "tbm",
    vamos: "vamo",
    estavam: "tavam",
  }

  // Sinônimos mais curtos mantendo impacto
  private static readonly SHORT_SYNONYMS: Record<string, string[]> = {
    libertei: ["soltei", "larguei"],
    caminho: ["rumo", "trilha"],
    tentava: ["quis", "tentou"],
    consegui: ["pude", "fiz"],
    acredito: ["creio", "sei"],
    sozinho: ["só", "sem ninguém"],
    ninguém: ["nada", "zero"],
  }

  /**
   * Gera sugestão inteligente para um verso com excesso de sílabas
   */
  static generateSuggestion(verse: string, targetSyllables = 11): SyllableSuggestion | null {
    const currentSyllables = countPoeticSyllables(verse)

    if (currentSyllables <= targetSyllables) {
      return null // Verso já está correto
    }

    const excess = currentSyllables - targetSyllables

    // Estratégia 1: Contrações (mais natural)
    if (excess <= 2) {
      const contractionResult = this.applyContractions(verse)
      if (contractionResult && countPoeticSyllables(contractionResult) <= targetSyllables) {
        return {
          original: verse,
          suggestion: contractionResult,
          syllables: {
            before: currentSyllables,
            after: countPoeticSyllables(contractionResult),
          },
          strategy: "contraction",
          explanation: "Aplicadas contrações naturais do português brasileiro",
        }
      }
    }

    // Estratégia 2: Sinônimos mais curtos
    if (excess <= 3) {
      const synonymResult = this.applySynonyms(verse)
      if (synonymResult && countPoeticSyllables(synonymResult) <= targetSyllables) {
        return {
          original: verse,
          suggestion: synonymResult,
          syllables: {
            before: currentSyllables,
            after: countPoeticSyllables(synonymResult),
          },
          strategy: "synonym",
          explanation: "Substituídos por sinônimos mais curtos mantendo o sentido",
        }
      }
    }

    // Estratégia 3: Reformulação inteligente
    const reformulation = this.reformulateVerse(verse, targetSyllables)
    if (reformulation) {
      return {
        original: verse,
        suggestion: reformulation,
        syllables: {
          before: currentSyllables,
          after: countPoeticSyllables(reformulation),
        },
        strategy: "reformulation",
        explanation: "Reformulado mantendo contexto e narrativa",
      }
    }

    // Estratégia 4: Simplificação (último recurso)
    const simplified = this.simplifyVerse(verse, targetSyllables)
    return {
      original: verse,
      suggestion: simplified,
      syllables: {
        before: currentSyllables,
        after: countPoeticSyllables(simplified),
      },
      strategy: "simplification",
      explanation: "Simplificado removendo palavras menos essenciais",
    }
  }

  /**
   * Aplica contrações naturais do português brasileiro
   */
  private static applyContractions(verse: string): string {
    let result = verse

    for (const [full, contracted] of Object.entries(this.CONTRACTIONS)) {
      const regex = new RegExp(`\\b${full}\\b`, "gi")
      result = result.replace(regex, contracted)
    }

    return result
  }

  /**
   * Substitui palavras por sinônimos mais curtos
   */
  private static applySynonyms(verse: string): string | null {
    let result = verse
    let changed = false

    for (const [word, synonyms] of Object.entries(this.SHORT_SYNONYMS)) {
      const regex = new RegExp(`\\b${word}\\b`, "gi")
      if (regex.test(result)) {
        // Usa o primeiro sinônimo disponível
        result = result.replace(regex, synonyms[0])
        changed = true
        break // Aplica uma mudança por vez
      }
    }

    return changed ? result : null
  }

  /**
   * Reformula o verso mantendo contexto
   */
  private static reformulateVerse(verse: string, targetSyllables: number): string | null {
    // Padrões comuns de reformulação
    const patterns = [
      // Remove artigos desnecessários
      { from: /\b(o|a|os|as)\s+/gi, to: "" },
      // Simplifica expressões verbais
      { from: /\bestou\s+a\s+/gi, to: "tô " },
      { from: /\bvou\s+estar\s+/gi, to: "vou " },
      // Remove advérbios redundantes
      { from: /\bmuito\s+/gi, to: "" },
      { from: /\bbem\s+/gi, to: "" },
      { from: /\btão\s+/gi, to: "" },
    ]

    const result = verse
    for (const pattern of patterns) {
      const temp = result.replace(pattern.from, pattern.to)
      if (countPoeticSyllables(temp) <= targetSyllables) {
        return temp.trim()
      }
    }

    return null
  }

  /**
   * Simplifica o verso removendo palavras menos essenciais
   */
  private static simplifyVerse(verse: string, targetSyllables: number): string {
    const words = verse.split(/\s+/)

    // Remove palavras menos essenciais até atingir o target
    const lessEssential = ["muito", "bem", "tão", "sempre", "nunca", "talvez", "quase"]

    let result = words
      .filter((word) => {
        const lower = word.toLowerCase()
        return !lessEssential.includes(lower)
      })
      .join(" ")

    // Se ainda está longo, remove artigos
    if (countPoeticSyllables(result) > targetSyllables) {
      result = result.replace(/\b(o|a|os|as)\s+/gi, "")
    }

    return result.trim()
  }
}
