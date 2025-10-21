/**
 * CORRETOR AGRESSIVO DE ACENTUAÇÃO - VERSÃO SUPER-MELHORADA
 * 
 * Corrige TODOS os problemas identificados na letra gerada
 */

export class AggressiveAccentFixer {
  private static readonly ACCENT_CORRECTIONS: Record<string, string> = {
    // ... (todo o dicionário anterior permanece igual) ...

    // CORREÇÕES ESPECÍFICAS PARA OS NOVOS PROBLEMAS IDENTIFICADOS
    nãmora: "não mora",
    esperançaa: "esperança",
    raçaa: "raça",
    segurançaa: "segurança", 
    herançaa: "herança",
    dedo: "dedos",
    ess: "esse",
    pra: "para",
    ta: "tá",
    cabrestro: "cabresto"
  }

  /**
   * Corrige AGRESSIVAMENTE todos os problemas de acentuação e palavras cortadas
   */
  static fix(text: string): {
    correctedText: string
    corrections: Array<{ original: string; corrected: string; count: number }>
  } {
    let correctedText = text
    const corrections: Array<{ original: string; corrected: string; count: number }> = []

    console.log(`[AccentFixer] 🔧 Iniciando correção agressiva...`)

    // PRIMEIRO: Correções de palavras cortadas e problemas críticos
    const criticalFixes = [
      // Problemas de palavras juntas
      { regex: /nãmora/gi, correction: "não mora" },
      { regex: /esperançaa/gi, correction: "esperança" },
      { regex: /raçaa/gi, correction: "raça" },
      { regex: /segurançaa/gi, correction: "segurança" },
      { regex: /herançaa/gi, correction: "herança" },
      
      // Problemas de plural esquecido
      { regex: /\bdedo\b/gi, correction: "dedos" },
      
      // Contrações que precisam ser expandidas para contagem de sílabas
      { regex: /\bpra\b/gi, correction: "para" },
      { regex: /\btá\b/gi, correction: "está" },
      
      // Erros de digitação
      { regex: /cabrestro/gi, correction: "cabresto" }
    ]

    for (const fix of criticalFixes) {
      const matches = correctedText.match(fix.regex)
      if (matches) {
        correctedText = correctedText.replace(fix.regex, fix.correction)
        corrections.push({
          original: matches[0],
          corrected: fix.correction,
          count: matches.length
        })
        console.log(`[AccentFixer] 🔥 CRÍTICO: "${matches[0]}" → "${fix.correction}"`)
      }
    }

    // SEGUNDO: Correções normais do dicionário (ordenadas por tamanho)
    const sortedCorrections = Object.entries(this.ACCENT_CORRECTIONS)
      .filter(([wrong]) => !wrong.includes('aa')) // Já corrigimos acima
      .sort(([a], [b]) => b.length - a.length)

    for (const [wrong, correct] of sortedCorrections) {
      const regex = this.createSafeRegex(wrong)
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

        console.log(`[AccentFixer] 🔧 Corrigido: "${wrong}" → "${correct}" (${count}x)`)
      }
    }

    // TERCEIRO: Correção de repetições de palavras (problema identificado)
    correctedText = this.fixWordRepetitions(correctedText)

    console.log(`[AccentFixer] ✅ Correção finalizada: ${corrections.length} correções aplicadas`)
    
    return { correctedText, corrections }
  }

  /**
   * Corrige repetições de palavras (ex: "Casa nobre nobre")
   */
  private static fixWordRepetitions(text: string): string {
    return text.replace(/\b(\w+)\s+\1\b/gi, '$1')
  }

  /**
   * Cria regex seguro com proteção contra falsos positivos
   */
  private static createSafeRegex(word: string): RegExp {
    const escapedWord = this.escapeRegex(word)
    
    if (word.length <= 2) {
      return new RegExp(`(^|\\s)${escapedWord}(?=\\s|$|[.,!?;])`, "gi")
    }
    
    return new RegExp(`\\b${escapedWord}\\b`, "gi")
  }

  /**
   * Preserva capitalização de forma inteligente
   */
  private static preserveCapitalization(original: string, corrected: string): string {
    if (original.charAt(0) === original.charAt(0).toUpperCase()) {
      return corrected.charAt(0).toUpperCase() + corrected.slice(1)
    }
    
    if (original === original.toUpperCase()) {
      return corrected.toUpperCase()
    }
    
    return corrected
  }

  /**
   * Escapa caracteres especiais de regex
   */
  private static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  }

  /**
   * Valida se o texto ainda tem problemas críticos
   */
  static validate(text: string): { 
    isValid: boolean; 
    errors: Array<{ type: string; word: string; suggestion: string }> 
  } {
    const errors: Array<{ type: string; word: string; suggestion: string }> = []

    // Padrões problemáticos críticos
    const problemPatterns = [
      { pattern: /nãmora/gi, type: "PALAVRAS_COLADAS", suggestion: "não mora" },
      { pattern: /\w+aa\b/gi, type: "DUPLICAÇÃO_DE_LETRAS", suggestion: "remover 'a' duplicado" },
      { pattern: /\b(\w+)\s+\1\b/gi, type: "REPETIÇÃO_DE_PALAVRAS", suggestion: "remover palavra repetida" },
      { pattern: /\b\w{1,2}ç\b/gi, type: "PALAVRA_INCOMPLETA", suggestion: "completar palavra" },
    ]

    for (const { pattern, type, suggestion } of problemPatterns) {
      const matches = text.match(pattern)
      if (matches) {
        matches.forEach(match => {
          errors.push({ type, word: match, suggestion })
        })
      }
    }

    // Valida palavras do dicionário
    for (const [wrong] of Object.entries(this.ACCENT_CORRECTIONS)) {
      const regex = this.createSafeRegex(wrong)
      const matches = text.match(regex)
      if (matches) {
        matches.forEach(match => {
          errors.push({ 
            type: "ACENTUAÇÃO_INCORRETA", 
            word: match, 
            suggestion: this.ACCENT_CORRECTIONS[wrong] 
          })
        })
      }
    }

    const isValid = errors.length === 0
    
    if (!isValid) {
      console.warn(`[AccentFixer] ⚠️ ${errors.length} problemas encontrados:`)
      errors.forEach(error => {
        console.warn(`  - ${error.type}: "${error.word}" → ${error.suggestion}`)
      })
    }

    return { isValid, errors }
  }

  /**
   * Aplica correção ULTRA AGRESSIVA para problemas persistentes
   */
  static ultraFix(lyrics: string): string {
    console.log(`[AccentFixer] 🚀 Aplicando correção ULTRA AGRESSIVA...`)
    
    let corrected = lyrics

    // Correções específicas para os padrões problemáticos da letra
    const ultraFixes = [
      // Padrão: palavra + "aa" no final → remove "a" extra
      { regex: /(\w+)aa\b/gi, replacement: '$1a' },
      
      // Padrão: palavras coladas com "nã"
      { regex: /nã(\w+)/gi, replacement: 'não $1' },
      
      // Padrão: repetição de palavras consecutivas
      { regex: /\b(\w+)\s+\1\b/gi, replacement: '$1' },
      
      // Padrão: plural esquecido em contextos específicos
      { regex: /\bdedo\b/gi, replacement: 'dedos' },
      { regex: /\bcavalo\s+raça\b/gi, replacement: 'cavalo de raça' },
    ]

    ultraFixes.forEach(({ regex, replacement }) => {
      const before = corrected
      corrected = corrected.replace(regex, replacement)
      if (before !== corrected) {
        console.log(`[AccentFixer] 💥 ULTRA FIX: aplicado padrão ${regex}`)
      }
    })

    // Aplica correções normais após as ultra correções
    const normalFix = this.fix(corrected)
    
    return normalFix.correctedText
  }
}
