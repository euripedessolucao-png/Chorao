// lib/validation/chorus-validator.ts - VERSÃO SIMPLIFICADA E COMPATÍVEL

import { UnifiedSyllableManager } from "@/lib/syllable-management/unified-syllable-manager"
import { countPoeticSyllables } from "./syllable-counter-brasileiro"

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
 * ✅ VALIDADOR SIMPLIFICADO - USA NOSSO SISTEMA UNIFICADO
 */
export function validateChorus(chorus: ChorusOption, genre: string = "sertanejo"): ChorusValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // ✅ 1. VALIDAÇÃO DE ESTRUTURA
  const lineCount = chorus.lines.length;
  if (lineCount === 0) {
    errors.push("Refrão vazio");
    score -= 100;
  } else if (lineCount < 2 || lineCount > 6) {
    errors.push(`Refrão deve ter 2-6 linhas (tem ${lineCount})`);
    score -= 20;
  }

  // ✅ 2. VALIDAÇÃO DE SÍLABAS (USANDO SISTEMA UNIFICADO)
  const syllableIssues: string[] = [];
  for (const [i, line] of chorus.lines.entries()) {
    const syllables = countPoeticSyllables(line);
    if (syllables > 12) { // ✅ MESMA REGRA DO UNIFIED_SYLLABLE_MANAGER
      syllableIssues.push(`Linha ${i + 1}: ${syllables} sílabas (máx: 12)`);
      score -= 10;
    } else if (syllables < 5) {
      syllableIssues.push(`Linha ${i + 1}: muito curta (${syllables}s)`);
      score -= 5;
    }
  }
  if (syllableIssues.length > 0) {
    errors.push(...syllableIssues);
  }

  // ✅ 3. DETECÇÃO DE CLICHÊS (COMPATÍVEL COM TERCEIRA VIA)
  for (const [i, line] of chorus.lines.entries()) {
    if (hasAICliche(line)) {
      warnings.push(`Linha ${i + 1}: possível clichê de IA`);
      score -= 5;
    }
  }

  // ✅ 4. GANCHOS E ELEMENTOS EMOCIONAIS
  const stickyHook = extractStickyHook(chorus.lines);
  const emotionalHook = extractEmotionalHook(chorus.lines);
  
  if (!stickyHook && !emotionalHook) {
    warnings.push("Falta gancho memorável claro");
    score -= 10;
  }

  // ✅ 5. QUALIDADE BÁSICA DE RIMA
  const rhymeQuality = assessBasicRhymeQuality(chorus.lines);
  if (rhymeQuality === "false" && lineCount >= 2) {
    warnings.push("Rima pode ser melhorada");
    score -= 5;
  }

  const finalScore = Math.max(0, score);

  return {
    isValid: finalScore >= 70, // Limite mais flexível
    score: finalScore,
    stickyHookFound: stickyHook,
    emotionalHook,
    isVisual: hasVisualElement(chorus.lines),
    rhymeQuality,
    errors,
    warnings,
  };
}

// ─── FUNÇÕES AUXILIARES SIMPLIFICADAS ──────────────────────────────

function hasAICliche(line: string): boolean {
  const cliches = [
    'coração aberto', 'gratidão transbordando', 'amor infinito',
    'tua luz', 'minha alma', 'cada amanhecer', 'tua presença'
  ];
  const lowerLine = line.toLowerCase();
  return cliches.some(cliche => lowerLine.includes(cliche));
}

function hasVisualElement(lines: string[]): boolean {
  const visualTriggers = [
    /\b(luar|sol|chuva|rio|mar|cidade|noite|manhã)\b/i,
    /\b(vermelho|azul|branco)\b/i,
    /\b(sorrindo|chorando|dançando)\b/i,
  ];
  return lines.some(line => visualTriggers.some(regex => regex.test(line)));
}

function extractStickyHook(lines: string[]): string | null {
  // Busca frases curtas e repetitivas
  const fullText = lines.join(" ").toLowerCase();
  const words = fullText.split(/\s+/);
  
  // Conta frequência de palavras
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    if (word.length > 3) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  // Encontra palavras mais frequentes
  const frequentWords = Object.entries(wordCount)
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1]);
  
  return frequentWords[0]?.[0] || null;
}

function extractEmotionalHook(lines: string[]): string | null {
  const emotionalWords = ['amor', 'dor', 'saudade', 'vida', 'coração', 'fé', 'esperança'];
  for (const line of lines) {
    if (emotionalWords.some(word => line.toLowerCase().includes(word))) {
      return line;
    }
  }
  return null;
}

function assessBasicRhymeQuality(lines: string[]): "rich" | "poor" | "false" | "none" {
  if (lines.length < 2) return "none";
  
  const lastWords = lines.map(line => {
    const words = line.trim().split(/\s+/);
    return words[words.length - 1]?.toLowerCase() || "";
  });
  
  // Verificação simples de rima
  const word1 = lastWords[0];
  const word2 = lastWords[1];
  
  if (!word1 || !word2) return "none";
  
  // Rima rica: últimas 3 letras iguais
  if (word1.slice(-3) === word2.slice(-3)) return "rich";
  
  // Rima pobre: últimas 2 letras iguais  
  if (word1.slice(-2) === word2.slice(-2)) return "poor";
  
  return "false";
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
