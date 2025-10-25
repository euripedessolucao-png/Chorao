// lib/validation/absolute-syllable-enforcer.ts

import { countPoeticSyllables } from "./syllable-counter-brasileiro"
import { GENRE_CONFIGS } from "@/lib/genre-config"

// ✅ MANTENHA A CLASSE ANTIGA (para compatibilidade)
export class AbsoluteSyllableEnforcer {
  private static readonly ABSOLUTE_MAX_SYLLABLES = 11

  static validate(lyrics: string) {
    // ... implementação antiga com limite fixo de 11 sílabas
    const lines = lyrics.split("\n")
    const violations = []
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(")) continue
      const syllables = countPoeticSyllables(trimmed)
      if (syllables > this.ABSOLUTE_MAX_SYLLABLES) {
        violations.push({ line: trimmed, syllables, lineNumber: lines.indexOf(line) + 1 })
      }
    }
    return {
      isValid: violations.length === 0,
      violations,
      message: violations.length === 0 
        ? "✅ APROVADO: Todos os versos têm no máximo 11 sílabas" 
        : `❌ BLOQUEADO: ${violations.length} verso(s) com mais de 11 sílabas`
    }
  }
}

// ✅ ADICIONE A FUNÇÃO NOVA (com suporte a gênero)
export function validateSyllablesByGenre(
  lyrics: string,
  genre: string
): {
  isValid: boolean;
  violations: Array<{ line: string; syllables: number; lineNumber: number }>;
  message: string;
  maxSyllables: number;
} {
  const config = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS];
  let maxSyllables = 11;

  if (config) {
    const rules = config.prosody_rules.syllable_count;
    if ("absolute_max" in rules) {
      maxSyllables = rules.absolute_max;
    } else if ("without_comma" in rules) {
      maxSyllables = rules.without_comma.acceptable_up_to;
    }
  }

  const lines = lyrics.split("\n");
  const violations = [];

  for (const [index, line] of lines.entries()) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith("(")) continue;
    
    const syllables = countPoeticSyllables(trimmed);
    if (syllables > maxSyllables) {
      violations.push({ line: trimmed, syllables, lineNumber: index + 1 });
    }
  }

  const isValid = violations.length === 0;
  const message = isValid
    ? `✅ APROVADO: Todos os versos respeitam o limite de ${maxSyllables} sílabas (${genre})`
    : `❌ BLOQUEADO: ${violations.length} verso(s) com mais de ${maxSyllables} sílabas (${genre})`;

  return { isValid, violations, message, maxSyllables };
}
