/**
 * FORMATADOR DE PERFORMANCE PARA MÚSICA BRASILEIRA MODERNA
 * Adiciona instruções detalhadas de performance, instrumentação e dinâmica
 * Compatível com Sertanejo, Funk, MPB e outros gêneros performáticos
 */

interface PerformanceInstruction {
  section: string
  description: string
}

const SERTANEJO_PERFORMANCE_INSTRUCTIONS: Record<string, PerformanceInstruction> = {
  intro: {
    section: "INTRO",
    description: "Rhythmic guitar and accordion intro",
  },
  verse1: {
    section: "PART A - Verse 1",
    description: "Male vocal starts, light percussion",
  },
  verse2: {
    section: "PART A2 - Verse 2",
    description: "Conversational tone, bass and accordion more present",
  },
  chorus1: {
    section: "PART B - Chorus",
    description: "Full band enters, energetic sertanejo beat",
  },
  chorus2: {
    section: "PART B - Chorus",
    description: "Full band, energetic sertanejo beat",
  },
  chorusFinal: {
    section: "PART B - FINAL Chorus",
    description: "Explosive, full band energy",
  },
  bridge: {
    section: "PART C - Bridge",
    description: "Softer feel, accordion and acoustic guitar",
  },
  outro: {
    section: "OUTRO",
    description: "Instruments fade, vocal ad-libs",
  },
}

const AUDIENCE_CUES = ["Aôôô potência!", "É nóis!", "Véio!", "Bicho!", "Tá ligado!", "Vai!", "Isso aí!"]

const PERFORMANCE_ACTIONS = [
  "Vocalist points to the crowd, smiling",
  "Vocalist raises fist in the air",
  "Vocalist walks to stage edge, engaging crowd",
  "Vocalist claps hands, encouraging participation",
  "Vocalist closes eyes, feeling the emotion",
]

const getInstrumentation = (sectionType: string, genre: string): string => {
  const lowerGenre = genre.toLowerCase()
  if (lowerGenre.includes("raiz")) {
    return sectionType === "chorus"
      ? "viola caipira, acoustic guitar, sanfona"
      : "viola caipira, acoustic guitar, light bass"
  }

  // Padrão para outros subgêneros (universitário, moderno etc.)
  return sectionType === "chorus"
    ? "electric guitar, drums, bass, accordion"
    : "acoustic guitar, bass, light percussion"
}

function selectStructure(): string[] {
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

function detectStructure(lyrics: string): string[] {
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

export function formatSertanejoPerformance(lyrics: string, genre: string): string {
  const lines = lyrics.split("\n")
  const formatted: string[] = []

  let partACount = 0
  let partBCount = 0
  let hasIntro = false
  let hasInstrumentalSolo = false
  let inSection = false

  if (!lyrics.match(/\[intro\]/i)) {
    formatted.push(
      `[${SERTANEJO_PERFORMANCE_INSTRUCTIONS.intro.section} - ${SERTANEJO_PERFORMANCE_INSTRUCTIONS.intro.description}]`,
    )
    formatted.push("")
    hasIntro = true
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line.match(/\[intro\]/i)) {
      formatted.push(
        `[${SERTANEJO_PERFORMANCE_INSTRUCTIONS.intro.section} - ${SERTANEJO_PERFORMANCE_INSTRUCTIONS.intro.description}]`,
      )
      hasIntro = true
      continue
    }

    if (line.match(/\[verse\s*1?\]/i) || line.match(/\[verso\s*1?\]/i)) {
      partACount++
      formatted.push(
        `[${SERTANEJO_PERFORMANCE_INSTRUCTIONS.verse1.section} - ${SERTANEJO_PERFORMANCE_INSTRUCTIONS.verse1.description}]`,
      )
      inSection = true
      continue
    }

    if (line.match(/\[verse\s*2\]/i) || line.match(/\[verso\s*2\]/i)) {
      partACount++
      formatted.push("")
      formatted.push(
        `[${SERTANEJO_PERFORMANCE_INSTRUCTIONS.verse2.section} - ${SERTANEJO_PERFORMANCE_INSTRUCTIONS.verse2.description}]`,
      )
      inSection = true
      continue
    }

    if (line.match(/\[chorus\]/i) || line.match(/\[refrão\]/i)) {
      partBCount++
      formatted.push("")
      let instruction: PerformanceInstruction
      if (partBCount === 1) {
        instruction = SERTANEJO_PERFORMANCE_INSTRUCTIONS.chorus1
      } else if (partBCount >= 3) {
        instruction = SERTANEJO_PERFORMANCE_INSTRUCTIONS.chorusFinal
      } else {
        instruction = SERTANEJO_PERFORMANCE_INSTRUCTIONS.chorus2
      }
      formatted.push(`[${instruction.section} - ${instruction.description}]`)
      inSection = true
      continue
    }

    if (line.match(/\[bridge\]/i) || line.match(/\[ponte\]/i)) {
      formatted.push("")
      formatted.push(
        `[${SERTANEJO_PERFORMANCE_INSTRUCTIONS.bridge.section} - ${SERTANEJO_PERFORMANCE_INSTRUCTIONS.bridge.description}]`,
      )
      inSection = true
      continue
    }

    if (line.match(/\[outro\]/i) || line.match(/\[final\]/i)) {
      formatted.push("")
      formatted.push(
        `[${SERTANEJO_PERFORMANCE_INSTRUCTIONS.outro.section} - ${SERTANEJO_PERFORMANCE_INSTRUCTIONS.outro.description}]`,
      )
      inSection = true
      continue
    }

    // Add lyrics lines
    if (line && !line.startsWith("[") && !line.startsWith("(")) {
      formatted.push(line)
    } else if (line.startsWith("[") || line.startsWith("(")) {
      formatted.push(line)
    }

    if (line.match(/\[bridge\]/i) && !hasInstrumentalSolo) {
      // Look ahead to see if there's a final chorus coming
      const remainingLines = lines.slice(i + 1)
      const hasChorusAhead = remainingLines.some((l) => l.match(/\[chorus\]/i) || l.match(/\[refrão\]/i))

      if (hasChorusAhead) {
        // Skip empty lines after bridge
        let j = i + 1
        while (j < lines.length && !lines[j].trim()) {
          j++
        }
        // Add instrumental solo before next section
        formatted.push("")
        formatted.push("[Instrumental solo: solo de acordeão/guitarra, 12s]")
        formatted.push("")
        hasInstrumentalSolo = true
      }
    }
  }

  if (!lyrics.match(/\[outro\]/i) && !lyrics.match(/\[final\]/i)) {
    formatted.push("")
    formatted.push(
      `[${SERTANEJO_PERFORMANCE_INSTRUCTIONS.outro.section} - ${SERTANEJO_PERFORMANCE_INSTRUCTIONS.outro.description}]`,
    )
  }

  return formatted.join("\n")
}

/**
 * Verifica se deve usar formato de performance PART A/B/C (apenas Sertanejo Moderno)
 */
export function shouldUsePerformanceFormat(genre: string, performanceMode?: string): boolean {
  const genreLower = genre.toLowerCase()
  return genreLower.includes("sertanejo moderno") && performanceMode === "performance"
}
