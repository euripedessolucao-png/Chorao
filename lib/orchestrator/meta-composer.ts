import { generateText } from "ai"
import { countPoeticSyllables } from "../validation/syllable-counter-brasileiro"
import { applyTerceiraVia } from "../terceira-via/index"
import { validateSimplicity, generateSimplicityReport } from "../validation/simplicity-validator"

// Configuração de métricas por gênero musical
export const GENRE_METRICS = {
  "Sertanejo Moderno": {
    minSyllables: 7,
    maxSyllables: 10,
    reason: "Balanço dançante e fácil de cantar",
    flexibility: "moderate",
    allowPeaks: false,
  },
  Funk: {
    minSyllables: 6,
    maxSyllables: 10,
    reason: "Soa como conversa ritmada",
    flexibility: "high",
    allowPeaks: true,
  },
  Piseiro: {
    minSyllables: 6,
    maxSyllables: 10,
    reason: "Soa como conversa ritmada",
    flexibility: "high",
    allowPeaks: true,
  },
  MPB: {
    minSyllables: 8,
    maxSyllables: 14,
    reason: "Prioriza a poesia e complexidade",
    flexibility: "high",
    allowPeaks: false,
  },
  "Pop Brasileiro": {
    minSyllables: 8,
    maxSyllables: 10,
    reason: "Maximiza o cantabilidade e memorização",
    flexibility: "low",
    allowPeaks: false,
  },
  "Rock Brasileiro": {
    minSyllables: 8,
    maxSyllables: 12,
    reason: "Energia e atitude com clareza",
    flexibility: "moderate",
    allowPeaks: false,
  },
  Samba: {
    minSyllables: 7,
    maxSyllables: 11,
    reason: "Swing natural e malícia",
    flexibility: "moderate",
    allowPeaks: false,
  },
  Forró: {
    minSyllables: 7,
    maxSyllables: 10,
    reason: "Simplicidade e dançabilidade",
    flexibility: "moderate",
    allowPeaks: false,
  },
  Gospel: {
    minSyllables: 8,
    maxSyllables: 12,
    reason: "Clareza da mensagem",
    flexibility: "moderate",
    allowPeaks: false,
  },
  "Bachata Brasileira": {
    minSyllables: 8,
    maxSyllables: 11,
    reason: "Romantismo e sensualidade",
    flexibility: "moderate",
    allowPeaks: false,
  },
} as const

export type GenreName = keyof typeof GENRE_METRICS

export interface MetaComposerConfig {
  genre: string
  theme: string
  subgenre?: string
  additionalRequirements?: string
  performanceMode?: boolean
  targetSyllables?: number
}

export interface CompositionResult {
  lyrics: string
  title: string
  metadata: {
    genre: string
    theme: string
    syllableRange: { min: number; max: number }
    averageSyllables: number
    totalLines: number
  }
}

/**
 * Meta-Composer: Orquestrador principal de composição de letras
 * Responsável por coordenar a geração de letras respeitando as métricas específicas de cada gênero
 */
export class MetaComposer {
  private config: MetaComposerConfig

  constructor(config: MetaComposerConfig) {
    this.config = config
  }

  /**
   * Obtém a métrica ideal para o gênero
   */
  private getGenreMetrics() {
    const normalizedGenre = this.normalizeGenre(this.config.genre)
    return (
      GENRE_METRICS[normalizedGenre] || {
        minSyllables: 8,
        maxSyllables: 12,
        reason: "Métrica padrão equilibrada",
        flexibility: "moderate",
        allowPeaks: false,
      }
    )
  }

  /**
   * Normaliza o nome do gênero para corresponder às chaves do GENRE_METRICS
   */
  private normalizeGenre(genre: string): GenreName {
    const genreMap: Record<string, GenreName> = {
      sertanejo: "Sertanejo Moderno",
      sertanejo_moderno: "Sertanejo Moderno",
      "sertanejo moderno": "Sertanejo Moderno",
      funk: "Funk",
      piseiro: "Piseiro",
      mpb: "MPB",
      pop: "Pop Brasileiro",
      pop_brasileiro: "Pop Brasileiro",
      "pop brasileiro": "Pop Brasileiro",
      rock: "Rock Brasileiro",
      rock_brasileiro: "Rock Brasileiro",
      "rock brasileiro": "Rock Brasileiro",
      samba: "Samba",
      forro: "Forró",
      forró: "Forró",
      gospel: "Gospel",
      bachata: "Bachata Brasileira",
      bachata_brasileira: "Bachata Brasileira",
      "bachata brasileira": "Bachata Brasileira",
    }

    const normalized = genre.toLowerCase().trim()
    return genreMap[normalized] || "Pop Brasileiro"
  }

  /**
   * Gera o prompt otimizado com as métricas do gênero
   */
  private buildPrompt(): string {
    const metrics = this.getGenreMetrics()
    const targetSyllables = this.config.targetSyllables || Math.floor((metrics.minSyllables + metrics.maxSyllables) / 2)

    return `Você é um compositor profissional brasileiro especializado em ${this.config.genre}.

TEMA: ${this.config.theme}
${this.config.subgenre ? `SUBGÊNERO: ${this.config.subgenre}` : ""}

⚠️ MÉTRICA OBRIGATÓRIA: ${metrics.minSyllables}-${metrics.maxSyllables} SÍLABAS POÉTICAS POR LINHA

COMO CONTAR SÍLABAS POÉTICAS:
1. Conte ATÉ a última sílaba TÔNICA (não conte as átonas finais)
2. Vírgulas são RESPIROS (não quebram linhas)
3. Use sinalefa: "de amor" → "d'amor", "que eu" → "qu'eu"
4. Contrações naturais: "para" → "pra", "você" → "cê", "está" → "tá"

🚫 CONSTRUÇÕES ESTRITAMENTE PROIBIDAS:

NUNCA use estas construções:
❌ "a [verbo]" → "a flutuar", "a dançar", "a embalar", "a contar", "a lamentar"
❌ "[substantivo] a [verbo]" → "fumaça a flutuar", "viola a lamentar", "toada a embalar"
❌ Gerúndios desnecessários: "a brilhar", "a dedilhar", "a ressoar"
❌ Verbos rebuscados: "contemplar", "dedilhar", "embalar", "ressoar", "ecoar", "ansiar", "lamentar"
❌ Palavras poéticas antigas: "clamor", "alvorada", "saudade adormecida", "alma profunda"
❌ Inversões sintáticas: "seu olhar tão profundo" → use "seu olhar é profundo"

✅ USE SEMPRE:

Verbos SIMPLES e DIRETOS:
✅ "olhar", "ver", "sentir", "querer", "lembrar", "ficar", "deixar", "perder"
✅ "tocar" (não "dedilhar"), "subir" (não "flutuar"), "tocar" (não "embalar")

Construções COLOQUIAIS:
✅ "Olha pro..." (imperativo simples)
✅ "Vê se..." (conversacional)
✅ "Eu fico..." (presente simples)
✅ "Cê não vê..." (contração natural)

🎯 EXEMPLO PERFEITO (COPIE ESTE ESTILO):

"Só tem louça pra lavar
Quem tem comida no prato
Só paga IPVA
Quem já conquistou um carro
Só passa a noite ouvindo choro
Quem teve a bênção de um filho"

Viu? NENHUM gerúndio, NENHUMA construção "a [verbo]", PALAVRAS SIMPLES!

Outro EXEMPLO PERFEITO:

"Olha pro retrovisor
Vê se você me acha
Eu fiquei lá atrás
Naquela curva de casa"

SIMPLICIDADE MÁXIMA! Como você falaria no WhatsApp!

⚠️ TESTE RÁPIDO: Leia em voz alta. Se soar como "poesia do século XIX", REESCREVA!

REGRAS DE OURO:

1. UMA IDEIA POR LINHA (não duas)
   - ✅ "Olha pro retrovisor" (1 ideia)
   - ❌ "Lembro do rancho velho, a fumaça a dançar" (3 ideias misturadas)

2. VERBOS NO PRESENTE/IMPERATIVO (não gerúndios)
   - ✅ "Vê", "Olha", "Fica", "Deixa"
   - ❌ "a ver", "a olhar", "ficando", "deixando"

3. EMPILHAMENTO PROGRESSIVO (lista lógica)
   - Cada linha adiciona UMA informação nova
   - Use paralelismo: "Só tem... Só paga... Só passa..."

4. LINGUAGEM DE CONVERSA
   - Como você falaria com um amigo tomando cerveja
   - Não como você escreveria um poema para a escola

5. SEM ABSTRAÇÃO EXCESSIVA
   - ✅ "Eu fiquei lá atrás" (concreto)
   - ❌ "Saudade adormecida que eu fui desvendar" (abstrato demais)

ESTRUTURA DA LETRA:

Verso 1 (4 linhas):
- Situação inicial, SIMPLES
- Linguagem coloquial

Verso 2 (4 linhas):
- EMPILHE exemplos ou situações
- Use paralelismo se possível

Refrão (4 linhas):
- Mensagem principal
- FRASES CURTAS e marcantes

Verso 3 (4 linhas):
- Continue a narrativa
- Mantenha SIMPLICIDADE

Ponte (2-4 linhas):
- Momento de reflexão
- DIRETA, não abstrata

Refrão final (4 linhas):
- Repete com emoção

${this.config.additionalRequirements ? `\nREQUISITOS ADICIONAIS:\n${this.config.additionalRequirements}` : ""}

IMPORTANTE: A cada linha que escrever, pergunte-se:
- "Eu diria isso conversando no bar?"
- "Tem gerúndio 'a [verbo]'? Então REMOVA!"
- "Está simples como 'Olha pro retrovisor'?"

AGORA ESCREVA A LETRA COM MÁXIMA SIMPLICIDADE.
Retorne apenas a letra, sem explicações.`
  }

  /**
   * Compõe a letra usando o sistema de terceira via com REESCRITA ITERATIVA
   */
  async compose(maxAttempts = 3): Promise<CompositionResult> {
    const prompt = this.buildPrompt()
    const metrics = this.getGenreMetrics()

    console.log("[MetaComposer] 🎵 Iniciando composição com reescrita iterativa")
    console.log("[MetaComposer] Gênero:", this.config.genre)
    console.log("[MetaComposer] Métrica:", `${metrics.minSyllables}-${metrics.maxSyllables} sílabas`)

    let attempt = 0
    let bestLyrics = ""
    let bestScore = 0

    while (attempt < maxAttempts) {
      attempt++
      console.log(`[MetaComposer] 📝 Tentativa ${attempt}/${maxAttempts}`)

      try {
        const { text } = await generateText({
          model: "openai/gpt-4o-mini",
          prompt: attempt === 1 ? prompt : this.buildRefinePrompt(bestLyrics, metrics),
          temperature: 0.8 - attempt * 0.1,
        })

        const cleanedLyrics = this.cleanLyrics(text)

        const simplicityValidation = validateSimplicity(cleanedLyrics)
        console.log(generateSimplicityReport(simplicityValidation))

        if (!simplicityValidation.isSimple && simplicityValidation.score < 80) {
          console.log(`[MetaComposer] ❌ Letra rebuscada (${simplicityValidation.score}%), regenerando...`)
          continue
        }

        const validation = applyTerceiraVia(cleanedLyrics, this.config.genre)

        if (validation.success && simplicityValidation.isSimple) {
          console.log("[MetaComposer] ✅ Métrica perfeita E simplicidade alcançadas!")
          bestLyrics = cleanedLyrics
          break
        }

        // Calcula score combinado (métrica + simplicidade)
        const lines = cleanedLyrics.split("\n").filter((l) => l.trim())
        const correctLines = lines.filter((l) => {
          const syl = countPoeticSyllables(l)
          return syl >= metrics.minSyllables && syl <= metrics.maxSyllables
        }).length
        const metricScore = correctLines / lines.length
        const combinedScore = (metricScore + simplicityValidation.score / 100) / 2

        if (combinedScore > bestScore) {
          bestScore = combinedScore
          bestLyrics = cleanedLyrics
        }

        console.log(
          `[MetaComposer] 📊 Score métrica: ${Math.round(metricScore * 100)}%, simplicidade: ${simplicityValidation.score}%`,
        )

        // Se chegou perto (>85% combinado), aceita
        if (combinedScore >= 0.85) {
          console.log("[MetaComposer] ✓ Score combinado aceitável (>85%)")
          break
        }
      } catch (error) {
        console.error(`[MetaComposer] ❌ Erro na tentativa ${attempt}:`, error)
        if (attempt === maxAttempts) throw error
      }
    }

    const title = await this.generateTitle(bestLyrics)
    const stats = this.calculateStats(bestLyrics)

    console.log("[MetaComposer] ✅ Composição concluída após", attempt, "tentativas")
    console.log("[MetaComposer] Média de sílabas:", stats.averageSyllables)

    return {
      lyrics: bestLyrics,
      title,
      metadata: {
        genre: this.config.genre,
        theme: this.config.theme,
        syllableRange: { min: metrics.minSyllables, max: metrics.maxSyllables },
        averageSyllables: stats.averageSyllables,
        totalLines: stats.totalLines,
      },
    }
  }

  private buildRefinePrompt(previousLyrics: string, metrics: any): string {
    const simplicityValidation = validateSimplicity(previousLyrics)
    const report = generateSimplicityReport(simplicityValidation)

    return `⚠️ A LETRA ANTERIOR TEM CONSTRUÇÕES PROIBIDAS! ⚠️

${report}

LETRA ANTERIOR (ERRADA):
${previousLyrics}

🚫 VOCÊ ESTÁ USANDO ESTAS CONSTRUÇÕES PROIBIDAS:

${simplicityValidation.forbiddenConstructions
  .map((fc) => `❌ Linha ${fc.lineNumber}: "${fc.line}"\n   Problema: ${fc.issue}\n   ${fc.example}`)
  .join("\n\n")}

✅ REESCREVA ASSIM:

1. ELIMINE TODOS os gerúndios "a [verbo]"
   - "fumaça a flutuar" → "fumaça sobe"
   - "viola a lamentar" → "viola chora"

2. USE VERBOS SIMPLES
   - "dedilhar" → "tocar"
   - "embalar" → "balançar"
   - "ressoar" → "soar"

3. UMA IDEIA POR LINHA
   - Não: "Lembro do rancho velho, a fumaça a dançar"
   - Sim: "Lembro do rancho velho / A fumaça subia"

4. LINGUAGEM COLOQUIAL
   - Como você fala no WhatsApp
   - Sem poesia rebuscada

MÉTRICA: ${metrics.minSyllables}-${metrics.maxSyllables} sílabas poéticas

AGORA REESCREVA sendo MÁXIMO SIMPLES como "Olha pro retrovisor".
Retorne apenas a letra reescrita, SEM construções proibidas.`
  }

  /**
   * Limpa e formata a letra gerada
   */
  private cleanLyrics(text: string): string {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .filter((line) => !line.match(/^\[.*\]$/)) // Remove marcadores tipo [Verso 1]
      .map((line) => line.charAt(0).toUpperCase() + line.slice(1)) // Capitaliza primeira letra
      .join("\n")
  }

  /**
   * Gera um título para a música
   */
  private async generateTitle(lyrics: string): Promise<string> {
    const firstLines = lyrics.split("\n").slice(0, 4).join("\n")

    try {
      const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt: `Com base nestes versos iniciais, crie um título curto (2-4 palavras) para a música:

${firstLines}

Tema: ${this.config.theme}

Retorne APENAS o título, sem aspas ou explicações.`,
        temperature: 0.7,
      })

      return text.trim().replace(/["""]/g, "")
    } catch (error) {
      console.error("[MetaComposer] Erro ao gerar título:", error)
      return "Sem Título"
    }
  }

  /**
   * Calcula estatísticas da letra
   */
  private calculateStats(lyrics: string) {
    const lines = lyrics.split("\n").filter((l) => l.trim().length > 0)
    const syllableCounts = lines.map((line) => this.countSyllables(line))

    return {
      totalLines: lines.length,
      averageSyllables: Math.round(syllableCounts.reduce((sum, count) => sum + count, 0) / syllableCounts.length),
    }
  }

  /**
   * Conta sílabas poéticas de uma linha
   */
  private countSyllables(line: string): number {
    return countPoeticSyllables(line)
  }
}

/**
 * Função auxiliar para criar e executar uma composição
 */
export async function composeWithMetrics(config: MetaComposerConfig): Promise<CompositionResult> {
  const composer = new MetaComposer(config)
  return await composer.compose()
}
