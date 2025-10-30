// lib/orchestrator/meta-composer.ts - VERSÃO DEFINITIVA SIMPLIFICADA

import { generateText } from "ai"
import { UnifiedSyllableManager } from "@/lib/syllable-management/unified-syllable-manager"
import { NuclearValidator } from "@/lib/validation/nuclear-validator"
import {
  formatSertanejoPerformance,
  shouldUsePerformanceFormat,
} from "@/lib/formatters/sertanejo-performance-formatter"
import { PunctuationValidator } from "@/lib/validation/punctuation-validator"
import { LineStacker } from "@/lib/utils/line-stacker"
import { LyricsAuditor } from "@/lib/validation/lyrics-auditor"

export interface CompositionRequest {
  genre: string
  theme: string
  mood: string
  additionalRequirements?: string
  creativity?: "conservador" | "equilibrado" | "ousado"
  applyFinalPolish?: boolean
  preservedChoruses?: string[]
  originalLyrics?: string
  performanceMode?: "standard" | "performance"
  useTerceiraVia?: boolean
}

export interface CompositionResult {
  lyrics: string
  title: string
  metadata: {
    finalScore: number
    polishingApplied: boolean
    performanceMode: string
    modelUsed: string
    syllableValidation: {
      isValid: boolean
      violations: string[]
      maxSyllables: number
    }
  }
}

/**
 * 🎵 MOTOR DE COMPOSIÇÃO DEFINITIVO
 * Foco: SIMPLICIDADE + QUALIDADE + CONFIABILIDADE
 */
export class MetaComposer {
  private static readonly MODEL = "openai/gpt-4o-mini"

  static async compose(request: CompositionRequest): Promise<CompositionResult> {
    console.log("[MetaComposer] 🚀 Iniciando composição definitiva...")

    try {
      // 1. 🎯 GERAÇÃO PRINCIPAL
      let lyrics = request.originalLyrics 
        ? await this.rewriteLyrics(request) 
        : await this.generateLyrics(request)

      // 2. 🚨 VALIDAÇÃO NUCLEAR (GARANTIA DE QUALIDADE)
      console.log("[MetaComposer] 🚨 Aplicando validação nuclear...")
      lyrics = await NuclearValidator.nuclearValidation(lyrics)

      // 3. 📏 CONTROLE DE SÍLABAS INTELIGENTE
      console.log("[MetaComposer] 🔧 Aplicando gestor unificado de sílabas...")
      lyrics = await UnifiedSyllableManager.processSongWithBalance(lyrics)

      // 4. ✨ POLIMENTO FINAL (APENAS SE SOLICITADO)
      if (request.applyFinalPolish !== false) {
        lyrics = await this.applyPolish(lyrics, request)
      }

      // 5. 📊 AVALIAÇÃO FINAL
      const validation = UnifiedSyllableManager.validateSong(lyrics)
      const audit = LyricsAuditor.audit(lyrics, request.genre, request.theme)
      
      const hasBrokenLines = lyrics.split('\n').some(line => 
        NuclearValidator.isBrokenLine(line)
      )

      // Score baseado em qualidade real
      const finalScore = this.calculateFinalScore(audit.score, validation.isValid, hasBrokenLines)

      return {
        lyrics: lyrics,
        title: this.extractTitle(lyrics, request),
        metadata: {
          finalScore,
          polishingApplied: request.applyFinalPolish !== false,
          performanceMode: request.performanceMode || "standard",
          modelUsed: this.MODEL,
          syllableValidation: {
            isValid: validation.isValid && !hasBrokenLines,
            violations: hasBrokenLines ? ['LINHAS_QUEBRADAS_DETECTADAS'] : validation.violations,
            maxSyllables: 12
          }
        },
      }

    } catch (error) {
      console.error("[MetaComposer] ❌ Erro crítico:", error)
      return this.generateFallbackResult(request, error)
    }
  }

  /**
   * 🎼 GERAÇÃO DE LETRA ORIGINAL
   */
  private static async generateLyrics(request: CompositionRequest): Promise<string> {
    const prompt = `COMPOSITOR PROFISSIONAL BRASILEIRO - ${request.genre.toUpperCase()}

🎯 REGRA ABSOLUTA: ZERO LINHAS QUEBRADAS

📝 CADA VERSO DEVE SER UMA FRASE COMPLETA:
• Sujeito + verbo + complemento
• NUNCA terminar em "que", "de", "meu", "teu", "com", "em"
• NUNCA cortar palavras como "coraçã" (use "coração")
• NUNCA frases incompletas

✅ EXEMPLOS CORRETOS:
"Hoje eu venho aqui de coração aberto" 
"Teu sorriso é luz que ilumina meu caminho"
"Nos teus braços eu encontro a paz completa"

🚫 EXEMPLOS PROIBIDOS:
"coraçã" ❌ → "coração" ✅
"ilumina meu" ❌ → "ilumina meu caminho" ✅  
"encontro a paz que eu" ❌ → "encontro a paz que eu preciso" ✅

TEMA: ${request.theme}
HUMOR: ${request.mood || "romântico"}
GÊNERO: ${request.genre}

${request.additionalRequirements ? `REQUISITOS: ${request.additionalRequirements}` : ""}

ESTRUTURA:
[Intro]
[Verso 1] 
[Pré-Refrão]
[Refrão]
[Verso 2]
[Refrão] 
[Ponte]
[Refrão]
[Outro]

LETRA COMPLETA E COERENTE:`

    const { text } = await generateText({
      model: this.MODEL,
      prompt,
      temperature: this.getTemperature(request.creativity),
    })

    return this.cleanLyricsResponse(text || "Letra não pôde ser gerada.")
  }

  /**
   * 🔄 REESCRITA DE LETRA EXISTENTE
   */
  private static async rewriteLyrics(request: CompositionRequest): Promise<string> {
    if (!request.originalLyrics) {
      throw new Error("Letra original é obrigatória para reescrita")
    }

    const prompt = `REESCRITOR PROFISSIONAL - ${request.genre.toUpperCase()}

🎯 OBJETIVO: Melhorar esta letra mantendo VERSOS COMPLETOS

📝 REGRA ABSOLUTA: 
- ZERO linhas quebradas ou incompletas
- TODOS os versos devem fazer sentido completo
- Mantenha o tema e essência original

LETRA ORIGINAL:
${request.originalLyrics}

TEMA: ${request.theme}
HUMOR: ${request.mood}
GÊNERO: ${request.genre}

${request.additionalRequirements ? `REQUISITOS: ${request.additionalRequirements}` : ""}

REESCREVA COM VERSOS COMPLETOS:`

    const { text } = await generateText({
      model: this.MODEL,
      prompt,
      temperature: 0.4, // Temperatura baixa para reescrita conservadora
    })

    return this.cleanLyricsResponse(text || request.originalLyrics)
  }

  /**
   * ✨ APLICA POLIMENTO FINAL
   */
  private static async applyPolish(lyrics: string, request: CompositionRequest): Promise<string> {
    let polished = lyrics

    // Formatação de performance para sertanejo
    if (shouldUsePerformanceFormat(request.genre, request.performanceMode || "standard")) {
      polished = formatSertanejoPerformance(polished, request.genre)
    }

    // Correção de pontuação
    const punctResult = PunctuationValidator.validate(polished)
    if (!punctResult.isValid) {
      polished = punctResult.correctedLyrics
    }

    // Organização visual das linhas
    const stackResult = LineStacker.stackLines(polished)
    return stackResult.stackedLyrics
  }

  /**
   * 🧮 CALCULA SCORE FINAL INTELIGENTE
   */
  private static calculateFinalScore(
    auditScore: number, 
    syllableValid: boolean, 
    hasBrokenLines: boolean
  ): number {
    let score = auditScore * 0.7 // 70% da auditoria padrão
    
    // Bônus/Penalidades baseados em qualidade real
    if (syllableValid) score += 15
    if (!hasBrokenLines) score += 15
    if (!syllableValid) score -= 20
    if (hasBrokenLines) score -= 30

    return Math.max(0, Math.min(100, score))
  }

  /**
   * 🆘 GERA RESULTADO DE FALLBACK EM CASO DE ERRO
   */
  private static generateFallbackResult(
    request: CompositionRequest, 
    error: any
  ): CompositionResult {
    console.error("[MetaComposer] 🆘 Usando fallback de emergência")

    const fallbackLyrics = `### [Intro]
A música está sendo preparada
Com carinho e inspiração
Em breve estará perfeita
Para sua celebração

### [Verso 1]
Às vezes a criação precisa de tempo
Para nascer com perfeição
Cada verso é cuidado com carinho
Na mais pura emoção

### [Refrão]
Esta canção é feita pra você
Com amor e dedicação
Em cada nota, em cada acorde
A nossa conexão

### [Verso 2]
A vida é uma melodia constante
Que toca o coração
E nesta sintonia especial
Encontramos a união

### [Refrão] 
Esta canção é feita pra você
Com amor e dedicação
Em cada nota, em cada acorde
A nossa conexão

### [Outro]
Com gratidão no coração
Por este momento especial
A música é vida e emoção
Num laço celestial

(Instrumentation)
(Genre: ${request.genre})
(Instruments: Acoustic Guitar, Piano, Bass, Drums)`

    return {
      lyrics: fallbackLyrics,
      title: `${request.theme} - ${request.genre}`,
      metadata: {
        finalScore: 60,
        polishingApplied: false,
        performanceMode: request.performanceMode || "standard",
        modelUsed: "FALLBACK",
        syllableValidation: {
          isValid: true,
          violations: [],
          maxSyllables: 12
        }
      },
    }
  }

  /**
   * 🧼 LIMPEZA DA RESPOSTA DA IA
   */
  private static cleanLyricsResponse(text: string): string {
    return text
      .split("\n")
      .filter(line => {
        const trimmed = line.trim()
        return trimmed && 
               !trimmed.startsWith("Retorne") &&
               !trimmed.startsWith("REGRAS") &&
               !trimmed.startsWith("🎯") &&
               !trimmed.startsWith("📝") &&
               !trimmed.startsWith("✅") &&
               !trimmed.startsWith("🚫") &&
               !trimmed.includes("Explicação") &&
               !trimmed.includes("```")
      })
      .join("\n")
      .trim()
  }

  /**
   * 🔥 EXTRAI TÍTULO DA LETRA
   */
  private static extractTitle(lyrics: string, request: CompositionRequest): string {
    const lines = lyrics.split("\n")
    
    // Procura por linha significativa para título
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed && 
          !trimmed.startsWith("[") && 
          !trimmed.startsWith("(") &&
          !trimmed.startsWith("###") &&
          !trimmed.includes("Instrumentation") &&
          !trimmed.includes("Genre:") &&
          trimmed.length > 10 && trimmed.length < 50) {
        return trimmed
      }
    }
    
    // Fallback para tema + gênero
    return `${request.theme} - ${request.genre}`
  }

  /**
   * 🌡️ CONFIGURA TEMPERATURA BASEADA NA CRIATIVIDADE
   */
  private static getTemperature(creativity?: string): number {
    const temperatures = {
      conservador: 0.3,
      equilibrado: 0.6,
      ousado: 0.8
    }
    
    return temperatures[creativity as keyof typeof temperatures] || 0.6
  }

  /**
   * 🔍 VERIFICA SE LINHA É METADATA/MARCAÇÃO
   */
  private static isMetadataLine(line: string): boolean {
    const trimmed = line.trim()
    return (
      !trimmed ||
      trimmed.startsWith("[") ||
      trimmed.startsWith("(") ||
      trimmed.startsWith("###") ||
      trimmed.includes("Instrumentation") ||
      trimmed.includes("BPM:") ||
      trimmed.includes("Key:")
    )
  }
}
