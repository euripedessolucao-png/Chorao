/**
 * META-COMPOSITOR INTELIGENTE - SISTEMA AUTÔNOMO DE COMPOSIÇÃO HARMONIZADO
 * Integra: Sílabas + Rimas + Terceira Via + Qualidade Musical
 */

import { generateText } from "ai"
import { getGenreConfig } from "@/lib/genre-config"
import { validateFullLyricAgainstForcing } from "@/lib/validation/anti-forcing-validator"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter"
import { IntelligentSyllableEnforcer } from "@/lib/validation/intelligent-syllable-enforcer"
import { analisarTerceiraVia, applyTerceiraViaToLine } from "@/lib/third-way-converter"

export interface CompositionRequest {
  genre: string
  theme: string
  mood: string
  additionalRequirements?: string
  hook?: string
  chorus?: string[]
  title?: string
  performanceMode?: boolean
  creativity?: "conservador" | "equilibrado" | "ousado"
  syllableTarget?: {
    min: number
    max: number  
    ideal: number
  }
  preserveRhymes?: boolean // ✅ NOVO: Preservar rimas ricas
  applyTerceiraVia?: boolean // ✅ NOVO: Aplicar princípios da Terceira Via
}

export interface CompositionResult {
  lyrics: string
  title: string
  validation: {
    passed: boolean
    errors: string[]
    warnings: string[]
    syllableStats: {
      totalLines: number
      linesWithinLimit: number
      maxSyllablesFound: number
      averageSyllables: number
    }
    terceiraViaScore?: number // ✅ NOVO: Score da Terceira Via
    rhymePreservation?: number // ✅ NOVO: % de rimas preservadas
  }
  metadata: {
    iterations: number
    refinements: number
    finalScore: number
    terceiraViaAnalysis?: any // ✅ NOVO: Análise completa
    rhymeAnalysis?: any // ✅ NOVO: Análise de rimas
  }
}

export class MetaComposer {
  private static readonly MAX_ITERATIONS = 3
  private static readonly MIN_QUALITY_SCORE = 0.8
  private static readonly ENABLE_AUTO_REFINEMENT = true
  private static readonly SYLLABLE_TARGET = { min: 7, max: 11, ideal: 9 }
  private static readonly PRESERVE_RHYMES = true // ✅ SEMPRE preservar rimas
  private static readonly APPLY_TERCEIRA_VIA = true // ✅ SEMPRE aplicar Terceira Via

  /**
   * COMPOSIÇÃO INTELIGENTE - SISTEMA HARMONIZADO
   */
  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer] Iniciando composição inteligente harmonizada...")

    let iterations = 0
    let refinements = 0
    let bestResult: CompositionResult | null = null
    let bestScore = 0

    const syllableEnforcement = request.syllableTarget || this.SYLLABLE_TARGET
    const preserveRhymes = request.preserveRhymes ?? this.PRESERVE_RHYMES
    const applyTerceiraVia = request.applyTerceiraVia ?? this.APPLY_TERCEIRA_VIA

    console.log(`[MetaComposer] Configuração: ${preserveRhymes ? 'RIMAS PRESERVADAS' : 'Rimas não preservadas'} | ${applyTerceiraVia ? 'TERCEIRA VIA ATIVA' : 'Terceira Via inativa'}`)

    while (iterations < this.MAX_ITERATIONS) {
      iterations++
      console.log(`\n[MetaComposer] Iteração ${iterations}/${this.MAX_ITERATIONS}`)

      // ✅ GERAÇÃO COM CONTROLE INTELIGENTE
      const rawLyrics = await this.generateIntelligentLyrics(request, syllableEnforcement, preserveRhymes)

      // ✅ APLICA TERCEIRA VIA (se habilitado)
      let terceiraViaLyrics = rawLyrics
      let terceiraViaAnalysis = null
      
      if (applyTerceiraVia) {
        console.log('[MetaComposer] Aplicando princípios da Terceira Via...')
        terceiraViaLyrics = await this.applyTerceiraViaToLyrics(rawLyrics, request.genre, request.theme)
        terceiraViaAnalysis = analisarTerceiraVia(terceiraViaLyrics, request.genre, request.theme)
        console.log(`[MetaComposer] Score Terceira Via: ${terceiraViaAnalysis.score_geral}/100`)
      }

      // ✅ CORREÇÃO DE SÍLABAS COM PRESERVAÇÃO DE RIMAS
      const enforcedResult = await IntelligentSyllableEnforcer.enforceSyllableLimits(
        terceiraViaLyrics, 
        syllableEnforcement, 
        request.genre,
        { 
          preserveRhymes: preserveRhymes,
          preserveStructure: true,
          maxRhymeGroupCorrections: 2
        }
      )

      console.log(`[MetaComposer] Correções aplicadas: ${enforcedResult.corrections} linhas`)

      // ✅ VALIDAÇÃO COMPREENSIVA
      const validation = await this.comprehensiveValidation(
        enforcedResult.correctedLyrics, 
        request, 
        syllableEnforcement,
        terceiraViaAnalysis
      )

      // ✅ CÁLCULO DE SCORE HARMONIZADO
      const qualityScore = this.calculateHarmonizedQualityScore(
        enforcedResult.correctedLyrics, 
        validation, 
        request, 
        syllableEnforcement,
        terceiraViaAnalysis,
        enforcedResult.corrections
      )

      console.log(`[MetaComposer] Score de qualidade: ${qualityScore.toFixed(2)}`)
      console.log(`[MetaComposer] Estatísticas de sílabas: ${validation.syllableStats.linesWithinLimit}/${validation.syllableStats.totalLines} versos dentro do limite`)

      // ✅ ATUALIZA MELHOR RESULTADO
      if (qualityScore > bestScore) {
        bestScore = qualityScore
        bestResult = {
          lyrics: enforcedResult.correctedLyrics,
          title: this.extractTitle(enforcedResult.correctedLyrics, request),
          validation,
          metadata: {
            iterations,
            refinements,
            finalScore: qualityScore,
            terceiraViaAnalysis,
            rhymeAnalysis: this.analyzeRhymePreservation(rawLyrics, enforcedResult.correctedLyrics)
          },
        }
      }

      // ✅ VERIFICA SE ATINGIU QUALIDADE MÍNIMA
      if (qualityScore >= this.MIN_QUALITY_SCORE && validation.passed) {
        console.log("[MetaComposer] ✅ Qualidade mínima atingida!")
        break
      }

      // ✅ REFINAMENTO AUTÔNOMO
      if (this.ENABLE_AUTO_REFINEMENT && iterations < this.MAX_ITERATIONS) {
        console.log("[MetaComposer] Aplicando refinamento autônomo...")
        request = await this.autonomousRefinement(request, validation, syllableEnforcement, terceiraViaAnalysis)
        refinements++
      }
    }

    if (!bestResult) {
      throw new Error("Falha ao gerar composição de qualidade mínima")
    }

    // ✅ RELATÓRIO FINAL DETALHADO
    const finalValidation = IntelligentSyllableEnforcer.validateLyrics(bestResult.lyrics, syllableEnforcement)
    console.log(`\n[MetaComposer] 📊 RELATÓRIO FINAL:`)
    console.log(`[MetaComposer] Conformidade: ${(finalValidation.compliance * 100).toFixed(1)}%`)
    console.log(`[MetaComposer] Sílabas: ${finalValidation.withinLimit}/${finalValidation.totalLines} versos corretos`)
    
    if (bestResult.metadata.terceiraViaAnalysis) {
      console.log(`[MetaComposer] Terceira Via: ${bestResult.metadata.terceiraViaAnalysis.score_geral}/100`)
    }
    
    if (bestResult.metadata.rhymeAnalysis) {
      console.log(`[MetaComposer] Rimas preservadas: ${bestResult.metadata.rhymeAnalysis.preservationRate}%`)
    }

    if (finalValidation.problems.length > 0) {
      console.log('[MetaComposer] ⚠️ VERSOS PROBLEMÁTICOS:')
      finalValidation.problems.forEach(problem => {
        console.log(`  - "${problem.line}" (${problem.syllables}s)`)
      })
    }

    console.log(`[MetaComposer] 🎵 Composição finalizada! Score: ${bestScore.toFixed(2)}`)
    return bestResult
  }

  /**
   * GERAÇÃO INTELIGENTE DE LETRAS
   */
  private static async generateIntelligentLyrics(
    request: CompositionRequest, 
    enforcement: { min: number; max: number; ideal: number },
    preserveRhymes: boolean
  ): Promise<string> {
    const genreConfig = getGenreConfig(request.genre)

    const masterPrompt = this.buildHarmonizedMasterPrompt(request, genreConfig, enforcement, preserveRhymes)

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt: masterPrompt,
      temperature: this.getCreativityTemperature(request.creativity),
      maxTokens: 2000
    })

    return text
  }

  /**
   * PROMPT HARMONIZADO - INTEGRA TODOS OS SISTEMAS
   */
  private static buildHarmonizedMasterPrompt(
    request: CompositionRequest, 
    genreConfig: any, 
    enforcement: { min: number; max: number; ideal: number },
    preserveRhymes: boolean
  ): string {
    const rhymePreservationNote = preserveRhymes 
      ? "⚠️ SISTEMA PRESERVA RIMAS: Se você criar rimas ricas, o sistema as manterá durante a correção."
      : ""

    const terceiraViaPrinciples = `
PRINCÍPIOS DA TERCEIRA VIA (QUALIDADE LITERÁRIA):
• Evite clichês: "coração partido", "lágrimas no travesseiro", "noite sem luar"
• Use imagens concretas do cotidiano brasileiro
• Mostre vulnerabilidade genuína e crescimento
• Linguagem coloquial mas poética
• Foque em transformação emocional real`

    return `COMPOSITOR MUSICAL INTELIGENTE - SISTEMA HARMONIZADO
Gênero: ${request.genre} | Tema: ${request.theme} | Humor: ${request.mood}

🎵 SISTEMA DE SÍLABAS INTELIGENTE:
LIMITE: ${enforcement.min} a ${enforcement.max} sílabas por linha
ALVO IDEAL: ${enforcement.ideal} sílabas
${rhymePreservationNote}

🎵 CONTRAÇÕES OBRIGATÓRIAS (REDUZEM SÍLABAS):
• "você" → "cê" (2→1 sílaba) - SEMPRE
• "estou" → "tô" (2→1 sílaba) - SEMPRE  
• "para" → "pra" (2→1 sílaba) - SEMPRE
• "está" → "tá" (2→1 sílaba) - SEMPRE
• "comigo" → "comigo" (3→2 sílabas)

🎵 ELISAO POÉTICA:
• "de amor" → "d'amor" (3→2 sílabas)
• "que eu" → "qu'eu" (2→1 sílaba)
• "meu amor" → "meuamor" (4→3 sílabas)

${terceiraViaPrinciples}

🎵 EXEMPLOS DE LINHAS CORRETAS (${enforcement.min}-${enforcement.max}s):
• "Cê tá na minha mente" = 6s ✅
• "Vou te amar pra sempre" = 7s ✅  
• "Meu coração é teu" = 6s ✅
• "Nessa vida louca" = 6s ✅
• "Tô perdido no teu olhar" = 7s ✅

🎵 EMPILHAMENTO INTELIGENTE (FORMATAÇÃO):
• UM VERSO POR LINHA para métrica
• EXCEÇÃO: Empilhe quando houver:
  - Diálogo e resposta consecutivos
  - Frases que se complementam naturalmente  
  - Mesmo contexto/sujeito
  - Citações consecutivas

🎯 EXEMPLOS DE EMPILHAMENTO CORRETO:
"Me olha e pergunta: 'Tá perdido?'"
"Respondo: 'Só te desejando...'"

"Te abraço forte"
"E sinto o coração acelerar"

"Ela ri e diz"
"'Vem cá, te mostro o caminho'"

📝 FORMATO PROFISSIONAL OBRIGATÓRIO:

INSTRUÇÕES EM INGLES:
[VERSE 1 - Narrative voice, intimate vocal delivery, establishing story]

LETRAS EM PORTUGUÊS (EMPILHAMENTO INTELIGENTE):
• Sua letra aqui com empilhamento natural

BACKING VOCALS:
(Backing: "texto em português")

METADATA FINAL:
(Instrumentos: list in English | BPM: number | Ritmo: Portuguese | Estilo: Portuguese)

${request.additionalRequirements ? `🎯 REQUISITOS ESPECIAIS:\n${request.additionalRequirements}\n\n` : ''}
${request.hook ? `🎵 GANCHO SUGERIDO: ${request.hook}\n\n` : ''}

💡 ESCREVA DIRETAMENTE COM:
- Contrações aplicadas ("cê", "tô", "pra", "tá")
- Sílabas controladas (${enforcement.min}-${enforcement.max} por linha)
- Empilhamento inteligente
- Linguagem da Terceira Via (sem clichês)

RETORNE APENAS A LETRA NO FORMATO CORRETO.`
  }

  /**
   * APLICA TERCEIRA VIA À LETRA COMPLETA
   */
  private static async applyTerceiraViaToLyrics(
    lyrics: string, 
    genre: string, 
    theme: string
  ): Promise<string> {
    const lines = lyrics.split('\n')
    const improvedLines: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      if (!line.trim() || line.startsWith('[') || line.startsWith('(') || line.startsWith('Titulo:')) {
        improvedLines.push(line)
        continue
      }

      const context = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 3)).join(' | ')
      
      try {
        const improvedLine = await applyTerceiraViaToLine(line, i, context, false)
        improvedLines.push(improvedLine)
      } catch (error) {
        console.error(`[MetaComposer] Erro ao aplicar Terceira Via na linha ${i}:`, error)
        improvedLines.push(line)
      }
    }

    return improvedLines.join('\n')
  }

  /**
   * VALIDAÇÃO COMPREENSIVA HARMONIZADA
   */
  private static async comprehensiveValidation(
    lyrics: string,
    request: CompositionRequest,
    syllableTarget: { min: number; max: number; ideal: number },
    terceiraViaAnalysis?: any
  ): Promise<{ 
    passed: boolean; 
    errors: string[]; 
    warnings: string[];
    syllableStats: {
      totalLines: number
      linesWithinLimit: number
      maxSyllablesFound: number
      averageSyllables: number
    }
    terceiraViaScore?: number
    rhymePreservation?: number
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    const genreConfig = getGenreConfig(request.genre)
    const lines = lyrics.split('\n').filter((line) => line.trim() && !line.startsWith('[') && !line.startsWith('('))

    // ✅ ANÁLISE DE SÍLABAS
    const syllableStats = this.calculateSyllableStatistics(lines, syllableTarget)
    
    if (syllableStats.linesWithinLimit < syllableStats.totalLines) {
      const problemLines = lines.filter(line => {
        const syllables = countPoeticSyllables(line)
        return syllables < syllableTarget.min || syllables > syllableTarget.max
      }).slice(0, 3)
      
      errors.push(
        `${syllableStats.totalLines - syllableStats.linesWithinLimit} versos fora do limite de ${syllableTarget.min}-${syllableTarget.max} sílabas`,
        ...problemLines.map(line => `- "${line}" (${countPoeticSyllables(line)} sílabas)`)
      )
    }

    // ✅ VALIDAÇÃO ANTI-FORCING
    const forcingValidation = validateFullLyricAgainstForcing(lyrics, request.genre)
    if (!forcingValidation.isValid) {
      errors.push(...forcingValidation.warnings)
    }

    // ✅ VALIDAÇÃO DE PALAVRAS PROIBIDAS
    const forbidden = genreConfig.language_rules?.forbidden
      ? Object.values(genreConfig.language_rules.forbidden).flat()
      : []
    const lyricsLower = lyrics.toLowerCase()
    forbidden.forEach((word: string) => {
      if (lyricsLower.includes(word.toLowerCase())) {
        errors.push(`Palavra proibida encontrada: "${word}"`)
      }
    })

    // ✅ VALIDAÇÃO DE REFRÕES (3 linhas são proibidas)
    const chorusMatches = lyrics.match(/\[(?:CHORUS|REFRÃO)[^\]]*\]\s*\n((?:[^\n]+\n?)+?)(?=\[|$)/gi)
    if (chorusMatches) {
      chorusMatches.forEach((chorus, index) => {
        const chorusLines = chorus
          .split("\n")
          .filter((line) => line.trim() && !line.startsWith("["))
          .filter((line) => !line.startsWith("("))
        if (chorusLines.length === 3) {
          errors.push(`Refrão ${index + 1}: 3 linhas é PROIBIDO (use 2 ou 4)`)
        }
      })
    }

    // ✅ ANÁLISE DE EMPILHAMENTO
    const stackingRatio = this.calculateStackingRatio(lyrics)
    if (stackingRatio < 0.3) {
      warnings.push(`Baixo empilhamento de versos (${(stackingRatio * 100).toFixed(0)}%) - formatação pouco natural`)
    } else if (stackingRatio > 0.7) {
      warnings.push(`Alto empilhamento (${(stackingRatio * 100).toFixed(0)}%) - pode dificultar contagem de sílabas`)
    }

    // ✅ SCORE TERCEIRA VIA
    let terceiraViaScore = undefined
    if (terceiraViaAnalysis) {
      terceiraViaScore = terceiraViaAnalysis.score_geral
      if (terceiraViaScore < 70) {
        warnings.push(`Score Terceira Via baixo: ${terceiraViaScore}/100 - considere mais originalidade`)
      }
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
      syllableStats,
      terceiraViaScore,
      rhymePreservation: this.calculateRhymePreservation(lyrics)
    }
  }

  /**
   * SCORE DE QUALIDADE HARMONIZADO
   */
  private static calculateHarmonizedQualityScore(
    lyrics: string,
    validation: any,
    request: CompositionRequest,
    syllableTarget: { min: number; max: number; ideal: number },
    terceiraViaAnalysis: any,
    correctionCount: number
  ): number {
    let score = 1.0

    // ✅ PESO FORTE: Sílabas corretas (40%)
    const syllableRatio = validation.syllableStats.linesWithinLimit / validation.syllableStats.totalLines
    score = score * 0.6 + (syllableRatio * 0.4)

    // ✅ PESO MÉDIO: Terceira Via (25%)
    if (terceiraViaAnalysis) {
      const terceiraViaScore = terceiraViaAnalysis.score_geral / 100
      score = score * 0.75 + (terceiraViaScore * 0.25)
    }

    // ✅ PESO MÉDIO: Estrutura e coerência (20%)
    const coherenceScore = this.assessNarrativeCoherence(lyrics)
    score = score * 0.8 + (coherenceScore * 0.2)

    // ✅ PESO LEVE: Empilhamento balanceado (10%)
    const stackingRatio = this.calculateStackingRatio(lyrics)
    const stackingScore = (stackingRatio >= 0.3 && stackingRatio <= 0.7) ? 1.0 : 0.5
    score = score * 0.9 + (stackingScore * 0.1)

    // ✅ PENALIDADES
    score -= validation.errors.length * 0.1
    score -= validation.warnings.length * 0.05
    score -= Math.min(correctionCount * 0.02, 0.1) // Penalidade leve por correções

    // ✅ BÔNUS: Linguagem simples e natural
    const simplicityScore = this.assessLanguageSimplicity(lyrics)
    score += simplicityScore * 0.05

    return Math.max(0, Math.min(1, score))
  }

  /**
   * REFINAMENTO AUTÔNOMO INTELIGENTE
   */
  private static async autonomousRefinement(
    request: CompositionRequest,
    validation: { passed: boolean; errors: string[]; warnings: string[] },
    syllableTarget: { min: number; max: number; ideal: number },
    terceiraViaAnalysis?: any
  ): Promise<CompositionRequest> {
    
    const refinementInstructions = [
      ...validation.errors.map((error) => `CORRIGIR: ${error}`),
      ...validation.warnings.map((warning) => `MELHORAR: ${warning}`),
      `GARANTIR: ${syllableTarget.min}-${syllableTarget.max} sílabas por verso (alvo: ${syllableTarget.ideal})`,
      `USAR: contrações "cê", "tô", "pra", "tá" e elisões "d'amor", "qu'eu"`,
    ]

    // ✅ ADICIONA INSTRUÇÕES DA TERCEIRA VIA SE SCORE BAIXO
    if (terceiraViaAnalysis && terceiraViaAnalysis.score_geral < 70) {
      refinementInstructions.push(
        `TERCEIRA VIA: Evitar clichês, usar imagens concretas, mostrar vulnerabilidade genuína`
      )
      refinementInstructions.push(
        `TERCEIRA VIA: Foco em ${terceiraViaAnalysis.pontos_fracos.join(', ')}`
      )
    }

    return {
      ...request,
      additionalRequirements: request.additionalRequirements
        ? `${request.additionalRequirements}\n\nREFINAMENTOS NECESSÁRIOS:\n${refinementInstructions.join('\n')}`
        : `REFINAMENTOS NECESSÁRIOS:\n${refinementInstructions.join('\n')}`,
    }
  }

  /**
   * ANÁLISE DE PRESERVAÇÃO DE RIMAS
   */
  private static analyzeRhymePreservation(originalLyrics: string, correctedLyrics: string): any {
    const originalRhymes = this.extractRhymes(originalLyrics)
    const correctedRhymes = this.extractRhymes(correctedLyrics)
    
    let preservedCount = 0
    originalRhymes.forEach((rhyme, index) => {
      if (correctedRhymes[index] === rhyme) {
        preservedCount++
      }
    })

    const preservationRate = originalRhymes.length > 0 
      ? (preservedCount / originalRhymes.length) * 100 
      : 100

    return {
      originalRhymeCount: originalRhymes.length,
      correctedRhymeCount: correctedRhymes.length,
      preservedCount,
      preservationRate: Math.round(preservationRate)
    }
  }

  /**
   * EXTRAI RIMAS DA LETRA
   */
  private static extractRhymes(lyrics: string): string[] {
    const lines = lyrics.split('\n')
      .filter(line => line.trim() && !line.startsWith('[') && !line.startsWith('('))
    
    return lines.map(line => {
      const words = line.trim().split(/\s+/)
      const lastWord = words[words.length - 1]?.toLowerCase().replace(/[.,!?;:]$/g, '') || ''
      return lastWord.slice(-2) // Últimas 2 letras para rima
    }).filter(rhyme => rhyme.length > 0)
  }

  /**
   * CALCULA TAXA DE PRESERVAÇÃO DE RIMAS
   */
  private static calculateRhymePreservation(lyrics: string): number {
    const rhymes = this.extractRhymes(lyrics)
    if (rhymes.length < 2) return 100

    let consistentRhymes = 0
    for (let i = 0; i < rhymes.length - 1; i += 2) {
      if (rhymes[i] === rhymes[i + 1]) {
        consistentRhymes++
      }
    }

    return Math.round((consistentRhymes / Math.floor(rhymes.length / 2)) * 100)
  }

  // 🔧 MÉTODOS AUXILIARES (mantidos do original com melhorias)

  private static calculateSyllableStatistics(lines: string[], syllableTarget: any) {
    let totalSyllables = 0
    let linesWithinLimit = 0
    let maxSyllablesFound = 0

    lines.forEach(line => {
      const syllables = countPoeticSyllables(line)
      totalSyllables += syllables
      maxSyllablesFound = Math.max(maxSyllablesFound, syllables)
      
      if (syllables >= syllableTarget.min && syllables <= syllableTarget.max) {
        linesWithinLimit++
      }
    })

    return {
      totalLines: lines.length,
      linesWithinLimit,
      maxSyllablesFound,
      averageSyllables: lines.length > 0 ? totalSyllables / lines.length : 0
    }
  }

  private static extractTitle(lyrics: string, request: CompositionRequest): string {
    if (request.title) return request.title

    const titleMatch = lyrics.match(/^Titulo:\s*(.+)$/m)
    if (titleMatch?.[1]) return titleMatch[1].trim()

    const chorusMatch = lyrics.match(/\[(?:CHORUS|REFRÃO)[^\]]*\]\s*\n([^\n]+)/i)
    if (chorusMatch?.[1]) {
      return chorusMatch[1].trim().split(" ").slice(0, 4).join(" ")
    }

    return request.theme.split(" ").slice(0, 3).join(" ")
  }

  private static getCreativityTemperature(creativity?: string): number {
    switch (creativity) {
      case "conservador": return 0.5
      case "ousado": return 0.9
      default: return 0.7
    }
  }

  private static calculateStackingRatio(lyrics: string): number {
    const lines = lyrics.split("\n").filter((line) => line.trim() && !line.startsWith("[") && !line.startsWith("("))
    
    let stackedPairs = 0
    let totalPossiblePairs = Math.max(0, lines.length - 1)
    
    for (let i = 0; i < lines.length - 1; i++) {
      const currentLine = lines[i]
      const nextLine = lines[i + 1]
      
      if (this.shouldLinesStack(currentLine, nextLine)) {
        stackedPairs++
      }
    }
    
    return totalPossiblePairs > 0 ? stackedPairs / totalPossiblePairs : 1
  }

  private static shouldLinesStack(line1: string, line2: string): boolean {
    const l1 = line1.toLowerCase().trim()
    const l2 = line2.toLowerCase().trim()
    
    if ((l1.includes('?') && !l2.includes('?')) || (l2.includes('?') && !l1.includes('?'))) {
      return true
    }
    
    const connectors = ['e', 'mas', 'porém', 'então', 'quando', 'onde', 'que', 'pra']
    if (connectors.some(connector => l2.startsWith(connector))) {
      return true
    }
    
    const words1 = new Set(l1.split(/\s+/))
    const words2 = new Set(l2.split(/\s+/))
    const commonWords = [...words1].filter(word => words2.has(word) && word.length > 2)
    if (commonWords.length >= 1) {
      return true
    }
    
    if ((l1.includes('"') || l1.includes("'")) && (l2.includes('"') || l2.includes("'"))) {
      return true
    }
    
    if (l1.endsWith(',') || l1.endsWith(';') || l2.startsWith('—') || l2.startsWith('-')) {
      return true
    }
    
    return false
  }

  private static assessNarrativeCoherence(lyrics: string): number {
    const hasIntro = /\[INTRO\]/i.test(lyrics)
    const hasVerse = /\[VERS[OE]/i.test(lyrics)
    const hasChorus = /\[(?:CHORUS|REFRÃO)\]/i.test(lyrics)
    const hasOutro = /\[OUTRO\]/i.test(lyrics)

    let score = 0
    if (hasIntro) score += 0.25
    if (hasVerse) score += 0.25
    if (hasChorus) score += 0.25
    if (hasOutro) score += 0.25

    return score
  }

  private static assessLanguageSimplicity(lyrics: string): number {
    const complexWords = ["outono", "primavera", "florescer", "bonanca", "alvorada", "crepusculo", "efemero", "sublime"]
    const lyricsLower = lyrics.toLowerCase()
    const complexCount = complexWords.filter((word) => lyricsLower.includes(word)).length

    return Math.max(0, 1 - complexCount * 0.1)
  }
}
