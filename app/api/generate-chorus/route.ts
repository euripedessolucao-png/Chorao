// app/api/generate-chorus/route.ts - USANDO A MESMA API DA REESCRITA
import { type NextRequest, NextResponse } from "next/server"
import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"

// ✅ MESMA FUNÇÃO getModel() DA REESCRITA
function getModel() {
  if (process.env.OPENAI_API_KEY) {
    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    return openai("gpt-4o-mini")
  }
  return "openai/gpt-4o-mini"
}

export async function POST(request: NextRequest) {
  console.log("[Chorus] ========== INÍCIO GERAÇÃO REFRÕES ==========")

  try {
    const body = await request.json()
    console.log("[Chorus] Body recebido:", JSON.stringify(body, null, 2))

    const { genre, theme, lyrics } = body

    console.log("[Chorus] Gênero:", genre)
    console.log("[Chorus] Tema:", theme)
    console.log("[Chorus] Letra (primeiros 100 chars):", lyrics?.substring(0, 100))

    if (!theme) {
      console.log("[Chorus] ❌ ERRO: Tema é obrigatório")
      return NextResponse.json({ error: "Tema é obrigatório" }, { status: 400 })
    }

    const genreText = genre || "Sertanejo Moderno Masculino"

    // ✅ PROMPT SIMPLES E DIRETO - IGUAL AO DA REESCRITA
    const prompt = `Você é um compositor profissional de ${genreText}.

TAREFA: Crie 5 variações de refrão sobre "${theme}".

${lyrics ? `CONTEXTO DA LETRA:\n${lyrics}\n\nUse esta letra como inspiração.` : ''}

INSTRUÇÕES:
- Cada refrão deve ter 4 linhas completas
- Versos devem ser cantáveis e naturais  
- Linguagem emocional brasileira
- Diferentes abordagens (romântico, chiclete, profundo, etc.)

Retorne APENAS os refrões no formato:

1. NOME DO REFRÃO
Linha 1
Linha 2
Linha 3
Linha 4

2. NOME DO REFRÃO  
Linha 1
Linha 2
Linha 3
Linha 4

... até 5 refrões`

    console.log("[Chorus] Prompt criado (primeiros 200 chars):", prompt.substring(0, 200))
    console.log("[Chorus] Chamando generateText...")

    // ✅ MESMA CHAMADA generateText DA REESCRITA
    const { text } = await generateText({
      model: getModel(), // ✅ MESMA FUNÇÃO
      prompt,
      temperature: 0.7, // ✅ MESMA TEMPERATURA
    })

    console.log("[Chorus] Resposta recebida (primeiros 200 chars):", text?.substring(0, 200))
    console.log("[Chorus] Tamanho da resposta:", text?.length)

    if (!text || text.trim().length === 0) {
      console.log("[Chorus] ❌ ERRO: Resposta vazia da IA")
      throw new Error("IA retornou resposta vazia")
    }

    // ✅ PROCESSAMENTO SIMPLES - PEGA TODAS AS LINHAS QUE PARECEM VERSOS
    const choruses = extractChoruses(text)
    
    console.log(`[Chorus] ${choruses.length} refrões extraídos`)

    // ✅ GARANTE QUE TEM PELO MENOS 3 REFRÕES
    const finalChoruses = choruses.length >= 3 ? choruses : getFallbackChoruses()

    console.log("[Chorus] ========== FIM DA GERAÇÃO ==========")

    return NextResponse.json({
      success: true,
      choruses: finalChoruses,
      metadata: {
        genre: genreText,
        theme,
        totalChoruses: finalChoruses.length,
        method: "GERACAO_SIMPLES"
      },
    })

  } catch (error) {
    console.error("[Chorus] ❌ ERRO FATAL:", error)
    console.error("[Chorus] Stack trace:", error instanceof Error ? error.stack : "N/A")

    // ✅ FALLBACK GARANTIDO
    const fallbackChoruses = getFallbackChoruses()
    
    return NextResponse.json({
      success: true,
      choruses: fallbackChoruses,
      metadata: {
        genre: "Sertanejo Moderno Masculino",
        theme: "amor", 
        totalChoruses: fallbackChoruses.length,
        method: "FALLBACK_GARANTIDO"
      },
    })
  }
}

// ✅ FUNÇÃO SIMPLES DE EXTRAÇÃO - PEGA TODAS AS LINHAS VÁLIDAS E AGRUPA EM GRUPOS DE 4
function extractChoruses(text: string): string[] {
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => {
      return line && 
             line.length >= 5 && 
             line.length <= 70 &&
             !line.match(/^\d+\./) && // Remove números
             !line.includes('NOME DO') &&
             !line.includes('INSTRUÇÕES') &&
             !line.includes('TAREFA:') &&
             !line.includes('CONTEXTO:')
    })

  console.log("[Chorus] Linhas filtradas:", lines)

  // Agrupa em refrões de 4 linhas
  const choruses: string[] = []
  let currentChorus: string[] = []

  for (const line of lines) {
    currentChorus.push(line)
    
    if (currentChorus.length === 4) {
      choruses.push(currentChorus.join('\n'))
      currentChorus = []
      
      // Para após 5 refrões
      if (choruses.length >= 5) break
    }
  }

  // Se sobrou um refrão incompleto, adiciona se tiver pelo menos 3 linhas
  if (currentChorus.length >= 3 && choruses.length < 5) {
    choruses.push(currentChorus.join('\n'))
  }

  return choruses
}

// ✅ FALLBACKS GARANTIDOS
function getFallbackChoruses(): string[] {
  return [
    `Teu sorriso é meu porto seguro\nTeu abraço é meu aquecimento\nNo ritmo desse amor tão puro\nEncontro paz e sentimento`,
    `Teu olhar é a luz do meu caminho\nTeu carinho é o sol do meu dia\nEm teus braços eu encontro sentido\nTeu amor é a minha melodia`,
    `Seu amor é minha estrada\nMinha luz, minha jornada\nNesse mundo de verdade\nEncontro a liberdade`,
    `No compasso do teu abraço\nEncontro todo o meu espaço\nTeu amor é meu refúgio\nMeu porto, meu vestígio`,
    `Quando a vida me surpreende\nTeu amor me defende e estende\nNa dança desse amor que incende\nMinha alma se rende e depende`
  ]
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
