import { NextResponse } from "next/server"
import { generateText } from "ai"
import { getGenreConfig, detectSubGenre, getGenreRhythm } from "@/lib/genre-config"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"

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

    const prompt = `Você é um especialista em criar hooks comerciais para música brasileira.

TAREFA: Analise a letra abaixo e crie 3 variações de hooks ultra-memoráveis.

LETRA:
${lyrics}

GÊNERO: ${genre || "Brasileiro"}
RITMO: ${finalRhythm}
${additionalRequirements ? `REQUISITOS: ${additionalRequirements}` : ""}

REGRAS DE HOOK DE HIT:
- 4-8 palavras (máximo 10 sílabas)
- Grudento e memorável
- Linguagem coloquial brasileira
- Fácil de repetir
- Potencial viral

FORMATO DE RESPOSTA (JSON):
{
  "hook": "melhor hook escolhido (4-8 palavras)",
  "hookVariations": [
    "variação 1 (chiclete)",
    "variação 2 (bordão)",
    "variação 3 (viral)"
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
      "transformed": "versão otimizada como hook",
      "reason": "por que funciona melhor"
    }
  ]
}

IMPORTANTE:
- Hook deve ter 4-8 palavras
- Score mínimo: 80/100
- TikTok score mínimo: 7/10
- Retorne APENAS o JSON, sem markdown`

    console.log("[v0] Gerando hook otimizado...")

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt: prompt,
      temperature: 0.85,
    })

    let parsedResult
    try {
      const cleanText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()
      parsedResult = JSON.parse(cleanText)
    } catch (parseError) {
      console.error("[v0] ❌ Erro ao fazer parse do JSON:", parseError)
      console.error("[v0] Texto recebido:", text)
      return NextResponse.json({ error: "Erro ao processar resposta da IA. Tente novamente." }, { status: 500 })
    }

    if (!parsedResult.hook || !Array.isArray(parsedResult.hookVariations)) {
      console.error("[v0] ❌ Estrutura JSON inválida:", parsedResult)
      return NextResponse.json({ error: "Resposta da IA em formato inválido. Tente novamente." }, { status: 500 })
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
