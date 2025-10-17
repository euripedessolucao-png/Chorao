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
import { countSyllables, validateLyricsSyllables } from "@/lib/validation/syllableUtils"

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
    console.log("[MetaComposer] Iniciando composição com controle rigoroso de sílabas...")

    let iterations = 0
    let refinements = 0
    let bestResult: CompositionResult | null = null
    let bestScore = 0

    const syllableTarget = request.syllableTarget || this.SYLLABLE_TARGET

    while (iterations < this.MAX_ITERATIONS) {
      iterations++
      console.log(`[MetaComposer] Iteração ${iterations}/${this.MAX_ITERATIONS}`)

      // 1. GERAÇÃO COM VALIDAÇÃO EM TEMPO REAL
      const rawLyrics = await this.generateWithSyllableControl(request, syllableTarget)

      // 2. VALIDAÇÃO COMPLETA
      const validation = await this.comprehensiveValidation(rawLyrics, request, syllableTarget)

      // 3. CÁLCULO DE QUALIDADE com peso maior para sílabas
      const qualityScore = this.calculateQualityScore(rawLyrics, validation, request, syllableTarget)

      console.log(`[MetaComposer] Score de qualidade: ${qualityScore.toFixed(2)}`)
      console.log(`[MetaComposer] Estatísticas de sílabas: ${validation.syllableStats.linesWithinLimit}/${validation.syllableStats.totalLines} versos dentro do limite`)

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

      // 6. REFINAMENTO AUTÔNOMO com correção específica
      if (this.ENABLE_AUTO_REFINEMENT && iterations < this.MAX_ITERATIONS) {
        console.log("[MetaComposer] Aplicando refinamento autônomo...")
        request = await this.autonomousRefinement(request, validation, syllableTarget)
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
   * ETAPA 1 CORRIGIDA: Geração com controle de sílabas em tempo real
   */
  private static async generateWithSyllableControl(
    request: CompositionRequest, 
    syllableTarget: { min: number; max: number; ideal: number }
  ): Promise<string> {
    const genreConfig = getGenreConfig(request.genre)

    // Construir prompt com REGRAS EXPLÍCITAS de sílabas
    const masterPrompt = this.buildMasterPromptWithSyllableRules(request, genreConfig, syllableTarget)

    // Gerar estrutura base
    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt: masterPrompt,
      temperature: request.creativity === "conservador" ? 0.5 : request.creativity === "ousado" ? 0.9 : 0.7,
    })

    // Aplicar Terceira Via COM VALIDAÇÃO DE SÍLABAS
    const lines = text.split("\n")
    const processedLines: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Pular linhas de estrutura
      if (line.startsWith("[") || line.startsWith("(") || line.startsWith("Título:") || !line.trim()) {
        processedLines.push(line)
        continue
      }

      try {
        let processedLine = await ThirdWayEngine.generateThirdWayLine(
          line,
          request.genre,
          genreConfig,
          `${request.theme} - linha ${i + 1}`,
          request.performanceMode || false,
          request.additionalRequirements,
        )

        // VALIDAÇÃO E CORREÇÃO DE SÍLABAS EM TEMPO REAL
        processedLine = await this.enforceSyllableLimit(processedLine, syllableTarget, request.genre)
        
        processedLines.push(processedLine)
      } catch (error) {
        console.error(`[MetaComposer] Erro Terceira Via linha ${i + 1}:`, error)
        processedLines.push(line)
      }
    }

    return processedLines.join("\n")
  }

  /**
   * NOVO: Aplicação rigorosa do limite de sílabas
   */
  private static async enforceSyllableLimit(
    line: string, 
    syllableTarget: { min: number; max: number; ideal: number },
    genre: string
  ): Promise<string> {
    const syllables = countSyllables(line)
    
    // Se está dentro do limite ideal, mantém
    if (syllables >= syllableTarget.min && syllables <= syllableTarget.max) {
      return line
    }

    // Se ultrapassou, aplica correção automática
    console.log(`[MetaComposer] Correção de sílabas: "${line}" → ${syllables} sílabas`)
    
    const correctionPrompt = this.buildSyllableCorrectionPrompt(line, syllables, syllableTarget, genre)
    
    try {
      const { text: correctedLine } = await generateText({
        model: "openai/gpt-4o", 
        prompt: correctionPrompt,
        temperature: 0.3, // Baixa temperatura para correções precisas
      })
      
      const correctedSyllables = countSyllables(correctedLine.trim())
      console.log(`[MetaComposer] Linha corrigida: "${correctedLine.trim()}" → ${correctedSyllables} sílabas`)
      
      return correctedLine.trim()
    } catch (error) {
      console.error("[MetaComposer] Erro na correção de sílabas:", error)
      return line // Fallback para linha original
    }
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
    const lines = lyrics.split("\n").filter((line) => line.trim() && !line.startsWith("[") && !line.startsWith("("))

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
   * PROMPT CORRIGIDO com regras explícitas de sílabas
   */
  private static buildMasterPromptWithSyllableRules(
    request: CompositionRequest, 
    genreConfig: any, 
    syllableTarget: { min: number; max: number; ideal: number }
  ): string {
    const syllableRules = `
🎵 REGRA ABSOLUTA DE SÍLABAS - ${syllableTarget.min} a ${syllableTarget.max} SÍLABAS

ALVO IDEAL: ${syllableTarget.ideal} sílabas por verso
MÍNIMO: ${syllableTarget.min} sílabas | MÁXIMO: ${syllableTarget.max} sílabas

TÉCNICAS OBRIGATÓRIAS:
1. CONTRÇÕES: "você" → "cê", "estou" → "tô", "para" → "pra", "está" → "tá"
2. ELISÃO: "de amor" → "d'amor", "que eu" → "qu'eu", "meu amor" → "meuamor"  
3. FRASES CURTAS: Corte palavras desnecessárias
4. LINGUAGEM DIRETA: Fale como no dia a dia

EXEMPLOS CORRETOS:
- "Cê tá na minha mente" = 6 sílabas ✓
- "Vou te amar pra sempre" = 7 sílabas ✓
- "Meu coração é teu" = 6 sílabas ✓
- "Nessa vida louca" = 6 sílabas ✓

EXEMPLOS ERRADOS:
- "Eu estou pensando em você constantemente" = 13 sílabas ✗
- "A saudade que eu sinto no peito é enorme" = 14 sílabas ✗

CONTE SÍLABAS ANTES DE ESCREVER!
`

    const languageRule = request.additionalRequirements
      ? `PRIORIDADE ABSOLUTA - REQUISITOS DO COMPOSITOR:\n${request.additionalRequirements}\n\n`
      : ""

    return `${languageRule}${syllableRules}

COMPOSITOR PROFISSIONAL - ${request.genre}

TEMA: ${request.theme}
HUMOR: ${request.mood}
${request.hook ? `HOOK: ${request.hook}` : ""}
${request.title ? `TÍTULO: ${request.title}` : ""}

REGRAS UNIVERSAIS:
1. ${syllableTarget.min}-${syllableTarget.max} sílabas por linha (ALVO: ${syllableTarget.ideal})
2. Empilhar versos em linhas separadas
3. Linguagem simples e coloquial
4. Coerência narrativa > palavras-chave forçadas
5. Refrão: 2 ou 4 linhas (NUNCA 3)

GÊNERO: ${request.genre}
BPM: ${genreConfig.harmony_and_rhythm?.bpm_range?.ideal || 100}

RETORNE APENAS A LETRA FORMATADA.`
  }

  /**
   * NOVO: Prompt específico para correção de sílabas
   */
  private static buildSyllableCorrectionPrompt(
    line: string,
    currentSyllables: number,
    syllableTarget: { min: number; max: number; ideal: number },
    genre: string
  ): string {
    return `CORRIJA A SÍLABA: "${line}" → ${currentSyllables} sílabas

REESCREVA esta linha para ter entre ${syllableTarget.min} e ${syllableTarget.max} sílabas.

TÉCNICAS DE CORREÇÃO:
• Use contrações: "cê", "tô", "pra", "tá"
• Aplique elisão: "d'amor", "qu'eu", "meuamor"  
• Corte palavras desnecessárias
• Mantenha o significado original
• Use linguagem coloquial do ${genre}

EXEMPLOS:
"Eu estou pensando em você" → "Tô pensando em cê" (13→6 sílabas)
"A saudade que eu sinto é grande" → "Saudade que sinto dói" (14→6 sílabas)

REESCREVA AGORA: "${line}"
→`
  }

  // ... (outros métodos mantidos, mas com melhorias)
}
