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
    universal_rule:
      "SEMPRE use palavras simples e coloquiais, faladas como um humano no dia-a-dia. Evite vocabulário rebuscado, poético ou formal, EXCETO se especificado em 'Requisitos Adicionais'.",
    allowed: {
      concrete_objects: ["altar", "luz", "mar", "montanha", "céu", "graça", "promessa"],
      actions: ["confiar", "entregar", "adorar", "levantar", "caminhar com Deus"],
      phrases: ["Tua graça me basta", "Em Ti eu descanso", "Minha vitória vem de Ti"],
    },
    forbidden: {
      fear_based: ["fogo do inferno", "castigo", "pecado te condena"],
      prosperity_gospel: ["Deus te dará carro", "riqueza é bênção"],
    },
    style: "Inspirador, com linguagem bíblica suave e acessível, não dogmática. Use palavras simples do dia-a-dia.",
  },
  structure_rules: {
    verse: { lines: 4 },
    chorus: { lines_options: [2, 4], forbidden_lines: 3 },
    bridge: { lines_min: 2, lines_max: 4 },
  },
  prosody_rules: {
    syllable_count: {
      verse_counting_rule: "Uma linha com 12 sílabas dividida por vírgula conta como 2 VERSOS na estrutura total",
      with_comma: {
        max_before_comma: 6,
        max_after_comma: 6,
        total_max: 12,
        note: "Linha com vírgula = 2 VERSOS (ex: 'Tua graça me basta, em Ti eu descanso' = verso 1 + verso 2)",
      },
      without_comma: {
        min: 5,
        max: 8,
        note: "Sem vírgula = 1 VERSO",
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
    "Linguagem simples e acessível",
    "Final de vitória espiritual",
  ],
} as const
