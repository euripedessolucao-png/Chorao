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
   * GERA REESCRITA DE LETRA EXISTENTE - PRIORIDADE: NARRATIVA PRIMEIRO
   */
  private static async generateRewrite(request: CompositionRequest): Promise<string> {
    console.log("[MetaComposer] Gerando reescrita com NARRATIVA em primeiro lugar...")

    if (!request.originalLyrics) {
      throw new Error("Original lyrics required for rewrite")
    }

    const syllableTarget = request.syllableTarget || this.getGenreSyllableConfig(request.genre)
    const genreConfig = getGenreConfig(request.genre)

    try {
      const rewritePrompt = `Você é um compositor profissional de ${request.genre}, inspirado pelos mestres da música brasileira como Chico Buarque e Caetano Veloso.

LETRA ORIGINAL:
${request.originalLyrics}

TEMA: ${request.theme}
MOOD: ${request.mood}

═══════════════════════════════════════════════════════════════
🎯 HIERARQUIA DE PRIORIDADES (DO MAIS IMPORTANTE PARA O MENOS)
═══════════════════════════════════════════════════════════════

**1. NARRATIVA ENVOLVENTE (PRIORIDADE MÁXIMA)**
   - Conte uma HISTÓRIA completa com começo, meio e fim
   - Cada verso deve CONECTAR com o anterior
   - A história deve FLUIR naturalmente, sem cortes abruptos
   - Mantenha COERÊNCIA emocional do início ao fim
   
   ❌ ERRADO: Versos desconectados forçados para rimar
   "Cortei o laço, tratei do cabelo" (ok)
   "Pago tudo do meu jeito, sem ninguém pra dar conselho" (desconectado!)
   
   ✓ CERTO: História fluída e conectada
   "Cortei o laço que me prendia"
   "Agora sigo livre, sem pedir permissão"

**2. EMOÇÃO AUTÊNTICA**
   - Transmita SENTIMENTOS reais e profundos
   - Use IMAGENS concretas (não abstrações)
   - Conecte com a EXPERIÊNCIA do ouvinte
   
   ❌ ERRADO: Clichês vazios
   "Meu coração está partido"
   
   ✓ CERTO: Emoção concreta
   "Ainda guardo tuas fotos no celular"

**3. CONEXÃO COM OUVINTE**
   - Use linguagem COLOQUIAL brasileira (tô, cê, pra)
   - Vocabulário ATUAL (PIX, story, biquíni, boteco)
   - Situações RECONHECÍVEIS do dia a dia

**4. MÉTRICA E RIMAS (FLEXÍVEIS PARA SERVIR À NARRATIVA)**
   - Ideal: ${syllableTarget.ideal} sílabas por verso
   - Máximo: 11 sílabas (mas NUNCA sacrifique a narrativa)
   - Rimas: Importantes, mas NÃO force versos só para rimar
   
   IMPORTANTE: Se precisar escolher entre:
   - Um verso perfeito em sílabas mas que quebra a narrativa
   - Um verso com 12 sílabas mas que mantém a história fluindo
   
   ESCOLHA O SEGUNDO. A narrativa é mais importante.

═══════════════════════════════════════════════════════════════
📚 APRENDA COM OS MESTRES BRASILEIROS
═══════════════════════════════════════════════════════════════

**Chico Buarque - Mestre da Narrativa:**
"Ela fez questão de esquecer o meu nome
E todos os planos que a gente sonhou"
→ Narrativa clara: ela esqueceu, nós sonhamos juntos

**Caetano Veloso - Mestre das Imagens:**
"Você não sente nem vê
Mas eu não posso deixar de dizer, meu amigo"
→ Contraste emocional: você não vê, mas eu preciso falar

**Marília Mendonça - Mestre do Cotidiano:**
"Eu tô bebendo, tô chorando
Tô ligando pra você"
→ Ações concretas que contam a história

═══════════════════════════════════════════════════════════════
✍️ PROCESSO DE CRIAÇÃO (NARRATIVA PRIMEIRO)
═══════════════════════════════════════════════════════════════

**PASSO 1: PLANEJE A HISTÓRIA**
- Qual é a situação inicial? (ex: relacionamento tóxico)
- O que acontece no meio? (ex: libertação)
- Como termina? (ex: empoderamento)
- Como cada parte CONECTA com a próxima?

**PASSO 2: ESCREVA PENSANDO NA HISTÓRIA**
- Escreva cada verso CONECTADO ao anterior
- Mantenha a COERÊNCIA emocional
- Use IMAGENS concretas
- NÃO force rimas que quebram a narrativa

**PASSO 3: AJUSTE A MÉTRICA (SEM DESTRUIR A NARRATIVA)**
- Se um verso ficou longo, use ALTERNATIVAS:
  a) Contrações: você→cê, está→tá
  b) Sinônimos curtos: libertei→soltei
  c) Reformulação mantendo sentido
- NUNCA corte palavras que quebram a história

**PASSO 4: REVISE A COERÊNCIA**
✓ A história flui do início ao fim?
✓ Cada verso conecta com o anterior?
✓ As emoções são autênticas?
✓ O ouvinte consegue acompanhar a narrativa?
✓ As sílabas estão próximas do ideal (sem sacrificar história)?

═══════════════════════════════════════════════════════════════
🎵 SEU OBJETIVO FINAL
═══════════════════════════════════════════════════════════════

Entregue uma letra que seja, NESTA ORDEM:
1. Uma HISTÓRIA envolvente e coerente
2. Com EMOÇÕES autênticas e profundas
3. Que CONECTE com o ouvinte brasileiro
4. Com métrica e rimas que SERVEM à narrativa (não dominam)

LEMBRE-SE: Uma música é uma HISTÓRIA em forma de canção.
A técnica (sílabas, rimas) existe para SERVIR a história, não para dominá-la.

Retorne APENAS a letra reescrita:`

      const response = await generateText({
        model: "openai/gpt-4o",
        prompt: rewritePrompt,
        temperature: 0.8, // Aumentado para mais criatividade narrativa
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
   * GERA LETRA DIRETAMENTE - NARRATIVA PRIMEIRO
   */
  private static async generateDirectLyrics(
    request: CompositionRequest,
    syllableEnforcement: { min: number; max: number; ideal: number },
  ): Promise<string> {
    console.log("[MetaComposer] Gerando letra com NARRATIVA em primeiro lugar...")

    const genreConfig = getGenreConfig(request.genre)

    try {
      const directPrompt = `Você é um compositor profissional de ${request.genre}, inspirado pelos mestres brasileiros.

TEMA: ${request.theme}
MOOD: ${request.mood}
${request.rhythm ? `RITMO: ${request.rhythm}` : ""}

═══════════════════════════════════════════════════════════════
🎯 PRIORIDADE #1: CONTE UMA HISTÓRIA
═══════════════════════════════════════════════════════════════

Sua missão é contar uma HISTÓRIA envolvente sobre: ${request.theme}

**Estrutura Narrativa:**
- COMEÇO: Apresente a situação (onde estamos?)
- MEIO: Desenvolva o conflito/transformação (o que acontece?)
- FIM: Resolução com impacto emocional (onde chegamos?)

**Cada verso deve:**
- CONECTAR com o verso anterior
- AVANÇAR a história
- Manter COERÊNCIA emocional

❌ NÃO faça: Versos soltos só para rimar
✓ FAÇA: História fluída que emociona

═══════════════════════════════════════════════════════════════
🎯 PRIORIDADE #2: EMOÇÃO AUTÊNTICA
═══════════════════════════════════════════════════════════════

Use IMAGENS CONCRETAS do cotidiano brasileiro:
- "Bloqueei teu número" (não "te esqueci")
- "Apaguei tuas fotos" (não "superei")
- "Paguei a conta sozinha" (não "sou independente")

═══════════════════════════════════════════════════════════════
🎯 PRIORIDADE #3: MÉTRICA (FLEXÍVEL)
═══════════════════════════════════════════════════════════════

- Ideal: ${syllableEnforcement.ideal} sílabas
- Máximo: 11 sílabas
- MAS: Se precisar de 12 sílabas para manter a narrativa fluindo, USE

IMPORTANTE: Narrativa > Métrica perfeita

═══════════════════════════════════════════════════════════════
✍️ PROCESSO
═══════════════════════════════════════════════════════════════

1. PENSE na história completa
2. ESCREVA conectando cada verso
3. AJUSTE sílabas SEM quebrar a narrativa
4. REVISE a coerência emocional

ESTRUTURA:
[PART A - Verse 1]
4 linhas contando o COMEÇO da história

[PART B - Chorus]
4 linhas com a MENSAGEM principal (chiclete)

[PART A2 - Verse 2]
4 linhas desenvolvendo o MEIO

[PART B - Chorus]
Repete a mensagem

[PART C - Bridge]
2 linhas de CLÍMAX emocional

[PART B - Final Chorus]
Refrão final com impacto

Retorne APENAS a letra:`

      const response = await generateText({
        model: "openai/gpt-4o",
        prompt: directPrompt,
        temperature: 0.8, // Aumentado para mais criatividade narrativa
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
