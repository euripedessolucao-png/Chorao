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
    count = 3,
    genre?: string,
    theme?: string,
    genreConfig?: any,
  ): Promise<MultiGenerationResult> {
    console.log("[v0] 🎯 MultiGenerationEngine - INÍCIO")
    console.log("[v0] 📊 Gerando", count, "variações")

    const variations: GenerationVariation[] = []
    const rejectedVariations: Array<{ lyrics: string; reason: string; score: number }> = []
    const maxAttempts = count * 3 // Tenta até 3x mais para garantir versões válidas

    let attempts = 0
    while (variations.length < count && attempts < maxAttempts) {
      attempts++
      console.log("[v0] 🔄 Tentativa", attempts, "de", maxAttempts, "- Válidas:", variations.length, "/", count)

      try {
        console.log("[v0] 📝 Chamando generateFn...")
        let lyrics = await generateFn()
        console.log("[v0] ✅ generateFn retornou letra - Length:", lyrics.length)

        console.log("[v0] 🔧 APLICANDO ULTIMATEFIXER - Correção completa em uma única etapa...")
        lyrics = UltimateFixer.fixFullLyrics(lyrics)
        console.log("[v0] ✅ ULTIMATEFIXER concluído")

        // VALIDAÇÃO 1: Integridade de palavras
        console.log("[v0] ✅ VALIDAÇÃO 1 - Integridade de palavras...")
        const integrityCheck = WordIntegrityValidator.validate(lyrics)
        if (!integrityCheck.isValid) {
          console.warn("[v0] ⚠️ VALIDAÇÃO 1 FALHOU - Problemas de integridade:", integrityCheck.errors.length)
          rejectedVariations.push({
            lyrics,
            reason: `Palavras cortadas: ${integrityCheck.errors.map((e) => e.word).join(", ")}`,
            score: scoreFn(lyrics),
          })
          continue
        }
        console.log("[v0] ✅ VALIDAÇÃO 1 PASSOU")

        // VALIDAÇÃO 2: Espaços duplicados
        console.log("[v0] ✅ VALIDAÇÃO 2 - Espaços duplicados...")
        const lines = lyrics.split("\n")
        const linesWithMultipleSpaces = lines.filter((line) => /\s{2,}/.test(line))
        if (linesWithMultipleSpaces.length > 0) {
          console.warn("[v0] ⚠️ VALIDAÇÃO 2 FALHOU -", linesWithMultipleSpaces.length, "linhas com espaços duplicados")
          rejectedVariations.push({
            lyrics,
            reason: `${linesWithMultipleSpaces.length} linhas com espaços duplicados`,
            score: scoreFn(lyrics),
          })
          continue
        }
        console.log("[v0] ✅ VALIDAÇÃO 2 PASSOU")

        // Calculando score final
        console.log("[v0] 📊 Calculando score final...")
        const score = scoreFn(lyrics)
        console.log("[v0] ✅ Score calculado:", score)

        const variation: GenerationVariation = {
          lyrics,
          score,
          style: this.detectStyle(lyrics),
          strengths: this.analyzeStrengths(lyrics),
          weaknesses: this.analyzeWeaknesses(lyrics),
        }

        variations.push(variation)
        console.log("[v0] 🎉 Variação", variations.length, "ACEITA - Score:", score)
      } catch (error) {
        console.error("[v0] ❌ Erro na tentativa", attempts, ":", error)
        console.error("[v0] 📍 Stack trace:", error instanceof Error ? error.stack : "N/A")
        rejectedVariations.push({
          lyrics: "",
          reason: `Erro: ${error instanceof Error ? error.message : String(error)}`,
          score: 0,
        })
      }
    }

    if (variations.length === 0) {
      console.error("[v0] 💥 NENHUMA VARIAÇÃO VÁLIDA após", attempts, "tentativas")
      console.error("[v0] 📋 Variações rejeitadas:", rejectedVariations.length)

      const validRejected = rejectedVariations.filter((r) => r.lyrics && r.lyrics.length > 0)

      if (validRejected.length > 0) {
        // Ordena por score (melhor primeiro)
        validRejected.sort((a, b) => b.score - a.score)
        const bestRejected = validRejected[0]

        console.warn("[v0] ⚠️ Usando melhor variação rejeitada como fallback (Score:", bestRejected.score, ")")
        console.warn("[v0] ⚠️ Motivo da rejeição:", bestRejected.reason)

        variations.push({
          lyrics: bestRejected.lyrics,
          score: bestRejected.score,
          style: this.detectStyle(bestRejected.lyrics),
          strengths: ["Melhor tentativa disponível"],
          weaknesses: [bestRejected.reason],
        })
      } else {
        console.error("[v0] 🚨 EMERGÊNCIA: Gerando letra simples como último recurso")
        const emergencyLyrics = this.generateEmergencyLyrics()
        const emergencyScore = scoreFn(emergencyLyrics)

        variations.push({
          lyrics: emergencyLyrics,
          score: emergencyScore,
          style: "Emergência",
          strengths: ["Letra de emergência funcional"],
          weaknesses: ["Gerada como último recurso"],
        })
      }
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

    console.log("[v0] 🏆 Escolhendo melhor variação...")
    console.log("[v0] 🎉 MultiGenerationEngine - SUCESSO")
    console.log("[v0] 📊 Resultado final: Melhor variação índice", bestIndex, "- Score:", bestScore)

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
