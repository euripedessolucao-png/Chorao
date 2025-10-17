/**
 * SYLLABLE ENFORCER INTELIGENTE - PRESERVAÇÃO DE RIMAS RICAS
 * Trabalha em harmonia com MetaComposer e TerceiraVia
 */

import { countPoeticSyllables } from "./syllable-counter"
import { generateText } from "ai"

export interface SyllableEnforcement {
  min: number
  max: number 
  ideal: number
}

export interface RhymePreservationConfig {
  preserveRhymes: boolean
  preserveStructure: boolean
  maxRhymeGroupCorrections: number
}

export class IntelligentSyllableEnforcer {
  private static readonly STRICT_MAX_SYLLABLES = 11
  private static readonly MAX_CORRECTION_ATTEMPTS = 2

  /**
   * ENFORCE INTELIGENTE - Preserva rimas e estrutura
   */
  static async enforceSyllableLimits(
    lyrics: string, 
    enforcement: SyllableEnforcement,
    genre: string,
    config: RhymePreservationConfig = {
      preserveRhymes: true,
      preserveStructure: true, 
      maxRhymeGroupCorrections: 2
    }
  ): Promise<{ correctedLyrics: string; corrections: number; violations: string[] }> {
    
    const lines = lyrics.split('\n')
    const correctedLines: string[] = []
    let corrections = 0
    const violations: string[] = []

    // ✅ PRIMEIRO: Análise completa da estrutura musical
    const musicalAnalysis = this.analyzeMusicalStructure(lyrics)
    console.log('[IntelligentEnforcer] Análise musical:', {
      sections: musicalAnalysis.sections.length,
      rhymeGroups: musicalAnalysis.rhymeGroups.size
    })

    const strictEnforcement = { ...enforcement, max: this.STRICT_MAX_SYLLABLES }

    for (let i = 0; i < lines.length; i++) {
      const originalLine = lines[i]
      
      if (this.shouldSkipLine(originalLine)) {
        correctedLines.push(originalLine)
        continue
      }

      const syllables = countPoeticSyllables(originalLine)
      const rhymeInfo = this.getRhymeInfo(originalLine, musicalAnalysis, i)
      
      if (syllables <= strictEnforcement.max) {
        correctedLines.push(originalLine)
      } else {
        violations.push(`Linha ${i+1}: "${originalLine}" -> ${syllables}s`)
        
        console.log(`[IntelligentEnforcer] Corrigindo linha ${i+1} (${rhymeInfo.groupId}): "${originalLine}"`)

        // ✅ CORREÇÃO INTELIGENTE COM PRESERVAÇÃO
        const correctedLine = await this.smartRhymePreservingCorrection(
          originalLine,
          syllables,
          strictEnforcement,
          genre,
          rhymeInfo,
          musicalAnalysis,
          i,
          config
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
   * CORREÇÃO INTELIGENTE QUE PRESERVA RIMAS
   */
  private static async smartRhymePreservingCorrection(
    line: string,
    currentSyllables: number,
    enforcement: SyllableEnforcement,
    genre: string,
    rhymeInfo: any,
    musicalAnalysis: any,
    lineIndex: number,
    config: RhymePreservationConfig
  ): Promise<string> {

    // ✅ ESTRATÉGIA 1: Correções locais que preservam rima
    const localFix = this.applyRhymeSafeCorrections(line, enforcement.max, rhymeInfo.rhymeSound)
    if (countPoeticSyllables(localFix) <= enforcement.max) {
      console.log(`[IntelligentEnforcer] ✓ Correção local preservou rima`)
      return localFix
    }

    // ✅ ESTRATÉGIA 2: Se pertence a grupo de rima, corrige em conjunto
    if (config.preserveRhymes && rhymeInfo.groupId && rhymeInfo.groupLines.length > 1) {
      const groupCorrected = await this.correctRhymeGroupIntelligently(
        musicalAnalysis.allLines,
        rhymeInfo.groupLines,
        enforcement,
        genre,
        lineIndex
      )
      
      if (groupCorrected) {
        const ourCorrectedLine = groupCorrected[lineIndex]
        if (ourCorrectedLine && countPoeticSyllables(ourCorrectedLine) <= enforcement.max) {
          console.log(`[IntelligentEnforcer] ✓ Correção em grupo preservou estrutura`)
          return ourCorrectedLine
        }
      }
    }

    // ✅ ESTRATÉGIA 3: Reescreve linha mantendo tema E rima
    const theme = this.extractLineTheme(line)
    const context = this.getLineContext(musicalAnalysis.allLines, lineIndex)
    
    const rewritten = await this.rewriteLinePreservingRhyme(
      line,
      theme,
      context,
      enforcement.max,
      genre,
      rhymeInfo.rhymeSound
    )

    if (rewritten && countPoeticSyllables(rewritten) <= enforcement.max) {
      console.log(`[IntelligentEnforcer] ✓ Reescreveu mantendo rima "${rhymeInfo.rhymeSound}"`)
      return rewritten
    }

    // ✅ ESTRATÉGIA 4: Fallback inteligente (NUNCA corta palavra final)
    console.log(`[IntelligentEnforcer] ⚠️ Aplicando fallback inteligente`)
    return this.intelligentFallback(line, enforcement.max, rhymeInfo.rhymeSound)
  }

  /**
   * CORREÇÕES SEGURAS PARA RIMAS
   */
  private static applyRhymeSafeCorrections(
    line: string, 
    maxSyllables: number, 
    rhymeSound: string
  ): string {
    const words = line.split(' ')
    if (words.length <= 3) return line

    let corrected = line

    // ✅ APENAS técnicas que NÃO afetam a rima:
    
    // 1. Contrações no INÍCIO/MEIO (nunca no final)
    corrected = corrected
      .replace(/\bvocê\b/gi, 'cê')
      .replace(/\bestá\b/gi, 'tá') 
      .replace(/\bpara\b/gi, 'pra')
      .replace(/\bestou\b/gi, 'tô')
      .replace(/\bcomigo\b/gi, 'comigo')

    // 2. Remove palavras do MEIO (nunca as 2 últimas)
    const currentSyllables = countPoeticSyllables(corrected)
    if (currentSyllables > maxSyllables && words.length > 4) {
      // Mantém: primeira parte + últimas 2 palavras (onde está a rima)
      const keepWords = Math.max(2, words.length - 2)
      const safeReduction = [
        ...words.slice(0, keepWords),
        ...words.slice(-2) // ⚠️ SEMPRE mantém as 2 últimas
      ].join(' ')
      
      if (countPoeticSyllables(safeReduction) <= maxSyllables) {
        return safeReduction
      }
    }

    // 3. Substituições seguras (não afetam final)
    const safeSubstitutions = [
      { from: /\bconstantemente\b/gi, to: 'sempre' },
      { from: /\bcompletamente\b/gi, to: 'todo' },
      { from: /\brealmente\b/gi, to: 'de fato' },
      { from: /\bprovocante\b/gi, to: 'sedutor' },
      { from: /\bdesaparece\b/gi, to: 'some' },
    ]

    safeSubstitutions.forEach(({ from, to }) => {
      corrected = corrected.replace(from, to)
    })

    return corrected
  }

  /**
   * CORREÇÃO INTELIGENTE DE GRUPO DE RIMA
   */
  private static async correctRhymeGroupIntelligently(
    allLines: string[],
    groupLines: number[],
    enforcement: SyllableEnforcement,
    genre: string,
    currentIndex: number
  ): Promise<{ [key: number]: string } | null> {
    
    const groupTexts = groupLines.map(idx => allLines[idx])
    const rhymeSound = this.extractRhymeSound(allLines[groupLines[0]])

    console.log(`[IntelligentEnforcer] Corrigindo grupo de ${groupLines.length} linhas com rima "${rhymeSound}"`)

    const prompt = `CORREÇÃO DE GRUPO DE RIMA - PRESERVE ESTRUTURA MUSICAL

GRUPO DE LINHAS (TODAS RIMAM COM "${rhymeSound}"):
${groupTexts.map((line, i) => `${i+1}. "${line}" (${countPoeticSyllables(line)} sílabas)`).join('\n')}

REESCREVA ESTAS LINHAS para:
• MÁXIMO ${enforcement.max} sílabas cada
• MANTER a rima "${rhymeSound}" no final
• Preservar significado e coerência
• Usar linguagem natural do ${genre}

TÉCNICAS PERMITIDAS:
- Contrações: "cê", "tá", "pra", "tô"
- Simplificar palavras do MEIO (nunca do final)
- Manter estrutura sujeito-verbo-complemento

EXEMPLO:

Originais:
1. "Meu coração acelera quando você se aproxima" (13s)
2. "Eu fico completamente sem reação e vulnerável" (14s)

Corrigidas (rima "xima/vél"):
1. "Coração dispara quando cê chega perto" (9s)
2. "Fico sem reação, me sinto vulnerável" (10s)

SUA TAREFA:
Reescreva estas ${groupLines.length} linhas mantendo a rima "${rhymeSound}":

${groupTexts.map(line => `- "${line}"`).join('\n')}

→ (RETORNE APENAS AS LINHAS CORRIGIDAS, UMA POR LINHA)`

    try {
      const { text } = await generateText({
        model: "openai/gpt-4o",
        prompt,
        temperature: 0.4,
        maxTokens: 500
      })

      const correctedLines = text.split('\n')
        .filter(l => l.trim())
        .map(l => l.replace(/^[-•\d\.\s"]+|[-•\d\.\s"]+$/g, '').trim())

      if (correctedLines.length === groupLines.length) {
        const result: { [key: number]: string } = {}
        groupLines.forEach((originalIndex, i) => {
          result[originalIndex] = correctedLines[i]
        })
        return result
      }

    } catch (error) {
      console.error('[IntelligentEnforcer] Erro na correção de grupo:', error)
    }

    return null
  }

  /**
   * REESCRITA PRESERVANDO RIMA
   */
  private static async rewriteLinePreservingRhyme(
    line: string,
    theme: string,
    context: string[],
    maxSyllables: number,
    genre: string,
    targetRhyme: string
  ): Promise<string> {

    const prompt = `REESCRITA MUSICAL - MANTENHA RIMA E SIGNIFICADO

TEMA: ${theme}
RIMA A PRESERVAR: "${targetRhyme}"
LINHA ORIGINAL: "${line}"
CONTEXTO: ${context.slice(0, 3).join(' | ')}

REESCREVA esta linha com:
• MÁXIMO ${maxSyllables} sílabas
• MESMA RIMA "${targetRhyme}" no final  
• MESMO significado/sentimento
• Linguagem natural do ${genre}

EXEMPLOS:

"Meu coração dispara quando você chega perto" (13s) → rima "perto"
→ "Coração acelera quando cê vem perto" (9s) ✅

"Eu estou completamente perdido no seu olhar" (12s) → rima "olhar"
→ "Tô perdido no teu olhar" (6s) ✅

"Neste momento mágico tudo faz sentido" (12s) → rima "sentido"  
→ "Nesse instante, tudo tem sentido" (8s) ✅

SUA TAREFA:
Reescreva: "${line}"
Rima: "${targetRhyme}"
Máximo: ${maxSyllables} sílabas

→ (APENAS A LINHA CORRIGIDA)`

    try {
      const { text } = await generateText({
        model: "openai/gpt-4o",
        prompt,
        temperature: 0.5,
        maxTokens: 100
      })

      return text.trim().replace(/^["']|["']$/g, "")

    } catch (error) {
      console.error('[IntelligentEnforcer] Erro no rewrite:', error)
      return line
    }
  }

  /**
   * FALLBACK INTELIGENTE - NUNCA corta palavra final
   */
  private static intelligentFallback(line: string, maxSyllables: number, rhymeSound: string): string {
    const words = line.split(' ')
    
    // Estratégia: Remove do início/meio, MANTÉM final
    for (let i = 1; i < words.length - 2; i++) {
      const candidate = words.slice(i).join(' ')
      if (countPoeticSyllables(candidate) <= maxSyllables) {
        return candidate
      }
    }

    // Último recurso: Mantém apenas sujeito + rima
    if (words.length >= 2) {
      const minimal = [words[0], rhymeSound].join(' ')
      return countPoeticSyllables(minimal) <= maxSyllables ? minimal : rhymeSound
    }

    return rhymeSound
  }

  /**
   * ANÁLISE MUSICAL AVANÇADA
   */
  private static analyzeMusicalStructure(lyrics: string): any {
    const lines = lyrics.split('\n')
    const analysis = {
      allLines: lines,
      sections: [] as Array<{type: string, start: number, end: number}>,
      rhymeGroups: new Map<string, number[]>(),
      rhymePattern: [] as string[]
    }

    let currentSection = { type: 'intro', start: 0 }
    const rhymeMap = new Map<string, string>() // lineIndex -> rhymeSound

    // Analisa seções
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      if (line.match(/\[(VERSE|CHORUS|BRIDGE|PRE-CHORUS|INTRO|OUTRO)/i)) {
        if (currentSection.start !== i) {
          currentSection.end = i - 1
          analysis.sections.push(currentSection)
        }
        currentSection = { 
          type: line.match(/\[(.*?)\]/)?.[1] || 'unknown', 
          start: i 
        }
      }

      // Analisa rimas
      if (!this.shouldSkipLine(line)) {
        const rhymeSound = this.extractRhymeSound(line)
        rhymeMap.set(i.toString(), rhymeSound)
        
        if (!analysis.rhymeGroups.has(rhymeSound)) {
          analysis.rhymeGroups.set(rhymeSound, [])
        }
        analysis.rhymeGroups.get(rhymeSound)!.push(i)
      }
    }

    return analysis
  }

  /**
   * INFORMAÇÕES DE RIMA PARA UMA LINHA
   */
  private static getRhymeInfo(line: string, analysis: any, lineIndex: number): any {
    const rhymeSound = this.extractRhymeSound(line)
    const groupLines = analysis.rhymeGroups.get(rhymeSound) || []
    
    return {
      rhymeSound,
      groupId: groupLines.length > 0 ? `rhyme_${rhymeSound}` : null,
      groupLines,
      groupSize: groupLines.length
    }
  }

  /**
   * EXTRAI SOM DA RIMA (versão melhorada)
   */
  private static extractRhymeSound(line: string): string {
    const words = line.trim().split(/\s+/)
    if (words.length === 0) return 'no_rhyme'
    
    const lastWord = words[words.length - 1]
      .toLowerCase()
      .replace(/[.,!?;:]$/g, '')
      .replace(/["']/g, '')

    // Foca nas últimas 2-3 letras para detectar rima
    return lastWord.slice(-3) || lastWord
  }

  /**
   * CONTEXTO DA LINHA
   */
  private static getLineContext(allLines: string[], currentIndex: number): string[] {
    const start = Math.max(0, currentIndex - 2)
    const end = Math.min(allLines.length, currentIndex + 3)
    return allLines.slice(start, end)
  }

  /**
   * EXTRAI TEMA DA LINHA
   */
  private static extractLineTheme(line: string): string {
    const themes = {
      amor: ['amor', 'paixão', 'coração', 'sentimento'],
      desejo: ['desejo', 'paixão', 'corpo', 'beijo', 'toque'],
      perda: ['saudade', 'perda', 'partir', 'adeus', 'solidão'],
      superacao: ['força', 'vencer', 'lutar', 'crescer', 'aprender']
    }

    const lineLower = line.toLowerCase()
    for (const [theme, keywords] of Object.entries(themes)) {
      if (keywords.some(keyword => lineLower.includes(keyword))) {
        return theme
      }
    }

    return 'sentimento'
  }

  /**
   * VALIDAÇÃO (compatível com MetaComposer)
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
