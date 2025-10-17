/**
 * META-COMPOSITOR INTELIGENTE - SISTEMA AUTÔNOMO DE COMPOSIÇÃO HARMONIZADO
 * Versão final com polimento inteligente - TIPOS CORRIGIDOS
 */

import { generateText } from "ai"
import { getGenreConfig } from "@/lib/genre-config"
import { validateFullLyricAgainstForcing } from "@/lib/validation/anti-forcing-validator"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter"
import { SyllableEnforcer } from "@/lib/validation/syllableEnforcer"
import { ThirdWayEngine } from "@/lib/third-way-converter"

// ... (interfaces CompositionRequest e CompositionResult permanecem iguais)

export class MetaComposer {
  // ... (constantes e métodos principais permanecem iguais até o final)

  /**
   * VALIDAÇÃO COMPREENSIVA HARMONIZADA - VERSÃO CORRIGIDA
   */
  private static async comprehensiveValidation(
    lyrics: string,
    request: CompositionRequest,
    syllableTarget: { min: number; max: number; ideal: number },
    terceiraViaAnalysis?: any
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
    terceiraViaScore?: number
    rhymePreservation?: number
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    const genreConfig = getGenreConfig(request.genre)
    const lines = lyrics.split('\n').filter((line) => 
      line.trim() && !line.startsWith('[') && !line.startsWith('(') && !line.includes('Instrumentos:') && !line.includes('BPM:')
    )

    // ✅ ANÁLISE DE SÍLABAS
    const syllableStats = this.calculateSyllableStatistics(lines, syllableTarget)
    
    if (syllableStats.linesWithinLimit < syllableStats.totalLines) {
      const problemLines = lines.filter(line => {
        const syllables = countPoeticSyllables(line)
        return syllables < syllableTarget.min || syllables > syllableTarget.max
      }).slice(0, 3)
      
      errors.push(
        `${syllableStats.totalLines - syllableStats.linesWithinLimit} versos fora do limite de ${syllableTarget.min}-${syllableTarget.max} sílabas`,
        ...problemLines.map((line: string) => `- "${line}" (${countPoeticSyllables(line)} sílabas)`)
      )
    }

    // ✅ VALIDAÇÃO ANTI-FORCING
    const forcingValidation = validateFullLyricAgainstForcing(lyrics, request.genre)
    if (!forcingValidation.isValid) {
      warnings.push(...forcingValidation.warnings)
    }

    // ✅ VALIDAÇÃO DE PALAVRAS PROIBIDAS
    const forbidden = genreConfig.language_rules?.forbidden
      ? Object.values(genreConfig.language_rules.forbidden).flat()
      : []
    const lyricsLower = lyrics.toLowerCase()
    forbidden.forEach((word: string) => {
      if (lyricsLower.includes(word.toLowerCase())) {
        errors.push(`Palavra proibida encontrada: "${word}"`)
      }
    })

    // ✅ VALIDAÇÃO DE REFRÕES (3 linhas são proibidas)
    const chorusMatches = lyrics.match(/\[(?:CHORUS|REFRÃO)[^\]]*\]\s*\n((?:[^\n]+\n?)+?)(?=\[|$)/gi)
    if (chorusMatches) {
      chorusMatches.forEach((chorus: string, index: number) => {
        const chorusLines = chorus
          .split("\n")
          .filter((line: string) => line.trim() && !line.startsWith("["))
          .filter((line: string) => !line.startsWith("("))
        if (chorusLines.length === 3) {
          errors.push(`Refrão ${index + 1}: 3 linhas é PROIBIDO (use 2 ou 4)`)
        }
      })
    }

    // ✅ ANÁLISE DE EMPILHAMENTO
    const stackingRatio = this.calculateStackingRatio(lyrics)
    if (stackingRatio < 0.3) {
      warnings.push(`Baixo empilhamento de versos (${(stackingRatio * 100).toFixed(0)}%) - formatação pouco natural`)
    } else if (stackingRatio > 0.7) {
      warnings.push(`Alto empilhamento (${(stackingRatio * 100).toFixed(0)}%) - pode dificultar contagem de sílabas`)
    }

    // ✅ SCORE TERCEIRA VIA
    let terceiraViaScore = undefined
    if (terceiraViaAnalysis) {
      terceiraViaScore = terceiraViaAnalysis.score_geral
      if (terceiraViaScore < 70) {
        warnings.push(`Score Terceira Via baixo: ${terceiraViaScore}/100 - considere mais originalidade`)
      }
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
      syllableStats,
      terceiraViaScore,
      rhymePreservation: this.calculateRhymePreservation(lyrics)
    }
  }

  /**
   * SCORE DE QUALIDADE HARMONIZADO - VERSÃO CORRIGIDA
   */
  private static calculateHarmonizedQualityScore(
    lyrics: string,
    validation: any,
    request: CompositionRequest,
    syllableTarget: { min: number; max: number; ideal: number },
    terceiraViaAnalysis: any,
    correctionCount: number
  ): number {
    let score = 1.0

    // ✅ PESO FORTE: Sílabas corretas (40%)
    const syllableRatio = validation.syllableStats.linesWithinLimit / validation.syllableStats.totalLines
    score = score * 0.6 + (syllableRatio * 0.4)

    // ✅ PESO MÉDIO: Terceira Via (25%)
    if (terceiraViaAnalysis) {
      const terceiraViaScore = terceiraViaAnalysis.score_geral / 100
      score = score * 0.75 + (terceiraViaScore * 0.25)
    }

    // ✅ PESO MÉDIO: Estrutura e coerência (20%)
    const coherenceScore = this.assessNarrativeCoherence(lyrics)
    score = score * 0.8 + (coherenceScore * 0.2)

    // ✅ PESO LEVE: Empilhamento balanceado (10%)
    const stackingRatio = this.calculateStackingRatio(lyrics)
    const stackingScore = (stackingRatio >= 0.3 && stackingRatio <= 0.7) ? 1.0 : 0.5
    score = score * 0.9 + (stackingScore * 0.1)

    // ✅ PENALIDADES
    score -= validation.errors.length * 0.15
    score -= validation.warnings.length * 0.05
    score -= Math.min(correctionCount * 0.02, 0.1)

    // ✅ BÔNUS: Linguagem simples e natural
    const simplicityScore = this.assessLanguageSimplicity(lyrics)
    score += simplicityScore * 0.05

    return Math.max(0, Math.min(1, score))
  }

  /**
   * REFINAMENTO AUTÔNOMO INTELIGENTE - VERSÃO CORRIGIDA
   */
  private static async autonomousRefinement(
    request: CompositionRequest,
    validation: { passed: boolean; errors: string[]; warnings: string[] },
    syllableTarget: { min: number; max: number; ideal: number },
    terceiraViaAnalysis?: any
  ): Promise<CompositionRequest> {
    
    const refinementInstructions = [
      ...validation.errors.map((error: string) => `CORRIGIR: ${error}`),
      ...validation.warnings.map((warning: string) => `MELHORAR: ${warning}`),
      `GARANTIR: ${syllableTarget.min}-${syllableTarget.max} sílabas por verso (alvo: ${syllableTarget.ideal})`,
      `USAR: contrações "cê", "tô", "pra", "tá" e elisões "d'amor", "qu'eu"`,
    ]

    // ✅ ADICIONA INSTRUÇÕES DA TERCEIRA VIA SE SCORE BAIXO
    if (terceiraViaAnalysis && terceiraViaAnalysis.score_geral < 70) {
      refinementInstructions.push(
        `TERCEIRA VIA: Evitar clichês, usar imagens concretas, mostrar vulnerabilidade genuína`
      )
      if (terceiraViaAnalysis.pontos_fracos && terceiraViaAnalysis.pontos_fracos.length > 0) {
        refinementInstructions.push(
          `TERCEIRA VIA: Foco em ${terceiraViaAnalysis.pontos_fracos.slice(0, 2).join(', ')}`
        )
      }
    }

    return {
      ...request,
      additionalRequirements: request.additionalRequirements
        ? `${request.additionalRequirements}\n\nREFINAMENTOS NECESSÁRIOS:\n${refinementInstructions.join('\n')}`
        : `REFINAMENTOS NECESSÁRIOS:\n${refinementInstructions.join('\n')}`,
    }
  }

  /**
   * ANÁLISE DE PRESERVAÇÃO DE RIMAS - VERSÃO CORRIGIDA
   */
  private static analyzeRhymePreservation(originalLyrics: string, correctedLyrics: string): any {
    const originalRhymes = this.extractRhymes(originalLyrics)
    const correctedRhymes = this.extractRhymes(correctedLyrics)
    
    let preservedCount = 0
    const minLength = Math.min(originalRhymes.length, correctedRhymes.length)
    
    for (let i = 0; i < minLength; i++) {
      if (correctedRhymes[i] === originalRhymes[i]) {
        preservedCount++
      }
    }

    const preservationRate = originalRhymes.length > 0 
      ? (preservedCount / originalRhymes.length) * 100 
      : 100

    return {
      originalRhymeCount: originalRhymes.length,
      correctedRhymeCount: correctedRhymes.length,
      preservedCount,
      preservationRate: Math.round(preservationRate)
    }
  }

  /**
   * EXTRAI RIMAS DA LETRA - VERSÃO CORRIGIDA
   */
  private static extractRhymes(lyrics: string): string[] {
    const lines = lyrics.split('\n')
      .filter(line => line.trim() && !line.startsWith('[') && !line.startsWith('(') && !line.includes('Instrumentos:') && !line.includes('BPM:'))
    
    return lines.map(line => {
      const words = line.trim().split(/\s+/)
      const lastWord = words[words.length - 1]?.toLowerCase().replace(/[.,!?;:]$/g, '') || ''
      return lastWord.slice(-2)
    }).filter(rhyme => rhyme.length > 0)
  }

  /**
   * CALCULA TAXA DE PRESERVAÇÃO DE RIMAS - VERSÃO CORRIGIDA
   */
  private static calculateRhymePreservation(lyrics: string): number {
    const rhymes = this.extractRhymes(lyrics)
    if (rhymes.length < 2) return 100

    let consistentRhymes = 0
    for (let i = 0; i < rhymes.length - 1; i += 2) {
      if (rhymes[i] === rhymes[i + 1]) {
        consistentRhymes++
      }
    }

    return Math.round((consistentRhymes / Math.floor(rhymes.length / 2)) * 100)
  }

  // 🔧 MÉTODOS AUXILIARES - VERSÕES CORRIGIDAS

  private static calculateSyllableStatistics(
    lines: string[], 
    syllableTarget: { min: number; max: number; ideal: number }
  ) {
    let totalSyllables = 0
    let linesWithinLimit = 0
    let maxSyllablesFound = 0

    lines.forEach(line => {
      const syllables = countPoeticSyllables(line)
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

  private static extractTitle(lyrics: string, request: CompositionRequest): string {
    if (request.title) return request.title

    const chorusMatch = lyrics.match(/\[(?:CHORUS|REFRÃO)[^\]]*\]\s*\n([^\n]+)/i)
    if (chorusMatch?.[1]) {
      return chorusMatch[1].trim().split(" ").slice(0, 4).join(" ")
    }

    return request.theme.split(" ").slice(0, 3).join(" ")
  }

  private static getCreativityTemperature(creativity?: string): number {
    switch (creativity) {
      case "conservador": return 0.5
      case "ousado": return 0.9
      default: return 0.7
    }
  }

  private static calculateStackingRatio(lyrics: string): number {
    const lines = lyrics.split("\n").filter((line) => 
      line.trim() && !line.startsWith("[") && !line.startsWith("(") && !line.includes('Instrumentos:') && !line.includes('BPM:')
    )
    
    let stackedPairs = 0
    let totalPossiblePairs = Math.max(0, lines.length - 1)
    
    for (let i = 0; i < lines.length - 1; i++) {
      const currentLine = lines[i]
      const nextLine = lines[i + 1]
      
      if (this.shouldLinesStack(currentLine, nextLine)) {
        stackedPairs++
      }
    }
    
    return totalPossiblePairs > 0 ? stackedPairs / totalPossiblePairs : 0
  }

  private static shouldLinesStack(line1: string, line2: string): boolean {
    const l1 = line1.toLowerCase().trim()
    const l2 = line2.toLowerCase().trim()
    
    if ((l1.includes('?') && !l2.includes('?')) || (l2.includes('?') && !l1.includes('?'))) return true
    
    const connectors = ['e', 'mas', 'porém', 'então', 'quando', 'onde', 'que', 'pra']
    if (connectors.some(connector => l2.startsWith(connector))) return true
    
    if (l1.endsWith(',') || l1.endsWith(';') || l2.startsWith('—') || l2.startsWith('-')) return true
    
    return false
  }

  private static assessNarrativeCoherence(lyrics: string): number {
    const hasIntro = /\[INTRO\]/i.test(lyrics)
    const hasVerse = /\[VERS[OE]/i.test(lyrics)
    const hasChorus = /\[(?:CHORUS|REFRÃO)\]/i.test(lyrics)
    const hasBridge = /\[BRIDGE\]/i.test(lyrics)
    const hasOutro = /\[OUTRO\]/i.test(lyrics)

    let score = 0
    if (hasIntro) score += 0.2
    if (hasVerse) score += 0.2
    if (hasChorus) score += 0.2
    if (hasBridge) score += 0.2
    if (hasOutro) score += 0.2

    return score
  }

  private static assessLanguageSimplicity(lyrics: string): number {
    const complexWords = ["outono", "primavera", "florescer", "bonanca", "alvorada", "crepusculo", "efemero", "sublime"]
    const lyricsLower = lyrics.toLowerCase()
    const complexCount = complexWords.filter((word: string) => lyricsLower.includes(word)).length

    return Math.max(0, 1 - complexCount * 0.1)
  }
}
