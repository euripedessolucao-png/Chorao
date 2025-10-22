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

        // FASE 1: Correção de repetições
        console.log("[v0] 🔧 FASE 1 - Correção de repetições...")
        const repetitionFixResult = RepetitionValidator.fix(lyrics)
        if (repetitionFixResult.corrections > 0) {
          console.log("[v0] ✅ FASE 1 -", repetitionFixResult.corrections, "repetições removidas")
          lyrics = repetitionFixResult.correctedLyrics
        } else {
          console.log("[v0] ✅ FASE 1 - Nenhuma repetição encontrada")
        }

        // FASE 2: Correção agressiva de acentos
        console.log("[v0] 🔧 FASE 2 - Correção de acentos...")
        const accentFixResult = AggressiveAccentFixer.fix(lyrics)
        if (accentFixResult.corrections.length > 0) {
          console.log("[v0] ✅ FASE 2 -", accentFixResult.corrections.length, "palavras corrigidas")
          lyrics = accentFixResult.correctedText
        } else {
          console.log("[v0] ✅ FASE 2 - Nenhuma correção de acento necessária")
        }

        // FASE 2.5: Normalização de espaços
        console.log("[v0] 🔧 FASE 2.5 - Normalização de espaços...")
        const spaceReport = SpaceNormalizer.getNormalizationReport(lyrics, SpaceNormalizer.normalizeLyrics(lyrics))
        if (spaceReport.hadIssues) {
          console.log("[v0] ✅ FASE 2.5 -", spaceReport.spacesRemoved, "espaços duplicados removidos")
          lyrics = SpaceNormalizer.normalizeLyrics(lyrics)
        } else {
          console.log("[v0] ✅ FASE 2.5 - Nenhum espaço duplicado encontrado")
        }

        // FASE 3: Correção ultra agressiva de sílabas
        console.log("[v0] 🔧 FASE 3 - Correção ultra agressiva de sílabas...")
        const syllableFixResult = new UltraAggressiveSyllableReducer().correctFullLyrics(lyrics)
        console.log("[v0] 📊 FASE 3 - Resultado:", {
          correctedVerses: syllableFixResult.report.correctedVerses,
          totalVerses: syllableFixResult.report.totalVerses,
          failedVerses: syllableFixResult.report.failedVerses,
          successRate: syllableFixResult.report.successRate.toFixed(1) + "%",
        })

        if (syllableFixResult.report.correctedVerses > 0) {
          lyrics = syllableFixResult.correctedLyrics
        } else {
          console.log(`[MultiGeneration] ✅ FASE 3 - Todos os versos já têm 11 sílabas`)
        }

        if (genre && theme && genreConfig) {
          console.log("[v0] 🔧 FASE 3.5 - Terceira Via (análise e correção)...")
          const { analisarTerceiraVia, applyTerceiraViaToLine } = await import("@/lib/terceira-via")

          const terceiraViaAnalysis = analisarTerceiraVia(lyrics, genre, theme)

          if (terceiraViaAnalysis && terceiraViaAnalysis.score_geral < 75) {
            console.log("[v0] ⚠️ FASE 3.5 - Score Terceira Via baixo:", terceiraViaAnalysis.score_geral)
            console.log("[v0] 🔧 FASE 3.5 - Aplicando correções Terceira Via...")

            const lines = lyrics.split("\n")
            const correctedLines: string[] = []
            let correctionsApplied = 0

            for (let i = 0; i < lines.length; i++) {
              const line = lines[i]

              // Só corrige linhas que precisam
              if (line.trim() && !line.startsWith("[") && !line.startsWith("(") && !line.includes("Instruments:")) {
                try {
                  const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 2)).join("\n")
                  const correctedLine = await applyTerceiraViaToLine(line, i, context, false, "", genre, genreConfig)

                  if (correctedLine !== line) {
                    correctionsApplied++
                    console.log("[v0] 🔄 FASE 3.5 - Linha", i, "corrigida")
                  }

                  correctedLines.push(correctedLine)
                } catch (error) {
                  console.warn("[v0] ⚠️ FASE 3.5 - Erro na linha", i, ", mantendo original")
                  correctedLines.push(line)
                }
              } else {
                correctedLines.push(line)
              }
            }

            lyrics = correctedLines.join("\n")
            console.log("[v0] ✅ FASE 3.5 -", correctionsApplied, "correções Terceira Via aplicadas")

            // Aplicar AggressiveAccentFixer após Terceira Via
            console.log("[v0] 🔧 FASE 3.5 - Correção de acentos pós-Terceira Via...")
            const postTerceiraViaAccentFix = AggressiveAccentFixer.fix(lyrics)
            if (postTerceiraViaAccentFix.corrections.length > 0) {
              console.log("[v0] ✅ FASE 3.5 -", postTerceiraViaAccentFix.corrections.length, "palavras corrigidas")
              lyrics = postTerceiraViaAccentFix.correctedText
            }
          } else {
            console.log("[v0] ✅ FASE 3.5 - Score Terceira Via OK:", terceiraViaAnalysis?.score_geral || "N/A")
          }
        } else {
          console.log("[v0] ⚠️ FASE 3.5 - Terceira Via PULADA (faltam parâmetros genre/theme/genreConfig)")
        }

        // FASE 4: Correção de integridade de palavras
        console.log("[v0] 🔧 FASE 4 - Correção de integridade de palavras...")
        const fixResult = WordIntegrityValidator.fix(lyrics)
        if (fixResult.corrections > 0) {
          console.log("[v0] ✅ FASE 4 -", fixResult.corrections, "correções aplicadas")
          lyrics = fixResult.correctedLyrics
        } else {
          console.log("[v0] ✅ FASE 4 - Nenhuma correção de integridade necessária")
        }

        // FASE 5: Normalização final de espaços
        console.log("[v0] 🔧 FASE 5 - Normalização final de espaços...")
        const finalSpaceReport = SpaceNormalizer.getNormalizationReport(lyrics, SpaceNormalizer.normalizeLyrics(lyrics))
        if (finalSpaceReport.hadIssues) {
          console.log("[v0] ✅ FASE 5 -", finalSpaceReport.spacesRemoved, "espaços duplicados removidos")
          lyrics = SpaceNormalizer.normalizeLyrics(lyrics)
        } else {
          console.log("[v0] ✅ FASE 5 - Nenhum espaço duplicado encontrado")
        }

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

        // VALIDAÇÃO 2: Sílabas
        console.log("[v0] ✅ VALIDAÇÃO 2 - Sílabas...")
        const finalSyllableCheck = new UltraAggressiveSyllableReducer().correctFullLyrics(lyrics)
        if (finalSyllableCheck.report.failedVerses > 0) {
          console.warn("[v0] ⚠️ VALIDAÇÃO 2 FALHOU -", finalSyllableCheck.report.failedVerses, "versos incorretos")
          rejectedVariations.push({
            lyrics,
            reason: `${finalSyllableCheck.report.failedVerses} versos incorretos`,
            score: scoreFn(lyrics),
          })
          continue
        }
        console.log("[v0] ✅ VALIDAÇÃO 2 PASSOU")

        // VALIDAÇÃO 3: Espaços duplicados
        console.log("[v0] ✅ VALIDAÇÃO 3 - Espaços duplicados...")
        const lines = lyrics.split("\n")
        const linesWithMultipleSpaces = lines.filter((line) => SpaceNormalizer.hasMultipleSpaces(line))
        if (linesWithMultipleSpaces.length > 0) {
          console.warn("[v0] ⚠️ VALIDAÇÃO 3 FALHOU -", linesWithMultipleSpaces.length, "linhas com espaços duplicados")
          rejectedVariations.push({
            lyrics,
            reason: `${linesWithMultipleSpaces.length} linhas com espaços duplicados`,
            score: scoreFn(lyrics),
          })
          continue
        }
        console.log("[v0] ✅ VALIDAÇÃO 3 PASSOU")

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
