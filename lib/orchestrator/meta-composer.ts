// lib/orchestrator/meta-composer.ts - ADICIONAR VALIDAÇÃO ESPECÍFICA

export class MetaComposer {
  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer] 🚀 Iniciando composição...")

    try {
      // 1. GERAÇÃO BASE
      let lyrics = request.originalLyrics 
        ? await this.rewriteLyrics(request) 
        : await this.generateLyrics(request)

      // 2. CORREÇÃO DE SÍLABAS (SISTEMA UNIFICADO)
      lyrics = await UnifiedSyllableManager.processSongWithBalance(lyrics, request.genre)

      // ✅ 3. VALIDAÇÃO ESPECÍFICA POR GÊNERO
      const genreSpecificValidation = await this.applyGenreSpecificValidation(lyrics, request)
      if (genreSpecificValidation.adjustedLyrics) {
        lyrics = genreSpecificValidation.adjustedLyrics
      }

      // 4. TERCEIRA VIA (SE APLICÁVEL)
      let thirdWayApplied = false
      if (this.shouldApplyThirdWay(request, lyrics)) {
        lyrics = await ThirdWayIntegration.applyStrategicThirdWay(lyrics, request.genre, request.theme)
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
          creativityLevel: request.creativity || "equilibrado"
        },
      }

    } catch (error) {
      console.error("[MetaComposer] ❌ Erro:", error)
      return this.fallbackResult(request)
    }
  }

  /**
   * ✅ APLICA VALIDAÇÃO ESPECÍFICA POR GÊNERO
   */
  private static async applyGenreSpecificValidation(
    lyrics: string, 
    request: CompositionRequest
  ): Promise<GenreValidationResult> {
    
    const genre = request.genre.toLowerCase()
    
    // 🎵 VALIDAÇÃO SERTANEJO ESPECÍFICA
    if (genre.includes('sertanejo')) {
      const sertanejoValidation = validateSertanejoModerno(lyrics)
      
      console.log(`[MetaComposer] 🎵 Validação Sertanejo: ${sertanejoValidation.score} pontos`)
      
      if (sertanejoValidation.score < 80 && sertanejoValidation.suggestions.length > 0) {
        console.log(`[MetaComposer] 💡 Sugestões Sertanejo:`, sertanejoValidation.suggestions.slice(0, 2))
        
        // Aplica correções automáticas para problemas críticos
        const corrected = await this.autoCorrectSertanejoIssues(lyrics, sertanejoValidation)
        return {
          adjustedLyrics: corrected,
          score: sertanejoValidation.score,
          type: 'sertanejo',
          suggestions: sertanejoValidation.suggestions
        }
      }
      
      return {
        adjustedLyrics: null,
        score: sertanejoValidation.score,
        type: 'sertanejo',
        suggestions: sertanejoValidation.suggestions
      }
    }

    // 🎶 OUTROS GÊNEROS PODEM TER VALIDAÇÕES ESPECÍFICAS FUTURAS
    return {
      adjustedLyrics: null,
      score: 85, // Score base para outros gêneros
      type: 'generic',
      suggestions: []
    }
  }

  /**
   * ✅ CORREÇÃO AUTOMÁTICA PARA PROBLEMAS SERTANEJO
   */
  private static async autoCorrectSertanejoIssues(
    lyrics: string,
    validation: SertanejoValidationResult
  ): Promise<string> {
    
    // Para rimas repetitivas - reescreve seções problemáticas
    if (validation.errors.some(error => error.includes('rimas consecutivas'))) {
      console.log('[MetaComposer] 🔧 Corrigindo rimas repetitivas...')
      
      // Usa o sistema de reescrita para variar rimas
      const rewritten = await this.rewriteProblematicSections(lyrics, 'variar rimas')
      return rewritten || lyrics
    }

    // Para pré-refrão incompleto - completa frases
    if (validation.errors.some(error => error.includes('Pré-refrão'))) {
      console.log('[MetaComposer] 🔧 Completando pré-refrão...')
      return await this.completePreChorusLines(lyrics)
    }

    return lyrics // Mantém original se não há correção automática
  }

  /**
   * ✅ CALCULA SCORE COMPREENSIVO
   */
  private static calculateComprehensiveScore(
    lyrics: string,
    request: CompositionRequest,
    thirdWayApplied: boolean,
    genreValidation: GenreValidationResult
  ): number {
    
    let score = 75 // Base

    // 📏 VALIDAÇÃO DE SÍLABAS (CRÍTICO)
    const syllableValidation = validateLyricsSyllables(lyrics, 8, 10, 12)
    if (syllableValidation.valid) {
      score += 15
    } else {
      score -= syllableValidation.violations.length * 5
    }

    // 🎵 SCORE ESPECÍFICO DO GÊNERO
    if (genreValidation.score >= 80) score += 10
    else if (genreValidation.score >= 60) score += 5

    // 🌟 BÔNUS TERCEIRA VIA
    if (thirdWayApplied) score += 8

    // 🎨 BÔNUS CRIATIVIDADE
    if (request.creativity === "ousado") score += 7
    else if (request.creativity === "conservador") score += 3

    return Math.min(100, Math.max(0, score))
  }

  // ... outros métodos existentes ...
}

// ✅ INTERFACE PARA VALIDAÇÃO POR GÊNERO
interface GenreValidationResult {
  adjustedLyrics: string | null
  score: number
  type: string
  suggestions: string[]
}
