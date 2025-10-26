import { NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    const lyrics = formData.get("lyrics") as string
    const title = formData.get("title") as string

    if (!audioFile || !lyrics) {
      return NextResponse.json({ error: "Arquivo de áudio e letra são obrigatórios" }, { status: 400 })
    }

    // Validar tamanho do arquivo (máx 50MB)
    if (audioFile.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo muito grande. Máximo 50MB." }, { status: 400 })
    }

    const promptAnalise = `Você é um especialista em avaliação de performances vocais e composição musical brasileira.

ANALISE ESTA CANTADA:

TÍTULO: ${title || "Sem título"}
LETRA:
${lyrics}

AVALIE EM TRÊS CATEGORIAS (0-10 para cada):

1. MÉTRICA E PROSÓDIA
   - Encaixe das sílabas na melodia
   - Fluência e naturalidade ao cantar
   - Respiração adequada entre frases
   - Ritmo e cadência

2. INTERPRETAÇÃO EMOCIONAL
   - Transmissão da emoção da letra
   - Dinâmica vocal (variação de intensidade)
   - Expressividade e conexão com a mensagem
   - Autenticidade da performance

3. TÉCNICA VOCAL
   - Afinação e precisão das notas
   - Dicção e clareza das palavras
   - Controle vocal e sustentação
   - Qualidade do timbre

FORNEÇA:
- Nota final (média das 3 categorias) em formato "X.X/10"
- Feedback detalhado por categoria (2-3 frases cada)
- 3 sugestões específicas e práticas de melhoria
- 2-3 pontos fortes identificados

FORMATO DE RESPOSTA:
NOTA: X.X/10

FEEDBACK:
[feedback detalhado por categoria]

SUGESTÕES:
1. [sugestão específica e prática]
2. [sugestão específica e prática]
3. [sugestão específica e prática]

PONTOS FORTES:
• [ponto forte 1]
• [ponto forte 2]
• [ponto forte 3]

Seja construtivo, específico e encorajador. Use linguagem clara e acessível.`

    const promptHook = `Você é um especialista em hooks musicais e potencial comercial de músicas brasileiras.

ANALISE O POTENCIAL DE HOOK DESTA LETRA:

LETRA:
${lyrics}

AVALIE:

1. GANCHÔMETRO (0-100)
   - Memorabilidade do refrão
   - Repetição estratégica
   - Potencial de viralidade
   - Apelo comercial

2. HOOK IDENTIFICADO
   - Qual é o trecho mais "grudento"?
   - Ele é repetido adequadamente?
   - Tem poder emocional?

3. SUGESTÕES DE OTIMIZAÇÃO
   - Como melhorar o hook existente
   - Onde inserir repetições
   - Transformações para mais impacto

4. EXEMPLOS DE REFERÊNCIA
   - Hooks similares que deram certo
   - Estratégias de posicionamento

FORMATO DE RESPOSTA:
GANCHÔMETRO: X/100

HOOK IDENTIFICADO:
"[trecho do hook]"

POTENCIAL COMERCIAL:
[análise do potencial]

SUGESTÕES DE OTIMIZAÇÃO:
1. [sugestão 1]
2. [sugestão 2]
3. [sugestão 3]

REFERÊNCIAS:
- [exemplo 1] - [por que funcionou]
- [exemplo 2] - [por que funcionou]

TESTE TIKTOK (5s):
[como esse hook soaria em um clip de 5s]`

    const [analiseResult, hookResult] = await Promise.all([
      generateText({
        model: "openai/gpt-4o-mini",
        prompt: promptAnalise,
        temperature: 0.7,
      }),
      generateText({
        model: "openai/gpt-4o-mini",
        prompt: promptHook,
        temperature: 0.85,
      }),
    ])

    return NextResponse.json({
      avaliacao: analiseResult.text,
      analiseHook: hookResult.text,
      audioProcessado: true,
    })
  } catch (error) {
    console.error("Erro na avaliação:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
