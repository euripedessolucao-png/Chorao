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
  let currentSectionStart = 0

  const isHeading = (line: string) => {
    return /^\s*\[(?:INTRO|PART\s+[ABC]\d*|VERSE|PRE-?CHORUS|PRÉ-REFRÃO|CHORUS|REFRÃO|FINAL\s+CHORUS|BRIDGE|SOLO|OUTRO|Instrumental)/i.test(
      line,
    )
  }

  const getSectionType = (heading: string): string => {
    if (/INTRO/i.test(heading)) return "intro"
    if (/VERSE|PART\s+A/i.test(heading)) return "verse"
    if (/PRE-?CHORUS|PRÉ-REFRÃO/i.test(heading)) return "pre-chorus"
    if (/CHORUS|REFRÃO/i.test(heading)) return "chorus"
    if (/BRIDGE|PART\s+C/i.test(heading)) return "bridge"
    if (/OUTRO/i.test(heading)) return "outro"
    if (/SOLO|Instrumental/i.test(heading)) return "instrumental"
    return "unknown"
  }

  const getMaxLines = (sectionType: string): number => {
    switch (sectionType) {
      case "intro":
        return 4 // Intro should be short
      case "verse":
        // Parse "4-5" or just "4"
        const verseLines = config.structure_rules.verse.lines
        if (typeof verseLines === "string" && verseLines.includes("-")) {
          return Number.parseInt(verseLines.split("-")[1] || "5")
        }
        return typeof verseLines === "number" ? verseLines : 5
      case "pre-chorus":
        return 4 // Pre-chorus should be 2-4 lines
      case "chorus":
        // Get max from lines_options
        const chorusOptions = config.structure_rules.chorus.lines_options
        return Math.max(...chorusOptions)
      case "bridge":
        // Get max from bridge config
        if ("bridge" in config.structure_rules) {
          const bridgeConfig = config.structure_rules.bridge as any
          return bridgeConfig.lines_max || bridgeConfig.lines_min || 4
        }
        return 4
      case "outro":
        return 4
      case "instrumental":
        return 1 // Just the description
      default:
        return 5
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
        console.log(`[v0] Section ${currentSection} has ${contentLines.length} lines, trimming to ${maxLines}`)
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
      currentSectionStart = i
    } else if (currentSection) {
      // Add line to current section
      currentSectionLines.push(line)
    } else {
      // Line before any section (shouldn't happen, but keep it)
      result.push(line)
    }
  }

  // Process last section
  processSection()

  return result.join("\n")
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
    return /^\s*\[(?:INTRO|PART\s+[ABC]\d*|VERSE|PRE-?CHORUS|PRÉ-REFRÃO|CHORUS|REFRÃO|FINAL\s+CHORUS|BRIDGE|SOLO|OUTRO|Instrumental)/i.test(
      line,
    )
  }

  const getSectionType = (heading: string): string => {
    if (/INTRO/i.test(heading)) return "intro"
    if (/VERSE|PART\s+A/i.test(heading)) return "verse"
    if (/PRE-?CHORUS|PRÉ-REFRÃO/i.test(heading)) return "pre-chorus"
    if (/CHORUS|REFRÃO/i.test(heading)) return "chorus"
    if (/BRIDGE|PART\s+C/i.test(heading)) return "bridge"
    if (/OUTRO/i.test(heading)) return "outro"
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
        const chorusOptions = config.structure_rules.chorus.lines_options
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
