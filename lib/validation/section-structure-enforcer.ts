import { getGenreConfig } from "../genre-config"

/**
 * Enforces correct number of lines per section based on genre rules
 */
export function enforceSectionStructure(lyrics: string, genre: string): string {
  const config = getGenreConfig(genre)
  const lines = lyrics.split(/\r?\n/)
  const result: string[] = []

  let currentSection: string | null = null
  let currentSectionLines: string[] = []

  const isHeading = (line: string) => {
    // Match both English and Portuguese section headers with or without ###
    return /^\s*#{0,3}\s*\[(?:INTRO|PART\s+[ABC]\d*|VERSE|VERSO|PRE-?CHORUS|PRÉ-REFRÃO|CHORUS|REFRÃO|FINAL\s+CHORUS|BRIDGE|PONTE|SOLO|OUTRO|Instrumental)/i.test(
      line,
    )
  }

  const getSectionType = (heading: string): string => {
    const upper = heading.toUpperCase()
    if (upper.includes("INTRO")) return "intro"
    if (upper.includes("VERSE") || upper.includes("VERSO") || upper.includes("PART A")) return "verse"
    if (upper.includes("PRE") || upper.includes("PRÉ")) return "pre-chorus"
    if (upper.includes("CHORUS") || upper.includes("REFRÃO") || upper.includes("PART B")) return "chorus"
    if (upper.includes("BRIDGE") || upper.includes("PONTE") || upper.includes("PART C")) return "bridge"
    if (upper.includes("OUTRO")) return "outro"
    if (upper.includes("SOLO") || upper.includes("Instrumental")) return "instrumental"
    return "unknown"
  }

  const getMaxLines = (sectionType: string): number => {
    switch (sectionType) {
      case "intro":
        return 4
      case "verse":
        const verseLines = config.structure_rules.verse.lines
        if (typeof verseLines === "string" && verseLines.includes("-")) {
          return Number.parseInt(verseLines.split("-")[1] || "4")
        }
        return typeof verseLines === "number" ? verseLines : 4
      case "pre-chorus":
        return 4
      case "chorus":
        const chorusOptions: readonly number[] = config.structure_rules.chorus.lines_options
        return Math.max(...chorusOptions)
      case "bridge":
        if ("bridge" in config.structure_rules) {
          const bridgeConfig = config.structure_rules.bridge as any
          return bridgeConfig.lines_max || bridgeConfig.lines_min || 4
        }
        return 4
      case "outro":
        return 4
      case "instrumental":
        return 1
      default:
        return 4
    }
  }

  const processSection = () => {
    if (currentSection && currentSectionLines.length > 0) {
      const sectionType = getSectionType(currentSection)
      const maxLines = getMaxLines(sectionType)

      // Filter out empty lines
      const contentLines = currentSectionLines.filter((l) => l.trim() !== "")

      // Enforce max lines
      let finalLines = contentLines
      if (contentLines.length > maxLines) {
        console.log(`[v0] ✂️ Section ${currentSection.trim()} has ${contentLines.length} lines, trimming to ${maxLines}`)
        finalLines = contentLines.slice(0, maxLines)
      }

      // Add section heading
      result.push(currentSection)
      // Add content lines
      result.push(...finalLines)
      // Add blank line after section
      result.push("")
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] || ""

    if (isHeading(line)) {
      // Process previous section
      processSection()

      // Start new section
      currentSection = line
      currentSectionLines = []
    } else if (currentSection) {
      // Add line to current section (skip empty lines at start)
      if (line.trim() !== "" || currentSectionLines.length > 0) {
        currentSectionLines.push(line)
      }
    } else {
      // Line before any section (keep it)
      if (line.trim() !== "") {
        result.push(line)
      }
    }
  }

  // Process last section
  processSection()

  return result.join("\n").trim()
}

/**
 * Validates that sections have the correct number of lines
 */
export function validateSectionStructure(
  lyrics: string,
  genre: string,
): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const config = getGenreConfig(genre)
  const lines = lyrics.split(/\r?\n/)
  const errors: string[] = []
  const warnings: string[] = []

  let currentSection: string | null = null
  let currentSectionLines: string[] = []

  const isHeading = (line: string) => {
    return /^\s*#{0,3}\s*\[(?:INTRO|PART\s+[ABC]\d*|VERSE|VERSO|PRE-?CHORUS|PRÉ-REFRÃO|CHORUS|REFRÃO|FINAL\s+CHORUS|BRIDGE|PONTE|SOLO|OUTRO|Instrumental)/i.test(
      line,
    )
  }

  const getSectionType = (heading: string): string => {
    const upper = heading.toUpperCase()
    if (upper.includes("INTRO")) return "intro"
    if (upper.includes("VERSE") || upper.includes("VERSO") || upper.includes("PART A")) return "verse"
    if (upper.includes("PRE") || upper.includes("PRÉ")) return "pre-chorus"
    if (upper.includes("CHORUS") || upper.includes("REFRÃO") || upper.includes("PART B")) return "chorus"
    if (upper.includes("BRIDGE") || upper.includes("PONTE") || upper.includes("PART C")) return "bridge"
    if (upper.includes("OUTRO")) return "outro"
    return "unknown"
  }

  const validateSection = () => {
    if (currentSection && currentSectionLines.length > 0) {
      const sectionType = getSectionType(currentSection)
      const contentLines = currentSectionLines.filter((l) => l.trim() !== "")

      if (sectionType === "verse") {
        const verseLines = config.structure_rules.verse.lines
        const expected = typeof verseLines === "string" ? verseLines : String(verseLines)
        if (expected.includes("-")) {
          const [min, max] = expected.split("-").map(Number)
          if (contentLines.length < min || contentLines.length > max) {
            warnings.push(`${currentSection}: tem ${contentLines.length} linhas (esperado ${expected})`)
          }
        } else {
          const expectedNum = Number.parseInt(expected)
          if (contentLines.length !== expectedNum) {
            warnings.push(`${currentSection}: tem ${contentLines.length} linhas (esperado ${expectedNum})`)
          }
        }
      } else if (sectionType === "chorus") {
        const chorusOptions: readonly number[] = config.structure_rules.chorus.lines_options
        if (!chorusOptions.includes(contentLines.length)) {
          errors.push(`${currentSection}: tem ${contentLines.length} linhas (esperado ${chorusOptions.join(" ou ")})`)
        }
      }
    }
  }

  for (const line of lines) {
    if (isHeading(line)) {
      validateSection()
      currentSection = line
      currentSectionLines = []
    } else if (currentSection) {
      currentSectionLines.push(line)
    }
  }

  validateSection()

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}
