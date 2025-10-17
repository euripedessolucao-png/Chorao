/**
 * SISTEMA DE IMPOSIÇÃO RIGOROSA MAS INTELIGENTE DE SÍLABAS
 * Foco: MÁXIMO 11 sílabas com preservação de qualidade
 */

import { countPoeticSyllables } from "./syllable-counter"
import { generateText } from "ai"

export interface SyllableEnforcement {
  min: number
  max: number 
  ideal: number
}

export class SyllableEnforcer {
  private static readonly MAX_CORRECTION_ATTEMPTS = 1
  private static readonly STRICT_MAX_SYLLABLES = 11 // ✅ RIGOROSO: máximo 11

  /**
   * IMPOSIÇÃO RIGOROSA: Máximo 11 sílabas, mas com correções inteligentes
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

    // ✅ USAR LIMITE RIGOROSO: máximo 11, não 12
    const strictEnforcement = { ...enforcement, max: this.STRICT_MAX_SYLLABLES }

    for (let i = 0; i < lines.length; i++) {
      const originalLine = lines[i]
      
      // Pular linhas de estrutura
      if (this.shouldSkipLine(originalLine)) {
        correctedLines.push(originalLine)
        continue
      }

      const syllables = countPoeticSyllables(originalLine)
      
      // ✅ RIGOROSO: Apenas até 11 sílabas são aceitas
      if (syllables >= strictEnforcement.min && syllables <= strictEnforcement.max) {
        correctedLines.push(originalLine)
      } else {
        violations.push(`Linha ${i+1}: "${originalLine}" -> ${syllables}s`)
        
        console.log(`[SyllableEnforcer] Corrigindo linha ${i+1}: "${originalLine}" (${syllables}s)`)
        
        const correctedLine = await this.correctSyllableLine(
          originalLine, 
          syllables, 
          strictEnforcement, 
          genre
        )
        
        const finalSyllables = countPoeticSyllables(correctedLine)
        
        // ✅ VERIFICA se a correção foi bem-sucedida (até 11 sílabas)
        if (finalSyllables >= strictEnforcement.min && finalSyllables <= strictEnforcement.max) {
          correctedLines.push(correctedLine)
          corrections++
          console.log(`[SyllableEnforcer] ✓ Correção bem-sucedida: ${syllables}s -> ${finalSyllables}s`)
        } else {
          // ❌ Correção falhou - aplica correção de emergência
          const emergencyCorrected = this.applyEmergencyCorrection(originalLine, strictEnforcement.max)
          correctedLines.push(emergencyCorrected)
          corrections++
          console.log(`[SyllableEnforcer] ⚠️ Usando correção de emergência: ${syllables}s -> ${countPoeticSyllables(emergencyCorrected)}s`)
        }
      }
    }

    return {
      correctedLyrics: correctedLines.join('\n'),
      corrections,
      violations
    }
  }

  /**
   * CORREÇÃO INTELIGENTE: Foca em reduzir para máximo 11 sílabas
   */
  private static async correctSyllableLine(
    line: string,
    currentSyllables: number,
    enforcement: SyllableEnforcement,
    genre: string
  ): Promise<string> {
    // ✅ PRIMEIRO: Tenta correções automáticas LOCAIS
    const autoCorrected = this.applySmartCorrections(line, enforcement.max)
    const autoSyllables = countPoeticSyllables(autoCorrected)
    
    if (autoSyllables <= enforcement.max) {
      console.log(`[SyllableEnforcer] Correção automática: "${line}" -> "${autoCorrected}"`)
      return autoCorrected
    }

    // ✅ SEGUNDO: Se ainda longa, usa IA com foco em 11 sílabas
    const correctionPrompt = this.buildStrictCorrectionPrompt(line, currentSyllables, enforcement, genre)
    
    try {
      const { text: correctedLine } = await generateText({
        model: "openai/gpt-4o",
        prompt: correctionPrompt,
        temperature: 0.3
      })

      const correctedText = correctedLine.trim().replace(/^["']|["']$/g, "")
      const newSyllables = countPoeticSyllables(correctedText)

      console.log(`[SyllableEnforcer] Correção IA: "${line}" (${currentSyllables}s) -> "${correctedText}" (${newSyllables}s)`)

      return correctedText

    } catch (error) {
      console.error('[SyllableEnforcer] Erro na correção:', error)
      return this.applyEmergencyCorrection(line, enforcement.max)
    }
  }

  /**
   * CORREÇÕES INTELIGENTES - Foco em reduzir para 11 sílabas
   */
  private static applySmartCorrections(line: string, maxSyllables: number): string {
    let corrected = line

    // ✅ CONTRACÕES OBRIGATÓRIAS para reduzir sílabas
    const contractions = [
      { from: /\bvocê\b/gi, to: 'cê' },
      { from: /\bestá\b/gi, to: 'tá' },
      { from: /\bpara\b/gi, to: 'pra' },
      { from: /\bestou\b/gi, to: 'tô' },
      { from: /\bcomigo\b/gi, to: 'comigo' },
      { from: /\bcontigo\b/gi, to: 'contigo' },
      { from: /\bnessa\b/gi, to: 'nessa' },
      { from: /\bnesse\b/gi, to: 'nesse' },
    ]

    contractions.forEach(({ from, to }) => {
      corrected = corrected.replace(from, to)
    })

    // ✅ ELISAO ESTRATÉGICA
    const elisions = [
      { from: /\bde amor\b/gi, to: 'd\'amor' },
      { from: /\bque eu\b/gi, to: 'qu\'eu' },
      { from: /\bmeu amor\b/gi, to: 'meuamor' },
      { from: /\bte amo\b/gi, to: 'teamo' },
    ]

    elisions.forEach(({ from, to }) => {
      corrected = corrected.replace(from, to)
    })

    // ✅ REMOÇÃO DE PALAVRAS DESNECESSÁRIAS (apenas se ainda estiver longo)
    const currentSyllables = countPoeticSyllables(corrected)
    if (currentSyllables > maxSyllables) {
      // Remove artigos e adjetivos menos importantes
      corrected = corrected
        .replace(/\b(o|a|os|as|um|uma)\s+/gi, ' ')
        .replace(/\b(muito|pouco|grande|pequeno)\s+/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    }

    return corrected
  }

  /**
   * CORREÇÃO DE EMERGÊNCIA - Garante máximo 11 sílabas
   */
  private static applyEmergencyCorrection(line: string, maxSyllables: number): string {
    console.log(`[SyllableEnforcer] Aplicando correção de emergência para: "${line}"`)
    
    const words = line.split(' ').filter(w => w.trim())
    
    // Estratégia: Remove palavras do final até caber em 11 sílabas
    for (let i = words.length; i > 2; i--) {
      const candidate = words.slice(0, i).join(' ')
      if (countPoeticSyllables(candidate) <= maxSyllables) {
        return candidate
      }
    }
    
    // Último recurso: Pega as primeiras 3-4 palavras
    return words.slice(0, 4).join(' ')
  }

  /**
   * PROMPT RIGOROSO - Foco em MÁXIMO 11 sílabas
   */
  private static buildStrictCorrectionPrompt(
    line: string,
    syllables: number,
    enforcement: SyllableEnforcement,
    genre: string
  ): string {
    return `CORREÇÃO URGENTE DE SÍLABAS - MÁXIMO 11 SÍLABAS

LINHA PROBLEMÁTICA: "${line}"
SÍLABAS ATUAIS: ${syllables} (LIMITE RÍGIDO: ${enforcement.max})

REESCREVA ESTA LINHA para ter NO MÁXIMO ${enforcement.max} SÍLABAS.

TÉCNICAS OBRIGATÓRIAS:

1. CORTE ESTRATÉGICO:
   - Remova palavras desnecessárias
   - Mantenha apenas o essencial
   - Preserve o significado principal

2. CONTRACÕES RADICAIS:
   - "você" → "cê" (SEMPRE)
   - "está" → "tá" (SEMPRE)
   - "para" → "pra" (SEMPRE)

3. EXEMPLOS PRÁTICOS:

"Me olha e provoca: 'Vem se entregar, amor!'" (13s)
→ "Me olha: 'Vem se entregar!'" (7s)

"Me diz: 'Caçador, você já se perdeu?'" (12s)
→ "Pergunta: 'Caçador, se perdeu?'" (8s)

"Eu digo: 'Tô preso, entreguei o coração'" (13s)
→ "Respondo: 'Tô preso, te entreguei'" (8s)

GÊNERO: ${genre} - Mantenha a essência do estilo

SUA TAREFA (CRÍTICA):
Transforme em NO MÁXIMO ${enforcement.max} sílabas: "${line}"
→ (APENAS A LINHA CORRIGIDA)`
  }

  /**
   * Verifica se linha deve ser pulada na validação
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
   * VALIDAÇÃO RÁPIDA para verificar conformidade
   */
  static validateLyrics(lyrics: string, enforcement: SyllableEnforcement) {
    const lines = lyrics.split('\n').filter(line => 
      line.trim() && !this.shouldSkipLine(line)
    )

    // ✅ USAR LIMITE RIGOROSO
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
}
