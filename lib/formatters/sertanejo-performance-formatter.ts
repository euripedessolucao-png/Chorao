/**
 * FORMATADOR DE PERFORMANCE PARA SERTANEJO MODERNO
 * Adiciona instruções detalhadas de performance, instrumentação e dinâmica
 */

interface PerformanceInstruction {
  section: string
  instrumentation: string
  dynamics: string
  vocalStyle: string
}

const PERFORMANCE_INSTRUCTIONS: Record<string, PerformanceInstruction> = {
  verse1: {
    section: "PART A - Verse 1",
    instrumentation: "Solo voice with firm confidence; acoustic guitar and bass marking the vaneira rhythm",
    dynamics: "moderate",
    vocalStyle: "confident, storytelling",
  },
  verse2: {
    section: "PART A2 - Verse 2",
    instrumentation: "Music softens slightly, letting the lyrics cut through with attitude",
    dynamics: "moderate with attitude",
    vocalStyle: "direct, with edge",
  },
  chorus1: {
    section: "PART B - Chorus",
    instrumentation: "All instruments enter with full force; drums drive a danceable beat, accordion leads",
    dynamics: "full energy",
    vocalStyle: "passionate, powerful",
  },
  chorus2: {
    section: "PART B - Chorus",
    instrumentation: "Music explodes back with even more energy; vocalist sings with passion and defiance",
    dynamics: "maximum energy",
    vocalStyle: "defiant, celebratory",
  },
  chorusFinal: {
    section: "PART B - Final Chorus",
    instrumentation: "Maximum energy, vocalist ad-libs over the top, crowd sings along loudly",
    dynamics: "explosive",
    vocalStyle: "triumphant, interactive",
  },
  bridge: {
    section: "PART C - Bridge",
    instrumentation: "Dramatic pause; just a soft acoustic guitar arpeggio and a sustained accordion note remain",
    dynamics: "minimal, building tension",
    vocalStyle: "emotional, building",
  },
  outro: {
    section: "OUTRO",
    instrumentation: "Instruments begin to fade, leaving the accordion and the hook echoing",
    dynamics: "fading",
    vocalStyle: "soft, reflective",
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

/**
 * Seleciona uma estrutura aleatória baseada nas probabilidades
 */
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

  return structures[0].pattern // fallback
}

/**
 * Detecta a estrutura da letra baseada nas seções presentes
 */
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

/**
 * Formata letra de sertanejo moderno com instruções de performance
 * e estrutura PART A, PART B, PART C
 */
export function formatSertanejoPerformance(lyrics: string, useRandomStructure = false): string {
  const lines = lyrics.split("\n")
  const formatted: string[] = []

  const structure = useRandomStructure ? selectStructure() : detectStructure(lyrics)

  let currentSection = ""
  let partACount = 0
  let partBCount = 0
  let hasPartC = false
  let hasInstrumentalSolo = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line.match(/\[verse\s*1?\]/i) || line.match(/\[verso\s*1?\]/i)) {
      partACount++
      currentSection = "verse1"
      const instruction = PERFORMANCE_INSTRUCTIONS.verse1
      // Substitui "Verse 1" por "PART A - Verse 1"
      formatted.push(`[PART A - Verse 1 - ${instruction.instrumentation}]`)
      continue
    }

    if (line.match(/\[verse\s*2\]/i) || line.match(/\[verso\s*2\]/i)) {
      partACount++
      currentSection = "verse2"
      const instruction = PERFORMANCE_INSTRUCTIONS.verse2
      // Substitui "Verse 2" por "PART A2 - Verse 2"
      formatted.push(`[PART A2 - Verse 2 - ${instruction.instrumentation}]`)
      continue
    }

    if (line.match(/\[chorus\]/i) || line.match(/\[refrão\]/i)) {
      partBCount++

      if (partBCount === 1) {
        currentSection = "chorus1"
        const instruction = PERFORMANCE_INSTRUCTIONS.chorus1
        formatted.push(`[PART B - Chorus - ${instruction.instrumentation}]`)
      } else if (partBCount === 2) {
        currentSection = "chorus2"
        const instruction = PERFORMANCE_INSTRUCTIONS.chorus2
        formatted.push(`[PART B - Chorus - ${instruction.instrumentation}]`)
      } else {
        currentSection = "chorusFinal"
        const instruction = PERFORMANCE_INSTRUCTIONS.chorusFinal
        formatted.push(`[PART B - Final Chorus - ${instruction.instrumentation}]`)
      }
      continue
    }

    if (line.match(/\[bridge\]/i) || line.match(/\[ponte\]/i)) {
      hasPartC = true
      currentSection = "bridge"
      const instruction = PERFORMANCE_INSTRUCTIONS.bridge
      // Substitui "Bridge" por "PART C - Bridge"
      formatted.push(`[PART C - Bridge - ${instruction.instrumentation}]`)
      continue
    }

    if (line.match(/\[outro\]/i) || line.match(/\[final\]/i)) {
      currentSection = "outro"
      const instruction = PERFORMANCE_INSTRUCTIONS.outro
      formatted.push(`[${instruction.section} - ${instruction.instrumentation}]`)
      continue
    }

    // Adiciona linha de letra
    if (line && !line.startsWith("[") && !line.startsWith("(")) {
      formatted.push(line)

      // Adiciona audience cue no primeiro refrão
      if (currentSection === "chorus1" && formatted.length > 2 && Math.random() > 0.7) {
        const cue = AUDIENCE_CUES[Math.floor(Math.random() * AUDIENCE_CUES.length)]
        formatted.push(`(Audience: "${cue}")`)
      }

      // Adiciona performance action no segundo refrão
      if (currentSection === "chorus2" && formatted.length > 2 && Math.random() > 0.8) {
        const action = PERFORMANCE_ACTIONS[Math.floor(Math.random() * PERFORMANCE_ACTIONS.length)]
        formatted.push(`(Performance: ${action})`)
      }

      // Adiciona backing vocal no refrão final
      if (currentSection === "chorusFinal" && line.includes("!") && Math.random() > 0.6) {
        // Extrai parte da linha para backing vocal
        const words = line.split(" ")
        if (words.length >= 3) {
          const backingVocal = words.slice(-3).join(" ")
          formatted.push(`(Back vocal: "${backingVocal}")`)
        }
      }

      // Adiciona dinâmica na ponte
      if (currentSection === "bridge" && Math.random() > 0.7) {
        const dynamics = ["slowly builds tension", "whispered", "with intensity", "pause"]
        const dynamic = dynamics[Math.floor(Math.random() * dynamics.length)]
        formatted.push(`(${dynamic})`)
      }
    } else if (line) {
      formatted.push(line)
    }

    // Adiciona solo instrumental após a ponte
    if (currentSection === "bridge" && i < lines.length - 1 && !hasInstrumentalSolo) {
      const nextLine = lines[i + 1]?.trim()
      if (nextLine && (nextLine.match(/\[chorus\]/i) || nextLine.match(/\[refrão\]/i))) {
        formatted.push("")
        formatted.push(
          "[INSTRUMENTAL SOLO - Energetic accordion solo for 16 seconds; full band returns with power, drums and bass lock into a tight groove]",
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
 * Verifica se a letra deve usar formato de performance
 */
export function shouldUsePerformanceFormat(genre: string, performanceMode?: string): boolean {
  return (
    (genre.toLowerCase().includes("sertanejo") || genre.toLowerCase().includes("moderno")) &&
    performanceMode === "performance"
  )
}
