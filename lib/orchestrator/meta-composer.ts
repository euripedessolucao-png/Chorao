import { generateText } from "ai"
import { countPoeticSyllables } from "../validation/syllable-counter-brasileiro"
import { applyTerceiraVia } from "../terceira-via/index"

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

🎯 ESCREVA SIMPLES E DIRETO COMO BRASILEIRO FALA:

✅ CERTO (simples e direto):
"Olha pro retrovisor
Vê se você me acha
Eu fiquei lá atrás
Naquela curva de casa"

❌ ERRADO (muito rebuscado):
"Contemple o espelho retrovisor deste automóvel
Verifique se consegue avistar minha silhueta
Permaneci na estrada anterior
Naquela inflexão próxima à residência"

REGRAS DE OURO PARA ESCREVER HUMANO:

1. USE FRASES CURTAS E SIMPLES:
   - ✅ "Olha pro retrovisor"
   - ❌ "Lembro do rancho velho, a fumaça a dançar"

2. FALE COMO BRASILEIRO CONVERSA:
   - Use: "cê", "tá", "pra", "né"
   - Evite: "contemplar", "silhueta", "inflexão"

3. SEJA DIRETO E CONCRETO:
   - ✅ "Vê se você me acha" (ação clara)
   - ❌ "Seu olhar tão distante, a voz a me guiar" (abstrato demais)

4. EMPILHE VERSOS LOGICAMENTE:

Veja este EXEMPLO PERFEITO de empilhamento:

"Só tem louça pra lavar
Quem tem comida no prato
Só paga IPVA quem já conquistou um carro
Só passa a noite ouvindo choro
Quem teve a bênção de um filho"

Cada linha ADICIONA uma nova camada à mesma ideia. É uma LISTA PROGRESSIVA!

Outro EXEMPLO PERFEITO:

"Olha pro retrovisor
Vê se você me acha
Eu fiquei lá atrás
Naquela curva de casa
Onde a gente sempre parava
Pra ver o pôr do sol"

Viu? Cada verso EMPILHA sobre o anterior, contando uma história PASSO A PASSO.

5. TÉCNICAS DE EMPILHAMENTO SIMPLES:

LISTA PROGRESSIVA:
"Só [situação 1]
Só [situação 2]  
Só [situação 3]"

CRONOLOGIA SIMPLES:
"Primeiro [ação]
Depois [ação]
Agora [ação]"

INTENSIFICAÇÃO:
"Um pouco [sentimento]
Mais [sentimento]
Demais [sentimento]"

CAUSA → CONSEQUÊNCIA:
"[Situação aconteceu]
[Por isso aconteceu isso]
[E agora é assim]"

6. REFRÃO = FRASE MARCANTE E SIMPLES:
   - ✅ "Ai, que saudade da gente" (direto e emocional)
   - ❌ "Ai, que nó no peito, a viola chora a dor" (complicado demais)

7. EVITE PALAVRAS "POÉTICAS" DEMAIS:
   - ❌ Evite: "clamor", "ressoar", "dedilhar", "ecoar"
   - ✅ Use: "gritar", "tocar", "lembrar", "sentir"

ESTRUTURA DA LETRA:

Verso 1 (4 linhas curtas):
- Apresente a situação de forma SIMPLES e DIRETA
- Como se estivesse conversando com um amigo

Verso 2 (4 linhas curtas):
- EMPILHE exemplos ou situações
- Use paralelismo ("Só tem... Só paga... Só passa...")

Refrão (4 linhas):
- A mensagem principal em FRASE SIMPLES
- Tem que ser fácil de cantar e memorizar

Verso 3 (4 linhas curtas):
- Continue a história ou aprofunde
- Mantenha a linguagem SIMPLES

Ponte (2-4 linhas):
- Momento de reflexão DIRETA
- Uma frase marcante que resume tudo

Refrão final (4 linhas):
- Repete com mais emoção

${this.config.additionalRequirements ? `\nREQUISITOS ADICIONAIS:\n${this.config.additionalRequirements}` : ""}

AGORA ESCREVA A LETRA:
- Use LINGUAGEM SIMPLES como brasileiro fala
- Versos CURTOS (${metrics.minSyllables}-${metrics.maxSyllables} sílabas)
- EMPILHE as ideias logicamente
- NARRATIVA CLARA e direta
- SEM palavras rebuscadas ou abstratas

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
          temperature: 0.8 - attempt * 0.1, // Fica mais focado a cada tentativa
        })

        const cleanedLyrics = this.cleanLyrics(text)

        const validation = applyTerceiraVia(cleanedLyrics, this.config.genre)

        if (validation.success) {
          console.log("[MetaComposer] ✅ Métrica perfeita alcançada!")
          bestLyrics = cleanedLyrics
          break
        }

        // Calcula score (% de linhas corretas)
        const lines = cleanedLyrics.split("\n").filter((l) => l.trim())
        const correctLines = lines.filter((l) => {
          const syl = countPoeticSyllables(l)
          return syl >= metrics.minSyllables && syl <= metrics.maxSyllables
        }).length
        const score = correctLines / lines.length

        if (score > bestScore) {
          bestScore = score
          bestLyrics = cleanedLyrics
        }

        console.log(`[MetaComposer] 📊 Score: ${Math.round(score * 100)}% de linhas corretas`)

        // Se chegou perto (>90%), aceita
        if (score >= 0.9) {
          console.log("[MetaComposer] ✓ Score aceitável (>90%)")
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
    return `A letra anterior ficou muito COMPLEXA ou com métrica errada. Reescreva de forma MAIS SIMPLES E DIRETA.

LETRA ANTERIOR (para referência de tema):
${previousLyrics}

⚠️ O PROBLEMA: A letra está REBUSCADA DEMAIS!

Você precisa escrever como BRASILEIRO FALA NO DIA A DIA, não como poeta do século XIX.

✅ ESCREVA ASSIM (SIMPLES):
"Olha pro retrovisor
Vê se você me acha
Eu fiquei lá atrás"

❌ NÃO ESCREVA ASSIM (COMPLICADO):
"Lembro do rancho velho, a fumaça a dançar
O fogão à lenha aceso, meu pai a dedilhar
Rádio na cozinha, a toada a ecoar"

REGRAS SIMPLES:

1. FRASES CURTAS: 1 ideia por linha
2. PALAVRAS DO DIA A DIA: fale como você falaria com um amigo
3. SEM "poesia velha": nada de "clamor", "ressoar", "dedilhar"
4. EMPILHE LÓGICO: cada verso adiciona uma camada simples

MÉTRICA: ${metrics.minSyllables}-${metrics.maxSyllables} sílabas (conte até a última TÔNICA)

REESCREVA a letra sendo SIMPLES, DIRETO e HUMANO. Como você contaria essa história para um amigo no bar.
Retorne apenas a letra reescrita.`
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
