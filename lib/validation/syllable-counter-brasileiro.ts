// lib/validation/syllable-counter-brasileiro.ts

/**
 * PoeticSyllableEngine — Motor definitivo de sílabas poéticas para música brasileira.
 *
 * Projetado para sertanejo moderno, MPB, funk, pagode e outros gêneros brasileiros.
 * Usa regras fonéticas reais da fala cantada em PT-BR.
 */

const MUSICAL_SYLLABLES: Record<string, number> = {
  // Monossílabos tônicos
  tá: 1, // está
  dá: 1, // ele dá
  pô: 1, // pôr
  vê: 1, // ver
  pé: 1,
  pá: 1,
  dó: 1,
  sou: 1,
  vou: 1,
  sei: 1,
  dei: 1,
  rei: 1,
  lei: 1,
  céu: 1,
  pão: 1,
  mãe: 1,
  cão: 1,
  põe: 1,
  vêm: 1,
  têm: 1,
  lêem: 1,
  dão: 1,

  // Contrações naturais
  pra: 1, // para
  pro: 1, // para o
  pras: 1, // para as
  pros: 1, // para os
  cê: 1, // você
  tô: 1, // estou
  tamo: 1, // estamos
  tão: 1, // estão
  da: 1, // de + a
  do: 1, // de + o
  das: 1,
  dos: 1,
  na: 1, // em + a
  no: 1, // em + o
  nas: 1,
  nos: 1,

  // Palavras com sinérese forçada
  ninguém: 2,
  alguém: 2,
  também: 2,
  porém: 2,
  parabéns: 3,
  saudade: 3,
  cidade: 3,
  verdade: 3,
  liberdade: 4,
  tempestade: 4,
  coração: 3,
  emoção: 3,
  canção: 2,
  nação: 2,
  razão: 2,
  perdão: 2,
  ilusão: 3,
  paixão: 2,
  esvaiu: 2,
  caiu: 2,
  partiu: 2,
  sumiu: 2,
  fugiu: 2,
  ajoelhou: 3,
  conquistou: 3,
  acordou: 3,
  reclamou: 3,
  agradecendo: 5,
}

function applyLexicalContractions(text: string): string {
  return text
    .replace(/\bpara\b/g, "pra")
    .replace(/\bvocê\b/g, "cê")
    .replace(/\bestá\b/g, "tá")
    .replace(/\bestou\b/g, "tô")
    .replace(/\bestamos\b/g, "tamo")
    .replace(/\bestão\b/g, "tão")
    .replace(/\bde\s+a\b/g, "da")
    .replace(/\bde\s+o\b/g, "do")
    .replace(/\bem\s+a\b/g, "na")
    .replace(/\bem\s+o\b/g, "no")
    .replace(/\s+/g, " ")
    .trim()
}

function countWordSyllables(word: string): number {
  const key = word.replace(/'/g, "").toLowerCase()
  if (MUSICAL_SYLLABLES[key] !== undefined) {
    return MUSICAL_SYLLABLES[key]
  }

  if (!/[aeiou]/.test(key)) return 1

  let s = key

  // Tritongos
  const tritongos = ["uai", "uei", "uoi"]
  for (const t of tritongos) {
    s = s.replace(new RegExp(t, "g"), "X")
  }

  // Ditongos
  const ditongos = [
    "ai",
    "ei",
    "oi",
    "au",
    "eu",
    "ou",
    "ui",
    "ia",
    "ie",
    "io",
    "ua",
    "ue",
    "uo",
    "iu",
    "ao",
    "ãe",
    "ão",
    "õe",
    "ãi",
    "ẽi",
    "õi",
  ]
  for (const d of ditongos) {
    s = s.replace(new RegExp(d, "g"), "X")
  }

  const vowels = (s.match(/[aeiou]/g) || []).length
  const x = (s.match(/X/g) || []).length
  let count = vowels + x

  if (/(ou|iu)$/i.test(key)) {
    count = Math.min(count, 3)
  }

  return Math.max(1, count)
}

function applyInterwordElision(originalLine: string, baseCount: number): number {
  const line = originalLine.toLowerCase()
  const patterns = [
    /tá\s+aqui/,
    /dá\s+amor/,
    /meu\s+amor/,
    /seu\s+amor/,
    /não\s+é/,
    /vou\s+embora/,
    /de\s+água/,
    /pra\s+quê/,
    /se\s+esvaiu$/,
    /foi\s+embora$/,
    /tô\s+só/,
    /cê\s+já/,
    /olha\s+pro/,
  ]

  let reduction = 0
  for (const pattern of patterns) {
    if (pattern.test(line)) {
      reduction += 1
    }
  }

  return Math.max(1, baseCount - reduction)
}

export function countPoeticSyllables(line: string): number {
  if (!line?.trim()) return 0

  const cleanLine = line.replace(/$$[^)]*$$/g, "").trim()

  if (!cleanLine) return 0

  let clean = cleanLine
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  if (!clean) return 0

  clean = applyLexicalContractions(clean)
  const words = clean.split(/\s+/).filter(Boolean)
  if (words.length === 0) return 0

  let total = 0
  for (const word of words) {
    total += countWordSyllables(word)
  }

  total = applyInterwordElision(line, total)
  return Math.max(1, total)
}

export const countPortugueseSyllables = countPoeticSyllables

export interface SyllableValidationResult {
  valid: boolean
  violations: Array<{ lineNumber: number; line: string; syllables: number }>
}

export function validateLyricsSyllables(
  lyrics: string,
  minIdeal = 8,
  maxIdeal = 10,
  absoluteMax = 12,
): SyllableValidationResult {
  const lines = lyrics
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("[") && !/^$$[^)]*$$$/.test(l))

  const violations = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const syllables = countPoeticSyllables(line)

    if (syllables > absoluteMax) {
      violations.push({
        lineNumber: i + 1,
        line,
        syllables,
      })
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  }
}
