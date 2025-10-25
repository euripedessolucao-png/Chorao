// lib/validation/syllable-suggestion-engine.ts

import { countPoeticSyllables } from "./syllable-counter-brasileiro"

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
  // Contrações naturais e musicalmente aceitáveis (evita gírias informais como "pq")
  private static readonly CONTRACTIONS: Array<{ pattern: RegExp; replacement: string }> = [
    { pattern: /\bpara\b/gi, replacement: "pra" },
    { pattern: /\bestou\b/gi, replacement: "tô" },
    { pattern: /\bestá\b/gi, replacement: "tá" },
    { pattern: /\bvocê\b/gi, replacement: "cê" },
    { pattern: /\bdele\b/gi, replacement: "dele" }, // mantém, mas evita "d'ele"
    { pattern: /\bcomigo\b/gi, replacement: "comigo" },
    // Evita: "porque" → "pq", "também" → "tbm" (não soam bem em música)
  ]

  // Sinônimos curtos com equivalência poética (testados em contexto musical)
  private static readonly SHORT_SYNONYMS: Record<string, string[]> = {
    iluminou: ["acendeu", "clareou"],
    caminho: ["rumo", "trilha", "rota"],
    tempestade: ["chuva", "tormenta"],
    organiza: ["ajeita", "arruma"],
    bagunça: ["caos", "confusão"],
    instante: ["momento", "segundo"],
    castelo: ["lar", "abrigo"],
    tesouro: ["segredo", "encanto"],
    dispara: ["bate", "pula"],
    acelerado: ["rápido", "alucinado"],
    detalhe: ["toque", "gesto"],
  }

  // Palavras frequentemente removíveis sem perder sentido
  private static readonly OPTIONAL_WORDS = [
    "muito",
    "bem",
    "tão",
    "mesmo",
    "realmente",
    "sempre",
    "nunca",
    "quase",
    "totalmente",
  ]

  /**
   * Gera sugestão inteligente para um verso com excesso de sílabas
   */
  static generateSuggestion(verse: string, targetSyllables = 11): SyllableSuggestion | null {
    const currentSyllables = countPoeticSyllables(verse)
    if (currentSyllables <= targetSyllables) return null

    const excess = currentSyllables - targetSyllables

    // Estratégia 1: Contrações naturais
    const contractionSuggestion = this.tryStrategy(
      verse,
      () => this.applyContractions(verse),
      "contraction",
      "Aplicadas contrações naturais do português falado/cantado",
    )
    if (contractionSuggestion && contractionSuggestion.syllables.after <= targetSyllables) {
      return contractionSuggestion
    }

    // Estratégia 2: Sinônimos poéticos mais curtos
    if (excess <= 3) {
      const synonymSuggestion = this.tryStrategy(
        verse,
        () => this.applySynonyms(verse),
        "synonym",
        "Substituído por sinônimo mais curto, mantendo tom e emoção",
      )
      if (synonymSuggestion && synonymSuggestion.syllables.after <= targetSyllables) {
        return synonymSuggestion
      }
    }

    // Estratégia 3: Reformulação suave
    const reformulationSuggestion = this.tryStrategy(
      verse,
      () => this.reformulateVerse(verse, targetSyllables),
      "reformulation",
      "Reescrito com estrutura mais econômica, preservando a ideia central",
    )
    if (reformulationSuggestion && reformulationSuggestion.syllables.after <= targetSyllables) {
      return reformulationSuggestion
    }

    // Estratégia 4: Simplificação (remove palavras acessórias)
    const simplified = this.simplifyVerse(verse, targetSyllables)
    const finalSyllables = countPoeticSyllables(simplified)
    return {
      original: verse,
      suggestion: simplified,
      syllables: {
        before: currentSyllables,
        after: finalSyllables,
      },
      strategy: "simplification",
      explanation: "Palavras menos essenciais foram removidas para ajustar o ritmo",
    }
  }

  private static tryStrategy(
    original: string,
    transform: () => string | null,
    strategy: SyllableSuggestion["strategy"],
    explanation: string,
  ): SyllableSuggestion | null {
    const result = transform()
    if (!result || result === original) return null

    const after = countPoeticSyllables(result)
    const before = countPoeticSyllables(original)

    if (after < before) {
      return {
        original,
        suggestion: result,
        syllables: { before, after },
        strategy,
        explanation,
      }
    }
    return null
  }

  private static applyContractions(verse: string): string | null {
    let result = verse
    for (const { pattern, replacement } of this.CONTRACTIONS) {
      result = result.replace(pattern, replacement)
    }
    return result !== verse ? result : null
  }

  private static applySynonyms(verse: string): string | null {
    const result = verse
    for (const [word, options] of Object.entries(this.SHORT_SYNONYMS)) {
      const regex = new RegExp(`\\b${word}\\b`, "gi")
      if (regex.test(result)) {
        // Tenta cada sinônimo até encontrar um que reduza sílabas
        for (const synonym of options) {
          const candidate = result.replace(regex, synonym)
          if (countPoeticSyllables(candidate) < countPoeticSyllables(result)) {
            return candidate
          }
        }
      }
    }
    return null
  }

  private static reformulateVerse(verse: string, targetSyllables: number): string | null {
    const patterns = [
      // Remove artigos antes de pronomes possessivos ("o meu" → "meu")
      {
        regex: /\b(o|a)\s+(meu|seu|nosso|teu)\b/gi,
        replacer: (_: string, __: string, possessive: string) => possessive,
      },
      // Remove "muito" antes de adjetivos ("muito lindo" → "lindo")
      { regex: /\bmuito\s+([a-záàâãéèêíìîóòôõúùû]+)/gi, replacer: (_: string, adj: string) => adj },
      // Simplifica "vai ver" → "vê", "vou te ver" → "te vejo"
      { regex: /\bvou\s+te\s+ver\b/gi, replacer: () => "te vejo" },
      { regex: /\bvai\s+ver\b/gi, replacer: () => "vê" },
    ]

    for (const { regex, replacer } of patterns) {
      if (regex.test(verse)) {
        const candidate = verse.replace(regex, replacer as any)
        if (countPoeticSyllables(candidate) <= targetSyllables) {
          return candidate
        }
      }
    }
    return null
  }

  private static simplifyVerse(verse: string, targetSyllables: number): string {
    const words = verse.split(/\s+/)
    let current = verse

    // Remove palavras opcionais
    for (const word of this.OPTIONAL_WORDS) {
      const regex = new RegExp(`\\b${word}\\b`, "gi")
      if (regex.test(current)) {
        const candidate = current.replace(regex, "").replace(/\s+/g, " ").trim()
        if (countPoeticSyllables(candidate) <= targetSyllables) {
          return candidate
        }
        current = candidate
      }
    }

    // Se ainda estiver longo, remove artigos
    const withArticlesRemoved = current
      .replace(/\b(o|a|os|as)\s+/gi, "")
      .replace(/\s+/g, " ")
      .trim()
    if (countPoeticSyllables(withArticlesRemoved) <= targetSyllables) {
      return withArticlesRemoved
    }

    return current // retorna o melhor possível
  }
}
