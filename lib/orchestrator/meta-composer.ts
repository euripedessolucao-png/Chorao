/**
 * META-COMPOSITOR TURBO - SISTEMA OTIMIZADO DE ALTA PERFORMANCE
 * Versão corrigida - sem maxTokens
 */

import { generateText } from "ai"
import { getGenreConfig } from "@/lib/genre-config"
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
  private static readonly ENABLE_AUTO_REFINEMENT = false

  /**
   * COMPOSIÇÃO TURBO - SISTEMA OTIMIZADO
   */
  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer-TURBO] Iniciando composição otimizada...")

    let iterations = 0
    let bestResult: CompositionResult | null = null
    let bestScore = 0

    const syllableEnforcement = request.syllableTarget || { min: 7, max: 11, ideal: 9 }
    const applyFinalPolish = request.applyFinalPolish ?? true

    const preservedChoruses = request.preservedChoruses || []
    const hasPreservedChoruses = preservedChoruses.length > 0
    
    if (hasPreservedChoruses) {
      console.log(`[MetaComposer-TURBO] 🎯 Modo preservação: ${preservedChoruses.length} refrões`)
    }

    while (iterations < this.MAX_ITERATIONS) {
      iterations++
      console.log(`[MetaComposer-TURBO] Iteração ${iterations}/${this.MAX_ITERATIONS}`)

      let rawLyrics: string

      if (hasPreservedChoruses && iterations === 1) {
        rawLyrics = await this.generateWithPreservedChoruses(
          preservedChoruses,
          request,
          syllableEnforcement
        )
      } else {
        rawLyrics = await this.generateDirectLyrics(request, syllableEnforcement)
      }

      const enforcedResult = await SyllableEnforcer.enforceSyllableLimits(
        rawLyrics, 
        syllableEnforcement, 
        request.genre
      )

      console.log(`[MetaComposer-TURBO] Correções: ${enforcedResult.corrections} linhas`)

      let finalLyrics = enforcedResult.correctedLyrics
      let polishingApplied = false
      
      if (applyFinalPolish && iterations === this.MAX_ITERATIONS) {
        console.log('[MetaComposer-TURBO] Aplicando polimento leve...')
        finalLyrics = await this.applyLightPolish(finalLyrics, request.genre, syllableEnforcement)
        polishingApplied = true
      }

      const qualityScore = await this.quickQualityAssessment(finalLyrics, syllableEnforcement)
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

      if (qualityScore >= 0.7) {
        console.log("[MetaComposer-TURBO] ✅ Qualidade boa atingida!")
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
   * GERAÇÃO DIRETA E RÁPIDA
   */
  private static async generateDirectLyrics(
    request: CompositionRequest, 
    enforcement: { min: number; max: number; ideal: number }
  ): Promise<string> {

    const prompt = `COMPOSIÇÃO MUSICAL RÁPIDA - ${request.genre.toUpperCase()}

TEMA: ${request.theme}
HUMOR: ${request.mood}
SÍLABAS: ${enforcement.min}-${enforcement.max} por linha
CONTRAÇÕES: "cê", "tô", "pra", "tá"

${request.additionalRequirements ? `REQUISITOS:\n${request.additionalRequirements}\n` : ''}

FORMATO SIMPLES:
[INTRO]
• Versos introdutórios

[VERSE 1]
• Desenvolve o tema

[CHORUS]
• Refrão principal

[VERSE 2]
• Continua desenvolvimento

[CHORUS]
• Refrão repetido

[OUTRO]
• Encerramento

RETORNE APENAS A LETRA:`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.7
      // ✅ REMOVIDO: maxTokens: 1500
    })

    return text.trim()
  }

  /**
   * GERAÇÃO COM REFRÕES PRESERVADOS (OTIMIZADO)
   */
  private static async generateWithPreservedChoruses(
    preservedChoruses: string[],
    request: CompositionRequest,
    syllableEnforcement: { min: number; max: number; ideal: number }
  ): Promise<string> {
    
    console.log('[MetaComposer-TURBO] Gerando com refrões preservados...')
    
    const chorusesToUse = preservedChoruses.slice(0, 2)
    
    const prompt = `COMPOSIÇÃO COM REFRÕES PRESERVADOS - ${request.genre.toUpperCase()}

REFRÃOS PARA USAR:
${chorusesToUse.map((chorus, i) => `REFRÃO ${i+1}:\n${chorus}`).join('\n\n')}

TEMA: ${request.theme}
HUMOR: ${request.mood}
SÍLABAS: ${syllableEnforcement.min}-${syllableEnforcement.max} por linha

CRIE UMA MÚSICA QUE:
• Use naturalmente os refrões acima
• Mantenha coerência com o tema
• Respeite limite de sílabas
• Use linguagem do ${request.genre}

ESTRUTURA SIMPLES:
[INTRO] → [VERSE 1] → [CHORUS 1] → [VERSE 2] → [CHORUS 2] → [OUTRO]

RETORNE APENAS A LETRA:`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.4
      // ✅ REMOVIDO: maxTokens: 2000
    })

    return text.trim()
  }

  /**
   * POLIMENTO LEVE E RÁPIDO
   */
  private static async applyLightPolish(
    lyrics: string, 
    genre: string,
    syllableTarget: { min: number; max: number; ideal: number }
  ): Promise<string> {
    
    console.log(`[MetaComposer-TURBO] Polimento leve para: ${genre}`)
    
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
    
    const currentSyllables = countPoeticSyllables(line)
    
    const prompt = `CORREÇÃO RÁPIDA - ${genre.toUpperCase()}

LINHA: "${line}"
PROBLEMA: ${currentSyllables} sílabas (deve ter ${syllableTarget.min}-${syllableTarget.max})

REESCREVA RAPIDAMENTE PARA ${syllableTarget.ideal} SÍLABAS, MANTENDO SIGNIFICADO.

LINHA CORRIGIDA:`

    try {
      const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt,
        temperature: 0.3
        // ✅ REMOVIDO: maxTokens: 100
      })

      const correctedLine = text.trim()
      const correctedSyllables = countPoeticSyllables(correctedLine)
      
      // ✅ VERIFICA SE A CORREÇÃO MELHOROU
      if (correctedSyllables >= syllableTarget.min && correctedSyllables <= syllableTarget.max) {
        return correctedLine
      }
    } catch (error) {
      console.error(`[MetaComposer-TURBO] Erro na correção: ${error}`)
    }
    
    return line // Fallback para original
  }

  /**
   * AVALIAÇÃO RÁPIDA DE QUALIDADE
   */
  private static async quickQualityAssessment(
    lyrics: string, 
    syllableTarget: { min: number; max: number; ideal: number }
  ): Promise<number> {
    
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
    
    // ✅ BÔNUS POR PROXIMIDADE DO IDEAL
    const idealBonus = 1 - Math.abs(averageSyllables - syllableTarget.ideal) / 10
    
    // ✅ BÔNUS POR ESTRUTURA
    let structureBonus = 0
    if (lyrics.includes('[VERSE') || lyrics.includes('[VERSO')) structureBonus += 0.1
    if (lyrics.includes('[CHORUS') || lyrics.includes('[REFRÃO')) structureBonus += 0.1
    if (lyrics.includes('[BRIDGE') || lyrics.includes('[PONTE')) structureBonus += 0.05
    if (lyrics.includes('[OUTRO')) structureBonus += 0.05

    const finalScore = (syllableScore * 0.7) + (idealBonus * 0.2) + (structureBonus * 0.1)
    
    return Math.min(1, Math.max(0, finalScore))
  }

  /**
   * EXTRAI TÍTULO DA LETRA
   */
  private static extractTitle(lyrics: string, request: CompositionRequest): string {
    if (request.theme) return request.theme

    // Tenta extrair do primeiro verso do refrão
    const chorusMatch = lyrics.match(/\[(?:CHORUS|REFRÃO)[^\]]*\]\s*\n([^\n]+)/i)
    if (chorusMatch?.[1]) {
      const firstChorusLine = chorusMatch[1].trim()
      return firstChorusLine.split(' ').slice(0, 3).join(' ')
    }

    // Tenta extrair de qualquer linha significativa
    const lines = lyrics.split('\n').filter(line => 
      line.trim() && !line.startsWith('[') && !line.startsWith('(') && line.length > 10
    )
    
    if (lines.length > 0) {
      const firstMeaningfulLine = lines[0].trim()
      return firstMeaningfulLine.split(' ').slice(0, 3).join(' ')
    }

    return "Composição Musical"
  }

  /**
   * CONFIGURAÇÃO RÁPIDA POR GÊNERO
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
}
