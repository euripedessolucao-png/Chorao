function _normalizeBasic(line: string): string {
  return (line ?? "")
    .toLowerCase()
    .replace(/[".,;:!?()[\]{}…–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function _applyElisionsAndContractionsForCounting(text: string): string {
  let s = `${text}`

  // Elisões (sinalefa) - junção natural de vogais entre palavras no canto
  s = s
    .replace(/\bde\s+(a|e|i|o|u|amor)\b/gi, " d$1")
    .replace(/\bem\s+(um|uns|uma|umas|a|e|i|o|u)\b/gi, " n$1")
    .replace(/\bque\s+eu\b/gi, " queeu")
    .replace(/\bse\s+eu\b/gi, " seeu")
    .replace(/\bmeu\s+amor\b/gi, " meuamor")
    .replace(/\beu\s+vou\b/gi, " euvou")

  // Contrações (uso comum no canto brasileiro)
  s = s
    .replace(/\bvocê\b/gi, "cê")
    .replace(/\bestou\b/gi, "tô")
    .replace(/\bpara\b/gi, "pra")
    .replace(/\bestá\b/gi, "tá")

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

    // Verifica tritongos primeiro
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
