/**
 * CORRETOR AGRESSIVO DE ACENTUAÇÃO - ALFABETO BRASILEIRO COMPLETO
 * 
 * Corrige TODAS as palavras sem acentos corretos ANTES de qualquer validação.
 * Baseado nas regras oficiais de acentuação do português brasileiro.
 * VERSÃO OTIMIZADA - Evita falsos positivos e preserva integridade do texto
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
    láço: "laço",
    láco: "laço",
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
   * com proteção contra falsos positivos e preservação de integridade
   */
  static fix(text: string): {
    correctedText: string
    corrections: Array<{ original: string; corrected: string; count: number }>
  } {
    let correctedText = text
    const corrections: Array<{ original: string; corrected: string; count: number }> = []

    // Ordena por tamanho (maiores primeiro) para evitar substituições parciais
    const sortedCorrections = Object.entries(this.ACCENT_CORRECTIONS)
      .sort(([a], [b]) => b.length - a.length)

    for (const [wrong, correct] of sortedCorrections) {
      const regex = this.createSafeRegex(wrong)
      const matches = correctedText.match(regex)
      const count = matches ? matches.length : 0

      if (count > 0) {
        correctedText = correctedText.replace(regex, (match) => {
          // Preserva capitalização inteligente
          return this.preserveCapitalization(match, correct)
        })

        corrections.push({
          original: wrong,
          corrected: correct,
          count,
        })

        console.log(`[AccentFixer] 🔧 Corrigido: "${wrong}" → "${correct}" (${count}x)`)
      }
    }

    return { correctedText, corrections }
  }

  /**
   * Cria regex seguro com proteção contra falsos positivos
   */
  private static createSafeRegex(word: string): RegExp {
    const escapedWord = this.escapeRegex(word)
    
    // Para palavras muito curtas (2 caracteres ou menos), usa contexto mais restrito
    if (word.length <= 2) {
      return new RegExp(`(^|\\s)${escapedWord}(?=\\s|$|[.,!?;])`, "gi")
    }
    
    // Para palavras normais, usa limites de palavra
    return new RegExp(`\\b${escapedWord}\\b`, "gi")
  }

  /**
   * Preserva capitalização de forma inteligente
   */
  private static preserveCapitalization(original: string, corrected: string): string {
    if (original.charAt(0) === original.charAt(0).toUpperCase()) {
      // Primeira letra maiúscula
      return corrected.charAt(0).toUpperCase() + corrected.slice(1)
    }
    
    if (original === original.toUpperCase()) {
      // TODAS MAIÚSCULAS
      return corrected.toUpperCase()
    }
    
    if (original.charAt(0) === original.charAt(0).toLowerCase() && 
        original.slice(1) === original.slice(1).toUpperCase()) {
      // Estilo Título (só primeira minúscula? raro, mas trata)
      return corrected.charAt(0).toLowerCase() + corrected.slice(1).toUpperCase()
    }
    
    // Mantém original (minúsculas)
    return corrected
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
      const regex = this.createSafeRegex(wrong)
      const matches = text.match(regex)

      if (matches && matches.length > 0) {
        wordsWithoutAccents.push(...matches)
      }
    }

    const isValid = wordsWithoutAccents.length === 0
    
    if (!isValid) {
      console.warn(`[AccentFixer] ⚠️ Palavras sem acento detectadas:`, wordsWithoutAccents)
    }

    return {
      isValid,
      wordsWithoutAccents: [...new Set(wordsWithoutAccents)], // Remove duplicatas
    }
  }

  /**
   * Teste unitário interno para verificar funcionamento
   */
  static test(): void {
    const testCases = [
      { input: "nãmora", expected: "nãmora" }, // Não corrige (palavra incompleta)
      { input: "nã posso", expected: "não posso" }, // Corrige "nã" isolado
      { input: "voce nao sabe", expected: "você não sabe" }, // Corrige múltiplas
      { input: "cafe com acucar", expected: "café com açúcar" }, // Corrige cedilha
      { input: "Voce Nao Sabe", expected: "Você Não Sabe" }, // Preserva maiúsculas
      { input: "VOCE NAO SABE", expected: "VOCÊ NÃO SABE" }, // Preserva todas maiúsculas
      { input: "o voo", expected: "o voo" }, // Não corrige "vo" dentro de "voo"
    ]

    console.log(`[AccentFixer] 🧪 Executando testes...`)
    
    let passed = 0
    testCases.forEach((testCase, index) => {
      const result = this.fix(testCase.input)
      const success = result.correctedText === testCase.expected
      
      if (success) {
        passed++
        console.log(`[AccentFixer] ✅ Teste ${index + 1}: "${testCase.input}" → "${result.correctedText}"`)
      } else {
        console.log(`[AccentFixer] ❌ Teste ${index + 1}: "${testCase.input}" → "${result.correctedText}" (esperado: "${testCase.expected}")`)
      }
    })

    console.log(`[AccentFixer] 📊 Resultado: ${passed}/${testCases.length} testes aprovados`)
  }
}

// Executa teste automático ao carregar (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  AggressiveAccentFixer.test()
}
