// lib/validation/syllable-counter-brasileiro.ts

/**
 * PoeticSyllableEngine — Motor definitivo de sílabas poéticas para música brasileira.
 * 
 * Projetado para sertanejo moderno, MPB e pop com foco em:
 * - Naturalidade da fala cantada
 * - Contrações reais ("cê", "tá", "pra")
 * - Sinérese em verbos ("esvaiu", "ajoelhou")
 * - Elisão interpalavras ("tá aqui" → 2 sílabas)
 * - Tolerância contextual a versos curtos (interjeições, chamadas)
 */

// === Dicionário fonético musical (valor = sílabas na música) ===
const MUSICAL_SYLLABLES: Record<string, number> = {
  // Monossílabos tônicos
  tá: 1,   // está
  dá: 1,   // ele dá
  pô: 1,   // pôr
  vê: 1,   // ver
  pé: 1,   // pé
  pá: 1,   // pá
  dó: 1,   // dó
  sou: 1,  // sou
  vou: 1,  // vou
  sei: 1,  // sei
  dei: 1,  // dei
  rei: 1,  // rei
  lei: 1,  // lei
  céu: 1,  // céu
  pão: 1,  // pão
  mãe: 1,  // mãe
  cão: 1,  // cão
  põe: 1,  // põe
  vêm: 1,  // vêm
  têm: 1,  // têm
  lêem: 1, // lêem
  dão: 1,  // dão

  // Contrações naturais
  pra: 1,    // para
  pro: 1,    // para o
  pras: 1,   // para as
  pros: 1,   // para os
  cê: 1,     // você
  tô: 1,     // estou
  tamo: 1,   // estamos
  tão: 1,    // estão
  da: 1,     // de + a
  do: 1,     // de + o
  das: 1,    // de + as
  dos: 1,    // de + os
  na: 1,     // em + a
  no: 1,     // em + o
  nas: 1,    // em + as
  nos: 1,    // em + os

  // Palavras com sinérese forçada em música
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
  ajoelhou: 3, // a-jo-lhou (não a-jo-e-lhou)
  conquistou: 3, // con-quis-tou
  acordou: 3, // a-cor-dou
  reclamou: 3, // re-cla-mou
  agradecendo: 5, // a-gra-de-cen-do
}

// === Função principal de contagem ===
export function countPoeticSyllables(line: string): number {
  if (!line?.trim()) return 0

  // Normaliza para análise fonética
  let clean = line
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z\s']/g, " ")       // Mantém letras e apóstrofo
    .replace(/\s+/g, " ")
    .trim()

  if (!clean) return 0

  // Aplica contrações léxicas antes de dividir
  clean = applyLexicalContractions(clean)

  // Divide em palavras
  const words = clean.split(/\s+/).filter(Boolean)
  if (words.length === 0) return 0

  // Conta sílabas palavra a palavra
  let total = 0
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    total += countWordSyllables(word)
  }

  // Aplica elisão interpalavras
  total = applyInterwordElision(line, total)

  return Math.max(1, total)
}

// === Aplica contrações comuns em música ===
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
    .replace(/\bde\s+as\b/g, "das")
    .replace(/\bde\s+os\b/g, "dos")
    .replace(/\bem\s+a\b/g, "na")
    .replace(/\bem\s+o\b/g, "no")
    .replace(/\bem\s+as\b/g, "nas")
    .replace(/\bem\s+os\b/g, "nos")
    .replace(/\s+/g, " ")
    .trim()
}

// === Conta sílabas em uma palavra ===
function countWordSyllables(word: string): number {
  const key = word.replace(/'/g, "")
  if (MUSICAL_SYLLABLES[key] !== undefined) {
    return MUSICAL_SYLLABLES[key]
  }

  if (!/[aeiou]/.test(key)) return 1 // só consoantes → 1 sílaba

  // Tritongos → 1 sílaba
  let s = key
  const tritongos = ["uai", "uei", "uoi"]
  for (const t of tritongos) {
    s = s.replace(new RegExp(t, "g"), "X")
  }

  // Ditongos → 1 sílaba
  const ditongos = [
    "ai", "ei", "oi", "au", "eu", "ou", "ui",
    "ia", "ie", "io", "ua", "ue", "uo", "iu",
    "ao", "ãe", "ão", "õe", "ãi", "ẽi", "õi"
  ]
  for (const d of ditongos) {
    s = s.replace(new RegExp(d, "g"), "X")
  }

  const vowels = (s.match(/[aeiou]/g) || []).length
  const x = (s.match(/X/g) || []).length
  let count = vowels + x

  // Ajuste para verbos em -ou, -ou, -iu
  if (/(ou|ei|iu)$/i.test(key)) {
    // Na música, quase sempre reduzido
    if (key.endsWith("ou") || key.endsWith("iu")) {
      count = Math.min(count, 3)
    }
  }

  return Math.max(1, count)
}

// === Elisão interpalavras (crucial para precisão) ===
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
    /tô\s+só$/,
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

// === Validação com suporte a versos curtos contextuais ===
export interface SyllableValidationResult {
  valid: boolean
  violations: Array<{
    lineNumber: number
    line: string
    syllables: number
    reason: string
  }>
}

/**
 * Valida letra com regras flexíveis para sertanejo moderno.
 * Permite versos curtos (4–7 sílabas) se forem interjeições, chamadas ou perguntas.
 */
export function validateLyricsSyllables(
  lyrics: string,
  minIdeal = 8,
  maxIdeal = 10,
  absoluteMax = 12
): SyllableValidationResult {
  const lines = lyrics
    .split("\n")
    .map(l => l.trim())
    .filter(l => l && !l.startsWith("[") && !/^\([^)]*\)$/.test(l))

  const violations = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const syllables = countPoeticSyllables(line)

    if (syllables > absoluteMax) {
      violations.push({
        lineNumber: i + 1,
        line,
        syllables,
        reason: `Excede limite absoluto (${absoluteMax})`
      })
    } else if (syllables < minIdeal && !isContextualShortLine(line)) {
      violations.push({
        lineNumber: i + 1,
        line,
        syllables,
        reason: `Abaixo do mínimo ideal (${minIdeal}) e não é chamada/interjeição`
      })
    }
    // Aceita 8–12 sem aviso; 7 ou menos só se for contextual
  }

  return {
    valid: violations.length === 0,
    violations,
  }
}

// === Detecta versos curtos permitidos ===
function isContextualShortLine(line: string): boolean {
  const shortPatterns = [
    /escuta aí/i,
    /olha /i,
    /cê já/i,
    /já pensou/i,
    /né\?$/i,
    /\?$/,
    /^(oh|ei|ai|ui|psiu)/i,
    /oh-oh/i,
    /acorda/i,
    /acorde/i,
    /ei, /i,
  ]
  const syllables = countPoeticSyllables(line)
  return syllables >= 4 && syllables <= 7 && shortPatterns.some(p => p.test(line))
}

// === Exportações para compatibilidade ===
export const countPortugueseSyllables = countPoeticSyllables
