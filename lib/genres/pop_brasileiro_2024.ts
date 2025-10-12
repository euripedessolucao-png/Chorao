export const POP_BRASILEIRO_2024 = {
  genre: "Pop Brasileiro Contemporâneo",
  year_range: "2024–2025",
  reference_artists: ["Anitta", "Luísa Sonza", "Iza", "Manu Gavassi", "Pabllo Vittar"],
  core_principles: {
    theme: "Autoestima, amor moderno, empoderamento, diversidade — com atitude e leveza.",
    tone: "Moderno, urbano, com pegada internacional.",
    narrative_arc: "Afirmação → Conflito → Superação com estilo.",
  },
  language_rules: {
    universal_rule:
      "SEMPRE use palavras simples e coloquiais, faladas como um humano no dia-a-dia. Evite vocabulário rebuscado, poético ou formal, EXCETO se especificado em 'Requisitos Adicionais'.",
    allowed: {
      concrete_objects: ["zap", "story", "look", "club", "city", "beat", "flow"],
      actions: ["mandar ver", "brilhar", "dançar", "amar sem medo"],
      phrases: ["Tô no meu flow", "Meu amor é livre", "Brilho sem pedir permissão"],
    },
    forbidden: {
      dramatic_cliches: ["coração partido", "mundo desabou", "não vivo sem você"],
      generic_love: ["te amo pra sempre", "você é meu tudo"],
    },
    style: "Urbano, com gírias atuais do dia-a-dia, inglês suave ('baby', 'love'). Use palavras simples e coloquiais.",
  },
  structure_rules: {
    verse: { lines: 4 },
    chorus: { lines_options: [2, 4], forbidden_lines: 3 },
    bridge: { lines_min: 2, lines_max: 2 },
  },
  prosody_rules: {
    syllable_count: {
      verse_counting_rule: "Uma linha com 12 sílabas dividida por vírgula conta como 2 VERSOS na estrutura total",
      with_comma: {
        max_before_comma: 6,
        max_after_comma: 6,
        total_max: 12,
        note: "Linha com vírgula = 2 VERSOS (ex: 'Tô no meu flow, brilho sem pedir permissão' = verso 1 + verso 2)",
      },
      without_comma: {
        min: 4,
        max: 7,
        note: "Sem vírgula = 1 VERSO",
      },
    },
  },
  harmony_and_rhythm: {
    bpm_range: { min: 90, max: 110, ideal: 100 },
    key: "C major",
  },
  validation_checklist: [
    "Autoestima e empoderamento",
    "Linguagem urbana simples (zap, story, look)",
    "BPM 90–110",
    "Sem dramalhão",
    "Final de atitude",
  ],
} as const
