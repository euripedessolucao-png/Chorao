// lib/orchestrator/advanced-elision-engine.ts - VERSÃO MÍNIMA

import { countPortugueseSyllables } from "@/lib/validation/syllable-counter"

export class AdvancedElisionEngine {
  static applyIntelligentElisions(line: string, targetSyllables: number): string[] {
    const currentSyllables = countPortugueseSyllables(line)
    
    if (currentSyllables <= targetSyllables) {
      return [line]
    }

    const variations: string[] = []

    // Técnicas básicas
    const techniques = [
      { regex: /\bde amor\b/gi, replacement: "d'amor" },
      { regex: /\bque eu\b/gi, replacement: "qu'eu" },
      { regex: /\bpara o\b/gi, replacement: "pro" },
      { regex: /\bpara a\b/gi, replacement: "pra" },
      { regex: /\bpara\b/gi, replacement: "pra" },
      { regex: /\bvocê\b/gi, replacement: "cê" },
      { regex: /\bestá\b/gi, replacement: "tá" }
    ]

    for (const tech of techniques) {
      if (tech.regex.test(line)) {
        const newLine = line.replace(tech.regex, tech.replacement)
        const newSyllables = countPortugueseSyllables(newLine)
        if (newSyllables <= targetSyllables) {
          variations.push(newLine)
        }
      }
    }

    return variations.length > 0 ? variations : [line]
  }
}
// ✅ SEM EXPORT NO FINAL - só o export class no início
