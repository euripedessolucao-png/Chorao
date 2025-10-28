// lib/validation/lyrics-auditor.ts

import { PunctuationValidator } from "./punctuation-validator"
import { validateAllLayers } from "./multi-layer-validator"
import { WordIntegrityValidator } from "./word-integrity-validator"
import { GENRE_CONFIGS } from "@/lib/genre-config"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter-brasileiro"

// ✅ INTERFACES NO TOPO (obrigatório para TypeScript)
export interface AuditResult {
  isApproved: boolean
  score: number
  errors: AuditError[]
  warnings: AuditWarning[]
  mustRegenerate: boolean
  canBeFixed: boolean
}

export interface AuditError {
  type: "syllables" | "punctuation" | "grammar" | "narrative" | "structure"
  severity: "critical" | "high" | "medium"
  message: string
  lineNumber?: number
  line?: string
}

export interface AuditWarning {
  type: "style" | "rhyme" | "emotion" | "vocabulary"
  message: string
  suggestion?: string
}

// ✅ CLASSE EXPORTADA CORRETAMENTE
export class LyricsAuditor {
  private static readonly MIN_APPROVAL_SCORE = 80

  static audit(lyrics: string, genre: string, theme: string): AuditResult {
    console.log(`[LyricsAuditor] 🔍 Auditando para gênero: ${genre}`)

    const errors: AuditError[] = []
    const warnings: AuditWarning[] = []
    let score = 100

    // Obtém métrica REAL do gênero
    const config = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS]
    let maxSyllables = 12
    let minSyllables = 5

    if (config) {
      const rules = config.prosody_rules.syllable_count
      if ("absolute_max" in rules) {
        maxSyllables = rules.absolute_max
        minSyllables = Math.max(4, maxSyllables - 5)
      } else if ("without_comma" in rules) {
        maxSyllables = rules.without_comma.acceptable_up_to
        minSyllables = rules.without_comma.min
      }
    }

    // ✅ AUDITORIA 1: INTEGRIDADE DE PALAVRAS
    const wordIntegrityValidation = WordIntegrityValidator.validate(lyrics)
    if (!wordIntegrityValidation.isValid) {
      wordIntegrityValidation.errors.forEach((error) => {
        errors.push({
          type: "grammar",
          severity: "critical",
          message: error.suggestion
            ? `Palavra sem acento: "${error.word}" → "${error.suggestion}" (linha ${error.lineNumber})`
            : `Palavra incompleta: "${error.word}" (linha ${error.lineNumber})`,
          lineNumber: error.lineNumber,
          line: error.line,
        })
      })
      score -= 40
    }

    // ✅ AUDITORIA 2: SÍLABAS POR GÊNERO
    const syllableErrors = this.validateSyllablesByGenre(lyrics, minSyllables, maxSyllables)
    if (syllableErrors.length > 0) {
      syllableErrors.forEach((error) => {
        errors.push({
          type: "syllables",
          severity: "critical",
          message: error,
        })
      })
      score -= 30
    }

    // ✅ AUDITORIA 3: PONTUAÇÃO
    const punctuationValidation = PunctuationValidator.validate(lyrics)
    if (!punctuationValidation.isValid) {
      punctuationValidation.errors.forEach((error) => {
        errors.push({
          type: "punctuation",
          severity: "critical",
          message: error,
        })
      })
      score -= 20
    }

    if (punctuationValidation.warnings.length > 0) {
      punctuationValidation.warnings.forEach((warning) => {
        warnings.push({
          type: "style",
          message: warning,
        })
      })
    }

    // ✅ AUDITORIA 4: VALIDAÇÃO MULTI-CAMADAS
    const multiLayerValidation = validateAllLayers(lyrics, genre, theme)
    if (!multiLayerValidation.isValid) {
      multiLayerValidation.blockers.forEach((blocker) => {
        errors.push({
          type: "grammar",
          severity: "critical",
          message: blocker,
        })
      })
      score -= 25
    }

    const multiLayerScore = multiLayerValidation.overallScore
    if (multiLayerScore < 80) {
      score = Math.min(score, multiLayerScore)
    }

    // ✅ AUDITORIA 5: ESTRUTURA
    const structureValidation = this.validateStructure(lyrics)
    if (!structureValidation.isValid) {
      errors.push({
        type: "structure",
        severity: "medium",
        message: structureValidation.message,
      })
      score -= 10
    }

    // ✅ AUDITORIA 6: NARRATIVA
    const narrativeValidation = this.validateNarrative(lyrics, theme)
    if (!narrativeValidation.isValid) {
      errors.push({
        type: "narrative",
        severity: "medium",
        message: narrativeValidation.message,
      })
      score -= 10
    }

    // ✅ DECISÃO FINAL
    const isApproved = score >= this.MIN_APPROVAL_SCORE && errors.filter((e) => e.severity === "critical").length === 0
    const mustRegenerate = errors.filter((e) => e.severity === "critical").length > 0
    const canBeFixed = !mustRegenerate && errors.length > 0

    return {
      isApproved,
      score,
      errors,
      warnings,
      mustRegenerate,
      canBeFixed,
    }
  }

  private static validateSyllablesByGenre(lyrics: string, minSyllables: number, maxSyllables: number): string[] {
    const errors: string[] = []
    const lines = lyrics.split("\n").filter((line) => line.trim() && !line.startsWith("[") && !line.startsWith("("))

    lines.forEach((line, index) => {
      const syllables = countPoeticSyllables(line)
      if (syllables < minSyllables || syllables > maxSyllables) {
        errors.push(`Linha ${index + 1}: ${syllables} sílabas (fora da faixa ${minSyllables}-${maxSyllables})`)
      }
    })

    return errors
  }

  private static validateStructure(lyrics: string): { isValid: boolean; message: string } {
    const hasVerse = lyrics.includes("[VERSE") || lyrics.includes("[Verse")
    const hasChorus = lyrics.includes("[CHORUS") || lyrics.includes("[Chorus")

    if (!hasVerse) {
      return { isValid: false, message: "Letra sem versos identificados" }
    }
    if (!hasChorus) {
      return { isValid: false, message: "Letra sem refrão identificado" }
    }
    return { isValid: true, message: "Estrutura válida" }
  }

  private static validateNarrative(lyrics: string, theme: string): { isValid: boolean; message: string } {
    const lines = lyrics.split("\n").filter((line) => line.trim() && !line.startsWith("[") && !line.startsWith("("))
    if (lines.length < 8) {
      return { isValid: false, message: "Letra muito curta (mínimo 8 linhas)" }
    }
    const uniqueLines = new Set(lines.map((l) => l.trim().toLowerCase()))
    const repetitionRate = 1 - uniqueLines.size / lines.length
    if (repetitionRate > 0.5) {
      return { isValid: false, message: "Repetição excessiva de versos (mais de 50%)" }
    }
    return { isValid: true, message: "Narrativa coerente" }
  }
}
