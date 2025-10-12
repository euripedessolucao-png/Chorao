import { generateText } from "ai"
import { NextResponse } from "next/server"
import { ThirdWayEngine } from "@/lib/third-way-converter"
import { GENRE_CONFIGS } from "@/lib/genre-config"
import { BACHATA_BRASILEIRA_2024 } from "@/lib/genres/bachata_brasileira_2024"
import { SERTANEJO_MODERNO_2024 } from "@/lib/genres/sertanejo_moderno_2024"
import { getAntiForcingRulesForGenre } from "@/lib/validation/anti-forcing-validator"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"

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

    const antiForcingRules = getAntiForcingRulesForGenre(genero)
    const antiForcingExamples = antiForcingRules
      .slice(0, 3)
      .map((rule) => `- "${rule.keyword}": ${rule.description}`)
      .join("\n")

    const languageRule = additionalRequirements
      ? `ATENÇÃO: Os requisitos adicionais do compositor têm PRIORIDADE ABSOLUTA sobre qualquer regra abaixo:
${additionalRequirements}

REGRA UNIVERSAL DE METÁFORAS:
- Metáforas solicitadas pelo compositor DEVEM ser respeitadas e inseridas na letra
- Não altere, ignore ou substitua metáforas especificadas nos requisitos adicionais
- Integre as metáforas de forma natural no contexto emocional da música
- Se o compositor pediu uma metáfora específica, ela é OBRIGATÓRIA na composição

`
      : `REGRA UNIVERSAL DE LINGUAGEM (INVIOLÁVEL):
- Use APENAS palavras simples e coloquiais do dia-a-dia
- Fale como um humano comum fala na conversa cotidiana
- PROIBIDO: vocabulário rebuscado, poético, literário ou formal
- PERMITIDO: gírias, contrações, expressões populares
- Exemplo BOM: "tô", "cê", "pra", "né", "mano"
- Exemplo RUIM: "outono da alma", "florescer", "bonança"

`

    const antiForcingRule = `
🚫 REGRA UNIVERSAL ANTI-FORÇAÇÃO (CRÍTICA):
Você é um compositor humano, não um robô de palavras-chave.
- Se for relevante para a emoção da cena, você PODE usar referências do gênero
- NUNCA force essas palavras só para "cumprir regras"
- A cena deve surgir NATURALMENTE da dor, alegria, superação ou celebração
- Se a narrativa não pedir uma referência específica, NÃO a inclua
- Autenticidade é mais importante que atualidade forçada

Exemplos para ${genero}:
${antiForcingExamples}

EXEMPLO RUIM: "Ela de biquíni à meia-noite no jantar" (incoerente, forçado)
EXEMPLO BOM: "Meu biquíni novo, o que você chamava de falha" (coerente com emoção)
`

    const prompt = `${languageRule}${antiForcingRule}

COMPOSITOR PROFISSIONAL - RESTRIÇÕES ABSOLUTAS

GÊNERO: ${genero}
TEMA: ${tema || "universal"}
HUMOR: ${humor || "variado"}
${hook ? `HOOK OBRIGATÓRIO: ${hook}` : ""}
${titulo ? `TÍTULO OBRIGATÓRIO: ${titulo}` : ""}

🎯 ZONAS DE LIBERDADE CRIATIVA:
- Você PODE surpreender com metáforas originais (desde que coerentes)
- Você PODE usar estruturas não convencionais (se forem geniais)
- Você PODE usar palavras inesperadas (desde que sirvam à emoção)
- VALIDAÇÃO: Por intenção emocional, NÃO por checklist de palavras-chave
- PRIORIDADE: Autenticidade > Atualidade forçada

RESTRIÇÕES INVIOLÁVEIS:
1. MÁXIMO ${metrics?.maxSyllables || 12} SÍLABAS POR LINHA (limite fisiológico - um fôlego)
2. PROIBIDO USAR: ${forbiddenList.slice(0, 15).join(", ")}
3. USE APENAS: ${allowedList.slice(0, 15).join(", ")}
4. NUNCA quebre palavras (ex: "nãsãnossas" é ERRO GRAVE)
5. ${isSertanejo ? "REFRÃO: 2 ou 4 linhas (NUNCA 3)" : ""}
6. ${isBachata ? "Se usar vírgula: máx 6 sílabas antes + 6 depois" : ""}
7. BPM: ${metrics?.bpm || 100}

ESTRUTURA OBRIGATÓRIA (MÍNIMO 2 MINUTOS):
- VERSO 1: 8-12 linhas (estabelece contexto e emoção)
- REFRÃO: 4-8 linhas (gancho principal, repetível)
- VERSO 2: 8-12 linhas (desenvolve história ou contraste)
- REFRÃO: (repete o mesmo refrão)
- PONTE: 4-8 linhas (clímax emocional ou mudança de perspectiva)
- REFRÃO FINAL: (repete o mesmo refrão com energia máxima)

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
[8-12 linhas em português]

[CHORUS - Energia máxima]
[4-8 linhas - refrão em português]

[VERSE 2 - Variação]
[8-12 linhas em português]

[CHORUS - Repete]
[mesmo refrão]

[BRIDGE - Transição e clímax]
[4-8 linhas em português]

[FINAL CHORUS - Energia máxima]
[mesmo refrão]

[OUTRO - Encerramento]

(Instruments: [lista em inglês] | BPM: ${metrics?.bpm || 100} | Style: ${genero})`
    : `Título: ${titulo || "[2-4 palavras do refrão]"}

[INTRO]
[introdução]

[VERSO 1]
[8-12 linhas]

[REFRÃO]
[4-8 linhas - refrão principal]

[VERSO 2]
[8-12 linhas]

[REFRÃO]
[repete o mesmo refrão]

[PONTE]
[4-8 linhas]

[REFRÃO FINAL]
[repete o mesmo refrão]

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

    finalLyrics = capitalizeLines(finalLyrics)

    return NextResponse.json({ letra: finalLyrics, titulo: extractedTitle })
  } catch (error) {
    console.error("[v0] Erro ao gerar letra:", error)
    return NextResponse.json(
      { error: "Erro ao gerar letra", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 },
    )
  }
}
