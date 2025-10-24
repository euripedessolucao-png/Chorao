// lib/validation/chorus-validator.ts

import type { ChorusOption } from "./parser";
import { getSertanejoRulesBySubgenre } from "./sertanejoRules"; // ← Assume que você tem essa função
import { countPoeticSyllables } from "./syllable-counter-brasileiro";
import { getUniversalRhymeRules } from "./universal-rhyme-rules";

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
 * Valida um refrão com critérios reais da música brasileira
 */
export function validateChorus(chorus: ChorusOption, genre: string = "sertanejo"): ChorusValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  const rules = getSertanejoRulesBySubgenre(genre);
  const rhymeRules = getUniversalRhymeRules(genre);

  // 1. Estrutura: 2 ou 4 linhas (mas 4 é preferível no sertanejo moderno)
  const lineCount = chorus.lines.length;
  if (lineCount === 0) {
    errors.push("Refrão vazio");
    score -= 100;
  } else if (lineCount !== 2 && lineCount !== 4) {
    errors.push(`Refrão deve ter 2 ou 4 linhas (tem ${lineCount})`);
    score -= 25;
  } else if (lineCount === 2 && genre.includes("moderno")) {
    warnings.push("Refrões de 2 linhas são menos impactantes no sertanejo moderno");
    score -= 5;
  }

  // 2. Elementos proibidos (clichês ultrapassados)
  for (const [i, line] of chorus.lines.entries()) {
    if (hasForbiddenElement(line, genre)) {
      errors.push(`Linha ${i + 1}: clichê evitado hoje: "${line}"`);
      score -= 15;
    }
  }

  // 3. Elemento visual (mas só se natural)
  const visualLines = chorus.lines.filter(line => hasVisualElement(line));
  const isVisual = visualLines.length > 0;
  if (!isVisual && genre.includes("moderno")) {
    warnings.push("Adicionar imagem visual ajuda no engajamento de clipes");
    score -= 5;
  }
  // ⚠️ Não penaliza fortemente — muitos sucessos não têm "imagem" explícita

  // 4. Gancho: não só "chiclete", mas EMOCIONAL
  const stickyHook = extractStickyHook(chorus.lines);
  const emotionalHook = extractEmotionalHook(chorus.lines);
  
  if (!stickyHook && !emotionalHook) {
    errors.push("Falta gancho memorável (sonoro ou emocional)");
    score -= 20;
  } else if (!stickyHook) {
    warnings.push("Gancho emocional presente, mas falta repetição sonora");
    score -= 5;
  }

  // 5. Prosódia: sílabas + ritmo natural
  const syllableIssues: string[] = [];
  for (const [i, line] of chorus.lines.entries()) {
    const syllables = countPoeticSyllables(line);
    if (syllables > rules.chorusStructure.maxSyllablesPerLine) {
      syllableIssues.push(`Linha ${i + 1}: ${syllables} sílabas (máx: ${rules.chorusStructure.maxSyllablesPerLine})`);
      score -= 8;
    } else if (syllables < rules.chorusStructure.minSyllablesPerLine) {
      syllableIssues.push(`Linha ${i + 1}: muito curta (${syllables}s)`);
      score -= 5;
    }
  }
  if (syllableIssues.length > 0) {
    errors.push(...syllableIssues);
  }

  // 6. Qualidade da rima (crucial no sertanejo)
  let rhymeQuality: ChorusValidation["rhymeQuality"] = "none";
  if (chorus.lines.length >= 2) {
    const lastWords = chorus.lines.map(line => 
      line.trim().split(/\s+/).filter(w => w).pop()?.toLowerCase() || ""
    );
    
    if (lastWords[0] && lastWords[1]) {
      const rhymeType = classifyRhyme(lastWords[0], lastWords[1], rhymeRules);
      rhymeQuality = rhymeType;
      
      if (rhymeType === "false") {
        errors.push(`Rima falsa: "${lastWords[0]}" / "${lastWords[1]}"`);
        score -= 20;
      } else if (rhymeType === "poor" && genre.includes("raiz")) {
        warnings.push("Rima pobre em sertanejo raiz reduz impacto");
        score -= 10;
      }
    }
  }

  // 7. Naturalidade: evita versos "escritos", não "cantados"
  for (const [i, line] of chorus.lines.entries()) {
    if (soundsUnnatural(line)) {
      warnings.push(`Linha ${i + 1} soa escrita, não cantada: "${line}"`);
      score -= 5;
    }
  }

  const finalScore = Math.max(0, score);

  return {
    isValid: finalScore >= 75, // mais tolerante, mas exigente em pontos-chave
    score: finalScore,
    stickyHookFound: stickyHook,
    emotionalHook,
    isVisual,
    rhymeQuality,
    errors,
    warnings,
  };
}

// ─── Funções auxiliares melhoradas ─────────────────────────────────────

function hasForbiddenElement(line: string, genre: string): boolean {
  const forbidden = [
    "viola caipira", // ultrapassado no sertanejo moderno
    "pé de meia", 
    "roça", 
    "vaqueiro", 
    "boiadeiro",
    "caboclo",
    "jeitinho brasileiro"
  ];
  
  // No sertanejo raiz, alguns são aceitáveis
  if (genre.includes("raiz")) {
    return forbidden.some(term => 
      term !== "viola caipira" && 
      new RegExp(`\\b${term}\\b`, "i").test(line)
    );
  }
  
  return forbidden.some(term => new RegExp(`\\b${term}\\b`, "i").test(line));
}

function hasVisualElement(line: string): boolean {
  // Elementos que criam imagem mental (não só "visual" literal)
  const visualTriggers = [
    /\b(luar|lua|sol|chuva|rio|mar|cidade|quarto|cama|carro|estrada|noite|manhã)\b/i,
    /\b(vermelho|azul|dourado|branco|preto)\b/i,
    /\b(sorrindo|chorando|dançando|correndo|voando)\b/i,
  ];
  return visualTriggers.some(regex => regex.test(line));
}

function extractStickyHook(lines: string[]): string | null {
  // Busca frases curtas (2-5 palavras) repetidas ou com ritmo marcante
  const fullText = lines.join(" ").toLowerCase();
  const shortPhrases = fullText.match(/\b(?:\w+\s+){1,4}\w+\b/g) || [];
  
  for (const phrase of shortPhrases) {
    const words = phrase.trim().split(/\s+/);
    if (words.length >= 2 && words.length <= 5) {
      // Verifica se tem ritmo marcante (ex: acento na penúltima)
      const syllables = words.map(w => countPoeticSyllables(w));
      if (syllables.some(s => s === 2 || s === 3)) {
        return phrase;
      }
    }
  }
  return null;
}

function extractEmotionalHook(lines: string[]): string | null {
  // Frases com alto impacto emocional
  const emotionalLines = lines.filter(line => 
    /\b(amor|dor|saudade|medo|esperança|fim|volta|perdão|verdade)\b/i.test(line)
  );
  return emotionalLines[0] || null;
}

function classifyRhyme(word1: string, word2: string, rules: ReturnType<typeof getUniversalRhymeRules>): "rich" | "poor" | "false" | "none" {
  if (!word1 || !word2) return "none";
  
  // Simplificação fonética (pode ser expandida com dicionário)
  const normalize = (w: string) => 
    w.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  
  const n1 = normalize(word1);
  const n2 = normalize(word2);
  
  // Verifica se terminam com o mesmo som (mínimo 2 letras)
  const minLen = Math.min(n1.length, n2.length);
  if (minLen < 2) return "false";
  
  const suffix1 = n1.slice(-Math.min(3, n1.length));
  const suffix2 = n2.slice(-Math.min(3, n2.length));
  
  if (suffix1 === suffix2) {
    // Aqui idealmente verificaríamos classes gramaticais para "rich" vs "poor"
    // Por enquanto, assume "rich" se palavras forem muito diferentes
    return "rich";
  }
  
  // Verifica rima toante (vogais finais)
  if (rules.allowAssonantRhymes) {
    const vowel1 = n1.match(/[aeiou]$/)?.[0];
    const vowel2 = n2.match(/[aeiou]$/)?.[0];
    if (vowel1 && vowel2 && vowel1 === vowel2) {
      return "poor"; // toante = pobre
    }
  }
  
  return "false";
}

function soundsUnnatural(line: string): boolean {
  // Detecta construções artificiais comuns em IA
  const unnaturalPatterns = [
    /muito\s+(muito|extremamente)/i, // redundância
    /(sempre|nunca)\s+(sempre|nunca)/i,
    /coração\s+palpitante/i, // clichê técnico
    /lágrimas\s+rolando/i,
    /alma\s+ferida/i,
  ];
  return unnaturalPatterns.some(p => p.test(line));
}

// ─── Batch validation ───────────────────────────────────────────────────

export function validateChorusBatch(choruses: ChorusOption[], genre: string = "sertanejo"): ChorusBatchResult {
  const validated = choruses.map((chorus) => ({
    ...chorus,
    validation: validateChorus(chorus, genre),
  }));

  const valid = validated.filter((c) => c.validation.isValid);
  const best =
    valid.length > 0
      ? valid.reduce((prev, curr) => (curr.validation.score > prev.validation.score ? curr : prev))
      : null;

  return { all: validated, valid, best };
}
