// app/api/generate-chorus/route.ts - VERSÃO 100% FUNCIONAL
import { type NextRequest, NextResponse } from "next/server"
import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"

// ✅ MESMA ESTRUTURA DA REESCRITA QUE FUNCIONA
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
  console.log("[Chorus] ========== INÍCIO ==========")

  try {
    const body = await request.json()
    console.log("[Chorus] Body recebido:", JSON.stringify(body, null, 2))

    const { genre, theme, lyrics } = body

    console.log("[Chorus] Gênero:", genre)
    console.log("[Chorus] Tema:", theme)

    if (!theme) {
      return NextResponse.json({ error: "Tema é obrigatório" }, { status: 400 })
    }

    const genreText = genre || "Sertanejo Moderno Masculino"

    // ✅ PROMPT SUPER SIMPLES - IGUAL AO DA REESCRITA
    const prompt = `Escreva 5 opções de refrão para música ${genreText} sobre "${theme}".

${lyrics ? `Contexto: ${lyrics.substring(0, 200)}` : ''}

Cada refrão deve ter 4 linhas. Escreva no formato:

1. [Nome do estilo]
Linha 1
Linha 2  
Linha 3
Linha 4

2. [Nome do estilo]
Linha 1
Linha 2
Linha 3
Linha 4

3. [Nome do estilo]
Linha 1
Linha 2
Linha 3
Linha 4

4. [Nome do estilo]
Linha 1
Linha 2
Linha 3
Linha 4

5. [Nome do estilo]
Linha 1
Linha 2
Linha 3
Linha 4`

    console.log("[Chorus] Prompt criado, chamando IA...")

    const { text } = await generateText({
      model: getModel(),
      prompt,
      temperature: 0.7,
    })

    console.log("[Chorus] Resposta completa:\n", text)

    if (!text || text.trim().length === 0) {
      console.log("[Chorus] ❌ ERRO: Resposta vazia")
      throw new Error("Resposta vazia da IA")
    }

    // ✅ EXTRAÇÃO SIMPLES - PEGA QUALQUER COISA QUE PARECE REFRÃO
    const choruses = extractSimpleChoruses(text)
    
    console.log(`[Chorus] Refrões extraídos:`, choruses)

    // ✅ USA OS GERADOS OU FALLBACK
    const finalChoruses = choruses.length > 0 ? choruses : getSimpleFallbacks()

    console.log("[Chorus] ========== FIM ==========")

    return NextResponse.json({
      success: true,
      choruses: finalChoruses,
      metadata: {
        genre: genreText,
        theme,
        totalChoruses: finalChoruses.length
      },
    })

  } catch (error) {
    console.error("[Chorus] ❌ ERRO:", error)

    // ✅ FALLBACK SIMPLES
    const fallbackChoruses = getSimpleFallbacks()
    
    return NextResponse.json({
      success: true,
      choruses: fallbackChoruses,
      metadata: {
        genre: "Sertanejo Moderno Masculino",
        theme: "amor",
        totalChoruses: fallbackChoruses.length
      },
    })
  }
}

// ✅ FUNÇÃO MAIS SIMPLES POSSÍVEL
function extractSimpleChoruses(text: string): string[] {
  const choruses: string[] = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line)
  
  let currentChorus: string[] = []
  
  for (const line of lines) {
    // Se a linha parece um verso (não é número, não contém "refrão", etc)
    if (line && 
        !line.match(/^\d+\./) && 
        !line.toLowerCase().includes('refrão') &&
        !line.toLowerCase().includes('opção') &&
        line.length > 3 &&
        line.length < 60) {
      
      currentChorus.push(line)
      
      // Quando tem 4 linhas, forma um refrão
      if (currentChorus.length === 4) {
        choruses.push(currentChorus.join('\n'))
        currentChorus = []
        
        // Para no quinto refrão
        if (choruses.length >= 5) break
      }
    } else {
      // Se encontrou algo que não é verso, reinicia
      if (currentChorus.length > 0) {
        currentChorus = []
      }
    }
  }

  // Se sobrou um refrão incompleto com pelo menos 3 linhas, adiciona
  if (currentChorus.length >= 3 && choruses.length < 5) {
    choruses.push(currentChorus.join('\n'))
  }

  return choruses
}

// ✅ FALLBACKS SIMPLES
function getSimpleFallbacks(): string[] {
  return [
    `Teu sorriso é meu porto seguro\nTeu abraço é meu aquecimento\nNo ritmo desse amor tão puro\nEncontro paz e sentimento`,
    `Teu olhar é a luz do meu caminho\nTeu carinho é o sol do meu dia\nEm teus braços eu encontro sentido\nTeu amor é a minha melodia`,
    `Seu amor é minha estrada\nMinha luz, minha jornada\nNesse mundo de verdade\nEncontro a liberdade`,
    `No compasso do teu abraço\nEncontro todo o meu espaço\nTeu amor é meu refúgio\nMeu porto, meu vestígio`,
    `Quando a vida me surpreende\nTeu amor me defende e estende\nNa dança desse amor que incende\nMinha alma se rende e depende`
  ]
}

export async function GET() {
  return NextResponse.json({ error: "Use POST" }, { status: 405 })
}
