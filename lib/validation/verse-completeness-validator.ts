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

    // Ignora linhas vazias, tags de seção, instrumentação e metadata
    if (!line || line.startsWith("### [") || line.startsWith("(Instrumentation)") || line.startsWith("(Genre)")) {
      continue
    }

    // Remove tags inline e aspas para análise
    const cleanLine = line
      .replace(/\[.*?\]/g, "")
      .replace(/$$.*?$$/g, "")
      .replace(/^"|"$/g, "")
      .trim()

    if (!cleanLine) continue

    // ✅ REGRAS INTELIGENTES DE COMPLETUDE - REPLICADAS DO REWRITER
    const words = cleanLine.split(/\s+/).filter((w) => w.length > 0)

    // Verifica se é um verso incompleto usando as mesmas regras do rewriter
    const isIncomplete =
      words.length < 3 || // Menos de 3 palavras
      /[,-]$/.test(cleanLine) || // Termina com vírgula ou traço
      /\b(e|do|por|me|te|em|a|o|de|da|no|na|com|se|tão|que|um|uma|uns|umas)\s*$/i.test(cleanLine) // Termina com preposição

    if (isIncomplete && words.length > 0) {
      incompleteVerses.push({
        line: line, // Mantém a linha original com formatação
        lineNumber,
        reason: `Verso incompleto - ${getIncompleteReason(cleanLine, words.length)}`,
      })
    }

    // Verifica palavras cortadas (terminam com hífen)
    if (cleanLine.match(/\w+-$/)) {
      incompleteVerses.push({
        line: line,
        lineNumber,
        reason: "Palavra cortada no final do verso",
      })
    }

    // Verifica versos muito curtos (apenas como warning)
    if (words.length < 3 && !cleanLine.match(/^(Ah|Oh|Ei|Hey|Yeah|Uh|Hum)$/i)) {
      warnings.push(`Linha ${lineNumber}: Verso muito curto (${words.length} palavras) - "${cleanLine}"`)
    }
  }

  const score = incompleteVerses.length === 0 ? 100 : Math.max(0, 100 - incompleteVerses.length * 15)

  return {
    valid: incompleteVerses.length === 0,
    incompleteVerses,
    warnings,
    score,
  }
}

/**
 * Retorna a razão específica para verso incompleto
 */
function getIncompleteReason(line: string, wordCount: number): string {
  if (wordCount < 3) return "muito curto (menos de 3 palavras)"
  if (/[,-]$/.test(line)) return "termina com pontuação incompleta"
  if (/\b(e|do|por|me|te|em|a|o|de|da|no|na|com|se|tão|que|um|uma)\s*$/i.test(line)) {
    const match = line.match(/\b(e|do|por|me|te|em|a|o|de|da|no|na|com|se|tão|que|um|uma)\s*$/i)
    return `termina com preposição/artigo: "${match?.[0]}"`
  }
  return "estrutura gramatical incompleta"
}

/**
 * Corrige versos incompletos automaticamente usando IA
 * AGORA REPLICA EXATAMENTE A MESMA LÓGICA DO REWRITER
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
  let fixedLyrics = lyrics

  // ✅ APLICA O MESMO CORRETOR INTELIGENTE DO REWRITER
  console.log("[VerseCompleteness] 🔧 Aplicando correção inteligente (mesma lógica do rewriter)")
  fixedLyrics = smartFixIncompleteLines(fixedLyrics, changes)

  return {
    fixed: fixedLyrics,
    changes,
  }
}

/**
 * ✅ CORRETOR INTELIGENTE - REPLICA EXATAMENTE A LÓGICA DO REWRITER
 */
function smartFixIncompleteLines(lyrics: string, changes: string[] = []): string {
  console.log("[SmartCorrector] 🔧 Aplicando correção inteligente")

  const lines = lyrics.split("\n")
  const fixedLines: string[] = []

  let corrections = 0

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim()

    // Ignora tags e metadata - MESMA LÓGICA DO REWRITER
    if (!line || line.startsWith("### [") || line.startsWith("(Instrumentation)") || line.startsWith("(Genre)")) {
      fixedLines.push(line)
      continue
    }

    // Remove aspas se existirem - MESMA LÓGICA
    line = line.replace(/^"|"$/g, "").trim()

    const cleanLine = line
      .replace(/\[.*?\]/g, "")
      .replace(/$$.*?$$/g, "")
      .trim()
    if (!cleanLine) {
      fixedLines.push(line)
      continue
    }

    const words = cleanLine.split(/\s+/).filter((w) => w.length > 0)

    // ✅ DETECTA VERSOS INCOMPLETOS COM MESMAS REGRAS
    const isIncomplete =
      words.length < 3 || // Menos de 3 palavras
      /[,-]$/.test(cleanLine) || // Termina com vírgula ou traço
      /\b(e|do|por|me|te|em|a|o|de|da|no|na|com|se|tão|que|um|uma|uns|umas)\s*$/i.test(cleanLine) // Termina com preposição

    if (isIncomplete && words.length > 0) {
      console.log(`[SmartCorrector] 📝 Ajustando verso: "${cleanLine}"`)

      let fixedLine = line

      // Remove pontuação problemática - MESMA LÓGICA
      fixedLine = fixedLine.replace(/[,-]\s*$/, "").trim()

      // ✅ COMPLETAMENTO INTELIGENTE BASEADO NO CONTEXTO - MESMA LÓGICA
      const lastWord = words[words.length - 1].toLowerCase()

      // Completamentos contextuais para música brasileira - MESMA TABELA
      const completions: Record<string, string> = {
        coração: "aberto e grato",
        vida: "que recebo de Ti",
        gratidão: "transbordando em mim",
        amor: "que nunca falha",
        fé: "que me sustenta",
        alegria: "que inunda minha alma",
        paz: "que acalma o coração",
        força: "para seguir em frente",
        luz: "que ilumina meu caminho",
        esperança: "que renova meus dias",
        sorriso: "no rosto iluminado",
        caminho: "abençoado por Deus",
        dom: "divino que recebi",
        alma: "que se renova em paz",
        essência: "divina do amor",
        canção: "que canto com fervor",
        mão: "amiga que me guia",
        razão: "do meu viver aqui",
        lar: "eterno nos céus",
        lição: "que levo pra vida",
      }

      if (completions[lastWord]) {
        fixedLine += " " + completions[lastWord]
        changes.push(`Linha ${i + 1}: Completado contexto "${lastWord}" → "${completions[lastWord]}"`)
      } else {
        // Completamento genérico natural para música brasileira - MESMA LÓGICA
        const genericCompletions = [
          "com muito amor",
          "e gratidão",
          "pra sempre vou lembrar",
          "nunca vou esquecer",
          "é o que sinto agora",
          "me faz feliz demais",
          "que Deus me concedeu",
        ]
        const randomCompletion = genericCompletions[Math.floor(Math.random() * genericCompletions.length)]
        fixedLine += " " + randomCompletion
        changes.push(`Linha ${i + 1}: Completado genericamente → "${randomCompletion}"`)
      }

      // Garante pontuação final adequada - MESMA LÓGICA
      if (!/[.!?]$/.test(fixedLine)) {
        fixedLine = fixedLine.replace(/[.,;:]$/, "") + "."
      }

      // Restaura aspas se necessário - MESMA LÓGICA
      if (lines[i].trim().startsWith('"')) {
        fixedLine = `"${fixedLine}"`
      }

      console.log(`[SmartCorrector] ✅ CORRIGIDO: "${fixedLine}"`)
      fixedLines.push(fixedLine)
      corrections++
    } else {
      fixedLines.push(line)
    }
  }

  console.log(`[SmartCorrector] 🎉 CORREÇÃO CONCLUÍDA: ${corrections} versos corrigidos`)
  return fixedLines.join("\n")
}

/**
 * Validação simplificada para uso rápido
 */
export function quickVerseCheck(lyrics: string): { hasIncomplete: boolean; issues: number } {
  const result = validateVerseCompleteness(lyrics)
  return {
    hasIncomplete: !result.valid,
    issues: result.incompleteVerses.length,
  }
}
