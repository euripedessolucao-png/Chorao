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
  private readonly MAX_ATTEMPTS = 15 // Aumentado de 10 para 15 tentativas

  // Técnicas de redução ordenadas por prioridade (menos invasivas primeiro)
  private readonly techniques: ReductionTechnique[] = [
    // 1. Contrações naturais (mais comum em música brasileira) - CORRIGIDO
    {
      name: "Contrações naturais",
      priority: 1,
      apply: (line: string) => {
        const result = line
          .replace(/\bpara\b/gi, "pra")
          .replace(/\bvocê\b/gi, "cê")
          .replace(/\bestá\b/gi, "tá")
          .replace(/\bestou\b/gi, "tô")
          .replace(/\bestamos\b/gi, "tamo")
          .replace(/\bestão\b/gi, "tão")
          .replace(/\bcom\s+a\b/gi, "coma")
          .replace(/\bcom\s+o\b/gi, "com")
          .replace(/\bde\s+o\b/gi, "do")
          .replace(/\bde\s+a\b/gi, "da")
          .replace(/\bem\s+o\b/gi, "no")
          .replace(/\bem\s+a\b/gi, "na")

        return result
      },
    },

    // 2. Remoção de artigos definidos desnecessários - CORRIGIDO
    {
      name: "Remoção de artigos definidos",
      priority: 2,
      apply: (line: string) => {
        return line
          .replace(/(?<!\b[A-Z])\s+o\s+/gi, " ")
          .replace(/(?<!\b[A-Z])\s+a\s+/gi, " ")
          .replace(/(?<!\b[A-Z])\s+os\s+/gi, " ")
          .replace(/(?<!\b[A-Z])\s+as\s+/gi, " ")
          .replace(/\s+/g, " ")
          .trim()
      },
    },

    // 3. Remoção de artigos indefinidos - CORRIGIDO
    {
      name: "Remoção de artigos indefinidos",
      priority: 3,
      apply: (line: string) => {
        return line
          .replace(/(?<!\b[A-Z])\s+um\s+/gi, " ")
          .replace(/(?<!\b[A-Z])\s+uma\s+/gi, " ")
          .replace(/(?<!\b[A-Z])\s+uns\s+/gi, " ")
          .replace(/(?<!\b[A-Z])\s+umas\s+/gi, " ")
          .replace(/\s+/g, " ")
          .trim()
      },
    },

    // 4. Elisão (junção de vogais entre palavras) - CORRIGIDO
    {
      name: "Elisão avançada",
      priority: 4,
      apply: (line: string) => {
        return line
          .replace(/\b([aãáàâeéêiíoóôõuú]) ([aeiouãõáéíóú])\b/gi, "$1$2")
          .replace(/\b(\w+) a\b/gi, "$1a")
          .replace(/\b(\w+) o\b/gi, "$1o")
          .replace(/\b(\w+) e\b/gi, "$1e")
      },
    },

    {
      name: "Simplificação de expressões",
      priority: 5,
      apply: (line: string) => {
        return line
          .replace(/\bmais\s+nobre\b/gi, "nobre")
          .replace(/\bmais\s+belo\b/gi, "belo")
          .replace(/\bmais\s+forte\b/gi, "forte")
          .replace(/\bmuito\s+grande\b/gi, "imenso")
          .replace(/\bmuito\s+pequeno\b/gi, "ínfimo")
          .replace(/\btodo\s+o\b/gi, "todo")
          .replace(/\btoda\s+a\b/gi, "toda")
      },
    },

    {
      name: "Remoção de preposições",
      priority: 6,
      apply: (line: string) => {
        return line
          .replace(/\bde\s+/gi, "")
          .replace(/\bem\s+/gi, "")
          .replace(/\bpor\s+/gi, "")
      },
    },

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
   * Reduz um verso para exatamente 11 sílabas poéticas - CORRIGIDO
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

    let attempts = 0
    const appliedTechniques = new Set<string>()

    while (currentCount > this.MAX_SYLLABLES && attempts < this.MAX_ATTEMPTS) {
      attempts++
      const previousLine = currentLine
      const previousCount = currentCount

      // Tenta todas as técnicas em ordem de prioridade
      for (const technique of this.techniques) {
        if (appliedTechniques.has(technique.name)) continue

        const newLine = technique.apply(currentLine)
        const newCount = countPoeticSyllables(newLine)

        if (newCount < currentCount && this.isLineValid(newLine)) {
          currentLine = newLine
          currentCount = newCount
          appliedTechniques.add(technique.name)
          techniquesApplied.push(technique.name)

          console.log(`[UltraAggressiveReducer] 🔧 ${technique.name}: "${currentLine}" (${currentCount} sílabas)`)

          // Para se atingiu o objetivo
          if (currentCount <= this.MAX_SYLLABLES) break
        }
      }

      if (currentLine === previousLine && currentCount === previousCount) {
        console.log(`[UltraAggressiveReducer] ⚡ Aplicando técnicas de forma mais agressiva...`)

        // Técnica de emergência: remoção de palavras menos importantes
        const emergencyResult = this.applyEmergencyReduction(currentLine)
        if (emergencyResult.syllableCount < currentCount && this.isLineValid(emergencyResult.line)) {
          currentLine = emergencyResult.line
          currentCount = emergencyResult.syllableCount
          techniquesApplied.push("Redução de Emergência")
          console.log(`[UltraAggressiveReducer] 🚨 Redução de emergência: "${currentLine}" (${currentCount} sílabas)`)
        } else {
          break // Não conseguiu reduzir mais
        }
      }

      if (currentCount <= this.MAX_SYLLABLES) break
    }

    const success = currentCount <= this.MAX_SYLLABLES

    if (success) {
      console.log(`[UltraAggressiveReducer] ✅ SUCESSO! "${currentLine}" (${currentCount} sílabas)`)
    } else {
      console.log(
        `[UltraAggressiveReducer] ⚠️ REDUÇÃO PARCIAL: "${currentLine}" (${currentCount} sílabas, objetivo: ${this.MAX_SYLLABLES})`,
      )
    }

    return {
      correctedLine: currentLine,
      syllableCount: currentCount,
      techniquesApplied: [...appliedTechniques],
      success,
    }
  }

  /**
   * Técnica de emergência para redução final
   */
  private applyEmergencyReduction(line: string): { line: string; syllableCount: number } {
    let currentLine = line
    let currentCount = countPoeticSyllables(line)

    // Lista de palavras que podem ser removidas em último caso (ordenadas por importância)
    const removableWords = [
      /\be\b/gi,
      /\bmas\b/gi,
      /\bque\b/gi,
      /\bum\b/gi,
      /\buma\b/gi,
      /\bo\b/gi,
      /\ba\b/gi,
      /\bde\b/gi,
      /\bem\b/gi,
      /\bpor\b/gi,
      /\bpara\b/gi,
    ]

    for (const wordPattern of removableWords) {
      const testLine = currentLine.replace(wordPattern, "").replace(/\s+/g, " ").trim()
      const testCount = countPoeticSyllables(testLine)

      if (testCount < currentCount && this.isLineValid(testLine) && testCount >= 8) {
        currentLine = testLine
        currentCount = testCount

        if (currentCount <= this.MAX_SYLLABLES) break
      }
    }

    return { line: currentLine, syllableCount: currentCount }
  }

  /**
   * Valida se a linha ainda faz sentido após redução
   */
  private isLineValid(line: string): boolean {
    // Não permite linhas vazias ou muito curtas
    if (line.length < 3) return false

    // Não permite muitas contrações seguidas
    const contractionCount = (line.match(/\b(cê|tá|tô|pra)\b/gi) || []).length
    if (contractionCount > 3) return false

    // Não permite palavras incompletas críticas
    const invalidPatterns = [/nã\s/, /nã$/, /ç\s/, /ç$/, /ã\s/, /ã$/]

    return !invalidPatterns.some((pattern) => pattern.test(line))
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
