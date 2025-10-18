/**
 * META-COMPOSITOR TURBO - SISTEMA OTIMIZADO DE ALTA PERFORMANCE
 * Versão final testada e completa
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
  }
}

export class MetaComposer {
  private static readonly MAX_ITERATIONS = 2

  /**
   * COMPOSIÇÃO TURBO - SISTEMA OTIMIZADO
   */
  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer-TURBO] Iniciando composição...")

    let iterations = 0
    let bestResult: CompositionResult | null = null
    let bestScore = 0

    const syllableEnforcement = request.syllableTarget || { min: 7, max: 11, ideal: 9 }
    const applyFinalPolish = request.applyFinalPolish ?? true
    const preservedChoruses = request.preservedChoruses || []
    const hasPreservedChoruses = preservedChoruses.length > 0

    while (iterations < this.MAX_ITERATIONS) {
      iterations++
      console.log(`[MetaComposer-TURBO] Iteração ${iterations}/${this.MAX_ITERATIONS}`)

      let rawLyrics: string

      if (hasPreservedChoruses && iterations === 1) {
        rawLyrics = await this.generateWithPreservedChoruses(preservedChoruses, request, syllableEnforcement)
      } else {
        rawLyrics = await this.generateDirectLyrics(request, syllableEnforcement)
      }

      const enforcedResult = await SyllableEnforcer.enforceSyllableLimits(rawLyrics, syllableEnforcement, request.genre)
      console.log(`[MetaComposer-TURBO] Correções: ${enforcedResult.corrections} linhas`)

      let finalLyrics = enforcedResult.correctedLyrics
      let polishingApplied = false

      if (applyFinalPolish && iterations === this.MAX_ITERATIONS) {
        console.log('[MetaComposer-TURBO] Aplicando polimento leve...')
        finalLyrics = await this.applyLightPolish(finalLyrics, request.genre, syllableEnforcement)
        polishingApplied = true
      }

      const qualityScore = this.quickQualityAssessment(finalLyrics, syllableEnforcement)
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
            preservedChorusesUsed: hasPreservedChoruses
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
   * GERAÇÃO DIRETA E RÁPIDA
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
   * POLIMENTO LEVE
   */
  private static async applyLightPolish(
    lyrics: string, 
    genre: string,
    syllableTarget: { min: number; max: number; ideal: number }
  ): Promise<string> {
    const lines = lyrics.split('\n')
    const polishedLines: string[] = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      if (line.startsWith('[') || line.startsWith('(') || line.includes('Instruments:') || !line.trim()) {
        polishedLines.push(line)
        continue
      }
      
      const currentSyllables = countPoeticSyllables(line)
      const needsCorrection = currentSyllables < syllableTarget.min || currentSyllables > syllableTarget.max
      
      if (needsCorrection) {
        try {
          const polishedLine = await this.quickLineFix(line, genre, syllableTarget)
          polishedLines.push(polishedLine)
        } catch (error) {
          polishedLines.push(line)
        }
      } else {
        polishedLines.push(line)
      }
    }
    
    return polishedLines.join('\n')
  }

  /**
   * CORREÇÃO RÁPIDA DE LINHA
   */
  private static async quickLineFix(
    line: string, 
    genre: string,
    syllableTarget: { min: number; max: number; ideal: number }
  ): Promise<string> {
    const prompt = `CORREÇÃO RÁPIDA - ${genre.toUpperCase()}

LINHA: "${line}"
SÍLABAS ATUAIS: ${countPoeticSyllables(line)} (ALVO: ${syllableTarget.min}-${syllableTarget.max})

REESCREVA PARA AJUSTAR AS SÍLABAS MANTENDO O SIGNIFICADO:

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
   * AVALIAÇÃO RÁPIDA DE QUALIDADE
   */
  private static quickQualityAssessment(
    lyrics: string, 
    syllableTarget: { min: number; max: number; ideal: number }
  ): number {
    const lines = lyrics.split('\n').filter(line => 
      line.trim() && !line.startsWith('[') && !line.startsWith('(') && !line.includes('Instruments:')
    )

    if (lines.length === 0) return 0

    let correctSyllables = 0
    lines.forEach(line => {
      const syllables = countPoeticSyllables(line)
      if (syllables >= syllableTarget.min && syllables <= syllableTarget.max) {
        correctSyllables++
      }
    })

    const syllableScore = correctSyllables / lines.length
    
    let structureBonus = 0
    if (lyrics.includes('[VERSE') || lyrics.includes('[VERSO')) structureBonus += 0.1
    if (lyrics.includes('[CHORUS') || lyrics.includes('[REFRÃO')) structureBonus += 0.1

    return Math.min(1, (syllableScore * 0.9) + (structureBonus * 0.1))
  }

  /**
   * EXTRAI TÍTULO
   */
  private static extractTitle(lyrics: string, request: CompositionRequest): string {
    if (request.theme) return request.theme

    const chorusMatch = lyrics.match(/\[(?:CHORUS|REFRÃO)[^\]]*\]\s*\n([^\n]+)/i)
    if (chorusMatch?.[1]) {
      return chorusMatch[1].trim().split(' ').slice(0, 3).join(' ')
    }

    return "Composição Musical"
  }
}
