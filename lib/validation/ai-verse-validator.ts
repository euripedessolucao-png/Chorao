import { generateText } from "ai"

export interface VerseValidationResult {
  isValid: boolean
  incompleteVerses: string[]
  correctedLyrics: string
  correctionsMade: number
}

export async function validateAndFixWithAI(
  lyrics: string,
  genre: string,
  maxSyllables: number,
): Promise<VerseValidationResult> {
  console.log("[AI-Validator] 🤖 Iniciando validação inteligente com IA...")

  const lines = lyrics.split("\n")
  const contentLines: string[] = []
  const incompleteVerses: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()

    // Skip section headers and metadata
    if (
      !trimmed ||
      trimmed.startsWith("###") ||
      trimmed.startsWith("[") ||
      trimmed.startsWith("(") ||
      trimmed.startsWith("Instrumentation")
    ) {
      continue
    }

    // Check if verse is incomplete
    const words = trimmed.split(/\s+/)
    const endsWithPreposition = /\b(de|da|do|em|no|na|com|sem|pra|pro|que|e|a|o|me|te|se)\s*$/i.test(trimmed)
    const isTooShort = words.length < 4
    const endsWithComma = /[,]$/.test(trimmed)
    const hasIncompleteWord = /\b(nã|frente|canto)\s*$/i.test(trimmed) && words.length < 6

    if (endsWithPreposition || isTooShort || endsWithComma || hasIncompleteWord) {
      incompleteVerses.push(trimmed)
    }

    contentLines.push(trimmed)
  }

  // If no incomplete verses found, return original
  if (incompleteVerses.length === 0) {
    console.log("[AI-Validator] ✅ Nenhum verso incompleto detectado")
    return {
      isValid: true,
      incompleteVerses: [],
      correctedLyrics: lyrics,
      correctionsMade: 0,
    }
  }

  console.log(`[AI-Validator] 🚨 ${incompleteVerses.length} verso(s) incompleto(s) detectado(s)`)
  incompleteVerses.slice(0, 5).forEach((v) => console.log(`   - "${v}"`))

  const validationPrompt = `Você é um compositor profissional brasileiro especializado em ${genre}.

TAREFA: Corrigir APENAS os versos incompletos na letra abaixo, mantendo TUDO o resto EXATAMENTE igual.

LETRA ATUAL:
${lyrics}

VERSOS INCOMPLETOS DETECTADOS (corrija APENAS estes):
${incompleteVerses.map((v, i) => `${i + 1}. "${v}"`).join("\n")}

REGRAS PARA CORREÇÃO:
1. Complete cada verso incompleto para formar uma FRASE COMPLETA
2. NUNCA termine verso com: de, da, do, em, no, na, com, sem, pra, pro, que, e, a, o, me, te, se
3. NUNCA corte palavras no meio: "nã", "frente" (sem contexto), "canto" (sem complemento)
4. Cada verso deve ter SUJEITO + VERBO + COMPLEMENTO
5. Máximo de ${maxSyllables} sílabas poéticas por verso
6. Mantenha o estilo e tema da letra original
7. NÃO altere versos que já estão completos
8. NÃO altere cabeçalhos (###) ou estrutura
9. Retorne a letra COMPLETA com apenas os versos incompletos corrigidos

EXEMPLOS DE CORREÇÃO:
❌ "partido, eu sigo frente" → ✅ "De coração partido, eu sigo em frente sozinho"
❌ "cada canto casa" → ✅ "Te procurei em cada canto da casa vazia"
❌ "me deixei" → ✅ "Eu me deixei levar pela ilusão do amor"
❌ "com essa" → ✅ "Não quero mais viver com essa dor no peito"

Retorne APENAS a letra corrigida (sem explicações):`

  try {
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: validationPrompt,
      temperature: 0.5, // Lower temperature for more consistent fixes
    })

    const correctedLyrics = text.trim()

    console.log(`[AI-Validator] ✅ IA corrigiu ${incompleteVerses.length} verso(s)`)

    return {
      isValid: false,
      incompleteVerses,
      correctedLyrics,
      correctionsMade: incompleteVerses.length,
    }
  } catch (error) {
    console.error("[AI-Validator] ❌ Erro na validação com IA:", error)
    // Return original lyrics if AI fails
    return {
      isValid: false,
      incompleteVerses,
      correctedLyrics: lyrics,
      correctionsMade: 0,
    }
  }
}
