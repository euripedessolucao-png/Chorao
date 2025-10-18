/**
 * META-COMPOSITOR TURBO DEFINITIVO - VERSÃO COMPLETA
 * Sistema completo com rimas ricas e preservação exata de refrões
 */

import { generateText } from "ai"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter"
import { SyllableEnforcer } from "@/lib/validation/syllableEnforcer"

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
    chorusPreservation?: { allPreserved: boolean; details: string[] }
  }
}

export class MetaComposer {
  private static readonly MAX_ITERATIONS = 2

  /**
   * EXTRAI REFRÕES DOS REQUISITOS ADICIONAIS
   * Detecta hooks/refrões no formato do gerador automático
   */
  private static extractChorusesFromRequirements(additionalRequirements?: string): string[] {
    if (!additionalRequirements) return []
    
    console.log('[MetaComposer] Analisando requisitos adicionais por refrões...')
    
    const choruses: string[] = []
    
    // ✅ PADRÃO 1: Refrões no formato "linha1 / linha2"
    const chorusPattern = /(?:\d+\.\s*)?([^\.\n]+(?:\s*\/\s*[^\.\n]+)+)/g
    const matches = additionalRequirements.matchAll(chorusPattern)
    
    for (const match of matches) {
      const chorusText = match[1].trim()
      // Verifica se parece um refrão (tem pelo menos 2 versos separados por /)
      if (chorusText.includes('/') && chorusText.split('/').length >= 2) {
        choruses.push(chorusText)
        console.log(`[MetaComposer] Refrão encontrado: ${chorusText.substring(0, 50)}...`)
      }
    }
    
    // ✅ PADRÃO 2: Texto explícito entre marcadores
    if (choruses.length === 0) {
      const explicitMatch = additionalRequirements.match(/REFR.AO[^:]*:\s*([^•]+(?:\s*•[^•]+)*)/gi)
      if (explicitMatch) {
        explicitMatch.forEach(match => {
          const lines = match.split('\n')
            .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
            .filter(line => line && !line.match(/REFR.AO|linhas/i))
          
          if (lines.length >= 2) {
            choruses.push(lines.join(' / '))
          }
        })
      }
    }
    
    console.log(`[MetaComposer] Total de refrões extraídos: ${choruses.length}`)
    return choruses
  }

  /**
   * COMPOSIÇÃO TURBO DEFINITIVA - COM SISTEMA DE RIMAS E PRESERVAÇÃO DE REFRÕES
   */
  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer-TURBO] Iniciando composição com sistema de rimas...")

    let iterations = 0
    let bestResult: CompositionResult | null = null
    let bestScore = 0

    const syllableEnforcement = request.syllableTarget || this.getGenreSyllableConfig(request.genre)
    const applyFinalPolish = request.applyFinalPolish ?? true

    // ✅ CORREÇÃO CRÍTICA: EXTRAI REFRÕES DOS REQUISITOS ADICIONAIS
    const extractedChoruses = this.extractChorusesFromRequirements(request.additionalRequirements)
    const allPreservedChoruses = [...(request.preservedChoruses || []), ...extractedChoruses]
    
    const hasPreservedChoruses = allPreservedChoruses.length > 0
    console.log(`[MetaComposer] Refrões totais para preservar: ${allPreservedChoruses.length} (${extractedChoruses.length} dos requisitos)`)

    while (iterations < this.MAX_ITERATIONS) {
      iterations++
      console.log(`[MetaComposer-TURBO] Iteração ${iterations}/${this.MAX_ITERATIONS}`)

      let rawLyrics: string

      // ✅ USA allPreservedChoruses EM VEZ DE request.preservedChoruses
      if (hasPreservedChoruses && iterations === 1) {
        rawLyrics = await this.generateWithPreservedChoruses(allPreservedChoruses, request, syllableEnforcement)
      } else {
        rawLyrics = await this.generateDirectLyrics(request, syllableEnforcement)
      }

      // ✅ CORREÇÃO DE SÍLABAS
      const enforcedResult = await SyllableEnforcer.enforceSyllableLimits(rawLyrics, syllableEnforcement, request.genre)
      console.log(`[MetaComposer-TURBO] Correções de sílabas: ${enforcedResult.corrections} linhas`)

      let finalLyrics = enforcedResult.correctedLyrics
      let polishingApplied = false

      // ✅ POLIMENTO FINAL COM SISTEMA DE RIMAS
      if (applyFinalPolish && iterations === this.MAX_ITERATIONS) {
        console.log('[MetaComposer-TURBO] Aplicando polimento universal com rimas...')
        finalLyrics = await this.applyUniversalPolish(finalLyrics, request.genre, request.theme, syllableEnforcement)
        polishingApplied = true
      }

      // ✅ VALIDA PRESERVAÇÃO DE REFRÕES
      let chorusPreservation = { allPreserved: true, details: [] as string[] }
      if (hasPreservedChoruses) {
        const chorusFormats = allPreservedChoruses.map(chorus => {
          const lines = chorus.split('/').map(line => line.trim()).filter(line => line)
          return { chorus, lineCount: lines.length, lines }
        })
        chorusPreservation = this.validateChorusPreservation(finalLyrics, chorusFormats)
        console.log(`[MetaComposer-TURBO] Preservação de refrões:`, chorusPreservation)
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
            chorusPreservation
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

  /**
   * GERAÇÃO COM PRESERVAÇÃO EXATA DE REFRÕES - VERSÃO CORRIGIDA
   */
  private static async generateWithPreservedChoruses(
    preservedChoruses: string[],
    request: CompositionRequest,
    syllableEnforcement: { min: number; max: number; ideal: number }
  ): Promise<string> {
    
    console.log('[MetaComposer] Gerando com refrões preservados...')
    
    const chorusesToUse = preservedChoruses.slice(0, 2)
    
    // ✅ ANALISA O FORMATO DOS REFRÕES SELECIONADOS
    const chorusFormats = chorusesToUse.map(chorus => {
      const lines = chorus.split('/').map(line => line.trim()).filter(line => line)
      return {
        chorus,
        lineCount: lines.length,
        lines: lines
      }
    })
    
    console.log(`[MetaComposer] Formatos dos refrões:`, chorusFormats.map(c => `${c.lineCount} linhas`))

    const prompt = `COMPOSIÇÃO COM REFRÕES PRESERVADOS - ${request.genre.toUpperCase()}

REFRÃOS SELECIONADOS (USE EXATAMENTE ESTES):
${chorusFormats.map((c, i) => `REFRÃO ${i+1} (${c.lineCount} linhas):\n${c.lines.map(line => `• ${line}`).join('\n')}`).join('\n\n')}

TEMA: ${request.theme}
HUMOR: ${request.mood}
GÊNERO: ${request.genre}
SÍLABAS: ${syllableEnforcement.min}-${syllableEnforcement.max} por linha

INSTRUÇÕES CRÍTICAS:
1. USE OS REFRÕES ACIMA EXATAMENTE COMO ESTÃO - não altere palavras, ordem ou número de linhas
2. Cada refrão deve aparecer PELO MENOS 2 vezes na música
3. Prepare versos que levem naturalmente para cada refrão
4. Mantenha coerência temática com "${request.theme}"
5. Use linguagem autêntica do ${request.genre}
6. Use contrações: "cê", "tô", "pra", "tá"

ESTRUTURA SUGERIDA:
[INTRO]
• Versos introdutórios

[VERSE 1] 
• Versos que preparam para o PRIMEIRO refrão

[CHORUS 1]
• PRIMEIRO REFRÃO SELECIONADO (exatamente como está acima)

[VERSE 2]
• Versos que desenvolvem e preparam para o próximo refrão

[CHORUS 2] 
• SEGUNDO REFRÃO SELECIONADO ou repetição do primeiro

[BRIDGE] (opcional)
• Desenvolvimento adicional

[CHORUS 3]
• Refrão final (pode repetir um dos selecionados)

[OUTRO]
• Encerramento

IMPORTANTE: 
- NÃO ALTERE os refrões selecionados
- NÃO ADICIONE linhas extras aos refrões  
- NÃO REMOVA linhas dos refrões
- USE OS REFRÕES EXATAMENTE COMO FORAM FORNECIDOS

RETORNE APENAS A LETRA COMPLETA:`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.3, // ✅ Temperatura baixa para seguir instruções rigorosamente
    })

    const lyrics = text.trim()
    
    // ✅ VALIDA SE OS REFRÕES FORAM PRESERVADOS
    const preservationReport = this.validateChorusPreservation(lyrics, chorusFormats)
    console.log(`[MetaComposer] Preservação de refrões:`, preservationReport)
    
    if (!preservationReport.allPreserved) {
      console.warn(`[MetaComposer] ⚠️ Alguns refrões não foram preservados corretamente`)
    }
    
    return lyrics
  }

  /**
   * VALIDA SE OS REFRÕES FORAM PRESERVADOS CORRETAMENTE
   */
  private static validateChorusPreservation(
    lyrics: string, 
    chorusFormats: { chorus: string; lineCount: number; lines: string[] }[]
  ): { allPreserved: boolean; details: string[] } {
    
    const details: string[] = []
    let allPreserved = true
    
    for (const chorusFormat of chorusFormats) {
      const { lines } = chorusFormat
      
      // Verifica se cada linha do refrão aparece na letra
      let foundCount = 0
      for (const line of lines) {
        if (lyrics.includes(line)) {
          foundCount++
        }
      }
      
      const isPreserved = foundCount === lines.length
      if (!isPreserved) {
        allPreserved = false
        details.push(`Refrão com ${lines.length} linhas: ${foundCount}/${lines.length} linhas preservadas`)
      } else {
        details.push(`✅ Refrão com ${lines.length} linhas: totalmente preservado`)
      }
    }
    
    return { allPreserved, details }
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
    
    // ✅ ETAPA 1: CORREÇÃO DE RIMAS
    polishedLyrics = await this.applyRhymeEnhancement(polishedLyrics, genre, theme)
    
    // ✅ ETAPA 2: CORREÇÃO DE SÍLABAS
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
   * METAS DE RIMA POR GÊNERO - SEU OBJETIVO PRINCIPAL!
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

    // ✅ SCORE DE SÍLABAS (70%)
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

    // ✅ SCORE DE RIMAS (30%)
    const rhymeAnalysis = this.analyzeRhymes(lyrics, genre)
    const rhymeTarget = this.getGenreRhymeTarget(genre)
    const rhymeScore = rhymeAnalysis.score >= rhymeTarget.minScore ? 1.0 : rhymeAnalysis.score / rhymeTarget.minScore

    // ✅ SCORE FINAL
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
}
