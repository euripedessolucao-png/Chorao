import { generateText } from "ai"

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

MÉTRICA OBRIGATÓRIA PARA ${this.config.genre.toUpperCase()}:
- Cada linha deve ter entre ${metrics.minSyllables} e ${metrics.maxSyllables} sílabas poéticas
- Meta ideal: ${targetSyllables} sílabas por linha
- Razão: ${metrics.reason}
${metrics.allowPeaks ? "- Picos pontuais acima do limite são permitidos para ênfase" : ""}

ESTRUTURA:
- Verso 1 (4 linhas)
- Verso 2 (4 linhas)
- Refrão (4 linhas) - deve ser memorável e repetível
- Verso 3 (4 linhas)
- Ponte (2-4 linhas) - contraste emocional
- Refrão final (4 linhas)

REQUISITOS TÉCNICOS:
1. Conte as sílabas poéticas (até a última tônica)
2. Use linguagem natural e coloquial brasileira
3. Rimas naturais (não forçadas)
4. História clara com progressão emocional
5. Refrão cativante e fácil de memorizar
${this.config.additionalRequirements ? `\nREQUISITOS ADICIONAIS:\n${this.config.additionalRequirements}` : ""}

Escreva a letra completa respeitando RIGOROSAMENTE a métrica de ${metrics.minSyllables}-${metrics.maxSyllables} sílabas.
Retorne apenas a letra, sem explicações ou títulos.`
  }

  /**
   * Compõe a letra usando o sistema de terceira via
   */
  async compose(): Promise<CompositionResult> {
    const prompt = this.buildPrompt()
    const metrics = this.getGenreMetrics()

    console.log("[MetaComposer] Iniciando composição")
    console.log("[MetaComposer] Gênero:", this.config.genre)
    console.log("[MetaComposer] Métrica:", `${metrics.minSyllables}-${metrics.maxSyllables} sílabas`)

    try {
      const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt,
        temperature: 0.8,
      })

      // Processa a letra gerada
      const cleanedLyrics = this.cleanLyrics(text)

      // Gera título baseado no tema e primeira linha
      const title = await this.generateTitle(cleanedLyrics)

      // Calcula estatísticas
      const stats = this.calculateStats(cleanedLyrics)

      console.log("[MetaComposer] Composição concluída")
      console.log("[MetaComposer] Média de sílabas:", stats.averageSyllables)

      return {
        lyrics: cleanedLyrics,
        title,
        metadata: {
          genre: this.config.genre,
          theme: this.config.theme,
          syllableRange: { min: metrics.minSyllables, max: metrics.maxSyllables },
          averageSyllables: stats.averageSyllables,
          totalLines: stats.totalLines,
        },
      }
    } catch (error) {
      console.error("[MetaComposer] Erro na composição:", error)
      throw error
    }
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
    // Implementação simplificada - o contador real está em syllable-counter-brasileiro.ts
    const words = line.toLowerCase().split(/\s+/)
    let count = 0

    for (const word of words) {
      // Remove pontuação
      const clean = word.replace(/[.,!?;:]/g, "")
      // Conta vogais como aproximação
      const vowels = clean.match(/[aeiouáéíóúâêôãõü]/gi)
      count += vowels ? vowels.length : 0
    }

    return Math.max(1, Math.floor(count * 0.7)) // Aproximação
  }
}

/**
 * Função auxiliar para criar e executar uma composição
 */
export async function composeWithMetrics(config: MetaComposerConfig): Promise<CompositionResult> {
  const composer = new MetaComposer(config)
  return await composer.compose()
}
