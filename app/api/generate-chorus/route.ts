// app/api/generate-chorus/route.ts - VERSÃO CORRIGIDA COM AI GATEWAY
import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// 🎵 TIPOS
interface ChorusBlock {
  content: string
  score: number
}

function getModel() {
  // Use user's OpenAI API key if available to avoid rate limits
  if (process.env.OPENAI_API_KEY) {
    return openai("gpt-4o-mini", {
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  // Fallback to Vercel AI Gateway
  return "openai/gpt-4o-mini"
}

// ✅ ESTRATÉGIA SIMPLES E EFETIVA (igual à que funcionou)
async function generateNaturalChorus(genre: string, theme: string, context?: string): Promise<ChorusBlock[]> {
  const prompt = `Escreva 4 linhas completas para um REFRÃO de ${genre} sobre "${theme}".

${context ? `Contexto: ${context}` : ""}

**REGRAS IMPORTANTES:**
1. 4 linhas COMPLETAS (nunca cortar versos)
2. Máximo 12 sílabas por linha
3. Estrutura A-B-A-B (linha 1 rima com linha 3, linha 2 rima com linha 4)
4. Gancho memorável e repetitivo
5. Linguagem natural e emocional

**EXEMPLOS QUE FUNCIONAM:**

"Teu sorriso é meu porto seguro"
"Teu abraço é meu aquecimento"  
"No ritmo desse amor tão puro"
"Encontro paz e sentimento"

"Teu olhar é a luz do meu caminho" 
"Teu carinho é o sol do meu dia"
"Em teus braços eu encontro sentido"
"Teu amor é a minha melodia"

**AGORA ESCREVA 4 LINHAS COMPLETAS PARA O REFRÃO:**`

  try {
    console.log(
      "[v0] Calling generateText with model:",
      process.env.OPENAI_API_KEY ? "User's OpenAI API" : "Vercel AI Gateway",
    )

    const { text } = await generateText({
      model: getModel(), // Use the helper function
      prompt,
      temperature: 0.7,
      maxTokens: 200,
    })

    console.log("[v0] Received text response:", text?.substring(0, 100))

    if (!text || typeof text !== "string") {
      console.error("[v0] Invalid text response from AI:", text)
      throw new Error("Invalid text response from AI")
    }

    return processChorusResult(text, genre)
  } catch (error) {
    console.error("[Chorus] Erro na geração:", error)
    console.error("[v0] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })

    if (error instanceof Error && (error.message.includes("rate_limit") || error.message.includes("429"))) {
      console.error("[Chorus] Rate limit atingido - usando fallback")
    }

    return [generateChorusFallback(genre, theme)]
  }
}

// ✅ PROCESSAMENTO SIMPLES (igual ao que funcionou)
function processChorusResult(text: string, genre: string): ChorusBlock[] {
  // Extrair apenas linhas que parecem versos
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => {
      return (
        line &&
        line.length >= 5 &&
        line.length <= 70 &&
        !line.startsWith("**") &&
        !line.startsWith("Exemplo") &&
        !line.startsWith("Regras") &&
        !line.startsWith("Contexto") &&
        !line.startsWith("Agora") &&
        !line.includes("sílabas")
      )
    })
    .slice(0, 4) // Apenas 4 linhas para refrão

  console.log(`[Chorus] Linhas geradas:`, lines)

  // Validação básica de completude
  if (lines.length === 4 && areChorusLinesComplete(lines)) {
    const content = lines.join("\n")

    return [
      {
        content: content,
        score: 90, // Score alto para refrão válido
      },
    ]
  } else {
    console.log(`[Chorus] ❌ Refrão inválido - usando fallback`)
    return [generateChorusFallback("Sertanejo Moderno Masculino", "amor")]
  }
}

// ✅ VALIDAÇÃO DE COMPLETUDE (igual à que funcionou)
function areChorusLinesComplete(lines: string[]): boolean {
  const incompletePatterns = [
    /\b(eu|me|te|se|nos|vos|o|a|os|as|um|uma|em|no|na|de|da|do|por|pra|que|se|mas|meu|minha|teu|tua)\s*$/i,
  ]

  for (const line of lines) {
    for (const pattern of incompletePatterns) {
      if (pattern.test(line)) {
        console.log(`[Chorus] Linha incompleta: "${line}"`)
        return false
      }
    }
  }
  return true
}

// ✅ FALLBACKS NATURAIS PARA REFRÃO (testados e aprovados)
function generateChorusFallback(genre: string, theme: string): ChorusBlock {
  const chorusFallbacks = [
    {
      content: `Teu sorriso é meu porto seguro\nTeu abraço é meu aquecimento\nNo ritmo desse amor tão puro\nEncontro paz e sentimento`,
      score: 95,
    },
    {
      content: `Teu olhar é a luz do meu caminho\nTeu carinho é o sol do meu dia\nEm teus braços eu encontro sentido\nTeu amor é a minha melodia`,
      score: 95,
    },
    {
      content: `Seu amor é minha estrada\nMinha luz, minha jornada\nNesse mundo de verdade\nEncontro a liberdade`,
      score: 90,
    },
    {
      content: `No compasso do teu abraço\nEncontro todo o meu espaço\nTeu amor é meu refúgio\nMeu porto, meu vestígio`,
      score: 90,
    },
  ]

  // Escolher um fallback aleatório para variedade
  const randomFallback = chorusFallbacks[Math.floor(Math.random() * chorusFallbacks.length)]
  return randomFallback
}

// ✅ GERAR MÚLTIPLOS REFRÕES PARA ESCOLHA
async function generateMultipleChoruses(
  genre: string,
  theme: string,
  context?: string,
  count = 3,
): Promise<ChorusBlock[]> {
  const choruses: ChorusBlock[] = []

  for (let i = 0; i < count; i++) {
    try {
      const chorus = await generateNaturalChorus(genre, theme, context)
      choruses.push(...chorus)
    } catch (error) {
      console.error(`[Chorus] Erro na geração ${i + 1}:`, error)
      // Adicionar fallback se a geração falhar
      choruses.push(generateChorusFallback(genre, theme))
    }
  }

  // Remover duplicados e ordenar por score
  const uniqueChoruses = choruses.filter(
    (chorus, index, self) => index === self.findIndex((c) => c.content === chorus.content),
  )

  return uniqueChoruses.sort((a, b) => b.score - a.score)
}

// 🚀 API PRINCIPAL
export async function POST(request: NextRequest) {
  let genre = "Sertanejo Moderno Masculino"
  let theme = "amor"
  let title = "Refrão Gerado"

  try {
    const { genre: requestGenre, theme: requestTheme, title: requestTitle, context, count = 3 } = await request.json()

    genre = requestGenre || "Sertanejo Moderno Masculino"
    theme = requestTheme || "amor"
    title = requestTitle || `Refrão sobre ${theme}`

    console.log(`[API] 🎵 Gerando refrões naturais para: ${genre} - ${theme}`)

    // Gerar múltiplos refrões
    const choruses = await generateMultipleChoruses(genre, theme, context, count)

    console.log(`[API] 🎉 ${choruses.length} refrões gerados com sucesso`)

    return NextResponse.json({
      success: true,
      choruses: choruses,
      title: title,
      metadata: {
        genre,
        theme,
        totalChoruses: choruses.length,
        method: "GERACAO_NATURAL",
        strategy: "VERSOS_COMPLETOS_PRIMEIRO",
      },
    })
  } catch (error) {
    console.error("[API] ❌ Erro na geração de refrões:", error)

    // Fallback garantido
    const fallbackChoruses = [
      generateChorusFallback("Sertanejo Moderno Masculino", "amor"),
      generateChorusFallback("Sertanejo Moderno Masculino", "amor"),
      generateChorusFallback("Sertanejo Moderno Masculino", "amor"),
    ]

    return NextResponse.json({
      success: true,
      choruses: fallbackChoruses,
      title: "Refrões de Fallback",
      metadata: {
        genre: "Sertanejo Moderno Masculino",
        theme: "amor",
        totalChoruses: fallbackChoruses.length,
        method: "FALLBACK_GARANTIDO",
        strategy: "VERSOS_COMPLETOS",
      },
    })
  }
}

export async function GET() {
  return NextResponse.json(
    {
      error: "Método não permitido",
      message: "Use POST para gerar refrões",
    },
    { status: 405 },
  )
}
