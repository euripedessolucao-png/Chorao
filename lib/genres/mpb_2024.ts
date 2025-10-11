export const MPB_2024 = {
  genre: "MPB Contemporânea",
  year_range: "2024–2025",
  reference_artists: ["Seu Jorge", "Céu", "Tim Bernardes", "Liniker", "Criolo"],
  core_principles: {
    theme: "Reflexão social, poesia cotidiana, amor complexo, identidade — com profundidade, não com clichê.",
    tone: "Íntimo, poético, mas acessível.",
    narrative_arc: "Observação → Reflexão → Epifania.",
  },
  language_rules: {
    allowed: {
      concrete_objects: ["rua", "cidade", "chuva", "espelho", "janela", "café", "ônibus"],
      actions: ["observar", "refletir", "caminhar", "sentir", "questionar"],
      phrases: ["O mundo gira devagar", "Meu coração é um mapa", "A cidade me abraça"],
    },
    forbidden: {
      generic_cliches: ["coração partido", "lágrimas no travesseiro", "mundo desabou"],
      forced_rhymes: ["amor/dor", "paixão/ilusão"],
    },
    style: "Poético, mas com linguagem real. Evite arcaísmos.",
  },
  structure_rules: {
    verse: { lines: 4 },
    chorus: { lines_options: [2, 4], forbidden_lines: 3 },
    bridge: { lines_min: 2, lines_max: 4 },
  },
  prosody_rules: {
    syllable_count: {
      with_comma: {
        max_before_comma: 7,
        max_after_comma: 7,
        total_max: 14,
      },
      without_comma: {
        min: 6,
        max: 9,
      },
    },
  },
  harmony_and_rhythm: {
    bpm_range: { min: 70, max: 90, ideal: 80 },
    key: "C major or Am",
  },
  validation_checklist: [
    "Profundidade sem pretensão",
    "Imagens concretas (rua, janela, café)",
    "BPM 70–90",
    "Sem clichês de sofrência",
    "Linguagem poética, mas acessível",
  ],
} as const
