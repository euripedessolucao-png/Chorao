// lib/validation/chorus-validator.ts - VERSÃO COMPATÍVEL COM NOVO SISTEMA

import { countPoeticSyllables } from "./syllable-counter-brasileiro"
import { UNIVERSAL_RULES, getRhymeRulesForGenre } from "./universal-rhyme-rules"

// ✅ Interface compatível com o sistema atual
export interface ChorusOption {
  chorus: string;
  style: string;
  score: number;
  justification: string;
  lines: string[];
}

export interface ChorusValidation {
  isValid: boolean;
  score: number;
  stickyHookFound: string | null;
  emotionalHook: string | null;
  isVisual: boolean;
  rhymeQuality: "rich" | "poor" | "false" | "none";
  errors: string[];
  warnings: string[];
}

export interface ChorusBatchResult {
  all: Array<ChorusOption & { validation: ChorusValidation }>;
  valid: Array<ChorusOption & { validation: ChorusValidation }>;
  best: (ChorusOption & { validation: ChorusValidation }) | null;
}

/**
 * ✅ VALIDADOR ATUALIZADO - USA REGRAS UNIVERSAIS
 */
export function validateChorus(chorus: ChorusOption, genre: string = "sertanejo"): ChorusValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // ✅ USA REGRAS UNIVERSAIS
  const rhymeRules = getRhymeRulesForGenre(genre);
  const maxSyllables = UNIVERSAL_RULES.syllables.max_syllables;

  // 1. VALIDAÇÃO DE ESTRUTURA
  const lineCount = chorus.lines.length;
  if (lineCount === 0) {
    errors.push("Refrão vazio");
    score -= 100;
  } else if (lineCount < 2 || lineCount > 6) {
    warnings.push(`Refrão ideal tem 4-6 linhas (tem ${lineCount})`);
    score -= 10;
  }

  // 2. VALIDAÇÃO DE SÍLABAS (REGRAS UNIVERSAIS)
  const syllableIssues: string[] = [];
  let totalSyllables = 0;
  
  for (const [i, line] of chorus.lines.entries()) {
    const syllables = countPoeticSyllables(line);
    totalSyllables += syllables;
    
    if (syllables > maxSyllables) {
      syllableIssues.push(`Linha ${i + 1}: ${syllables} sílabas (máx: ${maxSyllables})`);
      score -= 12; // Penalidade maior para violação do máximo
    } else if (syllables < UNIVERSAL_RULES.syllables.ideal_range.min) {
      syllableIssues.push(`Linha ${i + 1}: muito curta (${syllables}s)`);
      score -= 5;
    }
    
    // Valida respirabilidade
    const wordCount = line.split(/\s+/).length;
    if (wordCount > UNIVERSAL_RULES.breathability.max_words_per_line) {
      warnings.push(`Linha ${i + 1}: muito longa para cantar confortavelmente`);
      score -= 3;
    }
  }
  
  if (syllableIssues.length > 0) {
    errors.push(...syllableIssues);
  }

  // 3. DETECÇÃO DE CLICHÊS (COMPATÍVEL COM TERCEIRA VIA)
  const clicheLines = chorus.lines.filter(line => hasAICliche(line));
  if (clicheLines.length > 0) {
    warnings.push(`${clicheLines.length} linha(s) com possíveis clichês de IA`);
    score -= clicheLines.length * 3;
  }

  // 4. GANCHOS E ELEMENTOS EMOCIONAIS
  const stickyHook = extractStickyHook(chorus.lines);
  const emotionalHook = extractEmotionalHook(chorus.lines);
  
  if (!stickyHook && !emotionalHook) {
    warnings.push("Falta gancho memorável claro");
    score -= 15;
  } else if (stickyHook) {
    score += 10; // Bônus por gancho pegajoso
  }

  // 5. QUALIDADE DE RIMA (REGRAS UNIVERSAIS)
  const rhymeAnalysis = analyzeRhymeQuality(chorus.lines, rhymeRules);
  
  if (rhymeAnalysis.richRhymeRatio < rhymeRules.min_rich_rhymes) {
    warnings.push(`Poucas rimas ricas (${(rhymeAnalysis.richRhymeRatio * 100).toFixed(0)}% < ${(rhymeRules.min_rich_rhymes * 100).toFixed(0)}%)`);
    score -= 10;
  }
  
  if (rhymeAnalysis.falseRhymeRatio > rhymeRules.max_false_rhymes) {
    warnings.push(`Muitas rimas falsas (${(rhymeAnalysis.falseRhymeRatio * 100).toFixed(0)}% > ${(rhymeRules.max_false_rhymes * 100).toFixed(0)}%)`);
    score -= 15;
  }

  // 6. ELEMENTOS VISUAIS (BÔNUS)
  const isVisual = hasVisualElement(chorus.lines);
  if (isVisual) {
    score += 5; // Bônus por imagens visuais
  }

  // 7. NATURALIDADE
  const unnaturalLines = chorus.lines.filter(line => soundsUnnatural(line));
  if (unnaturalLines.length > 0) {
    warnings.push(`${unnaturalLines.length} linha(s) soam artificiais`);
    score -= unnaturalLines.length * 2;
  }

  const finalScore = Math.max(0, Math.round(score));

  return {
    isValid: finalScore >= 70,
    score: finalScore,
    stickyHookFound: stickyHook,
    emotionalHook,
    isVisual,
    rhymeQuality: rhymeAnalysis.overallQuality,
    errors,
    warnings,
  };
}

// ─── FUNÇÕES AUXILIARES ATUALIZADAS ──────────────────────────────

function hasAICliche(line: string): boolean {
  const cliches = [
    'coração aberto', 'gratidão transbordando', 'amor infinito',
    'tua luz', 'minha alma', 'cada amanhecer', 'tua presença',
    'nos braços de', 'minha vida', 'é uma bênção', 'Deus me deu'
  ];
  const lowerLine = line.toLowerCase();
  return cliches.some(cliche => lowerLine.includes(cliche));
}

function hasVisualElement(lines: string[]): boolean {
  const visualTriggers = [
    /\b(luar|sol|chuva|rio|mar|cidade|noite|manhã|janela|rua)\b/i,
    /\b(vermelho|azul|branco|dourado|escuro)\b/i,
    /\b(sorrindo|chorando|dançando|andando|correndo)\b/i,
    /\b(café|vinho|chuveiro|carro|cama)\b/i // Elementos concretos
  ];
  return lines.some(line => visualTriggers.some(regex => regex.test(line)));
}

function extractStickyHook(lines: string[]): string | null {
  // Busca frases curtas e repetitivas
  const fullText = lines.join(" ").toLowerCase();
  const words = fullText.split(/\s+/).filter(word => word.length > 2);
  
  // Conta frequência de palavras
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    const cleanWord = word.replace(/[.,!?;:]$/, '');
    if (cleanWord.length > 2) {
      wordCount[cleanWord] = (wordCount[cleanWord] || 0) + 1;
    }
  });
  
  // Encontra palavras mais frequentes
  const frequentWords = Object.entries(wordCount)
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1]);
  
  return frequentWords[0]?.[0] || null;
}

function extractEmotionalHook(lines: string[]): string | null {
  const emotionalWords = [
    'amor', 'dor', 'saudade', 'vida', 'coração', 'fé', 'esperança',
    'medo', 'verdade', 'mentira', 'partir', 'ficar', 'lembrar'
  ];
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (emotionalWords.some(word => lowerLine.includes(word))) {
      // Retorna a linha inteira se for curta, senão extrai a parte emocional
      if (line.length <= 40) return line;
      
      // Encontra a palavra emocional e pega contexto
      for (const word of emotionalWords) {
        if (lowerLine.includes(word)) {
          const index = lowerLine.indexOf(word);
          const start = Math.max(0, index - 20);
          const end = Math.min(lowerLine.length, index + word.length + 20);
          return line.substring(start, end).trim();
        }
      }
    }
  }
  return null;
}

function analyzeRhymeQuality(lines: string[], rhymeRules: any) {
  if (lines.length < 2) {
    return { richRhymeRatio: 0, falseRhymeRatio: 0, overallQuality: "none" as const };
  }

  let richRhymes = 0;
  let poorRhymes = 0;
  let falseRhymes = 0;
  let totalComparisons = 0;

  // Analisa pares de linhas consecutivas
  for (let i = 0; i < lines.length - 1; i += 2) {
    const line1 = lines[i];
    const line2 = lines[i + 1];
    
    if (line1 && line2) {
      const quality = classifyRhyme(line1, line2, rhymeRules);
      totalComparisons++;
      
      switch (quality) {
        case "rich": richRhymes++; break;
        case "poor": poorRhymes++; break;
        case "false": falseRhymes++; break;
      }
    }
  }

  const richRhymeRatio = totalComparisons > 0 ? richRhymes / totalComparisons : 0;
  const falseRhymeRatio = totalComparisons > 0 ? falseRhymes / totalComparisons : 0;

  let overallQuality: "rich" | "poor" | "false" | "none" = "none";
  if (richRhymeRatio >= rhymeRules.min_rich_rhymes) {
    overallQuality = "rich";
  } else if (falseRhymeRatio <= rhymeRules.max_false_rhymes) {
    overallQuality = "poor";
  } else {
    overallQuality = "false";
  }

  return { richRhymeRatio, falseRhymeRatio, overallQuality };
}

function classifyRhyme(line1: string, line2: string, rhymeRules: any): "rich" | "poor" | "false" {
  const getLastWord = (line: string) => {
    const words = line.trim().split(/\s+/);
    return words[words.length - 1]?.toLowerCase() || "";
  };

  const word1 = getLastWord(line1);
  const word2 = getLastWord(line2);

  if (!word1 || !word2) return "false";

  // Normaliza palavras (remove acentos)
  const normalize = (word: string) => 
    word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const norm1 = normalize(word1);
  const norm2 = normalize(word2);

  // Rima rica: últimas 3 letras iguais
  if (norm1.slice(-3) === norm2.slice(-3) && norm1 !== norm2) {
    return "rich";
  }

  // Rima pobre: últimas 2 letras iguais ou assonância
  if (norm1.slice(-2) === norm2.slice(-2)) {
    return "poor";
  }

  // Assonância (apenas vogais finais iguais)
  if (rhymeRules.allow_assonance) {
    const vowel1 = norm1.match(/[aeiouáéíóúâêîôûãõ]$/i)?.[0];
    const vowel2 = norm2.match(/[aeiouáéíóúâêîôûãõ]$/i)?.[0];
    if (vowel1 && vowel2 && vowel1 === vowel2) {
      return "poor";
    }
  }

  return "false";
}

function soundsUnnatural(line: string): boolean {
  const unnaturalPatterns = [
    /muito\s+(muito|extremamente)/i,
    /(sempre|nunca)\s+(sempre|nunca)/i,
    /coração\s+palpitante/i,
    /lágrimas\s+rolando/i,
    /alma\s+ferida/i,
    /\b(eu|você)\s+(eu|você)\b/i, // Repetição desnecessária
  ];
  return unnaturalPatterns.some(p => p.test(line));
}

// ✅ BATCH VALIDATION (COMPATÍVEL)
export function validateChorusBatch(choruses: ChorusOption[], genre: string = "sertanejo"): ChorusBatchResult {
  const validated = choruses.map((chorus) => ({
    ...chorus,
    validation: validateChorus(chorus, genre),
  }));

  const valid = validated.filter((c) => c.validation.isValid);
  const best = valid.length > 0
    ? valid.reduce((prev, curr) => 
        curr.validation.score > prev.validation.score ? curr : prev
      )
    : null;

  return { all: validated, valid, best };
}

// ✅ FUNÇÃO DE CONVERSÃO PARA O SISTEMA ATUAL
export function convertToChorusOption(chorusData: any): ChorusOption {
  return {
    chorus: chorusData.chorus || "",
    style: chorusData.style || "padrão",
    score: chorusData.score || 0,
    justification: chorusData.justification || "",
    lines: chorusData.chorus?.split("/").map((line: string) => line.trim()) || []
  };
}
