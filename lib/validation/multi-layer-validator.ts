/**
 * VALIDADOR MULTI-CAMADAS
 *
 * Verifica TODAS as regras antes de aceitar um verso:
 * 1. Sílabas (11 sílabas poéticas)
 * 2. Narrativa (coerência da história)
 * 3. Rimas (qualidade e esquema)
 * 4. Gramática (português perfeito)
 * 5. Anti-forcing (palavras com contexto)
 * 6. Emoção (autenticidade)
 *
 * REGRA DE OURO: Cada passo só segue se atender TODAS as regras
 */

import { countPoeticSyllables, validateLyricsSyllables } from "./syllable-counter"
import { validateNarrativeFlow } from "./narrative-validator"
import { analyzeLyricsRhymeScheme, validateRhymesForGenre } from "./rhyme-validator"
import { validateFullLyricAgainstForcing } from "./anti-forcing-validator"

export interface MultiLayerValidationResult {
  isValid: boolean
  overallScore: number
  layers: {
    syllables: LayerResult
    narrative: LayerResult
    rhymes: LayerResult
    grammar: LayerResult
    antiForcing: LayerResult
    emotion: LayerResult
  }
  blockers: string[] // Erros que impedem aprovação
  warnings: string[] // Avisos que não bloqueiam mas devem ser revisados
  suggestions: string[] // Sugestões de melhoria
}

export interface LayerResult {
  passed: boolean
  score: number
  details: string
  issues: string[]
}

/**
 * Valida letra completa em TODAS as camadas
 * Retorna aprovação APENAS se TODAS as camadas passarem
 */
export function validateAllLayers(lyrics: string, genre: string, theme?: string): MultiLayerValidationResult {
  const result: MultiLayerValidationResult = {
    isValid: false,
    overallScore: 0,
    layers: {
      syllables: { passed: false, score: 0, details: "", issues: [] },
      narrative: { passed: false, score: 0, details: "", issues: [] },
      rhymes: { passed: false, score: 0, details: "", issues: [] },
      grammar: { passed: false, score: 0, details: "", issues: [] },
      antiForcing: { passed: false, score: 0, details: "", issues: [] },
      emotion: { passed: false, score: 0, details: "", issues: [] },
    },
    blockers: [],
    warnings: [],
    suggestions: [],
  }

  // CAMADA 1: SÍLABAS (BLOQUEANTE)
  const syllablesValidation = validateLyricsSyllables(lyrics, 11)
  result.layers.syllables.passed = syllablesValidation.valid
  result.layers.syllables.score = syllablesValidation.valid ? 100 : 0

  if (!syllablesValidation.valid) {
    result.layers.syllables.details = `${syllablesValidation.violations.length} versos com excesso de sílabas`
    result.layers.syllables.issues = syllablesValidation.violations.map(
      (v) => `Linha ${v.lineNumber}: "${v.line}" tem ${v.syllables} sílabas (máx: 11)`,
    )
    result.blockers.push(`❌ BLOQUEADOR: ${syllablesValidation.violations.length} versos excedem 11 sílabas`)
  } else {
    result.layers.syllables.details = "Todos os versos têm 11 sílabas ou menos ✓"
  }

  // CAMADA 2: NARRATIVA (BLOQUEANTE)
  const narrativeValidation = validateNarrativeFlow(lyrics, genre)
  result.layers.narrative.passed = narrativeValidation.isValid
  result.layers.narrative.score = narrativeValidation.score
  result.layers.narrative.details = `Score: ${narrativeValidation.score}/100`

  if (!narrativeValidation.isValid) {
    result.layers.narrative.issues = narrativeValidation.feedback
    result.blockers.push(`❌ BLOQUEADOR: Narrativa incompleta (score: ${narrativeValidation.score}/100)`)
  }

  if (narrativeValidation.abruptChanges.length > 0) {
    result.warnings.push(`⚠️ ${narrativeValidation.abruptChanges.length} mudanças abruptas na narrativa`)
  }

  // CAMADA 3: RIMAS (BLOQUEANTE para alguns gêneros)
  const rhymeAnalysis = analyzeLyricsRhymeScheme(lyrics)
  const rhymeValidation = validateRhymesForGenre(lyrics, genre)

  result.layers.rhymes.score = rhymeAnalysis.score
  result.layers.rhymes.passed = rhymeValidation.errors.length === 0
  result.layers.rhymes.details = `Score: ${rhymeAnalysis.score.toFixed(0)}/100, Esquema: ${rhymeAnalysis.scheme}`

  if (rhymeValidation.errors.length > 0) {
    result.layers.rhymes.issues = rhymeValidation.errors
    result.blockers.push(`❌ BLOQUEADOR: ${rhymeValidation.errors.length} erros de rima`)
  }

  if (rhymeValidation.warnings.length > 0) {
    result.warnings.push(...rhymeValidation.warnings)
  }

  result.suggestions.push(...rhymeAnalysis.suggestions)

  // CAMADA 4: GRAMÁTICA (BLOQUEANTE)
  const grammarValidation = validateGrammar(lyrics)
  result.layers.grammar.passed = grammarValidation.passed
  result.layers.grammar.score = grammarValidation.score
  result.layers.grammar.details = grammarValidation.details
  result.layers.grammar.issues = grammarValidation.issues

  if (!grammarValidation.passed) {
    result.blockers.push(`❌ BLOQUEADOR: ${grammarValidation.issues.length} erros gramaticais`)
  }

  // CAMADA 5: ANTI-FORCING (BLOQUEANTE)
  const antiForcingValidation = validateFullLyricAgainstForcing(lyrics, genre)
  result.layers.antiForcing.passed = antiForcingValidation.valid
  const forcedWordsCount = antiForcingValidation.forcedWords.length
  result.layers.antiForcing.score = forcedWordsCount === 0 ? 100 : Math.max(0, 100 - forcedWordsCount * 20)
  result.layers.antiForcing.details = `Score: ${result.layers.antiForcing.score}/100`

  if (!antiForcingValidation.valid) {
    result.layers.antiForcing.issues = antiForcingValidation.forcedWords.map((word) => `Palavra forçada: "${word}"`)
    result.blockers.push(`❌ BLOQUEADOR: Palavras forçadas sem contexto`)
  }

  // CAMADA 6: EMOÇÃO (NÃO BLOQUEANTE, mas importante)
  const emotionValidation = validateEmotion(lyrics, theme)
  result.layers.emotion.passed = emotionValidation.passed
  result.layers.emotion.score = emotionValidation.score
  result.layers.emotion.details = emotionValidation.details
  result.layers.emotion.issues = emotionValidation.issues

  if (!emotionValidation.passed) {
    result.warnings.push(`⚠️ ${emotionValidation.details}`)
  }

  // CÁLCULO FINAL
  const scores = Object.values(result.layers).map((l) => l.score)
  result.overallScore = scores.reduce((a, b) => a + b, 0) / scores.length

  // APROVAÇÃO: TODAS as camadas bloqueantes devem passar
  result.isValid =
    result.layers.syllables.passed &&
    result.layers.narrative.passed &&
    result.layers.rhymes.passed &&
    result.layers.grammar.passed &&
    result.layers.antiForcing.passed
  // Emoção não bloqueia, mas reduz score

  return result
}

/**
 * Valida um único verso em todas as camadas
 * Usado durante geração para validar verso por verso
 */
export function validateSingleVerse(
  verse: string,
  fullLyrics: string,
  genre: string,
): { isValid: boolean; issues: string[] } {
  const issues: string[] = []

  // 1. Sílabas
  const syllables = countPoeticSyllables(verse)
  if (syllables > 11 && !verse.trim().endsWith(",")) {
    issues.push(`${syllables} sílabas (máx: 11)`)
  }

  // 2. Anti-forcing
  const antiForcing = validateFullLyricAgainstForcing(verse, genre)
  if (!antiForcing.valid) {
    issues.push(...antiForcing.forcedWords.map((word) => `Palavra forçada: "${word}"`))
  }

  // 3. Gramática básica
  const grammarValidation = validateGrammar(verse)
  if (!grammarValidation.passed) {
    issues.push(...grammarValidation.issues)
  }

  // 4. Emoção básica
  const emotionValidation = validateEmotion(verse)
  if (!emotionValidation.passed) {
    issues.push(emotionValidation.details)
  }

  return {
    isValid: issues.length === 0,
    issues,
  }
}

/**
 * Valida gramática básica (português correto)
 */
function validateGrammar(lyrics: string): LayerResult {
  const issues: string[] = []
  const lines = lyrics.split("\n").filter((l) => l.trim() && !l.startsWith("["))

  // Regras básicas de gramática
  lines.forEach((line, index) => {
    const trimmed = line.trim()

    // Verifica concordância básica
    if (/\b(eu|ele|ela)\s+(somos|são)\b/i.test(trimmed)) {
      issues.push(`Linha ${index + 1}: Erro de concordância verbal`)
    }

    // Verifica uso incorreto de "mim" vs "eu"
    if (/\bpara\s+mim\s+(fazer|ir|ver|ter)\b/i.test(trimmed)) {
      issues.push(`Linha ${index + 1}: Use "para eu" antes de verbo no infinitivo`)
    }

    // Verifica crase incorreta
    if (/\bà\s+(ele|eles|você|vocês)\b/i.test(trimmed)) {
      issues.push(`Linha ${index + 1}: Não use crase antes de pronomes`)
    }
  })

  const passed = issues.length === 0
  const score = passed ? 100 : Math.max(0, 100 - issues.length * 20)

  return {
    passed,
    score,
    details: passed ? "Gramática correta ✓" : `${issues.length} erros gramaticais`,
    issues,
  }
}

/**
 * Valida autenticidade emocional
 */
function validateEmotion(lyrics: string, theme?: string): LayerResult {
  const lyricsLower = lyrics.toLowerCase()

  // Palavras emocionais por categoria
  const emotionalWords = {
    love: ["amor", "coração", "paixão", "sentimento", "carinho", "abraço", "beijo"],
    sadness: ["tristeza", "dor", "sofrer", "chorar", "saudade", "solidão", "lágrima"],
    joy: ["feliz", "alegria", "sorriso", "festa", "dançar", "celebrar", "viva"],
    anger: ["raiva", "ódio", "fúria", "revolta", "indignação"],
    nostalgia: ["lembrar", "memória", "passado", "tempo", "saudade", "recordar"],
  }

  let emotionCount = 0
  Object.values(emotionalWords).forEach((words) => {
    words.forEach((word) => {
      if (lyricsLower.includes(word)) emotionCount++
    })
  })

  const lines = lyrics.split("\n").filter((l) => l.trim() && !l.startsWith("["))
  const emotionDensity = emotionCount / lines.length

  // Densidade emocional ideal: 0.3 a 0.8 palavras emocionais por linha
  const passed = emotionDensity >= 0.3 && emotionDensity <= 0.8
  const score = Math.min(100, Math.max(0, emotionDensity * 100))

  let details = ""
  if (emotionDensity < 0.3) {
    details = "Emoção fraca - adicione mais sentimento"
  } else if (emotionDensity > 0.8) {
    details = "Emoção excessiva - pode parecer forçado"
  } else {
    details = "Emoção autêntica e equilibrada ✓"
  }

  return {
    passed,
    score,
    details,
    issues: passed ? [] : [details],
  }
}
