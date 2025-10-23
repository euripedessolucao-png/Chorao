// lib/orchestrator/meta-composer.ts - VERSÃO MEGA AVANÇADA

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
  decade?: "60s" | "70s" | "80s" | "90s" | "2000s" | "2010s" | "2020s"
  regionalStyle?: "nordestino" | "sulista" | "mineiro" | "carioca" | "paulista" | "universal"
  complexity?: "simples" | "intermediario" | "complexo"
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
    genreAnalysis?: any
    decadeStyle?: string
    regionalCharacteristics?: string[]
  }
}

// ✅ ANÁLISE DE GÊNERO AVANÇADA (sem duplicação)
class GenreIntelligence {
  private static readonly GENRE_PROFILES = {
    "Sertanejo": {
      syllables: { min: 7, max: 11, ideal: 9 },
      characteristics: ["campo", "amor", "sofrência", "raiz"],
      vocabulary: ["rancho", "cavalo", "estrada", "saudade", "amor"],
      elisionStyle: "moderate"
    },
    "Sertanejo Universitário": {
      syllables: { min: 6, max: 10, ideal: 8 },
      characteristics: ["festa", "juventude", "paquera", "balada"],
      vocabulary: ["festão", "cerveja", "pegação", "balada", "fim de semana"],
      elisionStyle: "aggressive"
    },
    "Sertanejo Sofrência": {
      syllables: { min: 7, max: 11, ideal: 9 },
      characteristics: ["drama", "traição", "sofrimento", "paixão"],
      vocabulary: ["traição", "sofrência", "dói", "choro", "saudade"],
      elisionStyle: "moderate"
    },
    "Pagode": {
      syllables: { min: 7, max: 10, ideal: 8 },
      characteristics: ["alegria", "romance", "comunidade", "descontração"],
      vocabulary: ["amor", "coração", "sorriso", "festa", "samba"],
      elisionStyle: "moderate"
    },
    "Funk": {
      syllables: { min: 5, max: 9, ideal: 7 },
      characteristics: ["batida", "ostentação", "favela", "poder"],
      vocabulary: ["bumbum", "quadrada", "fluxo", "pancadão", "visão"],
      elisionStyle: "aggressive"
    },
    "Forró": {
      syllables: { min: 8, max: 12, ideal: 10 },
      characteristics: ["nordestino", "sanfona", "festa", "romance"],
      vocabulary: ["xote", "sanfona", "amor", "dança", "forró"],
      elisionStyle: "regional"
    }
  }

  static analyzeGenre(genre: string, theme: string, mood: string) {
    const profile = this.GENRE_PROFILES[genre as keyof typeof this.GENRE_PROFILES] || 
                   this.GENRE_PROFILES.Sertanejo
    
    return {
      syllableTarget: profile.syllables,
      characteristics: profile.characteristics,
      vocabulary: profile.vocabulary,
      elisionStyle: profile.elisionStyle,
      recommendedThemes: this.getRecommendedThemes(genre, theme, mood)
    }
  }

  private static getRecommendedThemes(genre: string, theme: string, mood: string): string[] {
    const themeMap = {
      "Sertanejo Sofrência": ["traição", "saudade", "paixão não correspondida", "solidão"],
      "Sertanejo Universitário": ["paquera", "festas", "amizade", "juventude"],
      "Pagode": ["amor", "romance", "felicidade", "relacionamento"],
      "Forró": ["casamento", "festa junina", "amor nordestino", "saudade"],
      "Funk": ["ostentação", "poder", "sedução", "vida na favela"]
    }

    return themeMap[genre as keyof typeof themeMap] || ["amor", "vida", "sentimentos"]
  }

  static getGenrePromptEnhancements(genre: string): string {
    const enhancements = {
      "Sertanejo Sofrência": `💔 TÉCNICAS DE SOFRÊNCIA:
- Use dramatização emocional: "ai", "dói", "chorar"
- Pausas dramáticas: "...", "—"
- Metáforas de dor: "facada", "ferida", "vazio"
- Contraste entre passado feliz e presente triste`,

      "Sertanejo Universitário": `🎓 TÉCNICAS UNIVERSITÁRIAS:
- Linguagem jovem: "tá", "cê", "pra"
- Referências a festas e baladas
- Tom descontraído e divertido
- Paquera e conquista`,

      "Funk": `🔥 TÉCNICAS DE FUNK:
- Batidas marcantes e repetição
- Linguagem das periferias
- Empoderamento e ostentação
- Frases curtas e impactantes`,

      "Pagode": `🎵 TÉCNICAS DE PAGODE:
- Alegria e descontração
- Convite para dançar
- Romance leve e feliz
- Comunidade e amizade`
    }

    return enhancements[genre as keyof typeof enhancements] || ""
  }
}

export class SyllableTyrant {
  static async enforceAbsoluteSyllables(lyrics: string, useIntelligentElisions: boolean = true, genre?: string): Promise<string> {
    console.log("🎯 [SyllableTyrant] Iniciando correção avançada...")
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
            // Filtra elisões apropriadas para o gênero
            const genreAppropriate = this.filterGenreAppropriateElisions(elisions, genre)
            if (genreAppropriate.length > 0) {
              fixedLine = genreAppropriate[0]
              intelligentElisions++
              console.log(`🎭 Elisão inteligente aplicada: "${fixedLine}"`)
            }
          }
        }

        const fixedSyllables = countPortugueseSyllables(fixedLine)
        if (fixedSyllables !== targetSyllables) {
          fixedLine = this.applyGenreSpecificFix(fixedLine, fixedSyllables, targetSyllables, genre)
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

  private static filterGenreAppropriateElisions(elisions: string[], genre?: string): string[] {
    if (!genre) return elisions.slice(0, 1)

    // Para gêneros sofisticados, evita elisões muito agressivas
    if (["MPB", "Bossa Nova"].includes(genre)) {
      return elisions.filter(elision => 
        !elision.includes("c'") && 
        elision.split(" ").length > 2
      )
    }

    return elisions
  }

  private static applyGenreSpecificFix(line: string, currentSyllables: number, targetSyllables: number, genre?: string): string {
    let fixedLine = line

    if (currentSyllables > targetSyllables) {
      // Correções específicas por gênero
      if (genre === "Funk" || genre === "Sertanejo Universitário") {
        fixedLine = fixedLine.replace(/\b(o |a |um |uma )/gi, '')
        fixedLine = fixedLine.replace(/\b(para)\b/gi, 'pra')
        fixedLine = fixedLine.replace(/\b(você)\b/gi, 'cê')
        fixedLine = fixedLine.replace(/\b(está|estou)\b/gi, 'tá')
      } else {
        // Correção genérica para outros gêneros
        fixedLine = fixedLine.replace(/\b(para)\b/gi, 'pra')
        fixedLine = fixedLine.replace(/\b(você)\b/gi, 'cê')
      }
    }

    return fixedLine
  }
}

export class MetaComposer {
  private static readonly MAX_ITERATIONS = 2
  private static readonly ABSOLUTE_MAX_SYLLABLES = 11

  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer] 🚀 INICIANDO COMPOSIÇÃO MEGA AVANÇADA...")

    // ✅ ANÁLISE INTELIGENTE DO GÊNERO
    const genreAnalysis = GenreIntelligence.analyzeGenre(
      request.genre, 
      request.theme, 
      request.mood
    )

    const useIntelligentElisions = request.useIntelligentElisions ?? true
    const syllableTarget = request.syllableTarget || genreAnalysis.syllableTarget

    console.log(`[MetaComposer] 🎵 Gênero: ${request.genre}`, {
      sílabas: syllableTarget,
      características: genreAnalysis.characteristics,
      estiloElisão: genreAnalysis.elisionStyle
    })

    const multiGenResult = await MultiGenerationEngine.generateMultipleVariations(
      async () => {
        return await this.generateWithAdvancedStrategy(request, genreAnalysis)
      },
      (lyrics) => this.calculateAdvancedScore(lyrics, request, genreAnalysis),
      2,
    )

    const bestLyrics = multiGenResult.variations[multiGenResult.bestVariationIndex].lyrics
    const bestScore = multiGenResult.bestScore

    console.log(`[MetaComposer] 🏆 Melhor versão: ${bestScore.toFixed(1)}/100`)

    console.log("🎯 Aplicando garantia final mega avançada...")
    const finalLyrics = await SyllableTyrant.enforceAbsoluteSyllables(
      bestLyrics, 
      useIntelligentElisions, 
      request.genre
    )

    return {
      lyrics: finalLyrics,
      title: this.extractTitle(finalLyrics, request),
      metadata: {
        iterations: multiGenResult.variations.length,
        finalScore: bestScore,
        polishingApplied: true,
        preservedChorusesUsed: request.preservedChoruses ? request.preservedChoruses.length > 0 : false,
        performanceMode: request.performanceMode || "standard",
        intelligentElisionsApplied: useIntelligentElisions ? this.countIntelligentElisions(bestLyrics, finalLyrics) : 0,
        genreAnalysis: genreAnalysis,
        decadeStyle: request.decade,
        regionalCharacteristics: request.regionalStyle ? [request.regionalStyle] : []
      },
    }
  }

  private static calculateAdvancedScore(
    lyrics: string, 
    request: CompositionRequest, 
    genreAnalysis: any
  ): number {
    const lines = lyrics.split("\n").filter((line) => line.trim() && !line.startsWith("[") && !line.startsWith("("))

    let validLines = 0
    lines.forEach((line) => {
      const syllables = countPortugueseSyllables(line)
      if (syllables <= 11) {
        validLines++
      }
    })

    const syllableScore = (validLines / lines.length) * 100
    const auditResult = LyricsAuditor.audit(lyrics, request.genre, request.theme)
    const genreScore = this.calculateGenreAdherence(lyrics, genreAnalysis)
    
    // Score avançado: sílabas + qualidade + aderência ao gênero
    const finalScore = syllableScore * 0.6 + auditResult.score * 0.25 + genreScore * 0.15

    return finalScore
  }

  private static calculateGenreAdherence(lyrics: string, genreAnalysis: any): number {
    let score = 50 // Base

    // Verifica vocabulário típico
    genreAnalysis.vocabulary.forEach((word: string) => {
      if (lyrics.toLowerCase().includes(word.toLowerCase())) {
        score += 5
      }
    })

    // Verifica características
    genreAnalysis.characteristics.forEach((char: string) => {
      if (this.hasCharacteristic(lyrics, char)) {
        score += 10
      }
    })

    return Math.min(score, 100)
  }

  private static hasCharacteristic(lyrics: string, characteristic: string): boolean {
    const characteristicMap = {
      "drama": ["chorar", "sofrer", "dói", "traição", "ai"],
      "alegria": ["feliz", "sorrir", "festa", "alegria", "riso"],
      "festa": ["balada", "festão", "cerveja", "dançar", "noite"],
      "nordestino": ["nordeste", "sanfona", "xote", "forró"]
    }

    const words = characteristicMap[characteristic as keyof typeof characteristicMap]
    if (!words) return false

    return words.some(word => lyrics.toLowerCase().includes(word))
  }

  private static async generateWithAdvancedStrategy(
    request: CompositionRequest, 
    genreAnalysis: any
  ): Promise<string> {
    console.log("[MetaComposer] 📝 Gerando com estratégia mega avançada...")

    const isRewrite = !!request.originalLyrics
    const performanceMode = request.performanceMode || "standard"
    const useIntelligentElisions = request.useIntelligentElisions ?? true

    let rawLyrics: string

    if (isRewrite) {
      rawLyrics = await this.generateAdvancedRewrite(request, genreAnalysis)
    } else {
      rawLyrics = await this.generateAdvancedCreation(request, genreAnalysis)
    }

    // ✅ VALIDAÇÃO AVANÇADA
    const validationResult = this.validateLyricsSyllables(rawLyrics)
    if (validationResult.validityRatio < 0.8) {
      console.log(`⚠️ Validação fraca (${(validationResult.validityRatio * 100).toFixed(1)}%), aplicando correções...`)
      rawLyrics = await SyllableTyrant.enforceAbsoluteSyllables(rawLyrics, useIntelligentElisions, request.genre)
    }

    // ✅ ELISÕES INTELIGENTES
    if (useIntelligentElisions) {
      rawLyrics = await this.applyAdvancedElisions(rawLyrics, request, genreAnalysis)
    }

    // ✅ TERCEIRA VIA
    const terceiraViaAnalysis = analisarTerceiraVia(rawLyrics, request.genre, request.theme)
    if (terceiraViaAnalysis && terceiraViaAnalysis.score_geral < 75) {
      rawLyrics = await this.applyTerceiraViaCorrections(rawLyrics, request, terceiraViaAnalysis)
    }

    // ✅ POLIMENTO FINAL
    let finalLyrics = rawLyrics
    if (request.applyFinalPolish ?? true) {
      finalLyrics = await this.applyAdvancedPolish(finalLyrics, request.genre, performanceMode, genreAnalysis)
    }

    // ✅ VALIDAÇÕES FINAIS
    const punctuationResult = PunctuationValidator.validate(finalLyrics)
    if (!punctuationResult.isValid) {
      finalLyrics = punctuationResult.correctedLyrics
    }

    const stackingResult = LineStacker.stackLines(finalLyrics)
    finalLyrics = stackingResult.stackedLyrics

    console.log("✅ Geração mega avançada concluída")
    return finalLyrics
  }

  private static async generateAdvancedCreation(request: CompositionRequest, genreAnalysis: any): Promise<string> {
    const advancedPrompt = this.buildAdvancedPrompt(request, genreAnalysis)
    
    let attempts = 0
    let bestLyrics = ""
    let bestScore = 0

    while (attempts < 2) {
      attempts++
      console.log(`[MetaComposer] Tentativa ${attempts}/2 avançada...`)

      let response
      try {
        response = await generateText({
          model: "openai/gpt-4o",
          prompt: advancedPrompt,
          temperature: this.getTemperature(request.creativity),
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

    return bestLyrics || this.getFallbackLyrics(request, genreAnalysis)
  }

  private static buildAdvancedPrompt(request: CompositionRequest, genreAnalysis: any): string {
    const { syllableTarget, characteristics, vocabulary } = genreAnalysis
    
    const genreEnhancements = GenreIntelligence.getGenrePromptEnhancements(request.genre)
    
    return `🎵 COMPOSITOR MEGA BRASILEIRO - ESPECIALISTA EM ${request.genre.toUpperCase()}

**PERFIL DO GÊNERO:**
- CARACTERÍSTICAS: ${characteristics.join(", ")}
- VOCABULÁRIO TÍPICO: ${vocabulary.join(", ")}
- SÍLABAS: ${syllableTarget.min}-${syllableTarget.max} por verso (ideal: ${syllableTarget.ideal})

${genreEnhancements}

**TÉCNICAS DE ESCRITA:**
- Use elisões inteligentes: "de amor" → "d'amor", "para" → "pra"
- Mantenha versos entre ${syllableTarget.min}-${syllableTarget.max} sílabas
- Foque em ${characteristics[0]} e ${characteristics[1]}

**CONTEXTO:**
- TEMA: ${request.theme}
- HUMOR: ${request.mood}
- ${request.decade ? `DÉCADA: ${request.decade}` : ''}
- ${request.regionalStyle ? `ESTILO REGIONAL: ${request.regionalStyle}` : ''}

COMPONHA UMA LETRA AUTÊNTICA E ORIGINAL:`
  }

  private static getTemperature(creativity: string = "equilibrado"): number {
    const temps = {
      "conservador": 0.5,
      "equilibrado": 0.7,
      "ousado": 0.9
    }
    return temps[creativity as keyof typeof temps] || 0.7
  }

  private static async generateAdvancedRewrite(request: CompositionRequest, genreAnalysis: any): Promise<string> {
    if (!request.originalLyrics) {
      throw new Error("Original lyrics required for rewrite")
    }

    const rewritePrompt = `🔄 REESCRITOR MEGA BRASILEIRO - ${request.genre.toUpperCase()}

**PERFIL DO GÊNERO:**
- CARACTERÍSTICAS: ${genreAnalysis.characteristics.join(", ")}
- SÍLABAS: ${genreAnalysis.syllableTarget.min}-${genreAnalysis.syllableTarget.max}

**LETRA ORIGINAL:**
${request.originalLyrics}

**CONTEXTO:**
- TEMA: ${request.theme}
- GÊNERO: ${request.genre}
- ${request.decade ? `DÉCADA: ${request.decade}` : ''}

REESCREVA MANTENDO A ESSÊNCIA MAS ADAPTANDO AO GÊNERO:`

    const { text } = await generateText({
      model: "openai/gpt-4o", 
      prompt: rewritePrompt,
      temperature: 0.6,
    })

    return text || request.originalLyrics
  }

  private static async applyAdvancedElisions(
    lyrics: string, 
    request: CompositionRequest, 
    genreAnalysis: any
  ): Promise<string> {
    console.log("[MetaComposer] 🎭 Aplicando elisões avançadas...")
    
    const lines = lyrics.split("\n")
    const correctedLines: string[] = []
    const targetSyllables = genreAnalysis.syllableTarget.ideal
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

    console.log(`✅ ${elisionsApplied} elisões avançadas aplicadas`)
    return correctedLines.join("\n")
  }

  private static async applyAdvancedPolish(
    lyrics: string, 
    genre: string, 
    performanceMode: string, 
    genreAnalysis: any
  ): Promise<string> {
    console.log(`[MetaComposer] ✨ Aplicando polimento avançado...`)

    let polishedLyrics = lyrics

    // Formatação de performance específica por gênero
    if (shouldUsePerformanceFormat(genre, performanceMode)) {
      polishedLyrics = formatSertanejoPerformance(polishedLyrics)
    } else if (performanceMode === "performance") {
      polishedLyrics = this.applyPerformanceFormatting(polishedLyrics, genre)
    }

    // Adiciona elementos específicos do gênero
    polishedLyrics = this.applyGenreFinalTouches(polishedLyrics, genre, genreAnalysis)

    return polishedLyrics
  }

  private static applyPerformanceFormatting(lyrics: string, genre: string): string {
    let formatted = lyrics
    
    // Formatação específica por gênero
    if (genre === "Funk") {
      formatted = formatted.replace(/\[Refrão\]/gi, "[HOOK]")
    } else if (genre.includes("Sertanejo")) {
      formatted = formatted.replace(/\[Verso\s*(\d*)\]/gi, "[V$1]")
                           .replace(/\[Refrão\]/gi, "[R]")
    }

    return formatted
  }

  private static applyGenreFinalTouches(lyrics: string, genre: string, genreAnalysis: any): string {
    let touched = lyrics

    // Adiciona elementos específicos do gênero
    if (genre === "Forró" && !touched.includes("xote")) {
      touched += "\n\n(Ritmo: xote | Estilo: forró pé-de-serra)"
    }

    if (genre === "Funk" && !touched.includes("beat")) {
      touched += "\n\n(Beat: pancadão | Estilo: funk ostentação)"
    }

    if (genre === "Sertanejo Sofrência" && !touched.includes("acordeon")) {
      touched += "\n\n(Instrumental: acordeon lamentoso | Clima: sofrência)"
    }

    return touched
  }

  private static getFallbackLyrics(request: CompositionRequest, genreAnalysis: any): string {
    const fallbacks = {
      "Sertanejo Sofrência": `[Verso 1]
Teu cheiro ainda tá no travesseiro
Cada canto me lembra o que a gente viveu
[Refrão]
Ai, que saudade do teu abraço
Dos teus beijos, do teu jeito
Esse vazio no peito não passa
E a lembrança não sai do peito`,

      "Sertanejo Universitário": `[Verso 1]
Sextou e o festão tá armado
Galera toda no grau, cerveja estralando
[Refrão]
É só chegar e se soltar
No embalo do sertanejo universitário
A noite é nossa, vamos curtir
Até o sol raiar no canavial`,

      "Funk": `[Refrão]
Bumbum granada, empina na pista
Essa here menina é uma visionista
[Verso]
No fluxo da quebrada, mandando ver
Com atitude, fazendo acontecer
[Refrão]
Bumbum granada, empina na pista
Essa menina é uma visionista`,

      "Pagode": `[Verso 1]
Chegou o fim de semana, vamos curtir
O pagode tá rolando, vamos sorrir
[Refrão]
É pagode, é alegria
É a nossa comunidade em harmonia
Vamos todos celebrar
A amizade e o amor sem parar`
    }

    return fallbacks[request.genre as keyof typeof fallbacks] || 
           `[Verso 1]
Composição em ${request.genre}
Com ${genreAnalysis.characteristics.join(" e ")}
[Refrão]
Letra gerada automaticamente
Com técnicas de composição moderna`
  }

  // ... (mantidos os métodos existentes do seu código original)

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
        return line.split(":")[1]?.trim() || `${request.theme} - ${request.genre}`
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
}
