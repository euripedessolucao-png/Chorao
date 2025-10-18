/**
 * ═══════════════════════════════════════════════════════════════════════════
 * META-COMPOSITOR INTELIGENTE - SISTEMA AUTÔNOMO DE COMPOSIÇÃO HARMONIZADO
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Versão: 3.0 - Sistema Universal de Polimento por Gênero
 *
 * FUNCIONALIDADES PRINCIPAIS:
 * • Composição inteligente com controle de sílabas (7-11 por verso)
 * • Sistema Universal de Polimento específico por gênero
 * • Correção automática de rimas (mínimo 40-60% rimas ricas por gênero)
 * • Integração com Terceira Via para originalidade
 * • Preservação de refrões selecionados
 * • Validação rigorosa de qualidade
 * • Tratamento robusto de erros com fallbacks
 *
 * TRATAMENTO DE ERROS:
 * • Try-catch em todas as operações críticas
 * • Fallbacks automáticos para modos mais simples
 * • Retorno de melhor resultado parcial em caso de erro
 * • Logs detalhados para debugging
 *
 * @author Sistema Chorão Compositor
 * @version 3.0.0
 * @lastUpdated 2025-01-18
 */

import { generateText } from "ai"
import { getGenreConfig } from "@/lib/genre-config"
import { validateFullLyricAgainstForcing } from "@/lib/validation/anti-forcing-validator"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter"
import { SyllableEnforcer } from "@/lib/validation/syllableEnforcer"
import { ThirdWayEngine } from "@/lib/third-way-converter"
import { generateRhymeReport, enhanceLyricsRhymes } from "@/lib/validation/rhyme-enhancer"

export interface CompositionRequest {
  genre: string
  theme: string
  mood: string
  additionalRequirements?: string
  hook?: string
  chorus?: string[]
  title?: string
  performanceMode?: boolean
  creativity?: "conservador" | "equilibrado" | "ousado"
  syllableTarget?: {
    min: number
    max: number
    ideal: number
  }
  preserveRhymes?: boolean
  applyTerceiraVia?: boolean
  applyFinalPolish?: boolean
  preservedChoruses?: string[]
  originalLyrics?: string // Adicionado para uso em rewriteWithPreservedChoruses
}

export interface CompositionResult {
  lyrics: string
  title: string
  validation: {
    passed: boolean
    errors: string[]
    warnings: string[]
    syllableStats: {
      totalLines: number
      linesWithinLimit: number
      maxSyllablesFound: number
      averageSyllables: number
    }
    terceiraViaScore?: number
    rhymePreservation?: number
  }
  metadata: {
    iterations: number
    refinements: number
    finalScore: number
    terceiraViaAnalysis?: any
    rhymeAnalysis?: any
    polishingApplied?: boolean
    preservedChorusesUsed?: boolean
  }
}

export class MetaComposer {
  private static readonly MAX_ITERATIONS = 3
  private static readonly MIN_QUALITY_SCORE = 0.8
  private static readonly ENABLE_AUTO_REFINEMENT = true
  private static readonly SYLLABLE_TARGET = { min: 7, max: 11, ideal: 9 }
  private static readonly PRESERVE_RHYMES = true
  private static readonly APPLY_TERCEIRA_VIA = true
  private static readonly APPLY_FINAL_POLISH = true

  /**
   * APLICA VALIDAÇÃO E CORREÇÃO DE RIMAS
   */
  private static async applyRhymeCorrection(lyrics: string, genre: string, theme: string): Promise<string> {
    console.log(`[RhymeCorrection] Validando rimas para ${genre}...`)

    const RHYME_CORRECTION_TIMEOUT = 10000 // 10 segundos máximo

    let rhymeReport
    try {
      rhymeReport = await Promise.race([
        Promise.resolve(generateRhymeReport(lyrics, genre)),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout no relatório de rimas")), RHYME_CORRECTION_TIMEOUT),
        ),
      ])
    } catch (reportError) {
      console.error("[RhymeCorrection] ⚠️ Erro ao gerar relatório, pulando correção:", reportError)
      return lyrics
    }

    // Se o score for baixo, aplica correção
    if (rhymeReport.overallScore < 60) {
      console.log(`[RhymeCorrection] Score baixo (${rhymeReport.overallScore}), aplicando correção...`)

      try {
        const enhancement = (await Promise.race([
          enhanceLyricsRhymes(lyrics, genre, theme),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout na correção de rimas")), RHYME_CORRECTION_TIMEOUT),
          ),
        ])) as any

        if (enhancement.enhancedScore > rhymeReport.overallScore) {
          console.log(
            `[RhymeCorrection] ✅ Rimas melhoradas: ${rhymeReport.overallScore} → ${enhancement.enhancedScore}`,
          )
          enhancement.improvements.forEach((imp: string) => console.log(`[RhymeCorrection] ${imp}`))

          return enhancement.enhancedLyrics
        }
      } catch (enhanceError) {
        console.error("[RhymeCorrection] ⚠️ Erro ou timeout ao corrigir rimas, mantendo original:", enhanceError)
        return lyrics
      }
    } else {
      console.log(`[RhymeCorrection] ✅ Rimas OK: Score ${rhymeReport.overallScore}`)
    }

    return lyrics
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * COMPOSIÇÃO INTELIGENTE - SISTEMA UNIVERSAL DE QUALIDADE
   * ═══════════════════════════════════════════════════════════════════════════
   *
   * Método principal que orquestra todo o processo de composição com:
   * • Validação de entrada
   * • Geração inteligente com controle de qualidade
   * • Aplicação de Terceira Via
   * • Correção automática de sílabas e rimas
   * • Polimento específico por gênero
   * • Tratamento robusto de erros
   *
   * @param request - Parâmetros da composição
   * @returns CompositionResult com letra, validação e metadados
   * @throws Error se parâmetros obrigatórios estiverem faltando ou se falhar após todas iterações
   */
  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer] ═══ INICIANDO COMPOSIÇÃO COM SISTEMA UNIVERSAL ═══")

    if (!request.genre || !request.theme || !request.mood) {
      const missingParams = []
      if (!request.genre) missingParams.push("genre")
      if (!request.theme) missingParams.push("theme")
      if (!request.mood) missingParams.push("mood")

      const errorMsg =
        `Parâmetros obrigatórios faltando: ${missingParams.join(", ")}. ` +
        `Recebido: genre="${request.genre}", theme="${request.theme}", mood="${request.mood}"`

      console.error("[MetaComposer] ❌", errorMsg)
      throw new Error(errorMsg)
    }

    let iterations = 0
    let refinements = 0
    let bestResult: CompositionResult | null = null
    let bestScore = 0
    let polishingApplied = false
    let preservedChorusesUsed = false

    const syllableEnforcement = request.syllableTarget || this.SYLLABLE_TARGET
    const preserveRhymes = request.preserveRhymes ?? this.PRESERVE_RHYMES
    const applyTerceiraVia = request.applyTerceiraVia ?? this.APPLY_TERCEIRA_VIA
    const applyFinalPolish = request.applyFinalPolish ?? this.APPLY_FINAL_POLISH

    console.log(
      `[MetaComposer] Configuração: ${preserveRhymes ? "RIMAS PRESERVADAS" : "Rimas não preservadas"} | ${applyTerceiraVia ? "TERCEIRA VIA ATIVA" : "Terceira Via inativa"} | ${applyFinalPolish ? "POLIMENTO UNIVERSAL ATIVO" : "Polimento universal inativo"}`,
    )

    const preservedChoruses = request.preservedChoruses || []
    const hasPreservedChoruses = preservedChoruses.length > 0

    if (hasPreservedChoruses) {
      console.log(`[MetaComposer] 🎯 Modo preservação ativo: ${preservedChoruses.length} refrões selecionados`)
    }

    try {
      while (iterations < this.MAX_ITERATIONS) {
        iterations++
        console.log(`\n[MetaComposer] ═══ Iteração ${iterations}/${this.MAX_ITERATIONS} ═══`)

        let rawLyrics: string

        try {
          if (hasPreservedChoruses && iterations === 1) {
            console.log("[MetaComposer] Aplicando reescrita com refrões preservados...")
            rawLyrics = await this.rewriteWithPreservedChoruses(
              request.originalLyrics || "", // Usa originalLyrics do request
              preservedChoruses,
              request,
              syllableEnforcement,
            )
            preservedChorusesUsed = true
          } else {
            rawLyrics = await this.generateIntelligentLyrics(request, syllableEnforcement, preserveRhymes)
          }
        } catch (generationError) {
          console.error(`[MetaComposer] ❌ Erro na geração (iteração ${iterations}):`, generationError)

          if (iterations === 1) {
            console.log("[MetaComposer] 🔄 Tentando modo simplificado...")
            try {
              rawLyrics = await this.generateIntelligentLyrics(request, syllableEnforcement, false)
            } catch (fallbackError) {
              console.error("[MetaComposer] ❌ Fallback também falhou:", fallbackError)

              if (bestResult) {
                console.log("[MetaComposer] 🔄 Retornando melhor resultado parcial")
                return bestResult
              }

              throw new Error(
                `Falha na geração após fallback: ${fallbackError instanceof Error ? fallbackError.message : "Erro desconhecido"}`,
              )
            }
          } else {
            if (bestResult) {
              console.log("[MetaComposer] 🔄 Erro em iteração posterior, retornando melhor resultado")
              return bestResult
            }
            throw generationError
          }
        }

        // ✅ APLICA TERCEIRA VIA (se habilitado)
        let terceiraViaLyrics = rawLyrics
        let terceiraViaAnalysis = null

        if (applyTerceiraVia) {
          try {
            console.log("[MetaComposer] Aplicando princípios da Terceira Via...")
            terceiraViaLyrics = await this.applyTerceiraViaToLyrics(rawLyrics, request.genre, request.theme)
            terceiraViaAnalysis = this.analisarTerceiraVia(terceiraViaLyrics, request.genre, request.theme)
            console.log(`[MetaComposer] Score Terceira Via: ${terceiraViaAnalysis.score_geral}/100`)
          } catch (terceiraViaError) {
            console.error("[MetaComposer] ⚠️ Erro na Terceira Via, usando letra original:", terceiraViaError)
            terceiraViaLyrics = rawLyrics
          }
        }

        // ✅ CORREÇÃO DE SÍLABAS COM PRESERVAÇÃO DE RIMAS
        let enforcedResult
        try {
          enforcedResult = await SyllableEnforcer.enforceSyllableLimits(
            terceiraViaLyrics,
            syllableEnforcement,
            request.genre,
          )
          console.log(`[MetaComposer] Correções aplicadas: ${enforcedResult.corrections} linhas`)
        } catch (syllableError) {
          console.error("[MetaComposer] ⚠️ Erro na correção de sílabas:", syllableError)
          // Usa letra sem correção
          enforcedResult = {
            correctedLyrics: terceiraViaLyrics,
            corrections: 0,
            violations: [],
          }
        }

        // ✅ POLIMENTO UNIVERSAL POR GÊNERO (se habilitado)
        let finalLyrics = enforcedResult.correctedLyrics
        if (applyFinalPolish && iterations === this.MAX_ITERATIONS) {
          try {
            console.log("[MetaComposer] ✨ Aplicando polimento universal...")

            // Aplica polimento específico por gênero
            finalLyrics = await this.applyGenreSpecificPolish(
              enforcedResult.correctedLyrics,
              request.genre,
              syllableEnforcement,
            )

            // ✅ APLICA CORREÇÃO DE RIMAS SE NECESSÁRIO
            finalLyrics = await this.applyRhymeCorrection(finalLyrics, request.genre, request.theme)

            polishingApplied = true

            // ✅ VALIDAÇÃO FINAL UNIVERSAL
            const genreConfig = this.getGenreQualityConfig(request.genre)
            const finalValidation = this.validateRhymeQuality(finalLyrics, genreConfig)
            const syllableValidation = SyllableEnforcer.validateLyrics(finalLyrics, syllableEnforcement)

            console.log(`[MetaComposer] 📊 RELATÓRIO FINAL - ${request.genre}:`)
            console.log(`[MetaComposer] Sílabas: ${(syllableValidation.compliance * 100).toFixed(1)}% corretas`)
            console.log(
              `[MetaComposer] Rimas: ${(finalValidation.score * 100).toFixed(1)}% ricas (mínimo: ${genreConfig.minRhymeQuality * 100}%)`,
            )

            if (finalValidation.score < genreConfig.minRhymeQuality) {
              console.log(`[MetaComposer] ⚠️ ATENÇÃO: Rimas abaixo do padrão ${request.genre}`)
            }

            if (syllableValidation.problems.length > 0) {
              console.log("[MetaComposer] ⚠️ PROBLEMAS DE SÍLABA:")
              syllableValidation.problems
                .slice(0, 3)
                .forEach((problem) => console.log(`  - "${problem.line}" (${problem.syllables}s)`))
            }
          } catch (polishError) {
            console.error("[MetaComposer] ⚠️ Erro no polimento, usando letra sem polimento:", polishError)
            finalLyrics = enforcedResult.correctedLyrics
          }
        }

        // ✅ VALIDAÇÃO COMPREENSIVA
        let validation
        try {
          validation = await this.comprehensiveValidation(
            finalLyrics,
            request,
            syllableEnforcement,
            terceiraViaAnalysis,
          )
        } catch (validationError) {
          console.error("[MetaComposer] ⚠️ Erro na validação:", validationError)
          // Cria validação básica
          validation = {
            passed: false,
            errors: ["Erro na validação"],
            warnings: [],
            syllableStats: {
              totalLines: 0,
              linesWithinLimit: 0,
              maxSyllablesFound: 0,
              averageSyllables: 0,
            },
          }
        }

        // ✅ CÁLCULO DE SCORE HARMONIZADO
        const qualityScore = this.calculateHarmonizedQualityScore(
          finalLyrics,
          validation,
          request,
          syllableEnforcement,
          terceiraViaAnalysis,
          enforcedResult.corrections,
        )

        console.log(`[MetaComposer] Score de qualidade: ${qualityScore.toFixed(2)}`)
        console.log(
          `[MetaComposer] Estatísticas de sílabas: ${validation.syllableStats.linesWithinLimit}/${validation.syllableStats.totalLines} versos dentro do limite`,
        )

        // ✅ ATUALIZA MELHOR RESULTADO
        if (qualityScore > bestScore) {
          bestScore = qualityScore
          bestResult = {
            lyrics: finalLyrics,
            title: this.extractTitle(finalLyrics, request),
            validation,
            metadata: {
              iterations,
              refinements,
              finalScore: qualityScore,
              terceiraViaAnalysis,
              rhymeAnalysis: this.analyzeRhymePreservation(rawLyrics, finalLyrics),
              polishingApplied,
              preservedChorusesUsed,
            },
          }
        }

        // ✅ VERIFICA SE ATINGIU QUALIDADE MÍNIMA
        if (qualityScore >= this.MIN_QUALITY_SCORE && validation.passed) {
          console.log("[MetaComposer] ✅ Qualidade mínima atingida!")
          break
        }

        // ✅ REFINAMENTO AUTÔNOMO
        if (this.ENABLE_AUTO_REFINEMENT && iterations < this.MAX_ITERATIONS) {
          console.log("[MetaComposer] 🔄 Aplicando refinamento autônomo...")
          request = await this.autonomousRefinement(request, validation, syllableEnforcement, terceiraViaAnalysis)
          refinements++
        }
      }
    } catch (compositionError) {
      console.error("[MetaComposer] ❌ ERRO CRÍTICO DURANTE COMPOSIÇÃO:", compositionError)

      if (bestResult) {
        console.log("[MetaComposer] 🔄 Retornando melhor resultado parcial devido a erro")
        return bestResult
      }

      throw new Error(
        `Falha crítica na composição: ${compositionError instanceof Error ? compositionError.message : "Erro desconhecido"}. ` +
          `Iterações completadas: ${iterations}/${this.MAX_ITERATIONS}`,
      )
    }

    if (!bestResult) {
      throw new Error(
        `Falha ao gerar composição de qualidade mínima após ${this.MAX_ITERATIONS} iterações. ` +
          `Melhor score atingido: ${bestScore.toFixed(2)}`,
      )
    }

    // ✅ RELATÓRIO FINAL DETALHADO
    const finalValidation = SyllableEnforcer.validateLyrics(bestResult.lyrics, syllableEnforcement)
    console.log(`\n[MetaComposer] 📊 RELATÓRIO FINAL:`)
    console.log(`[MetaComposer] Conformidade: ${(finalValidation.compliance * 100).toFixed(1)}%`)
    console.log(`[MetaComposer] Sílabas: ${finalValidation.withinLimit}/${finalValidation.totalLines} versos corretos`)

    if (bestResult.metadata.terceiraViaAnalysis) {
      console.log(`[MetaComposer] Terceira Via: ${bestResult.metadata.terceiraViaAnalysis.score_geral}/100`)
    }

    if (bestResult.metadata.rhymeAnalysis) {
      console.log(`[MetaComposer] Rimas preservadas: ${bestResult.metadata.rhymeAnalysis.preservationRate}%`)
    }

    if (bestResult.metadata.preservedChorusesUsed) {
      console.log(`[MetaComposer] 🎯 Refrões preservados aplicados`)
    }

    if (bestResult.metadata.polishingApplied) {
      console.log(`[MetaComposer] ✨ Polimento universal aplicado`)
    }

    if (finalValidation.problems.length > 0) {
      console.log("[MetaComposer] ⚠️ VERSOS PROBLEMÁTICOS:")
      finalValidation.problems.forEach((problem) => {
        console.log(`  - "${problem.line}" (${problem.syllables}s)`)
      })
    }

    console.log(`[MetaComposer] 🎵 Composição finalizada! Score: ${bestScore.toFixed(2)}`)
    return bestResult
  }

  /**
   * SISTEMA UNIVERSAL DE POLIMENTO POR GÊNERO
   */
  private static async applyGenreSpecificPolish(
    lyrics: string,
    genre: string,
    syllableTarget: { min: number; max: number; ideal: number },
  ): Promise<string> {
    console.log(`[GenrePolish] Aplicando polimento específico para: ${genre}`)

    const genreConfig = this.getGenreQualityConfig(genre)
    const lines = lyrics.split("\n")
    const polishedLines: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Mantém marcações e backing vocals
      if (
        line.startsWith("[") ||
        line.startsWith("(") ||
        line.includes("Backing:") ||
        line.includes("Instrumentos:") ||
        line.includes("BPM:") ||
        !line.trim()
      ) {
        polishedLines.push(line)
        continue
      }

      const currentSyllables = countPoeticSyllables(line)
      const needsCorrection = currentSyllables < syllableTarget.min || currentSyllables > syllableTarget.max

      if (needsCorrection) {
        console.log(`[GenrePolish] Corrigindo linha ${i + 1}: "${line}" (${currentSyllables}s)`)

        try {
          const polishedLine = await this.polishLineForGenre(line, genre, syllableTarget, genreConfig)
          polishedLines.push(polishedLine)
        } catch (error) {
          console.error(`[GenrePolish] Erro, mantendo original:`, error)
          polishedLines.push(line)
        }
      } else {
        polishedLines.push(line)
      }
    }

    let finalLyrics = polishedLines.join("\n")

    // ✅ APLICA CORREÇÃO DE RIMAS SE NECESSÁRIO
    const rhymeValidation = this.validateRhymeQuality(finalLyrics, genreConfig)
    if (rhymeValidation.score < genreConfig.minRhymeQuality) {
      console.log(`[GenrePolish] Rimas insuficientes (${rhymeValidation.score}%), aplicando correção...`)
      finalLyrics = await this.enhanceRhymes(finalLyrics, genre, genreConfig)
    }

    // ✅ CORRIGE INSTRUMENTOS PARA INGLÊS
    finalLyrics = this.fixInstrumentsLanguage(finalLyrics)

    return finalLyrics
  }

  /**
   * CONFIGURAÇÃO DE QUALIDADE POR GÊNERO
   */
  private static getGenreQualityConfig(genre: string): {
    minRhymeQuality: number
    targetSyllables: { min: number; max: number; ideal: number }
    rhymePatterns: string[]
    languageStyle: string
  } {
    const genreLower = genre.toLowerCase()

    if (genreLower.includes("sertanejo")) {
      return {
        minRhymeQuality: 0.5, // 50% rimas ricas
        targetSyllables: { min: 9, max: 11, ideal: 10 },
        rhymePatterns: ["AABB", "ABAB", "ABBA"],
        languageStyle: "coloquial rural",
      }
    }

    if (genreLower.includes("mpb") || genreLower.includes("bossa")) {
      return {
        minRhymeQuality: 0.6, // 60% rimas ricas
        targetSyllables: { min: 7, max: 12, ideal: 9 },
        rhymePatterns: ["ABAB", "ABBA", "ABCD", "AABA"],
        languageStyle: "poético sofisticado",
      }
    }

    if (genreLower.includes("funk") || genreLower.includes("trap")) {
      return {
        minRhymeQuality: 0.3, // 30% rimas ricas
        targetSyllables: { min: 6, max: 10, ideal: 8 },
        rhymePatterns: ["AABB", "AAAA", "ABAB"],
        languageStyle: "urbano coloquial",
      }
    }

    if (genreLower.includes("forró") || genreLower.includes("piseiro")) {
      return {
        minRhymeQuality: 0.4, // 40% rimas ricas
        targetSyllables: { min: 8, max: 11, ideal: 9 },
        rhymePatterns: ["AABB", "ABAB"],
        languageStyle: "nordestino festivo",
      }
    }

    // Configuração padrão para outros gêneros
    return {
      minRhymeQuality: 0.4, // 40% rimas ricas
      targetSyllables: { min: 7, max: 11, ideal: 9 },
      rhymePatterns: ["AABB", "ABAB"],
      languageStyle: "coloquial brasileiro",
    }
  }

  /**
   * POLIMENTO DE LINHA ESPECÍFICO POR GÊNERO
   */
  private static async polishLineForGenre(
    line: string,
    genre: string,
    syllableTarget: { min: number; max: number; ideal: number },
    genreConfig: any,
  ): Promise<string> {
    const currentSyllables = countPoeticSyllables(line)

    const prompt = `POLIMENTO PROFISSIONAL - GÊNERO: ${genre.toUpperCase()}

LINHA ORIGINAL: "${line}"
SÍLABAS ATUAIS: ${currentSyllables} (ALVO: ${syllableTarget.min}-${syllableTarget.max})
ESTILO LINGUAGEM: ${genreConfig.languageStyle}
PADRÃO RIMAS: ${genreConfig.rhymePatterns.join(", ")}

REESCREVA ESTA LINHA PARA:
1. 📏 RESPEITAR ${syllableTarget.min}-${syllableTarget.max} sílabas poéticas
2. 🎵 MANTER contexto e significado original
3. 🎶 USAR linguagem autêntica do ${genre}
4. 💬 APLICAR estilo: ${genreConfig.languageStyle}
5. ✨ MELHORAR qualidade poética

TÉCNICAS OBRIGATÓRIAS:
• ${genre === "MPB" ? "Vocabulário poético sofisticado" : "Contrações naturais"}
• ${genre.includes("Sertanejo") ? 'Elisão rural: "meuamor", "tava"' : "Fluência natural"}
• Rimas preferenciais: ${genreConfig.rhymePatterns.join(", ")}

EXEMPLOS PARA ${genre.toUpperCase()}:
${this.getGenreExamples(genre)}

LINHA PARA POLIR: "${line}"

→ RETORNE APENAS A LINHA POLIDA:`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.3,
    })

    const polishedLine = text.trim().replace(/^["']|["']$/g, "")
    const polishedSyllables = countPoeticSyllables(polishedLine)

    const isImproved =
      polishedSyllables >= syllableTarget.min &&
      polishedSyllables <= syllableTarget.max &&
      polishedLine.length > line.length - 5

    return isImproved ? polishedLine : line
  }

  /**
   * MELHORA RIMAS AUTOMATICAMENTE
   */
  private static async enhanceRhymes(lyrics: string, genre: string, genreConfig: any): Promise<string> {
    const prompt = `MELHORIA DE RIMAS - GÊNERO: ${genre.toUpperCase()}

LETRA ORIGINAL:
${lyrics}

REQUISITOS:
- Gênero: ${genre}
- Mínimo ${genreConfig.minRhymeQuality * 100}% rimas ricas
- Padrões preferidos: ${genreConfig.rhymePatterns.join(", ")}
- Estilo: ${genreConfig.languageStyle}

TAREFA:
1. 🔧 REESCREVER versos para melhorar rimas
2. 🎯 GARANTIR mínimo ${genreConfig.minRhymeQuality * 100}% rimas ricas
3. 🎵 MANTER estrutura e significado original
4. 💬 USAR linguagem do ${genre}

TÉCNICAS:
• Rimas ricas (últimas 2-3 sílabas iguais)
• Variedade de padrões: ${genreConfig.rhymePatterns.join(", ")}
• Naturalidade na linguagem

RETORNE A LETRA COMPLETA MELHORADA:`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.4,
    })

    return text.trim()
  }

  /**
   * CORRIGE INSTRUMENTOS PARA INGLÊS
   */
  private static fixInstrumentsLanguage(lyrics: string): string {
    // Mapeamento de instrumentos em português para inglês
    const instrumentMap: { [key: string]: string } = {
      violão: "acoustic guitar",
      sanfona: "accordion",
      bateria: "drums",
      baixo: "bass",
      guitarra: "electric guitar",
      teclado: "keyboard",
      piano: "piano",
      saxofone: "saxophone",
      trompete: "trumpet",
      violino: "violin",
      viola: "viola",
      violoncelo: "cello",
      flauta: "flute",
      harmônica: "harmonica",
      cavaquinho: "cavaquinho",
      pandeiro: "tambourine",
      surdo: "bass drum",
      tamborim: "tamborim",
      agogô: "agogo",
      berimbau: "berimbau",
      "viola caipira": "acoustic viola",
      "guitarra elétrica": "electric guitar",
      "baixo elétrico": "electric bass",
      "bateria acústica": "acoustic drums",
      "teclado eletrônico": "electronic keyboard",
      sintetizador: "synthesizer",
      órgão: "organ",
      harpa: "harp",
    }

    // Encontra e substitui a linha de instrumentos
    const lines = lyrics.split("\n")
    const updatedLines = lines.map((line) => {
      if (line.includes("Instrumentos:") || line.includes("Instruments:")) {
        let instrumentLine = line

        // Substitui cada instrumento em português por inglês
        Object.entries(instrumentMap).forEach(([pt, en]) => {
          const regex = new RegExp(pt, "gi")
          instrumentLine = instrumentLine.replace(regex, en)
        })

        // Garante que está em inglês no formato correto
        if (instrumentLine.includes("Instrumentos:")) {
          instrumentLine = instrumentLine.replace("Instrumentos:", "Instruments:")
        }

        return instrumentLine
      }
      return line
    })

    return updatedLines.join("\n")
  }

  /**
   * VALIDAÇÃO DE QUALIDADE DE RIMAS
   */
  private static validateRhymeQuality(
    lyrics: string,
    genreConfig: any,
  ): {
    score: number
    totalPairs: number
    richRhymes: number
    patterns: string[]
  } {
    const lines = lyrics
      .split("\n")
      .filter(
        (line) =>
          line.trim() &&
          !line.startsWith("[") &&
          !line.startsWith("(") &&
          !line.includes("Backing:") &&
          !line.includes("Instruments:"),
      )

    let richRhymes = 0
    let totalPairs = 0
    const patterns: string[] = []

    // Analisa rimas em pares
    for (let i = 0; i < lines.length - 1; i += 2) {
      if (i + 1 < lines.length) {
        totalPairs++
        if (this.hasRichRhyme(lines[i], lines[i + 1])) {
          richRhymes++
          patterns.push("AB")
        } else {
          patterns.push("--")
        }
      }
    }

    return {
      score: totalPairs > 0 ? richRhymes / totalPairs : 0,
      totalPairs,
      richRhymes,
      patterns,
    }
  }

  /**
   * VERIFICA RIMA RICA ENTRE DUAS LINHAS
   */
  private static hasRichRhyme(line1: string, line2: string): boolean {
    const getLastWord = (line: string) => {
      const words = line.trim().split(/\s+/)
      return words[words.length - 1]?.toLowerCase().replace(/[.,!?;:]$/g, "") || ""
    }

    const word1 = getLastWord(line1)
    const word2 = getLastWord(line2)

    if (!word1 || !word2 || word1.length < 2 || word2.length < 2) return false

    // Rimas ricas: últimas 2-3 sílabas iguais
    const end1 = word1.slice(-3)
    const end2 = word2.slice(-3)

    return end1 === end2 || word1.slice(-2) === word2.slice(-2)
  }

  /**
   * EXEMPLOS POR GÊNERO
   */
  private static getGenreExamples(genre: string): string {
    const examples: { [key: string]: string } = {
      Sertanejo: `"Ela balança" → "Ela vem balançando pro meu lado"\n"Meu peito dói" → "Coração doi quando cê vai embora"`,
      MPB: `"O mar" → "O mar sereno beija a areia fina"\n"Amor" → "Amor que floresce no tempo certo"`,
      Funk: `"Ela dança" → "Ela rebola, a quebrada toda grita"\n"Na pista" → "No baile, o coração acelera"`,
      Forró: `"Xote bom" → "No xote a gente abraça e vai rodando"\n"Saudade" → "Saudade bate quando o forró para"`,
    }

    return examples[genre] || `"Linha exemplo" → "Linha melhorada com sílabas corretas"`
  }

  // 🔧 MÉTODOS AUXILIARES EXISTENTES (mantidos da versão anterior)

  private static async rewriteWithPreservedChoruses(
    originalLyrics: string,
    selectedChoruses: string[],
    request: CompositionRequest,
    syllableEnforcement: { min: number; max: number; ideal: number },
  ): Promise<string> {
    console.log("[MetaComposer] Reescrevendo com refrões preservados:", selectedChoruses.length)

    const originalStructure = this.extractSongStructure(originalLyrics)
    const composedVerses = await this.composeVersesForChoruses(
      originalLyrics,
      selectedChoruses,
      request,
      syllableEnforcement,
    )

    const finalLyrics = this.buildFinalStructure(composedVerses, selectedChoruses, originalStructure)

    return finalLyrics
  }

  private static async composeVersesForChoruses(
    originalLyrics: string,
    choruses: string[],
    request: CompositionRequest,
    syllableEnforcement: { min: number; max: number; ideal: number },
  ): Promise<{ verse1: string; verse2: string; bridge?: string }> {
    const prompt = `COMPOSIÇÃO DE VERSOS - PREPARAÇÃO PARA REFRÕES

TEMA: ${request.theme}
HUMOR: ${request.mood}
GÊNERO: ${request.genre}

REFRÃO PRINCIPAL:
${choruses[0]}

${choruses[1] ? `REFRÃO SECUNDÁRIO:\n${choruses[1]}` : ""}

${originalLyrics ? `LETRA ORIGINAL PARA INSPIRAÇÃO:\n${originalLyrics}` : ""}

LIMITE DE SÍLABAS: ${syllableEnforcement.min}-${syllableEnforcement.max} por linha

TAREFA: Compor versos que:
1. PREPAREM tematicamente para os refrões acima
2. MANTENHAM coerência com o tema "${request.theme}" e humor "${request.mood}"
3. RESPEITEM o limite de sílabas
4. USEM linguagem do ${request.genre}
5. CREEM transição natural para os refrões
6. USEM contrações: "cê", "tô", "pra", "tá"

RETORNE APENAS OS VERSOS NO FORMATO:
[VERSE 1]
• Linha 1
• Linha 2
• Linha 3
• Linha 4

[VERSE 2]
• Linha 1
• Linha 2
• Linha 3
• Linha 4

[BRIDGE] (opcional)
• Linha 1
• Linha 2`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.4,
    })

    return this.parseComposedVerses(text)
  }

  private static extractSongStructure(lyrics: string): any {
    const sections = lyrics.split("\n\n").filter((section) => section.trim())
    const structure = {
      hasIntro: /\[INTRO\]/i.test(lyrics),
      hasVerse: /\[VERS[OE]]/i.test(lyrics),
      hasChorus: /\[(?:CHORUS|REFRÃO)\]/i.test(lyrics),
      hasBridge: /\[BRIDGE\]/i.test(lyrics),
      hasOutro: /\[OUTRO\]/i.test(lyrics),
      totalSections: sections.length,
    }

    return structure
  }

  private static buildFinalStructure(
    verses: { verse1: string; verse2: string; bridge?: string },
    choruses: string[],
    structure: any,
  ): string {
    const sections: string[] = []

    if (structure.hasIntro) {
      sections.push("[INTRO]")
    }

    sections.push(verses.verse1)
    sections.push(`[CHORUS]\n${choruses[0]}`)

    sections.push(verses.verse2)
    sections.push(`[CHORUS]\n${choruses[0]}`)

    if (verses.bridge) {
      sections.push(verses.bridge)
    }

    sections.push(`[CHORUS]\n${choruses[0]}`)

    if (structure.hasOutro) {
      sections.push("[OUTRO]")
    }

    return sections.join("\n\n")
  }

  private static parseComposedVerses(text: string): { verse1: string; verse2: string; bridge?: string } {
    const lines = text.split("\n")
    let currentSection = ""
    const sections: { [key: string]: string[] } = {}

    for (const line of lines) {
      if (line.startsWith("[") && line.endsWith("]")) {
        currentSection = line
        sections[currentSection] = []
      } else if (currentSection && line.trim() && !line.startsWith("•")) {
        sections[currentSection].push(line.trim())
      }
    }

    return {
      verse1: sections["[VERSE 1]"]?.join("\n") || "",
      verse2: sections["[VERSE 2]"]?.join("\n") || "",
      bridge: sections["[BRIDGE]"]?.join("\n"),
    }
  }

  private static async generateIntelligentLyrics(
    request: CompositionRequest,
    enforcement: { min: number; max: number; ideal: number },
    preserveRhymes: boolean,
  ): Promise<string> {
    const genreConfig = getGenreConfig(request.genre)
    const masterPrompt = this.buildHarmonizedMasterPrompt(request, genreConfig, enforcement, preserveRhymes)

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt: masterPrompt,
      temperature: this.getCreativityTemperature(request.creativity),
    })

    return text
  }

  private static buildHarmonizedMasterPrompt(
    request: CompositionRequest,
    genreConfig: any,
    enforcement: { min: number; max: number; ideal: number },
    preserveRhymes: boolean,
  ): string {
    const rhymePreservationNote = preserveRhymes
      ? "⚠️ SISTEMA PRESERVA RIMAS: Se você criar rimas ricas, o sistema as manterá durante a correção."
      : ""

    return `COMPOSITOR MUSICAL INTELIGENTE - ${request.genre.toUpperCase()}

CONTROLE DE SÍLABAS: ${enforcement.min} a ${enforcement.max} sílabas por linha
ALVO IDEAL: ${enforcement.ideal} sílabas

CONTRAÇÕES OBRIGATÓRIAS:
• "você" → "cê" • "estou" → "tô" • "para" → "pra" • "está" → "tá"

TEMA: ${request.theme}
HUMOR: ${request.mood}
${rhymePreservationNote}

FORMATO:
[SEÇÃO - descrição em inglês]
• Letra em português com empilhamento natural
• Um verso por linha, exceto diálogos consecutivos

EXEMPLOS DE EMPILHAMENTO:
"Me olha e pergunta: 'Tá perdido?'"
"Respondo: 'Sô te desejando...'"

${request.additionalRequirements ? `REQUISITOS:\n${request.additionalRequirements}\n` : ""}

RETORNE APENAS A LETRA NO FORMATO CORRETO.`
  }

  private static async comprehensiveValidation(
    lyrics: string,
    request: CompositionRequest,
    syllableTarget: { min: number; max: number; ideal: number },
    terceiraViaAnalysis?: any,
  ): Promise<{
    passed: boolean
    errors: string[]
    warnings: string[]
    syllableStats: {
      totalLines: number
      linesWithinLimit: number
      maxSyllablesFound: number
      averageSyllables: number
    }
    terceiraViaScore?: number
    rhymePreservation?: number
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    const genreConfig = getGenreConfig(request.genre)
    const lines = lyrics
      .split("\n")
      .filter(
        (line) =>
          line.trim() &&
          !line.startsWith("[") &&
          !line.startsWith("(") &&
          !line.includes("Instrumentos:") &&
          !line.includes("BPM:"),
      )

    const syllableStats = this.calculateSyllableStatistics(lines, syllableTarget)

    if (syllableStats.linesWithinLimit < syllableStats.totalLines) {
      const problemLines = lines
        .filter((line) => {
          const syllables = countPoeticSyllables(line)
          return syllables < syllableTarget.min || syllables > syllableTarget.max
        })
        .slice(0, 3)

      errors.push(
        `${syllableStats.totalLines - syllableStats.linesWithinLimit} versos fora do limite de ${syllableTarget.min}-${syllableTarget.max} sílabas`,
        ...problemLines.map((line: string) => `- "${line}" (${countPoeticSyllables(line)} sílabas)`),
      )
    }

    const forcingValidation = validateFullLyricAgainstForcing(lyrics, request.genre)
    if (!forcingValidation.isValid) {
      warnings.push(...forcingValidation.warnings)
    }

    const forbidden = genreConfig.language_rules?.forbidden
      ? Object.values(genreConfig.language_rules.forbidden).flat()
      : []
    const lyricsLower = lyrics.toLowerCase()
    forbidden.forEach((word: string) => {
      if (lyricsLower.includes(word.toLowerCase())) {
        errors.push(`Palavra proibida encontrada: "${word}"`)
      }
    })

    const chorusMatches = lyrics.match(/\[(?:CHORUS|REFRÃO)[^\]]*\]\s*\n((?:[^\n]+\n?)+?)(?=\[|$)/gi)
    if (chorusMatches) {
      chorusMatches.forEach((chorus: string, index: number) => {
        const chorusLines = chorus
          .split("\n")
          .filter((line: string) => line.trim() && !line.startsWith("["))
          .filter((line: string) => !line.startsWith("("))
        if (chorusLines.length === 3) {
          errors.push(`Refrão ${index + 1}: 3 linhas é PROIBIDO (use 2 ou 4)`)
        }
      })
    }

    const stackingRatio = this.calculateStackingRatio(lyrics)
    if (stackingRatio < 0.3) {
      warnings.push(`Baixo empilhamento de versos (${(stackingRatio * 100).toFixed(0)}%) - formatação pouco natural`)
    } else if (stackingRatio > 0.7) {
      warnings.push(`Alto empilhamento (${(stackingRatio * 100).toFixed(0)}%) - pode dificultar contagem de sílabas`)
    }

    let terceiraViaScore = undefined
    if (terceiraViaAnalysis) {
      terceiraViaScore = terceiraViaAnalysis.score_geral
      if (terceiraViaScore < 70) {
        warnings.push(`Score Terceira Via baixo: ${terceiraViaScore}/100 - considere mais originalidade`)
      }
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
      syllableStats,
      terceiraViaScore,
      rhymePreservation: this.calculateRhymePreservation(lyrics),
    }
  }

  private static calculateHarmonizedQualityScore(
    lyrics: string,
    validation: any,
    request: CompositionRequest,
    syllableTarget: { min: number; max: number; ideal: number },
    terceiraViaAnalysis: any,
    correctionCount: number,
  ): number {
    let score = 1.0

    const syllableRatio = validation.syllableStats.linesWithinLimit / validation.syllableStats.totalLines
    score = score * 0.6 + syllableRatio * 0.4

    if (terceiraViaAnalysis) {
      const terceiraViaScore = terceiraViaAnalysis.score_geral / 100
      score = score * 0.75 + terceiraViaScore * 0.25
    }

    const coherenceScore = this.assessNarrativeCoherence(lyrics)
    score = score * 0.8 + coherenceScore * 0.2

    const stackingRatio = this.calculateStackingRatio(lyrics)
    const stackingScore = stackingRatio >= 0.3 && stackingRatio <= 0.7 ? 1.0 : 0.5
    score = score * 0.9 + stackingScore * 0.1

    score -= validation.errors.length * 0.15
    score -= validation.warnings.length * 0.05
    score -= Math.min(correctionCount * 0.02, 0.1)

    const simplicityScore = this.assessLanguageSimplicity(lyrics)
    score += simplicityScore * 0.05

    return Math.max(0, Math.min(1, score))
  }

  private static async autonomousRefinement(
    request: CompositionRequest,
    validation: { passed: boolean; errors: string[]; warnings: string[] },
    syllableTarget: { min: number; max: number; ideal: number },
    terceiraViaAnalysis?: any,
  ): Promise<CompositionRequest> {
    const refinementInstructions = [
      ...validation.errors.map((error: string) => `CORRIGIR: ${error}`),
      ...validation.warnings.map((warning: string) => `MELHORAR: ${warning}`),
      `GARANTIR: ${syllableTarget.min}-${syllableTarget.max} sílabas por verso (alvo: ${syllableTarget.ideal})`,
      `USAR: contrações "cê", "tô", "pra", "tá" e elisões "d'amor", "qu'eu"`,
    ]

    if (terceiraViaAnalysis && terceiraViaAnalysis.score_geral < 70) {
      refinementInstructions.push(
        `TERCEIRA VIA: Evitar clichês, usar imagens concretas, mostrar vulnerabilidade genuína`,
      )
      if (terceiraViaAnalysis.pontos_fracos && terceiraViaAnalysis.pontos_fracos.length > 0) {
        refinementInstructions.push(`TERCEIRA VIA: Foco em ${terceiraViaAnalysis.pontos_fracos.slice(0, 2).join(", ")}`)
      }
    }

    return {
      ...request,
      additionalRequirements: request.additionalRequirements
        ? `${request.additionalRequirements}\n\nREFINAMENTOS NECESSÁRIOS:\n${refinementInstructions.join("\n")}`
        : `REFINAMENTOS NECESSÁRIOS:\n${refinementInstructions.join("\n")}`,
    }
  }

  private static analyzeRhymePreservation(originalLyrics: string, correctedLyrics: string): any {
    const originalRhymes = this.extractRhymes(originalLyrics)
    const correctedRhymes = this.extractRhymes(correctedLyrics)

    let preservedCount = 0
    const minLength = Math.min(originalRhymes.length, correctedRhymes.length)

    for (let i = 0; i < minLength; i++) {
      if (correctedRhymes[i] === originalRhymes[i]) {
        preservedCount++
      }
    }

    const preservationRate = originalRhymes.length > 0 ? (preservedCount / originalRhymes.length) * 100 : 100

    return {
      originalRhymeCount: originalRhymes.length,
      correctedRhymeCount: correctedRhymes.length,
      preservedCount,
      preservationRate: Math.round(preservationRate),
    }
  }

  private static extractRhymes(lyrics: string): string[] {
    const lines = lyrics
      .split("\n")
      .filter(
        (line) =>
          line.trim() &&
          !line.startsWith("[") &&
          !line.startsWith("(") &&
          !line.includes("Instrumentos:") &&
          !line.includes("BPM:"),
      )

    return lines
      .map((line) => {
        const words = line.trim().split(/\s+/)
        const lastWord = words[words.length - 1]?.toLowerCase().replace(/[.,!?;:]$/g, "") || ""
        return lastWord.slice(-2)
      })
      .filter((rhyme) => rhyme.length > 0)
  }

  private static calculateRhymePreservation(lyrics: string): number {
    const rhymes = this.extractRhymes(lyrics)
    if (rhymes.length < 2) return 100

    let consistentRhymes = 0
    for (let i = 0; i < rhymes.length - 1; i += 2) {
      if (rhymes[i] === rhymes[i + 1]) {
        consistentRhymes++
      }
    }

    return Math.round((consistentRhymes / Math.floor(rhymes.length / 2)) * 100)
  }

  private static calculateSyllableStatistics(
    lines: string[],
    syllableTarget: { min: number; max: number; ideal: number },
  ) {
    let totalSyllables = 0
    let linesWithinLimit = 0
    let maxSyllablesFound = 0

    lines.forEach((line) => {
      const syllables = countPoeticSyllables(line)
      totalSyllables += syllables
      maxSyllablesFound = Math.max(maxSyllablesFound, syllables)

      if (syllables >= syllableTarget.min && syllables <= syllableTarget.max) {
        linesWithinLimit++
      }
    })

    return {
      totalLines: lines.length,
      linesWithinLimit,
      maxSyllablesFound,
      averageSyllables: lines.length > 0 ? totalSyllables / lines.length : 0,
    }
  }

  private static extractTitle(lyrics: string, request: CompositionRequest): string {
    if (request.title) return request.title

    const chorusMatch = lyrics.match(/\[(?:CHORUS|REFRÃO)[^\]]*\]\s*\n([^\n]+)/i)
    if (chorusMatch?.[1]) {
      return chorusMatch[1].trim().split(" ").slice(0, 4).join(" ")
    }

    return request.theme.split(" ").slice(0, 3).join(" ")
  }

  private static getCreativityTemperature(creativity?: string): number {
    switch (creativity) {
      case "conservador":
        return 0.5
      case "ousado":
        return 0.9
      default:
        return 0.7
    }
  }

  private static calculateStackingRatio(lyrics: string): number {
    const lines = lyrics
      .split("\n")
      .filter(
        (line) =>
          line.trim() &&
          !line.startsWith("[") &&
          !line.startsWith("(") &&
          !line.includes("Instrumentos:") &&
          !line.includes("BPM:"),
      )

    let stackedPairs = 0
    const totalPossiblePairs = Math.max(0, lines.length - 1)

    for (let i = 0; i < lines.length - 1; i++) {
      const currentLine = lines[i]
      const nextLine = lines[i + 1]

      if (this.shouldLinesStack(currentLine, nextLine)) {
        stackedPairs++
      }
    }

    return totalPossiblePairs > 0 ? stackedPairs / totalPossiblePairs : 0
  }

  private static shouldLinesStack(line1: string, line2: string): boolean {
    const l1 = line1.toLowerCase().trim()
    const l2 = line2.toLowerCase().trim()

    if ((l1.includes("?") && !l2.includes("?")) || (l2.includes("?") && !l1.includes("?"))) return true

    const connectors = ["e", "mas", "porém", "então", "quando", "onde", "que", "pra"]
    if (connectors.some((connector) => l2.startsWith(connector))) return true

    if (l1.endsWith(",") || l1.endsWith(";") || l2.startsWith("—") || l2.startsWith("-")) return true

    return false
  }

  private static assessNarrativeCoherence(lyrics: string): number {
    const hasIntro = /\[INTRO\]/i.test(lyrics)
    const hasVerse = /\[VERS[OE]/i.test(lyrics)
    const hasChorus = /\[(?:CHORUS|REFRÃO)\]/i.test(lyrics)
    const hasBridge = /\[BRIDGE\]/i.test(lyrics)
    const hasOutro = /\[OUTRO\]/i.test(lyrics)

    let score = 0
    if (hasIntro) score += 0.2
    if (hasVerse) score += 0.2
    if (hasChorus) score += 0.2
    if (hasBridge) score += 0.2
    if (hasOutro) score += 0.2

    return score
  }

  private static assessLanguageSimplicity(lyrics: string): number {
    const complexWords = ["outono", "primavera", "florescer", "bonanca", "alvorada", "crepusculo", "efemero", "sublime"]
    const lyricsLower = lyrics.toLowerCase()
    const complexCount = complexWords.filter((word: string) => lyricsLower.includes(word)).length

    return Math.max(0, 1 - complexCount * 0.1)
  }

  private static analisarTerceiraVia(lyrics: string, genre: string, theme: string): any {
    const lines = lyrics
      .split("\n")
      .filter(
        (line) =>
          line.trim() &&
          !line.startsWith("[") &&
          !line.startsWith("(") &&
          !line.includes("Instrumentos:") &&
          !line.includes("BPM:"),
      )

    const cliches = ["coração partido", "lágrimas no travesseiro", "noite sem luar", "amor eterno", "para sempre"]
    let clicheCount = 0
    const lyricsLower = lyrics.toLowerCase()

    cliches.forEach((cliche) => {
      if (lyricsLower.includes(cliche)) clicheCount++
    })

    const originalidade = Math.max(0, 100 - clicheCount * 20)

    const hasStructure = lyrics.includes("[VERSE") && lyrics.includes("[CHORUS")
    const hasRhyme = lines.length >= 2 && this.checkRhyme(lines[0], lines[1])

    let tecnica = 50
    if (hasRhyme) tecnica += 25
    if (hasStructure) tecnica += 25

    const score_geral = Math.round(originalidade * 0.4 + tecnica * 0.6)

    return {
      originalidade,
      profundidade_emocional: 75,
      tecnica_compositiva: tecnica,
      adequacao_genero: 85,
      score_geral,
      sugestoes: clicheCount > 0 ? ["Evite clichês comuns"] : ["Boa qualidade literária"],
      pontos_fortes: hasStructure ? ["Estrutura bem organizada"] : ["Letra coesa"],
      pontos_fracos: clicheCount > 0 ? ["Alguns clichês detectados"] : ["Pode melhorar originalidade"],
    }
  }

  private static checkRhyme(line1: string, line2: string): boolean {
    const getLastWord = (line: string) => {
      const words = line.trim().split(/\s+/)
      return words[words.length - 1]?.toLowerCase().replace(/[^\wáàâãéèêíìîóòôõúùûç]/gi, "") || ""
    }

    const word1 = getLastWord(line1)
    const word2 = getLastWord(line2)

    if (!word1 || !word2) return false

    const end1 = word1.slice(-2)
    const end2 = word2.slice(-2)

    return end1 === end2
  }

  private static async applyTerceiraViaToLyrics(lyrics: string, genre: string, theme: string): Promise<string> {
    const lines = lyrics.split("\n")
    const improvedLines: string[] = []
    const genreConfig = getGenreConfig(genre)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (
        !line.trim() ||
        line.startsWith("[") ||
        line.startsWith("(") ||
        line.includes("Instrumentos:") ||
        line.includes("BPM:")
      ) {
        improvedLines.push(line)
        continue
      }

      const context = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 3)).join(" | ")

      try {
        const improvedLine = await ThirdWayEngine.generateThirdWayLine(line, genre, genreConfig, context, false)
        improvedLines.push(improvedLine)
      } catch (error) {
        console.error(`[MetaComposer] Erro ao aplicar Terceira Via na linha ${i}:`, error)
        improvedLines.push(line)
      }
    }

    return improvedLines.join("\n")
  }
}
