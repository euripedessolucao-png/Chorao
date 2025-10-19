/**
 * META-COMPOSITOR TURBO DEFINITIVO COM TERCEIRA VIA
 * Sistema completo com análise inteligente e correções avançadas
 */

import { generateText } from "ai"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter"
import { SyllableEnforcer } from "@/lib/validation/syllableEnforcer"
import { 
  TerceiraViaAnalysis, 
  analisarTerceiraVia, 
  applyTerceiraViaToLine,
  analisarMelodiaRitmo 
} from "@/lib/terceira-via"

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
  // ✅ NOVOS PARÂMETROS PARA REWRITE
  originalLyrics?: string
  rhythm?: string
  structureAnalysis?: any
  performanceMode?: 'standard' | 'performance'
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
    // ✅ NOVO: Análise completa da Terceira Via
    terceiraViaAnalysis?: TerceiraViaAnalysis
    melodicAnalysis?: any
    performanceMode?: string
  }
}

export class MetaComposer {
  private static readonly MAX_ITERATIONS = 3

  /**
   * COMPOSIÇÃO TURBO COM SISTEMA TERCEIRA VIA INTEGRADO
   */
  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer-TURBO] Iniciando composição com Terceira Via...")

    let iterations = 0
    let bestResult: CompositionResult | null = null
    let bestScore = 0
    let terceiraViaAnalysis: TerceiraViaAnalysis | null = null
    let melodicAnalysis: any = null

    const syllableEnforcement = request.syllableTarget || this.getGenreSyllableConfig(request.genre)
    const applyFinalPolish = request.applyFinalPolish ?? true
    const preservedChoruses = request.preservedChoruses || []
    const hasPreservedChoruses = preservedChoruses.length > 0
    const isRewrite = !!request.originalLyrics
    const performanceMode = request.performanceMode || 'standard'

    while (iterations < this.MAX_ITERATIONS) {
      iterations++
      console.log(`[MetaComposer-TURBO] Iteração ${iterations}/${this.MAX_ITERATIONS}`)

      let rawLyrics: string

      if (isRewrite) {
        rawLyrics = await this.generateRewrite(request)
      } else if (hasPreservedChoruses && iterations === 1) {
        rawLyrics = await this.generateWithPreservedChoruses(preservedChoruses, request, syllableEnforcement)
      } else {
        rawLyrics = await this.generateDirectLyrics(request, syllableEnforcement)
      }

      // ✅ ETAPA 1: ANÁLISE TERCEIRA VIA
      console.log('[MetaComposer-TURBO] 🔍 Aplicando análise Terceira Via...')
      terceiraViaAnalysis = analisarTerceiraVia(rawLyrics, request.genre, request.theme)
      melodicAnalysis = analisarMelodiaRitmo(rawLyrics, request.genre)
      
      console.log(`[MetaComposer-TURBO] 📊 Score Terceira Via: ${terceiraViaAnalysis.score_geral}/100`)
      console.log(`[MetaComposer-TURBO] 🎵 Score Melódico: ${melodicAnalysis.flow_score}/100`)
      
      // ✅ ETAPA 2: CORREÇÕES INTELIGENTES BASEADAS NA ANÁLISE
      if (terceiraViaAnalysis.score_geral < 75 && iterations < this.MAX_ITERATIONS - 1) {
        console.log('[MetaComposer-TURBO] 🎯 Aplicando correções Terceira Via...')
        rawLyrics = await this.applyTerceiraViaCorrections(rawLyrics, request, terceiraViaAnalysis)
        
        // ✅ RE-ANALISA APÓS CORREÇÕES
        terceiraViaAnalysis = analisarTerceiraVia(rawLyrics, request.genre, request.theme)
        console.log(`[MetaComposer-TURBO] 📊 Score após correções: ${terceiraViaAnalysis.score_geral}/100`)
      }

      // ✅ ETAPA 3: CORREÇÃO DE SÍLABAS
      const enforcedResult = await SyllableEnforcer.enforceSyllableLimits(
        rawLyrics, 
        syllableEnforcement, 
        request.genre
      )
      console.log(`[MetaComposer-TURBO] ✅ Correções de sílabas: ${enforcedResult.corrections} linhas`)

      let finalLyrics = enforcedResult.correctedLyrics
      let polishingApplied = false

      // ✅ ETAPA 4: POLIMENTO FINAL COM TERCEIRA VIA
      if (applyFinalPolish && iterations === this.MAX_ITERATIONS) {
        console.log('[MetaComposer-TURBO] ✨ Aplicando polimento universal com Terceira Via...')
        finalLyrics = await this.applyUniversalPolish(
          finalLyrics, 
          request.genre, 
          request.theme, 
          syllableEnforcement,
          performanceMode
        )
        polishingApplied = true
      }

      // ✅ ETAPA 5: AVALIAÇÃO DE QUALIDADE INTEGRADA
      const qualityScore = this.calculateQualityScore(
        finalLyrics, 
        syllableEnforcement, 
        request.genre, 
        terceiraViaAnalysis,
        melodicAnalysis
      )
      
      console.log(`[MetaComposer-TURBO] 🎯 Score final: ${qualityScore.toFixed(2)}`)

      if (qualityScore > bestScore) {
        bestScore = qualityScore
        bestResult = {
          lyrics: finalLyrics,
          title: this.extractTitle(finalLyrics, request),
          metadata: {
            iterations,
            finalScore: qualityScore,
            polishingApplied,
            preservedChorusesUsed: hasPreservedChoruses,
            rhymeScore: this.analyzeRhymes(finalLyrics, request.genre).score,
            rhymeTarget: this.getGenreRhymeTarget(request.genre).minScore,
            structureImproved: isRewrite,
            // ✅ INCLUI ANÁLISES COMPLETAS
            terceiraViaAnalysis: terceiraViaAnalysis,
            melodicAnalysis: melodicAnalysis,
            performanceMode: performanceMode
          },
        }
      }

      // ✅ CRITÉRIO DE PARADA INTELIGENTE
      const shouldStop = qualityScore >= 0.8 && 
                        terceiraViaAnalysis.score_geral >= 75 && 
                        melodicAnalysis.flow_score >= 70
      
      if (shouldStop) {
        console.log('[MetaComposer-TURBO] 🎯 Critério de parada atingido!')
        break
      }
    }

    if (!bestResult) {
      throw new Error("Falha ao gerar composição")
    }

    console.log(`[MetaComposer-TURBO] 🎵 Composição finalizada! Score: ${bestScore.toFixed(2)}`)
    return bestResult
  }

  /**
   * APLICA CORREÇÕES BASEADAS NA ANÁLISE TERCEIRA VIA
   */
  private static async applyTerceiraViaCorrections(
    lyrics: string,
    request: CompositionRequest,
    analysis: TerceiraViaAnalysis
  ): Promise<string> {
    
    const lines = lyrics.split('\n')
    const correctedLines: string[] = []
    let correctionsApplied = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // ✅ SÓ CORRIGE LINHAS QUE PRECISAM
      if (this.needsTerceiraViaCorrection(line, analysis)) {
        try {
          const context = this.buildLineContext(lines, i, request.theme)
          const correctedLine = await applyTerceiraViaToLine(
            line, 
            i, 
            context, 
            request.performanceMode === 'performance',
            request.additionalRequirements,
            request.genre // ✅ PASSA O GÊNERO PARA O THIRD WAY ENGINE
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
    return correctedLines.join('\n')
  }

  /**
   * VERIFICA SE UMA LINHA PRECISA DE CORREÇÃO TERCEIRA VIA
   */
  private static needsTerceiraViaCorrection(line: string, analysis: TerceiraViaAnalysis): boolean {
    if (!line.trim() || line.startsWith('[') || line.startsWith('(') || line.includes('Instruments:')) {
      return false
    }

    // ✅ CLICHÊS IDENTIFICADOS NA ANÁLISE
    const detectedCliches = analysis.pontos_fracos.filter(p => p.includes('Clichê detectado'))
    if (detectedCliches.some(cliche => {
      const clicheText = cliche.replace('Clichê detectado: "', '').replace('"', '')
      return line.toLowerCase().includes(clicheText.toLowerCase())
    })) {
      return true
    }

    // ✅ LINHAS MUITO GENÉRICAS
    const genericPhrases = [
      'meu coração', 'minha vida', 'sem você', 'é tudo', 'não sei', 
      'muito mais', 'pra sempre', 'nunca mais', 'tão grande', 'muito',
      'muito tempo', 'toda hora', 'sempre assim', 'nunca vou'
    ]
    
    const words = line.toLowerCase().split(/\s+/)
    const genericWordCount = words.filter(word => genericPhrases.includes(word)).length
    
    return genericWordCount >= 2 || (line.length < 20 && line.split(' ').length < 4)
  }

  /**
   * CONSTRÓI CONTEXTO PARA CORREÇÃO DE LINHA
   */
  private static buildLineContext(lines: string[], currentIndex: number, theme: string): string {
    const contextLines = []
    
    // Pega 2 linhas antes (se existirem)
    for (let i = Math.max(0, currentIndex - 2); i < currentIndex; i++) {
      if (lines[i].trim() && !lines[i].startsWith('[') && !lines[i].startsWith('(')) {
        contextLines.push(lines[i])
      }
    }
    
    // Pega 1 linha depois (se existir)
    if (currentIndex + 1 < lines.length && 
        lines[currentIndex + 1].trim() && 
        !lines[currentIndex + 1].startsWith('[') && 
        !lines[currentIndex + 1].startsWith('(')) {
      contextLines.push(lines[currentIndex + 1])
    }
    
    return `Tema: ${theme}. Contexto: ${contextLines.join(' | ')}`
  }

  /**
   * POLIMENTO UNIVERSAL COM TERCEIRA VIA
   */
  private static async applyUniversalPolish(
    lyrics: string, 
    genre: string,
    theme: string,
    syllableTarget: { min: number; max: number; ideal: number },
    performanceMode: string = 'standard'
  ): Promise<string> {
    
    console.log(`[MetaComposer-TURBO] ✨ Polimento universal para: ${genre} (${performanceMode})`)
    
    let polishedLyrics = lyrics
    
    // ✅ ETAPA 1: CORREÇÃO DE RIMAS COM TERCEIRA VIA
    polishedLyrics = await this.applyRhymeEnhancement(polishedLyrics, genre, theme)
    
    // ✅ ETAPA 2: CORREÇÃO DE SÍLABAS INTELIGENTE
    const lines = polishedLyrics.split('\n')
    const finalLines: string[] = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      if (line.startsWith('[') || line.startsWith('(') || line.includes('Instruments:') || !line.trim()) {
        finalLines.push(line)
        continue
      }
      
      const currentSyllables = countPoeticSyllables(line)
      const needsCorrection = currentSyllables < syllableTarget.min || currentSyllables > syllableTarget.max
      
      if (needsCorrection) {
        try {
          const polishedLine = await this.quickLineFix(line, genre, syllableTarget)
          finalLines.push(polishedLine)
        } catch (error) {
          finalLines.push(line)
        }
      } else {
        finalLines.push(line)
      }
    }
    
    polishedLyrics = finalLines.join('\n')

    // ✅ ETAPA 3: FORMATAÇÃO PERFORMÁTICA
    if (performanceMode === 'performance') {
      polishedLyrics = this.applyPerformanceFormatting(polishedLyrics, genre)
    }
    
    return polishedLyrics
  }

  /**
   * APLICA MELHORIA DE RIMAS COM TERCEIRA VIA
   */
  private static async applyRhymeEnhancement(
    lyrics: string, 
    genre: string, 
    theme: string
  ): Promise<string> {
    
    const analysis = this.analyzeRhymes(lyrics, genre)
    const target = this.getGenreRhymeTarget(genre)
    
    console.log(`[RhymeSystem] ${genre}: ${analysis.score}% rimas ricas (alvo: ${target.minScore}%)`)
    
    // Só corrige se estiver abaixo do alvo
    if (analysis.score >= target.minScore) {
      console.log(`[RhymeSystem] ✅ Rimas já atendem o padrão ${genre}`)
      return lyrics
    }
    
    console.log(`[RhymeSystem] 🔧 Aplicando correção de rimas...`)
    
    const lines = lyrics.split('\n')
    const enhancedLines: string[] = []
    let improvements = 0
    
    for (let i = 0; i < lines.length - 1; i++) {
      const line1 = lines[i]
      const line2 = lines[i + 1]
      
      // Mantém estrutura
      if (line1.startsWith('[') || line1.startsWith('(') || 
          line1.includes('Instruments:') || !line1.trim()) {
        enhancedLines.push(line1)
        continue
      }
      
      if (line2 && !line2.startsWith('[') && !line2.startsWith('(')) {
        const rhymeType = this.analyzeRhymeType(line1, line2)
        const targetTypes = target.preferredTypes
        
        if (!targetTypes.includes(rhymeType)) {
          const enhanced = await this.enhanceRhymePair(line1, line2, genre, theme)
          if (enhanced) {
            enhancedLines.push(enhanced.line1)
            enhancedLines.push(enhanced.line2)
            improvements++
            i++ // Pula a próxima linha
            continue
          }
        }
      }
      
      enhancedLines.push(line1)
    }
    
    // Adiciona última linha se necessário
    if (enhancedLines.length < lines.length) {
      enhancedLines.push(lines[lines.length - 1])
    }
    
    const enhancedLyrics = enhancedLines.join('\n')
    const newAnalysis = this.analyzeRhymes(enhancedLyrics, genre)
    
    console.log(`[RhymeSystem] ✅ Rimas melhoradas: ${analysis.score}% → ${newAnalysis.score}% (${improvements} melhorias)`)
    
    return enhancedLyrics
  }

  /**
   * FORMATAÇÃO PERFORMÁTICA
   */
  private static applyPerformanceFormatting(lyrics: string, genre: string): string {
    let formatted = lyrics
    
    // ✅ CORREGE TAGS PARA INGLÊS
    formatted = formatted
      .replace(/\[INTRO\]/gi, '[INTRO]')
      .replace(/\[VERSO\]/gi, '[VERSE]')
      .replace(/\[REFRÃO\]/gi, '[CHORUS]')
      .replace(/\[PONTE\]/gi, '[BRIDGE]')
      .replace(/\[FINAL\]/gi, '[OUTRO]')

    // ✅ GARANTE INSTRUMENTOS EM INGLÊS
    if (!formatted.includes("(Instruments:")) {
      const instruments = this.getGenreInstruments(genre)
      formatted += `\n\n(Instruments: ${instruments})`
    }
    
    return formatted
  }

  /**
   * CALCULA SCORE DE QUALIDADE INTEGRADO
   */
  private static calculateQualityScore(
    lyrics: string, 
    syllableTarget: { min: number; max: number; ideal: number },
    genre: string,
    terceiraViaAnalysis: TerceiraViaAnalysis,
    melodicAnalysis: any
  ): number {
    
    const lines = lyrics.split('\n').filter(line => 
      line.trim() && !line.startsWith('[') && !line.startsWith('(') && !line.includes('Instruments:')
    )

    if (lines.length === 0) return 0

    // ✅ SCORE DE SÍLABAS (25%)
    let correctSyllables = 0
    let totalSyllables = 0
    
    lines.forEach(line => {
      const syllables = countPoeticSyllables(line)
      totalSyllables += syllables
      if (syllables >= syllableTarget.min && syllables <= syllableTarget.max) {
        correctSyllables++
      }
    })

    const syllableScore = correctSyllables / lines.length
    const averageSyllables = totalSyllables / lines.length
    const idealBonus = 1 - Math.abs(averageSyllables - syllableTarget.ideal) / 10

    // ✅ SCORE DE RIMAS (20%)
    const rhymeAnalysis = this.analyzeRhymes(lyrics, genre)
    const rhymeTarget = this.getGenreRhymeTarget(genre)
    const rhymeScore = rhymeAnalysis.score >= rhymeTarget.minScore ? 1.0 : rhymeAnalysis.score / rhymeTarget.minScore

    // ✅ SCORE TERCEIRA VIA (35%)
    const terceiraViaScore = terceiraViaAnalysis.score_geral / 100

    // ✅ SCORE MELÓDICO (20%)
    const melodicScore = melodicAnalysis.flow_score / 100

    // ✅ SCORE FINAL COM PONDERAÇÃO
    const finalScore = (
      syllableScore * 0.25 + 
      idealBonus * 0.05 + 
      rhymeScore * 0.20 + 
      terceiraViaScore * 0.35 + 
      melodicScore * 0.20
    )
    
    return Math.min(1, Math.max(0, finalScore))
  }

  // ✅ MÉTODOS EXISTENTES (mantidos para compatibilidade)

  /**
   * ANALISA RIMAS DA LETRA
   */
  private static analyzeRhymes(lyrics: string, genre: string): { score: number; richRhymes: number; totalPairs: number } {
    const lines = lyrics.split('\n').filter(line => 
      line.trim() && 
      !line.startsWith('[') && 
      !line.startsWith('(') &&
      !line.includes('Instruments:')
    )

    let richRhymes = 0
    let totalPairs = 0

    for (let i = 0; i < lines.length - 1; i += 2) {
      if (i + 1 < lines.length) {
        totalPairs++
        const rhymeType = this.analyzeRhymeType(lines[i], lines[i + 1])
        if (rhymeType === 'rica' || rhymeType === 'perfeita') {
          richRhymes++
        }
      }
    }

    const score = totalPairs > 0 ? Math.round((richRhymes / totalPairs) * 100) : 0
    return { score, richRhymes, totalPairs }
  }

  /**
   * ANALISA TIPO DE RIMA ENTRE DUAS LINHAS
   */
  private static analyzeRhymeType(line1: string, line2: string): string {
    const getLastWord = (line: string) => {
      const words = line.trim().split(/\s+/)
      return words[words.length - 1]?.toLowerCase().replace(/[^\wáàâãéèêíìîóòôõúùûç]/gi, "") || ""
    }

    const word1 = getLastWord(line1)
    const word2 = getLastWord(line2)
    
    if (!word1 || !word2) return 'none'
    
    // Rima perfeita (últimas 3 letras iguais)
    if (word1.slice(-3) === word2.slice(-3)) return 'perfeita'
    
    // Rima rica (últimas 2 letras iguais)
    if (word1.slice(-2) === word2.slice(-2)) return 'rica'
    
    // Rima pobre (apenas última letra igual)
    if (word1.slice(-1) === word2.slice(-1)) return 'pobre'
    
    return 'none'
  }

  /**
   * APRIMORA UM PAR DE LINHAS PARA MELHOR RIMA
   */
  private static async enhanceRhymePair(
    line1: string,
    line2: string,
    genre: string,
    theme: string
  ): Promise<{ line1: string; line2: string } | null> {
    
    const prompt = `CORREÇÃO DE RIMA - ${genre.toUpperCase()}

LINHA 1: "${line1}"
LINHA 2: "${line2}"
TEMA: ${theme}

REESCREVA APENAS A ÚLTIMA PALAVRA DE CADA LINHA para criar uma rima mais rica,
mantendo o significado original. Use linguagem do ${genre}.

RETORNE APENAS:
LINHA1_CORRIGIDA
LINHA2_CORRIGIDA`

    try {
      const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt,
        temperature: 0.3
      })

      const lines = text.trim().split('\n').filter(l => l.trim())
      if (lines.length >= 2) {
        return {
          line1: lines[0].trim(),
          line2: lines[1].trim()
        }
      }
    } catch (error) {
      console.error('[RhymeSystem] Erro na correção:', error)
    }
    
    return null
  }

  /**
   * METAS DE RIMA POR GÊNERO
   */
  private static getGenreRhymeTarget(genre: string): { minScore: number; preferredTypes: string[] } {
    const genreLower = genre.toLowerCase()
    
    // ✅ MPB: 60% rimas ricas
    if (genreLower.includes('mpb') || genreLower.includes('bossa')) {
      return { 
        minScore: 60,
        preferredTypes: ['perfeita', 'rica'] 
      }
    }
    
    // ✅ SERTANEJO: 50% rimas ricas  
    if (genreLower.includes('sertanejo')) {
      return { 
        minScore: 50,
        preferredTypes: ['rica', 'perfeita'] 
      }
    }
    
    if (genreLower.includes('funk') || genreLower.includes('trap')) {
      return { 
        minScore: 30,
        preferredTypes: ['rica', 'pobre'] 
      }
    }
    
    // Padrão para outros gêneros
    return { 
      minScore: 40,
      preferredTypes: ['rica', 'pobre'] 
    }
  }

  /**
   * CONFIGURAÇÃO DE SÍLABAS POR GÊNERO
   */
  private static getGenreSyllableConfig(genre: string): { min: number; max: number; ideal: number } {
    const configs: { [key: string]: { min: number; max: number; ideal: number } } = {
      "Sertanejo": { min: 9, max: 11, ideal: 10 },
      "Sertanejo Moderno": { min: 9, max: 11, ideal: 10 },
      "Sertanejo Universitário": { min: 9, max: 11, ideal: 10 },
      "MPB": { min: 7, max: 12, ideal: 9 },
      "Bossa Nova": { min: 7, max: 12, ideal: 9 },
      "Funk": { min: 6, max: 10, ideal: 8 },
      "Pagode": { min: 7, max: 11, ideal: 9 },
      "Samba": { min: 7, max: 11, ideal: 9 },
      "Forró": { min: 8, max: 11, ideal: 9 },
      "Axé": { min: 6, max: 10, ideal: 8 },
      "Rock": { min: 7, max: 11, ideal: 9 },
      "Pop": { min: 7, max: 11, ideal: 9 },
      "Gospel": { min: 8, max: 11, ideal: 9 }
    }

    return configs[genre] || { min: 7, max: 11, ideal: 9 }
  }

  /**
   * GERAÇÃO DIRETA DE LETRAS
   */
  private static async generateDirectLyrics(
    request: CompositionRequest, 
    enforcement: { min: number; max: number; ideal: number }
  ): Promise<string> {

    const prompt = `COMPOSIÇÃO MUSICAL - ${request.genre.toUpperCase()}

TEMA: ${request.theme}
HUMOR: ${request.mood}
SÍLABAS: ${enforcement.min}-${enforcement.max} por linha
CONTRAÇÕES: "cê", "tô", "pra", "tá"

${request.additionalRequirements ? `REQUISITOS:\n${request.additionalRequirements}\n` : ''}

RETORNE APENAS A LETRA NO FORMATO:`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.7
    })

    return text.trim()
  }

  /**
   * GERAÇÃO COM REFRÕES PRESERVADOS
   */
  private static async generateWithPreservedChoruses(
    preservedChoruses: string[],
    request: CompositionRequest,
    syllableEnforcement: { min: number; max: number; ideal: number }
  ): Promise<string> {
    
    const chorusesToUse = preservedChoruses.slice(0, 2)
    
    const prompt = `COMPOSIÇÃO COM REFRÕES PRESERVADOS - ${request.genre.toUpperCase()}

REFRÃOS PARA USAR:
${chorusesToUse.map((chorus, i) => `REFRÃO ${i+1}:\n${chorus}`).join('\n\n')}

TEMA: ${request.theme}
HUMOR: ${request.mood}
SÍLABAS: ${syllableEnforcement.min}-${syllableEnforcement.max} por linha

CRIE UMA MÚSICA QUE USE NATURALMENTE OS REFRÕES ACIMA.

RETORNE APENAS A LETRA:`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.4
    })

    return text.trim()
  }

  /**
   * GERAÇÃO DE REWRITE
   */
  private static async generateRewrite(request: CompositionRequest): Promise<string> {
    const structureInfo = request.structureAnalysis ? 
      `ESTRUTURA ORIGINAL: ${request.structureAnalysis.sections?.length || 0} seções` : 
      ''

    const prompt = `REWRITE MUSICAL - ${request.genre.toUpperCase()}

LETRA ORIGINAL:
${request.originalLyrics}

${structureInfo}
GÊNERO: ${request.genre}
TEMA: ${request.theme}
HUMOR: ${request.mood}
${request.additionalRequirements ? `REQUISITOS: ${request.additionalRequirements}` : ''}
${request.preservedChoruses?.length ? `REFRÃOS PRESERVADOS:\n${request.preservedChoruses.join('\n')}` : ''}

🎯 REGRAS DE REWRITE:
- PRESERVE a estrutura original (seções, ordem, tags)
- CORRIJA apenas versos com problemas de métrica
- USE linguagem coloquial brasileira
- MANTENHA a essência emocional

Gere a letra REEscrita MANTENDO A ESTRUTURA ORIGINAL:`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.7
    })

    return text.trim()
  }

  /**
   * CORREÇÃO RÁPIDA DE LINHA
   */
  private static async quickLineFix(
    line: string, 
    genre: string,
    syllableTarget: { min: number; max: number; ideal: number }
  ): Promise<string> {
    
    const currentSyllables = countPoeticSyllables(line)
    
    const prompt = `CORREÇÃO RÁPIDA - ${genre.toUpperCase()}

LINHA: "${line}"
SÍLABAS ATUAIS: ${currentSyllables} (ALVO: ${syllableTarget.min}-${syllableTarget.max})

REESCREVA RAPIDAMENTE PARA ${syllableTarget.ideal} SÍLABAS, MANTENDO SIGNIFICADO.

LINHA CORRIGIDA:`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.3
    })

    const correctedLine = text.trim()
    return correctedLine || line
  }

  /**
   * EXTRAI TÍTULO
   */
  private static extractTitle(lyrics: string, request: CompositionRequest): string {
    if (request.theme) return request.theme

    const chorusMatch = lyrics.match(/\[(?:CHORUS|REFRÃO)[^\]]*\]\s*\n([^\n]+)/i)
    if (chorusMatch?.[1]) {
      return chorusMatch[1].trim().split(" ").slice(0, 4).join(" ")
    }

    return "Composição Musical"
  }

  /**
   * INSTRUMENTOS POR GÊNERO
   */
  private static getGenreInstruments(genre: string): string {
    const instruments: { [key: string]: string } = {
      "Sertanejo": "acoustic guitar, viola, bass, drums, accordion",
      "Sertanejo Moderno": "acoustic guitar, electric guitar, synth, bass, drums, accordion",
      "MPB": "nylon guitar, piano, bass, light percussion",
      "Bossa Nova": "nylon guitar, piano, bass, drums, light percussion",
      "Funk": "drum machine, synth bass, samples, electronic beats",
      "Pagode": "cavaquinho, pandeiro, tantan, surdo, banjo",
      "Samba": "cavaquinho, pandeiro, surdo, tamborim, cuíca",
      "Forró": "accordion, triangle, zabumba, bass",
      "Axé": "electric guitar, synth, drums, percussion, brass",
      "Rock": "electric guitar, bass, drums, keyboard",
      "Pop": "synth, drum machine, bass, piano, electronic elements",
      "Gospel": "piano, organ, bass, drums, backing vocals"
    }
    
    return instruments[genre] || "guitar, bass, drums, keyboard"
  }
}
