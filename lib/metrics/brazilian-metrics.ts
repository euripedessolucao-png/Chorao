// lib/metrics/brazilian-metrics.ts

import { GENRE_CONFIGS } from "@/lib/genre-config";

export interface GenreMetrics {
  syllableRange: {
    min: number;
    max: number;
    ideal?: number;
  };
  bpmRange: {
    min: number;
    max: number;
    ideal: number;
  };
  commonStructures: string[];
  rhythmicFlexibility: "low" | "medium" | "high";
  rhymePreference: "rich" | "flexible" | "minimal";
}

function extractSyllableRange(config: (typeof GENRE_CONFIGS)[keyof typeof GENRE_CONFIGS]): {
  min: number;
  max: number;
  ideal: number;
} {
  const rules = config.prosody_rules.syllable_count;

  if ("absolute_max" in rules) {
    // Ex: Sertanejo Moderno (máx 12, mas ideal é menor)
    const max = rules.absolute_max;
    const min = Math.max(5, max - 5); // Garante mínimo razoável
    const ideal = Math.min(11, Math.floor((min + max) / 2));
    return { min, max, ideal };
  }

  if ("with_comma" in rules && "without_comma" in rules) {
    // Gêneros com regras mais complexas (ex: Sertanejo Raiz, MPB)
    const min = rules.without_comma.min;
    const max = rules.without_comma.acceptable_up_to;
    const ideal = rules.without_comma.max || Math.floor((min + max) / 2);
    return { min, max, ideal };
  }

  // Fallback seguro
  return { min: 5, max: 12, ideal: 9 };
}

function extractBpmRange(config: (typeof GENRE_CONFIGS)[keyof typeof GENRE_CONFIGS]): {
  min: number;
  max: number;
  ideal: number;
} {
  const bpm = config.harmony_and_rhythm.bpm_range;
  return {
    min: bpm.min,
    max: bpm.max,
    ideal: bpm.ideal,
  };
}

// ✅ Gera métricas dinamicamente a partir de genre-config.ts
export const BRAZILIAN_GENRE_METRICS = Object.fromEntries(
  Object.entries(GENRE_CONFIGS).map(([genre, config]) => {
    const syllableRange = extractSyllableRange(config);
    const bpmRange = extractBpmRange(config);

    return [
      genre,
      {
        syllableRange,
        bpmRange,
        commonStructures: ["VERSO-REFRÃO"],
        rhythmicFlexibility: "medium",
        rhymePreference: "flexible",
      } satisfies GenreMetrics,
    ];
  })
) as { [K in keyof typeof GENRE_CONFIGS]: GenreMetrics };

// Adiciona fallback para gêneros não listados
export const getGenreMetrics = (genre: string): GenreMetrics => {
  return BRAZILIAN_GENRE_METRICS[genre as keyof typeof BRAZILIAN_GENRE_METRICS] || {
    syllableRange: { min: 5, max: 12, ideal: 9 },
    bpmRange: { min: 80, max: 120, ideal: 100 },
    commonStructures: ["VERSO-REFRÃO"],
    rhythmicFlexibility: "medium",
    rhymePreference: "flexible",
  };
};

export type GenreName = keyof typeof BRAZILIAN_GENRE_METRICS;
