/**
 * Sistema de detecção e correção de versos incompletos
 * Identifica e completa versos cortados ou incompletos
 */

import { generateText } from "ai"

interface IncompleteVerseDetection {
  isIncomplete: boolean
  reason: string
  confidence: number
}

/**
 * Detecta se um verso está incompleto
 */
export function detectIncompleteVerse(verse: string): IncompleteVerseDetection {
  const trimmed = verse.trim()

  // Remove marcações de seção
  const cleanVerse = trimmed.replace(/^\[.*?\]\s*/, "").trim()

  if (!cleanVerse) {
    return { isIncomplete: false, reason: "empty", confidence: 0 }
  }

  const words = cleanVerse.split(/\s+/)

  // Versos muito curtos (menos de 3 palavras)
  if (words.length < 3) {
    return {
      isIncomplete: true,
      reason: "too_short",
      confidence: 0.9,
    }
  }

  // Termina com preposição ou artigo
  const lastWord = words[words.length - 1].toLowerCase().replace(/[.,!?;:]$/, "")
  const danglingWords = [
    "de",
    "da",
    "do",
    "dos",
    "das",
    "a",
    "o",
    "os",
    "as",
    "em",
    "no",
    "na",
    "nos",
    "nas",
    "por",
    "para",
    "pra",
    "pro",
    "com",
    "sem",
    "que",
    "se",
    "me",
    "te",
    "lhe",
    "um",
    "uma",
    "uns",
    "umas",
    "meu",
    "minha",
    "seu",
    "sua",
    "esse",
    "essa",
    "este",
    "esta",
  ]

  if (danglingWords.includes(lastWord)) {
    return {
      isIncomplete: true,
      reason: "dangling_word",
      confidence: 0.95,
    }
  }

  // Termina com vírgula ou hífen (indica continuação)
  if (/[,-]\s*$/.test(cleanVerse)) {
    return {
      isIncomplete: true,
      reason: "punctuation_continuation",
      confidence: 0.85,
    }
  }

  // Frases que claramente precisam de complemento
  const incompletePatterns = [
    /não sei se\s*$/i,
    /não quero\s*$/i,
    /vou te\s*$/i,
    /vou me\s*$/i,
    /tentando\s*$/i,
    /querendo\s*$/i,
    /pensando\s*$/i,
    /esperando\s*$/i,
    /é\s*$/i,
    /foi\s*$/i,
    /era\s*$/i,
    /será\s*$/i,
  ]

  for (const pattern of incompletePatterns) {
    if (pattern.test(cleanVerse)) {
      return {
        isIncomplete: true,
        reason: "incomplete_phrase",
        confidence: 0.9,
      }
    }
  }

  return { isIncomplete: false, reason: "complete", confidence: 0.1 }
}

/**
 * Completa um verso incompleto usando IA
 */
export async function completeVerse(
  incompleteVerse: string,
  context: string,
  genre: string,
  maxSyllables: number,
): Promise<string> {
  try {
    const prompt = `Você é um compositor profissional de ${genre}.

Complete este verso incompleto de forma natural e poética.

VERSO INCOMPLETO: "${incompleteVerse}"

CONTEXTO DA LETRA:
${context}

REGRAS:
1. Complete o verso de forma que faça sentido completo
2. Mantenha o estilo e emoção do ${genre}
3. Máximo ${maxSyllables} sílabas no verso completo
4. Use linguagem natural e cantável
5. NÃO use aspas na resposta

VERSO COMPLETO:`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.7,
    })

    const completed = text.trim().replace(/^["']|["']$/g, "")

    if (completed && completed.length > incompleteVerse.length) {
      console.log(`[VerseCompleter] ✅ Completado: "${incompleteVerse}" → "${completed}"`)
      return completed
    }

    return incompleteVerse
  } catch (error) {
    console.error("[VerseCompleter] ❌ Erro ao completar verso:", error)
    return incompleteVerse
  }
}

/**
 * Processa toda a letra detectando e completando versos incompletos
 */
export async function fixAllIncompleteVerses(
  lyrics: string,
  genre: string,
  maxSyllables: number,
): Promise<{ fixedLyrics: string; fixedCount: number }> {
  const lines = lyrics.split("\n")
  const fixedLines: string[] = []
  let fixedCount = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Pula linhas vazias e marcações
    if (!line.trim() || line.trim().startsWith("[") || line.trim().startsWith("(")) {
      fixedLines.push(line)
      continue
    }

    const detection = detectIncompleteVerse(line)

    if (detection.isIncomplete && detection.confidence > 0.7) {
      console.log(`[VerseCompleter] 🔍 Verso incompleto detectado: "${line}" (${detection.reason})`)

      // Pega contexto (3 linhas antes e depois)
      const contextStart = Math.max(0, i - 3)
      const contextEnd = Math.min(lines.length, i + 4)
      const context = lines.slice(contextStart, contextEnd).join("\n")

      const completed = await completeVerse(line, context, genre, maxSyllables)
      fixedLines.push(completed)
      fixedCount++
    } else {
      fixedLines.push(line)
    }
  }

  console.log(`[VerseCompleter] 🎉 Total de versos completados: ${fixedCount}`)

  return {
    fixedLyrics: fixedLines.join("\n"),
    fixedCount,
  }
}
