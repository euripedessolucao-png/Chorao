import { generateText } from "ai"
import { NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { genero, humor, tema, criatividade, hook, inspiracao, metaforas, emocoes, titulo, metrics, chorusSelected } =
      body

    const chorusInfo =
      chorusSelected && chorusSelected.length > 0
        ? `\n\nREFRÕES SELECIONADOS PARA USAR NA LETRA:
${chorusSelected
  .map(
    (c: any, i: number) => `
Refrão ${i + 1}:
${c.lines.join("\n")}
`,
  )
  .join("\n")}

IMPORTANTE: Use estes refrões EXATAMENTE como fornecidos na seção [PART B – Chorus] da letra.`
        : ""

    const metricInfo = metrics
      ? `\n\nMÉTRICA DO GÊNERO:
- Sílabas por linha: ${metrics.syllablesPerLine}
- BPM: ${metrics.bpm}
- Estrutura: ${metrics.structure}`
      : ""

    const isSertanejoModerno = genero.includes("Sertanejo Moderno") || genero.includes("Feminejo")

    const regrasSertanejoModerno = isSertanejoModerno
      ? `\n\nREGRAS ESPECÍFICAS DE SERTANEJO MODERNO 2024-2025:

**REFRÃO (OBRIGATÓRIO):**
- Estrutura: 2 ou 4 linhas (NUNCA 3)
- Prosódia: Com vírgula (máx 6 sílabas antes + 6 depois = 12 total), Sem vírgula (5-7 sílabas, aceitável até 8)
- Linguagem: Tom de empoderamento (feminejo) ou vulnerabilidade com força (masculino)
- Elementos permitidos: referências concretas (biquíni, PIX, story, boteco, pickup, praia)
- Elementos proibidos: metáforas abstratas, vitimização, ódio/vingança, machismo, saudade obsessiva
- Requisitos comerciais: hook curto (2-4 palavras), visual para clipe, repetível, fechamento emocional positivo

**ELEMENTOS PROIBIDOS:**
- "coração no chão", "mundo desabou", "lágrimas", "chorar por você"
- Metáforas abstratas sem imagem visual
- Vitimização ou dependência emocional
- Saudade obsessiva ou melodramática

**ELEMENTOS MODERNOS (USE):**
- "dona de mim", "meu troco", "minha vida, minhas regras"
- Referências visuais: biquíni, story, PIX, boteco, praia
- Empoderamento e independência
- Imagens concretas e cinematográficas`
      : ""

    const formatoEstrutura = isSertanejoModerno
      ? `FORMATO DE SAÍDA OBRIGATÓRIO:
[INTRO]
[texto da introdução]

[PART A – Verse 1]
[primeiro verso - 4 linhas]

[PART B – Chorus]
[refrão - 2 ou 4 linhas]

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

    const prompt = `Você é um compositor profissional especializado em ${genero}.

CRIE UMA LETRA ORIGINAL COM:
${titulo ? `Título: ${titulo}` : "Título: [crie um título impactante]"}
Gênero: ${genero}
Humor: ${humor || "variado"}
Tema: ${tema || "universal"}
${hook ? `Hook sugerido: ${hook}` : ""}
${inspiracao ? `Inspiração: ${inspiracao}` : ""}
${metaforas ? `Metáforas: ${metaforas}` : ""}
${emocoes && emocoes.length > 0 ? `Emoções: ${emocoes.join(", ")}` : ""}${metricInfo}${chorusInfo}${regrasSertanejoModerno}

${formatoEstrutura}

(Instruments: [lista de instrumentos em inglês] | BPM: ${metrics?.bpm || "adequado"} | Style: ${genero})

IMPORTANTE: 
- A LETRA (parte cantada) deve ser SEMPRE em PORTUGUÊS
- INSTRUÇÕES e INSTRUMENTOS em INGLÊS
- Seja criativo e autêntico no estilo ${genero}
- Retorne APENAS a letra formatada, sem comentários adicionais.`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: prompt,
      temperature:
        criatividade === "conservador"
          ? 0.5
          : criatividade === "equilibrado"
            ? 0.7
            : criatividade === "ousado"
              ? 0.9
              : 0.7,
    })

    return NextResponse.json({ letra: text })
  } catch (error) {
    console.error("[v0] Error generating lyrics:", error)

    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"

    return NextResponse.json(
      {
        error: "Erro ao gerar letra.",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
