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
    if (!line || typeof line !== "string") {
      console.warn("[v0] ⚠️ UltimateFixer: Linha inválida recebida:", line)
      return line || ""
    }

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
    if (!text || typeof text !== "string") {
      return text || ""
    }

    return text
      .trim()
      .replace(/\s{2,}/g, " ")
      .replace(/\s+([,.:;!?])/g, "$1")
      .replace(/([,.:;!?])([^\s])/g, "$1 $2")
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
   * Reduzir sílabas usando substituições inteligentes
   */
  private static reduceSyllables(line: string, toRemove: number): string {
    console.log("[v0] Reduzindo", toRemove, "sílabas de:", line)

    let reduced = line

    // Dicionário de substituições: frase longa → frase curta (mantém sentido)
    const smartReplacements: Array<{ from: string; to: string; syllablesSaved: number }> = [
      // Expressões comuns longas → curtas
      { from: "a vida é uma guerra", to: "a vida é guerra", syllablesSaved: 2 },
      { from: "era livre, eu sou raiz", to: "eu voava livre", syllablesSaved: 3 },
      { from: "promessas vazias", to: "falsas promessas", syllablesSaved: 1 },
      { from: "noites frias", to: "noite fria", syllablesSaved: 1 },
      { from: "a falsa ilusão", to: "falsa ilusão", syllablesSaved: 1 },
      { from: "clama por redenção", to: "pede perdão", syllablesSaved: 2 },
      { from: "mas não sei pra onde ir", to: "sem direção", syllablesSaved: 4 },
      { from: "mas não posso sair", to: "preso aqui", syllablesSaved: 3 },
      { from: "mas o laço me prendeu", to: "me prendeu", syllablesSaved: 3 },
      { from: "escorre entre as mãos", to: "escapa das mãos", syllablesSaved: 1 },
      { from: "fugindo dos aflições", to: "fugindo da dor", syllablesSaved: 2 },
      { from: "só quer libertar", to: "quer fugir", syllablesSaved: 2 },
      { from: "que chamo de lar", to: "meu lar", syllablesSaved: 2 },
      { from: "dessa falsa proteção", to: "dessa prisão", syllablesSaved: 3 },
      { from: "e volto à minha raiz", to: "volto à raiz", syllablesSaved: 2 },
      { from: "dinheiro", to: "grana", syllablesSaved: 1 },
      { from: "esperança", to: "fé", syllablesSaved: 3 },
      { from: "liberdade", to: "ser livre", syllablesSaved: 1 },
      { from: "remédios", to: "drogas", syllablesSaved: 1 },
      { from: "aflições", to: "dor", syllablesSaved: 2 },
      { from: "proteção", to: "prisão", syllablesSaved: 1 },
      { from: "redenção", to: "perdão", syllablesSaved: 1 },
      { from: " a ", to: " ", syllablesSaved: 1 },
      { from: " o ", to: " ", syllablesSaved: 1 },
      { from: " uma ", to: " ", syllablesSaved: 2 },
      { from: " um ", to: " ", syllablesSaved: 1 },
    ]

    let removed = 0

    // Aplicar substituições inteligentes primeiro (mais efetivo)
    for (const { from, to, syllablesSaved } of smartReplacements) {
      if (removed >= toRemove) break

      if (reduced.toLowerCase().includes(from.toLowerCase())) {
        // Fazer substituição case-insensitive mas preservando capitalização
        const regex = new RegExp(from, "gi")
        reduced = reduced.replace(regex, to)
        removed += syllablesSaved
        console.log("[v0] Substituiu:", from, "→", to, "| Sílabas economizadas:", syllablesSaved)
      }
    }

    // Normalizar espaços após remoção
    reduced = this.normalizeSpaces(reduced)

    const newSyllables = countPoeticSyllables(reduced)
    console.log("[v0] Sílabas após redução:", newSyllables, "| Meta: 11 | Removidas:", removed)

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
