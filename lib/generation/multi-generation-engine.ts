/**
 * Multi Generation Engine
 * Gera múltiplas variações e escolhe a melhor
 */

export interface GenerationVariation {
  lyrics: string
  score: number
}

export interface MultiGenerationResult {
  variations: GenerationVariation[]
  bestVariationIndex: number
  bestScore: number
}

export class MultiGenerationEngine {
  /**
   * Gera múltiplas variações e retorna a melhor
   */
  static async generateMultipleVariations(
    generator: () => Promise<string>,
    scorer: (lyrics: string) => number,
    count = 3,
  ): Promise<MultiGenerationResult> {
    console.log(`[MultiGenerationEngine] Gerando ${count} variações...`)

    const variations: GenerationVariation[] = []

    for (let i = 0; i < count; i++) {
      try {
        console.log(`[MultiGenerationEngine] Variação ${i + 1}/${count}...`)
        const lyrics = await generator()
        const score = scorer(lyrics)

        variations.push({ lyrics, score })
        console.log(`[MultiGenerationEngine] Variação ${i + 1} score: ${score.toFixed(1)}`)
      } catch (error) {
        console.error(`[MultiGenerationEngine] Erro na variação ${i + 1}:`, error)
        // Continua para próxima variação
      }
    }

    if (variations.length === 0) {
      throw new Error("Nenhuma variação foi gerada com sucesso")
    }

    // Encontra a melhor variação
    let bestIndex = 0
    let bestScore = variations[0].score

    for (let i = 1; i < variations.length; i++) {
      if (variations[i].score > bestScore) {
        bestScore = variations[i].score
        bestIndex = i
      }
    }

    console.log(`[MultiGenerationEngine] Melhor variação: ${bestIndex + 1} com score ${bestScore.toFixed(1)}`)

    return {
      variations,
      bestVariationIndex: bestIndex,
      bestScore,
    }
  }
}
