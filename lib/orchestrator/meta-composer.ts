import { countPoeticSyllables } from "@/lib/validation/syllable-counter"
import {
  type TerceiraViaAnalysis,
  analisarTerceiraVia,
  applyTerceiraViaToLine,
} from "@/lib/terceira-via"
import { getGenreConfig } from "@/lib/genre-config"
import { generateText } from "ai"
import {
  formatSertanejoPerformance,
  shouldUsePerformanceFormat,
} from "@/lib/formatters/sertanejo-performance-formatter"
import { AutoSyllableCorrector } from "@/lib/validation/auto-syllable-corrector"
import { PunctuationValidator } from "@/lib/validation/punctuation-validator"
import { LineStacker } from "@/lib/utils/line-stacker"
import { AbsoluteSyllableEnforcer } from "@/lib/validation/absolute-syllable-enforcer"
import { LyricsAuditor } from "@/lib/validation/lyrics-auditor"
import { MultiGenerationEngine } from "./multi-generation-engine"
import { WordIntegrityValidator } from "@/lib/validation/word-integrity-validator"

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
  useTerceiraVia?: boolean
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
  private static readonly MAX_AUDIT_ATTEMPTS = 5
  private static readonly ABSOLUTE_MAX_SYLLABLES = 11
  private static readonly MIN_QUALITY_SCORE = 0.75

  /**
   * Obtém a configuração de sílabas para um gênero específico
   */
  private static getGenreSyllableConfig(genre: string): { min: number; max: number; ideal: number } {
    const genreConfig = getGenreConfig(genre)
    const syllableRules = genreConfig.prosody_rules?.syllable_count

    if (syllableRules && "absolute_max" in syllableRules) {
      return {
        min: 7,
        max: syllableRules.absolute_max,
        ideal: 10,
      }
    } else if (syllableRules && "without_comma" in syllableRules) {
      return {
        min: syllableRules.without_comma.min,
        max: syllableRules.without_comma.acceptable_up_to,
        ideal: Math.floor((syllableRules.without_comma.min + syllableRules.without_comma.max) / 2),
      }
    }

    return {
      min: 7,
      max: 11,
      ideal: 10,
    }
  }

  /**
   * COMPOSIÇÃO TURBO COM SISTEMA DE MÚLTIPLAS GERAÇÕES
   */
  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer-TURBO] 🚀 Iniciando composição com MÚLTIPLAS GERAÇÕES...")
    console.log("[MetaComposer-TURBO] 🎯 Gera 3 versões completas e escolhe a melhor")

    const multiGenResult = await MultiGenerationEngine.generateMultipleVariations(
      async () => {
        return await this.generateSingleVersion(request)
      },
      (lyrics) => {
        const auditResult = LyricsAuditor.audit(lyrics, request.genre, request.theme)
        return auditResult.score
      },
      3,
    )

    const bestLyrics = multiGenResult.variations[multiGenResult.bestVariationIndex].lyrics
    const bestScore = multiGenResult.bestScore

    console.log(`[MetaComposer-TURBO] 🏆 Melhor versão escolhida! Score: ${bestScore}/100`)

    return {
      lyrics: bestLyrics,
      title: this.extractTitle(bestLyrics, request),
      metadata: {
        iterations: 3,
        finalScore: bestScore,
        polishingApplied: request.applyFinalPolish ?? true,
        preservedChorusesUsed: request.preservedChoruses ? request.preservedChoruses.length > 0 : false,
        performanceMode: request.performanceMode || "standard",
      },
    }
  }

  /**
   * GERA UMA VERSÃO COMPLETA DA LETRA
   */
  private static async generateSingleVersion(request: CompositionRequest): Promise<string> {
    console.log("[MetaComposer] 📝 Gerando versão única...")

    const applyFinalPolish = request.applyFinalPolish ?? true
    const preservedChoruses = request.preservedChoruses || []
    const hasPreservedChoruses = preservedChoruses.length > 0
    const isRewrite = !!request.originalLyrics
    const performanceMode = request.performanceMode || "standard"
    const useTerceiraVia = request.useTerceiraVia ?? true

    const syllableEnforcement = request.syllableTarget || this.getGenreSyllableConfig(request.genre)
    syllableEnforcement.max = Math.min(syllableEnforcement.max, this.ABSOLUTE_MAX_SYLLABLES)

    const genreConfig = getGenreConfig(request.genre)

    // Gera letra base
    let rawLyrics: string

    if (isRewrite) {
      rawLyrics = await this.generateRewrite(request)
    } else if (hasPreservedChoruses) {
      rawLyrics = await this.generateWithPreservedChoruses(preservedChoruses, request, syllableEnforcement)
    } else {
      rawLyrics = await this.generateDirectLyrics(request, syllableEnforcement)
    }

    console.log(`[MetaComposer] 🔮 Terceira Via: ${useTerceiraVia ? 'HABILITADA' : 'DESABILITADA'}`)

    // ✅ APLICA CORREÇÕES CRÍTICAS IMEDIATAS
    rawLyrics = this.aplicarCorrecoesCriticas(rawLyrics)

    // ✅ VALIDAÇÃO RÍGIDA DE SÍLABAS
    const absoluteValidationBefore = AbsoluteSyllableEnforcer.validate(rawLyrics)
    if (!absoluteValidationBefore.isValid) {
      console.error("[MetaComposer] ❌ LETRA GERADA COM MAIS DE 11 SÍLABAS!")
      const fixResult = AbsoluteSyllableEnforcer.validateAndFix(rawLyrics)
      rawLyrics = fixResult.correctedLyrics
    }

    // Correção automática de sílabas
    const autoCorrectionResult = AutoSyllableCorrector.correctLyrics(rawLyrics)
    rawLyrics = autoCorrectionResult.correctedLyrics

    // ✅ TERCEIRA VIA COM FALLBACK SEGURO
    if (useTerceiraVia) {
      try {
        console.log("[MetaComposer] 🔮 Iniciando Terceira Via...")
        const terceiraViaAnalysis = analisarTerceiraVia(rawLyrics, request.genre, request.theme)
        
        console.log(`[TerceiraVia] 📊 Score inicial: ${terceiraViaAnalysis?.score_geral || 'N/A'}`)
        
        if (terceiraViaAnalysis && terceiraViaAnalysis.score_geral < 95) {
          console.log(`[TerceiraVia] 🔧 Aplicando correções automáticas...`)
          rawLyrics = await this.applyTerceiraViaCorrections(rawLyrics, request, terceiraViaAnalysis)
          
          const analiseFinal = analisarTerceiraVia(rawLyrics, request.genre, request.theme)
          console.log(`[TerceiraVia] ✅ Score final: ${analiseFinal.score_geral}`)
        } else {
          console.log(`[TerceiraVia] ✅ Letra já otimizada`)
        }
      } catch (error) {
        console.error(`[TerceiraVia] ❌ Erro, usando fallback:`, error)
        // Fallback para correções manuais
        rawLyrics = this.aplicarCorrecoesCriticas(rawLyrics)
      }
    }

    // Polimento final
    let finalLyrics = rawLyrics

    if (applyFinalPolish) {
      finalLyrics = await this.applyUniversalPolish(
        finalLyrics,
        request.genre,
        request.theme,
        syllableEnforcement,
        performanceMode,
        genreConfig,
      )

      const absoluteValidationAfterPolish = AbsoluteSyllableEnforcer.validate(finalLyrics)
      if (!absoluteValidationAfterPolish.isValid) {
        console.warn("[MetaComposer] ⚠️ POLIMENTO GEROU VERSOS COM MAIS DE 11 SÍLABAS!")
        const fixResult = AbsoluteSyllableEnforcer.validateAndFix(finalLyrics)
        finalLyrics = fixResult.correctedLyrics
      }
    }

    // Validação de pontuação
    const punctuationResult = PunctuationValidator.validate(finalLyrics)
    if (!punctuationResult.isValid) {
      finalLyrics = punctuationResult.correctedLyrics
    }

    // Empilhamento de versos
    const stackingResult = LineStacker.stackLines(finalLyrics)
    finalLyrics = stackingResult.stackedLyrics

    // Validação final
    const finalAbsoluteValidation = AbsoluteSyllableEnforcer.validate(finalLyrics)
    if (!finalAbsoluteValidation.isValid) {
      console.warn("[MetaComposer] ⚠️ VALIDAÇÃO FINAL - LETRA AINDA TEM VERSOS COM MAIS DE 11 SÍLABAS")
    } else {
      console.log("[MetaComposer] ✅ LETRA APROVADA - TODOS OS VERSOS TÊM NO MÁXIMO 11 SÍLABAS!")
    }

    // Validação de integridade de palavras
    const integrityCheck = WordIntegrityValidator.validate(finalLyrics)
    if (!integrityCheck.isValid) {
      console.warn("[MetaComposer] ⚠️ Problemas de integridade detectados")
    } else {
      console.log("[MetaComposer] ✅ Integridade de palavras OK")
    }

    return finalLyrics
  }

  /**
   * APLICA CORREÇÕES CRÍTICAS IMEDIATAS
   */
  private static aplicarCorrecoesCriticas(lyrics: string): string {
    const lines = lyrics.split("\n")
    const correctedLines: string[] = []

    for (const line of lines) {
      let correctedLine = line
      
      // CORREÇÕES CRÍTICAS IDENTIFICADAS
      const correcoes = [
        { regex: /nã(\s|$)/gi, correction: 'não ' },
        { regex: /direçã(\s|$)/gi, correction: 'direção ' },
        { regex: /raç(\s|$)/gi, correction: 'raça ' },
        { regex: /láç/gi, correction: 'laço' },
        { regex: /heranç(\s|$)/gi, correction: 'herança ' },
        { regex: /d'ouro/gi, correction: 'de ouro' },
        { regex: /sem direçã/gi, correction: 'sem direção' },
        { regex: /volto pra heranç/gi, correction: 'volto pra herança' },
      ]
      
      correcoes.forEach(({ regex, correction }) => {
        if (regex.test(correctedLine)) {
          correctedLine = correctedLine.replace(regex, correction)
        }
      })
      
      correctedLines.push(correctedLine)
    }

    return correctedLines.join("\n")
  }

  /**
   * APLICA CORREÇÕES DA TERCEIRA VIA (VERSÃO SEGURA)
   */
  private static async applyTerceiraViaCorrections(
    lyrics: string,
    request: CompositionRequest,
    analysis: TerceiraViaAnalysis,
  ): Promise<string> {
    const lines = lyrics.split("\n")
    const correctedLines: string[] = []
    let correctionsApplied = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (this.needsTerceiraViaCorrection(line, analysis)) {
        try {
          const context = this.buildLineContext(lines, i, "")
          
          // ✅ CHAMADA SEGURA - APENAS 6 PARÂMETROS
          const correctedLine = await applyTerceiraViaToLine(
            line, 
            i, 
            context, 
            false, 
            "", 
            request.genre
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

    console.log(`[MetaComposer] ✅ ${correctionsApplied} correções Terceira Via aplicadas`)
    return correctedLines.join("\n")
  }

  /**
   * POLIMENTO UNIVERSAL
   */
  private static async applyUniversalPolish(
    lyrics: string,
    genre: string,
    theme: string,
    syllableTarget: { min: number; max: number; ideal: number },
    performanceMode = "standard",
    genreConfig: any,
  ): Promise<string> {
    console.log(`[MetaComposer] ✨ Aplicando polimento final para: ${genre}`)

    let polishedLyrics = lyrics

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
        // Aplica correções básicas de sílabas
        const polishedLine = this.ajustarSílabas(line, syllableTarget.ideal)
        finalLines.push(polishedLine)
      } else {
        finalLines.push(line)
      }
    }

    polishedLyrics = finalLines.join("\n")

    if (shouldUsePerformanceFormat(genre, performanceMode)) {
      console.log("[MetaComposer] 🎭 Aplicando formato de performance...")
      polishedLyrics = formatSertanejoPerformance(polishedLyrics)
    }

    return polishedLyrics
  }

  /**
   * AJUSTA SÍLABAS DE UMA LINHA
   */
  private static ajustarSílabas(line: string, idealSyllables: number): string {
    const currentSyllables = countPoeticSyllables(line)
    
    if (currentSyllables === idealSyllables) {
      return line
    }

    // Técnicas básicas de ajuste
    let adjustedLine = line

    if (currentSyllables > idealSyllables) {
      // Reduz sílabas
      adjustedLine = adjustedLine
        .replace(/\bpara\b/gi, 'pra')
        .replace(/\bestá\b/gi, 'tá')
        .replace(/\bvocê\b/gi, 'cê')
        .replace(/\bo\b/gi, '')
        .replace(/\ba\b/gi, '')
        .replace(/\bde\b/gi, '')
    } else if (currentSyllables < idealSyllables) {
      // Aumenta sílabas
      adjustedLine = adjustedLine
        .replace(/\bpra\b/gi, 'para')
        .replace(/\btá\b/gi, 'está')
        .replace(/\bcê\b/gi, 'você')
    }

    return adjustedLine
  }

  /**
   * GERA REESCRITA DE LETRA EXISTENTE
   */
  private static async generateRewrite(request: CompositionRequest): Promise<string> {
    console.log("[MetaComposer] Gerando reescrita...")

    if (!request.originalLyrics) {
      throw new Error("Original lyrics required for rewrite")
    }

    const rewritePrompt = `Você é um compositor profissional de ${request.genre}. 
Reescreva esta letra melhorando a qualidade:

LETRA ORIGINAL:
${request.originalLyrics}

TEMA: ${request.theme}
MOOD: ${request.mood}

REGRAS CRÍTICAS:
✅ MÁXIMO 11 SÍLABAS por verso
✅ PALAVRAS COMPLETAS: "não", "direção", "herança", "raça", "laço"
✅ LINGUAGEM natural: "pra", "tá", "cê"
✅ EMOÇÃO autêntica

Retorne APENAS a letra reescrita:`

    try {
      const response = await generateText({
        model: "openai/gpt-4o",
        prompt: rewritePrompt,
        temperature: 0.5,
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

    const chorusPrompt = `Você é um compositor profissional de ${request.genre}. 
Crie uma letra usando EXATAMENTE estes refrões:

${preservedChoruses.join("\n\n")}

TEMA: ${request.theme}
MOOD: ${request.mood}

REGRAS:
- Use os refrões exatamente como fornecidos
- Sílabas: máximo 11 por verso
- Palavras completas e acentos corretos

Retorne a letra completa:`

    try {
      const response = await generateText({
        model: "openai/gpt-4o",
        prompt: chorusPrompt,
        temperature: 0.7,
      })

      return response.text || preservedChoruses.join('\n\n')
    } catch (error) {
      console.error("[MetaComposer] Erro ao gerar letra com refrões preservados:", error)
      return preservedChoruses.join('\n\n')
    }
  }

  /**
   * GERA LETRA DIRETAMENTE
   */
  private static async generateDirectLyrics(
    request: CompositionRequest,
    syllableEnforcement: { min: number; max: number; ideal: number },
  ): Promise<string> {
    console.log("[MetaComposer] Gerando letra direta...")

    const directPrompt = `Você é um compositor profissional de ${request.genre}. 
Crie uma letra autêntica:

TEMA: ${request.theme}
MOOD: ${request.mood}
${request.rhythm ? `RITMO: ${request.rhythm}` : ""}

REGRAS CRÍTICAS:
✅ MÁXIMO 11 SÍLABAS por verso
✅ PALAVRAS COMPLETAS: nunca "nã", "direçã", "heranç", "raç", "láç"
✅ LINGUAGEM natural brasileira
✅ EMOÇÃO autêntica

ESTRUTURA SUGERIDA:
- 2-3 versos de introdução
- Refrão memorável
- 2-3 versos de desenvolvimento
- Refrão repetido
- Final emocional

Retorne APENAS a letra:`

    try {
      const response = await generateText({
        model: "openai/gpt-4o",
        prompt: directPrompt,
        temperature: 0.5,
      })

      return response.text || ""
    } catch (error) {
      console.error("[MetaComposer] Erro ao gerar letra direta:", error)
      throw error
    }
  }

  /**
   * EXTRAI TÍTULO DA LETRA
   */
  private static extractTitle(lyrics: string, request: CompositionRequest): string {
    const lines = lyrics.split("\n")

    for (const line of lines) {
      if (line.toLowerCase().includes("título:") || line.toLowerCase().includes("title:")) {
        return line.split(":")[1]?.trim() || "Sem Título"
      }
    }

    for (const line of lines) {
      const cleaned = line.trim()
      if (cleaned && !cleaned.startsWith("[") && !cleaned.startsWith("(") && cleaned.length > 3) {
        return cleaned.substring(0, 50)
      }
    }

    return `${request.theme} - ${request.genre}`
  }

  /**
   * VERIFICA SE LINHA PRECISA DE CORREÇÃO TERCEIRA VIA
   */
  private static needsTerceiraViaCorrection(line: string, analysis: TerceiraViaAnalysis): boolean {
    if (!line.trim() || line.startsWith("[") || line.startsWith("(") || line.includes("Instruments:")) {
      return false
    }

    if (analysis.score_geral < 70) {
      return true
    }

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

    if (lineIndex > 0) {
      contextLines.push(`Linha anterior: ${lines[lineIndex - 1]}`)
    }

    contextLines.push(`Linha atual: ${lines[lineIndex]}`)

    if (lineIndex < lines.length - 1) {
      contextLines.push(`Próxima linha: ${lines[lineIndex + 1]}`)
    }

    contextLines.push(`Tema: ${theme}`)

    return contextLines.join("\n")
  }
}
