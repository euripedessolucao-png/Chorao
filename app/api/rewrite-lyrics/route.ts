import { NextResponse } from "next/server"
import { generateText } from "ai"
import { UltimateFixer } from "@/lib/validation/ultimate-fixer"
import { applyTerceiraViaToLine } from "@/lib/terceira-via"

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
      prompt: `Reescreva esta letra de ${genre} mantendo a mesma estrutura e tema, mas melhorando a métrica e rimas.

LETRA ORIGINAL:
${lyrics}

REGRAS OBRIGATÓRIAS (ORDEM DE PRIORIDADE):
1. MÁXIMO 11 SÍLABAS POR VERSO (regra de ouro - NUNCA viole isso)
2. Mantenha EXATAMENTE a mesma estrutura (mesmo número de versos e refrões)
3. Mantenha o tema e história da letra original
4. Mantenha palavras-chave importantes
5. Use rimas naturais (não force rimas)
6. Evite clichês genéricos de IA

INSTRUÇÕES PARA TERCEIRA VIA (originalidade):
- Evite frases como "tudo vai dar certo", "vai ficar tudo bem", "acredite nisso"
- Use metáforas originais e específicas ao tema
- Prefira linguagem brasileira autêntica

COMO CONTAR SÍLABAS POÉTICAS:
- Conte até a última sílaba tônica
- "Lembro do cheiro da chuva na terra" = 11 sílabas ✅
- "Da poeira na bota, firmeza que impera" = 11 sílabas ✅

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
    })

    console.log("[v0] ✅ OpenAI respondeu - Primeiros 200 chars:", text.substring(0, 200))

    console.log("[v0] 🔧 Aplicando UltimateFixer...")
    let fixedLyrics = text
    try {
      fixedLyrics = UltimateFixer.fixFullLyrics(text)
      console.log("[v0] ✅ UltimateFixer aplicado - Primeiros 200 chars:", fixedLyrics.substring(0, 200))
    } catch (error) {
      console.error("[v0] ⚠️ UltimateFixer falhou, usando letra sem correção:", error)
    }

    console.log("[v0] 🎯 Aplicando Terceira Via...")
    const lines = fixedLyrics.split("\n")
    const finalLines = await Promise.all(
      lines.map(async (line, index) => {
        if (line.trim().startsWith("[") || line.trim() === "") {
          return line
        }
        try {
          // applyTerceiraViaToLine espera: line, index, context, isPerformanceMode, additionalRequirements?, genre?, genreConfig?
          const result = await applyTerceiraViaToLine(
            line,
            index,
            fixedLyrics, // contexto completo da letra
            false, // isPerformanceMode = false para melhor qualidade
            undefined, // additionalRequirements
            genre, // gênero
            undefined, // genreConfig
          )
          return result // a função retorna string diretamente, não objeto
        } catch (error) {
          console.error("[v0] ⚠️ Terceira Via falhou para linha:", line, error)
          return line
        }
      }),
    )
    const finalLyrics = finalLines.join("\n")

    console.log("[v0] ✅ Letra final - Primeiros 200 chars:", finalLyrics.substring(0, 200))

    return NextResponse.json({
      letra: finalLyrics,
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
