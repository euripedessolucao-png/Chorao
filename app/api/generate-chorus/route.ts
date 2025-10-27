// app/api/generate-hook/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter-brasileiro"
import { GENRE_CONFIGS } from "@/lib/genre-config"
import { getUniversalRhymeRules } from "@/lib/validation/universal-rhyme-rules"

// ✅ Funções tipo-seguras para acessar configurações de sílabas
function getMaxSyllables(genreConfig: any): number {
  const syllableCount = genreConfig?.prosody_rules?.syllable_count
  
  if (!syllableCount) return 10 // fallback padrão para hooks

  // Verifica se é do tipo com absolute_max
  if ('absolute_max' in syllableCount) {
    return Math.min(syllableCount.absolute_max as number, 10)
  }

  // Verifica se é do tipo com without_comma
  if ('without_comma' in syllableCount) {
    const withoutComma = syllableCount.without_comma as { acceptable_up_to?: number, max?: number }
    return Math.min(withoutComma.acceptable_up_to || withoutComma.max || 10, 10)
  }

  // Verifica se é do tipo com with_comma
  if ('with_comma' in syllableCount) {
    const withComma = syllableCount.with_comma as { total_max?: number }
    return Math.min(withComma.total_max || 10, 10)
  }

  return 10 // fallback
}

function getMinSyllables(genreConfig: any): number {
  const syllableCount = genreConfig?.prosody_rules?.syllable_count
  
  if (!syllableCount) return 4 // fallback padrão para hooks

  // Verifica se é do tipo com without_comma
  if ('without_comma' in syllableCount) {
    const withoutComma = syllableCount.without_comma as { min?: number, acceptable_from?: number }
    return Math.max(4, withoutComma.min || withoutComma.acceptable_from || 6)
  }

  // Para outros tipos, usa cálculo base
  if ('absolute_max' in syllableCount) {
    const absoluteMax = syllableCount.absolute_max as number
    return Math.max(4, absoluteMax - 6)
  }

  return 4 // fallback
}

export async function POST(request: NextRequest) {
  try {
    const { genre, theme, mood, additionalRequirements, lyrics, advancedMode } = await request.json()

    if (!genre || !theme) {
      return NextResponse.json({ error: "Gênero e tema são obrigatórios" }, { status: 400 })
    }

    const genreConfig = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS]
    
    // ✅ USANDO AS FUNÇÕES TIPO-SEGURAS
    const maxSyllables = getMaxSyllables(genreConfig)
    const minSyllables = getMinSyllables(genreConfig)
    const rhymeRules = getUniversalRhymeRules(genre)

    // ... resto do código permanece igual ...
    const lyricsContext = lyrics
      ? `
📝 LETRA EXISTENTE (CONTEXTO OBRIGATÓRIO):
${lyrics}

🎯 O GANCHO DEVE:
- Conectar-se PERFEITAMENTE com esta letra
- Usar o MESMO tom emocional e linguagem
- Ser a linha mais memorável da música
`
      : `
🎯 CRIAR GANCHO ORIGINAL PARA:
- Tema: ${theme}
- Humor: ${mood || "adaptável"}
- Gênero: ${genre}

🎯 O GANCHO DEVE:
- Ser AUTÔNOMO e funcionar sozinho
- Introduzir o tema de forma impactante  
- Ser ultra memorável na primeira linha
`

    const universalRules = `
🌍 REGRAS UNIVERSAIS DE GANCHO

✅ PORTUGUÊS BRASILEIRO:
- Linguagem coloquial autêntica: "cê", "tô", "pra", "tá"
- Gírias e expressões regionais

🎯 FÓRMULA DE GANCHO DE SUCESSO:

⚠️ REGRA DE SÍLABAS POR GÊNERO:
- CADA GANCHO: ${minSyllables}–${maxSyllables} SÍLABAS POÉTICAS
- Ideal: ${Math.floor((minSyllables + maxSyllables) / 2)} sílabas
- NUNCA exceda ${maxSyllables} sílabas

PRIORIDADE ABSOLUTA:
1. RESPEITAR MÉTRICA DE ${minSyllables}-${maxSyllables} SÍLABAS
2. GRUDAR NA CABEÇA instantaneamente
3. FRASE COMPLETA E COERENTE
4. LINGUAGEM COLOQUIAL BRASILEIRA
5. FÁCIL DE CANTAR JUNTO
`

    const advancedModeRules = advancedMode
      ? `
🔥 MODO AVANÇADO - CRITÉRIOS DE HIT

GANCHO PREMIUM:
- DEVE grudar em 3 segundos
- Teste: Se não for repetitivo mentalmente, refaça

RIMAS:
- ${rhymeRules.minRichRhymePercentage > 0 ? `Mínimo ${rhymeRules.minRichRhymePercentage}% rimas ricas` : "Rimas naturais aceitáveis"}
- ${rhymeRules.maxFalseRhymePercentage === 0 ? "ZERO rimas falsas" : `Máximo ${rhymeRules.maxFalseRhymePercentage}% rimas falsas`}
`
      : ""

    const prompt = `${universalRules}
${advancedModeRules}
${additionalRequirements ? `⚡ REQUISITOS ESPECIAIS:\n${additionalRequirements}` : ""}

${lyricsContext}

🎵 Você é um compositor PROFISSIONAL especializado em GANCHOS DE HIT.

ESPECIFICAÇÕES:
- Gênero: ${genre}
- Tema: ${theme}
- Humor: ${mood || "neutro"}

REGRAS ESTRUTURAIS:
- 1 linha por gancho
- Cada gancho: ${minSyllables}-${maxSyllables} sílabas
- FRASE COMPLETA e autocontida
- Máximo impacto emocional

FORMATO JSON:
{
  "hooks": [
    {
      "text": "Texto do gancho aqui",
      "style": "Estilo",
      "score": 8-10,
      "emotionalImpact": "alto"
    }
  ],
  "bestCommercialOptionIndex": 0
}

Gere os 8 GANCHOS DE HIT agora:`

    console.log(`[Hook] Gerando para ${genre} (${minSyllables}-${maxSyllables}s)`)

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

        if (result.hooks?.length) {
          allValid = true
          const violations: string[] = []

          for (let i = 0; i < result.hooks.length; i++) {
            const hook = result.hooks[i]
            const trimmed = hook.text.trim()

            if (!trimmed) continue

            const syllables = countPoeticSyllables(trimmed)
            if (syllables < minSyllables || syllables > maxSyllables) {
              allValid = false
              violations.push(`Hook ${i + 1}: "${trimmed}" = ${syllables}s (alvo: ${minSyllables}-${maxSyllables})`)
            }
          }

          if (!allValid && attempts < 2) {
            console.log(`[Hook] 🔄 Regenerando... (${violations.length} violações)`)
          }
        }
      } catch (parseError) {
        console.log(`[Hook] ❌ Erro parse JSON, tentativa ${attempts}`)
        allValid = false
      }
    }

    if (result?.hooks) {
      result.hooks = result.hooks.map((v: any) => ({
        ...v,
        text: capitalizeLines(v.text),
      }))
    }

    return NextResponse.json(
      result || {
        error: "Não foi possível gerar ganchos válidos",
        hooks: [],
        bestCommercialOptionIndex: -1,
      },
    )
  } catch (error) {
    console.error("[Hook] ❌ Erro:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro desconhecido" }, { status: 500 })
  }
}
