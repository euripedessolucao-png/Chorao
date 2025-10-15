// lib/validation/syllable-validator.ts
export interface SyllableValidationResult {
  isValid: boolean
  violations: Array<{
    line: string
    lineNumber: number
    syllableCount: number
    maxAllowed: number
    suggestion: string
  }>
  stats: {
    totalLines: number
    validLines: number
    violationPercentage: number
    averageSyllables: number
  }
}

// ✅ CONTADOR DE SÍLABAS MELHORADO
export function countPortugueseSyllables(word: string): number {
  if (!word.trim()) return 0

  const cleanWord = word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-zà-úâ-ûã-õä-üç]/g, "") // Mantém apenas letras

  if (cleanWord.length === 0) return 0

  let syllableCount = 0
  let i = 0
  const vowels = "aeiouáéíóúâêîôûàèìòùãõäü"

  while (i < cleanWord.length) {
    const currentChar = cleanWord[i]

    if (vowels.includes(currentChar)) {
      syllableCount++

      // Verifica ditongos e tritongos
      if (i + 1 < cleanWord.length) {
        const nextChar = cleanWord[i + 1]
        
        // Ditongos crescentes (semivogal + vogal)
        if ("iu".includes(currentChar) && "aeou".includes(nextChar)) {
          i++ // Pula próxima vogal (já contou como 1 sílaba)
        }
        // Ditongos decrescentes (vogal + semivogal)
        else if ("aeou".includes(currentChar) && "iu".includes(nextChar)) {
          i++ // Pula semivogal
        }
      }
    }
    i++
  }

  return Math.max(1, syllableCount) // Mínimo 1 sílaba
}

// ✅ VALIDADOR PRINCIPAL
export function validateLyricsSyllables(lyrics: string, maxSyllables: number = 12): SyllableValidationResult {
  const lines = lyrics.split('\n')
    .map(line => line.trim())
    .filter(line => {
      // ✅ FILTRO MELHORADO - ignora instruções, seções, metadados
      const isSection = /^\[.*\]$/.test(line)
      const isInstruction = /^\(.*\)$/.test(line)
      const isMetadata = 
        line.includes('Instrumentos:') || 
        line.includes('BPM:') || 
        line.includes('Estilo:') ||
        line.startsWith('Título:') ||
        line.includes('| Style:') ||
        line.includes('Instruments:')
      
      return line && 
             !isSection && 
             !isInstruction && 
             !isMetadata &&
             line.length > 2 // Ignora linhas muito curtas
    })

  const violations = []
  let totalSyllables = 0

  lines.forEach((line, index) => {
    const syllableCount = countPortugueseSyllables(line)
    totalSyllables += syllableCount
    
    if (syllableCount > maxSyllables) {
      const suggestion = generateSyllableSuggestion(line, maxSyllables)
      
      violations.push({
        line,
        lineNumber: index + 1,
        syllableCount,
        maxAllowed: maxSyllables,
        suggestion
      })
    }
  })

  const validLines = lines.length - violations.length
  const averageSyllables = lines.length > 0 ? totalSyllables / lines.length : 0

  return {
    isValid: violations.length === 0,
    violations,
    stats: {
      totalLines: lines.length,
      validLines,
      violationPercentage: lines.length > 0 ? (violations.length / lines.length) * 100 : 0,
      averageSyllables
    }
  }
}

// ✅ GERADOR DE SUGESTÕES INTELIGENTE
function generateSyllableSuggestion(line: string, maxSyllables: number): string {
  const words = line.split(' ').filter(w => w.trim())
  const currentCount = countPortugueseSyllables(line)
  
  if (words.length <= 1) {
    return 'Use uma palavra mais curta ou divida a ideia'
  }

  // Tenta contrações automáticas
  let suggestion = line
    .replace(/\bvocê\b/gi, 'cê')
    .replace(/\bestá\b/gi, 'tá')
    .replace(/\bpara\b/gi, 'pra')
    .replace(/\bcomigo\b/gi, 'comigo')
    .replace(/\bcontigo\b/gi, 'contigo')
    .replace(/\bneste\b/gi, 'neste')
    .replace(/\bnesse\b/gi, 'nesse')
    .replace(/\bnaquele\b/gi, 'naquele')

  const newCount = countPortugueseSyllables(suggestion)
  
  if (newCount <= maxSyllables) {
    return `Use: "${suggestion}"`
  }

  // Remove palavras desnecessárias
  const unnecessary = ['realmente', 'verdadeiramente', 'completamente', 'absolutamente', 'definitivamente']
  unnecessary.forEach(word => {
    suggestion = suggestion.replace(new RegExp(`\\b${word}\\b`, 'gi'), '')
  })

  // Tenta dividir em duas linhas
  if (words.length > 3) {
    const mid = Math.floor(words.length / 2)
    const part1 = words.slice(0, mid).join(' ')
    const part2 = words.slice(mid).join(' ')
    
    const count1 = countPortugueseSyllables(part1)
    const count2 = countPortugueseSyllables(part2)
    
    if (count1 <= maxSyllables && count2 <= maxSyllables) {
      return `Divida em: "${part1}" / "${part2}"`
    }
  }

  return `Reescreva com frases mais curtas. Ex: "${words.slice(0, 3).join(' ')}..."`
}

// ✅ VALIDADOR EM TEMPO REAL
export class RealTimeSyllableValidator {
  private maxSyllables: number
  
  constructor(maxSyllables: number = 12) {
    this.maxSyllables = maxSyllables
  }

  validateLine(line: string): { 
    isValid: boolean; 
    count: number; 
    suggestion?: string;
    isVerse: boolean;
  } {
    const cleanLine = line.trim()
    
    // Determina se é um verso (não instrução/seção)
    const isVerse = !(
      cleanLine.startsWith('[') || 
      cleanLine.startsWith('(') ||
      cleanLine.includes('Instrumentos:') || 
      cleanLine.includes('BPM:') ||
      cleanLine.includes('Estilo:') ||
      cleanLine.startsWith('Título:')
    )

    if (!isVerse) {
      return { isValid: true, count: 0, isVerse: false }
    }

    const count = countPortugueseSyllables(cleanLine)
    const isValid = count <= this.maxSyllables
    
    if (!isValid) {
      const suggestion = generateSyllableSuggestion(cleanLine, this.maxSyllables)
      return { isValid, count, suggestion, isVerse: true }
    }

    return { isValid, count, isVerse: true }
  }

  getLineStatus(count: number): { color: string; label: string } {
    if (count === 0) return { color: 'text-gray-400', label: 'Instrução' }
    if (count <= 8) return { color: 'text-green-600', label: 'Ótimo' }
    if (count <= 10) return { color: 'text-yellow-600', label: 'Bom' }
    if (count <= 12) return { color: 'text-orange-600', label: 'Limite' }
    return { color: 'text-red-600', label: 'Muito longo' }
  }
}
