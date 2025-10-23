// lib/orchestrator/meta-composer.ts - VERSÃO MEGA TURBINADA

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
import { BrazilianGenreAnalyzer } from "./brazilian-genre-analyzer"

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

export class BrazilianGenreAnalyzer {
  private static readonly GENRE_PROFILES = {
    // ✅ SAMBA & PAGODE
    "Samba": {
      syllables: { min: 7, max: 11, ideal: 9 },
      structure: "VERSO-REFRAO-PONTE",
      characteristics: ["malandragem", "batucada", "gingado", "alegria"],
      vocabulary: ["nega", "malandro", "batucada", "samba", "festa"],
      elisionStyle: "moderate"
    },
    "Pagode": {
      syllables: { min: 7, max: 10, ideal: 8 },
      structure: "VERSO-REFRAO",
      characteristics: ["romance", "amor", "relacionamentos", "descontraído"],
      vocabulary: ["amor", "coração", "paixão", "sorriso", "dancar"],
      elisionStyle: "moderate"
    },

    // ✅ FORRÓ & BAIÃO
    "Forró": {
      syllables: { min: 8, max: 12, ideal: 10 },
      structure: "VERSO-REFRAO-PONTE",
      characteristics: ["nordestino", "sanfona", "casamento", "festa"],
      vocabulary: ["xote", "sanfona", "Nordeste", "amor", "festa"],
      elisionStyle: "regional"
    },
    "Baião": {
      syllables: { min: 8, max: 13, ideal: 11 },
      structure: "VERSO-REFRAO",
      characteristics: ["nordestino", "Luiz Gonzaga", "cangaço", "secão"],
      vocabulary: ["asadeira", "cangaço", "juazeiro", "xaxado", "rei do baião"],
      elisionStyle: "regional"
    },

    // ✅ MPB & BOSSA NOVA
    "MPB": {
      syllables: { min: 9, max: 14, ideal: 12 },
      structure: "VERSO-REFRAO-PONTE-SOLO",
      characteristics: ["poético", "crítico", "sofisticado", "melódico"],
      vocabulary: ["tempo", "vida", "sonho", "paz", "amor", "mundo"],
      elisionStyle: "light"
    },
    "Bossa Nova": {
      syllables: { min: 8, max: 13, ideal: 11 },
      structure: "VERSO-REFRAO",
      characteristics: ["suave", "sofisticado", "praia", "romântico"],
      vocabulary: ["onda", "mar", "praia", "amor", "samba", "batucada"],
      elisionStyle: "light"
    },

    // ✅ SERTANEJO (TODAS AS VARIEDADES)
    "Sertanejo": {
      syllables: { min: 7, max: 11, ideal: 9 },
      structure: "VERSO-REFRAO-PONTE",
      characteristics: ["campo", "amor", "sofrência", "raiz"],
      vocabulary: ["rancho", "cavalo", "estrada", "saudade", "amor"],
      elisionStyle: "moderate"
    },
    "Sertanejo Universitário": {
      syllables: { min: 6, max: 10, ideal: 8 },
      structure: "VERSO-REFRAO",
      characteristics: ["festa", "juventude", "paquera", "balada"],
      vocabulary: ["festão", "cerveja", "pegação", "balada", "fim de semana"],
      elisionStyle: "aggressive"
    },
    "Sertanejo Sofrência": {
      syllables: { min: 7, max: 11, ideal: 9 },
      structure: "VERSO-REFRAO-PONTE-SOLO",
      characteristics: ["drama", "traição", "sofrimento", "paixão"],
      vocabulary: ["traição", "sofrência", "dói", "choro", "saudade"],
      elisionStyle: "moderate"
    },

    // ✅ FUNK & POP BRASILEIRO
    "Funk": {
      syllables: { min: 5, max: 9, ideal: 7 },
      structure: "REFRAO-VERSO",
      characteristics: ["batida", "pancadão", "favela", "ostentação"],
      vocabulary: ["bumbum", "quadrada", "favela", "fluxo", "pancadão"],
      elisionStyle: "aggressive"
    },
    "Pop": {
      syllables: { min: 7, max: 11, ideal: 9 },
      structure: "VERSO-REFRAO-PONTE",
      characteristics: ["comercial", "radiofônico", "universal", "dançante"],
      vocabulary: ["amor", "vida", "noite", "dança", "felicidade"],
      elisionStyle: "moderate"
    },

    // ✅ ROCK & OUTROS
    "Rock": {
      syllables: { min: 8, max: 12, ideal: 10 },
      structure: "VERSO-REFRAO-SOLO",
      characteristics: ["rebelde", "energético", "guitarra", "atitude"],
      vocabulary: ["liberdade", "revolução", "grito", "estrada", "noite"],
      elisionStyle: "light"
    },
    "Gospel": {
      syllables: { min: 8, max: 12, ideal: 10 },
      structure: "VERSO-REFRAO-PONTE",
      characteristics: ["fé", "deus", "esperança", "louvor"],
      vocabulary: ["deus", "fé", "esperança", "milagre", "glória"],
      elisionStyle: "light"
    }
  }

  static analyzeGenre(genre: string, theme: string, mood: string) {
    const profile = this.GENRE_PROFILES[genre as keyof typeof this.GENRE_PROFILES] || this.GENRE_PROFILES.Sertanejo
    
    return {
      syllableTarget: profile.syllables,
      structure: profile.structure,
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
      "Funk": ["ostentação", "poder", "sedução", "vida na favela"],
      "MPB": ["existência", "tempo", "sociedade", "natureza"]
    }

    return themeMap[genre as keyof typeof themeMap] || ["amor", "vida", "sentimentos"]
  }
}

export class MegaComposer {
  private static readonly MAX_ITERATIONS = 2
  private static readonly ABSOLUTE_MAX_SYLLABLES = 14

  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MegaComposer] 🚀 INICIANDO COMPOSIÇÃO MEGA TURBINADA")

    // ✅ ANÁLISE AVANÇADA DO GÊNERO
    const genreAnalysis = BrazilianGenreAnalyzer.analyzeGenre(
      request.genre, 
      request.theme, 
      request.mood
    )

    const useIntelligentElisions = request.useIntelligentElisions ?? true
    const syllableTarget = request.syllableTarget || genreAnalysis.syllableTarget

    console.log(`[MegaComposer] 🎵 Gênero: ${request.genre}`, {
      sílabas: syllableTarget,
      estrutura: genreAnalysis.structure,
      estiloElisão: genreAnalysis.elisionStyle
    })

    const multiGenResult = await MultiGenerationEngine.generateMultipleVariations(
      async () => {
        return await this.generateWithAdvancedStrategy(request, genreAnalysis)
      },
      (lyrics) => this.calculateMegaScore(lyrics, request, genreAnalysis),
      2, // Mais variações para qualidade
    )

    const bestLyrics = multiGenResult.variations[multiGenResult.bestVariationIndex].lyrics
    const bestScore = multiGenResult.bestScore

    console.log(`[MegaComposer] 🏆 Melhor versão: ${bestScore.toFixed(1)}/100`)

    // ✅ APLICA CORREÇÕES MEGA AVANÇADAS
    console.log("🎯 Aplicando garantia final mega turbinada...")
    const finalLyrics = await this.applyMegaCorrections(bestLyrics, request, genreAnalysis)

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

  /**
   * GERAÇÃO COM ESTRATÉGIA MEGA AVANÇADA
   */
  private static async generateWithAdvancedStrategy(
    request: CompositionRequest, 
    genreAnalysis: any
  ): Promise<string> {
    console.log("[MegaComposer] 📝 Gerando com estratégia mega avançada...")

    const isRewrite = !!request.originalLyrics
    const performanceMode = request.performanceMode || "standard"
    const useIntelligentElisions = request.useIntelligentElisions ?? true

    let rawLyrics: string

    if (isRewrite) {
      rawLyrics = await this.generateMegaRewrite(request, genreAnalysis)
    } else {
      rawLyrics = await this.generateMegaCreation(request, genreAnalysis)
    }

    // ✅ VALIDAÇÃO MEGA
    const validationResult = this.validateMegaSyllables(rawLyrics, genreAnalysis.syllableTarget)
    if (validationResult.validityRatio < 0.8) {
      console.log(`⚠️ Validação fraca (${(validationResult.validityRatio * 100).toFixed(1)}%), aplicando correções mega...`)
      rawLyrics = await this.applyMegaCorrections(rawLyrics, request, genreAnalysis)
    }

    // ✅ ELISÕES INTELIGENTES MEGA
    if (useIntelligentElisions) {
      rawLyrics = await this.applyMegaElisions(rawLyrics, request, genreAnalysis)
    }

    // ✅ TERCEIRA VIA MEGA
    const terceiraViaAnalysis = analisarTerceiraVia(rawLyrics, request.genre, request.theme)
    if (terceiraViaAnalysis && terceiraViaAnalysis.score_geral < 75) {
      rawLyrics = await this.applyTerceiraViaCorrections(rawLyrics, request, terceiraViaAnalysis)
    }

    // ✅ POLIMENTO MEGA FINAL
    let finalLyrics = rawLyrics
    if (request.applyFinalPolish ?? true) {
      finalLyrics = await this.applyMegaPolish(finalLyrics, request.genre, performanceMode, genreAnalysis)
    }

    // ✅ VALIDAÇÕES MEGA FINAIS
    const punctuationResult = PunctuationValidator.validate(finalLyrics)
    if (!punctuationResult.isValid) {
      finalLyrics = punctuationResult.correctedLyrics
    }

    const stackingResult = LineStacker.stackLines(finalLyrics)
    finalLyrics = stackingResult.stackedLyrics

    console.log("✅ Geração mega concluída")
    return finalLyrics
  }

  /**
   * CRIAÇÃO MEGA - OTIMIZADA POR GÊNERO
   */
  private static async generateMegaCreation(request: CompositionRequest, genreAnalysis: any): Promise<string> {
    const megaPrompt = this.buildMegaPrompt(request, genreAnalysis)
    
    let attempts = 0
    let bestLyrics = ""
    let bestScore = 0

    while (attempts < 2) {
      attempts++
      console.log(`[MegaComposer] Tentativa ${attempts}/2 mega...`)

      let response
      try {
        response = await generateText({
          model: "openai/gpt-4o",
          prompt: megaPrompt,
          temperature: this.getTemperature(request.creativity),
        })
      } catch (error) {
        console.error(`[MegaComposer] ❌ Erro na tentativa ${attempts}:`, error)
        continue
      }

      if (!response || !response.text) {
        console.error(`[MegaComposer] ❌ Resposta inválida na tentativa ${attempts}`)
        continue
      }

      const { text } = response
      const validation = this.validateMegaSyllables(text, genreAnalysis.syllableTarget)
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

  /**
   * PROMPT MEGA - ADAPTADO POR GÊNERO
   */
  private static buildMegaPrompt(request: CompositionRequest, genreAnalysis: any): string {
    const { syllableTarget, characteristics, vocabulary, structure } = genreAnalysis
    
    return `COMPOSITOR MEGA BRASILEIRO - ESPECIALISTA EM ${request.genre.toUpperCase()}

**PERFIL DO GÊNERO:**
- CARACTERÍSTICAS: ${characteristics.join(", ")}
- VOCABULário TÍPICO: ${vocabulary.join(", ")}
- ESTRUTURA: ${structure}
- SÍLABAS: ${syllableTarget.min}-${syllableTarget.max} por verso (ideal: ${syllableTarget.ideal})

**TÉCNICAS DE ESCRITA:**
${this.getGenreSpecificTechniques(request.genre)}

**CONTEXTO:**
- TEMA: ${request.theme}
- HUMOR: ${request.mood}
- ${request.decade ? `DÉCADA: ${request.decade}` : ''}
- ${request.regionalStyle ? `ESTILO REGIONAL: ${request.regionalStyle}` : ''}
- ${request.complexity ? `COMPLEXIDADE: ${request.complexity}` : ''}

**EXEMPLOS DE ${request.genre.toUpperCase()}:**
${this.getGenreExamples(request.genre)}

COMPONHA UMA LETRA AUTÊNTICA:`
  }

  private static getGenreSpecificTechniques(genre: string): string {
    const techniques = {
      "Sertanejo": "- Use linguagem do cotidiano rural/cidade\n- Foque em emoções diretas\n- Abuse de metáforas simples e impactantes",
      "Sertanejo Sofrência": "- Dramatize as emoções\n- Use pausas dramáticas\n- Crie climas de tensão e liberação",
      "Sertanejo Universitário": "- Linguagem jovem e descontraída\n- Referências a festas e paquera\n- Ritmo dançante e animado",
      "Pagode": "- Alegria e descontração\n- Referências ao dia a dia\n- Convite para dançar",
      "Forró": "- Cultura nordestina\n- Sanfona e festa junina\n- Romance simples e direto",
      "Funk": "- Linguagem das periferias\n- Batidas marcantes\n- Letras diretas e repetitivas",
      "MPB": "- Poesia elaborada\n- Crítica social opcional\n- Linguagem sofisticada",
      "Bossa Nova": "- Suavidade e sofisticação\n- Referências ao mar e praia\n- Romance discreto"
    }

    return techniques[genre as keyof typeof techniques] || "- Adapte ao gênero específico"
  }

  private static getGenreExamples(genre: string): string {
    const examples = {
      "Sertanejo Sofrência": `"Ai se eu te pego" - Simples e direto\n"Evidências" - Drama romântico\n"Fio de Cabelo" - Metáforas do cotidiano`,
      "Pagode": `"Deixa Acontecer" - Alegria e naturalidade\n"Camisa 10" - Romance descontraído`,
      "Forró": `"Xote das Meninas" - Cultura nordestina\n"Como Vai Você" - Romance simples`,
      "Funk": `"Bumbum Granada" - Linguagem direta\n"Vai Malandra" - Empoderamento e festa`
    }

    return examples[genre as keyof typeof examples] || "Use referências autênticas do gênero"
  }

  private static getTemperature(creativity: string = "equilibrado"): number {
    const temps = {
      "conservador": 0.5,
      "equilibrado": 0.7,
      "ousado": 0.9
    }
    return temps[creativity as keyof typeof temps] || 0.7
  }

  private static async applyMegaCorrections(
    lyrics: string, 
    request: CompositionRequest, 
    genreAnalysis: any
  ): Promise<string> {
    console.log("[MegaComposer] 🔧 Aplicando correções mega...")
    
    const lines = lyrics.split("\n")
    const correctedLines: string[] = []
    const syllableTarget = genreAnalysis.syllableTarget

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (line.startsWith("[") || line.startsWith("(") || line.includes("Instruments:") || !line.trim()) {
        correctedLines.push(line)
        continue
      }

      const syllables = countPortugueseSyllables(line)
      
      if (syllables < syllableTarget.min || syllables > syllableTarget.max) {
        console.log(`🔴 Linha ${i + 1} fora do alvo: "${line}" → ${syllables} sílabas`)
        
        const correctedLine = await this.correctLineForGenre(line, syllableTarget, request.genre)
        correctedLines.push(correctedLine)
      } else {
        correctedLines.push(line)
      }
    }

    return correctedLines.join("\n")
  }

  private static async correctLineForGenre(
    line: string, 
    syllableTarget: any, 
    genre: string
  ): Promise<string> {
    const currentSyllables = countPortugueseSyllables(line)
    const target = currentSyllables < syllableTarget.min ? syllableTarget.ideal : syllableTarget.max

    // Tenta elisões inteligentes primeiro
    const elisions = AdvancedElisionEngine.applyIntelligentElisions(line, target)
    if (elisions.length > 0 && elisions[0] !== line) {
      return elisions[0]
    }

    // Correção manual específica por gênero
    return this.applyGenreSpecificCorrection(line, target, genre)
  }

  private static applyGenreSpecificCorrection(line: string, target: number, genre: string): string {
    // Correções específicas por gênero
    const genreCorrections = {
      "Funk": this.applyFunkCorrections,
      "Sertanejo Universitário": this.applySertanejoUniversitarioCorrections,
      "MPB": this.applyMPBCorrections,
      "Forró": this.applyForroCorrections
    }

    const corrector = genreCorrections[genre as keyof typeof genreCorrections] || this.applyGenericCorrections
    return corrector(line, target)
  }

  private static applyFunkCorrections(line: string, target: number): string {
    // Funk: linguagem mais direta e repetitiva
    let fixed = line
    fixed = fixed.replace(/\b(a |o |as |os )/gi, '')
    fixed = fixed.replace(/\b(está|estou)\b/gi, 'tá')
    fixed = fixed.replace(/\b(você)\b/gi, 'cê')
    return fixed
  }

  private static applySertanejoUniversitarioCorrections(line: string, target: number): string {
    let fixed = line
    fixed = fixed.replace(/\b(para)\b/gi, 'pra')
    fixed = fixed.replace(/\b(você)\b/gi, 'cê')
    fixed = fixed.replace(/\b(está|estou)\b/gi, 'tá')
    return fixed
  }

  private static applyMPBCorrections(line: string, target: number): string {
    // MPB: mantém sofisticação, apenas ajustes sutis
    let fixed = line
    fixed = fixed.replace(/\b(para)\b/gi, 'pra') // Apenas contrações comuns
    return fixed
  }

  private static applyForroCorrections(line: string, target: number): string {
    let fixed = line
    fixed = fixed.replace(/\b(para)\b/gi, 'pra')
    fixed = fixed.replace(/\b(você)\b/gi, 'cê')
    return fixed
  }

  private static calculateMegaScore(
    lyrics: string, 
    request: CompositionRequest, 
    genreAnalysis: any
  ): number {
    const lines = lyrics.split("\n").filter((line) => line.trim() && !line.startsWith("[") && !line.startsWith("("))

    let validLines = 0
    lines.forEach((line) => {
      const syllables = countPortugueseSyllables(line)
      if (syllables >= genreAnalysis.syllableTarget.min && syllables <= genreAnalysis.syllableTarget.max) {
        validLines++
      }
    })

    const syllableScore = (validLines / lines.length) * 100
    const auditResult = LyricsAuditor.audit(lyrics, request.genre, request.theme)
    const genreScore = this.calculateGenreAdherence(lyrics, genreAnalysis)
    
    // Score mega: sílabas + qualidade + aderência ao gênero
    const finalScore = syllableScore * 0.5 + auditResult.score * 0.3 + genreScore * 0.2

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
      "malandragem": ["malandro", "esperto", "sabedoria"],
      "drama": ["chorar", "sofrer", "dói", "traição"],
      "alegria": ["feliz", "sorrir", "festa", "alegria"],
      "nordestino": ["nordeste", "secão", "cangaço", "juazeiro"]
    }

    const words = characteristicMap[characteristic as keyof typeof characteristicMap]
    if (!words) return false

    return words.some(word => lyrics.toLowerCase().includes(word))
  }

  private static getFallbackLyrics(request: CompositionRequest, genreAnalysis: any): string {
    const fallbacks = {
      "Sertanejo Sofrência": `[Verso 1]
Tua lembrança não sai do meu peito
Cada momento me traz um desejo
[Refrão]
Ai, que saudade do teu cheiro
Dos teus abraços, do teu jeito`,

      "Pagode": `[Verso 1]
Hoje a noite vai ser de pagode
Vamo curtir até amanhecer
[Refrão]
É pagode, é alegria
É a nossa comunidade em harmonia`,

      "Funk": `[Refrão]
Bumbum granada, quadrada na pista
Essa menina é uma visionista
[Verso]
No fluxo da quebrada, mandando ver
Com atitude, fazendo acontecer`,

      "Forró": `[Verso 1]
No forró do seu olhar
Me perdi sem me encontrar
[Refrão]
Xote, xote, meu amor
Dança comigo até o sol raiar`,

      "MPB": `[Verso 1]
Tempo, leve devagar
Deixa o coração cantar
[Refrão]
A vida é uma canção
Que se canta com emoção`
    }

    return fallbacks[request.genre as keyof typeof fallbacks] || 
           `[Verso 1]
Composição em ${request.genre}
Falha na geração automática
[Refrão]
Por favor, tente novamente
Com outros parâmetros talvez`
  }

  /**
   * REESCRITA MEGA TURBINADA
   */
  private static async generateMegaRewrite(request: CompositionRequest, genreAnalysis: any): Promise<string> {
    if (!request.originalLyrics) {
      throw new Error("Original lyrics required for rewrite")
    }

    const rewritePrompt = `REESCRITOR MEGA BRASILEIRO - ${request.genre.toUpperCase()}

**PERFIL DO GÊNERO:**
- ESTRUTURA: ${genreAnalysis.structure}
- SÍLABAS: ${genreAnalysis.syllableTarget.min}-${genreAnalysis.syllableTarget.max}
- CARACTERÍSTICAS: ${genreAnalysis.characteristics.join(", ")}

**TÉCNICAS DE ESCRITA:**
${this.getGenreSpecificTechniques(request.genre)}

**LETRA ORIGINAL:**
${request.originalLyrics}

**CONTEXTO:**
- TEMA: ${request.theme}
- GÊNERO: ${request.genre}
- ${request.decade ? `DÉCADA: ${request.decade}` : ''}
- ${request.regionalStyle ? `ESTILO REGIONAL: ${request.regionalStyle}` : ''}

REESCREVA MANTENDO A ESSÊNCIA MAS ADAPTANDO AO GÊNERO:`

    const { text } = await generateText({
      model: "openai/gpt-4o", 
      prompt: rewritePrompt,
      temperature: 0.6, // Mais conservador na reescrita
    })

    return text || request.originalLyrics
  }

  /**
   * ELISÕES MEGA - ADAPTADAS POR GÊNERO
   */
  private static async applyMegaElisions(
    lyrics: string, 
    request: CompositionRequest, 
    genreAnalysis: any
  ): Promise<string> {
    console.log("[MegaComposer] 🎭 Aplicando elisões mega...")
    
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
            // Filtra elisões mais adequadas ao gênero
            const genreAppropriate = this.filterGenreAppropriateElisions(elisions, request.genre)
            if (genreAppropriate.length > 0) {
              correctedLines.push(genreAppropriate[0])
              elisionsApplied++
              continue
            }
          }
        }
      }
      correctedLines.push(line)
    }

    console.log(`✅ ${elisionsApplied} elisões mega aplicadas`)
    return correctedLines.join("\n")
  }

  private static filterGenreAppropriateElisions(elisions: string[], genre: string): string[] {
    // Filtra elisões muito agressivas para gêneros sofisticados
    if (["MPB", "Bossa Nova", "Gospel"].includes(genre)) {
      return elisions.filter(elision => 
        !elision.includes("c'") && 
        !elision.includes("n") && // Evita "n" no início
        elision.split(" ").length > 2 // Mantém alguma sofisticação
      )
    }

    // Para funk e sertanejo universitário, aceita elisões mais agressivas
    if (["Funk", "Sertanejo Universitário"].includes(genre)) {
      return elisions
    }

    return elisions.slice(0, 1) // Padrão: primeira elisão
  }

  /**
   * POLIMENTO MEGA FINAL
   */
  private static async applyMegaPolish(
    lyrics: string, 
    genre: string, 
    performanceMode: string, 
    genreAnalysis: any
  ): Promise<string> {
    console.log(`[MegaComposer] ✨ Aplicando polimento mega...`)

    let polishedLyrics = lyrics

    // Formatação de performance específica por gênero
    if (shouldUsePerformanceFormat(genre, performanceMode)) {
      polishedLyrics = formatSertanejoPerformance(polishedLyrics)
    } else if (performanceMode === "performance") {
      polishedLyrics = this.applyGenrePerformanceFormatting(polishedLyrics, genre)
    }

    // Ajustes finais específicos por gênero
    polishedLyrics = this.applyGenreFinalTouches(polishedLyrics, genre, genreAnalysis)

    return polishedLyrics
  }

  private static applyGenrePerformanceFormatting(lyrics: string, genre: string): string {
    let formatted = lyrics
    
    // Formatação específica por gênero
    const genreFormatting = {
      "Funk": () => formatted.replace(/\[Refrão\]/gi, "[HOOK]")
                             .replace(/\[Verso\]/gi, "[VERSO]"),
      "Sertanejo": () => formatted.replace(/\[Verso\s*(\d*)\]/gi, "[V$1]")
                                  .replace(/\[Refrão\]/gi, "[R]"),
      "MPB": () => formatted.replace(/\[Verso\]/gi, "[ESTROFE]")
                            .replace(/\[Refrão\]/gi, "[REFRAO]")
    }

    const formatter = genreFormatting[genre as keyof typeof genreFormatting]
    if (formatter) {
      formatted = formatter()
    }

    return formatted
  }

  private static applyGenreFinalTouches(lyrics: string, genre: string, genreAnalysis: any): string {
    // Adiciona elementos específicos do gênero
    let touched = lyrics

    if (genre === "Forró" && !touched.includes("xote") && !touched.includes("baião")) {
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

  /**
   * VALIDAÇÃO MEGA DE SÍLABAS
   */
  private static validateMegaSyllables(lyrics: string, syllableTarget: any): {
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
        if (syllables >= syllableTarget.min && syllables <= syllableTarget.max) {
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
      valid: validityRatio >= 0.85, // Mais flexível que o padrão
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
    console.log("[MegaComposer] 🔄 Aplicando Terceira Via...")

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

  private static applyGenericCorrections(line: string, target: number): string {
    // Correções genéricas para qualquer gênero
    let fixed = line
    
    // Remove artigos
    fixed = fixed.replace(/\b(o |a |um |uma )/gi, '')
    
    // Contrações básicas
    fixed = fixed.replace(/\b(para)\b/gi, 'pra')
    fixed = fixed.replace(/\b(você)\b/gi, 'cê')
    fixed = fixed.replace(/\b(com)\b/gi, 'c')
    
    const syllables = countPortugueseSyllables(fixed)
    if (syllables <= target) {
      return fixed
    }
    
    return line // Retorna original se não conseguiu corrigir
  }
}

// ✅ EXPORT FINAL
export { MegaComposer as MetaComposer }
