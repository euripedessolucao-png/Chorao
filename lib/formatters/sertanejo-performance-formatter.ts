/**
 * FORMATADOR DE PERFORMANCE PARA MÚSICA BRASILEIRA MODERNA
 * Adiciona instruções detalhadas de performance, instrumentação e dinâmica
 * Compatível com Sertanejo, Funk, MPB e outros gêneros performáticos
 */

interface PerformanceInstruction {
  section: string
  dynamics: string
  vocalStyle: string
}

const PERFORMANCE_INSTRUCTIONS: Record<string, PerformanceInstruction> = {
  verse1: {
    section: "PART A - Verse 1",
    dynamics: "moderate",
    vocalStyle: "confident, storytelling",
  },
  verse2: {
    section: "PART A2 - Verse 2",
    dynamics: "moderate with attitude",
    vocalStyle: "direct, with edge",
  },
  chorus1: {
    section: "PART B - Chorus",
    dynamics: "full energy",
    vocalStyle: "passionate, powerful",
  },
  chorus2: {
    section: "PART B - Chorus",
    dynamics: "maximum energy",
    vocalStyle: "defiant, celebratory",
  },
  chorusFinal: {
    section: "PART B - Final Chorus",
    dynamics: "explosive",
    vocalStyle: "triumphant, interactive",
  },
  bridge: {
    section: "PART C - Bridge",
    dynamics: "minimal, building tension",
    vocalStyle: "emotional, building",
  },
  outro: {
    section: "OUTRO",
    dynamics: "fading",
    vocalStyle: "soft, reflective",
  },
}

const AUDIENCE_CUES_BY_GENRE: Record<string, string[]> = {
  sertanejo: ["Aôôô potência!", "É nóis!", "Véio!", "Bicho!", "Tá ligado!", "Vai!", "Isso aí!"],
  gospel: ["Amém!", "Glória!", "Aleluia!", "Louvado seja!", "Graças a Deus!"],
  funk: ["Vai!", "Desce!", "Sobe!", "Tá maluco!", "Bora!"],
  pagode: ["Ô laiá!", "Vai!", "Isso aí!", "Segura!"],
  forro: ["Ôxe!", "Arrocha!", "Vai!", "Eita!"],
  default: ["Vai!", "Isso aí!"],
}

const PERFORMANCE_ACTIONS = [
  "Vocalist points to the crowd, smiling",
  "Vocalist raises fist in the air",
  "Vocalist walks to stage edge, engaging crowd",
  "Vocalist claps hands, encouraging participation",
  "Vocalist closes eyes, feeling the emotion",
]

const getInstrumentationByGenre = (sectionType: string, genre: string): string => {
  const lowerGenre = genre.toLowerCase()

  // Gospel - SEM sanfona/accordion
  if (lowerGenre.includes("gospel")) {
    return sectionType === "chorus"
      ? "piano, electric guitar, drums, bass, strings"
      : "piano, acoustic guitar, light percussion"
  }

  // Sertanejo Raiz - COM viola e sanfona
  if (lowerGenre.includes("raiz")) {
    return sectionType === "chorus"
      ? "viola caipira, acoustic guitar, sanfona"
      : "viola caipira, acoustic guitar, light bass"
  }

  // Sertanejo Moderno/Universitário - COM accordion
  if (lowerGenre.includes("sertanejo")) {
    return sectionType === "chorus"
      ? "electric guitar, drums, bass, accordion"
      : "acoustic guitar, bass, light percussion"
  }

  // Funk - SEM instrumentos acústicos
  if (lowerGenre.includes("funk")) {
    return sectionType === "chorus" ? "808 bass, electronic drums, synth" : "808 bass, minimal percussion"
  }

  // Forró - COM zabumba e triângulo
  if (lowerGenre.includes("forró") || lowerGenre.includes("forro")) {
    return sectionType === "chorus" ? "sanfona, zabumba, triângulo, bass" : "sanfona, zabumba, triângulo"
  }

  // Padrão
  return sectionType === "chorus" ? "full band, drums, bass, guitar" : "acoustic guitar, bass, light percussion"
}

const getAudienceCueForGenre = (genre: string): string => {
  const lowerGenre = genre.toLowerCase()

  if (lowerGenre.includes("gospel")) {
    return AUDIENCE_CUES_BY_GENRE.gospel[Math.floor(Math.random() * AUDIENCE_CUES_BY_GENRE.gospel.length)]
  }
  if (lowerGenre.includes("sertanejo")) {
    return AUDIENCE_CUES_BY_GENRE.sertanejo[Math.floor(Math.random() * AUDIENCE_CUES_BY_GENRE.sertanejo.length)]
  }
  if (lowerGenre.includes("funk")) {
    return AUDIENCE_CUES_BY_GENRE.funk[Math.floor(Math.random() * AUDIENCE_CUES_BY_GENRE.funk.length)]
  }
  if (lowerGenre.includes("pagode")) {
    return AUDIENCE_CUES_BY_GENRE.pagode[Math.floor(Math.random() * AUDIENCE_CUES_BY_GENRE.pagode.length)]
  }
  if (lowerGenre.includes("forró") || lowerGenre.includes("forro")) {
    return AUDIENCE_CUES_BY_GENRE.forro[Math.floor(Math.random() * AUDIENCE_CUES_BY_GENRE.forro.length)]
  }

  return AUDIENCE_CUES_BY_GENRE.default[Math.floor(Math.random() * AUDIENCE_CUES_BY_GENRE.default.length)]
}

const selectStructure = (): string[] => {
  const structures = [
    { pattern: ["A", "B", "A", "B", "C", "B"], probability: 0.5 },
    { pattern: ["A", "B", "A", "B", "B"], probability: 0.25 },
    { pattern: ["A", "B", "B"], probability: 0.15 },
    { pattern: ["B", "A", "B", "C", "B"], probability: 0.1 },
  ]

  const random = Math.random()
  let cumulative = 0

  for (const structure of structures) {
    cumulative += structure.probability
    if (random <= cumulative) {
      return structure.pattern
    }
  }

  return structures[0].pattern
}

const detectStructure = (lyrics: string): string[] => {
  const structure: string[] = []
  const lines = lyrics.split("\n")

  for (const line of lines) {
    if (line.match(/\[verse\s*1?\]/i) || line.match(/\[verso\s*1?\]/i)) {
      structure.push("A")
    } else if (line.match(/\[verse\s*2\]/i) || line.match(/\[verso\s*2\]/i)) {
      structure.push("A")
    } else if (line.match(/\[chorus\]/i) || line.match(/\[refrão\]/i)) {
      structure.push("B")
    } else if (line.match(/\[bridge\]/i) || line.match(/\[ponte\]/i)) {
      structure.push("C")
    }
  }

  return structure.length > 0 ? structure : ["A", "B", "A", "B", "C", "B"]
}

export function formatSertanejoPerformance(lyrics: string, genre: string, useRandomStructure = false): string {
  const lines = lyrics.split("\n")
  const formatted: string[] = []

  const structure = useRandomStructure ? selectStructure() : detectStructure(lyrics)

  let partACount = 0
  let partBCount = 0
  let hasInstrumentalSolo = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line.match(/\[verse\s*1?\]/i) || line.match(/\[verso\s*1?\]/i)) {
      partACount++
      const instrumentation = getInstrumentationByGenre("verse", genre)
      formatted.push(`[PART A - Verse 1 - ${instrumentation}]`)
      continue
    }

    if (line.match(/\[verse\s*2\]/i) || line.match(/\[verso\s*2\]/i)) {
      partACount++
      const instrumentation = getInstrumentationByGenre("verse", genre)
      formatted.push(`[PART A2 - Verse 2 - ${instrumentation}]`)
      continue
    }

    if (line.match(/\[chorus\]/i) || line.match(/\[refrão\]/i)) {
      partBCount++
      const instrumentation = getInstrumentationByGenre("chorus", genre)
      let label = "PART B - Chorus"
      if (partBCount >= 3) label = "PART B - Final Chorus"
      formatted.push(`[${label} - ${instrumentation}]`)
      continue
    }

    if (line.match(/\[bridge\]/i) || line.match(/\[ponte\]/i)) {
      const instrumentation = getInstrumentationByGenre("bridge", genre)
      formatted.push(`[PART C - Bridge - ${instrumentation}]`)
      continue
    }

    if (line.match(/\[outro\]/i) || line.match(/\[final\]/i)) {
      const instrumentation = getInstrumentationByGenre("outro", genre)
      formatted.push(`[OUTRO - ${instrumentation}]`)
      continue
    }

    // Adiciona linha de letra
    if (line && !line.startsWith("[") && !line.startsWith("(")) {
      formatted.push(line)

      // Adiciona elementos performáticos
      if (partBCount === 1 && Math.random() > 0.7) {
        const cue = getAudienceCueForGenre(genre)
        formatted.push(`(Audience: "${cue}")`)
      }

      if (partBCount === 2 && Math.random() > 0.8) {
        const action = PERFORMANCE_ACTIONS[Math.floor(Math.random() * PERFORMANCE_ACTIONS.length)]
        formatted.push(`(Performance: ${action})`)
      }

      if (partBCount >= 3 && line.includes("!") && Math.random() > 0.6) {
        const words = line.split(" ")
        if (words.length >= 3) {
          const backingVocal = words.slice(-3).join(" ")
          formatted.push(`(Back vocal: "${backingVocal}")`)
        }
      }

      if (line.match(/\[bridge\]/i) && Math.random() > 0.7) {
        const dynamics = ["slowly builds tension", "whispered", "with intensity", "pause"]
        const dynamic = dynamics[Math.floor(Math.random() * dynamics.length)]
        formatted.push(`(${dynamic})`)
      }
    } else if (line) {
      formatted.push(line)
    }

    // Adiciona solo instrumental após a ponte
    const lowerGenre = genre.toLowerCase()
    const shouldAddSolo = !lowerGenre.includes("gospel")

    if (shouldAddSolo && line.match(/\[bridge\]/i) && i < lines.length - 1 && !hasInstrumentalSolo) {
      const nextLine = lines[i + 1]?.trim()
      if (nextLine && (nextLine.match(/\[chorus\]/i) || nextLine.match(/\[refrão\]/i))) {
        formatted.push("")

        let soloInstrument = "accordion"
        if (lowerGenre.includes("funk")) soloInstrument = "synth"
        else if (lowerGenre.includes("forró") || lowerGenre.includes("forro")) soloInstrument = "sanfona"
        else if (lowerGenre.includes("raiz")) soloInstrument = "viola caipira"

        formatted.push(
          `[INSTRUMENTAL SOLO - Energetic ${soloInstrument} solo for 16 seconds; full band returns with power, drums and bass lock into a tight groove]`,
        )
        formatted.push("")
        hasInstrumentalSolo = true
      }
    }
  }

  const structureNote = `\n\n[ESTRUTURA: ${structure.join("-")} | PART A = Verso, PART B = Refrão, PART C = Ponte]`
  return formatted.join("\n") + structureNote
}

/**
 * Verifica se deve usar formato de performance (expandido para múltiplos gêneros)
 */
export function shouldUsePerformanceFormat(genre: string, performanceMode?: string): boolean {
  const performaticGenres = [
    "sertanejo moderno feminino",
    "sertanejo moderno masculino",
    "funk",
    "mpb",
    "pagode",
    "arrocha",
    "forró",
    "gospel",
    "bachata",
  ]

  const genreLower = genre.toLowerCase()
  const isPerformaticGenre = performaticGenres.some((g) => genreLower.includes(g))

  return isPerformaticGenre && performanceMode === "performance"
}
