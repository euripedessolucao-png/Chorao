/**
 * FORMATADOR DE ESTRUTURA PERFORMÁTICA
 *
 * Converte letras para formato PART A/B/C com descrições instrumentais
 * conforme padrão do sertanejo moderno 2024-2025
 */

export interface PerformanceSection {
  part: string // "PART A", "PART B", "PART C"
  label: string // "Verse 1", "Chorus", "Bridge"
  instrumentation: string // Descrição instrumental
  lines: string[]
}

/**
 * Formata letra completa para estrutura performática
 */
export function formatToPerformanceStructure(
  lyrics: string,
  genre = "sertanejo",
  performanceMode: "standard" | "performance" = "performance",
): string {
  if (!lyrics || typeof lyrics !== "string") {
    console.error("[performance-formatter] ❌ ERRO: lyrics é undefined ou não é string:", lyrics)
    return lyrics || ""
  }

  if (performanceMode === "standard") {
    return lyrics // Retorna sem formatação performática
  }

  const sections = parseLyricsToSections(lyrics)
  const formattedSections = sections.map((section) => formatSection(section, genre))

  const instrumentList = getInstrumentList(genre)

  return `${formattedSections.join("\n\n")}\n\n${instrumentList}`
}

/**
 * Parseia letra em seções
 */
function parseLyricsToSections(lyrics: string): PerformanceSection[] {
  if (!lyrics || typeof lyrics !== "string") {
    console.error("[performance-formatter] ❌ ERRO: lyrics inválido em parseLyricsToSections:", lyrics)
    return []
  }

  const sections: PerformanceSection[] = []
  const lines = lyrics.split("\n")

  let currentSection: PerformanceSection | null = null
  let partACount = 0
  let partBCount = 0
  let hasIntro = false
  let hasOutro = false

  for (const line of lines) {
    const trimmed = line.trim()

    // Detecta cabeçalho de seção
    if (trimmed.match(/^\[.*\]$/)) {
      // Salva seção anterior
      if (currentSection && currentSection.lines.length > 0) {
        sections.push(currentSection)
      }

      // Cria nova seção
      const sectionType = detectSectionType(trimmed)
      currentSection = createSection(sectionType, partACount, partBCount, hasIntro, hasOutro)

      // Atualiza contadores
      if (sectionType === "verse") partACount++
      if (sectionType === "chorus") partBCount++
      if (sectionType === "intro") hasIntro = true
      if (sectionType === "outro") hasOutro = true
    } else if (currentSection && trimmed) {
      // Adiciona linha à seção atual
      currentSection.lines.push(trimmed)
    }
  }

  // Adiciona última seção
  if (currentSection && currentSection.lines.length > 0) {
    sections.push(currentSection)
  }

  return sections
}

/**
 * Detecta tipo de seção
 */
function detectSectionType(header: string): string {
  const lower = header.toLowerCase()

  if (lower.includes("intro")) return "intro"
  if (lower.includes("outro")) return "outro"
  if (lower.includes("verse") || lower.includes("verso")) return "verse"
  if (lower.includes("chorus") || lower.includes("refrão") || lower.includes("refrao")) return "chorus"
  if (lower.includes("bridge") || lower.includes("ponte")) return "bridge"
  if (lower.includes("pre") || lower.includes("pré")) return "pre_chorus"

  return "verse" // Default
}

/**
 * Cria seção com estrutura PART A/B/C
 */
function createSection(
  type: string,
  partACount: number,
  partBCount: number,
  hasIntro: boolean,
  hasOutro: boolean,
): PerformanceSection {
  switch (type) {
    case "intro":
      return {
        part: "INTRO",
        label: "Intro",
        instrumentation: "Rhythmic guitar and accordion intro",
        lines: [],
      }

    case "verse":
      const verseNumber = partACount + 1
      const verseLabel = verseNumber === 1 ? "Verse 1" : `Verse ${verseNumber}`
      const versePart = verseNumber === 1 ? "PART A" : `PART A${verseNumber}`

      return {
        part: versePart,
        label: verseLabel,
        instrumentation:
          verseNumber === 1
            ? "Male vocal starts, light percussion"
            : "Conversational tone, bass and accordion more present",
        lines: [],
      }

    case "chorus":
      const chorusNumber = partBCount + 1
      const chorusLabel = chorusNumber >= 3 ? "FINAL Chorus" : "Chorus"

      return {
        part: "PART B",
        label: chorusLabel,
        instrumentation: chorusNumber >= 3 ? "Explosive, full band energy" : "Full band enters, energetic beat",
        lines: [],
      }

    case "bridge":
      return {
        part: "PART C",
        label: "Bridge",
        instrumentation: "Softer feel, accordion and acoustic guitar",
        lines: [],
      }

    case "outro":
      return {
        part: "OUTRO",
        label: "Outro",
        instrumentation: "Instruments fade, vocal ad-libs",
        lines: [],
      }

    default:
      return {
        part: "PART A",
        label: "Verse",
        instrumentation: "Acoustic guitar and light percussion",
        lines: [],
      }
  }
}

/**
 * Formata seção individual
 */
function formatSection(section: PerformanceSection, genre: string): string {
  const header = `[${section.part} - ${section.label} - ${section.instrumentation}]`
  const content = section.lines.join("\n")

  return `${header}\n${content}`
}

/**
 * Adiciona solo instrumental entre ponte e refrão final
 */
export function addInstrumentalSolo(lyrics: string, genre = "sertanejo"): string {
  if (!lyrics || typeof lyrics !== "string") {
    console.error("[performance-formatter] ❌ ERRO: lyrics é undefined em addInstrumentalSolo:", lyrics)
    return lyrics || ""
  }

  // Detecta posição entre PART C e último PART B
  const lines = lyrics.split("\n")
  const result: string[] = []

  let foundBridge = false
  let addedSolo = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    result.push(line)

    // Detecta fim da ponte
    if (line.includes("PART C") && !foundBridge) {
      foundBridge = true
    }

    // Adiciona solo após a ponte, antes do refrão final
    if (foundBridge && !addedSolo && line.trim() === "") {
      const nextLine = lines[i + 1]
      if (nextLine && nextLine.includes("PART B") && nextLine.includes("FINAL")) {
        result.push("[Instrumental solo: accordion/guitar solo, 12s]")
        result.push("")
        addedSolo = true
      }
    }
  }

  return result.join("\n")
}

/**
 * Retorna lista de instrumentos usados por gênero
 */
function getInstrumentList(genre: string): string {
  const instruments: Record<string, string[]> = {
    sertanejo: [
      "Violão (Acoustic Guitar)",
      "Viola Caipira",
      "Sanfona (Accordion)",
      "Baixo (Bass)",
      "Bateria (Drums)",
      "Percussão (Percussion)",
      "Piano/Teclado (Keyboard)",
    ],
    funk: [
      "Bateria Eletrônica (Electronic Drums)",
      "Baixo 808 (808 Bass)",
      "Sintetizadores (Synthesizers)",
      "Samples",
      "Percussão (Percussion)",
    ],
    mpb: ["Violão (Acoustic Guitar)", "Baixo (Bass)", "Bateria (Drums)", "Piano", "Cordas (Strings)", "Sopros (Brass)"],
    pop: [
      "Guitarra (Guitar)",
      "Baixo (Bass)",
      "Bateria (Drums)",
      "Sintetizadores (Synthesizers)",
      "Piano/Teclado (Keyboard)",
    ],
    default: [
      "Violão (Acoustic Guitar)",
      "Baixo (Bass)",
      "Bateria (Drums)",
      "Teclado (Keyboard)",
      "Percussão (Percussion)",
    ],
  }

  const genreLower = genre.toLowerCase().replace(/\s+/g, "_")
  const genreInstruments = instruments[genreLower] || instruments.default

  return `---\n\nInstrumentos / Instruments:\n${genreInstruments.map((inst) => `- ${inst}`).join("\n")}`
}

export default {
  formatToPerformanceStructure,
  addInstrumentalSolo,
}
