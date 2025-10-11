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

    const prompt = `Você é um especialista em avaliação de performances vocais e composição musical brasileira.

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
═══════════════════════════════════════
NOTA FINAL: X.X/10
═══════════════════════════════════════

📊 AVALIAÇÃO POR CATEGORIA:

1️⃣ MÉTRICA E PROSÓDIA: X/10
[feedback detalhado]

2️⃣ INTERPRETAÇÃO EMOCIONAL: X/10
[feedback detalhado]

3️⃣ TÉCNICA VOCAL: X/10
[feedback detalhado]

═══════════════════════════════════════
💡 SUGESTÕES DE MELHORIA:
═══════════════════════════════════════

1. [sugestão específica e prática]
2. [sugestão específica e prática]
3. [sugestão específica e prática]

═══════════════════════════════════════
✨ PONTOS FORTES:
═══════════════════════════════════════

• [ponto forte 1]
• [ponto forte 2]
• [ponto forte 3]

═══════════════════════════════════════

Seja construtivo, específico e encorajador. Use linguagem clara e acessível.`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: prompt,
      temperature: 0.7,
    })

    return NextResponse.json({
      avaliacao: text,
      audioProcessado: true,
    })
  } catch (error) {
    console.error("Erro na avaliação:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
