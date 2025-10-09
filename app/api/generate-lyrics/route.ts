import { generateText } from "ai"
import { NextResponse } from "next/server"
import { openai } from '@ai-sdk/openai'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { genero, humor, tema, criatividade, hook, inspiracao, metaforas, emocoes, titulo, metrics } = body

    const metricInfo = metrics
      ? `\n\nMÉTRICA DO GÊNERO:
- Sílabas por linha: ${metrics.syllablesPerLine}
- BPM: ${metrics.bpm}
- Estrutura: ${metrics.structure}`
      : ""

    // ✅ DETERMINA O FORMATO BASEADO NO GÊNERO
    const isSertanejoModerno = genero.includes("Sertanejo Moderno") || 
                               genero.includes("Feminejo")
    
    const formatoEstrutura = isSertanejoModerno 
      ? `FORMATO DE SAÍDA OBRIGATÓRIO:
[INTRO]
[texto da introdução]

[PART A – Verse 1]
[primeiro verso - 4 linhas]

[PART B – Chorus]
[refrão - 4 linhas]

[PART A2 – Verse 2]  
[segundo verso - 4 linhas]

[PART C – Bridge]
[ponte - 2 linhas]

[PART B – Chorus]
[refrão]

[PART B – Chorus]
[refrão repetido]

[OUTRO]
[encerramento - 2 linhas]`
      : `FORMATO DE SAÍDA OBRIGATÓRIO:
[INTRO]
[texto da introdução]

[VERSO 1]
[primeiro verso]

[PRÉ-REFRÃO]
[preparação para o refrão]

[REFRÃO]
[refrão principal]

[VERSO 2]
[segundo verso]

[PONTE]
[seção de transição]

[OUTRO]
[encerramento]`

    // ✅ PROMPT DINÂMICO E PROFISSIONAL
    const prompt = `Você é um compositor profissional especializado em ${genero}.

CRIE UMA LETRA ORIGINAL COM:
${titulo ? `Título: ${titulo}` : "Título: [crie um título impactante]"}
Gênero: ${genero}
Humor: ${humor || "variado"}
Tema: ${tema || "universal"}
${hook ? `Hook sugerido: ${hook}` : ""}
${inspiracao ? `Inspiração: ${inspiracao}` : ""}
${metaforas ? `Metáforas: ${metaforas}` : ""}
${emocoes && emocoes.length > 0 ? `Emoções: ${emocoes.join(", ")}` : ""}${metricInfo}

${formatoEstrutura}

(Instruments: [lista de instrumentos em inglês] | BPM: ${metrics?.bpm || "adequado"} | Style: ${genero})

IMPORTANTE: 
- A LETRA (parte cantada) deve ser SEMPRE em PORTUGUÊS
- INSTRUÇÕES e INSTRUMENTOS em INGLÊS
- Seja criativo e autêntico no estilo ${genero}
- Retorne APENAS a letra formatada, sem comentários adicionais.`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"), // ✅ Usando openai provider
      prompt: prompt,
      temperature:
        criatividade === "conservador"
          ? 0.5
          : criatividade === "equilibrado"
            ? 0.7
            : criatividade === "ousado"
              ? 0.9
              : 0.7, // padrão
    })

    return NextResponse.json({ letra: text })
  } catch (error) {
    console.error("[v0] Error generating lyrics:", error)
    
    // ✅ CORREÇÃO: Tratamento seguro do erro
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
    
    return NextResponse.json({ 
      error: "Erro ao gerar letra.",
      details: errorMessage 
    }, { status: 500 })
  }
}
