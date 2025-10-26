// lib/validation/rhyme-enhancer.ts

import { getUniversalRhymeRules } from "./universal-rhyme-rules"

// ✅ NOVO: Banco de rimas ricas por contexto
const RICH_RHYME_TEMPLATES: Record<string, Array<{ word: string; class: string; meaning: string }>> = {
  // Substantivos concretos → verbos
  "viola": [{ word: "consola", class: "verbo", meaning: "aliviar" }],
  "flor": [{ word: "melhor", class: "adjetivo", meaning: "superior" }],
  "trabalho": [{ word: "apoio", class: "substantivo", meaning: "suporte" }],
  "lar": [{ word: "amar", class: "verbo", meaning: "sentir afeto" }],
  "cidade": [{ word: "saudade", class: "substantivo", meaning: "sentimento de falta" }],
  
  // Verbos → substantivos abstratos
  "viver": [
    { word: "felicidade", class: "substantivo", meaning: "estado de alegria" },
    { word: "liberdade", class: "substantivo", meaning: "autonomia" }
  ],
  "sonhar": [
    { word: "realidade", class: "substantivo", meaning: "fato concreto" },
    { word: "verdade", class: "substantivo", meaning: "autenticidade" }
  ],
  
  // Adjetivos → substantivos
  "feliz": [{ word: "matiz", class: "substantivo", meaning: "nuance" }],
  "leve": [{ word: "neve", class: "substantivo", meaning: "precipitação" }],
}

// ✅ NOVO: Função de melhoria inteligente
function enhanceToRichRhyme(
  line1: string,
  line2: string,
  lastWord1: string,
  lastWord2: string,
  genre: string
): { line1: string; line2: string; improved: boolean; newRhymeType: string } | null {
  const rhymeRules = getUniversalRhymeRules(genre)
  
  // Verifica se já é rica
  const currentClass1 = getWordClass(lastWord1)
  const currentClass2 = getWordClass(lastWord2)
  if (currentClass1 !== currentClass2) {
    return null // já é rica
  }

  // Tenta encontrar rima rica para word1
  const richOptions = RICH_RHYME_TEMPLATES[lastWord1.toLowerCase()] || []
  
  for (const option of richOptions) {
    // Verifica se a rima é foneticamente válida
    if (isPerfectRhyme(lastWord1, option.word)) {
      const newLine2 = replaceLastWord(line2, option.word)
      return {
        line1,
        line2: newLine2,
        improved: true,
        newRhymeType: "rica"
      }
    }
  }

  // Se não encontrar rica, tenta toante (para gêneros que aceitam)
  if (rhymeRules.allowAssonantRhymes) {
    const toante = findAssonantRhyme(lastWord1, lastWord2, genre)
    if (toante) {
      const newLine2 = replaceLastWord(line2, toante)
      return {
        line1,
        line2: newLine2,
        improved: true,
        newRhymeType: "toante"
      }
    }
  }

  return null
}

// ✅ NOVAS FUNÇÕES AUXILIARES
function getWordClass(word: string): string {
  // Em implementação real, usaria um dicionário morfológico
  // Para MVP, usamos regras simples:
  const verbs = ["ar", "er", "ir"]
  if (verbs.some(v => word.endsWith(v))) return "verbo"
  
  const abstractNouns = ["ade", "ção", "são", "dade", "tude"]
  if (abstractNouns.some(s => word.endsWith(s))) return "substantivo_abstrato"
  
  return "substantivo_concreto"
}

function isPerfectRhyme(word1: string, word2: string): boolean {
  // Extrai vogal tônica + consoantes finais
  const getRhymeEnding = (w: string) => {
    const normalized = w.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    // Encontra a última vogal tônica
    const vowels = "aeiouáàâãéèêíìîóòôõúùû"
    let lastVowelIndex = -1
    for (let i = normalized.length - 1; i >= 0; i--) {
      if (vowels.includes(normalized[i])) {
        lastVowelIndex = i
        break
      }
    }
    return lastVowelIndex !== -1 ? normalized.slice(lastVowelIndex) : normalized
  }
  
  return getRhymeEnding(word1) === getRhymeEnding(word2)
}

function replaceLastWord(line: string, newWord: string): string {
  return line.replace(/\b\w+([^\w]*)$/, newWord + "$1")
}

function findAssonantRhyme(word1: string, word2: string, genre: string): string | null {
  // Para MVP, retorna uma opção fixa
  const assonantMap: Record<string, string> = {
    "viver": "sofrer",
    "amor": "dor", // aceitável em sertanejo moderno
    "cidade": "verdade"
  }
  return assonantMap[word1.toLowerCase()] || null
}

// ✅ ATUALIZA A FUNÇÃO PRINCIPAL
async function enhanceRhymePair(
  line1: string,
  line2: string,
  genre: string,
  theme: string,
  creativity: number,
): Promise<{ line1: string; line2: string; improved: boolean; newRhymeType?: string } | null> {
  const word1 = getLastWord(line1)
  const word2 = getLastWord(line2)
  
  if (!word1 || !word2) return null
  
  // Primeiro tenta rima rica
  const richEnhancement = enhanceToRichRhyme(line1, line2, word1, word2, genre)
  if (richEnhancement) return richEnhancement
  
  // Depois tenta toante (se permitido)
  const rhymeRules = getUniversalRhymeRules(genre)
  if (rhymeRules.allowAssonantRhymes) {
    const toanteWord = findAssonantRhyme(word1, word2, genre)
    if (toanteWord && toanteWord !== word2) {
      return {
        line1,
        line2: replaceLastWord(line2, toanteWord),
        improved: true,
        newRhymeType: "toante"
      }
    }
  }
  
  return null
}
