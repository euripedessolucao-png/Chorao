// lib/orchestrator/meta-composer.ts

import { countPoeticSyllables } from "@/lib/validation/syllable-counter-brasileiro"
import { type TerceiraViaAnalysis, analisarTerceiraVia, applyTerceiraViaToLine } from "@/lib/terceira-via"
import type { GenreConfig as TerceiraViaGenreConfig } from "@/lib/terceira-via"
import { generateText } from "ai"
import {
  formatSertanejoPerformance,
  shouldUsePerformanceFormat,
} from "@/lib/formatters/sertanejo-performance-formatter"
import { PunctuationValidator } from "@/lib/validation/punctuation-validator"
import { LineStacker } from "@/lib/utils/line-stacker"
import { LyricsAuditor } from "@/lib/validation/lyrics-auditor"
import { GENRE_CONFIGS } from "@/lib/genre-config"
import type { GenreConfig } from "@/lib/genre-config"
import { validateSyllablesByGenre } from "@/lib/validation/absolute-syllable-enforcer"
import { enhanceLyricsRhymes } from "@/lib/validation/rhyme-enhancer"
import { validateRhymesForGenre } from "@/lib/validation/rhyme-validator"
import { fixLineToMaxSyllables } from "@/lib/validation/local-syllable-fixer"
import { enforceSyllableLimitAll } from "@/lib/validation/intelligent-rewriter"
import { enforceChorusRules } from "@/lib/validation/chorus-optimizer"

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
 * ✅ CORRETOR SUPER-EFETIVO - DETECÇÃO EXPANDIDA
 */
function superFixIncompleteLines(lyrics: string): string {
  console.log("[SuperCorrector] 🚀 Aplicando correção super-efetiva")

  const lines = lyrics.split("\n")
  const fixedLines: string[] = []

  let corrections = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Ignora tags e metadata
    if (!line || line.startsWith("### [") || line.startsWith("(Instrumentation)") || line.startsWith("(Genre)")) {
      fixedLines.push(line)
      continue
    }

    const cleanLine = line
      .replace(/\[.*?\]/g, "")
      .replace(/$$.*?$$/g, "")
      .replace(/^"|"$/g, "")
      .trim()
    if (!cleanLine) {
      fixedLines.push(line)
      continue
    }

    const words = cleanLine.split(/\s+/).filter((w) => w.length > 0)
    const lastWord = words[words.length - 1]?.toLowerCase() || ""

    // ✅ DETECÇÃO EXPANDIDA - MAIS AGRESSIVA
    const isIncomplete =
      words.length < 3 || // Menos de 3 palavras
      /[,-]$/.test(cleanLine) || // Termina com vírgula ou traço
      /\b(e|a|o|que|com|pra|pro|num|numa|de|da|do|em|no|na|por|me|te|se|um|uma)\s*$/i.test(cleanLine) || // Termina com preposição/artigo
      /^(a|e|o|que|com|pra|de|da|do|em|no|na|por|me|te|se|um|uma)$/i.test(cleanLine) // Apenas uma palavra problemática

    if (isIncomplete && words.length > 0) {
      console.log(`[SuperCorrector] 🚨 VERSO INCOMPLETO: "${cleanLine}"`)

      let fixedLine = line

      // Remove pontuação problemática
      fixedLine = fixedLine.replace(/[,-]\s*$/, "").trim()

      // ✅ COMPLETAMENTOS ESPECÍFICOS PARA OS PADRÕES ENCONTRADOS
      const specificCompletions: Record<string, string> = {
        e: "com amor",
        a: "minha vida",
        que: "Deus me deu",
        com: "muito amor",
        pra: "viver",
        pro: "meu bem",
        me: "ajudar",
        te: "amar",
        se: "entregar",
        um: "presente",
        uma: "bênção",
        no: "coração",
        na: "alma",
        de: "gratidão",
        do: "Senhor",
        da: "minha vida",
        em: "Deus",
        por: "tudo",
        "sinto a": "Tua presença",
        "deixa o": "coração cantar",
        "que sou e": "tudo que tenho",
        "eu quero": "agradecer",
        "sempre a": "Te louvar",
        "me ajuda a": "crescer",
        "que sou com": "Ti",
        "alguém pra": "abençoar",
        "agradar e": "servir",
        "vou me": "entregar",
        "sinto Tua luz e": "Tua graça",
        "sonhar que": "um dia realizarei",
      }

      // Primeiro tenta match exato com a frase
      let matched = false
      for (const [pattern, completion] of Object.entries(specificCompletions)) {
        if (cleanLine.toLowerCase().endsWith(pattern)) {
          fixedLine = fixedLine.slice(0, -pattern.length).trim() + " " + completion
          matched = true
          break
        }
      }

      // Se não encontrou match específico, usa completamento por última palavra
      if (!matched && specificCompletions[lastWord]) {
        fixedLine += " " + specificCompletions[lastWord]
      } else if (!matched) {
        // Completamento genérico inteligente
        const genericCompletions = [
          "com gratidão no coração",
          "e amor infinito",
          "pra sempre Te louvar",
          "com fé e esperança",
          "que renova minha alma",
          "em cada momento",
          "com muita alegria",
        ]
        const randomCompletion = genericCompletions[Math.floor(Math.random() * genericCompletions.length)]
        fixedLine += " " + randomCompletion
      }

      // Garante pontuação final adequada
      if (!/[.!?]$/.test(fixedLine)) {
        fixedLine = fixedLine.replace(/[.,;:]$/, "") + "."
      }

      console.log(`[SuperCorrector] ✅ CORRIGIDO: "${fixedLine}"`)
      fixedLines.push(fixedLine)
      corrections++
    } else {
      fixedLines.push(line)
    }
  }

  console.log(`[SuperCorrector] 🎉 CORREÇÃO CONCLUÍDA: ${corrections} versos corrigidos`)
  return fixedLines.join("\n")
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

    // ✅ ETAPA CRÍTICA: CORREÇÃO DE VERSOS INCOMPLETOS
    console.log("[MetaComposer] 🔧 Aplicando correção super-efetiva de versos incompletos...")
    lyrics = superFixIncompleteLines(lyrics)

    console.log("[MetaComposer] 🎵 Validando e melhorando rimas...")
    const rhymeValidation = validateRhymesForGenre(lyrics, request.genre)

    console.log(`[MetaComposer] 📊 Análise inicial de rimas:`, {
      score: rhymeValidation.analysis.score,
      richRhymes: rhymeValidation.analysis.quality.filter((q) => q.type === "rica").length,
      totalRhymes: rhymeValidation.analysis.quality.length,
      warnings: rhymeValidation.warnings,
    })

    console.log("[MetaComposer] 🔧 Aplicando melhorias de rima...")
    const rhymeEnhancement = await enhanceLyricsRhymes(
      lyrics,
      request.genre,
      request.theme,
      request.creativity === "ousado" ? 0.8 : 0.7,
    )

    if (rhymeEnhancement.improvements.length > 0) {
      console.log(`[MetaComposer] ✅ ${rhymeEnhancement.improvements.length} rima(s) melhorada(s)`)
      console.log(
        `[MetaComposer] 📈 Score de rimas: ${rhymeEnhancement.originalScore} → ${rhymeEnhancement.enhancedScore}`,
      )
      lyrics = rhymeEnhancement.enhancedLyrics
    } else {
      console.log("[MetaComposer] ℹ️ Nenhuma melhoria de rima aplicada")
    }

    // 2. Aplica Terceira Via se necessário
    let terceiraViaApplied = false
    const analysis = analisarTerceiraVia(lyrics, request.genre, request.theme)
    if (analysis.score_geral < 75 && request.useTerceiraVia) {
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

    console.log("🎯 Aplicando garantia final com reescrita inteligente...")
    let finalLyrics = await enforceSyllableLimitAll(lyrics, 12)

    if (request.genre.toLowerCase().includes("sertanejo")) {
      finalLyrics = enforceChorusRules(finalLyrics, request.theme)
    }

    return {
      lyrics: finalLyrics,
      title: this.extractTitle(finalLyrics, request),
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
   * ✅ PROMPT PERFEITO - ABORDAGEM POSITIVA E CONSTRUTIVA
   */
  private static async generateLyrics(request: CompositionRequest): Promise<string> {
    const genreConfig = GENRE_CONFIGS[request.genre as keyof typeof GENRE_CONFIGS]

    const syllableRules = genreConfig?.prosody_rules?.syllable_count
    let maxSyllables = this.MAX_SYLLABLES
    let minSyllables = 6

    if (syllableRules) {
      if ("absolute_max" in syllableRules) {
        maxSyllables = Math.min(syllableRules.absolute_max, this.MAX_SYLLABLES)
        minSyllables = Math.max(4, syllableRules.absolute_max - 5)
      } else if ("with_comma" in syllableRules) {
        maxSyllables = Math.min(syllableRules.with_comma.total_max, this.MAX_SYLLABLES)
        minSyllables = syllableRules.without_comma?.min || 5
      }
    }

    // ✅ PROMPT PERFEITO - ABORDAGEM POSITIVA
    const prompt = `COMPOSITOR PROFISSIONAL BRASILEIRO - ${request.genre.toUpperCase()}

🎯 OBJETIVO PRINCIPAL: Criar VERSOS COMPLETOS e COERENTES

📝 REGRA DE OURO: 
CADA VERSO = FRASE COMPLETA (sujeito + verbo + complemento)

✅ EXEMPLOS DE VERSOS COMPLETOS:
"Hoje eu venho aqui de coração aberto" 
"Com gratidão transbordando em meu peito"
"Teu amor me renova a cada amanhecer"
"A vida é uma bênção que eu agradeço"
"Nos braços de Deus encontro meu abrigo"

🚫 EVITAR VERSOS INCOMPLETOS:
"Coração aberto" ❌ (incompleto)
"De gratidão" ❌ (incompleto) 
"Renovando a cada" ❌ (incompleto)

TEMA: ${request.theme}
HUMOR: ${request.mood || "Adaptado ao tema"}
GÊNERO: ${request.genre}

${request.additionalRequirements ? `REQUISITOS ADICIONAIS: ${request.additionalRequirements}` : ""}

📏 TÉCNICA MUSICAL BRASILEIRA:
- Máximo ${maxSyllables} sílabas por verso
- Versos autocontidos e completos
- Emoção genuína e autenticidade
- Linguagem apropriada para ${request.genre}

🎵 ESTRUTURA SUGERIDA:
[Intro]
[Verso 1]
[Pré-Refrão] 
[Refrão]
[Verso 2]
[Refrão]
[Ponte]
[Refrão]
[Outro]

💡 DICA CRÍTICA: 
Pense em CADA VERSO como uma mini-história completa
Se ficar muito longo, REESCREVA completamente mantendo a mensagem
Mantenha a naturalidade da língua portuguesa brasileira

Gere a letra com VERSOS COMPLETOS e EMOCIONALMENTE IMPACTANTES:`

    const { text } = await generateText({
      model: this.MODEL,
      prompt,
      temperature: request.creativity === "ousado" ? 0.8 : request.creativity === "conservador" ? 0.4 : 0.6,
    })

    return this.cleanLyricsResponse(text || "")
  }

  /**
   * ✅ REESCRITA COM PROMPT OTIMIZADO
   */
  private static async rewriteLyrics(request: CompositionRequest): Promise<string> {
    if (!request.originalLyrics) throw new Error("Original lyrics required")

    const genreConfig = GENRE_CONFIGS[request.genre as keyof typeof GENRE_CONFIGS]

    const syllableRules = genreConfig?.prosody_rules?.syllable_count
    let maxSyllables = this.MAX_SYLLABLES
    let minSyllables = 6

    if (syllableRules) {
      if ("absolute_max" in syllableRules) {
        maxSyllables = Math.min(syllableRules.absolute_max, this.MAX_SYLLABLES)
        minSyllables = Math.max(4, syllableRules.absolute_max - 5)
      } else if ("with_comma" in syllableRules) {
        maxSyllables = Math.min(syllableRules.with_comma.total_max, this.MAX_SYLLABLES)
        minSyllables = syllableRules.without_comma?.min || 5
      }
    }

    // ✅ PROMPT DE REESCRITA OTIMIZADO
    const prompt = `COMPOSITOR PROFISSIONAL - REESCRITA PARA ${request.genre.toUpperCase()}

🎯 OBJETIVO: Transformar esta letra mantendo VERSOS COMPLETOS

📝 REGRA DE OURO: 
CADA VERSO DEVE SER UMA FRASE COMPLETA E INDEPENDENTE

✅ EXEMPLOS DE VERSOS COMPLETOS:
"Hoje eu venho aqui de coração aberto" 
"Com gratidão transbordando em meu peito" 

🚫 EVITAR VERSOS INCOMPLETOS:
"Coração aberto" ❌
"De gratidão" ❌
"Renovando a cada" ❌

TEMA: ${request.theme}
HUMOR: ${request.mood}
GÊNERO: ${request.genre}

📏 TÉCNICA:
- Máximo ${maxSyllables} sílabas por verso
- Versos completos e autocontidos
- Linguagem natural brasileira

LETRA ORIGINAL (inspiração):
${request.originalLyrics}

REESCREVA mantendo o significado mas garantindo VERSOS COMPLETOS:`

    const { text } = await generateText({
      model: this.MODEL,
      prompt,
      temperature: 0.4,
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
          !line.trim().startsWith("RETORNE") &&
          !line.trim().startsWith("REGRAS") &&
          !line.includes("Explicação") &&
          !line.includes("```"),
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

    const genreConfig = GENRE_CONFIGS[request.genre as keyof typeof GENRE_CONFIGS]
    const simplifiedConfig = this.convertToTerceiraViaConfig(genreConfig)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (this.shouldSkipLine(line)) {
        correctedLines.push(line)
        continue
      }

      try {
        const context = this.buildContext(lines, i, request.theme)
        const corrected = await applyTerceiraViaToLine(line, i, context, request.genre, simplifiedConfig, {
          isPerformanceMode: request.performanceMode === "performance",
          additionalRequirements: request.additionalRequirements || "",
        })
        correctedLines.push(corrected)
      } catch (error) {
        console.warn(`[TerceiraVia] Fallback na linha ${i}`)
        correctedLines.push(line)
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

    const syllableCheck = validateSyllablesByGenre(polished, request.genre)
    if (!syllableCheck.isValid) {
      console.log("[MetaComposer] 🔧 Corrigindo sílabas excedentes...")
      // Correção manual linha por linha
      const lines = polished.split("\n")
      const correctedLines: string[] = []

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(")) {
          correctedLines.push(line)
          continue
        }

        const lineWithoutBrackets = trimmed.replace(/\[.*?\]/g, "").trim()
        if (!lineWithoutBrackets) {
          correctedLines.push(line)
          continue
        }

        const syllables = countPoeticSyllables(lineWithoutBrackets)
        if (syllables > syllableCheck.maxSyllables) {
          const fixed = fixLineToMaxSyllables(trimmed, syllableCheck.maxSyllables)
          correctedLines.push(fixed)
        } else {
          correctedLines.push(line)
        }
      }

      polished = correctedLines.join("\n")
    }

    // Quebra de linhas (agora mais agressivo)
    const stackResult = LineStacker.stackLines(polished)
    return stackResult.stackedLyrics
  }

  /**
   * GARANTIA FINAL DE SÍLABAS (sem IA, só lógica local)
   */
  private static enforceSyllableLimits(lyrics: string, genre: string): string {
    const genreConfig = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS]

    const syllableRules = genreConfig?.prosody_rules?.syllable_count
    let maxSyllables = this.MAX_SYLLABLES

    if (syllableRules) {
      if ("absolute_max" in syllableRules) {
        maxSyllables = Math.min(syllableRules.absolute_max, this.MAX_SYLLABLES)
      } else if ("with_comma" in syllableRules) {
        maxSyllables = Math.min(syllableRules.with_comma.total_max, this.MAX_SYLLABLES)
      }
    }

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

  /**
   * Converte GenreConfig complexo para o formato simplificado esperado pela Terceira Via
   */
  private static convertToTerceiraViaConfig(genreConfig: GenreConfig | undefined): TerceiraViaGenreConfig {
    if (!genreConfig) {
      return {
        syllableRange: { min: 6, max: 12 },
        stylisticPreferences: { avoidCliches: false },
      }
    }

    const syllableRules = genreConfig.prosody_rules?.syllable_count
    let min = 6
    let max = 12

    if (syllableRules) {
      if ("absolute_max" in syllableRules) {
        max = syllableRules.absolute_max
        min = Math.max(4, max - 5)
      } else if ("with_comma" in syllableRules) {
        max = syllableRules.with_comma.total_max
        min = syllableRules.without_comma?.min || 5
      }
    }

    return {
      syllableRange: { min, max, ideal: max },
      rhymeRules: {
        minRichRhymePercentage: 0.6,
        allowAssonantRhymes: true,
        requirePerfectRhymes: false,
      },
      stylisticPreferences: {
        avoidCliches: true,
        preferEmotionalHooks: true,
        useContractions: true,
        visualImageryLevel: "medium",
      },
      languageTone: "colloquial",
    }
  }
}
