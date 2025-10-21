import { countPoeticSyllables } from "./syllable-counter"

/**
 * CORRETOR ULTRA AGRESSIVO DE SÍLABAS
 *
 * Aplica múltiplas técnicas de redução até atingir EXATAMENTE 11 sílabas poéticas.
 * Usa o mesmo contador do aplicativo para garantir zero falsos positivos.
 */

interface ReductionTechnique {
  name: string
  priority: number
  apply: (line: string) => string
}

export class UltraAggressiveSyllableReducer {
  private readonly MAX_SYLLABLES = 11
  private readonly MAX_ATTEMPTS = 10

  // Técnicas de redução ordenadas por prioridade (menos invasivas primeiro)
  private readonly techniques: ReductionTechnique[] = [
    // 1. Contrações naturais (mais comum em música brasileira)
    {
      name: "Contrações naturais",
      priority: 1,
      apply: (line: string) => {
        return line
          .replace(/\bpara\b/gi, "pra")
          .replace(/\bvocê\b/gi, "cê")
          .replace(/\bestá\b/gi, "tá")
          .replace(/\bestou\b/gi, "tô")
          .replace(/\bestamos\b/gi, "tamo")
          .replace(/\bestão\b/gi, "tão")
      },
    },

    // 2. Remoção de artigos definidos desnecessários
    {
      name: "Remoção de artigos definidos",
      priority: 2,
      apply: (line: string) => {
        return line
          .replace(/\bo\s+/gi, "")
          .replace(/\ba\s+/gi, "")
          .replace(/\bos\s+/gi, "")
          .replace(/\bas\s+/gi, "")
      },
    },

    // 3. Remoção de artigos indefinidos
    {
      name: "Remoção de artigos indefinidos",
      priority: 3,
      apply: (line: string) => {
        return line
          .replace(/\bum\s+/gi, "")
          .replace(/\buma\s+/gi, "")
          .replace(/\buns\s+/gi, "")
          .replace(/\bumas\s+/gi, "")
      },
    },

    // 4. Elisão (junção de vogais entre palavras)
    {
      name: "Elisão",
      priority: 4,
      apply: (line: string) => {
        return line
          .replace(/\bde\s+o\b/gi, "d'o")
          .replace(/\bde\s+a\b/gi, "d'a")
          .replace(/\bde\s+e\b/gi, "d'e")
          .replace(/\bque\s+é\b/gi, "qu'é")
          .replace(/\bque\s+era\b/gi, "qu'era")
      },
    },

    // 5. Remoção de preposições redundantes
    {
      name: "Remoção de preposições",
      priority: 5,
      apply: (line: string) => {
        return line
          .replace(/\bde\s+/gi, "")
          .replace(/\bem\s+/gi, "")
          .replace(/\bpor\s+/gi, "")
      },
    },

    // 6. Simplificação de adjetivos compostos
    {
      name: "Simplificação de adjetivos",
      priority: 6,
      apply: (line: string) => {
        return line
          .replace(/\bmais\s+nobre\b/gi, "nobre")
          .replace(/\bmais\s+belo\b/gi, "belo")
          .replace(/\bmais\s+forte\b/gi, "forte")
          .replace(/\bmuito\s+/gi, "")
          .replace(/\bbem\s+/gi, "")
      },
    },

    // 7. Remoção de palavras de ligação
    {
      name: "Remoção de palavras de ligação",
      priority: 7,
      apply: (line: string) => {
        return line
          .replace(/\be\s+/gi, "")
          .replace(/\bmas\s+/gi, "")
          .replace(/\bque\s+/gi, "")
      },
    },
  ]

  /**
   * Reduz um verso para exatamente 11 sílabas poéticas
   */
  public reduceToMaxSyllables(line: string): {
    correctedLine: string
    syllableCount: number
    techniquesApplied: string[]
    success: boolean
  } {
    let currentLine = line.trim()
    let currentCount = countPoeticSyllables(currentLine)
    const techniquesApplied: string[] = []

    console.log(`[UltraAggressiveReducer] 🎯 Iniciando redução: "${currentLine}" (${currentCount} sílabas)`)

    // Se já está correto, retorna
    if (currentCount <= this.MAX_SYLLABLES) {
      console.log(`[UltraAggressiveReducer] ✅ Já está correto!`)
      return {
        correctedLine: currentLine,
        syllableCount: currentCount,
        techniquesApplied: [],
        success: true,
      }
    }

    // Aplica técnicas em ordem de prioridade até atingir 11 sílabas
    let attempts = 0
    const sortedTechniques = [...this.techniques].sort((a, b) => a.priority - b.priority)

    while (currentCount > this.MAX_SYLLABLES && attempts < this.MAX_ATTEMPTS) {
      attempts++
      let lineChanged = false

      for (const technique of sortedTechniques) {
        const beforeLine = currentLine
        const afterLine = technique.apply(currentLine)

        if (afterLine !== beforeLine) {
          const afterCount = countPoeticSyllables(afterLine)

          // Só aplica se reduziu sílabas e não ficou muito curto
          if (afterCount < currentCount && afterCount >= 9) {
            currentLine = afterLine
            currentCount = afterCount
            techniquesApplied.push(technique.name)
            lineChanged = true

            console.log(`[UltraAggressiveReducer] 🔧 ${technique.name}: "${currentLine}" (${currentCount} sílabas)`)

            // Se atingiu o objetivo, para
            if (currentCount <= this.MAX_SYLLABLES) {
              break
            }
          }
        }
      }

      // Se nenhuma técnica funcionou, para para evitar loop infinito
      if (!lineChanged) {
        console.log(`[UltraAggressiveReducer] ⚠️ Nenhuma técnica funcionou mais`)
        break
      }
    }

    const success = currentCount <= this.MAX_SYLLABLES

    if (success) {
      console.log(`[UltraAggressiveReducer] ✅ SUCESSO! "${currentLine}" (${currentCount} sílabas)`)
    } else {
      console.log(`[UltraAggressiveReducer] ❌ FALHOU! "${currentLine}" (${currentCount} sílabas)`)
    }

    return {
      correctedLine: currentLine,
      syllableCount: currentCount,
      techniquesApplied,
      success,
    }
  }

  /**
   * Corrige uma letra completa
   */
  public correctFullLyrics(lyrics: string): {
    correctedLyrics: string
    report: {
      totalVerses: number
      correctedVerses: number
      failedVerses: number
      successRate: number
    }
  } {
    const lines = lyrics.split("\n")
    const correctedLines: string[] = []
    let totalVerses = 0
    let correctedVerses = 0
    let failedVerses = 0

    for (const line of lines) {
      // Ignora linhas vazias e tags
      if (!line.trim() || line.trim().startsWith("[")) {
        correctedLines.push(line)
        continue
      }

      totalVerses++
      const result = this.reduceToMaxSyllables(line)

      if (result.success) {
        correctedVerses++
        correctedLines.push(result.correctedLine)
      } else {
        failedVerses++
        // Usa a versão mais reduzida mesmo que não seja perfeita
        correctedLines.push(result.correctedLine)
      }
    }

    const successRate = totalVerses > 0 ? (correctedVerses / totalVerses) * 100 : 0

    return {
      correctedLyrics: correctedLines.join("\n"),
      report: {
        totalVerses,
        correctedVerses,
        failedVerses,
        successRate,
      },
    }
  }
}

// Exporta instância singleton
export const ultraAggressiveSyllableReducer = new UltraAggressiveSyllableReducer()
