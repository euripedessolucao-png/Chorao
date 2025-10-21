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
  "amor",
  "calor",
  "você",
  "café",
  "sofá",
  "avó",
  "avô",
  "paletó",
  "jiló",
  "cipó",
  "vatapá",
  "acarajé",
  "rapaz",
  "feliz",
  "capaz",
]

// Palavras proparoxítonas comuns (antepenúltima sílaba tônica)
const PROPAROXITONAS_COMUNS = [
  "música",
  "público",
  "lâmpada",
  "pássaro",
  "árvore",
  "número",
  "último",
  "único",
  "mágico",
  "prático",
  "simpático",
]

/**
 * Identifica se uma palavra é oxítona (aguda), paroxítona (grave) ou proparoxítona (esdrúxula)
 */
function identificarTonicidade(palavra: string): "oxitona" | "paroxitona" | "proparoxitona" {
  const palavraLower = palavra.toLowerCase().replace(/[.,!?;:]/g, "")

  // Verifica se é oxítona
  if (OXITONAS_COMUNS.includes(palavraLower)) {
    return "oxitona"
  }

  // Verifica se é proparoxítona
  if (PROPAROXITONAS_COMUNS.includes(palavraLower)) {
    return "proparoxitona"
  }

  // Regras gerais de acentuação
  if (palavraLower.match(/[áéíóú]$/)) {
    return "oxitona" // Termina com vogal acentuada = oxítona
  }

  if (palavraLower.match(/[áéíóú][a-z]{2,}$/)) {
    return "proparoxitona" // Acento na antepenúltima = proparoxítona
  }

  // Padrão: maioria das palavras em português são paroxítonas
  return "paroxitona"
}

/**
 * Aplica sinalefa/elisão: junta vogais adjacentes
 */
function aplicarSinalefa(texto: string): string {
  let resultado = texto

  // Remove espaços entre vogais átonas
  // Exemplo: "que estou" -> "que-estou" (conta como 2 sílabas, não 3)
  resultado = resultado.replace(/([aeiouáéíóúâêôãõ])\s+([aeiouáéíóúâêôãõ])/gi, "$1$2")

  return resultado
}

/**
 * Conta sílabas poéticas seguindo as regras brasileiras
 */
export function contarSilabasPoeticas(verso: string): number {
  if (!verso || verso.trim().length === 0) return 0

  // Remove pontuação do final para análise
  const versoLimpo = verso.trim().replace(/[.,!?;:]+$/, "")

  // Aplica sinalefa
  const versoComSinalefa = aplicarSinalefa(versoLimpo)

  // Separa em palavras
  const palavras = versoComSinalefa.split(/\s+/).filter((p) => p.length > 0)
  if (palavras.length === 0) return 0

  // Pega a última palavra para determinar tonicidade
  const ultimaPalavra = palavras[palavras.length - 1]
  const tonicidade = identificarTonicidade(ultimaPalavra)

  // Conta sílabas gramaticais (aproximação)
  let silabasGramaticais = 0
  for (const palavra of palavras) {
    // Conta vogais como aproximação de sílabas
    const vogaisNaPalavra = palavra.match(/[aeiouáéíóúâêôãõ]/gi)
    silabasGramaticais += vogaisNaPalavra ? vogaisNaPalavra.length : 0
  }

  // Aplica regra de contagem até a tônica
  let silabasPoeticas = silabasGramaticais

  if (tonicidade === "paroxitona") {
    // Descarta 1 sílaba final
    silabasPoeticas = Math.max(1, silabasGramaticais - 1)
  } else if (tonicidade === "proparoxitona") {
    // Descarta 2 sílabas finais
    silabasPoeticas = Math.max(1, silabasGramaticais - 2)
  }
  // Oxítona: mantém todas as sílabas

  return silabasPoeticas
}

/**
 * Verifica se um verso tem enjambement (continua no próximo)
 */
export function temEnjambement(verso: string): boolean {
  const versoTrimmed = verso.trim()

  // Verifica se termina com vírgula, reticências, ou outros sinais de continuação
  return /[,;:]$/.test(versoTrimmed) || /\.\.\.$/.test(versoTrimmed)
}

/**
 * Valida um verso considerando enjambement
 */
export function validarVersoComEnjambement(
  verso: string,
  proximoVerso: string | null,
  maxSilabas: number,
): {
  silabas: number
  valido: boolean
  temEnjambement: boolean
  mensagem: string
} {
  const silabas = contarSilabasPoeticas(verso)
  const temEnj = temEnjambement(verso)

  // Se tem enjambement, não marca como erro
  if (temEnj && proximoVerso) {
    return {
      silabas,
      valido: true, // Considera válido porque continua no próximo verso
      temEnjambement: true,
      mensagem: `${silabas} sílabas (continua no próximo verso)`,
    }
  }

  const valido = silabas <= maxSilabas

  return {
    silabas,
    valido,
    temEnjambement: temEnj,
    mensagem: valido ? `${silabas} sílabas ✓` : `${silabas} sílabas (máximo: ${maxSilabas})`,
  }
}

/**
 * Exemplos de teste
 */
export const EXEMPLOS_ESCANSAO = {
  enjambement: {
    verso1: "Saí da sua sombra, que tentava me apagar,",
    verso2: "E voltei a ver a vida, voltei a respirar!",
    explicacao: "Primeiro verso termina com vírgula (enjambement) e continua no segundo. Isso é CORRETO.",
  },
  contagemAteTonica: {
    verso: "Minha terra tem palmeiras",
    silabas: "Mi-nha-ter-ra-tem-pal-MEI(ras)",
    contagem: 7,
    explicacao: "Conta até 'MEI' (última tônica), descarta 'ras'",
  },
  sinalefa: {
    verso: "Que estou amando",
    silabas: "que-es-tou-a-man-do",
    contagem: 5,
    explicacao: "Sinalefa: 'que+es' = 1 sílaba, 'tou+a' = 1 sílaba",
  },
}
