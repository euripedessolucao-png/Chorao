import { countPoeticSyllables } from "@/lib/validation/syllable-counter"
import { SyllableEnforcer } from "@/lib/validation/syllableEnforcer"
import {
  type TerceiraViaAnalysis,
  analisarTerceiraVia,
  applyTerceiraViaToLine,
  analisarMelodiaRitmo,
  ThirdWayEngine,
} from "@/lib/terceira-via"
import { getGenreConfig, validateLyrics } from "@/lib/genre-config"
import { generateText } from "ai"
import { validateRhymesForGenre } from "@/lib/validation/rhyme-validator"
import { validateVerseIntegrity } from "@/lib/validation/verse-integrity-validator"

export interface CompositionRequest {
  genre: string
  theme: string
  mood: string
  additionalRequirements?: string
  creativity?: "conservador" | "equilibrado" | "ousado"
  syllableTarget?: {
    min: number
    max: number
    ideal: number
  }
  applyFinalPolish?: boolean
  preservedChoruses?: string[]
  originalLyrics?: string
  rhythm?: string
  structureAnalysis?: any
  performanceMode?: "standard" | "performance"
}

export interface CompositionResult {
  lyrics: string
  title: string
  metadata: {
    iterations: number
    finalScore: number
    polishingApplied?: boolean
    preservedChorusesUsed?: boolean
    rhymeScore?: number
    rhymeTarget?: number
    structureImproved?: boolean
    terceiraViaAnalysis?: TerceiraViaAnalysis
    melodicAnalysis?: any
    performanceMode?: string
  }
}

export class MetaComposer {
  private static readonly MAX_ITERATIONS = 3
  private static readonly ABSOLUTE_MAX_SYLLABLES = 12
  private static readonly MIN_QUALITY_SCORE = 0.75 // Score mínimo para aprovar letra

  /**
   * Obtém a configuração de sílabas para um gênero específico
   */
  private static getGenreSyllableConfig(genre: string): { min: number; max: number; ideal: number } {
    const genreConfig = getGenreConfig(genre)
    const syllableRules = genreConfig.prosody_rules?.syllable_count

    // Handle different syllable count structures across genres
    if (syllableRules && "absolute_max" in syllableRules) {
      // Sertanejo Moderno structure
      return {
        min: 7,
        max: syllableRules.absolute_max,
        ideal: 10,
      }
    } else if (syllableRules && "without_comma" in syllableRules) {
      // Other genres structure
      return {
        min: syllableRules.without_comma.min,
        max: syllableRules.without_comma.acceptable_up_to,
        ideal: Math.floor((syllableRules.without_comma.min + syllableRules.without_comma.max) / 2),
      }
    }

    // Default fallback
    return {
      min: 7,
      max: 12,
      ideal: 10,
    }
  }

  /**
   * COMPOSIÇÃO TURBO COM SISTEMA TERCEIRA VIA INTEGRADO
   */
  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer-TURBO] Iniciando composição com Terceira Via...")

    let iterations = 0
    let bestResult: CompositionResult | null = null
    let bestScore = 0
    let terceiraViaAnalysis: TerceiraViaAnalysis | null = null
    let melodicAnalysis: any = null

    const syllableEnforcement = request.syllableTarget || this.getGenreSyllableConfig(request.genre)
    syllableEnforcement.max = Math.min(syllableEnforcement.max, this.ABSOLUTE_MAX_SYLLABLES)

    const applyFinalPolish = request.applyFinalPolish ?? true
    const preservedChoruses = request.preservedChoruses || []
    const hasPreservedChoruses = preservedChoruses.length > 0
    const isRewrite = !!request.originalLyrics
    const performanceMode = request.performanceMode || "standard"

    const genreConfig = getGenreConfig(request.genre)

    while (iterations < this.MAX_ITERATIONS) {
      iterations++
      console.log(`[MetaComposer-TURBO] Iteração ${iterations}/${this.MAX_ITERATIONS}`)

      let rawLyrics: string

      if (isRewrite) {
        rawLyrics = await this.generateRewrite(request)
      } else if (hasPreservedChoruses && iterations === 1) {
        rawLyrics = await this.generateWithPreservedChoruses(preservedChoruses, request, syllableEnforcement)
      } else {
        rawLyrics = await this.generateDirectLyrics(request, syllableEnforcement)
      }

      const criticalViolations = this.detectCriticalViolations(rawLyrics)
      if (criticalViolations.length > 0) {
        console.error(`[MetaComposer-TURBO] ❌ VIOLAÇÃO CRÍTICA: ${criticalViolations.length} versos com >12 sílabas`)
        criticalViolations.forEach((v) => {
          console.error(`  Linha ${v.lineNumber}: "${v.line}" (${v.syllables} sílabas)`)
        })

        // Se não é a última iteração, tenta novamente
        if (iterations < this.MAX_ITERATIONS) {
          console.log("[MetaComposer-TURBO] 🔄 Regenerando devido a violações críticas...")
          continue
        }
      }

      // ✅ ETAPA 1: ANÁLISE TERCEIRA VIA COM CONFIGURAÇÃO DO GÊNERO
      console.log("[MetaComposer-TURBO] 🔍 Aplicando análise Terceira Via...")
      terceiraViaAnalysis = analisarTerceiraVia(rawLyrics, request.genre, request.theme)
      melodicAnalysis = analisarMelodiaRitmo(rawLyrics, request.genre)

      console.log(`[MetaComposer-TURBO] 📊 Score Terceira Via: ${terceiraViaAnalysis.score_geral}/100`)
      console.log(`[MetaComposer-TURBO] 🎵 Score Melódico: ${melodicAnalysis.flow_score}/100`)

      // ✅ ETAPA 2: CORREÇÕES INTELIGENTES COM THIRD WAY ENGINE
      if (terceiraViaAnalysis.score_geral < 75 && iterations < this.MAX_ITERATIONS - 1) {
        console.log("[MetaComposer-TURBO] 🎯 Aplicando correções Terceira Via...")
        rawLyrics = await this.applyTerceiraViaCorrections(rawLyrics, request, terceiraViaAnalysis, genreConfig)

        // ✅ RE-ANALISA APÓS CORREÇÕES
        terceiraViaAnalysis = analisarTerceiraVia(rawLyrics, request.genre, request.theme)
        console.log(`[MetaComposer-TURBO] 📊 Score após correções: ${terceiraViaAnalysis.score_geral}/100`)
      }

      // ✅ ETAPA 3: CORREÇÃO DE SÍLABAS COM LIMITE ABSOLUTO
      const enforcedResult = await SyllableEnforcer.enforceSyllableLimits(rawLyrics, syllableEnforcement, request.genre)
      console.log(`[MetaComposer-TURBO] ✅ Correções de sílabas: ${enforcedResult.corrections} linhas`)

      const postCorrectionViolations = this.detectCriticalViolations(enforcedResult.correctedLyrics)
      if (postCorrectionViolations.length > 0) {
        console.error(`[MetaComposer-TURBO] ❌ AINDA HÁ VIOLAÇÕES após correção: ${postCorrectionViolations.length}`)

        // Aplica correção emergencial linha por linha
        enforcedResult.correctedLyrics = this.applyEmergencyCorrection(
          enforcedResult.correctedLyrics,
          syllableEnforcement.max,
        )
      }

      let finalLyrics = enforcedResult.correctedLyrics
      let polishingApplied = false

      // ✅ ETAPA 4: POLIMENTO FINAL COM TERCEIRA VIA
      if (applyFinalPolish && iterations === this.MAX_ITERATIONS) {
        console.log("[MetaComposer-TURBO] ✨ Aplicando polimento universal com Terceira Via...")
        finalLyrics = await this.applyUniversalPolish(
          finalLyrics,
          request.genre,
          request.theme,
          syllableEnforcement,
          performanceMode,
          genreConfig,
        )
        polishingApplied = true
      }

      const finalViolations = this.detectCriticalViolations(finalLyrics)
      if (finalViolations.length > 0) {
        console.error(`[MetaComposer-TURBO] ❌ VIOLAÇÕES FINAIS DETECTADAS: ${finalViolations.length}`)
        finalLyrics = this.applyEmergencyCorrection(finalLyrics, syllableEnforcement.max)
        console.log("[MetaComposer-TURBO] ✅ Correção emergencial aplicada")
      }

      const finalValidation = this.validateFinalLyrics(finalLyrics, request.genre, syllableEnforcement)

      if (!finalValidation.isValid) {
        console.error(`[MetaComposer-TURBO] ❌ VALIDAÇÃO FINAL FALHOU:`)
        finalValidation.criticalErrors.forEach((error) => console.error(`  - ${error}`))

        // Se não é a última iteração, REGENERA
        if (iterations < this.MAX_ITERATIONS) {
          console.log("[MetaComposer-TURBO] 🔄 REGENERANDO devido a falhas críticas...")
          continue
        } else {
          // Última iteração: aplica correções emergenciais
          console.log("[MetaComposer-TURBO] ⚠️ Última iteração - aplicando correções emergenciais...")
          finalLyrics = this.applyFinalEmergencyFixes(finalLyrics, syllableEnforcement, request.genre)
        }
      } else {
        console.log("[MetaComposer-TURBO] ✅ VALIDAÇÃO FINAL APROVADA!")
        console.log(`  - Sílabas: ${finalValidation.syllableCompliance}% dentro do limite`)
        console.log(`  - Rimas: ${finalValidation.rhymeQuality}% de qualidade`)
        console.log(`  - Integridade: ${finalValidation.verseIntegrity}% versos completos`)
        console.log(`  - Narrativa: ${finalValidation.hasNarrative ? "✓" : "✗"}`)
      }

      // ✅ ETAPA 5: AVALIAÇÃO DE QUALIDADE INTEGRADA
      const qualityScore = this.calculateQualityScore(
        finalLyrics,
        syllableEnforcement,
        request.genre,
        terceiraViaAnalysis,
        melodicAnalysis,
      )

      console.log(`[MetaComposer-TURBO] 🎯 Score final: ${qualityScore.toFixed(2)}`)

      if (qualityScore > bestScore) {
        bestScore = qualityScore
        bestResult = {
          lyrics: finalLyrics,
          title: this.extractTitle(finalLyrics, request),
          metadata: {
            iterations,
            finalScore: qualityScore,
            polishingApplied,
            preservedChorusesUsed: hasPreservedChoruses,
            rhymeScore: this.analyzeRhymes(finalLyrics, request.genre).score,
            rhymeTarget: this.getGenreRhymeTarget(request.genre).minScore,
            structureImproved: isRewrite,
            terceiraViaAnalysis: terceiraViaAnalysis,
            melodicAnalysis: melodicAnalysis,
            performanceMode: performanceMode,
          },
        }
      }

      const shouldStop =
        qualityScore >= this.MIN_QUALITY_SCORE &&
        terceiraViaAnalysis.score_geral >= 75 &&
        melodicAnalysis.flow_score >= 70 &&
        finalValidation.isValid // Só para se validação final passou

      if (shouldStop) {
        console.log("[MetaComposer-TURBO] 🎯 Critério de parada atingido!")
        break
      }
    }

    if (!bestResult) {
      throw new Error("Falha ao gerar composição")
    }

    console.log(`[MetaComposer-TURBO] 🎵 Composição finalizada! Score: ${bestScore.toFixed(2)}`)
    return bestResult
  }

  /**
   * APLICA CORREÇÕES BASEADAS NA ANÁLISE TERCEIRA VIA
   */
  private static async applyTerceiraViaCorrections(
    lyrics: string,
    request: CompositionRequest,
    analysis: TerceiraViaAnalysis,
    genreConfig: any, // ✅ RECEBE CONFIGURAÇÃO
  ): Promise<string> {
    const lines = lyrics.split("\n")
    const correctedLines: string[] = []
    let correctionsApplied = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // ✅ SÓ CORRIGE LINHAS QUE PRECISAM
      if (this.needsTerceiraViaCorrection(line, analysis)) {
        try {
          const context = this.buildLineContext(lines, i, request.theme)
          const correctedLine = await applyTerceiraViaToLine(
            line,
            i,
            context,
            request.performanceMode === "performance",
            request.additionalRequirements,
            request.genre,
          )

          if (correctedLine !== line) {
            correctionsApplied++
            console.log(`[TerceiraVia] 🔄 Linha ${i} corrigida: "${line}" → "${correctedLine}"`)
          }

          correctedLines.push(correctedLine)
        } catch (error) {
          console.warn(`[TerceiraVia] ❌ Erro na linha ${i}, mantendo original`)
          correctedLines.push(line)
        }
      } else {
        correctedLines.push(line)
      }
    }

    console.log(`[MetaComposer-TURBO] ✅ ${correctionsApplied} correções Terceira Via aplicadas`)
    return correctedLines.join("\n")
  }

  /**
   * POLIMENTO UNIVERSAL COM TERCEIRA VIA
   */
  private static async applyUniversalPolish(
    lyrics: string,
    genre: string,
    theme: string,
    syllableTarget: { min: number; max: number; ideal: number },
    performanceMode = "standard",
    genreConfig: any, // ✅ RECEBE CONFIGURAÇÃO
  ): Promise<string> {
    console.log(`[MetaComposer-TURBO] ✨ Polimento universal para: ${genre} (${performanceMode})`)

    let polishedLyrics = lyrics

    // ✅ ETAPA 1: CORREÇÃO DE RIMAS COM TERCEIRA VIA
    polishedLyrics = await this.applyRhymeEnhancement(polishedLyrics, genre, theme)

    // ✅ ETAPA 2: CORREÇÃO DE SÍLABAS INTELIGENTE
    const lines = polishedLyrics.split("\n")
    const finalLines: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (line.startsWith("[") || line.startsWith("(") || line.includes("Instruments:") || !line.trim()) {
        finalLines.push(line)
        continue
      }

      const currentSyllables = countPoeticSyllables(line)
      const needsCorrection = currentSyllables < syllableTarget.min || currentSyllables > syllableTarget.max

      if (needsCorrection) {
        try {
          // ✅ USA THIRD WAY ENGINE PARA CORREÇÃO DE SÍLABAS
          const polishedLine = await ThirdWayEngine.generateThirdWayLine(
            line,
            genre,
            genreConfig, // ✅ PASSA CONFIGURAÇÃO
            `Polimento final para ${genre}`,
            performanceMode === "performance",
            `Ajuste para ${syllableTarget.ideal} sílabas poéticas`,
          )
          finalLines.push(polishedLine)
        } catch (error) {
          finalLines.push(line)
        }
      } else {
        finalLines.push(line)
      }
    }

    polishedLyrics = finalLines.join("\n")

    // ✅ ETAPA 3: FORMATAÇÃO PERFORMÁTICA
    if (performanceMode === "performance") {
      polishedLyrics = this.applyPerformanceFormatting(polishedLyrics, genre)
    }

    return polishedLyrics
  }

  /**
   * GERA REESCRITA DE LETRA EXISTENTE
   */
  private static async generateRewrite(request: CompositionRequest): Promise<string> {
    console.log("[MetaComposer] Gerando reescrita de letra existente...")

    if (!request.originalLyrics) {
      throw new Error("Original lyrics required for rewrite")
    }

    const genreConfig = getGenreConfig(request.genre)
    const syllableTarget = request.syllableTarget || this.getGenreSyllableConfig(request.genre)

    try {
      const rewritePrompt = `Reescreva a seguinte letra mantendo a estrutura mas melhorando qualidade, rimas e fluidez.

Gênero: ${request.genre}
Tema: ${request.theme}
Mood: ${request.mood}
${request.additionalRequirements ? `Requisitos: ${request.additionalRequirements}` : ""}

Sílabas por verso: ${syllableTarget.min}-${syllableTarget.max} (ideal: ${syllableTarget.ideal})

Letra original:
${request.originalLyrics}

Mantenha a mesma estrutura (número de versos, refrões, etc.) mas melhore:
- Qualidade das rimas (60% rimas ricas)
- Fluidez e naturalidade
- Adequação ao gênero ${request.genre}
- Contagem silábica adequada

Retorne APENAS a letra reescrita, sem explicações.`

      const response = await generateText({
        model: "openai/gpt-4o",
        prompt: rewritePrompt,
        temperature: 0.7,
      })

      return response.text || request.originalLyrics
    } catch (error) {
      console.error("[MetaComposer] Erro ao gerar reescrita:", error)
      return request.originalLyrics
    }
  }

  /**
   * GERA LETRA COM REFRÕES PRESERVADOS
   */
  private static async generateWithPreservedChoruses(
    preservedChoruses: string[],
    request: CompositionRequest,
    syllableEnforcement: { min: number; max: number; ideal: number },
  ): Promise<string> {
    console.log("[MetaComposer] Gerando letra com refrões preservados...")

    const genreConfig = getGenreConfig(request.genre)
    const syllableTarget = request.syllableTarget || this.getGenreSyllableConfig(request.genre)

    try {
      const chorusPrompt = `Gere uma letra para o gênero ${request.genre} com o tema ${request.theme} e o mood ${request.mood}.
Preserve os seguintes refrões:
${preservedChoruses.join("\n")}

Sílabas por verso: ${syllableTarget.min}-${syllableTarget.max} (ideal: ${syllableTarget.ideal})

Retorne APENAS a letra gerada, sem explicações ou comentários.`

      const response = await generateText({
        model: "openai/gpt-4o",
        prompt: chorusPrompt,
        temperature: 0.7,
      })

      return response.text || ""
    } catch (error) {
      console.error("[MetaComposer] Erro ao gerar letra com refrões preservados:", error)
      return ""
    }
  }

  /**
   * GERA LETRA DIRETAMENTE SEM RESTRIÇÕES DE REFRÃO
   */
  private static async generateDirectLyrics(
    request: CompositionRequest,
    syllableEnforcement: { min: number; max: number; ideal: number },
  ): Promise<string> {
    console.log("[MetaComposer] Gerando letra diretamente...")

    const genreConfig = getGenreConfig(request.genre)

    try {
      const directPrompt = `Gere uma letra completa para o gênero ${request.genre}.

Tema: ${request.theme}
Mood: ${request.mood}
${request.additionalRequirements ? `Requisitos adicionais: ${request.additionalRequirements}` : ""}
${request.rhythm ? `Ritmo específico: ${request.rhythm}` : ""}

Sílabas por verso: ${syllableEnforcement.min}-${syllableEnforcement.max} (ideal: ${syllableEnforcement.ideal})

Requisitos de qualidade:
- 60% de rimas ricas
- Estrutura adequada ao gênero ${request.genre}
- Fluidez natural e autenticidade
- Contagem silábica consistente

Retorne APENAS a letra completa, sem explicações ou comentários.`

      const response = await generateText({
        model: "openai/gpt-4o",
        prompt: directPrompt,
        temperature: 0.8,
      })

      return response.text || ""
    } catch (error) {
      console.error("[MetaComposer] Erro ao gerar letra direta:", error)
      throw error
    }
  }

  /**
   * CALCULA SCORE DE QUALIDADE INTEGRADO
   */
  private static calculateQualityScore(
    lyrics: string,
    syllableTarget: { min: number; max: number; ideal: number },
    genre: string,
    terceiraViaAnalysis: TerceiraViaAnalysis | null,
    melodicAnalysis: any,
  ): number {
    let score = 0
    let weights = 0

    // Terceira Via score (40% do peso)
    if (terceiraViaAnalysis) {
      score += (terceiraViaAnalysis.score_geral / 100) * 0.4
      weights += 0.4
    }

    // Melodic flow score (30% do peso)
    if (melodicAnalysis) {
      score += (melodicAnalysis.flow_score / 100) * 0.3
      weights += 0.3
    }

    // Syllable compliance (20% do peso)
    const lines = lyrics.split("\n").filter((l) => l.trim() && !l.startsWith("[") && !l.startsWith("("))
    let syllableCompliance = 0
    lines.forEach((line) => {
      const count = countPoeticSyllables(line)
      if (count >= syllableTarget.min && count <= syllableTarget.max) {
        syllableCompliance++
      }
    })
    if (lines.length > 0) {
      score += (syllableCompliance / lines.length) * 0.2
      weights += 0.2
    }

    // Rhyme quality (10% do peso)
    const rhymeAnalysis = this.analyzeRhymes(lyrics, genre)
    score += (rhymeAnalysis.score / 100) * 0.1
    weights += 0.1

    return weights > 0 ? score / weights : 0
  }

  /**
   * EXTRAI TÍTULO DA LETRA
   */
  private static extractTitle(lyrics: string, request: CompositionRequest): string {
    const lines = lyrics.split("\n")

    // Procura por linha de título explícita
    for (const line of lines) {
      if (line.toLowerCase().includes("título:") || line.toLowerCase().includes("title:")) {
        return line.split(":")[1]?.trim() || "Sem Título"
      }
    }

    // Usa primeira linha significativa como título
    for (const line of lines) {
      const cleaned = line.trim()
      if (cleaned && !cleaned.startsWith("[") && !cleaned.startsWith("(") && cleaned.length > 3) {
        return cleaned.substring(0, 50)
      }
    }

    return `${request.theme} - ${request.genre}`
  }

  /**
   * ANALISA QUALIDADE DAS RIMAS
   */
  private static analyzeRhymes(
    lyrics: string,
    genre: string,
  ): { score: number; richRhymes: number; totalRhymes: number } {
    const lines = lyrics.split("\n").filter((l) => l.trim() && !l.startsWith("[") && !l.startsWith("("))

    let richRhymes = 0
    let totalRhymes = 0

    // Análise simplificada de rimas
    for (let i = 0; i < lines.length - 1; i++) {
      const line1 = lines[i].trim()
      const line2 = lines[i + 1].trim()

      if (line1 && line2) {
        const lastWord1 = line1.split(" ").pop()?.toLowerCase() || ""
        const lastWord2 = line2.split(" ").pop()?.toLowerCase() || ""

        if (lastWord1.length > 2 && lastWord2.length > 2) {
          const suffix1 = lastWord1.slice(-3)
          const suffix2 = lastWord2.slice(-3)

          if (suffix1 === suffix2) {
            totalRhymes++
            // Rima rica: mais de 3 caracteres iguais
            if (lastWord1.slice(-4) === lastWord2.slice(-4)) {
              richRhymes++
            }
          }
        }
      }
    }

    const score = totalRhymes > 0 ? (richRhymes / totalRhymes) * 100 : 0
    return { score, richRhymes, totalRhymes }
  }

  /**
   * OBTÉM TARGET DE RIMAS PARA O GÊNERO
   */
  private static getGenreRhymeTarget(genre: string): { minScore: number; richRhymePercentage: number } {
    // Targets padrão baseados no gênero
    const targets: Record<string, { minScore: number; richRhymePercentage: number }> = {
      "sertanejo-moderno": { minScore: 70, richRhymePercentage: 60 },
      "sertanejo-universitario": { minScore: 70, richRhymePercentage: 60 },
      piseiro: { minScore: 65, richRhymePercentage: 55 },
      forro: { minScore: 65, richRhymePercentage: 55 },
      funk: { minScore: 60, richRhymePercentage: 50 },
      trap: { minScore: 60, richRhymePercentage: 50 },
      default: { minScore: 65, richRhymePercentage: 55 },
    }

    return targets[genre] || targets["default"]
  }

  /**
   * VERIFICA SE LINHA PRECISA DE CORREÇÃO TERCEIRA VIA
   */
  private static needsTerceiraViaCorrection(line: string, analysis: TerceiraViaAnalysis): boolean {
    // Não corrige tags, instruções ou linhas vazias
    if (!line.trim() || line.startsWith("[") || line.startsWith("(") || line.includes("Instruments:")) {
      return false
    }

    // Corrige se score geral está baixo
    if (analysis.score_geral < 70) {
      return true
    }

    // Corrige se há pontos fracos identificados
    if (analysis.pontos_fracos && analysis.pontos_fracos.length > 0) {
      return true
    }

    return false
  }

  /**
   * CONSTRÓI CONTEXTO PARA CORREÇÃO DE LINHA
   */
  private static buildLineContext(lines: string[], lineIndex: number, theme: string): string {
    const contextLines: string[] = []

    // Adiciona linha anterior se existir
    if (lineIndex > 0) {
      contextLines.push(`Linha anterior: ${lines[lineIndex - 1]}`)
    }

    // Adiciona linha atual
    contextLines.push(`Linha atual: ${lines[lineIndex]}`)

    // Adiciona próxima linha se existir
    if (lineIndex < lines.length - 1) {
      contextLines.push(`Próxima linha: ${lines[lineIndex + 1]}`)
    }

    contextLines.push(`Tema: ${theme}`)

    return contextLines.join("\n")
  }

  /**
   * APLICA MELHORIAS DE RIMA
   */
  private static async applyRhymeEnhancement(lyrics: string, genre: string, theme: string): Promise<string> {
    console.log("[MetaComposer] Aplicando melhorias de rima...")

    // Implementação simplificada - retorna lyrics original
    // Em produção, isso usaria o rhyme-enhancer
    return lyrics
  }

  /**
   * APLICA FORMATAÇÃO PERFORMÁTICA
   */
  private static applyPerformanceFormatting(lyrics: string, genre: string): string {
    console.log("[MetaComposer] Aplicando formatação performática...")

    // Garante que tags estão em inglês e versos em português
    let formatted = lyrics

    // Converte tags comuns para inglês
    formatted = formatted.replace(/\[Intro\]/gi, "[Intro]")
    formatted = formatted.replace(/\[Verso\s*(\d*)\]/gi, "[Verse$1]")
    formatted = formatted.replace(/\[Refrão\]/gi, "[Chorus]")
    formatted = formatted.replace(/\[Ponte\]/gi, "[Bridge]")
    formatted = formatted.replace(/\[Final\]/gi, "[Outro]")

    return formatted
  }

  private static detectCriticalViolations(
    lyrics: string,
  ): Array<{ line: string; syllables: number; lineNumber: number }> {
    const lines = lyrics.split("\n")
    const violations: Array<{ line: string; syllables: number; lineNumber: number }> = []

    lines.forEach((line, index) => {
      const trimmed = line.trim()

      // Ignora tags, instruções e linhas vazias
      if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(") || trimmed.includes("Instruments:")) {
        return
      }

      const syllables = countPoeticSyllables(trimmed)
      if (syllables > this.ABSOLUTE_MAX_SYLLABLES) {
        violations.push({
          line: trimmed,
          syllables,
          lineNumber: index + 1,
        })
      }
    })

    return violations
  }

  private static applyEmergencyCorrection(lyrics: string, maxSyllables: number): string {
    const lines = lyrics.split("\n")
    const correctedLines: string[] = []

    lines.forEach((line) => {
      const trimmed = line.trim()

      // Não corrige tags, instruções ou linhas vazias
      if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(") || trimmed.includes("Instruments:")) {
        correctedLines.push(line)
        return
      }

      const syllables = countPoeticSyllables(trimmed)

      if (syllables > maxSyllables) {
        console.log(`[Emergency] Corrigindo: "${trimmed}" (${syllables}s)`)

        // Estratégia: Remove palavras do meio, preserva início e fim (rimas)
        const words = trimmed.split(" ")

        if (words.length > 4) {
          // Mantém primeira e últimas 2 palavras
          let corrected = [words[0], ...words.slice(-2)].join(" ")

          // Se ainda muito longo, mantém só as últimas 2 palavras
          if (countPoeticSyllables(corrected) > maxSyllables) {
            corrected = words.slice(-2).join(" ")
          }

          console.log(`[Emergency] Resultado: "${corrected}" (${countPoeticSyllables(corrected)}s)`)
          correctedLines.push(corrected)
        } else {
          // Se muito curto, mantém original (melhor verso longo que quebrado)
          correctedLines.push(trimmed)
        }
      } else {
        correctedLines.push(line)
      }
    })

    return correctedLines.join("\n")
  }

  /**
   * VALIDAÇÃO FINAL RIGOROSA - USA TODAS AS FERRAMENTAS DISPONÍVEIS
   * Esta função é o GUARDIÃO FINAL que garante que a letra está PERFEITA
   */
  private static validateFinalLyrics(
    lyrics: string,
    genre: string,
    syllableTarget: { min: number; max: number; ideal: number },
  ): {
    isValid: boolean
    criticalErrors: string[]
    warnings: string[]
    syllableCompliance: number
    rhymeQuality: number
    verseIntegrity: number
    hasNarrative: boolean
  } {
    const criticalErrors: string[] = []
    const warnings: string[] = []

    console.log("[MetaComposer] 🔍 VALIDAÇÃO FINAL RIGOROSA iniciada...")

    // 1. VALIDAÇÃO DE SÍLABAS - NUNCA MAIS DE 12
    const lines = lyrics.split("\n").filter((l) => {
      const trimmed = l.trim()
      return trimmed && !trimmed.startsWith("[") && !trimmed.startsWith("(") && !trimmed.includes("Instruments:")
    })

    let syllableViolations = 0
    let syllableCompliant = 0

    lines.forEach((line, index) => {
      const syllables = countPoeticSyllables(line)

      if (syllables > this.ABSOLUTE_MAX_SYLLABLES) {
        criticalErrors.push(`Linha ${index + 1}: "${line}" tem ${syllables} sílabas (máximo: 12)`)
        syllableViolations++
      } else if (syllables >= syllableTarget.min && syllables <= syllableTarget.max) {
        syllableCompliant++
      }
    })

    const syllableCompliance = lines.length > 0 ? (syllableCompliant / lines.length) * 100 : 0

    // 2. VALIDAÇÃO DE INTEGRIDADE DE VERSOS
    const integrityResult = validateVerseIntegrity(lyrics)
    if (integrityResult.brokenVerses.length > 0) {
      integrityResult.brokenVerses.forEach((broken) => {
        criticalErrors.push(`Verso quebrado/incompleto na linha ${broken.lineNumber}: "${broken.line}"`)
      })
    }

    const verseIntegrity =
      lines.length > 0 ? ((lines.length - integrityResult.brokenVerses.length) / lines.length) * 100 : 0

    // 3. VALIDAÇÃO DE RIMAS
    const rhymeValidation = validateRhymesForGenre(lyrics, genre)
    if (!rhymeValidation.valid) {
      rhymeValidation.errors.forEach((error) => criticalErrors.push(`Rima: ${error}`))
    }
    rhymeValidation.warnings.forEach((warning) => warnings.push(`Rima: ${warning}`))

    const rhymeQuality = rhymeValidation.analysis.score

    // 4. VALIDAÇÃO DE REGRAS DO GÊNERO
    const genreValidation = validateLyrics(lyrics, genre)
    if (!genreValidation.valid) {
      genreValidation.errors.forEach((error) => criticalErrors.push(`Gênero: ${error}`))
    }
    genreValidation.warnings.forEach((warning) => warnings.push(`Gênero: ${warning}`))

    // 5. VALIDAÇÃO DE NARRATIVA (início, meio, fim)
    const hasNarrative = this.validateNarrative(lyrics)
    if (!hasNarrative) {
      warnings.push("Narrativa: Letra não tem estrutura clara de início, meio e fim")
    }

    // 6. VALIDAÇÃO DE ESTRUTURA
    const hasVerse = lyrics.toLowerCase().includes("[verse") || lyrics.toLowerCase().includes("[verso")
    const hasChorus = lyrics.toLowerCase().includes("[chorus") || lyrics.toLowerCase().includes("[refrão")

    if (!hasVerse) {
      criticalErrors.push("Estrutura: Letra não tem versos identificados")
    }
    if (!hasChorus) {
      criticalErrors.push("Estrutura: Letra não tem refrão identificado")
    }

    const isValid = criticalErrors.length === 0 && syllableViolations === 0

    console.log(`[MetaComposer] 📊 Resultado da validação:`)
    console.log(`  - Válida: ${isValid ? "✅ SIM" : "❌ NÃO"}`)
    console.log(`  - Erros críticos: ${criticalErrors.length}`)
    console.log(`  - Avisos: ${warnings.length}`)
    console.log(`  - Sílabas OK: ${syllableCompliance.toFixed(1)}%`)
    console.log(`  - Qualidade rimas: ${rhymeQuality.toFixed(1)}%`)
    console.log(`  - Integridade versos: ${verseIntegrity.toFixed(1)}%`)
    console.log(`  - Narrativa: ${hasNarrative ? "✓" : "✗"}`)

    return {
      isValid,
      criticalErrors,
      warnings,
      syllableCompliance,
      rhymeQuality,
      verseIntegrity,
      hasNarrative,
    }
  }

  /**
   * VALIDA SE A LETRA TEM NARRATIVA COMPLETA
   */
  private static validateNarrative(lyrics: string): boolean {
    const lyricsLower = lyrics.toLowerCase()

    // Verifica se tem estrutura básica
    const hasIntro =
      lyricsLower.includes("[intro") || lyricsLower.includes("[verse 1") || lyricsLower.includes("[verso 1")
    const hasMiddle =
      lyricsLower.includes("[verse 2") ||
      lyricsLower.includes("[verso 2") ||
      lyricsLower.includes("[bridge") ||
      lyricsLower.includes("[ponte")
    const hasEnd =
      lyricsLower.includes("[outro") ||
      lyricsLower.includes("[final") ||
      lyricsLower.includes("[chorus") ||
      lyricsLower.includes("[refrão")

    // Narrativa completa precisa de pelo menos 2 das 3 partes
    const narrativeParts = [hasIntro, hasMiddle, hasEnd].filter(Boolean).length
    return narrativeParts >= 2
  }

  /**
   * CORREÇÕES EMERGENCIAIS FINAIS
   * Aplica correções drásticas se necessário para garantir que a letra seja válida
   */
  private static applyFinalEmergencyFixes(
    lyrics: string,
    syllableTarget: { min: number; max: number; ideal: number },
    genre: string,
  ): string {
    console.log("[MetaComposer] 🚨 Aplicando correções emergenciais finais...")

    let fixed = lyrics
    const lines = fixed.split("\n")
    const fixedLines: string[] = []

    for (const line of lines) {
      const trimmed = line.trim()

      // Não corrige tags, instruções ou linhas vazias
      if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(") || trimmed.includes("Instruments:")) {
        fixedLines.push(line)
        continue
      }

      const syllables = countPoeticSyllables(trimmed)

      // CORREÇÃO 1: Versos com mais de 12 sílabas
      if (syllables > this.ABSOLUTE_MAX_SYLLABLES) {
        console.log(`[Emergency] Cortando verso longo: "${trimmed}" (${syllables}s)`)

        // Estratégia: Remove palavras do meio, preserva início e fim (rimas)
        const words = trimmed.split(" ")

        if (words.length > 4) {
          // Mantém primeira palavra e últimas 2-3 palavras
          let corrected = [words[0], ...words.slice(-3)].join(" ")

          // Se ainda muito longo, mantém só as últimas 3 palavras
          if (countPoeticSyllables(corrected) > this.ABSOLUTE_MAX_SYLLABLES) {
            corrected = words.slice(-3).join(" ")
          }

          // Se AINDA muito longo, mantém só as últimas 2 palavras
          if (countPoeticSyllables(corrected) > this.ABSOLUTE_MAX_SYLLABLES) {
            corrected = words.slice(-2).join(" ")
          }

          console.log(`[Emergency] Resultado: "${corrected}" (${countPoeticSyllables(corrected)}s)`)
          fixedLines.push(corrected)
        } else {
          // Verso muito curto, mantém original (melhor longo que quebrado)
          fixedLines.push(trimmed)
        }
      }
      // CORREÇÃO 2: Versos muito curtos (menos de 3 palavras)
      else if (trimmed.split(" ").length < 3 && syllables < syllableTarget.min) {
        console.log(`[Emergency] Verso muito curto ignorado: "${trimmed}"`)
        // Remove versos muito curtos que provavelmente são quebrados
        continue
      }
      // CORREÇÃO 3: Versos com aspas não fechadas
      else if ((trimmed.match(/"/g) || []).length % 2 !== 0) {
        console.log(`[Emergency] Corrigindo aspas: "${trimmed}"`)
        fixedLines.push(trimmed + '"')
      }
      // Verso OK
      else {
        fixedLines.push(line)
      }
    }

    fixed = fixedLines.join("\n")

    // Remove linhas vazias consecutivas
    fixed = fixed.replace(/\n\n\n+/g, "\n\n")

    console.log("[MetaComposer] ✅ Correções emergenciais aplicadas")
    return fixed
  }
}
