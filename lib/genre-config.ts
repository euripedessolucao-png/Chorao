export const GENRE_CONFIGS = {
  "Sertanejo Moderno Feminino": {
    year_range: "2024-2025",
    reference_artists: ["Ana Castela", "Maiara & Maraisa", "Luísa Sonza", "Simaria", "Naiara Azevedo"],
    core_principles: {
      theme: "Empoderamento feminino com leveza, autonomia e celebração da liberdade",
      tone: "Confidente, irônico, cotidiano, com atitude suave e final feliz",
      narrative_arc: "Início (controle do ex) → Meio (despertar/libertação) → Fim (celebração autônoma)",
    },
    language_rules: {
      allowed: {
        concrete_objects: [
          "biquíni",
          "PIX",
          "salário",
          "chapéu",
          "praia",
          "conta",
          "decote",
          "carro",
          "espelho",
          "anéis",
        ],
        actions: ["cortei", "paguei", "saí", "rasguei", "usei", "dancei", "voei", "quebrei", "aprendi", "sorri"],
        phrases: ["meu troco", "você não previu", "faço em dobro", "minha lei", "tô em outra vibe", "dona de mim"],
      },
      forbidden: {
        abstract_metaphors: [
          "floresço",
          "alma perdida",
          "mar de dor",
          "bonança",
          "brisa me inflama",
          "castelo de areia",
        ],
        ex_saudade: ["falta da sua voz", "meu coração chora", "volta pra mim", "não consigo viver sem você"],
        aggressive_tone: ["odeio você", "se fuder", "vou te destruir"],
      },
      style: "Coloquial, direto, como conversa real entre amigas. Evite poesia rebuscada.",
    },
    structure_rules: {
      verse: { lines: 4, purpose: "Apresentar conflito ou transformação com detalhes concretos" },
      chorus: {
        lines_options: [2, 4],
        forbidden_lines: 3,
        required_elements: ["Gancho grudento", "Contraste claro", "Afirmação de liberdade"],
      },
      bridge: { lines_min: 2, lines_max: 4, purpose: "Clímax de libertação — foco em ação, não em drama" },
    },
    prosody_rules: {
      syllable_count: {
        with_comma: { max_before_comma: 6, max_after_comma: 6, total_max: 12 },
        without_comma: { min: 5, max: 7, acceptable_up_to: 8 },
      },
      breathability: "Toda linha deve caber em um fôlego natural ao cantar",
    },
    harmony_and_rhythm: {
      key: "C major",
      allowed_chords: ["C", "Dm", "Em", "F", "G", "Am", "G7"],
      forbidden_chords: ["A", "E", "B", "Bb", "F#", "C#", "Ab"],
      bpm_range: { min: 88, max: 96, ideal: 94 },
      rhythm_style: "Sertanejo pop com groove moderado",
    },
  },
  "Sertanejo Moderno Masculino": {
    year_range: "2024-2025",
    reference_artists: [
      "Gusttavo Lima",
      "Israel & Rodolffo",
      "Luan Santana",
      "Zé Neto & Cristiano",
      "Henrique & Juliano",
    ],
    core_principles: {
      theme: "Vulnerabilidade com atitude, celebração da vida simples, superação com leveza",
      tone: "Confidente, sincero, às vezes brincalhão, com toque de saudade saudável",
      narrative_arc: "Início (erro ou dor) → Meio (reflexão ou cura com amigos) → Fim (nova chance ou paz interior)",
    },
    language_rules: {
      allowed: {
        concrete_objects: ["cerveja", "violão", "boteco", "estrada", "caminhonete", "chapéu", "mala", "varanda"],
        actions: ["errei", "aprendi", "segui", "curei", "bebi", "cantei", "perdoei", "cresci"],
        phrases: ["tô em paz comigo", "errei mas cresci", "amor que prende não é amor", "meu refúgio é o boteco"],
      },
      forbidden: {
        toxic_masculinity: ["ela me traiu vou destruir", "mulher é tudo igual", "não choro sou homem"],
        excessive_drama: ["não vivo sem você", "meu mundo desabou", "só penso em você"],
        generic_clichés: ["lágrimas no travesseiro", "noite sem luar", "coração partido em mil"],
      },
      style: "Direto, honesto, com toque de poesia cotidiana. Pode ser romântico, mas nunca possessivo.",
    },
    structure_rules: {
      verse: { lines: 4, purpose: "Contar uma história real: erro, saudade saudável, ou momento de cura" },
      chorus: {
        lines_options: [2, 4],
        forbidden_lines: 3,
        required_elements: ["Gancho emocional ou celebratório", "Referência concreta", "Mensagem de superação"],
      },
    },
    prosody_rules: {
      syllable_count: {
        with_comma: { max_before_comma: 6, max_after_comma: 6, total_max: 12 },
        without_comma: { min: 5, max: 7, acceptable_up_to: 8 },
      },
    },
    harmony_and_rhythm: {
      key: "G major",
      allowed_chords: ["G", "Am", "Bm", "C", "D", "Em", "D7"],
      forbidden_chords: ["A", "E", "B", "Bb", "F#", "C#", "Ab"],
      bpm_range: { min: 90, max: 100, ideal: 95 },
      rhythm_style: "Sertanejo moderno com groove marcado",
    },
  },
} as const

export type GenreConfig = (typeof GENRE_CONFIGS)[keyof typeof GENRE_CONFIGS]

export function validateLyrics(
  lyrics: string,
  genre: string,
): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  const config = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS]
  if (!config) {
    return { valid: true, errors: [], warnings: ["Gênero não encontrado nas configurações"] }
  }

  // Validar palavras proibidas
  const lyricsLower = lyrics.toLowerCase()
  if (config.language_rules.forbidden) {
    Object.entries(config.language_rules.forbidden).forEach(([category, words]) => {
      words.forEach((word: string) => {
        if (lyricsLower.includes(word.toLowerCase())) {
          errors.push(`Palavra/frase proibida encontrada (${category}): "${word}"`)
        }
      })
    })
  }

  // Validar contagem de sílabas
  const lines = lyrics.split("\n").filter((line) => line.trim() && !line.startsWith("["))
  lines.forEach((line, index) => {
    const syllables = countSyllables(line)
    const rules = config.prosody_rules.syllable_count

    if (line.includes(",")) {
      const [before, after] = line.split(",")
      const beforeCount = countSyllables(before)
      const afterCount = countSyllables(after)

      if (beforeCount > rules.with_comma.max_before_comma) {
        warnings.push(`Linha ${index + 1}: Muitas sílabas antes da vírgula (${beforeCount})`)
      }
      if (afterCount > rules.with_comma.max_after_comma) {
        warnings.push(`Linha ${index + 1}: Muitas sílabas depois da vírgula (${afterCount})`)
      }
    } else {
      if (syllables < rules.without_comma.min || syllables > rules.without_comma.acceptable_up_to) {
        warnings.push(`Linha ${index + 1}: Contagem de sílabas fora do ideal (${syllables})`)
      }
    }
  })

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

function countSyllables(text: string): number {
  const cleaned = text.replace(/[^\wáàâãéèêíìîóòôõúùûç\s]/gi, "").toLowerCase()
  const words = cleaned.split(/\s+/).filter(Boolean)

  let total = 0
  words.forEach((word) => {
    // Contagem aproximada de sílabas
    const vowels = word.match(/[aeiouáàâãéèêíìîóòôõúùû]/gi)
    total += vowels ? vowels.length : 1
  })

  return total
}

export const INSTRUMENTATION_RULES = {
  "Sertanejo Moderno Feminino": {
    required: "(Instrumental: acoustic guitar, electric guitar, drums, bass)",
    optional: ["keyboard", "harmonica", "backing vocals"],
    format: "Sempre entre parênteses, em inglês, após o nome da seção",
  },
  "Sertanejo Moderno Masculino": {
    required: "(Instrumental: acoustic guitar, electric guitar, drums, bass)",
    optional: ["harmonica", "accordion", "backing vocals"],
    format: "Sempre entre parênteses, em inglês, após o nome da seção",
  },
} as const
