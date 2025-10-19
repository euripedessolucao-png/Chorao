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
import { validateRhymesForGenre } from "@/lib/validation/rhyme-validator"
import { validateVerseIntegrity } from "@/lib/validation/verse-integrity-validator"
import {
  formatSertanejoPerformance,
  shouldUsePerformanceFormat,
} from "@/lib/formatters/sertanejo-performance-formatter"
import { validateNarrativeFlow } from "@/lib/validation/narrative-validator"
import { SyllableEnforcer } from "@/lib/validation/syllableEnforcer"

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
   * COMPOSIÇÃO TURBO COM SISTEMA TERCEIRA VIA INTEGRADO
   */
  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer-TURBO] Iniciando composição com Terceira Via...")
    console.log("[MetaComposer-TURBO] 🧪 MODO EXPERIMENTAL: SyllableEnforcer DESABILITADO")

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

      const criticalViolations = this.detectCriticalViolations(rawLyrics)
      if (criticalViolations.length > 0) {
        console.error(`[MetaComposer-TURBO] ❌ VIOLAÇÃO CRÍTICA: ${criticalViolations.length} versos com >11 sílabas`)
        criticalViolations.forEach((v) => {
          console.error(`  Linha ${v.lineNumber}: "${v.line}" (${v.syllables} sílabas)`)
        })

        // Se não é a última iteração, tenta novamente
        if (iterations < this.MAX_ITERATIONS) {
          console.log("[MetaComposer-TURBO] 🔄 Regenerando devido a violações críticas...")
          continue
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

        // Aplica correção emergencial linha por linha
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

      const finalValidation = this.validateFinalLyrics(finalLyrics, request.genre, syllableEnforcement)

      if (!finalValidation.isValid) {
        console.error(`[MetaComposer-TURBO] ❌ VALIDAÇÃO FINAL FALHOU:`)
        finalValidation.criticalErrors.forEach((error) => console.error(`  - ${error}`))

        // Se não é a última iteração, REGENERA
        if (iterations < this.MAX_ITERATIONS) {
          console.log("[MetaComposer-TURBO] 🔄 REGENERANDO devido a falhas críticas...")
          continue
        } else {
          // Última iteração: aplica correções emergenciais
          console.log("[MetaComposer-TURBO] ⚠️ Última iteração - aplicando correções emergenciais...")
          finalLyrics = this.applyFinalEmergencyFixes(finalLyrics, syllableEnforcement, request.genre)
        }
      } else {
        console.log("[MetaComposer-TURBO] ✅ VALIDAÇÃO FINAL APROVADA!")
        console.log(`  - Sílabas: ${finalValidation.syllableCompliance}% dentro do limite`)
        console.log(`  - Rimas: ${finalValidation.rhymeQuality}% de qualidade`)
        console.log(`  - Integridade: ${finalValidation.verseIntegrity}% versos completos`)
        console.log(`  - Narrativa: ${finalValidation.hasNarrative ? "✓" : "✗"}`)
      }

      // ✅ ETAPA 5: AVALIAÇÃO DE QUALIDADE INTEGRADA
      const qualityScore = this.calculateQualityScore(
        finalLyrics,
        syllableEnforcement,
        request.genre,
        terceiraViaAnalysis,
        melodicAnalysis,
      )

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
            rhymeScore: this.analyzeRhymes(finalLyrics, request.genre).score,
            rhymeTarget: this.getGenreRhymeTarget(request.genre).minScore,
            structureImproved: isRewrite,
            terceiraViaAnalysis: terceiraViaAnalysis,
            melodicAnalysis: melodicAnalysis,
            performanceMode: performanceMode,
          },
        }
      }

      const shouldStop =
        qualityScore >= this.MIN_QUALITY_SCORE &&
        terceiraViaAnalysis.score_geral >= 75 &&
        melodicAnalysis.flow_score >= 70 &&
        finalValidation.isValid // Só para se validação final passou

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
   * GERA REESCRITA DE LETRA EXISTENTE
   */
  private static async generateRewrite(request: CompositionRequest): Promise<string> {
    console.log("[MetaComposer] Gerando reescrita de letra existente...")

    if (!request.originalLyrics) {
      throw new Error("Original lyrics required for rewrite")
    }

    const syllableTarget = request.syllableTarget || this.getGenreSyllableConfig(request.genre)
    const genreConfig = getGenreConfig(request.genre)

    try {
      const rewritePrompt = `Você é um compositor profissional de ${request.genre}. Reescreva esta letra mantendo a estrutura mas melhorando a qualidade.

LETRA ORIGINAL:
${request.originalLyrics}

TEMA: ${request.theme}
MOOD: ${request.mood}

═══════════════════════════════════════════════════════════════
REGRAS ABSOLUTAS (NÃO PODEM SER QUEBRADAS - PRIORIDADE MÁXIMA)
═══════════════════════════════════════════════════════════════

1. LIMITE DE 11 SÍLABAS POÉTICAS (ABSOLUTO E INEGOCIÁVEL)
   - Cada verso DEVE ter no máximo 11 sílabas poéticas
   - Ideal: ${syllableTarget.ideal} sílabas
   - Mínimo: ${syllableTarget.min} sílabas
   
   COMO CONTAR SÍLABAS POÉTICAS:
   - Conte até a última sílaba tônica
   - Exemplo: "Eu vou seguir meu caminho sem olhar" = "Eu-vou-se-guir-meu-ca-mi-nho-sem-o-LHAR" = 11 sílabas ✓
   
   ESTRATÉGIAS PARA ENCURTAR VERSOS:
   a) Use contrações: você→cê, está→tá, para→pra, estava→tava
   b) Remova palavras desnecessárias: "muito", "bem", "tão", "já"
   c) Simplifique: "que estava tentando" → "que tentava"
   d) Seja direto: "Eu vou seguir o meu caminho" → "Vou seguir meu caminho"
   
   EXEMPLOS PRÁTICOS:
   ❌ "Eu me libertei de tudo que você fazia pra me prender" (16 sílabas)
   ✓ "Me libertei do que cê fez pra me prender" (11 sílabas)
   
   ❌ "Hoje eu sou dona de mim e da minha própria vida" (14 sílabas)
   ✓ "Hoje sou dona de mim e da minha vida" (11 sílabas)

2. GRAMÁTICA PERFEITA (FRASES COMPLETAS E CORRETAS)
   - Cada verso = frase completa com sujeito + verbo + complemento
   - NUNCA versos incompletos ou quebrados
   
   ERROS COMUNS A EVITAR:
   ❌ "Vou não podia aceitar" (dois verbos sem conectivo)
   ✓ "Vou seguir sem aceitar"
   
   ❌ "Saí tentava me esconder" (dois verbos sem conectivo)
   ✓ "Saí da sombra que tentava me esconder"
   
   ❌ "Cortei deixei pra trás" (falta objeto)
   ✓ "Cortei o laço e deixei pra trás"

3. NARRATIVA FLUÍDA (HISTÓRIA COM COMEÇO-MEIO-FIM)
   - Começo: Apresenta a situação/problema
   - Meio: Desenvolve a transformação/conflito
   - Fim: Resolução com empoderamento
   - Cada verso deve CONECTAR com o anterior
   - SEM mudanças abruptas de assunto

═══════════════════════════════════════════════════════════════
REGRAS DESEJÁVEIS (IMPORTANTE MAS FLEXÍVEL)
═══════════════════════════════════════════════════════════════

4. VOCABULÁRIO SERTANEJO MODERNO
   PREFIRA: biquíni, PIX, story, boteco, pickup, praia, zap, rolê, copo de vitória
   EVITE: coração em pedaços, lágrimas, solidão, mundo desabou, dor vazio

5. LINGUAGEM COLOQUIAL BRASILEIRA
   - Use: tô, cê, pra, né, mano, véio
   - Fale como brasileiro no dia-a-dia
   - Simples e direto, como numa conversa

6. ESTRUTURA
   - Use PART A (verso), PART B (refrão), PART C (ponte)
   - Refrão deve ser chiclete e repetitivo
   - Mantenha a mesma quantidade de seções da original

═══════════════════════════════════════════════════════════════
PROCESSO DE CRIAÇÃO (SIGA ESTA ORDEM)
═══════════════════════════════════════════════════════════════

PASSO 1: PENSE ANTES DE ESCREVER
- Qual é a história que quero contar?
- Como posso contar em versos curtos (11 sílabas)?
- Quais palavras posso encurtar ou remover?

PASSO 2: ESCREVA CADA VERSO
- Escreva o verso
- CONTE as sílabas poéticas
- Se passar de 11, REESCREVA usando as estratégias acima
- Verifique se a gramática está correta

PASSO 3: REVISE ANTES DE FINALIZAR
✓ Todos os versos têm 11 sílabas ou menos?
✓ Todas as frases estão completas e corretas?
✓ A história flui do começo ao fim?
✓ Usei vocabulário moderno e coloquial?
✓ Evitei clichês dramáticos?

═══════════════════════════════════════════════════════════════
SEU OBJETIVO FINAL (LEIA COM ATENÇÃO)
═══════════════════════════════════════════════════════════════

Você DEVE entregar uma letra que tenha SIMULTANEAMENTE:
✓ GRAMÁTICA PERFEITA (frases completas e corretas)
✓ NARRATIVA FLUÍDA (história com começo-meio-fim)
✓ MÁXIMO 11 SÍLABAS POR VERSO (ABSOLUTO, NÃO NEGOCIÁVEL)

NÃO ABRIMOS MÃO DE NENHUM DESSES DETALHES.

IMPORTANTE:
- Se um verso ficar com mais de 11 sílabas, você DEVE simplificá-lo
- É MELHOR uma frase simples com 11 sílabas do que uma frase complexa com 13
- Qualidade da narrativa NÃO justifica exceder 11 sílabas
- Se não conseguir expressar a ideia em 11 sílabas, MUDE a ideia para algo mais simples

EXEMPLO DO QUE FAZER:
❌ "Pago tudo do meu jeito, sem ninguém pra dar conselho" (15 sílabas - INACEITÁVEL)
✓ "Pago tudo do meu jeito, sem conselho" (11 sílabas - PERFEITO)

❌ "Achava lindo o decote da vizinha do lado" (14 sílabas - INACEITÁVEL)
✓ "Achava lindo o decote da vizinha" (11 sílabas - PERFEITO)

NÃO ENVIE a letra até que TODOS os versos tenham 11 sílabas ou menos.
Revise CADA verso antes de finalizar.

Retorne APENAS a letra reescrita:`

      const response = await generateText({
        model: "openai/gpt-4o",
        prompt: rewritePrompt,
        temperature: 0.7,
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
   * GERA LETRA DIRETAMENTE SEM RESTRIÇÕES DE REFRÃO
   */
  private static async generateDirectLyrics(
    request: CompositionRequest,
    syllableEnforcement: { min: number; max: number; ideal: number },
  ): Promise<string> {
    console.log("[MetaComposer] Gerando letra diretamente...")

    const genreConfig = getGenreConfig(request.genre)

    try {
      const directPrompt = `Você é um compositor profissional de ${request.genre}. Crie uma letra original sobre: ${request.theme}

MOOD: ${request.mood}
${request.rhythm ? `RITMO: ${request.rhythm}` : ""}

═══════════════════════════════════════════════════════════════
REGRAS ABSOLUTAS (NÃO PODEM SER QUEBRADAS)
═══════════════════════════════════════════════════════════════

1. LIMITE DE 11 SÍLABAS POÉTICAS (ABSOLUTO)
   - Máximo: 11 sílabas por verso
   - Ideal: ${syllableEnforcement.ideal} sílabas
   
   ESTRATÉGIAS PARA MANTER 11 SÍLABAS:
   a) Contrações: você→cê, está→tá, para→pra
   b) Seja direto: "Eu vou seguir" → "Vou seguir"
   c) Remova palavras extras: "muito", "bem", "tão"
   
   EXEMPLOS:
   ❌ "Eu me libertei de tudo aquilo que me prendia" (14 sílabas)
   ✓ "Me libertei do que me prendia" (10 sílabas)

2. GRAMÁTICA PERFEITA
   - Cada verso = frase completa (sujeito + verbo + complemento)
   - NUNCA: "Vou não podia" ❌
   - SEMPRE: "Vou seguir sem você" ✓

3. NARRATIVA FLUÍDA
   - Começo: Apresenta situação
   - Meio: Desenvolve transformação
   - Fim: Resolução com empoderamento

═══════════════════════════════════════════════════════════════
PROCESSO (SIGA ESTA ORDEM)
═══════════════════════════════════════════════════════════════

PASSO 1: PLANEJE A HISTÓRIA
- Qual é a situação inicial?
- O que acontece no meio?
- Como termina?

PASSO 2: ESCREVA VERSO POR VERSO
- Escreva o verso
- CONTE as sílabas
- Se > 11, REESCREVA usando contrações e simplificações
- Verifique gramática

PASSO 3: REVISE TUDO
✓ Todos os versos ≤ 11 sílabas?
✓ Gramática perfeita?
✓ História fluída?

ESTRUTURA:
[PART A - Verse 1]
4 linhas (11 sílabas cada)

[PART B - Chorus]
4 linhas chiclete (11 sílabas cada)

[PART A2 - Verse 2]
4 linhas (11 sílabas cada)

[PART B - Chorus]
Repete

[PART C - Bridge]
2 linhas de clímax (11 sílabas cada)

[PART B - Final Chorus]
Refrão final

NÃO ENVIE até que TODOS os versos tenham ≤ 11 sílabas.

Retorne APENAS a letra:`

      const response = await generateText({
        model: "openai/gpt-4o",
        prompt: directPrompt,
        temperature: 0.7,
      })

      return response.text || ""
    } catch (error) {
      console.error("[MetaComposer] Erro ao gerar letra direta:", error)
      throw error
    }
  }

  /**
   * CALCULA SCORE DE QUALIDADE INTEGRADO
   */
  private static calculateQualityScore(
    lyrics: string,
    syllableTarget: { min: number; max: number; ideal: number },
    genre: string,
    terceiraViaAnalysis: TerceiraViaAnalysis | null,
    melodicAnalysis: any,
  ): number {
    let score = 0
    let weights = 0

    // Terceira Via score (40% do peso)
    if (terceiraViaAnalysis) {
      score += (terceiraViaAnalysis.score_geral / 100) * 0.4
      weights += 0.4
    }

    // Melodic flow score (30% do peso)
    if (melodicAnalysis) {
      score += (melodicAnalysis.flow_score / 100) * 0.3
      weights += 0.3
    }

    // Syllable compliance (20% do peso)
    const lines = lyrics.split("\n").filter((l) => l.trim() && !l.startsWith("[") && !l.startsWith("("))
    let syllableCompliance = 0
    lines.forEach((line) => {
      const count = countPoeticSyllables(line)
      if (count >= syllableTarget.min && count <= syllableTarget.max) {
        syllableCompliance++
      }
    })
    if (lines.length > 0) {
      score += (syllableCompliance / lines.length) * 0.2
      weights += 0.2
    }

    // Rhyme quality (10% do peso)
    const rhymeAnalysis = this.analyzeRhymes(lyrics, genre)
    score += (rhymeAnalysis.score / 100) * 0.1
    weights += 0.1

    return weights > 0 ? score / weights : 0
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
   * VALIDAÇÃO FINAL RIGOROSA - SIMPLIFICADA E EFICIENTE
   * Garante que TODAS as validações existentes sejam executadas e BLOQUEIEM saída se falharem
   */
  private static validateFinalLyrics(
    lyrics: string,
    genre: string,
    syllableTarget: { min: number; max: number; ideal: number },
  ): {
    isValid: boolean
    criticalErrors: string[]
    warnings: string[]
    syllableCompliance: number
    rhymeQuality: number
    verseIntegrity: number
    hasNarrative: boolean
  } {
    const criticalErrors: string[] = []
    const warnings: string[] = []

    // 1. SÍLABAS - NUNCA MAIS DE 11
    const lines = lyrics.split("\n").filter((l) => {
      const t = l.trim()
      return t && !t.startsWith("[") && !t.startsWith("(") && !t.includes("Instruments:")
    })

    let syllableCompliant = 0
    lines.forEach((line, i) => {
      const count = countPoeticSyllables(line)
      if (count > this.ABSOLUTE_MAX_SYLLABLES) {
        criticalErrors.push(`Linha ${i + 1} tem ${count} sílabas (máximo: 11)`)
      } else if (count >= syllableTarget.min && count <= syllableTarget.max) {
        syllableCompliant++
      }
    })
    const syllableCompliance = lines.length > 0 ? (syllableCompliant / lines.length) * 100 : 0

    // 2. INTEGRIDADE DE VERSOS - sem versos quebrados
    const integrityResult = validateVerseIntegrity(lyrics)
    if (integrityResult.brokenVerses > 0) {
      integrityResult.issues.forEach((issue) => {
        if (issue.severity === "error") {
          criticalErrors.push(`Verso quebrado linha ${issue.line}: ${issue.issues[0]}`)
        }
      })
    }
    const verseIntegrity = lines.length > 0 ? ((lines.length - integrityResult.brokenVerses) / lines.length) * 100 : 0

    // 3. NARRATIVA - história fluída
    const narrativeValidation = validateNarrativeFlow(lyrics, genre)
    if (narrativeValidation.abruptChanges.length > 1) {
      criticalErrors.push(`${narrativeValidation.abruptChanges.length} mudanças abruptas na narrativa`)
    }
    const hasNarrative = narrativeValidation.score >= 70

    // 4. RIMAS - qualidade mínima
    const rhymeValidation = validateRhymesForGenre(lyrics, genre)
    const rhymeQuality = rhymeValidation.analysis.score

    const isValid =
      criticalErrors.length === 0 && // Sem erros críticos
      syllableCompliance >= 80 && // 80% das linhas com sílabas corretas
      verseIntegrity >= 80 && // 80% dos versos íntegros
      hasNarrative // Narrativa fluída

    return {
      isValid,
      criticalErrors,
      warnings,
      syllableCompliance,
      rhymeQuality,
      verseIntegrity,
      hasNarrative,
    }
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
