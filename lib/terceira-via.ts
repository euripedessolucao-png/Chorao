// ✅ APLICAÇÃO DA TERCEIRA VIA COM THIRD WAY ENGINE (ATUALIZADA)
import { ThirdWayEngine } from "./terceira-via/third-way-converter"

export { ThirdWayEngine } from "./terceira-via/third-way-converter"
export { analisarTerceiraVia, type TerceiraViaAnalysis } from "./terceira-via/analysis"

export async function applyTerceiraViaToLine(
  line: string,
  index: number,
  context: string,
  isPerformanceMode: boolean,
  additionalRequirements?: string,
  genre?: string,
  genreConfig?: any, // ✅ NOVO PARÂMETRO OPCIONAL
): Promise<string> {
  if (!line.trim() || line.startsWith("[") || line.startsWith("(") || line.includes("Instruments:")) {
    return line
  }

  try {
    console.log(`[TerceiraVia] 🔧 Processando linha ${index}: "${line.substring(0, 40)}..."`)

    if (genre && typeof genre === "string" && genre.trim() && genreConfig && typeof genreConfig === "object") {
      const improvedLine = await ThirdWayEngine.generateThirdWayLine(
        line,
        genre,
        genreConfig,
        context,
        isPerformanceMode,
        additionalRequirements,
      )

      console.log(`[TerceiraVia] ✅ Linha ${index} melhorada com Third Way: "${improvedLine}"`)
      return improvedLine
    }

    console.log(`[TerceiraVia] ⚠️ Genre ou genreConfig inválidos, retornando linha original`)
    return line
  } catch (error) {
    console.error(`[TerceiraVia] ❌ Erro na linha ${index}:`, error)
    return line
  }
}

async function applyLegacyTerceiraVia(
  line: string,
  index: number,
  context: string,
  additionalRequirements?: string,
): Promise<string> {
  // Placeholder for legacy implementation
  return line
}
