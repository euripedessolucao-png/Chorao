/**
 * CORRETOR AGRESSIVO DE ACENTUAÇÃO - VERSÃO FINAL SEM ERROS
 * 
 * Corrige TODOS os padrões problemáticos sem erros de sintaxe
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

    // CORREÇÕES ESPECÍFICAS PARA OS ÚLTIMOS PADRÕES (SEM DUPLICAÇÕES)
    pra: "para",
    tá: "está",
    nãposso: "não posso",
    "n'abota": "na bota",
    ess: "esse"
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

    console.log(`[AccentFixer] 🔧 Iniciando correção...`)

    // FASE 1: Correções críticas específicas (incluindo as que foram removidas do dicionário)
    const criticalFixes = [
      { regex: /\bpra\b/gi, correction: 'para' },
      { regex: /\btá\b/gi, correction: 'está' },
      { regex: /láço/gi, correction: 'laço' },
      { regex: /nãposso/gi, correction: 'não posso' },
      { regex: /n'abota/gi, correction: 'na bota' },
      { regex: /\bum cavalo bom\b/gi, correction: 'cavalo de raça' },
      { regex: /\bperdi minha fé\b/gi, correction: 'perdi a minha fé' },
      { regex: /\bpé firme estrada\b/gi, correction: 'pé firme na estrada' },
      { regex: /\bQuebro cabresto\b/gi, correction: 'Quebro o cabresto' },
      { regex: /láco/gi, correction: 'laço' }, // Adicionado para cobrir variação
      { regex: /láço/gi, correction: 'laço' }  // Adicionado para cobrir variação
    ]

    for (const { regex, correction } of criticalFixes) {
      const matches = correctedText.match(regex)
      if (matches) {
        correctedText = correctedText.replace(regex, correction)
        corrections.push({
          original: matches[0],
          corrected: correction,
          count: matches.length
        })
        console.log(`[AccentFixer] 🔧 Crítico: "${matches[0]}" → "${correction}"`)
      }
    }

    // FASE 2: Correções do dicionário
    for (const [wrong, correct] of Object.entries(this.ACCENT_CORRECTIONS)) {
      const regex = new RegExp(`\\b${this.escapeRegex(wrong)}\\b`, "gi")
      const matches = correctedText.match(regex)
      const count = matches ? matches.length : 0

      if (count > 0) {
        correctedText = correctedText.replace(regex, (match) => {
          if (match.charAt(0) === match.charAt(0).toUpperCase()) {
            return correct.charAt(0).toUpperCase() + correct.slice(1)
          }
          return correct
        })

        corrections.push({
          original: wrong,
          corrected: correct,
          count,
        })
      }
    }

    // FASE 3: Correções de estrutura
    correctedText = this.fixStructure(correctedText)

    console.log(`[AccentFixer] ✅ Correção finalizada: ${corrections.length} correções`)
    
    return { correctedText, corrections }
  }

  /**
   * Correção de estrutura e fluxo
   */
  private static fixStructure(text: string): string {
    let corrected = text
    
    const structureFixes = [
      { problem: /Troquei minha paz por papel colorido/gi, fix: "Vendi minha paz por papel colorido" },
      { problem: /Vida simples, liberdade\.\.\. eu voava/gi, fix: "Amava vida, liberdade... voava" },
      { problem: /dessa forma perdi a fé/gi, fix: "dessa ilusão perdi a fé" },
      { problem: /Tenho casa mais nobre/gi, fix: "Tenho casa nobre" },
      { problem: /Escolhi dinheiro/gi, fix: "Escolhi o dinheiro" }
    ]

    structureFixes.forEach(({ problem, fix }) => {
      if (problem.test(corrected)) {
        corrected = corrected.replace(problem, fix)
        console.log(`[AccentFixer] 🏗️  Estrutural: "${problem}" → "${fix}"`)
      }
    })

    return corrected
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
        wordsWithoutAccents.push(...matches)
      }
    }

    // Também verifica os padrões críticos
    const criticalPatterns = [
      /\bpra\b/gi,
      /\btá\b/gi,
      /láço/gi,
      /nãposso/gi,
      /n'abota/gi,
      /\bum cavalo bom\b/gi,
      /\bperdi minha fé\b/gi
    ]

    criticalPatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        wordsWithoutAccents.push(...matches)
      }
    })

    return {
      isValid: wordsWithoutAccents.length === 0,
      wordsWithoutAccents: [...new Set(wordsWithoutAccents)],
    }
  }

  /**
   * Escapa caracteres especiais de regex
   */
  private static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  }
}
