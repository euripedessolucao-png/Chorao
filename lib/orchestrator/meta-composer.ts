// lib/orchestrator/meta-composer.ts - ADICIONAR VALIDAÇÃO ESPECÍFICA

import { UnifiedSyllableManager } from "../syllable-management/unified-syllable-manager"

export interface CompositionRequest {
  genre: string
  theme: string
  mood?: string
  additionalRequirements?: string
  creativity?: "conservador" | "equilibrado" | "ousado"
  originalLyrics?: string
  performanceMode?: "standard" | "performático"
  applyFinalPolish?: boolean
}

export interface CompositionResult {
  lyrics: string
  title: string
  metadata: {
    finalScore: number
    polishingApplied: boolean
    performanceMode: string
    modelUsed: string
    thirdWayApplied: boolean
    genreSpecificScore: number
    creativityLevel: string
  }
}

interface GenreValidationResult {
  adjustedLyrics: string | null
  score: number
  type: string
  suggestions: string[]
}

interface SertanejoValidationResult {
  score: number
  suggestions: string[]
  errors: string[]
}

export class MetaComposer {
  private static readonly MODEL = "openai/gpt-4o-mini"

  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer] 🚀 Iniciando composição...")

    try {
      // 1. GERAÇÃO BASE
      let lyrics = request.originalLyrics ? await this.rewriteLyrics(request) : await this.generateLyrics(request)

      // 2. CORREÇÃO DE SÍLABAS (SISTEMA UNIFICADO)
      lyrics = await UnifiedSyllableManager.processSongWithBalance(lyrics)

      // 3. VALIDAÇÃO ESPECÍFICA POR GÊNERO
      const genreSpecificValidation = await this.applyGenreSpecificValidation(lyrics, request)
      if (genreSpecificValidation.adjustedLyrics) {
        lyrics = genreSpecificValidation.adjustedLyrics
      }

      // 4. TERCEIRA VIA (SE APLICÁVEL)
      let thirdWayApplied = false
      if (this.shouldApplyThirdWay(request, lyrics)) {
        lyrics = await this.applyStrategicThirdWay(lyrics, request.genre, request.theme)
        thirdWayApplied = true
      }

      // 5. POLIMENTO FINAL
      if (request.applyFinalPolish !== false) {
        lyrics = await this.applyPolish(lyrics, request)
      }

      // 6. SCORE FINAL COM VALIDAÇÕES ESPECÍFICAS
      const finalScore = this.calculateComprehensiveScore(lyrics, request, thirdWayApplied, genreSpecificValidation)

      return {
        lyrics,
        title: this.extractTitle(lyrics, request),
        metadata: {
          finalScore,
          polishingApplied: request.applyFinalPolish !== false,
          performanceMode: request.performanceMode || "standard",
          modelUsed: this.MODEL,
          thirdWayApplied,
          genreSpecificScore: genreSpecificValidation.score,
          creativityLevel: request.creativity || "equilibrado",
        },
      }
    } catch (error) {
      console.error("[MetaComposer] ❌ Erro:", error)
      return this.fallbackResult(request)
    }
  }

  private static async generateLyrics(request: CompositionRequest): Promise<string> {
    // TODO: Implementar geração de letras
    return "Generated lyrics"
  }

  private static async rewriteLyrics(request: CompositionRequest): Promise<string> {
    // TODO: Implementar reescrita de letras
    return request.originalLyrics || "Rewritten lyrics"
  }

  private static async applyPolish(lyrics: string, request: CompositionRequest): Promise<string> {
    // TODO: Implementar polimento final
    return lyrics
  }

  private static extractTitle(lyrics: string, request: CompositionRequest): string {
    // TODO: Implementar extração de título
    const firstLine = lyrics.split("\n")[0]
    return firstLine?.replace(/[^\w\s]/g, "").trim() || "Sem Título"
  }

  private static fallbackResult(request: CompositionRequest): CompositionResult {
    return {
      lyrics: "Erro ao gerar letra. Por favor, tente novamente.",
      title: "Erro",
      metadata: {
        finalScore: 0,
        polishingApplied: false,
        performanceMode: request.performanceMode || "standard",
        modelUsed: this.MODEL,
        thirdWayApplied: false,
        genreSpecificScore: 0,
        creativityLevel: request.creativity || "equilibrado",
      },
    }
  }

  private static shouldApplyThirdWay(request: CompositionRequest, lyrics: string): boolean {
    // TODO: Implementar lógica de decisão para terceira via
    return false
  }

  private static async applyStrategicThirdWay(lyrics: string, genre: string, theme: string): Promise<string> {
    // TODO: Implementar aplicação de terceira via
    return lyrics
  }

  private static async applyGenreSpecificValidation(
    lyrics: string,
    request: CompositionRequest,
  ): Promise<GenreValidationResult> {
    const genre = request.genre.toLowerCase()

    // 🎵 VALIDAÇÃO SERTANEJO ESPECÍFICA
    if (genre.includes("sertanejo")) {
      const sertanejoValidation = this.validateSertanejoModerno(lyrics)

      console.log(`[MetaComposer] 🎵 Validação Sertanejo: ${sertanejoValidation.score} pontos`)

      if (sertanejoValidation.score < 80 && sertanejoValidation.suggestions.length > 0) {
        console.log(`[MetaComposer] 💡 Sugestões Sertanejo:`, sertanejoValidation.suggestions.slice(0, 2))

        const corrected = await this.autoCorrectSertanejoIssues(lyrics, sertanejoValidation)
        return {
          adjustedLyrics: corrected,
          score: sertanejoValidation.score,
          type: "sertanejo",
          suggestions: sertanejoValidation.suggestions,
        }
      }

      return {
        adjustedLyrics: null,
        score: sertanejoValidation.score,
        type: "sertanejo",
        suggestions: sertanejoValidation.suggestions,
      }
    }

    return {
      adjustedLyrics: null,
      score: 85,
      type: "generic",
      suggestions: [],
    }
  }

  private static async autoCorrectSertanejoIssues(
    lyrics: string,
    validation: SertanejoValidationResult,
  ): Promise<string> {
    if (validation.errors.some((error) => error.includes("rimas consecutivas"))) {
      console.log("[MetaComposer] 🔧 Corrigindo rimas repetitivas...")
      const rewritten = await this.rewriteProblematicSections(lyrics, "variar rimas")
      return rewritten || lyrics
    }

    if (validation.errors.some((error) => error.includes("Pré-refrão"))) {
      console.log("[MetaComposer] 🔧 Completando pré-refrão...")
      return await this.completePreChorusLines(lyrics)
    }

    return lyrics
  }

  private static calculateComprehensiveScore(
    lyrics: string,
    request: CompositionRequest,
    thirdWayApplied: boolean,
    genreValidation: GenreValidationResult,
  ): number {
    let score = 75

    const syllableValidation = this.validateLyricsSyllables(lyrics, 8, 10, 12)
    if (syllableValidation.valid) {
      score += 15
    } else {
      score -= syllableValidation.violations.length * 5
    }

    if (genreValidation.score >= 80) score += 10
    else if (genreValidation.score >= 60) score += 5

    if (thirdWayApplied) score += 8

    if (request.creativity === "ousado") score += 7
    else if (request.creativity === "conservador") score += 3

    return Math.min(100, Math.max(0, score))
  }

  private static validateSertanejoModerno(lyrics: string): SertanejoValidationResult {
    // TODO: Implementar validação específica para sertanejo moderno
    return {
      score: 85,
      suggestions: [],
      errors: [],
    }
  }

  private static validateLyricsSyllables(
    lyrics: string,
    min: number,
    max: number,
    ideal: number,
  ): { valid: boolean; violations: string[] } {
    // TODO: Implementar validação de sílabas
    return {
      valid: true,
      violations: [],
    }
  }

  private static async rewriteProblematicSections(lyrics: string, strategy: string): Promise<string | null> {
    // TODO: Implementar reescrita de seções problemáticas
    return null
  }

  private static async completePreChorusLines(lyrics: string): Promise<string> {
    // TODO: Implementar completação de linhas de pré-refrão
    return lyrics
  }
}
