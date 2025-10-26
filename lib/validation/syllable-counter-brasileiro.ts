// lib/validation/syllable-counter-brasileiro.ts

export function countPoeticSyllables(line: string): number {
  if (!line?.trim()) return 0
  // Implementação mínima (substitua pela versão completa depois)
  const words = line.trim().split(/\s+/)
  return Math.min(12, words.length * 2) // placeholder seguro
}

// Exportações para compatibilidade
export const countPortugueseSyllables = countPoeticSyllables
