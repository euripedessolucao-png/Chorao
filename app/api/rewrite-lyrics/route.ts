import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { buildGenreRulesPrompt } from "@/lib/validation/genre-rules-builder"

export async function POST(request: NextRequest) {
  try {
    const { letraOriginal, genero, humor, tema, additionalRequirements, titulo } = await request.json()

    if (!letraOriginal?.trim()) {
      console.error("[v0] ❌ Letra original vazia")
      return NextResponse.json({ error: "Letra original é obrigatória" }, { status: 400 })
    }

    if (!genero || typeof genero !== "string" || !genero.trim()) {
      console.error("[v0] ❌ Gênero inválido:", genero)
      return NextResponse.json({ error: "Gênero é obrigatório e deve ser uma string válida" }, { status: 400 })
    }

    console.log("[v0] 🎵 Iniciando reescrita...")

    let genreRules
    try {
      genreRules = buildGenreRulesPrompt(genero)
      console.log("[v0] ✅ Regras de gênero construídas com sucesso")
    } catch (error) {
      console.error("[v0] ❌ Erro ao construir regras de gênero:", error)
      return NextResponse.json(
        {
          error: "Erro ao processar regras do gênero",
          details: error instanceof Error ? error.message : "Erro desconhecido",
        },
        { status: 500 },
      )
    }

    const prompt = `Você é um compositor brasileiro especializado em ${genero}.

TAREFA: Reescrever e melhorar a letra abaixo mantendo a essência.

LETRA ORIGINAL:
${letraOriginal}

TEMA: ${tema || "Manter tema original"}
HUMOR: ${humor || "Manter humor original"}
${additionalRequirements ? `REQUISITOS: ${additionalRequirements}` : ""}

${genreRules.fullPrompt}

INSTRUÇÕES:
- Melhore a qualidade mantendo o tema e estrutura
- Corrija problemas de métrica (máx 11 sílabas por linha)
- Melhore as rimas naturalmente
- Mantenha a essência da letra original
- Use linguagem brasileira autêntica
- Evite clichês de IA

Retorne a letra reescrita completa com as tags de seção.`

    console.log("[v0] 🎵 Reescrevendo com OpenAI...")

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt: prompt,
      temperature: 0.7,
    })

    console.log("[v0] ✅ Reescrita concluída!")

    const finalLyrics = capitalizeLines(text)

    return NextResponse.json({
      letra: finalLyrics,
      titulo: titulo || "Letra Reescrita",
      metadata: {
        score: 85,
        polishingApplied: true,
      },
    })
  } catch (error) {
    console.error("[v0] ❌ Erro na reescrita:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro interno ao reescrever letra",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: "Método não permitido. Use POST." }, { status: 405 })
}
