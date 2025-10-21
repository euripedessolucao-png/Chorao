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
   * COMPOSIÇÃO TURBO COM SISTEMA DE MÚLTIPLAS GERAÇÕES
   */
  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer-TURBO] 🚀 Iniciando composição com MÚLTIPLAS GERAÇÕES...")
    console.log("[MetaComposer-TURBO] 🎯 Gera 3 versões completas e escolhe a melhor")
    console.log("[MetaComposer-TURBO] 🔮 TERCEIRA VIA SEMPRE ATIVA")

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
    console.log(`[MetaComposer-TURBO] 💪 Pontos fortes:`)
    multiGenResult.variations[multiGenResult.bestVariationIndex].strengths.forEach((s) => {
      console.log(`  - ${s}`)
    })

    if (multiGenResult.variations[multiGenResult.bestVariationIndex].weaknesses.length > 0) {
      console.log(`[MetaComposer-TURBO] ⚠️ Pontos fracos:`)
      multiGenResult.variations[multiGenResult.bestVariationIndex].weaknesses.forEach((w) => {
        console.log(`  - ${w}`)
      })
    }

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
    const useTerceiraVia = request.useTerceiraVia ?? true // ✅ TERCEIRA VIA SEMPRE ATIVA

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

    // ✅ VALIDAÇÃO RÍGIDA DE SÍLABAS - REGRA ABSOLUTA
    const absoluteValidationBefore = AbsoluteSyllableEnforcer.validate(rawLyrics)
    if (!absoluteValidationBefore.isValid) {
      console.error("[MetaComposer] ❌ LETRA GERADA COM MAIS DE 11 SÍLABAS!")
      console.error(absoluteValidationBefore.message)

      // Tenta correção automática inteligente
      console.log("[MetaComposer] 🔧 Aplicando correção automática inteligente...")
      const fixResult = AbsoluteSyllableEnforcer.validateAndFix(rawLyrics)

      if (fixResult.isValid) {
        console.log(`[MetaComposer] ✅ Correção bem-sucedida! ${fixResult.corrections} verso(s) corrigido(s)`)
        rawLyrics = fixResult.correctedLyrics
      } else {
        console.warn("[MetaComposer] ⚠️ Correção parcial aplicada - usando letra com melhorias")
        rawLyrics = fixResult.correctedLyrics
      }
    }

    // Correção automática de sílabas
    const autoCorrectionResult = AutoSyllableCorrector.correctLyrics(rawLyrics)
    rawLyrics = autoCorrectionResult.correctedLyrics

    const absoluteValidationAfterCorrection = AbsoluteSyllableEnforcer.validate(rawLyrics)
    if (!absoluteValidationAfterCorrection.isValid) {
      console.warn("[MetaComposer] ⚠️ CORREÇÃO AUTOMÁTICA NÃO RESOLVEU TODOS OS PROBLEMAS")
      console.warn(absoluteValidationAfterCorrection.message)
      console.warn("[MetaComposer] ⚠️ Usando letra com correções parciais")
    }

    // ✅ TERCEIRA VIA SEMPRE ATIVA COM TRY/CATCH
    if (useTerceiraVia) {
      try {
        console.log("[MetaComposer] 🔮 Iniciando Terceira Via...")
        const terceiraViaAnalysis = analisarTerceiraVia(rawLyrics, request.genre, request.theme)
        
        console.log(`[TerceiraVia] 📊 Score inicial: ${terceiraViaAnalysis?.score_geral || 'N/A'}`)
        
        if (terceiraViaAnalysis && terceiraViaAnalysis.pontos_fracos) {
          console.log(`[TerceiraVia] ⚠️ Pontos fracos:`, terceiraViaAnalysis.pontos_fracos)
        }

        // ✅ CORREÇÃO: LIMITE MAIS BAIXO PARA GARANTIR CORREÇÕES
        if (terceiraViaAnalysis && terceiraViaAnalysis.score_geral < 95) {
          console.log(`[TerceiraVia] 🔧 Aplicando correções automáticas...`)
          rawLyrics = await this.applyTerceiraViaCorrections(rawLyrics, request, terceiraViaAnalysis, genreConfig)
          
          // ✅ VERIFICA RESULTADO
          const analiseFinal = analisarTerceiraVia(rawLyrics, request.genre, request.theme)
          console.log(`[TerceiraVia] ✅ Score final: ${analiseFinal.score_geral} (melhoria: +${analiseFinal.score_geral - terceiraViaAnalysis.score_geral})`)
        } else {
          console.log(`[TerceiraVia] ✅ Letra já otimizada (score: ${terceiraViaAnalysis?.score_geral})`)
        }
      } catch (error) {
        console.error(`[TerceiraVia] ❌ Erro durante execução:`, error)
        console.log(`[TerceiraVia] ⚠️ Continuando sem correções...`)
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

    const finalAbsoluteValidation = AbsoluteSyllableEnforcer.validate(finalLyrics)
    if (!finalAbsoluteValidation.isValid) {
      console.warn("[MetaComposer] ⚠️ VALIDAÇÃO FINAL - LETRA AINDA TEM VERSOS COM MAIS DE 11 SÍLABAS")
      console.warn(finalAbsoluteValidation.message)
      console.warn("[MetaComposer] ⚠️ Retornando letra com melhorias aplicadas")
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

      // ✅ SÓ CORRIGE LINHAS QUE PRECISAM
      if (this.needsTerceiraViaCorrection(line, analysis)) {
        try {
          const context = this.buildLineContext(lines, i, "")
          
          // ✅ CORREÇÃO CRÍTICA: PASSA TODOS OS PARÂMETROS NECESSÁRIOS
          const correctedLine = await applyTerceiraViaToLine(
            line, 
            i, 
            context, 
            false, 
            "", 
            request.genre,
            genreConfig  // ← PARÂMETRO QUE ESTAVA FALTANDO!
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
   * GERA REESCRITA DE LETRA EXISTENTE
   */
  private static async generateRewrite(request: CompositionRequest): Promise<string> {
    console.log("[MetaComposer] Gerando reescrita construindo versos corretos desde o início...")

    if (!request.originalLyrics) {
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
- Gruda na cabeça imediamente
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
- Use contrações: "pra", "tô", "cê", "tá"
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
    return lyrics
  }

  /**
   * APLICA FORMATAÇÃO PERFORMÁTICA
   */
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
