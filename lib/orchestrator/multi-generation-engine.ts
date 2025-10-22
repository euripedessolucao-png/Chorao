import { WordIntegrityValidator } from "@/lib/validation/word-integrity-validator"
import { AggressiveAccentFixer } from "@/lib/validation/aggressive-accent-fixer"
import { RepetitionValidator } from "@/lib/validation/repetition-validator"
import { UltraAggressiveSyllableReducer } from "@/lib/validation/ultra-aggressive-syllable-reducer"
import { SpaceNormalizer } from "@/lib/validation/space-normalizer"

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
    const rejectedVariations: Array<{ lyrics: string; reason: string }> = []
    const maxAttempts = count * 3 // Tenta até 3x mais para garantir versões válidas

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

        // FASE 1: Correção de repetições
        const repetitionFixResult = RepetitionValidator.fix(lyrics)
        if (repetitionFixResult.corrections > 0) {
          console.log(
            `[MultiGeneration] 🔧 FASE 1 - REPETIÇÕES: ${repetitionFixResult.corrections} repetições removidas`,
          )
          lyrics = repetitionFixResult.correctedLyrics
        }

        // FASE 2: Correção agressiva de acentos
        const accentFixResult = AggressiveAccentFixer.fix(lyrics)
        if (accentFixResult.corrections.length > 0) {
          console.log(
            `[MultiGeneration] 🔧 FASE 2 - ACENTOS: ${accentFixResult.corrections.length} palavras corrigidas:`,
          )
          accentFixResult.corrections.forEach((correction) => {
            console.log(`  - "${correction.original}" → "${correction.corrected}" (${correction.count}x)`)
          })
          lyrics = accentFixResult.correctedText
        }

        const spaceReport = SpaceNormalizer.getNormalizationReport(lyrics, SpaceNormalizer.normalizeLyrics(lyrics))
        if (spaceReport.hadIssues) {
          console.log(
            `[MultiGeneration] 🔧 FASE 2.5 - ESPAÇOS: ${spaceReport.spacesRemoved} espaços duplicados removidos em ${spaceReport.linesAffected} linhas`,
          )
          lyrics = SpaceNormalizer.normalizeLyrics(lyrics)
        }

        // FASE 3: Correção ultra agressiva de sílabas
        console.log(`[MultiGeneration] 🎯 FASE 3 - Aplicando correção ULTRA AGRESSIVA de sílabas...`)
        const syllableFixResult = new UltraAggressiveSyllableReducer().correctFullLyrics(lyrics)

        if (syllableFixResult.report.correctedVerses > 0) {
          console.log(
            `[MultiGeneration] 🔧 FASE 3 - SÍLABAS: ${syllableFixResult.report.correctedVerses}/${syllableFixResult.report.totalVerses} versos corrigidos (${syllableFixResult.report.successRate.toFixed(1)}% sucesso)`,
          )
          lyrics = syllableFixResult.correctedLyrics
        } else {
          console.log(`[MultiGeneration] ✅ FASE 3 - Todos os versos já têm 11 sílabas`)
        }

        // FASE 4: Correção de integridade de palavras
        const fixResult = WordIntegrityValidator.fix(lyrics)
        if (fixResult.corrections > 0) {
          console.log(`[MultiGeneration] 🔧 FASE 4 - INTEGRIDADE: ${fixResult.corrections} correções aplicadas:`)
          fixResult.details.forEach((detail) => {
            console.log(`  - "${detail.original}" → "${detail.corrected}"`)
          })
          lyrics = fixResult.correctedLyrics
        }

        const finalSpaceReport = SpaceNormalizer.getNormalizationReport(lyrics, SpaceNormalizer.normalizeLyrics(lyrics))
        if (finalSpaceReport.hadIssues) {
          console.log(
            `[MultiGeneration] 🔧 FASE 5 - ESPAÇOS FINAIS: ${finalSpaceReport.spacesRemoved} espaços duplicados removidos`,
          )
          lyrics = SpaceNormalizer.normalizeLyrics(lyrics)
        }

        // VALIDAÇÃO 1: Integridade de palavras
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

        // VALIDAÇÃO 2: Sílabas
        const finalSyllableCheck = new UltraAggressiveSyllableReducer().correctFullLyrics(lyrics)
        if (finalSyllableCheck.report.failedVerses > 0) {
          console.warn(
            `[MultiGeneration] ⚠️ Tentativa ${attempts} AINDA tem ${finalSyllableCheck.report.failedVerses} versos com sílabas incorretas`,
          )
          rejectedVariations.push({
            lyrics,
            reason: `${finalSyllableCheck.report.failedVerses} versos com sílabas incorretas (${finalSyllableCheck.report.successRate.toFixed(1)}% sucesso)`,
          })
          continue
        }

        const lines = lyrics.split("\n")
        const linesWithMultipleSpaces = lines.filter((line) => SpaceNormalizer.hasMultipleSpaces(line))
        if (linesWithMultipleSpaces.length > 0) {
          console.warn(
            `[MultiGeneration] ⚠️ Tentativa ${attempts} AINDA tem ${linesWithMultipleSpaces.length} linhas com espaços duplicados:`,
          )
          linesWithMultipleSpaces.forEach((line, index) => {
            console.warn(`  ${index + 1}. "${line}"`)
          })
          rejectedVariations.push({
            lyrics,
            reason: `${linesWithMultipleSpaces.length} linhas com espaços duplicados`,
          })
          continue
        }

        const score = scoreFn(lyrics)

        const variation: GenerationVariation = {
          lyrics,
          score,
          style: this.detectStyle(lyrics),
          strengths: this.analyzeStrengths(lyrics),
          weaknesses: this.analyzeWeaknesses(lyrics),
        }

        variations.push(variation)
        console.log(`[MultiGeneration] ✅ Variação ${variations.length} válida - Score: ${score}`)
      } catch (error) {
        console.error(`[MultiGeneration] ❌ Erro na tentativa ${attempts}:`, error)
        rejectedVariations.push({
          lyrics: "",
          reason: `Erro: ${error instanceof Error ? error.message : String(error)}`,
        })
      }
    }

    if (variations.length === 0) {
      console.error(`[MultiGeneration] ❌ Nenhuma variação válida após ${attempts} tentativas`)
      console.error(`[MultiGeneration] 📋 Variações rejeitadas:`)
      rejectedVariations.forEach((rejected, index) => {
        console.error(`  ${index + 1}. ${rejected.reason}`)
      })

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
