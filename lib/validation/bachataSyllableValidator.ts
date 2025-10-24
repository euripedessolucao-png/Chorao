import { countPoeticSyllables } from "./syllable-counter-brasileiro"

export interface BachataSyllableValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  score: number
  syllableCount: number
  hasCaesura: boolean
  parts?: { part1: number; part2: number }
}

// Regras da Bachata Brasileira Moderna (2024–2025)
const BACHATA_RULES = {
  // BPM ideal
  bpm: { min: 110, max: 120 },

  // Métrica por tipo de linha
  verse: {
    ideal: { min: 8, max: 10 },
    maxAcceptable: 12,
  },
  chorus: {
    ideal: { min: 7, max: 9 },
    maxAcceptable: 11,
  },
  bridge: {
    ideal: { min: 6, max: 9 },
    maxAcceptable: 10,
  },

  // Frases com cesura (vírgula)
  caesura: {
    ideal: { part1: { min: 5, max: 7 }, part2: { min: 4, max: 7 } },
    maxTotal: 14,
  },
}

export function validateBachataLine(
  line: string,
  sectionType: "verse" | "chorus" | "bridge" = "verse",
): BachataSyllableValidation {
  const errors: string[] = []
  const warnings: string[] = []
  let score = 100

  // Contagem principal - ✅ CORREÇÃO: countSyllables → countPoeticSyllables
  const totalSyllables = countPoeticSyllables(line)
  const [part1, part2] = splitAtCaesura(line)
  const hasCaesura = part2 !== null

  let partsSyllables: { part1: number; part2: number } | undefined

  if (hasCaesura) {
    // ✅ CORREÇÃO: countSyllables → countPoeticSyllables
    const p1 = countPoeticSyllables(part1)
    const p2 = countPoeticSyllables(part2)
    partsSyllables = { part1: p1, part2: p2 }

    // Valida cesura
    if (p1 > BACHATA_RULES.caesura.ideal.part1.max) {
      warnings.push(`Parte 1 da cesura muito longa (${p1} sílabas, ideal: ≤7)`)
      score -= 5
    }
    if (p2 > BACHATA_RULES.caesura.ideal.part2.max) {
      warnings.push(`Parte 2 da cesura muito longa (${p2} sílabas, ideal: ≤7)`)
      score -= 5
    }
    if (p1 + p2 > BACHATA_RULES.caesura.maxTotal) {
      errors.push(`Frase com cesura excede ${BACHATA_RULES.caesura.maxTotal} sílabas`)
      score -= 15
    }
  }

  // Valida contagem total
  const rules = BACHATA_RULES[sectionType]
  if (totalSyllables > rules.maxAcceptable) {
    errors.push(`Linha muito longa (${totalSyllables} sílabas, máximo aceitável: ${rules.maxAcceptable})`)
    score -= 20
  } else if (totalSyllables > rules.ideal.max) {
    warnings.push(`Linha acima do ideal (${totalSyllables} sílabas, ideal: ≤${rules.ideal.max})`)
    score -= 8
  } else if (totalSyllables < rules.ideal.min) {
    warnings.push(`Linha curta demais (${totalSyllables} sílabas, ideal: ≥${rules.ideal.min})`)
    score -= 5
  }

  // Teste de cantabilidade: tenta ler em voz alta
  if (totalSyllables > 10 && !hasCaesura) {
    warnings.push("Linha longa sem pausa natural - pode ser difícil de cantar")
    score -= 7
  }

  score = Math.max(0, Math.min(100, score))

  return {
    isValid: errors.length === 0 && score >= 75,
    errors,
    warnings,
    score,
    syllableCount: totalSyllables,
    hasCaesura,
    parts: partsSyllables,
  }
}

// Valida múltiplas linhas (ex: um verso completo)
export function validateBachataSection(lines: string[], sectionType: "verse" | "chorus" | "bridge" = "verse") {
  return lines.map((line, index) => ({
    line: index + 1,
    content: line,
    ...validateBachataLine(line, sectionType),
  }))
}

export function validateBachataLyrics(lyrics: string): {
  isValid: boolean
  totalLines: number
  validLines: number
  invalidLines: number
  lineResults: Array<{ line: string; lineNumber: number; result: BachataSyllableValidation }>
  summary: string
} {
  const lines = lyrics.split("\n")
  const lineResults: Array<{ line: string; lineNumber: number; result: BachataSyllableValidation }> = []

  let validLines = 0
  let invalidLines = 0

  lines.forEach((line, index) => {
    // Ignora linhas vazias ou marcadores
    if (!line.trim() || line.startsWith("[") || line.startsWith("(")) {
      return
    }

    const result = validateBachataLine(line, "verse")

    lineResults.push({
      line,
      lineNumber: index + 1,
      result,
    })

    if (result.isValid) {
      validLines++
    } else {
      invalidLines++
    }
  })

  const totalLines = lineResults.length
  const isValid = invalidLines === 0

  const summary = `${validLines}/${totalLines} linhas válidas (${Math.round((validLines / totalLines) * 100)}%)`

  return {
    isValid,
    totalLines,
    validLines,
    invalidLines,
    lineResults,
    summary,
  }
}

export function suggestBachataCorrections(line: string): string[] {
  const result = validateBachataLine(line)
  const suggestions: string[] = []

  if (result.isValid) {
    return ["✓ Linha já está com métrica correta!"]
  }

  // Sugestões baseadas no tipo de erro
  if (result.syllableCount > 10) {
    suggestions.push("Tente usar contrações: 'para' → 'pra', 'você' → 'cê', 'está' → 'tá'")
    suggestions.push("Remova artigos desnecessários: 'o', 'a', 'um', 'uma'")
  }

  if (result.syllableCount < 6) {
    suggestions.push("Adicione adjetivos suaves: 'meu', 'teu', 'essa', 'linda'")
    suggestions.push("Expanda verbos: 'tá' → 'está', 'cê' → 'você'")
  }

  if (result.hasCaesura && result.parts) {
    if (result.parts.part1 > 7) {
      suggestions.push("Primeira parte muito longa - mova palavras para depois da vírgula")
    }
    if (result.parts.part2 > 7) {
      suggestions.push("Segunda parte muito longa - simplifique ou divida em duas linhas")
    }
  }

  return suggestions
}

// ✅ CORREÇÃO: Adicionar a função splitAtCaesura que estava faltando
function splitAtCaesura(line: string): [string, string | null] {
  const commaIndex = line.indexOf(",")
  if (commaIndex !== -1) {
    return [line.substring(0, commaIndex).trim(), line.substring(commaIndex + 1).trim()]
  }

  const spaceIndex = line.lastIndexOf(" ", Math.floor(line.length / 2))
  if (spaceIndex !== -1 && spaceIndex > 0 && spaceIndex < line.length - 1) {
    return [line.substring(0, spaceIndex).trim(), line.substring(spaceIndex + 1).trim()]
  }

  return [line, null]
}

export const BACHATA_PROSODY_RULES = BACHATA_RULES
