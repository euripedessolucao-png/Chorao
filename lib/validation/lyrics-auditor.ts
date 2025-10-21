import { PunctuationValidator } from "./punctuation-validator"
import { validateAllLayers } from "./multi-layer-validator"
import { AbsoluteSyllableEnforcer } from "./absolute-syllable-enforcer"
import { WordIntegrityValidator } from "./word-integrity-validator"

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

/**
 * AUDITOR DE LETRAS - SISTEMA DE APROVAÇÃO RIGOROSO
 *
 * Uma letra só é aprovada se passar em TODAS as validações críticas:
 * 1. Máximo 11 sílabas por verso (BLOQUEANTE)
 * 2. Pontuação correta (BLOQUEANTE)
 * 3. Gramática válida (BLOQUEANTE)
 * 4. Narrativa coerente (IMPORTANTE)
 * 5. Estrutura adequada (IMPORTANTE)
 */
export class LyricsAuditor {
  private static readonly ABSOLUTE_MAX_SYLLABLES = 11
  private static readonly MIN_APPROVAL_SCORE = 80 // 80% para aprovar

  /**
   * AUDITA LETRA COMPLETA
   * Retorna se a letra está aprovada ou precisa ser regenerada/corrigida
   */
  static audit(lyrics: string, genre: string, theme: string): AuditResult {
    console.log("[LyricsAuditor] 🔍 Iniciando auditoria completa...")

    const errors: AuditError[] = []
    const warnings: AuditWarning[] = []
    let score = 100

    // ✅ AUDITORIA 0: INTEGRIDADE DE PALAVRAS (CRÍTICA - PRIMEIRA)
    console.log("[LyricsAuditor] 📝 Auditando integridade de palavras (CRÍTICO)...")
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
      score -= 40 // Penalidade SEVERA - palavras cortadas são inaceitáveis
      console.log(`[LyricsAuditor] ❌ FALHA CRÍTICA: ${wordIntegrityValidation.message}`)
    } else {
      console.log(`[LyricsAuditor] ✅ ${wordIntegrityValidation.message}`)
    }

    // ✅ AUDITORIA 1: VALIDAÇÃO ABSOLUTA DE 11 SÍLABAS (CRÍTICA)
    console.log("[LyricsAuditor] 📏 Auditando sílabas (CRÍTICO)...")
    const syllableValidation = AbsoluteSyllableEnforcer.validate(lyrics)

    if (!syllableValidation.isValid) {
      errors.push({
        type: "syllables",
        severity: "critical",
        message: syllableValidation.message,
      })
      score -= 30 // Penalidade severa
      console.log(`[LyricsAuditor] ❌ FALHA CRÍTICA: ${syllableValidation.message}`)
    } else {
      console.log(`[LyricsAuditor] ✅ ${syllableValidation.message}`)
    }

    // ✅ AUDITORIA 2: PONTUAÇÃO (CRÍTICA)
    console.log("[LyricsAuditor] ✏️ Auditando pontuação (CRÍTICO)...")
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
      console.log(`[LyricsAuditor] ❌ ${punctuationValidation.errors.length} erros de pontuação`)
    } else {
      console.log("[LyricsAuditor] ✅ Pontuação válida")
    }

    if (punctuationValidation.warnings.length > 0) {
      punctuationValidation.warnings.forEach((warning) => {
        warnings.push({
          type: "style",
          message: warning,
        })
      })
    }

    // ✅ AUDITORIA 3: VALIDAÇÃO MULTI-CAMADAS (CRÍTICA)
    console.log("[LyricsAuditor] 🔍 Auditando multi-camadas (CRÍTICO)...")
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
      console.log(`[LyricsAuditor] ❌ ${multiLayerValidation.blockers.length} bloqueadores críticos`)
    } else {
      console.log("[LyricsAuditor] ✅ Validação multi-camadas aprovada")
    }

    // Ajusta score baseado no score multi-camadas
    const multiLayerScore = multiLayerValidation.overallScore
    if (multiLayerScore < 80) {
      score = Math.min(score, multiLayerScore)
    }

    // ✅ AUDITORIA 4: ESTRUTURA (IMPORTANTE)
    console.log("[LyricsAuditor] 📐 Auditando estrutura...")
    const structureValidation = this.validateStructure(lyrics)

    if (!structureValidation.isValid) {
      errors.push({
        type: "structure",
        severity: "medium",
        message: structureValidation.message,
      })
      score -= 10
      console.log(`[LyricsAuditor] ⚠️ ${structureValidation.message}`)
    } else {
      console.log("[LyricsAuditor] ✅ Estrutura válida")
    }

    // ✅ AUDITORIA 5: NARRATIVA (IMPORTANTE)
    console.log("[LyricsAuditor] 📖 Auditando narrativa...")
    const narrativeValidation = this.validateNarrative(lyrics, theme)

    if (!narrativeValidation.isValid) {
      errors.push({
        type: "narrative",
        severity: "medium",
        message: narrativeValidation.message,
      })
      score -= 10
      console.log(`[LyricsAuditor] ⚠️ ${narrativeValidation.message}`)
    } else {
      console.log("[LyricsAuditor] ✅ Narrativa coerente")
    }

    // ✅ DECISÃO FINAL
    const isApproved = score >= this.MIN_APPROVAL_SCORE && errors.filter((e) => e.severity === "critical").length === 0
    const mustRegenerate = errors.filter((e) => e.severity === "critical").length > 0
    const canBeFixed = !mustRegenerate && errors.length > 0

    console.log(`[LyricsAuditor] 📊 Score final: ${score}/100`)
    console.log(`[LyricsAuditor] ${isApproved ? "✅ APROVADA" : "❌ REPROVADA"}`)

    if (mustRegenerate) {
      console.log("[LyricsAuditor] 🔄 DEVE REGENERAR (erros críticos)")
    } else if (canBeFixed) {
      console.log("[LyricsAuditor] 🔧 PODE SER CORRIGIDA (erros não-críticos)")
    }

    return {
      isApproved,
      score,
      errors,
      warnings,
      mustRegenerate,
      canBeFixed,
    }
  }

  /**
   * VALIDA ESTRUTURA DA LETRA
   */
  private static validateStructure(lyrics: string): { isValid: boolean; message: string } {
    const hasVerse = lyrics.includes("[VERSE") || lyrics.includes("[Verse")
    const hasChorus = lyrics.includes("[CHORUS") || lyrics.includes("[Chorus")

    if (!hasVerse) {
      return {
        isValid: false,
        message: "Letra sem versos identificados",
      }
    }

    if (!hasChorus) {
      return {
        isValid: false,
        message: "Letra sem refrão identificado",
      }
    }

    return {
      isValid: true,
      message: "Estrutura válida",
    }
  }

  /**
   * VALIDA NARRATIVA DA LETRA
   */
  private static validateNarrative(lyrics: string, theme: string): { isValid: boolean; message: string } {
    const lines = lyrics.split("\n").filter((line) => line.trim() && !line.startsWith("[") && !line.startsWith("("))

    if (lines.length < 8) {
      return {
        isValid: false,
        message: "Letra muito curta (mínimo 8 linhas)",
      }
    }

    // Verifica se há repetição excessiva (mais de 50% de linhas idênticas)
    const uniqueLines = new Set(lines.map((l) => l.trim().toLowerCase()))
    const repetitionRate = 1 - uniqueLines.size / lines.length

    if (repetitionRate > 0.5) {
      return {
        isValid: false,
        message: "Repetição excessiva de versos (mais de 50%)",
      }
    }

    return {
      isValid: true,
      message: "Narrativa coerente",
    }
  }
}
