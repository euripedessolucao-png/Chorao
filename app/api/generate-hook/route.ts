// app/api/generate-hook/route.ts

import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter-brasileiro"
import { GENRE_CONFIGS } from "@/lib/genre-config"

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
    const { lyrics, genre, additionalRequirements, advancedMode } = await request.json()

    if (!lyrics) {
      return NextResponse.json({ error: "Letra é obrigatória" }, { status: 400 })
    }

    const genreConfig = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS]
    
    // ✅ USANDO AS FUNÇÕES TIPO-SEGURAS
    const maxSyllables = getMaxSyllables(genreConfig)
    const minSyllables = getMinSyllables(genreConfig)

    const prompt = `Você é um especialista em criar hooks comerciais para música brasileira.

TAREFA: Analise a letra abaixo e crie 3 variações de hooks ultra-memoráveis.

LETRA:
${lyrics}

GÊNERO: ${genre || "Brasileiro"}
${additionalRequirements ? `REQUISITOS: ${additionalRequirements}` : ""}

⚠️ REGRA DE SÍLABAS POR GÊNERO:
- Hook: ${minSyllables}–${maxSyllables} SÍLABAS POÉTICAS
- Este é o limite ideal para memorização
- NUNCA exceda ${maxSyllables} sílabas

REGRAS DE HOOK DE HIT:
- ${minSyllables}-${maxSyllables} sílabas (não mais que ${maxSyllables})
- 3-6 palavras ideais
- Grudento e memorável
- Linguagem coloquial brasileira
- Fácil de repetir
- 100% em PORTUGUÊS BRASILEIRO

${
  advancedMode
    ? `
🔥 MODO AVANÇADO - HOOK PREMIUM:
- Gancho instantâneo (gruda em 3 segundos)
- Linguagem limpa (adequado para rádio)
- Potencial de bordão viral
- Score mínimo: 90/100
`
    : ""
}

FORMATO JSON:
{
  "hook": "melhor hook (≤${maxSyllables} sílabas)",
  "hookVariations": [
    "variação 1 (≤${maxSyllables} sílabas)",
    "variação 2 (≤${maxSyllables} sílabas)", 
    "variação 3 (≤${maxSyllables} sílabas)"
  ],
  "score": 85,
  "suggestions": ["sugestão 1", "sugestão 2", "sugestão 3"],
  "placement": ["uso 1", "uso 2", "uso 3"],
  "tiktokTest": "descrição",
  "tiktokScore": 8,
  "transformations": [
    {
      "original": "trecho original",
      "transformed": "hook otimizado (≤${maxSyllables} sílabas)",
      "reason": "por que funciona"
    }
  ]
}

Retorne APENAS o JSON, sem markdown.`

    console.log(`[Hook] Gerando para ${genre || "Brasileiro"} (${minSyllables}-${maxSyllables}s)`)

    let attempts = 0
    let parsedResult: any = null
    let allValid = false

    while (attempts < 2 && !allValid) {
      // ✅ Reduzido para 2 tentativas
      attempts++

      const { text } = await generateText({
        model: "openai/gpt-4o-mini", // ✅ Mais rápido e barato
        prompt,
        temperature: 0.85, // Aumentado para máxima criatividade em hooks
      })

      try {
        const cleanText = text
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim()
        parsedResult = JSON.parse(cleanText)
      } catch (parseError) {
        if (attempts === 2) {
          throw new Error("Erro ao processar resposta da IA")
        }
        continue
      }

      if (!parsedResult.hook || !Array.isArray(parsedResult.hookVariations)) {
        if (attempts === 2) {
          throw new Error("Resposta da IA em formato inválido")
        }
        continue
      }

      allValid = true
      const violations: string[] = []

      // ✅ Validação com contador preciso e métrica por gênero
      const mainHookSyllables = countPoeticSyllables(parsedResult.hook)
      if (mainHookSyllables < minSyllables || mainHookSyllables > maxSyllables) {
        allValid = false
        violations.push(`Hook: "${parsedResult.hook}" = ${mainHookSyllables}s (alvo: ${minSyllables}-${maxSyllables})`)
      }

      parsedResult.hookVariations.forEach((variation: string, index: number) => {
        const syllables = countPoeticSyllables(variation)
        if (syllables < minSyllables || syllables > maxSyllables) {
          allValid = false
          violations.push(`Var ${index + 1}: "${variation}" = ${syllables}s (alvo: ${minSyllables}-${maxSyllables})`)
        }
      })

      if (!allValid && attempts < 2) {
        console.log(`[Hook] 🔄 Regenerando... (${violations.length} violações)`)
      }
    }

    // ✅ Processamento final
    if (parsedResult.hook) {
      parsedResult.hook = capitalizeLines(parsedResult.hook)
    }
    if (parsedResult.hookVariations) {
      parsedResult.hookVariations = parsedResult.hookVariations.map((v: string) => capitalizeLines(v))
    }
    if (parsedResult.transformations) {
      parsedResult.transformations = parsedResult.transformations.map((t: any) => ({
        ...t,
        transformed: capitalizeLines(t.transformed || ""),
      }))
    }

    const safeResult = {
      hook: parsedResult.hook || "",
      hookVariations: parsedResult.hookVariations || [],
      score: parsedResult.score || 75,
      suggestions: parsedResult.suggestions || [],
      placement: parsedResult.placement || ["Usar no refrão"],
      tiktokTest: parsedResult.tiktokTest || "Hook com potencial viral",
      tiktokScore: parsedResult.tiktokScore || 7,
      transformations: parsedResult.transformations || [],
    }

    return NextResponse.json(safeResult)
  } catch (error) {
    console.error("[Hook] ❌ Erro:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao gerar hook" }, { status: 500 })
  }
}
