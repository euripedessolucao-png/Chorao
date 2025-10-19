/**
 * META-COMPOSITOR TURBO DEFINITIVO - VERSÃO CORRIGIDA
 * Sistema completo com rimas ricas por gênero e integração Terceira Via
 */

import { generateText } from "ai"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter"

// ✅ IMPORTAÇÕES DA TERCEIRA VIA
import { 
  applyTerceiraViaToLine,
  needsTerceiraViaCorrection,
  buildLineContext,
  TerceiraViaAnalysis 
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
  originalLyrics?: string
  rhythm?: string
  structureAnalysis?: any
  // ✅ NOVO: ATIVA TERCEIRA VIA
  applyTerceiraVia?: boolean
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
    terceiraViaCorrections?: number
  }
}

export class MetaComposer {
  private static readonly MAX_ITERATIONS = 2

  /**
   * COMPOSIÇÃO TURBO DEFINITIVA - COM SISTEMA DE RIMAS E TERCEIRA VIA
   */
  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer-TURBO] Iniciando composição...")

    const isRewrite = !!request.originalLyrics
    const applyTerceiraVia = request.applyTerceiraVia ?? true
    
    console.log(`[MetaComposer-TURBO] Modo: ${isRewrite ? 'REWRITE' : 'COMPOSIÇÃO'}, TerceiraVia: ${applyTerceiraVia}`)

    let iterations = 0
    let bestResult: CompositionResult | null = null
    let bestScore = 0

    const syllableEnforcement = request.syllableTarget || this.getGenreSyllableConfig(request.genre)
    const applyFinalPolish = request.applyFinalPolish ?? true
    const preservedChoruses = request.preservedChoruses || []
    const hasPreservedChoruses = preservedChoruses.length > 0

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

      // ✅ CORREÇÃO DE SÍLABAS
      const enforcedResult = await this.enforceSyllableLimits(rawLyrics, syllableEnforcement, request.genre)
      console.log(`[MetaComposer-TURBO] Correções de sílabas: ${enforcedResult.corrections} linhas`)

      let finalLyrics = enforcedResult.correctedLyrics
      let polishingApplied = false
      let terceiraViaCorrections = 0

      // ✅ APLICA TERCEIRA VIA SE SOLICITADO
      if (applyTerceiraVia) {
        try {
          const analysis = await this.analyzeForTerceiraVia(finalLyrics, request)
          finalLyrics = await this.applyTerceiraViaCorrections(finalLyrics, request, analysis)
          terceiraViaCorrections = analysis.issues?.length || 0
          console.log(`[MetaComposer-TURBO] ✅ ${terceiraViaCorrections} correções Terceira Via aplicadas`)
        } catch (error) {
          console.warn('[MetaComposer-TURBO] ❌ Erro na Terceira Via, continuando sem correções:', error)
        }
      }

      // ✅ POLIMENTO FINAL COM SISTEMA DE RIMAS
      if (applyFinalPolish && iterations === this.MAX_ITERATIONS) {
        console.log('[MetaComposer-TURBO] Aplicando polimento universal com rimas...')
        finalLyrics = await this.applyUniversalPolish(finalLyrics, request.genre, request.theme, syllableEnforcement)
        polishingApplied = true
      }

      // ✅ AVALIAÇÃO DE QUALIDADE COM RIMAS
      const qualityScore = this.calculateQualityScore(finalLyrics, syllableEnforcement, request.genre)
      console.log(`[MetaComposer-TURBO] Score: ${qualityScore.toFixed(2)}`)

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
            terceiraViaCorrections
          },
        }
      }

      if (qualityScore >= 0.7) break
    }

    if (!bestResult) {
      throw new Error("Falha ao gerar composição")
    }

    console.log(`[MetaComposer-TURBO] 🎵 Composição finalizada! Score: ${bestScore.toFixed(2)}`)
    return bestResult
  }

  // ✅ FUNÇÃO TERCEIRA VIA CORRIGIDA - USANDO IMPORTAÇÕES EXTERNAS
  private static async applyTerceiraViaCorrections(
    lyrics: string,
    request: CompositionRequest,
    analysis: TerceiraViaAnalysis
  ): Promise<string> {
    
    if (!analysis.needsCorrection) {
      return lyrics
    }

    const lines = lyrics.split('\n')
    const correctedLines: string[] = []
    let correctionsApplied = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // ✅ USA A FUNÇÃO IMPORTADA DA TERCEIRA VIA
      if (needsTerceiraViaCorrection(line, analysis)) {
        try {
          // ✅ USA A FUNÇÃO IMPORTADA DA TERCEIRA VIA
          const context = buildLineContext(lines, i, request.theme)
          
          // ✅ USA A FUNÇÃO IMPORTADA DA TERCEIRA VIA
          const correctedLine = await applyTerceiraViaToLine(
            line, 
            i, 
            context, 
            false,
            request.additionalRequirements,
            request.genre
          )
          
          correctedLines.push(correctedLine)
          correctionsApplied++
          
        } catch (error) {
          console.warn(`[TerceiraVia] Erro na linha ${i}, mantendo original:`, error)
          correctedLines.push(line)
        }
      } else {
        correctedLines.push(line)
      }
    }

    console.log(`[MetaComposer-TURBO] ✅ ${correctionsApplied} correções Terceira Via aplicadas`)
    return correctedLines.join('\n')
  }

  // ✅ ANALISE SIMPLIFICADA PARA TERCEIRA VIA
  private static async analyzeForTerceiraVia(lyrics: string, request: CompositionRequest): Promise<TerceiraViaAnalysis> {
    const issues: string[] = []
    const lines = lyrics.split('\n').filter(line => 
      line.trim() && 
      !line.startsWith('[') && 
      !line.startsWith('(') &&
      !line.includes('Instruments:')
    )
    
    // Análise básica de qualidade
    if (lines.length < 8) {
      issues.push("Letra muito curta - menos de 8 linhas significativas")
    }
    
    // Verifica vocabulário limitado
    const wordCount = new Map()
    lines.forEach(line => {
      line.split(/\s+/).forEach(word => {
        const cleanWord = word.toLowerCase().replace(/[.,!?;:]$/g, '')
        if (cleanWord.length > 2) { // Ignora artigos, preposições
          wordCount.set(cleanWord, (wordCount.get(cleanWord) || 0) + 1)
        }
      })
    })
    
    const repeatedWords = Array.from(wordCount.entries())
      .filter(([_, count]) => count > 3)
      .map(([word]) => word)
    
    if (repeatedWords.length > 2) {
      issues.push(`Vocabulário repetitivo: ${repeatedWords.slice(0, 3).join(', ')}`)
    }

    // Verifica estrutura básica
    const hasChorus = lyrics.toLowerCase().includes('[chorus]') || lyrics.toLowerCase().includes('[refrão]')
    if (!hasChorus && lines.length > 12) {
      issues.push("Estrutura incompleta - falta refrão definido")
    }

    return {
      needsCorrection: issues.length > 0,
      issues,
      suggestions: issues.map(issue => `Melhorar: ${issue}`)
    }
  }

  // ... (mantenha TODAS as outras funções do seu código original)
  // getGenreRhymeTarget, analyzeRhymes, applyRhymeEnhancement, etc.

  /**
   * SISTEMA DE APRIMORAMENTO DE RIMAS
   */
  private static async applyRhymeEnhancement(
    lyrics: string, 
    genre: string, 
    theme: string
  ): Promise<string> {
    
    const analysis = this.analyzeRhymes(lyrics, genre)
    const target = this.getGenreRhymeTarget(genre)
    
    console.log(`[RhymeSystem] ${genre}: ${analysis.score}% rimas ricas (alvo: ${target.minScore}%)`)
    
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
    
    if (enhancedLines.length < lines.length) {
      enhancedLines.push(lines[lines.length - 1])
    }
    
    const enhancedLyrics = enhancedLines.join('\n')
    const newAnalysis = this.analyzeRhymes(enhancedLyrics, genre)
    
    console.log(`[RhymeSystem] ✅ Rimas melhoradas: ${analysis.score}% → ${newAnalysis.score}% (${improvements} melhorias)`)
    
    return enhancedLyrics
  }

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
    const word1 = this.getLastWord(line1)
    const word2 = this.getLastWord(line2)
    
    if (!word1 || !word2) return 'none'
    
    if (word1.slice(-3) === word2.slice(-3)) return 'perfeita'
    if (word1.slice(-2) === word2.slice(-2)) return 'rica'
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
    
    if (genreLower.includes('mpb') || genreLower.includes('bossa')) {
      return { 
        minScore: 60,
        preferredTypes: ['perfeita', 'rica'] 
      }
    }
    
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
   * CALCULA SCORE DE QUALIDADE COM RIMAS
   */
  private static calculateQualityScore(
    lyrics: string, 
    syllableTarget: { min: number; max: number; ideal: number },
    genre: string
  ): number {
    
    const lines = lyrics.split('\n').filter(line => 
      line.trim() && !line.startsWith('[') && !line.startsWith('(') && !line.includes('Instruments:')
    )

    if (lines.length === 0) return 0

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

    const rhymeAnalysis = this.analyzeRhymes(lyrics, genre)
    const rhymeTarget = this.getGenreRhymeTarget(genre)
    const rhymeScore = rhymeAnalysis.score >= rhymeTarget.minScore ? 1.0 : rhymeAnalysis.score / rhymeTarget.minScore

    const finalScore = (syllableScore * 0.6) + (idealBonus * 0.1) + (rhymeScore * 0.3)
    
    return Math.min(1, Math.max(0, finalScore))
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
   * EXTRAI ÚLTIMA PALAVRA
   */
  private static getLastWord(line: string): string {
    const words = line.trim().split(/\s+/)
    const lastWord = words[words.length - 1]?.replace(/[.,!?;:]$/g, '') || ''
    return lastWord.toLowerCase()
  }

  /**
   * SUBSTITUIÇÃO DO SyllableEnforcer
   */
  private static async enforceSyllableLimits(
    lyrics: string, 
    syllableTarget: { min: number; max: number; ideal: number },
    genre: string
  ): Promise<{ correctedLyrics: string; corrections: number }> {
    
    const lines = lyrics.split('\n')
    const correctedLines: string[] = []
    let corrections = 0

    for (const line of lines) {
      const trimmed = line.trim()
      
      if (trimmed.startsWith('[') || trimmed.startsWith('(') || trimmed.includes('Instruments:')) {
        correctedLines.push(line)
        continue
      }
      
      if (!trimmed) {
        correctedLines.push(line)
        continue
      }
      
      const syllables = countPoeticSyllables(trimmed)
      if (syllables > syllableTarget.max) {
        try {
          const corrected = await this.quickLineFix(trimmed, genre, syllableTarget)
          correctedLines.push(corrected)
          corrections++
        } catch (error) {
          correctedLines.push(line)
        }
      } else {
        correctedLines.push(line)
      }
    }
    
    return {
      correctedLyrics: correctedLines.join('\n'),
      corrections
    }
  }

  /**
   * POLIMENTO UNIVERSAL COM SISTEMA DE RIMAS
   */
  private static async applyUniversalPolish(
    lyrics: string, 
    genre: string,
    theme: string,
    syllableTarget: { min: number; max: number; ideal: number }
  ): Promise<string> {
    
    console.log(`[MetaComposer-TURBO] Polimento universal para: ${genre}`)
    
    let polishedLyrics = lyrics
    
    polishedLyrics = await this.applyRhymeEnhancement(polishedLyrics, genre, theme)
    
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
    
    return finalLines.join('\n')
  }
}
