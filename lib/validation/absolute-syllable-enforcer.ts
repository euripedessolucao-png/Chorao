// lib/validation/absolute-syllable-enforcer.ts

import { countPoeticSyllables } from "./syllable-counter-brasileiro"
import { GENRE_CONFIGS } from "@/lib/genre-config"

/**
 * Valida sílabas usando as regras REAIS do gênero
 */
export function validateSyllablesByGenre(
  lyrics: string,
  genre: string
): {
  isValid: boolean;
  violations: Array<{ line: string; syllables: number; lineNumber: number }>;
  message: string;
  maxSyllables: number; // limite real usado
} {
  const config = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS];
  let maxSyllables = 11; // fallback seguro

  if (config) {
    const rules = config.prosody_rules.syllable_count;
    if ("absolute_max" in rules) {
      maxSyllables = rules.absolute_max;
    } else if ("without_comma" in rules) {
      maxSyllables = rules.without_comma.acceptable_up_to;
    }
  }

  const lines = lyrics.split("\n");
  const violations: Array<{ line: string; syllables: number; lineNumber: number }> = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(") || trimmed.includes("Instruments:")) {
      return;
    }

    const syllables = countPoeticSyllables(trimmed);
    if (syllables > maxSyllables) {
      violations.push({
        line: trimmed,
        syllables,
        lineNumber: index + 1,
      });
    }
  });

  const isValid = violations.length === 0;
  let message = "";
  
  if (!isValid) {
    message = `❌ BLOQUEADO: ${violations.length} verso(s) com mais de ${maxSyllables} sílabas (limite do gênero ${genre})`;
    violations.forEach((v) => {
      message += `\n  Linha ${v.lineNumber}: "${v.line}" (${v.syllables} sílabas)`;
    });
  } else {
    message = `✅ APROVADO: Todos os versos respeitam o limite de ${maxSyllables} sílabas (${genre})`;
  }

  return {
    isValid,
    violations,
    message,
    maxSyllables,
  };
}
