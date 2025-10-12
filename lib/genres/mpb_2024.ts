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
    universal_rule:
      "SEMPRE use palavras simples e coloquiais, faladas como um humano no dia-a-dia. Evite vocabulário rebuscado, poético ou formal, EXCETO se especificado em 'Requisitos Adicionais'.",
    allowed: {
      concrete_objects: ["rua", "cidade", "chuva", "espelho", "janela", "café", "ônibus"],
      actions: ["observar", "refletir", "caminhar", "sentir", "questionar"],
      phrases: ["O mundo gira devagar", "Meu coração é um mapa", "A cidade me abraça"],
    },
    forbidden: {
      generic_cliches: ["coração partido", "lágrimas no travesseiro", "mundo desabou"],
      forced_rhymes: ["amor/dor", "paixão/ilusão"],
    },
    style:
      "Poético, mas com linguagem real e acessível. Use palavras simples do dia-a-dia, evite arcaísmos e vocabulário rebuscado.",
  },
  structure_rules: {
    verse: { lines: 4 },
    chorus: { lines_options: [2, 4], forbidden_lines: 3 },
    bridge: { lines_min: 2, lines_max: 4 },
  },
  prosody_rules: {
    syllable_count: {
      verse_counting_rule: "Uma linha com 14 sílabas dividida por vírgula conta como 2 VERSOS na estrutura total",
      with_comma: {
        max_before_comma: 7,
        max_after_comma: 7,
        total_max: 14,
        note: "Linha com vírgula = 2 VERSOS (ex: 'O mundo gira devagar, meu coração é um mapa' = verso 1 + verso 2)",
      },
      without_comma: {
        min: 6,
        max: 9,
        note: "Sem vírgula = 1 VERSO",
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
    "Linguagem poética, mas acessível e simples",
  ],
} as const
