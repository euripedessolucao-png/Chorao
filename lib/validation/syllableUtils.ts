/**
 * Utilitários de contagem de sílabas para português brasileiro
 * Baseado em regras fonéticas reais de canto (não poesia clássica)
 */

/**
 * Conta sílabas com regras fonéticas do português brasileiro.
 * Baseado em regras reais de canto (não poesia clássica).
 */
export function countSyllables(line: string): number {
  if (!line.trim()) return 0

  // Remove pontuação e formatação, mas mantém espaços para elisão
  let clean = line
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^\w\sàèìòùáéíóúâêîôûãõ]/g, " ") // Mantém letras, espaços e vogais com acento
    .replace(/\s+/g, " ")
    .trim()

  // Aplica elisões (sinalefa) - CRÍTICO para canto!
  clean = applyElisions(clean)

  // Divide em palavras
  const words = clean.split(/\s+/).filter((w) => w.length > 0)
  let totalSyllables = 0

  for (const word of words) {
    totalSyllables += countWordSyllables(word)
  }

  return totalSyllables
}

/**
 * Aplica elisões (sinalefa) entre palavras
 */
function applyElisions(text: string): string {
  return (
    text
      // Elisões comuns no canto brasileiro
      .replace(/\b(eu)\s+(vou)\b/gi, "euvou")
      .replace(/\b(meu)\s+(amor)\b/gi, "meuamor")
      .replace(/\b(sou)\s+(eu)\b/gi, "soueu")
      .replace(/\b(que)\s+(eu)\b/gi, "queeu")
      .replace(/\b(se)\s+(eu)\b/gi, "seeu")
      .replace(/\b(de)\s+(a|e|i|o|u|amor|abraço|outro|essa|aquele)/gi, (match, p1, p2) => `d${p2}`)
      .replace(/\b(em)\s+(a|e|i|o|u|um|uns)/gi, (match, p1, p2) => `n${p2}`)
      .replace(/\b(com)\s+(a|e|i|o|u|igo)/gi, (match, p1, p2) => `co${p2}`)
      .replace(/\b(por)\s+(a|e|i|o|u)/gi, (match, p1, p2) => `po${p2}`)
      // Contrações obrigatórias
      .replace(/\bvocê\b/gi, "cê")
      .replace(/\bestou\b/gi, "tô")
      .replace(/\bpara\b/gi, "pra")
      .replace(/\bestá\b/gi, "tá")
      .replace(/\bcomigo\b/gi, "comigo") // mantém 3 sílabas: co-mi-go
      .replace(/\bcontigo\b/gi, "contigo")
  ) // mantém 3 sílabas: con-ti-go
}

/**
 * Conta sílabas em uma única palavra
 */
function countWordSyllables(word: string): number {
  if (word.length === 0) return 0

  const vowels = "aeiouàèìòùáéíóúâêîôûãõ"
  let syllableCount = 0
  let i = 0

  while (i < word.length) {
    const currentChar = word[i]

    if (vowels.includes(currentChar)) {
      syllableCount++

      // Verifica ditongos decrescentes (vogal + semivogal)
      if (i + 1 < word.length && "iu".includes(word[i + 1])) {
        if ("aeoáéíóúâêô".includes(currentChar)) {
          i++ // Pula a semivogal (ditongo = 1 sílaba)
        }
      }
      // Verifica ditongos crescentes (semivogal + vogal)
      else if (i > 0 && "iu".includes(word[i - 1]) && vowels.includes(currentChar)) {
        // Já contamos na vogal anterior, não faz nada
      }
      // Verifica tritongos
      else if (i + 2 < word.length && word[i] === "u" && "aeo".includes(word[i + 1]) && word[i + 2] === "i") {
        i += 2 // Pula duas letras do tritongo
      }
    }
    i++
  }

  // Palavra sem vogais conta como 1 sílaba
  return syllableCount || 1
}

/**
 * Verifica se uma linha tem cesura (pausa natural)
 * Retorna [parte1, parte2] se houver vírgula ou conjunção forte
 */
export function splitAtCaesura(line: string): [string, string | null] {
  const trimmed = line.trim()

  // Verifica vírgula
  if (trimmed.includes(",")) {
    const parts = trimmed.split(",", 2)
    return [parts[0].trim(), parts[1]?.trim() || null]
  }

  // Verifica conjunções que criam pausa natural
  const conjunctions = ["mas", "porém", "então", "pra", "para", "e"]
  for (const conj of conjunctions) {
    const regex = new RegExp(`\\b${conj}\\b`, "i")
    if (regex.test(trimmed)) {
      const parts = trimmed.split(regex, 2)
      if (parts[1]) {
        return [parts[0].trim(), `${conj} ${parts[1].trim()}`]
      }
    }
  }

  return [trimmed, null]
}

/**
 * Valida se uma letra inteira está dentro do limite de sílabas
 */
export function validateLyricsSyllables(lyrics: string, maxSyllables = 12) {
  const lines = lyrics.split("\n").filter((line) => {
    const trimmed = line.trim()
    return (
      trimmed &&
      !trimmed.startsWith("[") &&
      !trimmed.startsWith("(") &&
      !trimmed.startsWith("Título:") &&
      !trimmed.startsWith("Instrução:") &&
      !trimmed.match(/^Instrução:/)
    )
  })

  const violations = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const syllables = countSyllables(line)

    if (syllables > maxSyllables) {
      violations.push({
        line: i + 1,
        text: line,
        syllables,
        expected: maxSyllables,
      })
    }
  }

  return {
    valid: violations.length === 0,
    violations,
    totalLines: lines.length,
    linesWithIssues: violations.length,
  }
}

/**
 * Normaliza texto removendo acentos e pontuação
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, "")
    .trim()
}

/**
 * Verifica se duas palavras rimam (rima consoante)
 */
export function checkRhyme(word1: string, word2: string): boolean {
  const normalized1 = normalizeText(word1)
  const normalized2 = normalizeText(word2)

  if (normalized1.length < 2 || normalized2.length < 2) return false

  // Verifica se as últimas 2-3 letras são iguais
  const ending1 = normalized1.slice(-3)
  const ending2 = normalized2.slice(-3)

  return ending1 === ending2 || normalized1.slice(-2) === normalized2.slice(-2)
}
