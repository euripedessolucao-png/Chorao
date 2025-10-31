// lib/validation/universal-rhyme-rules.ts

export interface UniversalRhymeRules {
  genre: string
  minRichRhymePercentage: number
  maxFalseRhymePercentage: number
  allowAssonantRhymes: boolean
  requirePerfectRhymes: boolean
  examples: {
    rich: string[]
    poor: string[]
    false: string[]
  }
  instructions: string
}

/**
 * DEFINIÇÕES TÉCNICAS (FONÉTICA BRASILEIRA):
 *
 * - RIMA RICA:
 *   • Sons finais idênticos + diferença de classe gramatical OU
 *   • Sons finais idênticos + contraste semântico forte (ex: concreto/abstrato) OU
 *   • Ditongos diferentes com mesma vogal tônica (ex: "flor" / "melhor" → /ɔɾ/)
 *
 * - RIMA POBRE:
 *   • Mesma classe gramatical + sons idênticos (ex: "coração" / "razão")
 *
 * - RIMA FALSA:
 *   • Sons finais diferentes na fala coloquial brasileira
 *   • Ex: "amor" / "calor" → /oɾ/ vs /ɔɾ/ (em SP, MG, GO, etc.)
 *
 * - RIMA TOANTE (ASSONANTE):
 *   • Só vogais coincidem, consoantes finais diferem (ex: "lua" / "cura")
 */

const RHYME_RULES_DATABASE: Record<string, Omit<UniversalRhymeRules, "genre">> = {
  "sertanejo raiz": {
    minRichRhymePercentage: 60,
    maxFalseRhymePercentage: 0,
    allowAssonantRhymes: false,
    requirePerfectRhymes: true,
    examples: {
      rich: [
        "viola (substantivo) / consola (verbo)", // classe + som
        "flor (substantivo) / melhor (adjetivo)", // semântica + som
        "dor (substantivo) / fulgor (substantivo)", // raridade + som
        "canção (substantivo) / coração (substantivo)", // aceito por tradição, mas pobre
      ],
      poor: [
        "coração / razão",
        "paixão / ilusão",
        "amor / dor", // evitado em raiz moderno
      ],
      false: [
        "amor / calor", // /oɾ/ ≠ /ɔɾ/ em PT-BR coloquial
        "festa / testa", // /ɛ/ ≠ /i/
        "rapaz / capaz", // /a/ aberto vs fechado em muitos dialetos
      ],
    },
    instructions: `RIMAS RICAS ESTRITAS (Sertanejo Raiz):
- 60% mínimo de rimas ricas (classe diferente OU contraste semântico)
- ZERO rimas falsas — sons finais devem coincidir na fala coloquial
- Evite pares clichês como "amor/dor"
- Prefira rimas consoantes exatas`,
  },

  "sertanejo moderno": {
    minRichRhymePercentage: 40, // aumentado de 30% (hits atuais usam mais ricas)
    maxFalseRhymePercentage: 5, // reduzido de 10% (falsas soam amadoras)
    allowAssonantRhymes: true,
    requirePerfectRhymes: false,
    examples: {
      rich: [
        "biquíni (substantivo) / vim (verbo)", // classe + surpresa
        "cidade (substantivo) / saudade (substantivo)", // contraste semântico forte
        "acordar (verbo) / amanhecer (verbo)", // sinônimos com sons diferentes → rica por intenção
        "trabalhar (verbo) / lar (substantivo)", // classe + som
      ],
      poor: [
        "coração / razão", // aceito, mas não ideal
        "noite / leite", // pobre, mas comum
      ],
      false: [
        "amor / calor", // ainda falsa em PT-BR
        "felicidade / saudade", // /i/ vs /a/ na penúltima sílaba → falsa
      ],
    },
    instructions: `RIMAS MODERNAS COM QUALIDADE (Sertanejo 2025):
- 40% de rimas ricas recomendadas (classe diferente ou contraste forte)
- Rimas toantes aceitas em momentos emocionais ("viver" / "sofrer")
- Máximo 5% de rimas aproximadas — só se naturais na fala
- Evite falsas como "amor/calor" — soam amadoras`,
  },

  mpb: {
    minRichRhymePercentage: 70, // aumentado (MPB exige mais criatividade)
    maxFalseRhymePercentage: 0,
    allowAssonantRhymes: true,
    requirePerfectRhymes: false,
    examples: {
      rich: [
        "lua (substantivo) / flutua (verbo)",
        "mar (substantivo) / sonhar (verbo)",
        "tempo (substantivo) / exemplo (substantivo)", // contraste abstrato/concreto
        "dor (substantivo) / fulgor (substantivo)", // raridade
      ],
      poor: [
        "amor / dor", // evitado em MPB contemporânea
        "paixão / ilusão",
      ],
      false: [],
    },
    instructions: `RIMAS POÉTICAS EXIGENTES (MPB):
- 70% de rimas ricas obrigatórias
- Rimas toantes permitidas se criativas ("céu" / "Deus")
- Zero tolerância a rimas falsas
- Valorize inovação e profundidade semântica`,
  },

  pagode: {
    minRichRhymePercentage: 35,
    maxFalseRhymePercentage: 10,
    allowAssonantRhymes: true,
    requirePerfectRhymes: false,
    examples: {
      rich: [
        "samba (substantivo) / ginga (verbo)",
        "pandeiro (substantivo) / inteiro (adjetivo)",
        "malandro (substantivo) / ando (verbo)",
      ],
      poor: ["coração / razão", "amor / dor"],
      false: [
        "festa / testa", // /ɛ/ ≠ /i/
        "rapaz / capaz", // variação dialetal problemática
      ],
    },
    instructions: `RIMAS RÍTMICAS (Pagode/Samba):
- 35% de rimas ricas para manter frescor
- Rimas devem apoiar o swing rítmico
- Toantes aceitas em refrões ("samba" / "manha")
- Evite falsas que quebrem o groove`,
  },

  funk: {
    minRichRhymePercentage: 15,
    maxFalseRhymePercentage: 20,
    allowAssonantRhymes: true,
    requirePerfectRhymes: false,
    examples: {
      rich: ["festa (substantivo) / molesta (verbo)", "bonita (adjetivo) / grita (verbo)"],
      poor: ["tchan / chão", "loira / noite"],
      false: [
        "amor / calor", // tolerado em funk por ritmo
        "play / vai", // inglês/português — aceito no gênero
      ],
    },
    instructions: `RIMAS DE FLOW (Funk):
- Foco no ritmo e repetição, não na riqueza
- Rimas pobres são a norma
- Falsas aceitas se o beat sustentar
- Gírias e empréstimos linguísticos permitidos`,
  },

  default: {
    minRichRhymePercentage: 40,
    maxFalseRhymePercentage: 10,
    allowAssonantRhymes: true,
    requirePerfectRhymes: false,
    examples: {
      rich: [
        "amor (substantivo) / cantar (verbo)",
        "flor (substantivo) / melhor (adjetivo)",
        "viver (verbo) / sofrer (verbo)", // toante rica por contraste
      ],
      poor: ["coração / razão", "paixão / ilusão"],
      false: ["amor / calor", "festa / testa"],
    },
    instructions: `RIMAS EQUILIBRADAS:
- 40% de rimas ricas recomendadas
- Evite falsas que soem forçadas
- Toantes aceitas em momentos líricos
- Priorize naturalidade ao cantar`,
  },
}

const GENRE_MAPPING: Record<string, string> = {
  "sertanejo de raiz": "sertanejo raiz",
  "sertanejo universitário": "sertanejo moderno",
  "sertanejo atual": "sertanejo moderno",
  "sertanejo feminino": "sertanejo moderno",
  "sertanejo masculino": "sertanejo moderno",
  samba: "pagode",
  "bossa nova": "mpb",
  "pop brasileiro": "default",
  forró: "default",
  axé: "default",
  "rock brasileiro": "mpb",
  "funk carioca": "funk",
  "funk ostentação": "funk",
}

export function getUniversalRhymeRules(genre: string): UniversalRhymeRules {
  const cleanGenre = genre.toLowerCase().trim()

  // Busca por mapeamento de subgêneros
  for (const [key, target] of Object.entries(GENRE_MAPPING)) {
    if (cleanGenre.includes(key)) {
      const rule = RHYME_RULES_DATABASE[target]
      return { ...rule, genre }
    }
  }

  // Busca exata
  for (const [key, rule] of Object.entries(RHYME_RULES_DATABASE)) {
    if (cleanGenre === key) {
      return { ...rule, genre }
    }
  }

  // Fallback para "default"
  return { ...RHYME_RULES_DATABASE["default"], genre }
}

export const UNIVERSAL_RULES = {
  syllables: {
    max_syllables: 12,
    ideal_range: {
      min: 6,
      max: 11,
    },
  },
  breathability: {
    max_words_per_line: 8,
  },
} as const

export const getRhymeRulesForGenre = getUniversalRhymeRules
