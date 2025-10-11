import { NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { lyrics, additionalRequirements } = await request.json()

    if (!lyrics) {
      return NextResponse.json({ error: "Letra é obrigatória" }, { status: 400 })
    }

    const languageRule = additionalRequirements
      ? `ATENÇÃO: Os requisitos adicionais do compositor têm PRIORIDADE ABSOLUTA sobre qualquer regra:\n${additionalRequirements}\n\n`
      : `REGRA UNIVERSAL DE LINGUAGEM (INVIOLÁVEL):
- Use APENAS palavras simples e coloquiais do dia-a-dia
- Fale como um humano comum fala na conversa cotidiana
- PROIBIDO: vocabulário rebuscado, poético, literário ou formal
- PERMITIDO: gírias, contrações, expressões populares

`

    const prompt = `${languageRule}Você é um especialista em hooks musicais e viralidade. Analise esta letra e gere hooks comerciais.

LETRA PARA ANALISAR:
${lyrics}

SUA TAREFA:

1. GANCHÔMETRO (0-100)
   - Dê uma nota baseada em: memorabilidade, repetição estratégica, apelo emocional, potencial de viralidade

2. HOOK PRINCIPAL
   - Crie UM hook principal baseado na letra (máximo 8 palavras)
   - Deve ser cativante e fácil de lembrar

3. TRANSFORMAÇÕES SUGERIDAS
   - Pegue 2-3 trechos da letra e transforme em hooks melhores
   - Mostre: Original → Transformado + Razão da mudança

4. ESTRATÉGIA DE POSICIONAMENTO
   - Onde posicionar o hook na música (intro, refrão, ponte, etc.)
   - Quantas repetições sugeridas

5. TESTE TIKTOK
   - Como esse hook soaria em um clipe de 5 segundos

6. SUGESTÕES DE MELHORIA
   - 3-4 sugestões específicas para aumentar o ganchômetro

FORMATO DE RESPOSTA EM JSON:
{
  "hook": "hook principal aqui",
  "score": 85,
  "suggestions": ["sugestão 1", "sugestão 2", "sugestão 3"],
  "placement": ["posicionamento 1", "posicionamento 2"],
  "tiktokTest": "descrição do teste tiktok",
  "transformations": [
    {
      "original": "trecho original",
      "transformed": "trecho transformado", 
      "reason": "razão da transformação"
    }
  ]
}

Retorne APENAS o JSON, sem markdown ou texto adicional.`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt: prompt,
      temperature: 0.8,
    })

    let parsedResult
    try {
      parsedResult = JSON.parse(text)
    } catch (parseError) {
      return NextResponse.json({ error: "Erro ao processar resposta da IA" }, { status: 500 })
    }

    return NextResponse.json(parsedResult)
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
