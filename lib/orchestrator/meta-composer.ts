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
import { BrazilianGenrePredictor } from "@/lib/prediction/brazilian-genre-predictor"

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
    predictedErrors?: string[]
    preventedErrors?: number
    strictSyllableEnforcement?: boolean
  }
}

export class MetaComposer {
  private static readonly MAX_ITERATIONS = 3
  private static readonly MAX_AUDIT_ATTEMPTS = 5
  private static readonly ABSOLUTE_MAX_SYLLABLES = 11 // REGRA ABSOLUTA - NÃO NEGOCIÁVEL
  private static readonly MIN_QUALITY_SCORE = 0.75

  /**
   * COMPOSIÇÃO COM REGRAS RÍGIDAS E TERCEIRA VIA AUTOMÁTICA
   */
  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer] 🚀 Iniciando composição com REGRAS RÍGIDAS...")
    console.log("[MetaComposer] 📏 MÁXIMO 11 SÍLABAS - REGRA ABSOLUTA")
    console.log("[MetaComposer] 🔮 TERCEIRA VIA AUTOMÁTICA - SEMPRE ATIVA")

    // FORÇA TERCEIRA VIA AUTOMATICAMENTE - SEM BOTÃO NECESSÁRIO
    const enhancedRequest = {
      ...request,
      useTerceiraVia: false // SEMPRE ATIVA - CORREÇÃO SEMÂNTICA AUTOMÁTICA
    }

    // PREDIÇÃO DE ERROS COMUNS PARA O GÊNERO
    const predictedErrors = BrazilianGenrePredictor.predictCommonErrors(enhancedRequest.genre, enhancedRequest.theme)
    console.log(`[MetaComposer-PREDICTION] 🔮 Erros previstos:`, predictedErrors)

    const multiGenResult = await MultiGenerationEngine.generateMultipleVariations(
      async () => {
        return await this.generateSingleVersion(enhancedRequest, predictedErrors)
      },
      (lyrics) => {
        const auditResult = LyricsAuditor.audit(lyrics, enhancedRequest.genre, enhancedRequest.theme)
        return auditResult.score
      },
      3,
    )

    const bestVariation = multiGenResult.variations[multiGenResult.bestVariationIndex]
    const bestLyrics = bestVariation.lyrics
    const bestScore = multiGenResult.bestScore

    console.log(`[MetaComposer] 🏆 Melhor versão escolhida! Score: ${bestScore}/100`)
    
    // APLICA CORREÇÃO FINAL COM REGRAS RÍGIDAS
    console.log(`[MetaComposer] 🔧 Aplicando correção final com VALIDAÇÃO RÍGIDA...`)
    const finalLyrics = await this.applyStrictFinalCorrection(bestLyrics, enhancedRequest, predictedErrors)

    return {
      lyrics: finalLyrics,
      title: this.extractTitle(finalLyrics, enhancedRequest),
      metadata: {
        iterations: 3,
        finalScore: bestScore,
        polishingApplied: enhancedRequest.applyFinalPolish ?? true,
        preservedChorusesUsed: enhancedRequest.preservedChoruses ? enhancedRequest.preservedChoruses.length > 0 : false,
        performanceMode: enhancedRequest.performanceMode || "standard",
        accentCorrections: this.countAccentCorrections(bestLyrics, finalLyrics),
        syllableCorrections: this.countSyllableCorrections(bestLyrics, finalLyrics),
        predictedErrors: predictedErrors,
        preventedErrors: this.countPreventedErrors(predictedErrors, finalLyrics),
        strictSyllableEnforcement: true, // CONFIRMA REGRA RÍGIDA APLICADA
      },
    }
  }

  /**
   * CORREÇÃO FINAL COM REGRAS RÍGIDAS - RESPEITA ABSOLUTAMENTE 11 SÍLABAS
   */
  private static async applyStrictFinalCorrection(
    lyrics: string, 
    request: CompositionRequest,
    predictedErrors: string[]
  ): Promise<string> {
    let correctedLyrics = lyrics
    
    console.log(`[MetaComposer-STRICT] 🔧 Aplicando validação rígida de sílabas...`)
    
    // 1. VALIDAÇÃO RÍGIDA DE SÍLABAS - ABSOLUTA
    correctedLyrics = this.applyAbsoluteSyllableEnforcement(correctedLyrics)
    
    // 2. CORREÇÃO PREDITIVA DE ACENTOS
    if (predictedErrors.some(error => error.includes('acento') || error.includes('palavra cortada'))) {
      console.log(`[MetaComposer-STRICT] 🔧 Aplicando correção preditiva de acentos...`)
      correctedLyrics = AggressiveAccentFixer.ultimateFix(correctedLyrics)
    }

    // 3. CORREÇÃO PREDITIVA DE REPETIÇÕES
    if (predictedErrors.some(error => error.includes('repetição') || error.includes('redundante'))) {
      console.log(`[MetaComposer-STRICT] 🔧 Aplicando correção preditiva de repetições...`)
      const repetitionResult = RepetitionValidator.fix(correctedLyrics)
      if (repetitionResult.corrections > 0) {
        correctedLyrics = repetitionResult.correctedLyrics
      }
    }

    // 4. CORREÇÃO PREDITIVA DE INTEGRIDADE
    if (predictedErrors.some(error => error.includes('integridade') || error.includes('palavra incompleta'))) {
      console.log(`[MetaComposer-STRICT] 🔧 Aplicando correção preditiva de integridade...`)
      const integrityResult = WordIntegrityValidator.fix(correctedLyrics)
      if (integrityResult.corrections > 0) {
        correctedLyrics = integrityResult.correctedLyrics
      }
    }

    // 5. FORMATAÇÃO DE PERFORMANCE
    if (shouldUsePerformanceFormat(request.genre, request.performanceMode || "standard")) {
      console.log(`[MetaComposer-STRICT] 🎭 Aplicando formatação de performance...`)
      correctedLyrics = formatSertanejoPerformance(correctedLyrics)
    }

    // VALIDAÇÃO FINAL ABSOLUTA
    const finalValidation = AbsoluteSyllableEnforcer.validate(correctedLyrics)
    if (!finalValidation.isValid) {
      console.warn(`[MetaComposer-STRICT] 🚨 VALIDAÇÃO FINAL FALHOU - APLICANDO CORREÇÃO DE EMERGÊNCIA`)
      correctedLyrics = this.applyEmergencySyllableCorrection(correctedLyrics)
    }

    console.log(`[MetaComposer-STRICT] ✅ Validação rígida concluída - MÁXIMO 11 SÍLABAS GARANTIDO`)
    return correctedLyrics
  }

  /**
   * VALIDAÇÃO ABSOLUTA DE SÍLABAS - NÃO PERMITE EXCESSOS
   */
  private static applyAbsoluteSyllableEnforcement(lyrics: string): string {
    const lines = lyrics.split('\n')
    const correctedLines: string[] = []
    let violationsFixed = 0

    for (const line of lines) {
      if (!line.trim() || line.startsWith('[') || line.startsWith('(') || line.includes('Instruments:')) {
        correctedLines.push(line)
        continue
      }

      const syllables = countPoeticSyllables(line)
      
      if (syllables > this.ABSOLUTE_MAX_SYLLABLES) {
        console.warn(`[MetaComposer-STRICT] 🚨 VERSO COM ${syllables} SÍLABAS: "${line}"`)
        violationsFixed++
        
        // CORREÇÃO AGRESSIVA - NÃO PERMITE EXCESSOS
        const correctedLine = this.aggressivelyFixLongVerse(line)
        correctedLines.push(correctedLine)
      } else {
        correctedLines.push(line)
      }
    }

    if (violationsFixed > 0) {
      console.log(`[MetaComposer-STRICT] 🔧 ${violationsFixed} violações de sílabas corrigidas`)
    }

    return correctedLines.join('\n')
  }

  /**
   * CORREÇÃO AGRESSIVA PARA VERSOS LONGOS - RESPEITA LIMITE ABSOLUTO
   */
  private static aggressivelyFixLongVerse(line: string): string {
    const currentSyllables = countPoeticSyllables(line)
    
    // TÉCNICAS DE REDUÇÃO SEM CORTAR PALAVRAS
    let corrected = line
    
    // 1. Remove artigos desnecessários
    corrected = corrected.replace(/\b(o|a|os|as|um|uma)\s+/gi, ' ')
    
    // 2. Aplica contrações naturais
    corrected = corrected.replace(/\bpara\b/gi, 'pra')
    corrected = corrected.replace(/\bestá\b/gi, 'tá')
    corrected = corrected.replace(/\bestou\b/gi, 'tô')
    corrected = corrected.replace(/\bvocê\b/gi, 'cê')
    
    // 3. Remove preposições quando possível
    corrected = corrected.replace(/\bde\s+/gi, ' ')
    corrected = corrected.replace(/\bem\s+/gi, ' ')
    corrected = corrected.replace(/\bpor\s+/gi, ' ')
    
    // 4. Simplifica expressões
    corrected = corrected.replace(/\bque eu\b/gi, 'que')
    corrected = corrected.replace(/\bdo que\b/gi, 'que')
    corrected = corrected.replace(/\bmais do que\b/gi, 'mais que')
    
    const newSyllables = countPoeticSyllables(corrected)
    
    // Se ainda estiver longo após correções, divide o verso
    if (newSyllables > this.ABSOLUTE_MAX_SYLLABLES) {
      const words = corrected.split(' ').filter(w => w.trim())
      if (words.length > 4) {
        const midPoint = Math.floor(words.length / 2)
        const firstHalf = words.slice(0, midPoint).join(' ')
        const secondHalf = words.slice(midPoint).join(' ')
        return `${firstHalf}\n${secondHalf}`
      }
    }
    
    return corrected
  }

  /**
   * CORREÇÃO DE EMERGÊNCIA - GARANTE CUMPRIMENTO DA REGRA
   */
  private static applyEmergencySyllableCorrection(lyrics: string): string {
    console.log(`[MetaComposer-EMERGENCY] 🚨 APLICANDO CORREÇÃO DE EMERGÊNCIA`)
    
    const lines = lyrics.split('\n')
    const emergencyLines: string[] = []
    
    for (const line of lines) {
      if (!line.trim() || line.startsWith('[') || line.startsWith('(')) {
        emergencyLines.push(line)
        continue
      }
      
      let currentLine = line
      let attempts = 0
      
      // Tenta reduzir até caber no limite
      while (countPoeticSyllables(currentLine) > this.ABSOLUTE_MAX_SYLLABLES && attempts < 5) {
        currentLine = this.aggressivelyFixLongVerse(currentLine)
        attempts++
      }
      
      // Se ainda não couber, trunca (último recurso)
      if (countPoeticSyllables(currentLine) > this.ABSOLUTE_MAX_SYLLABLES) {
        const words = currentLine.split(' ').filter(w => w.trim())
        let truncated = ''
        let truncatedSyllables = 0
        
        for (const word of words) {
          const wordSyllables = countPoeticSyllables(word)
          if (truncatedSyllables + wordSyllables <= this.ABSOLUTE_MAX_SYLLABLES) {
            truncated += (truncated ? ' ' : '') + word
            truncatedSyllables += wordSyllables
          } else {
            break
          }
        }
        
        currentLine = truncated || words.slice(0, 3).join(' ')
        console.warn(`[MetaComposer-EMERGENCY] ⚠️ Verso truncado: "${line}" → "${currentLine}"`)
      }
      
      emergencyLines.push(currentLine)
    }
    
    return emergencyLines.join('\n')
  }

  /**
   * GERA UMA VERSÃO COMPLETA DA LETRA COM REGRAS RÍGIDAS
   */
  private static async generateSingleVersion(
    request: CompositionRequest, 
    predictedErrors: string[] = []
  ): Promise<string> {
    console.log("[MetaComposer] 📝 Gerando versão única com REGRAS RÍGIDAS...")

    const syllableEnforcement = request.syllableTarget || this.getGenreSyllableConfig(request.genre)
    syllableEnforcement.max = Math.min(syllableEnforcement.max, this.ABSOLUTE_MAX_SYLLABLES)

    // GERA LETRA BASE COM REGRAS RÍGIDAS
    let rawLyrics: string

    if (request.originalLyrics) {
      rawLyrics = await this.generateRewrite(request, predictedErrors)
    } else if (request.preservedChoruses && request.preservedChoruses.length > 0) {
      rawLyrics = await this.generateWithPreservedChoruses(
        request.preservedChoruses, 
        request, 
        syllableEnforcement,
        predictedErrors
      )
    } else {
      rawLyrics = await this.generateDirectLyrics(request, syllableEnforcement, predictedErrors)
    }

    // APLICA CORREÇÃO INSTANTÂNEA COM REGRAS RÍGIDAS
    console.log("[MetaComposer] 🔧 Aplicando correção instantânea rígida...")
    rawLyrics = this.applyInstantStrictCorrection(rawLyrics, request.genre, predictedErrors)

    // PIPELINE DE CORREÇÃO EM TEMPO REAL
    console.log("[MetaComposer] 🔧 Executando pipeline de correção rígida...")
    
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

    // 3. VALIDAÇÃO RÍGIDA DE SÍLABAS
    rawLyrics = this.applyAbsoluteSyllableEnforcement(rawLyrics)

    // 4. TERCEIRA VIA SEMPRE ATIVA - CORREÇÃO SEMÂNTICA
    console.log("[MetaComposer] 🔮 Aplicando Terceira Via (automática)...")
    const terceiraViaAnalysis = analisarTerceiraVia(rawLyrics, request.genre, request.theme)
    if (terceiraViaAnalysis && terceiraViaAnalysis.score_geral < 85) {
      rawLyrics = await this.applyTerceiraViaCorrections(
        rawLyrics, 
        request, 
        terceiraViaAnalysis, 
        getGenreConfig(request.genre)
      )
      
      // RE-VALIDA SÍLABAS APÓS TERCEIRA VIA
      rawLyrics = this.applyAbsoluteSyllableEnforcement(rawLyrics)
    }

    // 5. Validação de integridade final
    const integrityCheck = WordIntegrityValidator.validate(rawLyrics)
    if (!integrityCheck.isValid) {
      console.log("[MetaComposer] 🔧 Aplicando correção final de integridade...")
      const fixResult = WordIntegrityValidator.fix(rawLyrics)
      rawLyrics = fixResult.correctedLyrics
      
      // RE-VALIDA SÍLABAS APÓS CORREÇÃO DE INTEGRIDADE
      rawLyrics = this.applyAbsoluteSyllableEnforcement(rawLyrics)
    }

    return rawLyrics
  }

  /**
   * CORREÇÃO INSTANTÂNEA COM REGRAS RÍGIDAS
   */
  private static applyInstantStrictCorrection(
    lyrics: string, 
    genre: string,
    predictedErrors: string[]
  ): string {
    console.log("[MetaComposer] 🔧 Aplicando correção instantânea rígida...")
    
    let corrected = lyrics
    
    // CORREÇÕES CRÍTICAS - ERROS ABSOLUTOS
    const strictFixes = [
      // ERROS CRÍTICOS - PALAVRAS COLAVAS
      { regex: /Nãtinha/gi, correction: 'Não tinha', description: 'Palavras coladas com nã' },
      { regex: /nãposso/gi, correction: 'não posso', description: 'Palavras coladas com nã' },
      { regex: /nãmora/gi, correction: 'não mora', description: 'Palavras coladas com nã' },
      { regex: /nãganhava/gi, correction: 'não ganhava', description: 'Palavras coladas com nã' },
      
      // ERROS DE ACENTUAÇÃO CRÍTICOS
      { regex: /láço/gi, correction: 'laço', description: 'Acento incorreto' },
      { regex: /nãoo/gi, correction: 'não', description: 'Acento duplicado' },
      
      // ERROS DE PREPOSIÇÃO CRÍTICOS
      { regex: /cavalo raça/gi, correction: 'cavalo de raça', description: 'Preposição faltando' },
      { regex: /perdi fé/gi, correction: 'perdi a fé', description: 'Artigo faltando' },
      { regex: /firmeestrada/gi, correction: 'firme na estrada', description: 'Preposição faltando' },
      { regex: /n'areia/gi, correction: 'na areia', description: 'Contração incorreta' },
    ]

    strictFixes.forEach(({ regex, correction, description }) => {
      const matches = corrected.match(regex)
      if (matches) {
        corrected = corrected.replace(regex, correction)
        console.log(`[MetaComposer-STRICT] 🔧 ${description}: "${matches[0]}" → "${correction}"`)
      }
    })
    
    return corrected
  }

  /**
   * GERA LETRA DIRETA COM REGRAS RÍGIDAS EXPLÍCITAS
   */
  private static async generateDirectLyrics(
    request: CompositionRequest,
    syllableEnforcement: { min: number; max: number; ideal: number },
    predictedErrors: string[] = []
  ): Promise<string> {
    console.log("[MetaComposer] Gerando letra com REGRAS RÍGIDAS...")

    const directPrompt = `Você é um compositor profissional de ${request.genre}. 
Crie uma letra AUTÊNTICA seguindo estas REGRAS ABSOLUTAS:

TEMA: ${request.theme}
MOOD: ${request.mood}
${request.rhythm ? `RITMO: ${request.rhythm}` : ""}

═══════════════════════════════════════════════════════════════
🚨 REGRAS ABSOLUTAS - NÃO NEGOCIÁVEIS
═══════════════════════════════════════════════════════════════

**1. LIMITE DE SÍLABAS - MÁXIMO 11 POR VERSO:**
❌ NUNCA escreva versos com 12 ou mais sílabas
✅ SEMPRE verifique: cada verso deve ter MÁXIMO 11 sílabas poéticas

**2. PALAVRAS COMPLETAS E ACENTUADAS:**
❌ NUNCA: "nã", "seguranç", "heranç", "raç", "laç", "nãoo"
✅ SEMPRE: "não", "segurança", "herança", "raça", "laço"

**3. EXPRESSÕES COMPLETAS:**
❌ NUNCA: "cavalo raça", "perdi fé", "firmeestrada"
✅ SEMPRE: "cavalo de raça", "perdi a fé", "firme na estrada"

═══════════════════════════════════════════════════════════════
🎯 TÉCNICAS PARA RESPEITAR 11 SÍLABAS (SEM CORTAR PALAVRAS)
═══════════════════════════════════════════════════════════════

**QUANDO PRECISAR REDUZIR:**
✅ Remova artigos: "o", "a", "um", "uma" (quando possível)
✅ Use contrações: "pra", "tá", "tô", "cê"
✅ Simplifique: "que eu tenho" → "que tenho"
✅ Remova preposições: "de", "em", "por" (quando possível)

**EXEMPLOS DE CORREÇÃO:**
✅ "por entre os dedos" (6 sílabas) → "entre os dedos" (4 sílabas)
✅ "Comprando remédios" (6 sílabas) → "Compro remédio" (5 sílabas)  
✅ "o meu coração" (5 sílabas) → "meu coração" (4 sílabas)

═══════════════════════════════════════════════════════════════
🎵 ESTRUTURA SUGERIDA - ${request.genre.toUpperCase()}
═══════════════════════════════════════════════════════════════

${this.getGenreStructureGuide(request.genre)}

═══════════════════════════════════════════════════════════════
⚠️ VALIDAÇÃO OBRIGATÓRIA
═══════════════════════════════════════════════════════════════

ANTES DE FINALIZAR, VERIFIQUE:
✓ Cada verso tem MÁXIMO 11 sílabas
✓ Nenhuma palavra está cortada ou sem acento  
✓ Todas as expressões estão completas
✓ A emoção e coerência estão preservadas

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
   * GERA REESCRITA COM REGRAS RÍGIDAS
   */
  private static async generateRewrite(
    request: CompositionRequest, 
    predictedErrors: string[] = []
  ): Promise<string> {
    console.log("[MetaComposer] Gerando reescrita com REGRAS RÍGIDAS...")

    if (!request.originalLyrics) {
      throw new Error("Original lyrics required for rewrite")
    }

    const rewritePrompt = `Você é um compositor profissional de ${request.genre}. 
Reescreva esta letra aplicando REGRAS RÍGIDAS:

LETRA ORIGINAL:
${request.originalLyrics}

TEMA: ${request.theme}
MOOD: ${request.mood}

═══════════════════════════════════════════════════════════════
🚨 CORREÇÕES OBRIGATÓRIAS - REGRAS ABSOLUTAS
═══════════════════════════════════════════════════════════════

**1. LIMITE DE SÍLABAS:**
✅ GARANTIR que CADA verso tenha MÁXIMO 11 sílabas
❌ NUNCA permitir versos com 12+ sílabas

**2. CORRIGIR ERROS CRÍTICOS:**
❌ "nã", "nãoo", "nãganhava" → ✅ "não", "não ganhava"
❌ "seguranç", "heranç" → ✅ "segurança", "herança"  
❌ "raç", "laç" → ✅ "raça", "laço"
❌ "cavalo raça" → ✅ "cavalo de raça"
❌ "perdi fé" → ✅ "perdi a fé"
❌ "firmeestrada" → ✅ "firme na estrada"

**3. TÉCNICAS DE REDUÇÃO (SEM CORTAR PALAVRAS):**
✅ Remover artigos desnecessários
✅ Usar contrações naturais ("pra", "tá", "cê")
✅ Simplificar estruturas frasais
✅ Manover integridade das palavras

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
   * GERA LETRA COM REFRÕES PRESERVADOS E REGRAS RÍGIDAS
   */
  private static async generateWithPreservedChoruses(
    preservedChoruses: string[],
    request: CompositionRequest,
    syllableEnforcement: { min: number; max: number; ideal: number },
    predictedErrors: string[] = []
  ): Promise<string> {
    console.log("[MetaComposer] Gerando letra com refrões preservados e REGRAS RÍGIDAS...")

    const chorusPrompt = `Você é um compositor profissional de ${request.genre}. 
Crie uma letra usando EXATAMENTE estes refrões e seguindo REGRAS RÍGIDAS:

REFRÃOS PRESERVADOS:
${preservedChoruses.join("\n\n")}

TEMA: ${request.theme}
MOOD: ${request.mood}

🚨 REGRAS ABSOLUTAS:

1. SÍLABAS: MÁXIMO 11 por verso (VERIFIQUE CADA VERSO)
2. ACENTUAÇÃO: Palavras COMPLETAS com acentos corretos
3. INTEGRIDADE: NUNCA corte palavras ou remova acentos
4. EXPRESSÕES: Todas as frases devem estar completas

ERROS CRÍTICOS PROIBIDOS:
- "nã", "nãoo", "seguranç", "heranç", "raç", "laç"
- "cavalo raça" (use "cavalo de raça")
- "perdi fé" (use "perdi a fé")
- Qualquer verso com 12+ sílabas

TÉCNICAS PERMITIDAS PARA REDUZIR SÍLABAS:
- Remover artigos: "o", "a", "um", "uma"
- Usar contrações: "pra", "tá", "tô", "cê" 
- Simplificar frases sem perder significado

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

  // ... (métodos auxiliares mantidos do código anterior - getGenreStructureGuide, countAccentCorrections, countSyllableCorrections, etc.)

  private static getGenreStructureGuide(genre: string): string {
    const structureGuides: Record<string, string> = {
      "sertanejo-moderno": `**VERSOS (8-11 sílabas - MÁXIMO 11):**
- História de amor/cotidiano sertanejo
- Linguagem coloquial: "cê", "tô", "pra", "tá"
- Referências: estrada, paixão, saudade, boteco

**CHORUS (8-9 sílabas):**
- Repetitivo e grudento
- Fácil memorização
- Emoção intensa DENTRO do limite de sílabas`,

      "sertanejo-universitario": `**VERSOS (7-10 sílabas - MÁXIMO 11):**
- Festa, amor universitário, amizade
- Gírias: "festão", "zoeira", "rolê"
- Sempre respeitando MÁXIMO 11 sílabas`,

      "piseiro": `**VERSOS (6-9 sílabas - MÁXIMO 11):**
- Ritmo acelerado e dançante
- Letras simples e diretas
- Fácil de cantar DENTRO dos limites`,

      "forro": `**VERSOS (8-11 sílabas - MÁXIMO 11):**
- Amor, nordeste, saudade
- Linguagem regional natural
- Respeitando estrutura tradicional`,

      "funk": `**VERSOS (6-9 sílabas - MÁXIMO 11):**
- Batida forte e letras diretas
- Gírias cariocas autênticas
- Dentro do limite técnico`,

      "trap": `**VERSOS (7-10 sílabas - MÁXIMO 11):**
- Flow quebrado e rimas complexas
- Temáticas realistas
- Respeitando métrica brasileira`
    }

    return structureGuides[genre] || structureGuides["sertanejo-moderno"]
  }

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

  private static countPreventedErrors(predictedErrors: string[], finalLyrics: string): number {
    let prevented = 0
    
    predictedErrors.forEach(error => {
      if (error.includes('nã') && !finalLyrics.toLowerCase().includes('nã')) {
        prevented++
      }
      if (error.includes('acento') && !this.hasAccentErrors(finalLyrics)) {
        prevented++
      }
      if (error.includes('sílaba') && this.hasPerfectSyllableDistribution(finalLyrics)) {
        prevented++
      }
    })
    
    return prevented
  }

  private static hasAccentErrors(lyrics: string): boolean {
    const commonErrors = [/nã[^o]/gi, /seguranç/gi, /heranç/gi, /raç[^a]/gi, /laç[^o]/gi]
    return commonErrors.some(regex => regex.test(lyrics))
  }

  private static hasPerfectSyllableDistribution(lyrics: string): boolean {
    const lines = lyrics.split('\n').filter(line => 
      line.trim() && !line.startsWith('[') && !line.startsWith('(')
    )
    
    const validLines = lines.filter(line => {
      const syllables = countPoeticSyllables(line)
      return syllables <= this.ABSOLUTE_MAX_SYLLABLES // MÁXIMO 11
    })
    
    return validLines.length === lines.length // TODOS os versos devem estar dentro do limite
  }

  private static getGenreSyllableConfig(genre: string): { min: number; max: number; ideal: number } {
    const genreConfig = getGenreConfig(genre)
    const syllableRules = genreConfig.prosody_rules?.syllable_count

    if (syllableRules && "absolute_max" in syllableRules) {
      return {
        min: 7,
        max: Math.min(syllableRules.absolute_max, this.ABSOLUTE_MAX_SYLLABLES), // FORÇA MÁXIMO 11
        ideal: 10,
      }
    } else if (syllableRules && "without_comma" in syllableRules) {
      return {
        min: syllableRules.without_comma.min,
        max: Math.min(syllableRules.without_comma.acceptable_up_to, this.ABSOLUTE_MAX_SYLLABLES), // FORÇA MÁXIMO 11
        ideal: Math.floor((syllableRules.without_comma.min + syllableRules.without_comma.max) / 2),
      }
    }

    return {
      min: 7,
      max: this.ABSOLUTE_MAX_SYLABLES, // SEMPRE 11
      ideal: 10,
    }
  }

  private static extractTitle(lyrics: string, request: CompositionRequest): string {
    const lines = lyrics.split('\n')

    for (const line of lines) {
      if (line.toLowerCase().includes('título:') || line.toLowerCase().includes('title:')) {
        return line.split(':')[1]?.trim() || 'Sem Título'
      }
    }

    for (const line of lines) {
      const cleaned = line.trim()
      if (cleaned && !cleaned.startsWith('[') && !cleaned.startsWith('(') && cleaned.length > 3) {
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
    const lines = lyrics.split('\n')
    const correctedLines: string[] = []
    let correctionsApplied = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (this.needsTerceiraViaCorrection(line, analysis)) {
        try {
          const context = this.buildLineContext(lines, i, '')
          const correctedLine = await applyTerceiraViaToLine(line, i, context, false, '', request.genre)

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
    return correctedLines.join('\n')
  }

  private static needsTerceiraViaCorrection(line: string, analysis: TerceiraViaAnalysis): boolean {
    if (!line.trim() || line.startsWith('[') || line.startsWith('(') || line.includes('Instruments:')) {
      return false
    }

    if (analysis.score_geral < 85) { // LIMITE MAIS RÍGIDO
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

    return contextLines.join('\n')
  }
}
