/**
 * ============================================================================
 * META-COMPOSITOR - SISTEMA AUTÔNOMO DE COMPOSIÇÃO INTELIGENTE
 * ============================================================================
 *
 * PROPÓSITO:
 * Orquestrar TODAS as regras e conhecimentos distribuídos no sistema de forma
 * autônoma e inteligente, garantindo que cada composição siga:
 *
 * 1. Terceira Via (força criatividade dentro de restrições)
 * 2. Anti-Forçação (coerência narrativa > palavras-chave)
 * 3. Regras Universais (linguagem simples, 12 sílabas máx, empilhamento)
 * 4. Regras de Gênero (específicas de cada estilo musical)
 * 5. Prioridade de Requisitos Adicionais (sempre no topo)
 *
 * ARQUITETURA:
 * User Request → Meta-Orchestrator → Validation → Refinement → Output
 *
 * REVERSIBILIDADE:
 * Pode ser desativado via flag ENABLE_META_COMPOSER=false
 * ============================================================================
 */

import { generateText } from "ai"
import { ThirdWayEngine } from "@/lib/third-way-converter"
import { getGenreConfig } from "@/lib/genre-config"
import { validateFullLyricAgainstForcing } from "@/lib/validation/anti-forcing-validator"
import { countSyllables } from "@/lib/validation/syllableUtils"

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
}

export interface CompositionResult {
  lyrics: string
  title: string
  validation: {
    passed: boolean
    errors: string[]
    warnings: string[]
  }
  metadata: {
    iterations: number
    refinements: number
    finalScore: number
  }
}

/**
 * ----------------------------------------------------------------------------
 * CLASSE PRINCIPAL: MetaComposer
 * ----------------------------------------------------------------------------
 * Orquestra todo o processo de composição com inteligência autônoma
 */
export class MetaComposer {
  private static readonly MAX_ITERATIONS = 3
  private static readonly MIN_QUALITY_SCORE = 0.8 // Aumentando score mínimo de 70% para 80% conforme solicitado
  private static readonly ENABLE_AUTO_REFINEMENT = true

  /**
   * Método principal: Compõe uma letra completa com validação e refinamento autônomo
   */
  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer] Iniciando composição autônoma...")

    let iterations = 0
    let refinements = 0
    let bestResult: CompositionResult | null = null
    let bestScore = 0

    // Loop de refinamento autônomo
    while (iterations < this.MAX_ITERATIONS) {
      iterations++
      console.log(`[MetaComposer] Iteração ${iterations}/${this.MAX_ITERATIONS}`)

      // 1. GERAÇÃO INICIAL com Terceira Via
      const rawLyrics = await this.generateWithThirdWay(request)

      // 2. VALIDAÇÃO COMPLETA
      const validation = await this.comprehensiveValidation(rawLyrics, request)

      // 3. CÁLCULO DE QUALIDADE
      const qualityScore = this.calculateQualityScore(rawLyrics, validation, request)

      console.log(`[MetaComposer] Score de qualidade: ${qualityScore.toFixed(2)}`)

      // 4. ARMAZENAR MELHOR RESULTADO
      if (qualityScore > bestScore) {
        bestScore = qualityScore
        bestResult = {
          lyrics: rawLyrics,
          title: this.extractTitle(rawLyrics, request),
          validation,
          metadata: {
            iterations,
            refinements,
            finalScore: qualityScore,
          },
        }
      }

      // 5. VERIFICAR SE ATINGIU QUALIDADE MÍNIMA
      if (qualityScore >= this.MIN_QUALITY_SCORE && validation.passed) {
        console.log("[MetaComposer] Qualidade mínima atingida!")
        break
      }

      // 6. REFINAMENTO AUTÔNOMO (se habilitado)
      if (this.ENABLE_AUTO_REFINEMENT && iterations < this.MAX_ITERATIONS) {
        console.log("[MetaComposer] Aplicando refinamento autônomo...")
        request = await this.autonomousRefinement(request, validation)
        refinements++
      }
    }

    if (!bestResult) {
      throw new Error("Falha ao gerar composição de qualidade mínima")
    }

    console.log(`[MetaComposer] Composição finalizada! Score: ${bestScore.toFixed(2)}`)
    return bestResult
  }

  /**
   * ETAPA 1: Geração com Terceira Via linha por linha
   */
  private static async generateWithThirdWay(request: CompositionRequest): Promise<string> {
    const genreConfig = getGenreConfig(request.genre)

    // Construir prompt mestre com TODAS as regras
    const masterPrompt = this.buildMasterPrompt(request, genreConfig)

    // Gerar estrutura base
    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt: masterPrompt,
      temperature: request.creativity === "conservador" ? 0.5 : request.creativity === "ousado" ? 0.9 : 0.7,
    })

    // Aplicar Terceira Via em cada linha
    const lines = text.split("\n")
    const processedLines = await Promise.all(
      lines.map(async (line, index) => {
        // Pular linhas de estrutura
        if (line.startsWith("[") || line.startsWith("(") || line.startsWith("Título:") || !line.trim()) {
          return line
        }

        try {
          return await ThirdWayEngine.generateThirdWayLine(
            line,
            request.genre,
            genreConfig,
            `${request.theme} - linha ${index + 1}`,
            request.performanceMode || false,
            request.additionalRequirements,
          )
        } catch (error) {
          console.error(`[MetaComposer] Erro Terceira Via linha ${index + 1}:`, error)
          return line
        }
      }),
    )

    return processedLines.join("\n")
  }

  /**
   * ETAPA 2: Validação Completa (todas as regras)
   */
  private static async comprehensiveValidation(
    lyrics: string,
    request: CompositionRequest,
  ): Promise<{ passed: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = []
    const warnings: string[] = []

    const genreConfig = getGenreConfig(request.genre)
    const lines = lyrics.split("\n").filter((line) => line.trim() && !line.startsWith("[") && !line.startsWith("("))

    // 1. VALIDAÇÃO ANTI-FORÇAÇÃO
    const forcingValidation = validateFullLyricAgainstForcing(lyrics, request.genre)
    if (!forcingValidation.isValid) {
      errors.push(...forcingValidation.warnings)
    }

    // 2. VALIDAÇÃO DE SÍLABAS (limite fisiológico de 12)
    lines.forEach((line, index) => {
      const syllables = countSyllables(line)
      if (syllables > 12) {
        errors.push(`Linha ${index + 1}: ${syllables} sílabas (máx 12 - limite de um fôlego)`)
      }
    })

    // 3. VALIDAÇÃO DE PALAVRAS PROIBIDAS
    const forbidden = genreConfig.language_rules?.forbidden
      ? Object.values(genreConfig.language_rules.forbidden).flat()
      : []
    const lyricsLower = lyrics.toLowerCase()
    forbidden.forEach((word: string) => {
      if (lyricsLower.includes(word.toLowerCase())) {
        errors.push(`Palavra proibida encontrada: "${word}"`)
      }
    })

    // 4. VALIDAÇÃO DE ESTRUTURA DE REFRÃO
    const chorusMatches = lyrics.match(/\[(?:CHORUS|REFRÃO)[^\]]*\]\s*\n((?:[^\n]+\n?)+?)(?=\[|$)/gi)
    if (chorusMatches) {
      chorusMatches.forEach((chorus, index) => {
        const chorusLines = chorus
          .split("\n")
          .filter((line) => line.trim() && !line.startsWith("["))
          .filter((line) => !line.startsWith("("))
        if (chorusLines.length === 3) {
          errors.push(`Refrão ${index + 1}: 3 linhas é PROIBIDO (use 2 ou 4)`)
        }
      })
    }

    // 5. VALIDAÇÃO DE EMPILHAMENTO (preferência, não erro)
    const stackedRatio = this.calculateStackingRatio(lyrics)
    if (stackedRatio < 0.7) {
      warnings.push(`Baixo empilhamento de versos (${(stackedRatio * 100).toFixed(0)}%) - dificulta contagem`)
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * ETAPA 3: Cálculo de Score de Qualidade
   */
  private static calculateQualityScore(
    lyrics: string,
    validation: { passed: boolean; errors: string[]; warnings: string[] },
    request: CompositionRequest,
  ): number {
    let score = 1.0

    // Penalizar erros críticos
    score -= validation.errors.length * 0.2

    // Penalizar avisos leves
    score -= validation.warnings.length * 0.05

    // Bonificar empilhamento correto
    const stackingRatio = this.calculateStackingRatio(lyrics)
    score += stackingRatio * 0.1

    // Bonificar coerência narrativa
    const coherenceScore = this.assessNarrativeCoherence(lyrics)
    score += coherenceScore * 0.2

    // Bonificar simplicidade de linguagem
    const simplicityScore = this.assessLanguageSimplicity(lyrics)
    score += simplicityScore * 0.15

    return Math.max(0, Math.min(1, score))
  }

  /**
   * ETAPA 4: Refinamento Autônomo
   */
  private static async autonomousRefinement(
    request: CompositionRequest,
    validation: { passed: boolean; errors: string[]; warnings: string[] },
  ): Promise<CompositionRequest> {
    // Adicionar instruções específicas baseadas nos erros
    const refinementInstructions = [
      ...validation.errors.map((error) => `CORRIGIR: ${error}`),
      ...validation.warnings.map((warning) => `MELHORAR: ${warning}`),
    ].join("\n")

    return {
      ...request,
      additionalRequirements: request.additionalRequirements
        ? `${request.additionalRequirements}\n\nREFINAMENTOS NECESSÁRIOS:\n${refinementInstructions}`
        : `REFINAMENTOS NECESSÁRIOS:\n${refinementInstructions}`,
    }
  }

  /**
   * UTILITÁRIOS
   */

  private static buildMasterPrompt(request: CompositionRequest, genreConfig: any): string {
    const languageRule = request.additionalRequirements
      ? `PRIORIDADE ABSOLUTA - REQUISITOS DO COMPOSITOR:\n${request.additionalRequirements}\n\n`
      : `REGRA UNIVERSAL DE LINGUAGEM:\n- Palavras simples e coloquiais do dia-a-dia\n- Fale como humano comum fala\n- PROIBIDO: vocabulário rebuscado, poético, formal\n\n`

    return `${languageRule}COMPOSITOR PROFISSIONAL - ${request.genre}

TEMA: ${request.theme}
HUMOR: ${request.mood}
${request.hook ? `HOOK: ${request.hook}` : ""}
${request.title ? `TÍTULO: ${request.title}` : ""}

REGRAS UNIVERSAIS INVIOLÁVEIS:
1. Máximo 12 sílabas por linha (limite fisiológico)
2. Empilhar versos em linhas separadas (facilita contagem)
3. Linguagem simples e coloquial
4. Coerência narrativa > palavras-chave forçadas
5. Refrão: 2 ou 4 linhas (NUNCA 3)

GÊNERO: ${request.genre}
BPM: ${genreConfig.harmony_and_rhythm?.bpm_range?.ideal || 100}

RETORNE APENAS A LETRA FORMATADA.`
  }

  private static extractTitle(lyrics: string, request: CompositionRequest): string {
    if (request.title) return request.title

    const titleMatch = lyrics.match(/^Título:\s*(.+)$/m)
    if (titleMatch?.[1]) return titleMatch[1].trim()

    const chorusMatch = lyrics.match(/\[(?:CHORUS|REFRÃO)[^\]]*\]\s*\n([^\n]+)/i)
    if (chorusMatch?.[1]) {
      return chorusMatch[1].trim().split(" ").slice(0, 4).join(" ")
    }

    return "Sem Título"
  }

  private static calculateStackingRatio(lyrics: string): number {
    const lines = lyrics.split("\n").filter((line) => line.trim() && !line.startsWith("[") && !line.startsWith("("))
    const linesWithComma = lines.filter((line) => line.includes(",")).length
    const totalLines = lines.length
    return totalLines > 0 ? 1 - linesWithComma / totalLines : 1
  }

  private static assessNarrativeCoherence(lyrics: string): number {
    // Análise simples: verificar se há progressão narrativa
    const hasIntro = /\[INTRO\]/i.test(lyrics)
    const hasVerse = /\[VERS[OE]/i.test(lyrics)
    const hasChorus = /\[(?:CHORUS|REFRÃO)\]/i.test(lyrics)
    const hasOutro = /\[OUTRO\]/i.test(lyrics)

    let score = 0
    if (hasIntro) score += 0.25
    if (hasVerse) score += 0.25
    if (hasChorus) score += 0.25
    if (hasOutro) score += 0.25

    return score
  }

  private static assessLanguageSimplicity(lyrics: string): number {
    // Palavras complexas que indicam linguagem rebuscada
    const complexWords = ["outono", "primavera", "florescer", "bonança", "alvorada", "crepúsculo", "efêmero", "sublime"]
    const lyricsLower = lyrics.toLowerCase()
    const complexCount = complexWords.filter((word) => lyricsLower.includes(word)).length

    return Math.max(0, 1 - complexCount * 0.1)
  }
}
