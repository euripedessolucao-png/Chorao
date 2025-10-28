// lib/validation/rhyme-validator.ts

export type RhymeType = "rica" | "pobre" | "perfeita" | "toante" | "consoante" | "falsa"

export type RhymeQuality = {
  type: RhymeType
  score: number // 0-100
  explanation: string
}

// ✅ LISTAS EXPANDIDAS E REORGANIZADAS POR CATEGORIAS SEMÂNTICAS
const PHYSICAL_OBJECTS = new Set([
  "coração", "olhos", "mãos", "braços", "lábios", "corpo", "rosto", "cabelo", "peito", "voz",
  "casa", "porta", "janela", "quarto", "cama", "mesa", "cadeira", "espelho", "foto", "retrato",
  "violão", "viola", "guitarra", "piano", "sanfona", "pandeiro", "tambor", "flauta", "saxofone",
  "carro", "moto", "ônibus", "trem", "avião", "barco", "bicicleta", "rodovia", "ponte", "túnel",
  "copo", "garrafa", "prato", "talher", "panela", "fogão", "geladeira", "faca", "colher", "xícara",
  "celular", "computador", "tv", "rádio", "câmera", "relógio", "óculos", "anel", "pulseira", "colar"
])

const NATURE_ELEMENTS = new Set([
  "flor", "árvore", "folha", "fruto", "semente", "terra", "pedra", "areia", "fogo", "água", "ar",
  "sol", "lua", "estrela", "céu", "nuvem", "chuva", "vento", "tempestade", "neve", "calor", "frio",
  "mar", "rio", "lago", "montanha", "campo", "praia", "onda", "chuva", "orvalho", "amanhecer", "entardecer"
])

const EMOTIONS = new Set([
  "amor", "ódio", "paixão", "ciúme", "inveja", "raiva", "calma", "paz", "medo", "coragem",
  "alegria", "tristeza", "saudade", "lembrança", "esperança", "desespero", "fé", "dúvida", "certeza",
  "vergonha", "orgulho", "humildade", "bondade", "maldade", "ansiedade", "euforia", "nostalgia"
])

const ABSTRACT_CONCEPTS = new Set([
  "liberdade", "justiça", "injustiça", "prisão", "pobreza", "riqueza", "sucesso", "fracasso",
  "vitória", "derrota", "honra", "beleza", "feiura", "juventude", "velhice", "vida", "morte",
  "destino", "sorte", "azar", "tempo", "eternidade", "verdade", "mentira", "realidade", "fantasia"
])

const ACTIONS = new Set([
  "amar", "odiar", "querer", "desejar", "sonhar", "pensar", "acreditar", "duvidar", "entender",
  "falar", "calar", "gritar", "sussurrar", "cantar", "dançar", "tocar", "ouvir", "ver", "sentir",
  "lembrar", "esquecer", "encontrar", "perder", "buscar", "chegar", "partir", "ficar", "voltar",
  "correr", "andar", "caminhar", "voar", "nadar", "subir", "descer", "cair", "levantar", "dormir",
  "acordar", "trabalhar", "estudar", "aprender", "ensinar", "crescer", "mudar", "transformar"
])

/**
 * ✅ MÉTODO MELHORADO: Identifica categoria semântica
 */
function getSemanticCategory(word: string): "fisico" | "natureza" | "emocao" | "conceito" | "acao" | "outro" {
  const normalized = normalizeWord(word)
  
  if (PHYSICAL_OBJECTS.has(normalized)) return "fisico"
  if (NATURE_ELEMENTS.has(normalized)) return "natureza" 
  if (EMOTIONS.has(normalized)) return "emocao"
  if (ABSTRACT_CONCEPTS.has(normalized)) return "conceito"
  if (ACTIONS.has(normalized)) return "acao"
  
  return "outro"
}

/**
 * ✅ MÉTODO MELHORADO: Identifica classe gramatical REAL
 */
function getGrammaticalClass(word: string): "substantivo" | "verbo" | "adjetivo" | "desconhecido" {
  const normalized = normalizeWord(word)
  
  // Verifica nas listas primeiro (mais preciso)
  if (PHYSICAL_OBJECTS.has(normalized) || NATURE_ELEMENTS.has(normalized) || 
      EMOTIONS.has(normalized) || ABSTRACT_CONCEPTS.has(normalized)) {
    return "substantivo"
  }
  if (ACTIONS.has(normalized)) return "verbo"
  
  // Fallback por sufixos
  const verbSuffixes = ["ar", "er", "ir", "ando", "endo", "indo", "ado", "ido"]
  const nounSuffixes = ["ção", "são", "dade", "tude", "agem", "ência", "ância", "ez", "ice", "ismo"]
  const adjSuffixes = ["oso", "osa", "ável", "ível", "ente", "ante", "ico", "ica", "ino", "ina"]

  if (verbSuffixes.some(suffix => normalized.endsWith(suffix))) return "verbo"
  if (nounSuffixes.some(suffix => normalized.endsWith(suffix))) return "substantivo"
  if (adjSuffixes.some(suffix => normalized.endsWith(suffix))) return "adjetivo"

  return "desconhecido"
}

/**
 * ✅ MÉTODO CRÍTICO CORRIGIDO: Análise de rima com ORDEM CORRETA
 */
export function analyzeRhyme(word1: string, word2: string): RhymeQuality {
  const w1 = normalizeWord(word1)
  const w2 = normalizeWord(word2)

  // Palavras idênticas ou muito curtas
  if (w1 === w2 || w1.length < 2 || w2.length < 2) {
    return {
      type: "falsa",
      score: 0,
      explanation: "Palavras idênticas ou muito curtas"
    }
  }

  const ending1 = getEndingSound(w1)
  const ending2 = getEndingSound(w2)
  const class1 = getGrammaticalClass(w1)
  const class2 = getGrammaticalClass(w2)
  const category1 = getSemanticCategory(w1)
  const category2 = getSemanticCategory(w2)

  // 🔥 ORDEM CORRIGIDA: Primeiro verifica se há rima (som final)
  if (ending1 !== ending2) {
    // Apenas vogais iguais (rima toante)
    const vowels1 = ending1.replace(/[^aeiou]/g, "")
    const vowels2 = ending2.replace(/[^aeiou]/g, "")
    if (vowels1 === vowels2 && vowels1.length >= 2) {
      return {
        type: "toante",
        score: 50,
        explanation: `Rima toante: vogais iguais (${vowels1})`
      }
    }
    return {
      type: "falsa",
      score: 0,
      explanation: `Sem rima: sons finais diferentes (${ending1} ≠ ${ending2})`
    }
  }

  // 🔥 AGORA SIM: Classifica a QUALIDADE da rima (já sabemos que rimam)
  
  // ✅ 1. RIMA RICA POR CONTRASTE SEMÂNTICO FORTE
  const strongSemanticContrasts = [
    ["fisico", "emocao"],     // "coração" + "paixão"
    ["natureza", "conceito"], // "rio" + "destino"  
    ["acao", "emocao"],       // "amar" + "paixão"
    ["fisico", "conceito"],   // "casa" + "liberdade"
    ["natureza", "emocao"],   // "tempestade" + "raiva"
  ]

  const hasStrongContrast = strongSemanticContrasts.some(
    ([cat1, cat2]) => 
      (category1 === cat1 && category2 === cat2) ||
      (category1 === cat2 && category2 === cat1)
  )

  if (hasStrongContrast) {
    return {
      type: "rica",
      score: 100,
      explanation: `Rima rica: contraste semântico forte (${category1} + ${category2})`
    }
  }

  // ✅ 2. RIMA RICA POR CONTRASTE GRAMATICAL
  if (class1 !== class2 && class1 !== "desconhecido" && class2 !== "desconhecido") {
    return {
      type: "rica", 
      score: 90,
      explanation: `Rima rica: contraste gramatical (${class1} + ${class2})`
    }
  }

  // ✅ 3. RIMA RICA POR CONTRASTE SEMÂNTICO MODERADO
  const moderateSemanticContrasts = [
    ["fisico", "natureza"],   // "casa" + "rio"
    ["emocao", "conceito"],   // "amor" + "liberdade"
    ["acao", "conceito"],     // "lutar" + "vitória"
  ]

  const hasModerateContrast = moderateSemanticContrasts.some(
    ([cat1, cat2]) => 
      (category1 === cat1 && category2 === cat2) ||
      (category1 === cat2 && category2 === cat1)
  )

  if (hasModerateContrast) {
    return {
      type: "rica",
      score: 85,
      explanation: `Rima rica: contraste semântico moderado (${category1} + ${category2})`
    }
  }

  // ❌ 4. RIMA POBRE: mesma categoria e classe
  if (category1 === category2 && class1 === class2 && category1 !== "outro") {
    return {
      type: "pobre",
      score: 40,
      explanation: `Rima pobre: mesma categoria (${category1}) e classe (${class1})`
    }
  }

  // ✅ 5. RIMA PERFEITA (consoante) sem contraste forte
  return {
    type: "perfeita",
    score: 70,
    explanation: `Rima perfeita sem contraste significativo`
  }
}

/**
 * ✅ MÉTODO MELHORADO: Extrai última palavra SIGNIFICATIVA
 */
function getLastWord(line: string): string {
  // Remove pontuação mas mantém acentos
  const cleaned = line.replace(/[^\wáàâãéèêíìîóòôõúùûç\s]/gi, " ").trim()
  const words = cleaned.split(/\s+/).filter(word => word.length > 2)
  
  if (words.length === 0) return ""
  
  // Ignora palavras funcionais (artigos, preposições)
  const functionalWords = new Set([
    "o", "a", "os", "as", "um", "uma", "uns", "umas", 
    "de", "da", "do", "das", "dos", "em", "no", "na", 
    "nos", "nas", "por", "pra", "para", "com", "sem",
    "que", "se", "me", "te", "lhe", "nos", "vos", "lhes"
  ])
  
  for (let i = words.length - 1; i >= 0; i--) {
    const word = words[i].toLowerCase()
    if (!functionalWords.has(word)) {
      return words[i]
    }
  }
  
  return words[words.length - 1] || ""
}

// Mantenha as outras funções (normalizeWord, getEndingSound) como estão

/**
 * ✅ EXEMPLOS QUE AGORA SERÃO CLASSIFICADOS COMO RIMAS RICAS:
 * 
 * "coração" (físico) + "paixão" (emoção) → RIMA RICA
 * "rio" (natureza) + "destino" (conceito) → RIMA RICA  
 * "amar" (ação) + "sonhar" (ação/emoção) → RIMA RICA
 * "casa" (físico) + "asa" (físico) → RIMA POBRE
 * "dor" (emoção) + "amor" (emoção) → RIMA POBRE
 */
