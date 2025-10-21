export interface GenerationVariation {
  lyrics: string
  score: number
  style: string
  strengths: string[]
  weaknesses: string[]
}

export interface MultiGenerationResult {
  variations: GenerationVariation[]
  bestVariationIndex: number
  bestScore: number
}

export class MultiGenerationEngine {
  /**
   * GERA MÚLTIPLAS VARIAÇÕES E ESCOLHE A MELHOR
   * Replica a lógica do gerador de refrão para TODO o processo
   */
  static async generateMultipleVariations(
    generateFn: () => Promise<string>,
    scoreFn: (lyrics: string) => number,
    count = 3,
  ): Promise<MultiGenerationResult> {
    console.log(`[MultiGeneration] 🎯 Gerando ${count} variações...`)

    const variations: GenerationVariation[] = []

    for (let i = 0; i < count; i++) {
      console.log(`[MultiGeneration] 📝 Gerando variação ${i + 1}/${count}...`)

      try {
        const lyrics = await generateFn()
        const score = scoreFn(lyrics)

        const variation: GenerationVariation = {
          lyrics,
          score,
          style: this.detectStyle(lyrics),
          strengths: this.analyzeStrengths(lyrics),
          weaknesses: this.analyzeWeaknesses(lyrics),
        }

        variations.push(variation)
        console.log(`[MultiGeneration] ✅ Variação ${i + 1} - Score: ${score}`)
      } catch (error) {
        console.error(`[MultiGeneration] ❌ Erro na variação ${i + 1}:`, error)
      }
    }

    if (variations.length === 0) {
      throw new Error("Falha ao gerar qualquer variação")
    }

    // Escolhe a melhor variação
    let bestIndex = 0
    let bestScore = variations[0].score

    for (let i = 1; i < variations.length; i++) {
      if (variations[i].score > bestScore) {
        bestScore = variations[i].score
        bestIndex = i
      }
    }

    console.log(`[MultiGeneration] 🏆 Melhor variação: ${bestIndex + 1} (Score: ${bestScore})`)

    return {
      variations,
      bestVariationIndex: bestIndex,
      bestScore,
    }
  }

  /**
   * DETECTA ESTILO DA LETRA
   */
  private static detectStyle(lyrics: string): string {
    const lowerLyrics = lyrics.toLowerCase()

    if (lowerLyrics.includes("cê") || lowerLyrics.includes("tô") || lowerLyrics.includes("pra")) {
      return "Coloquial Brasileiro"
    }

    if (lowerLyrics.match(/\b(amor|coração|paixão|saudade)\b/g)) {
      return "Romântico"
    }

    if (lowerLyrics.match(/\b(festa|balada|cerveja|boteco)\b/g)) {
      return "Festivo"
    }

    return "Narrativo"
  }

  /**
   * ANALISA PONTOS FORTES
   */
  private static analyzeStrengths(lyrics: string): string[] {
    const strengths: string[] = []
    const lines = lyrics.split("\n").filter((l) => l.trim() && !l.startsWith("[") && !l.startsWith("("))

    // Verifica linguagem coloquial
    if (lyrics.includes("cê") || lyrics.includes("tô") || lyrics.includes("pra")) {
      strengths.push("Linguagem coloquial autêntica")
    }

    // Verifica repetição (chorus memorável)
    const uniqueLines = new Set(lines)
    if (lines.length > uniqueLines.size) {
      strengths.push("Repetição estratégica (memorável)")
    }

    // Verifica frases curtas
    const avgLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length
    if (avgLength < 50) {
      strengths.push("Frases concisas e diretas")
    }

    return strengths
  }

  /**
   * ANALISA PONTOS FRACOS
   */
  private static analyzeWeaknesses(lyrics: string): string[] {
    const weaknesses: string[] = []
    const lines = lyrics.split("\n").filter((l) => l.trim() && !l.startsWith("[") && !l.startsWith("("))

    // Verifica palavras cortadas
    const hasIncompleteWords = lines.some((line) => {
      return line.match(/\b\w{1,2}ç\b|\b\w{1,2}ã\b/) !== null
    })

    if (hasIncompleteWords) {
      weaknesses.push("Palavras cortadas ou incompletas")
    }

    // Verifica versos muito longos
    const hasLongLines = lines.some((line) => line.length > 80)
    if (hasLongLines) {
      weaknesses.push("Versos muito longos")
    }

    // Verifica falta de repetição
    const uniqueLines = new Set(lines)
    if (lines.length === uniqueLines.size && lines.length > 10) {
      weaknesses.push("Falta repetição (menos memorável)")
    }

    return weaknesses
  }
}
