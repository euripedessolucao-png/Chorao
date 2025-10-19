export const SERTANEJO_MODERNO_2024 = {
  genre: "Sertanejo Moderno",
  year_range: "2024–2025",
  reference_artists: [
    "Zé Neto & Cristiano",
    "Jorge & Mateus",
    "Henrique & Juliano",
    "Marília Mendonça (legado)",
    "Maiara & Maraisa",
  ],
  core_principles: {
    theme:
      "Empoderamento feminino (feminejo), vulnerabilidade com força (masculino), amor moderno — sem vitimização ou dramalhão.",
    tone: "Direto, visual, com ganchos chiclete e elementos concretos do cotidiano brasileiro.",
    narrative_arc: "Início (fim do amor) → Meio (superação com atitude) → Fim (recomeço com dignidade).",
  },
  structural_variations: {
    part_naming: {
      verse: "PART A",
      chorus: "PART B",
      bridge: "PART C",
    },
    common_structures: [
      {
        name: "Completa",
        pattern: ["A", "B", "A", "B", "C", "B"],
        description: "Estrutura completa com ponte (mais comum em hits)",
        probability: 0.5,
      },
      {
        name: "Sem Ponte",
        pattern: ["A", "B", "A", "B", "B"],
        description: "Elimina a ponte, foca na repetição do refrão",
        probability: 0.25,
      },
      {
        name: "Curta",
        pattern: ["A", "B", "B"],
        description: "Estrutura minimalista, elimina segundo verso e ponte",
        probability: 0.15,
      },
      {
        name: "Refrão Primeiro",
        pattern: ["B", "A", "B", "C", "B"],
        description: "Começa direto no refrão (gancho imediato)",
        probability: 0.1,
      },
    ],
    rules: {
      verse_elimination: "Às vezes elimina o segundo verso para manter a música curta e direta",
      bridge_elimination: "Às vezes elimina a ponte para focar na repetição do refrão chiclete",
      chorus_repetition: "O refrão (PART B) é SEMPRE repetido múltiplas vezes - é o elemento mais importante",
      structure_flexibility: "A estrutura pode variar, mas o refrão deve ser sempre presente e repetitivo",
    },
  },
  language_rules: {
    universal_rule:
      "SEMPRE use palavras simples e coloquiais, faladas como um humano no dia-a-dia. Evite vocabulário rebuscado, poético ou formal, EXCETO se especificado em 'Requisitos Adicionais'.",
    allowed: {
      concrete_objects: [
        "biquíni",
        "PIX",
        "story",
        "boteco",
        "pickup",
        "praia",
        "zap",
        "rolê",
        "mano",
        "véio",
        "bicho",
        "copo de vitória",
      ],
      actions: [
        "mandar PIX",
        "postar story",
        "dar block",
        "pagar a conta",
        "ficar com a lição",
        "dar a volta",
        "dançar sem você",
      ],
      phrases: [
        "Tô em paz",
        "Meu copo é de vitória",
        "Amor que some, não era pra mim",
        "Dei a volta por cima",
        "Hoje eu danço sem você",
      ],
    },
    forbidden: {
      dramatic_cliches: [
        "coração em pedaços",
        "mundo desabou",
        "lágrimas no travesseiro",
        "uísque na mesa",
        "perfume na cama",
        "dor vazio",
        "orgulho no chão",
        "mundo se apagou",
        "solidão",
        "adeus ficou",
      ],
      obsessive_saudade: [
        "não consigo viver sem você",
        "só penso em você",
        "te vi com outro e morri",
        "não ligo pra mais ninguém",
      ],
      passive_victimhood: ["meu peito em pedaços", "o que sobrou de eu", "final indistinto", "dor que eu sinto"],
    },
    style:
      "Coloquial, brasileiro, com gírias atuais. Use 'tô', 'cê', 'mano', 'véio'. Evite poesia rebuscada ou formal.",
  },
  structure_rules: {
    verse: {
      lines: 4,
      purpose: "Contar o fim do amor com leveza e aprendizado.",
      label: "PART A",
    },
    chorus: {
      lines_options: [2, 4],
      forbidden_lines: 3,
      label: "PART B",
      required_elements: [
        "Gancho grudento (ex: 'Copo de vitória')",
        "Referência concreta (ex: 'biquíni', 'PIX', 'story')",
        "Mensagem de empoderamento (ex: 'hoje eu danço sem você')",
      ],
      repetition_rule: "Deve ser repetido múltiplas vezes - é o elemento mais importante",
    },
    bridge: {
      lines_min: 2,
      lines_max: 2,
      label: "PART C",
      purpose: "Clímax de transformação — curto e poderoso.",
      optional: true,
      note: "Pode ser eliminada em estruturas mais curtas ou focadas no refrão",
    },
    pre_chorus: {
      allowed: false,
      note: "Evite pré-refrão — o sertanejo moderno é direto ao ponto.",
    },
    outro: {
      style: "Curto, repetitivo, com fade ou corte seco.",
      example: "Copo cheio... de alegria...",
    },
  },
  prosody_rules: {
    syllable_count: {
      with_comma: {
        max_before_comma: 6,
        max_after_comma: 6,
        total_max: 12,
      },
      without_comma: {
        min: 5,
        max: 7,
        acceptable_up_to: 8,
      },
    },
    breathability:
      "Toda linha deve caber em um fôlego natural ao cantar — priorize frases curtas e ritmo conversacional.",
  },
  harmony_and_rhythm: {
    key: "G major or C major (common in sertanejo)",
    allowed_chords: ["G", "C", "D", "Em", "Am", "F"],
    forbidden_chords: ["E", "Bb", "Ab", "F#", "C#"],
    bpm_range: {
      min: 85,
      max: 95,
      ideal: 90,
    },
    rhythm_style:
      "Sertanejo com viola marcada, bateria eletrônica suave, baixo groovy. Evite batidas lentas ou dramáticas.",
  },
  performance_and_visual: {
    clip_scenes: [
      "Praia com biquíni e pickup",
      "Boteco com os amigos, copo de vitória",
      "Story sendo postado no celular",
      "Rolê de moto com os mano",
    ],
    audience_cues: ["É nóis!", "Véio!", "Bicho!", "Tá ligado!"],
    vocal_delivery: "Voz com atitude, sorriso na voz, nunca chorosa ou dramática.",
  },
  validation_checklist: [
    "Sem dramalhão ou vitimização",
    "Versos com 5–7 sílabas",
    "Refrão com 2 ou 4 linhas (NUNCA 3)",
    "Linguagem coloquial e brasileira",
    "Presença de biquíni, PIX, story, boteco ou pickup",
    "BPM entre 85–95",
    "Final de empoderamento (não de desespero)",
  ],
} as const
