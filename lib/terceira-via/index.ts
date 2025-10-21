// lib/terceira-via/index.ts - TERCEIRA VIA COMPLETA EM UM ÚNICO ARQUIVO

import { generateText } from "ai"
import { getGenreConfig } from "@/lib/genre-config"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter"

// ============================================================================
// INTERFACES
// ============================================================================

export interface TerceiraViaAnalysis {
  score_geral: number
  pontos_fracos: string[]
  sugestoes: string[]
  versos_problematicos: Array<{
    linha: string
    problema: string
    sugestao: string
  }>
}

// ============================================================================
// FUNÇÕES PRINCIPAIS
// ============================================================================

/**
 * Analisa uma letra completa usando a Terceira Via
 */
export function analisarTerceiraVia(lyrics: string, genre: string, theme: string): TerceiraViaAnalysis {
  console.log(`[TerceiraVia] 🔍 Analisando letra...`)
  
  const lines = lyrics.split('\n').filter(line => 
    line.trim() && !line.startsWith('[') && !line.startsWith('(') && !line.includes('Instruments:')
  )
  
  const problemas: string[] = []
  const versosProblematicos: Array<{linha: string, problema: string, sugestao: string}> = []
  
  lines.forEach((line) => {
    const problemasLinha: string[] = []
    
    // Detecta palavras cortadas
    if (/(^|\s)nã[^o]/.test(line.toLowerCase())) {
      problemasLinha.push('Palavra cortada: "nã"')
    }
    if (/direçã(\s|$)/.test(line.toLowerCase())) {
      problemasLinha.push('Palavra cortada: "direçã"')
    }
    if (/raç(\s|$)/.test(line.toLowerCase())) {
      problemasLinha.push('Palavra cortada: "raç"')
    }
    if (/láç/.test(line.toLowerCase())) {
      problemasLinha.push('Palavra cortada: "láç"')
    }
    if (/heranç(\s|$)/.test(line.toLowerCase())) {
      problemasLinha.push('Palavra cortada: "heranç"')
    }
    
    if (problemasLinha.length > 0) {
      problemas.push(...problemasLinha)
      versosProblematicos.push({
        linha: line,
        problema: problemasLinha.join(', '),
        sugestao: aplicarCorrecoesImediatas(line)
      })
    }
  })
  
  const scoreFinal = Math.max(40, 100 - (problemas.length * 8))
  
  return {
    score_geral: scoreFinal,
    pontos_fracos: problemas,
    sugestoes: ['Use palavras completas com acentuação correta'],
    versos_problematicos: versosProblematicos
  }
}

/**
 * Aplica correções da Terceira Via a uma linha
 */
export async function applyTerceiraViaToLine(
  line: string,
  index: number,
  context: string,
  isPerformanceMode: boolean,
  additionalRequirements?: string,
  genre?: string,
): Promise<string> {
  if (!line.trim() || line.startsWith("[") || line.startsWith("(") || line.includes("Instruments:")) {
    return line
  }

  try {
    console.log(`[TerceiraVia] 🔧 Linha ${index}: "${line.substring(0, 40)}..."`)

    // 1. Correções imediatas
    let correctedLine = aplicarCorrecoesImediatas(line)
    
    // 2. Se ainda tem problemas, processa com IA
    if (temProblemasCriticos(correctedLine)) {
      const improvedLine = await processarComIA(correctedLine, genre, context, additionalRequirements)
      return improvedLine
    }

    return correctedLine

  } catch (error) {
    console.error(`[TerceiraVia] ❌ Erro na linha ${index}`)
    return aplicarCorrecoesImediatas(line)
  }
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Correções imediatas para problemas críticos
 */
function aplicarCorrecoesImediatas(line: string): string {
  let corrected = line
  
  const correcoes = [
    { regex: /nã(\s|$)/gi, correction: 'não ' },
    { regex: /direçã(\s|$)/gi, correction: 'direção ' },
    { regex: /raç(\s|$)/gi, correction: 'raça ' },
    { regex: /láç/gi, correction: 'laço' },
    { regex: /heranç(\s|$)/gi, correction: 'herança ' },
    { regex: /d'ouro/gi, correction: 'de ouro' },
    { regex: /sem direçã/gi, correction: 'sem direção' },
    { regex: /volto pra heranç/gi, correction: 'volto pra herança' },
  ]
  
  correcoes.forEach(({ regex, correction }) => {
    corrected = corrected.replace(regex, correction)
  })
  
  return corrected.trim()
}

/**
 * Verifica se a linha tem problemas críticos
 */
function temProblemasCriticos(line: string): boolean {
  const problemas = [
    /nã(\s|$)/gi,
    /direçã(\s|$)/gi, 
    /raç(\s|$)/gi,
    /láç/gi,
    /heranç(\s|$)/gi,
  ]
  
  return problemas.some(problema => problema.test(line))
}

/**
 * Processa linha com IA para melhorias
 */
async function processarComIA(
  line: string,
  genre?: string,
  context?: string,
  additionalRequirements?: string
): Promise<string> {
  try {
    const prompt = `Corrija esta linha de música ${genre}:

LINHA: "${line}"
CONTEXTO: ${context}
${additionalRequirements ? `REQUISITOS: ${additionalRequirements}` : ''}

Corrija palavras cortadas e mantenha a naturalidade.
Retorne APENAS a linha corrigida:`

    const response = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.3,
    })

    return response.text?.trim() || line
  } catch (error) {
    return line
  }
}

// ============================================================================
// COMPATIBILIDADE
// ============================================================================

/**
 * Função legacy para compatibilidade
 */
export async function applyLegacyTerceiraVia(
  line: string,
  index: number,
  context: string,
  additionalRequirements?: string,
): Promise<string> {
  return applyTerceiraViaToLine(line, index, context, false, additionalRequirements)
}

/**
 * ThirdWayEngine para compatibilidade
 */
export const ThirdWayEngine = {
  generateThirdWayLine: async (
    line: string,
    genre: string,
    genreConfig: any,
    context: string,
    performanceMode: boolean,
    additionalRequirements?: string,
  ) => {
    return applyTerceiraViaToLine(line, 0, context, performanceMode, additionalRequirements, genre)
  }
}
