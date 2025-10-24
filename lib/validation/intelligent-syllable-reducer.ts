/**
 * INTELLIGENT SYLLABLE REDUCER
 *
 * Sistema inteligente de redução de sílabas baseado em técnicas poéticas portuguesas:
 *
 * 1. ELISÃO (Elision): Fusão de vogais entre palavras
 *    - "de ouro" → "d'ouro" (2 sílabas → 1 sílaba)
 *    - "que eu" → "qu'eu" (2 sílabas → 1 sílaba)
 *
 * 2. CONTRAÇÕES: Uso de formas contraídas
 *    - "para" → "pra" (2 sílabas → 1 sílaba)
 *    - "você" → "cê" (2 sílabas → 1 sílaba)
 *    - "está" → "tá" (2 sílabas → 1 sílaba)
 *
 * 3. REMOÇÃO DE ARTIGOS: Eliminar artigos desnecessários
 *    - "o meu" → "meu" (reduz 1 sílaba)
 *    - "a minha" → "minha" (reduz 1 sílaba)
 *
 * 4. SIMPLIFICAÇÃO: Substituir palavras longas por sinônimos curtos
 *    - "liberdade" (4 sílabas) → "paz" (1 sílaba)
 *    - "segurança" (4 sílabas) → "abrigo" (3 sílabas)
 *
 * Baseado em pesquisa sobre:
 * - Aoidos: Sistema de escansão automática de poesia portuguesa
 * - Tra-la-Lyrics: Geração de letras com restrições rítmicas
 * - Técnicas poéticas: elisão, crase, sinalefa
 */

import { countPoeticSyllables } from "./syllable-counter-brasileiro"

interface ReductionRule {
  pattern: RegExp
  replacement: string
  syllablesSaved: number
  description: string
  priority: number // 1 = alta, 2 = média, 3 = baixa
}

export class IntelligentSyllableReducer {
  private static readonly REDUCTION_RULES: ReductionRule[] = [
    // PRIORIDADE 1: Contrações comuns (mais naturais)
    { pattern: /\bpara\s+/gi, replacement: "pra ", syllablesSaved: 1, description: "para → pra", priority: 1 },
    { pattern: /\bpara\s+o\b/gi, replacement: "pro", syllablesSaved: 2, description: "para o → pro", priority: 1 },
    { pattern: /\bpara\s+a\b/gi, replacement: "pra", syllablesSaved: 2, description: "para a → pra", priority: 1 },
    { pattern: /\bvocê\b/gi, replacement: "cê", syllablesSaved: 1, description: "você → cê", priority: 1 },
    { pattern: /\bestá\b/gi, replacement: "tá", syllablesSaved: 1, description: "está → tá", priority: 1 },
    { pattern: /\bestou\b/gi, replacement: "tô", syllablesSaved: 1, description: "estou → tô", priority: 1 },

    // PRIORIDADE 2: Remoção de artigos (natural em poesia)
    { pattern: /\bo\s+meu\b/gi, replacement: "meu", syllablesSaved: 1, description: "o meu → meu", priority: 2 },
    {
      pattern: /\ba\s+minha\b/gi,
      replacement: "minha",
      syllablesSaved: 1,
      description: "a minha → minha",
      priority: 2,
    },
    { pattern: /\bos\s+meus\b/gi, replacement: "meus", syllablesSaved: 1, description: "os meus → meus", priority: 2 },
    {
      pattern: /\bas\s+minhas\b/gi,
      replacement: "minhas",
      syllablesSaved: 1,
      description: "as minhas → minhas",
      priority: 2,
    },
    { pattern: /\bum\s+/gi, replacement: "", syllablesSaved: 1, description: 'remove "um"', priority: 2 },
    { pattern: /\buma\s+/gi, replacement: "", syllablesSaved: 1, description: 'remove "uma"', priority: 2 },

    // PRIORIDADE 3: Elisão (fusão de vogais)
    {
      pattern: /\bde\s+ouro\b/gi,
      replacement: "d'ouro",
      syllablesSaved: 1,
      description: "de ouro → d'ouro",
      priority: 3,
    },
    {
      pattern: /\bde\s+água\b/gi,
      replacement: "d'água",
      syllablesSaved: 1,
      description: "de água → d'água",
      priority: 3,
    },
    { pattern: /\bque\s+eu\b/gi, replacement: "qu'eu", syllablesSaved: 1, description: "que eu → qu'eu", priority: 3 },
    {
      pattern: /\bque\s+ele\b/gi,
      replacement: "qu'ele",
      syllablesSaved: 1,
      description: "que ele → qu'ele",
      priority: 3,
    },

    // PRIORIDADE 2: Simplificações de palavras longas
    {
      pattern: /\bliberdade\b/gi,
      replacement: "liberdá",
      syllablesSaved: 1,
      description: "liberdade → liberdá (apócope)",
      priority: 2,
    },
    {
      pattern: /\bsegurança\b/gi,
      replacement: "abrigo",
      syllablesSaved: 1,
      description: "segurança → abrigo",
      priority: 2,
    },
    {
      pattern: /\besperança\b/gi,
      replacement: "esperanç",
      syllablesSaved: 1,
      description: "esperança → esperanç (apócope)",
      priority: 2,
    },
    {
      pattern: /\bdinheiro\b/gi,
      replacement: "grana",
      syllablesSaved: 1,
      description: "dinheiro → grana",
      priority: 2,
    },
  ]

  /**
   * Reduz sílabas de um verso aplicando técnicas poéticas
   */
  static reduceVerse(
    verse: string,
    targetSyllables = 11,
  ): {
    result: string
    syllablesReduced: number
    techniquesApplied: string[]
  } {
    const originalSyllables = countPoeticSyllables(verse)

    if (originalSyllables <= targetSyllables) {
      return {
        result: verse,
        syllablesReduced: 0,
        techniquesApplied: [],
      }
    }

    const syllablesToReduce = originalSyllables - targetSyllables
    let currentVerse = verse
    let totalReduced = 0
    const techniquesApplied: string[] = []

    // Ordena regras por prioridade
    const sortedRules = [...this.REDUCTION_RULES].sort((a, b) => a.priority - b.priority)

    // Aplica regras até atingir o objetivo
    for (const rule of sortedRules) {
      if (totalReduced >= syllablesToReduce) break

      const matches = currentVerse.match(rule.pattern)
      if (matches) {
        const newVerse = currentVerse.replace(rule.pattern, rule.replacement)
        const newSyllables = countPoeticSyllables(newVerse)
        const actualReduction = countPoeticSyllables(currentVerse) - newSyllables

        if (actualReduction > 0 && newSyllables >= targetSyllables) {
          currentVerse = newVerse
          totalReduced += actualReduction
          techniquesApplied.push(rule.description)

          console.log(`[IntelligentSyllableReducer] ✓ Aplicou: ${rule.description}`)
          console.log(`[IntelligentSyllableReducer]   Antes: "${verse}" (${originalSyllables} sílabas)`)
          console.log(`[IntelligentSyllableReducer]   Depois: "${currentVerse}" (${newSyllables} sílabas)`)
        }
      }
    }

    const finalSyllables = countPoeticSyllables(currentVerse)

    return {
      result: currentVerse,
      syllablesReduced: originalSyllables - finalSyllables,
      techniquesApplied,
    }
  }

  /**
   * Reduz sílabas de uma letra completa
   */
  static reduceLyrics(
    lyrics: string,
    targetSyllables = 11,
  ): {
    result: string
    versesModified: number
    totalReductionsApplied: number
  } {
    const lines = lyrics.split("\n")
    let versesModified = 0
    let totalReductionsApplied = 0

    const processedLines = lines.map((line) => {
      // Ignora linhas vazias e tags de estrutura
      if (!line.trim() || line.startsWith("[")) {
        return line
      }

      const syllables = countPoeticSyllables(line)

      if (syllables > targetSyllables) {
        const reduction = this.reduceVerse(line, targetSyllables)

        if (reduction.syllablesReduced > 0) {
          versesModified++
          totalReductionsApplied += reduction.techniquesApplied.length
          return reduction.result
        }
      }

      return line
    })

    return {
      result: processedLines.join("\n"),
      versesModified,
      totalReductionsApplied,
    }
  }
}
