import { generateText } from "ai";

export class UltraAggressiveValidator {
  /**
   * 🚨 VALIDAÇÃO ULTRA-AGRESSIVA - REGERA ATÉ FICAR PERFEITO
   */
  static async ultraValidation(lyrics: string, genre: string, theme: string): Promise<string> {
    console.log("🚨 [UltraValidator] Iniciando validação ultra-agressiva...");
    
    let attempts = 0;
    let currentLyrics = lyrics;
    
    while (attempts < 3) { // Máximo 3 tentativas
      attempts++;
      console.log(`🔁 Tentativa ${attempts}/3`);
      
      const hasProblems = this.detectAnyProblems(currentLyrics);
      
      if (!hasProblems) {
        console.log("✅ [UltraValidator] Letra perfeita encontrada!");
        return currentLyrics;
      }
      
      console.log("🚨 Problemas detectados - regenerando...");
      currentLyrics = await this.regenerateWithIronFist(currentLyrics, genre, theme);
    }
    
    console.log("⚠️ [UltraValidator] Máximo de tentativas atingido");
    return currentLyrics;
  }

  /**
   * 🔍 DETECÇÃO BRUTAL DE QUALQUER PROBLEMA
   */
  private static detectAnyProblems(lyrics: string): boolean {
    const lines = lyrics.split('\n');
    
    for (const line of lines) {
      if (this.isProblematicLine(line)) {
        console.log(`❌ LINHA PROBLEMÁTICA: "${line}"`);
        return true;
      }
    }
    
    return false;
  }

  /**
   * 🚫 DETECTA QUALQUER TIPO DE LINHA PROBLEMÁTICA
   */
  private static isProblematicLine(line: string): boolean {
    const trimmed = line.trim();
    
    // Ignora cabeçalhos e metadata
    if (!trimmed || 
        trimmed.startsWith('[') || 
        trimmed.startsWith('(') ||
        trimmed.startsWith('###') ||
        trimmed.includes('Instrumentation') ||
        trimmed.includes('Genre:')) {
      return false;
    }

    // 🚫 PADRÕES PROBLEMÁTICOS ABSOLUTOS
    const problematicPatterns = [
      // Linhas terminando em preposições/artigos
      /\b(e|a|o|que|com|pra|pro|de|da|do|em|no|na|por|me|te|se|um|uma|meu|minha|seu|sua)\s*$/i,
      
      // Linhas terminando em vírgula, traço, etc
      /[,-]\s*$/,
      
      // Palavras cortadas
      /çã$/,
      /ão\s*$/,
      
      // Linhas muito curtas sem pontuação final
      (line: string) => {
        const words = line.split(/\s+/).filter(w => w.length > 0);
        return words.length <= 2 && line.length < 20 && !/[!?.]$/.test(line);
      },
      
      // Frases claramente incompletas
      (line: string) => {
        const incompletePhrases = [
          'minha grande',
          'tudo que eu tenho de',
          'sempre lado',
          'meu coração dispara e fica',
          'cresce de grão em grão',
          'nosso amor se chama cuidado'
        ];
        return incompletePhrases.some(phrase => 
          line.toLowerCase().includes(phrase.toLowerCase())
        );
      }
    ];

    return problematicPatterns.some(pattern => 
      typeof pattern === 'function' ? pattern(trimmed) : pattern.test(trimmed)
    );
  }

  /**
   * 🔥 REGENERAÇÃO COM MÃO DE FERRO
   */
  private static async regenerateWithIronFist(lyrics: string, genre: string, theme: string): Promise<string> {
    const prompt = `🚨🚨 CORREÇÃO ULTRA-DRÁSTICA - ELIMINE TODOS OS PROBLEMAS:

LETRA ATUAL COM PROBLEMAS:
${lyrics}

🚫 ERROS IDENTIFICADOS (CORRIJA TODOS):
• Linhas terminando em "de", "com", "em", "que", "meu", "sempre lado"
• Frases incompletas como "minha grande", "tudo que eu tenho de"
• Palavras cortadas ou estruturas gramaticais quebradas
• Qualquer verso que não seja uma frase completa

✅ REGRAS ABSOLUTAS (NÃO PODE FALHAR):
1. CADA LINHA = FRASE COMPLETA E AUTOCONTIDA
2. ZERO linhas terminando em preposições/artigos
3. ZERO frases cortadas ou incompletas
4. TODOS os versos devem ter sujeito + verbo + complemento
5. MÁXIMO 12 sílabas por verso
6. Estrutura musical coerente para ${genre}

🎯 EXEMPLOS DE CORREÇÃO OBRIGATÓRIOS:
• "minha grande" → "minha grande alegria"
• "tudo que eu tenho de" → "tudo que eu tenho de valor"
• "sempre lado" → "sempre lado a lado"
• "meu coração dispara e fica" → "meu coração dispara e fica acelerado"
• "cresce de grão em grão" → "cresce de grão em grão, se fortalece"

TEMA: ${theme}
GÊNERO: ${genre}

📝 LETRA 100% CORRIGIDA E PERFEITA:`;

    try {
      const { text } = await generateText({
        model: "openai/gpt-4o",
        prompt,
        temperature: 0.1, // Temperatura mínima para máxima consistência
      });

      return this.cleanResponse(text || lyrics);
    } catch (error) {
      console.error("❌ Erro na regeneração ultra-agressiva:", error);
      return lyrics;
    }
  }

  /**
   * 🧼 LIMPEZA SUPER AGRESSIVA
   */
  private static cleanResponse(text: string): string {
    return text
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        return trimmed && 
               !trimmed.startsWith('🚨') &&
               !trimmed.startsWith('🚫') && 
               !trimmed.startsWith('✅') &&
               !trimmed.startsWith('🎯') &&
               !trimmed.startsWith('📝') &&
               !trimmed.startsWith('LETRA') &&
               !trimmed.startsWith('ERROS') &&
               !trimmed.startsWith('REGRAS') &&
               !trimmed.includes('sílabas') &&
               !trimmed.includes('problemas');
      })
      .map(line => line.replace(/^["']|["']$/g, '').trim())
      .join('\n')
      .trim();
  }
}
