// lib/utils/capitalize-lyrics.ts

/**
 * REGRA UNIVERSAL: CAPITALIZAÇÃO PROFISSIONAL COM INTELIGÊNCIA LINGUÍSTICA
 * 
 * - Preserva contrações coloquiais em minúscula no início da frase ("pra", "pro", "pela")
 * - Capitaliza apenas palavras que devem ser capitalizadas
 * - Mantém tags e instruções intactas
 */
export function capitalizeLines(lyric: string): string {
  return lyric
    .split("\n")
    .map((line) => {
      const trimmed = line.trim()
      if (trimmed === "") return line

      // Mantém marcadores de seção em maiúsculas
      if (trimmed.startsWith("[")) {
        return trimmed.toUpperCase()
      }

      // Mantém instruções de instrumentos
      if (trimmed.startsWith("(Instruments:") || trimmed.startsWith("(Instrumentos:")) {
        return trimmed
      }

      // Regras inteligentes de capitalização
      const lowerLine = trimmed.toLowerCase()
      
      // NÃO capitaliza se começar com contrações coloquiais
      const colloquialStarts = ["pra ", "pro ", "pela ", "pelos ", "pelas ", "d'", "n'", "s'", "qu'"]
      if (colloquialStarts.some(prefix => lowerLine.startsWith(prefix))) {
        return trimmed.charAt(0).toLowerCase() + trimmed.slice(1)
      }

      // Capitaliza normalmente (ex: "cê", "você", "hoje", etc.)
      const firstChar = trimmed.charAt(0)
      if (firstChar === firstChar.toLowerCase()) {
        return firstChar.toUpperCase() + trimmed.slice(1)
      }

      return trimmed
    })
    .join("\n")
}

export function postProcessLyrics(lyric: string): string {
  return capitalizeLines(lyric)
}
