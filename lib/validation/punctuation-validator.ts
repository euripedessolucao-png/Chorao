// lib/validation/punctuation-validator.ts

/**
 * Valida e corrige pontuação em letras de música
 * PRESERVA instruções de performance ([...], (...))
 */
export class PunctuationValidator {
  static validate(lyrics: string): {
    isValid: boolean;
    errors: Array<{ line: number; message: string }>;
    correctedLyrics: string;
  } {
    const lines = lyrics.split("\n");
    const errors: Array<{ line: number; message: string }> = [];
    const correctedLines: string[] = [];

    lines.forEach((line, index) => {
      let corrected = line;

      // Pula linhas de instrução (tags e parênteses)
      if (this.isInstructionLine(line)) {
        correctedLines.push(line);
        return;
      }

      // Corrige reticências mal formatadas
      if (corrected.includes(". . .")) {
        corrected = corrected.replace(/\. \. \./g, "...");
        errors.push({ line: index + 1, message: "Reticências mal formatadas" });
      }

      // Corrige espaços antes de pontuação
      corrected = corrected.replace(/\s+([.,!?;:])/g, "$1");

      // Corrige falta de espaço após pontuação (só em letras, não em instruções)
      corrected = corrected.replace(/([.,!?;:])([a-zA-Záàâãéèêíìîóòôõúùû])/g, "$1 $2");

      // Corrige múltiplos espaços
      corrected = corrected.replace(/ {2,}/g, " ");

      // Corrige pontuação excessiva
      corrected = corrected.replace(/!{3,}/g, "!");
      corrected = corrected.replace(/\?{3,}/g, "?");
      corrected = corrected.replace(/\.{4,}/g, "...");

      if (corrected !== line) {
        errors.push({ line: index + 1, message: "Pontuação corrigida" });
      }

      correctedLines.push(corrected);
    });

    return {
      isValid: errors.length === 0,
      errors,
      correctedLyrics: correctedLines.join("\n"),
    };
  }

  /**
   * Verifica se a linha é uma instrução (não deve ser corrigida)
   */
  private static isInstructionLine(line: string): boolean {
    const trimmed = line.trim();
    return (
      trimmed.startsWith("[") ||
      trimmed.startsWith("(") ||
      trimmed.startsWith("{") ||
      trimmed.includes("Instruments:") ||
      trimmed.includes("BPM:") ||
      trimmed.includes("Key:")
    );
  }

  static hasProblems(lyrics: string): boolean {
    const result = this.validate(lyrics);
    return !result.isValid;
  }

  static fix(lyrics: string): string {
    const result = this.validate(lyrics);
    return result.correctedLyrics;
  }
}
