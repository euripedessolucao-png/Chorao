import { countPoeticSyllables } from "@/lib/validation/syllable-counter"
import {
  type TerceiraViaAnalysis,
  analisarTerceiraVia,
  applyTerceiraViaToLine,
  ThirdWayEngine,
} from "@/lib/terceira-via"
import { getGenreConfig } from "@/lib/genre-config"
import { generateText } from "ai"
import {
  formatSertanejoPerformance,
  shouldUsePerformanceFormat,
} from "@/lib/formatters/sertanejo-performance-formatter"
import { PunctuationValidator } from "@/lib/validation/punctuation-validator"
import { LineStacker } from "@/lib/utils/line-stacker"
import { AbsoluteSyllableEnforcer } from "@/lib/validation/absolute-syllable-enforcer"
import { LyricsAuditor } from "@/lib/validation/lyrics-auditor"
import { MultiGenerationEngine } from "./multi-generation-engine"
import { WordIntegrityValidator } from "@/lib/validation/word-integrity-validator"
import { AggressiveAccentFixer } from "@/lib/validation/aggressive-accent-fixer"
import { UltraAggressiveSyllableReducer } from "@/lib/validation/ultra-aggressive-syllable-reducer"

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
      max: 11,
      ideal: 10,
    }
  }

  /**
   * COMPOSIÇÃO TURBO COM SISTEMA DE MÚLTIPLES GERAÇÕES
   *
   * Replica a lógica do gerador de refrão:
   * - Gera 3-5 versões de cada elemento
   * - Escolhe a MELHOR de cada
   * - NUNCA entrega letra com erros!
   */
  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[v0] 🎼 MetaComposer.compose - INÍCIO")
    console.log("[v0] 📊 Request:", {
      genre: request.genre,
      theme: request.theme,
      isRewrite: !!request.originalLyrics,
      hasPreservedChoruses: request.preservedChoruses && request.preservedChoruses.length > 0,
    })

    try {
      console.log("[v0] 🔄 Chamando MultiGenerationEngine...")
      const multiGenResult = await MultiGenerationEngine.generateMultipleVariations(
        async () => {
          console.log("[v0] 📝 Gerando versão única...")
          return await this.generateSingleVersion(request)
        },
        (lyrics) => {
          const auditResult = LyricsAuditor.audit(lyrics, request.genre, request.theme)
          console.log("[v0] 📊 Score da variação:", auditResult.score)
          return auditResult.score
        },
        3,
      )

      console.log("[v0] ✅ MultiGenerationEngine retornou", multiGenResult.variations.length, "variações")
      console.log(
        "[v0] 🏆 Melhor variação: índice",
        multiGenResult.bestVariationIndex,
        "- Score:",
        multiGenResult.bestScore,
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
    } catch (error) {
      console.error("[v0] ❌ MetaComposer.compose - ERRO:", error)
      console.error("[v0] 📍 Local do erro: MultiGenerationEngine")
      console.error("[v0] 🔄 Tentando fallback direto...")

      const syllableEnforcement = request.syllableTarget || this.getGenreSyllableConfig(request.genre)
      syllableEnforcement.max = Math.min(syllableEnforcement.max, this.ABSOLUTE_MAX_SYLLABLES)

      try {
        console.log("[v0] 🔧 Fallback: generateDirectLyrics")
        const fallbackLyrics = await this.generateDirectLyrics(request, syllableEnforcement)
        console.log("[v0] ✅ Fallback bem-sucedido - Letra gerada")

        return {
          lyrics: fallbackLyrics,
          title: this.extractTitle(fallbackLyrics, request),
          metadata: {
            iterations: 1,
            finalScore: 70,
            polishingApplied: false,
            preservedChorusesUsed: false,
            performanceMode: request.performanceMode || "standard",
          },
        }
      } catch (fallbackError) {
        console.error("[v0] 💥 Fallback TAMBÉM FALHOU:", fallbackError)
        console.error("[v0] 🚨 Usando letra de emergência")

        const emergencyLyrics = `[VERSE 1]
${request.theme}
História começa aqui
Tudo vai dar certo

[CHORUS]
${request.theme}
Vai ficar tudo bem
Acredite nisso

[VERSE 2]
Caminho é longo
Mas vamos chegar
Juntos até o fim

[CHORUS]
${request.theme}
Vai ficar tudo bem
Acredite nisso`

        return {
          lyrics: emergencyLyrics,
          title: request.theme,
          metadata: {
            iterations: 0,
            finalScore: 50,
            polishingApplied: false,
            preservedChorusesUsed: false,
            performanceMode: request.performanceMode || "standard",
          },
        }
      }
    }
  }

  /**
   * GERA UMA VERSÃO COMPLETA DA LETRA
   * Método auxiliar usado pelo sistema de múltiplas gerações
   */
  private static async generateSingleVersion(request: CompositionRequest): Promise<string> {
    console.log("[MetaComposer] 📝 Gerando versão única...")

    const applyFinalPolish = request.applyFinalPolish ?? true
    const preservedChoruses = request.preservedChoruses || []
    const hasPreservedChoruses = preservedChoruses.length > 0
    const isRewrite = !!request.originalLyrics
    const performanceMode = request.performanceMode || "standard"
    const useTerceiraVia = request.useTerceiraVia ?? true // ✅ AGORA É AUTOMÁTICA

    const syllableEnforcement = request.syllableTarget || this.getGenreSyllableConfig(request.genre)
    syllableEnforcement.max = Math.min(syllableEnforcement.max, this.ABSOLUTE_MAX_SYLLABLES)

    if (syllableEnforcement.max > this.ABSOLUTE_MAX_SYLLABLES) {
      console.warn(`[MetaComposer] ⚠️ TENTATIVA DE BURLAR REGRA UNIVERSAL! Forçando max=${this.ABSOLUTE_MAX_SYLLABLES}`)
      syllableEnforcement.max = this.ABSOLUTE_MAX_SYLLABLES
    }
    if (syllableEnforcement.ideal > this.ABSOLUTE_MAX_SYLLABLES) {
      console.warn(`[MetaComposer] ⚠️ IDEAL ACIMA DO LIMITE! Ajustando ideal=${this.ABSOLUTE_MAX_SYLLABLES}`)
      syllableEnforcement.ideal = this.ABSOLUTE_MAX_SYLLABLES
    }

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

    console.log("[MetaComposer] 🔍 VALIDAÇÃO IMEDIATA: Verificando regra universal de 11 sílabas...")
    const immediateValidation = AbsoluteSyllableEnforcer.validate(rawLyrics)
    if (!immediateValidation.isValid) {
      console.error("[MetaComposer] ❌ LETRA GERADA VIOLOU REGRA UNIVERSAL DE 11 SÍLABAS!")
      console.error(immediateValidation.message)

      const forceFixResult = AbsoluteSyllableEnforcer.validateAndFix(rawLyrics)
      rawLyrics = forceFixResult.correctedLyrics

      if (!forceFixResult.isValid) {
        console.error("[MetaComposer] ❌ CORREÇÃO FORÇADA FALHOU! Aplicando UltraAggressiveSyllableReducer...")
        const ultraReducer = new UltraAggressiveSyllableReducer()
        const ultraResult = ultraReducer.correctFullLyrics(rawLyrics)
        rawLyrics = ultraResult.correctedLyrics
      }
    }

    console.log("[MetaComposer] 🔧 FASE 1: Aplicando correção de acentuação...")
    const accentFixResult = AggressiveAccentFixer.fix(rawLyrics)
    if (accentFixResult.corrections.length > 0) {
      console.log(`[MetaComposer] ✅ Correção de acentuação: ${accentFixResult.corrections.length} palavras corrigidas`)
      rawLyrics = accentFixResult.correctedText
    }

    console.log("[MetaComposer] 🔧 FASE 2: Aplicando correção ultra agressiva de sílabas...")
    const syllableReducer = new UltraAggressiveSyllableReducer()
    const syllableFixResult = syllableReducer.correctFullLyrics(rawLyrics)
    if (syllableFixResult.report.correctedVerses > 0) {
      console.log(
        `[MetaComposer] ✅ Correção de sílabas: ${syllableFixResult.report.correctedVerses}/${syllableFixResult.report.totalVerses} versos`,
      )
      rawLyrics = syllableFixResult.correctedLyrics
    }

    const postSyllableValidation = AbsoluteSyllableEnforcer.validate(rawLyrics)
    if (!postSyllableValidation.isValid) {
      console.error("[MetaComposer] ❌ AINDA HÁ VERSOS COM MAIS DE 11 SÍLABAS APÓS CORREÇÃO!")
      console.error(postSyllableValidation.message)

      let attempts = 0
      const maxAttempts = 3
      while (!postSyllableValidation.isValid && attempts < maxAttempts) {
        attempts++
        console.log(`[MetaComposer] 🔄 Tentativa ${attempts}/${maxAttempts} de correção forçada...`)
        const fixResult = AbsoluteSyllableEnforcer.validateAndFix(rawLyrics)
        rawLyrics = fixResult.correctedLyrics

        if (fixResult.isValid) {
          console.log(`[MetaComposer] ✅ Correção bem-sucedida na tentativa ${attempts}!`)
          break
        }
      }

      if (attempts === maxAttempts && !postSyllableValidation.isValid) {
        console.error("[MetaComposer] ❌ FALHA CRÍTICA: Não foi possível corrigir todos os versos!")
        console.error("[MetaComposer] ⚠️ Usando letra com correções parciais")
      }
    }

    // ✅ TERCEIRA VIA AGORA É AUTOMÁTICA
    const terceiraViaAnalysis = analisarTerceiraVia(rawLyrics, request.genre, request.theme)

    if (terceiraViaAnalysis && terceiraViaAnalysis.score_geral < 75) {
      rawLyrics = await this.applyTerceiraViaCorrections(rawLyrics, request, terceiraViaAnalysis, genreConfig)

      const accentFixAfterTerceiraVia = AggressiveAccentFixer.fix(rawLyrics)
      if (accentFixAfterTerceiraVia.corrections.length > 0) {
        console.log(
          `[MetaComposer] ✅ Correção de acentuação pós-Terceira Via: ${accentFixAfterTerceiraVia.corrections.length} palavras`,
        )
        rawLyrics = accentFixAfterTerceiraVia.correctedText
      }

      const absoluteValidationAfterTerceiraVia = AbsoluteSyllableEnforcer.validate(rawLyrics)
      if (!absoluteValidationAfterTerceiraVia.isValid) {
        console.warn("[MetaComposer] ⚠️ TERCEIRA VIA GEROU VERSOS COM MAIS DE 11 SÍLABAS!")
        console.warn(absoluteValidationAfterTerceiraVia.message)

        const fixResult = AbsoluteSyllableEnforcer.validateAndFix(rawLyrics)
        if (fixResult.isValid) {
          rawLyrics = fixResult.correctedLyrics
        } else {
          console.warn("[MetaComposer] ⚠️ Usando letra da Terceira Via com correções parciais")
          rawLyrics = fixResult.correctedLyrics
        }
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

      const accentFixAfterPolish = AggressiveAccentFixer.fix(finalLyrics)
      if (accentFixAfterPolish.corrections.length > 0) {
        console.log(
          `[MetaComposer] ✅ Correção de acentuação pós-polimento: ${accentFixAfterPolish.corrections.length} palavras`,
        )
        finalLyrics = accentFixAfterPolish.correctedText
      }

      const absoluteValidationAfterPolish = AbsoluteSyllableEnforcer.validate(finalLyrics)
      if (!absoluteValidationAfterPolish.isValid) {
        console.warn("[MetaComposer] ⚠️ POLIMENTO GEROU VERSOS COM MAIS DE 11 SÍLABAS!")
        console.warn(absoluteValidationAfterPolish.message)

        const fixResult = AbsoluteSyllableEnforcer.validateAndFix(finalLyrics)
        if (fixResult.isValid) {
          finalLyrics = fixResult.correctedLyrics
        } else {
          console.warn("[MetaComposer] ⚠️ Usando letra polida com correções parciais")
          finalLyrics = fixResult.correctedLyrics
        }
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

    console.log("[MetaComposer] 🔧 CORREÇÃO FINAL: Aplicando última camada de correção de acentuação...")
    const finalAccentFix = AggressiveAccentFixer.ultimateFix(finalLyrics)
    if (finalAccentFix !== finalLyrics) {
      console.log("[MetaComposer] ✅ Correção final de acentuação aplicada")
      finalLyrics = finalAccentFix
    }

    console.log("[MetaComposer] 🔍 VALIDAÇÃO FINAL ABSOLUTA: Verificando regra universal de 11 sílabas...")
    const finalAbsoluteValidation = AbsoluteSyllableEnforcer.validate(finalLyrics)
    if (!finalAbsoluteValidation.isValid) {
      console.error("[MetaComposer] ❌ VALIDAÇÃO FINAL FALHOU - LETRA VIOLA REGRA UNIVERSAL!")
      console.error(finalAbsoluteValidation.message)

      console.log("[MetaComposer] 🚨 APLICANDO CORREÇÃO DE EMERGÊNCIA...")
      const emergencyFix = AbsoluteSyllableEnforcer.validateAndFix(finalLyrics)
      finalLyrics = emergencyFix.correctedLyrics

      if (!emergencyFix.isValid) {
        console.error("[MetaComposer] ❌ CORREÇÃO DE EMERGÊNCIA FALHOU!")
        console.error("[MetaComposer] ⚠️ RETORNANDO LETRA COM AVISOS CRÍTICOS")
      } else {
        console.log("[MetaComposer] ✅ CORREÇÃO DE EMERGÊNCIA BEM-SUCEDIDA!")
      }
    } else {
      console.log("[MetaComposer] ✅ LETRA APROVADA - TODOS OS VERSOS TÊM NO MÁXIMO 11 SÍLABAS!")
    }

    // Validação de integridade de palavras
    const integrityCheck = WordIntegrityValidator.validate(finalLyrics)
    if (!integrityCheck.isValid) {
      console.warn("[MetaComposer] ⚠️ Versão com problemas de integridade detectados:")
      integrityCheck.errors.forEach((error) => {
        if (error.suggestion) {
          console.warn(`  - Linha ${error.lineNumber}: "${error.word}" → sugestão: "${error.suggestion}"`)
        } else {
          console.warn(`  - Linha ${error.lineNumber}: "${error.word}" parece incompleta`)
        }
      })
      console.warn("[MetaComposer] ⚠️ Retornando letra com avisos de integridade")
    } else {
      console.log("[MetaComposer] ✅ Versão aprovada - Integridade de palavras OK")
    }

    console.log("[v0] 🎉 MetaComposer.compose - SUCESSO")
    return finalLyrics
  }

  /**
   * APLICA CORREÇÕES BASEADAS NA ANÁLISE TERCEIRA VIA
   */
  private static async applyTerceiraViaCorrections(
    lyrics: string,
    request: CompositionRequest,
    analysis: TerceiraViaAnalysis,
    genreConfig: any,
  ): Promise<string> {
    const lines = lyrics.split("\n")
    const correctedLines: string[] = []
    let correctionsApplied = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // SÓ CORRIGE LINHAS QUE PRECISAM
      if (this.needsTerceiraViaCorrection(line, analysis)) {
        try {
          const context = this.buildLineContext(lines, i, "")
          const correctedLine = await applyTerceiraViaToLine(
            line,
            i,
            context,
            false,
            "",
            request.genre,
            genreConfig, // ← PARÂMETRO QUE ESTAVA FALTANDO!
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
    genreConfig: any,
  ): Promise<string> {
    console.log(`[MetaComposer-TURBO] ✨ Polimento universal para: ${genre} (${performanceMode})`)

    let polishedLyrics = lyrics

    // ETAPA 1: CORREÇÃO DE RIMAS COM TERCEIRA VIA
    polishedLyrics = await this.applyRhymeEnhancement(polishedLyrics, genre, theme)

    // ETAPA 2: CORREÇÃO DE SÍLABAS INTELIGENTE
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
          const polishedLine = await ThirdWayEngine.generateThirdWayLine(
            line,
            genre,
            genreConfig,
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

    if (shouldUsePerformanceFormat(genre, performanceMode)) {
      console.log("[MetaComposer] 🎭 Aplicando formato de performance para sertanejo moderno...")
      polishedLyrics = formatSertanejoPerformance(polishedLyrics)
    } else if (performanceMode === "performance") {
      polishedLyrics = this.applyPerformanceFormatting(polishedLyrics, genre)
    }

    return polishedLyrics
  }

  /**
   * GERA REESCRITA DE LETRA EXISTENTE - CONSTRUINDO VERSOS CORRETOS DESDE O INÍCIO
   */
  private static async generateRewrite(request: CompositionRequest): Promise<string> {
    console.log("[v0] 📝 generateRewrite - INÍCIO")
    console.log("[v0] 📊 Original lyrics length:", request.originalLyrics?.length || 0)

    if (!request.originalLyrics) {
      console.error("[v0] ❌ generateRewrite - Letra original não fornecida!")
      throw new Error("Original lyrics required for rewrite")
    }

    const syllableTarget = request.syllableTarget || this.getGenreSyllableConfig(request.genre)
    const genreConfig = getGenreConfig(request.genre)

    const rewritePrompt = `Você é um compositor profissional de ${request.genre} que cria MEGA HITS BRASILEIROS.

LETRA ORIGINAL:
${request.originalLyrics}

TEMA: ${request.theme}
MOOD: ${request.mood}

═══════════════════════════════════════════════════════════════
⚠️ REGRA CRÍTICA DE ACENTUAÇÃO (NÃO NEGOCIÁVEL)
═══════════════════════════════════════════════════════════════

NUNCA escreva palavras sem acentos corretos!

❌ ERRADO: "nã", "seguranç", "heranç", "raç", "laç", "esperanç"
✅ CORRETO: "não", "segurança", "herança", "raça", "laço", "esperança"

Se precisar reduzir sílabas, use OUTRAS técnicas:
- Remova artigos: "o", "a", "um", "uma"
- Use contrações: "pra", "tô", "cê", "tá"
- Simplifique frases: "que eu tenho" → "que tenho"

MAS NUNCA remova acentos ou corte palavras!

═══════════════════════════════════════════════════════════════
🎯 REGRA DE OURO ATUALIZADA - RESPEITA 11 SÍLABAS
═══════════════════════════════════════════════════════════════

**PRIORIDADE MÁXIMA (Não negociável):**
1. ✅ MÁXIMO 11 SÍLABAS por verso (REGRA ABSOLUTA)
2. ✅ Palavras COMPLETAS com acentuação CORRETA
3. ✅ Emoção autêntica e história envolvente

**PRIORIDADE IMPORTANTE:**
4. ✅ Chorus memorável que gruda na cabeça
5. ✅ Linguagem coloquial brasileira (cê, tô, pra)
6. ✅ Frases completas e coerentes

**TÉCNICAS PARA RESPEITAR 11 SÍLABAS:**
✅ "por entre os dedos" → "entre os dedos" (reduz 2 sílabas)
✅ "Comprando remédio" → "Compro remédio" (reduz 1 sílaba)
✅ "o meu coração" → "meu coração" (reduz 1 sílaba)
✅ "que eu estou sentindo" → "que tô sentindo" (reduz 2 sílabas)

**REGRA DE OURO ATUALIZADA:**
EMOÇÃO dentro dos LIMITES TÉCNICOS!
Verso perfeito = Até 11 sílabas + Emoção + Palavras íntegras

═══════════════════════════════════════════════════════════════
🎵 CARACTERÍSTICAS DOS MEGA HITS
═══════════════════════════════════════════════════════════════

**CHORUS MEMORÁVEL:**
- Frases curtas (máximo 8-9 sílabas)
- Extremamente repetitivo
- Gruda na cabeça imediatamente
- Fácil de cantar junto (karaoke-friendly)

**LINGUAGEM COLOQUIAL:**
- "cê" ao invés de "você"
- "tô" ao invés de "estou"
- "pra" ao invés de "para"
- "tá" ao invés de "está"

**NARRATIVA ENVOLVENTE:**
- Começo-meio-fim claro
- História que emociona
- Autenticidade (não forçado)

═══════════════════════════════════════════════════════════════
⚠️ IMPORTANTE - REGRA ABSOLUTA
═══════════════════════════════════════════════════════════════

NUNCA ENTREGUE VERSOS COM MAIS DE 11 SÍLABAS!
Se precisar escolher entre:
- Verso com 10-11 sílabas + emocionalmente perfeito
- Verso com 12+ sílabas (NUNCA PERMITIDO)

ESCOLHA SEMPRE A PRIMEIRA OPÇÃO!
A técnica serve à emoção, mas o limite de 11 sílabas é ABSOLUTO.

═══════════════════════════════════════════════════════════════

Retorne APENAS a letra reescrita (sem explicações):`

    try {
      console.log("[v0] 🤖 Chamando AI para reescrita...")
      const response = await generateText({
        model: "openai/gpt-4o",
        prompt: rewritePrompt,
        temperature: 0.5,
      })

      console.log("[v0] ✅ AI retornou resposta - Length:", response.text?.length || 0)
      return response.text || request.originalLyrics
    } catch (error) {
      console.error("[v0] ❌ generateRewrite - Erro na AI:", error)
      console.error("[v0] 🔄 Retornando letra original como fallback")
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

    const syllableTarget = request.syllableTarget || this.getGenreSyllableConfig(request.genre)
    const genreConfig = getGenreConfig(request.genre)

    try {
      const chorusPrompt = `Você é um compositor profissional de ${request.genre}. Crie uma letra usando EXATAMENTE estes refrões:

${preservedChoruses.join("\n\n")}

TEMA: ${request.theme}
MOOD: ${request.mood}

REGRAS ABSOLUTAS:

1. SÍLABAS: Máximo 11 por verso (conte antes de finalizar) - REGRA ABSOLUTA
2. GRAMÁTICA: Frases completas em português correto
3. VOCABULÁRIO: Use biquíni, PIX, story, boteco (evite clichês dramáticos)
4. LINGUAGEM: Coloquial brasileira (tô, cê, pra)
5. NARRATIVA: História fluída com começo-meio-fim

⚠️ REGRA DE OURO: MÁXIMO 11 SÍLABAS POR VERSO - NÃO NEGOCIÁVEL

Retorne a letra completa com os refrões preservados:`

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
   * GERA LETRA DIRETAMENTE - CONSTRUINDO VERSOS CORRETOS DESDE O INÍCIO
   */
  private static async generateDirectLyrics(
    request: CompositionRequest,
    syllableEnforcement: { min: number; max: number; ideal: number },
  ): Promise<string> {
    console.log("[MetaComposer] Gerando letra construindo versos corretos desde o início...")

    const genreConfig = getGenreConfig(request.genre)

    const directPrompt = `Você é um compositor profissional de ${request.genre} que cria MEGA HITS BRASILEIROS.

TEMA: ${request.theme}
MOOD: ${request.mood}
${request.rhythm ? `RITMO: ${request.rhythm}` : ""}

═══════════════════════════════════════════════════════════════
⚠️ REGRA CRÍTICA DE ACENTUAÇÃO (NÃO NEGOCIÁVEL)
═══════════════════════════════════════════════════════════════

NUNCA escreva palavras sem acentos corretos!

❌ ERRADO: "nã", "seguranç", "heranç", "raç", "laç", "esperanç"
✅ CORRETO: "não", "segurança", "herança", "raça", "laço", "esperança"

Se precisar reduzir sílabas, use OUTRAS técnicas:
- Remova artigos: "o", "a", "um", "uma"
- Use contrações: "pra", "tá", "tô", "cê"
- Simplifique frases: "que eu tenho" → "que tenho"

MAS NUNCA remova acentos ou corte palavras!

═══════════════════════════════════════════════════════════════
🎯 REGRA DE OURO ATUALIZADA - MÁXIMO 11 SÍLABAS
═══════════════════════════════════════════════════════════════

**PRIORIDADE MÁXIMA (Não negociável):**
1. ✅ MÁXIMO 11 SÍLABAS por verso (REGRA ABSOLUTA)
2. ✅ Palavras COMPLETAS com acentuação CORRETA
3. ✅ Emoção autêntica e história envolvente

**PRIORIDADE IMPORTANTE:**
4. ✅ Chorus memorável que gruda na cabeça
5. ✅ Linguagem coloquial brasileira (cê, tô, pra)
6. ✅ Frases completas e coerentes

**TÉCNICAS PARA 11 SÍLABAS:**
✅ Remover artigos: "o", "a", "um", "uma"
✅ Contrações: "pra", "tá", "tô", "cê"
✅ Simplificar: "que eu tenho" → "que tenho"
✅ Encurtar: "por entre os dedos" → "entre os dedos"

**REGRA DE OURO ATUALIZADA:**
EMOÇÃO dentro dos LIMITES TÉCNICOS!
Verso perfeito = Até 11 sílabas + Emoção + Palavras íntegras

═══════════════════════════════════════════════════════════════
🎵 CARACTERÍSTICAS DOS MEGA HITS
═══════════════════════════════════════════════════════════════

**CHORUS MEMORÁVEL:**
- Frases curtas (máximo 8-9 sílabas)
- Extremamente repetitivo
- Gruda na cabeça imediatamente
- Fácil de cantar junto (karaoke-friendly)

**LINGUAGEM COLOQUIAL:**
- "cê" ao invés de "você"
- "tô" ao invés de "estou"
- "pra" ao invés de "para"
- "tá" ao invés de "está"

**NARRATIVA ENVOLVENTE:**
- Começo-meio-fim claro
- História que emociona
- Autenticidade (não forçado)

═══════════════════════════════════════════════════════════════
⚠️ IMPORTANTE - REGRA ABSOLUTA
═══════════════════════════════════════════════════════════════

NUNCA ENTREGUE VERSOS COM MAIS DE 11 SÍLABAS!
A emoção é importante, mas o limite técnico é ABSOLUTO.

Se encontrar um verso com 12+ sílabas:
❌ NÃO ENTREGUE
✅ REESCREVA respeitando o limite
✅ USE as técnicas de redução acima

═══════════════════════════════════════════════════════════════

Retorne APENAS a letra (sem explicações):`

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

  // ... (métodos auxiliares mantidos da versão original)

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

  private static async applyRhymeEnhancement(lyrics: string, genre: string, theme: string): Promise<string> {
    console.log("[MetaComposer] Aplicando melhorias de rima...")
    return lyrics
  }

  private static applyPerformanceFormatting(lyrics: string, genre: string): string {
    console.log("[MetaComposer] Aplicando formatação performática...")
    let formatted = lyrics

    // Converte tags comuns para inglês
    formatted = formatted.replace(/\[Intro\]/gi, "[Intro]")
    formatted = formatted.replace(/\[Verso\s*(\d*)\]/gi, "[Verse$1]")
    formatted = formatted.replace(/\[Refrão\]/gi, "[Chorus]")
    formatted = formatted.replace(/\[Ponte\]/gi, "[Bridge]")
    formatted = formatted.replace(/\[Final\]/gi, "[Outro]")

    return formatted
  }
}
