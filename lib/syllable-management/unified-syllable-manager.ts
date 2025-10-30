import { generateText } from "ai";
import { countSyllablesSingingPtBr } from "../validation/singing-syllable-counter";

/**
 * 🎵 GESTOR UNIFICADO DE SÍLABAS
 * Substitui: intelligentRewriter + intelligentSyllableReducer + ultraAggressiveSyllableReducer
 */
export class UnifiedSyllableManager {
  private static readonly MAX_SYLLABLES = 12;

  /**
   * Gestor balanceado: reescreve → reduz → corta (como você propôs)
   */
  static async balancedSyllableManager(verse: string): Promise<string> {
    const maxSyllables = this.MAX_SYLLABLES;

    // 1. Contagem inicial
    let currentCount = this.countSyllables(verse);
    if (currentCount <= maxSyllables) return verse;

    console.log(`🔧 [UnifiedManager] "${verse}" → ${currentCount} sílabas`);

    // 2. Primeira tentativa: reescrita inteligente
    let rewritten = await this.intelligentRewriter(verse);
    currentCount = this.countSyllables(rewritten);
    if (currentCount <= maxSyllables) {
      console.log(`✅ Reescreveu: "${rewritten}" → ${currentCount} sílabas`);
      return rewritten;
    }

    // 3. Segunda tentativa: redução inteligente
    let reduced = await this.intelligentSyllableReducer(rewritten);
    currentCount = this.countSyllables(reduced);
    if (currentCount <= maxSyllables) {
      console.log(`✅ Reduziu: "${reduced}" → ${currentCount} sílabas`);
      return reduced;
    }

    // 4. Último recurso: corte agressivo
    let aggressive = await this.ultraAggressiveSyllableReducer(reduced);
    currentCount = this.countSyllables(aggressive);
    
    console.log(`✂️ Corte final: "${aggressive}" → ${currentCount} sílabas`);
    return aggressive;
  }

  /**
   * 1ª CAMADA: Reescrever inteligentemente
   */
  private static async intelligentRewriter(verse: string): Promise<string> {
    try {
      const prompt = `REESCREVA este verso brasileiro para ter no máximo ${this.MAX_SYLLABLES} sílabas:
      
Verso: "${verse}"

TÉCNICAS:
• Use elisões naturais: "de amor" → "d'amor", "que eu" → "qu'eu"  
• Contrações: "você" → "cê", "para" → "pra", "estou" → "tô"
• Sinônimos mais curtos: "transformou" → "mudou", "encontrar" → "achar"
• Mantenha o significado e fluência

Verso reescrito:`;

      const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt,
        temperature: 0.3,
        maxTokens: 100,
      });

      return text?.trim().replace(/^["']|["']$/g, '') || verse;
    } catch (error) {
      console.warn("❌ Erro no rewriter:", error);
      return verse;
    }
  }

  /**
   * 2ª CAMADA: Redução inteligente de sílabas
   */
  private static async intelligentSyllableReducer(verse: string): Promise<string> {
    // Técnicas automáticas de redução
    let reduced = verse;

    // Contrações automáticas
    const contractions = [
      { regex: /\bvocê\b/gi, replacement: "cê" },
      { regex: /\bpara\b/gi, replacement: "pra" },
      { regex: /\bestou\b/gi, replacement: "tô" },
      { regex: /\bestá\b/gi, replacement: "tá" },
      { regex: /\bcomigo\b/gi, replacement: "c'migo" },
      { regex: /\bde\s+([aeiou])/gi, replacement: "d'$1" },
      { regex: /\bem\s+([aeiou])/gi, replacement: "n'$1" },
    ];

    for (const contraction of contractions) {
      reduced = reduced.replace(contraction.regex, contraction.replacement);
      if (this.countSyllables(reduced) <= this.MAX_SYLLABLES) break;
    }

    // Remove palavras desnecessárias se ainda estiver longo
    if (this.countSyllables(reduced) > this.MAX_SYLLABLES) {
      const removals = ['o', 'a', 'um', 'uma', 'de', 'em', 'por', 'para', 'com'];
      const words = reduced.split(' ');
      
      for (let i = words.length - 1; i >= 0; i--) {
        if (removals.includes(words[i].toLowerCase())) {
          const testLine = words.filter((_, idx) => idx !== i).join(' ');
          if (this.countSyllables(testLine) <= this.MAX_SYLLABLES) {
            reduced = testLine;
            break;
          }
        }
      }
    }

    return reduced;
  }

  /**
   * 3ª CAMADA: Redução agressiva (último recurso)
   */
  private static async ultraAggressiveSyllableReducer(verse: string): Promise<string> {
    let aggressive = verse;
    const words = aggressive.split(' ').filter(w => w.trim());
    
    // Corte progressivo do final
    while (words.length > 1 && this.countSyllables(words.join(' ')) > this.MAX_SYLLABLES) {
      words.pop();
      aggressive = words.join(' ');
    }

    // Se ainda estiver longo, corta para a primeira palavra significativa
    if (this.countSyllables(aggressive) > this.MAX_SYLLABLES && words.length > 0) {
      aggressive = words.slice(0, Math.min(3, words.length)).join(' ');
    }

    return aggressive || verse.split(' ')[0] || verse;
  }

  /**
   * Contador unificado de sílabas
   */
  private static countSyllables(text: string): number {
    return countSyllablesSingingPtBr(text, {
      applyElisions: true,
      applyContractions: true,
    });
  }

  /**
   * Processa música inteira mantendo estrutura
   */
  static async processSongWithBalance(lyrics: string): Promise<string> {
    const lines = lyrics.split("\n");
    const processed: string[] = [];
    let corrections = 0;

    for (const line of lines) {
      // Mantém cabeçalhos, marcações e linhas vazias
      if (line.trim().length === 0 || line.startsWith("[") || line.startsWith("(") || line.includes("Instruments:")) {
        processed.push(line);
        continue;
      }

      const originalSyllables = this.countSyllables(line);
      
      if (originalSyllables <= this.MAX_SYLLABLES) {
        processed.push(line);
      } else {
        const adjusted = await this.balancedSyllableManager(line);
        processed.push(adjusted);
        corrections++;
        
        if (line !== adjusted) {
          console.log(`📝 Corrigido: "${line}" → "${adjusted}" (${originalSyllables} → ${this.countSyllables(adjusted)} sílabas)`);
        }
      }
    }

    console.log(`🎯 [UnifiedManager] ${corrections} linhas corrigidas`);
    return processed.join("\n");
  }

  /**
   * Validação rápida se música está dentro dos limites
   */
  static validateSong(lyrics: string): { isValid: boolean; violations: string[] } {
    const lines = lyrics.split("\n");
    const violations: string[] = [];

    lines.forEach((line, index) => {
      if (line.trim() && !line.startsWith("[") && !line.startsWith("(") && !line.includes("Instruments:")) {
        const syllables = this.countSyllables(line);
        if (syllables > this.MAX_SYLLABLES) {
          violations.push(`Linha ${index + 1}: "${line}" (${syllables} sílabas)`);
        }
      }
    });

    return {
      isValid: violations.length === 0,
      violations
    };
  }
}
