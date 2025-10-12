export const ROCK_BRASILEIRO_2024 = {
  genre: "Rock Brasileiro Contemporâneo",
  year_range: "2024–2025",
  reference_artists: ["Fresno", "CPM 22", "Restart (nova fase)", "Natiruts (rock-reggae)", "Legião Urbana (herança)"],
  core_principles: {
    theme: "Rebeldia com causa, questionamento social, amor intenso, identidade — com autenticidade.",
    tone: "Direto, energético, com alma.",
    narrative_arc: "Questionamento → Revolta → Esperança ou aceitação.",
  },
  language_rules: {
    universal_rule:
      "SEMPRE use palavras simples e coloquiais, faladas como um humano no dia-a-dia. Evite vocabulário rebuscado, poético ou formal, EXCETO se especificado em 'Requisitos Adicionais'.",
    allowed: {
      concrete_objects: ["rua", "muro", "guitarra", "cidade", "bandeira", "voz", "caos"],
      actions: ["gritar", "questionar", "quebrar", "construir", "acreditar"],
      phrases: ["Minha voz é minha arma", "O caos me ensinou", "Não vou me calar"],
    },
    forbidden: {
      empty_rebellion: ["ódio pelo ódio", "destruir tudo"],
      generic_cliches: ["coração de pedra", "alma perdida"],
    },
    style: "Direto, com metáforas fortes mas reais. Use palavras simples do dia-a-dia, não vocabulário rebuscado.",
  },
  structure_rules: {
    verse: { lines: 4 },
    chorus: { lines_options: [2, 4], forbidden_lines: 3 },
    bridge: { lines_min: 2, lines_max: 4 },
  },
  prosody_rules: {
    syllable_count: {
      verse_counting_rule: "Rock usa frases diretas. Cada linha = 1 VERSO",
      without_comma: {
        min: 5,
        max: 8,
        note: "Sem vírgula = 1 VERSO. Rock prefere frases diretas e impactantes",
      },
    },
  },
  harmony_and_rhythm: {
    bpm_range: { min: 100, max: 130, ideal: 115 },
    key: "E minor",
  },
  validation_checklist: [
    "Rebeldia com propósito",
    "Presença de guitarra, rua, voz",
    "BPM 100–130",
    "Sem ódio vazio",
    "Linguagem simples e direta",
    "Final com esperança ou clareza",
  ],
} as const
