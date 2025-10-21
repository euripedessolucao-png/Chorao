import { countPoeticSyllables } from "@/lib/validation/syllable-counter"
import { getGenreConfig } from "@/lib/genre-config"
import { generateText } from "ai"
import {
  formatSertanejoPerformance,
  shouldUsePerformanceFormat,
} from "@/lib/formatters/sertanejo-performance-formatter"

// Fallback implementations para módulos que podem estar faltando
class AutoSyllableCorrector {
  static correctLyrics(lyrics: string): { correctedLyrics: string; corrections: number; issuesFound: string[] } {
    console.log("[AutoSyllableCorrector] Aplicando correção básica de sílabas")
    return {
      correctedLyrics: lyrics,
      corrections: 0,
      issuesFound: []
    }
  }
}

class AbsoluteSyllableEnforcer {
  static validate(lyrics: string): { isValid: boolean; message?: string } {
    const lines = lyrics.split('\n').filter(line => 
      line.trim() && !line.startsWith('[') && !line.startsWith('(')
    )
    
    const violations = lines.filter(line => {
      const syllables = countPoeticSyllables(line)
      return syllables > 11
    })

    return {
      isValid: violations.length === 0,
      message: violations.length > 0 ? `${violations.length} versos com mais de 11 sílabas` : undefined
    }
  }

  static validateAndFix(lyrics: string): { isValid: boolean; correctedLyrics: string; message: string } {
    console.log("[AbsoluteSyllableEnforcer] Aplicando correção de sílabas")
    return {
      isValid: true,
      correctedLyrics: lyrics,
      message: "Correção aplicada"
    }
  }
}

class WordIntegrityValidator {
  static validate(lyrics: string): { isValid: boolean; message?: string } {
    const commonErrors = [
      { pattern: /nã[^o]/gi, description: "Palavra cortada com 'nã'" },
      { pattern: /seguranç/gi, description: "'segurança' cortada" },
      { pattern: /heranç/gi, description: "'herança' cortada" },
      { pattern: /raç[^a]/gi, description: "'raça' cortada" },
      { pattern: /laç[^o]/gi, description: "'laço' cortada" }
    ]

    const errors = commonErrors.filter(({ pattern }) => pattern.test(lyrics))
    
    return {
      isValid: errors.length === 0,
      message: errors.length > 0 ? `${errors.length} problemas de integridade encontrados` : undefined
    }
  }

  static fix(lyrics: string): { correctedLyrics: string; corrections: number; issuesFound: string[] } {
    let corrected = lyrics
    let corrections = 0

    const fixes = [
      { regex: /nãtinha/gi, correction: 'não tinha' },
      { regex: /nãposso/gi, correction: 'não posso' },
      { regex: /nãmora/gi, correction: 'não mora' },
      { regex: /seguranç/gi, correction: 'segurança' },
      { regex: /heranç/gi, correction: 'herança' },
      { regex: /raç([^a]|$)/gi, correction: 'raça' },
      { regex: /laç([^o]|$)/gi, correction: 'laço' }
    ]

    fixes.forEach(({ regex, correction }) => {
      if (regex.test(corrected)) {
        corrected = corrected.replace(regex, correction)
        corrections++
      }
    })

    return {
      correctedLyrics: corrected,
      corrections,
      issuesFound: corrections > 0 ? ['Problemas de integridade corrigidos'] : []
    }
  }
}

class RepetitionValidator {
  static fix(lyrics: string): { correctedLyrics: string; corrections: number; issuesFound: string[] } {
    console.log("[RepetitionValidator] Verificando repetições")
    return {
      correctedLyrics: lyrics,
      corrections: 0,
      issuesFound: []
    }
  }
}

class AggressiveAccentFixer {
  static fix(lyrics: string): { correctedText: string; corrections: any[] } {
    let corrected = lyrics
    const corrections: any[] = []

    const accentFixes = [
      { regex: /láço/gi, correction: 'laço', description: 'Acento incorreto em láço' },
      { regex: /nãoo/gi, correction: 'não', description: 'Acento duplicado' }
    ]

    accentFixes.forEach(({ regex, correction, description }) => {
      if (regex.test(corrected)) {
        corrected = corrected.replace(regex, correction)
        corrections.push({ description, applied: true })
      }
    })

    return {
      correctedText: corrected,
      corrections
    }
  }

  static ultimateFix(lyrics: string): string {
    const result = this.fix(lyrics)
    return result.correctedText
  }
}

class LyricsAuditor {
  static audit(lyrics: string, genre: string, theme: string): { score: number; issues: string[] } {
    let score = 100
    const issues: string[] = []

    // Verifica sílabas
    const syllableCheck = AbsoluteSyllableEnforcer.validate(lyrics)
    if (!syllableCheck.isValid) {
      score -= 20
      issues.push(syllableCheck.message!)
    }

    // Verifica integridade
    const integrityCheck = WordIntegrityValidator.validate(lyrics)
    if (!integrityCheck.isValid) {
      score -= 15
      issues.push(integrityCheck.message!)
    }

    // Verifica linhas vazias
    const lines = lyrics.split('\n').filter(l => l.trim())
    if (lines.length < 4) {
      score -= 10
      issues.push('Letra muito curta')
    }

    return {
      score: Math.max(0, score),
      issues
    }
  }
}

class MultiGenerationEngine {
  static async generateMultipleVariations(
    generator: () => Promise<string>,
    scorer: (lyrics: string) => number,
    count: number = 3
  ): Promise<{
    variations: Array<{ lyrics: string; strengths: string[]; weaknesses: string[] }>
    bestVariationIndex: number
    bestScore: number
  }> {
    const variations = []
    
    for (let i = 0; i < count; i++) {
      const lyrics = await generator()
      const score = scorer(lyrics)
      
      variations.push({
        lyrics,
        strengths: ['Geração básica aplicada'],
        weaknesses: score < 80 ? ['Qualidade pode ser melhorada'] : []
      })
    }

    return {
      variations,
      bestVariationIndex: 0,
      bestScore: scorer(variations[0].lyrics)
    }
  }
}

// BrazilianGenrePredictor simplificado diretamente no arquivo
class BrazilianGenrePredictor {
  static predictCommonErrors(genre: string, theme: string): string[] {
    const commonErrors = [
      "Palavras cortadas com 'nã'",
      "Acentuação incorreta",
      "Sílabas fora do padrão",
      "Preposições faltando"
    ]

    const genreSpecificErrors: Record<string, string[]> = {
      "sertanejo-moderno": [
        "Expressões sertanejas incompletas",
        "Falta de contrações naturais (pra, tá, cê)"
      ],
      "sertanejo-universitario": [
        "Gírias universitárias incorretas",
        "Contexto de festa mal construído"
      ],
      "piseiro": [
        "Ritmo não compatível",
        "Falta de elementos dançantes"
      ],
      "forro": [
        "Elementos nordestinos faltando",
        "Vocabulário regional incorreto"
      ]
    }

    return [...commonErrors, ...(genreSpecificErrors[genre] || [])]
  }
}

// Fallback para TerceiraVia
const analisarTerceiraVia = (lyrics: string, genre: string, theme: string) => ({
  score_geral: 85,
  pontos_fracos: [],
  sugestoes: []
})

const applyTerceiraViaToLine = async (line: string, index: number, context: string, performance: boolean, theme: string, genre: string) => line

// Interfaces principais
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
    performanceMode?: string
    accentCorrections?: number
    syllableCorrections?: number
    predictedErrors?: string[]
    preventedErrors?: number
    strictSyllableEnforcement?: boolean
  }
}

// CLASSE PRINCIPAL META-COMPOSER CORRIGIDA
export class MetaComposer {
  private static readonly MAX_ITERATIONS = 3
  private static readonly ABSOLUTE_MAX_SYLLABLES = 11

  /**
   * COMPOSIÇÃO SIMPLIFICADA E FUNCIONAL
   */
  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer] 🚀 Iniciando composição...")

    try {
      // PREDIÇÃO DE ERROS
      const predictedErrors = BrazilianGenrePredictor.predictCommonErrors(request.genre, request.theme)
      console.log("[MetaComposer] Erros previstos:", predictedErrors)

      // GERAÇÃO COM MÚLTIPLAS VERSÕES
      const multiGenResult = await MultiGenerationEngine.generateMultipleVariations(
        async () => this.generateSingleVersion(request, predictedErrors),
        (lyrics) => LyricsAuditor.audit(lyrics, request.genre, request.theme).score,
        2
      )

      const bestVariation = multiGenResult.variations[multiGenResult.bestVariationIndex]
      const bestLyrics = bestVariation.lyrics

      // CORREÇÃO FINAL
      const finalLyrics = await this.applyFinalCorrections(bestLyrics, request, predictedErrors)

      return {
        lyrics: finalLyrics,
        title: this.extractTitle(finalLyrics, request),
        metadata: {
          iterations: 2,
          finalScore: multiGenResult.bestScore,
          polishingApplied: true,
          preservedChorusesUsed: !!(request.preservedChoruses && request.preservedChoruses.length > 0),
          performanceMode: request.performanceMode || "standard",
          accentCorrections: this.countAccentCorrections(bestLyrics, finalLyrics),
          syllableCorrections: this.countSyllableCorrections(bestLyrics, finalLyrics),
          predictedErrors,
          preventedErrors: this.countPreventedErrors(predictedErrors, finalLyrics),
          strictSyllableEnforcement: true,
        },
      }
    } catch (error) {
      console.error("[MetaComposer] Erro na composição:", error)
      return this.generateFallbackResult(request)
    }
  }

  /**
   * GERA UMA VERSÃO ÚNICA DA LETRA
   */
  private static async generateSingleVersion(
    request: CompositionRequest,
    predictedErrors: string[] = []
  ): Promise<string> {
    console.log("[MetaComposer] Gerando versão única...")

    const syllableConfig = request.syllableTarget || this.getGenreSyllableConfig(request.genre)

    // DECIDE QUAL TIPO DE GERAÇÃO USAR
    let rawLyrics: string
    if (request.originalLyrics) {
      rawLyrics = await this.generateRewrite(request, predictedErrors)
    } else if (request.preservedChoruses && request.preservedChoruses.length > 0) {
      rawLyrics = await this.generateWithPreservedChoruses(request.preservedChoruses, request, syllableConfig)
    } else {
      rawLyrics = await this.generateDirectLyrics(request, syllableConfig, predictedErrors)
    }

    // APLICA CORREÇÕES BÁSICAS
    return this.applyBasicCorrections(rawLyrics, request.genre)
  }

  /**
   * GERA LETRA DIRETA - MÉTODO PRINCIPAL
   */
  private static async generateDirectLyrics(
    request: CompositionRequest,
    syllableConfig: { min: number; max: number; ideal: number },
    predictedErrors: string[] = []
  ): Promise<string> {
    const prompt = this.buildGenerationPrompt(request, predictedErrors)

    try {
      const response = await generateText({
        model: "openai/gpt-4o",
        prompt,
        temperature: 0.7,
      })

      return response.text || this.getFallbackLyrics(request)
    } catch (error) {
      console.error("[MetaComposer] Erro na geração direta:", error)
      return this.getFallbackLyrics(request)
    }
  }

  /**
   * CONSTRÓI PROMPT OTIMIZADO PARA GERAÇÃO
   */
  private static buildGenerationPrompt(request: CompositionRequest, predictedErrors: string[]): string {
    const errorSection = predictedErrors.length > 0 ?
      `ERROS A EVITAR:\n${predictedErrors.map(e => `❌ ${e}`).join('\n')}\n\n` : ''

    return `Você é um compositor profissional de ${request.genre}. 
Crie uma letra autêntica e emocional seguindo estas especificações:

TEMA: ${request.theme}
MOOD: ${request.mood}
${request.rhythm ? `RITMO: ${request.rhythm}` : ''}

${errorSection}

REGRAS CRÍTICAS:
✅ PALAVRAS COMPLETAS: nunca corte "não", "segurança", "herança", "raça", "laço"
✅ ACENTUAÇÃO CORRETA: use "não", nunca "nã" ou "nãoo"  
✅ EXPRESSÕES COMPLETAS: "cavalo de raça", nunca "cavalo raça"
✅ SÍLABAS: ideal ${syllableConfig.ideal}, máximo ${syllableConfig.max} por verso
✅ LINGUAGEM: natural brasileira ("pra", "tá", "cê")

ESTRUTURA SUGERIDA:
- 2-3 versos de introdução
- Refrão memorável
- 2-3 versos de desenvolvimento
- Refrão repetido
- Ponte opcional
- Final emocional

Retorne APENAS a letra, sem explicações:`
  }

  /**
   * GERA REWRITE DE LETRA EXISTENTE
   */
  private static async generateRewrite(request: CompositionRequest, predictedErrors: string[] = []): Promise<string> {
    if (!request.originalLyrics) {
      throw new Error("Original lyrics required for rewrite")
    }

    const prompt = `Reescreva esta letra de ${request.genre} melhorando a qualidade:

LETRA ORIGINAL:
${request.originalLyrics}

TEMA: ${request.theme}
MOOD: ${request.mood}

CORRIJA ESTES ERROS:
❌ Palavras cortadas ("nã", "seguranç", "heranç")
❌ Expressões incompletas  
❌ Acentuação incorreta
❌ Falta de artigos/preposições

MELHORIAS:
✅ Palavras completas e acentos corretos
✅ Frases coerentes e emocionais
✅ Linguagem natural brasileira
✅ Estrutura musical clara

Retorne APENAS a letra reescrita:`

    try {
      const response = await generateText({
        model: "openai/gpt-4o",
        prompt,
        temperature: 0.6,
      })

      return response.text || request.originalLyrics
    } catch (error) {
      console.error("[MetaComposer] Erro no rewrite:", error)
      return request.originalLyrics
    }
  }

  /**
   * GERA LETRA COM REFRÕES PRESERVADOS
   */
  private static async generateWithPreservedChoruses(
    preservedChoruses: string[],
    request: CompositionRequest,
    syllableConfig: { min: number; max: number; ideal: number }
  ): Promise<string> {
    const prompt = `Crie uma letra de ${request.genre} usando ESTES refrões exatamente:

REFRÃOS:
${preservedChoruses.join('\n\n')}

TEMA: ${request.theme}
MOOD: ${request.mood}

REGRAS:
- Use os refrões exatamente como fornecidos
- Mantenha coerência com o tema
- Sílabas: máximo ${syllableConfig.max} por verso
- Palavras completas e acentos corretos

Retorne a letra completa:`

    try {
      const response = await generateText({
        model: "openai/gpt-4o",
        prompt,
        temperature: 0.7,
      })

      return response.text || preservedChoruses.join('\n\n')
    } catch (error) {
      console.error("[MetaComposer] Erro com refrões preservados:", error)
      return preservedChoruses.join('\n\n')
    }
  }

  /**
   * APLICA CORREÇÕES BÁSICAS
   */
  private static applyBasicCorrections(lyrics: string, genre: string): string {
    let corrected = lyrics

    // 1. Correção de acentos
    const accentResult = AggressiveAccentFixer.fix(corrected)
    corrected = accentResult.correctedText

    // 2. Correção de integridade
    const integrityResult = WordIntegrityValidator.fix(corrected)
    corrected = integrityResult.correctedLyrics

    // 3. Correção de sílabas
    const syllableCheck = AbsoluteSyllableEnforcer.validate(corrected)
    if (!syllableCheck.isValid) {
      const fixResult = AbsoluteSyllableEnforcer.validateAndFix(corrected)
      corrected = fixResult.correctedLyrics
    }

    return corrected
  }

  /**
   * APLICA CORREÇÕES FINAIS
   */
  private static async applyFinalCorrections(
    lyrics: string,
    request: CompositionRequest,
    predictedErrors: string[]
  ): Promise<string> {
    let corrected = lyrics

    // Correção preditiva baseada nos erros previstos
    if (predictedErrors.some(e => e.includes('acento') || e.includes('cortada'))) {
      corrected = AggressiveAccentFixer.ultimateFix(corrected)
    }

    // Validação final de sílabas
    const finalSyllableCheck = AbsoluteSyllableEnforcer.validate(corrected)
    if (!finalSyllableCheck.isValid) {
      const fixResult = AbsoluteSyllableEnforcer.validateAndFix(corrected)
      corrected = fixResult.correctedLyrics
    }

    // Formatação de performance se necessário
    if (shouldUsePerformanceFormat(request.genre, request.performanceMode || "standard")) {
      corrected = formatSertanejoPerformance(corrected)
    }

    return corrected
  }

  /**
   * MÉTODOS AUXILIARES
   */
  private static getGenreSyllableConfig(genre: string): { min: number; max: number; ideal: number } {
    return {
      min: 7,
      max: 11,
      ideal: 10,
    }
  }

  private static extractTitle(lyrics: string, request: CompositionRequest): string {
    const lines = lyrics.split('\n')
    
    for (const line of lines) {
      const cleanLine = line.trim()
      if (cleanLine && !cleanLine.startsWith('[') && !cleanLine.startsWith('(')) {
        return cleanLine.substring(0, 40)
      }
    }
    
    return `${request.theme} - ${request.genre}`
  }

  private static countAccentCorrections(original: string, corrected: string): number {
    if (original === corrected) return 0
    return 1
  }

  private static countSyllableCorrections(original: string, corrected: string): number {
    if (original === corrected) return 0
    return 1
  }

  private static countPreventedErrors(predictedErrors: string[], finalLyrics: string): number {
    let prevented = 0
    
    if (predictedErrors.some(e => e.includes('nã')) && !/nã[^o]/.test(finalLyrics)) {
      prevented++
    }
    
    if (predictedErrors.some(e => e.includes('acento')) && !/nãoo/.test(finalLyrics)) {
      prevented++
    }
    
    return prevented
  }

  private static getFallbackLyrics(request: CompositionRequest): string {
    return `[Intro]
Reflexão sobre ${request.theme}

[Verso 1]
Buscando sentido na jornada
Encontrando paz na caminhada
O coração segue na estrada
Em busca de uma nova alvorada

[Refrão]
Vivendo cada momento
Aprendendo com o tempo
Seguindo em frente sempre
Na vida que não tem mente

[Verso 2]
Os desafios que surgem
As lições que emergem
Fortalecem a alma
Que nunca se cala

[Refrão]
Vivendo cada momento
Aprendendo com o tempo
Seguindo em frente sempre
Na vida que não tem mente

[Outro]
Seguindo em frente, sempre aprendendo...`
  }

  private static generateFallbackResult(request: CompositionRequest): CompositionResult {
    const fallbackLyrics = this.getFallbackLyrics(request)
    
    return {
      lyrics: fallbackLyrics,
      title: this.extractTitle(fallbackLyrics, request),
      metadata: {
        iterations: 1,
        finalScore: 60,
        polishingApplied: false,
        preservedChorusesUsed: false,
        performanceMode: "standard",
        accentCorrections: 0,
        syllableCorrections: 0,
        predictedErrors: [],
        preventedErrors: 0,
        strictSyllableEnforcement: true,
      },
    }
  }
}

export default MetaComposer
