/**
 * Contador de sílabas para canto em português brasileiro
 * Aplica elisões e contrações naturais do canto
 */

function _normalizeBasic(line: string): string {
  return (line ?? "")
    .toLowerCase()
    .replace(/[".,;:!?()[\]{}…–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function _applyElisionsAndContractionsForCounting(text: string): string {
  let s = `${text}`

  // Elisões (sinalefa) - junção de vogais entre palavras
  s = s
    .replace(/\bde\s+(a|e|i|o|u|amor|ela|ele)\b/gi, " d$1")
    .replace(/\bem\s+(um|uns|uma|umas|a|e|i|o|u)\b/gi, " n$1")
    .replace(/\bque\s+(eu|ela|ele|a|o)\b/gi, " que$1")
    .replace(/\bse\s+(eu|ela|ele)\b/gi, " se$1")
    .replace(/\bmeu\s+(amor|coração)\b/gi, " meu$1")
    .replace(/\beu\s+(vou|sei|sou)\b/gi, " eu$1")
    .replace(/\bna\s+(hora|alma)\b/gi, " na$1")
    .replace(/\bno\s+(olhar|amor)\b/gi, " no$1")

  // Contrações (uso comum no canto)
  s = s
    .replace(/\bvocê\b/gi, "cê")
    .replace(/\bestou\b/gi, "tô")
    .replace(/\bpara\b/gi, "pra")
    .replace(/\bestá\b/gi, "tá")
    .replace(/\bestava\b/gi, "tava")
    .replace(/\bestavam\b/gi, "tavam")
    .replace(/\bpelo\b/gi, "pro")
    .replace(/\bpela\b/gi, "pra")

  return s.trim().replace(/\s+/g, " ")
}

function _stripDiacritics(input: string): string {
  return (input || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

export function countSyllablesSingingPtBr(
  line: string,
  opts: { applyElisions?: boolean; applyContractions?: boolean } = {},
): number {
  const basic = _normalizeBasic(line)
  const pre = opts.applyElisions || opts.applyContractions ? _applyElisionsAndContractionsForCounting(basic) : basic
  const base = _stripDiacritics(pre).replace(/[^a-z\s']/g, "")

  const diph = ["ai", "ei", "oi", "ui", "au", "eu", "ou", "ia", "ie", "io", "iu", "ua", "ue", "uo", "uu"]
  const triph = ["uai", "uei", "uoi", "uau"]
  const isVowel = (c: string) => /[aeiou]/.test(c)

  let i = 0
  let count = 0

  while (i < base.length) {
    const c = base.charAt(i)
    if (!isVowel(c)) {
      i += 1
      continue
    }

    let matched = false

    // Tenta tritongos primeiro
    for (const t of triph) {
      if (base.startsWith(t, i)) {
        count += 1
        i += t.length
        matched = true
        break
      }
    }
    if (matched) continue

    // Depois ditongos
    for (const d of diph) {
      if (base.startsWith(d, i)) {
        count += 1
        i += d.length
        matched = true
        break
      }
    }
    if (matched) continue

    // Vogal simples
    count += 1
    i += 1
  }

  return count > 0 ? count : 1
}
