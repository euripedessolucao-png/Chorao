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

  // Remove pontuação e formatação
  let clean = line
    .toLowerCase()
    .replace(/[^\w\sáéíóúâêîôûãõàèìòù]/g, " ")
    .trim()

  // Casos especiais: "cê", "tô", "você", etc.
  clean = clean
    .replace(/\bcê\b/g, "você")
    .replace(/\btô\b/g, "estou")
    .replace(/\bnum\b/g, "em um")
    .replace(/\bné\b/g, "não é")

  // Divide em palavras
  const words = clean.split(/\s+/).filter((w) => w.length > 0)
  let total = 0

  for (const word of words) {
    let syllables = 0
    const vowels = "aeiouáéíóúâêîôûãõàèìòù"
    let i = 0

    while (i < word.length) {
      if (vowels.includes(word[i])) {
        syllables++
        // Trata ditongos e tritongos (ex: "au", "uai")
        if (i + 1 < word.length && vowels.includes(word[i + 1])) {
          // Ditongo decrescente (ai, ei, oi, au, eu, ou) = 1 sílaba
          if (["a", "e", "o"].includes(word[i]) && ["i", "u"].includes(word[i + 1])) {
            i += 2
            continue
          }
          // Ditongo crescente (ia, ie, io, ua, ue, uo) = 1 sílaba
          if (["i", "u"].includes(word[i]) && ["a", "e", "i", "o", "u"].includes(word[i + 1])) {
            i += 2
            continue
          }
        }
        // Tritongos (uai, uei, uoi) = 1 sílaba
        if (
          i + 2 < word.length &&
          word[i] === "u" &&
          ["a", "e", "o"].includes(word[i + 1]) &&
          ["i"].includes(word[i + 2])
        ) {
          i += 3
          continue
        }
      }
      i++
    }

    // Palavras sem vogais (ex: "psst") contam como 1
    if (syllables === 0) syllables = 1
    total += syllables
  }

  return total
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
