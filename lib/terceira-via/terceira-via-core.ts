// ✅ APLICAÇÃO DA TERCEIRA VIA COM THIRD WAY ENGINE (ATUALIZADA)
export async function applyTerceiraViaToLine(
  line: string,
  index: number,
  context: string,
  isPerformanceMode: boolean,
  additionalRequirements?: string,
  genre?: string,
  genreConfig?: any // ✅ NOVO PARÂMETRO OPCIONAL
): Promise<string> {
  if (!line.trim() || line.startsWith("[") || line.startsWith("(") || line.includes("Instruments:")) {
    return line
  }

  try {
    console.log(`[TerceiraVia] 🔧 Processando linha ${index}: "${line.substring(0, 40)}..."`)

    // ✅ USA THIRD WAY ENGINE PARA CORREÇÕES AVANÇADAS
    if (genre && genreConfig) {
      const improvedLine = await ThirdWayEngine.generateThirdWayLine(
        line,
        genre,
        genreConfig, // ✅ USA A CONFIGURAÇÃO PASSADA
        context,
        isPerformanceMode,
        additionalRequirements
      )

      console.log(`[TerceiraVia] ✅ Linha ${index} melhorada com Third Way: "${improvedLine}"`)
      return improvedLine
    }

    // ✅ FALLBACK PARA SISTEMA ORIGINAL (se não tiver genreConfig)
    return await applyLegacyTerceiraVia(line, index, context, additionalRequirements)

  } catch (error) {
    console.error(`[TerceiraVia] ❌ Erro na linha ${index}:`, error)
    return line
  }
}
