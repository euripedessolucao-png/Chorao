// app/api/generate-chorus/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { GENRE_CONFIGS } from "@/lib/genre-config"
import { getUniversalRhymeRules } from "@/lib/validation/universal-rhyme-rules"

// ✅ Funções tipo-seguras para acessar configurações de sílabas
function getMaxSyllables(genreConfig: any): number {
  const syllableCount = genreConfig?.prosody_rules?.syllable_count

  if (!syllableCount) return 12

  if ("absolute_max" in syllableCount) {
    return syllableCount.absolute_max as number
  }

  if ("without_comma" in syllableCount) {
    const withoutComma = syllableCount.without_comma as { acceptable_up_to?: number; max?: number }
    return withoutComma.acceptable_up_to || withoutComma.max || 12
  }

  if ("with_comma" in syllableCount) {
    const withComma = syllableCount.with_comma as { total_max?: number }
    return withComma.total_max || 12
  }

  return 12
}

export async function POST(request: NextRequest) {
  try {
    const { genre, theme, mood, additionalRequirements, advancedMode } = await request.json()

    if (!genre || !theme) {
      return NextResponse.json({ error: "Gênero e tema são obrigatórios" }, { status: 400 })
    }

    const genreConfig = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS]
    const maxSyllables = getMaxSyllables(genreConfig)
    const rhymeRules = getUniversalRhymeRules(genre)

    const prompt = `Você é um compositor PROFISSIONAL especializado em REFRÕES DE HIT.

🎯 MISSÃO: Criar 5 REFRÕES COMERCIAIS para:
- Gênero: ${genre}
- Tema: ${theme}
- Humor: ${mood || "neutro"}

📏 REGRAS DE SÍLABAS:
- CADA VERSO: máximo ${maxSyllables} sílabas poéticas
- Refrão completo: 4-8 versos
- NUNCA exceda ${maxSyllables} sílabas por verso

🎵 ESTRUTURA DO REFRÃO:
- Deve ser MEMORÁVEL e REPETITIVO
- Fácil de cantar junto
- Gancho emocional forte
- Linguagem coloquial brasileira

${
  advancedMode
    ? `
🔥 MODO AVANÇADO:
- Mínimo ${rhymeRules.minRichRhymePercentage}% rimas ricas
- Máximo ${rhymeRules.maxFalseRhymePercentage}% rimas falsas
- Esquema de rimas consistente (AABB, ABAB, ou ABCB)
`
    : ""
}

${additionalRequirements ? `⚡ REQUISITOS ESPECIAIS:\n${additionalRequirements}` : ""}

FORMATO JSON:
{
  "variations": [
    {
      "chorus": "Verso 1 / Verso 2 / Verso 3 / Verso 4",
      "style": "Descrição do estilo",
      "score": 8-10,
      "justification": "Por que este refrão funciona"
    }
  ],
  "bestCommercialOptionIndex": 0
}

Gere os 5 REFRÕES agora:`

    console.log(`[Chorus] Gerando para ${genre} (max: ${maxSyllables}s)`)

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.85,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Resposta inválida da IA")
    }

    const result = JSON.parse(jsonMatch[0])

    if (result.variations) {
      result.variations = result.variations.map((v: any) => ({
        ...v,
        chorus: capitalizeLines(v.chorus),
      }))
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[Chorus] ❌ Erro:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro desconhecido" }, { status: 500 })
  }
}
