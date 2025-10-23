// lib/orchestrator/meta-composer.ts - VERSÃO CORRIGIDA

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

// ==================== ELISION ENGINE ====================
class AdvancedElisionEngine {
  static applyIntelligentElisions(line: string, targetSyllables: number): string[] {
    const currentSyllables = countPortugueseSyllables(line)
    
    if (currentSyllables <= targetSyllables) {
      return [line]
    }

    const variations: string[] = []

    // Técnicas básicas
    const techniques = [
      { regex: /\bde amor\b/gi, replacement: "d'amor" },
      { regex: /\bque eu\b/gi, replacement: "qu'eu" },
      { regex: /\bpara o\b/gi, replacement: "pro" },
      { regex: /\bpara a\b/gi, replacement: "pra" },
      { regex: /\bpara\b/gi, replacement: "pra" },
      { regex: /\bvocê\b/gi, replacement: "cê" },
      { regex: /\bestá\b/gi, replacement: "tá" },
      { regex: /\bcomigo\b/gi, replacement: "c'migo" },
      { regex: /\bcontigo\b/gi, replacement: "c'tigo" },
      { regex: /\bnaquele\b/gi, replacement: "n'aquele" },
      { regex: /\bnesse\b/gi, replacement: "n'esse" },
      { regex: /\bnum\b/gi, replacement: "n'um" },
      { regex: /\bnuma\b/gi, replacement: "n'uma" }
    ]

    for (const tech of techniques) {
      if (tech.regex.test(line)) {
        const newLine = line.replace(tech.regex, tech.replacement)
        const newSyllables = countPortugueseSyllables(newLine)
        if (newSyllables <= targetSyllables) {
          variations.push(newLine)
        }
      }
    }

    return variations.length > 0 ? variations : [line]
  }
}

// ==================== MULTI-GENERATION ENGINE ====================
class MultiGenerationEngine {
  static async generateMultipleVariations(
    generator: () => Promise<string>,
    scorer: (lyrics: string) => number,
    count: number = 2
  ): Promise<{
    variations: Array<{ lyrics: string; score: number }>
    bestVariationIndex: number
    bestScore: number
  }> {
    const variations: Array<{ lyrics: string; score: number }> = []

    for (let i = 0; i < count; i++) {
      try {
        const lyrics = await generator()
        const score = scorer(lyrics)
        variations.push({ lyrics, score })
        console.log(`[MultiGeneration] Variação ${i + 1}: ${score.toFixed(1)}/100`)
      } catch (error) {
        console.error(`[MultiGeneration] Erro na variação ${i + 1}:`, error)
      }
    }

    if (variations.length === 0) {
      throw new Error("Nenhuma variação gerada com sucesso")
    }

    let bestIndex = 0
    let bestScore = variations[0].score

    for (let i = 1; i < variations.length; i++) {
      if (variations[i].score > bestScore) {
        bestScore = variations[i].score
        bestIndex = i
      }
    }

    return {
      variations,
      bestVariationIndex: bestIndex,
      bestScore
    }
  }
}

// ==================== MEGA CORRECTOR ====================
class MegaCorrector {
  static async correctGeneratedLyrics(lyrics: string, genre: string = "Sertanejo Sofrência"): Promise<string> {
    console.log("🔧 [MegaCorrector] Iniciando correção mega...")
    
    let correctedLyrics = lyrics

    // 1️⃣ CORRIGE PROBLEMAS DE FORMATAÇÃO E PONTUAÇÃO
    correctedLyrics = this.fixFormattingIssues(correctedLyrics)
    
    // 2️⃣ CORRIGE SÍLABAS FORA DO PADRÃO (7-11 sílabas)
    correctedLyrics = await this.fixSyllableProblems(correctedLyrics, genre)
    
    // 3️⃣ CORRIGE PROBLEMAS DE GRAMÁTICA E ORTOGRAFIA
    correctedLyrics = this.fixGrammarIssues(correctedLyrics)
    
    // 4️⃣ CORRIGE INCONSISTÊNCIAS DE PERFORMANCE
    correctedLyrics = this.fixPerformanceInconsistencies(correctedLyrics)
    
    // 5️⃣ APLICA POLIMENTO FINAL ESPECÍFICO DO GÊNERO
    correctedLyrics = this.applyGenrePolish(correctedLyrics, genre)

    console.log("✅ [MegaCorrector] Correção mega concluída")
    return correctedLyrics
  }

  private static fixFormattingIssues(lyrics: string): string {
    console.log("📝 Corrigindo problemas de formatação...")
    
    let fixed = lyrics
    fixed = fixed.replace(/\. \. \./g, '...')
    fixed = fixed.replace(/\.\.\.\s*\./g, '...')
    fixed = fixed.replace(/\s+\.\.\./g, '...')
    fixed = fixed.replace(/\.\.\.\s+/g, '... ')
    fixed = fixed.replace(/-\s+/g, '-')
    fixed = fixed.replace(/\s+-/g, '-')
    fixed = fixed.replace(/\n\s*\n\s*\n/g, '\n\n')
    fixed = fixed.replace(/  +/g, ' ')
    fixed = fixed.replace(/\[(\s+)/g, '[')
    fixed = fixed.replace(/(\s+)\]/g, ']')
    fixed = fixed.replace(/\((\s+)/g, '(')
    fixed = fixed.replace(/(\s+)\)/g, ')')

    return fixed
  }

  private static async fixSyllableProblems(lyrics: string, genre: string): Promise<string> {
    console.log("🎯 Corrigindo problemas de sílabas...")
    
    const lines = lyrics.split('\n')
    const correctedLines: string[] = []
    let correctionsApplied = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      if (this.shouldSkipLine(line)) {
        correctedLines.push(line)
        continue
      }

      const syllables = countPortugueseSyllables(line)
      
      if (syllables < 7 || syllables > 14) {
        console.log(`🔴 Linha ${i + 1} problemática: "${line}" → ${syllables} sílabas`)
        
        const correctedLine = await this.correctProblematicLine(line, syllables, genre)
        
        if (correctedLine !== line) {
          correctionsApplied++
          console.log(`✅ Corrigido: "${correctedLine}" → ${countPortugueseSyllables(correctedLine)} sílabas`)
        }
        
        correctedLines.push(correctedLine)
      } else {
        correctedLines.push(line)
      }
    }

    console.log(`🎯 ${correctionsApplied} correções de sílabas aplicadas`)
    return correctedLines.join('\n')
  }

  private static async correctProblematicLine(line: string, currentSyllables: number, genre: string): Promise<string> {
    const targetSyllables = 9
    
    if (currentSyllables > targetSyllables) {
      const elisions = AdvancedElisionEngine.applyIntelligentElisions(line, targetSyllables)
      if (elisions.length > 0 && elisions[0] !== line) {
        return elisions[0]
      }
    }

    let correctedLine = this.applySpecificFixes(line, genre)
    
    const newSyllables = countPortugueseSyllables(correctedLine)
    if (newSyllables < 7 || newSyllables > 11) {
        correctedLine = this.applyEmergencyFixes(correctedLine, targetSyllables)
    }

    return correctedLine
  }

  private static applySpecificFixes(line: string, genre: string): string {
    let fixed = line

    // CORREÇÕES ESPECÍFICAS BASEADAS NOS PROBLEMAS IDENTIFICADOS:
    if (fixed.includes("caracol") && fixed.includes("dia")) {
      fixed = fixed.replace("dia é caracol", "dia não roda não")
    }
    
    fixed = fixed.replace("não pra de", "não para de")
    fixed = fixed.replace(/não pra\b/g, "não para")
    
    if (fixed.includes("conta tá alta")) {
      fixed = fixed.replace("conta tá alta", "a conta tá alta")
    }
    
    if (fixed.includes("prejuízo") && fixed.includes("casa")) {
      fixed = fixed.replace("só traz prejuízo", "só traz solidão")
    }
    
    if ((fixed.match(/dor no peito/g) || []).length > 1) {
      fixed = fixed.replace("que dor no peito, amor", "que aperto no peito")
    }
    
    if ((fixed.match(/amor/g) || []).length > 2) {
      fixed = fixed.replace(/amor/g, (match, index) => index === 0 ? 'amor' : 'coração')
    }

    return fixed
  }

  private static applyEmergencyFixes(line: string, targetSyllables: number): string {
    let fixed = line
    const currentSyllables = countPortugueseSyllables(fixed)
    const difference = targetSyllables - currentSyllables

    if (difference < 0) {
      fixed = fixed.replace(/\b(o |a |os |as |um |uma )/gi, '')
      fixed = fixed.replace(/\b(para)\b/gi, 'pra')
      fixed = fixed.replace(/\b(você)\b/gi, 'cê')
      fixed = fixed.replace(/\b(comigo)\b/gi, "c'migo")
      fixed = fixed.replace(/\b(está|estou)\b/gi, 'tá')
      fixed = fixed.replace(/\b(realmente|verdadeiramente|completamente)\b/gi, '')
      
    } else if (difference > 0) {
      const additions = [
        "meu ", "minha ", "esse ", "essa ", "aquele ", "aquela ",
        "tanto ", "muito ", "grande ", "pequeno ", "velho ", "novo "
      ]
      
      for (const addition of additions) {
        const testLine = addition + fixed
        if (countPortugueseSyllables(testLine) <= targetSyllables) {
          fixed = testLine
          break
        }
      }
    }

    return fixed
  }

  private static fixGrammarIssues(lyrics: string): string {
    console.log("📚 Corrigindo problemas de gramática...")
    
    let fixed = lyrics

    if ((fixed.match(/\btá\b/g) || []).length > 3) {
      fixed = fixed.replace(/\btá\b/g, (match, index) => 
        index % 2 === 0 ? 'está' : 'tá'
      )
    }
    
    fixed = fixed.replace(/\beu tá\b/gi, "eu tô")
    fixed = fixed.replace(/\bvocê tá\b/gi, "cê tá")
    fixed = fixed.replace(/\bde o\b/gi, "do")
    fixed = fixed.replace(/\bde a\b/gi, "da")
    fixed = fixed.replace(/\bem o\b/gi, "no")
    fixed = fixed.replace(/\bem a\b/gi, "na")
    
    fixed = fixed.replace(/\bcê\b/g, (match, index) => 
      index > 2 ? 'você' : 'cê'
    )
    
    fixed = fixed.replace(/!{3,}/g, '!')
    fixed = fixed.replace(/\?{3,}/g, '?')
    fixed = fixed.replace(/\.{4,}/g, '...')

    return fixed
  }

  private static fixPerformanceInconsistencies(lyrics: string): string {
    console.log("🎭 Corrigindo inconsistências de performance...")
    
    let fixed = lyrics

    fixed = fixed.replace(/\([^)]*performance[^)]*\)/gi, '(Performance: $1)')
    fixed = fixed.replace(/\([^)]*vocal[^)]*\)/gi, '(Backing Vocal: $1)')
    fixed = fixed.replace(/\([^)]*público[^)]*\)/gi, '(Público: $1)')
    fixed = fixed.replace(/\([^)]*~\d+s[^)]*\)/gi, '')
    fixed = fixed.replace(/\([^)]*BPM[^)]*\)/gi, '')
    fixed = fixed.replace(/\([^)]*{.*?}[^)]*\)/gi, '(Instrumental)')
    
    fixed = fixed.replace(/\[PART [A-Z] - [^]]*\]/gi, (match) => {
      const section = match.match(/\[PART ([A-Z])/i)
      return section ? `[PARTE ${section[1]}]` : match
    })

    return fixed
  }

  private static applyGenrePolish(lyrics: string, genre: string): string {
    console.log(`✨ Aplicando polimento final para ${genre}...`)
    
    let polished = lyrics

    if (genre.includes("Sertanejo")) {
      polished = this.applySertanejoPolish(polished)
    }

    polished = this.ensureConsistentStructure(polished)

    return polished
  }

  private static applySertanejoPolish(lyrics: string): string {
    let polished = lyrics

    if (!polished.includes("saudade") && polished.includes("lembrança")) {
      polished = polished.replace(/lembrança/g, "saudade")
    }
    
    if (!polished.match(/\bai\b.*\bai\b/i)) {
      const lines = polished.split('\n')
      const chorusIndex = lines.findIndex(line => 
        line.includes('Refrão') || line.includes('Chorus')
      )
      
      if (chorusIndex !== -1 && chorusIndex + 1 < lines.length) {
        lines[chorusIndex + 1] = "Ai, " + lines[chorusIndex + 1]
        polished = lines.join('\n')
      }
    }
    
    polished = polished.replace(/[xX]*[gG]r[oO0]*[vV][eE]*/g, '')
    polished = polished.replace(/[pP][iI][lL]*[aA][dA]*/g, '')

    return polished
  }

  private static ensureConsistentStructure(lyrics: string): string {
    const lines = lyrics.split('\n')
    const structuredLines: string[] = []
    
    let inPerformanceNotes = false
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      if (!trimmed) {
        structuredLines.push('')
        continue
      }
      
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        inPerformanceNotes = false
        structuredLines.push(trimmed)
      } 
      else if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
        inPerformanceNotes = true
        structuredLines.push(trimmed)
      }
      else if (!inPerformanceNotes) {
        structuredLines.push(trimmed)
      }
      else {
        structuredLines.push(trimmed)
      }
    }
    
    return structuredLines.join('\n')
  }

  private static shouldSkipLine(line: string): boolean {
    const skipPatterns = [
      /^\[.*\]$/,
      /^\(.*\)$/,
      /^[A-Z][A-Z\s]*:$/,
      /Instrumentos?:/i,
      /BPM:/i,
      /Ritmo:/i,
      /Estilo:/i,
      /Estrutura:/i,
      /^[\s\*\-]*$/,
      /^[A-Z\s]+$/,
      /^\d/,
      /\.\.\.$/,
    ]
    
    return skipPatterns.some(pattern => pattern.test(line.trim()))
  }

  static analyzeProblems(lyrics: string): {
    syllableIssues: Array<{ line: string; syllables: number }>
    grammarIssues: string[]
    formattingIssues: string[]
    performanceIssues: string[]
  } {
    console.log("🔍 [MegaCorrector] Analisando problemas...")
    
    const lines = lyrics.split('\n')
    const syllableIssues: Array<{ line: string; syllables: number }> = []
    const grammarIssues: string[] = []
    const formattingIssues: string[] = []
    const performanceIssues: string[] = []

    lines.forEach((line, index) => {
      const trimmed = line.trim()
      
      if (!trimmed || this.shouldSkipLine(trimmed)) return

      const syllables = countPortugueseSyllables(trimmed)
      if (syllables < 7 || syllables > 14) {
        syllableIssues.push({ line: trimmed, syllables })
      }

      if (trimmed.includes("não pra de")) {
        grammarIssues.push(`Linha ${index + 1}: "não pra de" → "não para de"`)
      }
      if ((trimmed.match(/\btá\b/g) || []).length > 2) {
        grammarIssues.push(`Linha ${index + 1}: Coloquialismo "tá" excessivo`)
      }

      if (trimmed.includes(". . .")) {
        formattingIssues.push(`Linha ${index + 1}: Reticências mal formatadas`)
      }
      if (trimmed.includes("  ")) {
        formattingIssues.push(`Linha ${index + 1}: Espaços duplicados`)
      }

      if (trimmed.includes("~") && trimmed.includes("s")) {
        performanceIssues.push(`Linha ${index + 1}: Instruções de tempo muito específicas`)
      }
    })

    return {
      syllableIssues,
      grammarIssues,
      formattingIssues,
      performanceIssues
    }
  }
}

// ==================== INTERFACES PRINCIPAIS ====================
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
    correctionsApplied?: {
      syllable: number
      grammar: number
      formatting: number
    }
    originalProblems?: any
    remainingProblems?: any
  }
}

// ==================== META COMPOSER PRINCIPAL ====================
export class MetaComposer {
  private static readonly MAX_ITERATIONS = 2
  private static readonly ABSOLUTE_MAX_SYLLABLES = 11

  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer] 🚀 INICIANDO COMPOSIÇÃO MEGA DEFINITIVA...")

    const useIntelligentElisions = request.useIntelligentElisions ?? true
    const syllableTarget = request.syllableTarget || { min: 7, max: 11, ideal: 9 }

    console.log(`[MetaComposer] 🎵 Gênero: ${request.genre}`, { sílabas: syllableTarget })

    const multiGenResult = await MultiGenerationEngine.generateMultipleVariations(
      async () => {
        return await this.generateWithAdvancedStrategy(request)
      },
      (lyrics) => this.calculateAdvancedScore(lyrics, request),
      2,
    )

    const bestLyrics = multiGenResult.variations[multiGenResult.bestVariationIndex].lyrics
    const bestScore = multiGenResult.bestScore

    console.log(`[MetaComposer] 🏆 Melhor versão: ${bestScore.toFixed(1)}/100`)

    console.log("🎯 Aplicando garantia final mega...")
    const finalLyrics = await MegaCorrector.correctGeneratedLyrics(bestLyrics, request.genre)

    // Analisa problemas antes/depois
    const problemsBefore = MegaCorrector.analyzeProblems(bestLyrics)
    const problemsAfter = MegaCorrector.analyzeProblems(finalLyrics)

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
        decadeStyle: request.decade,
        regionalCharacteristics: request.regionalStyle ? [request.regionalStyle] : [],
        correctionsApplied: {
          syllable: problemsBefore.syllableIssues.length - problemsAfter.syllableIssues.length,
          grammar: problemsBefore.grammarIssues.length - problemsAfter.grammarIssues.length,
          formatting: problemsBefore.formattingIssues.length - problemsAfter.formattingIssues.length
        },
        originalProblems: problemsBefore,
        remainingProblems: problemsAfter
      },
    }
  }

  private static calculateAdvancedScore(lyrics: string, request: CompositionRequest): number {
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
    
    const finalScore = syllableScore * 0.7 + auditResult.score * 0.3

    return finalScore
  }

  private static async generateWithAdvancedStrategy(request: CompositionRequest): Promise<string> {
    console.log("[MetaComposer] 📝 Gerando com estratégia avançada...")

    const isRewrite = !!request.originalLyrics
    const performanceMode = request.performanceMode || "standard"
    const useIntelligentElisions = request.useIntelligentElisions ?? true

    let rawLyrics: string

    if (isRewrite) {
      rawLyrics = await this.generateAdvancedRewrite(request)
    } else {
      rawLyrics = await this.generateAdvancedCreation(request)
    }

    const validationResult = this.validateLyricsSyllables(rawLyrics)
    if (validationResult.validityRatio < 0.8) {
      console.log(`⚠️ Validação fraca (${(validationResult.validityRatio * 100).toFixed(1)}%), aplicando correções...`)
      rawLyrics = await MegaCorrector.correctGeneratedLyrics(rawLyrics, request.genre)
    }

    if (useIntelligentElisions) {
      rawLyrics = await this.applyIntelligentElisions(rawLyrics, request)
    }

    const terceiraViaAnalysis = analisarTerceiraVia(rawLyrics, request.genre, request.theme)
    if (terceiraViaAnalysis && terceiraViaAnalysis.score_geral < 75) {
      rawLyrics = await this.applyTerceiraViaCorrections(rawLyrics, request, terceiraViaAnalysis)
    }

    let finalLyrics = rawLyrics
    if (request.applyFinalPolish ?? true) {
      finalLyrics = await this.applyAdvancedPolish(finalLyrics, request.genre, performanceMode)
    }

    const punctuationResult = PunctuationValidator.validate(finalLyrics)
    if (!punctuationResult.isValid) {
      finalLyrics = punctuationResult.correctedLyrics
    }

    const stackingResult = LineStacker.stackLines(finalLyrics)
    finalLyrics = stackingResult.stackedLyrics

    console.log("✅ Geração avançada concluída")
    return finalLyrics
  }

  private static async generateAdvancedCreation(request: CompositionRequest): Promise<string> {
    const advancedPrompt = this.buildAdvancedPrompt(request)
    
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

    return bestLyrics || this.getFallbackLyrics(request)
  }

  private static buildAdvancedPrompt(request: CompositionRequest): string {
    return `🎵 COMPOSITOR MEGA BRASILEIRO - ESPECIALISTA EM ${request.genre.toUpperCase()}

**PERFIL DO GÊNERO:**
- SÍLABAS: 7-11 por verso (ideal: 9)
- FOCO: Emoções verdadeiras e linguagem natural

**TÉCNICAS DE ESCRITA:**
- Use elisões inteligentes: "de amor" → "d'amor", "para" → "pra"
- Mantenha versos entre 7-11 sílabas
- Linguagem natural e emocional

**CONTEXTO:**
- TEMA: ${request.theme}
- GÊNERO: ${request.genre}
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

  private static async generateAdvancedRewrite(request: CompositionRequest): Promise<string> {
    if (!request.originalLyrics) {
      throw new Error("Original lyrics required for rewrite")
    }

    const rewritePrompt = `🎵 REESCRITOR PROFISSIONAL - ${request.genre.toUpperCase()}

**REGRAS ESTRITAS DE REESCRITA:**

✅ **OBRIGATÓRIO - CORRIJA ESTES ERROS:**
- "lembrançnãsai" → "lembrança não sai"
- "nãvaleu" → "não valeu" 
- "preçda" → "preço da"
- "emoçãcontida" → "emoção contida"
- "guitarra daço" → "guitarra de aço"
- NUNCA use placeholders $1 - SEMPRE escreva o texto real
- SEMPRE complete frases incompletas

✅ **FORMATAÇÃO:**
- Versos com 7-11 sílabas
- Linguagem natural do ${request.genre}
- Evite repetições excessivas
- Use pontuação correta: ... (reticências), ! (exclamação)

✅ **PERFORMANCE:**
- (Backing Vocal: texto real) - NUNCA $1
- (Público: resposta real) - NUNCA $1
- Instruções de performance completas

**LETRA ORIGINAL PARA REESCREVER:**
${request.originalLyrics}

**CONTEXTO:**
- TEMA: ${request.theme}
- GÊNERO: ${request.genre}
- ESTILO: ${request.regionalStyle || "Universal"}

**REESCREVA CORRIGINDO TODOS OS ERROS E MANTENDO A EMOÇÃO:**`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt: rewritePrompt,
      temperature: 0.6,
    })

    return text || request.originalLyrics
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

  private static async applyAdvancedPolish(lyrics: string, genre: string, performanceMode: string): Promise<string> {
    console.log(`[MetaComposer] ✨ Aplicando polimento avançado...`)

    let polishedLyrics = lyrics

    if (shouldUsePerformanceFormat(genre, performanceMode)) {
      polishedLyrics = formatSertanejoPerformance(polishedLyrics)
    } else if (performanceMode === "performance") {
      polishedLyrics = this.applyPerformanceFormatting(polishedLyrics, genre)
    }

    return polishedLyrics
  }

  private static applyPerformanceFormatting(lyrics: string, genre: string): string {
    let formatted = lyrics
    
    if (genre === "Funk") {
      formatted = formatted.replace(/\[Refrão\]/gi, "[HOOK]")
    } else if (genre.includes("Sertanejo")) {
      formatted = formatted.replace(/\[Verso\s*(\d*)\]/gi, "[V$1]")
                           .replace(/\[Refrão\]/gi, "[R]")
    }

    return formatted
  }

  private static getFallbackLyrics(request: CompositionRequest): string {
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
Essa menina é uma visionista
[Verso]
No fluxo da quebrada, mandando ver
Com atitude, fazendo acontecer`,

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
Com tema: ${request.theme}
[Refrão]
Letra gerada automaticamente
Com técnicas de composição moderna`
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
