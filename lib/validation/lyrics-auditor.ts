// lib/genre-config.ts

import { countPoeticSyllables } from "./validation/syllable-counter-brasileiro"; // ✅ CORRIGIDO

export const GENRE_CONFIGS = {
  "Sertanejo Moderno Feminino": {
    year_range: "2024-2025",
    reference_artists: ["Ana Castela", "Maiara & Maraisa", "Luísa Sonza", "Simaria", "Naiara Azevedo"],
    core_principles: {
      theme: "Empoderamento feminino com leveza, autonomia e celebração da liberdade",
      tone: "Confidente, irônico, cotidiano, com atitude suave e final feliz",
      narrative_arc: "Início (controle do ex) → Meio (despertar/libertação) → Fim (celebração autônoma)",
    },
    language_rules: {
      allowed: {
        concrete_objects: [
          "biquíni",
          "PIX",
          "salário",
          "chapéu",
          "praia",
          "conta",
          "decote",
          "carro",
          "espelho",
          "anéis",
        ],
        actions: ["cortei", "paguei", "saí", "rasguei", "usei", "dancei", "voei", "quebrei", "aprendi", "sorri"],
        phrases: ["meu troco", "você não previu", "faço em dobro", "minha lei", "tô em outra vibe", "dona de mim"],
      },
      forbidden: {
        abstract_metaphors: [
          "floresço",
          "alma perdida",
          "mar de dor",
          "bonança",
          "brisa me inflama",
          "castelo de areia",
        ],
        ex_saudade: ["falta da sua voz", "meu coração chora", "volta pra mim", "não consigo viver sem você"],
        aggressive_tone: ["odeio você", "se fuder", "vou te destruir"],
      },
      style: "Coloquial, direto, como conversa real entre amigas. Evite poesia rebuscada.",
    },
    structure_rules: {
      verse: { lines: "4-5", purpose: "Apresentar conflito ou transformação com detalhes concretos" },
      chorus: {
        lines_options: [4],
        forbidden_lines: [2, 3],
        required_elements: ["Gancho grudento", "Contraste claro", "Afirmação de liberdade", "MUITO REPETITIVO"],
      },
      bridge: { lines_min: 4, lines_max: 4, purpose: "Clímax de libertação — foco em ação, não em drama" },
      duration: "2:30-3:00 (estrutura lean para streaming)",
    },
    prosody_rules: {
      syllable_count: {
        absolute_max: 12,
        rule: "NUNCA exceder 12 sílabas poéticas por verso - limite humano de canto",
      },
      breathability: "Toda linha deve caber em um fôlego natural ao cantar (máximo 12 sílabas)",
      verse_stacking: "UM VERSO POR LINHA (empilhamento brasileiro) - exceto quando segundo é continuação direta",
    },
    harmony_and_rhythm: {
      key: "C major",
      allowed_chords: ["C", "Dm", "Em", "F", "G", "Am", "G7"],
      forbidden_chords: ["A", "E", "B", "Bb", "F#", "C#", "Ab"],
      bpm_range: { min: 88, max: 96, ideal: 94 },
      rhythm_style: "Sertanejo pop com groove moderado",
    },
  },
  // ... (mantenha todos os outros gêneros exatamente como no segundo arquivo, pois já estão corretos)
  // Incluindo Sertanejo Moderno Masculino, Raiz, Funk, MPB, etc.
} as const;

export type GenreConfig = (typeof GENRE_CONFIGS)[keyof typeof GENRE_CONFIGS];

export function getGenreConfig(genre: string): GenreConfig & { name: string } {
  const config = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS];
  if (!config) {
    return {
      name: genre,
      year_range: "2024-2025",
      reference_artists: [] as any,
      core_principles: {
        theme: "Música brasileira contemporânea" as any,
        tone: "Autêntico e natural" as any,
        narrative_arc: "Início → Desenvolvimento → Conclusão" as any,
      },
      language_rules: {
        allowed: {
          concrete_objects: [] as any,
          actions: [] as any,
          phrases: [] as any,
        },
        forbidden: {},
        style: "Coloquial, brasileiro, com palavras simples do dia-a-dia",
      },
      structure_rules: {
        verse: { lines: 4, purpose: "Contar história de forma clara" },
        chorus: {
          lines_options: [2, 4],
          forbidden_lines: 3,
          required_elements: ["Gancho grudento", "Fácil de memorizar"],
        },
      },
      prosody_rules: {
        syllable_count: {
          with_comma: { max_before_comma: 7, max_after_comma: 5, total_max: 12 },
          without_comma: { min: 5, max: 8, acceptable_up_to: 9 },
        },
        breathability: "Toda linha deve caber em um fôlego natural ao cantar",
        verse_counting_rule:
          "Uma linha com vírgula (ex: 6+6, 7+5 ou 5+7 sílabas) conta como 2 VERSOS na estrutura total, não 1 verso",
      },
      harmony_and_rhythm: {
        key: "C major" as any,
        allowed_chords: ["C", "F", "G", "Am", "Dm", "Em"],
        bpm_range: { min: 90, max: 110, ideal: 100 },
        rhythm_style: "Ritmo brasileiro moderno",
      },
    } as unknown as GenreConfig & { name: string };
  }
  return {
    name: genre,
    ...config,
  };
}

export function validateLyrics(
  lyrics: string,
  genre: string,
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const config = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS];
  if (!config) {
    return { valid: true, errors: [], warnings: ["Gênero não encontrado nas configurações"] };
  }

  // Validar palavras proibidas
  const lyricsLower = lyrics.toLowerCase();
  if (config.language_rules.forbidden) {
    Object.entries(config.language_rules.forbidden).forEach(([category, words]) => {
      (words as string[]).forEach((word) => {
        if (lyricsLower.includes(word.toLowerCase())) {
          errors.push(`Palavra/frase proibida encontrada (${category}): "${word}"`);
        }
      });
    });
  }

  // Validar contagem de sílabas - USANDO O NOVO SISTEMA
  const lines = lyrics.split("\n").filter((line) => line.trim() && !line.startsWith("["));
  lines.forEach((line, index) => {
    const syllables = countPoeticSyllables(line); // ✅ AGORA CORRETO
    const rules = config.prosody_rules.syllable_count;

    if ("with_comma" in rules && line.includes(",")) {
      const [before, after] = line.split(",", 2);
      const beforeCount = countPoeticSyllables(before?.trim() || "");
      const afterCount = countPoeticSyllables(after?.trim() || "");
      if (beforeCount > rules.with_comma.max_before_comma) {
        warnings.push(`Linha ${index + 1}: Muitas sílabas antes da vírgula (${beforeCount})`);
      }
      if (afterCount > rules.with_comma.max_after_comma) {
        warnings.push(`Linha ${index + 1}: Muitas sílabas depois da vírgula (${afterCount})`);
      }
    } else if ("absolute_max" in rules) {
      if (syllables > rules.absolute_max) {
        errors.push(`Linha ${index + 1}: Excede o limite de ${rules.absolute_max} sílabas (${syllables})`);
      }
    } else if ("without_comma" in rules) {
      if (syllables < rules.without_comma.min || syllables > rules.without_comma.acceptable_up_to) {
        warnings.push(`Linha ${index + 1}: Contagem de sílabas fora do ideal (${syllables})`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ✅ Mantenha todas as exportações auxiliares (INSTRUMENTATION_RULES, SUB_GENRE_INSTRUMENTS, etc.)
export const INSTRUMENTATION_RULES = { /* ... */ } as const;
export const SUB_GENRE_INSTRUMENTS = { /* ... */ } as const;
export const GENRE_RHYTHMS = { /* ... */ } as const;

export function detectSubGenre(additionalRequirements: string | undefined): {
  subGenre: string | null;
  instruments: string | null;
  bpm: number | null;
  rhythm: string | null;
  styleNote: string | null;
} {
  // ... implementação igual ao segundo arquivo
}

export function getGenreRhythm(genre: string): string {
  return GENRE_RHYTHMS[genre as keyof typeof GENRE_RHYTHMS] || genre;
}

// ✅ Nova função auxiliar (do segundo arquivo)
export function getSyllableLimitsForGenre(genre: string) {
  const config = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS];
  if (!config) {
    return { min: 5, max: 12, ideal: 9 };
  }
  const rules = config.prosody_rules.syllable_count;
  if ("absolute_max" in rules) {
    return {
      min: Math.max(4, rules.absolute_max - 5),
      max: rules.absolute_max,
      ideal: Math.min(11, Math.floor((Math.max(4, rules.absolute_max - 5) + rules.absolute_max) / 2)),
    };
  }
  if ("without_comma" in rules) {
    return {
      min: rules.without_comma.min,
      max: rules.without_comma.acceptable_up_to,
      ideal: rules.without_comma.max
        ? Math.floor((rules.without_comma.min + rules.without_comma.max) / 2)
        : Math.floor((rules.without_comma.min + rules.without_comma.acceptable_up_to) / 2),
    };
  }
  return { min: 5, max: 12, ideal: 9 };
}
