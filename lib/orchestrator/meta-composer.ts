import { countPoeticSyllables } from "@/lib/validation/syllable-counter"
import { type TerceiraViaAnalysis, analisarTerceiraVia, applyTerceiraViaToLine } from "@/lib/terceira-via"
import { generateText } from "ai"
import {
  formatSertanejoPerformance,
  shouldUsePerformanceFormat,
} from "@/lib/formatters/sertanejo-performance-formatter"
import { PunctuationValidator } from "@/lib/validation/punctuation-validator"
import { LineStacker } from "@/lib/utils/line-stacker"
import { LyricsAuditor } from "@/lib/validation/lyrics-auditor"
import { MultiGenerationEngine } from "./multi-generation-engine"

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
  performanceMode?: "standard" | "performance"
  useTerceiraVia?: boolean
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
    terceiraViaAnalysis?: TerceiraViaAnalysis
    melodicAnalysis?: any
    performanceMode?: string
  }
}

export class SyllableTyrant {
  /**
   * CORREÇÃO AGRESSIVA PARA 11 SÍLABAS EXATAS - SEM CHAMADAS AO OPENAI
   */
  static async enforceAbsoluteSyllables(lyrics: string): Promise<string> {
    console.log("🎯 [SyllableTyrant] Iniciando correção agressiva...")
    const lines = lyrics.split("\n")
    const correctedLines: string[] = []
    let corrections = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Ignora tags e linhas vazias
      if (line.startsWith("[") || line.startsWith("(") || line.includes("Instruments:") || !line.trim()) {
        correctedLines.push(line)
        continue
      }

      const syllables = countPoeticSyllables(line)

      if (syllables !== 11) {
        console.log(`🔴 Linha ${i + 1}: "${line}" → ${syllables} sílabas`)
        const fixedLine = this.localFix(line, syllables)

        const fixedSyllables = countPoeticSyllables(fixedLine)
        if (fixedSyllables === 11) {
          console.log(`✅ Corrigido: "${fixedLine}" → ${fixedSyllables} sílabas`)
          corrections++
        } else {
          console.log(`⚠️ Correção parcial: "${fixedLine}" → ${fixedSyllables} sílabas`)
        }

        correctedLines.push(fixedLine)
      } else {
        console.log(`✅ Linha ${i + 1} OK: "${line}" → 11 sílabas`)
        correctedLines.push(line)
      }
    }

    console.log(`🎯 [SyllableTyrant] ${corrections} correções aplicadas`)
    return correctedLines.join("\n")
  }

  /**
   * CORREÇÃO LOCAL SEM OPENAI - RÁPIDA E EFICIENTE
   */
  private static localFix(line: string, currentSyllables: number): string {
    const difference = 11 - currentSyllables

    if (difference < 0) {
      // Precisa remover sílabas
      return this.applyEmergencyFix(line, difference)
    } else {
      // Precisa adicionar sílabas
      return this.applyEmergencyFix(line, difference)
    }
  }

  /**
   * CORREÇÃO DE EMERGÊNCIA
   */
  private static applyEmergencyFix(line: string, difference: number): string {
    let fixedLine = line

    if (difference < 0) {
      const removals = [
        { regex: /\bde amor\b/gi, replacement: "d'amor" },
        { regex: /\bque eu\b/gi, replacement: "qu'eu" },
        { regex: /\bpara o\b/gi, replacement: "pro" },
        { regex: /\bpara a\b/gi, replacement: "pra" },
        { regex: /\bpara\b/gi, replacement: "pra" },
        { regex: /\bvocê\b/gi, replacement: "cê" },
        { regex: /\bo\b/gi, replacement: "" },
        { regex: /\ba\b/gi, replacement: "" },
      ]

      for (const removal of removals) {
        const testLine = fixedLine.replace(removal.regex, removal.replacement)
        if (countPoeticSyllables(testLine) >= 11) {
          fixedLine = testLine
          if (countPoeticSyllables(fixedLine) === 11) break
        }
      }
    } else {
      const additions = ["meu ", "minha ", "o ", "a "]
      for (const addition of additions) {
        const testLine = addition + fixedLine
        if (countPoeticSyllables(testLine) <= 11) {
          fixedLine = testLine
          if (countPoeticSyllables(fixedLine) === 11) break
        }
      }
    }

    return fixedLine
  }
}

export class MetaComposer {
  private static readonly MAX_ITERATIONS = 3
  private static readonly ABSOLUTE_MAX_SYLLABLES = 11

  /**
   * COMPOSIÇÃO COM ESTRATÉGIA DO GERADOR DE REFRÃO
   */
  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer] 🚀 Iniciando composição com estratégia de refrão...")

    const multiGenResult = await MultiGenerationEngine.generateMultipleVariations(
      async () => {
        return await this.generateWithChorusStrategy(request)
      },
      (lyrics) => {
        // SCORE BASEADO EM % DE LINHAS VÁLIDAS (como no gerador de refrão)
        const lines = lyrics.split("\n").filter((line) => line.trim() && !line.startsWith("[") && !line.startsWith("("))

        let validLines = 0
        lines.forEach((line) => {
          if (countPoeticSyllables(line) <= 11) validLines++
        })

        const syllableScore = (validLines / lines.length) * 100

        // Score combinado: 70% sílabas + 30% qualidade geral
        const auditResult = LyricsAuditor.audit(lyrics, request.genre, request.theme)
        const finalScore = syllableScore * 0.7 + auditResult.score * 0.3

        return finalScore
      },
      3,
    )

    const bestLyrics = multiGenResult.variations[multiGenResult.bestVariationIndex].lyrics
    const bestScore = multiGenResult.bestScore

    console.log(`[MetaComposer] 🏆 Melhor versão: ${bestScore.toFixed(1)}/100`)

    // APLICA SYLLABLE TYRANT COMO GARANTIA FINAL
    console.log("🎯 Aplicando garantia final de sílabas...")
    const finalLyrics = await SyllableTyrant.enforceAbsoluteSyllables(bestLyrics)

    return {
      lyrics: finalLyrics,
      title: this.extractTitle(finalLyrics, request),
      metadata: {
        iterations: 3,
        finalScore: bestScore,
        polishingApplied: true,
        preservedChorusesUsed: request.preservedChoruses ? request.preservedChoruses.length > 0 : false,
        performanceMode: request.performanceMode || "standard",
      },
    }
  }

  /**
   * GERAÇÃO COM ESTRATÉGIA DO GERADOR DE REFRÃO
   */
  private static async generateWithChorusStrategy(request: CompositionRequest): Promise<string> {
    console.log("[MetaComposer] 📝 Gerando com estratégia de refrão...")

    const applyFinalPolish = request.applyFinalPolish ?? true
    const isRewrite = !!request.originalLyrics
    const performanceMode = request.performanceMode || "standard"

    // GERA LETRA BASE COM ESTRATÉGIA DE REFRÃO
    let rawLyrics: string

    if (isRewrite) {
      rawLyrics = await this.generateStrictRewrite(request)
    } else {
      rawLyrics = await this.generateStrictLyrics(request)
    }

    // VALIDAÇÃO IMEDIATA (como no gerador de refrão)
    const validationResult = this.validateLyricsSyllables(rawLyrics)
    if (validationResult.validityRatio < 0.8) {
      console.log(`⚠️ Validação fraca (${(validationResult.validityRatio * 100).toFixed(1)}%), aplicando correções...`)
      rawLyrics = await SyllableTyrant.enforceAbsoluteSyllables(rawLyrics)
    }

    // TERCEIRA VIA SE NECESSÁRIO
    const terceiraViaAnalysis = analisarTerceiraVia(rawLyrics, request.genre, request.theme)
    if (terceiraViaAnalysis && terceiraViaAnalysis.score_geral < 75) {
      rawLyrics = await this.applyTerceiraViaCorrections(rawLyrics, request, terceiraViaAnalysis)
    }

    // POLIMENTO FINAL
    let finalLyrics = rawLyrics
    if (applyFinalPolish) {
      finalLyrics = await this.applyStrictPolish(finalLyrics, request.genre, performanceMode)
    }

    // VALIDAÇÕES FINAIS
    const punctuationResult = PunctuationValidator.validate(finalLyrics)
    if (!punctuationResult.isValid) {
      finalLyrics = punctuationResult.correctedLyrics
    }

    const stackingResult = LineStacker.stackLines(finalLyrics)
    finalLyrics = stackingResult.stackedLyrics

    console.log("✅ Geração concluída com estratégia de refrão")
    return finalLyrics
  }

  /**
   * GERA LETRA ESTRITA - ESTRATÉGIA DE REFRÃO
   */
  private static async generateStrictLyrics(request: CompositionRequest): Promise<string> {
    let attempts = 0
    let bestLyrics = ""
    let bestScore = 0

    while (attempts < 3) {
      attempts++
      console.log(`[MetaComposer] Tentativa ${attempts}/3...`)

      const prompt = `COMPOSITOR DE MEGA HITS - REGRAS ABSOLUTAS:

**CADA VERSO = MÁXIMO 11 SÍLABAS POÉTICAS**

TÉCNICAS OBRIGATÓRIAS:
- ELISÃO: "de amor" → "d'amor"
- CONTRACÇÕES: "você" → "cê", "para" → "pra"  
- JUNÇÃO: "que eu" → "qu'eu", "meu amor" → "meuamor"
- REMOVER: artigos "o", "a" quando possível

PROIBIDO:
- Versos com mais de 11 sílabas
- Palavras cortadas ou sem acentos
- "coraçãozinho", "saudadezinha", clichês

EXEMPLOS (11 SÍLABAS):
- "No céu estrelado da noite"
- "Qu'eu vi cê dançando sozinha"
- "E o vento batendo na porta"

TEMA: ${request.theme}
GÊNERO: ${request.genre}
HUMOR: ${request.mood || "adaptável"}

COMPONHA UMA LETRA COMPLETA onde TODOS os versos têm 11 sílabas ou menos:`

      const { text } = await generateText({
        model: "openai/gpt-4o",
        prompt,
        temperature: 0.7, // Alta como no gerador de refrão
      })

      if (!text) continue

      // VALIDAÇÃO COMO NO GERADOR DE REFRÃO
      const validation = this.validateLyricsSyllables(text)
      const score = validation.validityRatio * 100

      if (score > bestScore) {
        bestScore = score
        bestLyrics = text
      }

      if (validation.validityRatio >= 0.9) {
        console.log(`✅ Tentativa ${attempts} APROVADA: ${score.toFixed(1)}% válido`)
        break
      } else {
        console.log(`⚠️ Tentativa ${attempts}: ${score.toFixed(1)}% válido`)
      }
    }

    return bestLyrics || "Não foi possível gerar letra válida após 3 tentativas."
  }

  /**
   * REESCRITA ESTRITA
   */
  private static async generateStrictRewrite(request: CompositionRequest): Promise<string> {
    if (!request.originalLyrics) {
      throw new Error("Original lyrics required for rewrite")
    }

    const prompt = `REESCRITOR PROFISSIONAL - REGRAS:

**CADA VERSO = 11 SÍLABAS EXATAS**

TÉCNICAS:
- ELISÃO: "de amor" → "d'amor"
- CONTRACÇÕES: "você" → "cê", "para" → "pra"
- JUNÇÃO: "que eu" → "qu'eu"

LETRA ORIGINAL:
${request.originalLyrics}

TEMA: ${request.theme}
GÊNERO: ${request.genre}

REESCREVA mantendo o significado mas garantindo 11 sílabas por verso:`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.5,
    })

    return text || request.originalLyrics
  }

  /**
   * APLICA CORREÇÕES TERCEIRA VIA
   */
  private static async applyTerceiraViaCorrections(
    lyrics: string,
    request: CompositionRequest,
    analysis: TerceiraViaAnalysis,
  ): Promise<string> {
    console.log("[MetaComposer] 🔄 Aplicando Terceira Via...")

    const lines = lyrics.split("\n")
    const correctedLines: string[] = []
    let correctionsApplied = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (this.needsTerceiraViaCorrection(line, analysis)) {
        try {
          const context = this.buildLineContext(lines, i, request.theme)
          const correctedLine = await applyTerceiraViaToLine(line, i, context, false, "", request.genre)

          if (correctedLine !== line) {
            correctionsApplied++
          }

          correctedLines.push(correctedLine)
        } catch (error) {
          console.warn(`❌ Erro Terceira Via linha ${i}, mantendo original`)
          correctedLines.push(line)
        }
      } else {
        correctedLines.push(line)
      }
    }

    console.log(`✅ ${correctionsApplied} correções Terceira Via aplicadas`)
    return correctedLines.join("\n")
  }

  /**
   * POLIMENTO ESTRITO
   */
  private static async applyStrictPolish(lyrics: string, genre: string, performanceMode: string): Promise<string> {
    console.log(`[MetaComposer] ✨ Aplicando polimento estrito...`)

    let polishedLyrics = lyrics

    // Formatação de performance
    if (shouldUsePerformanceFormat(genre, performanceMode)) {
      polishedLyrics = formatSertanejoPerformance(polishedLyrics)
    } else if (performanceMode === "performance") {
      polishedLyrics = this.applyPerformanceFormatting(polishedLyrics)
    }

    return polishedLyrics
  }

  /**
   * VALIDA SÍLABAS COMO NO GERADOR DE REFRÃO
   */
  private static validateLyricsSyllables(lyrics: string): {
    valid: boolean
    validityRatio: number
    violations: Array<{ line: string; syllables: number }>
  } {
    const lines = lyrics.split("\n")
    const violations: Array<{ line: string; syllables: number }> = []
    let validLines = 0
    let totalLines = 0

    lines.forEach((line, index) => {
      if (line.trim() && !line.startsWith("[") && !line.startsWith("(") && !line.includes("Instruments:")) {
        totalLines++
        const syllables = countPoeticSyllables(line)
        if (syllables <= 11) {
          validLines++
        } else {
          violations.push({
            line: line.trim(),
            syllables,
          })
        }
      }
    })

    const validityRatio = totalLines > 0 ? validLines / totalLines : 0

    return {
      valid: validityRatio >= 0.95, // 95% das linhas válidas
      validityRatio,
      violations,
    }
  }

  /**
   * FORMATAÇÃO DE PERFORMANCE
   */
  private static applyPerformanceFormatting(lyrics: string): string {
    let formatted = lyrics
    formatted = formatted.replace(/\[Intro\]/gi, "[Intro]")
    formatted = formatted.replace(/\[Verso\s*(\d*)\]/gi, "[Verse$1]")
    formatted = formatted.replace(/\[Refrão\]/gi, "[Chorus]")
    formatted = formatted.replace(/\[Ponte\]/gi, "[Bridge]")
    formatted = formatted.replace(/\[Final\]/gi, "[Outro]")
    return formatted
  }

  /**
   * EXTRAI TÍTULO
   */
  private static extractTitle(lyrics: string, request: CompositionRequest): string {
    const lines = lyrics.split("\n")
    for (const line of lines) {
      if (line.toLowerCase().includes("título:") || line.toLowerCase().includes("title:")) {
        return line.split(":")[1]?.trim() || "Sem Título"
      }
    }
    for (const line of lines) {
      const cleaned = line.trim()
      if (cleaned && !cleaned.startsWith("[") && !cleaned.startsWith("(") && cleaned.length > 3) {
        return cleaned.substring(0, 50)
      }
    }
    return `${request.theme} - ${request.genre}`
  }

  /**
   * VERIFICA SE PRECISA DE CORREÇÃO TERCEIRA VIA
   */
  private static needsTerceiraViaCorrection(line: string, analysis: TerceiraViaAnalysis): boolean {
    if (!line.trim() || line.startsWith("[") || line.startsWith("(") || line.includes("Instruments:")) {
      return false
    }
    if (analysis.score_geral < 70) {
      return true
    }
    if (analysis.pontos_fracos && analysis.pontos_fracos.length > 0) {
      return true
    }
    return false
  }

  /**
   * CONSTRÓI CONTEXTO PARA LINHA
   */
  private static buildLineContext(lines: string[], lineIndex: number, theme: string): string {
    const contextLines: string[] = []
    if (lineIndex > 0) {
      contextLines.push(`Linha anterior: ${lines[lineIndex - 1]}`)
    }
    contextLines.push(`Linha atual: ${lines[lineIndex]}`)
    if (lineIndex < lines.length - 1) {
      contextLines.push(`Próxima linha: ${lines[lineIndex + 1]}`)
    }
    contextLines.push(`Tema: ${theme}`)
    return contextLines.join("\n")
  }
}
