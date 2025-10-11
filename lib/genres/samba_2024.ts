export const SAMBA_2024 = {
  genre: "Samba Moderno / Pagode Urbano",
  year_range: "2024–2025",
  reference_artists: [
    "Ludmilla",
    "Dilsinho",
    "Ferrugem",
    "Mariana Rios",
    "Zeca Pagodinho",
    "Fundo de Quintal (nova geração)",
    "Guilherme Arantes (em versões atuais)",
  ],
  core_principles: {
    theme:
      "Superação com gingado, saudade saudável, celebração da vida simples — nunca dramalhão, vitimização ou obsessão.",
    tone: "Leve, carioca, com swing e atitude. Pode ser romântico, mas sempre com dignidade.",
    narrative_arc: "Início (fim do amor) → Meio (boteco com os manos) → Fim (dança, sorriso, recomeço).",
  },
  language_rules: {
    allowed: {
      concrete_objects: [
        "chopinho",
        "boteco",
        "cavaquinho",
        "pandeiro",
        "pagode no fundo",
        "zap",
        "story",
        "rolê",
        "mano",
        "véio",
        "bicho",
        "copo de vitória",
      ],
      actions: [
        "dançar sem você",
        "dar a volta",
        "pagar a conta",
        "ficar com a lição",
        "rir de novo",
        "chamar os manos",
        "tocar um pagode",
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
    style: "Coloquial, carioca, com gingado. Use 'tô', 'cê', 'mano', 'véio'. Evite poesia rebuscada ou formal.",
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
        "Referência concreta (ex: 'boteco', 'chopinho')",
        "Mensagem de superação (ex: 'hoje eu danço sem você')",
      ],
    },
    bridge: {
      lines_min: 2,
      lines_max: 2,
      purpose: "Clímax de transformação — curto e poderoso.",
    },
    pre_chorus: {
      allowed: false,
      note: "Evite pré-refrão — o samba moderno é direto ao ponto.",
    },
    outro: {
      style: "Curto, repetitivo, com fade ou corte seco.",
      example: "Copo cheio... de alegria...",
    },
  },
  prosody_rules: {
    syllable_count: {
      with_comma: {
        max_before_comma: 5,
        max_after_comma: 5,
        total_max: 10,
      },
      without_comma: {
        min: 4,
        max: 6,
        acceptable_up_to: 7,
      },
    },
    breathability:
      "Toda linha deve caber em um fôlego natural ao cantar — priorize frases curtas e ritmo conversacional.",
  },
  harmony_and_rhythm: {
    key: "C major or G major (common in samba)",
    allowed_chords: ["C", "G", "Am", "F", "Dm", "Em", "D7"],
    forbidden_chords: ["E", "Bb", "Ab", "F#", "C#"],
    bpm_range: {
      min: 92,
      max: 100,
      ideal: 96,
    },
    rhythm_style:
      "Samba/pagode com pandeiro marcado, cavaquinho rítmico, surdo no grave e tamborim com swing. Evite batidas lentas ou dramáticas.",
  },
  performance_and_visual: {
    clip_scenes: [
      "Boteco com os amigos, chopinho gelado",
      "Pagode no fundo de quintal",
      "Dançando sozinho na varanda",
      "Rolê de moto com os mano",
    ],
    audience_cues: ["É nóis!", "Véio!", "Bicho!", "Tá ligado!"],
    vocal_delivery: "Voz com gingado, sorriso na voz, swing natural — nunca chorosa ou dramática.",
  },
  validation_checklist: [
    "Sem dramalhão ou vitimização",
    "Versos com 4–6 sílabas",
    "Refrão com 2 ou 4 linhas",
    "Linguagem coloquial e carioca",
    "Presença de boteco, chopinho ou pagode",
    "BPM entre 92–100",
    "Final de superação (não de desespero)",
  ],
} as const
