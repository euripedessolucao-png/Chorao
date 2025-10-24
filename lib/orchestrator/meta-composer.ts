// lib/composition/meta-composer.ts

import { countPoeticSyllables } from "@/lib/validation/syllable-counter-brasileiro"
import { type TerceiraViaAnalysis, analisarTerceiraVia, applyTerceiraViaToLine } from "@/lib/terceira-via"
import { generateText } from "ai"
import {
  formatSertanejoPerformance,
  shouldUsePerformanceFormat,
} from "@/lib/formatters/sertanejo-performance-formatter"
import { PunctuationValidator } from "@/lib/validation/punctuation-validator"
import { LineStacker } from "@/lib/utils/line-stacker"
import { LyricsAuditor } from "@/lib/validation/lyrics-auditor"
import { getGenreMetrics } from "@/lib/metrics/brazilian-metrics"

export interface CompositionRequest {
  genre: string
  theme: string
  mood: string
  additionalRequirements?: string
  creativity?: "conservador" | "equilibrado" | "ousado"
  applyFinalPolish?: boolean
  preservedChoruses?: string[]
  originalLyrics?: string
  performanceMode?: "standard" | "performance"
  useTerceiraVia?: boolean
}

export interface CompositionResult {
  lyrics: string
  title: string
  metadata: {
    finalScore: number
    polishingApplied: boolean
    terceiraViaApplied: boolean
    performanceMode: string
    modelUsed: string
  }
}

/**
 * Motor de composição otimizado para produção (Vercel)
 */
export class MetaComposer {
  // ✅ Usa gpt-4o-mini: mais rápido, barato e consistente
  private static readonly MODEL = "openai/gpt-4o-mini"
  private static readonly MAX_SYLLABLES = 12 // 12 é limite real na música

  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer] 🚀 Iniciando composição (produção)...")

    // 1. Gera letra base
    let lyrics = request.originalLyrics ? await this.rewriteLyrics(request) : await this.generateLyrics(request)

    // 2. Aplica Terceira Via se necessário
    let terceiraViaApplied = false
    const analysis = analisarTerceiraVia(lyrics, request.genre, request.theme)
    if (analysis.score_geral < 75) {
      lyrics = await this.applyTerceiraVia(lyrics, request, analysis)
      terceiraViaApplied = true
    }

    // 3. Polimento final
    if (request.applyFinalPolish !== false) {
      lyrics = await this.applyPolish(lyrics, request)
    }

    // 4. Validação final (sem loops!)
    lyrics = this.enforceSyllableLimits(lyrics, request.genre)

    // 5. Auditoria final
    const audit = LyricsAuditor.audit(lyrics, request.genre, request.theme)
    const finalScore = Math.min(100, audit.score + (terceiraViaApplied ? 5 : 0))

    return {
      lyrics,
      title: this.extractTitle(lyrics, request),
      metadata: {
        finalScore,
        polishingApplied: request.applyFinalPolish !== false,
        terceiraViaApplied,
        performanceMode: request.performanceMode || "standard",
        modelUsed: this.MODEL,
      },
    }
  }

  /**
   * GERA LETRA COM PROMPT ESTRUTURADO E CLARO
   */
  private static async generateLyrics(request: CompositionRequest): Promise<string> {
    const metrics = getGenreMetrics(request.genre)
    const maxSyllables = Math.min(metrics.syllableRange.max, this.MAX_SYLLABLES)

    const prompt = `Você é um compositor profissional de hits brasileiros.

REGRAS ABSOLUTAS:
- Cada verso deve ter ENTRE ${metrics.syllableRange.min} E ${maxSyllables} SÍLABAS
- Use contrações naturais: "você" → "cê", "para" → "pra", "estou" → "tô"
- Evite clichês: "coraçãozinho", "lágrimas no rosto", "viola caipira"
- Mantenha a naturalidade da fala cantada
- Inclua elementos visuais para clipe (ex: "lua", "carro", "cidade", "chuva")

GÊNERO: ${request.genre}
TEMA: ${request.theme}
HUMOR: ${request.mood}
${request.additionalRequirements ? `REQUISITOS ADICIONAIS: ${request.additionalRequirements}` : ""}

FORMATO:
[Verse 1]
linha 1
linha 2
...

[Chorus]
linha 1
linha 2
...

RETORNE APENAS A LETRA, SEM EXPLICAÇÕES.`

    const { text } = await generateText({
      model: this.MODEL,
      prompt,
      temperature: request.creativity === "ousado" ? 0.8 : request.creativity === "conservador" ? 0.4 : 0.6,
    })

    return this.cleanLyricsResponse(text || "")
  }

  /**
   * REESCREVE LETRA EXISTENTE
   */
  private static async rewriteLyrics(request: CompositionRequest): Promise<string> {
    if (!request.originalLyrics) throw new Error("Original lyrics required")

    const metrics = getGenreMetrics(request.genre)
    const maxSyllables = Math.min(metrics.syllableRange.max, this.MAX_SYLLABLES)

    const prompt = `Reescreva esta letra musical para o gênero "${request.genre}", mantendo o significado mas:

REGRAS:
- Cada verso: ${metrics.syllableRange.min}–${maxSyllables} sílabas
- Use contrações naturais ("cê", "pra", "tô")
- Remova clichês e torne mais natural
- Adicione elementos visuais se possível

TEMA: ${request.theme}
HUMOR: ${request.mood}

LETRA ORIGINAL:
${request.originalLyrics}

RETORNE APENAS A LETRA REESCRITA, SEM EXPLICAÇÕES.`

    const { text } = await generateText({
      model: this.MODEL,
      prompt,
      temperature: 0.5,
    })

    return this.cleanLyricsResponse(text || "")
  }

  /**
   * LIMPA RESPOSTA DA IA (remove explicações, markdown, etc.)
   */
  private static cleanLyricsResponse(text: string): string {
    return text
      .split("\n")
      .filter(
        (line) =>
          !line.trim().startsWith("RETORNE") && !line.trim().startsWith("FORMATO") && !line.includes("Explicação"),
      )
      .join("\n")
      .trim()
  }

  /**
   * APLICA TERCEIRA VIA (sem loops, com fallback)
   */
  private static async applyTerceiraVia(
    lyrics: string,
    request: CompositionRequest,
    analysis: TerceiraViaAnalysis,
  ): Promise<string> {
    const lines = lyrics.split("\n")
    const correctedLines: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (this.shouldSkipLine(line)) {
        correctedLines.push(line)
        continue
      }

      try {
        const context = this.buildContext(lines, i, request.theme)
        const corrected = await applyTerceiraViaToLine(
          line,
          i,
          context,
          request.genre,
          getGenreMetrics(request.genre),
          {
            isPerformanceMode: request.performanceMode === "performance",
            additionalRequirements: request.additionalRequirements || "",
          },
        )
        correctedLines.push(corrected)
      } catch (error) {
        console.warn(`[TerceiraVia] Fallback na linha ${i}`)
        correctedLines.push(line) // mantém original em erro
      }
    }

    return correctedLines.join("\n")
  }

  /**
   * POLIMENTO FINAL
   */
  private static async applyPolish(lyrics: string, request: CompositionRequest): Promise<string> {
    let polished = lyrics

    // Formatação de performance
    if (shouldUsePerformanceFormat(request.genre, request.performanceMode || "standard")) {
      polished = formatSertanejoPerformance(polished)
    }

    // Validação de pontuação
    const punctResult = PunctuationValidator.validate(polished)
    if (!punctResult.isValid) {
      polished = punctResult.correctedLyrics
    }

    // Quebra de linhas
    const stackResult = LineStacker.stackLines(polished)
    return stackResult.stackedLyrics
  }

  /**
   * GARANTIA FINAL DE SÍLABAS (sem IA, só lógica local)
   */
  private static enforceSyllableLimits(lyrics: string, genre: string): string {
    const metrics = getGenreMetrics(genre)
    const maxSyllables = Math.min(metrics.syllableRange.max, this.MAX_SYLLABLES)

    return lyrics
      .split("\n")
      .map((line) => {
        if (this.shouldSkipLine(line)) return line

        const syllables = countPoeticSyllables(line)
        if (syllables <= maxSyllables) return line

        // Aplica correções locais (sem IA)
        return this.applyLocalFix(line, maxSyllables)
      })
      .join("\n")
  }

  /**
   * CORREÇÃO LOCAL RÁPIDA
   */
  private static applyLocalFix(line: string, maxSyllables: number): string {
    let fixed = line

    // Contrações
    const contractions = [
      [/você/gi, "cê"],
      [/para o/gi, "pro"],
      [/para a/gi, "pra"],
      [/para/gi, "pra"],
      [/está/gi, "tá"],
      [/estou/gi, "tô"],
    ]

    for (const [regex, replacement] of contractions) {
      const test = fixed.replace(regex, replacement as string)
      if (countPoeticSyllables(test) <= maxSyllables) {
        fixed = test
        break
      }
    }

    return fixed
  }

  // ─── Funções auxiliares ───────────────────────────────────────────────

  private static shouldSkipLine(line: string): boolean {
    const trimmed = line.trim()
    return (
      !trimmed ||
      trimmed.startsWith("[") ||
      trimmed.startsWith("(") ||
      trimmed.includes("Instrumental:") ||
      trimmed.includes("BPM:") ||
      trimmed.includes("Key:")
    )
  }

  private static buildContext(lines: string[], index: number, theme: string): string {
    const context = [`Tema: ${theme}`]
    if (index > 0) context.push(`Antes: ${lines[index - 1]}`)
    context.push(`Atual: ${lines[index]}`)
    if (index < lines.length - 1) context.push(`Depois: ${lines[index + 1]}`)
    return context.join(" | ")
  }

  private static extractTitle(lyrics: string, request: CompositionRequest): string {
    const firstLine = lyrics.split("\n").find((line) => line.trim() && !this.shouldSkipLine(line))
    return firstLine ? firstLine.substring(0, 50).trim() : `${request.theme} - ${request.genre}`
  }
}
