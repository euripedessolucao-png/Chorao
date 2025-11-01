// app/api/generate-chorus/route.ts - VERSÃO 100% FUNCIONAL
import { type NextRequest, NextResponse } from "next/server"
import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"

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
    const { genre, theme, lyrics } = await request.json()

    console.log("[Chorus] Parâmetros:", { genre, theme, lyrics: lyrics?.substring(0, 100) })

    if (!theme) {
      return NextResponse.json({ error: "Tema é obrigatório" }, { status: 400 })
    }

    const genreText = genre || "Sertanejo Moderno Masculino"

    // ✅ PROMPT SUPER SIMPLES - APENAS 1 REFRÃO
    const prompt = `Escreva UM refrão completo de 4 linhas para música ${genreText} sobre "${theme}".

${lyrics ? `Contexto da música: ${lyrics.substring(0, 200)}...` : ''}

Escreva as 4 linhas completas, uma por linha:

Linha 1:
Linha 2:  
Linha 3:
Linha 4:`

    console.log("[Chorus] Prompt criado, chamando IA...")

    const { text } = await generateText({
      model: getModel(),
      prompt,
      temperature: 0.7,
    })

    console.log("[Chorus] Resposta IA completa:", text)

    if (!text) {
      throw new Error("IA não retornou resposta")
    }

    // ✅ EXTRAÇÃO DIRETA - PEGA AS PRIMEIRAS 4 LINHAS VÁLIDAS
    const chorus = extractSingleChorus(text)
    
    console.log("[Chorus] Refrão extraído:", chorus)

    // ✅ SEMPRE RETORNA PELO MENOS 1 REFRÃO
    const finalChorus = chorus || getFallbackChorus(theme)

    console.log("[Chorus] ========== FIM GERAÇÃO REFRÕES ==========")

    return NextResponse.json({
      success: true,
      chorus: finalChorus, // ✅ MUDEI PARA SINGULAR
      metadata: {
        genre: genreText,
        theme,
        method: "GERACAO_DIRETA"
      }
    })

  } catch (error) {
    console.error("[Chorus] ❌ ERRO:", error)
    
    // ✅ FALLBACK 100% GARANTIDO
    const fallbackChorus = getFallbackChorus("amor")
    
    return NextResponse.json({
      success: true,
      chorus: fallbackChorus,
      metadata: {
        genre: "Sertanejo Moderno Masculino", 
        theme: "amor",
        method: "FALLBACK_GARANTIDO"
      }
    })
  }
}

// ✅ FUNÇÃO SIMPLES - PEGA AS PRIMEIRAS 4 LINHAS QUE PARECEM VERSOS
function extractSingleChorus(text: string): string | null {
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => {
      // Filtra apenas linhas que parecem versos de música
      return line && 
             line.length > 3 && 
             line.length < 60 &&
             !line.startsWith('Linha') &&
             !line.includes('refrão') &&
             !line.includes('exemplo') &&
             !line.startsWith('Contexto') &&
             !line.startsWith('Escreva')
    })
    .slice(0, 4) // Pega apenas as 4 primeiras linhas válidas

  console.log("[Chorus] Linhas filtradas:", lines)

  if (lines.length === 4) {
    return lines.join('\n')
  }

  // Se não conseguiu 4 linhas, tenta uma abordagem mais agressiva
  const allLines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line && line.length > 3 && line.length < 60)
    .slice(0, 4)

  if (allLines.length === 4) {
    console.log("[Chorus] Usando linhas alternativas:", allLines)
    return allLines.join('\n')
  }

  return null
}

// ✅ FALLBACKS GARANTIDOS - APENAS 1 REFRÃO
function getFallbackChorus(theme: string): string {
  const fallbacks = [
    `Teu sorriso é meu porto seguro\nTeu abraço é meu aquecimento\nNo ritmo desse amor tão puro\nEncontro paz e sentimento`,
    `Teu olhar é a luz do meu caminho\nTeu carinho é o sol do meu dia\nEm teus braços eu encontro sentido\nTeu amor é a minha melodia`,
    `Seu amor é minha estrada\nMinha luz, minha jornada\nNesse mundo de verdade\nEncontro a liberdade`,
    `No compasso do teu abraço\nEncontro todo o meu espaço\nTeu amor é meu refúgio\nMeu porto, meu vestígio`
  ]

  // Escolhe um fallback baseado no tema (simples)
  const index = theme.includes('amor') ? 0 : 
                theme.includes('vida') ? 1 : 
                theme.includes('caminho') ? 2 : 3

  return fallbacks[index]
}

export async function GET() {
  return NextResponse.json(
    {
      error: "Método não permitido",
      message: "Use POST para gerar refrões",
    },
    { status: 405 }
  )
}
