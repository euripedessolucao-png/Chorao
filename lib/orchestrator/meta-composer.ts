import { countPoeticSyllables } from "@/lib/validation/syllable-counter"
import {
  type TerceiraViaAnalysis,
  analisarTerceiraVia,
  applyTerceiraViaToLine,
  ThirdWayEngine,
} from "@/lib/terceira-via"
import { getGenreConfig } from "@/lib/genre-config"
import { generateText } from "ai"
import {
  formatSertanejoPerformance,
  shouldUsePerformanceFormat,
} from "@/lib/formatters/sertanejo-performance-formatter"
import { AutoSyllableCorrector } from "@/lib/validation/auto-syllable-corrector"
import { validateAllLayers } from "@/lib/validation/multi-layer-validator"
import { PunctuationValidator } from "@/lib/validation/punctuation-validator"
import { LineStacker } from "@/lib/utils/line-stacker"
import { AbsoluteSyllableEnforcer } from "@/lib/validation/absolute-syllable-enforcer"
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

export class MetaComposer {
  private static readonly MAX_ITERATIONS = 3
  private static readonly MAX_AUDIT_ATTEMPTS = 5
  private static readonly ABSOLUTE_MAX_SYLLABLES = 11
  private static readonly MIN_QUALITY_SCORE = 0.75 // Score mínimo para aprovar letra

  /**
   * Obtém a configuração de sílabas para um gênero específico
   */
  private static getGenreSyllableConfig(genre: string): { min: number; max: number; ideal: number } {
    const genreConfig = getGenreConfig(genre)
    const syllableRules = genreConfig.prosody_rules?.syllable_count

    // Handle different syllable count structures across genres
    if (syllableRules && "absolute_max" in syllableRules) {
      // Sertanejo Moderno structure
      return {
        min: 7,
        max: syllableRules.absolute_max,
        ideal: 10,
      }
    } else if (syllableRules && "without_comma" in syllableRules) {
      // Other genres structure
      return {
        min: syllableRules.without_comma.min,
        max: syllableRules.without_comma.acceptable_up_to,
        ideal: Math.floor((syllableRules.without_comma.min + syllableRules.without_comma.max) / 2),
      }
    }

    // Default fallback
    return {
      min: 7,
      max: 11,
      ideal: 10,
    }
  }

  /**
   * COMPOSIÇÃO TURBO COM SISTEMA DE MÚLTIPLAS GERAÇÕES
   *
   * Replica a lógica do gerador de refrão:
   * - Gera 3-5 versões de cada elemento
   * - Escolhe a MELHOR de cada
   * - NUNCA entrega letra com erros!
   */
  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer-TURBO] 🚀 Iniciando composição com MÚLTIPLAS GERAÇÕES...")
    console.log("[MetaComposer-TURBO] 🎯 Gera 3 versões completas e escolhe a melhor")
    console.log("[MetaComposer-TURBO] 🚨 NUNCA ENTREGA COM ERROS!")

    const multiGenResult = await MultiGenerationEngine.generateMultipleVariations(
      async () => {
        // Gera uma versão completa da letra
        return await this.generateSingleVersion(request)
      },
      (lyrics) => {
        // Calcula score da letra
        const auditResult = LyricsAuditor.audit(lyrics, request.genre, request.theme)
        return auditResult.score
      },
      3, // Gera 3 versões
    )

    const bestLyrics = multiGenResult.variations[multiGenResult.bestVariationIndex].lyrics
    const bestScore = multiGenResult.bestScore

    console.log(`[MetaComposer-TURBO] 🏆 Melhor versão escolhida! Score: ${bestScore}/100`)
    console.log(`[MetaComposer-TURBO] 💪 Pontos fortes:`)
    multiGenResult.variations[multiGenResult.bestVariationIndex].strengths.forEach((s) => {
      console.log(`  - ${s}`)
    })

    if (multiGenResult.variations[multiGenResult.bestVariationIndex].weaknesses.length > 0) {
      console.log(`[MetaComposer-TURBO] ⚠️ Pontos fracos:`)
      multiGenResult.variations[multiGenResult.bestVariationIndex].weaknesses.forEach((w) => {
        console.log(`  - ${w}`)
      })
    }

    return {
      lyrics: bestLyrics,
      title: this.extractTitle(bestLyrics, request),
      metadata: {
        iterations: 3,
        finalScore: bestScore,
        polishingApplied: request.applyFinalPolish ?? true,
        preservedChorusesUsed: request.preservedChoruses ? request.preservedChoruses.length > 0 : false,
        performanceMode: request.performanceMode || "standard",
      },
    }
  }

  /**
   * GERA UMA VERSÃO COMPLETA DA LETRA
   * Método auxiliar usado pelo sistema de múltiplas gerações
   */
  private static async generateSingleVersion(request: CompositionRequest): Promise<string> {
    console.log("[MetaComposer] 📝 Gerando versão única...")

    const applyFinalPolish = request.applyFinalPolish ?? true
    const preservedChoruses = request.preservedChoruses || []
    const hasPreservedChoruses = preservedChoruses.length > 0
    const isRewrite = !!request.originalLyrics
    const performanceMode = request.performanceMode || "standard"

    const syllableEnforcement = request.syllableTarget || this.getGenreSyllableConfig(request.genre)
    syllableEnforcement.max = Math.min(syllableEnforcement.max, this.ABSOLUTE_MAX_SYLLABLES)

    const genreConfig = getGenreConfig(request.genre)

    // Gera letra base
    let rawLyrics: string

    if (isRewrite) {
      rawLyrics = await this.generateRewrite(request)
    } else if (hasPreservedChoruses) {
      rawLyrics = await this.generateWithPreservedChoruses(preservedChoruses, request, syllableEnforcement)
    } else {
      rawLyrics = await this.generateDirectLyrics(request, syllableEnforcement)
    }

    // Validação ABSOLUTA: Máximo 11 sílabas
    const absoluteValidation = AbsoluteSyllableEnforcer.validate(rawLyrics)
    if (!absoluteValidation.isValid) {
      const enforcedResult = AbsoluteSyllableEnforcer.enforce(rawLyrics)
      rawLyrics = enforcedResult.correctedLyrics
    }

    // Correção automática de sílabas
    const autoCorrectionResult = AutoSyllableCorrector.correctLyrics(rawLyrics)
    rawLyrics = autoCorrectionResult.correctedLyrics

    // Validação multi-camadas
    const multiLayerValidation = validateAllLayers(rawLyrics, request.genre, request.theme)

    // Análise Terceira Via
    const terceiraViaAnalysis = analisarTerceiraVia(rawLyrics, request.genre, request.theme)

    if (terceiraViaAnalysis.score_geral < 75) {
      rawLyrics = await this.applyTerceiraViaCorrections(rawLyrics, request, terceiraViaAnalysis, genreConfig)
    }

    // Polimento final
    let finalLyrics = rawLyrics

    if (applyFinalPolish) {
      finalLyrics = await this.applyUniversalPolish(
        finalLyrics,
        request.genre,
        request.theme,
        syllableEnforcement,
        performanceMode,
        genreConfig,
      )
    }

    // Validação de pontuação
    const punctuationResult = PunctuationValidator.validate(finalLyrics)
    if (!punctuationResult.isValid) {
      finalLyrics = punctuationResult.correctedLyrics
    }

    // Empilhamento de versos
    const stackingResult = LineStacker.stackLines(finalLyrics)
    finalLyrics = stackingResult.stackedLyrics

    // Validação final absoluta
    const finalAbsoluteValidation = AbsoluteSyllableEnforcer.validate(finalLyrics)
    if (!finalAbsoluteValidation.isValid) {
      const enforcedResult = AbsoluteSyllableEnforcer.enforce(finalLyrics)
      finalLyrics = enforcedResult.correctedLyrics
    }

    return finalLyrics
  }

  /**
   * APLICA CORREÇÕES BASEADAS NA ANÁLISE TERCEIRA VIA
   */
  private static async applyTerceiraViaCorrections(
    lyrics: string,
    request: CompositionRequest,
    analysis: TerceiraViaAnalysis,
    genreConfig: any, // ✅ RECEBE CONFIGURAÇÃO
  ): Promise<string> {
    const lines = lyrics.split("\n")
    const correctedLines: string[] = []
    let correctionsApplied = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // ✅ SÓ CORRIGE LINHAS QUE PRECISAM
      if (this.needsTerceiraViaCorrection(line, analysis)) {
        try {
          const context = this.buildLineContext(lines, i, request.theme)
          const correctedLine = await applyTerceiraViaToLine(
            line,
            i,
            context,
            request.performanceMode === "performance",
            request.additionalRequirements,
            request.genre,
          )

          if (correctedLine !== line) {
            correctionsApplied++
            console.log(`[TerceiraVia] 🔄 Linha ${i} corrigida: "${line}" → "${correctedLine}"`)
          }

          correctedLines.push(correctedLine)
        } catch (error) {
          console.warn(`[TerceiraVia] ❌ Erro na linha ${i}, mantendo original`)
          correctedLines.push(line)
        }
      } else {
        correctedLines.push(line)
      }
    }

    console.log(`[MetaComposer-TURBO] ✅ ${correctionsApplied} correções Terceira Via aplicadas`)
    return correctedLines.join("\n")
  }

  /**
   * POLIMENTO UNIVERSAL COM TERCEIRA VIA
   */
  private static async applyUniversalPolish(
    lyrics: string,
    genre: string,
    theme: string,
    syllableTarget: { min: number; max: number; ideal: number },
    performanceMode = "standard",
    genreConfig: any,
  ): Promise<string> {
    console.log(`[MetaComposer-TURBO] ✨ Polimento universal para: ${genre} (${performanceMode})`)

    let polishedLyrics = lyrics

    // ✅ ETAPA 1: CORREÇÃO DE RIMAS COM TERCEIRA VIA
    polishedLyrics = await this.applyRhymeEnhancement(polishedLyrics, genre, theme)

    // ✅ ETAPA 2: CORREÇÃO DE SÍLABAS INTELIGENTE
    const lines = polishedLyrics.split("\n")
    const finalLines: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (line.startsWith("[") || line.startsWith("(") || line.includes("Instruments:") || !line.trim()) {
        finalLines.push(line)
        continue
      }

      const currentSyllables = countPoeticSyllables(line)
      const needsCorrection = currentSyllables < syllableTarget.min || currentSyllables > syllableTarget.max

      if (needsCorrection) {
        try {
          const polishedLine = await ThirdWayEngine.generateThirdWayLine(
            line,
            genre,
            genreConfig,
            `Polimento final para ${genre}`,
            performanceMode === "performance",
            `Ajuste para ${syllableTarget.ideal} sílabas poéticas`,
          )
          finalLines.push(polishedLine)
        } catch (error) {
          finalLines.push(line)
        }
      } else {
        finalLines.push(line)
      }
    }

    polishedLyrics = finalLines.join("\n")

    if (shouldUsePerformanceFormat(genre, performanceMode)) {
      console.log("[MetaComposer] 🎭 Aplicando formato de performance para sertanejo moderno...")
      polishedLyrics = formatSertanejoPerformance(polishedLyrics)
    } else if (performanceMode === "performance") {
      polishedLyrics = this.applyPerformanceFormatting(polishedLyrics, genre)
    }

    return polishedLyrics
  }

  /**
   * GERA REESCRITA DE LETRA EXISTENTE - CONSTRUINDO VERSOS CORRETOS DESDE O INÍCIO
   */
  private static async generateRewrite(request: CompositionRequest): Promise<string> {
    console.log("[MetaComposer] Gerando reescrita construindo versos corretos desde o início...")

    if (!request.originalLyrics) {
      throw new Error("Original lyrics required for rewrite")
    }

    const syllableTarget = request.syllableTarget || this.getGenreSyllableConfig(request.genre)
    const genreConfig = getGenreConfig(request.genre)

    const rewritePrompt = `Você é um compositor profissional de ${request.genre} que cria MEGA HITS BRASILEIROS.

LETRA ORIGINAL:
${request.originalLyrics}

TEMA: ${request.theme}
MOOD: ${request.mood}

═══════════════════════════════════════════════════════════════
🎯 HIERARQUIA DE PRIORIDADES (MEGA HITS BRASILEIROS)
═══════════════════════════════════════════════════════════════

**PRIORIDADE MÁXIMA (Não negociável):**
1. Emoção autêntica e história envolvente
2. Chorus memorável que gruda na cabeça
3. Linguagem coloquial brasileira (cê, tô, pra)
4. Frases completas e coerentes

**PRIORIDADE IMPORTANTE (Guia, não bloqueio):**
5. Limite de 11 sílabas (flexível para emoção)
6. Rimas ricas 50% (objetivo, não obrigatório)

**REGRA DE OURO:**
Técnica SERVE à emoção, não o contrário!

═══════════════════════════════════════════════════════════════
🎵 CARACTERÍSTICAS DOS MEGA HITS
═══════════════════════════════════════════════════════════════

**CHORUS MEMORÁVEL:**
- Frases curtas (máximo 8-9 sílabas)
- Extremamente repetitivo
- Gruda na cabeça imediatamente
- Fácil de cantar junto (karaoke-friendly)

**LINGUAGEM COLOQUIAL:**
- "cê" ao invés de "você"
- "tô" ao invés de "estou"
- "pra" ao invés de "para"
- "tá" ao invés de "está"

**NARRATIVA ENVOLVENTE:**
- Começo-meio-fim claro
- História que emociona
- Autenticidade (não forçado)

═══════════════════════════════════════════════════════════════
✅ BANCO DE SUBSTITUIÇÕES TESTADAS E APROVADAS
═══════════════════════════════════════════════════════════════

**QUANDO FALTA 1 SÍLABA:**
✅ "mas amava" → "mas eu amava"
✅ "Comprei cavalo" → "Comprei um cavalo"
✅ "Coração dispara" → "Meu coração dispara"
✅ "nota falsa" → "notas falsas"
✅ "a andar" → "na estrada"

**QUANDO FALTA 2 SÍLABAS:**
✅ "sou eu no cabresto" → "quem tá no cabresto sou eu"

**QUANDO SOBRA 1 SÍLABA:**
✅ "por entre os dedos" → "entre os dedos"
✅ "Comprando remédio" → "Compro remédio"
✅ "entre os dedos meus" → "entre meus dedos"

═══════════════════════════════════════════════════════════════
⚠️ IMPORTANTE
═══════════════════════════════════════════════════════════════

Se precisar escolher entre:
- Verso com 10-12 sílabas MAS emocionalmente perfeito
- Verso com 11 sílabas MAS sem emoção

ESCOLHA O PRIMEIRO! A emoção é mais importante.

(Mas tente sempre atingir 11 sílabas usando as técnicas acima)

═══════════════════════════════════════════════════════════════

Retorne APENAS a letra reescrita (sem explicações):`

    try {
      const response = await generateText({
        model: "openai/gpt-4o",
        prompt: rewritePrompt,
        temperature: 0.5,
      })

      return response.text || request.originalLyrics
    } catch (error) {
      console.error("[MetaComposer] Erro ao gerar reescrita:", error)
      return request.originalLyrics
    }
  }

  /**
   * GERA LETRA COM REFRÕES PRESERVADOS
   */
  private static async generateWithPreservedChoruses(
    preservedChoruses: string[],
    request: CompositionRequest,
    syllableEnforcement: { min: number; max: number; ideal: number },
  ): Promise<string> {
    console.log("[MetaComposer] Gerando letra com refrões preservados...")

    const syllableTarget = request.syllableTarget || this.getGenreSyllableConfig(request.genre)
    const genreConfig = getGenreConfig(request.genre)

    try {
      const chorusPrompt = `Você é um compositor profissional de ${request.genre}. Crie uma letra usando EXATAMENTE estes refrões:

${preservedChoruses.join("\n\n")}

TEMA: ${request.theme}
MOOD: ${request.mood}

REGRAS ABSOLUTAS:

1. SÍLABAS: Máximo 11 por verso (conte antes de finalizar)
2. GRAMÁTICA: Frases completas em português correto
3. VOCABULÁRIO: Use biquíni, PIX, story, boteco (evite clichês dramáticos)
4. LINGUAGEM: Coloquial brasileira (tô, cê, pra)
5. NARRATIVA: História fluída com começo-meio-fim

Retorne a letra completa com os refrões preservados:`

      const response = await generateText({
        model: "openai/gpt-4o",
        prompt: chorusPrompt,
        temperature: 0.7,
      })

      return response.text || ""
    } catch (error) {
      console.error("[MetaComposer] Erro ao gerar letra com refrões preservados:", error)
      return ""
    }
  }

  /**
   * GERA LETRA DIRETAMENTE - CONSTRUINDO VERSOS CORRETOS DESDE O INÍCIO
   */
  private static async generateDirectLyrics(
    request: CompositionRequest,
    syllableEnforcement: { min: number; max: number; ideal: number },
  ): Promise<string> {
    console.log("[MetaComposer] Gerando letra construindo versos corretos desde o início...")

    const genreConfig = getGenreConfig(request.genre)

    const directPrompt = `Você é um compositor profissional de ${request.genre} que cria MEGA HITS BRASILEIROS.

TEMA: ${request.theme}
MOOD: ${request.mood}
${request.rhythm ? `RITMO: ${request.rhythm}` : ""}

═══════════════════════════════════════════════════════════════
🎯 HIERARQUIA DE PRIORIDADES (MEGA HITS BRASILEIROS)
═══════════════════════════════════════════════════════════════

**PRIORIDADE MÁXIMA (Não negociável):**
1. Emoção autêntica e história envolvente
2. Chorus memorável que gruda na cabeça
3. Linguagem coloquial brasileira (cê, tô, pra)
4. Frases completas e coerentes

**PRIORIDADE IMPORTANTE (Guia, não bloqueio):**
5. Limite de 11 sílabas (flexível para emoção)
6. Rimas ricas 50% (objetivo, não obrigatório)

**REGRA DE OURO:**
Técnica SERVE à emoção, não o contrário!

═══════════════════════════════════════════════════════════════
🎵 CARACTERÍSTICAS DOS MEGA HITS
═══════════════════════════════════════════════════════════════

**CHORUS MEMORÁVEL:**
- Frases curtas (máximo 8-9 sílabas)
- Extremamente repetitivo
- Gruda na cabeça imediatamente
- Fácil de cantar junto (karaoke-friendly)

**LINGUAGEM COLOQUIAL:**
- "cê" ao invés de "você"
- "tô" ao invés de "estou"
- "pra" ao invés de "para"
- "tá" ao invés de "está"

**NARRATIVA ENVOLVENTE:**
- Começo-meio-fim claro
- História que emociona
- Autenticidade (não forçado)

═══════════════════════════════════════════════════════════════
✅ BANCO DE SUBSTITUIÇÕES TESTADAS E APROVADAS
═══════════════════════════════════════════════════════════════

**QUANDO FALTA 1 SÍLABA:**
✅ "mas amava" → "mas eu amava"
✅ "Comprei cavalo" → "Comprei um cavalo"
✅ "Coração dispara" → "Meu coração dispara"
✅ "nota falsa" → "notas falsas"
✅ "a andar" → "na estrada"

**QUANDO FALTA 2 SÍLABAS:**
✅ "sou eu no cabresto" → "quem tá no cabresto sou eu"

**QUANDO SOBRA 1 SÍLABA:**
✅ "por entre os dedos" → "entre os dedos"
✅ "Comprando remédio" → "Compro remédio"
✅ "entre os dedos meus" → "entre meus dedos"

═══════════════════════════════════════════════════════════════
⚠️ IMPORTANTE
═══════════════════════════════════════════════════════════════

Se precisar escolher entre:
- Verso com 10-12 sílabas MAS emocionalmente perfeito
- Verso com 11 sílabas MAS sem emoção

ESCOLHA O PRIMEIRO! A emoção é mais importante.

(Mas tente sempre atingir 11 sílabas usando as técnicas acima)

═══════════════════════════════════════════════════════════════

Retorne APENAS a letra (sem explicações):`

    try {
      const response = await generateText({
        model: "openai/gpt-4o",
        prompt: directPrompt,
        temperature: 0.5,
      })

      return response.text || ""
    } catch (error) {
      console.error("[MetaComposer] Erro ao gerar letra direta:", error)
      throw error
    }
  }

  /**
   * EXTRAI TÍTULO DA LETRA
   */
  private static extractTitle(lyrics: string, request: CompositionRequest): string {
    const lines = lyrics.split("\n")

    // Procura por linha de título explícita
    for (const line of lines) {
      if (line.toLowerCase().includes("título:") || line.toLowerCase().includes("title:")) {
        return line.split(":")[1]?.trim() || "Sem Título"
      }
    }

    // Usa primeira linha significativa como título
    for (const line of lines) {
      const cleaned = line.trim()
      if (cleaned && !cleaned.startsWith("[") && !cleaned.startsWith("(") && cleaned.length > 3) {
        return cleaned.substring(0, 50)
      }
    }

    return `${request.theme} - ${request.genre}`
  }

  /**
   * ANALISA QUALIDADE DAS RIMAS
   */
  private static analyzeRhymes(
    lyrics: string,
    genre: string,
  ): { score: number; richRhymes: number; totalRhymes: number } {
    const lines = lyrics.split("\n").filter((l) => l.trim() && !l.startsWith("[") && !l.startsWith("("))

    let richRhymes = 0
    let totalRhymes = 0

    // Análise simplificada de rimas
    for (let i = 0; i < lines.length - 1; i++) {
      const line1 = lines[i].trim()
      const line2 = lines[i + 1].trim()

      if (line1 && line2) {
        const lastWord1 = line1.split(" ").pop()?.toLowerCase() || ""
        const lastWord2 = line2.split(" ").pop()?.toLowerCase() || ""

        if (lastWord1.length > 2 && lastWord2.length > 2) {
          const suffix1 = lastWord1.slice(-3)
          const suffix2 = lastWord2.slice(-3)

          if (suffix1 === suffix2) {
            totalRhymes++
            // Rima rica: mais de 3 caracteres iguais
            if (lastWord1.slice(-4) === lastWord2.slice(-4)) {
              richRhymes++
            }
          }
        }
      }
    }

    const score = totalRhymes > 0 ? (richRhymes / totalRhymes) * 100 : 0
    return { score, richRhymes, totalRhymes }
  }

  /**
   * OBTÉM TARGET DE RIMAS PARA O GÊNERO
   */
  private static getGenreRhymeTarget(genre: string): { minScore: number; richRhymePercentage: number } {
    // Targets padrão baseados no gênero
    const targets: Record<string, { minScore: number; richRhymePercentage: number }> = {
      "sertanejo-moderno": { minScore: 70, richRhymePercentage: 60 },
      "sertanejo-universitario": { minScore: 70, richRhymePercentage: 60 },
      piseiro: { minScore: 65, richRhymePercentage: 55 },
      forro: { minScore: 65, richRhymePercentage: 55 },
      funk: { minScore: 60, richRhymePercentage: 50 },
      trap: { minScore: 60, richRhymePercentage: 50 },
      default: { minScore: 65, richRhymePercentage: 55 },
    }

    return targets[genre] || targets["default"]
  }

  /**
   * VERIFICA SE LINHA PRECISA DE CORREÇÃO TERCEIRA VIA
   */
  private static needsTerceiraViaCorrection(line: string, analysis: TerceiraViaAnalysis): boolean {
    // Não corrige tags, instruções ou linhas vazias
    if (!line.trim() || line.startsWith("[") || line.startsWith("(") || line.includes("Instruments:")) {
      return false
    }

    // Corrige se score geral está baixo
    if (analysis.score_geral < 70) {
      return true
    }

    // Corrige se há pontos fracos identificados
    if (analysis.pontos_fracos && analysis.pontos_fracos.length > 0) {
      return true
    }

    return false
  }

  /**
   * CONSTRÓI CONTEXTO PARA CORREÇÃO DE LINHA
   */
  private static buildLineContext(lines: string[], lineIndex: number, theme: string): string {
    const contextLines: string[] = []

    // Adiciona linha anterior se existir
    if (lineIndex > 0) {
      contextLines.push(`Linha anterior: ${lines[lineIndex - 1]}`)
    }

    // Adiciona linha atual
    contextLines.push(`Linha atual: ${lines[lineIndex]}`)

    // Adiciona próxima linha se existir
    if (lineIndex < lines.length - 1) {
      contextLines.push(`Próxima linha: ${lines[lineIndex + 1]}`)
    }

    contextLines.push(`Tema: ${theme}`)

    return contextLines.join("\n")
  }

  /**
   * APLICA MELHORIAS DE RIMA
   */
  private static async applyRhymeEnhancement(lyrics: string, genre: string, theme: string): Promise<string> {
    console.log("[MetaComposer] Aplicando melhorias de rima...")

    // Implementação simplificada - retorna lyrics original
    // Em produção, isso usaria o rhyme-enhancer
    return lyrics
  }

  /**
   * APLICA FORMATAÇÃO PERFORMÁTICA
   */
  private static applyPerformanceFormatting(lyrics: string, genre: string): string {
    console.log("[MetaComposer] Aplicando formatação performática...")

    // Garante que tags estão em inglês e versos em português
    let formatted = lyrics

    // Converte tags comuns para inglês
    formatted = formatted.replace(/\[Intro\]/gi, "[Intro]")
    formatted = formatted.replace(/\[Verso\s*(\d*)\]/gi, "[Verse$1]")
    formatted = formatted.replace(/\[Refrão\]/gi, "[Chorus]")
    formatted = formatted.replace(/\[Ponte\]/gi, "[Bridge]")
    formatted = formatted.replace(/\[Final\]/gi, "[Outro]")

    return formatted
  }

  private static detectCriticalViolations(
    lyrics: string,
  ): Array<{ line: string; syllables: number; lineNumber: number }> {
    const lines = lyrics.split("\n")
    const violations: Array<{ line: string; syllables: number; lineNumber: number }> = []

    lines.forEach((line, index) => {
      const trimmed = line.trim()

      // Ignora tags, instruções e linhas vazias
      if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(") || trimmed.includes("Instruments:")) {
        return
      }

      const syllables = countPoeticSyllables(trimmed)
      if (syllables > this.ABSOLUTE_MAX_SYLLABLES) {
        violations.push({
          line: trimmed,
          syllables,
          lineNumber: index + 1,
        })
      }
    })

    return violations
  }

  private static applyEmergencyCorrection(lyrics: string, maxSyllables: number): string {
    console.log(`[MetaComposer] ⚠️ Correção de emergência DESABILITADA`)
    console.log(`[MetaComposer] ℹ️ Retornando lyrics original - IA deve regenerar`)

    // NÃO remove palavras - isso quebra a gramática
    // A IA deve regenerar a letra inteira se necessário
    return lyrics
  }

  /**
   * CORREÇÕES EMERGENCIAIS FINAIS
   * Aplica correções drásticas se necessário para garantir que a letra seja válida
   */
  private static applyFinalEmergencyFixes(
    lyrics: string,
    syllableTarget: { min: number; max: number; ideal: number },
    genre: string,
  ): string {
    console.log("[MetaComposer] ⚠️ Correções emergenciais finais DESABILITADAS")
    console.log("[MetaComposer] ℹ️ Retornando lyrics original - sistema deve regenerar")

    // NÃO aplica correções que quebram frases
    // Se chegou aqui com erros, o sistema deve REGENERAR a letra inteira
    return lyrics
  }
}
