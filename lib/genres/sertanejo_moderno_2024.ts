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
  language_rules: {
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
    },
    chorus: {
      lines_options: [2, 4],
      forbidden_lines: 3,
      required_elements: [
        "Gancho grudento (ex: 'Copo de vitória')",
        "Referência concreta (ex: 'biquíni', 'PIX', 'story')",
        "Mensagem de empoderamento (ex: 'hoje eu danço sem você')",
      ],
    },
    bridge: {
      lines_min: 2,
      lines_max: 2,
      purpose: "Clímax de transformação — curto e poderoso.",
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
