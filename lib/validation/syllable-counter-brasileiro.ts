// lib/validation/syllable-counter-brasileiro.ts

/**
 * Contador de sílabas poéticas para música brasileira.
 * Baseado em fonética real, não em poesia clássica.
 * Conta todas as sílabas pronunciadas (incluindo átonas finais).
 */

// Contrações e palavras irregulares comuns em letras musicais
const SPECIAL_WORDS: Record<string, number> = {
  // Contrações informais
  pra: 1,
  pro: 1,
  pras: 1,
  pros: 1,
  tá: 1,
  tô: 1,
  vô: 1,
  pô: 1,
  dá: 1,
  pé: 1,
  pá: 1,
  mãe: 1,
  põe: 1,
  vêm: 1,
  têm: 1,
  vai: 1,
  sou: 1,
  dói: 1,
  fui: 1,
  viu: 1,
  diz: 1,
  faz: 1,
  luz: 1,
  voz: 1,
  ninguém: 2,
  alguém: 2,
  ninguem: 2,
  alguem: 2,
  você: 2,
  café: 2,
  sofá: 2,
  paletó: 3,
  jiló: 2,
  cipó: 2,
  vatapá: 3,
  acarajé: 4,
  tem: 1,
  bem: 1,
  sem: 1,
  quem: 1,
  meu: 1,
  teu: 1,
  seu: 1,
  deus: 1,
  céu: 1,
  véu: 1,
  chapéu: 2,
}

// Ditongos (1 sílaba cada)
const DITONGOS = [
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
  "ão",
  "õe",
  "ãi",
  "ẽi",
  "õi",
  "ãe",
  "ée",
]

// Tritongos (1 sílaba cada)
const TRITONGOS = ["uai", "uei", "uoi", "uou", "uéi"]

function countSyllablesInWord(word: string): number {
  if (!word) return 0

  // Normaliza: remove apóstrofos (pra → pra, d'água → dagua)
  const w = word.toLowerCase().replace(/'/g, "")

  // Palavras especiais (prioritário)
  if (SPECIAL_WORDS.hasOwnProperty(w)) {
    return SPECIAL_WORDS[w]
  }

  // Remove consoantes no início/fim que não formam sílaba sozinhas
  // (não necessário para contagem por núcleo vocálico)

  // Substitui tritongos e ditongos por marcador único 'X'
  let processed = w
  for (const t of TRITONGOS) {
    processed = processed.replace(new RegExp(t, "g"), "X")
  }
  for (const d of DITONGOS) {
    processed = processed.replace(new RegExp(d, "g"), "X")
  }

  // Conta núcleos vocálicos restantes (vogais isoladas = 1 sílaba cada)
  const vowelMatches = processed.match(/[aeiouãõ]/g)
  const vowelCount = vowelMatches ? vowelMatches.length : 0
  const xCount = (processed.match(/X/g) || []).length

  let syllables = vowelCount + xCount

  // Garante pelo menos 1 sílaba
  syllables = Math.max(1, syllables)

  // Ajuste: palavras terminadas em "-am", "-em" (ex: cantam, tem) → 1 sílaba final
  // Já coberto por SPECIAL_WORDS, mas caso escape:
  if (/^[bcdfghjklmnpqrstvwxz]*[aeiouãõ]*[aeiouãõ][mn]$/i.test(w)) {
    // Ex: "cantam" → can-tam (2), não 3
    // Nossa lógica já trata bem, então não ajustamos aqui
  }

  return syllables
}

/**
 * Identifica a última sílaba tônica em uma palavra
 * Regras de acentuação do português:
 * - Oxítonas: última sílaba (café, amor, você)
 * - Paroxítonas: penúltima sílaba (casa, mesa, verso) [maioria]
 * - Proparoxítonas: antepenúltima (música, pássaro)
 */
function findLastTonicPosition(word: string): number {
  const w = word.toLowerCase()
  const syllables = splitIntoSyllables(w)

  // Se tem acento explícito, encontra a posição
  const accentPattern = /[áàâãéèêíìîóòôõúùû]/
  for (let i = syllables.length - 1; i >= 0; i--) {
    if (accentPattern.test(syllables[i])) {
      return i
    }
  }

  // Regras sem acento:
  // Oxítona se termina em: a(s), e(s), o(s), em, ens
  if (/[aeo]s?$|ens?$/.test(w)) {
    return syllables.length - 1
  }

  // Proparoxítona: raro sem acento, mas algumas palavras
  // Por padrão: paroxítona (penúltima sílaba)
  return Math.max(0, syllables.length - 2)
}

function splitIntoSyllables(word: string): string[] {
  // Implementação simplificada de separação silábica
  const w = word.toLowerCase()
  const syllables: string[] = []
  let current = ""

  for (let i = 0; i < w.length; i++) {
    const char = w[i]
    current += char

    // Se é vogal e a próxima é consoante, fecha sílaba
    if (/[aeiouáàâãéèêíìîóòôõúùû]/.test(char)) {
      const next = w[i + 1]
      if (!next || /[bcçdfghjklmnpqrstvwxyz]/.test(next)) {
        syllables.push(current)
        current = ""
      }
    }
  }

  if (current) syllables.push(current)
  return syllables
}

/**
 * Aplica SINALEFA/ELISÃO entre palavras
 * Quando duas vogais se encontram entre palavras, elas se fundem
 * Ex: "de amor" → "d'amor" (3 sílabas → 2 sílabas)
 */
function applySinalefa(words: string[]): number {
  let totalSyllables = 0

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const syllableCount = countSyllablesInWord(word)
    const tonicPosition = findLastTonicPosition(word)

    // Conta até a última tônica (+1 porque índice começa em 0)
    const poeticCount = tonicPosition + 1

    totalSyllables += poeticCount

    // Aplica sinalefa com a próxima palavra se houver
    if (i < words.length - 1) {
      const currentEndsWithVowel = /[aeiouáàâãéèêíìîóòôõúùû]$/i.test(word)
      const nextStartsWithVowel = /^[aeiouáàâãéèêíìîóòôõúùû]/i.test(words[i + 1])

      // Se vogal + vogal, reduz 1 sílaba (fusão)
      if (currentEndsWithVowel && nextStartsWithVowel) {
        totalSyllables -= 1
      }
    }
  }

  return Math.max(1, totalSyllables)
}

export function countPoeticSyllables(line: string): number {
  if (!line || line.trim().length === 0) return 0

  const withoutParentheses = line.replace(/$$[^)]*$$/g, "").trim()
  if (!withoutParentheses) return 0

  // Remove pontuação mas mantém palavras
  // IMPORTANTE: vírgula NÃO afeta contagem, é apenas respiro!
  const clean = withoutParentheses
    .replace(/[,!?.;:—–-]/g, " ") // Remove pontuação
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()

  if (!clean) return 0

  const words = clean.split(" ").filter((w) => w.length > 0)

  // Aplica sinalefa automática
  return applySinalefa(words)
}

/**
 * Conta sílabas gramaticais (compatibilidade)
 */
export function countPortugueseSyllables(text: string): number {
  return countPoeticSyllables(text)
}

/**
 * Valida um verso individual
 */
export function validateSyllableLimit(
  line: string,
  maxSyllables = 12, // Máximo agora é 12 sílabas
): {
  isValid: boolean
  currentSyllables: number
  suggestions: string[]
} {
  const syllables = countPoeticSyllables(line)
  const suggestions: string[] = []

  if (syllables > maxSyllables) {
    suggestions.push(
      `Remova ${syllables - maxSyllables} sílaba(s) — tente encurtar palavras`,
      `Use contrações: "está" → "tá", "para" → "pra"`,
      `Remova artigos/preposições desnecessárias`,
    )
  } else if (syllables < 4) {
    // Mínimo agora é 4 sílabas
    suggestions.push(
      `Verso muito curto (${syllables} sílabas). Considere expandir para 4–12.`,
      `Adicione adjetivos ou detalhes descritivos`,
    )
  }

  const isValid = syllables >= 4 && syllables <= 12

  return { isValid, currentSyllables: syllables, suggestions }
}

/**
 * Valida uma letra completa
 */
export interface SyllableValidationResult {
  valid: boolean
  violations: Array<{
    line: string
    syllables: number
    lineNumber: number
    suggestions: string[]
  }>
}

export function validateLyricsSyllables(lyrics: string, maxSyllables = 12): SyllableValidationResult {
  // Máximo 12
  const lines = lyrics.split("\n")
  const violations: Array<{
    line: string
    syllables: number
    lineNumber: number
    suggestions: string[]
  }> = []

  lines.forEach((line, index) => {
    const trimmed = line.trim()
    if (
      trimmed &&
      !trimmed.startsWith("[") &&
      !trimmed.startsWith("(") && // Ignora linhas com parênteses (instrumentação)
      !trimmed.startsWith("Title:") &&
      !trimmed.startsWith("Instrumentos:")
    ) {
      const validation = validateSyllableLimit(trimmed, maxSyllables)
      if (!validation.isValid) {
        violations.push({
          line: trimmed,
          syllables: validation.currentSyllables,
          lineNumber: index + 1,
          suggestions: validation.suggestions,
        })
      }
    }
  })

  return {
    valid: violations.length === 0,
    violations,
  }
}
