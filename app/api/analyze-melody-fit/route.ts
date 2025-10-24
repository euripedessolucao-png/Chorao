import { NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const melodyFile = formData.get("melody") as File
    const lyrics = formData.get("lyrics") as string
    const title = formData.get("title") as string

    if (!melodyFile || !lyrics) {
      return NextResponse.json({ error: "Melodia e letra são obrigatórios" }, { status: 400 })
    }

    // Análise inteligente focada no encaixe letra-melodia
    const prompt = `Você é um especialista em composição musical e encaixe letra-melodia.

ANALISE ESTA LETRA como se estivesse sendo composta para uma melodia específica:

TÍTULO: ${title || "Sem título"}

LETRA:
${lyrics}

AVALIE O ENCAIXE POTENCIAL em 4 dimensões:

1. PROSÓDIA (0-100)
   - As sílabas fluem naturalmente?
   - Palavras importantes em posições fortes?
   - Ritmo verbal compatível com melodia típica?
   - Respirações naturais entre frases?

2. EMOÇÃO MELÓDICA (0-100)  
   - A letra transmite emoção que combina com altos/baixos melódicos?
   - Clímax emocional bem posicionado?
   - Palavras-chave nos momentos certos?

3. ESTRUTURA RÍTMICA (0-100)
   - Versos e refrões bem distribuídos?
   - Padrão de rimas consistente?
   - Sílabas por linha adequadas?
   - Estrutura facilita memorização?

4. MOMENTOS DE CLÍMAX (0-100)
   - Palavras impactantes nos pontos altos?
   - Build-up eficiente?
   - Resolução satisfatória?
   - Hook bem posicionado?

IMPORTANTE: O compositor está ouvindo a melodia enquanto escreve. 
Dê feedback PRÁTICO que ajude ele a SENTIR o encaixe, não apenas regras técnicas.

Identifique 2-3 trechos que funcionam particularmente bem e explique POR QUÊ.
Dê 3-4 sugestões ESPECÍFICAS de como melhorar o encaixe.

FORMATO DE RESPOSTA EM JSON:
{
  "score": 85,
  "metrics": {
    "prosody": 80,
    "emotion": 90, 
    "rhythm": 75,
    "climax": 85
  },
  "suggestions": [
    "Sugestão específica 1 com exemplo",
    "Sugestão específica 2 com exemplo", 
    "Sugestão específica 3 com exemplo"
  ],
  "highlights": [
    {
      "text": "trecho exato da letra",
      "reason": "explicação clara de por que funciona bem"
    }
  ]
}`

    const { text } = await generateText({
      model: "gpt-4o",
      prompt: prompt,
      temperature: 0.85,
    })

    let analysis
    try {
      // Remove markdown code blocks if present
      const cleanText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()
      analysis = JSON.parse(cleanText)
    } catch (parseError) {
      console.error("Erro ao parsear JSON:", parseError)
      console.error("Texto recebido:", text)
      return NextResponse.json({ error: "Erro ao processar análise da IA" }, { status: 500 })
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Erro na análise de encaixe melódico:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
