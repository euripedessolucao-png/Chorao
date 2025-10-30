import { generateText } from "ai";

export class NuclearValidator {
  private static readonly BROKEN_PATTERNS = [
    /\b(e|a|o|que|com|pra|pro|num|numa|de|da|do|em|no|na|por|me|te|se|um|uma|meu|minha|seu|sua|nosso|nossa|todo|toda|todos|todas|alguns|algumas|muito|muita|pouco|pouca|sem|com|para|porque|quando|onde|como)\s*$/i,
    /[,-]\s*$/,
    /çã$/,
    /\.\.\.$/,
    /…$/,
    (line: string) => {
      const words = line.split(/\s+/).filter(w => w.length > 0);
      return words.length <= 2 && line.length < 25 && !/[!?.]$/.test(line);
    }
  ];

  /**
   * 🚨 VALIDAÇÃO NUCLEAR - DETECTA E CORRIGE TODAS AS LINHAS QUEBRADAS
   */
  static async nuclearValidation(lyrics: string): Promise<string> {
    console.log("🚨 [NuclearValidator] Iniciando validação nuclear...");
    
    const lines = lyrics.split('\n');
    let hasBrokenLines = false;
    const brokenLines: number[] = [];

    // 🔍 DETECÇÃO BRUTAL
    for (let i = 0; i < lines.length; i++) {
      if (this.isBrokenLine(lines[i])) {
        console.log(`❌ LINHA ${i + 1} QUEBRADA: "${lines[i]}"`);
        brokenLines.push(i);
        hasBrokenLines = true;
      }
    }

    // 🚨 SE ENCONTRAR LINHAS QUEBRADAS, REGERA COMPLETAMENTE
    if (hasBrokenLines) {
      console.log(`🚨 ${brokenLines.length} LINHAS QUEBRADAS ENCONTRADAS - REGERANDO LETRA COMPLETA`);
      return await this.regenerateCompleteLyrics(lyrics, brokenLines);
    }

    console.log("✅ [NuclearValidator] Nenhuma linha quebrada encontrada");
    return lyrics;
  }

  private static isBrokenLine(line: string): boolean {
    const trimmed = line.trim();
    
    // Ignora cabeçalhos, metadata e linhas vazias
    if (!trimmed || 
        trimmed.startsWith('### [') || 
        trimmed.startsWith('(Instrumentation)') || 
        trimmed.startsWith('(Genre)') ||
        trimmed.startsWith('[Intro]') ||
        trimmed.startsWith('[Verso') ||
        trimmed.startsWith('[Pré-Refrão]') ||
        trimmed.startsWith('[Refrão]') ||
        trimmed.startsWith('[Ponte]') ||
        trimmed.startsWith('[Outro]')) {
      return false;
    }

    return this.BROKEN_PATTERNS.some(pattern => 
      typeof pattern === 'function' ? pattern(trimmed) : pattern.test(trimmed)
    );
  }

  /**
   * 🎯 REGERAÇÃO COMPLETA COM PROMPT SUPER-EFETIVO
   */
  private static async regenerateCompleteLyrics(brokenLyrics: string, brokenLines: number[]): Promise<string> {
    const prompt = `🚨 CORRIJA IMEDIATAMENTE ESTA LETRA COM LINHAS QUEBRADAS:

LETRA COM PROBLEMAS GRAVES:
${brokenLyrics}

🚫 ERROS CRÍTICOS IDENTIFICADOS (linhas ${brokenLines.map(l => l + 1).join(', ')}):
• Linhas terminando em "coraçã", "meu", "teu", "que", "de", "em", "com"
• Frases cortadas no meio como "ilumina meu", "encontro a paz que eu"
• Estruturas incompletas como "fica", "tã", "sinto tã"
• Palavras pela metade como "coraçã" (deveria ser "coração")

✅ REGRAS ABSOLUTAS - NÃO PODE FALHAR:
1. TODAS as linhas devem ser COMPLETAS e fazer sentido
2. ZERO linhas quebradas ou cortadas
3. 8-12 sílabas por verso
4. Estrutura coerente: Intro → Verso 1 → Pré-Refrão → Refrão → Verso 2 → Refrão → Ponte → Refrão → Outro
5. Refrão IDÊNTICO nas 3 repetições
6. Linguagem natural do sertanejo moderno

🎯 EXEMPLOS DE CORREÇÃO OBRIGATÓRIOS:
• "Hoje eu tô aqui com o coraçã" → "Hoje eu tô aqui com o coração aberto"
• "Teu sorriso é luz que ilumina meu" → "Teu sorriso é luz que ilumina meu caminho"  
• "Nos teus braços eu encontro a paz que eu" → "Nos teus braços eu encontro a paz que eu preciso"
• "Amor sincero, é você a minha" → "Amor sincero, é você a minha vida inteira"
• "Meu coração, fica" → "Meu coração fica tranquilo ao teu lado"
• "Com você ao, eu me sinto tã" → "Com você ao lado, eu me sinto tão completo"

📝 LETRA COMPLETAMENTE CORRIGIDA (APENAS A LETRA, sem explicações):`;

    try {
      const { text } = await generateText({
        model: "openai/gpt-4o",
        prompt,
        temperature: 0.3, // Baixa temperatura para consistência
        maxTokens: 2000,
      });

      if (!text) {
        console.error("❌ Resposta vazia do GPT");
        return brokenLyrics;
      }

      // 🔥 LIMPEZA SUPER AGRESSIVA
      const cleaned = this.cleanGPTResponse(text);
      
      // ✅ VALIDAÇÃO FINAL - SE AINDA TIVER PROBLEMAS, TENTA NOVAMENTE
      const finalValidation = cleaned.split('\n').some(line => this.isBrokenLine(line));
      
      if (finalValidation) {
        console.log("⚠️ Primeira tentativa falhou - tentando novamente com prompt mais forte...");
        return await this.emergencyRegeneration(cleaned);
      }

      console.log("✅ [NuclearValidator] Regeneração concluída com sucesso");
      return cleaned;

    } catch (error) {
      console.error("❌ Erro crítico na regeneração:", error);
      return brokenLyrics;
    }
  }

  /**
   * 🆘 REGENERAÇÃO DE EMERGÊNCIA
   */
  private static async emergencyRegeneration(lyrics: string): Promise<string> {
    const prompt = `🚨🚨 CORREÇÃO DE EMERGÊNCIA - ELIMINE TODAS AS LINHAS QUEBRADAS:

LETRA AINDA COM PROBLEMAS:
${lyrics}

🚫 INSTRUÇÃO ABSOLUTA:
- CORRIJA CADA LINHA QUEBRADA
- COMPLETE TODAS AS FRASES INCOMPLETAS  
- GARANTA QUE CADA VERSO TENHA SUJEITO + VERBO + COMPLEMENTO
- ZERO linhas terminando em preposições, artigos ou palavras cortadas

✅ RESULTADO EXIGIDO:
Letra 100% completa e coerente, pronta para gravação

LETRA CORRIGIDA DEFINITIVA:`;

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.1, // Temperatura mínima para máxima consistência
      maxTokens: 2000,
    });

    return this.cleanGPTResponse(text || lyrics);
  }

  /**
   * 🧹 LIMPEZA SUPER AGRESSIVA DA RESPOSTA DO GPT
   */
  private static cleanGPTResponse(text: string): string {
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
               !trimmed.startsWith('Regras:') &&
               !trimmed.startsWith('INSTRUÇÃO') &&
               !trimmed.startsWith('RESULTADO') &&
               !trimmed.includes('sílabas') &&
               !trimmed.includes('linhas quebradas') &&
               !trimmed.includes('CORRIJA') &&
               !trimmed.includes('EXEMPLOS');
      })
      .map(line => line.replace(/^["']|["']$/g, '').trim())
      .join('\n')
      .trim();
  }
}
