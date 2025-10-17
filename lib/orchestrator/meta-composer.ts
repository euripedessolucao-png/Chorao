/**
 * META-COMPOSITOR - SISTEMA AUTONOMO DE COMPOSICAO INTELIGENTE
 */

import { generateText } from "ai"
import { ThirdWayEngine } from "@/lib/third-way-converter"
import { getGenreConfig } from "@/lib/genre-config"
import { validateFullLyricAgainstForcing } from "@/lib/validation/anti-forcing-validator"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter"
import { SyllableEnforcer } from "@/lib/validation/syllableEnforcer"

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
  }
  metadata: {
    iterations: number
    refinements: number
    finalScore: number
  }
}

export class MetaComposer {
  private static readonly MAX_ITERATIONS = 3
  private static readonly MIN_QUALITY_SCORE = 0.8
  private static readonly ENABLE_AUTO_REFINEMENT = true
  private static readonly SYLLABLE_TARGET = { min: 7, max: 11, ideal: 9 }

  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer] Iniciando composicao com imposicao de silabas...")

    let iterations = 0
    let refinements = 0
    let bestResult: CompositionResult | null = null
    let bestScore = 0

    const syllableEnforcement = request.syllableTarget || this.SYLLABLE_TARGET

    while (iterations < this.MAX_ITERATIONS) {
      iterations++
      console.log(`[MetaComposer] Iteracao ${iterations}/${this.MAX_ITERATIONS}`)

      const rawLyrics = await this.generateWithSyllableControl(request, syllableEnforcement)

      const enforcedResult = await SyllableEnforcer.enforceSyllableLimits(
        rawLyrics, 
        syllableEnforcement, 
        request.genre
      )

      console.log(`[MetaComposer] Correcoes aplicadas: ${enforcedResult.corrections} linhas`)

      const validation = await this.comprehensiveValidation(
        enforcedResult.correctedLyrics, 
        request, 
        syllableEnforcement
      )

      const qualityScore = this.calculateQualityScore(
        enforcedResult.correctedLyrics, 
        validation, 
        request, 
        syllableEnforcement
      )

      console.log(`[MetaComposer] Score de qualidade: ${qualityScore.toFixed(2)}`)
      console.log(`[MetaComposer] Estatisticas de silabas: ${validation.syllableStats.linesWithinLimit}/${validation.syllableStats.totalLines} versos dentro do limite`)

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
          },
        }
      }

      if (qualityScore >= this.MIN_QUALITY_SCORE && validation.passed) {
        console.log("[MetaComposer] Qualidade minima atingida!")
        break
      }

      if (this.ENABLE_AUTO_REFINEMENT && iterations < this.MAX_ITERATIONS) {
        console.log("[MetaComposer] Aplicando refinamento autonomo...")
        request = await this.autonomousRefinement(request, validation, syllableEnforcement)
        refinements++
      }
    }

    if (!bestResult) {
      throw new Error("Falha ao gerar composicao de qualidade minima")
    }

    const finalValidation = SyllableEnforcer.validateLyrics(bestResult.lyrics, syllableEnforcement)
    console.log(`[MetaComposer] RELATORIO FINAL: ${(finalValidation.compliance * 100).toFixed(1)}% de conformidade`)
    console.log(`[MetaComposer] Silabas: ${finalValidation.withinLimit}/${finalValidation.totalLines} versos corretos`)

    if (finalValidation.problems.length > 0) {
      console.log('[MetaComposer] VERSOS PROBLEMATICOS:')
      finalValidation.problems.forEach(problem => {
        console.log(`  - "${problem.line}" (${problem.syllables}s)`)
      })
    }

    console.log(`[MetaComposer] Composicao finalizada! Score: ${bestScore.toFixed(2)}`)
    return bestResult
  }

  private static async generateWithSyllableControl(
    request: CompositionRequest, 
    enforcement: { min: number; max: number; ideal: number }
  ): Promise<string> {
    const genreConfig = getGenreConfig(request.genre)

    const masterPrompt = this.buildMasterPromptWithSyllableEnforcement(request, genreConfig, enforcement)

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt: masterPrompt,
      temperature: request.creativity === "conservador" ? 0.5 : request.creativity === "ousado" ? 0.9 : 0.7,
    })

    const enforcedResult = await SyllableEnforcer.enforceSyllableLimits(text, enforcement, request.genre)
    
    if (enforcedResult.corrections > 0) {
      console.log(`[MetaComposer] ${enforcedResult.corrections} linhas corrigidas na geracao`)
    }

    return enforcedResult.correctedLyrics
  }

  private static buildMasterPromptWithSyllableEnforcement(
    request: CompositionRequest, 
    genreConfig: any, 
    enforcement: { min: number; max: number; ideal: number }
  ): string {
    return `COMPOSITOR COM IMPOSICAO DE SILABAS - ${request.genre}

REGRAS ABSOLUTAS DE SILABAS (SISTEMA MONITORA E CORRIGE):

LIMITE: ${enforcement.min} a ${enforcement.max} silabas por linha
ALVO IDEAL: ${enforcement.ideal} silabas

CONTRAÇÕES OBRIGATORIAS (SISTEMA VERIFICA):
- "voce" -> "ce" (2->1 silaba) - SEMPRE
- "estou" -> "to" (2->1 silaba) - SEMPRE  
- "para" -> "pra" (2->1 silaba) - SEMPRE
- "esta" -> "ta" (2->1 silaba) - SEMPRE

ELISAO OBRIGATORIA (SISTEMA VERIFICA):
- "de amor" -> "d'amor" (3->2 silabas)
- "que eu" -> "qu'eu" (2->1 silaba)
- "meu amor" -> "meuamor" (4->3 silabas)

EXEMPLOS CORRETOS (${enforcement.min}-${enforcement.max}s):
- "Ce ta na minha mente" = 6s CORRETO
- "Vou te amar pra sempre" = 7s CORRETO  
- "Meu coracao e teu" = 6s CORRETO
- "Nessa vida louca" = 6s CORRETO

EXEMPLOS ERRADOS (SISTEMA BLOQUEIA):
- "Eu estou pensando em voce" = 13s ERRADO (use "To pensando em ce")
- "A saudade que eu sinto" = 14s ERRADO (use "Saudade que sinto")

SISTEMA AUTOMATICO: Se voce escrever fora do limite, o sistema reescrevera automaticamente.

TEMA: ${request.theme}
HUMOR: ${request.mood}

ESCREVA JA COM AS CONTRAÇÕES APLICADAS!

FORMATO PROFISSIONAL OBRIGATORIO:

INSTRUCOES EM INGLES:
[VERSE 1 - Narrative voice, intimate vocal delivery, establishing story]

LETRAS EM PORTUGUES (EMPILHAMENTO INTELIGENTE):
• UM VERSO POR LINHA para métrica
• EXCEÇÃO: Quando versos se complementam, EMPILHE:
  - Diálogo e resposta
  - Frases que continuam naturalmente  
  - Mesmo contexto/sujeito
  - Citações consecutivas

EXEMPLOS DE EMPILHAMENTO CORRETO:
"Me olha e pergunta: 'Tá perdido?'"
"Respondo: 'Só te desejando...'"

"Te abraço forte"
"E sinto o coração acelerar"

"Ela ri e diz"
"'Vem cá, te mostro o caminho'"

BACKING VOCALS:
(Backing: "texto em portugues")

METADATA FINAL:
(Instrumentos: list in English | BPM: number | Ritmo: Portuguese | Estilo: Portuguese)

${request.additionalRequirements ? `REQUISITOS ESPECIAIS:\n${request.additionalRequirements}\n\n` : ''}
RETORNE APENAS A LETRA NO FORMATO CORRETO.`
  }

  private static async comprehensiveValidation(
    lyrics: string,
    request: CompositionRequest,
    syllableTarget: { min: number; max: number; ideal: number }
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
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    const genreConfig = getGenreConfig(request.genre)
    const lines = lyrics.split('\n').filter((line) => line.trim() && !line.startsWith('[') && !line.startsWith('('))

    const syllableStats = this.calculateSyllableStatistics(lines, syllableTarget)
    
    if (syllableStats.linesWithinLimit < syllableStats.totalLines) {
      const problemLines = lines.filter(line => {
        const syllables = countPoeticSyllables(line)
        return syllables < syllableTarget.min || syllables > syllableTarget.max
      }).slice(0, 3)
      
      errors.push(
        `${syllableStats.totalLines - syllableStats.linesWithinLimit} versos fora do limite de ${syllableTarget.min}-${syllableTarget.max} silabas`,
        ...problemLines.map(line => `- "${line}" (${countPoeticSyllables(line)} silabas)`)
      )
    }

    const forcingValidation = validateFullLyricAgainstForcing(lyrics, request.genre)
    if (!forcingValidation.isValid) {
      errors.push(...forcingValidation.warnings)
    }

    const forbidden = genreConfig.language_rules?.forbidden
      ? Object.values(genreConfig.language_rules.forbidden).flat()
      : []
    const lyricsLower = lyrics.toLowerCase()
    forbidden.forEach((word: string) => {
      if (lyricsLower.includes(word.toLowerCase())) {
        errors.push(`Palavra proibida encontrada: "${word}"`)
      }
    })

    const chorusMatches = lyrics.match(/\[(?:CHORUS|REFRÃO)[^\]]*\]\s*\n((?:[^\n]+\n?)+?)(?=\[|$)/gi)
    if (chorusMatches) {
      chorusMatches.forEach((chorus, index) => {
        const chorusLines = chorus
          .split("\n")
          .filter((line) => line.trim() && !line.startsWith("["))
          .filter((line) => !line.startsWith("("))
        if (chorusLines.length === 3) {
          errors.push(`Refrao ${index + 1}: 3 linhas e PROIBIDO (use 2 ou 4)`)
        }
      })
    }

    const stackingRatio = this.calculateStackingRatio(lyrics)
    if (stackingRatio < 0.3) {
      warnings.push(`Baixo empilhamento de versos (${(stackingRatio * 100).toFixed(0)}%) - formatação pouco natural`)
    } else if (stackingRatio > 0.7) {
      warnings.push(`Alto empilhamento (${(stackingRatio * 100).toFixed(0)}%) - pode dificultar contagem de sílabas`)
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
      syllableStats
    }
  }

  private static calculateSyllableStatistics(
    lines: string[], 
    syllableTarget: { min: number; max: number; ideal: number }
  ) {
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

  private static calculateQualityScore(
    lyrics: string,
    validation: { 
      passed: boolean; 
      errors: string[]; 
      warnings: string[];
      syllableStats: any 
    },
    request: CompositionRequest,
    syllableTarget: { min: number; max: number; ideal: number }
  ): number {
    let score = 1.0

    const syllableErrors = validation.errors.filter(error => error.includes('silabas')).length
    score -= syllableErrors * 0.3

    const otherErrors = validation.errors.length - syllableErrors
    score -= otherErrors * 0.2

    score -= validation.warnings.length * 0.05

    const syllableRatio = validation.syllableStats.linesWithinLimit / validation.syllableStats.totalLines
    score += syllableRatio * 0.3

    const stackingRatio = this.calculateStackingRatio(lyrics)
    // Score ideal de empilhamento: 30-70%
    if (stackingRatio >= 0.3 && stackingRatio <= 0.7) {
      score += 0.15 // Bonus por empilhamento balanceado
    } else {
      score -= 0.1 // Penalidade por empilhamento extremo
    }

    const coherenceScore = this.assessNarrativeCoherence(lyrics)
    score += coherenceScore * 0.15

    const simplicityScore = this.assessLanguageSimplicity(lyrics)
    score += simplicityScore * 0.1

    return Math.max(0, Math.min(1, score))
  }

  private static extractTitle(lyrics: string, request: CompositionRequest): string {
    if (request.title) return request.title

    const titleMatch = lyrics.match(/^Titulo:\s*(.+)$/m)
    if (titleMatch?.[1]) return titleMatch[1].trim()

    const chorusMatch = lyrics.match(/\[(?:CHORUS|REFRÃO)[^\]]*\]\s*\n([^\n]+)/i)
    if (chorusMatch?.[1]) {
      return chorusMatch[1].trim().split(" ").slice(0, 4).join(" ")
    }

    return "Sem Titulo"
  }

  private static async autonomousRefinement(
    request: CompositionRequest,
    validation: { passed: boolean; errors: string[]; warnings: string[] },
    syllableTarget: { min: number; max: number; ideal: number }
  ): Promise<CompositionRequest> {
    const refinementInstructions = [
      ...validation.errors.map((error) => `CORRIGIR: ${error}`),
      ...validation.warnings.map((warning) => `MELHORAR: ${warning}`),
      `GARANTIR: ${syllableTarget.min}-${syllableTarget.max} silabas por verso (alvo: ${syllableTarget.ideal})`,
      `USAR: contracoes "ce", "to", "pra", "ta" e elisoes "d'amor", "qu'eu"`,
    ].join("\n")

    return {
      ...request,
      additionalRequirements: request.additionalRequirements
        ? `${request.additionalRequirements}\n\nREFINAMENTOS NECESSARIOS:\n${refinementInstructions}`
        : `REFINAMENTOS NECESSARIOS:\n${refinementInstructions}`,
    }
  }

  private static calculateStackingRatio(lyrics: string): number {
    const lines = lyrics.split("\n").filter((line) => line.trim() && !line.startsWith("[") && !line.startsWith("("))
    
    let stackedPairs = 0
    let totalPossiblePairs = Math.max(0, lines.length - 1)
    
    // Analisa pares de linhas consecutivas
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
    
    // ✅ CRITÉRIOS EXPANDIDOS DE EMPILHAMENTO:
    
    // 1. Diálogo e resposta
    if ((l1.includes('?') && !l2.includes('?')) || 
        (l2.includes('?') && !l1.includes('?'))) {
      return true
    }
    
    // 2. Continuação lógica (conectores)
    const connectors = ['e', 'mas', 'porém', 'então', 'quando', 'onde', 'que', 'pra']
    if (connectors.some(connector => l2.startsWith(connector))) {
      return true
    }
    
    // 3. Mesmo sujeito/contexto (palavras em comum)
    const words1 = new Set(l1.split(/\s+/))
    const words2 = new Set(l2.split(/\s+/))
    const commonWords = [...words1].filter(word => words2.has(word) && word.length > 2)
    if (commonWords.length >= 1) {
      return true
    }
    
    // 4. Padrão de citação/diálogo
    if ((l1.includes('"') || l1.includes("'")) && (l2.includes('"') || l2.includes("'"))) {
      return true
    }
    
    // 5. Continuação natural (linha 2 completa linha 1)
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
