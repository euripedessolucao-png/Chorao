import { generateText } from "ai"
import { countSyllables } from "./validation/syllableUtils"

export const ADVANCED_BRAZILIAN_METRICS = {
  "Sertanejo Moderno": { syllablesPerLine: 6, maxSyllables: 7, bpm: 90, structure: "VERSO-REFRAO-PONTE" },
  "Sertanejo Universitário": { syllablesPerLine: 6, maxSyllables: 7, bpm: 95, structure: "VERSO-REFRAO" },
  "Sertanejo Sofrência": { syllablesPerLine: 8, maxSyllables: 9, bpm: 75, structure: "VERSO-REFRAO-PONTE" },
  "Sertanejo Raiz": { syllablesPerLine: 10, maxSyllables: 11, bpm: 80, structure: "VERSO-REFRAO" },
  "Bachata Tradicional": { syllablesPerLine: 10, maxSyllables: 12, bpm: 110, structure: "VERSO-REFRAO-PONTE" },
  "Bachata Moderna": { syllablesPerLine: 10, maxSyllables: 12, bpm: 110, structure: "VERSO-REFRAO-PONTE" },
  "Bachata Brasileira": { syllablesPerLine: 10, maxSyllables: 12, bpm: 110, structure: "VERSO-REFRAO-PONTE" },
  Pagode: { syllablesPerLine: 7, maxSyllables: 8, bpm: 100, structure: "VERSO-REFRAO" },
  Funk: { syllablesPerLine: 6, maxSyllables: 7, bpm: 125, structure: "REFRAO-VERSO" },
  MPB: { syllablesPerLine: 9, maxSyllables: 10, bpm: 90, structure: "VERSO-REFRAO-PONTE" },
  Pop: { syllablesPerLine: 7, maxSyllables: 8, bpm: 110, structure: "VERSO-REFRAO-PONTE" },
  default: { syllablesPerLine: 8, maxSyllables: 9, bpm: 100, structure: "VERSO-REFRAO" },
} as const

export type GenreName = keyof typeof ADVANCED_BRAZILIAN_METRICS

/**
 * ============================================================================
 * TERCEIRA VIA - SISTEMA DE COMPOSIÇÃO POR RESTRIÇÕES
 * ============================================================================
 *
 * PROPÓSITO:
 * Este sistema NÃO ensina a IA a compor. Ele FORÇA a IA a seguir regras
 * absolutas através de um processo de 3 etapas:
 *
 * 1. VARIAÇÃO A: Foco em métrica perfeita (sílabas, ritmo, estrutura)
 * 2. VARIAÇÃO B: Foco em criatividade (vocabulário, imagens, emoção)
 * 3. SÍNTESE FINAL: Combina os melhores elementos de A e B
 *
 * REGRAS UNIVERSAIS:
 * - Linguagem simples e coloquial (dia-a-dia brasileiro)
 * - Respeito absoluto aos limites de sílabas por gênero
 * - Nunca quebrar palavras (ex: "nãsãnossas" é PROIBIDO)
 * - Requisitos Adicionais têm PRIORIDADE TOTAL sobre qualquer regra
 *
 * ============================================================================
 */
export class ThirdWayEngine {
  /**
   * ----------------------------------------------------------------------------
   * FUNÇÃO PRINCIPAL: Gera uma linha usando o sistema de Terceira Via
   * ----------------------------------------------------------------------------
   *
   * @param originalLine - Linha original a ser processada
   * @param genre - Gênero musical (Bachata, Sertanejo, etc.)
   * @param genreRules - Regras específicas do gênero
   * @param context - Contexto da música (tema, emoção, etc.)
   * @param performanceMode - Se deve incluir descrições performáticas
   * @param additionalRequirements - Requisitos do compositor (PRIORIDADE TOTAL)
   * @returns Linha processada seguindo todas as restrições
   */
  static async generateThirdWayLine(
    originalLine: string,
    genre: string,
    genreRules: any,
    context: string,
    performanceMode = false,
    additionalRequirements?: string,
  ): Promise<string> {
    // Normalizar nome do gênero
    const normalizedGenre = genre.includes("Bachata") ? "Bachata Moderna" : genre
    const metrics = ADVANCED_BRAZILIAN_METRICS[normalizedGenre as GenreName] || ADVANCED_BRAZILIAN_METRICS.default

    try {
      // VARIAÇÃO A: Métrica perfeita (restrição rígida de sílabas)
      const variationA = await this.forceMetricVariation(
        originalLine,
        genre,
        genreRules,
        metrics,
        context,
        additionalRequirements,
      )

      // VARIAÇÃO B: Criatividade (restrição rígida de linguagem)
      const variationB = await this.forceCreativeVariation(
        originalLine,
        genre,
        genreRules,
        metrics,
        context,
        additionalRequirements,
      )

      // SÍNTESE: Combinar sob todas as restrições
      const finalLine = await this.forceFinalSynthesis(
        originalLine,
        variationA,
        variationB,
        genre,
        genreRules,
        metrics,
        context,
        additionalRequirements,
      )

      return finalLine
    } catch (error) {
      console.error("[v0] Erro na Terceira Via:", error)
      return originalLine // Em caso de erro, retorna a linha original
    }
  }

  private static async forceMetricVariation(
    line: string,
    genre: string,
    genreRules: any,
    metrics: any,
    context: string,
    additionalRequirements?: string,
  ): Promise<string> {
    const forbiddenList = genreRules?.language_rules?.forbidden
      ? Object.values(genreRules.language_rules.forbidden).flat()
      : []

    const universalRule =
      genreRules?.language_rules?.universal_rule ||
      "SEMPRE use palavras simples e coloquiais, faladas como um humano no dia-a-dia. Evite vocabulário rebuscado, poético ou formal."

    const languageOverride = additionalRequirements
      ? `\n\nEXCEÇÃO: O compositor especificou requisitos adicionais: "${additionalRequirements}". Siga estas instruções específicas.`
      : `\n\nREGRA UNIVERSAL INVIOLÁVEIS: ${universalRule}`

    const prompt = `RESTRIÇÕES ABSOLUTAS - VARIAÇÃO A (MÉTRICA):

LINHA: "${line}"
GÊNERO: ${genre}
LIMITE: ${metrics.maxSyllables} sílabas (ABSOLUTO - NÃO PODE EXCEDER)

REGRAS INVIOLÁVEIS:
1. MÁXIMO ${metrics.maxSyllables} SÍLABAS - qualquer linha com mais será REJEITADA
2. Use contrações: "para"→"pra", "você"→"cê", "está"→"tá", "estão"→"tão"
3. NUNCA quebre palavras (ex: "nãsãnossas" é PROIBIDO)
4. NUNCA use: ${forbiddenList.slice(0, 10).join(", ")}
5. Mantenha o significado emocional da linha original
6. PALAVRAS SIMPLES E COLOQUIAIS - fale como uma pessoa comum fala no dia-a-dia${languageOverride}

CONTEXTO: ${context}

RETORNE APENAS A LINHA REESCRITA (sem explicações, sem aspas, sem comentários).`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.3,
    })

    return text.trim().replace(/^["']|["']$/g, "")
  }

  private static async forceCreativeVariation(
    line: string,
    genre: string,
    genreRules: any,
    metrics: any,
    context: string,
    additionalRequirements?: string,
  ): Promise<string> {
    const allowedList = genreRules?.language_rules?.allowed
      ? Object.values(genreRules.language_rules.allowed).flat()
      : []
    const forbiddenList = genreRules?.language_rules?.forbidden
      ? Object.values(genreRules.language_rules.forbidden).flat()
      : []

    const universalRule =
      genreRules?.language_rules?.universal_rule ||
      "SEMPRE use palavras simples e coloquiais, faladas como um humano no dia-a-dia. Evite vocabulário rebuscado, poético ou formal."

    const languageOverride = additionalRequirements
      ? `\n\nEXCEÇÃO: O compositor especificou requisitos adicionais: "${additionalRequirements}". Siga estas instruções específicas.`
      : `\n\nREGRA UNIVERSAL INVIOLÁVEIS: ${universalRule}`

    const prompt = `RESTRIÇÕES ABSOLUTAS - VARIAÇÃO B (CRIATIVIDADE):

LINHA: "${line}"
GÊNERO: ${genre}
LIMITE: ${metrics.maxSyllables} sílabas (ABSOLUTO)

REGRAS INVIOLÁVEIS:
1. MÁXIMO ${metrics.maxSyllables} SÍLABAS
2. USE APENAS elementos permitidos: ${allowedList.slice(0, 15).join(", ")}
3. PROIBIDO usar: ${forbiddenList.slice(0, 10).join(", ")}
4. NUNCA quebre palavras
5. Evite clichês de IA: "coração partido", "alma vazia", "dor profunda"
6. Use imagens CONCRETAS e VISUAIS (não abstratas)
7. PALAVRAS SIMPLES DO DIA-A-DIA - como uma pessoa comum fala${languageOverride}

CONTEXTO: ${context}

RETORNE APENAS A LINHA REESCRITA (sem explicações, sem aspas, sem comentários).`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.7,
    })

    return text.trim().replace(/^["']|["']$/g, "")
  }

  private static async forceFinalSynthesis(
    original: string,
    variationA: string,
    variationB: string,
    genre: string,
    genreRules: any,
    metrics: any,
    context: string,
    additionalRequirements?: string,
  ): Promise<string> {
    const syllablesA = countSyllables(variationA)
    const syllablesB = countSyllables(variationB)
    const forbiddenList = genreRules?.language_rules?.forbidden
      ? Object.values(genreRules.language_rules.forbidden).flat()
      : []

    const universalRule =
      genreRules?.language_rules?.universal_rule ||
      "SEMPRE use palavras simples e coloquiais, faladas como um humano no dia-a-dia. Evite vocabulário rebuscado, poético ou formal."

    const languageOverride = additionalRequirements
      ? `\n\nEXCEÇÃO: O compositor especificou requisitos adicionais: "${additionalRequirements}". Siga estas instruções específicas.`
      : `\n\nREGRA UNIVERSAL INVIOLÁVEIS: ${universalRule}`

    const prompt = `SÍNTESE FINAL - TODAS AS RESTRIÇÕES APLICADAS:

ORIGINAL: "${original}"
VARIAÇÃO A (${syllablesA} sílabas): "${variationA}"
VARIAÇÃO B (${syllablesB} sílabas): "${variationB}"

TAREFA: Combine os MELHORES elementos de A e B.

RESTRIÇÕES ABSOLUTAS:
1. MÁXIMO ${metrics.maxSyllables} SÍLABAS (INVIOLÁVEL)
2. NUNCA use: ${forbiddenList.slice(0, 10).join(", ")}
3. NUNCA quebre palavras (mantenha espaços entre palavras)
4. Use a métrica de A + a criatividade de B
5. Palavras COMPLETAS e CORRETAS sempre
6. LINGUAGEM SIMPLES E COLOQUIAL - fale como uma pessoa comum no dia-a-dia${languageOverride}

GÊNERO: ${genre}
CONTEXTO: ${context}

RETORNE APENAS A LINHA FINAL (sem explicações, sem aspas, sem comentários).`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.5,
    })

    const finalLine = text.trim().replace(/^["']|["']$/g, "")

    const finalSyllables = countSyllables(finalLine)
    if (finalSyllables > metrics.maxSyllables) {
      return this.safeCompress(finalLine, metrics.maxSyllables)
    }

    return finalLine
  }

  private static safeCompress(line: string, maxSyllables: number): string {
    let compressed = line

    const contractions = [
      { from: /\bpara o\b/gi, to: "pro" },
      { from: /\bpara a\b/gi, to: "pra" },
      { from: /\bpara\b/gi, to: "pra" },
      { from: /\bestá\b/gi, to: "tá" },
      { from: /\bvocê\b/gi, to: "cê" },
      { from: /\bestão\b/gi, to: "tão" },
      { from: /\bde o\b/gi, to: "do" },
      { from: /\bde a\b/gi, to: "da" },
      { from: /\bem o\b/gi, to: "no" },
      { from: /\bem a\b/gi, to: "na" },
      { from: /\bque está\b/gi, to: "que tá" },
      { from: /\bque estão\b/gi, to: "que tão" },
    ]

    for (const { from, to } of contractions) {
      const test = compressed.replace(from, to)
      if (countSyllables(test) <= maxSyllables) {
        compressed = test
        return compressed
      }
    }

    // Melhor ter linha longa que palavra quebrada
    return line
  }
}

export function countPortugueseSyllables(text: string): number {
  return countSyllables(text)
}
