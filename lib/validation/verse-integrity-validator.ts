/**
 * VALIDADOR DE INTEGRIDADE DE VERSOS
 * 
 * AGORA COM AS MESMAS REGRAS INTELIGENTES DO REWRITER
 * Detecta problemas além da contagem de sílabas:
 * - Versos incompletos (sem verbo, muito curtos)
 * - Versos quebrados (aspas abertas, vírgulas soltas)
 * - Versos com mais de 11 sílabas (LIMITE ABSOLUTO)
 */

import { countPoeticSyllables } from "./syllable-counter-brasileiro"

export interface VerseIssue {
  line: number
  text: string
  issues: string[]
  syllables: number
  severity: "error" | "warning"
}

export interface VerseValidationResult {
  valid: boolean
  issues: VerseIssue[]
  totalVerses: number
  brokenVerses: number
  longVerses: number
}

const ABSOLUTE_MAX_SYLLABLES = 11

/**
 * ✅ DETECTA VERSOS INCOMPLETOS COM AS MESMAS REGRAS DO REWRITER
 */
function detectBrokenVerse(text: string): string[] {
  const issues: string[] = []
  const trimmed = text.trim()

  // Remove tags inline e aspas para análise (mesma lógica do rewriter)
  const cleanLine = trimmed
    .replace(/\[.*?\]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/^"|"$/g, "")
    .trim()

  if (!cleanLine) return issues

  const words = cleanLine.split(/\s+/).filter(w => w.length > 0)
  
  // ✅ REGRAS IDÊNTICAS AO REWRITER
  const isIncomplete = 
    words.length < 3 || // Menos de 3 palavras
    /[,-]$/.test(cleanLine) || // Termina com vírgula ou traço
    /\b(e|do|por|me|te|em|a|o|de|da|no|na|com|se|tão|que|um|uma|uns|umas)\s*$/i.test(cleanLine) // Termina com preposição

  if (isIncomplete) {
    if (words.length < 3) {
      issues.push("Verso muito curto (menos de 3 palavras)")
    } else if (/[,-]$/.test(cleanLine)) {
      issues.push("Termina com pontuação incompleta")
    } else {
      const match = cleanLine.match(/\b(e|do|por|me|te|em|a|o|de|da|no|na|com|se|tão|que|um|uma)\s*$/i)
      issues.push(`Termina com preposição/artigo: "${match?.[0]}"`)
    }
  }

  // Verifica palavras cortadas (terminam com hífen)
  if (cleanLine.match(/\w+-$/)) {
    issues.push("Palavra cortada no final do verso")
  }

  // Aspas abertas sem fechar
  const openQuotes = (trimmed.match(/"/g) || []).length
  if (openQuotes % 2 !== 0) {
    issues.push("Aspas não fechadas")
  }

  // Começa com letra minúscula (pode indicar continuação de verso anterior)
  if (cleanLine.length > 0 && cleanLine[0] === cleanLine[0].toLowerCase() && !/^[0-9]/.test(cleanLine)) {
    issues.push("Começa com minúscula (possível continuação)")
  }

  // Verifica estrutura gramatical básica (apenas para versos mais longos)
  if (words.length >= 4 && !hasValidStructure(cleanLine)) {
    issues.push("Estrutura gramatical fraca ou sem verbo claro")
  }

  return issues
}

/**
 * Verifica se o verso tem estrutura válida (versão simplificada)
 */
function hasValidStructure(text: string): boolean {
  // Padrões de frases completas comuns em música brasileira
  const validPatterns = [
    // Padrão sujeito + verbo + complemento
    /\b(eu|você|ele|ela|nós|eles|a gente|o coração|a vida|o amor|a fé)\s+\w+[aei](\s+\w+){1,3}/i,
    // Padrão verbo + complemento
    /\b(sinto|vejo|creio|acho|quero|posso|devo|vou|sei|amo|adoro|agradeço)\s+\w+(\s+\w+){1,3}/i,
    // Frases com "que" completas
    /\b(que)\s+\w+\s+\w+(\s+\w+){1,2}/i,
    // Expressões completas comuns
    /\b(é|são|era|foi|está|fica|vai|tem|houve)\s+\w+(\s+\w+){1,3}/i
  ]

  return validPatterns.some(pattern => pattern.test(text))
}

/**
 * Valida integridade de todos os versos da letra
 */
export function validateVerseIntegrity(lyrics: string): VerseValidationResult {
  const lines = lyrics.split("\n")
  const issues: VerseIssue[] = []
  let totalVerses = 0
  let brokenVerses = 0
  let longVerses = 0

  lines.forEach((line, index) => {
    const trimmed = line.trim()

    // ✅ MESMA LÓGICA DE IGNORAR TAGS DO REWRITER
    if (!trimmed || 
        trimmed.startsWith("### [") || 
        trimmed.startsWith("(Instrumentation)") || 
        trimmed.startsWith("(Genre)") ||
        trimmed.includes("Instrumental")) {
      return
    }

    totalVerses++
    const syllables = countPoeticSyllables(trimmed)
    const verseIssues = detectBrokenVerse(trimmed)

    // ERRO CRÍTICO: Mais de 11 sílabas
    if (syllables > ABSOLUTE_MAX_SYLLABLES) {
      longVerses++
      issues.push({
        line: index + 1,
        text: trimmed,
        issues: [`❌ ${syllables} sílabas (máximo: ${ABSOLUTE_MAX_SYLLABLES})`],
        syllables,
        severity: "error",
      })
    }

    // AVISO: Verso quebrado/incompleto (usando regras do rewriter)
    if (verseIssues.length > 0) {
      brokenVerses++
      issues.push({
        line: index + 1,
        text: trimmed,
        issues: verseIssues,
        syllables,
        severity: verseIssues.some(issue => issue.includes("❌")) ? "error" : "warning",
      })
    }
  })

  return {
    valid: issues.filter((i) => i.severity === "error").length === 0,
    issues,
    totalVerses,
    brokenVerses,
    longVerses,
  }
}

/**
 * ✅ CORRETOR INTELIGENTE - REPLICA EXATAMENTE A LÓGICA DO REWRITER
 */
export function smartFixIncompleteLines(lyrics: string): string {
  console.log("[VerseIntegrity] 🔧 Aplicando correção inteligente")
  
  const lines = lyrics.split('\n')
  const fixedLines: string[] = []
  
  let corrections = 0

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim()
    
    // Ignora tags e metadata - MESMA LÓGICA DO REWRITER
    if (!line || line.startsWith('### [') || line.startsWith('(Instrumentation)') || line.startsWith('(Genre)')) {
      fixedLines.push(line)
      continue
    }

    // Remove aspas se existirem - MESMA LÓGICA
    line = line.replace(/^"|"$/g, '').trim()
    
    const cleanLine = line.replace(/\[.*?\]/g, "").replace(/\(.*?\)/g, "").trim()
    if (!cleanLine) {
      fixedLines.push(line)
      continue
    }

    const words = cleanLine.split(/\s+/).filter(w => w.length > 0)
    
    // ✅ DETECTA VERSOS INCOMPLETOS COM MESMAS REGRAS
    const isIncomplete = 
      words.length < 3 || // Menos de 3 palavras
      /[,-]$/.test(cleanLine) || // Termina com vírgula ou traço
      /\b(e|do|por|me|te|em|a|o|de|da|no|na|com|se|tão|que|um|uma|uns|umas)\s*$/i.test(cleanLine) // Termina com preposição

    if (isIncomplete && words.length > 0) {
      console.log(`[VerseIntegrity] 📝 Ajustando verso: "${cleanLine}"`)
      
      let fixedLine = line
      
      // Remove pontuação problemática - MESMA LÓGICA
      fixedLine = fixedLine.replace(/[,-]\s*$/, '').trim()
      
      // ✅ COMPLETAMENTO INTELIGENTE BASEADO NO CONTEXTO - MESMA LÓGICA
      const lastWord = words[words.length - 1].toLowerCase()
      
      // Completamentos contextuais para música brasileira - MESMA TABELA
      const completions: Record<string, string> = {
        'coração': 'aberto e grato',
        'vida': 'que recebo de Ti',
        'gratidão': 'transbordando em mim',
        'amor': 'que nunca falha',
        'fé': 'que me sustenta',
        'alegria': 'que inunda minha alma',
        'paz': 'que acalma o coração',
        'força': 'para seguir em frente',
        'luz': 'que ilumina meu caminho',
        'esperança': 'que renova meus dias',
        'sorriso': 'no rosto iluminado',
        'caminho': 'abençoado por Deus',
        'dom': 'divino que recebi',
        'alma': 'que se renova em paz',
        'essência': 'divina do amor',
        'canção': 'que canto com fervor',
        'mão': 'amiga que me guia',
        'razão': 'do meu viver aqui',
        'lar': 'eterno nos céus',
        'lição': 'que levo pra vida'
      }
      
      if (completions[lastWord]) {
        fixedLine += ' ' + completions[lastWord]
      } else {
        // Completamento genérico natural para música brasileira - MESMA LÓGICA
        const genericCompletions = [
          'com muito amor',
          'e gratidão',
          'pra sempre vou lembrar',
          'nunca vou esquecer',
          'é o que sinto agora',
          'me faz feliz demais',
          'que Deus me concedeu'
        ]
        const randomCompletion = genericCompletions[Math.floor(Math.random() * genericCompletions.length)]
        fixedLine += ' ' + randomCompletion
      }
      
      // Garante pontuação final adequada - MESMA LÓGICA
      if (!/[.!?]$/.test(fixedLine)) {
        fixedLine = fixedLine.replace(/[.,;:]$/, '') + '.'
      }
      
      // Restaura aspas se necessário - MESMA LÓGICA
      if (lines[i].trim().startsWith('"')) {
        fixedLine = `"${fixedLine}"`
      }
      
      console.log(`[VerseIntegrity] ✅ CORRIGIDO: "${fixedLine}"`)
      fixedLines.push(fixedLine)
      corrections++
    } else {
      fixedLines.push(line)
    }
  }

  console.log(`[VerseIntegrity] 🎉 CORREÇÃO CONCLUÍDA: ${corrections} versos corrigidos`)
  return fixedLines.join('\n')
}

/**
 * Formata relatório de validação para exibição
 */
export function formatValidationReport(result: VerseValidationResult): string {
  if (result.valid && result.brokenVerses === 0) {
    return `✅ Letra validada: ${result.totalVerses} versos OK`
  }

  let report = `⚠️ Problemas encontrados:\n\n`

  if (result.longVerses > 0) {
    report += `❌ ${result.longVerses} verso(s) com mais de ${ABSOLUTE_MAX_SYLLABLES} sílabas\n`
  }

  if (result.brokenVerses > 0) {
    report += `⚠️ ${result.brokenVerses} verso(s) incompleto(s) ou quebrado(s)\n`
  }

  report += `\nDetalhes:\n`
  result.issues.forEach((issue) => {
    const icon = issue.severity === "error" ? "❌" : "⚠️"
    report += `\n${icon} Linha ${issue.line}: "${issue.text}"\n`
    report += `  Sílabas: ${issue.syllables}\n`
    issue.issues.forEach((i) => (report += `  • ${i}\n`))
  })

  return report
}

/**
 * Função auxiliar para correção rápida
 */
export function quickFixLyrics(lyrics: string): { fixed: string; corrections: number } {
  const originalLines = lyrics.split('\n').filter(line => line.trim()).length
  const fixed = smartFixIncompleteLines(lyrics)
  const fixedLines = fixed.split('\n').filter(line => line.trim()).length
  
  return {
    fixed,
    corrections: Math.max(0, fixedLines - originalLines)
  }
}
