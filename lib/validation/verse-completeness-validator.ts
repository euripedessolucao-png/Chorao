/**
 * Validador de Completude de Versos
 * Garante que versos não sejam cortados ou incompletos
 */

import { generateText } from "ai"

interface VerseCompletenessResult {
  valid: boolean
  incompleteVerses: Array<{
    line: string
    lineNumber: number
    reason: string
  }>
  warnings: string[]
  score: number
}

/**
 * Valida se os versos estão completos e não cortados
 */
export function validateVerseCompleteness(lyrics: string): VerseCompletenessResult {
  const lines = lyrics.split("\n")
  const incompleteVerses: Array<{ line: string; lineNumber: number; reason: string }> = []
  const warnings: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const lineNumber = i + 1

    // Ignora linhas vazias, tags de seção e instrumentação
    if (!line || line.startsWith("[") || line.startsWith("(")) {
      continue
    }

    // Remove tags inline para análise
    const cleanLine = line
      .replace(/\[.*?\]/g, "")
      .replace(/$$.*?$$/g, "")
      .trim()
    if (!cleanLine) continue

    const incompletePhrases = [
      /cada novo$/i,
      /onde posso$/i,
      /do que$/i,
      /eu vejo o$/i,
      /em ti me$/i,
      /a cuidar do$/i,
      /pela beleza$/i,
      /é um$/i,
      /vale só o$/i,
      /isso é$/i,
      /pra$/i,
      /de$/i,
      /\bo$/i,
      /\ba$/i,
      /\be$/i,
      /\bna$/i,
      /\bno$/i,
      /\bda$/i,
      /\bdo$/i,
      /\bpelo$/i,
      /\bpela$/i,
      /\bcom$/i,
      /\bsem$/i,
      /\bpor$/i,
      /\bque$/i,
      /\bse$/i,
      /\bmeu$/i,
      /\bminha$/i,
      /\bteu$/i,
      /\btua$/i,
    ]

    for (const pattern of incompletePhrases) {
      if (pattern.test(cleanLine)) {
        incompleteVerses.push({
          line: cleanLine,
          lineNumber,
          reason: `Verso cortado - termina com frase incompleta: "${cleanLine.match(pattern)?.[0]}"`,
        })
        break
      }
    }

    // Verifica se o verso termina abruptamente (sem pontuação ou palavra completa)
    if (cleanLine.endsWith("-") || (cleanLine.endsWith(",") && i === lines.length - 1)) {
      incompleteVerses.push({
        line: cleanLine,
        lineNumber,
        reason: "Verso parece incompleto (termina com hífen ou vírgula final)",
      })
    }

    // Verifica se o verso é muito curto (menos de 3 palavras pode indicar corte)
    const words = cleanLine.split(/\s+/).filter((w) => w.length > 0)
    if (words.length < 3 && !cleanLine.match(/^(Ah|Oh|Ei|Hey|Yeah|Uh|Hum)$/i)) {
      warnings.push(`Linha ${lineNumber}: Verso muito curto (${words.length} palavras) - "${cleanLine}"`)
    }

    // Verifica se há palavras cortadas (terminam com hífen sem espaço)
    if (cleanLine.match(/\w+-$/)) {
      incompleteVerses.push({
        line: cleanLine,
        lineNumber,
        reason: "Palavra cortada no final do verso",
      })
    }

    // Verifica se há elipses que podem indicar corte
    if (cleanLine.endsWith("...") && i < lines.length - 1) {
      const nextLine = lines[i + 1].trim()
      if (nextLine && !nextLine.startsWith("[") && !nextLine.startsWith("(")) {
        warnings.push(`Linha ${lineNumber}: Elipse pode indicar continuação - "${cleanLine}"`)
      }
    }
  }

  const score = incompleteVerses.length === 0 ? 100 : Math.max(0, 100 - incompleteVerses.length * 20)

  return {
    valid: incompleteVerses.length === 0,
    incompleteVerses,
    warnings,
    score,
  }
}

/**
 * Corrige versos incompletos automaticamente usando IA
 */
export async function fixIncompleteVerses(
  lyrics: string,
  genre?: string,
  theme?: string,
): Promise<{ fixed: string; changes: string[] }> {
  const validation = validateVerseCompleteness(lyrics)

  if (validation.valid) {
    return { fixed: lyrics, changes: [] }
  }

  const changes: string[] = []
  const lines = lyrics.split("\n")

  for (const incomplete of validation.incompleteVerses) {
    const lineIndex = incomplete.lineNumber - 1
    const incompleteLine = lines[lineIndex]

    try {
      console.log(`[VerseCompleteness] 🔧 Reescrevendo verso incompleto: "${incompleteLine}"`)

      const context = []
      if (lineIndex > 0) context.push(`Verso anterior: ${lines[lineIndex - 1]}`)
      if (lineIndex < lines.length - 1) context.push(`Verso seguinte: ${lines[lineIndex + 1]}`)

      const prompt = `Você é um compositor profissional. Complete este verso que foi cortado:

VERSO INCOMPLETO: "${incompleteLine}"
${context.length > 0 ? `CONTEXTO:\n${context.join("\n")}` : ""}
${genre ? `GÊNERO: ${genre}` : ""}
${theme ? `TEMA: ${theme}` : ""}

REGRAS:
- Complete o verso de forma natural e coerente
- Mantenha o estilo e métrica do contexto
- O verso deve fazer sentido sozinho
- Máximo 12 sílabas
- Retorne APENAS o verso completo, sem explicações

VERSO COMPLETO:`

      const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt,
        temperature: 0.7,
        // ❌ REMOVIDO: maxTokens: 100, // Esta propriedade não existe e causa o erro
      })

      const completedVerse = text.trim()
      if (completedVerse && completedVerse.length > incompleteLine.length) {
        lines[lineIndex] = completedVerse
        changes.push(`Linha ${incomplete.lineNumber}: "${incompleteLine}" → "${completedVerse}"`)
      }
    } catch (error) {
      console.error(`[VerseCompleteness] ❌ Erro ao completar verso:`, error)
      // Fallback: remove pontuação problemática
      if (incompleteLine.endsWith("-")) {
        lines[lineIndex] = incompleteLine.slice(0, -1).trim()
        changes.push(`Linha ${incomplete.lineNumber}: Removido hífen final`)
      }
    }
  }

  return {
    fixed: lines.join("\n"),
    changes,
  }
}
