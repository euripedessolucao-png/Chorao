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
    allowed: {
      concrete_objects: ["rua", "muro", "guitarra", "cidade", "bandeira", "voz", "caos"],
      actions: ["gritar", "questionar", "quebrar", "construir", "acreditar"],
      phrases: ["Minha voz é minha arma", "O caos me ensinou", "Não vou me calar"],
    },
    forbidden: {
      empty_rebellion: ["ódio pelo ódio", "destruir tudo"],
      generic_cliches: ["coração de pedra", "alma perdida"],
    },
    style: "Direto, com metáforas fortes, mas reais.",
  },
  structure_rules: {
    verse: { lines: 4 },
    chorus: { lines_options: [2, 4], forbidden_lines: 3 },
    bridge: { lines_min: 2, lines_max: 4 },
  },
  prosody_rules: {
    syllable_count: {
      without_comma: {
        min: 5,
        max: 8,
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
    "Final com esperança ou clareza",
  ],
} as const
