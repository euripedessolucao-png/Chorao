/**
 * SISTEMA DE PRESERVAÇÃO RÍTMICA E RIMÁTICA
 * Mantém rimas ricas enquanto aplica limite de sílabas
 */

import { countPoeticSyllables } from "./syllable-counter"
import { generateText } from "ai"

export interface SyllableEnforcement {
  min: number
  max: number 
  ideal: number
}

export interface RhymeStructure {
  pattern: string // 'ABAB', 'AABB', etc
  rhymeGroups: Map<string, number[]> // Map<rimeSound, [lineIndexes]>
}

export class SyllableEnforcer {
  private static readonly MAX_CORRECTION_ATTEMPTS = 2
  private static readonly STRICT_MAX_SYLLABLES = 11

  /**
   * ANÁLISE DE ESTRUTURA RÍTMICA - Detecta padrões de rima
   */
  private static analyzeRhymeStructure(lyrics: string): RhymeStructure {
    const lines = lyrics.split('\n').filter(line => 
      line.trim() && !this.shouldSkipLine(line)
    )
    
    const rhymeGroups = new Map<string, number[]>()
    const pattern: string[] = []
    let currentLetter = 'A'

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const rhymeSound = this.extractRhymeSound(line)
      
      if (rhymeGroups.has(rhymeSound)) {
        const group = rhymeGroups.get(rhymeSound)!
        group.push(i)
        pattern.push(String.fromCharCode(65 + group[0])) // A, B, C based on first occurrence
      } else {
        rhymeGroups.set(rhymeSound, [i])
        pattern.push(currentLetter)
        currentLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1)
      }
    }

    return {
      pattern: pattern.join(''),
      rhymeGroups
    }
  }

  /**
   * EXTRAI SOM DA RIMA (última palavra ou sílabas finais)
   */
  private static extractRhymeSound(line: string): string {
    const words = line.trim().split(/\s+/)
    if (words.length === 0) return ''
    
    const lastWord = words[words.length - 1].toLowerCase()
    // Remove pontuação final
    const cleanWord = lastWord.replace(/[.,!?;:]$/, '')
    
    // Foca nas últimas 2-3 sílabas para rima
    return this.getLastSyllables(cleanWord, 2)
  }

  /**
   * OBTÉM ÚLTIMAS SÍLABAS para análise de rima
   */
  private static getLastSyllables(word: string, syllableCount: number): string {
    // Simulação - na prática use uma biblioteca de sílabas
    const vowels = 'aeiouáéíóúâêîôûàèìòù'
    let syllables = ''
    let count = 0
    
    for (let i = word.length - 1; i >= 0 && count < syllableCount; i--) {
      syllables = word[i] + syllables
      if (vowels.includes(word[i].toLowerCase())) {
        count++
      }
    }
    
    return syllables || word
  }

  /**
   * ENFORCE COM PRESERVAÇÃO DE RIMAS
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

    // ✅ ANALISA estrutura de rimas ANTES de corrigir
    const rhymeStructure = this.analyzeRhymeStructure(lyrics)
    console.log('[RhymePreserver] Estrutura de rima detectada:', rhymeStructure.pattern)

    const strictEnforcement = { ...enforcement, max: this.STRICT_MAX_SYLLABLES }

    for (let i = 0; i < lines.length; i++) {
      const originalLine = lines[i]
      
      if (this.shouldSkipLine(originalLine)) {
        correctedLines.push(originalLine)
        continue
      }

      const syllables = countPoeticSyllables(originalLine)
      const rhymeSound = this.extractRhymeSound(originalLine)
      
      if (syllables >= strictEnforcement.min && syllables <= strictEnforcement.max) {
        correctedLines.push(originalLine)
      } else {
        violations.push(`Linha ${i+1}: "${originalLine}" -> ${syllables}s`)
        
        console.log(`[RhymePreserver] Corrigindo linha ${i+1} (rima: ${rhymeSound}): "${originalLine}"`)

        // ✅ CORREÇÃO COM PRESERVAÇÃO DE RIMA
        const correctedLine = await this.rhymeAwareCorrection(
          originalLine, 
          syllables, 
          strictEnforcement, 
          genre,
          rhymeSound,
          rhymeStructure,
          i
        )
        
        const finalSyllables = countPoeticSyllables(correctedLine)
        const preservedRhyme = this.extractRhymeSound(correctedLine)
        
        if (finalSyllables <= strictEnforcement.max && preservedRhyme === rhymeSound) {
          correctedLines.push(correctedLine)
          corrections++
          console.log(`[RhymePreserver] ✓ Correção perfeita: ${syllables}s -> ${finalSyllables}s (rima preservada)`)
        } else {
          // ❌ Se não preservou a rima, tenta correção em grupo
          const groupCorrected = await this.correctRhymeGroup(
            lines, i, rhymeStructure, strictEnforcement, genre
          )
          correctedLines.push(groupCorrected)
          corrections++
          console.log(`[RhymePreserver] ⚠️ Correção em grupo aplicada`)
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
   * CORREÇÃO COM CONSCIÊNCIA DE RIMA
   */
  private static async rhymeAwareCorrection(
    line: string,
    currentSyllables: number,
    enforcement: SyllableEnforcement,
    genre: string,
    targetRhyme: string,
    rhymeStructure: RhymeStructure,
    lineIndex: number
  ): Promise<string> {

    // ✅ PRIMEIRO: Tenta correções que preservam a rima
    const rhymePreservingCorrection = this.applyRhymePreservingCorrections(
      line, enforcement.max, targetRhyme
    )
    
    const correctedSyllables = countPoeticSyllables(rhymePreservingCorrection)
    const preservedRhyme = this.extractRhymeSound(rhymePreservingCorrection)

    if (correctedSyllables <= enforcement.max && preservedRhyme === targetRhyme) {
      return rhymePreservingCorrection
    }

    // ✅ SEGUNDO: IA com foco em preservar rima
    const correctionPrompt = this.buildRhymePreservationPrompt(
      line, currentSyllables, enforcement, genre, targetRhyme
    )
    
    try {
      const { text: correctedLine } = await generateText({
        model: "openai/gpt-4o",
        prompt: correctionPrompt,
        temperature: 0.3
      })

      const correctedText = correctedLine.trim().replace(/^["']|["']$/g, "")
      const finalRhyme = this.extractRhymeSound(correctedText)

      // ✅ VERIFICA se preservou a rima
      if (finalRhyme === targetRhyme) {
        return correctedText
      } else {
        // Se não preservou, aplica correção que mantém a rima a qualquer custo
        return this.forceRhymePreservation(line, enforcement.max, targetRhyme)
      }

    } catch (error) {
      console.error('[RhymePreserver] Erro na correção:', error)
      return this.forceRhymePreservation(line, enforcement.max, targetRhyme)
    }
  }

  /**
   * CORREÇÕES QUE PRESERVAM RIMA
   */
  private static applyRhymePreservingCorrections(
    line: string, 
    maxSyllables: number, 
    targetRhyme: string
  ): string {
    let corrected = line
    const words = corrected.split(' ')
    const lastWord = words[words.length - 1]

    // ✅ MANTÉM a última palavra (a que define a rima) e ajusta o RESTANTE
    if (words.length > 3) {
      // Tenta reduzir as palavras do MEIO, mantendo início e fim
      const middleReduction = [
        ...words.slice(0, Math.floor(words.length / 2)),
        ...words.slice(-2) // Mantém últimas 2 palavras (normalmente verbo + rima)
      ].join(' ')
      
      if (countPoeticSyllables(middleReduction) <= maxSyllables) {
        return middleReduction
      }
    }

    // ✅ CONTRACÕES que não afetam a rima
    const safeContractions = [
      { from: /\bvocê\b/gi, to: 'cê' },
      { from: /\bestá\b/gi, to: 'tá' },
      { from: /\bpara\b/gi, to: 'pra' },
      { from: /\bestou\b/gi, to: 'tô' },
      { from: /\bcomigo\b/gi, to: 'comigo' },
    ]

    safeContractions.forEach(({ from, to }) => {
      corrected = corrected.replace(from, to)
    })

    // ✅ REMOÇÃO de palavras do MEIO (nunca do final)
    const currentSyllables = countPoeticSyllables(corrected)
    if (currentSyllables > maxSyllables && words.length > 4) {
      // Remove 1-2 palavras do meio, mantendo início e fim
      const preservedWords = [words[0], ...words.slice(-2)].join(' ')
      if (countPoeticSyllables(preservedWords) <= maxSyllables) {
        return preservedWords
      }
    }

    return corrected
  }

  /**
   * FORÇA PRESERVAÇÃO DA RIMA (último recurso)
   */
  private static forceRhymePreservation(
    line: string, 
    maxSyllables: number, 
    targetRhyme: string
  ): string {
    const words = line.split(' ')
    
    // Estratégia: Mantém estrutura sujeito-verbo + palavra que rima
    if (words.length >= 3) {
      const minimalStructure = [words[0], words[1], targetRhyme].join(' ')
      if (countPoeticSyllables(minimalStructure) <= maxSyllables) {
        return minimalStructure
      }
    }
    
    // Último recurso: Apenas sujeito + palavra que rima
    const fallback = [words[0], targetRhyme].join(' ')
    return countPoeticSyllables(fallback) <= maxSyllables ? fallback : targetRhyme
  }

  /**
   * CORREÇÃO EM GRUPO DE RIMA (para estrofes inteiras)
   */
  private static async correctRhymeGroup(
    allLines: string[],
    problemIndex: number,
    rhymeStructure: RhymeStructure,
    enforcement: SyllableEnforcement,
    genre: string
  ): Promise<string> {
    
    const problemLine = allLines[problemIndex]
    const problemRhyme = this.extractRhymeSound(problemLine)
    
    // Encontra todas as linhas com a mesma rima
    const rhymeGroup = rhymeStructure.rhymeGroups.get(problemRhyme) || []
    
    if (rhymeGroup.length > 1) {
      console.log(`[RhymePreserver] Corrigindo grupo de rima com ${rhymeGroup.length} linhas`)
      
      // Para grupos pequenos, pode-se reescrever todas juntas
      if (rhymeGroup.length <= 4) {
        const groupPrompt = this.buildRhymeGroupPrompt(
          rhymeGroup.map(idx => allLines[idx]),
          enforcement,
          genre,
          problemRhyme
        )
        
        try {
          const { text: correctedGroup } = await generateText({
            model: "openai/gpt-4o", 
            prompt: groupPrompt,
            temperature: 0.3
          })
          
          // Extrai a linha correspondente ao problema
          const correctedLines = correctedGroup.split('\n').filter(l => l.trim())
          const ourLineIndex = rhymeGroup.indexOf(problemIndex)
          if (ourLineIndex < correctedLines.length) {
            return correctedLines[ourLineIndex]
          }
        } catch (error) {
          console.error('[RhymePreserver] Erro na correção de grupo:', error)
        }
      }
    }
    
    // Fallback: correção individual forçada
    return this.forceRhymePreservation(problemLine, enforcement.max, problemRhyme)
  }

  /**
   * PROMPT PARA PRESERVAÇÃO DE RIMAS
   */
  private static buildRhymePreservationPrompt(
    line: string,
    syllables: number,
    enforcement: SyllableEnforcement,
    genre: string,
    targetRhyme: string
  ): string {
    return `REESCRITA MUSICAL CRÍTICA - PRESERVE A RIMA!

LINHA ORIGINAL: "${line}"
SÍLABAS ATUAIS: ${syllables} (MÁXIMO PERMITIDO: ${enforcement.max})
RIMA A PRESERVAR: "${targetRhyme}"

REGRAS ABSOLUTAS:
1. MÁXIMO ${enforcement.max} sílabas poéticas
2. A RIMA "${targetRhyme}" DEVE SER MANTIDA no final
3. Preserve o significado principal

TÉCNICAS OBRIGATÓRIAS:

• CONTRACÕES: "você"→"cê", "está"→"tá", "para"→"pra"
• SIMPLIFICAÇÃO: Reduza palavras do MEIO, nunca do FINAL
• ELISAO: "de amor"→"d'amor", "que eu"→"qu'eu"

EXEMPLOS COM PRESERVAÇÃO DE RIMA:

"Meu coração dispara quando você chega perto" (14s) → rima "perto"
→ "Coração dispara quando cê chega perto" (10s) ✅ RIMA PRESERVADA

"Eu estou completamente perdido nos seus olhos" (13s) → rima "olhos" 
→ "Tô completamente perdido nos teus olhos" (10s) ✅ RIMA PRESERVADA

"Toda vez que eu te vejo, o mundo para de girar" (14s) → rima "girar"
→ "Sempre que te vejo, o mundo para de girar" (11s) ✅ RIMA PRESERVADA

GÊNERO: ${genre}

SUA TAREFA CRÍTICA:
Reescreva com MÁXIMO ${enforcement.max} sílabas PRESERVANDO a rima "${targetRhyme}":

"${line}"

→ (APENAS A LINHA CORRIGIDA)`
  }

  /**
   * PROMPT PARA CORREÇÃO DE GRUPOS DE RIMA
   */
  private static buildRhymeGroupPrompt(
    lines: string[],
    enforcement: SyllableEnforcement,
    genre: string,
    targetRhyme: string
  ): string {
    return `REESCRITA DE ESTROFE - GRUPO DE RIMA COERENTE

LINHAS ORIGINAIS (TODAS RIMAM COM "${targetRhyme}"):
${lines.map((line, i) => `${i+1}. "${line}"`).join('\n')}

REESCREVA TODAS AS LINHAS para:
1. MÁXIMO ${enforcement.max} sílabas cada
2. MANTER a rima "${targetRhyme}" no final de cada linha  
3. Preservar coerência temática

EXEMPLO DE GRUPO CORRIGIDO:

Originais:
1. "Meu coração dispara quando você chega perto"
2. "Eu fico completamente sem jeito e muito aberto"

Corrigidas:
1. "Coração dispara quando cê chega perto"
2. "Fico sem jeito, me sinto aberto"

GÊNERO: ${genre}

SUA TAREFA:
Reescreva estas ${lines.length} linhas mantendo a rima "${targetRhyme}":

${lines.map(line => `- "${line}"`).join('\n')}

→ (APENAS AS LINHAS CORRIGIDAS, uma por linha)`
  }

  // ... (métodos shouldSkipLine e validateLyrics do código anterior)
}
