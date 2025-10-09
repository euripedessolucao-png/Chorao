import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { genre, theme, mood } = await request.json()

    if (!genre || !theme) {
      return NextResponse.json({ error: "Gênero e tema são obrigatórios" }, { status: 400 })
    }

    const prompt = `Você é um compositor profissional especializado em criar refrões comerciais e grudentos.

TAREFA: Gere 5 variações de refrão para uma música com as seguintes características:
- Gênero: ${genre}
- Tema: ${theme}
- Humor: ${mood || "neutro"}

REGRAS DO REFRÃO GRUDENTO (2024-2025):
1. 4 linhas máximo
2. 5-6 palavras por linha
3. Repetição de palavras/linhas estratégica
4. Onomatopeias e vocalizações (Ê, ê, ê / Ô, ô, ô / Ah, ah, ah)
5. Verbos no imperativo quando apropriado
6. Prevalência de vogais abertas (A, E, O)
7. Rimas simples entre linhas (AABB ou ABAB)
8. Gancho logo na primeira linha
9. Formato preferido: 2 ou 4 linhas

FORMATO DE SAÍDA (JSON):
{
  "variations": [
    {
      "chorus": "linha 1 / linha 2 / linha 3 / linha 4",
      "style": "Descrição do estilo (ex: Repetitivo e Direto, Onomatopeico, etc)",
      "score": número de 1 a 10,
      "justification": "Breve explicação do porquê esse refrão funciona"
    }
  ],
  "bestCommercialOptionIndex": índice da melhor opção (0-4)
}

IMPORTANTE:
- Cada variação deve ter um estilo diferente
- Os scores devem variar entre 7 e 10
- A melhor opção comercial deve ter score 9 ou 10
- Use "/" para separar linhas no campo "chorus"
- Seja criativo mas mantenha a comercialidade

Gere as 5 variações agora:`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.8,
    })

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Resposta da IA não está no formato JSON esperado")
    }

    const result = JSON.parse(jsonMatch[0])

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error generating chorus:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao gerar refrão",
      },
      { status: 500 },
    )
  }
}
