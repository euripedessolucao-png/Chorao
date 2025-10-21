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
import { AggressiveAccentFixer } from "@/lib/validation/aggressive-accent-fixer"
import { RepetitionValidator } from "@/lib/validation/repetition-validator"

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
    accentCorrections?: number
    syllableCorrections?: number
  }
}

export class MetaComposer {
  private static readonly MAX_ITERATIONS = 3
  private static readonly MAX_AUDIT_ATTEMPTS = 5
  private static readonly ABSOLUTE_MAX_SYLLABLES = 11
  private static readonly MIN_QUALITY_SCORE = 0.75

  /**
   * COMPOSIÇÃO TURBO COM SISTEMA DE MÚLTIPLAS GERAÇÕES E CORREÇÃO AGREGADA
   */
  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer-TURBO] 🚀 Iniciando composição com MÚLTIPLAS GERAÇÕES...")
    console.log("[MetaComposer-TURBO] 🎯 Gera 3 versões completas e escolhe a melhor")
    console.log("[MetaComposer-TURBO] 🔧 Aplica correção AGGRESSIVA de acentos e sílabas")

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

    const bestVariation = multiGenResult.variations[multiGenResult.bestVariationIndex]
    const bestLyrics = bestVariation.lyrics
    const bestScore = multiGenResult.bestScore

    console.log(`[MetaComposer-TURBO] 🏆 Melhor versão escolhida! Score: ${bestScore}/100`)
    console.log(`[MetaComposer-TURBO] 💪 Pontos fortes:`, bestVariation.strengths)
    
    if (bestVariation.weaknesses.length > 0) {
      console.log(`[MetaComposer-TURBO] ⚠️ Pontos fracos:`, bestVariation.weaknesses)
    }

    // APLICA CORREÇÃO FINAL AGGRESSIVA
    console.log(`[MetaComposer-TURBO] 🔧 Aplicando correção final ULTRA-AGGRESSIVA...`)
    const finalLyrics = await this.applyUltraAggressiveFinalFix(bestLyrics, request)

    return {
      lyrics: finalLyrics,
      title: this.extractTitle(finalLyrics, request),
      metadata: {
        iterations: 3,
        finalScore: bestScore,
        polishingApplied: request.applyFinalPolish ?? true,
        preservedChorusesUsed: request.preservedChoruses ? request.preservedChoruses.length > 0 : false,
        performanceMode: request.performanceMode || "standard",
        accentCorrections: this.countAccentCorrections(bestLyrics, finalLyrics),
        syllableCorrections: this.countSyllableCorrections(bestLyrics, finalLyrics),
      },
    }
  }

  /**
   * CORREÇÃO FINAL ULTRA-AGGRESSIVA
   */
  private static async applyUltraAggressiveFinalFix(lyrics: string, request: CompositionRequest): Promise<string> {
    let correctedLyrics = lyrics
    
    console.log(`[MetaComposer-FINAL] 🔧 Etapa 1: Correção agressiva de acentos...`)
    const accentResult = AggressiveAccentFixer.ultimateFix(correctedLyrics)
    correctedLyrics = accentResult

    console.log(`[MetaComposer-FINAL] 🔧 Etapa 2: Correção de repetições...`)
    const repetitionResult = RepetitionValidator.fix(correctedLyrics)
    if (repetitionResult.corrections > 0) {
      correctedLyrics = repetitionResult.correctedLyrics
    }

    console.log(`[MetaComposer-FINAL] 🔧 Etapa 3: Correção absoluta de sílabas...`)
    const syllableResult = AbsoluteSyllableEnforcer.validateAndFix(correctedLyrics)
    if (!syllableResult.isValid) {
      correctedLyrics = syllableResult.correctedLyrics
    }

    console.log(`[MetaComposer-FINAL] 🔧 Etapa 4: Validação de integridade...`)
    const integrityResult = WordIntegrityValidator.fix(correctedLyrics)
    if (integrityResult.corrections > 0) {
      correctedLyrics = integrityResult.correctedLyrics
    }

    // Aplica formatação de performance se necessário
    if (shouldUsePerformanceFormat(request.genre, request.performanceMode || "standard")) {
      console.log(`[MetaComposer-FINAL] 🎭 Aplicando formatação de performance...`)
      correctedLyrics = formatSertanejoPerformance(correctedLyrics)
    }

    return correctedLyrics
  }

  /**
   * CONTA CORREÇÕES DE ACENTOS APLICADAS
   */
  private static countAccentCorrections(original: string, corrected: string): number {
    if (original === corrected) return 0
    
    const originalWords = original.split(/\s+/).filter(word => word.length > 2)
    const correctedWords = corrected.split(/\s+/).filter(word => word.length > 2)
    
    let corrections = 0
    for (let i = 0; i < Math.min(originalWords.length, correctedWords.length); i++) {
      if (originalWords[i] !== correctedWords[i]) {
        corrections++
      }
    }
    
    return corrections
  }

  /**
   * CONTA CORREÇÕES DE SÍLABAS APLICADAS
   */
  private static countSyllableCorrections(original: string, corrected: string): number {
    const originalLines = original.split('\n').filter(line => 
      line.trim() && !line.startsWith('[') && !line.startsWith('(')
    )
    const correctedLines = corrected.split('\n').filter(line => 
      line.trim() && !line.startsWith('[') && !line.startsWith('(')
    )
    
    let corrections = 0
    for (let i = 0; i < Math.min(originalLines.length, correctedLines.length); i++) {
      const originalSyllables = countPoeticSyllables(originalLines[i])
      const correctedSyllables = countPoeticSyllables(correctedLines[i])
      
      if (originalSyllables !== correctedSyllables) {
        corrections++
      }
    }
    
    return corrections
  }

  /**
   * GERA UMA VERSÃO COMPLETA DA LETRA
   */
  private static async generateSingleVersion(request: CompositionRequest): Promise<string> {
    console.log("[MetaComposer] 📝 Gerando versão única...")

    const syllableEnforcement = request.syllableTarget || this.getGenreSyllableConfig(request.genre)
    syllableEnforcement.max = Math.min(syllableEnforcement.max, this.ABSOLUTE_MAX_SYLLABLES)

    // Gera letra base
    let rawLyrics: string

    if (request.originalLyrics) {
      rawLyrics = await this.generateRewrite(request)
    } else if (request.preservedChoruses && request.preservedChoruses.length > 0) {
      rawLyrics = await this.generateWithPreservedChoruses(request.preservedChoruses, request, syllableEnforcement)
    } else {
      rawLyrics = await this.generateDirectLyrics(request, syllableEnforcement)
    }

    // APLICA CORREÇÃO EM TEMPO REAL DURANTE A GERAÇÃO
    console.log("[MetaComposer] 🔧 Aplicando correções em tempo real...")
    
    // 1. Correção agressiva de acentos
    const accentFixResult = AggressiveAccentFixer.fix(rawLyrics)
    if (accentFixResult.corrections.length > 0) {
      rawLyrics = accentFixResult.correctedText
      console.log(`[MetaComposer] ✅ ${accentFixResult.corrections.length} correções de acento aplicadas`)
    }

    // 2. Correção de repetições
    const repetitionResult = RepetitionValidator.fix(rawLyrics)
    if (repetitionResult.corrections > 0) {
      rawLyrics = repetitionResult.correctedLyrics
      console.log(`[MetaComposer] ✅ ${repetitionResult.corrections} repetições removidas`)
    }

    // 3. Correção automática de sílabas
    const autoCorrectionResult = AutoSyllableCorrector.correctLyrics(rawLyrics)
    rawLyrics = autoCorrectionResult.correctedLyrics

    // 4. Validação absoluta de sílabas
    const absoluteValidation = AbsoluteSyllableEnforcer.validate(rawLyrics)
    if (!absoluteValidation.isValid) {
      console.log("[MetaComposer] 🔧 Aplicando correção absoluta de sílabas...")
      const fixResult = AbsoluteSyllableEnforcer.validateAndFix(rawLyrics)
      rawLyrics = fixResult.correctedLyrics
    }

    // 5. Terceira Via se habilitada
    if (request.useTerceiraVia) {
      const terceiraViaAnalysis = analisarTerceiraVia(rawLyrics, request.genre, request.theme)
      if (terceiraViaAnalysis && terceiraViaAnalysis.score_geral < 75) {
        rawLyrics = await this.applyTerceiraViaCorrections(rawLyrics, request, terceiraViaAnalysis, getGenreConfig(request.genre))
      }
    }

    // 6. Validação de integridade
    const integrityCheck = WordIntegrityValidator.validate(rawLyrics)
    if (!integrityCheck.isValid) {
      console.log("[MetaComposer] 🔧 Aplicando correção de integridade...")
      const fixResult = WordIntegrityValidator.fix(rawLyrics)
      rawLyrics = fixResult.correctedLyrics
    }

    return rawLyrics
  }

  /**
   * GERA LETRA DIRETAMENTE - CONSTRUINDO VERSOS CORRETOS DESDE O INÍCIO
   */
  private static async generateDirectLyrics(
    request: CompositionRequest,
    syllableEnforcement: { min: number; max: number; ideal: number },
  ): Promise<string> {
    console.log("[MetaComposer] Gerando letra construindo versos corretos desde o início...")

    const directPrompt = `Você é um compositor profissional de ${request.genre} que cria MEGA HITS BRASILEIROS.

TEMA: ${request.theme}
MOOD: ${request.mood}
${request.rhythm ? `RITMO: ${request.rhythm}` : ""}

═══════════════════════════════════════════════════════════════
⚠️ REGRAS CRÍTICAS DE QUALIDADE (NÃO NEGOCIÁVEIS)
═══════════════════════════════════════════════════════════════

**1. ACENTUAÇÃO PERFEITA:**
❌ NUNCA escreva: "nã", "seguranç", "heranç", "raç", "laç", "esperanç", "nãoo", "nãganhava"
✅ SEMPRE use: "não", "segurança", "herança", "raça", "laço", "esperança"

**2. PALAVRAS COMPLETAS:**
❌ NUNCA corte palavras: "dedo" (quando deveria ser "dedos"), "fé" (sem artigo)
✅ SEMPRE complete: "dedos", "a fé", "minha fé", "perdi a minha fé"

**3. ESTRUTURA CORRETA:**
❌ NUNCA: "firmeestrada", "n'areia", "láço"
✅ SEMPRE: "firme na estrada", "na areia", "laço"

**4. EXPRESSÕES COMPLETAS:**
❌ NUNCA: "cavalo raça", "perdi fé", "não sei ir"  
✅ SEMPRE: "cavalo de raça", "perdi a fé", "não sei para onde ir"

═══════════════════════════════════════════════════════════════
🎯 TÉCNICAS PARA REDUZIR SÍLABAS (SEM CORTAR PALAVRAS)
═══════════════════════════════════════════════════════════════

**QUANDO FALTA 1 SÍLABA:**
✅ "mas amava" → "mas eu amava"
✅ "Comprei cavalo" → "Comprei um cavalo"
✅ "Coração dispara" → "Meu coração dispara"

**QUANDO SOBRA 1 SÍLABA:**
✅ "por entre os dedos" → "entre os dedos"
✅ "Comprando remédio" → "Compro remédio"
✅ "o meu riacho" → "meu riacho"

**CONTRACÕES PERMITIDAS:**
✅ "pra" (para), "tá" (está), "tô" (estou), "cê" (você)

═══════════════════════════════════════════════════════════════
🎵 ESTRUTURA DE MEGA HIT
═══════════════════════════════════════════════════════════════

**VERSOS (8-11 sílabas):**
- História clara e emocional
- Linguagem coloquial brasileira
- Frases completas e coerentes

**CHORUS (8-9 sílabas):**
- Extremamente repetitivo
- Fácil de cantar junto
- Gruda na cabeça

**PONTE (opcional):**
- Desenvolve a história
- Prepara para o final

═══════════════════════════════════════════════════════════════
⚠️ REGRA DE OURO
═══════════════════════════════════════════════════════════════

Se precisar escolher entre:
- Verso com 10-12 sílabas MAS emocionalmente perfeito
- Verso com 11 sílabas MAS sem emoção ou com palavras cortadas

ESCOLHA O PRIMEIRO! A emoção e integridade vêm primeiro.

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
   * GERA REESCRITA DE LETRA EXISTENTE
   */
  private static async generateRewrite(request: CompositionRequest): Promise<string> {
    console.log("[MetaComposer] Gerando reescrita...")

    if (!request.originalLyrics) {
      throw new Error("Original lyrics required for rewrite")
    }

    const rewritePrompt = `Você é um compositor profissional de ${request.genre}. Reescreva esta letra:

LETRA ORIGINAL:
${request.originalLyrics}

TEMA: ${request.theme}
MOOD: ${request.mood}

═══════════════════════════════════════════════════════════════
⚠️ CORRIJA ESTES ERROS COMUNS:
═══════════════════════════════════════════════════════════════

**ERROS CRÍTICOS A EVITAR:**
❌ "nã", "nãoo", "nãganhava", "nãmora" → ✅ "não", "não ganhava", "não mora"
❌ "seguranç", "heranç", "esperanç" → ✅ "segurança", "herança", "esperança"  
❌ "raç", "laç", "braç" → ✅ "raça", "laço", "braço"
❌ "cavalo raça" → ✅ "cavalo de raça"
❌ "perdi fé" → ✅ "perdi a fé", "perdi minha fé"
❌ "firmeestrada" → ✅ "firme na estrada"
❌ "n'areia" → ✅ "na areia"

**MELHORIAS OBRIGATÓRIAS:**
✅ Palavras COMPLETAS com acentos CORRETOS
✅ Frases coerentes e com sentido completo
✅ Linguagem coloquial natural ("pra", "tá", "cê")
✅ Emoção autêntica e história envolvente

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

    const chorusPrompt = `Você é um compositor profissional de ${request.genre}. Crie uma letra usando EXATAMENTE estes refrões:

${preservedChoruses.join("\n\n")}

TEMA: ${request.theme}
MOOD: ${request.mood}

REGRAS ABSOLUTAS:

1. ACENTUAÇÃO: Palavras COMPLETAS com acentos corretos
2. SÍLABAS: Máximo 11 por verso  
3. GRAMÁTICA: Frases completas em português correto
4. INTEGRIDADE: NUNCA corte palavras ou remova acentos

ERROS CRÍTICOS A EVITAR:
- "nã", "nãoo", "seguranç", "heranç", "raç", "laç"
- "cavalo raça" (use "cavalo de raça")
- "perdi fé" (use "perdi a fé")
- Palavras cortadas ou incompletas

Retorne a letra completa com os refrões preservados:`

    try {
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

  // ... (métodos auxiliares mantidos do código anterior)

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

      if (this.needsTerceiraViaCorrection(line, analysis)) {
        try {
          const context = this.buildLineContext(lines, i, "")
          const correctedLine = await applyTerceiraViaToLine(line, i, context, false, "", request.genre)

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
