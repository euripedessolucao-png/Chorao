import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const genero = body.genero || body.genre
    const tema = body.tema || body.theme
    const humor = body.humor || body.mood

    if (!genero || !tema) {
      return NextResponse.json({ 
        error: "Gênero e tema são obrigatórios"
      }, { status: 400 })
    }

    console.log(`[Generate-Chorus] Gerando refrões para: ${genero} - ${tema}`)

    const prompt = `GERE 5 VARIAÇÕES DE REFRÃO - ${genero.toUpperCase()}

TEMA: ${tema}
HUMOR: ${humor || "Variado"}
GÊNERO: ${genero}

Gere 5 refrões diferentes com 2-4 linhas cada.
Use linguagem autêntica do ${genero} e contrações: "cê", "tô", "pra", "tá"

FORMATO:
[Refrão 1 - Estilo Comercial]
• Linha 1
• Linha 2  
[Justificativa: Porque funciona comercialmente...]

[Refrão 2 - Estilo Emocional]
• Linha 1
• Linha 2
[Justificativa: Porque conecta emocionalmente...]

[Refrão 3 - Estilo Dançante]
• Linha 1
• Linha 2
[Justificativa: Porque é cativante...]

[Refrão 4 - Estilo Poético]  
• Linha 1
• Linha 2
[Justificativa: Porque tem linguagem poética...]

[Refrão 5 - Estilo Simples]
• Linha 1
• Linha 2
[Justificativa: Porque é direto e memorável...]

MELHOR OPÇÃO COMERCIAL: [Número do refrão]`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.7
    })

    const variations = parseChorusResponse(text)
    const bestCommercialOptionIndex = findBestCommercialOption(text)

    return NextResponse.json({
      variations,
      bestCommercialOptionIndex
    })

  } catch (error) {
    console.error("[Generate-Chorus] Erro:", error)
    
    return NextResponse.json(
      {
        error: "Erro ao gerar refrões",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    )
  }
}

function parseChorusResponse(response: string): Array<{
  chorus: string
  style: string
  score: number
  justification: string
}> {
  const variations: Array<{
    chorus: string
    style: string
    score: number
    justification: string
  }> = []

  const chorusBlocks = response.split(/\[Refrão \d+/i)
  
  for (const block of chorusBlocks) {
    if (!block.trim()) continue
    
    const styleMatch = block.match(/- ([^\]]+)\]/)
    const style = styleMatch ? styleMatch[1].trim() : "Estilo Variado"
    
    const lineMatches = block.match(/•\s*([^\n]+)/g)
    if (lineMatches && lineMatches.length >= 2) {
      const chorus = lineMatches.slice(0, 2).map(line => line.replace(/•\s*/, '')).join(' / ')
      
      const justificationMatch = block.match(/\[Justificativa:\s*([^\]]+)\]/i)
      const justification = justificationMatch ? justificationMatch[1].trim() : "Refrão bem construído"
      
      const score = style.toLowerCase().includes('comercial') ? 9 : 
                   style.toLowerCase().includes('emocional') ? 8 : 7

      variations.push({
        chorus,
        style,
        score,
        justification
      })
    }
  }

  while (variations.length < 3) {
    variations.push({
      chorus: "Refrão em desenvolvimento / Em breve disponível",
      style: "Estilo Básico",
      score: 6,
      justification: "Refrão sendo gerado"
    })
  }

  return variations.slice(0, 5)
}

function findBestCommercialOption(response: string): number {
  const bestMatch = response.match(/MELHOR OPÇÃO COMERCIAL:\s*\[?(\d+)\]?/i)
  return bestMatch ? Math.min(4, parseInt(bestMatch[1]) - 1) : 0
}
