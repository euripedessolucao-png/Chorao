import { countPortugueseSyllables } from "@/lib/validation/syllable-counter" // ✅ CONTADOR CORRETO
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
import { AdvancedElisionEngine } from "./advanced-elision-engine" // ✅ NOVO MOTOR DE ELISÕES

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
  useIntelligentElisions?: boolean // ✅ NOVA OPÇÃO
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
    intelligentElisionsApplied?: number // ✅ NOVO METADADO
  }
}

export class SyllableTyrant {
  /**
   * CORREÇÃO AGRESSIVA COM ELISÕES INTELIGENTES
   */
  static async enforceAbsoluteSyllables(lyrics: string, useIntelligentElisions: boolean = true): Promise<string> {
    console.log("🎯 [SyllableTyrant] Iniciando correção agressiva...")
    const lines = lyrics.split("\n")
    const correctedLines: string[] = []
    let corrections = 0
    let intelligentElisions = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Ignora tags e linhas vazias
      if (line.startsWith("[") || line.startsWith("(") || line.includes("Instruments:") || !line.trim()) {
        correctedLines.push(line)
        continue
      }

      const syllables = countPortugueseSyllables(line) // ✅ CONTADOR CORRETO
      const targetSyllables = 11

      if (syllables !== targetSyllables) {
        console.log(`🔴 Linha ${i + 1}: "${line}" → ${syllables} sílabas`)
        
        let fixedLine = line
        
        // ✅ PRIMEIRO TENTA ELISÕES INTELIGENTES
        if (useIntelligentElisions && syllables > targetSyllables) {
          const elisions = AdvancedElisionEngine.applyIntelligentElisions(line, targetSyllables)
          if (elisions.length > 0) {
            fixedLine = elisions[0]
            intelligentElisions++
            console.log(`🎭 Elisão inteligente aplicada: "${fixedLine}"`)
          }
        }

        // ✅ SE PRECISAR, APLICA CORREÇÃO LOCAL
        const fixedSyllables = countPortugueseSyllables(fixedLine)
        if (fixedSyllables !== targetSyllables) {
          fixedLine = this.localFix(fixedLine, fixedSyllables, targetSyllables)
        }

        const finalSyllables = countPortugueseSyllables(fixedLine)
        if (finalSyllables === targetSyllables) {
          console.log(`✅ Corrigido: "${fixedLine}" → ${finalSyllables} sílabas`)
          corrections++
        } else {
          console.log(`⚠️ Correção parcial: "${fixedLine}" → ${finalSyllables} sílabas`)
        }

        correctedLines.push(fixedLine)
      } else {
        console.log(`✅ Linha ${i + 1} OK: "${line}" → ${syllables} sílabas`)
        correctedLines.push(line)
      }
    }

    console.log(`🎯 [SyllableTyrant] ${corrections} correções aplicadas (${intelligentElisions} elisões inteligentes)`)
    return correctedLines.join("\n")
  }

  /**
   * CORREÇÃO LOCAL ATUALIZADA
   */
  private static localFix(line: string, currentSyllables: number, targetSyllables: number): string {
    const difference = targetSyllables - currentSyllables

    if (difference < 0) {
      return this.applyEmergencyFix(line, difference, targetSyllables)
    } else {
      return this.applyEmergencyFix(line, difference, targetSyllables)
    }
  }

  /**
   * CORREÇÃO DE EMERGÊNCIA ATUALIZADA
   */
  private static applyEmergencyFix(line: string, difference: number, targetSyllables: number): string {
    let fixedLine = line

    if (difference < 0) {
      // REMOÇÕES MAIS INTELIGENTES
      const removals = [
        { regex: /\b(o |a |um |uma )/gi, replacement: "" },
        { regex: /\b(de |em |por )/gi, replacement: "d" },
        { regex: /\b(no |na |do |da )/gi, replacement: "n" },
        { regex: /\b(para o |para a )/gi, replacement: "pro" },
        { regex: /\b(para )/gi, replacement: "pra" },
        { regex: /\b(você )/gi, replacement: "cê " },
        { regex: /\b(está )/gi, replacement: "tá " },
        { regex: /\b(com )/gi, replacement: "c" },
      ]

      for (const removal of removals) {
        const testLine = fixedLine.replace(removal.regex, removal.replacement)
        if (countPortugueseSyllables(testLine) >= targetSyllables) {
          fixedLine = testLine
          if (countPortugueseSyllables(fixedLine) === targetSyllables) break
        }
      }
    } else {
      // ADIÇÕES INTELIGENTES
      const additions = ["meu ", "minha ", "esse ", "essa ", "aquele ", "aquela "]
      for (const addition of additions) {
        const testLine = addition + fixedLine
        if (countPortugueseSyllables(testLine) <= targetSyllables) {
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
  private static readonly ABSOLUTE_MAX_SYLLABLES = 11

  /**
   * COMPOSIÇÃO COM ELISÕES INTELIGENTES
   */
  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer] 🚀 Iniciando composição com elisões inteligentes...")

    const useIntelligentElisions = request.useIntelligentElisions ?? true // ✅ OPÇÃO NOVA

    const multiGenResult = await MultiGenerationEngine.generateMultipleVariations(
      async () => {
        return await this.generateWithChorusStrategy(request)
      },
      (lyrics) => {
        const lines = lyrics.split("\n").filter((line) => line.trim() && !line.startsWith("[") && !line.startsWith("("))

        let validLines = 0
        lines.forEach((line) => {
          if (countPortugueseSyllables(line) <= 11) validLines++ // ✅ CONTADOR CORRETO
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

    // ✅ APLICA SYLLABLE TYRANT COM ELISÕES INTELIGENTES
    console.log("🎯 Aplicando garantia final com elisões inteligentes...")
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
        intelligentElisionsApplied: useIntelligentElisions ? this.countIntelligentElisions(bestLyrics, finalLyrics) : 0, // ✅ CONTAGEM
      },
    }
  }

  /**
   * CONTA ELISÕES INTELIGENTES APLICADAS
   */
  private static countIntelligentElisions(original: string, corrected: string): number {
    const originalLines = original.split("\n")
    const correctedLines = corrected.split("\n")
    let elisionCount = 0

    for (let i = 0; i < Math.min(originalLines.length, correctedLines.length); i++) {
      if (originalLines[i] !== correctedLines[i] && 
          !originalLines[i].startsWith("[") && 
          !correctedLines[i].startsWith("[")) {
        
        // Verifica se foi uma elisão inteligente (não apenas correção básica)
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

  /**
   * GERAÇÃO COM ESTRATÉGIA AVANÇADA
   */
  private static async generateWithChorusStrategy(request: CompositionRequest): Promise<string> {
    console.log("[MetaComposer] 📝 Gerando com estratégia de refrão e elisões...")

    const applyFinalPolish = request.applyFinalPolish ?? true
    const isRewrite = !!request.originalLyrics
    const performanceMode = request.performanceMode || "standard"
    const useIntelligentElisions = request.useIntelligentElisions ?? true

    // GERA LETRA BASE
    let rawLyrics: string

    if (isRewrite) {
      rawLyrics = await this.generateStrictRewrite(request)
    } else {
      rawLyrics = await this.generateStrictLyrics(request)
    }

    // ✅ VALIDAÇÃO COM CONTADOR CORRETO
    const validationResult = this.validateLyricsSyllables(rawLyrics)
    if (validationResult.validityRatio < 0.8) {
      console.log(`⚠️ Validação fraca (${(validationResult.validityRatio * 100).toFixed(1)}%), aplicando correções...`)
      rawLyrics = await SyllableTyrant.enforceAbsoluteSyllables(rawLyrics, useIntelligentElisions)
    }

    // ✅ APLICA ELISÕES INTELIGENTES ADICIONAIS
    if (useIntelligentElisions) {
      rawLyrics = await this.applyIntelligentElisions(rawLyrics, request)
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

    console.log("✅ Geração concluída com elisões inteligentes")
    return finalLyrics
  }

  /**
   * ✅ NOVO: APLICA ELISÕES INTELIGENTES
   */
  private static async applyIntelligentElisions(lyrics: string, request: CompositionRequest): Promise<string> {
    console.log("[MetaComposer] 🎭 Aplicando elisões inteligentes...")
    
    const lines = lyrics.split("\n")
    const correctedLines: string[] = []
    const targetSyllables = request.syllableTarget?.ideal || 9
    let elisionsApplied = 0

    for (const line of lines) {
      if (line.trim() && !line.startsWith("[") && !line.startsWith("(") && !line.includes("Instruments:")) {
        const syllables = countPortugueseSyllables(line)
        
        if (syllables > targetSyllables) {
          const elisions = AdvancedElisionEngine.applyIntelligentElisions(line, targetSyllables)
          if (elisions.length > 0) {
            correctedLines.push(elisions[0])
            elisionsApplied++
            continue
          }
        }
      }
      correctedLines.push(line)
    }

    console.log(`✅ ${elisionsApplied} elisões inteligentes aplicadas`)
    return correctedLines.join("\n")
  }

  /**
   * GERA LETRA ESTRITA COM ELISÕES
   */
  private static async generateStrictLyrics(request: CompositionRequest): Promise<string> {
    let attempts = 0
    let bestLyrics = ""
    let bestScore = 0

    // ✅ PROMPT ATUALIZADO COM ELISÕES AVANÇADAS
    const elisionPrompt = `COMPOSITOR DE MEGA HITS - ELISÕES INTELIGENTES:

**TÉCNICAS AVANÇADAS DE ELISÃO:**
- FUSÃO VOCÁLICA: "de amor" → "d'amor", "que eu" → "qu'eu"
- REMOÇÃO DE ARTIGOS: "o travesseiro" → "travesseiro" 
- CONTRACÇÕES: "você" → "cê", "para" → "pra", "comigo" → "c'migo"
- ECONOMIA VERBAL: "ainda está" → "tá", "poderíamos" → "dava"
- SINÉDOQUE: "mulher que se apagou" → "rastro de mim"

**EXEMPLOS PRÁTICOS (7-11 sílabas):**
- "Teu cheiro ainda tá no travesseiro" → "Teu cheiro no travesseiro" (10→7)
- "Vai encontrar um rastro da mulher" → "Vai achar o rastro de mim" (9→7) 
- "E se um dia você voltar" → "Se um dia cê voltar" (8→6)

**MÁXIMO: ${request.syllableTarget?.max || 11} SÍLABAS POR VERSO**

TEMA: ${request.theme}
GÊNERO: ${request.genre}
HUMOR: ${request.mood || "adaptável"}

COMPONHA USANDO ELISÕES NATURAIS:`

    while (attempts < 1) {
      attempts++
      console.log(`[MetaComposer] Tentativa ${attempts}/1 com elisões...`)

      let response
      try {
        response = await generateText({
          model: "openai/gpt-4o",
          prompt: elisionPrompt,
          temperature: 0.7,
        })
      } catch (error) {
        console.error(`[MetaComposer] ❌ Erro na tentativa ${attempts}:`, error)
        continue
      }

      if (!response || !response.text) {
        console.error(`[MetaComposer] ❌ Resposta inválida na tentativa ${attempts}`)
        continue
      }

      const { text } = response
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

    return bestLyrics || "Não foi possível gerar letra válida."
  }

  /**
   * REESCRITA COM ELISÕES
   */
  private static async generateStrictRewrite(request: CompositionRequest): Promise<string> {
    if (!request.originalLyrics) {
      throw new Error("Original lyrics required for rewrite")
    }

    const rewritePrompt = `REESCRITOR PROFISSIONAL - ELISÕES INTELIGENTES:

**TÉCNICAS DE ELISÃO:**
- "de amor" → "d'amor", "que eu" → "qu'eu"
- Remove artigos: "o", "a", "um", "uma"
- Contrações: "você" → "cê", "para" → "pra"
- Economia verbal quando possível

LETRA ORIGINAL:
${request.originalLyrics}

TEMA: ${request.theme} 
GÊNERO: ${request.genre}

REESCREVA USANDO ELISÕES para ${request.syllableTarget?.ideal || 9} sílabas:`

    const { text } = await generateText({
      model: "openai/gpt-4o", 
      prompt: rewritePrompt,
      temperature: 0.5,
    })

    return text || request.originalLyrics
  }

  /**
   * VALIDA SÍLABAS COM CONTADOR CORRETO
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
        const syllables = countPortugueseSyllables(line) // ✅ CONTADOR CORRETO
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

  // ... (restante do código mantido igual - applyTerceiraViaCorrections, applyStrictPolish, etc)
}
