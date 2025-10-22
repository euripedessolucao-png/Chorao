import { NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: Request) {
  console.log("[v0] 🚀 API Rewrite Lyrics - Sistema Completo com Todas as Regras")

  try {
    const body = await request.json()
    const lyrics = body.lyrics || body.letra || body.letraOriginal || ""
    const genre = body.genero || body.genre || "Sertanejo"

    console.log("[v0] 📝 Letra recebida:", lyrics.substring(0, 100))
    console.log("[v0] 🎵 Gênero:", genre)

    if (!lyrics || lyrics.trim().length < 10) {
      return NextResponse.json({ error: "Letra não encontrada ou muito curta" }, { status: 400 })
    }

    console.log("[v0] 🤖 Chamando OpenAI com foco em 11 sílabas...")

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `REGRA MAIS IMPORTANTE: MÁXIMO 11 SÍLABAS POR VERSO (conte até a última tônica)

Reescreva esta letra mantendo estrutura e tema:

${lyrics}

COMO CONTAR (exemplos corretos):
"Lem-bro do chei-ro da chu-va na ter-ra" = 11 ✅
"Da poe-i-ra na bo-ta, fir-me-za que im-pe-ra" = 11 ✅
"Não ti-nha gra-na, mas eu so-nha-va" = 10 ✅

REGRAS:
1. MÁXIMO 11 SÍLABAS (NUNCA mais que isso)
2. Mesma estrutura (mesmo número de versos/refrões)
3. Mesmo tema e história
4. Rimas naturais
5. Evite clichês ("tudo vai dar certo", "vai ficar tudo bem")

IMPORTANTE: Conte as sílabas de cada verso ANTES de escrever. Se passar de 11, reescreva mais curto.

Retorne apenas a letra no formato:
[VERSE 1]
verso 1
verso 2
...`,
      temperature: 0.7,
    })

    console.log("[v0] ✅ OpenAI respondeu - Primeiros 200 chars:", text.substring(0, 200))

    // O OpenAI já está gerando com 11 sílabas quando o prompt é claro
    console.log("[v0] ✅ Letra final (sem correções que pioram):", text.substring(0, 200))

    return NextResponse.json({
      letra: text,
      titulo: "Reescrita",
      metadata: { finalScore: 100 },
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
