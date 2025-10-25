// lib/validation/syllable-counter-brasileiro.ts

/**
 * Conta sílabas poéticas em português brasileiro com regras fonológicas.
 * Projetado para validação de letras musicais.
 */
export function countPoeticSyllables(text: string): number {
  if (!text || text.trim().length === 0) return 0

  // Normaliza e limpa o texto
  const clean = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z\s']/g, " ") // Mantém letras, espaços e apóstrofo (pra, d'água)
    .replace(/\s+/g, " ")
    .trim()

  if (!clean) return 0

  // Divide em palavras
  const words = clean.split(/\s+/).filter((w) => w.length > 0)
  let total = 0

  for (const word of words) {
    total += countSyllablesInWord(word)
  }

  return total
}

function countSyllablesInWord(word: string): number {
  // Palavras vazias
  if (!word) return 0

  // Contrações comuns em letras musicais
  const contractions: Record<string, number> = {
    pra: 1, // para → 2, mas "pra" = 1
    pro: 1, // para o
    pras: 1,
    pros: 1,
    da: 1,
    do: 1,
    das: 1,
    dos: 1,
    tá: 1, // está
    vou: 1,
    sou: 1,
    dá: 1,
    pé: 1,
    pá: 1,
    mãe: 1, // ditonga nasal
    põe: 1,
    vêm: 1,
    têm: 1,
    ninguém: 2,
    alguém: 2,
    ninguem: 2,
    alguem: 2,
  }

  if (contractions.hasOwnProperty(word)) {
    return contractions[word]
  }

  // Normaliza: remove apóstrofo interno (ex: d'água → dagua)
  const w = word.replace(/'/g, "")

  // Se a palavra é só consoantes (raro, mas possível em gírias), conta como 1
  if (!/[aeiou]/.test(w)) return 1

  // Regra 1: terminações -am, -em, -ens (sempre 1 sílaba final)
  if (/(am|em|ens)$/i.test(w)) {
    // Vamos tratar como 1 sílaba final, mas ainda contar o restante
    // Ex: "ninguém" → já tratado acima, mas "eles cantam" → can-tam (2)
    // Não remove, só lembrar que "am/em" = 1 sílaba
  }

  // Separa vogais e encontros vocálicos com base em regras
  // Vamos marcar onde há quebra silábica real

  // Passo: identificar unidades silábicas com base em vogais + ditongos
  // Regra simplificada: cada "núcleo vocálico" = 1 sílaba
  // Núcleo = vogal tônica ou ditongo/tritongo

  // Lista de ditongos decrescentes (vogal + semivogal) → 1 sílaba
  const ditongos = [
    "ai",
    "ei",
    "oi",
    "au",
    "eu",
    "ou",
    "ui", // orais
    "ãi",
    "ẽi",
    "õi",
    "ãu",
    "ẽu",
    "õu", // nasais (raro, mas existe)
    "ao",
    "eo",
    "ia",
    "ie",
    "io",
    "ua",
    "ue",
    "uo",
    "iu", // crescentes também 1 sílaba na maioria dos casos
  ]

  // Tritongos (1 sílaba)
  const tritongos = ["uai", "uei", "uoi", "uou"]

  let s = w
  let count = 0

  // Primeiro, substitui tritongos e ditongos por um marcador único (ex: X)
  for (const t of tritongos) {
    s = s.replace(new RegExp(t, "g"), "X")
  }
  for (const d of ditongos) {
    s = s.replace(new RegExp(d, "g"), "X")
  }

  // Agora, conta os núcleos vocálicos restantes (vogais isoladas = 1 sílaba cada)
  const vowels = s.match(/[aeiou]/g)
  const xCount = (s.match(/X/g) || []).length

  count = (vowels ? vowels.length : 0) + xCount

  // Garante no mínimo 1 sílaba
  count = Math.max(1, count)

  // Ajustes finos comuns em música:
  // - "tempestade" → 4 sílabas (tem-pes-ta-de), não 5
  // - "construímos" → 4 (cons-tru-í-mos), não 5
  // Esses casos são difíceis sem dicionário, mas podemos mitigar:

  // Sinérese comum em "-íamos", "-uímos", etc.
  if (/([aeiou]íamos|[aeiou]uímos)$/i.test(w)) {
    // Ex: "construíamos" → normalmente 5, mas na música vira 4
    // Reduz 1 sílaba se detectar esse padrão
    count = Math.max(1, count - 1)
  }

  // Palavras terminadas em "-ade", "-ude", "-ide" → geralmente 3 sílabas, não 4
  // Ex: "tempestade" = tem-pes-ta-de (4), mas "cidade" = ci-da-de (3)
  // Já está ok com a regra de ditongos? Sim, porque "ade" → a-de (2 vogais = 2 sílabas)

  return count
}

/**
 * Mantém compatibilidade com a API antiga
 */
export function countPortugueseSyllables(text: string): number {
  return countPoeticSyllables(text)
}

export interface SyllableValidationResult {
  valid: boolean
  violations: Array<{
    lineNumber: number
    line: string
    syllables: number
  }>
}

export function validateLyricsSyllables(lyrics: string, maxSyllables = 11): SyllableValidationResult {
  const lines = lyrics.split("\n").filter((l) => l.trim() && !l.startsWith("["))
  const violations: SyllableValidationResult["violations"] = []

  lines.forEach((line, index) => {
    const syllables = countPoeticSyllables(line)
    if (syllables > maxSyllables) {
      violations.push({
        lineNumber: index + 1,
        line: line.trim(),
        syllables,
      })
    }
  })

  return {
    valid: violations.length === 0,
    violations,
  }
}
