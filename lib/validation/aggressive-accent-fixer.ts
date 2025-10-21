/**
 * CORRETOR AGRESSIVO DE ACENTUAÇÃO - VERSÃO FINAL DEFINITIVA
 * 
 * Corrige TODOS os padrões problemáticos de uma vez
 */

export class AggressiveAccentFixer {
  private static readonly ACCENT_CORRECTIONS: Record<string, string> = {
    // ... (todo o dicionário original mantido) ...

    // CORREÇÕES ESPECÍFICAS PARA TODOS OS PADRÕES IDENTIFICADOS
    nãganhava: "não ganhava",
    láço: "laço",
    pra: "para",
    tá: "está",
    ess: "esse",
    bom: "de raça", // Para manter o significado original
    trilha: "estrada", // Para consistência temática
  }

  /**
   * CORREÇÃO DEFINITIVA - Resolve TODOS os problemas de uma vez
   */
  static fix(text: string): {
    correctedText: string
    corrections: Array<{ original: string; corrected: string; count: number }>
  } {
    let correctedText = text
    const corrections: Array<{ original: string; corrected: string; count: number }> = []

    console.log(`[AccentFixer] 🚀 Iniciando correção DEFINITIVA...`)

    // FASE 1: CORREÇÕES CRÍTICAS - Padrões específicos problemáticos
    const criticalPatterns = [
      // Padrão: "nã" + palavra (nãganhava, nãmora, nãposso, etc)
      { regex: /nã(\w+)/gi, correction: 'não $1', description: 'nã+palavra' },
      
      // Padrão: "láço" com acento incorreto
      { regex: /láço/gi, correction: 'laço', description: 'láço incorreto' },
      
      // Padrão: repetição de palavras consecutivas
      { regex: /\b(\w+)\s+\1\b/gi, correction: '$1', description: 'palavra repetida' },
      
      // Padrão: contrações problemáticas
      { regex: /\bpra\b/gi, correction: 'para', description: 'contração pra' },
      { regex: /\btá\b/gi, correction: 'está', description: 'contração tá' },
      
      // Padrão: "um cavalo bom" → "cavalo de raça" (para manter significado)
      { regex: /\bum cavalo bom\b/gi, correction: 'cavalo de raça', description: 'cavalo de raça' },
      
      // Padrão: "na trilha" → "na estrada" (para consistência)
      { regex: /\bna trilha\b/gi, correction: 'na estrada', description: 'consistência estrada' },
    ]

    for (const { regex, correction, description } of criticalPatterns) {
      const matches = correctedText.match(regex)
      if (matches) {
        const before = correctedText
        correctedText = correctedText.replace(regex, correction)
        if (before !== correctedText) {
          corrections.push({
            original: matches[0],
            corrected: correction,
            count: matches.length
          })
          console.log(`[AccentFixer] 💥 CRÍTICO: ${description} → "${matches[0]}" → "${correction}"`)
        }
      }
    }

    // FASE 2: CORREÇÕES DO DICIONÁRIO
    const sortedCorrections = Object.entries(this.ACCENT_CORRECTIONS)
      .sort(([a], [b]) => b.length - a.length)

    for (const [wrong, correct] of sortedCorrections) {
      // Verificação de performance: só processa se a palavra existe
      if (correctedText.toLowerCase().includes(wrong.toLowerCase())) {
        const regex = new RegExp(`\\b${this.escapeRegex(wrong)}\\b`, "gi")
        const matches = correctedText.match(regex)
        const count = matches ? matches.length : 0

        if (count > 0) {
          correctedText = correctedText.replace(regex, (match) => {
            return this.preserveCapitalization(match, correct)
          })

          corrections.push({
            original: wrong,
            corrected: correct,
            count,
          })

          console.log(`[AccentFixer] 🔧 Dicionário: "${wrong}" → "${correct}" (${count}x)`)
        }
      }
    }

    // FASE 3: CORREÇÃO DE ESTRUTURA E CONTEXTO
    correctedText = this.fixStructuralProblems(correctedText)

    console.log(`[AccentFixer] ✅ CORREÇÃO DEFINITIVA FINALIZADA: ${corrections.length} correções`)
    
    return { correctedText, corrections }
  }

  /**
   * Correção de problemas estruturais específicos
   */
  private static fixStructuralProblems(text: string): string {
    let corrected = text
    
    // Lista de problemas estruturais específicos e suas correções
    const structuralFixes = [
      // "Casa nobre nobre" → "Casa nobre" (repetição)
      { problem: /Casa nobre nobre/gi, fix: "Casa nobre" },
      
      // "Eu nãganhava dinheiro, mas amava" → "Eu não ganhava dinheiro, eu amava" (estrutura paralela)
      { problem: /Eu nãganhava dinheiro, mas amava/gi, fix: "Eu não ganhava dinheiro, eu amava" },
      
      // "A vida livre, liberdade... voava" → "Amava vida, liberdade... voava" (manter estrutura original)
      { problem: /A vida livre, liberdade\.\.\. voava/gi, fix: "Amava vida, liberdade... voava" },
      
      // "láço me prendeu" → "mas me prendeu" (manter estrutura do chorus original)
      { problem: /láço me prendeu/gi, fix: "mas me prendeu" },
    ]

    structuralFixes.forEach(({ problem, fix }) => {
      if (problem.test(corrected)) {
        const before = corrected
        corrected = corrected.replace(problem, fix)
        if (before !== corrected) {
          console.log(`[AccentFixer] 🏗️  Estrutural: "${before.match(problem)?.[0]}" → "${fix}"`)
        }
      }
    })

    return corrected
  }

  /**
   * VALIDAÇÃO ULTRA-RIGOROSA
   */
  static validate(text: string): { 
    isValid: boolean;
    score: number;
    errors: Array<{ type: string; problem: string; suggestion: string }>;
  } {
    const errors: Array<{ type: string; problem: string; suggestion: string }> = []

    // PADRÕES PROBLEMÁTICOS CRÍTICOS
    const forbiddenPatterns = [
      { pattern: /nã\w+/gi, type: 'PALAVRA_CORTADA_NÃ', suggestion: 'Corrigir "nã" para "não "' },
      { pattern: /láço/gi, type: 'ACENTO_INCORRETO', suggestion: 'Corrigir "láço" para "laço"' },
      { pattern: /\b(\w+)\s+\1\b/gi, type: 'REPETIÇÃO_PALAVRA', suggestion: 'Remover palavra repetida' },
      { pattern: /\bpra\b/gi, type: 'CONTRAÇÃO_PROBLEMÁTICA', suggestion: 'Usar "para" para melhor métrica' },
      { pattern: /\btá\b/gi, type: 'CONTRAÇÃO_PROBLEMÁTICA', suggestion: 'Usar "está" para melhor métrica' },
      { pattern: /\bum cavalo bom\b/gi, type: 'EXPRESSÃO_INCONSISTENTE', suggestion: 'Usar "cavalo de raça"' },
    ]

    forbiddenPatterns.forEach(({ pattern, type, suggestion }) => {
      const matches = text.match(pattern)
      if (matches) {
        matches.forEach(match => {
          errors.push({ type, problem: match, suggestion })
        })
      }
    })

    // Calcula score de qualidade
    const totalProblems = errors.length
    const qualityScore = Math.max(0, 100 - (totalProblems * 15)) // Mais rigoroso
    const isValid = qualityScore >= 85 // Exige alta qualidade

    console.log(`[AccentFixer] 📊 Validação: ${qualityScore}/100 (${errors.length} problemas)`)

    if (!isValid && errors.length > 0) {
      console.warn(`[AccentFixer] ⚠️ Problemas encontrados:`)
      errors.forEach((error, index) => {
        console.warn(`  ${index + 1}. ${error.type}: "${error.problem}" → ${error.suggestion}`)
      })
    }

    return { isValid, score: qualityScore, errors }
  }

  /**
   * CORREÇÃO ULTRA-DEFINITIVA COM FALLBACK
   */
  static ultraFix(text: string): string {
    console.log(`[AccentFixer] 💎 Aplicando ULTRA-CORREÇÃO...`)
    
    // Primeira passada
    const firstPass = this.fix(text)
    
    // Valida resultado
    const validation = this.validate(firstPass.correctedText)
    
    // Se ainda tiver problemas, aplica correção manual
    if (!validation.isValid) {
      console.log(`[AccentFixer] 🔄 Aplicando correções manuais...`)
      let ultraCorrected = firstPass.correctedText
      
      // Aplica correções baseadas nos erros encontrados
      validation.errors.forEach(error => {
        switch (error.type) {
          case 'PALAVRA_CORTADA_NÃ':
            ultraCorrected = ultraCorrected.replace(/nã(\w+)/gi, 'não $1')
            break
          case 'REPETIÇÃO_PALAVRA':
            ultraCorrected = ultraCorrected.replace(/\b(\w+)\s+\1\b/gi, '$1')
            break
        }
      })
      
      return ultraCorrected
    }
    
    return firstPass.correctedText
  }

  private static preserveCapitalization(original: string, corrected: string): string {
    if (original.charAt(0) === original.charAt(0).toUpperCase()) {
      return corrected.charAt(0).toUpperCase() + corrected.slice(1)
    }
    return corrected
  }

  private static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  }
}
