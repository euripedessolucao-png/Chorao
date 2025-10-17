/**
 * ============================================================================
 * META-COMPOSITOR - SISTEMA AUTÔNOMO DE COMPOSIÇÃO INTELIGENTE
 * ============================================================================
 *
 * PROPÓSITO:
 * Orquestrar TODAS as regras e conhecimentos distribuídos no sistema de forma
 * autônoma e inteligente, garantindo que cada composição siga:
 *
 * 1. Terceira Via (força criatividade dentro de restrições)
 * 2. Anti-Forçação (coerência narrativa > palavras-chave)
 * 3. Regras Universais (linguagem simples, 12 sílabas máx, empilhamento)
 * 4. Regras de Gênero (específicas de cada estilo musical)
 * 5. Prioridade de Requisitos Adicionais (sempre no topo)
 *
 * ARQUITETURA:
 * User Request → Meta-Orchestrator → Validation → Refinement → Output
 *
 * REVERSIBILIDADE:
 * Pode ser desativado via flag ENABLE_META_COMPOSER=false
 * ============================================================================
 */
/**
 * ============================================================================
 * META-COMPOSITOR CORRIGIDO - CONTROLE RÍGIDO DE SÍLABAS
 * ============================================================================
 */

// NO IMPORTS - adicione:
import { SyllableEnforcer, SyllableEnforcement } from "@/lib/validation/syllableEnforcer"

// NO MÉTODO compose - MODIFIQUE a geração:
static async compose(request: CompositionRequest): Promise<CompositionResult> {
  console.log("[MetaComposer] Iniciando composição com IMPOSIÇÃO de sílabas...")

  let iterations = 0
  let refinements = 0
  let bestResult: CompositionResult | null = null
  let bestScore = 0

  const syllableEnforcement: SyllableEnforcement = request.syllableTarget || this.SYLLABLE_TARGET

  while (iterations < this.MAX_ITERATIONS) {
    iterations++
    console.log(`[MetaComposer] Iteração ${iterations}/${this.MAX_ITERATIONS}`)

    // 1. GERAÇÃO COM IMPOSIÇÃO RIGOROSA
    const rawLyrics = await this.generateWithSyllableControl(request, syllableEnforcement)

    // 2. APLICA IMPOSIÇÃO FINAL (double-check)
    const enforcedResult = await SyllableEnforcer.enforceSyllableLimits(
      rawLyrics, 
      syllableEnforcement, 
      request.genre
    )

    console.log(`[MetaComposer] Correções aplicadas: ${enforcedResult.corrections} linhas`)

    // 3. VALIDAÇÃO COMPLETA
    const validation = await this.comprehensiveValidation(
      enforcedResult.correctedLyrics, 
      request, 
      syllableEnforcement
    )

    // 4. CÁLCULO DE QUALIDADE com PESO MÁXIMO para sílabas
    const qualityScore = this.calculateQualityScore(
      enforcedResult.correctedLyrics, 
      validation, 
      request, 
      syllableEnforcement
    )

    // ... resto do método mantido
  }
}

// ATUALIZE o método generateWithSyllableControl:
private static async generateWithSyllableControl(
  request: CompositionRequest, 
  enforcement: SyllableEnforcement
): Promise<string> {
  const genreConfig = getGenreConfig(request.genre)

  // PROMPT COM REGRAS EXPLÍCITAS E EXEMPLOS CONCRETOS
  const masterPrompt = this.buildMasterPromptWithSyllableEnforcement(request, genreConfig, enforcement)

  const { text } = await generateText({
    model: "openai/gpt-4o",
    prompt: masterPrompt,
    temperature: request.creativity === "conservador" ? 0.5 : request.creativity === "ousado" ? 0.9 : 0.7,
  })

  // APLICA IMPOSIÇÃO IMEDIATA
  const enforcedResult = await SyllableEnforcer.enforceSyllableLimits(text, enforcement, request.genre)
  
  if (enforcedResult.corrections > 0) {
    console.log(`[MetaComposer] ${enforcedResult.corrections} linhas corrigidas na geração`)
  }

  return enforcedResult.correctedLyrics
}

// NOVO: Prompt com imposição explícita
private static buildMasterPromptWithSyllableEnforcement(
  request: CompositionRequest, 
  genreConfig: any, 
  enforcement: SyllableEnforcement
): string {
  return `🎵 COMPOSITOR COM IMPOSIÇÃO DE SÍLABAS - ${request.genre}

🚨 REGRAS ABSOLUTAS DE SÍLABAS (SISTEMA MONITORA E CORRIGE):

LIMITE: ${enforcement.min} a ${enforcement.max} sílabas por linha
ALVO IDEAL: ${enforcement.ideal} sílabas

CONTRÇÕES OBRIGATÓRIAS (SISTEMA VERIFICA):
• "você" → "cê" (2→1 sílaba) - SEMPRE
• "estou" → "tô" (2→1 sílaba) - SEMPRE  
• "para" → "pra" (2→1 sílaba) - SEMPRE
• "está" → "tá" (2→1 sílaba) - SEMPRE

ELISÃO OBRIGATÓRIA (SISTEMA VERIFICA):
• "de amor" → "d'amor" (3→2 sílabas)
• "que eu" → "qu'eu" (2→1 sílaba)
• "meu amor" → "meuamor" (4→3 sílabas)

EXEMPLOS CORRETOS (${enforcement.min}-${enforcement.max}s):
• "Cê tá na minha mente" = 6s ✓
• "Vou te amar pra sempre" = 7s ✓  
• "Meu coração é teu" = 6s ✓
• "Nessa vida louca" = 6s ✓

EXEMPLOS ERRADOS (SISTEMA BLOQUEIA):
• "Eu estou pensando em você" = 13s ✗ (use "Tô pensando em cê")
• "A saudade que eu sinto" = 14s ✗ (use "Saudade que sinto")

SISTEMA AUTOMÁTICO: Se você escrever fora do limite, o sistema reescreverá automaticamente.

TEMA: ${request.theme}
HUMOR: ${request.mood}

ESCREVA JÁ COM AS CONTRÇÕES APLICADAS!
`
}
