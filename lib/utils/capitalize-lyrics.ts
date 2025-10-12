/**
 * REGRA UNIVERSAL: CAPITALIZAÇÃO PROFISSIONAL
 *
 * Garante que todas as letras geradas tenham capitalização consistente e profissional:
 * - Primeira letra de cada linha em maiúscula
 * - Resto da linha em minúscula (exceto nomes próprios que o usuário pode adicionar)
 * - Marcadores de seção ([INTRO], [VERSO], etc.) sempre em maiúsculas
 *
 * Esta é uma regra de pós-processamento aplicada em TODAS as gerações.
 */

export function capitalizeLines(lyric: string): string {
  return lyric
    .split("\n")
    .map((line) => {
      const trimmed = line.trim()

      // Mantém linhas vazias
      if (trimmed === "") return line

      // Mantém marcadores de seção em maiúsculas: [INTRO], [VERSO], [REFRÃO], etc.
      if (trimmed.startsWith("[")) {
        return trimmed.toUpperCase()
      }

      // Mantém marcadores de instrumentos: (Instruments: [...])
      if (trimmed.startsWith("(Instruments:")) {
        return trimmed
      }

      // Capitaliza primeira letra da linha, resto em minúscula
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
    })
    .join("\n")
}

/**
 * Aplica capitalização profissional mantendo a estrutura original
 */
export function postProcessLyrics(lyric: string): string {
  return capitalizeLines(lyric)
}
