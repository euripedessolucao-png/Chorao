// Tipos
export type SectionType = "intro" | "verse" | "chorus" | "bridge" | "outro"

export interface ParsedSection {
  type: SectionType
  lines: string[]
  raw: string
}

// Mapeamento de rótulos para tipos
const SECTION_LABELS: Record<string, SectionType> = {
  INTRO: "intro",
  VERSE: "verse",
  "PART A": "verse",
  "PART A2": "verse",
  CHORUS: "chorus",
  "PART B": "chorus",
  BRIDGE: "bridge",
  "PART C": "bridge",
  OUTRO: "outro",
}

// Regex principal: detecta blocos como [CHORUS], [PART A – Verse 1], etc.
const SECTION_REGEX = /\[(.*?)\][\s\S]*?(?=\n\[|$)/g

export function parseLyricSections(lyricText: string): ParsedSection[] {
  const sections: ParsedSection[] = []
  const matches = [...lyricText.matchAll(SECTION_REGEX)]

  for (const match of matches) {
    const fullBlock = match[0].trim()
    const header = match[1].trim()
    const content = fullBlock
      .replace(/\[.*?\]/, "")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("(") && !line.match(/^[A-G][#b]?m?7?$/))

    // Detecta tipo pela label
    let type: SectionType | null = null
    for (const [label, sectionType] of Object.entries(SECTION_LABELS)) {
      if (header.toUpperCase().includes(label)) {
        type = sectionType
        break
      }
    }

    if (type && content.length > 0) {
      sections.push({ type, lines: content, raw: fullBlock })
    }
  }

  return sections
}

// Parser para refrões (ex: [REFRÃO 1] ... [REFRÃO 2] ...)
export interface ChorusOption {
  id: number
  lines: string[]
}

export function parseChorusOptions(text: string): ChorusOption[] {
  const chorusRegex = /\[REFRÃO\s*(\d+)\][\s\S]*?(?=\[REFRÃO|\n*$)/g
  const matches = [...text.matchAll(chorusRegex)]

  return matches.map((match, index) => ({
    id: Number.parseInt(match[1]) || index + 1,
    lines: match[0]
      .replace(/\[REFRÃO\s*\d+\]/, "")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l),
  }))
}
