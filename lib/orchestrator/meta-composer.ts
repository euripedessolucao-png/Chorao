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
import { GENRE_CONFIGS } from "@/lib/genre-config" // ✅ ÚNICA importação válida
import { AbsoluteSyllableEnforcer } from "@/lib/validation/absolute-syllable-enforcer"

// Função local para extrair métricas (sem depender de módulo ausente)
function getGenreMetrics(genre: string) {
  const config = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS]
  if (!config) {
    return { syllableRange: { min: 5, max: 12 }, idealRange: { min: 8, max: 10 } }
  }

  const rules = config.prosody_rules.syllable_count

  if ("absolute_max" in rules) {
    return {
      syllableRange: { min: 7, max: rules.absolute_max },
      idealRange: { min: 8, max: 10 },
    }
  }

  if ("with_comma" in rules) {
    return {
      syllableRange: { 
        min: rules.without_comma?.min || 5, 
        max: rules.without_comma?.acceptable_up_to || 9 
      },
      idealRange: { 
        min: rules.without_comma?.min || 5, 
        max: rules.without_comma?.max || 8 
      },
    }
  }

  return { syllableRange: { min: 5, max: 12 }, idealRange: { min: 8, max: 10 } }
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
    const idealMin = metrics.idealRange?.min || 8
    const idealMax = metrics.idealRange?.max || 10

    // Extrai exemplos de allowed do genre-config.ts
    const config = GENRE_CONFIGS[request.genre as keyof typeof GENRE_CONFIGS]
    const allowedExamples = config?.language_rules.allowed
      ? [
          ...config.language_rules.allowed.concrete_objects.slice(0, 3),
          ...config.language_rules.allowed.phrases.slice(0, 2),
        ].join(", ")
      : ""

    const prompt = `Você é um compositor profissional de hits brasileiros.

REGRAS ABSOLUTAS:
- Cada verso deve ter ENTRE ${idealMin} E ${idealMax} SÍLABAS (máximo absoluto: ${maxSyllables})
- Use contrações naturais: "você" → "cê", "para" → "pra", "estou" → "tô"
- Use palavras concretas como: ${allowedExamples || "conta, lixo, saudade, carro"}
- Evite: "sofrimento", "dor profunda", "alma perdida", "coração partido", "prejuízo"
- Mantenha tom de empoderamento (se feminino) ou superação (se masculino)
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
    const idealMin = metrics.idealRange?.min || 8
    const idealMax = metrics.idealRange?.max || 10

    const config = GENRE_CONFIGS[request.genre as keyof typeof GENRE_CONFIGS]
    const allowedExamples = config?.language_rules.allowed
      ? [
          ...config.language_rules.allowed.concrete_objects.slice(0, 3),
          ...config.language_rules.allowed.phrases.slice(0, 2),
        ].join(", ")
      : ""

    const prompt = `Reescreva esta letra musical para o gênero "${request.genre}", mantendo o significado mas:

REGRAS:
- Cada verso: ${idealMin}–${idealMax} sílabas (máx: ${maxSyllables})
- Use contrações naturais ("cê", "pra", "tô")
- Substitua termos proibidos por permitidos: evite "sofrimento", use "desperdício"; evite "prejuízo", use "conta"
- Use palavras concretas como: ${allowedExamples || "conta, lixo, saudade"}
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
      polished = formatSertanejoPerformance(polished, request.genre)
    }

    // Validação de pontuação
    const punctResult = PunctuationValidator.validate(polished)
    if (!punctResult.isValid) {
      polished = punctResult.correctedLyrics
    }

    const syllableCheck = AbsoluteSyllableEnforcer.validate(polished)
    if (!syllableCheck.isValid) {
      console.log("[MetaComposer] 🔧 Corrigindo sílabas excedentes...")
      const fixResult = AbsoluteSyllableEnforcer.validateAndFix(polished)
      polished = fixResult.correctedLyrics
    }

    // Quebra de linhas (agora mais agressivo)
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

    // 1. Contrações
    const contractions = [
      [/você/gi, "cê"],
      [/para o/gi, "pro"],
      [/para a/gi, "pra"],
      [/para/gi, "pra"],
      [/está/gi, "tá"],
      [/estou/gi, "tô"],
      [/não/g, "num"],
    ]

    for (const [regex, replacement] of contractions) {
      const test = fixed.replace(regex, replacement as string)
      if (countPoeticSyllables(test) <= maxSyllables) {
        return test
      }
    }

    // 2. Substituições semânticas (Sertanejo Moderno)
    const semanticFixes = [
      [/jogou no papel/gi, "jogou no lixo"],
      [/prejuízo/gi, "desperdício"],
      [/sofrimento/gi, "desperdício"],
      [/dor/gi, "desperdício"],
      [/minha alma/gi, "minha paz"],
      [/que não valeu/gi, "que foi embuste"],
    ]

    for (const [regex, replacement] of semanticFixes) {
      const test = fixed.replace(regex, replacement as string)
      if (countPoeticSyllables(test) <= maxSyllables) {
        return test
      }
    }

    // 3. Último recurso: corta final
    if (fixed.includes(" ")) {
      const words = fixed.split(" ")
      while (words.length > 1 && countPoeticSyllables(words.join(" ")) > maxSyllables) {
        words.pop()
      }
      return words.join(" ") + "..."
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
