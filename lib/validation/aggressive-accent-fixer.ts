/**
 * CORRETOR AGRESSIVO DE ACENTUAÇÃO - ALFABETO BRASILEIRO COMPLETO
 *
 * Corrige TODAS as palavras sem acentos corretos ANTES de qualquer validação.
 * Baseado nas regras oficiais de acentuação do português brasileiro.
 */

export class AggressiveAccentFixer {
  private static readonly ACCENT_CORRECTIONS: Record<string, string> = {
    // MONOSSÍLABOS TÔNICOS (terminados em -a(s), -e(s), -o(s))
    nao: "não",
    nã: "não",
    la: "lá",
    ca: "cá",
    ja: "já",
    pa: "pá",
    pe: "pé",
    fe: "fé",
    po: "pó",
    so: "só",
    vo: "vó",

    // OXÍTONAS (última sílaba tônica)
    voce: "você",
    cafe: "café",
    ate: "até",
    apos: "após",
    atras: "atrás",
    tambem: "também",
    alem: "além",
    ninguem: "ninguém",
    alguem: "alguém",
    porem: "porém",
    parabens: "parabéns",
    refens: "reféns",
    armazem: "armazém",
    vintém: "vintém",
    refem: "refém",
    bebe: "bebê",
    mante: "mantê",
    avo: "avó",
    vovo: "vovó",
    bisavo: "bisavó",

    // PAROXÍTONAS (penúltima sílaba tônica)
    facil: "fácil",
    dificil: "difícil",
    movel: "móvel",
    util: "útil",
    fragil: "frágil",
    esteril: "estéril",
    fertil: "fértil",
    volatil: "volátil",
    acucar: "açúcar",
    carater: "caráter",
    cancer: "câncer",
    juri: "júri",
    tenis: "tênis",
    lapis: "lápis",
    gratis: "grátis",
    bonus: "bônus",
    virus: "vírus",
    orfao: "órfão",
    orgao: "órgão",
    bencao: "bênção",
    irmao: "irmão",
    irma: "irmã",
    maos: "mãos",
    paes: "pães",
    caes: "cães",
    mae: "mãe",
    mao: "mão",
    alemao: "alemão",
    alema: "alemã",
    cidadao: "cidadão",
    cidada: "cidadã",
    cristao: "cristão",
    crista: "cristã",

    // PROPAROXÍTONAS (antepenúltima sílaba tônica - TODAS são acentuadas)
    musica: "música",
    lampada: "lâmpada",
    arvore: "árvore",
    numero: "número",
    ultimo: "último",
    proximo: "próximo",
    maximo: "máximo",
    minimo: "mínimo",
    otimo: "ótimo",
    pessimo: "péssimo",
    rapido: "rápido",
    liquido: "líquido",
    solido: "sólido",
    publico: "público",
    pratico: "prático",
    teorico: "teórico",
    historico: "histórico",
    geografico: "geográfico",
    matematica: "matemática",
    fisica: "física",
    quimica: "química",
    biologica: "biológica",
    economico: "econômico",
    politico: "político",
    juridico: "jurídico",
    medico: "médico",
    tecnico: "técnico",
    eletrico: "elétrico",
    mecanico: "mecânico",
    organico: "orgânico",
    inorganico: "inorgânico",

    // PALAVRAS COM CEDILHA (ç)
    seguranca: "segurança",
    seguranç: "segurança",
    segurançaa: "segurança",
    esperanca: "esperança",
    esperanç: "esperança",
    lembranca: "lembrança",
    mudanca: "mudança",
    crianca: "criança",
    danca: "dança",
    heranca: "herança",
    heranç: "herança",
    alianca: "aliança",
    balanca: "balança",
    confianca: "confiança",
    raca: "raça",
    raç: "raça",
    raçaa: "raça",
    racaa: "raça",
    graca: "graça",
    praca: "praça",
    cacador: "caçador",
    cacada: "caçada",
    laco: "laço",
    laç: "laço",
    braco: "braço",
    abraco: "abraço",
    pedaco: "pedaço",

    // PALAVRAS COM TIL (~) - NASALIDADE
    coracao: "coração",
    coraçao: "coração",
    emocao: "emoção",
    emoçao: "emoção",
    solidao: "solidão",
    paixao: "paixão",
    ilusao: "ilusão",
    cancao: "canção",
    cançao: "canção",
    razao: "razão",
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
    conclusao: "conclusão",
    decisao: "decisão",
    precisao: "precisão",
    divisao: "divisão",
    visao: "visão",
    revisao: "revisão",
    televisao: "televisão",

    // VERBOS NO FUTURO (terminados em -ão)
    sao: "são",
    vao: "vão",
    dao: "dão",
    estao: "estão",
    serao: "serão",
    terao: "terão",
    poderao: "poderão",
    deverao: "deverão",
    quererao: "quererão",
    saberao: "saberão",
    irao: "irão",
    virao: "virão",
    darao: "darão",
    estarao: "estarão",
    farao: "farão",
    dirao: "dirão",
    trarao: "trarão",
    verao: "verão",
    lerao: "lerão",
    crerao: "crerão",

    // PALAVRAS COMUNS EM LETRAS MUSICAIS
    esta: "está",
    sera: "será",
    estara: "estará",
    tera: "terá",
    fara: "fará",
    dira: "dirá",
    dara: "dará",
    ira: "irá",
    vira: "virá",
    vera: "verá",
    lera: "lerá",
    crera: "crerá",
    podera: "poderá",
    devera: "deverá",
    querer: "quererá",
    sabera: "saberá",
    trara: "trará",
    havera: "haverá",
    comeca: "começa",
    comecara: "começará",
    esqueca: "esqueça",
    esquecera: "esquecerá",
    conheca: "conheça",
    conhecera: "conhecerá",
    apareca: "apareça",
    aparecera: "aparecerá",
    mereca: "mereça",
    merecera: "merecerá",
    permaneca: "permaneça",
    permanecera: "permanecerá",
    pertenca: "pertença",
    pertencera: "pertencerá",
    aconteca: "aconteça",
    acontecera: "acontecerá",
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
      // Cria regex que encontra a palavra errada com limites de palavra que funcionam com português
      // Usa negative lookahead/lookbehind para garantir que não está no meio de outra palavra
      const regex = new RegExp(
        `(?<![a-záàâãéêíóôõúüçA-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ])${this.escapeRegex(wrong)}(?![a-záàâãéêíóôõúüçA-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ])`,
        "g",
      )

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
      const regex = new RegExp(
        `(?<![a-záàâãéêíóôõúüçA-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ])${this.escapeRegex(wrong)}(?![a-záàâãéêíóôõúüçA-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ])`,
        "g",
      )
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
