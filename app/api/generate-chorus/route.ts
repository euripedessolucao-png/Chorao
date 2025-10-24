// app/api/generate-chorus/route.ts

import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { GENRE_CONFIGS, getGenreConfig, detectSubGenre, getGenreRhythm } from "@/lib/genre-config"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter-brasileiro"

export async function POST(request: NextRequest) {
  try {
    const { genre, theme, mood, additionalRequirements, lyrics, advancedMode } = await request.json()

    if (!genre || !theme) {
      return NextResponse.json({ error: "Gênero e tema são obrigatórios" }, { status: 400 })
    }

    // ✅ Obtém métrica REAL do gênero
    const config = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS]
    let maxSyllables = 12
    let minSyllables = 8

    if (config) {
      const rules = config.prosody_rules.syllable_count
      if ("absolute_max" in rules) {
        maxSyllables = rules.absolute_max
        minSyllables = Math.max(6, maxSyllables - 4)
      } else if ("without_comma" in rules) {
        maxSyllables = rules.without_comma.acceptable_up_to
        minSyllables = rules.without_comma.min
      }
    }

    const genreConfig = getGenreConfig(genre)
    const subGenreInfo = detectSubGenre(additionalRequirements)
    const defaultRhythm = getGenreRhythm(genre)
    const finalRhythm = subGenreInfo.rhythm || defaultRhythm

    // ... (mantém lyricsContext, universalRules, etc. iguais) ...

    const prompt = `${universalRules.replace("MÁXIMO 12 SÍLABAS", `MÁXIMO ${maxSyllables} SÍLABAS`)}
${advancedModeRules}
${metaforasRule}

${lyricsContext}
${subGenreInfo.subGenre ? `- Seguir o ritmo de ${subGenreInfo.styleNote}` : ""}

🎵 Você é um compositor PROFISSIONAL especializado em REFRÕES DE HIT.

ESPECIFICAÇÕES:
- Gênero: ${genre}
- Ritmo: ${finalRhythm}
- Tema: ${theme}
- Humor: ${mood || "neutro"}
- MÉTRICA: ${minSyllables}-${maxSyllables} sílabas por verso

// ... resto do prompt igual, mas atualize a regra de sílabas:

⚠️ REGRA ABSOLUTA DE SÍLABAS:
- CADA VERSO: MÁXIMO ${maxSyllables} SÍLABAS POÉTICAS
- Ideal: ${minSyllables}-${maxSyllables - 2} sílabas por verso
- NUNCA exceda ${maxSyllables} sílabas - limite humano do canto

// ... resto do prompt ...

REGRAS ESTRUTURAIS:
- 4 linhas por refrão (padrão comercial)
- Cada linha: ${minSyllables}-${maxSyllables} sílabas (NUNCA mais de ${maxSyllables})
`

    console.log(`[Chorus] Gerando para ${genre} (${minSyllables}-${maxSyllables}s)`)

    let attempts = 0
    let result: any = null
    let allValid = false

    while (attempts < 2 && !allValid) { // ✅ Reduzido para 2 tentativas
      attempts++

      const { text } = await generateText({
        model: "openai/gpt-4o-mini", // ✅ Mais rápido e barato
        prompt,
        temperature: 0.8,
        maxTokens: 500, // ✅ Evita timeout na Vercel
      })

      // ... parsing e validação igual, mas com maxSyllables dinâmico ...

      if (syllables > maxSyllables) { // ✅ Usa limite dinâmico
        allValid = false
        violations.push(`Var ${i + 1}, linha ${j + 1}: "${line}" = ${syllables}s (máx: ${maxSyllables})`)
      }
    }

    // ... resto igual ...

    return NextResponse.json(result)
  } catch (error) {
    console.error("[Chorus] ❌ Erro:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro desconhecido" }, { status: 500 })
  }
}
