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
/**
 * ============================================================================
 * META-COMPOSITOR CORRIGIDO - CONTROLE RÍGIDO DE SÍLABAS
 * ============================================================================
 */

import { generateText } from "ai"
import { ThirdWayEngine } from "@/lib/third-way-converter"
import { getGenreConfig } from "@/lib/genre-config"
import { validateFullLyricAgainstForcing } from "@/lib/validation/anti-forcing-validator"
import { countSyllables } from "@/lib/validation/syllableUtils"
import { SyllableEnforcer } from "@/lib/validation/syllableEnforcer"

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
    min: number // 7 sílabas
    max: number // 11 sílabas  
    ideal: number // 8-10 sílabas
  }
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
  }
  metadata: {
    iterations: number
    refinements: number
    finalScore: number
  }
}

/**
 * ----------------------------------------------------------------------------
 * CLASSE CORRIGIDA: MetaComposer
 * ----------------------------------------------------------------------------
 */
export class MetaComposer {
  private static readonly MAX_ITERATIONS = 3
  private static readonly MIN_QUALITY_SCORE = 0.8
  private static readonly ENABLE_AUTO_REFINEMENT = true
  private static readonly SYLLABLE_TARGET = { min: 7, max: 11, ideal: 9 }

  /**
   * Método principal CORRIGIDO com validação em tempo real
   */
  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer] Iniciando composição com IMPOSIÇÃO de sílabas...")

    let iterations = 0
    let refinements = 0
    let bestResult: CompositionResult | null = null
    let bestScore = 0

    const syllableEnforcement = request.syllableTarget || this.SYLLABLE_TARGET

    while (iterations < this.MAX_ITERATIONS) {
      iterations++
      console.log(`[MetaComposer] Iteração ${iterations}/${this.MAX_ITERATIONS}`)

      // 1. GERAÇÃO COM IMPOSIÇÃO RIGOROSA
      const rawLyrics = await this.generateWithSyllableControl(request, syllableEnforcement)

      // 2. APLICA IMPOSIÇÃO FINAL (double-check)
      const enforcedResult = await SyllableEnforcer.enforceSyllableLimits(
        rawLyrics, 
        syllableEnforcement, 
        request.genre
      )

      console.log(`[MetaComposer] Correções aplicadas: ${enforcedResult.corrections} linhas`)

      // 3. VALIDAÇÃO COMPLETA
      const validation = await this.comprehensiveValidation(
        enforcedResult.correctedLyrics, 
        request, 
        syllableEnforcement
      )

      // 4. CÁLCULO DE QUALIDADE com PESO MÁXIMO para sílabas
      const qualityScore = this.calculateQualityScore(
        enforcedResult.correctedLyrics, 
        validation, 
        request, 
        syllableEnforcement
      )

      console.log(`[MetaComposer] Score de qualidade: ${qualityScore.toFixed(2)}`)
      console.log(`[MetaComposer] Estatísticas de sílabas: ${validation.syllableStats.linesWithinLimit}/${validation.syllableStats.totalLines} versos dentro do limite`)

      // 5. ARMAZENAR MELHOR RESULTADO
      if (qualityScore > bestScore) {
        bestScore = qualityScore
        bestResult = {
          lyrics: enforcedResult.correctedLyrics,
          title: this.extractTitle(enforcedResult.correctedLyrics, request),
          validation,
          metadata: {
            iterations,
            refinements,
            finalScore: qualityScore,
          },
        }
      }

      // 6. VERIFICAR SE ATINGIU QUALIDADE MÍNIMA
      if (qualityScore >= this.MIN_QUALITY_SCORE && validation.passed) {
        console.log("[MetaComposer] Qualidade mínima atingida!")
        break
      }

      // 7. REFINAMENTO AUTÔNOMO com correção específica
      if (this.ENABLE_AUTO_REFINEMENT && iterations < this.MAX_ITERATIONS) {
        console.log("[MetaComposer] Aplicando refinamento autônomo...")
        request = await this.autonomousRefinement(request, validation, syllableEnforcement)
        refinements++
      }
    }

    if (!bestResult) {
      throw new Error("Falha ao gerar composição de qualidade mínima")
    }

    // RELATÓRIO FINAL
    const finalValidation = SyllableEnforcer.validateLyrics(bestResult.lyrics, syllableEnforcement)
    console.log(`[MetaComposer] RELATÓRIO FINAL: ${(finalValidation.compliance * 100).toFixed(1)}% de conformidade`)
    console.log(`[MetaComposer] Sílabas: ${finalValidation.withinLimit}/${finalValidation.totalLines} versos corretos`)

    if (finalValidation.problems.length > 0) {
      console.log('[MetaComposer] VERSOS PROBLEMÁTICOS:')
      finalValidation.problems.forEach(problem => {
        console.log(`  • "${problem.line}" (${problem.syllables}s)`)
      })
    }

    console.log(`[MetaComposer] Composição finalizada! Score: ${bestScore.toFixed(2)}`)
    return bestResult
  }

  /**
   * ETAPA 1 CORRIGIDA: Geração com controle de sílabas em tempo real
   */
  private static async generateWithSyllableControl(
    request: CompositionRequest, 
    enforcement: { min: number; max: number; ideal: number }
  ): Promise<string> {
    const genreConfig = getGenreConfig(request.genre)

    // PROMPT COM REGRAS EXPLÍCITAS E EXEMPLOS CONCRETOS
    const masterPrompt = this.buildMasterPromptWithSyllableEnforcement(request, genreConfig, enforcement)

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt: masterPrompt,
      temperature: request.creativity === "conservador" ? 0.5 : request.creativity === "ousado" ? 0.9 : 0.7,
    })

    // APLICA IMPOSIÇÃO IMEDIATA
    const enforcedResult = await SyllableEnforcer.enforceSyllableLimits(text, enforcement, request.genre)
    
    if (enforcedResult.corrections > 0) {
      console.log(`[MetaComposer] ${enforcedResult.corrections} linhas corrigidas na geração`)
    }

    return enforcedResult.correctedLyrics
  }

  /**
   * PROMPT CORRIGIDO - SEM TAGS DESBALANCEADAS
   */
  private static buildMasterPromptWithSyllableEnforcement(
    request: CompositionRequest, 
    genreConfig: any, 
    enforcement: { min: number; max: number; ideal: number }
  ): string {
    return `🎵 COMPOSITOR COM IMPOSIÇÃO DE SÍLABAS - ${request.genre}

🚨 REGRAS ABSOLUTAS DE SÍLABAS (SISTEMA MONITORA E CORRIGE):

LIMITE: ${enforcement.min} a ${enforcement.max} sílabas por linha
ALVO IDEAL: ${enforcement.ideal} sílabas

CONTRÇÕES OBRIGATÓRIAS (SISTEMA VERIFICA):
• "você" → "cê" (2→1 sílaba) - SEMPRE
• "estou" → "tô" (2→1 sílaba) - SEMPRE  
• "para" → "pra" (2→1 sílaba) - SEMPRE
• "está" → "tá" (2→1 sílaba) - SEMPRE

ELISÃO OBRIGATÓRIA (SISTEMA VERIFICA):
• "de amor" → "d'amor" (3→2 sílabas)
• "que eu" → "qu'eu" (2→1 sílaba)
• "meu amor" → "meuamor" (4→3 sílabas)

EXEMPLOS CORRETOS (${enforcement.min}-${enforcement.max}s):
• "Cê tá na minha mente" = 6s ✓
• "Vou te amar pra sempre" = 7s ✓  
• "Meu coração é teu" = 6s ✓
• "Nessa vida louca" = 6s ✓

EXEMPLOS ERRADOS (SISTEMA BLOQUEIA):
• "Eu estou pensando em você" = 13s ✗ (use "Tô pensando em cê")
• "A saudade que eu sinto" = 14s ✗ (use "Saudade que sinto")

SISTEMA AUTOMÁTICO: Se você escrever fora do limite, o sistema reescreverá automaticamente.

TEMA: ${request.theme}
HUMOR: ${request.mood}

ESCREVA JÁ COM AS CONTRÇÕES APLICADAS!

🎯 FORMATO PROFISSIONAL OBRIGATÓRIO:

INSTRUÇÕES EM INGLÊS:
[VERSE 1 - Narrative voice, intimate vocal delivery, establishing story]

LETRAS EM PORTUGUÊS (EMPILHADAS):
Cada verso em uma linha separada
Versos empilhados para facilitar contagem
Máximo ${enforcement.max} sílabas por linha

BACKING VOCALS:
(Backing: "texto em português")

METADATA FINAL:
(Instrumentos: list in English | BPM: number | Ritmo: Portuguese | Estilo: Portuguese)

${request.additionalRequirements ? `REQUISITOS ESPECIAIS:\n${request.additionalRequirements}\n\n` : ''}
RETORNE APENAS A LETRA NO FORMATO CORRETO.`
  }

  /**
   * ETAPA 2 CORRIGIDA: Validação com estatísticas detalhadas de sílabas
   */
  private static async comprehensiveValidation(
    lyrics: string,
    request: CompositionRequest,
    syllableTarget: { min: number; max: number; ideal: number }
  ): Promise<{ 
    passed: boolean; 
    errors: string[]; 
    warnings: string[];
    syllableStats: {
      totalLines: number
      linesWithinLimit: number
      maxSyllablesFound: number
      averageSyllables: number
    }
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    const genreConfig = getGenreConfig(request.genre)
    const lines = lyrics.split('\n').filter((line) => line.trim() && !line.startsWith('[') && !line.startsWith('('))

    // 1. VALIDAÇÃO DETALHADA DE SÍLABAS
    const syllableStats = this.calculateSyllableStatistics(lines, syllableTarget)
    
    if (syllableStats.linesWithinLimit < syllableStats.totalLines) {
      const problemLines = lines.filter(line => {
        const syllables = countSyllables(line)
        return syllables < syllableTarget.min || syllables > syllableTarget.max
      }).slice(0, 3) // Mostrar apenas 3 exemplos
      
      errors.push(
        `${syllableStats.totalLines - syllableStats.linesWithinLimit} versos fora do limite de ${syllableTarget.min}-${syllableTarget.max} sílabas`,
        ...problemLines.map(line => `• "${line}" (${countSyllables(line)} sílabas)`)
      )
    }

    // 2. VALIDAÇÃO ANTI-FORÇAÇÃO
    const forcingValidation = validateFullLyricAgainstForcing(lyrics, request.genre)
    if (!forcingValidation.isValid) {
      errors.push(...forcingValidation.warnings)
    }

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

    // 5. VALIDAÇÃO DE EMPILHAMENTO
    const stackedRatio = this.calculateStackingRatio(lyrics)
    if (stackedRatio < 0.7) {
      warnings.push(`Baixo empilhamento de versos (${(stackedRatio * 100).toFixed(0)}%) - dificulta contagem`)
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
      syllableStats
    }
  }

  /**
   * NOVO: Cálculo detalhado de estatísticas de sílabas
   */
  private static calculateSyllableStatistics(
    lines: string[], 
    syllableTarget: { min: number; max: number; ideal: number }
  ) {
    let totalSyllables = 0
    let linesWithinLimit = 0
    let maxSyllablesFound = 0

    lines.forEach(line => {
      const syllables = countSyllables(line)
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
      averageSyllables: lines.length > 0 ? totalSyllables / lines.length : 0
    }
  }

  /**
   * ETAPA 3 CORRIGIDA: Cálculo com peso maior para sílabas
   */
  private static calculateQualityScore(
    lyrics: string,
    validation: { 
      passed: boolean; 
      errors: string[]; 
      warnings: string[];
      syllableStats: any 
    },
    request: CompositionRequest,
    syllableTarget: { min: number; max: number; ideal: number }
  ): number {
    let score = 1.0

    // PENALIDADES MAIORES para erros de sílabas
    const syllableErrors = validation.errors.filter(error => error.includes('sílabas')).length
    score -= syllableErrors * 0.3 // ↑ Aumentei penalidade de 0.2 para 0.3

    // Penalizar outros erros
    const otherErrors = validation.errors.length - syllableErrors
    score -= otherErrors * 0.2

    // Penalizar avisos leves
    score -= validation.warnings.length * 0.05

    // BONIFICAÇÃO por sílabas dentro do alvo
    const syllableRatio = validation.syllableStats.linesWithinLimit / validation.syllableStats.totalLines
    score += syllableRatio * 0.3 // ↑ Aumentei bonificação de 0.1 para 0.3

    // Bonificar empilhamento correto
    const stackingRatio = this.calculateStackingRatio(lyrics)
    score += stackingRatio * 0.1

    // Bonificar coerência narrativa
    const coherenceScore = this.assessNarrativeCoherence(lyrics)
    score += coherenceScore * 0.15

    // Bonificar simplicidade de linguagem
    const simplicityScore = this.assessLanguageSimplicity(lyrics)
    score += simplicityScore * 0.1

    return Math.max(0, Math.min(1, score))
  }

  /**
   * MÉTODO extractTitle CORRIGIDO
   */
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

  /**
   * MÉTODO autonomousRefinement CORRIGIDO
   */
  private static async autonomousRefinement(
    request: CompositionRequest,
    validation: { passed: boolean; errors: string[]; warnings: string[] },
    syllableTarget: { min: number; max: number; ideal: number }
  ): Promise<CompositionRequest> {
    // Adicionar instruções específicas baseadas nos erros
    const refinementInstructions = [
      ...validation.errors.map((error) => `CORRIGIR: ${error}`),
      ...validation.warnings.map((warning) => `MELHORAR: ${warning}`),
      `GARANTIR: ${syllableTarget.min}-${syllableTarget.max} sílabas por verso (alvo: ${syllableTarget.ideal})`,
      `USAR: contrações "cê", "tô", "pra", "tá" e elisões "d'amor", "qu'eu"`,
    ].join("\n")

    return {
      ...request,
      additionalRequirements: request.additionalRequirements
        ? `${request.additionalRequirements}\n\nREFINAMENTOS NECESSÁRIOS:\n${refinementInstructions}`
        : `REFINAMENTOS NECESSÁRIOS:\n${refinementInstructions}`,
    }
  }

  /**
   * MÉTODO calculateStackingRatio CORRIGIDO
   */
  private static calculateStackingRatio(lyrics: string): number {
    const lines = lyrics.split("\n").filter((line) => line.trim() && !line.startsWith("[") && !line.startsWith("("))
    const linesWithComma = lines.filter((line) => line.includes(",")).length
    const totalLines = lines.length
    return totalLines > 0 ? 1 - linesWithComma / totalLines : 1
  }

  /**
   * MÉTODO assessNarrativeCoherence CORRIGIDO
   */
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

  /**
   * MÉTODO assessLanguageSimplicity CORRIGIDO
   */
  private static assessLanguageSimplicity(lyrics: string): number {
    // Palavras complexas que indicam linguagem rebuscada
    const complexWords = ["outono", "primavera", "florescer", "bonança", "alvorada", "crepúsculo", "efêmero", "sublime"]
    const lyricsLower = lyrics.toLowerCase()
    const complexCount = complexWords.filter((word) => lyricsLower.includes(word)).length

    return Math.max(0, 1 - complexCount * 0.1)
  }
}
