// lib/utils/line-stacker.ts

import { countPoeticSyllables } from "@/lib/validation/syllable-counter-brasileiro";

export interface StackingResult {
  stackedLyrics: string;
  stackingScore: number;
  improvements: string[];
}

export class LineStacker {
  /**
   * Formata letra no padrão profissional brasileiro: UM VERSO POR LINHA
   */
  static stackLines(lyrics: string): StackingResult {
    const lines = lyrics.split('\n');
    const formattedLines: string[] = [];
    const improvements: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Mantém tags, linhas vazias e instruções
      if (!trimmed || trimmed.startsWith('[') || trimmed.startsWith('(')) {
        formattedLines.push(line);
        continue;
      }

      // Divide versos longos com vírgula em duas linhas (regra do empilhamento brasileiro)
      if (trimmed.includes(',')) {
        const [part1, part2] = trimmed.split(',', 2);
        const cleanPart1 = part1.trim();
        const cleanPart2 = part2 ? part2.trim() : '';

        if (cleanPart1 && cleanPart2) {
          // Valida se a divisão faz sentido métrico
          const syllables1 = countPoeticSyllables(cleanPart1);
          const syllables2 = countPoeticSyllables(cleanPart2);
          
          if (syllables1 <= 8 && syllables2 <= 8) {
            formattedLines.push(cleanPart1 + ',');
            formattedLines.push(cleanPart2);
            improvements.push(`✓ Dividido em duas linhas: "${cleanPart1}, / ${cleanPart2}"`);
            continue;
          }
        }
      }

      // Mantém verso inteiro
      formattedLines.push(trimmed);
    }

    return {
      stackedLyrics: formattedLines.join('\n'),
      stackingScore: this.calculateStackingScore(formattedLines),
      improvements,
    };
  }

  private static calculateStackingScore(lines: string[]): number {
    const contentLines = lines.filter(l => 
      l.trim() && !l.startsWith('[') && !l.startsWith('(')
    );
    
    if (contentLines.length === 0) return 1;
    
    // Pontuação: quanto mais versos dentro do limite ideal (6-12 sílabas), melhor
    const validLines = contentLines.filter(line => {
      const syllables = countPoeticSyllables(line.replace(/,$/, ''));
      return syllables >= 6 && syllables <= 12;
    });
    
    return validLines.length / contentLines.length;
  }
}
