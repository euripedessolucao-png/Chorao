export const GOSPEL_2024 = {
  genre: "Gospel Contemporâneo",
  year_range: "2024–2025",
  reference_artists: ["Aline Barros", "Davi Sacer", "Preto no Branco", "Gabriela Rocha", "Ana Nóbrega"],
  core_principles: {
    theme: "Fé, esperança, superação com Deus, gratidão — sem medo ou julgamento.",
    tone: "Inspirador, acolhedor, com força espiritual.",
    narrative_arc: "Provação → Entrega → Vitória em Deus.",
  },
  language_rules: {
    allowed: {
      concrete_objects: ["altar", "luz", "mar", "montanha", "céu", "graça", "promessa"],
      actions: ["confiar", "entregar", "adorar", "levantar", "caminhar com Deus"],
      phrases: ["Tua graça me basta", "Em Ti eu descanso", "Minha vitória vem de Ti"],
    },
    forbidden: {
      fear_based: ["fogo do inferno", "castigo", "pecado te condena"],
      prosperity_gospel: ["Deus te dará carro", "riqueza é bênção"],
    },
    style: "Inspirador, com linguagem bíblica suave, não dogmática.",
  },
  structure_rules: {
    verse: { lines: 4 },
    chorus: { lines_options: [2, 4], forbidden_lines: 3 },
    bridge: { lines_min: 2, lines_max: 4 },
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
        max: 8,
      },
    },
  },
  harmony_and_rhythm: {
    bpm_range: { min: 70, max: 90, ideal: 80 },
    key: "G major",
  },
  validation_checklist: [
    "Mensagem de esperança",
    "Sem medo ou julgamento",
    "Presença de 'graça', 'luz', 'fé'",
    "BPM 70–90",
    "Final de vitória espiritual",
  ],
} as const
