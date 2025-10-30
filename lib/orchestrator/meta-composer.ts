// lib/orchestrator/meta-composer.ts - VERSÃO SUPER SIMPLIFICADA

import { generateText } from "ai"
import { UnifiedSyllableManager } from "@/lib/syllable-management/unified-syllable-manager"
import { formatSertanejoPerformance } from "@/lib/formatters/sertanejo-performance-formatter"
import { PunctuationValidator } from "@/lib/validation/punctuation-validator"
import { LineStacker } from "@/lib/utils/line-stacker"
import { LyricsAuditor } from "@/lib/validation/lyrics-auditor"

export interface CompositionRequest {
  genre: string
  theme: string
  mood: string
  additionalRequirements?: string
  creativity?: "conservador" | "equilibrado" | "ousado"
  applyFinalPolish?: boolean
  originalLyrics?: string
  performanceMode?: "standard" | "performance"
}

export interface CompositionResult {
  lyrics: string
  title: string
  metadata: {
    finalScore: number
    polishingApplied: boolean
    performanceMode: string
    modelUsed: string
  }
}

/**
 * 🎵 META-COMPOSER SUPER SIMPLES
 */
export class MetaComposer {
  private static readonly MODEL = "openai/gpt-4o-mini"

  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer] Iniciando...")

    try {
      // 1. GERAÇÃO
      let lyrics = request.originalLyrics 
        ? await this.rewriteLyrics(request) 
        : await this.generateLyrics(request)

      // 2. CORREÇÃO DE SÍLABAS
      lyrics = await UnifiedSyllableManager.processSongWithBalance(lyrics)

      // 3. POLIMENTO
      if (request.applyFinalPolish !== false) {
        lyrics = await this.applyPolish(lyrics, request)
      }

      // 4. SCORE
      const audit = LyricsAuditor.audit(lyrics, request.genre, request.theme)
      const finalScore = Math.min(100, Math.max(0, audit.score))

      return {
        lyrics,
        title: this.extractTitle(lyrics, request),
        metadata: {
          finalScore,
          polishingApplied: request.applyFinalPolish !== false,
          performanceMode: request.performanceMode || "standard",
          modelUsed: this.MODEL,
        },
      }

    } catch (error) {
      console.error("[MetaComposer] Erro:", error)
      return this.fallbackResult(request)
    }
  }

  private static async generateLyrics(request: CompositionRequest): Promise<string> {
    const prompt = `Componha uma música ${request.genre} sobre ${request.theme}.

Estrutura:
[Intro]
[Verso 1]
[Refrão] 
[Verso 2]
[Refrão]
[Ponte]
[Refrão]
[Outro]

Máximo 12 sílabas por verso. Linguagem brasileira natural.

Letra:`

    const { text } = await generateText({
      model: this.MODEL,
      prompt,
      temperature: request.creativity === "ousado" ? 0.8 : 0.6,
    })

    return text || "Música em desenvolvimento."
  }

  private static async rewriteLyrics(request: CompositionRequest): Promise<string> {
    if (!request.originalLyrics) return "Letra original necessária."

    const prompt = `Reescreva esta letra no estilo ${request.genre}:

${request.originalLyrics}

Mantenha máximo 12 sílabas por verso. Versos completos.

Letra reescrita:`

    const { text } = await generateText({
      model: this.MODEL,
      prompt,
      temperature: 0.4,
    })

    return text || request.originalLyrics
  }

  private static async applyPolish(lyrics: string, request: CompositionRequest): Promise<string> {
    let polished = lyrics

    // Formatação sertanejo
    if (request.genre.toLowerCase().includes("sertanejo")) {
      polished = formatSertanejoPerformance(polished, request.genre)
    }

    // Pontuação
    const punct = PunctuationValidator.validate(polished)
    if (!punct.isValid) polished = punct.correctedLyrics

    // Organização
    const stack = LineStacker.stackLines(polished)
    return stack.stackedLyrics
  }

  private static extractTitle(lyrics: string, request: CompositionRequest): string {
    const firstLine = lyrics.split('\n').find(line => {
      const trimmed = line.trim()
      return trimmed && !trimmed.startsWith('[') && !trimmed.startsWith('(')
    })
    
    return firstLine?.substring(0, 40) || `${request.theme} - ${request.genre}`
  }

  private static fallbackResult(request: CompositionRequest): CompositionResult {
    const fallbackLyrics = `[Intro]
Música em criação
Com inspiração

[Refrão]
Em breve estará pronta
Para sua emoção

[Outro]
Com gratidão no coração

(Instrumentation)
(Genre: ${request.genre})`

    return {
      lyrics: fallbackLyrics,
      title: `${request.theme} - ${request.genre}`,
      metadata: {
        finalScore: 60,
        polishingApplied: false,
        performanceMode: "standard",
        modelUsed: "FALLBACK",
      },
    }
  }
}
