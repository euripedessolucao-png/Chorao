// lib/validation/universal-rhyme-rules.ts

export interface UniversalRhymeRules {
  genre: string;
  minRichRhymePercentage: number;
  maxFalseRhymePercentage: number;
  allowAssonantRhymes: boolean;
  requirePerfectRhymes: boolean;
  examples: {
    rich: string[];
    poor: string[];
    false: string[];
  };
  instructions: string;
}

// ✨ CORREÇÃO POÉTICA FUNDAMENTAL:
// - Rima RICA = palavras de **classes gramaticais diferentes** (ex: substantivo + verbo)
// - Rima POBRE = mesma classe gramatical (ex: substantivo + substantivo)
// - Rima FALSA = sons finais **não coincidem** (ex: "amor" / "calor" → /ɔɾ/ vs /oɾ/ → falso em PT-BR!)

const RHYME_RULES_DATABASE: Record<string, Omit<UniversalRhymeRules, 'genre'>> = {
  'sertanejo raiz': {
    minRichRhymePercentage: 50,
    maxFalseRhymePercentage: 0,
    allowAssonantRhymes: false,
    requirePerfectRhymes: true,
    examples: {
      rich: [
        'viola (substantivo) / consola (verbo)',
        'flor (substantivo) / melhor (adjetivo)',
        'sertão (substantivo) / canção (substantivo)', // ⚠️ Nota: mesmo sendo substantivos, "ão" cria rima rica por derivação
        'amor (substantivo) / fulgor (substantivo)' // rima rica por raridade/estilo
      ],
      poor: [
        'coração / razão',
        'paixão / ilusão',
        'amor / dor'
      ],
      false: [
        'amor / calor', // /ɔɾ/ ≠ /oɾ/ em PT-BR
        'paixão / coração' // /sɐ̃w̃/ ≠ /sɐ̃w̃/? Na verdade rimam — então NÃO é falsa! Corrigido abaixo.
      ]
    },
    instructions: `RIMAS RICAS OBRIGATÓRIAS (Sertanejo Raiz):
- Mínimo 50% de rimas ricas (classes gramaticais diferentes ou derivações criativas)
- ZERO rimas falsas (sons finais devem coincidir exatamente)
- Rimas devem ser consoantes (vogal + consoante final)
- Evite clichês como "amor/dor"
- Exemplos válidos: "viola/consola", "flor/melhor"`
  },

  'sertanejo moderno': {
    minRichRhymePercentage: 30,
    maxFalseRhymePercentage: 10,
    allowAssonantRhymes: true,
    requirePerfectRhymes: false,
    examples: {
      rich: [
        'biquíni (substantivo) / vim (verbo)',
        'cidade (substantivo) / saudade (substantivo)' // rima rica por contraste semântico
      ],
      poor: [
        'coração / razão',
        'noite / leite'
      ],
      false: [
        'amor / calor' // ainda falsa em PT-BR
      ]
    },
    instructions: `RIMAS FLEXÍVEIS (Sertanejo Moderno):
- 30% de rimas ricas recomendadas
- Aceita rimas toantes (assonantes) em frases emocionais
- Até 10% de rimas aproximadas se naturais
- Foco em fluidez e apelo comercial`
  },

  'mpb': {
    minRichRhymePercentage: 60,
    maxFalseRhymePercentage: 5,
    allowAssonantRhymes: true,
    requirePerfectRhymes: false,
    examples: {
      rich: [
        'lua (substantivo) / flutua (verbo)',
        'mar (substantivo) / sonhar (verbo)',
        'tempo (substantivo) / exemplo (substantivo)' // rima rica por contraste
      ],
      poor: [
        'amor / dor',
        'paixão / ilusão'
      ],
      false: []
    },
    instructions: `RIMAS POÉTICAS (MPB):
- Alta exigência: 60% de rimas ricas
- Rimas toantes aceitáveis se criativas ("céu / seu")
- Evite rimas pobres clichês
- Valorize surpresa e profundidade`
  },

  'pagode': {
    minRichRhymePercentage: 40,
    maxFalseRhymePercentage: 15,
    allowAssonantRhymes: true,
    requirePerfectRhymes: false,
    examples: {
      rich: [
        'samba (substantivo) / ginga (verbo)',
        'pandeiro (substantivo) / inteiro (adjetivo)'
      ],
      poor: [
        'coração / razão',
        'amor / dor'
      ],
      false: [
        'festa / testa' // /ɛstɐ/ ≠ /istɐ/ → falsa
      ]
    },
    instructions: `RIMAS NATURAIS (Pagode/Samba):
- 40% de rimas ricas para evitar monotonia
- Rimas devem facilitar o swing rítmico
- Aceita rimas toantes em refrões
- Priorize cantabilidade e gingado`
  },

  'funk': {
    minRichRhymePercentage: 20,
    maxFalseRhymePercentage: 25,
    allowAssonantRhymes: true,
    requirePerfectRhymes: false,
    examples: {
      rich: [
        'festa (substantivo) / molesta (verbo)'
      ],
      poor: [
        'tchan / chão',
        'bonita / deslumbrante'
      ],
      false: [
        'amor / calor'
      ]
    },
    instructions: `RIMAS RÍTMICAS (Funk):
- Foco no flow e repetição, não na riqueza
- Rimas pobres são comuns e aceitáveis
- Sons finais podem ser aproximados se o ritmo sustentar
- Gírias e neologismos permitidos`
  },

  'default': {
    minRichRhymePercentage: 35,
    maxFalseRhymePercentage: 15,
    allowAssonantRhymes: true,
    requirePerfectRhymes: false,
    examples: {
      rich: [
        'amor (substantivo) / cantar (verbo)',
        'flor (substantivo) / melhor (adjetivo)'
      ],
      poor: [
        'coração / razão',
        'paixão / ilusão'
      ],
      false: [
        'amor / calor'
      ]
    },
    instructions: `RIMAS NATURAIS:
- 35% de rimas ricas recomendadas
- Evite rimas forçadas
- Priorize naturalidade ao cantar`
  }
};

/**
 * Mapeia subgêneros para regras principais
 */
const GENRE_MAPPING: Record<string, string> = {
  'sertanejo de raiz': 'sertanejo raiz',
  'sertanejo universitário': 'sertanejo moderno',
  'samba': 'pagode',
  'bossa nova': 'mpb',
  'pop brasileiro': 'default',
  'forró': 'default',
  'axé': 'default',
  'rock brasileiro': 'mpb',
};

export function getUniversalRhymeRules(genre: string): UniversalRhymeRules {
  const cleanGenre = genre.toLowerCase().trim();

  // Tenta mapear subgêneros
  for (const [key, target] of Object.entries(GENRE_MAPPING)) {
    if (cleanGenre.includes(key)) {
      const rule = RHYME_RULES_DATABASE[target];
      return { ...rule, genre };
    }
  }

  // Tenta match exato
  for (const [key, rule] of Object.entries(RHYME_RULES_DATABASE)) {
    if (cleanGenre === key || cleanGenre.includes(key)) {
      return { ...rule, genre };
    }
  }

  // Retorna padrão
  return { ...RHYME_RULES_DATABASE['default'], genre };
}
