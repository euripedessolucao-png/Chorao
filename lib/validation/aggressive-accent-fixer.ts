/**
 * CORRETOR AGRESSIVO DE ACENTUAÇÃO
 *
 * Corrige TODAS as palavras sem acentos corretos ANTES de qualquer validação.
 * Este é o LOCAL DO PROBLEMA - a IA gera palavras sem acento e precisamos corrigir IMEDIATAMENTE.
 */

export class AggressiveAccentFixer {
  // Dicionário completo de palavras que SEMPRE precisam de acentos
  private static readonly ACCENT_CORRECTIONS: Record<string, string> = {
    // Palavras mais comuns que aparecem sem acento
    nao: "não",
    nã: "não",
    seguranca: "segurança",
    seguranç: "segurança",
    esperanca: "esperança",
    esperanç: "esperança",
    heranca: "herança",
    heranç: "herança",
    raca: "raça",
    raç: "raça",
    laco: "laço",
    laç: "laço",
    voce: "você",
    esta: "está",
    la: "lá",
    ca: "cá",
    so: "só",
    ate: "até",
    cafe: "café",
    pe: "pé",
    fe: "fé",
    avo: "avó",
    vovo: "vovó",
    coracao: "coração",
    coraçao: "coração",
    emocao: "emoção",
    emoçao: "emoção",
    solidao: "solidão",
    solidão: "solidão",
    paixao: "paixão",
    paixão: "paixão",
    ilusao: "ilusão",
    ilusão: "ilusão",
    cancao: "canção",
    cançao: "canção",
    razao: "razão",
    razão: "razão",
    licao: "lição",
    liçao: "lição",
    opcao: "opção",
    opçao: "opção",
    atencao: "atenção",
    atençao: "atenção",
    intencao: "intenção",
    intençao: "intenção",
    direcao: "direção",
    direçao: "direção",
    protecao: "proteção",
    proteçao: "proteção",
    tradicao: "tradição",
    tradiçao: "tradição",
    revolucao: "revolução",
    revoluçao: "revolução",
    solucao: "solução",
    soluçao: "solução",
    confusao: "confusão",
    confusão: "confusão",
    conclusao: "conclusão",
    conclusão: "conclusão",
    mae: "mãe",
    mao: "mão",
    irmao: "irmão",
    irmã: "irmã",
    alemao: "alemão",
    alemã: "alemã",
    cidadao: "cidadão",
    cidadã: "cidadã",
    orgao: "órgão",
    orgão: "órgão",
    sao: "são",
    vao: "vão",
    dao: "dão",
    estao: "estão",
    serao: "serão",
    farao: "farão",
    terao: "terão",
    poderao: "poderão",
    deverao: "deverão",
    quererao: "quererão",
    saberao: "saberão",
    irao: "irão",
    virao: "virão",
    darao: "darão",
    estarao: "estarão",
  }

  /**
   * Corrige AGRESSIVAMENTE todas as palavras sem acentos
   */
  static fix(text: string): {
    correctedText: string
    corrections: Array<{ original: string; corrected: string; count: number }>
  } {
    let correctedText = text
    const corrections: Array<{ original: string; corrected: string; count: number }> = []

    // Para cada palavra no dicionário, substitui TODAS as ocorrências
    for (const [wrong, correct] of Object.entries(this.ACCENT_CORRECTIONS)) {
      // Cria regex que encontra a palavra errada como palavra completa (não parte de outra palavra)
      const regex = new RegExp(`\\b${this.escapeRegex(wrong)}\\b`, "gi")

      // Conta quantas vezes a palavra aparece
      const matches = correctedText.match(regex)
      const count = matches ? matches.length : 0

      if (count > 0) {
        // Substitui todas as ocorrências
        correctedText = correctedText.replace(regex, correct)

        corrections.push({
          original: wrong,
          corrected: correct,
          count,
        })
      }
    }

    return { correctedText, corrections }
  }

  /**
   * Escapa caracteres especiais de regex
   */
  private static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  }

  /**
   * Valida se o texto tem palavras sem acentos
   */
  static validate(text: string): { isValid: boolean; wordsWithoutAccents: string[] } {
    const wordsWithoutAccents: string[] = []

    for (const [wrong] of Object.entries(this.ACCENT_CORRECTIONS)) {
      const regex = new RegExp(`\\b${this.escapeRegex(wrong)}\\b`, "gi")
      const matches = text.match(regex)

      if (matches && matches.length > 0) {
        wordsWithoutAccents.push(wrong)
      }
    }

    return {
      isValid: wordsWithoutAccents.length === 0,
      wordsWithoutAccents,
    }
  }
}
