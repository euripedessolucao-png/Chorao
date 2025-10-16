export interface StructureValidationResult {
  valid: boolean
  issues: string[]
  structure: SectionAnalysis[]
  recommendations: string[]
}

export interface SectionAnalysis {
  section: string
  lines: number
  stacking: "CORRETO" | "PROBLEMA"
  expectedLines: string
}

export function validateBrazilianStructure(lyrics: string, genre = "Sertanejo"): StructureValidationResult {
  const sections = lyrics.split(/\n\s*\n/)
  const issues: string[] = []
  const recommendations: string[] = []
  const structure: SectionAnalysis[] = []

  for (const section of sections) {
    const lines = section.split("\n").filter((line) => line.trim())

    if (lines.length === 0) continue

    const sectionName = lines[0].trim()
    const sectionNameLower = sectionName.toLowerCase()

    // Filter out instruction lines and metadata
    const verseLines = lines.slice(1).filter((line) => {
      const trimmed = line.trim()
      return (
        trimmed &&
        !trimmed.toLowerCase().includes("instrução:") &&
        !trimmed.toLowerCase().includes("instruction:") &&
        !trimmed.startsWith("(") &&
        !trimmed.startsWith("[") &&
        !trimmed.toLowerCase().includes("instrumentos:") &&
        !trimmed.toLowerCase().includes("bpm:")
      )
    })

    let expectedLines = ""
    let hasIssue = false

    // Validate VERSE structure
    if (sectionNameLower.includes("verso") || sectionNameLower.includes("verse")) {
      expectedLines = "6-8 linhas"

      if (verseLines.length < 6) {
        issues.push(`${sectionName}: muito curto com ${verseLines.length} linhas (mínimo 6)`)
        hasIssue = true
      } else if (verseLines.length > 8) {
        recommendations.push(`${sectionName}: ${verseLines.length} linhas (ideal 6-8)`)
      }

      // Check if verses are properly stacked (not joined)
      const hasStackingIssues = verseLines.some((line) => {
        const words = line.split(/\s+/).filter((w) => w.length > 2)
        // If line has more than 12 words, likely has 2 verses joined
        return words.length > 12
      })

      if (hasStackingIssues) {
        issues.push(`${sectionName}: VERSOS NÃO EMPILHADOS - detectado 2 versos na mesma linha`)
        hasIssue = true
      }
    }

    // Validate CHORUS structure
    if (sectionNameLower.includes("refrão") || sectionNameLower.includes("chorus")) {
      expectedLines = "4 linhas (PADRÃO OURO)"

      if (verseLines.length !== 4) {
        issues.push(`${sectionName}: ${verseLines.length} linhas (deve ter EXATAMENTE 4)`)
        hasIssue = true
      }
    }

    // Validate PRE-CHORUS structure
    if (sectionNameLower.includes("pré-refrão") || sectionNameLower.includes("pre-chorus")) {
      expectedLines = "2-4 linhas"

      if (verseLines.length < 2) {
        issues.push(`${sectionName}: muito curto com ${verseLines.length} linhas (mínimo 2)`)
        hasIssue = true
      } else if (verseLines.length > 4) {
        issues.push(`${sectionName}: muito longo com ${verseLines.length} linhas (máximo 4)`)
        hasIssue = true
      }
    }

    // Validate BRIDGE structure
    if (sectionNameLower.includes("ponte") || sectionNameLower.includes("bridge")) {
      expectedLines = "4-6 linhas"

      if (verseLines.length < 4) {
        issues.push(`${sectionName}: muito curto com ${verseLines.length} linhas (mínimo 4)`)
        hasIssue = true
      } else if (verseLines.length > 6) {
        recommendations.push(`${sectionName}: ${verseLines.length} linhas (ideal 4-6)`)
      }
    }

    // Check stacking quality for all sections
    const stackingQuality = verseLines.every((line) => {
      const words = line.split(/\s+/).filter((w) => w.length > 2)
      return words.length <= 12
    })

    structure.push({
      section: sectionName,
      lines: verseLines.length,
      stacking: stackingQuality ? "CORRETO" : "PROBLEMA",
      expectedLines,
    })
  }

  return {
    valid: issues.length === 0,
    issues,
    structure,
    recommendations,
  }
}

export function analyzeLineStacking(line: string): { isStacked: boolean; reason: string } {
  const words = line.split(/\s+/).filter((w) => w.length > 2)

  // If line has more than 12 significant words, likely has 2 verses
  if (words.length > 12) {
    return {
      isStacked: false,
      reason: `Linha muito longa (${words.length} palavras) - provavelmente 2 versos juntos`,
    }
  }

  // Check for multiple complete thoughts (indicated by punctuation)
  const hasMultipleThoughts = (line.match(/[,;]/g) || []).length > 2
  if (hasMultipleThoughts && words.length > 10) {
    return {
      isStacked: false,
      reason: "Múltiplos pensamentos completos na mesma linha",
    }
  }

  return {
    isStacked: true,
    reason: "Empilhamento correto",
  }
}
