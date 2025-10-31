// lib/terceira-via/third-way-converter.ts - VERSÃO COMPLETAMENTE REFORMULADA

import { generateText } from "ai"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter-brasileiro"

export class ThirdWayEngine {
  /**
   * 🎯 MÉTODO PRINCIPAL - TOTALMENTE REFORMULADO
   * Gera a "Terceira Via": uma versão que evita clichês de IA mantendo a essência
   */
  static async generateThirdWayLine(
    originalLine: string,
    genre: string,
    genreConfig: any,
    context: string,
    performanceMode = false,
    additionalRequirements?: string,
  ): Promise<string> {
    if (!this.shouldProcessLine(originalLine)) {
      return originalLine
    }

    console.log(`[ThirdWay] 🎯 Processando: "${originalLine.substring(0, 40)}..."`)

    try {
      // ✅ ANÁLISE DA LINHA ORIGINAL
      const analysis = this.analyzeLine(originalLine, genre)

      // ✅ SE JÁ É BOA, MANTÉM
      if (analysis.qualityScore >= 80 && !this.hasAICliche(originalLine)) {
        console.log(`[ThirdWay] ✅ Linha já de qualidade - mantendo`)
        return originalLine
      }

      // ✅ GERA 3 ABORDAGENS DIFERENTES
      const approaches = await Promise.all([
        this.approachEmotional(originalLine, genre, context, analysis),
        this.approachMinimalist(originalLine, genre, context, analysis),
        this.approachMetaphorical(originalLine, genre, context, analysis),
      ])

      // ✅ SELECIONA A MELHOR
      const bestLine = await this.selectBestApproach(originalLine, approaches, genre, analysis)

      console.log(`[ThirdWay] 🎉 MELHOR: "${bestLine.substring(0, 50)}..."`)
      return bestLine
    } catch (error) {
      console.error(`[ThirdWay] ❌ Erro em: "${originalLine}" -`, error)
      return originalLine
    }
  }

  /**
   * 🎭 ABORDAGEM 1: EMOCIONAL E AUTÊNTICA
   * Foca em sentimentos genuínos, evita clichês
   */
  private static async approachEmotional(
    originalLine: string,
    genre: string,
    context: string,
    analysis: LineAnalysis,
  ): Promise<string> {
    const prompt = `COMO SER HUMANO COMPOSITOR - ABORDAGEM EMOCIONAL AUTÊNTICA

LINHA ORIGINAL (NÃO COPIE, APENAS SE INSPIRE):
"${originalLine}"

CONTEXTO DA MÚSICA:
${context}

GÊNERO: ${genre}
TAREFA: Reescreva esta linha como um SER HUMANO de verdade sentiria e expressaria.

DIRETRIZES CRÍTICAS:
🚫 NÃO USE: "coração", "alma", "gratidão transbordando", "amor infinito", "tua luz"
✅ USE: Emoções específicas e situações reais
✅ SEJA: Vulnerável, genuíno, específico
✅ LINGUAGEM: Coloquial brasileira natural

EXEMPLOS DE COMO UM HUMANO FALARIA:
❌ "Meu coração está cheio de gratidão" → ✅ "Ainda lembro daquele abraço que salvou meu dia"
❌ "Tua luz ilumina meu caminho" → ✅ "Naquela tarde chuvosa, sua chegada mudou tudo"
❌ "Minha alma encontra paz em ti" → ✅ "No silêncio da madrugada, seu apoio me acalma"

LINHA RESSRITA (máximo ${analysis.maxSyllables} sílabas):`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.9, // Alta criatividade
    })

    return this.validateAndClean(text || originalLine, analysis.maxSyllables)
  }

  /**
   * 🎨 ABORDAGEM 2: MINIMALISTA E DIRETA
   * Remove excessos, foca no essencial
   */
  private static async approachMinimalist(
    originalLine: string,
    genre: string,
    context: string,
    analysis: LineAnalysis,
  ): Promise<string> {
    const prompt = `COPO METADE VAZIO - ABORDAGEM MINIMALISTA CRÍTICA

LINHA ORIGINAL (PROVAVELMENTE CLICHÊ):
"${originalLine}"

CONTEXTO: ${context}
GÊNERO: ${genre}

TAREFA: Reescreva de forma BRUTALMENTE HONESTA e MINIMALISTA.

PENSE COMO CRÍTICO:
- Qual a VERDADE por trás do clichê?
- Como dizer a mesma coisa sem firula?
- Que detalhe específico tornaria isso real?

EXEMPLOS DE DESCONSTRUÇÃO:
❌ "Cada amanhecer é uma bênção" → ✅ "O café da manhã ainda tem gosto"
❌ "Nos braços de Deus encontro paz" → ✅ "Na fila do banco, respirei fundo"
❌ "Teu amor renova minhas forças" → ✅ "Sua mensagem veio na hora certa"

LINHA RESSRITA (seja cru, seja real, ${analysis.maxSyllables} sílabas):`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.7,
    })

    return this.validateAndClean(text || originalLine, analysis.maxSyllables)
  }

  /**
   * 🌟 ABORDAGEM 3: METAFÓRICA E POÉTICA
   * Usa imagens originais, não as batidas da IA
   */
  private static async approachMetaphorical(
    originalLine: string,
    genre: string,
    context: string,
    analysis: LineAnalysis,
  ): Promise<string> {
    const prompt = `POETA ORIGINAL - METÁFORAS NUNCA VISTAS

LINHA ORIGINAL (EVITE ESTES CLICHÊS):
"${originalLine}"

CONTEXTO: ${context}  
GÊNERO: ${genre}

TAREFA: Crie uma metáfora COMPLETAMENTE ORIGINAL que transmita a mesma emoção.

METÁFORAS PROIBIDAS (JÁ VISTAS DEMais):
❌ Luz/escuridão, porto seguro, caminho, flor, tempestade
❌ Rio, mar, vento, fogo, abrigo, lar

METÁFORAS ORIGINAIS SUGERIDAS:
✅ "Como a primeira risada depois do cinema"
✅ "Parecido com o cheiro de livro novo na estante"  
✅ "Igual encontrar dinheiro no bolso do casaco"
✅ "Como o silêncio que fica depois que a música para"

LINHA RESSRITA (metáfora nova, ${analysis.maxSyllables} sílabas):`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.95, // Máxima criatividade
    })

    return this.validateAndClean(text || originalLine, analysis.maxSyllables)
  }

  /**
   * 🏆 SELECIONA A MELHOR ABORDAGEM
   */
  private static async selectBestApproach(
    originalLine: string,
    approaches: string[],
    genre: string,
    analysis: LineAnalysis,
  ): Promise<string> {
    // Remove duplicatas e linhas inválidas
    const validApproaches = approaches.filter(
      (line, index, array) =>
        line &&
        line !== originalLine &&
        array.indexOf(line) === index && // Remove duplicatas
        this.countSyllables(line) <= analysis.maxSyllables &&
        !this.hasAICliche(line),
    )

    if (validApproaches.length === 0) {
      return originalLine
    }

    if (validApproaches.length === 1) {
      return validApproaches[0]
    }

    // ✅ ANALISA QUALIDADE DAS ABORDAGENS
    const scoredApproaches = validApproaches.map((line) => ({
      line,
      score: this.calculateLineQuality(line, originalLine, genre),
    }))

    // Ordena por score e pega a melhor
    scoredApproaches.sort((a, b) => b.score - a.score)

    return scoredApproaches[0].line
  }

  /**
   * 📊 ANALISA QUALIDADE DA LINHA
   */
  private static calculateLineQuality(line: string, original: string, genre: string): number {
    let score = 50

    // ✅ BÔNUS POR ORIGINALIDADE
    if (!this.hasAICliche(line)) score += 20
    if (this.hasOriginalMetaphor(line)) score += 15

    // ✅ BÔNUS POR ESPECIFICIDADE
    if (this.hasConcreteDetails(line)) score += 10
    if (this.hasEmotionalAuthenticity(line)) score += 10

    // ✅ BÔNUS POR FORMATAÇÃO
    const syllables = this.countSyllables(line)
    const idealSyllables = this.getIdealSyllables(genre)
    if (Math.abs(syllables - idealSyllables) <= 2) score += 10

    // ✅ PENALIDADES
    if (line.length < 5) score -= 30
    if (this.isTooAbstract(line)) score -= 15
    if (line === original) score -= 20 // Penaliza se não mudou nada

    return Math.max(0, score)
  }

  // ─── ANALYTICS & VALIDATION ────────────────────────────────────────

  private static analyzeLine(line: string, genre: string): LineAnalysis {
    const syllables = this.countSyllables(line)
    const maxSyllables = this.getMaxSyllables(genre)

    return {
      originalLine: line,
      syllableCount: syllables,
      maxSyllables,
      hasCliche: this.hasAICliche(line),
      qualityScore: this.calculateBaseQuality(line, genre),
      emotionalDepth: this.assessEmotionalDepth(line),
    }
  }

  private static hasAICliche(line: string): boolean {
    const cliches = [
      "coração aberto",
      "gratidão transbordando",
      "amor infinito",
      "tua luz",
      "minha alma",
      "abençoado",
      "renovar",
      "cada amanhecer",
      "tua presença",
      "eternamente",
      "nos braços de",
      "encontro paz",
      "achando abrigo",
      "transbordando em mim",
      "de mãos dadas",
      "minha fortaleza",
      "minha esperança",
      "Deus me deu",
      "sinto a tua",
      "minha vida",
      "é uma bênção",
    ]

    const lowerLine = line.toLowerCase()
    return cliches.some((cliche) => lowerLine.includes(cliche))
  }

  private static hasOriginalMetaphor(line: string): boolean {
    const originalIndicators = ["como", "parecido", "igual", "que nem", "tipo"]
    return originalIndicators.some((indicator) => line.toLowerCase().includes(indicator))
  }

  private static hasConcreteDetails(line: string): boolean {
    const concreteWords = [
      "café",
      "janela",
      "ônibus",
      "chuva",
      "telefone",
      "mesa",
      "cadeira",
      "rua",
      "praça",
      "filme",
      "música",
      "livro",
      "caneta",
      "papel",
    ]
    return concreteWords.some((word) => line.toLowerCase().includes(word))
  }

  private static hasEmotionalAuthenticity(line: string): boolean {
    const authenticMarkers = [
      "quase",
      "talvez",
      "às vezes",
      "de repente",
      "do nada",
      "sem querer",
      "quando",
      "enquanto",
      "antes",
      "depois",
    ]
    return authenticMarkers.some((marker) => line.toLowerCase().includes(marker))
  }

  private static isTooAbstract(line: string): boolean {
    const abstractWords = [
      "vida",
      "amor",
      "paz",
      "alegria",
      "esperança",
      "fé",
      "destino",
      "universo",
      "eternidade",
      "infinito",
    ]

    const words = line.toLowerCase().split(/\s+/)
    const abstractCount = words.filter((word) => abstractWords.includes(word)).length

    return abstractCount >= 2
  }

  private static calculateBaseQuality(line: string, genre: string): number {
    let score = 60

    if (!this.hasAICliche(line)) score += 20
    if (this.hasConcreteDetails(line)) score += 10
    if (this.hasEmotionalAuthenticity(line)) score += 10

    const syllables = this.countSyllables(line)
    const ideal = this.getIdealSyllables(genre)
    if (Math.abs(syllables - ideal) <= 2) score += 10

    return Math.min(100, score)
  }

  private static assessEmotionalDepth(line: string): number {
    if (this.hasAICliche(line)) return 1
    if (this.hasConcreteDetails(line)) return 3
    if (this.hasEmotionalAuthenticity(line)) return 4
    return 2
  }

  // ─── UTILITIES ─────────────────────────────────────────────────────

  private static shouldProcessLine(line: string): boolean {
    const trimmed = line.trim()
    return (
      trimmed.length > 0 &&
      trimmed.length > 3 &&
      !trimmed.startsWith("[") &&
      !trimmed.startsWith("(") &&
      !trimmed.startsWith("###")
    )
  }

  private static validateAndClean(line: string, maxSyllables: number): string {
    if (!line) return ""

    let cleaned = line
      .replace(/^["']|["']$/g, "") // Remove aspas
      .replace(/\s+/g, " ") // Normaliza espaços
      .trim()

    // Garante que não exceda sílabas
    if (this.countSyllables(cleaned) > maxSyllables) {
      cleaned = this.smartTrim(cleaned, maxSyllables)
    }

    return cleaned
  }

  private static smartTrim(line: string, maxSyllables: number): string {
    const words = line.split(" ")
    let result = words[0]

    for (let i = 1; i < words.length; i++) {
      const testLine = words.slice(0, i + 1).join(" ")
      if (this.countSyllables(testLine) > maxSyllables) {
        break
      }
      result = testLine
    }

    return result
  }

  private static countSyllables(text: string): number {
    return countPoeticSyllables(text)
  }

  private static getMaxSyllables(genre: string): number {
    // Usa o sistema unificado
    return 12 // Padrão do UnifiedSyllableManager
  }

  private static getIdealSyllables(genre: string): number {
    const genreLower = genre.toLowerCase()
    if (genreLower.includes("sertanejo")) return 9
    if (genreLower.includes("pagode")) return 9
    if (genreLower.includes("rock")) return 10
    return 9 // Padrão
  }
}

interface LineAnalysis {
  originalLine: string
  syllableCount: number
  maxSyllables: number
  hasCliche: boolean
  qualityScore: number
  emotionalDepth: number
}
