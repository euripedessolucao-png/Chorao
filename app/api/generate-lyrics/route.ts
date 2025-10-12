import { generateText } from "ai"
import { NextResponse } from "next/server"
import { ThirdWayEngine } from "@/lib/third-way-converter"
import { GENRE_CONFIGS } from "@/lib/genre-config"
import { BACHATA_BRASILEIRA_2024 } from "@/lib/genres/bachata_brasileira_2024"
import { SERTANEJO_MODERNO_2024 } from "@/lib/genres/sertanejo_moderno_2024"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      genero,
      humor,
      tema,
      criatividade,
      hook,
      inspiracao,
      metaforas,
      emocoes,
      titulo,
      metrics,
      chorusSelected,
      formattingStyle,
      additionalRequirements,
    } = body

    const isBachata = genero.toLowerCase().includes("bachata")
    const isSertanejo = genero.toLowerCase().includes("sertanejo")
    const isPerformanceMode = formattingStyle === "performatico"

    const genreConfig = isBachata
      ? BACHATA_BRASILEIRA_2024
      : isSertanejo
        ? SERTANEJO_MODERNO_2024
        : GENRE_CONFIGS[genero as keyof typeof GENRE_CONFIGS]

    const forbiddenList = genreConfig?.language_rules?.forbidden
      ? Object.values(genreConfig.language_rules.forbidden).flat()
      : []
    const allowedList = genreConfig?.language_rules?.allowed
      ? Object.values(genreConfig.language_rules.allowed).flat()
      : []

    const languageRule = additionalRequirements
      ? `ATENÇÃO: Os requisitos adicionais do compositor têm PRIORIDADE ABSOLUTA sobre qualquer regra abaixo:\n${additionalRequirements}\n\n`
      : `REGRA UNIVERSAL DE LINGUAGEM (INVIOLÁVEL):
- Use APENAS palavras simples e coloquiais do dia-a-dia
- Fale como um humano comum fala na conversa cotidiana
- PROIBIDO: vocabulário rebuscado, poético, literário ou formal
- PERMITIDO: gírias, contrações, expressões populares
- Exemplo BOM: "tô", "cê", "pra", "né", "mano"
- Exemplo RUIM: "outono da alma", "florescer", "bonança"

`

    const prompt = `${languageRule}COMPOSITOR PROFISSIONAL - RESTRIÇÕES ABSOLUTAS

GÊNERO: ${genero}
TEMA: ${tema || "universal"}
HUMOR: ${humor || "variado"}
${hook ? `HOOK OBRIGATÓRIO: ${hook}` : ""}
${titulo ? `TÍTULO OBRIGATÓRIO: ${titulo}` : ""}

RESTRIÇÕES INVIOLÁVEIS:
1. MÁXIMO ${metrics?.maxSyllables || 12} SÍLABAS POR LINHA
2. PROIBIDO USAR: ${forbiddenList.slice(0, 15).join(", ")}
3. USE APENAS: ${allowedList.slice(0, 15).join(", ")}
4. NUNCA quebre palavras (ex: "nãsãnossas" é ERRO GRAVE)
5. ${isSertanejo ? "REFRÃO: 2 ou 4 linhas (NUNCA 3)" : ""}
6. ${isBachata ? "Se usar vírgula: máx 6 sílabas antes + 6 depois" : ""}
7. BPM: ${metrics?.bpm || 100}

FORMATAÇÃO DE VERSOS (IMPORTANTE):
- EMPILHE os versos em linhas separadas (um verso por linha)
- EXCEÇÃO: Combine versos na mesma linha SOMENTE quando se completam semanticamente
- Exemplo CORRETO (empilhado):
  Você diz que me ama
  Mas não mostra
- Exemplo CORRETO (completam-se):
  Você diz que me ama, mas não mostra
- MOTIVO: Facilita contagem visual de versos e detecção de erros

${
  chorusSelected && chorusSelected.length > 0
    ? `REFRÕES OBRIGATÓRIOS (use EXATAMENTE como fornecidos):
${chorusSelected.map((c: any, i: number) => `Refrão ${i + 1}:\n${c.lines.join("\n")}`).join("\n\n")}`
    : ""
}

FORMATO OBRIGATÓRIO:
${
  isPerformanceMode
    ? `Título: ${titulo || "[2-4 palavras do refrão]"}

[INTRO - Instrumentação e atmosfera]

[VERSE 1 - Voz e ritmo]
[4 linhas em português]

[CHORUS - Energia máxima]
[refrão em português]

[VERSE 2 - Variação]
[4 linhas em português]

[BRIDGE - Transição]
[2 linhas em português]

[FINAL CHORUS]
[refrão repetido]

[OUTRO - Encerramento]

(Instruments: [lista em inglês] | BPM: ${metrics?.bpm || 100} | Style: ${genero})`
    : `Título: ${titulo || "[2-4 palavras do refrão]"}

[INTRO]
[introdução]

[VERSO 1]
[4 linhas]

[REFRÃO]
[refrão principal]

[VERSO 2]
[4 linhas]

[PONTE]
[2 linhas]

[OUTRO]
[encerramento]

${isPerformanceMode ? `(Instruments: [lista] | BPM: ${metrics?.bpm || 100} | Style: ${genero})` : ""}`
}

RETORNE APENAS A LETRA FORMATADA (sem comentários, sem explicações).`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: criatividade === "conservador" ? 0.5 : criatividade === "ousado" ? 0.9 : 0.7,
    })

    const lines = text.split("\n")
    const processedLines = await Promise.all(
      lines.map(async (line, index) => {
        if (line.startsWith("[") || line.startsWith("(") || line.startsWith("Título:") || !line.trim()) {
          return line
        }

        try {
          return await ThirdWayEngine.generateThirdWayLine(
            line,
            genero,
            genreConfig,
            `${tema} - linha ${index + 1}`,
            isPerformanceMode,
            additionalRequirements,
          )
        } catch (error) {
          console.error(`[v0] Erro Terceira Via linha ${index + 1}:`, error)
          return line
        }
      }),
    )

    let finalLyrics = processedLines.join("\n")

    let extractedTitle = titulo || ""
    const titleMatch = finalLyrics.match(/^Título:\s*(.+)$/m)
    if (titleMatch?.[1]) {
      extractedTitle = titleMatch[1].trim()
    } else if (!extractedTitle) {
      const chorusMatch = finalLyrics.match(/\[(?:CHORUS|REFRÃO)[^\]]*\]\s*\n([^\n]+)/i)
      if (chorusMatch?.[1]) {
        extractedTitle = chorusMatch[1].trim().split(" ").slice(0, 4).join(" ")
        finalLyrics = `Título: ${extractedTitle}\n\n${finalLyrics}`
      }
    }

    if (isPerformanceMode && !finalLyrics.includes("(Instruments:")) {
      const instruments = isBachata
        ? "electric guitar, synthesizer, electronic drums, accordion"
        : "guitar, bass, drums, keyboard"
      finalLyrics += `\n\n(Instruments: [${instruments}] | BPM: ${metrics?.bpm || 100} | Style: ${genero})`
    }

    return NextResponse.json({ letra: finalLyrics, titulo: extractedTitle })
  } catch (error) {
    console.error("[v0] Erro ao gerar letra:", error)
    return NextResponse.json(
      { error: "Erro ao gerar letra", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 },
    )
  }
}
