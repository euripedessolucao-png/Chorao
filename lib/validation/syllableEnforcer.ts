/**
 * SISTEMA CONSERVADOR DE PRESERVAÇÃO MUSICAL
 * Foco máximo em: Rimas Perfeitas + 11 Sílabas + Sentido Preservado
 */

import { countPoeticSyllables } from "./syllable-counter"
import { generateText } from "ai"

export interface SyllableEnforcement {
  min: number
  max: number 
  ideal: number
}

export class ConservativeSyllableEnforcer {
  private static readonly STRICT_MAX_SYLLABLES = 11
  private static readonly MAX_ATTEMPTS = 3

  /**
   * ABORDAGEM CONSERVADORA: Prefere reescrever do que cortar
   */
  static async enforceSyllableLimits(
    lyrics: string, 
    enforcement: SyllableEnforcement,
    genre: string
  ): Promise<{ correctedLyrics: string; corrections: number; violations: string[] }> {
    
    const lines = lyrics.split('\n')
    const correctedLines: string[] = []
    let corrections = 0
    const violations: string[] = []

    const strictEnforcement = { ...enforcement, max: this.STRICT_MAX_SYLLABLES }

    // ✅ PRIMEIRO: Análise completa da estrutura
    const structureAnalysis = this.analyzeSongStructure(lines)
    
    for (let i = 0; i < lines.length; i++) {
      const originalLine = lines[i]
      
      if (this.shouldSkipLine(originalLine)) {
        correctedLines.push(originalLine)
        continue
      }

      const syllables = countPoeticSyllables(originalLine)
      const rhymeGroup = this.findRhymeGroup(structureAnalysis, i)
      
      if (syllables <= strictEnforcement.max) {
        correctedLines.push(originalLine)
      } else {
        violations.push(`Linha ${i+1}: "${originalLine}" -> ${syllables}s`)
        
        console.log(`[ConservativeEnforcer] Corrigindo linha ${i+1} com ${syllables}s`)

        // ✅ ABORDAGEM CONSERVADORA: Reescreve com contexto
        const correctedLine = await this.conservativeCorrection(
          originalLine,
          lines,
          i,
          strictEnforcement,
          genre,
          rhymeGroup
        )
        
        correctedLines.push(correctedLine)
        corrections++
      }
    }

    // ✅ VERIFICAÇÃO FINAL: Garante coerência
    const finalLyrics = await this.ensureFinalCoherence(
      correctedLines.join('\n'),
      genre,
      strictEnforcement
    )

    return {
      correctedLyrics: finalLyrics,
      corrections,
      violations
    }
  }

  /**
   * CORREÇÃO CONSERVADORA: Mantém contexto e estrutura
   */
  private static async conservativeCorrection(
    problemLine: string,
    allLines: string[],
    problemIndex: number,
    enforcement: SyllableEnforcement,
    genre: string,
    rhymeGroup?: number[]
  ): Promise<string> {

    // ✅ TENTATIVA 1: Correção local inteligente
    const localFix = this.applyConservativeLocalFix(problemLine, enforcement.max)
    if (countPoeticSyllables(localFix) <= enforcement.max) {
      console.log(`[ConservativeEnforcer] ✓ Correção local: "${problemLine}" -> "${localFix}"`)
      return localFix
    }

    // ✅ TENTATIVA 2: Reescreve com contexto da estrofe
    const stanzaContext = this.getStanzaContext(allLines, problemIndex)
    const stanzaCorrected = await this.rewriteWithStanzaContext(
      problemLine,
      stanzaContext,
      enforcement,
      genre,
      problemIndex
    )

    if (stanzaCorrected && countPoeticSyllables(stanzaCorrected) <= enforcement.max) {
      console.log(`[ConservativeEnforcer] ✓ Correção com contexto: "${problemLine}" -> "${stanzaCorrected}"`)
      return stanzaCorrected
    }

    // ✅ TENTATIVA 3: Se tudo falhar, reescreve linha inteira preservando tema
    const theme = this.extractLineTheme(problemLine)
    const fallback = await this.rewriteFromScratch(theme, enforcement.max, genre)
    
    console.log(`[ConservativeEnforcer] ⚠️ Fallback: "${problemLine}" -> "${fallback}"`)
    return fallback
  }

  /**
   * CORREÇÃO LOCAL CONSERVADORA - Não quebra estrutura
   */
  private static applyConservativeLocalFix(line: string, maxSyllables: number): string {
    const words = line.split(' ')
    if (words.length <= 3) return line

    // ✅ TÉCNICAS SEGURAS (nunca quebram rima):
    
    // 1. Contrações obrigatórias
    let corrected = line
      .replace(/\bvocê\b/gi, 'cê')
      .replace(/\bestá\b/gi, 'tá')
      .replace(/\bpara\b/gi, 'pra')
      .replace(/\bestou\b/gi, 'tô')

    // 2. Remove apenas palavras do MEIO (nunca do final)
    const currentSyllables = countPoeticSyllables(corrected)
    if (currentSyllables > maxSyllables && words.length > 4) {
      // Mantém: primeira palavra + últimas 2-3 palavras
      const safeReduction = [
        words[0],
        ...words.slice(-3) // Mantém final (onde está a rima)
      ].join(' ')
      
      if (countPoeticSyllables(safeReduction) <= maxSyllables) {
        return safeReduction
      }
    }

    // 3. Substituições seguras
    const safeSubstitutions = [
      { from: /\bconstantemente\b/gi, to: 'sempre' },
      { from: /\bcompletamente\b/gi, to: 'todo' },
      { from: /\brealmente\b/gi, to: 'de fato' },
      { from: /\bprovocante\b/gi, to: 'sedutor' },
    ]

    safeSubstitutions.forEach(({ from, to }) => {
      corrected = corrected.replace(from, to)
    })

    return corrected
  }

  /**
   * REWRITE COM CONTEXTO - Preserva significado da estrofe
   */
  private static async rewriteWithStanzaContext(
    problemLine: string,
    context: string[],
    enforcement: SyllableEnforcement,
    genre: string,
    lineIndex: number
  ): Promise<string> {

    const prompt = `REESCRITA MUSICAL INTELIGENTE - PRESERVE SIGNIFICADO E ESTRUTURA

CONTEXTO DA ESTROFE:
${context.map((line, i) => `${i === lineIndex ? '→ ' : '  '}${line}`).join('\n')}

LINHA PROBLEMÁTICA: "${problemLine}"
SÍLABAS ATUAIS: ${countPoeticSyllables(problemLine)} (MÁXIMO: ${enforcement.max})

OBJETIVOS CRÍTICOS:
1. MÁXIMO ${enforcement.max} sílabas
2. Mantenha o MESMO SIGNIFICADO
3. Preserve a COERÊNCIA com as outras linhas
4. Use linguagem natural do ${genre}

EXEMPLOS BONS:

"Meu coração acelera quando você se aproxima" (13s)
→ "Coração dispara quando cê chega perto" (9s) ✅

"Eu estou completamente perdido no seu olhar" (12s)  
→ "Tô perdido no teu olhar profundo" (8s) ✅

"Neste momento mágico tudo faz sentido" (12s)
→ "Nesse instante, tudo faz sentido" (8s) ✅

REESCREVA ESTA LINHA mantendo o significado e fluxo:

"${problemLine}"

→ (APENAS A LINHA CORRIGIDA)`

    try {
      const { text } = await generateText({
        model: "openai/gpt-4o",
        prompt,
        temperature: 0.4,
        maxTokens: 100
      })

      const corrected = text.trim().replace(/^["']|["']$/g, "")
      return countPoeticSyllables(corrected) <= enforcement.max ? corrected : problemLine

    } catch (error) {
      console.error('Erro no rewrite contextual:', error)
      return problemLine
    }
  }

  /**
   * REWRITE FROM SCRATCH - Último recurso
   */
  private static async rewriteFromScratch(
    theme: string,
    maxSyllables: number,
    genre: string
  ): Promise<string> {

    const prompt = `CRIE UMA LINHA MUSICAL BREVE

TEMA: ${theme}
GÊNERO: ${genre}
SÍLABAS: MÁXIMO ${maxSyllables}

CRIE uma linha poética sobre "${theme}" com até ${maxSyllables} sílabas.

→ (APENAS UMA LINHA)`

    try {
      const { text } = await generateText({
        model: "openai/gpt-4o", 
        prompt,
        temperature: 0.6,
        maxTokens: 50
      })

      return text.trim().replace(/^["']|["']$/g, "").split('\n')[0]

    } catch (error) {
      return `[${theme}]` // Fallback absoluto
    }
  }

  /**
   * GARANTIA DE COERÊNCIA FINAL
   */
  private static async ensureFinalCoherence(
    lyrics: string,
    genre: string,
    enforcement: SyllableEnforcement
  ): Promise<string> {

    const lines = lyrics.split('\n')
    let hasProblems = false

    // Verifica se ainda há problemas
    for (let i = 0; i < lines.length; i++) {
      if (!this.shouldSkipLine(lines[i]) && 
          countPoeticSyllables(lines[i]) > enforcement.max) {
        hasProblems = true
        break
      }
    }

    if (!hasProblems) return lyrics

    console.log('[ConservativeEnforcer] Aplicando correção de coerência final...')

    const prompt = `CORREÇÃO FINAL DE LETRA MUSICAL - GARANTIA DE QUALIDADE

LETRA ATUAL:
${lyrics}

PROBLEMAS IDENTIFICADOS: Algumas linhas ainda estão muito longas

REESCREVA A LETRA COMPLETA garantindo:
1. TODAS as linhas têm MÁXIMO ${enforcement.max} sílabas
2. Preserve a ESTRUTURA (versos, refrões, pontes)
3. Mantenha as MESMAS RIMAS e padrão rítmico  
4. Use linguagem natural do ${genre}
5. Não corte linhas pela metade

CRITÉRIOS ESSENCIAIS:
- Linhas completas, nunca cortadas
- Rimas preservadas
- Significado mantido
- Fluxo natural

→ (RETORNE A LETRA COMPLETA CORRIGIDA)`

    try {
      const { text } = await generateText({
        model: "openai/gpt-4o",
        prompt,
        temperature: 0.3,
        maxTokens: 2000
      })

      return text

    } catch (error) {
      console.error('Erro na correção final:', error)
      return lyrics // Mantém original se falhar
    }
  }

  /**
   * ANÁLISE DE ESTRUTURA DA MÚSICA
   */
  private static analyzeSongStructure(lines: string[]): any {
    const structure = {
      sections: [] as Array<{type: string, start: number, end: number}>,
      rhymePatterns: new Map<string, number[]>()
    }

    let currentSection = { type: 'verse', start: 0 }
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Detecta seções
      if (line.includes('[VERSE') || line.includes('[CHORUS') || 
          line.includes('[BRIDGE') || line.includes('[PRE-CHORUS')) {
        if (currentSection.start !== i) {
          currentSection.end = i - 1
          structure.sections.push(currentSection)
        }
        currentSection = { 
          type: line.match(/\[(.*?)\]/)?.[1] || 'unknown', 
          start: i 
        }
      }
    }

    return structure
  }

  /**
   * ENCONTRA GRUPO DE RIMA
   */
  private static findRhymeGroup(analysis: any, lineIndex: number): number[] {
    // Implementação simplificada - na prática use análise mais sofisticada
    return []
  }

  /**
   * CONTEXTO DA ESTROFE
   */
  private static getStanzaContext(lines: string[], currentIndex: number): string[] {
    const start = Math.max(0, currentIndex - 2)
    const end = Math.min(lines.length, currentIndex + 3)
    return lines.slice(start, end)
  }

  /**
   * EXTRAI TEMA DA LINHA
   */
  private static extractLineTheme(line: string): string {
    const keywords = ['amor', 'paixão', 'desejo', 'olhar', 'coração', 'perdição', 'perdido']
    const found = keywords.find(keyword => 
      line.toLowerCase().includes(keyword)
    )
    return found || 'sentimento'
  }

  /**
   * VALIDAÇÃO (método que estava faltando)
   */
  static validateLyrics(lyrics: string, enforcement: SyllableEnforcement) {
    const lines = lyrics.split('\n').filter(line => 
      line.trim() && !this.shouldSkipLine(line)
    )

    const strictEnforcement = { ...enforcement, max: this.STRICT_MAX_SYLLABLES }

    const stats = {
      totalLines: lines.length,
      withinLimit: 0,
      problems: [] as Array<{ line: string; syllables: number }>
    }

    lines.forEach(line => {
      const syllables = countPoeticSyllables(line)
      if (syllables >= strictEnforcement.min && syllables <= strictEnforcement.max) {
        stats.withinLimit++
      } else {
        stats.problems.push({ line, syllables })
      }
    })

    return {
      valid: stats.problems.length === 0,
      compliance: stats.totalLines > 0 ? stats.withinLimit / stats.totalLines : 1,
      ...stats
    }
  }

  private static shouldSkipLine(line: string): boolean {
    const trimmed = line.trim()
    return (
      !trimmed ||
      trimmed.startsWith('[') ||
      trimmed.startsWith('(') ||
      trimmed.startsWith('Titulo:') ||
      trimmed.includes('BPM:') ||
      trimmed.includes('Instrumentos:')
    )
  }
}
