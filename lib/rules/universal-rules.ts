export const UNIVERSAL_RULES = {
  syllables: {
    max_syllables: 12, // Limite universal de sílabas por linha
    ideal_range: { min: 5, max: 10 },
  },
  breathability: {
    max_words_per_line: 15,
    max_characters_per_line: 80,
  },
} as const

export interface RhymeRules {
  min_rich_rhymes: number
  max_false_rhymes: number
  required_rhyme_scheme?: string
  allow_assonance: boolean
}

export function getRhymeRulesForGenre(genre: string): RhymeRules {
  const defaultRules: RhymeRules = {
    min_rich_rhymes: 0.6,
    max_false_rhymes: 0.2,
    allow_assonance: true,
  }

  const genreRules: Record<string, Partial<RhymeRules>> = {
    "Sertanejo Moderno Feminino": {
      min_rich_rhymes: 0.7,
      max_false_rhymes: 0.15,
    },
    "Sertanejo Moderno Masculino": {
      min_rich_rhymes: 0.7,
      max_false_rhymes: 0.15,
    },
    "Sertanejo Universitário": {
      min_rich_rhymes: 0.6,
      max_false_rhymes: 0.2,
    },
    "Funk Carioca": {
      min_rich_rhymes: 0.5,
      max_false_rhymes: 0.3,
      allow_assonance: true,
    },
    MPB: {
      min_rich_rhymes: 0.8,
      max_false_rhymes: 0.1,
    },
  }

  return {
    ...defaultRules,
    ...genreRules[genre],
  }
}

export function buildUniversalRulesPrompt(genre: string): string {
  const rhymeRules = getRhymeRulesForGenre(genre)

  return `
REGRAS UNIVERSAIS DE COMPOSIÇÃO:

1. SÍLABAS POÉTICAS:
   - Máximo absoluto: ${UNIVERSAL_RULES.syllables.max_syllables} sílabas por linha
   - Faixa ideal: ${UNIVERSAL_RULES.syllables.ideal_range.min}-${UNIVERSAL_RULES.syllables.ideal_range.max} sílabas
   - Toda linha deve caber em um fôlego natural ao cantar

2. RIMAS:
   - Mínimo de rimas ricas: ${(rhymeRules.min_rich_rhymes * 100).toFixed(0)}%
   - Máximo de rimas falsas: ${(rhymeRules.max_false_rhymes * 100).toFixed(0)}%
   - Assonância permitida: ${rhymeRules.allow_assonance ? "Sim" : "Não"}

3. RESPIRABILIDADE:
   - Máximo ${UNIVERSAL_RULES.breathability.max_words_per_line} palavras por linha
   - Máximo ${UNIVERSAL_RULES.breathability.max_characters_per_line} caracteres por linha

4. NATURALIDADE:
   - Use linguagem coloquial brasileira
   - Evite palavras forçadas ou rebuscadas
   - Mantenha o fluxo natural da fala
`.trim()
}

export function detectSubGenre(additionalRequirements: string | undefined): {
  subGenre: string | null
  instruments: string | null
  bpm: number | null
  rhythm: string | null
  styleNote: string | null
} {
  if (!additionalRequirements) {
    return {
      subGenre: null,
      instruments: null,
      bpm: null,
      rhythm: null,
      styleNote: null,
    }
  }

  const lowerReqs = additionalRequirements.toLowerCase()
  let subGenre: string | null = null
  let instruments: string | null = null
  let bpm: number | null = null
  let rhythm: string | null = null
  const styleNote: string | null = null

  if (lowerReqs.includes("raiz") || lowerReqs.includes("tradicional")) {
    subGenre = "Sertanejo Raiz"
    instruments = "viola caipira, sanfona, violão acústico"
    bpm = 90
    rhythm = "Moda de viola tradicional"
  } else if (lowerReqs.includes("universitário")) {
    subGenre = "Sertanejo Universitário"
    instruments = "violão, guitarra, bateria"
    bpm = 100
    rhythm = "Sertanejo universitário com groove animado"
  } else if (lowerReqs.includes("funk") && lowerReqs.includes("melody")) {
    subGenre = "Funk Melody"
    instruments = "bateria eletrônica, sintetizador, baixo"
    bpm = 128
    rhythm = "Funk melody com melodia romântica"
  } else if (lowerReqs.includes("funk") && lowerReqs.includes("consciente")) {
    subGenre = "Funk Consciente"
    instruments = "bateria eletrônica, sintetizador"
    bpm = 130
    rhythm = "Funk com mensagem social"
  } else if (lowerReqs.includes("pagode")) {
    subGenre = "Pagode Romântico"
    instruments = "cavaquinho, pandeiro, tantã"
    bpm = 100
    rhythm = "Pagode romântico"
  }

  return {
    subGenre,
    instruments,
    bpm,
    rhythm,
    styleNote,
  }
}
