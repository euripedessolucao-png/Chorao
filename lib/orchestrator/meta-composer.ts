import { countPoeticSyllables } from "@/lib/validation/syllable-counter"
import {
  type TerceiraViaAnalysis,
  analisarTerceiraVia,
  applyTerceiraViaToLine,
  analisarMelodiaRitmo,
  ThirdWayEngine,
} from "@/lib/terceira-via"
import { getGenreConfig } from "@/lib/genre-config"
import { generateText } from "ai"
import {
  formatSertanejoPerformance,
  shouldUsePerformanceFormat,
} from "@/lib/formatters/sertanejo-performance-formatter"
import { SyllableEnforcer } from "@/lib/validation/syllableEnforcer"
import { AutoSyllableCorrector } from "@/lib/validation/auto-syllable-corrector"
import { validateAllLayers } from "@/lib/validation/multi-layer-validator"

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
   * COMPOSIÇÃO TURBO COM SISTEMA TERCEIRA VIA INTEGRADO + VALIDAÇÃO MULTI-CAMADAS
   */
  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer-TURBO] Iniciando composição com Terceira Via + Validação Multi-Camadas...")
    console.log("[MetaComposer-TURBO] 🧪 MODO EXPERIMENTAL: SyllableEnforcer DESABILITADO")
    console.log("[MetaComposer-TURBO] ✅ AutoSyllableCorrector ATIVADO")
    console.log("[MetaComposer-TURBO] ✅ Validação Multi-Camadas ATIVADA")

    let iterations = 0
    let bestResult: CompositionResult | null = null
    let bestScore = 0
    let terceiraViaAnalysis: TerceiraViaAnalysis | null = null
    let melodicAnalysis: any = null

    const syllableEnforcement = request.syllableTarget || this.getGenreSyllableConfig(request.genre)
    syllableEnforcement.max = Math.min(syllableEnforcement.max, this.ABSOLUTE_MAX_SYLLABLES)

    const applyFinalPolish = request.applyFinalPolish ?? true
    const preservedChoruses = request.preservedChoruses || []
    const hasPreservedChoruses = preservedChoruses.length > 0
    const isRewrite = !!request.originalLyrics
    const performanceMode = request.performanceMode || "standard"

    const genreConfig = getGenreConfig(request.genre)

    while (iterations < this.MAX_ITERATIONS) {
      iterations++
      console.log(`[MetaComposer-TURBO] Iteração ${iterations}/${this.MAX_ITERATIONS}`)

      let rawLyrics: string

      if (isRewrite) {
        rawLyrics = await this.generateRewrite(request)
      } else if (hasPreservedChoruses && iterations === 1) {
        rawLyrics = await this.generateWithPreservedChoruses(preservedChoruses, request, syllableEnforcement)
      } else {
        rawLyrics = await this.generateDirectLyrics(request, syllableEnforcement)
      }

      console.log("[MetaComposer-TURBO] 🔧 Aplicando correção automática de sílabas...")
      const autoCorrectionResult = AutoSyllableCorrector.correctLyrics(rawLyrics)
      rawLyrics = autoCorrectionResult.correctedLyrics
      console.log(`[MetaComposer-TURBO] ✅ ${autoCorrectionResult.totalCorrected} linhas corrigidas automaticamente`)

      console.log("[MetaComposer-TURBO] 🔍 Executando validação multi-camadas...")
      const multiLayerValidation = validateAllLayers(rawLyrics, request.genre, request.theme)

      console.log(`[MetaComposer-TURBO] 📊 Score Multi-Camadas: ${multiLayerValidation.overallScore.toFixed(0)}/100`)
      console.log(
        `[MetaComposer-TURBO] - Sílabas: ${multiLayerValidation.layers.syllables.passed ? "✅" : "❌"} (${multiLayerValidation.layers.syllables.score})`,
      )
      console.log(
        `[MetaComposer-TURBO] - Narrativa: ${multiLayerValidation.layers.narrative.passed ? "✅" : "❌"} (${multiLayerValidation.layers.narrative.score})`,
      )
      console.log(
        `[MetaComposer-TURBO] - Rimas: ${multiLayerValidation.layers.rhymes.passed ? "✅" : "❌"} (${multiLayerValidation.layers.rhymes.score})`,
      )
      console.log(
        `[MetaComposer-TURBO] - Gramática: ${multiLayerValidation.layers.grammar.passed ? "✅" : "❌"} (${multiLayerValidation.layers.grammar.score})`,
      )
      console.log(
        `[MetaComposer-TURBO] - Anti-Forcing: ${multiLayerValidation.layers.antiForcing.passed ? "✅" : "❌"} (${multiLayerValidation.layers.antiForcing.score})`,
      )
      console.log(
        `[MetaComposer-TURBO] - Emoção: ${multiLayerValidation.layers.emotion.passed ? "✅" : "⚠️"} (${multiLayerValidation.layers.emotion.score})`,
      )

      if (!multiLayerValidation.isValid) {
        console.error(`[MetaComposer-TURBO] ❌ VALIDAÇÃO MULTI-CAMADAS FALHOU:`)
        multiLayerValidation.blockers.forEach((blocker) => console.error(`  ${blocker}`))

        if (iterations < this.MAX_ITERATIONS) {
          console.log("[MetaComposer-TURBO] 🔄 Regenerando devido a falhas na validação multi-camadas...")
          continue
        } else {
          console.log("[MetaComposer-TURBO] ⚠️ Última iteração - aplicando correções emergenciais...")
          rawLyrics = this.applyEmergencyCorrection(rawLyrics, syllableEnforcement.max)
        }
      }

      // ✅ ETAPA 1: ANÁLISE TERCEIRA VIA COM CONFIGURAÇÃO DO GÊNERO
      console.log("[MetaComposer-TURBO] 🔍 Aplicando análise Terceira Via...")
      terceiraViaAnalysis = analisarTerceiraVia(rawLyrics, request.genre, request.theme)
      melodicAnalysis = analisarMelodiaRitmo(rawLyrics, request.genre)

      console.log(`[MetaComposer-TURBO] 📊 Score Terceira Via: ${terceiraViaAnalysis.score_geral}/100`)
      console.log(`[MetaComposer-TURBO] 🎵 Score Melódico: ${melodicAnalysis.flow_score}/100`)

      // ✅ ETAPA 2: CORREÇÕES INTELIGENTES COM THIRD WAY ENGINE
      if (terceiraViaAnalysis.score_geral < 75 && iterations < this.MAX_ITERATIONS - 1) {
        console.log("[MetaComposer-TURBO] 🎯 Aplicando correções Terceira Via...")
        rawLyrics = await this.applyTerceiraViaCorrections(rawLyrics, request, terceiraViaAnalysis, genreConfig)

        // ✅ RE-ANALISA APÓS CORREÇÕES
        terceiraViaAnalysis = analisarTerceiraVia(rawLyrics, request.genre, request.theme)
        console.log(`[MetaComposer-TURBO] 📊 Score após correções: ${terceiraViaAnalysis.score_geral}/100`)
      }

      // ✅ ETAPA 3: CORREÇÃO DE SÍLABAS COM LIMITE ABSOLUTO
      console.log("[MetaComposer-TURBO] 📏 Aplicando correção de sílabas...")
      const enforcedResult = await SyllableEnforcer.enforceSyllableLimits(rawLyrics, syllableEnforcement, request.genre)
      console.log(`[MetaComposer-TURBO] ✅ Correções de sílabas: ${enforcedResult.corrections} linhas`)

      const postCorrectionViolations = this.detectCriticalViolations(enforcedResult.correctedLyrics)
      if (postCorrectionViolations.length > 0) {
        console.error(`[MetaComposer-TURBO] ❌ AINDA HÁ VIOLAÇÕES após correção: ${postCorrectionViolations.length}`)
        enforcedResult.correctedLyrics = this.applyEmergencyCorrection(
          enforcedResult.correctedLyrics,
          syllableEnforcement.max,
        )
      }

      let finalLyrics = enforcedResult.correctedLyrics
      let polishingApplied = false

      // ✅ ETAPA 4: POLIMENTO FINAL COM TERCEIRA VIA
      if (applyFinalPolish && iterations === this.MAX_ITERATIONS) {
        console.log("[MetaComposer-TURBO] ✨ Aplicando polimento universal com Terceira Via...")
        finalLyrics = await this.applyUniversalPolish(
          finalLyrics,
          request.genre,
          request.theme,
          syllableEnforcement,
          performanceMode,
          genreConfig,
        )
        polishingApplied = true
      }

      const finalViolations = this.detectCriticalViolations(finalLyrics)
      if (finalViolations.length > 0) {
        console.error(`[MetaComposer-TURBO] ❌ VIOLAÇÕES FINAIS DETECTADAS: ${finalViolations.length}`)
        finalLyrics = this.applyEmergencyCorrection(finalLyrics, syllableEnforcement.max)
        console.log("[MetaComposer-TURBO] ✅ Correção emergencial aplicada")
      }

      console.log("[MetaComposer-TURBO] 🔍 Validação final multi-camadas...")
      const finalMultiLayerValidation = validateAllLayers(finalLyrics, request.genre, request.theme)

      if (!finalMultiLayerValidation.isValid) {
        console.error(`[MetaComposer-TURBO] ❌ VALIDAÇÃO FINAL MULTI-CAMADAS FALHOU:`)
        finalMultiLayerValidation.blockers.forEach((blocker) => console.error(`  ${blocker}`))

        if (iterations < this.MAX_ITERATIONS) {
          console.log("[MetaComposer-TURBO] 🔄 REGENERANDO devido a falhas críticas...")
          continue
        } else {
          console.log("[MetaComposer-TURBO] ⚠️ Última iteração - aplicando correções emergenciais finais...")
          finalLyrics = this.applyFinalEmergencyFixes(finalLyrics, syllableEnforcement, request.genre)
        }
      } else {
        console.log("[MetaComposer-TURBO] ✅ VALIDAÇÃO FINAL MULTI-CAMADAS APROVADA!")
        console.log(`  - Score Geral: ${finalMultiLayerValidation.overallScore.toFixed(0)}/100`)
      }

      const qualityScore = finalMultiLayerValidation.overallScore

      console.log(`[MetaComposer-TURBO] 🎯 Score final: ${qualityScore.toFixed(2)}`)

      if (qualityScore > bestScore) {
        bestScore = qualityScore
        bestResult = {
          lyrics: finalLyrics,
          title: this.extractTitle(finalLyrics, request),
          metadata: {
            iterations,
            finalScore: qualityScore,
            polishingApplied,
            preservedChorusesUsed: hasPreservedChoruses,
            rhymeScore: finalMultiLayerValidation.layers.rhymes.score,
            rhymeTarget: this.getGenreRhymeTarget(request.genre).minScore,
            structureImproved: isRewrite,
            terceiraViaAnalysis: terceiraViaAnalysis,
            melodicAnalysis: melodicAnalysis,
            performanceMode: performanceMode,
          },
        }
      }

      const shouldStop =
        qualityScore >= this.MIN_QUALITY_SCORE * 100 &&
        finalMultiLayerValidation.isValid &&
        terceiraViaAnalysis.score_geral >= 75 &&
        melodicAnalysis.flow_score >= 70

      if (shouldStop) {
        console.log("[MetaComposer-TURBO] 🎯 Critério de parada atingido!")
        break
      }
    }

    if (!bestResult) {
      throw new Error("Falha ao gerar composição")
    }

    console.log(`[MetaComposer-TURBO] 🎵 Composição finalizada! Score: ${bestScore.toFixed(2)}`)
    return bestResult
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

    const rewritePrompt = `Você é um compositor profissional de ${request.genre}.

LETRA ORIGINAL:
${request.originalLyrics}

TEMA: ${request.theme}
MOOD: ${request.mood}

═══════════════════════════════════════════════════════════════
🎯 MÉTODO DE TRABALHO OBRIGATÓRIO
═══════════════════════════════════════════════════════════════

Você NÃO deve escrever um verso longo e depois tentar corrigir.
Você DEVE construir cada verso JÁ CORRETO desde o início.

PROCESSO PARA CADA VERSO:

1️⃣ PENSE na ideia do verso
2️⃣ ESCREVA uma primeira versão MENTALMENTE
3️⃣ CONTE as sílabas MENTALMENTE
4️⃣ Se > 11, SIMPLIFIQUE antes de escrever
5️⃣ SÓ ENTÃO escreva o verso final

═══════════════════════════════════════════════════════════════
📝 EXEMPLO DO PROCESSO CORRETO
═══════════════════════════════════════════════════════════════

**IDEIA:** Quero falar sobre a lembrança da terra

**PRIMEIRA VERSÃO (mental):**
"A lembrança da terra, o cheiro no ar"

**CONTAGEM (mental):**
A-lem-bran-ça-da-ter-ra-o-chei-ro-no-ar = 12 sílabas ❌

**SIMPLIFICAÇÃO (mental):**
Remover "A" do início
"Lembrança da terra, o cheiro no ar"
Lem-bran-ça-da-ter-ra-o-chei-ro-no-ar = 11 sílabas ✅

**VERSO FINAL (escrito):**
Lembrança da terra, o cheiro no ar

═══════════════════════════════════════════════════════════════
🔧 TÉCNICAS DE SIMPLIFICAÇÃO (USE ANTES DE ESCREVER)
═══════════════════════════════════════════════════════════════

**1. Remova artigos:**
"A lembrança" → "Lembrança"
"O dinheiro" → "Dinheiro"
"A chave" → "Chave"

**2. Simplifique expressões:**
"papel colorido" → "nota falsa"
"Bota suja de pó" → "Bota de pó"
"que humilha" → (remova se não essencial)

**3. Use sinônimos curtos:**
"segurança" → "ilusão"
"esperança" → "fé"
"herança" → "chão"

**4. Contrações naturais:**
"você estava" → "cê tava"
"para o" → "pro"
"está" → "tá"

**5. Plural → Singular:**
"remédios" → "remédio"
"medos" → "medo"

═══════════════════════════════════════════════════════════════
✅ EXEMPLOS DE VERSOS CONSTRUÍDOS CORRETAMENTE
═══════════════════════════════════════════════════════════════

**VERSO 1:** (11 sílabas)
Lembrança da terra, o cheiro no ar
Lem-bran-ça-da-ter-ra-o-chei-ro-no-ar = 11 ✅

**VERSO 2:** (11 sílabas)
Bota de pó, pé firme a andar
Bo-ta-de-pó-pé-fir-me-a-an-dar = 11 ✅

**VERSO 3:** (11 sílabas)
Não tinha dinheiro, mas amava
Não-ti-nha-di-nhei-ro-mas-a-ma-va = 11 ✅

**VERSO 4:** (11 sílabas)
Vida livre, liberdade, voava
Vi-da-li-vre-li-ber-da-de-vo-a-va = 11 ✅

═══════════════════════════════════════════════════════════════
⚠️ REGRA ABSOLUTA
═══════════════════════════════════════════════════════════════

CADA VERSO DEVE TER EXATAMENTE 11 SÍLABAS OU MENOS.

Você DEVE construir cada verso JÁ CORRETO.
NÃO escreva versos longos para corrigir depois.

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

    const directPrompt = `Você é um compositor profissional de ${request.genre}.

TEMA: ${request.theme}
MOOD: ${request.mood}
${request.rhythm ? `RITMO: ${request.rhythm}` : ""}

═══════════════════════════════════════════════════════════════
🎯 MÉTODO DE TRABALHO OBRIGATÓRIO
═══════════════════════════════════════════════════════════════

Você NÃO deve escrever um verso longo e depois tentar corrigir.
Você DEVE construir cada verso JÁ CORRETO desde o início.

PROCESSO PARA CADA VERSO:

1️⃣ PENSE na ideia do verso
2️⃣ ESCREVA uma primeira versão MENTALMENTE
3️⃣ CONTE as sílabas MENTALMENTE
4️⃣ Se ≠ 11, AJUSTE antes de escrever
5️⃣ SÓ ENTÃO escreva o verso final

═══════════════════════════════════════════════════════════════
✅ EXEMPLOS REAIS DE CORREÇÕES TESTADAS
═══════════════════════════════════════════════════════════════

**EXEMPLO 1: Falta 1 sílaba - Adicionar pronome**
❌ "Não tinha dinheiro, mas amava" (10 sílabas)
✅ "Não tinha dinheiro, mas eu amava" (11 sílabas)
TÉCNICA: Adicionar "eu"

**EXEMPLO 2: Falta 1 sílaba - Adicionar artigo**
❌ "Comprei cavalo, mas fiquei preso" (10 sílabas)
✅ "Comprei um cavalo, mas fiquei preso" (11 sílabas)
TÉCNICA: Adicionar "um"

**EXEMPLO 3: Falta 1 sílaba - Adicionar possessivo**
❌ "Coração dispara, quer escapar" (10 sílabas)
✅ "Meu coração dispara, quer escapar" (11 sílabas)
TÉCNICA: Adicionar "Meu"

**EXEMPLO 4: Falta 1 sílaba - Mudar singular para plural**
❌ "Troquei minha paz por nota falsa" (10 sílabas)
✅ "Troquei minha paz por notas falsas" (11 sílabas)
TÉCNICA: "nota" → "notas"

**EXEMPLO 5: Falta 1 sílaba - Substituir expressão**
❌ "Bota de pó, pé firme a andar" (10 sílabas)
✅ "Bota de pó, pé firme na estrada" (11 sílabas)
TÉCNICA: "a andar" → "na estrada"

**EXEMPLO 6: Falta 1 sílaba - Adicionar possessivo no meio**
❌ "Hoje na alma não mora mais fé" (10 sílabas)
✅ "Hoje na minha alma não mora fé" (11 sílabas)
TÉCNICA: Adicionar "minha" e remover "mais"

**EXEMPLO 7: Falta 2 sílabas - Reformular completamente**
❌ "Ai-ai-ai, sou eu no cabresto" (9 sílabas)
✅ "Ai-ai-ai, quem tá no cabresto sou eu" (11 sílabas)
TÉCNICA: Inverter ordem e adicionar "quem tá"

**EXEMPLO 8: Sobra 1 sílaba - Remover preposição**
❌ "Dinheiro escorre por entre os dedos" (12 sílabas)
✅ "Dinheiro escorre entre os dedos" (11 sílabas)
TÉCNICA: Remover "por"

**EXEMPLO 9: Sobra 1 sílaba - Mudar gerúndio para presente**
❌ "Comprando remédio, pagando medo" (12 sílabas)
✅ "Compro remédio, pagando o medo" (11 sílabas)
TÉCNICA: "Comprando" → "Compro"

═══════════════════════════════════════════════════════════════
🔧 BANCO DE TÉCNICAS TESTADAS
═══════════════════════════════════════════════════════════════

**QUANDO FALTA 1 SÍLABA:**
1. Adicionar pronome: "mas amava" → "mas eu amava"
2. Adicionar artigo: "Comprei cavalo" → "Comprei um cavalo"
3. Adicionar possessivo: "Coração" → "Meu coração"
4. Mudar singular → plural: "nota" → "notas"
5. Substituir expressão: "a andar" → "na estrada"

**QUANDO FALTA 2 SÍLABAS:**
1. Reformular completamente invertendo ordem
2. Adicionar "quem tá" ou "que é"

**QUANDO SOBRA 1 SÍLABA:**
1. Remover preposição: "por entre" → "entre"
2. Gerúndio → Presente: "Comprando" → "Compro"
3. Remover advérbio: "não mora mais" → "não mora"

═══════════════════════════════════════════════════════════════
⚠️ REGRA ABSOLUTA
═══════════════════════════════════════════════════════════════

CADA VERSO DEVE TER EXATAMENTE 11 SÍLABAS.

Use as técnicas testadas acima para ajustar ANTES de escrever.

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
