import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { genero, humor, tema, criatividade, hook, inspiracao, metaforas, emocoes, titulo } = body

    // Construir el prompt basado en los parámetros del usuario
    const prompt = `Você é um compositor profissional especializado em criar letras de músicas autênticas e emocionantes.

Crie uma letra de música com os seguintes parâmetros:

${titulo ? `Título: ${titulo}` : ""}
Gênero Musical: ${genero || "não especificado"}
Humor: ${humor || "não especificado"}
Tema: ${tema || "não especificado"}
Nível de Criatividade: ${criatividade || "equilibrado"}
${hook ? `Refrão sugerido: ${hook}` : ""}
${inspiracao ? `Inspiração Literária: ${inspiracao}` : ""}
${metaforas ? `Metáforas desejadas: ${metaforas}` : ""}
${emocoes && emocoes.length > 0 ? `Emoções: ${emocoes.join(", ")}` : ""}

Instruções:
- Crie uma letra completa com estrutura profissional (versos, refrão, ponte se apropriado)
- Use linguagem poética e metáforas inteligentes
- Mantenha coerência com o gênero musical escolhido
- Capture as emoções e o humor especificados
- Se um refrão foi sugerido, incorpore-o ou use-o como inspiração
- Formate a letra claramente com [Verso 1], [Refrão], [Verso 2], etc.
- Seja criativo e autêntico

Retorne APENAS a letra da música, sem comentários adicionais.`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: prompt,
      temperature:
        criatividade === "conservador"
          ? 0.5
          : criatividade === "equilibrado"
            ? 0.7
            : criatividade === "ousado"
              ? 0.9
              : 1.0,
    })

    return NextResponse.json({ letra: text })
  } catch (error) {
    console.error("[v0] Error generating lyrics:", error)
    return NextResponse.json({ error: "Erro ao gerar letra. Por favor, tente novamente." }, { status: 500 })
  }
}
