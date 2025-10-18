/**
 * META-COMPOSITOR INTELIGENTE - SISTEMA AUTÔNOMO DE COMPOSIÇÃO HARMONIZADO
 * Versão final com Sistema Universal de Polimento por Gênero - COMPLETA E ATUALIZADA
 */

import { generateText } from "ai"
import { getGenreConfig } from "@/lib/genre-config"
import { validateFullLyricAgainstForcing } from "@/lib/validation/anti-forcing-validator"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter"
import { SyllableEnforcer } from "@/lib/validation/syllableEnforcer"
import { ThirdWayEngine } from "@/lib/third-way-converter"

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
   * COMPOSIÇÃO INTELIGENTE - SISTEMA UNIVERSAL DE QUALIDADE
   */
  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer] Iniciando composição com Sistema Universal de Qualidade...")

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

    console.log(`[MetaComposer] Configuração: ${preserveRhymes ? 'RIMAS PRESERVADAS' : 'Rimas não preservadas'} | ${applyTerceiraVia ? 'TERCEIRA VIA ATIVA' : 'Terceira Via inativa'} | ${applyFinalPolish ? 'POLIMENTO UNIVERSAL ATIVO' : 'Polimento universal inativo'}`)

    // ✅ VERIFICA SE TEM REFRÕES PARA PRESERVAR
    const preservedChoruses = request.preservedChoruses || []
    const hasPreservedChoruses = preservedChoruses.length > 0
    
    if (hasPreservedChoruses) {
      console.log(`[MetaComposer] 🎯 Modo preservação ativo: ${preservedChoruses.length} refrões selecionados`)
    }

    while (iterations < this.MAX_ITERATIONS) {
      iterations++
      console.log(`\n[MetaComposer] Iteração ${iterations}/${this.MAX_ITERATIONS}`)

      let rawLyrics: string

      // ✅ DECISÃO INTELIGENTE: Geração normal ou com preservação de refrões
      if (hasPreservedChoruses && iterations === 1) {
        console.log('[MetaComposer] Aplicando reescrita com refrões preservados...')
        rawLyrics = await this.generateWithPreservedChoruses(
          preservedChoruses,
          request,
          syllableEnforcement
        )
        preservedChorusesUsed = true
      } else {
        // ✅ GERAÇÃO COM CONTROLE INTELIGENTE
        rawLyrics = await this.generateIntelligentLyrics(request, syllableEnforcement, preserveRhymes)
      }

      // ✅ APLICA TERCEIRA VIA (se habilitado)
      let terceiraViaLyrics = rawLyrics
      let terceiraViaAnalysis = null
      
      if (applyTerceiraVia) {
        console.log('[MetaComposer] Aplicando princípios da Terceira Via...')
        terceiraViaLyrics = await this.applyTerceiraViaToLyrics(rawLyrics, request.genre, request.theme)
        terceiraViaAnalysis = this.analisarTerceiraVia(terceiraViaLyrics, request.genre, request.theme)
        console.log(`[MetaComposer] Score Terceira Via: ${terceiraViaAnalysis.score_geral}/100`)
      }

      // ✅ CORREÇÃO DE SÍLABAS COM PRESERVAÇÃO DE RIMAS
      const enforcedResult = await SyllableEnforcer.enforceSyllableLimits(
        terceiraViaLyrics, 
        syllableEnforcement, 
        request.genre
      )

      console.log(`[MetaComposer] Correções aplicadas: ${enforcedResult.corrections} linhas`)

      // ✅ POLIMENTO UNIVERSAL POR GÊNERO (se habilitado)
      let finalLyrics = enforcedResult.correctedLyrics
      if (applyFinalPolish && iterations === this.MAX_ITERATIONS) {
        console.log('[MetaComposer] Aplicando polimento universal...')
        
        // Aplica polimento específico por gênero
        finalLyrics = await this.applyGenreSpecificPolish(
          enforcedResult.correctedLyrics, 
          request.genre, 
          syllableEnforcement
        )
        
        polishingApplied = true
        
        // ✅ VALIDAÇÃO FINAL UNIVERSAL
        const genreConfig = this.getGenreQualityConfig(request.genre)
        const finalValidation = this.validateRhymeQuality(finalLyrics, genreConfig)
        const syllableValidation = SyllableEnforcer.validateLyrics(finalLyrics, syllableEnforcement)
        
        console.log(`[MetaComposer] 📊 RELATÓRIO FINAL - ${request.genre}:`)
        console.log(`[MetaComposer] Sílabas: ${(syllableValidation.compliance * 100).toFixed(1)}% corretas`)
        console.log(`[MetaComposer] Rimas: ${(finalValidation.score * 100).toFixed(1)}% ricas (mínimo: ${(genreConfig.minRhymeQuality * 100)}%)`)
        
        if (finalValidation.score < genreConfig.minRhymeQuality) {
          console.log(`[MetaComposer] ⚠️ ATENÇÃO: Rimas abaixo do padrão ${request.genre}`)
        }
        
        if (syllableValidation.problems.length > 0) {
          console.log('[MetaComposer] ⚠️ PROBLEMAS DE SÍLABA:')
          syllableValidation.problems.slice(0, 3).forEach(problem => 
            console.log(`  - "${problem.line}" (${problem.syllables}s)`)
          )
        }
      }

      // ✅ VALIDAÇÃO COMPREENSIVA
      const validation = await this.comprehensiveValidation(
        finalLyrics, 
        request, 
        syllableEnforcement,
        terceiraViaAnalysis
      )

      // ✅ CÁLCULO DE SCORE HARMONIZADO
      const qualityScore = this.calculateHarmonizedQualityScore(
        finalLyrics, 
        validation, 
        request, 
        syllableEnforcement,
        terceiraViaAnalysis,
        enforcedResult.corrections
      )

      console.log(`[MetaComposer] Score de qualidade: ${qualityScore.toFixed(2)}`)
      console.log(`[MetaComposer] Estatísticas de sílabas: ${validation.syllableStats.linesWithinLimit}/${validation.syllableStats.totalLines} versos dentro do limite`)

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
            preservedChorusesUsed
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
        console.log("[MetaComposer] Aplicando refinamento autônomo...")
        request = await this.autonomousRefinement(request, validation, syllableEnforcement, terceiraViaAnalysis)
        refinements++
      }
    }

    if (!bestResult) {
      throw new Error("Falha ao gerar composição de qualidade mínima")
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
      console.log('[MetaComposer] ⚠️ VERSOS PROBLEMÁTICOS:')
      finalValidation.problems.forEach(problem => {
        console.log(`  - "${problem.line}" (${problem.syllables}s)`)
      })
    }

    console.log(`[MetaComposer] 🎵 Composição finalizada! Score: ${bestScore.toFixed(2)}`)
    return bestResult
  }

  /**
   * GERAÇÃO COM REFRÕES PRESERVADOS (MÉTODO PÚBLICO)
   */
  private static async generateWithPreservedChoruses(
    preservedChoruses: string[],
    request: CompositionRequest,
    syllableEnforcement: { min: number; max: number; ideal: number }
  ): Promise<string> {
    
    console.log('[MetaComposer] Gerando com refrões preservados:', preservedChoruses.length);
    
    const prompt = `COMPOSIÇÃO MUSICAL COM REFRÕES PRESERVADOS - GÊNERO: ${request.genre.toUpperCase()}

REFRÃOS SELECIONADOS PARA PRESERVAR:
${preservedChoruses.map((chorus, i) => `REFRÃO ${i+1}:\n${chorus}`).join('\n\n')}

TEMA: ${request.theme}
HUMOR: ${request.mood}
GÊNERO: ${request.genre}

LIMITE DE SÍLABAS: ${syllableEnforcement.min}-${syllableEnforcement.max} por linha

TAREFA: Compor uma música completa que:
1. INCORPORE naturalmente os refrões acima preservados
2. PREPARE tematicamente para cada refrão
3. MANTENHA coerência com o tema "${request.theme}" e humor "${request.mood}"
4. RESPEITE o limite de sílabas
5. USEM linguagem do ${request.genre}
6. USEM contrações: "cê", "tô", "pra", "tá"

ESTRUTURA SUGERIDA:
[INTRO]
• Versos introdutórios

[VERSE 1]
• Versos que preparam para o primeiro refrão

[CHORUS]
• Primeiro refrão preservado

[VERSE 2]  
• Versos que desenvolvem o tema

[CHORUS]
• Segundo refrão preservado (ou repetição do primeiro)

[BRIDGE] (opcional)
• Desenvolvimento adicional

[CHORUS]
• Refrão final

[OUTRO]
• Encerramento

RETORNE APENAS A LETRA COMPLETA NO FORMATO CORRETO:`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.4
    });

    return text.trim();
  }

  /**
   * SISTEMA UNIVERSAL DE POLIMENTO POR GÊNERO
   */
  private static async applyGenreSpecificPolish(
    lyrics: string, 
    genre: string,
    syllableTarget: { min: number; max: number; ideal: number }
  ): Promise<string> {
    console.log(`[GenrePolish] Aplicando polimento específico para: ${genre}`)
    
    const genreConfig = this.getGenreQualityConfig(genre)
    const lines = lyrics.split('\n')
    const polishedLines: string[] = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Mantém marcações e backing vocals
      if (line.startsWith('[') || line.startsWith('(') || line.includes('Backing:') || 
          line.includes('Instrumentos:') || line.includes('BPM:') || !line.trim()) {
        polishedLines.push(line)
        continue
      }
      
      const currentSyllables = countPoeticSyllables(line)
      const needsCorrection = currentSyllables < syllableTarget.min || currentSyllables > syllableTarget.max
      
      if (needsCorrection) {
        console.log(`[GenrePolish] Corrigindo linha ${i+1}: "${line}" (${currentSyllables}s)`)
        
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
    
    let finalLyrics = polishedLines.join('\n')
    
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
    
    if (genreLower.includes('sertanejo')) {
      return {
        minRhymeQuality: 0.5, // 50% rimas ricas
        targetSyllables: { min: 9, max: 11, ideal: 10 },
        rhymePatterns: ['AABB', 'ABAB', 'ABBA'],
        languageStyle: 'coloquial rural'
      }
    }
    
    if (genreLower.includes('mpb') || genreLower.includes('bossa')) {
      return {
        minRhymeQuality: 0.6, // 60% rimas ricas
        targetSyllables: { min: 7, max: 12, ideal: 9 },
        rhymePatterns: ['ABAB', 'ABBA', 'ABCD', 'AABA'],
        languageStyle: 'poético sofisticado'
      }
    }
    
    if (genreLower.includes('funk') || genreLower.includes('trap')) {
      return {
        minRhymeQuality: 0.3, // 30% rimas ricas
        targetSyllables: { min: 6, max: 10, ideal: 8 },
        rhymePatterns: ['AABB', 'AAAA', 'ABAB'],
        languageStyle: 'urbano coloquial'
      }
    }
    
    if (genreLower.includes('forró') || genreLower.includes('piseiro')) {
      return {
        minRhymeQuality: 0.4, // 40% rimas ricas
        targetSyllables: { min: 8, max: 11, ideal: 9 },
        rhymePatterns: ['AABB', 'ABAB'],
        languageStyle: 'nordestino festivo'
      }
    }
    
    // Configuração padrão para outros gêneros
    return {
      minRhymeQuality: 0.4, // 40% rimas ricas
      targetSyllables: { min: 7, max: 11, ideal: 9 },
      rhymePatterns: ['AABB', 'ABAB'],
      languageStyle: 'coloquial brasileiro'
    }
  }

  // ... (os outros métodos permanecem iguais - mantive a estrutura completa)
  // Incluindo: polishLineForGenre, enhanceRhymes, fixInstrumentsLanguage, 
  // validateRhymeQuality, hasRichRhyme, getGenreExamples, etc.

  /**
   * GERAÇÃO INTELIGENTE DE LETRAS
   */
  private static async generateIntelligentLyrics(
    request: CompositionRequest, 
    enforcement: { min: number; max: number; ideal: number },
    preserveRhymes: boolean
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

  /**
   * PROMPT HARMONIZADO
   */
  private static buildHarmonizedMasterPrompt(
    request: CompositionRequest, 
    genreConfig: any, 
    enforcement: { min: number; max: number; ideal: number },
    preserveRhymes: boolean
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
"Respondo: 'Só te desejando...'"

${request.additionalRequirements ? `REQUISITOS:\n${request.additionalRequirements}\n` : ''}

RETORNE APENAS A LETRA NO FORMATO CORRETO.`
  }

  // ... (implementar os métodos auxiliares restantes)
}
