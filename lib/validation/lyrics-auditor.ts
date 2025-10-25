// lib/validation/lyrics-auditor.ts

import { PunctuationValidator } from "./punctuation-validator"
import { validateAllLayers } from "./multi-layer-validator"
import { WordIntegrityValidator } from "./word-integrity-validator"
import { GENRE_CONFIGS } from "@/lib/genre-config" // ✅ Importa regras reais
import { countPoeticSyllables } from "@/lib/validation/syllable-counter-brasileiro" // ✅ Contador preciso

export class LyricsAuditor {
  // REMOVA: private static readonly ABSOLUTE_MAX_SYLLABLES = 11
  private static readonly MIN_APPROVAL_SCORE = 80

  static audit(lyrics: string, genre: string, theme: string): AuditResult {
    console.log(`[LyricsAuditor] 🔍 Auditando para gênero: ${genre}`)

    const errors: AuditError[] = []
    const warnings: AuditWarning[] = []
    let score = 100

    // ✅ Obtém métrica REAL do gênero
    const config = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS]
    let maxSyllables = 12 // fallback seguro
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

    // ✅ AUDITORIA 1: VALIDAÇÃO DE SÍLABAS POR GÊNERO (CRÍTICA)
    console.log(`[LyricsAuditor] 📏 Auditando sílabas (${minSyllables}-${maxSyllables})...`)
    const syllableErrors = this.validateSyllablesByGenre(lyrics, minSyllables, maxSyllables)

    if (syllableErrors.length > 0) {
      syllableErrors.forEach(error => {
        errors.push({
          type: "syllables",
          severity: "critical",
          message: error,
        })
      })
      score -= 30
      console.log(`[LyricsAuditor] ❌ FALHA CRÍTICA: ${syllableErrors.length} versos fora da métrica`)
    } else {
      console.log(`[LyricsAuditor] ✅ Métrica válida (${minSyllables}-${maxSyllables} sílabas)`)
    }

    // ... (mantenha as demais auditorias: pontuação, integridade, etc.) ...

    return {
      isApproved: score >= this.MIN_APPROVAL_SCORE && errors.filter(e => e.severity === "critical").length === 0,
      score,
      errors,
      warnings,
      mustRegenerate: errors.filter(e => e.severity === "critical").length > 0,
      canBeFixed: !errors.some(e => e.severity === "critical") && errors.length > 0,
    }
  }

  /**
   * VALIDA SÍLABAS USANDO MÉTRICA POR GÊNERO
   */
  private static validateSyllablesByGenre(lyrics: string, minSyllables: number, maxSyllables: number): string[] {
    const errors: string[] = []
    const lines = lyrics.split("\n").filter(line => 
      line.trim() && !line.startsWith("[") && !line.startsWith("(")
    )

    lines.forEach((line, index) => {
      const syllables = countPoeticSyllables(line)
      if (syllables < minSyllables || syllables > maxSyllables) {
        errors.push(`Linha ${index + 1}: ${syllables} sílabas (fora da faixa ${minSyllables}-${maxSyllables})`)
      }
    })

    return errors
  }

  // ... (mantenha validateStructure, validateNarrative, etc.) ...
}
