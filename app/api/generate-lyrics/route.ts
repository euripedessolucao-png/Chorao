import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { getGenreConfig } from "@/lib/genre-config"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"

export async function POST(request: NextRequest) {
  try {
    const {
      genero,
      humor,
      tema,
      criatividade,
      inspiracao,
      metaforas,
      emocoes,
      titulo,
      formattingStyle,
      additionalRequirements,
      metrics,
    } = await request.json()

    if (!genero) {
      return NextResponse.json({ error: "Gênero é obrigatório" }, { status: 400 })
    }

    const genreConfig = getGenreConfig(genero)
    const isPerformanceMode = formattingStyle === "performatico"
    const isBachata = genero.toLowerCase().includes("bachata")

    const universalRules = `
🎵 REGRAS UNIVERSAIS DO SISTEMA

1. LINGUAGEM BRASILEIRA SIMPLES E COLOQUIAL
   - Use palavras do dia-a-dia, como um brasileiro fala naturalmente
   - PROIBIDO: vocabulário rebuscado, poético, literário
   - PERMITIDO: gírias, contrações, expressões populares ("tô", "cê", "pra", "né")

2. MÉTRICA E RESPIRAÇÃO
   - Cada verso deve caber em um fôlego natural ao cantar
   - Máximo 12 sílabas poéticas por verso
   - Versos empilhados (um por linha, sem parágrafos longos)

3. ESTRUTURA DE VERSOS
   - Um verso por linha (empilhamento vertical)
   - Facilita contagem de sílabas e respiração

4. RIMAS NATURAIS (NÃO FORÇADAS)
   - Rimas devem surgir naturalmente da narrativa
   - Prefira rimas ricas (classes gramaticais diferentes)
   - Evite rimas óbvias ou clichês

5. EMOÇÃO AUTÊNTICA
   - Sentimentos diretos e honestos
   - Metáforas concretas (não abstratas)
   - Cenas visuais claras
`

    const chorusContext = additionalRequirements?.match(/\[CHORUS\]\s*([\s\S]+?)(?=\n\n|\[|$)/i)?.[1]
      ? `\n\nREFRÃO PRÉ-DEFINIDO (use exatamente):\n${additionalRequirements.match(/\[CHORUS\]\s*([\s\S]+?)(?=\n\n|\[|$)/i)![1].trim()}\n\nConstrua a narrativa em torno deste refrão.`
      : ""

    const structureGuide = `
ESTRUTURA COMERCIAL (3:30 de duração):
[INTRO] (instrumental, 8-12 segundos)
[VERSE 1] (4 linhas empilhadas)
[PRE-CHORUS] (2 linhas) - preparação emocional
[CHORUS] (2-4 linhas) - grudento e memorável
[VERSE 2] (4 linhas) - desenvolve a história
[PRE-CHORUS] (2 linhas)
[CHORUS] (repete)
[BRIDGE] (2-4 linhas) - momento de reflexão
[CHORUS] (repete)
[OUTRO] (fade out ou hook final)
`

    const performanceInstructions = isPerformanceMode
      ? `\n\nFORMATO PERFORMÁTICO:
- Adicione descrições: (sobe o tom), (pausa dramática), (repete 2x)
- Momentos instrumentais: [GUITAR SOLO], [DRUM BREAK]
- Dinâmicas: (suave), (crescendo), (explosivo)
- Final: (Instruments: [lista] | BPM: ${metrics?.bpm || 100} | Style: ${genero})`
      : `\n\nFORMATO PADRÃO:
- Marcadores em inglês: [INTRO], [VERSE], [CHORUS], [BRIDGE], [OUTRO]
- Letra limpa e direta
- Final: (Instruments: [lista] | BPM: ${metrics?.bpm || 100} | Style: ${genero})`

    const prompt = `${universalRules}

Você é um compositor profissional brasileiro especializado em ${genero}.

TAREFA: Escreva uma letra completa aplicando o processo TERCEIRA VIA em cada verso.

PROCESSO TERCEIRA VIA:
- Para cada verso, considere: (A) Métrica/Fluidez + (B) Emoção/Autenticidade = (C) Síntese Final
- Cada linha deve ter ritmo natural E emoção autêntica
- Máximo 12 sílabas por verso
- Linguagem simples brasileira

ESPECIFICAÇÕES:
TEMA: ${tema || "amor e relacionamento"}
HUMOR: ${humor || "neutro"}
CRIATIVIDADE: ${criatividade}
${inspiracao ? `INSPIRAÇÃO: ${inspiracao}` : ""}
${metaforas ? `METÁFORAS (PRIORIDADE): ${metaforas}\nInsira naturalmente na letra.` : ""}
${emocoes?.length ? `EMOÇÕES: ${emocoes.join(", ")}` : ""}
${titulo ? `TÍTULO: ${titulo}` : ""}
${additionalRequirements ? `\nREQUISITOS ADICIONAIS (PRIORIDADE ABSOLUTA):\n${additionalRequirements}` : ""}
${chorusContext}

${structureGuide}

REGRAS DE PROSÓDIA (${genreConfig.name}):
- Com vírgula: máx ${genreConfig.prosody_rules.syllable_count.with_comma.max_before_comma} sílabas antes, ${genreConfig.prosody_rules.syllable_count.with_comma.max_after_comma} depois
- Sem vírgula: ${genreConfig.prosody_rules.syllable_count.without_comma.min}-${genreConfig.prosody_rules.syllable_count.without_comma.max} sílabas

${performanceInstructions}

Escreva a letra completa agora, aplicando Terceira Via em cada verso:`

    console.log("[v0] Gerando letra com Terceira Via...")

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.8,
    })

    let finalLyrics = text.trim()

    let extractedTitle = titulo || ""
    const titleMatch = finalLyrics.match(/^Title:\s*(.+)$/m)
    if (titleMatch?.[1]) {
      extractedTitle = titleMatch[1].trim()
    } else if (!extractedTitle) {
      const chorusMatch = finalLyrics.match(/\[(?:CHORUS|REFRÃO)[^\]]*\]\s*\n([^\n]+)/i)
      if (chorusMatch?.[1]) {
        extractedTitle = chorusMatch[1].trim().split(" ").slice(0, 4).join(" ")
        finalLyrics = `Title: ${extractedTitle}\n\n${finalLyrics}`
      }
    }

    if (isPerformanceMode && !finalLyrics.includes("(Instruments:")) {
      const instruments = isBachata
        ? "electric guitar, synthesizer, electronic drums, accordion"
        : "guitar, bass, drums, keyboard"
      finalLyrics += `\n\n(Instruments: [${instruments}] | BPM: ${metrics?.bpm || 100} | Style: ${genero})`
    }

    finalLyrics = capitalizeLines(finalLyrics)

    console.log("[v0] Letra gerada com sucesso usando Terceira Via")

    return NextResponse.json({
      letra: finalLyrics,
      titulo: extractedTitle,
    })
  } catch (error) {
    console.error("[v0] Erro ao gerar letra:", error)
    return NextResponse.json(
      { error: "Erro ao gerar letra", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 },
    )
  }
}
