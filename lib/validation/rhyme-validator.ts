/**
 * Sistema de validação de rimas para música brasileira
 * Baseado em regras de poesia e composição musical brasileira
 */

export type RhymeType = "rica" | "pobre" | "perfeita" | "toante" | "consoante" | "falsa"

export type RhymeQuality = {
  type: RhymeType
  score: number // 0-100
  explanation: string
}

/**
 * Classes gramaticais para análise de rima rica
 */
const GRAMMATICAL_CLASSES = {
  substantivos: [
    "amor",
    "dor",
    "coração",
    "paixão",
    "solidão",
    "razão",
    "ilusão",
    "canção",
    "emoção",
    "flor",
    "calor",
    "valor",
    "sabor",
    "temor",
    "clamor",
    "fervor",
    "ardor",
    "esplendor",
    "fulgor",
    "primor",
    "pudor",
    "rubor",
    "torpor",
    "tumor",
    "vigor",
    "amargor",
    "candor",
    "clamor",
    "esplendor",
    "fulgor",
    "horror",
    "labor",
    "licor",
    "louvor",
    "motor",
    "pavor",
    "rancor",
    "rigor",
    "rumor",
    "suor",
    "tambor",
    "temor",
    "tenor",
    "terror",
    "torpor",
    "traidor",
    "tremor",
    "tumor",
    "vapor",
    "verdor",
    "vigor",
  ],
  verbos: [
    "amar",
    "cantar",
    "dançar",
    "sonhar",
    "chorar",
    "sofrer",
    "viver",
    "morrer",
    "partir",
    "sentir",
    "sorrir",
    "fugir",
    "seguir",
    "pedir",
    "cair",
    "sair",
    "vir",
    "ir",
    "dar",
    "estar",
    "ficar",
    "olhar",
    "falar",
    "andar",
    "voltar",
    "deixar",
    "passar",
    "chegar",
    "levar",
    "trazer",
    "fazer",
    "dizer",
    "querer",
    "poder",
    "saber",
    "ver",
    "crer",
    "ler",
    "ter",
    "ser",
  ],
  adjetivos: [
    "belo",
    "triste",
    "feliz",
    "sozinho",
    "perdido",
    "amado",
    "querido",
    "sofrido",
    "partido",
    "ferido",
    "sentido",
    "vivido",
    "morrido",
    "nascido",
    "crescido",
    "conhecido",
    "desconhecido",
    "esquecido",
    "lembrado",
    "amargo",
    "doce",
    "suave",
    "forte",
    "fraco",
    "grande",
    "pequeno",
    "novo",
    "velho",
    "jovem",
    "antigo",
    "moderno",
    "eterno",
    "passageiro",
    "verdadeiro",
    "falso",
    "sincero",
    "puro",
    "impuro",
    "claro",
    "escuro",
  ],
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

  if (GRAMMATICAL_CLASSES.substantivos.some((s) => normalized.includes(s) || s.includes(normalized))) {
    return "substantivo"
  }
  if (GRAMMATICAL_CLASSES.verbos.some((v) => normalized.includes(v) || v.includes(normalized))) {
    return "verbo"
  }
  if (GRAMMATICAL_CLASSES.adjetivos.some((a) => normalized.includes(a) || a.includes(normalized))) {
    return "adjetivo"
  }

  // Heurísticas adicionais
  if (normalized.endsWith("ar") || normalized.endsWith("er") || normalized.endsWith("ir")) {
    return "verbo"
  }
  if (normalized.endsWith("mente") || normalized.endsWith("oso") || normalized.endsWith("osa")) {
    return "adjetivo"
  }

  return "desconhecido"
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

  // Encontra a última vogal
  let lastVowelIndex = -1
  for (let i = normalized.length - 1; i >= 0; i--) {
    if (vowels.includes(normalized[i])) {
      lastVowelIndex = i
      break
    }
  }

  if (lastVowelIndex === -1) return normalized

  // Retorna do início da última vogal até o final
  return normalized.slice(lastVowelIndex)
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
    // Rima Rica: classes gramaticais diferentes
    if (class1 !== class2 && class1 !== "desconhecido" && class2 !== "desconhecido") {
      return {
        type: "rica",
        score: 100,
        explanation: `Rima rica perfeita: ${class1} + ${class2} com som idêntico (${ending1})`,
      }
    }

    // Rima Pobre: mesma classe gramatical
    if (class1 === class2 && class1 !== "desconhecido") {
      return {
        type: "pobre",
        score: 60,
        explanation: `Rima pobre: ambas são ${class1} com som idêntico (${ending1})`,
      }
    }

    // Rima Perfeita (classe desconhecida)
    return {
      type: "perfeita",
      score: 80,
      explanation: `Rima perfeita: som idêntico (${ending1})`,
    }
  }

  // Rima Toante (Assonante): apenas vogais iguais
  const vowels1 = ending1.replace(/[^aeiou]/g, "")
  const vowels2 = ending2.replace(/[^aeiou]/g, "")

  if (vowels1 === vowels2 && vowels1.length > 0) {
    return {
      type: "toante",
      score: 50,
      explanation: `Rima toante: vogais iguais (${vowels1}) mas consoantes diferentes`,
    }
  }

  // Rima Falsa: sons muito diferentes
  const similarity = calculateSimilarity(ending1, ending2)
  if (similarity < 0.3) {
    return {
      type: "falsa",
      score: 0,
      explanation: "Não há rima: sons finais muito diferentes",
    }
  }

  // Rima Imperfeita
  return {
    type: "falsa",
    score: 20,
    explanation: "Rima imperfeita: semelhança sonora fraca",
  }
}

/**
 * Calcula similaridade entre duas strings (0-1)
 */
function calculateSimilarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2
  const shorter = s1.length > s2.length ? s2 : s1

  if (longer.length === 0) return 1.0

  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

/**
 * Calcula distância de Levenshtein entre duas strings
 */
function levenshteinDistance(s1: string, s2: string): number {
  const costs: number[] = []
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j
      } else if (j > 0) {
        let newValue = costs[j - 1]
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
        }
        costs[j - 1] = lastValue
        lastValue = newValue
      }
    }
    if (i > 0) {
      costs[s2.length] = lastValue
    }
  }
  return costs[s2.length]
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

  // Analisa esquema de rimas
  for (let i = 0; i < lastWords.length; i++) {
    const word = lastWords[i]
    let foundRhyme = false

    // Verifica se rima com alguma palavra anterior
    for (let j = 0; j < i; j++) {
      const prevWord = lastWords[j]
      const rhymeAnalysis = analyzeRhyme(word, prevWord)

      if (rhymeAnalysis.score >= 50) {
        // Rima encontrada
        const letter = scheme[j]
        scheme.push(letter)
        quality.push(rhymeAnalysis)
        foundRhyme = true
        break
      }
    }

    if (!foundRhyme) {
      // Nova rima
      scheme.push(currentLetter)
      currentLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1)
      quality.push({
        type: "falsa",
        score: 0,
        explanation: "Linha sem rima correspondente",
      })
    }
  }

  // Calcula score geral
  const totalScore = quality.reduce((sum, q) => sum + q.score, 0) / quality.length

  // Gera sugestões
  const suggestions: string[] = []
  const richRhymes = quality.filter((q) => q.type === "rica").length
  const poorRhymes = quality.filter((q) => q.type === "pobre").length
  const falseRhymes = quality.filter((q) => q.type === "falsa").length

  if (richRhymes < lines.length * 0.3) {
    suggestions.push("Aumente o uso de rimas ricas (palavras de classes gramaticais diferentes)")
  }
  if (poorRhymes > lines.length * 0.5) {
    suggestions.push("Reduza rimas pobres (mesma classe gramatical) e varie mais")
  }
  if (falseRhymes > lines.length * 0.2) {
    suggestions.push("Corrija rimas falsas ou fracas para melhorar a musicalidade")
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

  // Regras específicas por gênero
  if (genre.toLowerCase().includes("sertanejo raiz")) {
    // Sertanejo Raiz: EXIGE rimas ricas
    const richRhymePercentage = analysis.quality.filter((q) => q.type === "rica").length / analysis.quality.length

    if (richRhymePercentage < 0.5) {
      errors.push(
        `Sertanejo Raiz exige pelo menos 50% de rimas ricas. Atual: ${(richRhymePercentage * 100).toFixed(0)}%`,
      )
    }

    const falseRhymes = analysis.quality.filter((q) => q.type === "falsa" && q.score === 0)
    if (falseRhymes.length > 0) {
      errors.push(`Sertanejo Raiz não aceita rimas falsas. Encontradas: ${falseRhymes.length}`)
    }
  } else if (genre.toLowerCase().includes("sertanejo moderno")) {
    // Sertanejo Moderno: permite algumas rimas falsas, mas prefere ricas
    const richRhymePercentage = analysis.quality.filter((q) => q.type === "rica").length / analysis.quality.length

    if (richRhymePercentage < 0.3) {
      warnings.push(
        `Sertanejo Moderno prefere pelo menos 30% de rimas ricas. Atual: ${(richRhymePercentage * 100).toFixed(0)}%`,
      )
    }

    const falseRhymes = analysis.quality.filter((q) => q.type === "falsa" && q.score === 0)
    if (falseRhymes.length > analysis.quality.length * 0.2) {
      warnings.push(`Muitas rimas falsas para Sertanejo Moderno: ${falseRhymes.length}`)
    }
  } else if (genre.toLowerCase().includes("mpb")) {
    // MPB: exige alta qualidade de rimas
    if (analysis.score < 70) {
      warnings.push(`MPB exige rimas de alta qualidade. Score atual: ${analysis.score.toFixed(0)}`)
    }
  } else if (genre.toLowerCase().includes("pagode") || genre.toLowerCase().includes("samba")) {
    // Pagode/Samba: rimas devem ser naturais e fluidas
    const poorRhymes = analysis.quality.filter((q) => q.type === "pobre")
    if (poorRhymes.length > analysis.quality.length * 0.6) {
      warnings.push("Pagode/Samba: varie mais as rimas para evitar monotonia")
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    analysis,
  }
}
