import { WordIntegrityValidator } from "@/lib/validation/word-integrity-validator"
import { AggressiveAccentFixer } from "@/lib/validation/aggressive-accent-fixer"
import { RepetitionValidator } from "@/lib/validation/repetition-validator"
import { UltraAggressiveSyllableReducer } from "@/lib/validation/ultra-aggressive-syllable-reducer"

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
   * COM CORREÇÃO ULTRA AGRESSIVA DE ACENTOS
   */
  static async generateMultipleVariations(
    generateFn: () => Promise<string>,
    scoreFn: (lyrics: string) => number,
    count = 3,
  ): Promise<MultiGenerationResult> {
    console.log(`[MultiGeneration] 🎯 Gerando ${count} variações...`)

    const variations: GenerationVariation[] = []
    const rejectedVariations: Array<{ lyrics: string; reason: string }> = []
    const maxAttempts = count * 5

    let attempts = 0
    while (variations.length < count && attempts < maxAttempts) {
      attempts++
      console.log(
        `[MultiGeneration] 📝 Tentativa ${attempts}/${maxAttempts} (${variations.length}/${count} válidas)...`,
      )

      try {
        let lyrics = await generateFn()

        console.log(`[MultiGeneration] 📄 Letra gerada (primeiras 200 chars):`)
        console.log(lyrics.substring(0, 200))

        // 1. CORREÇÃO DE REPETIÇÕES
        const repetitionFixResult = RepetitionValidator.fix(lyrics)
        if (repetitionFixResult.corrections > 0) {
          console.log(
            `[MultiGeneration] 🔧 CORREÇÃO DE REPETIÇÕES: ${repetitionFixResult.corrections} repetições removidas`,
          )
          lyrics = repetitionFixResult.correctedLyrics
        }

        // 2. CORREÇÃO ULTRA AGRESSIVA DE ACENTOS (NOVA API)
        console.log(`[MultiGeneration] 🔧 Aplicando correção ULTRA AGRESSIVA de acentos...`)
        const accentFixResult = AggressiveAccentFixer.completeFixAndValidate(lyrics)
        
        if (accentFixResult.appliedCorrections > 0) {
          console.log(
            `[MultiGeneration] 🔧 CORREÇÃO ULTRA AGRESSIVA DE ACENTOS: ${accentFixResult.appliedCorrections} correções aplicadas (Score: ${accentFixResult.validation.score}/100)`,
          )
          lyrics = accentFixResult.correctedLyrics
        }

        // 3. VALIDAÇÃO DE QUALIDADE APÓS CORREÇÃO DE ACENTOS
        if (accentFixResult.validation.score < 70) {
          console.warn(`[MultiGeneration] ⚠️ Baixa qualidade após correção: ${accentFixResult.validation.score}/100`)
          rejectedVariations.push({
            lyrics,
            reason: `Baixa qualidade de acentuação: ${accentFixResult.validation.score}/100`,
          })
          continue
        }

        // 4. CORREÇÃO ULTRA AGRESSIVA DE SÍLABAS
        console.log(`[MultiGeneration] 🎯 Aplicando correção ULTRA AGRESSIVA de sílabas...`)
        const syllableFixResult = new UltraAggressiveSyllableReducer().correctFullLyrics(lyrics)

        if (syllableFixResult.report.correctedVerses > 0) {
          console.log(
            `[MultiGeneration] 🔧 CORREÇÃO ULTRA AGRESSIVA DE SÍLABAS: ${syllableFixResult.report.correctedVerses}/${syllableFixResult.report.totalVerses} versos corrigidos (${syllableFixResult.report.successRate.toFixed(1)}% sucesso)`,
          )
          lyrics = syllableFixResult.correctedLyrics
        } else {
          console.log(`[MultiGeneration] ✅ Todos os versos já têm 11 sílabas`)
        }

        // 5. CORREÇÃO DE INTEGRIDADE DE PALAVRAS
        const integrityFixResult = WordIntegrityValidator.fix(lyrics)
        if (integrityFixResult.corrections > 0) {
          console.log(`[MultiGeneration] 🔧 Aplicadas ${integrityFixResult.corrections} correções de integridade:`)
          integrityFixResult.details.forEach((detail) => {
            console.log(`  - "${detail.original}" → "${detail.corrected}"`)
          })
          lyrics = integrityFixResult.correctedLyrics
        }

        // 6. VALIDAÇÃO FINAL DE INTEGRIDADE
        const integrityCheck = WordIntegrityValidator.validate(lyrics)
        if (!integrityCheck.isValid) {
          console.warn(`[MultiGeneration] ⚠️ Tentativa ${attempts} AINDA tem problemas após correção:`)
          integrityCheck.errors.forEach((error) => {
            console.warn(
              `  - Linha ${error.lineNumber}: "${error.word}"${error.suggestion ? ` → sugestão: "${error.suggestion}"` : ""}`,
            )
          })
          rejectedVariations.push({
            lyrics,
            reason: `Palavras cortadas não corrigíveis: ${integrityCheck.errors.map((e) => e.word).join(", ")}`,
          })
          continue
        }

        // 7. VALIDAÇÃO FINAL DE SÍLABAS
        const finalSyllableCheck = new UltraAggressiveSyllableReducer().correctFullLyrics(lyrics)
        if (finalSyllableCheck.report.successRate < 80) {
          console.warn(
            `[MultiGeneration] ⚠️ Tentativa ${attempts} AINDA tem ${finalSyllableCheck.report.failedVerses} versos com sílabas incorretas`,
          )
          rejectedVariations.push({
            lyrics,
            reason: `${finalSyllableCheck.report.failedVerses} versos com sílabas incorretas (${finalSyllableCheck.report.successRate.toFixed(1)}% sucesso)`,
          })
          continue
        }

        // 8. CALCULAR SCORE E ADICIONAR Variação VÁLIDA
        const score = scoreFn(lyrics)

        // Score mínimo para aceitação
        if (score < 0.4) {
          rejectedVariations.push({
            lyrics,
            reason: `Score muito baixo: ${score}`,
          })
          continue
        }

        const variation: GenerationVariation = {
          lyrics,
          score,
          style: this.detectStyle(lyrics),
          strengths: this.analyzeStrengths(lyrics),
          weaknesses: this.analyzeWeaknesses(lyrics),
        }

        variations.push(variation)
        console.log(`[MultiGeneration] ✅ Variação ${variations.length} válida - Score: ${score.toFixed(2)}`)

      } catch (error) {
        console.error(`[MultiGeneration] ❌ Erro na tentativa ${attempts}:`, error)
        rejectedVariations.push({
          lyrics: "",
          reason: `Erro: ${error instanceof Error ? error.message : String(error)}`,
        })
      }
    }

    // FALLBACK PARA CASO NENHUMA VARIAÇÃO SEJA VÁLIDA
    if (variations.length === 0) {
      console.error(`[MultiGeneration] ❌ Nenhuma variação válida após ${attempts} tentativas`)
      console.error(`[MultiGeneration] 📋 Variações rejeitadas:`)
      rejectedVariations.forEach((rejected, index) => {
        console.error(`  ${index + 1}. ${rejected.reason}`)
      })

      // Tenta usar a melhor variação rejeitada como fallback
      if (rejectedVariations.length > 0 && rejectedVariations[0].lyrics) {
        console.warn(`[MultiGeneration] ⚠️ Usando variação rejeitada como fallback`)
        const fallbackLyrics = rejectedVariations[0].lyrics
        const fallbackScore = scoreFn(fallbackLyrics)

        variations.push({
          lyrics: fallbackLyrics,
          score: fallbackScore,
          style: this.detectStyle(fallbackLyrics),
          strengths: ["Fallback - melhor tentativa disponível"],
          weaknesses: [rejectedVariations[0].reason],
        })
      } else {
        throw new Error(
          `Falha ao gerar qualquer variação válida após ${attempts} tentativas. Razões: ${rejectedVariations.map((r) => r.reason).join("; ")}`,
        )
      }
    }

    // ESCOLHE A MELHOR VARIAÇÃO
    let bestIndex = 0
    let bestScore = variations[0].score

    for (let i = 1; i < variations.length; i++) {
      if (variations[i].score > bestScore) {
        bestScore = variations[i].score
        bestIndex = i
      }
    }

    console.log(`[MultiGeneration] 🏆 Melhor variação: ${bestIndex + 1} (Score: ${bestScore.toFixed(2)})`)

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

    // Verifica acentuação correta
    const accentValidation = AggressiveAccentFixer.validateStrict(lyrics)
    if (accentValidation.score >= 90) {
      strengths.push("Acentuação perfeita")
    }

    // Verifica repetição (chorus memorável)
    const uniqueLines = new Set(lines)
    if (lines.length > uniqueLines.size) {
      strengths.push("Repetição estratégica (memorável)")
    }

    // Verifica estrutura consistente
    const syllableCheck = new UltraAggressiveSyllableReducer().correctFullLyrics(lyrics)
    if (syllableCheck.report.successRate >= 90) {
      strengths.push("Métrica consistente")
    }

    return strengths
  }

  /**
   * ANALISA PONTOS FRACOS
   */
  private static analyzeWeaknesses(lyrics: string): string[] {
    const weaknesses: string[] = []
    const lines = lyrics.split("\n").filter((l) => l.trim() && !l.startsWith("[") && !l.startsWith("("))

    // Verifica qualidade de acentuação
    const accentValidation = AggressiveAccentFixer.validateStrict(lyrics)
    if (accentValidation.score < 80) {
      weaknesses.push(`Problemas de acentuação (${accentValidation.score}/100)`)
    }

    // Verifica sílabas
    const syllableCheck = new UltraAggressiveSyllableReducer().correctFullLyrics(lyrics)
    if (syllableCheck.report.successRate < 80) {
      weaknesses.push(`Problemas de métrica (${syllableCheck.report.successRate.toFixed(1)}% sucesso)`)
    }

    // Verifica palavras cortadas
    const integrityCheck = WordIntegrityValidator.validate(lyrics)
    if (!integrityCheck.isValid) {
      weaknesses.push("Palavras cortadas ou incompletas")
    }

    return weaknesses
  }
}
