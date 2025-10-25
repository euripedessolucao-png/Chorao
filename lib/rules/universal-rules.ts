/**
 * SISTEMA UNIFICADO DE REGRAS UNIVERSAIS
 *
 * Este é o ÚNICO arquivo que define regras universais.
 * Todas as APIs e validadores devem importar daqui.
 *
 * HIERARQUIA DE PRIORIDADES:
 * 1. Requisitos Adicionais do Usuário (PRIORIDADE ABSOLUTA)
 * 2. Regras Universais (este arquivo)
 * 3. Regras Específicas do Gênero (genre-config.ts)
 * 4. Sugestões da IA (menor prioridade)
 */

export const UNIVERSAL_RULES = {
  /**
   * REGRA 1: LINGUAGEM SIMPLES E COLOQUIAL
   * Aplica-se a: TODAS as funções (criar, reescrever, refrão, hook)
   */
  language: {
    principle: "Palavras simples e coloquiais do dia-a-dia brasileiro, como um humano fala naturalmente",
    allowed: "Vocabulário cotidiano, gírias regionais apropriadas, expressões populares",
    forbidden: "Vocabulário rebuscado, poético formal, academicismo, arcaísmos",
    exception: "Requisitos Adicionais do usuário têm PRIORIDADE TOTAL sobre esta regra",
    examples: {
      good: ["cerveja", "boteco", "saudade", "coração", "estrada", "violão"],
      bad: ["efêmero", "sublime", "etéreo", "transcendental", "inefável"],
    },
  },

  /**
   * REGRA 2: LIMITE FISIOLÓGICO DE 12 SÍLABAS
   * Aplica-se a: TODAS as linhas de TODOS os gêneros
   */
  syllables: {
    principle: "Máximo de 12 sílabas por linha (limite fisiológico de um fôlego humano)",
    max_syllables: 12,
    combinations_allowed: ["6+6", "7+5", "5+7"],
    counting_rule: "Uma linha com vírgula (6+6, 7+5 ou 5+7) conta como 2 VERSOS na estrutura total",
    stacking_preference: "Empilhar versos em linhas separadas sempre que possível para facilitar contagem",
    exception: "Nenhuma - esta é uma regra fisiológica inviolável",
  },

  /**
   * REGRA 3: ANTI-FORÇAÇÃO
   * Aplica-se a: TODAS as funções
   */
  anti_forcing: {
    principle: "Evitar forçar palavras, rimas ou conceitos que não fluem naturalmente",
    forbidden_patterns: [
      "Rimas forçadas que quebram o sentido",
      "Palavras rebuscadas só para rimar",
      "Metáforas abstratas que não fazem sentido",
      "Inversões sintáticas artificiais",
      "Repetições excessivas sem propósito",
    ],
    validation: "Se uma linha parece artificial ou forçada, reescrever com naturalidade",
  },

  /**
   * REGRA 4: METÁFORAS RESPEITADAS
   * Aplica-se a: TODAS as funções
   */
  metaphors: {
    principle: "Metáforas especificadas nos Requisitos Adicionais devem ser respeitadas e inseridas",
    priority: "ABSOLUTA - sobrepõe qualquer outra regra de linguagem",
    implementation: "Inserir metáforas de forma natural no contexto da letra",
  },

  /**
   * REGRA 5: RIMAS RICAS (MÚSICA BRASILEIRA)
   * Aplica-se a: TODOS os gêneros, com variações por gênero
   */
  rhymes: {
    principle: "Rimas ricas (classes gramaticais diferentes) são preferidas na música brasileira",
    types: {
      rica: {
        definition: "Palavras de classes gramaticais diferentes (substantivo + verbo, adjetivo + substantivo)",
        examples: [
          "porteira (substantivo) / bananeira (substantivo mas contexto diferente)",
          "viola (substantivo) / sacola (substantivo mas campo semântico diferente)",
          "sertão (substantivo) / coração (substantivo mas abstrato vs concreto)",
        ],
        quality: "Alta qualidade poética",
      },
      pobre: {
        definition: "Palavras da mesma classe gramatical (substantivo + substantivo, verbo + verbo)",
        examples: ["amor / dor", "cantando / amando", "coração / paixão"],
        quality: "Aceitável mas menos interessante",
      },
      perfeita: {
        definition: "Sons idênticos da última vogal tônica até o final",
        examples: ["amor / flor", "cantar / amar"],
        quality: "Preferida",
      },
      toante: {
        definition: "Apenas vogais coincidem",
        examples: ["saltava / mata", "dia / vida"],
        quality: "Aceitável em alguns gêneros",
      },
      falsa: {
        definition: "Sons não coincidem adequadamente",
        examples: ["amor / calor (se pronunciado diferente)", "dia / alegria (se forçado)"],
        quality: "EVITAR - quebra a musicalidade",
      },
    },
    genre_requirements: {
      "Sertanejo Raiz": {
        min_rich_rhymes: 0.5, // 50%
        max_false_rhymes: 0, // 0%
        preferred_schemes: ["ABAB", "AABB"],
      },
      "Sertanejo Moderno": {
        min_rich_rhymes: 0.3, // 30%
        max_false_rhymes: 0.2, // 20% (aceita algumas rimas falsas)
        preferred_schemes: ["ABAB", "AABB", "ABCB"],
      },
      MPB: {
        min_rich_rhymes: 0.6, // 60%
        max_false_rhymes: 0, // 0%
        preferred_schemes: ["ABAB", "ABBA", "livre"],
      },
      Pagode: {
        min_rich_rhymes: 0.4, // 40%
        max_false_rhymes: 0.1, // 10%
        preferred_schemes: ["ABAB", "AABB"],
      },
      Samba: {
        min_rich_rhymes: 0.4, // 40%
        max_false_rhymes: 0.1, // 10%
        preferred_schemes: ["ABAB", "AABB"],
      },
      Funk: {
        min_rich_rhymes: 0.2, // 20% (mais flexível)
        max_false_rhymes: 0.3, // 30% (aceita mais rimas falsas)
        preferred_schemes: ["AABB", "AAAA"],
      },
      Gospel: {
        min_rich_rhymes: 0.4, // 40%
        max_false_rhymes: 0.1, // 10%
        preferred_schemes: ["ABAB", "AABB"],
      },
      Bachata: {
        min_rich_rhymes: 0.3, // 30%
        max_false_rhymes: 0.2, // 20%
        preferred_schemes: ["ABAB", "AABB"],
      },
      Arrocha: {
        min_rich_rhymes: 0.3, // 30%
        max_false_rhymes: 0.2, // 20%
        preferred_schemes: ["ABAB", "AABB"],
      },
      Forró: {
        min_rich_rhymes: 0.4, // 40%
        max_false_rhymes: 0.1, // 10%
        preferred_schemes: ["ABAB", "AABB"],
      },
    },
  },

  /**
   * REGRA 6: TERCEIRA VIA
   * Aplica-se a: TODAS as funções de geração
   */
  terceira_via: {
    principle: "Sistema de composição por restrições criativas - evita clichês desde o início",
    timing: "INÍCIO DA GERAÇÃO (no prompt) - NÃO pós-processamento",
    core_principles: [
      "Evite clichês abstratos: 'coração partido', 'lágrimas no travesseiro', 'noite sem luar'",
      "Use imagens concretas do cotidiano brasileiro: objetos, lugares, ações específicas",
      "Prefira o específico ao genérico: 'violão na varanda' > 'música na alma'",
      "Linguagem coloquial e natural: como um brasileiro fala no dia-a-dia",
      "Emoções através de ações concretas, não abstrações",
    ],
    examples: {
      bad: [
        "Meu coração está partido em mil pedaços",
        "Lágrimas molham meu travesseiro toda noite",
        "A noite sem luar reflete minha solidão",
        "Minha alma está vazia sem você",
      ],
      good: [
        "Seu copo ainda tá na mesa, cerveja esquecida",
        "Apaguei suas fotos mas não apaguei a saudade",
        "Violão na varanda, lembrando seu sorriso",
        "Boteco cheio mas eu tô sozinho aqui",
      ],
    },
    implementation: "Incluir princípios no prompt inicial, não aplicar linha por linha depois",
    reason: "Evita conflitos com validadores e processadores de finalização",
  },

  /**
   * REGRA 7: CAPITALIZAÇÃO PROFISSIONAL
   * Aplica-se a: TODAS as saídas
   */
  capitalization: {
    principle: "Primeira letra de cada linha em maiúscula, resto preservado",
    implementation: "Não forçar minúsculas no resto da linha - preservar nomes próprios e ênfases",
    exception: "Siglas e nomes próprios mantêm capitalização original",
  },

  /**
   * REGRA 8: FORMATO DE SAÍDA PARA IAs MUSICAIS
   * Aplica-se a: TODAS as saídas finais
   */
  output_format: {
    structure_markers: "Em INGLÊS (VERSE, CHORUS, BRIDGE, INTRO, OUTRO, HOOK)",
    lyrics: "Em PORTUGUÊS (cantada)",
    instruments: "Em INGLÊS, entre parênteses, após marcador de seção",
    example: "[VERSE 1] (Instrumental: acoustic guitar, drums, bass)\nLetra em português aqui...",
    reason: "Facilita IAs musicais interpretarem as configurações",
  },

  /**
   * REGRA 9: DURAÇÃO COMERCIAL
   * Aplica-se a: TODAS as composições completas
   */
  duration: {
    standard: "3:30 minutos (média comercial)",
    exception: "Sertanejo Moderno - estrutura 'chiclete' com repetições do refrão",
    structure_guide: {
      intro: "4-8 linhas",
      verse: "8-12 linhas",
      chorus: "4-8 linhas (repetir 2-3x na música)",
      bridge: "4-8 linhas",
      outro: "2-4 linhas",
    },
  },

  /**
   * REGRA 10: CONTEXTO INTEGRADO
   * Aplica-se a: Geradores de refrão e hook
   */
  context: {
    principle: "Refrão e hook devem usar contexto existente da letra e gênero",
    implementation: "Não pedir letra novamente - usar initialLyrics e initialGenre",
    chorus_first: "Quando refrão é selecionado, narrativa nasce dele (não o contrário)",
    variations: "Gerar 3 variações + síntese final para seleção",
  },
} as const

/**
 * FUNÇÃO AUXILIAR: Obter regras de rima para gênero
 */
export function getRhymeRulesForGenre(genre: string) {
  const normalizedGenre = genre.includes("Sertanejo Raiz")
    ? "Sertanejo Raiz"
    : genre.includes("Sertanejo")
      ? "Sertanejo Moderno"
      : genre.includes("Funk")
        ? "Funk"
        : genre.includes("Pagode")
          ? "Pagode"
          : genre.includes("Samba")
            ? "Samba"
            : genre.includes("MPB")
              ? "MPB"
              : genre.includes("Gospel")
                ? "Gospel"
                : genre.includes("Bachata")
                  ? "Bachata"
                  : genre.includes("Arrocha")
                    ? "Arrocha"
                    : genre.includes("Forró")
                      ? "Forró"
                      : "Sertanejo Moderno" // default

  return (
    UNIVERSAL_RULES.rhymes.genre_requirements[normalizedGenre] ||
    UNIVERSAL_RULES.rhymes.genre_requirements["Sertanejo Moderno"]
  )
}

/**
 * FUNÇÃO AUXILIAR: Construir prompt com regras universais
 */
export function buildUniversalRulesPrompt(genre: string): string {
  const rhymeRules = getRhymeRulesForGenre(genre)
  const terceiraViaPrompt = buildTerceiraViaPrompt()

  return `
${terceiraViaPrompt}

🌟 REGRAS UNIVERSAIS INVIOLÁVEIS (Prioridade sobre tudo, exceto Requisitos Adicionais):

1. LINGUAGEM SIMPLES E COLOQUIAL:
   - Use palavras do dia-a-dia brasileiro, como um humano fala naturalmente
   - PROIBIDO: vocabulário rebuscado, poético formal, academicismo
   - Exemplos BOM: cerveja, boteco, saudade, coração, estrada
   - Exemplos RUIM: efêmero, sublime, etéreo, transcendental

2. LIMITE FISIOLÓGICO DE 12 SÍLABAS:
   - MÁXIMO ABSOLUTO: 12 sílabas por linha (um fôlego humano)
   - Combinações permitidas: 6+6, 7+5, 5+7
   - Uma linha com vírgula conta como 2 VERSOS na estrutura
   - Empilhe versos em linhas separadas sempre que possível

3. RIMAS RICAS (OBRIGATÓRIO PARA ${genre}):
   - Mínimo ${(rhymeRules.min_rich_rhymes * 100).toFixed(0)}% de rimas RICAS (classes gramaticais diferentes)
   - Máximo ${(rhymeRules.max_false_rhymes * 100).toFixed(0)}% de rimas FALSAS
   - Esquemas preferidos: ${rhymeRules.preferred_schemes.join(", ")}
   
   RIMA RICA (OBRIGATÓRIA): Classes gramaticais DIFERENTES
   ✓ porteira (substantivo) / bananeira (substantivo contexto diferente)
   ✓ viola (substantivo) / sacola (substantivo campo semântico diferente)
   ✓ sertão (substantivo concreto) / coração (substantivo abstrato)
   
   RIMA POBRE (EVITAR): Mesma classe gramatical
   ✗ amor / dor (ambos substantivos abstratos)
   ✗ cantando / amando (ambos gerúndios)
   
   RIMA FALSA (PROIBIDA): Sons não coincidem
   ✗ amor / calor (se pronunciado diferente)
   ✗ dia / alegria (se forçado)

4. ANTI-FORÇAÇÃO:
   - Se uma linha parece artificial, reescreva com naturalidade
   - Não force rimas que quebram o sentido
   - Não use palavras rebuscadas só para rimar

5. METÁFORAS RESPEITADAS:
   - Metáforas nos Requisitos Adicionais têm PRIORIDADE ABSOLUTA
   - Insira-as naturalmente no contexto

6. FORMATO DE SAÍDA:
   - Marcadores de estrutura: EM INGLÊS (VERSE, CHORUS, BRIDGE, INTRO, OUTRO)
   - Letras cantadas: EM PORTUGUÊS
   - Instrumentos: EM INGLÊS, entre parênteses
   - Exemplo: [VERSE 1] (Instrumental: acoustic guitar, drums, bass)

7. CAPITALIZAÇÃO:
   - Primeira letra de cada linha em MAIÚSCULA
   - Resto da linha: preservar capitalização natural (nomes próprios, ênfases)

⚠️ HIERARQUIA DE PRIORIDADES:
1º Requisitos Adicionais do Usuário (ABSOLUTA)
2º Regras Universais (este prompt)
3º Regras do Gênero
4º Sugestões criativas da IA
`.trim()
}

/**
 * FUNÇÃO AUXILIAR: Construir prompt com Terceira Via integrada
 */
export function buildTerceiraViaPrompt(): string {
  return `
🎯 TERCEIRA VIA - PRINCÍPIOS DE COMPOSIÇÃO (APLIQUE DESDE O INÍCIO):

EVITE CLICHÊS ABSTRATOS:
❌ "coração partido", "lágrimas no travesseiro", "noite sem luar"
❌ "alma vazia", "mundo desabou", "amor eterno"
❌ "para sempre", "vazio na alma", "dor profunda"

USE IMAGENS CONCRETAS DO COTIDIANO BRASILEIRO:
✅ Objetos: cerveja, violão, boteco, estrada, caminhonete, chapéu
✅ Lugares: varanda, mesa, bar, estrada, roça, cidade
✅ Ações: apagar fotos, tomar cerveja, tocar violão, dirigir, lembrar

ESPECÍFICO > GENÉRICO:
❌ "A música toca na minha alma" (abstrato)
✅ "Violão na varanda, lembrando seu sorriso" (concreto)

❌ "Meu coração está partido" (clichê)
✅ "Seu copo ainda tá na mesa, cerveja esquecida" (específico)

EMOÇÕES ATRAVÉS DE AÇÕES CONCRETAS:
❌ "Sinto uma dor profunda" (abstrato)
✅ "Apaguei suas fotos mas não apaguei a saudade" (ação concreta)

❌ "Estou sozinho e triste" (genérico)
✅ "Boteco cheio mas eu tô sozinho aqui" (situação específica)

LINGUAGEM COLOQUIAL NATURAL:
✅ "tô", "cê", "pra", "né", "mano"
✅ Como um brasileiro fala no dia-a-dia
❌ Vocabulário rebuscado ou poético formal

⚠️ IMPORTANTE: Aplique estes princípios DURANTE a composição, não depois.
Cada linha deve nascer já seguindo a Terceira Via.
`.trim()
}

export type UniversalRules = typeof UNIVERSAL_RULES
