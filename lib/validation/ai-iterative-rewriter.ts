/**
 * Sistema de reescrita iterativa com IA
 * NUNCA corta versos - sempre reescreve com a IA até ficar perfeito
 */

import { generateText } from "ai"
import { countPoeticSyllables } from "./syllable-counter-brasileiro"

export interface IterativeRewriteResult {
  finalLyrics: string
  iterations: number
  fixedVerses: string[]
  success: boolean
}

/**
 * Reescreve a letra usando IA até que TODOS os versos estejam perfeitos
 * Máximo de 5 iterações para evitar loop infinito
 */
export async function rewriteUntilPerfect(
  lyrics: string,
  genre: string,
  minSyllables: number,
  maxSyllables: number,
  preserveChorus = true,
): Promise<IterativeRewriteResult> {
  const MAX_ITERATIONS = 5
  let currentLyrics = lyrics
  let iteration = 0
  const allFixedVerses: string[] = []

  console.log(`[Iterative-Rewriter] 🔄 Iniciando reescrita iterativa (${minSyllables}-${maxSyllables} sílabas)`)

  while (iteration < MAX_ITERATIONS) {
    iteration++
    console.log(`[Iterative-Rewriter] 📝 Iteração ${iteration}/${MAX_ITERATIONS}`)

    // Analisa versos problemáticos
    const analysis = analyzeVerses(currentLyrics, minSyllables, maxSyllables)

    if (analysis.problematicVerses.length === 0) {
      console.log(`[Iterative-Rewriter] ✅ Letra perfeita após ${iteration} iteração(ões)!`)
      return {
        finalLyrics: currentLyrics,
        iterations: iteration,
        fixedVerses: allFixedVerses,
        success: true,
      }
    }

    console.log(`[Iterative-Rewriter] 🚨 ${analysis.problematicVerses.length} verso(s) problemático(s)`)
    analysis.problematicVerses.slice(0, 3).forEach((v) => {
      console.log(`   - "${v.line}" (${v.syllables} sílabas, esperado: ${minSyllables}-${maxSyllables})`)
    })

    // Reescreve com IA
    const rewritten = await rewriteWithAI(
      currentLyrics,
      genre,
      analysis.problematicVerses,
      minSyllables,
      maxSyllables,
      preserveChorus,
    )

    if (rewritten) {
      currentLyrics = rewritten
      allFixedVerses.push(...analysis.problematicVerses.map((v) => v.line))
    } else {
      console.log(`[Iterative-Rewriter] ⚠️ IA falhou na iteração ${iteration}`)
      break
    }
  }

  console.log(`[Iterative-Rewriter] ⏹️ Parou após ${iteration} iteração(ões)`)

  return {
    finalLyrics: currentLyrics,
    iterations: iteration,
    fixedVerses: allFixedVerses,
    success: iteration < MAX_ITERATIONS,
  }
}

interface ProblematicVerse {
  line: string
  lineNumber: number
  syllables: number
  issue: "too_long" | "too_short" | "incomplete"
}

function analyzeVerses(
  lyrics: string,
  minSyllables: number,
  maxSyllables: number,
): { problematicVerses: ProblematicVerse[] } {
  const lines = lyrics.split("\n")
  const problematic: ProblematicVerse[] = []

  lines.forEach((line, index) => {
    const trimmed = line.trim()

    // Skip headers and metadata
    if (
      !trimmed ||
      trimmed.startsWith("###") ||
      trimmed.startsWith("[") ||
      trimmed.startsWith("(") ||
      trimmed.includes("Instrumentation")
    ) {
      return
    }

    const syllables = countPoeticSyllables(trimmed)

    // Verso muito longo
    if (syllables > maxSyllables) {
      problematic.push({
        line: trimmed,
        lineNumber: index + 1,
        syllables,
        issue: "too_long",
      })
      return
    }

    // Verso muito curto
    if (syllables < minSyllables) {
      problematic.push({
        line: trimmed,
        lineNumber: index + 1,
        syllables,
        issue: "too_short",
      })
      return
    }

    // Verso incompleto (termina com preposição, vírgula, etc)
    const endsIncomplete = /\b(de|da|do|em|no|na|com|sem|pra|pro|que|e|a|o|me|te|se)[,\s]*$/i.test(trimmed)
    const words = trimmed.split(/\s+/)

    if (endsIncomplete || words.length < 4) {
      problematic.push({
        line: trimmed,
        lineNumber: index + 1,
        syllables,
        issue: "incomplete",
      })
    }
  })

  return { problematicVerses: problematic }
}

async function rewriteWithAI(
  lyrics: string,
  genre: string,
  problematicVerses: ProblematicVerse[],
  minSyllables: number,
  maxSyllables: number,
  preserveChorus: boolean,
): Promise<string | null> {
  const prompt = `Você é um compositor profissional brasileiro especializado em ${genre}.

TAREFA: Reescrever APENAS os versos problemáticos abaixo, mantendo TODO o resto da letra EXATAMENTE IGUAL.

LETRA ATUAL:
${lyrics}

VERSOS PROBLEMÁTICOS (reescreva APENAS estes):
${problematicVerses
  .map((v, i) => {
    const issue =
      v.issue === "too_long"
        ? `muito longo (${v.syllables} sílabas, máx: ${maxSyllables})`
        : v.issue === "too_short"
          ? `muito curto (${v.syllables} sílabas, mín: ${minSyllables})`
          : `incompleto ou mal formado`
    return `${i + 1}. "${v.line}" - ${issue}`
  })
  .join("\n")}

REGRAS ABSOLUTAS:
1. Cada verso deve ter entre ${minSyllables} e ${maxSyllables} sílabas POÉTICAS
2. Sílabas poéticas = conta até a última sílaba TÔNICA + aplica SINALEFA
3. Vírgula é apenas RESPIRO - NÃO divide o verso em dois
4. NUNCA termine verso com: de, da, do, em, no, na, com, sem, pra, pro, que, e, a, o
5. NUNCA corte palavras no meio
6. Use contrações naturais: você→cê, está→tá, para→pra, que eu→qu'eu, de amor→d'amor
7. ${preserveChorus ? "NÃO altere o REFRÃO - ele deve ser idêntico em todas as repetições" : ""}
8. Mantenha o tema, rimas e emoção da letra original
9. REESCREVA completamente o verso se necessário - não tente apenas cortar

EXEMPLOS DE SINALEFA (fusão de vogais):
- "de amor" = de|a|mor = 2 sílabas poéticas (não 3)
- "que eu" = quêu = 1 sílaba poética (não 2)
- "na hora" = na|ho|ra = 2 sílabas poéticas (não 3)

EXEMPLO DE REESCRITA:
❌ "De coração partido eu vou seguindo em frente sozinho sem saber" (15 sílabas)
✅ "De coração partido eu sigo em frente" (9 sílabas poéticas: de|co|ra|ção|par|ti|do|eu|si|go→em|fren|te = com sinalefa)

Retorne APENAS a letra completa reescrita (sem explicações adicionais):`

  try {
    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.7,
    })

    return text.trim()
  } catch (error) {
    console.error("[Iterative-Rewriter] ❌ Erro na IA:", error)
    return null
  }
}
