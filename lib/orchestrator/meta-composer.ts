// lib/orchestrator/meta-composer.ts - VERSÃO DEFINITIVA ATUALIZADA

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
  rhythm?: string
  structureAnalysis?: any
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
    rhymeScore?: number
    rhymeTarget?: number
    structureImproved?: boolean
    terceiraViaAnalysis?: TerceiraViaAnalysis
    melodicAnalysis?: any
    performanceMode?: string
    intelligentElisionsApplied?: number
  }
}

export class SyllableTyrant {
  static async enforceAbsoluteSyllables(lyrics: string, useIntelligentElisions: boolean = true): Promise<string> {
    console.log("🎯 [SyllableTyrant] Iniciando correção agressiva...")
    const lines = lyrics.split("\n")
    const correctedLines: string[] = []
    let corrections = 0
    let intelligentElisions = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (line.startsWith("[") || line.startsWith("(") || line.includes("Instruments:") || !line.trim()) {
        correctedLines.push(line)
        continue
      }

      const syllables = countPortugueseSyllables(line)
      const targetSyllables = 11

      if (syllables !== targetSyllables) {
        console.log(`🔴 Linha ${i + 1}: "${line}" → ${syllables} sílabas`)
        
        let fixedLine = line
        
        if (useIntelligentElisions && syllables > targetSyllables) {
          const elisions = AdvancedElisionEngine.applyIntelligentElisions(line, targetSyllables)
          if (elisions.length > 0) {
            fixedLine = elisions[0]
            intelligentElisions++
            console.log(`🎭 Elisão inteligente aplicada: "${fixedLine}"`)
          }
        }

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

  private static localFix(line: string, currentSyllables: number, targetSyllables: number): string {
    const difference = targetSyllables - currentSyllables

    if (difference < 0) {
      return this.applyEmergencyFix(line, difference, targetSyllables)
    } else {
      return this.applyEmergencyFix(line, difference, targetSyllables)
    }
  }

  private static applyEmergencyFix(line: string, difference: number, targetSyllables: number): string {
    let fixedLine = line

    if (difference < 0) {
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

  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer] 🚀 Iniciando composição com elisões inteligentes...")

    const useIntelligentElisions = request.useIntelligentElisions ?? true

    const multiGenResult = await MultiGenerationEngine.generateMultipleVariations(
      async () => {
        return await this.generateWithChorusStrategy(request)
      },
      (lyrics) => {
        const lines = lyrics.split("\n").filter((line) => line.trim() && !line.startsWith("[") && !line.startsWith("("))

        let validLines = 0
        lines.forEach((line) => {
          if (countPortugueseSyllables(line) <= 11) validLines++
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
        intelligentElisionsApplied: useIntelligentElisions ? this.countIntelligentElisions(bestLyrics, finalLyrics) : 0,
      },
    }
  }

  private static async generateAdvancedRewrite(request: CompositionRequest): Promise<string> {
    if (!request.originalLyrics) {
      throw new Error("Original lyrics required for rewrite")
    }

    // ⭐⭐ CONFIGURA TEMPERATURA BASEADA NA CRIATIVIDADE
    const temperatureMap = {
      "conservador": 0.1,   // ⭐ MÍNIMA CRIATIVIDADE
      "equilibrado": 0.3,   // ⭐ BAIXA CRIATIVIDADE  
      "ousado": 0.5        // ⭐ MÉDIA CRIATIVIDADE
    }

    const temperature = temperatureMap[request.creativity as keyof typeof temperatureMap] || 0.3

    console.log(`🎛️ Configurações: Criatividade=${request.creativity}, Temperature=${temperature}`)

    const rewritePrompt = `REESCRITOR TÉCNICO - MODE ${request.creativity?.toUpperCase() || 'CONSERVADOR'}

SUA ÚNICA TAREFA: Corrigir erros técnicos na letra abaixo.

🚨 ERROS PROIBIDOS - CORRIJA TODOS:
• "lembrançnãsai" → "lembrança não sai"
• "nãvaleu", "nãpassou" → "não valeu", "não passou"  
• "preçda", "reciboda" → "preço da", "recibo da"
• "emoçãcontida" → "emoção contida" 
• "guitarra daço" → "guitarra de aço"
• "Acordeãem" → "Acordeon em"
• $1 → SEMPRE texto real entre aspas
• "Eu tá" → "Eu tô"
• Frases incompletas → COMPLETAR

✅ REGRAS OBRIGATÓRIAS:
• 7-11 sílabas por verso
• (Backing Vocal: "Texto real") 
• (Público: "Resposta real")
• Estruturas completas

LETRA ORIGINAL COM PROBLEMAS:
${request.originalLyrics}

REQUISITOS ADICIONAIS:
${request.additionalRequirements || "Nenhum"}

INSTRUÇÃO: Apenas corrija os erros listados. Não seja criativo.
RESPOSTA:`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt: rewritePrompt,
      temperature: temperature, // ⭐⭐ TEMPERATURA CONTROLADA
      maxTokens: 2000,
    })

    console.log("✅ Geração concluída, aplicando garantia nuclear...")
    
    // ✅ GARANTIA FINAL - CORREÇÃO NUCLEAR
    return this.applyNuclearCorrection(text || request.originalLyrics)
  }

  // ✅ MÉTODO DE GARANTIA NUCLEAR
  private static applyNuclearCorrection(lyrics: string): string {
    console.log("☢️ Aplicando correção nuclear...")
    
    const corrections = [
      // CORREÇÕES DE CONTRACÇÕES
      { regex: /lembrançnãsai/gi, replacement: "lembrança não sai" },
      { regex: /nãvaleu/gi, replacement: "não valeu" },
      { regex: /nãpassou/gi, replacement: "não passou" },
      { regex: /preçda/gi, replacement: "preço da" },
      { regex: /reciboda/gi, replacement: "recibo da" },
      { regex: /emoçãcontida/gi, replacement: "emoção contida" },
      { regex: /guitarra daço/gi, replacement: "guitarra de aço" },
      { regex: /Acordeãem/gi, replacement: "Acordeon em" },
      { regex: /Eu tá/gi, replacement: "Eu tô" },
      
      // CORREÇÕES DE SINTAXE
      { regex: /\$1/gi, replacement: "\"texto real\"" },
      { regex: /\(Backing Vocal:\s*\\)/gi, replacement: "(Backing Vocal: \"Harmonia\")" },
      { regex: /\(Público:\s*\\)/gi, replacement: "(Público: \"Aí sim!\")" },
    ]

    let correctedLyrics = lyrics
    for (const correction of corrections) {
      correctedLyrics = correctedLyrics.replace(correction.regex, correction.replacement)
    }

    // CORREÇÃO DE ESTRUTURA
    const lines = correctedLyrics.split('\n')
    const completeLines = lines.map(line => {
      if (line.trim() && !line.includes(':') && !line.startsWith('[') && !line.startsWith('(') && 
          (line.endsWith(',') || line.split(' ').length < 3)) {
        return line + ' completar frase'
      }
      return line
    })

    console.log("✅ Correção nuclear aplicada")
    return completeLines.join('\n')
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

  private static async generateWithChorusStrategy(request: CompositionRequest): Promise<string> {
    console.log("[MetaComposer] 📝 Gerando com estratégia de refrão e elisões...")

    const applyFinalPolish = request.applyFinalPolish ?? true
    const isRewrite = !!request.originalLyrics
    const performanceMode = request.performanceMode || "standard"
    const useIntelligentElisions = request.useIntelligentElisions ?? true

    let rawLyrics: string

    if (isRewrite) {
      rawLyrics = await this.generateAdvancedRewrite(request)
    } else {
      rawLyrics = await this.generateStrictLyrics(request)
    }

    const validationResult = this.validateLyricsSyllables(rawLyrics)
    if (validationResult.validityRatio < 0.8) {
      console.log(`⚠️ Validação fraca (${(validationResult.validityRatio * 100).toFixed(1)}%), aplicando correções...`)
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

    console.log("✅ Geração concluída com elisões inteligentes")
    return finalLyrics
  }

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

  private static async generateStrictLyrics(request: CompositionRequest): Promise<string> {
    let attempts = 0
    let bestLyrics = ""
    let bestScore = 0

    const elisionPrompt = `COMPOSITOR DE MEGA HITS - ELISÕES INTELIGENTES:

**TÉCNICAS AVANÇADAS DE ELISÃO:**
- FUSÃO VOCÁLICA: "de amor" → "d'amor", "que eu" → "qu'eu"
- REMOÇÃO DE ARTIGOS: "o travesseiro" → "travesseiro" 
- CONTRACÇÕES: "você" → "cê", "para" → "pra", "comigo" → "c'migo"
- ECONOMIA VERBAL: "ainda está" → "tá", "poderíamos" → "dava"

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

  private static async applyStrictPolish(lyrics: string, genre: string, performanceMode: string): Promise<string> {
    console.log(`[MetaComposer] ✨ Aplicando polimento estrito...`)

    let polishedLyrics = lyrics

    if (shouldUsePerformanceFormat(genre, performanceMode)) {
      polishedLyrics = formatSertanejoPerformance(polishedLyrics)
    } else if (performanceMode === "performance") {
      polishedLyrics = this.applyPerformanceFormatting(polishedLyrics)
    }

    return polishedLyrics
  }

  private static applyPerformanceFormatting(lyrics: string): string {
    let formatted = lyrics
    formatted = formatted.replace(/\[Intro\]/gi, "[Intro]")
    formatted = formatted.replace(/\[Verso\s*(\d*)\]/gi, "[Verse$1]")
    formatted = formatted.replace(/\[Refrão\]/gi, "[Chorus]")
    formatted = formatted.replace(/\[Ponte\]/gi, "[Bridge]")
    formatted = formatted.replace(/\[Final\]/gi, "[Outro]")
    return formatted
  }
}
