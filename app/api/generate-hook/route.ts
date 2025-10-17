import { NextResponse } from "next/server"
import { generateText } from "ai"
import { getGenreConfig, detectSubGenre, getGenreRhythm } from "@/lib/genre-config"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter" // ← CORRIGIDO

export async function POST(request: Request) {
  try {
    const { lyrics, genre, additionalRequirements, advancedMode } = await request.json()

    if (!lyrics) {
      return NextResponse.json({ error: "Letra é obrigatória" }, { status: 400 })
    }

    const genreConfig = genre ? getGenreConfig(genre) : null
    const subGenreInfo = detectSubGenre(additionalRequirements || "")
    const defaultRhythm = genre ? getGenreRhythm(genre) : "Brasileiro"
    const finalRhythm = subGenreInfo.rhythm || defaultRhythm

    const prompt = `🌍 REGRAS UNIVERSAIS DE IDIOMA (OBRIGATÓRIO)

✅ PORTUGUÊS BRASILEIRO:
- HOOKS: 100% em português do Brasil
- Linguagem coloquial autêntica
- Gírias e expressões regionais

✅ INGLÊS:
- BACKING VOCALS (se houver): sempre em inglês
  Exemplo: (Backing: "Oh, oh, oh")
- INSTRUÇÕES: sempre em inglês

❌ NUNCA MISTURE:
- Não escreva hooks em inglês
- Mantenha separação clara

Você é um especialista em criar hooks comerciais para música brasileira.

TAREFA: Analise a letra abaixo e crie 3 variações de hooks ultra-memoráveis.

LETRA:
${lyrics}

GÊNERO: ${genre || "Brasileiro"}
RITMO: ${finalRhythm}
${additionalRequirements ? `REQUISITOS: ${additionalRequirements}` : ""}

⚠️ REGRA ABSOLUTA DE SÍLABAS (INVIOLÁVEL):
- Hook: MÁXIMO 12 SÍLABAS POÉTICAS
- Este é o LIMITE HUMANO do canto
- NUNCA exceda 12 sílabas
- Se precisar de mais espaço, use menos palavras
- Criatividade DENTRO do limite

REGRAS DE HOOK DE HIT:
- 4-8 palavras (máximo 12 sílabas)
- Grudento e memorável
- Linguagem coloquial brasileira
- Fácil de repetir
- Potencial viral
- CADA VARIAÇÃO ≤ 12 SÍLABAS
- 100% em PORTUGUÊS BRASILEIRO

${
  advancedMode
    ? `
🔥 MODO AVANÇADO - HOOK PREMIUM:
- Gancho instantâneo (gruda em 3 segundos)
- Linguagem limpa (adequado para rádio)
- Potencial de bordão viral
- Fácil de cantar em karaokê
- Score mínimo: 90/100
`
    : ""
}

FORMATO DE RESPOSTA (JSON):
{
  "hook": "melhor hook escolhido (≤12 sílabas, em português)",
  "hookVariations": [
    "variação 1 (≤12 sílabas, em português)",
    "variação 2 (≤12 sílabas, em português)",
    "variação 3 (≤12 sílabas, em português)"
  ],
  "score": 85,
  "suggestions": [
    "sugestão 1 de melhoria",
    "sugestão 2 de melhoria",
    "sugestão 3 de melhoria"
  ],
  "placement": [
    "Usar no início do refrão para impacto máximo",
    "Repetir 3-4 vezes na música",
    "Colocar também no outro para fixação"
  ],
  "tiktokTest": "Como soaria em clipe de 5 segundos: [descrição]",
  "tiktokScore": 8,
  "transformations": [
    {
      "original": "trecho da letra original",
      "transformed": "versão otimizada como hook (≤12 sílabas, em português)",
      "reason": "por que funciona melhor"
    }
  ]
}

IMPORTANTE:
- Hook deve ter 4-8 palavras (MÁXIMO 12 SÍLABAS)
- 100% em PORTUGUÊS BRASILEIRO
- Score mínimo: 80/100
- TikTok score mínimo: 7/10
- Retorne APENAS o JSON, sem markdown`

    let attempts = 0
    let parsedResult: any = null
    let allValid = false

    while (attempts < 3 && !allValid) {
      attempts++
      console.log(`[v0] Tentativa ${attempts}/3 de geração de hook...`)

      const { text } = await generateText({
        model: "openai/gpt-4o",
        prompt: prompt,
        temperature: 0.85,
      })

      try {
        const cleanText = text
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim()
        parsedResult = JSON.parse(cleanText)
      } catch (parseError) {
        if (attempts === 3) {
          console.error("[v0] ❌ Erro ao fazer parse do JSON:", parseError)
          return NextResponse.json({ error: "Erro ao processar resposta da IA. Tente novamente." }, { status: 500 })
        }
        continue
      }

      if (!parsedResult.hook || !Array.isArray(parsedResult.hookVariations)) {
        if (attempts === 3) {
          console.error("[v0] ❌ Estrutura JSON inválida:", parsedResult)
          return NextResponse.json({ error: "Resposta da IA em formato inválido. Tente novamente." }, { status: 500 })
        }
        continue
      }

      allValid = true
      const violations: string[] = []

      // ✅ CORREÇÃO: countSyllables → countPoeticSyllables
      const mainHookSyllables = countPoeticSyllables(parsedResult.hook)
      if (mainHookSyllables > 12) {
        allValid = false
        violations.push(`Hook principal: "${parsedResult.hook}" = ${mainHookSyllables} sílabas (máx: 12)`)
      }

      parsedResult.hookVariations.forEach((variation: string, index: number) => {
        // ✅ CORREÇÃO: countSyllables → countPoeticSyllables
        const syllables = countPoeticSyllables(variation)
        if (syllables > 12) {
          allValid = false
          violations.push(`Variação ${index + 1}: "${variation}" = ${syllables} sílabas (máx: 12)`)
        }
      })

      if (!allValid) {
        console.log(`[v0] ⚠️ Tentativa ${attempts} falhou - violações de sílabas:`)
        violations.forEach((v) => console.log(`[v0]   - ${v}`))
        if (attempts < 3) {
          console.log(`[v0] 🔄 Regenerando...`)
        }
      } else {
        console.log(`[v0] ✅ Todos os hooks respeitam o limite de 12 sílabas!`)
      }
    }

    if (!allValid) {
      console.log(`[v0] ⚠️ Após 3 tentativas, ainda há violações. Retornando melhor resultado.`)
    }

    if (parsedResult.hook) {
      parsedResult.hook = capitalizeLines(parsedResult.hook)
    }
    if (parsedResult.hookVariations && Array.isArray(parsedResult.hookVariations)) {
      parsedResult.hookVariations = parsedResult.hookVariations.map((variation: string) => capitalizeLines(variation))
    }
    if (parsedResult.transformations && Array.isArray(parsedResult.transformations)) {
      parsedResult.transformations = parsedResult.transformations.map((t: any) => ({
        ...t,
        transformed: capitalizeLines(t.transformed || t.hookVersion || ""),
      }))
    }

    const safeResult = {
      hook: parsedResult.hook,
      hookVariations: parsedResult.hookVariations || [],
      score: parsedResult.score || 75,
      suggestions: parsedResult.suggestions || [],
      placement: parsedResult.placement || ["Usar no refrão"],
      tiktokTest: parsedResult.tiktokTest || "Hook com potencial viral",
      tiktokScore: parsedResult.tiktokScore || 7,
      transformations: parsedResult.transformations || [],
    }

    console.log("[v0] ✅ Hook gerado com sucesso!")
    console.log(`[v0] 📊 Score: ${safeResult.score}/100`)
    console.log(`[v0] 🎯 TikTok Score: ${safeResult.tiktokScore}/10`)

    return NextResponse.json(safeResult)
  } catch (error) {
    console.error("[v0] ❌ Erro ao gerar hook:", error)
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
    return NextResponse.json(
      {
        error: `Erro ao gerar hook: ${errorMessage}. Tente novamente.`,
      },
      { status: 500 },
    )
  }
}
