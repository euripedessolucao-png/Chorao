import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log('🎵 [Generate-Chorus] Parâmetros recebidos:', {
      genero: body.genero || body.genre,
      tema: body.tema || body.theme,
      humor: body.humor || body.mood
    })

    // ✅ PARÂMETROS FLEXÍVEIS
    const genero = body.genero || body.genre
    const tema = body.tema || body.theme
    const humor = body.humor || body.mood

    // ✅ VALIDAÇÃO SIMPLES
    if (!genero || !tema) {
      return NextResponse.json({ 
        error: "Gênero e tema são obrigatórios",
        suggestion: "Selecione um gênero musical e digite um tema para gerar refrões"
      }, { status: 400 })
    }

    console.log(`[Generate-Chorus] Gerando refrões para: ${genero} - ${tema}`)

    const prompt = `GERE 5 VARIAÇÕES DE REFRÃO - ${genero.toUpperCase()}

TEMA: ${tema}
HUMOR: ${humor || "Variado"}
GÊNERO: ${genero}

INSTRUÇÕES:
- Gere 5 variações de refrão diferentes
- Cada refrão deve ter 2 ou 4 linhas (NUNCA 3)
- Use linguagem autêntica do ${genero}
- Use contrações: "cê", "tô", "pra", "tá"
- Foque no tema: ${tema}
- Mantenha o humor: ${humor || "adequado ao tema"}

FORMATO DE RESPOSTA:
[Refrão 1 - Estilo Comercial]
• Linha 1 do refrão
• Linha 2 do refrão
[Justificativa: Porque funciona comercialmente...]

[Refrão 2 - Estilo Emocional]  
• Linha 1 do refrão
• Linha 2 do refrão
[Justificativa: Porque conecta emocionalmente...]

[Refrão 3 - Estilo Dançante]
• Linha 1 do refrão
• Linha 2 do refrão  
[Justificativa: Porque é cativante e dançante...]

[Refrão 4 - Estilo Poético]
• Linha 1 do refrão
• Linha 2 do refrão
[Justificativa: Porque tem linguagem poética...]

[Refrão 5 - Estilo Simples]
• Linha 1 do refrão
• Linha 2 do refrão
[Justificativa: Porque é direto e memorável...]

MELHOR OPÇÃO COMERCIAL: [Número do refrão]`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.7
    })

    // ✅ PROCESSAMENTO SIMPLES DA RESPOSTA
    const variations = parseChorusResponse(text)
    const bestCommercialOptionIndex = findBestCommercialOption(text)

    console.log(`[Generate-Chorus] ✅ ${variations.length} refrões gerados`)

    return NextResponse.json({
      variations,
      bestCommercialOptionIndex
    })

  } catch (error) {
    console.error("[Generate-Chorus] Erro:", error)
    
    return NextResponse.json(
      {
        error: "Erro ao gerar refrões",
        details: error instanceof Error ? error.message : "Erro desconhecido",
        suggestion: "Tente novamente com um tema mais específico"
      },
      { status: 500 }
    )
  }
}

// ✅ FUNÇÃO SIMPLES PARA PROCESSAR RESPOSTA
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

  // Busca por padrões simples
  const chorusBlocks = response.split(/\[Refrão \d+/i)
  
  for (const block of chorusBlocks) {
    if (!block.trim()) continue
    
    // Extrai estilo
    const styleMatch = block.match(/- ([^\]]+)\]/)
    const style = styleMatch ? styleMatch[1].trim() : "Estilo Variado"
    
    // Extrai linhas do refrão
    const lineMatches = block.match(/•\s*([^\n]+)/g)
    if (lineMatches && lineMatches.length >= 2) {
      const chorus = lineMatches.slice(0, 2).map(line => line.replace(/•\s*/, '')).join(' / ')
      
      // Extrai justificativa
      const justificationMatch = block.match(/\[Justificativa:\s*([^\]]+)\]/i)
      const justification = justificationMatch ? justificationMatch[1].trim() : "Refrão bem construído"
      
      // Score baseado no estilo
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

  // Garante pelo menos 3 variações
  while (variations.length < 3) {
    variations.push({
      chorus: "Refrão sendo gerado... / Em breve disponível",
      style: "Estilo Básico",
      score: 6,
      justification: "Refrão em desenvolvimento"
    })
  }

  return variations.slice(0, 5)
}

// ✅ IDENTIFICA MELHOR OPÇÃO COMERCIAL
function findBestCommercialOption(response: string): number {
  const bestMatch = response.match(/MELHOR OPÇÃO COMERCIAL:\s*\[?(\d+)\]?/i)
  if (bestMatch) {
    return Math.min(4, parseInt(bestMatch[1]) - 1) // Converte para índice 0-based
  }

  // Fallback: procura por "Comercial" no texto
  const commercialIndex = response.toLowerCase().indexOf("comercial")
  if (commercialIndex > -1) {
    return 0 // Primeiro refrão como fallback
  }

  return 0
}
