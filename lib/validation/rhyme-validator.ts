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
  "pandeiro", "cavaquinho", "feijoada", "zabumba", "triângulo",
  // ADICIONADOS: objetos físicos comuns em músicas
  "coração", "olhos", "mãos", "braços", "lábios", "corpo", "rosto", "cabelo", "peito", "voz",
  "casa", "porta", "janela", "quarto", "cama", "mesa", "cadeira", "espelho", "foto", "retrato",
  "rua", "estrada", "caminho", "praça", "praia", "mar", "rio", "lago", "montanha", "campo",
  "carro", "moto", "ônibus", "trem", "avião", "barco", "bicicleta", "rodovia", "ponte", "túnel",
  "violão", "viola", "guitarra", "piano", "sanfona", "pandeiro", "tambor", "flauta", "saxofone",
  "copo", "garrafa", "prato", "talher", "panela", "fogão", "geladeira", "faca", "colher", "xícara",
  "celular", "computador", "tv", "rádio", "câmera", "relógio", "óculos", "anel", "pulseira", "colar"
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
  "orgulho", "humildade", "coragem", "medo", "ansiedade", "depressão", "euforia", "nostalgia",
  // ADICIONADOS: mais conceitos abstratos
  "ódio", "ciúme", "inveja", "raiva", "calma", "guerra", "medo", "coragem",
  "alegria", "tristeza", "saudade", "lembrança", "esperança", "desespero", "fé", "dúvida", "certeza",
  "verdade", "mentira", "justiça", "injustiça", "prisão", "pobreza", "riqueza", "sucesso",
  "fracasso", "vitória", "derrota", "honra", "vergonha", "orgulho", "humildade", "bondade", "maldade",
  "beleza", "feiura", "juventude", "velhice", "morte", "nascimento", "destino", "sorte", "azar",
  "tempo", "eternidade", "espaço", "universo", "natureza", "humanidade", "sociedade", "cultura", "arte",
  "música", "poesia", "literatura", "ciência", "filosofia", "religião", "política", "economia", "história",
  "futuro", "passado", "presente", "memória", "esquecimento", "sonho", "pesadelo", "realidade", "fantasia"
])

const VERBS = new Set([
  // Verbos comuns em música
  "amar", "odiar", "querer", "desejar", "precisar", "esperar", "sonhar", "imaginar", "pensar", "acreditar",
  "duvidar", "saber", "ignorar", "entender", "confundir", "explicar", "perguntar", "responder", "dizer",
  "falar", "calar", "gritar", "sussurrar", "cantar", "dançar", "tocar", "ouvir", "ver", "olhar", "enxergar",
  "sentir", "perceber", "notar", "lembrar", "esquecer", "encontrar", "perder", "achar", "buscar", "procurar",
  "chegar", "partir", "ficar", "sair", "entrar", "voltar", "seguir", "parar", "correr", "andar", "caminhar",
  "pular", "saltar", "voar", "nadar", "mergulhar", "subir", "descer", "cair", "levantar", "deitar", "dormir",
  "acordar", "descansar", "trabalhar", "estudar", "aprender", "ensinar", "crescer", "evoluir", "mudar"
])

/**
 * ✅ MÉTODO MELHORADO: Verifica se uma palavra é CONCRETA
 */
function isConcrete(word: string): boolean {
  const normalized = word.toLowerCase()
  return CONCRETE_NOUNS.has(normalized) || VERBS.has(normalized)
}

/**
 * ✅ MÉTODO MELHORADO: Verifica se uma palavra é ABSTRATA
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
 * ✅ MÉTODO MELHORADO: Identifica a classe gramatical de uma palavra
 */
function getGrammaticalClass(word: string): "substantivo" | "verbo" | "adjetivo" | "desconhecido" {
  const normalized = normalizeWord(word)

  // Verifica nas listas primeiro (mais preciso)
  if (CONCRETE_NOUNS.has(normalized) || ABSTRACT_NOUNS.has(normalized)) {
    return "substantivo"
  }
  if (VERBS.has(normalized)) {
    return "verbo"
  }

  // Fallback por sufixos
  const verbSuffixes = ["ar", "er", "ir", "ando", "endo", "indo", "ado", "ido"]
  const nounSuffixes = ["ção", "são", "dade", "tude", "agem", "ência", "ância", "ez", "ice", "ismo"]
  const adjSuffixes = ["oso", "osa", "ável", "ível", "ente", "ante", "ico", "ica", "ino", "ina"]

  if (verbSuffixes.some(suffix => normalized.endsWith(suffix))) {
    return "verbo"
  }
  if (nounSuffixes.some(suffix => normalized.endsWith(suffix))) {
    return "substantivo"
  }
  if (adjSuffixes.some(suffix => normalized.endsWith(suffix))) {
    return "adjetivo"
  }

  return "substantivo" // fallback seguro
}

/**
 * ✅ MÉTODO MELHORADO: Extrai a última palavra significativa de uma linha
 */
function getLastWord(line: string): string {
  const cleaned = line.replace(/[^\wáàâãéèêíìîóòôõúùûç\s]/gi, " ").trim()
  const words = cleaned.split(/\s+/).filter(word => word.length > 2)
  
  if (words.length === 0) return ""
  
  // Ignora palavras funcionais
  const insignificantWords = new Set([
    "o", "a", "os", "as", "um", "uma", "uns", "umas", "de", "da", "do", "das", "dos",
    "em", "no", "na", "nos", "nas", "por", "pra", "pro", "pras", "pros", "com", "sem",
    "que", "se", "me", "te", "lhe", "nos", "vos", "lhes", "este", "esta", "esse", "essa"
  ])
  
  for (let i = words.length - 1; i >= 0; i--) {
    const word = words[i].toLowerCase()
    if (!insignificantWords.has(word)) {
      return words[i]
    }
  }
  
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
 * ✅ MÉTODO CRÍTICO CORRIGIDO: Verifica se duas palavras rimam e classifica o tipo de rima
 */
export function analyzeRhyme(word1: string, word2: string): RhymeQuality {
  const w1 = normalizeWord(word1)
  const w2 = normalizeWord(word2)

  // Palavras idênticas não são rima
  if (w1 === w2 || w1.length < 2 || w2.length < 2) {
    return {
      type: "falsa",
      score: 0,
      explanation: "Palavras idênticas ou muito curtas não constituem rima",
    }
  }

  const ending1 = getEndingSound(w1)
  const ending2 = getEndingSound(w2)
  const class1 = getGrammaticalClass(w1)
  const class2 = getGrammaticalClass(w2)

  // 🔥 PRIMEIRO verifica se há rima (som final igual)
  if (ending1 !== ending2) {
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

  // 🔥 AGORA classifica a QUALIDADE da rima (já sabemos que rimam)

  // ✅ 1. RIMA RICA POR CONTRASTE SEMÂNTICO
  const isSemanticContrast = 
    (isConcrete(w1) && isAbstract(w2)) || 
    (isAbstract(w1) && isConcrete(w2))
  
  if (isSemanticContrast) {
    const concreteWord = isConcrete(w1) ? w1 : w2
    const abstractWord = isAbstract(w1) ? w1 : w2
    return {
      type: "rica",
      score: 100,
      explanation: `Rima rica por contraste semântico: "${concreteWord}" (concreto) + "${abstractWord}" (abstrato)`
    }
  }

  // ✅ 2. RIMA RICA por classe gramatical diferente
  if (class1 !== class2 && class1 !== "desconhecido" && class2 !== "desconhecido") {
    return {
      type: "rica",
      score: 90,
      explanation: `Rima rica: ${class1} + ${class2}`
    }
  }

  // ❌ 3. Rima Pobre: mesma classe gramatical
  if (class1 === class2 && class1 !== "desconhecido") {
    return {
      type: "pobre",
      score: 40, // Reduzido de 60 para 40
      explanation: `Rima pobre: ambas são ${class1}`
    }
  }

  // ✅ 4. Rima Perfeita (classe desconhecida ou sem contraste)
  return {
    type: "perfeita",
    score: 70, // Reduzido de 80 para 70
    explanation: `Rima perfeita: som idêntico (${ending1})`
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
    suggestions.push("💡 Aumente o uso de rimas ricas (contraste concreto/abstrato ou classes diferentes)")
  }
  if (poorRhymes > lines.length * 0.5) {
    suggestions.push("💡 Reduza rimas pobres e varie mais com contrastes semânticos")
  }

  return {
    scheme,
    quality,
    score: totalScore,
    suggestions,
  }
}

/**
 * ✅ MANTIDO: Valida rimas para um gênero específico
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
