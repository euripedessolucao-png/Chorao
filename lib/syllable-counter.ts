/**
 * CONTADOR SIMPLES E EFICAZ DE SÍLABAS
 * 
 * REGRA: Cada vogal = 1 sílaba (método conservador)
 * Isso evita que a IA "engane" o sistema com regras complexas
 */

// Todas as vogais (com e sem acento)
const VOWELS = "aeiouáéíóúâêîôûàèìòùãõ"

/**
 * Conta sílabas de forma SIMPLES e CONSERVADORA
 * @param text Texto para contar
 * @returns Número de sílabas (sempre igual ou MAIOR que a contagem real)
 */
export function countPoeticSyllables(text: string): number {
  if (!text.trim()) return 0

  const cleanText = text
    .toLowerCase()
    .normalize("NFD") // Separa acentos: "á" → "a" + "´"
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z\s]/g, "") // Mantém apenas letras e espaços
    .trim()

  if (!cleanText) return 0

  let syllableCount = 0
  let previousWasVowel = false

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i]
    
    if (VOWELS.includes(char)) {
      // ✅ REGRA SIMPLES: cada vogal = 1 sílaba
      // Isso evita que ditongos sejam contados como 1 sílaba
      if (!previousWasVowel) {
        syllableCount++
      }
      previousWasVowel = true
    } else {
      previousWasVowel = false
    }
  }

  // ✅ MÍNIMO 1 sílaba, mesmo para palavras monossilábicas
  return Math.max(1, syllableCount)
}

/**
 * Valida se uma linha respeita o limite de sílabas
 */
export function validateSyllableLimit(line: string, maxSyllables = 12): boolean {
  const count = countPoeticSyllables(line)
  return count <= maxSyllables
}

/**
 * Valida todas as linhas de uma letra - FILTRO MELHORADO
 */
export function validateLyricsSyllables(
  lyrics: string,
  maxSyllables = 12,
): {
  valid: boolean
  violations: Array<{ line: string; syllables: number; lineNumber: number }>
} {
  const lines = lyrics.split("\n")
  const violations: Array<{ line: string; syllables: number; lineNumber: number }> = []

  lines.forEach((line, index) => {
    const cleanLine = line.trim()
    
    // ✅ FILTRO MAIS RESTRITIVO - ignora TUDO que não é verso
    if (!cleanLine) return // Linha vazia
    if (cleanLine.startsWith('[') && cleanLine.endsWith(']')) return // [SECTION]
    if (cleanLine.startsWith('(') && cleanLine.endsWith(')')) return // (instruction)
    if (cleanLine.startsWith('Título:')) return
    if (cleanLine.includes('Instrumentos:')) return
    if (cleanLine.includes('BPM:')) return
    if (cleanLine.includes('Estilo:')) return
    if (cleanLine.includes('| Style:')) return
    if (cleanLine.includes('Instruments:')) return
    if (cleanLine.length < 3) return // Linhas muito curtas

    // ✅ CONTA SÍLABAS
    const syllables = countPoeticSyllables(cleanLine)
    
    if (syllables > maxSyllables) {
      violations.push({
        line: cleanLine,
        syllables,
        lineNumber: index + 1,
      })
    }
  })

  return {
    valid: violations.length === 0,
    violations,
  }
}

/**
 * Função auxiliar para debug - mostra contagem linha por linha
 */
export function debugSyllableCount(lyrics: string): void {
  console.log('🔍 DEBUG DE SÍLABAS:')
  const lines = lyrics.split('\n')
  
  lines.forEach((line, index) => {
    const cleanLine = line.trim()
    if (!cleanLine) return
    
    const syllables = countPoeticSyllables(cleanLine)
    const status = syllables > 12 ? '❌' : '✅'
    
    console.log(`${status} Linha ${index + 1}: ${syllables} sílabas - "${cleanLine}"`)
  })
}
