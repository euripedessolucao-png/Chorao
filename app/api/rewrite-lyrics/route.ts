import { NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: Request) {
  console.log("[v0] 🚀 TESTE MÍNIMO - API Rewrite Lyrics")

  try {
    const body = await request.json()
    const lyrics = body.lyrics || body.letra || body.letraOriginal || ""
    const genre = body.genero || body.genre || "Sertanejo"

    console.log("[v0] 📝 Letra recebida:", lyrics.substring(0, 100))

    if (!lyrics || lyrics.trim().length < 10) {
      return NextResponse.json({ error: "Letra não encontrada ou muito curta" }, { status: 400 })
    }

    console.log("[v0] 🤖 Chamando OpenAI diretamente...")

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `Reescreva esta letra de ${genre} mantendo a mesma estrutura e tema, mas melhorando a métrica e rimas.

LETRA ORIGINAL:
${lyrics}

INSTRUÇÕES:
- Mantenha EXATAMENTE a mesma estrutura (mesmo número de versos e refrões)
- Mantenha o tema e história da letra original
- Máximo 11 sílabas por verso
- Melhore as rimas

Retorne apenas a letra reescrita no formato:
[VERSE 1]
verso 1
verso 2
...

[CHORUS]
refrão 1
refrão 2
...`,
      temperature: 0.7,
      maxTokens: 2000,
    })

    console.log("[v0] ✅ OpenAI respondeu - Primeiros 200 chars:", text.substring(0, 200))

    return NextResponse.json({
      letra: text,
      titulo: "Reescrita",
      metadata: { finalScore: 100, testMode: true },
    })
  } catch (error) {
    console.error("[v0] ❌ ERRO:", error)
    return NextResponse.json(
      {
        error: "Erro na reescrita",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
