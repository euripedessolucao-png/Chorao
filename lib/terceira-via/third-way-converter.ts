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

  // ... (mantenha os métodos forceMetricVariation, forceCreativeVariation, forceFinalSynthesis e safeCompress)
  // mas atualize-os para usar `config` em vez de `genreRules`
}
