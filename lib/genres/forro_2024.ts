export const FORRO_2024 = {
  genre: "Forró Pé-de-Serra Moderno / Forró Universitário",
  year_range: "2024–2025",
  reference_artists: [
    "Wesley Safadão",
    "Aviões do Forró",
    "Solange Almeida",
    "Saia Rodada",
    "Alceu Valença (nova geração)",
  ],
  core_principles: {
    theme: "Festa, romance leve, saudade saudável, celebração do Nordeste — sem drama excessivo.",
    tone: "Animado, dançante, com swing e gingado nordestino.",
    narrative_arc: "Convite para dançar → História de amor simples → Volta para a pista.",
  },
  language_rules: {
    universal_rule:
      "SEMPRE use palavras simples e coloquiais, faladas como um humano no dia-a-dia. Evite vocabulário rebuscado, poético ou formal, EXCETO se especificado em 'Requisitos Adicionais'.",
    allowed: {
      concrete_objects: ["sanfona", "triângulo", "zabumba", "piseiro", "forrozão", "quintal", "luar", "baião"],
      actions: ["dançar colado", "chamar pra pista", "beber um licor", "curtir o luar"],
      phrases: ["Vem pro meu quadrado", "Meu coração bate no ritmo do forró", "Hoje o forró é nosso"],
    },
    forbidden: {
      dramatic_cliches: ["coração partido", "lágrimas no copo", "mundo desabou", "não vivo sem você"],
      passive_victimhood: ["só penso em você", "meu peito aperta", "não consigo seguir"],
    },
    style:
      "Nordestino, coloquial, com expressões regionais ('véio', 'bicho', 'arretado'). Use palavras simples do dia-a-dia.",
  },
  structure_rules: {
    verse: { lines: 4 },
    chorus: { lines_options: [2, 4], forbidden_lines: 3 },
    bridge: { lines_min: 2, lines_max: 2 },
    pre_chorus: { allowed: true },
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
    bpm_range: { min: 110, max: 130, ideal: 120 },
    key: "G major",
    allowed_chords: ["G", "C", "D", "Em", "Am"],
  },
  validation_checklist: [
    "Sem dramalhão",
    "Presença de sanfona, triângulo, zabumba",
    "BPM entre 110–130",
    "Linguagem nordestina",
    "Final dançante",
  ],
} as const
