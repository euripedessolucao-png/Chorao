/**
 * SISTEMA DE EMPILHAMENTO INTELIGENTE DE VERSOS
 * Transforma letras em formato humano profissional
 */

export interface StackingResult {
  stackedLyrics: string
  stackingScore: number
  improvements: string[]
}

export class LineStacker {
  /**
   * Transforma letra em formato empilhado profissional
   */
  static stackLines(lyrics: string): StackingResult {
    const lines = lyrics.split('\n')
    const stackedLines: string[] = []
    const improvements: string[] = []
    let currentSection: string[] = []
    
    lines.forEach((line, index) => {
      const trimmed = line.trim()
      
      // Mantém marcadores de seção
      if (trimmed.startsWith('[') || trimmed.startsWith('(') || !trimmed) {
        // Processa seção acumulada antes do marcador
        if (currentSection.length > 0) {
          const stackedSection = this.stackSection(currentSection, improvements)
          stackedLines.push(...stackedSection)
          currentSection = []
        }
        stackedLines.push(line)
        return
      }
      
      // Acumula linhas de letra para empilhar
      currentSection.push(line)
    })
    
    // Processa última seção
    if (currentSection.length > 0) {
      const stackedSection = this.stackSection(currentSection, improvements)
      stackedLines.push(...stackedSection)
    }
    
    const stackingScore = this.calculateStackingScore(stackedLines)
    
    return {
      stackedLyrics: stackedLines.join('\n'),
      stackingScore,
      improvements
    }
  }
  
  /**
   * Empilha uma seção de versos de forma inteligente
   */
  private static stackSection(lines: string[], improvements: string[]): string[] {
    if (lines.length <= 1) return lines
    
    const stacked: string[] = []
    let i = 0
    
    while (i < lines.length) {
      const currentLine = lines[i]
      const nextLine = lines[i + 1]
      
      // Verifica se as linhas se complementam
      if (nextLine && this.linesShouldStack(currentLine, nextLine)) {
        // Empilha linhas complementares
        stacked.push(currentLine)
        stacked.push(nextLine)
        improvements.push(`✓ Empilhadas: "${currentLine}" + "${nextLine}"`)
        i += 2
      } else {
        // Mantém linha solta se não complementa
        stacked.push(currentLine)
        i += 1
      }
    }
    
    return stacked
  }
  
  /**
   * Decide se duas linhas devem ser empilhadas
   */
  private static linesShouldStack(line1: string, line2: string): boolean {
    const l1 = line1.toLowerCase()
    const l2 = line2.toLowerCase()
    
    // REGRAS DE EMPILHAMENTO:
    
    // 1. Diálogo e resposta
    if ((l1.includes('?') && !l2.includes('?')) || 
        (l2.includes('?') && !l1.includes('?'))) {
      return true
    }
    
    // 2. Continuação lógica da frase
    const connectors = ['e', 'mas', 'porém', 'então', 'quando', 'onde', 'que', 'pra']
    if (connectors.some(connector => l2.startsWith(connector))) {
      return true
    }
    
    // 3. Mesmo sujeito/contexto
    const subjectOverlap = this.calculateSubjectOverlap(l1, l2)
    if (subjectOverlap > 0.3) {
      return true
    }
    
    // 4. Padrão rítmico similar
    const syllableDiff = Math.abs(
      this.countSyllables(l1) - this.countSyllables(l2)
    )
    if (syllableDiff <= 2) {
      return true
    }
    
    // 5. Citações consecutivas
    if ((l1.includes('"') || l1.includes("'")) && (l2.includes('"') || l2.includes("'"))) {
      return true
    }
    
    return false
  }
  
  private static calculateSubjectOverlap(line1: string, line2: string): number {
    const words1 = new Set(line1.split(/\s+/).filter(w => w.length > 2))
    const words2 = new Set(line2.split(/\s+/).filter(w => w.length > 2))
    
    if (words1.size === 0 || words2.size === 0) return 0
    
    const intersection = [...words1].filter(word => words2.has(word)).length
    const union = new Set([...words1, ...words2]).size
    
    return union > 0 ? intersection / union : 0
  }
  
  private static countSyllables(text: string): number {
    // Simplificado - conta palavras como proxy de sílabas
    return text.split(/\s+/).length
  }
  
  private static calculateStackingScore(lines: string[]): number {
    const totalLines = lines.filter(l => l.trim() && !l.startsWith('[') && !l.startsWith('(')).length
    if (totalLines === 0) return 0
    
    let stackedPairs = 0
    
    for (let i = 0; i < lines.length - 1; i++) {
      const current = lines[i]
      const next = lines[i + 1]
      
      if (current.trim() && !current.startsWith('[') && !current.startsWith('(') &&
          next.trim() && !next.startsWith('[') && !next.startsWith('(')) {
        stackedPairs++
      }
    }
    
    return Math.min(1, stackedPairs / totalLines)
  }
}
