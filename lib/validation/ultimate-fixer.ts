import { countPoeticSyllables } from "./syllable-counter"

/**
 * Ultimate Fixer - Corretor Único e Definitivo
 *
 * Aplica TODAS as correções necessárias em ordem específica
 * baseado no processo manual de correção que funciona 100%
 */
export class UltimateFixer {
  /**
   * Corrige uma linha completamente aplicando todas as técnicas
   */
  static fixLine(line: string): string {
    console.log("[v0] 🔧 UltimateFixer: Corrigindo linha:", line)

    let fixed = line

    // ETAPA 1: Normalizar espaços ANTES de qualquer correção
    fixed = this.normalizeSpaces(fixed)
    console.log("[v0] Após normalização inicial:", fixed)

    // ETAPA 2: Corrigir "Não o o o" → "Não"
    fixed = this.fixNaoWithExtraOs(fixed)
    console.log("[v0] Após correção de 'Não o o o':", fixed)

    // ETAPA 3: Corrigir "nã " → "não "
    fixed = this.fixIncompleteNao(fixed)
    console.log("[v0] Após correção de 'nã':", fixed)

    // ETAPA 4: Completar palavras cortadas
    fixed = this.fixCutWords(fixed)
    console.log("[v0] Após completar palavras cortadas:", fixed)

    // ETAPA 5: Corrigir acentuação
    fixed = this.fixAccents(fixed)
    console.log("[v0] Após correção de acentos:", fixed)

    // ETAPA 6: Corrigir plurais
    fixed = this.fixPlurals(fixed)
    console.log("[v0] Após correção de plurais:", fixed)

    // ETAPA 7: Normalizar espaços DEPOIS de todas as correções
    fixed = this.normalizeSpaces(fixed)
    console.log("[v0] Após normalização final:", fixed)

    // ETAPA 8: Ajustar para 11 sílabas
    fixed = this.adjustTo11Syllables(fixed)
    console.log("[v0] Após ajuste de sílabas:", fixed)

    console.log("[v0] ✅ Linha corrigida final:", fixed)
    return fixed
  }

  /**
   * ETAPA 1 e 7: Normalizar espaços
   */
  private static normalizeSpaces(text: string): string {
    return (
      text
        // Remover espaços no início e fim
        .trim()
        // Remover espaços duplicados/triplicados/etc
        .replace(/\s{2,}/g, " ")
        // Normalizar espaços antes de pontuação
        .replace(/\s+([,.:;!?])/g, "$1")
        // Garantir espaço após pontuação
        .replace(/([,.:;!?])([^\s])/g, "$1 $2")
    )
  }

  /**
   * ETAPA 2: Corrigir "Não o o o" → "Não"
   */
  private static fixNaoWithExtraOs(text: string): string {
    // Detectar "Não" ou "não" seguido de múltiplos "o" com espaços
    return text.replace(/\b([Nn]ão)\s+(?:o\s+)+/gi, "$1 ")
  }

  /**
   * ETAPA 3: Corrigir "nã " → "não "
   */
  private static fixIncompleteNao(text: string): string {
    return text.replace(/\bnã\s+/gi, "não ")
  }

  /**
   * ETAPA 4: Completar palavras cortadas
   */
  private static fixCutWords(text: string): string {
    const cutWordPatterns: Record<string, string> = {
      // Palavras terminadas em "ç" sem "a"
      esperanç: "esperança",
      heranç: "herança",
      confiançç: "confiança",
      lembrançç: "lembrança",
      mudançç: "mudança",
      criançç: "criança",
      // Palavras terminadas em "ã" sem "o"
      mã: "mão",
      irmã: "irmão",
      pã: "pão",
      cã: "cão",
      // Outras palavras comuns cortadas
      coraçã: "coração",
      soluçã: "solução",
      emoçã: "emoção",
    }

    let fixed = text
    for (const [cut, complete] of Object.entries(cutWordPatterns)) {
      const regex = new RegExp(`\\b${cut}\\b`, "gi")
      fixed = fixed.replace(regex, complete)
    }

    return fixed
  }

  /**
   * ETAPA 5: Corrigir acentuação
   */
  private static fixAccents(text: string): string {
    const accentFixes: Record<string, string> = {
      láço: "laço",
      pára: "para",
      pélo: "pelo",
      pólo: "polo",
    }

    let fixed = text
    for (const [wrong, correct] of Object.entries(accentFixes)) {
      const regex = new RegExp(`\\b${wrong}\\b`, "gi")
      fixed = fixed.replace(regex, correct)
    }

    return fixed
  }

  /**
   * ETAPA 6: Corrigir plurais
   */
  private static fixPlurals(text: string): string {
    // Detectar "os/as" + substantivo singular e corrigir
    const pluralPatterns: Record<string, string> = {
      "os dedo": "os dedos",
      "as mão": "as mãos",
      "os olho": "os olhos",
      "as perna": "as pernas",
    }

    let fixed = text
    for (const [wrong, correct] of Object.entries(pluralPatterns)) {
      const regex = new RegExp(wrong, "gi")
      fixed = fixed.replace(regex, correct)
    }

    return fixed
  }

  /**
   * ETAPA 8: Ajustar para 11 sílabas
   */
  private static adjustTo11Syllables(line: string): string {
    const syllables = countPoeticSyllables(line)
    console.log("[v0] Sílabas atuais:", syllables)

    if (syllables === 11) {
      return line
    }

    if (syllables > 11) {
      // Reduzir sílabas
      return this.reduceSyllables(line, syllables - 11)
    } else {
      // Adicionar sílabas
      return this.addSyllables(line, 11 - syllables)
    }
  }

  /**
   * Reduzir sílabas removendo palavras desnecessárias
   */
  private static reduceSyllables(line: string, toRemove: number): string {
    console.log("[v0] Reduzindo", toRemove, "sílabas de:", line)

    // Lista de palavras para remover em ordem de prioridade
    const wordsToRemove = [
      // Artigos
      { word: "o ", syllables: 1 },
      { word: "a ", syllables: 1 },
      { word: "um ", syllables: 1 },
      { word: "uma ", syllables: 2 },
      { word: "os ", syllables: 1 },
      { word: "as ", syllables: 1 },
      // Preposições
      { word: "de ", syllables: 1 },
      { word: "da ", syllables: 1 },
      { word: "do ", syllables: 1 },
      { word: "em ", syllables: 1 },
      { word: "na ", syllables: 1 },
      { word: "no ", syllables: 1 },
      // Advérbios
      { word: "muito ", syllables: 2 },
      { word: "mais ", syllables: 1 },
      { word: "bem ", syllables: 1 },
      { word: "já ", syllables: 1 },
    ]

    let reduced = line
    let removed = 0

    for (const { word, syllables } of wordsToRemove) {
      if (removed >= toRemove) break

      if (reduced.includes(word)) {
        reduced = reduced.replace(word, "")
        removed += syllables
        console.log("[v0] Removeu:", word, "| Sílabas removidas:", syllables)
      }
    }

    // Normalizar espaços após remoção
    reduced = this.normalizeSpaces(reduced)

    const newSyllables = countPoeticSyllables(reduced)
    console.log("[v0] Sílabas após redução:", newSyllables)

    return reduced
  }

  /**
   * Adicionar sílabas inserindo palavras curtas
   */
  private static addSyllables(line: string, toAdd: number): string {
    console.log("[v0] Adicionando", toAdd, "sílabas a:", line)

    // Lista de palavras para adicionar
    const wordsToAdd = [
      { word: "meu ", syllables: 1, position: "before_noun" },
      { word: "bem ", syllables: 1, position: "before_adjective" },
      { word: "já ", syllables: 1, position: "before_verb" },
    ]

    let added = line
    let addedCount = 0

    // Por enquanto, adicionar "meu" antes de substantivos comuns
    if (toAdd >= 1 && !added.includes("meu ")) {
      // Detectar substantivos comuns e adicionar "meu"
      const nouns = ["lar", "casa", "vida", "amor", "coração"]
      for (const noun of nouns) {
        if (added.includes(noun) && !added.includes(`meu ${noun}`)) {
          added = added.replace(noun, `meu ${noun}`)
          addedCount += 1
          console.log("[v0] Adicionou: meu antes de", noun)
          break
        }
      }
    }

    const newSyllables = countPoeticSyllables(added)
    console.log("[v0] Sílabas após adição:", newSyllables)

    return added
  }

  /**
   * Corrige letra completa aplicando fixLine em cada verso
   */
  static fixFullLyrics(lyrics: string): string {
    console.log("[v0] ═══════════════════════════════════════════════════════")
    console.log("[v0] 🔧 UltimateFixer.fixFullLyrics - INÍCIO")
    console.log("[v0] ═══════════════════════════════════════════════════════")
    console.log("[v0] 📊 Lyrics length:", lyrics.length)
    console.log("[v0] 📊 Primeiros 200 caracteres:", lyrics.substring(0, 200))
    console.log("[v0] 📊 Número de linhas:", lyrics.split("\n").length)

    const lines = lyrics.split("\n")
    const fixedLines = lines.map((line, index) => {
      // Não corrigir linhas vazias ou tags de seção
      if (!line.trim() || line.startsWith("[")) {
        return line
      }

      console.log(`[v0] Corrigindo linha ${index + 1}/${lines.length}`)
      return this.fixLine(line)
    })

    const fixed = fixedLines.join("\n")
    console.log("[v0] ✅ Letra completa corrigida")

    return fixed
  }
}
