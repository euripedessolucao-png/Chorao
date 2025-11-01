// app/api/generate-chorus/route.ts - VERSÃO ESTÁVEL
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

    // ✅ PROMPT SIMPLES E DIRETO
    const prompt = `Crie 3 variações de refrão para ${genreText} sobre "${theme}".

${lyrics ? `CONTEXTO DA LETRA:\n${lyrics}\n\nUse esta letra como inspiração para o estilo.` : ''}

REGRAS:
- 4 linhas por refrão
- Versos completos e cantáveis
- Linguagem natural brasileira
- Estrutura A-B-A-B (rima linha 1 com 3, linha 2 com 4)

FORMATO:
Refrão 1:
Linha 1
Linha 2  
Linha 3
Linha 4

Refrão 2:
Linha 1
Linha 2
Linha 3
Linha 4

Refrão 3:
Linha 1
Linha 2
Linha 3
Linha 4

Retorne APENAS os refrões no formato acima.`

    console.log("[Chorus] Prompt criado, chamando IA...")

    const { text } = await generateText({
      model: getModel(), // ✅ MESMA FUNÇÃO QUE FUNCIONA
      prompt,
      temperature: 0.7,
    })

    console.log("[Chorus] Resposta IA:", text?.substring(0, 200))

    if (!text) {
      throw new Error("IA não retornou resposta")
    }

    // ✅ PROCESSAMENTO SIMPLES
    const choruses = extractChorusesFromText(text)
    
    console.log(`[Chorus] ${choruses.length} refrões extraídos`)

    // ✅ FALLBACK GARANTIDO
    const finalChoruses = choruses.length > 0 ? choruses : getFallbackChoruses(theme)

    console.log("[Chorus] ========== FIM GERAÇÃO REFRÕES ==========")

    return NextResponse.json({
      success: true,
      choruses: finalChoruses,
      metadata: {
        genre: genreText,
        theme,
        totalChoruses: finalChoruses.length,
        method: "GERACAO_SIMPLIFICADA"
      }
    })

  } catch (error) {
    console.error("[Chorus] ❌ ERRO:", error)
    
    // ✅ FALLBACK 100% GARANTIDO
    const fallbackChoruses = getFallbackChoruses("amor")
    
    return NextResponse.json({
      success: true,
      choruses: fallbackChoruses,
      metadata: {
        genre: "Sertanejo Moderno Masculino", 
        theme: "amor",
        totalChoruses: fallbackChoruses.length,
        method: "FALLBACK_GARANTIDO"
      }
    })
  }
}

// ✅ FUNÇÃO SIMPLES PARA EXTRAIR REFRÕES
function extractChorusesFromText(text: string): string[] {
  const choruses: string[] = []
  const lines = text.split('\n')
  let currentChorus: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    
    if (trimmed && !trimmed.startsWith('Refrão') && !trimmed.startsWith('---')) {
      currentChorus.push(trimmed)
      
      if (currentChorus.length === 4) {
        choruses.push(currentChorus.join('\n'))
        currentChorus = []
      }
    }
  }

  // Se sobrou um refrão incompleto, adiciona mesmo assim
  if (currentChorus.length > 0) {
    choruses.push(currentChorus.join('\n'))
  }

  return choruses.slice(0, 3) // Máximo 3 refrões
}

// ✅ FALLBACKS GARANTIDOS
function getFallbackChoruses(theme: string): string[] {
  return [
    `Teu sorriso é meu porto seguro\nTeu abraço é meu aquecimento\nNo ritmo desse amor tão puro\nEncontro paz e sentimento`,
    
    `Teu olhar é a luz do meu caminho\nTeu carinho é o sol do meu dia\nEm teus braços eu encontro sentido\nTeu amor é a minha melodia`,
    
    `Seu amor é minha estrada\nMinha luz, minha jornada\nNesse mundo de verdade\nEncontro a liberdade`
  ]
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
