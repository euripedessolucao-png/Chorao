// lib/orchestrator/advanced-elision-engine.ts

import { countPortugueseSyllables } from "@/lib/validation/syllable-counter"

export class AdvancedElisionEngine {
  private static readonly ELISION_RULES = {
    // ✅ ELISÕES POR ARTIGO/PREPOSIÇÃO (Preservam 95% do significado)
    articleRemoval: [
      { pattern: /\b(o |a |um |uma )/gi, replacement: '', preservation: 0.95 },
      { pattern: /\b(no |na |do |da )/gi, replacement: 'n', preservation: 0.90 },
      { pattern: /\b(de |em |por )/gi, replacement: 'd', preservation: 0.92 }
    ],
    
    // ✅ ELISÕES POR FUSÃO VOCÁLICA (Preservam 90% do significado)  
    vowelFusion: [
      { pattern: /\b(e |a |o )+(?=[aeiouáéíóú])/gi, replacement: '', preservation: 0.90 },
      { pattern: /\b(que)\s+(eu)\b/gi, replacement: "qu'eu", preservation: 0.88 },
      { pattern: /\b(de)\s+(amor|abraço|ódio|alegria|saudade)\b/gi, replacement: "d'$2", preservation: 0.85 },
      { pattern: /\b(meu)\s+(amor|coração|sonho)\b/gi, replacement: "meu$2", preservation: 0.87 }
    ],
    
    // ✅ ELISÕES POR CONTRACÇÃO AVANÇADA (Preservam 85% do significado)
    advancedContractions: [
      { pattern: /\b(comigo)\b/gi, replacement: "c'migo", preservation: 0.85 },
      { pattern: /\b(contigo)\b/gi, replacement: "c'tigo", preservation: 0.85 },
      { pattern: /\b(para o)\b/gi, replacement: "pro", preservation: 0.88 },
      { pattern: /\b(para a)\b/gi, replacement: "pra", preservation: 0.88 },
      { pattern: /\b(para)\b/gi, replacement: "pra", preservation: 0.90 },
      { pattern: /\b(você)\b/gi, replacement: "cê", preservation: 0.82 },
      { pattern: /\b(com)\b/gi, replacement: "c", preservation: 0.80 },
      { pattern: /\b(nosso|nossa)\b/gi, replacement: "nosso", preservation: 1.0 }
    ],
    
    // ✅ ELISÕES POR ECONOMIA VERBAL (Preservam 80% do significado)
    verbalEconomy: [
      { pattern: /\b(ainda está)\b/gi, replacement: "tá", preservation: 0.80 },
      { pattern: /\b(estou)\b/gi, replacement: "tô", preservation: 0.82 },
      { pattern: /\b(está)\b/gi, replacement: "tá", preservation: 0.85 },
      { pattern: /\b(vou te)\b/gi, replacement: "vô cê", preservation: 0.78 },
      { pattern: /\b(estou me)\b/gi, replacement: "tô me", preservation: 0.80 },
      { pattern: /\b(poderíamos)\b/gi, replacement: "dava", preservation: 0.75 },
      { pattern: /\b(gostaria)\b/gi, replacement: "queria", preservation: 0.82 },
      { pattern: /\b(acredito)\b/gi, replacement: "acho", preservation: 0.80 }
    ],
    
    // ✅ ELISÕES POR SINÉDOQUE (Preservam 70% do significado - Último recurso)
    synecdoche: [
      { pattern: /\bmulher que se apagou\b/gi, replacement: "rastro de mim", preservation: 0.70 },
      { pattern: /\bhomem que partiu\b/gi, replacement: "sombra dele", preservation: 0.68 },
      { pattern: /\bcoração partido\b/gi, replacement: "peito", preservation: 0.65 },
      { pattern: /\bsaudade profunda\b/gi, replacement: "saudade", preservation: 0.72 },
      { pattern: /\bmemória dolorosa\b/gi, replacement: "lembrança", preservation: 0.68 },
      { pattern: /\bsorriso que iluminava\b/gi, replacement: "sorriso", preservation: 0.70 },
      { pattern: /\bamor que não existia\b/gi, replacement: "mentira", preservation: 0.65 },
      { pattern: /\bpromessa vazia\b/gi, replacement: "mentira", preservation: 0.75 }
    ],
    
    // ✅ ELISÕES POR REESTRUTURAÇÃO (Preservam 60-80% do significado)
    restructuring: [
      { pattern: /\b(vai encontrar)\b/gi, replacement: "vai achar", preservation: 0.85 },
      { pattern: /\b(na minha mente)\b/gi, replacement: "na mente", preservation: 0.88 },
      { pattern: /\b(no meu coração)\b/gi, replacement: "no peito", preservation: 0.80 },
      { pattern: /\b(em minha vida)\b/gi, replacement: "na vida", preservation: 0.90 },
      { pattern: /\b(te esperando)\b/gi, replacement: "esperando", preservation: 0.82 },
      { pattern: /\b(estou chorando)\b/gi, replacement: "chorando", preservation: 0.78 }
    ]
  }

  /**
   * APLICA ELISÕES INTELIGENTES MANTENDO SIGNIFICADO
   */
  static applyIntelligentElisions(line: string, targetSyllables: number): string[] {
    const variations: { text: string; preservation: number; syllables: number }[] = []
    const currentSyllables = countPortugueseSyllables(line)
    
    // Se já está na métrica, retorna a linha original
    if (currentSyllables <= targetSyllables) {
      return [line]
    }

    console.log(`🎭 Processando elisões para: "${line}" (${currentSyllables}→${targetSyllables} sílabas)`)

    // ESTRATÉGIA 1: Elisões leves (alta preservação)
    const lightElisions = this.applyRuleSet(line, [
      ...this.ELISION_RULES.articleRemoval,
      ...this.ELISION_RULES.vowelFusion
    ], targetSyllables)
    variations.push(...lightElisions)

    // ESTRATÉGIA 2: Elisões moderadas (média preservação)  
    const moderateElisions = this.applyRuleSet(line, [
      ...this.ELISION_RULES.advancedContractions,
      ...this.ELISION_RULES.verbalEconomy
    ], targetSyllables)
    variations.push(...moderateElisions)

    // ESTRATÉGIA 3: Elisões criativas (baixa preservação - só se necessário)
    if (currentSyllables > targetSyllables + 2) {
      const creativeElisions = this.applyRuleSet(line, [
        ...this.ELISION_RULES.synecdoche,
        ...this.ELISION_RULES.restructuring
      ], targetSyllables)
      variations.push(...creativeElisions)
    }

    // ESTRATÉGIA 4: Combinações estratégicas (para casos difíceis)
    if (currentSyllables > targetSyllables + 3) {
      const combinedElisions = this.applyCombinedStrategies(line, targetSyllables)
      variations.push(...combinedElisions)
    }

    // FILTRA E ORDENA POR QUALIDADE
    const bestVariations = variations
      .filter(variation => {
        // Filtra por métrica aceitável (target ou target-1)
        return variation.syllables <= targetSyllables && variation.syllables >= targetSyllables - 1
      })
      .filter(variation => this.qualityCheck(variation.text, line))
      .sort((a, b) => {
        // Ordena por: 1. Preservação, 2. Proximidade da métrica ideal
        const scoreA = (a.preservation * 100) + (targetSyllables - a.syllables)
        const scoreB = (b.preservation * 100) + (targetSyllables - b.syllables)
        return scoreB - scoreA
      })
      .map(v => v.text)
      .slice(0, 5) // Limita a 5 melhores variações

    console.log(`✅ ${bestVariations.length} variações válidas encontradas`)
    return bestVariations
  }

  /**
   * APLICA ESTRATÉGIAS COMBINADAS PARA CASOS COMPLEXOS
   */
  private static applyCombinedStrategies(line: string, targetSyllables: number): Array<{ text: string; preservation: number; syllables: number }> {
    const combinations: Array<{ text: string; preservation: number; syllables: number }> = []
    
    // Combinação 1: Artigo + Contração
    let tempLine = line
    tempLine = tempLine.replace(/\b(o |a )/gi, '')
    tempLine = tempLine.replace(/\b(você)\b/gi, 'cê')
    tempLine = tempLine.replace(/\b(para)\b/gi, 'pra')
    
    const syllables1 = countPortugueseSyllables(tempLine)
    if (syllables1 <= targetSyllables && syllables1 > 0) {
      combinations.push({ text: tempLine, preservation: 0.75, syllables: syllables1 })
    }

    // Combinação 2: Fusão + Economia Verbal
    tempLine = line
    tempLine = tempLine.replace(/\b(de)\s+(amor)\b/gi, "d'amor")
    tempLine = tempLine.replace(/\b(que)\s+(eu)\b/gi, "qu'eu")
    tempLine = tempLine.replace(/\b(ainda está)\b/gi, "tá")
    
    const syllables2 = countPortugueseSyllables(tempLine)
    if (syllables2 <= targetSyllables && syllables2 > 0) {
      combinations.push({ text: tempLine, preservation: 0.70, syllables: syllables2 })
    }

    return combinations
  }

  /**
   * APLICA UM CONJUNTO DE REGRAS
   */
  private static applyRuleSet(
    line: string, 
    rules: Array<{ pattern: RegExp; replacement: string; preservation: number }>,
    targetSyllables: number
  ): Array<{ text: string; preservation: number; syllables: number }> {
    const results: Array<{ text: string; preservation: number; syllables: number }> = []
    
    rules.forEach(rule => {
      if (rule.pattern.test(line)) {
        const result = line.replace(rule.pattern, rule.replacement)
        if (result !== line) {
          const syllables = countPortugueseSyllables(result)
          // Só adiciona se melhorou a métrica
          if (syllables < countPortugueseSyllables(line)) {
            results.push({ 
              text: result, 
              preservation: rule.preservation, 
              syllables 
            })
          }
        }
      }
    })
    
    return results
  }

  /**
   * VERIFICA QUALIDADE DA ELISÃO
   */
  private static qualityCheck(elidedLine: string, originalLine: string): boolean {
    // 1. Não permite elisões que quebrem completamente o significado
    const originalWords = originalLine.split(/\s+/).filter(w => w.length > 0).length
    const elidedWords = elidedLine.split(/\s+/).filter(w => w.length > 0).length
    
    // Mantém pelo menos 60% das palavras originais
    if (elidedWords < originalWords * 0.6) {
      return false
    }

    // 2. Não permite frases sem verbo (em casos simples)
    const hasVerb = /(\b\w+[aei]r\b|\btá\b|\btô\b|\bvou\b|\bvi\b|\bfiz\b)/i.test(elidedLine)
    if (!hasVerb && originalLine.match(/(\b\w+[aei]r\b|\bestá\b|\bestou\b|\bvou\b)/i)) {
      return false
    }

    // 3. Não permite repetição excessiva de contrações
    const contractionCount = (elidedLine.match(/'/g) || []).length
    if (contractionCount > 2) {
      return false
    }

    // 4. Verifica se a linha ainda faz sentido básico
    return this.makesBasicSense(elidedLine, originalLine)
  }

  /**
   * VERIFICA SE A LINHA AINDA FAZ SENTIDO BÁSICO
   */
  private static makesBasicSense(elidedLine: string, originalLine: string): boolean {
    const originalLower = originalLine.toLowerCase()
    const elidedLower = elidedLine.toLowerCase()

    // Palavras-chave que devem ser mantidas (quando presentes no original)
    const keyWords = [
      'amor', 'coração', 'saudade', 'dor', 'mentira', 'verdade',
      'partir', 'ficar', 'chorar', 'sofrer', 'lembrar', 'esquecer'
    ]

    const originalKeyWords = keyWords.filter(word => originalLower.includes(word))
    const preservedKeyWords = originalKeyWords.filter(word => elidedLower.includes(word))

    // Preserva pelo menos 50% das palavras-chave
    return preservedKeyWords.length >= originalKeyWords.length * 0.5
  }

  /**
   * ANALISA POTENCIAL DE ELISÃO PARA UMA LINHA
   */
  static analyzeElisionPotential(line: string): {
    currentSyllables: number
    potentialReduction: number
    bestStrategies: string[]
    qualityEstimate: number
  } {
    const currentSyllables = countPortugueseSyllables(line)
    const strategies: string[] = []
    let maxReduction = 0

    // Analisa cada tipo de elisão possível
    Object.values(this.ELISION_RULES).forEach(ruleSet => {
      ruleSet.forEach(rule => {
        if (rule.pattern.test(line)) {
          const testLine = line.replace(rule.pattern, rule.replacement)
          const reduction = currentSyllables - countPortugueseSyllables(testLine)
          if (reduction > 0) {
            strategies.push(`Redução de ${reduction} sílabas (${rule.preservation * 100}% preservação)`)
            maxReduction = Math.max(maxReduction, reduction)
          }
        }
      })
    })

    return {
      currentSyllables,
      potentialReduction: maxReduction,
      bestStrategies: strategies.slice(0, 3),
      qualityEstimate: strategies.length > 0 ? 0.8 : 0.3
    }
  }
}

export { AdvancedElisionEngine }
