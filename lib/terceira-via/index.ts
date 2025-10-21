// lib/terceira-via/index.ts - NOVA VERSÃO SIMPLIFICADA

// ✅ EXPORTAÇÕES EXPLÍCITAS SEM CONFLITOS
export { TerceiraViaAnalysis } from "./terceira-via-completa/terceira-via-core"
export { analisarTerceiraVia, applyTerceiraViaToLine } from "./terceira-via-completa/terceira-via-core"
export { ThirdWayEngine } from "./terceira-via-completa/third-way-converter"

// ✅ FUNÇÃO DE COMPATIBILIDADE
export async function applyLegacyTerceiraVia(
  line: string,
  index: number,
  context: string,
  additionalRequirements?: string,
): Promise<string> {
  const { applyTerceiraViaToLine } = await import("./terceira-via-completa/terceira-via-core")
  return applyTerceiraViaToLine(line, index, context, false, additionalRequirements)
}
