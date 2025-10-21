/**
 * CORRETOR AUTOMÁTICO DE SÍLABAS
 * Aplica as 6 técnicas de correção AUTOMATICAMENTE após a geração da IA
 */

import { countPoeticSyllables } from "./syllable-counter"

export interface CorrectionResult {
  original: string
  corrected: string
  syllablesBefore: number
  syllablesAfter: number
  techniquesApplied: string[]
}

export class AutoSyllableCorrector {
  private static readonly MAX_SYLLABLES = 11

  /**
   * TÉCNICA 1: Remove artigos desnecessários
   */
  private static removeUnnecessaryArticles(line: string): { text: string; applied: boolean } {
    const patterns = [
      { from: /^A /i, to: "" }, // "A lembrança" → "Lembrança"
      { from: /^O /i, to: "" }, // "O dinheiro" → "Dinheiro"
      { from: / a /g, to: " " }, // "tenho a chave" → "tenho chave"
      { from: / o /g, to: " " }, // "deixei o riacho" → "deixei riacho"
    ]

    let result = line
    let applied = false

    for (const pattern of patterns) {
      const newResult = result.replace(pattern.from, pattern.to)
      if (newResult !== result) {
        result = newResult
        applied = true
      }
    }

    return { text: result.trim(), applied }
  }

  /**
   * TÉCNICA 2: Remove possessivos redundantes
   */
  private static removePossessives(line: string): { text: string; applied: boolean } {
    const patterns = [
      { from: / minha /gi, to: " " }, // "minha paz" → "paz"
      { from: / meu /gi, to: " " }, // "meu peito" → "peito"
      { from: / meus /gi, to: " " }, // "meus medos" → "medos"
      { from: / minhas /gi, to: " " }, // "minhas dores" → "dores"
    ]

    let result = line
    let applied = false

    for (const pattern of patterns) {
      const newResult = result.replace(pattern.from, pattern.to)
      if (newResult !== result) {
        result = newResult
        applied = true
      }
    }

    return { text: result.trim(), applied }
  }

  /**
   * TÉCNICA 3: Remove pronomes desnecessários
   */
  private static removeUnnecessaryPronouns(line: string): { text: string; applied: boolean } {
    const patterns = [
      { from: /^Hoje eu /i, to: "" }, // "Hoje eu quebro" → "Quebro"
      { from: /^Ainda /i, to: "" }, // "Ainda hoje" → "Hoje"
      { from: / que eu /gi, to: " que " }, // "dinheiro que eu junto" → "dinheiro que junto"
    ]

    let result = line
    let applied = false

    for (const pattern of patterns) {
      const newResult = result.replace(pattern.from, pattern.to)
      if (newResult !== result) {
        result = newResult
        applied = true
      }
    }

    return { text: result.trim(), applied }
  }

  /**
   * TÉCNICA 4: Simplifica expressões longas
   */
  private static simplifyExpressions(line: string): { text: string; applied: boolean } {
    const replacements = [
      { from: /suja de pó/gi, to: "de pó" }, // "bota suja de pó" → "bota de pó"
      { from: /de raça/gi, to: "bom" }, // "cavalo de raça" → "cavalo bom"
      { from: /papel colorido/gi, to: "papel" }, // "papel colorido" → "papel"
      { from: /rio de ruído/gi, to: "rio ruidoso" }, // "rio de ruído" → "rio ruidoso"
      { from: /dessa /gi, to: "da " }, // "dessa cela" → "da cela"
      { from: /chamo de/gi, to: "é meu" }, // "que chamo de" → "que é meu"
    ]

    let result = line
    let applied = false

    for (const replacement of replacements) {
      const newResult = result.replace(replacement.from, replacement.to)
      if (newResult !== result) {
        result = newResult
        applied = true
      }
    }

    return { text: result.trim(), applied }
  }

  /**
   * TÉCNICA 5: Converte plural para singular
   */
  private static convertPluralToSingular(line: string): { text: string; applied: boolean } {
    const replacements = [
      { from: /remédios/gi, to: "remédio" },
      { from: /medos/gi, to: "medo" },
      { from: /ilusões/gi, to: "ilusão" },
      { from: /dedos/gi, to: "dedo" },
    ]

    let result = line
    let applied = false

    for (const replacement of replacements) {
      const newResult = result.replace(replacement.from, replacement.to)
      if (newResult !== result) {
        result = newResult
        applied = true
      }
    }

    return { text: result.trim(), applied }
  }

  /**
   * TÉCNICA 6: Remove palavras redundantes no final
   */
  private static removeRedundantWords(line: string): { text: string; applied: boolean } {
    // Remove palavras redundantes que aparecem no final e não são essenciais
    const patterns = [
      { from: / e volto/gi, to: ", volto" }, // "quebro e volto" → "quebro, volto"
      { from: / que humilha$/gi, to: "" }, // Remove "que humilha" no final
    ]

    let result = line
    let applied = false

    for (const pattern of patterns) {
      const newResult = result.replace(pattern.from, pattern.to)
      if (newResult !== result) {
        result = newResult
        applied = true
      }
    }

    return { text: result.trim(), applied }
  }

  /**
   * Aplica TODAS as técnicas em sequência até atingir 11 sílabas ou menos
   */
  static correctLine(line: string): CorrectionResult {
    const original = line
    const syllablesBefore = countPoeticSyllables(line)
    const techniquesApplied: string[] = []

    // Se já está correto, retorna
    if (syllablesBefore <= this.MAX_SYLLABLES) {
      return {
        original,
        corrected: line,
        syllablesBefore,
        syllablesAfter: syllablesBefore,
        techniquesApplied: [],
      }
    }

    let current = line

    // Aplica técnicas em ordem de prioridade
    const techniques = [
      { name: "Remover artigos", fn: this.removeUnnecessaryArticles.bind(this) },
      { name: "Remover possessivos", fn: this.removePossessives.bind(this) },
      { name: "Remover pronomes", fn: this.removeUnnecessaryPronouns.bind(this) },
      { name: "Simplificar expressões", fn: this.simplifyExpressions.bind(this) },
      { name: "Plural → Singular", fn: this.convertPluralToSingular.bind(this) },
      { name: "Remover redundâncias", fn: this.removeRedundantWords.bind(this) },
    ]

    for (const technique of techniques) {
      const currentSyllables = countPoeticSyllables(current)

      // Se já atingiu o objetivo, para
      if (currentSyllables <= this.MAX_SYLLABLES) {
        break
      }

      const result = technique.fn(current)
      if (result.applied) {
        current = result.text
        techniquesApplied.push(technique.name)
      }
    }

    const syllablesAfter = countPoeticSyllables(current)

    return {
      original,
      corrected: current,
      syllablesBefore,
      syllablesAfter,
      techniquesApplied,
    }
  }

  /**
   * Corrige TODA a letra automaticamente
   */
  static correctLyrics(lyrics: string): {
    correctedLyrics: string
    corrections: CorrectionResult[]
    totalCorrected: number
  } {
    const lines = lyrics.split("\n")
    const correctedLines: string[] = []
    const corrections: CorrectionResult[] = []
    let totalCorrected = 0

    for (const line of lines) {
      const trimmed = line.trim()

      // Ignora tags, instruções e linhas vazias
      if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(") || trimmed.includes("Instruments:")) {
        correctedLines.push(line)
        continue
      }

      const result = this.correctLine(trimmed)

      if (result.techniquesApplied.length > 0) {
        corrections.push(result)
        totalCorrected++
        console.log(`[AutoCorrector] ✅ Corrigido: "${result.original}" → "${result.corrected}"`)
        console.log(`  Sílabas: ${result.syllablesBefore} → ${result.syllablesAfter}`)
        console.log(`  Técnicas: ${result.techniquesApplied.join(", ")}`)
      }

      correctedLines.push(result.corrected)
    }

    return {
      correctedLyrics: correctedLines.join("\n"),
      corrections,
      totalCorrected,
    }
  }
}
