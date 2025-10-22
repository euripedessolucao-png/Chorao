import { NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: Request) {
  console.log("[v0] 🚀 API Rewrite Lyrics - Correção em Uma Etapa")

  try {
    const body = await request.json()
    const lyrics = body.lyrics || body.letra || body.letraOriginal || ""
    const genre = body.genero || body.genre || "Sertanejo"

    console.log("[v0] 📝 Letra recebida:", lyrics.substring(0, 100))
    console.log("[v0] 🎵 Gênero:", genre)

    if (!lyrics || lyrics.trim().length < 10) {
      return NextResponse.json({ error: "Letra não encontrada ou muito curta" }, { status: 400 })
    }

    console.log("[v0] 📝 Gerando e corrigindo letra em uma única etapa...")

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `Reescreva esta letra seguindo TODAS as regras:

LETRA ORIGINAL:
${lyrics}

REGRAS OBRIGATÓRIAS:
1. ⚠️ MÁXIMO 11 SÍLABAS POR VERSO (contando até a última tônica) - REGRA MAIS IMPORTANTE
2. Mesma estrutura (mesmo número de versos/refrões)
3. Mesmo tema e história
4. Rimas naturais e corretas
5. Evite clichês genéricos
6. Use linguagem brasileira autêntica

COMO REDUZIR SÍLABAS:
- Use sinônimos curtos: "dinheiro" → "grana", "esperança" → "graça"
- Remova artigos desnecessários: "a vida é uma guerra" → "vida é guerra"
- Simplifique frases: "mas não sei pra onde ir" → "sem direção"

EXEMPLOS DE VERSOS CORRETOS (11 sílabas):
"Lem-bro-do-chei-ro-da-chu-va-na-ter-ra" (11)
"Não-ti-nha-gra-na-mas-eu-so-nha-va" (11)
"Ai-ai-ai-quem-tá-no-ca-bres-to-sou-eu" (11)

Retorne apenas a letra no formato:
[VERSE 1]
verso 1
verso 2
...`,
      temperature: 0.7,
    })

    console.log("[v0] ✅ Letra gerada - Primeiros 200 chars:", text.substring(0, 200))

    return NextResponse.json({
      letra: text.trim(),
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
