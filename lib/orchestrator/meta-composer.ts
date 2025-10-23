// lib/orchestrator/meta-composer.ts - VERSÃO FUNCIONAL

import { countPortugueseSyllables } from "@/lib/validation/syllable-counter"
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
import { AdvancedElisionEngine } from "./advanced-elision-engine"

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
  performanceMode?: "standard" | "performance"
  useTerceiraVia?: boolean
  useIntelligentElisions?: boolean
}

export interface CompositionResult {
  lyrics: string
  title: string
  metadata: {
    iterations: number
    finalScore: number
    polishingApplied?: boolean
    preservedChorusesUsed?: boolean
    performanceMode?: string
    intelligentElisionsApplied?: number
  }
}

export class SyllableTyrant {
  static async enforceAbsoluteSyllables(lyrics: string, useIntelligentElisions: boolean = true): Promise<string> {
    console.log("🎯 [SyllableTyrant] Iniciando correção...")
    const lines = lyrics.split("\n")
    const correctedLines: string[] = []
    let corrections = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (line.startsWith("[") || line.startsWith("(") || line.includes("Instruments:") || !line.trim()) {
        correctedLines.push(line)
        continue
      }

      const syllables = countPortugueseSyllables(line)
      const targetSyllables = 11

      if (syllables !== targetSyllables) {
        let fixedLine = line
        
        if (useIntelligentElisions && syllables > targetSyllables) {
          const elisions = AdvancedElisionEngine.applyIntelligentElisions(line, targetSyllables)
          if (elisions.length > 0) {
            fixedLine = elisions[0]
            console.log(`🎭 Elisão aplicada: "${line}" → "${fixedLine}"`)
          }
        }

        const fixedSyllables = countPortugueseSyllables(fixedLine)
        if (fixedSyllables !== targetSyllables) {
          fixedLine = this.localFix(fixedLine, fixedSyllables, targetSyllables)
        }

        const finalSyllables = countPortugueseSyllables(fixedLine)
        if (finalSyllables === targetSyllables) {
          corrections++
        }

        correctedLines.push(fixedLine)
      } else {
        correctedLines.push(line)
      }
    }

    console.log(`🎯 [SyllableTyrant] ${corrections} correções aplicadas`)
    return correctedLines.join("\n")
  }

  private static localFix(line: string, currentSyllables: number, targetSyllables: number): string {
    let fixedLine = line

    if (currentSyllables > targetSyllables) {
      const removals = [
        { regex: /\b(o |a |um |uma )/gi, replacement: "" },
        { regex: /\b(para )/gi, replacement: "pra" },
        { regex: /\b(você )/gi, replacement: "cê " },
        { regex: /\b(está )/gi, replacement: "tá " },
      ]

      for (const removal of removals) {
        const testLine = fixedLine.replace(removal.regex, removal.replacement)
        if (countPortugueseSyllables(testLine) >= targetSyllables) {
          fixedLine = testLine
          if (countPortugueseSyllables(fixedLine) === targetSyllables) break
        }
      }
    }

    return fixedLine
  }
}

export class MetaComposer {
  private static readonly MAX_ITERATIONS = 1

  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer] 🚀 Iniciando composição...")

    const useIntelligentElisions = request.useIntelligentElisions ?? true
    const syllableTarget = request.syllableTarget || { min: 7, max: 11, ideal: 9 }

    const multiGenResult = await MultiGenerationEngine.generateMultipleVariations(
      async () => {
        return await this.generateWithStrategy(request)
      },
      (lyrics) => {
        const lines = lyrics.split("\n").filter((line) => line.trim() && !line.startsWith("[") && !line.startsWith("("))

        let validLines = 0
        lines.forEach((line) => {
          if (countPortugueseSyllables(line) <= syllableTarget.max) validLines++
        })

        const syllableScore = (validLines / lines.length) * 100
        const auditResult = LyricsAuditor.audit(lyrics, request.genre, request.theme)
        const finalScore = syllableScore * 0.7 + auditResult.score * 0.3

        return finalScore
      },
      1,
    )

    const bestLyrics = multiGenResult.variations[multiGenResult.bestVariationIndex].lyrics
    const bestScore = multiGenResult.bestScore

    console.log(`[MetaComposer] 🏆 Melhor versão: ${bestScore.toFixed(1)}/100`)

    const finalLyrics = await SyllableTyrant.enforceAbsoluteSyllables(bestLyrics, useIntelligentElisions)

    return {
      lyrics: finalLyrics,
      title: this.extractTitle(finalLyrics, request),
      metadata: {
        iterations: 1,
        finalScore: bestScore,
        polishingApplied: true,
        preservedChorusesUsed: request.preservedChoruses ? request.preservedChoruses.length > 0 : false,
        performanceMode: request.performanceMode || "standard",
        intelligentElisionsApplied: useIntelligentElisions ? this.countIntelligentElisions(bestLyrics, finalLyrics) : 0,
      },
    }
  }

  private static countIntelligentElisions(original: string, corrected: string): number {
    const originalLines = original.split("\n")
    const correctedLines = corrected.split("\n")
    let elisionCount = 0

    for (let i = 0; i < Math.min(originalLines.length, correctedLines.length); i++) {
      if (originalLines[i] !== correctedLines[i] && 
          !originalLines[i].startsWith("[") && 
          !correctedLines[i].startsWith("[")) {
        
        const hasIntelligentElision = 
          correctedLines[i].includes("d'") || 
          correctedLines[i].includes("qu'") ||
          correctedLines[i].includes("c'") ||
          correctedLines[i].includes("pra") && !originalLines[i].includes("pra")
        
        if (hasIntelligentElision) {
          elisionCount++
        }
      }
    }

    return elisionCount
  }

  private static async generateWithStrategy(request: CompositionRequest): Promise<string> {
    console.log("[MetaComposer] 📝 Gerando letra...")

    const applyFinalPolish = request.applyFinalPolish ?? true
    const isRewrite = !!request.originalLyrics
    const performanceMode = request.performanceMode || "standard"
    const useIntelligentElisions = request.useIntelligentElisions ?? true

    let rawLyrics: string

    if (isRewrite) {
      rawLyrics = await this.generateStrictRewrite(request)
    } else {
      rawLyrics = await this.generateStrictLyrics(request)
    }

    const validationResult = this.validateLyricsSyllables(rawLyrics)
    if (validationResult.validityRatio < 0.8) {
      rawLyrics = await SyllableTyrant.enforceAbsoluteSyllables(rawLyrics, useIntelligentElisions)
    }

    if (useIntelligentElisions) {
      rawLyrics = await this.applyIntelligentElisions(rawLyrics, request)
    }

    const terceiraViaAnalysis = analisarTerceiraVia(rawLyrics, request.genre, request.theme)
    if (terceiraViaAnalysis && terceiraViaAnalysis.score_geral < 75) {
      rawLyrics = await this.applyTerceiraViaCorrections(rawLyrics, request, terceiraViaAnalysis)
    }

    let finalLyrics = rawLyrics
    if (applyFinalPolish) {
      finalLyrics = await this.applyStrictPolish(finalLyrics, request.genre, performanceMode)
    }

    const punctuationResult = PunctuationValidator.validate(finalLyrics)
    if (!punctuationResult.isValid) {
      finalLyrics = punctuationResult.correctedLyrics
    }

    const stackingResult = LineStacker.stackLines(finalLyrics)
    finalLyrics = stackingResult.stackedLyrics

    console.log("✅ Geração concluída")
    return finalLyrics
  }

  private static async applyIntelligentElisions(lyrics: string, request: CompositionRequest): Promise<string> {
    console.log("[MetaComposer] 🎭 Aplicando elisões...")
    
    const lines = lyrics.split("\n")
    const correctedLines: string[] = []
    const targetSyllables = request.syllableTarget?.ideal || 9

    for (const line of lines) {
      if (line.trim() && !line.startsWith("[") && !line.startsWith("(") && !line.includes("Instruments:")) {
        const syllables = countPortugueseSyllables(line)
        
        if (syllables > targetSyllables) {
          const elisions = AdvancedElisionEngine.applyIntelligentElisions(line, targetSyllables)
          if (elisions.length > 0) {
            correctedLines.push(elisions[0])
            continue
          }
        }
      }
      correctedLines.push(line)
    }

    return correctedLines.join("\n")
  }

  private static async generateStrictLyrics(request: CompositionRequest): Promise<string> {
    const prompt = `COMPOSITOR BRASILEIRO - ${request.genre.toUpperCase()}

**REGRAS:**
- MÁXIMO ${request.syllableTarget?.max || 11} SÍLABAS POR VERSO
- USE ELISÕES NATURAIS: "de amor" → "d'amor", "para" → "pra", "você" → "cê"
- EVITE PALAVRAS CORTADAS OU SEM ACENTOS

**TEMA:** ${request.theme}
**GÊNERO:** ${request.genre}
**HUMOR:** ${request.mood || "adaptável"}

COMPONHA UMA LETRA AUTÊNTICA:`

    let attempts = 0
    let bestLyrics = ""
    let bestScore = 0

    while (attempts < 1) {
      attempts++

      let response
      try {
        response = await generateText({
          model: "openai/gpt-4o",
          prompt: prompt,
          temperature: 0.7,
        })
      } catch (error) {
        continue
      }

      if (!response?.text) continue

      const { text } = response
      const validation = this.validateLyricsSyllables(text)
      const score = validation.validityRatio * 100

      if (score > bestScore) {
        bestScore = score
        bestLyrics = text
      }

      if (validation.validityRatio >= 0.9) break
    }

    return bestLyrics || "Não foi possível gerar letra válida."
  }

  private static async generateStrictRewrite(request: CompositionRequest): Promise<string> {
    if (!request.originalLyrics) {
      throw new Error("Original lyrics required for rewrite")
    }

    const rewritePrompt = `REESCRITOR - ${request.genre.toUpperCase()}

**TÉCNICAS:**
- "de amor" → "d'amor", "que eu" → "qu'eu"
- "para" → "pra", "você" → "cê"
- REMOVA ARTIGOS QUANDO POSSÍVEL

**LETRA ORIGINAL:**
${request.originalLyrics}

**TEMA:** ${request.theme}
**GÊNERO:** ${request.genre}

REESCREVA USANDO ELISÕES:`

    const { text } = await generateText({
      model: "openai/gpt-4o", 
      prompt: rewritePrompt,
      temperature: 0.5,
    })

    return text || request.originalLyrics
  }

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
        const syllables = countPortugueseSyllables(line)
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
      valid: validityRatio >= 0.95,
      validityRatio,
      violations,
    }
  }

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

  private static async applyTerceiraViaCorrections(
    lyrics: string,
    request: CompositionRequest,
    analysis: TerceiraViaAnalysis,
  ): Promise<string> {
    const lines = lyrics.split("\n")
    const correctedLines: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (this.needsTerceiraViaCorrection(line, analysis)) {
        try {
          const context = this.buildLineContext(lines, i, request.theme)
          const correctedLine = await applyTerceiraViaToLine(line, i, context, false, "", request.genre)
          correctedLines.push(correctedLine)
        } catch (error) {
          correctedLines.push(line)
        }
      } else {
        correctedLines.push(line)
      }
    }

    return correctedLines.join("\n")
  }

  private static needsTerceiraViaCorrection(line: string, analysis: TerceiraViaAnalysis): boolean {
    if (!line.trim() || line.startsWith("[") || line.startsWith("(") || line.includes("Instruments:")) {
      return false
    }
    if (analysis.score_geral < 70) {
      return true
    }
    return false
  }

  private static buildLineContext(lines: string[], lineIndex: number, theme: string): string {
    const contextLines: string[] = []
    if (lineIndex > 0) contextLines.push(`Linha anterior: ${lines[lineIndex - 1]}`)
    contextLines.push(`Linha atual: ${lines[lineIndex]}`)
    if (lineIndex < lines.length - 1) contextLines.push(`Próxima linha: ${lines[lineIndex + 1]}`)
    contextLines.push(`Tema: ${theme}`)
    return contextLines.join("\n")
  }

  private static async applyStrictPolish(lyrics: string, genre: string, performanceMode: string): Promise<string> {
    let polishedLyrics = lyrics

    if (shouldUsePerformanceFormat(genre, performanceMode)) {
      polishedLyrics = formatSertanejoPerformance(polishedLyrics)
    }

    return polishedLyrics
  }
}
