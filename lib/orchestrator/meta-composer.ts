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

MÉTRICA OBRIGATÓRIA PARA ${this.config.genre.toUpperCase()}:
- Cada linha deve ter entre ${metrics.minSyllables} e ${metrics.maxSyllables} sílabas poéticas
- Meta ideal: ${targetSyllables} sílabas por linha
- Razão: ${metrics.reason}
${metrics.allowPeaks ? "- Picos pontuais acima do limite são permitidos para ênfase" : ""}

⚠️ IMPORTANTE - COMO CONTAR SÍLABAS POÉTICAS EM PORTUGUÊS BRASILEIRO:

1. CONTE ATÉ A ÚLTIMA SÍLABA TÔNICA (não conte átonas finais):
   - "Lembro do rancho amado" = Lem-bro-do-ran-cho-a-MA (7 sílabas, para em MA)
   - "Fogão à lenha aceso" = Fo-gão-à-le-nha-a-CE (7 sílabas, para em CE)
   
2. VÍRGULAS SÃO APENAS RESPIROS (não afetam contagem):
   - "Toda vez que ela me busca, encosta e se entrega" = continua sendo uma linha única
   - A vírgula é só uma pausa interpretativa para o cantor
   
3. USE SINALEFA NATURAL (junte vogais entre palavras):
   - "de amor" vira "d'amor" (reduz 1 sílaba)
   - "que eu" vira "qu'eu" (reduz 1 sílaba)
   - "se esvaiu" vira "s'esvaiu" (reduz 1 sílaba)

4. CONTRAÇÕES NATURAIS DO CANTO:
   - "para" → "pra" (economiza 1 sílaba)
   - "você" → "cê" (economiza 1 sílaba)
   - "está" → "tá" (economiza 1 sílaba)

🎭 NARRATIVA HUMANA E EMPILHAMENTO DE VERSOS (FUNDAMENTAL):

A letra deve ter NARRATIVA PROGRESSIVA, não apenas rimas soltas. Veja este exemplo de como empilhar versos:

EXEMPLO DE EMPILHAMENTO CORRETO:
"Só tem louça pra lavar
Quem tem comida no prato
Só paga IPVA quem já conquistou um carro
Só passa a noite ouvindo choro
Quem teve a bênção de um filho"

Veja como cada linha EMPILHA sobre a anterior, construindo uma LISTA LÓGICA que reforça a mensagem!

TÉCNICAS DE EMPILHAMENTO:

1. LISTA PROGRESSIVA (como no exemplo):
   - Crie uma sequência de situações/exemplos
   - Cada linha adiciona uma nova camada à mesma ideia
   - Use paralelismo sintático ("Só tem... Só paga... Só passa...")

2. NARRATIVA CRONOLÓGICA:
   - Conte uma história que avança no tempo
   - Cada verso leva para o próximo momento
   - "Começou assim... Depois virou... Agora é..."

3. INTENSIFICAÇÃO EMOCIONAL:
   - Comece com sentimento leve
   - Aumente a intensidade gradualmente
   - Culmine no refrão com a emoção máxima

4. CAUSA E CONSEQUÊNCIA:
   - Apresente uma situação
   - Mostre o que aconteceu por causa disso
   - Revele a conclusão/aprendizado

5. CONTRASTE/INVERSÃO:
   - "Antes eu pensava X... Mas descobri Y"
   - "Você dizia uma coisa... Mas fazia outra"
   - Crie tensão entre expectativa e realidade

LINGUAGEM COLOQUIAL BRASILEIRA:
- Fale como brasileiro conversa: "cê", "tá", "pra", "né"
- Use expressões do dia a dia: "Escuta aí!", "Cê já pensou nisso?"
- Conecte-se com situações reais e reconhecíveis
- Pareça uma conversa, não um poema formal

COESÃO TEMÁTICA:
- TUDO na letra deve girar em torno do MESMO tema central
- Cada verso deve fortalecer a mensagem principal
- Evite divagações ou ideias desconexas
- O refrão deve ser a síntese perfeita do tema

TRANSIÇÕES NATURAIS:
- Use conectores conversacionais: "e aí", "então", "mas"
- Faça pontes entre versos e refrão suaves
- Evite mudanças bruscas de assunto
- Mantenha o fluxo da conversa

ESTRUTURA:
- Verso 1 (4 linhas) - APRESENTA a situação/sentimento
- Verso 2 (4 linhas) - DESENVOLVE com exemplos empilhados
- Refrão (4 linhas) - MENSAGEM CENTRAL memorável e repetível
- Verso 3 (4 linhas) - APROFUNDA ou CONTRASTA
- Ponte (2-4 linhas) - MOMENTO DE REFLEXÃO ou virada emocional
- Refrão final (4 linhas) - REAFIRMA a mensagem com mais peso

REQUISITOS TÉCNICOS:
1. Conte as sílabas poéticas (até a última tônica)
2. Use linguagem natural e coloquial brasileira
3. Rimas naturais (não forçadas)
4. História clara com progressão emocional
5. Refrão cativante e fácil de memorizar
6. EMPILHE os versos logicamente (lista, cronologia, intensificação)
7. COESÃO temática em toda a letra
8. TRANSIÇÕES suaves entre seções
${this.config.additionalRequirements ? `\nREQUISITOS ADICIONAIS:\n${this.config.additionalRequirements}` : ""}

Escreva a letra completa com NARRATIVA HUMANA E EMPILHAMENTO LÓGICO, respeitando RIGOROSAMENTE a métrica de ${metrics.minSyllables}-${metrics.maxSyllables} sílabas.
Retorne apenas a letra, sem explicações ou títulos.`
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
    return `A letra anterior não atingiu a métrica ideal. Reescreva COMPLETAMENTE mantendo o tema e emoção, mas AJUSTANDO A MÉTRICA.

LETRA ANTERIOR (para referência de tema/emoção):
${previousLyrics}

MÉTRICA OBRIGATÓRIA:
- Cada linha: ${metrics.minSyllables}-${metrics.maxSyllables} sílabas POÉTICAS

⚠️ REGRAS DE CONTAGEM POÉTICA (FUNDAMENTAL):

1. PARE NA ÚLTIMA TÔNICA:
   ❌ ERRADO: "Lembro do rancho amado" = 8 sílabas (contando tudo)
   ✅ CERTO: "Lembro do rancho amado" = Lem-bro-do-ran-cho-a-MA-do → 7 sílabas (para em MA)

2. VÍRGULAS = RESPIROS (NÃO quebram a linha):
   - "Toda vez que ela me busca, encosta e se entrega" = UMA linha inteira
   - Vírgula é só pausa para respirar ao cantar

3. SINALEFA (junte vogais entre palavras):
   - "de amor" → "d'a-mor" (economiza 1)
   - "que eu" → "qu'eu" (economiza 1)
   - "meu amor" → "meu a-mor" (já se funde naturalmente)

4. CONTRAÇÕES DO CANTO:
   - para → pra (economiza 1)
   - você → cê (economiza 1)  
   - está → tá (economiza 1)

🎭 NARRATIVA E EMPILHAMENTO:

IMPORTANTE: Mantenha a NARRATIVA PROGRESSIVA e o EMPILHAMENTO LÓGICO dos versos!

Exemplo de EMPILHAMENTO CORRETO:
"Só tem louça pra lavar / Quem tem comida no prato
Só paga IPVA / Quem já conquistou um carro
Só passa a noite ouvindo choro / Quem teve a bênção de um filho"

Cada linha EMPILHA sobre a anterior, construindo uma SEQUÊNCIA LÓGICA.

Use técnicas:
- LISTA PROGRESSIVA (paralelismo: "Só tem... Só paga... Só passa...")
- CRONOLOGIA (começa → desenvolve → conclui)
- INTENSIFICAÇÃO (leve → médio → forte)
- CAUSA/CONSEQUÊNCIA (situação → resultado)
- CONTRASTE (antes → depois, expectativa → realidade)

REESCREVA a letra INTEIRA com NARRATIVA CLARA e versos EMPILHADOS LOGICAMENTE, respeitando RIGOROSAMENTE a métrica poética.
Cada linha DEVE ter ${metrics.minSyllables}-${metrics.maxSyllables} sílabas contadas ATÉ A ÚLTIMA TÔNICA.
Retorne apenas a letra, sem explicações.`
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
