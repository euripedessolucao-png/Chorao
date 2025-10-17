/**
 * SISTEMA DE IMPOSICAO RIGOROSA DE SILABAS
 * Nao apenas valida, mas CORRIGE automaticamente
 * VERSÃO SEGURA: Protege contra corrupção de texto
 */

import { countPoeticSyllables } from "./syllable-counter"
import { generateText } from "ai"

export interface SyllableEnforcement {
  min: number
  max: number 
  ideal: number
}

export class SyllableEnforcer {
  private static readonly MAX_CORRECTION_ATTEMPTS = 1 // ✅ REDUZIDO: era 2

  /**
   * IMPOSICAO RIGOROSA: Valida e corrige linha por linha
   * VERSÃO SEGURA: Protege contra corrupção de texto
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

    for (let i = 0; i < lines.length; i++) {
      const originalLine = lines[i]
      
      // Pular linhas de estrutura
      if (this.shouldSkipLine(originalLine)) {
        correctedLines.push(originalLine)
        continue
      }

      const syllables = countPoeticSyllables(originalLine)
      
      if (syllables >= enforcement.min && syllables <= enforcement.max) {
        // Dentro do limite - mantém
        correctedLines.push(originalLine)
      } else {
        // Fora do limite - CORRIGE com cuidado
        violations.push(`Linha ${i+1}: "${originalLine}" -> ${syllables}s`)
        
        console.log(`[SyllableEnforcer] Corrigindo linha ${i+1}: "${originalLine}" (${syllables}s)`)
        
        const correctedLine = await this.correctSyllableLine(
          originalLine, 
          syllables, 
          enforcement, 
          genre
        )
        
        // ✅ PROTEÇÃO: Verifica se a correção não corrompeu o texto
        const integrityCheck = this.validateLineIntegrity(correctedLine)
        if (integrityCheck.isValid) {
          const finalSyllables = countPoeticSyllables(correctedLine)
          
          if (finalSyllables >= enforcement.min && finalSyllables <= enforcement.max) {
            correctedLines.push(correctedLine)
            corrections++
            console.log(`[SyllableEnforcer] ✓ Correção bem-sucedida: ${syllables}s -> ${finalSyllables}s`)
          } else {
            // Correção falhou, mantém original
            correctedLines.push(originalLine)
            console.log(`[SyllableEnforcer] ⚠️ Correção falhou, mantendo original`)
          }
        } else {
          // Texto corrompido, mantém original
          correctedLines.push(originalLine)
          console.log(`[SyllableEnforcer] ❌ Texto corrompido: ${integrityCheck.issue}, mantendo original`)
        }
      }
    }

    const correctedLyrics = correctedLines.join('\n')
    
    // ✅ VALIDAÇÃO FINAL: Verifica integridade geral
    const finalIntegrityCheck = this.validateTextIntegrity(correctedLyrics)
    if (!finalIntegrityCheck.isValid) {
      console.log(`[SyllableEnforcer] ❌ CORREÇÃO FINAL CORROMPEU TEXTO! Retornando original.`)
      return {
        correctedLyrics: lyrics, // Fallback para original
        corrections: 0,
        violations: []
      }
    }

    return {
      correctedLyrics,
      corrections,
      violations
    }
  }

  /**
   * CORRECAO AUTOMATICA de linha problematica
   * VERSÃO SEGURA: Apenas 1 tentativa + proteções
   */
  private static async correctSyllableLine(
    line: string,
    currentSyllables: number,
    enforcement: SyllableEnforcement,
    genre: string
  ): Promise<string> {
    // ✅ PRIMEIRO: Tenta correções automáticas LOCAIS (mais seguras)
    const autoCorrected = this.applyAutomaticCorrections(line, enforcement.max)
    const autoSyllables = countPoeticSyllables(autoCorrected)
    
    if (autoSyllables <= enforcement.max && autoSyllables >= enforcement.min) {
      console.log(`[SyllableEnforcer] Correção automática bem-sucedida: "${line}" -> "${autoCorrected}"`)
      return this.protectPortugueseAccents(autoCorrected) // ✅ PROTEÇÃO
    }

    // ✅ SEGUNDO: Se correção automática falhou, tenta IA APENAS UMA VEZ
    const correctionPrompt = this.buildCorrectionPrompt(line, currentSyllables, enforcement, genre)
    
    try {
      const { text: correctedLine } = await generateText({
        model: "openai/gpt-4o",
        prompt: correctionPrompt,
        temperature: 0.3 // Baixa para precisão
      })

      let correctedText = correctedLine.trim().replace(/^["']|["']$/g, "")
      
      // ✅ PROTEÇÃO: Aplica proteção de acentos ANTES de retornar
      correctedText = this.protectPortugueseAccents(correctedText)
      
      const newSyllables = countPoeticSyllables(correctedText)

      console.log(`[SyllableEnforcer] Correção IA: "${line}" (${currentSyllables}s) -> "${correctedText}" (${newSyllables}s)`)

      return correctedText

    } catch (error) {
      console.error('[SyllableEnforcer] Erro na correção:', error)
      return line // Fallback para original em caso de erro
    }
  }

  /**
   * ✅ PROTEÇÃO: Corrige acentos corrompidos comuns
   */
  private static protectPortugueseAccents(text: string): string {
    const accentMap: { [key: string]: string } = {
      'coraçã': 'coração',
      'razã': 'razão', 
      'paixã': 'paixão',
      'sã': 'são',
      'nã': 'não',
      'coraçao': 'coração',
      'razao': 'razão',
      'paixao': 'paixão'
    }
    
    let protectedText = text
    Object.entries(accentMap).forEach(([wrong, correct]) => {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi')
      protectedText = protectedText.replace(regex, correct)
    })
    
    return protectedText
  }

  /**
   * ✅ VALIDAÇÃO: Verifica se linha não foi corrompida
   */
  private static validateLineIntegrity(line: string): { isValid: boolean; issue?: string } {
    const trimmed = line.trim()
    
    // Verifica acentos corrompidos
    if (/\b(coraçã|razã|paixã|sã|nã)\b/gi.test(trimmed)) {
      return { isValid: false, issue: 'acentos corrompidos' }
    }
    
    // Verifica se linha está muito curta/incompleta
    const words = trimmed.split(/\s+/)
    if (words.length < 3 && !/[.!?]/.test(trimmed) && words.length > 0) {
      return { isValid: false, issue: 'linha incompleta' }
    }
    
    // Verifica caracteres estranhos
    if (/[�]/.test(trimmed)) {
      return { isValid: false, issue: 'caracteres inválidos' }
    }
    
    return { isValid: true }
  }

  /**
   * ✅ VALIDAÇÃO: Verifica integridade geral do texto
   */
  private static validateTextIntegrity(text: string): { isValid: boolean; issues: string[] } {
    const issues: string[] = []
    const lines = text.split('\n')
    
    lines.forEach((line, i) => {
      if (line.trim() && !this.shouldSkipLine(line)) {
        const lineCheck = this.validateLineIntegrity(line)
        if (!lineCheck.isValid) {
          issues.push(`linha ${i+1}: ${lineCheck.issue}`)
        }
      }
    })
    
    return { isValid: issues.length === 0, issues }
  }

  /**
   * CORREÇÕES AUTOMÁTICAS - Mais seguras que IA
   */
  private static applyAutomaticCorrections(line: string, maxSyllables: number): string {
    let corrected = line

    // Lista SEGURA de contrações
    const contractions = [
      { from: /\bvocê\b/gi, to: 'cê' },
      { from: /\bestá\b/gi, to: 'tá' },
      { from: /\bpara\b/gi, to: 'pra' },
      { from: /\bestou\b/gi, to: 'tô' },
      { from: /\bcomigo\b/gi, to: 'comigo' },
      { from: /\bcontigo\b/gi, to: 'contigo' },
    ]

    // Aplica contrações
    contractions.forEach(({ from, to }) => {
      corrected = corrected.replace(from, to)
    })

    // Elisões poéticas SEGURAS
    const elisions = [
      { from: /\bde amor\b/gi, to: 'd\'amor' },
      { from: /\bque eu\b/gi, to: 'qu\'eu' },
    ]

    elisions.forEach(({ from, to }) => {
      corrected = corrected.replace(from, to)
    })

    return corrected
  }

  /**
   * PROMPT DE CORREÇÃO
   */
  private static buildCorrectionPrompt(
    line: string,
    syllables: number,
    enforcement: SyllableEnforcement,
    genre: string
  ): string {
    return `CORREÇÃO DE SILABAS - LINHA PROBLEMÁTICA

LINHA ORIGINAL: "${line}"
SILABAS ATUAIS: ${syllables} (LIMITE: ${enforcement.min}-${enforcement.max})

REESCREVA ESTA LINHA para ter ENTRE ${enforcement.min} E ${enforcement.max} SILABAS POÉTICAS.

REGRAS IMPORTANTES:
1. MANTENHA o significado original
2. USE contrações: você→cê, está→tá, para→pra
3. PRESERVE acentos portugueses: coração, razão, paixão
4. LINHA DEVE fazer sentido completo

EXEMPLOS:
"Meu coração dispara quando te vejo" (11s)
→ "Coração dispara ao te ver" (7s)

"Estou pensando em você constantemente" (13s)  
→ "Tô pensando em cê sempre" (6s)

GÊNERO: ${genre}

SUA TAREFA:
Corrija: "${line}"
→ (APENAS A LINHA CORRIGIDA, sem explicações)`
  }

  /**
   * Verifica se linha deve ser pulada na validacao
   */
  private static shouldSkipLine(line: string): boolean {
    const trimmed = line.trim()
    return (
      !trimmed ||
      trimmed.startsWith('[') ||
      trimmed.startsWith('(') ||
      trimmed.startsWith('Titulo:') ||
      trimmed.startsWith('Instrucao:') ||
      trimmed.includes('Instrucao:')
    )
  }

  /**
   * VALIDACAO RAPIDA para verificar conformidade
   */
  static validateLyrics(lyrics: string, enforcement: SyllableEnforcement) {
    const lines = lyrics.split('\n').filter(line => 
      line.trim() && !this.shouldSkipLine(line)
    )

    const stats = {
      totalLines: lines.length,
      withinLimit: 0,
      problems: [] as Array<{ line: string; syllables: number }>
    }

    lines.forEach(line => {
      const syllables = countPoeticSyllables(line)
      if (syllables >= enforcement.min && syllables <= enforcement.max) {
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
}
