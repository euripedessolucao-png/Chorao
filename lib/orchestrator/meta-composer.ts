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
  }
}

export class MetaComposer {
  private static readonly MAX_ITERATIONS = 3
  private static readonly MAX_AUDIT_ATTEMPTS = 5
  private static readonly ABSOLUTE_MAX_SYLLABLES = 11
  private static readonly MIN_QUALITY_SCORE = 0.75

  /**
   * COMPOSIÇÃO TURBO COM SISTEMA DE MÚLTIPLAS GERAÇÕES E PREDIÇÃO DE ERROS
   */
  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer-TURBO] 🚀 Iniciando composição com PREDIÇÃO DE ERROS...")
    console.log("[MetaComposer-TURBO] 🎯 Gera 3 versões completas e escolhe a melhor")
    console.log("[MetaComposer-TURBO] 🔮 Prevê e corrige erros ANTES de acontecer")

    // PREDIÇÃO DE ERROS COMUNS PARA O GÊNERO
    const predictedErrors = BrazilianGenrePredictor.predictCommonErrors(request.genre, request.theme)
    console.log(`[MetaComposer-PREDICTION] 🔮 Erros previstos:`, predictedErrors)

    const multiGenResult = await MultiGenerationEngine.generateMultipleVariations(
      async () => {
        return await this.generateSingleVersion(request, predictedErrors)
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
    
    // APLICA CORREÇÃO FINAL COM PREDIÇÃO
    console.log(`[MetaComposer-TURBO] 🔧 Aplicando correção final PREDITIVA...`)
    const finalLyrics = await this.applyPredictiveFinalFix(bestLyrics, request, predictedErrors)

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
        predictedErrors: predictedErrors,
        preventedErrors: this.countPreventedErrors(predictedErrors, finalLyrics),
      },
    }
  }

  /**
   * CORREÇÃO FINAL PREDITIVA - PREVINE ERROS ANTES DE ACONTECER
   */
  private static async applyPredictiveFinalFix(
    lyrics: string, 
    request: CompositionRequest,
    predictedErrors: string[]
  ): Promise<string> {
    let correctedLyrics = lyrics
    
    console.log(`[MetaComposer-PREDICTIVE] 🔧 Aplicando correção baseada em predição...`)
    
    // 1. CORREÇÃO PREDITIVA DE ACENTOS
    if (predictedErrors.some(error => error.includes('acento') || error.includes('palavra cortada'))) {
      console.log(`[MetaComposer-PREDICTIVE] 🔧 Aplicando correção preditiva de acentos...`)
      correctedLyrics = AggressiveAccentFixer.ultimateFix(correctedLyrics)
    }

    // 2. CORREÇÃO PREDITIVA DE SÍLABAS
    if (predictedErrors.some(error => error.includes('sílaba') || error.includes('métrica'))) {
      console.log(`[MetaComposer-PREDICTIVE] 🔧 Aplicando correção preditiva de sílabas...`)
      const syllableResult = AbsoluteSyllableEnforcer.validateAndFix(correctedLyrics)
      if (!syllableResult.isValid) {
        correctedLyrics = syllableResult.correctedLyrics
      }
    }

    // 3. CORREÇÃO PREDITIVA DE REPETIÇÕES
    if (predictedErrors.some(error => error.includes('repetição') || error.includes('redundante'))) {
      console.log(`[MetaComposer-PREDICTIVE] 🔧 Aplicando correção preditiva de repetições...`)
      const repetitionResult = RepetitionValidator.fix(correctedLyrics)
      if (repetitionResult.corrections > 0) {
        correctedLyrics = repetitionResult.correctedLyrics
      }
    }

    // 4. CORREÇÃO PREDITIVA DE INTEGRIDADE
    if (predictedErrors.some(error => error.includes('integridade') || error.includes('palavra incompleta'))) {
      console.log(`[MetaComposer-PREDICTIVE] 🔧 Aplicando correção preditiva de integridade...`)
      const integrityResult = WordIntegrityValidator.fix(correctedLyrics)
      if (integrityResult.corrections > 0) {
        correctedLyrics = integrityResult.correctedLyrics
      }
    }

    // 5. FORMATAÇÃO DE PERFORMANCE PREDITIVA
    if (shouldUsePerformanceFormat(request.genre, request.performanceMode || "standard")) {
      console.log(`[MetaComposer-PREDICTIVE] 🎭 Aplicando formatação preditiva de performance...`)
      correctedLyrics = formatSertanejoPerformance(correctedLyrics)
    }

    return correctedLyrics
  }

  /**
   * GERA UMA VERSÃO COMPLETA DA LETRA COM PREVENÇÃO DE ERROS
   */
  private static async generateSingleVersion(
    request: CompositionRequest, 
    predictedErrors: string[] = []
  ): Promise<string> {
    console.log("[MetaComposer] 📝 Gerando versão única com prevenção de erros...")

    const syllableEnforcement = request.syllableTarget || this.getGenreSyllableConfig(request.genre)
    syllableEnforcement.max = Math.min(syllableEnforcement.max, this.ABSOLUTE_MAX_SYLLABLES)

    // GERA LETRA BASE COM PREVENÇÃO DE ERROS
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

    // APLICA CORREÇÃO INSTANTÂNEA BASEADA EM PREDIÇÃO
    console.log("[MetaComposer] 🔧 Aplicando correção instantânea preditiva...")
    rawLyrics = this.applyInstantPredictiveCorrection(rawLyrics, request.genre, predictedErrors)

    // PIPELINE DE CORREÇÃO EM TEMPO REAL
    console.log("[MetaComposer] 🔧 Executando pipeline de correção preditiva...")
    
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
        rawLyrics = await this.applyTerceiraViaCorrections(
          rawLyrics, 
          request, 
          terceiraViaAnalysis, 
          getGenreConfig(request.genre)
        )
      }
    }

    // 6. Validação de integridade final
    const integrityCheck = WordIntegrityValidator.validate(rawLyrics)
    if (!integrityCheck.isValid) {
      console.log("[MetaComposer] 🔧 Aplicando correção final de integridade...")
      const fixResult = WordIntegrityValidator.fix(rawLyrics)
      rawLyrics = fixResult.correctedLyrics
    }

    return rawLyrics
  }

  /**
   * CORREÇÃO INSTANTÂNEA PREDITIVA - RESOLVE ERROS COMUNS ANTES DO PROCESSAMENTO
   */
  private static applyInstantPredictiveCorrection(
    lyrics: string, 
    genre: string,
    predictedErrors: string[]
  ): string {
    console.log("[MetaComposer] 🔮 Aplicando correção instantânea preditiva...")
    
    let corrected = lyrics
    
    // MAPA DE CORREÇÕES PREDITIVAS POR GÊNERO
    const predictiveFixes = this.getPredictiveFixesForGenre(genre, predictedErrors)
    
    predictiveFixes.forEach(({ regex, correction, description }) => {
      const matches = corrected.match(regex)
      if (matches) {
        corrected = corrected.replace(regex, correction)
        console.log(`[MetaComposer-PREDICTIVE] 🔧 ${description}: "${matches[0]}" → "${correction}"`)
      }
    })
    
    return corrected
  }

  /**
   * OBTÉM CORREÇÕES PREDITIVAS ESPECÍFICAS PARA O GÊNERO
   */
  private static getPredictiveFixesForGenre(genre: string, predictedErrors: string[]): Array<{
    regex: RegExp
    correction: string
    description: string
  }> {
    const baseFixes = [
      // ERROS CRÍTICOS GERAIS - PALAVRAS COLAVAS COM "NÃ"
      { regex: /Nãtinha/gi, correction: 'Não tinha', description: 'Palavras coladas com nã' },
      { regex: /nãposso/gi, correction: 'não posso', description: 'Palavras coladas com nã' },
      { regex: /nãmora/gi, correction: 'não mora', description: 'Palavras coladas com nã' },
      { regex: /nãganhava/gi, correction: 'não ganhava', description: 'Palavras coladas com nã' },
      
      // ERROS DE ACENTUAÇÃO COMUNS
      { regex: /láço/gi, correction: 'laço', description: 'Acento incorreto' },
      { regex: /nãoo/gi, correction: 'não', description: 'Acento duplicado' },
      
      // ERROS DE PREPOSIÇÃO (COMUNS EM SERTANEJO)
      { regex: /cavalo raça/gi, correction: 'cavalo de raça', description: 'Preposição faltando' },
      { regex: /perdi fé/gi, correction: 'perdi a fé', description: 'Artigo faltando' },
      { regex: /firmeestrada/gi, correction: 'firme na estrada', description: 'Preposição faltando' },
      { regex: /n'areia/gi, correction: 'na areia', description: 'Contração incorreta' },
      
      // ERROS DE ARTIGO/PREPOSIÇÃO
      { regex: /Escolhi dinheiro/gi, correction: 'Escolhi o dinheiro', description: 'Artigo faltando' },
      { regex: /Eu quebro cabresto/gi, correction: 'Eu quebro o cabresto', description: 'Artigo faltando' },
      { regex: /Deixei riacho/gi, correction: 'Deixei o riacho', description: 'Artigo faltando' },
      
      // ERROS DE PLURAL/GERÚNDIO
      { regex: /Comprando remédios/gi, correction: 'Compro remédio', description: 'Gerúndio/plural inconsistente' },
    ]

    // CORREÇÕES ESPECÍFICAS POR GÊNERO
    const genreSpecificFixes: Record<string, Array<any>> = {
      "sertanejo-moderno": [
        { regex: /boteco/gi, correction: 'boteco', description: 'Termo sertanejo' },
        { regex: /cerveja/gi, correction: 'breja', description: 'Gíria sertaneja' },
        { regex: /caminhão/gi, correction: 'caminhão', description: 'Elemento sertanejo' },
      ],
      "sertanejo-universitario": [
        { regex: /festa/gi, correction: 'festão', description: 'Ampliação universitária' },
        { regex: /cerveja/gi, correction: 'cervejinha', description: 'Diminutivo universitário' },
      ],
      "piseiro": [
        { regex: /dançar/gi, correction: 'arrepiar', description: 'Termo piseiro' },
        { regex: /festa/gi, correction: 'piseiro', description: 'Gênero musical' },
      ],
      "forro": [
        { regex: /dançar/gi, correction: 'xote', description: 'Termo forró' },
        { regex: /festa/gi, correction: 'arrasta-pé', description: 'Termo forró' },
      ]
    }

    return [...baseFixes, ...(genreSpecificFixes[genre] || [])]
  }

  /**
   * GERA LETRA DIRETA COM PREVENÇÃO DE ERROS
   */
  private static async generateDirectLyrics(
    request: CompositionRequest,
    syllableEnforcement: { min: number; max: number; ideal: number },
    predictedErrors: string[] = []
  ): Promise<string> {
    console.log("[MetaComposer] Gerando letra com prevenção de erros...")

    const errorPreventionSection = predictedErrors.length > 0 ? 
      `═══════════════════════════════════════════════════════════════
🔮 ERROS PREVISTOS E COMO EVITÁ-LOS
═══════════════════════════════════════════════════════════════

**ERROS CRÍTICOS IDENTIFICADOS PARA ${request.genre.toUpperCase()}:**
${predictedErrors.map(error => `❌ ${error}`).join('\n')}

**SOLUÇÕES COMPROVADAS:`
      : ''

    const directPrompt = `Você é um compositor profissional de ${request.genre} que cria MEGA HITS BRASILEIROS.

TEMA: ${request.theme}
MOOD: ${request.mood}
${request.rhythm ? `RITMO: ${request.rhythm}` : ""}

${errorPreventionSection}

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
🎵 ESTRUTURA DE MEGA HIT - ${request.genre.toUpperCase()}
═══════════════════════════════════════════════════════════════

${this.getGenreStructureGuide(request.genre)}

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
   * GUIA DE ESTRUTURA ESPECÍFICA POR GÊNERO
   */
  private static getGenreStructureGuide(genre: string): string {
    const structureGuides: Record<string, string> = {
      "sertanejo-moderno": `**VERSOS (8-11 sílabas):**
- História de amor/cotidiano sertanejo
- Linguagem coloquial: "cê", "tô", "pra", "tá"
- Referências: estrada, paixão, saudade, boteco

**CHORUS (8-9 sílabas):**
- Repetitivo e grudento
- Fácil memorização: "Ai-ai-ai", "Oh-oh-oh"
- Emoção intensa e coreografia fácil

**PONTE:**
- Desenvolve drama emocional
- Prepara clímax para final`,

      "sertanejo-universitario": `**VERSOS (7-10 sílabas):**
- Festa, amor universitário, amizade
- Gírias: "festão", "zoeira", "rolê"
- Referências: faculdade, república, balada

**CHORUS (7-9 sílabas):**
- Extremamente repetitivo
- Grito coletivo: "Hey!", "Vamo!"
- Fácil de cantar em grupo`,

      "piseiro": `**VERSOS (6-9 sílabas):**
- Ritmo acelerado e dançante
- Letras simples e diretas
- Referências: festa, dança, paquera

**CHORUS (6-8 sílabas):**
- Super repetitivo e animado
- Gritos: "Arrepiou!", "Tá bom demais!"
- Coreografia marcada`,

      "forro": `**VERSOS (8-11 sílabas):**
- Amor, nordeste, saudade
- Linguagem regional: "mainha", "painho", "xote"
- Referências: São João, quadrilha, sanfona

**CHORUS (8-10 sílabas):**
- Dançante e romântico
- Repetições suaves
- Convidativo para dançar`,

      "funk": `**VERSOS (6-9 sílabas):**
- Batida forte e letras diretas
- Gírias cariocas: "de lei", "brabo", "firmeza"
- Referências: favela, ostentação, empoderamento

**CHORUS (4-7 sílabas):**
- Extremamente repetitivo
- Gritos e efeitos sonoros
- Dança sensual`,

      "trap": `**VERSOS (7-10 sílabas):**
- Flow quebrado e rimas complexas
- Temáticas: realidade, superação, crítica social
- Autotune e efeitos vocais

**CHORUS (6-8 sílabas):**
- Melódico e repetitivo
- Jogo de palavras inteligente
- Refrão marcante`
    }

    return structureGuides[genre] || structureGuides["sertanejo-moderno"]
  }

  /**
   * GERA REESCRITA COM CORREÇÃO PREDITIVA
   */
  private static async generateRewrite(
    request: CompositionRequest, 
    predictedErrors: string[] = []
  ): Promise<string> {
    console.log("[MetaComposer] Gerando reescrita com correção preditiva...")

    if (!request.originalLyrics) {
      throw new Error("Original lyrics required for rewrite")
    }

    const errorPreventionSection = predictedErrors.length > 0 ? 
      `🔮 **ERROS PREVISTOS PARA CORREÇÃO:**
${predictedErrors.map(error => `• ${error}`).join('\n')}
      
**FOCO ESPECIAL EM:**`
      : ''

    const rewritePrompt = `Você é um compositor profissional de ${request.genre}. Reescreva esta letra:

LETRA ORIGINAL:
${request.originalLyrics}

TEMA: ${request.theme}
MOOD: ${request.mood}

${errorPreventionSection}

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
   * GERA LETRA COM REFRÕES PRESERVADOS E PREVENÇÃO
   */
  private static async generateWithPreservedChoruses(
    preservedChoruses: string[],
    request: CompositionRequest,
    syllableEnforcement: { min: number; max: number; ideal: number },
    predictedErrors: string[] = []
  ): Promise<string> {
    console.log("[MetaComposer] Gerando letra com refrões preservados e prevenção...")

    const errorPrevention = predictedErrors.length > 0 ? 
      `⚠️ **ERROS PREVISTOS A EVITAR:**
${predictedErrors.map(error => `• ${error}`).join('\n')}\n\n`
      : ''

    const chorusPrompt = `Você é um compositor profissional de ${request.genre}. Crie uma letra usando EXATAMENTE estes refrões:

${preservedChoruses.join("\n\n")}

TEMA: ${request.theme}
MOOD: ${request.mood}

${errorPrevention}
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

  // MÉTODOS AUXILIARES

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
    // Conta quantos erros previstos foram efetivamente evitados
    let prevented = 0
    
    predictedErrors.forEach(error => {
      if (error.includes('nã') && !finalLyrics.toLowerCase().includes('nã')) {
        prevented++
      }
      if (error.includes('acento') && !this.hasAccentErrors(finalLyrics)) {
        prevented++
      }
      if (error.includes('sílaba') && this.hasGoodSyllableDistribution(finalLyrics)) {
        prevented++
      }
    })
    
    return prevented
  }

  private static hasAccentErrors(lyrics: string): boolean {
    const commonErrors = [/nã[^o]/gi, /seguranç/gi, /heranç/gi, /raç[^a]/gi, /laç[^o]/gi]
    return commonErrors.some(regex => regex.test(lyrics))
  }

  private static hasGoodSyllableDistribution(lyrics: string): boolean {
    const lines = lyrics.split('\n').filter(line => 
      line.trim() && !line.startsWith('[') && !line.startsWith('(')
    )
    
    const validLines = lines.filter(line => {
      const syllables = countPoeticSyllables(line)
      return syllables >= 7 && syllables <= 11
    })
    
    return validLines.length >= lines.length * 0.8 // 80% dos versos dentro do padrão
  }

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

    return contextLines.join('\n')
  }
}
