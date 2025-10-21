// @/lib/terceira-via/terceira-via-unified.ts - VERSÃO COMPLETA E UNIFICADA

import { generateText } from "ai"
import { getGenreConfig } from "@/lib/genre-config"

// ============================================================================
// INTERFACES E TIPOS
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
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Correções imediatas para problemas críticos
 */
function aplicarCorrecoesImediatas(line: string): string {
  let corrected = line
  
  const correcoesImediatas = [
    { regex: /nã(\s|$)/gi, correction: 'não ' },
    { regex: /direçã(\s|$)/gi, correction: 'direção ' },
    { regex: /raç(\s|$)/gi, correction: 'raça ' },
    { regex: /láç/gi, correction: 'laço' },
    { regex: /heranç(\s|$)/gi, correction: 'herança ' },
    { regex: /d'ouro/gi, correction: 'de ouro' },
    { regex: /sem direçã/gi, correction: 'sem direção' },
    { regex: /volto pra heranç/gi, correction: 'volto pra herança' },
  ]
  
  correcoesImediatas.forEach(({ regex, correction }) => {
    if (regex.test(corrected)) {
      corrected = corrected.replace(regex, correction)
    }
  })
  
  return corrected.trim()
}

/**
 * Verifica se uma linha precisa de melhorias adicionais
 */
function precisaDeMelhorias(line: string): boolean {
  const problemas = [
    /nã(\s|$)/gi,
    /direçã(\s|$)/gi,
    /raç(\s|$)/gi,
    /láç/gi,
    /heranç(\s|$)/gi,
    /d'ouro/gi,
  ]
  
  return problemas.some(problema => problema.test(line))
}

/**
 * Sugere correções para problemas identificados
 */
function sugerirCorrecao(line: string, problemas: string[]): string {
  let sugestao = line
  
  problemas.forEach(problema => {
    if (problema.includes('nã')) {
      sugestao = sugestao.replace(/nã(\s|$)/gi, 'não ')
    }
    if (problema.includes('direçã')) {
      sugestao = sugestao.replace(/direçã(\s|$)/gi, 'direção ')
    }
    if (problema.includes('raç')) {
      sugestao = sugestao.replace(/raç(\s|$)/gi, 'raça ')
    }
    if (problema.includes('láç')) {
      sugestao = sugestao.replace(/láç/gi, 'laço')
    }
    if (problema.includes('heranç')) {
      sugestao = sugestao.replace(/heranç(\s|$)/gi, 'herança ')
    }
    if (problema.includes("d'ouro")) {
      sugestao = sugestao.replace(/d'ouro/gi, 'de ouro')
    }
  })
  
  return sugestao
}

/**
 * Gera sugestões baseadas nos problemas e gênero
 */
function gerarSugestoes(problemas: string[], genre: string): string[] {
  const sugestoes: string[] = []
  
  if (problemas.some(p => p.includes('cortada'))) {
    sugestoes.push('Use palavras completas com acentuação correta')
    sugestoes.push('Evite cortar palavras como "não", "direção", "herança"')
  }
  
  if (problemas.some(p => p.includes('incompleta'))) {
    sugestoes.push('Complete as expressões para maior clareza')
    sugestoes.push('Use artigos e preposições quando necessário')
  }
  
  if (genre.includes('sertanejo')) {
    sugestoes.push('Use linguagem coloquial natural: "pra", "tá", "cê"')
  }
  
  return sugestoes
}

// ============================================================================
// FUNÇÕES PRINCIPAIS
// ============================================================================

/**
 * Analisa uma letra completa usando a Terceira Via
 */
export function analisarTerceiraVia(lyrics: string, genre: string, theme: string): TerceiraViaAnalysis {
  console.log(`[TerceiraVia] 🔍 Analisando letra do gênero: ${genre}`)
  
  const lines = lyrics.split('\n').filter(line => 
    line.trim() && !line.startsWith('[') && !line.startsWith('(') && !line.includes('Instruments:')
  )
  
  const problemas: string[] = []
  const versosProblematicos: Array<{linha: string, problema: string, sugestao: string}> = []
  
  // Detecção de problemas críticos
  lines.forEach((line, index) => {
    const problemasLinha: string[] = []
    
    // Palavras cortadas
    if (/(^|\s)nã[^o]/.test(line.toLowerCase())) {
      problemasLinha.push('Palavra cortada: "nã" deve ser "não"')
    }
    if (/direçã(\s|$)/.test(line.toLowerCase())) {
      problemasLinha.push('Palavra cortada: "direçã" deve ser "direção"')
    }
    if (/raç(\s|$)/.test(line.toLowerCase())) {
      problemasLinha.push('Palavra cortada: "raç" deve ser "raça"')
    }
    if (/láç/.test(line.toLowerCase())) {
      problemasLinha.push('Palavra cortada: "láç" deve ser "laço"')
    }
    if (/heranç(\s|$)/.test(line.toLowerCase())) {
      problemasLinha.push('Palavra cortada: "heranç" deve ser "herança"')
    }
    
    // Expressões incompletas
    if (line.includes('sem direçã')) {
      problemasLinha.push('Expressão incompleta: "sem direçã"')
    }
    if (line.includes('volto pra heranç')) {
      problemasLinha.push('Expressão incompleta: "volto pra heranç"')
    }
    
    if (problemasLinha.length > 0) {
      problemas.push(...problemasLinha)
      versosProblematicos.push({
        linha: line,
        problema: problemasLinha.join(', '),
        sugestao: sugerirCorrecao(line, problemasLinha)
      })
    }
  })
  
  // Calcula score baseado nos problemas
  const scoreBase = 100
  const penalidadePorProblema = 8
  const scoreFinal = Math.max(40, scoreBase - (problemas.length * penalidadePorProblema))
  
  console.log(`[TerceiraVia] 📊 Score: ${scoreFinal} (${problemas.length} problemas)`)
  
  return {
    score_geral: scoreFinal,
    pontos_fracos: problemas,
    sugestoes: gerarSugestoes(problemas, genre),
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
    console.log(`[TerceiraVia] 🔧 Processando linha ${index}: "${line.substring(0, 40)}..."`)

    // Aplicar correções imediatas para problemas críticos
    let correctedLine = aplicarCorrecoesImediatas(line)
    
    // Se ainda precisa de melhorias, usa o mecanismo avançado
    if (precisaDeMelhorias(correctedLine)) {
      console.log(`[TerceiraVia] 🚀 Aplicando melhorias avançadas para linha ${index}`)
      
      // Simulação de processamento avançado - pode ser expandido posteriormente
      const improvedLine = await processarLinhaAvancado(
        correctedLine,
        genre || "sertanejo-moderno",
        context,
        additionalRequirements
      )

      console.log(`[TerceiraVia] ✅ Linha ${index} melhorada: "${improvedLine}"`)
      return improvedLine
    }

    console.log(`[TerceiraVia] ✅ Linha ${index} já otimizada: "${correctedLine}"`)
    return correctedLine

  } catch (error) {
    console.error(`[TerceiraVia] ❌ Erro na linha ${index}:`, error)
    return aplicarCorrecoesImediatas(line)
  }
}

/**
 * Processamento avançado de linha (placeholder para futura expansão)
 */
async function processarLinhaAvancado(
  line: string,
  genre: string,
  context: string,
  additionalRequirements?: string
): Promise<string> {
  try {
    const prompt = `Melhore esta linha de música ${genre}:

LINHA: "${line}"
CONTEXTO: ${context}
${additionalRequirements ? `REQUISITOS: ${additionalRequirements}` : ''}

REGRAS:
- Mantenha o significado original
- Use palavras completas e corretas
- Máximo 11 sílabas
- Linguagem natural brasileira

Retorne APENAS a linha melhorada:`

    const response = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.3,
    })

    return response.text?.trim() || line
  } catch (error) {
    console.error(`[TerceiraVia-Avancado] ❌ Erro no processamento avançado:`, error)
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
