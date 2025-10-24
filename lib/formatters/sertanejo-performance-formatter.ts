// lib/formatters/sertanejo-performance-formatter.ts

/**
 * Formata letras de sertanejo com instruções de performance
 */
export function formatSertanejoPerformance(lyrics: string, useRandomStructure = false): string {
  console.log("[SertanejoFormatter] Formatando para performance...")

  let formatted = lyrics

  // Adiciona marcações de performance para refrões
  formatted = formatted.replace(/\[Refrão\]/gi, (match, offset) => {
    const isFirstChorus = offset < lyrics.length / 3
    if (isFirstChorus) {
      return "[Refrão]\n(Performance: Voz principal com ênfase emocional)"
    }
    return "[Refrão]\n(Performance: Público canta junto)"
  })

  // Adiciona marcações para versos
  formatted = formatted.replace(/\[Verso (\d+)\]/gi, (match, num) => {
    return `[Verso ${num}]\n(Performance: Voz suave e intimista)`
  })

  // Adiciona marcações para pontes
  formatted = formatted.replace(/\[Ponte\]/gi, () => {
    return "[Ponte]\n(Performance: Crescendo emocional)"
  })

  return formatted
}

/**
 * Determina se deve usar formatação de performance
 */
export function shouldUsePerformanceFormat(genre: string, performanceMode?: string): boolean {
  if (performanceMode === "performance") {
    return true
  }

  // Gêneros que se beneficiam de formatação de performance
  const performanceGenres = ["Sertanejo Sofrência", "Sertanejo Universitário", "Sertanejo Moderno", "Sertanejo Raiz"]

  return performanceGenres.some((g) => genre.includes(g))
}
