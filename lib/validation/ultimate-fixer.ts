// lib/validation/local-syllable-fixer.ts - VERSÃO COMPATÍVEL
import { countPoeticSyllables } from "./syllable-counter-brasileiro"

/**
 * Corretor Local de Sílabas - Compatível com Sistema Unificado
 * 
 * Função simples para correção local (frontend)
 * Usa limite de 12 sílabas do sistema unificado
 */
export function fixLineToMaxSyllables(line: string, maxSyllables: number = 12): string {
  const syllables = countPoeticSyllables(line)
  
  if (syllables <= maxSyllables) {
    return line
  }

  console.log(`[LocalFixer] Corrigindo linha: "${line}" (${syllables} sílabas)`)

  // ETAPA 1: Aplica contrações automáticas
  let fixed = applyAutomaticContractions(line)
  
  // Verifica se já resolveu
  const syllablesAfterContractions = countPoeticSyllables(fixed)
  if (syllablesAfterContractions <= maxSyllables) {
    console.log(`[LocalFixer] ✅ Resolvido com contrações: ${syllablesAfterContractions} sílabas`)
    return fixed
  }

  // ETAPA 2: Remove palavras desnecessárias
  fixed = removeUnnecessaryWords(fixed)
  const syllablesAfterCleanup = countPoeticSyllables(fixed)
  if (syllablesAfterCleanup <= maxSyllables) {
    console.log(`[LocalFixer] ✅ Resolvido com limpeza: ${syllablesAfterCleanup} sílabas`)
    return fixed
  }

  // ETAPA 3: Corte inteligente (último recurso)
  fixed = smartTrim(line, maxSyllables)
  console.log(`[LocalFixer] ✅ Aplicado corte inteligente: ${countPoeticSyllables(fixed)} sílabas`)
  
  return fixed
}

/**
 * Aplica contrações automáticas do português brasileiro
 */
function applyAutomaticContractions(line: string): string {
  const contractions = [
    { regex: /\bpara\b/gi, replacement: "pra" },
    { regex: /\bvocê\b/gi, replacement: "cê" },
    { regex: /\bestou\b/gi, replacement: "tô" },
    { regex: /\bestá\b/gi, replacement: "tá" },
    { regex: /\bestamos\b/gi, replacement: "tamo" },
    { regex: /\bestão\b/gi, replacement: "tão" },
    { regex: /\bcomigo\b/gi, replacement: "c'migo" },
    { regex: /\bde\s+([aeiou])/gi, replacement: "d'$1" },
    { regex: /\bna\s+([aeiou])/gi, replacement: "n'$1" },
  ]

  let result = line
  for (const contraction of contractions) {
    result = result.replace(contraction.regex, contraction.replacement)
  }

  return result
}

/**
 * Remove palavras desnecessárias/recuperáveis do contexto
 */
function removeUnnecessaryWords(line: string): string {
  const unnecessaryWords = [
    /\b(muito|pouco)\s+/gi,
    /\b(realmente|verdadeiramente)\s+/gi, 
    /\b(agora|nesse momento)\s+/gi,
    /\b(aqui|nesse lugar)\s+/gi,
    /\b(eu|você)\s+(eu|você)\b/gi, // Repetição
  ]

  let result = line
  for (const pattern of unnecessaryWords) {
    result = result.replace(pattern, ' ')
  }

  // Normaliza espaços
  return result.replace(/\s+/g, ' ').trim()
}

/**
 * Corte inteligente - mantém significado enquanto reduz sílabas
 */
function smartTrim(line: string, maxSyllables: number): string {
  const words = line.split(' ').filter(w => w.trim())
  let result = words[0] || line

  for (let i = 1; i < words.length; i++) {
    const testLine = words.slice(0, i + 1).join(' ')
    if (countPoeticSyllables(testLine) > maxSyllables) {
      break
    }
    result = testLine
  }

  return result
}

/**
 * ⚠️ MANTÉM UltimateFixer PARA COMPATIBILIDADE (se necessário)
 * Mas atualiza para usar 12 sílabas
 */
export class UltimateFixer {
  static fixLine(line: string): string {
    // Usa a função corrigida acima
    return fixLineToMaxSyllables(line, 12)
  }

  static fixFullLyrics(lyrics: string): string {
    const lines = lyrics.split('\n')
    const fixedLines = lines.map(line => {
      if (!line.trim() || line.startsWith('[')) {
        return line
      }
      return this.fixLine(line)
    })
    return fixedLines.join('\n')
  }
}
