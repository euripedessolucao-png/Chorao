/**
 * SISTEMA DE IMPOSICAO RIGOROSA DE SILABAS
 * Nao apenas valida, mas CORRIGE automaticamente
 */

import { countPoeticSyllables } from "./syllable-counter"
import { generateText } from "ai"

export interface SyllableEnforcement {
  min: number
  max: number 
  ideal: number
}

export class SyllableEnforcer {
  private static readonly MAX_CORRECTION_ATTEMPTS = 2

  /**
   * IMPOSICAO RIGOROSA: Valida e corrige linha por linha
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
        // Dentro do limite - mantem
        correctedLines.push(originalLine)
      } else {
        // Fora do limite - CORRIGE automaticamente
        violations.push(`Linha ${i+1}: "${originalLine}" -> ${syllables} silabas`)
        
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
   * CORRECAO AUTOMATICA de linha problematica
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
          temperature: 0.3 // Baixa para correcoes precisas
        })

        const correctedText = correctedLine.trim()
        const newSyllables = countSyllables(correctedText)

        console.log(`[SyllableEnforcer] Correcao ${attempts}: "${currentLine}" (${currentSyllables}s) -> "${correctedText}" (${newSyllables}s)`)

        // Verifica se a correcao foi bem-sucedida
        if (newSyllables >= enforcement.min && newSyllables <= enforcement.max) {
          return correctedText
        }

        currentLine = correctedText
        currentSyllables = newSyllables

      } catch (error) {
        console.error('[SyllableEnforcer] Erro na correcao:', error)
        break
      }
    }

    // Se nao conseguiu corrigir, retorna a linha original com aviso
    return `${line} [ATENCAO ${currentSyllables}s - NAO CORRIGIDO]`
  }

  /**
   * PROMPT DE CORRECAO ESPECIFICO
   */
  private static buildCorrectionPrompt(
    line: string,
    syllables: number,
    enforcement: SyllableEnforcement,
    genre: string
  ): string {
    return `CORRECAO DE SILABA OBRIGATORIA

LINHA PROBLEMATICA: "${line}"
SILABAS ATUAIS: ${syllables} (FORA DO LIMITE ${enforcement.min}-${enforcement.max})

REESCREVA ESTA LINHA para ter entre ${enforcement.min} e ${enforcement.max} silabas.

TECNICAS OBRIGATORIAS:

1. CONTRAÇÕES IMEDIATAS:
   - "voce" -> "ce" (2->1 silaba)
   - "estou" -> "to" (2->1 silaba) 
   - "para" -> "pra" (2->1 silaba)
   - "esta" -> "ta" (2->1 silaba)
   - "comigo" -> "c'migo" (3->2 silabas)

2. ELISAO AUTOMATICA:
   - "de amor" -> "d'amor" (3->2 silabas)
   - "que eu" -> "qu'eu" (2->1 silaba)
   - "meu amor" -> "meuamor" (4->3 silabas)
   - "se eu" -> "s'eu" (2->1 silaba)

3. CORTE DE PALAVRAS DESNECESSARIAS:
   - Remova adjetivos superfluos
   - Use frases mais diretas
   - Mantenha apenas palavras essenciais

4. LINGUAGEM ${genre.toUpperCase()}:
   - Use girias e expressoes do genero
   - Mantenha a naturalidade brasileira

EXEMPLOS PRATICOS:

"Eu estou pensando em voce constantemente" (13s ERRADO)
-> "To pensando em ce sempre" (6s CORRETO)

"A saudade que eu sinto no peito e enorme" (14s ERRADO)  
-> "Saudade no peito doi" (6s CORRETO)

"Vamos aproveitar essa noite maravilhosa" (12s ERRADO)
-> "Vamo curtir essa noite" (6s CORRETO)

SUA TAREFA:
Corrija: "${line}"
->`
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
