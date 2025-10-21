// @/lib/terceira-via.ts - VERSÃO CORRIGIDA SEM ERROS DE SINTAXE

import { generateText } from "ai"
import { getGenreConfig } from "@/lib/genre-config"
import { ThirdWayEngine } from "./third-way-converter"

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

/**
 * CORREÇÕES IMEDIATAS PARA PROBLEMAS CRÍTICOS
 */
function aplicarCorrecoesImediatas(line: string): string {
  let corrected = line
  
  // ✅ CORREÇÕES CRÍTICAS - APLICADAS SEMPRE
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
      console.log(`[TerceiraVia-QuickFix] 🔧 Aplicada correção: ${regex} → ${correction}`)
    }
  })
  
  return corrected.trim()
}

/**
 * VERIFICA SE UMA LINHA PRECISA DE MELHORIAS ADICIONAIS
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
 * SUGERE CORREÇÕES PARA PROBLEMAS IDENTIFICADOS
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
 * GERA SUGESTÕES BASEADAS NOS PROBLEMAS E GÊNERO
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
  
  // SUGESTÕES ESPECÍFICAS POR GÊNERO
  if (genre.includes('sertanejo')) {
    sugestoes.push('Use linguagem coloquial natural: "pra", "tá", "cê"')
    sugestoes.push('Mantenha a autenticidade da narrativa sertaneja')
  }
  
  return sugestoes
}

/**
 * ANALISA UMA LETRA COMPLETA USANDO A TERCEIRA VIA
 */
export function analisarTerceiraVia(lyrics: string, genre: string, theme: string): TerceiraViaAnalysis {
  console.log(`[TerceiraVia] 🔍 Analisando letra do gênero: ${genre}`)
  
  const lines = lyrics.split('\n').filter(line => 
    line.trim() && !line.startsWith('[') && !line.startsWith('(') && !line.includes('Instruments:')
  )
  
  const problemas: string[] = []
  const versosProblematicos: Array<{linha: string, problema: string, sugestao: string}> = []
  
  // ✅ DETECÇÃO DE PROBLEMAS CRÍTICOS
  lines.forEach((line, index) => {
    const problemasLinha: string[] = []
    
    // 1. PALAVRAS CORTADAS
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
    
    // 2. EXPRESSÕES INCOMPLETAS
    if (line.includes('sem direçã')) {
      problemasLinha.push('Expressão incompleta: "sem direçã"')
    }
    if (line.includes('volto pra heranç')) {
      problemasLinha.push('Expressão incompleta: "volto pra heranç"')
    }
    
    // 3. CONSTRUÇÕES ESTRANHAS
    if (line.includes("d'ouro")) {
      problemasLinha.push('Contração forçada: "d\'ouro" soa artificial')
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
  
  // CALCULA SCORE BASEADO NOS PROBLEMAS
  const scoreBase = 100
  const penalidadePorProblema = 8
  const scoreFinal = Math.max(40, scoreBase - (problemas.length * penalidadePorProblema))
  
  console.log(`[TerceiraVia] 📊 Score calculado: ${scoreFinal} (${problemas.length} problemas)`)
  
  return {
    score_geral: scoreFinal,
    pontos_fracos: problemas,
    sugestoes: gerarSugestoes(problemas, genre),
    versos_problematicos: versosProblematicos
  }
}

/**
 * APLICA CORREÇÕES DA TERCEIRA VIA - VERSÃO CORRIGIDA
 */
export async function applyTerceiraViaToLine(
  line: string,
  index: number,
  context: string,
  isPerformanceMode: boolean,
  additionalRequirements?: string,
  genre?: string,
  // ✅ NOVO: PARÂMETRO genreConfig ADICIONADO
  genreConfig?: any,
): Promise<string> {
  if (!line.trim() || line.startsWith("[") || line.startsWith("(") || line.includes("Instruments:")) {
    return line
  }

  try {
    console.log(`[TerceiraVia] 🔧 Processando linha ${index}: "${line.substring(0, 40)}..."`)

    // ✅ CORREÇÃO CRÍTICA: GARANTIR QUE TEMOS genreConfig
    const finalGenre = genre || "sertanejo-moderno"
    const finalGenreConfig = genreConfig || getGenreConfig(finalGenre)
    
    console.log(`[TerceiraVia] 🎯 Gênero: ${finalGenre}, Config: ${!!finalGenreConfig}`)

    // ✅ APLICAR CORREÇÕES IMEDIATAS PARA PROBLEMAS CRÍTICOS
    let correctedLine = aplicarCorrecoesImediatas(line)
    
    // ✅ SE AINDA PRECISA DE MELHORIAS, USA O THIRD WAY ENGINE
    if (precisaDeMelhorias(correctedLine)) {
      console.log(`[TerceiraVia] 🚀 Usando ThirdWayEngine para linha ${index}`)
      
      const improvedLine = await ThirdWayEngine.generateThirdWayLine(
        correctedLine,
        finalGenre,
        finalGenreConfig,
        context,
        isPerformanceMode,
        additionalRequirements,
      )

      console.log(`[TerceiraVia] ✅ Linha ${index} melhorada: "${improvedLine}"`)
      return improvedLine
    }

    console.log(`[TerceiraVia] ✅ Linha ${index} já otimizada: "${correctedLine}"`)
    return correctedLine

  } catch (error) {
    console.error(`[TerceiraVia] ❌ Erro na linha ${index}:`, error)
    // ✅ FALLBACK: APLICA CORREÇÕES BÁSICAS MESMO COM ERRO
    return aplicarCorrecoesImediatas(line)
  }
}

/**
 * FUNÇÃO LEGACY PARA COMPATIBILIDADE
 */
async function applyLegacyTerceiraVia(
  line: string,
  index: number,
  context: string,
  additionalRequirements?: string,
): Promise<string> {
  return line
}

export { applyLegacyTerceiraVia }
