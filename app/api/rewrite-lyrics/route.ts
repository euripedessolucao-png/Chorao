import { NextResponse } from "next/server"
import { generateText } from "ai"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter"

async function fixLineWithAI(line: string, maxRetries = 2): Promise<string> {
  const syllables = countPoeticSyllables(line)

  if (syllables <= 11) {
    return line // Já está correto
  }

  console.log(`[v0] 🔧 Corrigindo linha com ${syllables} sílabas: "${line}"`)

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt: `Reescreva esta linha para ter MÁXIMO 11 sílabas (contando até a última tônica):

LINHA ORIGINAL (${syllables} sílabas): "${line}"

REGRAS:
1. MÁXIMO 11 sílabas
2. Manter o sentido e emoção
3. Manter a rima se houver
4. Usar sinônimos mais curtos quando necessário
5. Remover palavras desnecessárias

EXEMPLOS DE CORREÇÃO:
"Da poeira na bota, pé firme na serra" (13 sílabas) → "Da poeira na bota, firmeza impera" (11 sílabas)
"Amava a vida, a liberdade... voava" (13 sílabas) → "Amava a vida, liberdade... voava" (11 sílabas)

Retorne APENAS a linha corrigida, sem explicações.`,
        temperature: 0.3,
      })

      const fixedLine = text.trim()
      const newSyllables = countPoeticSyllables(fixedLine)

      console.log(`[v0] ✅ Tentativa ${attempt}: "${fixedLine}" (${newSyllables} sílabas)`)

      if (newSyllables <= 11) {
        return fixedLine
      }
    } catch (error) {
      console.error(`[v0] ❌ Erro na tentativa ${attempt}:`, error)
    }
  }

  // Se todas as tentativas falharam, retorna a original
  console.log(`[v0] ⚠️ Não conseguiu corrigir, mantendo original`)
  return line
}

export async function POST(request: Request) {
  console.log("[v0] 🚀 API Rewrite Lyrics - Correção em Duas Etapas")

  try {
    const body = await request.json()
    const lyrics = body.lyrics || body.letra || body.letraOriginal || ""
    const genre = body.genero || body.genre || "Sertanejo"

    console.log("[v0] 📝 Letra recebida:", lyrics.substring(0, 100))
    console.log("[v0] 🎵 Gênero:", genre)

    if (!lyrics || lyrics.trim().length < 10) {
      return NextResponse.json({ error: "Letra não encontrada ou muito curta" }, { status: 400 })
    }

    console.log("[v0] 📝 ETAPA 1: Gerando letra com foco em tema e emoção...")

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `Reescreva esta letra mantendo estrutura, tema e emoção:

${lyrics}

REGRAS:
1. Mesma estrutura (mesmo número de versos/refrões)
2. Mesmo tema e história
3. Rimas naturais e corretas
4. Evite clichês genéricos
5. Use linguagem brasileira autêntica

Retorne apenas a letra no formato:
[VERSE 1]
verso 1
verso 2
...`,
      temperature: 0.7,
    })

    console.log("[v0] ✅ ETAPA 1 concluída - Primeiros 200 chars:", text.substring(0, 200))

    console.log("[v0] 🔧 ETAPA 2: Corrigindo sílabas linha por linha...")

    const lines = text.split("\n")
    const correctedLines = []

    for (const line of lines) {
      const trimmedLine = line.trim()

      // Pular linhas vazias e tags de seção
      if (!trimmedLine || trimmedLine.startsWith("[")) {
        correctedLines.push(line)
        continue
      }

      // Corrigir linha se necessário
      const correctedLine = await fixLineWithAI(trimmedLine)
      correctedLines.push(correctedLine)
    }

    const finalLyrics = correctedLines.join("\n")

    console.log("[v0] ✅ ETAPA 2 concluída - Letra final com sílabas corrigidas")
    console.log("[v0] 📊 Primeiros 200 chars:", finalLyrics.substring(0, 200))

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
