// lib/validation/rhyme-validator.ts

export type RhymeType = "rica" | "pobre" | "perfeita" | "toante" | "consoante" | "falsa"

export type RhymeQuality = {
  type: RhymeType
  score: number // 0-100
  explanation: string
}

// ✅ LISTAS EXPANDIDAS: concreto vs. abstrato
const CONCRETE_NOUNS = new Set([
  // Objetos físicos
  "riacho", "viola", "ouro", "terno", "terra", "chuva", "café", "xícara", "cavalo", "porteira",
  "cidade", "estrada", "carro", "boteco", "cerveja", "prato", "pedágio", "garagem", "choro",
  "amanhecer", "batida", "espelho", "futuro", "noite", "dia", "sol", "lua", "mar", "céu", "lar",
  "trabalho", "violão", "sanfona", "boiadeiro", "curral", "chaleira", "fogão", "roda", "pandeiro",
  "cama", "foto", "celular", "bebida", "bar", "madrugada", "paredão", "zap", "story", "look",
  "baile", "favela", "quebrada", "nave", "grife", "cruz", "altar", "luz", "caminho", "milagre",
  "violão", "samba", "bossa", "gente", "Brasil", "corazón", "besos", "noche", "luna", "baile",
  "pandeiro", "cavaquinho", "feijoada", "zabumba", "triângulo"
])

const ABSTRACT_NOUNS = new Set([
  // Conceitos, emoções, estados
  "liberdade", "paz", "saudade", "alma", "amor", "dor", "coração", "paixão", "solidão", "razão",
  "ilusão", "emoção", "flor", "valor", "sabor", "temor", "clamor", "fervor", "ardor", "esplendor",
  "fulgor", "primor", "pudor", "rubor", "torpor", "vigor", "amargor", "candor", "horror", "labor",
  "licor", "louvor", "motor", "pavor", "rancor", "rigor", "rumor", "suor", "tambor", "tenor",
  "terror", "traidor", "tremor", "vapor", "verdor", "gratidão", "vida", "luta", "estrada", "presente",
  "chance", "batida", "futuro", "sonho", "felicidade", "tristeza", "alegria", "esperança", "fé",
  "confiança", "vitória", "paz", "adoração", "testemunho", "cultura", "identidade", "resistência",
  "sofrimento", "arrependimento", "perdão", "vingança", "ódio", "ciúmes", "inveja", "vergonha",
  "orgulho", "humildade", "coragem", "medo", "ansiedade", "depressão", "euforia", "nostalgia"
])

/**
 * Verifica se uma palavra é CONCRETA (objeto físico, ação, lugar)
 */
function isConcrete(word: string): boolean {
  const normalized = word.toLowerCase()
  return CONCRETE_NOUNS.has(normalized)
}

/**
 * Verifica se uma palavra é ABSTRATA (conceito, emoção, estado)
 */
function isAbstract(word: string): boolean {
  const normalized = word.toLowerCase()
  return ABSTRACT_NOUNS.has(normalized)
}

/**
 * Normaliza palavra removendo acentos e pontuação
 */
function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "")
    .trim()
}

/**
 * Identifica a classe gramatical de uma palavra
 */
function getGrammaticalClass(word: string): "substantivo" | "verbo" | "adjetivo" | "desconhecido" {
  const normalized = normalizeWord(word)

  // Sufixos verbais
  if (normalized.endsWith("ar") || normalized.endsWith("er") || normalized.endsWith("ir")) {
    return "verbo"
  }

  // Sufixos de substantivos abstratos
  const abstractSuffixes = ["ção", "são", "dade", "tude", "agem", "ência", "ância", "ez", "ice"]
  if (abstractSuffixes.some(suffix => normalized.endsWith(suffix))) {
    return "substantivo"
  }

  // Sufixos de adjetivos
  const adjSuffixes = ["oso", "osa", "ável", "ível", "ente", "ante", "ico", "ica", "ino", "ina"]
  if (adjSuffixes.some(suffix => normalized.endsWith(suffix))) {
    return "adjetivo"
  }

  return "substantivo" // fallback seguro para substantivos
}

/**
 * Extrai a última palavra significativa de uma linha
 */
function getLastWord(line: string): string {
  const cleaned = line.replace(/[^\wáàâãéèêíìîóòôõúùûç\s]/gi, "").trim()
  const words = cleaned.split(/\s+/)
  return words[words.length - 1] || ""
}

/**
 * Extrai o som final da palavra (a partir da última vogal tônica)
 */
function getEndingSound(word: string): string {
  const normalized = normalizeWord(word)
  const vowels = "aeiou"
  let lastVowelIndex = -1
  for (let i = normalized.length - 1; i >= 0; i--) {
    if (vowels.includes(normalized[i])) {
      lastVowelIndex = i
      break
    }
  }
  return lastVowelIndex !== -1 ? normalized.slice(lastVowelIndex) : normalized
}

/**
 * Verifica se duas palavras rimam e classifica o tipo de rima
 */
export function analyzeRhyme(word1: string, word2: string): RhymeQuality {
  const w1 = normalizeWord(word1)
  const w2 = normalizeWord(word2)

  // Palavras idênticas não são rima
  if (w1 === w2) {
    return {
      type: "falsa",
      score: 0,
      explanation: "Palavras idênticas não constituem rima",
    }
  }

  const ending1 = getEndingSound(w1)
  const ending2 = getEndingSound(w2)
  const class1 = getGrammaticalClass(w1)
  const class2 = getGrammaticalClass(w2)

  // Rima Perfeita (Consoante): vogais E consoantes iguais
  if (ending1 === ending2) {
    // ✅ RIMA RICA POR CONTRASTE SEMÂNTICO
    const isSemanticContrast = 
      (isConcrete(w1) && isAbstract(w2)) || 
      (isAbstract(w1) && isConcrete(w2))
    
    if (isSemanticContrast) {
      return {
        type: "rica",
        score: 100,
        explanation: `Rima rica por contraste: concreto ("${w1}") + abstrato ("${w2}")`
      }
    }

    // Rima Rica por classe gramatical diferente
    if (class1 !== class2 && class1 !== "desconhecido" && class2 !== "desconhecido") {
      return {
        type: "rica",
        score: 90,
        explanation: `Rima rica: ${class1} + ${class2}`
      }
    }

    // Rima Pobre: mesma classe gramatical
    if (class1 === class2 && class1 !== "desconhecido") {
      return {
        type: "pobre",
        score: 60,
        explanation: `Rima pobre: ambas são ${class1}`
      }
    }

    // Rima Perfeita (classe desconhecida)
    return {
      type: "perfeita",
      score: 80,
      explanation: `Rima perfeita: som idêntico (${ending1})`
    }
  }

  // Rima Toante (Assonante): apenas vogais iguais
  const vowels1 = ending1.replace(/[^aeiou]/g, "")
  const vowels2 = ending2.replace(/[^aeiou]/g, "")
  if (vowels1 === vowels2 && vowels1.length > 0) {
    return {
      type: "toante",
      score: 50,
      explanation: `Rima toante: vogais iguais (${vowels1})`
    }
  }

  // Rima Falsa
  return {
    type: "falsa",
    score: 0,
    explanation: "Não há rima: sons finais muito diferentes"
  }
}

/**
 * Analisa o esquema de rimas de uma letra completa
 */
export function analyzeLyricsRhymeScheme(lyrics: string): {
  scheme: string[]
  quality: RhymeQuality[]
  score: number
  suggestions: string[]
} {
  const lines = lyrics.split("\n").filter((line) => line.trim() && !line.startsWith("[") && !line.startsWith("("))

  const lastWords = lines.map(getLastWord).filter(Boolean)
  const rhymeMap = new Map<string, string>()
  const scheme: string[] = []
  const quality: RhymeQuality[] = []
  let currentLetter = "A"

  for (let i = 0; i < lastWords.length; i++) {
    const word = lastWords[i]
    let foundRhyme = false

    for (let j = 0; j < i; j++) {
      const prevWord = lastWords[j]
      const rhymeAnalysis = analyzeRhyme(word, prevWord)

      if (rhymeAnalysis.score >= 50) {
        const letter = scheme[j]
        scheme.push(letter)
        quality.push(rhymeAnalysis)
        foundRhyme = true
        break
      }
    }

    if (!foundRhyme) {
      scheme.push(currentLetter)
      currentLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1)
      quality.push({
        type: "falsa",
        score: 0,
        explanation: "Linha sem rima correspondente",
      })
    }
  }

  const totalScore = quality.reduce((sum, q) => sum + q.score, 0) / quality.length

  const suggestions: string[] = []
  const richRhymes = quality.filter((q) => q.type === "rica").length
  const poorRhymes = quality.filter((q) => q.type === "pobre").length

  if (richRhymes < lines.length * 0.3) {
    suggestions.push("Aumente o uso de rimas ricas (contraste concreto/abstrato ou classes diferentes)")
  }
  if (poorRhymes > lines.length * 0.5) {
    suggestions.push("Reduza rimas pobres e varie mais com contrastes semânticos")
  }

  return {
    scheme,
    quality,
    score: totalScore,
    suggestions,
  }
}

/**
 * Valida rimas para um gênero específico
 */
export function validateRhymesForGenre(
  lyrics: string,
  genre: string,
): {
  valid: boolean
  errors: string[]
  warnings: string[]
  analysis: ReturnType<typeof analyzeLyricsRhymeScheme>
} {
  const analysis = analyzeLyricsRhymeScheme(lyrics)
  const errors: string[] = []
  const warnings: string[] = []

  const genreLower = genre.toLowerCase()

  if (genreLower.includes("raiz")) {
    const richRhymePercentage = analysis.quality.filter((q) => q.type === "rica").length / analysis.quality.length
    if (richRhymePercentage < 0.5) {
      errors.push(`Sertanejo Raiz exige ≥50% rimas ricas. Atual: ${(richRhymePercentage * 100).toFixed(0)}%`)
    }
  } else if (genreLower.includes("sertanejo")) {
    const richRhymePercentage = analysis.quality.filter((q) => q.type === "rica").length / analysis.quality.length
    if (richRhymePercentage < 0.3) {
      warnings.push(`Sertanejo prefere ≥30% rimas ricas. Atual: ${(richRhymePercentage * 100).toFixed(0)}%`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    analysis,
  }
}
