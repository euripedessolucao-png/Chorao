/**
 * SISTEMA DE IMPOSIÇÃO RIGOROSA DE SÍLABAS
 * Não apenas valida, mas CORRIGE automaticamente
 */

import { countSyllables } from "./syllableUtils"
import { generateText } from "ai"

export interface SyllableEnforcement {
  min: number
  max: number 
  ideal: number
}

export class SyllableEnforcer {
  private static readonly MAX_CORRECTION_ATTEMPTS = 2

  /**
   * IMPOSIÇÃO RIGOROSA: Valida e corrige linha por linha
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

      const syllables = countSyllables(originalLine)
      
      if (syllables >= enforcement.min && syllables <= enforcement.max) {
        // Dentro do limite - mantém
        correctedLines.push(originalLine)
      } else {
        // Fora do limite - CORRIGE automaticamente
        violations.push(`Linha ${i+1}: "${originalLine}" → ${syllables} sílabas`)
        
        const correctedLine = await this.correctSyllableLine(
          originalLine, 
          syllables, 
          enforcement, 
          genre
        )
        
        correctedLines.push(correctedLine)
        corrections++
      }
    }

    return {
      correctedLyrics: correctedLines.join('\n'),
      corrections,
      violations
    }
  }

  /**
   * CORREÇÃO AUTOMÁTICA de linha problemática
   */
  private static async correctSyllableLine(
    line: string,
    currentSyllables: number,
    enforcement: SyllableEnforcement,
    genre: string
  ): Promise<string> {
    let attempts = 0
    let currentLine = line

    while (attempts < this.MAX_CORRECTION_ATTEMPTS) {
      attempts++

      const correctionPrompt = this.buildCorrectionPrompt(currentLine, currentSyllables, enforcement, genre)
      
      try {
        const { text: correctedLine } = await generateText({
          model: "openai/gpt-4o",
          prompt: correctionPrompt,
          temperature: 0.3, // Baixa para correções precisas
          maxTokens: 50
        })

        const correctedText = correctedLine.trim()
        const newSyllables = countSyllables(correctedText)

        console.log(`[SyllableEnforcer] Correção ${attempts}: "${currentLine}" (${currentSyllables}s) → "${correctedText}" (${newSyllables}s)`)

        // Verifica se a correção foi bem-sucedida
        if (newSyllables >= enforcement.min && newSyllables <= enforcement.max) {
          return correctedText
        }

        currentLine = correctedText
        currentSyllables = newSyllables

      } catch (error) {
        console.error('[SyllableEnforcer] Erro na correção:', error)
        break
      }
    }

    // Se não conseguiu corrigir, retorna a linha original com aviso
    return `${line} [⚠️ ${currentSyllables}s - NÃO CORRIGIDO]`
  }

  /**
   * PROMPT DE CORREÇÃO ESPECÍFICO
   */
  private static buildCorrectionPrompt(
    line: string,
    syllables: number,
    enforcement: SyllableEnforcement,
    genre: string
  ): string {
    return `🚨 CORREÇÃO DE SÍLABA OBRIGATÓRIA

LINHA PROBLEMÁTICA: "${line}"
SÍLABAS ATUAIS: ${syllables} (FORA DO LIMITE ${enforcement.min}-${enforcement.max})

REESCREVA ESTA LINHA para ter entre ${enforcement.min} e ${enforcement.max} sílabas.

TÉCNICAS OBRIGATÓRIAS:

1. CONTRÇÕES IMEDIATAS:
   • "você" → "cê" (2→1 sílaba)
   • "estou" → "tô" (2→1 sílaba) 
   • "para" → "pra" (2→1 sílaba)
   • "está" → "tá" (2→1 sílaba)
   • "comigo" → "c'migo" (3→2 sílabas)

2. ELISÃO AUTOMÁTICA:
   • "de amor" → "d'amor" (3→2 sílabas)
   • "que eu" → "qu'eu" (2→1 sílaba)
   • "meu amor" → "meuamor" (4→3 sílabas)
   • "se eu" → "s'eu" (2→1 sílaba)

3. CORTE DE PALAVRAS DESNECESSÁRIAS:
   • Remova adjetivos supérfluos
   • Use frases mais diretas
   • Mantenha apenas palavras essenciais

4. LINGUAGEM ${genre.toUpperCase()}:
   • Use gírias e expressões do gênero
   • Mantenha a naturalidade brasileira

EXEMPLOS PRÁTICOS:

"Eu estou pensando em você constantemente" (13s ✗)
→ "Tô pensando em cê sempre" (6s ✓)

"A saudade que eu sinto no peito é enorme" (14s ✗)  
→ "Saudade no peito dói" (6s ✓)

"Vamos aproveitar essa noite maravilhosa" (12s ✗)
→ "Vamo curtir essa noite" (6s ✓)

SUA TAREFA:
Corrija: "${line}"
→`
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
      trimmed.startsWith('Título:') ||
      trimmed.startsWith('Instrução:') ||
      trimmed.match(/^Instrução:/)
    )
  }

  /**
   * VALIDAÇÃO RÁPIDA para verificar conformidade
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
      const syllables = countSyllables(line)
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
