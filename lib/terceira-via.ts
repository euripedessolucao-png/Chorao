// lib/terceira-via/terceira-via-orchestrator.ts

import { ThirdWayEngine } from "./third-way-converter";
import { analisarTerceiraVia, type TerceiraViaAnalysis } from "./analysis";

// ✅ Tipagem explícita para configuração de gênero
export interface GenreConfig {
  rhymeRules?: {
    minRichRhymePercentage?: number;
    allowAssonantRhymes?: boolean;
    requirePerfectRhymes?: boolean;
  };
  syllableRange?: {
    min: number;
    max: number;
    ideal?: number;
  };
  stylisticPreferences?: {
    avoidCliches?: boolean;
    preferEmotionalHooks?: boolean;
    useContractions?: boolean;
    visualImageryLevel?: "low" | "medium" | "high";
  };
  languageTone?: "colloquial" | "poetic" | "dramatic" | "minimalist";
}

export interface TerceiraViaOptions {
  isPerformanceMode?: boolean;
  additionalRequirements?: string;
  maxRetries?: number;
}

/**
 * Aplica a Terceira Via a uma linha de letra com contexto e restrições de gênero
 * 
 * A "Terceira Via" é uma reescrita criativa que:
 * - Preserva a intenção emocional original
 * - Melhora métrica, rima e naturalidade
 * - Adapta-se ao gênero musical
 */
export async function applyTerceiraViaToLine(
  line: string,
  index: number,
  context: string,
  genre: string,
  genreConfig: GenreConfig,
  options: TerceiraViaOptions = {}
): Promise<string> {
  // 1. Validação de entrada
  if (!line?.trim()) return line || "";
  if (shouldSkipLine(line)) return line;

  const {
    isPerformanceMode = false,
    additionalRequirements = "",
    maxRetries = 2
  } = options;

  // 2. Validação de gênero e configuração
  const cleanGenre = genre?.trim();
  if (!cleanGenre || typeof cleanGenre !== "string") {
    console.warn(`[TerceiraVia] ⚠️ Gênero inválido para linha ${index}. Retornando original.`);
    return line;
  }

  if (!genreConfig || typeof genreConfig !== "object") {
    console.warn(`[TerceiraVia] ⚠️ Configuração de gênero ausente/inválida. Usando padrões.`);
    genreConfig = buildDefaultGenreConfig(cleanGenre);
  }

  // 3. Tenta aplicar a Terceira Via
  try {
    console.log(`[TerceiraVia] 🔧 Processando linha ${index} [${cleanGenre}]: "${truncate(line, 40)}..."`);

    let improvedLine = line;
    let attempt = 0;

    do {
      improvedLine = await ThirdWayEngine.generateThirdWayLine(
        line,
        cleanGenre,
        genreConfig,
        context,
        isPerformanceMode,
        additionalRequirements
      );

      // Validação pós-geração (evita saídas vazias ou piores)
      if (isValidImprovement(line, improvedLine, genreConfig)) {
        console.log(`[TerceiraVia] ✅ Linha ${index} aprimorada: "${truncate(improvedLine, 50)}"`);
        return improvedLine;
      }

      attempt++;
      if (attempt < maxRetries) {
        console.log(`[TerceiraVia] 🔄 Tentativa ${attempt + 1} para linha ${index} (melhoria inválida)`);
      }
    } while (attempt < maxRetries);

    // 4. Fallback: se todas as tentativas falharem, retorna original
    console.warn(`[TerceiraVia] ⚠️ Todas as tentativas falharam para linha ${index}. Mantendo original.`);
    return line;

  } catch (error) {
    console.error(`[TerceiraVia] ❌ Erro crítico na linha ${index}:`, {
      message: (error as Error).message,
      stack: (error as Error).stack?.split('\n').slice(0, 3).join('\n'),
      originalLine: truncate(line, 60)
    });
    return line; // Nunca quebra o fluxo
  }
}

// ─── Funções auxiliares ────────────────────────────────────────────────

function shouldSkipLine(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed.startsWith("[") ||
    trimmed.startsWith("(") ||
    trimmed.startsWith("{") ||
    trimmed.includes("Instrumentos:") ||
    trimmed.includes("Instruments:") ||
    trimmed.includes("BPM:") ||
    trimmed.includes("Key:")
  );
}

function truncate(str: string, maxLength: number): string {
  return str.length > maxLength ? str.substring(0, maxLength) + "…" : str;
}

function buildDefaultGenreConfig(genre: string): GenreConfig {
  const lower = genre.toLowerCase();
  if (lower.includes("sertanejo raiz")) {
    return {
      syllableRange: { min: 8, max: 11 },
      stylisticPreferences: { avoidCliches:
