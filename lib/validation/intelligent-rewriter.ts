/**
 * Sistema de reescrita inteligente de versos
 * Reescreve linhas longas em vez de cortá-las
 */

import { countSyllablesSingingPtBr } from "./singing-syllable-counter"
import { generateText } from "ai"

function _isHeadingLine(line: string): boolean {
  return /^\s*\[(?:INTRO|VERSE\s*\d*|PRE-?CHORUS|CHORUS|FINAL\s+CHORUS|BRIDGE|SOLO|OUTRO)/i.test(line)
}

function trimLineToSyllablesSinging(line: string, max: number): string {
  const words = line.split(/\s+/)
  const result: string[] = []

  for (const word of words) {
    const testLine = [...result, word].join(" ")
    const syllables = countSyllablesSingingPtBr(testLine, {
      applyElisions: true,
      applyContractions: true,
    })

    if (syllables <= max) {
      result.push(word)
    } else {
      break
    }
  }

  return result.join(" ").trim() || words[0] || line
}

async function _suggestCorrection(line: string, maxSyllables: number): Promise<string | null> {
  try {
    const prompt = `Reescreva este verso brasileiro para ter no máximo ${maxSyllables} sílabas cantáveis.
Use elisões naturais como "d'amor", "cê", "pra", "tô".
Mantenha o significado e fluência.

Verso: "${line}"

Verso reescrito:`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.3,
    })

    const suggestion = text?.trim().replace(/^["']|["']$/g, "") || null

    if (suggestion && suggestion !== line) {
      const suggestedSyllables = countSyllablesSingingPtBr(suggestion, {
        applyElisions: true,
        applyContractions: true,
      })

      if (suggestedSyllables <= maxSyllables) {
        return suggestion
      }
    }
  } catch (error) {
    console.warn("Erro na sugestão de correção:", error)
  }

  return null
}

export async function _rewriteWithinSyllables(line: string, max: number): Promise<string> {
  const trimmed = (line || "").trim().replace(/\s+/g, " ")
  const current = countSyllablesSingingPtBr(trimmed, {
    applyElisions: true,
    applyContractions: true,
  })

  if (current <= max) return trimmed

  // Tenta reescrita inteligente primeiro
  const suggestion = await _suggestCorrection(trimmed, max)
  if (
    suggestion &&
    countSyllablesSingingPtBr(suggestion, {
      applyElisions: true,
      applyContractions: true,
    }) <= max
  ) {
    return suggestion
  }

  // Fallback para corte tradicional
  return trimLineToSyllablesSinging(trimmed, max)
}

export async function enforceSyllableLimitAll(lyrics: string, max = 12): Promise<string> {
  const lines = (lyrics || "").split(/\r?\n/)

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i] ?? ""
    if (_isHeadingLine(l) || /^\s*$/.test(l)) continue

    let updated = l

    // Regra de respiração com vírgula: reescreve cada cláusula em <= max/2
    const commaIdx = updated.indexOf(",")
    if (commaIdx !== -1) {
      const leftRaw = updated.slice(0, commaIdx).trim()
      const rightRaw = updated.slice(commaIdx + 1).trim()
      let left = leftRaw
      let right = rightRaw

      const leftLimit = Math.floor(max / 2)
      const rightLimit = Math.ceil(max / 2)

      if (left) {
        if (
          countSyllablesSingingPtBr(left, {
            applyElisions: true,
            applyContractions: true,
          }) > leftLimit
        ) {
          left = await _rewriteWithinSyllables(left, leftLimit)
        }
      }

      if (right) {
        if (
          countSyllablesSingingPtBr(right, {
            applyElisions: true,
            applyContractions: true,
          }) > rightLimit
        ) {
          right = await _rewriteWithinSyllables(right, rightLimit)
        }
      }

      if (left && right) {
        updated = `${left}, ${right}`
      } else if (left) {
        updated = left
      } else if (right) {
        updated = right
      }
    }

    // Verifica linha completa
    if (
      countSyllablesSingingPtBr(updated, {
        applyElisions: true,
        applyContractions: true,
      }) > max
    ) {
      updated = await _rewriteWithinSyllables(updated, max)
    }

    // Limpezas finais contra "penduradas"
    if (/\blado a\s*$/i.test(updated)) {
      updated = updated.replace(/\blado a\s*$/i, "lado")
    }

    updated = updated.replace(/\b(de|da|do|no|na|num|numa|pra|pro|para|por|em|com|a|o|que)\s*$/i, "").trim()

    lines[i] = updated
  }

  return lines.join("\n")
}
