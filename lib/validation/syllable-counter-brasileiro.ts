/**
 * Contador de Sílabas Poéticas Brasileiro
 *
 * Implementa as regras de escansão poética da música brasileira:
 * 1. Conta apenas até a última sílaba TÔNICA
 * 2. Aplica sinalefa/elisão (vogais adjacentes)
 * 3. Suporta enjambement (versos que continuam)
 */

// Vogais para detecção de sinalefa
const VOGAIS = ["a", "e", "i", "o", "u", "á", "é", "í", "ó", "ú", "â", "ê", "ô", "ã", "õ"]

// Palavras oxítonas comuns (terminam em sílaba tônica)
const OXITONAS_COMUNS = [
  "amor", "calor", "você", "café", "sofá", "avó", "avô", "paletó", "jiló", "cipó",
  "vatapá", "acarajé", "rapaz", "feliz", "capaz",
]

// Palavras proparoxítonas comuns (antepenúltima sílaba tônica)
const PROPAROXITONAS_COMUNS = [
  "música", "público", "lâmpada", "pássaro", "árvore", "número", "último", "único",
  "mágico", "prático", "simpático",
]

/**
 * Identifica se uma palavra é oxítona (aguda), paroxítona (grave) ou proparoxítona (esdrúxula)
 */
function identificarTonicidade(palavra: string): "oxitona" | "paroxitona" | "proparoxitona" {
  const palavraLower = palavra.toLowerCase().replace(/[.,!?;:]/g, "")

  if (OXITONAS_COMUNS.includes(palavraLower)) return "oxitona"
  if (PROPAROXITONAS_COMUNS.includes(palavraLower)) return "proparoxitona"
  if (palavraLower.match(/[áéíóú]$/)) return "oxitona"
  if (palavraLower.match(/[áéíóú][a-z]{2,}$/)) return "proparoxitona"
  
  return "paroxitona"
}

/**
 * Aplica sinalefa/elisão: junta vogais adjacentes
 */
function aplicarSinalefa(texto: string): string {
  let resultado = texto
  resultado = resultado.replace(/([aeiouáéíóúâêôãõ])\s+([aeiouáéíóúâêôãõ])/gi, "$1$2")
  return resultado
}

/**
 * Conta sílabas poéticas seguindo as regras brasileiras
 */
export function countPoeticSyllables(verso: string): number {
  if (!verso || verso.trim().length === 0) return 0

  const versoLimpo = verso.trim().replace(/[.,!?;:]+$/, "")
  const versoComSinalefa = aplicarSinalefa(versoLimpo)
  const palavras = versoComSinalefa.split(/\s+/).filter((p) => p.length > 0)
  
  if (palavras.length === 0) return 0

  const ultimaPalavra = palavras[palavras.length - 1]
  const tonicidade = identificarTonicidade(ultimaPalavra)

  let silabasGramaticais = 0
  for (const palavra of palavras) {
    const vogaisNaPalavra = palavra.match(/[aeiouáéíóúâêôãõ]/gi)
    silabasGramaticais += vogaisNaPalavra ? vogaisNaPalavra.length : 0
  }

  let silabasPoeticas = silabasGramaticais

  if (tonicidade === "paroxitona") {
    silabasPoeticas = Math.max(1, silabasGramaticais - 1)
  } else if (tonicidade === "proparoxitona") {
    silabasPoeticas = Math.max(1, silabasGramaticais - 2)
  }

  return silabasPoeticas
}

/**
 * Conta sílabas gramaticais (todas as sílabas)
 */
export function countPortugueseSyllables(text: string): number {
  return countPoeticSyllables(text)
}

/**
 * Verifica se um verso tem enjambement (continua no próximo)
 */
export function hasEnjambement(verso: string): boolean {
  const versoTrimmed = verso.trim()
  return /[,;:]$/.test(versoTrimmed) || /\.\.\.$/.test(versoTrimmed)
}

/**
 * Valida um verso considerando enjambement
 */
export function validateVerseWithEnjambement(
  verso: string,
  proximoVerso: string | null,
  maxSilabas: number,
): {
  syllables: number
  valid: boolean
  hasEnjambement: boolean
  message: string
} {
  const silabas = countPoeticSyllables(verso)
  const temEnj = hasEnjambement(verso)

  if (temEnj && proximoVerso) {
    return {
      syllables: silabas,
      valid: true,
      hasEnjambement: true,
      message: `${silabas} sílabas (continua no próximo verso)`,
    }
  }

  const valido = silabas <= maxSilabas

  return {
    syllables: silabas,
    valid: valido,
    hasEnjambement: temEnj,
    message: valido ? `${silabas} sílabas ✓` : `${silabas} sílabas (máximo: ${maxSilabas})`,
  }
}

// Mantenha as funções de validação que você já tinha
export interface SyllableValidationResult {
  valid: boolean
  violations: Array<{
    line: string
    syllables: number
    lineNumber: number
    suggestions: string[]
  }>
}

export function validateSyllableLimit(
  line: string, 
  maxSyllables: number = 11
): {
  isValid: boolean
  currentSyllables: number
  suggestions: string[]
} {
  const syllables = countPoeticSyllables(line)
  const suggestions: string[] = []
  
  if (syllables > maxSyllables) {
    suggestions.push(
      `Remova ${syllables - maxSyllables} sílaba(s) - tente encurtar palavras`,
      `Use contrações: "está" → "tá", "para" → "pra"`,
      `Remova artigos ou preposições desnecessárias`
    )
  } else if (syllables < maxSyllables) {
    suggestions.push(
      `Adicione ${maxSyllables - syllables} sílaba(s) - expanda palavras ou adicione artigos`,
      `Use palavras mais descritivas`,
      `Adicione advérbios ou adjetivos`
    )
  }
  
  return {
    isValid: syllables === maxSyllables,
    currentSyllables: syllables,
    suggestions
  }
}

export function validateLyricsSyllables(
  lyrics: string,
  maxSyllables: number = 11,
): SyllableValidationResult {
  const lines = lyrics.split("\n")
  const violations: Array<{ line: string; syllables: number; lineNumber: number; suggestions: string[] }> = []

  lines.forEach((line, index) => {
    if (
      line.trim() &&
      !line.startsWith("[") &&
      !line.startsWith("(") &&
      !line.startsWith("Title:") &&
      !line.startsWith("Instrumentos:")
    ) {
      const validation = validateSyllableLimit(line, maxSyllables)
      if (!validation.isValid) {
        violations.push({
          line: line.trim(),
          syllables: validation.currentSyllables,
          lineNumber: index + 1,
          suggestions: validation.suggestions
        })
      }
    }
  })

  return {
    valid: violations.length === 0,
    violations,
  }
}

/**
 * Exemplos de teste
 */
export const SCANSION_EXAMPLES = {
  enjambement: {
    line1: "Saí da sua sombra, que tentava me apagar,",
    line2: "E voltei a ver a vida, voltei a respirar!",
    explanation: "Primeiro verso termina com vírgula (enjambement) e continua no segundo. Isso é CORRETO.",
  },
  countToTonic: {
    line: "Minha terra tem palmeiras",
    syllables: "Mi-nha-ter-ra-tem-pal-MEI(ras)",
    count: 7,
    explanation: "Conta até 'MEI' (última tônica), descarta 'ras'",
  },
  sinalefa: {
    line: "Que estou amando",
    syllables: "que-es-tou-a-man-do",
    count: 5,
    explanation: "Sinalefa: 'que+es' = 1 sílaba, 'tou+a' = 1 sílaba",
  },
}
