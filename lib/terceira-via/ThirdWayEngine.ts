import { generateText } from "ai"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter"

export const ADVANCED_BRAZILIAN_METRICS = {
  "Sertanejo Moderno": { syllablesPerLine: 6, maxSyllables: 7, bpm: 90, structure: "VERSO-REFRAO-PONTE" },
  "Sertanejo Universitário": { syllablesPerLine: 6, maxSyllables: 7, bpm: 95, structure: "VERSO-REFRAO" },
  "Sertanejo Sofrência": { syllablesPerLine: 8, maxSyllables: 9, bpm: 75, structure: "VERSO-REFRAO-PONTE" },
  "Sertanejo Raiz": { syllablesPerLine: 10, maxSyllables: 11, bpm: 80, structure: "VERSO-REFRAO" },
  "Bachata Tradicional": { syllablesPerLine: 10, maxSyllables: 11, bpm: 110, structure: "VERSO-REFRAO-PONTE" },
  "Bachata Moderna": { syllablesPerLine: 10, maxSyllables: 11, bpm: 110, structure: "VERSO-REFRAO-PONTE" },
  "Bachata Brasileira": { syllablesPerLine: 10, maxSyllables: 11, bpm: 110, structure: "VERSO-REFRAO-PONTE" },
  Pagode: { syllablesPerLine: 7, maxSyllables: 8, bpm: 100, structure: "VERSO-REFRAO" },
  Funk: { syllablesPerLine: 6, maxSyllables: 7, bpm: 125, structure: "REFRAO-VERSO" },
  MPB: { syllablesPerLine: 9, maxSyllables: 10, bpm: 90, structure: "VERSO-REFRAO-PONTE" },
  Pop: { syllablesPerLine: 7, maxSyllables: 8, bpm: 110, structure: "VERSO-REFRAO-PONTE" },
  default: { syllablesPerLine: 8, maxSyllables: 9, bpm: 100, structure: "VERSO-REFRAO" },
} as const

export type GenreName = keyof typeof ADVANCED_BRAZILIAN_METRICS

/**
 * ============================================================================
 * TERCEIRA VIA ATUALIZADA - SISTEMA DE COMPOSIÇÃO POR RESTRIÇÕES
 * ============================================================================
 *
 * ATUALIZAÇÃO: Agora usa SÍLABAS POÉTICAS (com elisão/sinalefa)
 * ============================================================================
 */
export class ThirdWayEngine {
  /**
   * ----------------------------------------------------------------------------
   * FUNÇÃO PRINCIPAL: Gera uma linha usando o sistema de Terceira Via
   * ----------------------------------------------------------------------------
   */
  static async generateThirdWayLine(
    originalLine: string,
    genre: string,
    genreRules: any,
    context: string,
    performanceMode = false,
    additionalRequirements?: string,
  ): Promise<string> {
    const normalizedGenre = genre.includes("Bachata") ? "Bachata Moderna" : genre
    const metrics = ADVANCED_BRAZILIAN_METRICS[normalizedGenre as GenreName] || ADVANCED_BRAZILIAN_METRICS.default

    try {
      // VARIAÇÃO A: Métrica perfeita (restrição rígida de sílabas POÉTICAS)
      const variationA = await this.forceMetricVariation(
        originalLine,
        genre,
        genreRules,
        metrics,
        context,
        additionalRequirements,
      )

      // VARIAÇÃO B: Criatividade (restrição rígida de linguagem)
      const variationB = await this.forceCreativeVariation(
        originalLine,
        genre,
        genreRules,
        metrics,
        context,
        additionalRequirements,
      )

      // SÍNTESE: Combinar sob todas as restrições
      const finalLine = await this.forceFinalSynthesis(
        originalLine,
        variationA,
        variationB,
        genre,
        genreRules,
        metrics,
        context,
        additionalRequirements,
      )

      return finalLine
    } catch (error) {
      console.error("[ThirdWay] Erro na Terceira Via:", error)
      return originalLine
    }
  }

  private static async forceMetricVariation(
    line: string,
    genre: string,
    genreRules: any,
    metrics: any,
    context: string,
    additionalRequirements?: string,
  ): Promise<string> {
    const forbiddenList = genreRules?.language_rules?.forbidden
      ? Object.values(genreRules.language_rules.forbidden).flat()
      : []

    const universalRule =
      genreRules?.language_rules?.universal_rule ||
      "SEMPRE use palavras simples e coloquiais, faladas como um humano no dia-a-dia. Evite vocabulário rebuscado, poético ou formal."

    const languageOverride = additionalRequirements
      ? `\n\nEXCEÇÃO: O compositor especificou requisitos adicionais: "${additionalRequirements}". Siga estas instruções específicas.`
      : `\n\nREGRA UNIVERSAL INVIOLÁVEIS: ${universalRule}`

    const prompt = `RESTRIÇÕES ABSOLUTAS - VARIAÇÃO A (MÉTRICA POÉTICA):

LINHA: "${line}"
GÊNERO: ${genre}
LIMITE: ${metrics.maxSyllables} SÍLABAS POÉTICAS (ABSOLUTO - NÃO PODE EXCEDER)

⚠️ SISTEMA DE SÍLABAS POÉTICAS (ELISÃO/SINALEFA):
• "de amor" → "d'amor" (3→2 sílabas) - OBRIGATÓRIO
• "que eu" → "qu'eu" (2→1 sílaba) - OBRIGATÓRIO  
• "meu amor" → "meuamor" (4→3 sílabas) - OBRIGATÓRIO
• "se eu" → "s'eu" (2→1 sílaba) - OBRIGATÓRIO

REGRAS INVIOLÁVEIS:
1. MÁXIMO ${metrics.maxSyllables} SÍLABAS POÉTICAS - qualquer linha com mais será REJEITADA
2. Use contrações: "para"→"pra", "você"→"cê", "está"→"tá", "estão"→"tão"
3. Use ELISÃO obrigatória: "de amor"→"d'amor", "que eu"→"qu'eu"
4. NUNCA quebre palavras (ex: "nãsãnossas" é PROIBIDO)
5. NUNCA use: ${forbiddenList.slice(0, 10).join(", ")}
6. Mantenha o significado emocional da linha original
7. PALAVRAS SIMPLES E COLOQUIAIS - fale como uma pessoa comum fala no dia-a-dia${languageOverride}

CONTEXTO: ${context}

RETORNE APENAS A LINHA REESCRITA (sem explicações, sem aspas, sem comentários).`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.3,
    })

    return text.trim().replace(/^["']|["']$/g, "")
  }

  private static async forceCreativeVariation(
    line: string,
    genre: string,
    genreRules: any,
    metrics: any,
    context: string,
    additionalRequirements?: string,
  ): Promise<string> {
    const allowedList = genreRules?.language_rules?.allowed
      ? Object.values(genreRules.language_rules.allowed).flat()
      : []
    const forbiddenList = genreRules?.language_rules?.forbidden
      ? Object.values(genreRules.language_rules.forbidden).flat()
      : []

    const universalRule =
      genreRules?.language_rules?.universal_rule ||
      "SEMPRE use palavras simples e coloquiais, faladas como um humano no dia-a-dia. Evite vocabulário rebuscado, poético ou formal."

    const languageOverride = additionalRequirements
      ? `\n\nEXCEÇÃO: O compositor especificou requisitos adicionais: "${additionalRequirements}". Siga estas instruções específicas.`
      : `\n\nREGRA UNIVERSAL INVIOLÁVEIS: ${universalRule}`

    const prompt = `RESTRIÇÕES ABSOLUTAS - VARIAÇÃO B (CRIATIVIDADE POÉTICA):

LINHA: "${line}"
GÊNERO: ${genre}
LIMITE: ${metrics.maxSyllables} SÍLABAS POÉTICAS (ABSOLUTO)

⚠️ SISTEMA DE SÍLABAS POÉTICAS (ELISÃO/SINALEFA):
• "de amor" → "d'amor" (3→2 sílabas) - OBRIGATÓRIO
• "que eu" → "qu'eu" (2→1 sílaba) - OBRIGATÓRIO
• Vogais entre palavras se unem: "sua alma" → "sualma" (4→3 sílabas)

REGRAS INVIOLÁVEIS:
1. MÁXIMO ${metrics.maxSyllables} SÍLABAS POÉTICAS
2. USE APENAS elementos permitidos: ${allowedList.slice(0, 15).join(", ")}
3. PROIBIDO usar: ${forbiddenList.slice(0, 10).join(", ")}
4. NUNCA quebre palavras
5. Evite clichês de IA: "coração partido", "alma vazia", "dor profunda"
6. Use imagens CONCRETAS e VISUAIS (não abstratas)
7. PALAVRAS SIMPLES DO DIA-A-DIA - como uma pessoa comum fala${languageOverride}
8. USE ELISÃO OBRIGATORIAMENTE para reduzir sílabas

CONTEXTO: ${context}

RETORNE APENAS A LINHA REESCRITA (sem explicações, sem aspas, sem comentários).`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.7,
    })

    return text.trim().replace(/^["']|["']$/g, "")
  }

  private static async forceFinalSynthesis(
    original: string,
    variationA: string,
    variationB: string,
    genre: string,
    genreRules: any,
    metrics: any,
    context: string,
    additionalRequirements?: string,
  ): Promise<string> {
    // ✅ AGORA USA countPoeticSyllables (sistema novo)
    const syllablesA = countPoeticSyllables(variationA)
    const syllablesB = countPoeticSyllables(variationB)

    const forbiddenList = genreRules?.language_rules?.forbidden
      ? Object.values(genreRules.language_rules.forbidden).flat()
      : []

    const universalRule =
      genreRules?.language_rules?.universal_rule ||
      "SEMPRE use palavras simples e coloquiais, faladas como um humano no dia-a-dia. Evite vocabulário rebuscado, poético ou formal."

    const languageOverride = additionalRequirements
      ? `\n\nEXCEÇÃO: O compositor especificou requisitos adicionais: "${additionalRequirements}". Siga estas instruções específicas.`
      : `\n\nREGRA UNIVERSAL INVIOLÁVEIS: ${universalRule}`

    const prompt = `SÍNTESE FINAL - TODAS AS RESTRIÇÕES APLICADAS (SÍLABAS POÉTICAS):

ORIGINAL: "${original}"
VARIAÇÃO A (${syllablesA} sílabas POÉTICAS): "${variationA}"
VARIAÇÃO B (${syllablesB} sílabas POÉTICAS): "${variationB}"

TAREFA: Combine os MELHORES elementos de A e B.

⚠️ SISTEMA DE SÍLABAS POÉTICAS:
• Elisão obrigatória: "de amor"→"d'amor", "que eu"→"qu'eu"
• Sinalefa automática entre vogais
• Conta até a última sílaba tônica

RESTRIÇÕES ABSOLUTAS:
1. MÁXIMO ${metrics.maxSyllables} SÍLABAS POÉTICAS (INVIOLÁVEL)
2. NUNCA use: ${forbiddenList.slice(0, 10).join(", ")}
3. NUNCA quebre palavras (mantenha espaços entre palavras)
4. Use a métrica de A + a criatividade de B
5. Palavras COMPLETAS e CORRETAS sempre
6. LINGUAGEM SIMPLES E COLOQUIAL - fale como uma pessoa comum no dia-a-dia
7. USE ELISÃO para respeitar o limite de sílabas${languageOverride}

GÊNERO: ${genre}
CONTEXTO: ${context}

RETORNE APENAS A LINHA FINAL (sem explicações, sem aspas, sem comentários).`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.5,
    })

    const finalLine = text.trim().replace(/^["']|["']$/g, "")

    // ✅ AGORA USA countPoeticSyllables (sistema novo)
    const finalSyllables = countPoeticSyllables(finalLine)
    if (finalSyllables > metrics.maxSyllables) {
      return this.safeCompress(finalLine, metrics.maxSyllables)
    }

    return finalLine
  }

  private static safeCompress(line: string, maxSyllables: number): string {
    let compressed = line

    const contractions = [
      { from: /\bpara o\b/gi, to: "pro" },
      { from: /\bpara a\b/gi, to: "pra" },
      { from: /\bpara\b/gi, to: "pra" },
      { from: /\bestá\b/gi, to: "tá" },
      { from: /\bvocê\b/gi, to: "cê" },
      { from: /\bestão\b/gi, to: "tão" },
      { from: /\bde o\b/gi, to: "do" },
      { from: /\bde a\b/gi, to: "da" },
      { from: /\bem o\b/gi, to: "no" },
      { from: /\bem a\b/gi, to: "na" },
      { from: /\bque está\b/gi, to: "que tá" },
      { from: /\bque estão\b/gi, to: "que tão" },
      // ✅ ADICIONADAS ELISÕES POÉTICAS
      { from: /\bde amor\b/gi, to: "d'amor" },
      { from: /\bque eu\b/gi, to: "qu'eu" },
      { from: /\bse eu\b/gi, to: "s'eu" },
      { from: /\bmeu amor\b/gi, to: "meuamor" },
    ]

    for (const { from, to } of contractions) {
      const test = compressed.replace(from, to)
      // ✅ AGORA USA countPoeticSyllables (sistema novo)
      if (countPoeticSyllables(test) <= maxSyllables) {
        compressed = test
        return compressed
      }
    }

    return line
  }
}

// ✅ Função atualizada para usar o novo sistema
export function countPortugueseSyllables(text: string): number {
  return countPoeticSyllables(text)
}
Terceira via: // ✅ APLICAÇÃO DA TERCEIRA VIA COM THIRD WAY ENGINE (ATUALIZADA)
import { ThirdWayEngine } from "./third-way-converter"

export async function applyTerceiraViaToLine(
  line: string,
  index: number,
  context: string,
  isPerformanceMode: boolean,
  additionalRequirements?: string,
  genre?: string,
  genreConfig?: any, // ✅ NOVO PARÂMETRO OPCIONAL
): Promise<string> {
  if (!line.trim() || line.startsWith("[") || line.startsWith("(") || line.includes("Instruments:")) {
    return line
  }

  try {
    console.log(`[TerceiraVia] 🔧 Processando linha ${index}: "${line.substring(0, 40)}..."`)

    // ✅ USA THIRD WAY ENGINE PARA CORREÇÕES AVANÇADAS
    if (genre && genreConfig) {
      const improvedLine = await ThirdWayEngine.generateThirdWayLine(
        line,
        genre,
        genreConfig, // ✅ USA A CONFIGURAÇÃO PASSADA
        context,
        isPerformanceMode,
        additionalRequirements,
      )

      console.log(`[TerceiraVia] ✅ Linha ${index} melhorada com Third Way: "${improvedLine}"`)
      return improvedLine
    }

    // ✅ FALLBACK PARA SISTEMA ORIGINAL (se não tiver genreConfig)
    return await applyLegacyTerceiraVia(line, index, context, additionalRequirements)
  } catch (error) {
    console.error(`[TerceiraVia] ❌ Erro na linha ${index}:`, error)
    return line
  }
}

async function applyLegacyTerceiraVia(
  line: string,
  index: number,
  context: string,
  additionalRequirements?: string,
): Promise<string> {
  // Placeholder for legacy implementation
  return line
}
