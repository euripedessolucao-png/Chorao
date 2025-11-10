/**
 * Validador de Simplicidade
 * Detecta e rejeita construções rebuscadas em letras de música
 */

export interface SimplicityValidation {
  isSimple: boolean
  forbiddenConstructions: ForbiddenConstruction[]
  score: number // 0-100, quanto maior mais simples
}

export interface ForbiddenConstruction {
  lineNumber: number
  line: string
  issue: string
  example: string
}

const FORBIDDEN_PATTERNS = [
  // Gerúndios "a [verbo]"
  {
    pattern:
      /\ba\s+(flutuar|dançar|embalar|contar|lamentar|ecoar|ressoar|brilhar|dedilhar|tocar|soar|voar|cantar|sussurrar)\b/gi,
    issue: 'Gerúndio "a [verbo]"',
    example: 'Use "sobe" em vez de "a flutuar"',
  },

  // Substantivo + a + verbo
  {
    pattern:
      /(fumaça|viola|toada|voz|som|melodia|canção|alma)\s+a\s+(flutuar|dançar|embalar|contar|lamentar|ecoar|ressoar)/gi,
    issue: 'Construção "[substantivo] a [verbo]"',
    example: 'Use "fumaça sobe" em vez de "fumaça a flutuar"',
  },

  // Verbos rebuscados
  {
    pattern: /\b(contemplar|dedilhar|embalar|ressoar|ecoar|ansiar|lamentar|sussurrar|alvorar)\b/gi,
    issue: "Verbo rebuscado",
    example: "Use verbos simples: olhar, tocar, balançar, soar",
  },

  // Palavras poéticas antigas
  {
    pattern: /\b(clamor|alvorada|ermo|outono|melancolia|nostalgia|contemplação)\b/gi,
    issue: "Palavra poética antiga",
    example: "Use linguagem coloquial moderna",
  },

  // Expressões complexas
  {
    pattern: /\b(anseia por|a fim de|por meio de|através de)\b/gi,
    issue: "Expressão rebuscada",
    example: 'Simplifique: "quer" em vez de "anseia por"',
  },
]

const SIMPLE_VERBS = [
  "olha",
  "vê",
  "sente",
  "quer",
  "lembra",
  "fica",
  "deixa",
  "perde",
  "tem",
  "vai",
  "volta",
  "passa",
  "chega",
  "sai",
  "entra",
  "fala",
  "ouve",
  "toca",
  "canta",
  "dança",
  "bebe",
  "come",
  "dorme",
]

/**
 * Valida se a letra usa linguagem simples e direta
 */
export function validateSimplicity(lyrics: string): SimplicityValidation {
  const lines = lyrics.split("\n").filter((l) => l.trim().length > 0)
  const forbiddenConstructions: ForbiddenConstruction[] = []

  lines.forEach((line, index) => {
    // Verifica cada padrão proibido
    FORBIDDEN_PATTERNS.forEach(({ pattern, issue, example }) => {
      const matches = line.match(pattern)
      if (matches) {
        forbiddenConstructions.push({
          lineNumber: index + 1,
          line: line.trim(),
          issue,
          example,
        })
      }
    })
  })

  // Calcula score (% de linhas sem problemas)
  const cleanLines = lines.length - forbiddenConstructions.length
  const score = Math.round((cleanLines / lines.length) * 100)

  const isSimple = forbiddenConstructions.length === 0

  console.log("[Validador Simplicidade]", {
    totalLines: lines.length,
    problematicLines: forbiddenConstructions.length,
    score: `${score}%`,
    isSimple,
  })

  return {
    isSimple,
    forbiddenConstructions,
    score,
  }
}

/**
 * Gera relatório detalhado de simplicidade
 */
export function generateSimplicityReport(validation: SimplicityValidation): string {
  if (validation.isSimple) {
    return "✅ Letra usa linguagem simples e direta!"
  }

  let report = `❌ Letra tem ${validation.forbiddenConstructions.length} construções rebuscadas (Score: ${validation.score}%)\n\n`

  validation.forbiddenConstructions.forEach(({ lineNumber, line, issue, example }) => {
    report += `Linha ${lineNumber}: "${line}"\n`
    report += `  Problema: ${issue}\n`
    report += `  Sugestão: ${example}\n\n`
  })

  return report
}
