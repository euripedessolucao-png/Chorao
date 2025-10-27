// app/api/generate-chorus/route.ts

import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter-brasileiro"
import { GENRE_CONFIGS } from "@/lib/genre-config"
import { getUniversalRhymeRules } from "@/lib/validation/universal-rhyme-rules"

export async function POST(request: NextRequest) {
  try {
    const { genre, theme, mood, additionalRequirements, lyrics, advancedMode } = await request.json()

    if (!genre || !theme) {
      return NextResponse.json({ error: "Gênero e tema são obrigatórios" }, { status: 400 })
    }

    const genreConfig = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS]
    const maxSyllables = genreConfig?.prosody_rules?.syllable_count?.absolute_max || 12
    const minSyllables = genreConfig?.prosody_rules?.syllable_count?.without_comma?.acceptable_from || 6
    const rhymeRules = getUniversalRhymeRules(genre)

    const lyricsContext = lyrics
      ? `
📝 LETRA EXISTENTE (CONTEXTO OBRIGATÓRIO):
${lyrics}

🎯 O REFRÃO DEVE:
- Conectar-se PERFEITAMENTE com esta letra
- Usar o MESMO tom emocional e linguagem
- Manter TOTAL coerência com a história
`
      : `
🎯 CRIAR REFRÃO ORIGINAL PARA:
- Tema: ${theme}
- Humor: ${mood || "adaptável"}
- Gênero: ${genre}

🎯 O REFRÃO DEVE:
- Ser AUTÔNOMO e funcionar sozinho
- Introduzir o tema de forma impactante  
- Criar gancho memorável na primeira linha
`

    const universalRules = `
🌍 REGRAS UNIVERSAIS DE REFRÃO

✅ PORTUGUÊS BRASILEIRO:
- Linguagem coloquial autêntica: "cê", "tô", "pra", "tá"
- Gírias e expressões regionais

🎯 FÓRMULA DE REFRÃO DE SUCESSO:

⚠️ REGRA DE SÍLABAS POR GÊNERO:
- CADA VERSO: ${minSyllables}–${maxSyllables} SÍLABAS POÉTICAS
- Ideal: ${genreConfig?.prosody_rules?.syllable_count?.ideal || Math.floor((minSyllables + maxSyllables) / 2)} sílabas por verso
- NUNCA exceda ${maxSyllables} sílabas

PRIORIDADE ABSOLUTA:
1. RESPEITAR MÉTRICA DE ${minSyllables}-${maxSyllables} SÍLABAS
2. GANCHO GRUDENTO (primeira linha deve grudar na cabeça)
3. FRASES COMPLETAS E COERENTES
4. LINGUAGEM COLOQUIAL BRASILEIRA
5. FÁCIL DE CANTAR JUNTO
`

    const advancedModeRules = advancedMode
      ? `
🔥 MODO AVANÇADO - CRITÉRIOS DE HIT

GANCHO PREMIUM:
- Primeira linha DEVE ser o gancho principal
- Teste: Se não grudar em 3 segundos, refaça

RIMAS:
- ${rhymeRules.minRichRhymePercentage > 0 ? `Mínimo ${rhymeRules.minRichRhymePercentage}% rimas ricas` : "Rimas naturais aceitáveis"}
- ${rhymeRules.maxFalseRhymePercentage === 0 ? "ZERO rimas falsas" : `Máximo ${rhymeRules.maxFalseRhymePercentage}% rimas falsas`}
`
      : ""

    const prompt = `${universalRules}
${advancedModeRules}
${additionalRequirements ? `⚡ REQUISITOS ESPECIAIS:\n${additionalRequirements}` : ""}

${lyricsContext}

🎵 Você é um compositor PROFISSIONAL especializado em REFRÕES DE HIT.

ESPECIFICAÇÕES:
- Gênero: ${genre}
- Tema: ${theme}
- Humor: ${mood || "neutro"}

REGRAS ESTRUTURAIS:
- 4 linhas por refrão
- Cada linha: ${minSyllables}-${maxSyllables} sílabas
- CADA LINHA = FRASE COMPLETA
- Primeira linha = GANCHO PRINCIPAL

FORMATO JSON:
{
  "variations": [
    {
      "chorus": "linha 1\\nlinha 2\\nlinha 3\\nlinha 4",
      "style": "Estilo",
      "score": 8-10,
      "hookLine": "Gancho principal"
    }
  ],
  "bestCommercialOptionIndex": 0
}

Gere as 5 variações de REFRÃO DE HIT agora:`

    console.log(`[Chorus] Gerando para ${genre} (${minSyllables}-${maxSyllables}s)`)

    let attempts = 0
    let result: any = null
    let allValid = false

    while (attempts < 2 && !allValid) {
      attempts++

      const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt,
        temperature: 0.85,
      })

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) continue

      try {
        result = JSON.parse(jsonMatch[0])

        if (result.variations?.length) {
          allValid = true
          const violations: string[] = []

          for (let i = 0; i < result.variations.length; i++) {
            const variation = result.variations[i]
            const lines = variation.chorus.split("\\n")

            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed) continue

              const syllables = countPoeticSyllables(trimmed)
              if (syllables < minSyllables || syllables > maxSyllables) {
                allValid = false
                violations.push(`Var ${i + 1}: "${trimmed}" = ${syllables}s (alvo: ${minSyllables}-${maxSyllables})`)
              }
            }
          }

          if (!allValid && attempts < 2) {
            console.log(`[Chorus] 🔄 Regenerando... (${violations.length} violações)`)
          }
        }
      } catch (parseError) {
        console.log(`[Chorus] ❌ Erro parse JSON, tentativa ${attempts}`)
        allValid = false
      }
    }

    if (result?.variations) {
      result.variations = result.variations.map((v: any) => ({
        ...v,
        chorus: capitalizeLines(v.chorus),
      }))
    }

    return NextResponse.json(
      result || {
        error: "Não foi possível gerar refrões válidos",
        variations: [],
        bestCommercialOptionIndex: -1,
      },
    )
  } catch (error) {
    console.error("[Chorus] ❌ Erro:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro desconhecido" }, { status: 500 })
  }
}
