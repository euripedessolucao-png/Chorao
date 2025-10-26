import { WordIntegrityValidator } from "@/lib/validation/word-integrity-validator"
import { UltimateFixer } from "@/lib/validation/ultimate-fixer"

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
    count = 1, // Reduzido de 3 para 1
    genre?: string,
    theme?: string,
    genreConfig?: any,
  ): Promise<MultiGenerationResult> {
    const variations: GenerationVariation[] = []
    const maxAttempts = count * 2 // Máximo 2 tentativas

    let attempts = 0
    while (variations.length < count && attempts < maxAttempts) {
      attempts++

      try {
        let lyrics = await generateFn()

        if (!lyrics || typeof lyrics !== "string" || lyrics.trim().length === 0) {
          console.warn(`⚠️ Tentativa ${attempts} retornou lyrics inválido, pulando...`)
          continue
        }

        try {
          lyrics = UltimateFixer.fixFullLyrics(lyrics)
        } catch (fixerError) {
          console.warn("⚠️ UltimateFixer falhou, continuando sem correção")
        }

        // Validação de integridade
        const integrityCheck = WordIntegrityValidator.validate(lyrics)

        // Calculando score final
        let score = scoreFn(lyrics)

        if (!integrityCheck.isValid) {
          score = score * 0.7
        }

        const variation: GenerationVariation = {
          lyrics,
          score,
          style: this.detectStyle(lyrics),
          strengths: this.analyzeStrengths(lyrics),
          weaknesses: this.analyzeWeaknesses(lyrics),
        }

        variations.push(variation)
      } catch (error) {
        console.error("❌ Erro na tentativa", attempts, ":", error instanceof Error ? error.message : String(error))
        continue
      }
    }

    if (variations.length === 0) {
      const emergencyLyrics = this.generateEmergencyLyrics()
      variations.push({
        lyrics: emergencyLyrics,
        score: scoreFn(emergencyLyrics),
        style: "Emergência",
        strengths: ["Letra funcional"],
        weaknesses: ["Gerada como último recurso"],
      })
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

    return {
      variations,
      bestVariationIndex: bestIndex,
      bestScore,
    }
  }

  private static generateEmergencyLyrics(): string {
    return `[VERSE 1]
Letra gerada
Sistema funcionando
Tudo certo aqui

[CHORUS]
Tá tudo bem
Funcionando
Sistema ok

[VERSE 2]
Letra simples
Mas funciona
Tá valendo

[CHORUS]
Tá tudo bem
Funcionando
Sistema ok`
  }

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

  private static analyzeStrengths(lyrics: string): string[] {
    const strengths: string[] = []
    const lines = lyrics.split("\n").filter((l) => l.trim() && !l.startsWith("[") && !l.startsWith("("))

    if (lyrics.includes("cê") || lyrics.includes("tô") || lyrics.includes("pra")) {
      strengths.push("Linguagem coloquial autêntica")
    }

    const uniqueLines = new Set(lines)
    if (lines.length > uniqueLines.size) {
      strengths.push("Repetição estratégica")
    }

    const avgLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length
    if (avgLength < 50) {
      strengths.push("Frases concisas")
    }

    return strengths
  }

  private static analyzeWeaknesses(lyrics: string): string[] {
    const weaknesses: string[] = []
    const lines = lyrics.split("\n").filter((l) => l.trim() && !l.startsWith("[") && !l.startsWith("("))

    const hasIncompleteWords = lines.some((line) => {
      return line.match(/\b\w{1,2}ç\b|\b\w{1,2}ã\b/) !== null
    })

    if (hasIncompleteWords) {
      weaknesses.push("Palavras cortadas")
    }

    const hasLongLines = lines.some((line) => line.length > 80)
    if (hasLongLines) {
      weaknesses.push("Versos muito longos")
    }

    return weaknesses
  }
}
