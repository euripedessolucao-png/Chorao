// lib/terceira-via/third-way-converter.ts

import { generateText } from "ai"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter-brasileiro"
import { GENRE_CONFIGS } from "@/lib/genre-config"

export class ThirdWayEngine {
  static async generateThirdWayLine(
    originalLine: string,
    genre: string,
    genreConfig: any, // Recebe configuração completa (opcional, para compatibilidade)
    context: string,
    performanceMode = false,
    additionalRequirements?: string,
  ): Promise<string> {
    if (!genre || typeof genre !== "string" || !genre.trim()) {
      return originalLine
    }

    // ✅ Usa regras reais do genre-config.ts
    const config = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS]
    if (!config) {
      // Fallback para gêneros não listados
      return originalLine
    }

    // ✅ Extrai limite máximo de sílabas
    let maxSyllables = 12
    if ("absolute_max" in config.prosody_rules.syllable_count) {
      maxSyllables = config.prosody_rules.syllable_count.absolute_max
    } else if ("without_comma" in config.prosody_rules.syllable_count) {
      maxSyllables = config.prosody_rules.syllable_count.without_comma.acceptable_up_to
    }

    try {
      const variationA = await this.forceMetricVariation(
        originalLine,
        genre,
        config,
        maxSyllables,
        context,
        additionalRequirements,
      )

      const variationB = await this.forceCreativeVariation(
        originalLine,
        genre,
        config,
        maxSyllables,
        context,
        additionalRequirements,
      )

      return await this.forceFinalSynthesis(
        originalLine,
        variationA,
        variationB,
        genre,
        config,
        maxSyllables,
        context,
        additionalRequirements,
      )
    } catch (error) {
      console.error("[ThirdWay] Erro:", error)
      return originalLine
    }
  }

  private static async forceMetricVariation(
    originalLine: string,
    genre: string,
    config: any,
    maxSyllables: number,
    context: string,
    additionalRequirements?: string,
  ): Promise<string> {
    const currentSyllables = countPoeticSyllables(originalLine)

    const prompt = `Você é um especialista em métrica poética brasileira.

LINHA ORIGINAL: "${originalLine}"
GÊNERO: ${genre}
CONTEXTO: ${context}
SÍLABAS ATUAIS: ${currentSyllables}
LIMITE MÁXIMO: ${maxSyllables} sílabas

TAREFA: Reescreva a linha mantendo o significado, mas ajustando para ${maxSyllables} sílabas poéticas ou menos.

REGRAS:
- Mantenha a essência e emoção da linha original
- Use contrações naturais do português brasileiro (pra, tá, cê)
- Respeite o tom e estilo do gênero ${genre}
${additionalRequirements ? `- ${additionalRequirements}` : ""}

Retorne APENAS a linha reescrita, sem explicações.`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.5,
    })

    return this.safeCompress(text?.trim() || originalLine)
  }

  private static async forceCreativeVariation(
    originalLine: string,
    genre: string,
    config: any,
    maxSyllables: number,
    context: string,
    additionalRequirements?: string,
  ): Promise<string> {
    const prompt = `Você é um compositor criativo de ${genre}.

LINHA ORIGINAL: "${originalLine}"
CONTEXTO: ${context}
LIMITE: ${maxSyllables} sílabas poéticas

TAREFA: Crie uma variação criativa e impactante da linha, mantendo a mensagem central.

DIRETRIZES:
- Seja mais expressivo e poético
- Use metáforas e linguagem figurada quando apropriado
- Mantenha naturalidade e autenticidade do ${genre}
- Respeite o limite de ${maxSyllables} sílabas
${additionalRequirements ? `- ${additionalRequirements}` : ""}

Retorne APENAS a linha reescrita, sem explicações.`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.8,
    })

    return this.safeCompress(text?.trim() || originalLine)
  }

  private static async forceFinalSynthesis(
    originalLine: string,
    variationA: string,
    variationB: string,
    genre: string,
    config: any,
    maxSyllables: number,
    context: string,
    additionalRequirements?: string,
  ): Promise<string> {
    const syllablesA = countPoeticSyllables(variationA)
    const syllablesB = countPoeticSyllables(variationB)

    // Se uma das variações já está perfeita, use-a
    if (syllablesA <= maxSyllables && syllablesA > 0) {
      return variationA
    }
    if (syllablesB <= maxSyllables && syllablesB > 0) {
      return variationB
    }

    const prompt = `Você é um compositor profissional de ${genre}.

LINHA ORIGINAL: "${originalLine}"
VARIAÇÃO MÉTRICA: "${variationA}" (${syllablesA} sílabas)
VARIAÇÃO CRIATIVA: "${variationB}" (${syllablesB} sílabas)
CONTEXTO: ${context}

TAREFA: Sintetize a melhor versão final combinando os pontos fortes de ambas as variações.

CRITÉRIOS:
- Máximo de ${maxSyllables} sílabas poéticas
- Mantenha a naturalidade e fluidez
- Preserve a emoção e mensagem original
- Use o melhor de cada variação
${additionalRequirements ? `- ${additionalRequirements}` : ""}

Retorne APENAS a linha final, sem explicações.`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.6,
    })

    const finalLine = this.safeCompress(text?.trim() || originalLine)
    const finalSyllables = countPoeticSyllables(finalLine)

    // Se ainda estiver acima do limite, use a variação mais próxima
    if (finalSyllables > maxSyllables) {
      return syllablesA < syllablesB ? variationA : variationB
    }

    return finalLine
  }

  private static safeCompress(text: string): string {
    return text
      .replace(/\s+/g, " ")
      .replace(/\s+([.,!?;:])/g, "$1")
      .trim()
  }
}
