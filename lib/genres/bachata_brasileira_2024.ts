export const BACHATA_BRASILEIRA_2024 = {
  genre: "Bachata Brasileira Moderna",
  year_range: "2024–2025",
  reference_artists: [
    "Marcos & Belutti (em versões românticas)",
    "Luan Santana (bachata)",
    "Anitta (bachata)",
    "Prince Royce (influência)",
  ],
  core_principles: {
    theme: "Amor romântico, sensualidade suave, saudade elegante — sem vulgaridade ou drama.",
    tone: "Sensual, suave, com ritmo marcado.",
    narrative_arc: "Encontro → Dança → Saudade ou recomeço.",
  },
  language_rules: {
    allowed: {
      concrete_objects: ["dança", "luz baixa", "corpo", "música", "noite", "beijo", "ritmo"],
      actions: ["dançar colado", "sentir seu calor", "fechar os olhos", "deixar levar"],
      phrases: ["Seu corpo fala comigo", "A noite é nossa", "Deixa o ritmo nos levar"],
    },
    forbidden: {
      vulgarity: ["corpo perfeito", "sexo explícito"],
      dramatic_cliches: ["não vivo sem você", "mundo desabou"],
    },
    style: "Romântico, sensual, com metáforas suaves.",
  },
  structure_rules: {
    verse: { lines: 4 },
    chorus: { lines_options: [2, 4], forbidden_lines: 3 },
    bridge: { lines_min: 2, lines_max: 2 },
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
      },
    },
  },
  harmony_and_rhythm: {
    bpm_range: { min: 100, max: 120, ideal: 110 },
    key: "A minor",
  },
  validation_checklist: [
    "Sensualidade suave",
    "Presença de dança, noite, ritmo",
    "BPM 100–120",
    "Sem vulgaridade",
    "Final elegante",
  ],
} as const
