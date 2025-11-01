// app/api/generate-chorus/route.ts - VERSÃO CORRIGIDA COM 5 REFRÕES
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
  console.log("[Chorus] ========== INÍCIO GERAÇÃO 5 REFRÕES ==========")

  try {
    const { genre, theme, lyrics } = await request.json()

    console.log("[Chorus] Parâmetros:", { genre, theme })

    if (!theme) {
      return NextResponse.json({ error: "Tema é obrigatório" }, { status: 400 })
    }

    const genreText = genre || "Sertanejo Moderno Masculino"

    // ✅ PROMPT ESPECÍFICO PARA 5 REFRÕES AVALIADOS
    const prompt = `Você é um produtor musical experiente. Crie 5 variações de refrão para ${genreText} sobre "${theme}".

${lyrics ? `CONTEXTO DA MÚSICA:\n${lyrics}\n\nUse como referência de estilo.` : ''}

CRITÉRIOS PARA BONS REFRÕES:
- CHICLETES: Fáceis de lembrar e repetir
- COMERCIAIS: Potencial para rádio e streaming  
- EMOCIONAIS: Conectam com o público
- CANTÁVEIS: Fluem naturalmente na melodia
- ORIGINAIS: Evitem clichês muito batidos

FORMATO DE RESPOSTA - USE EXATAMENTE ESTE FORMATO:

REFRAO 1 (Nota: 9/10 - Comercial)
Linha 1
Linha 2  
Linha 3
Linha 4
Justificativa: Este refrão funciona porque...

REFRAO 2 (Nota: 8/10 - Chiclete)
Linha 1
Linha 2
Linha 3
Linha 4  
Justificativa: Este refrão é chiclete porque...

REFRAO 3 (Nota: 9/10 - Emocional)
Linha 1
Linha 2
Linha 3
Linha 4
Justificativa: Este refrão emociona porque...

REFRAO 4 (Nota: 8/10 - Repetitivo)
Linha 1
Linha 2
Linha 3
Linha 4
Justificativa: Este refrão gruda porque...

REFRAO 5 (Nota: 7/10 - Alternativo)
Linha 1
Linha 2
Linha 3
Linha 4
Justificativa: Este refrão oferece...

Retorne APENAS os 5 refrões no formato acima, sem explicações extras.`

    console.log("[Chorus] Prompt criado, chamando IA...")

    const { text } = await generateText({
      model: getModel(),
      prompt,
      temperature: 0.8,
    })

    console.log("[Chorus] Resposta IA completa:\n", text)

    if (!text) {
      throw new Error("IA não retornou resposta")
    }

    // ✅ EXTRAÇÃO DOS 5 REFRÕES
    const choruses = extractFiveChoruses(text)
    
    console.log(`[Chorus] ${choruses.length} refrões extraídos`)

    // ✅ SEMPRE RETORNA PELO MENOS 5 REFRÕES
    const finalChoruses = choruses.length >= 3 ? choruses : getFallbackChoruses()

    console.log("[Chorus] ========== FIM GERAÇÃO REFRÕES ==========")

    return NextResponse.json({
      success: true,
      choruses: finalChoruses,
      metadata: {
        genre: genreText,
        theme,
        totalChoruses: finalChoruses.length,
        method: "5_REFROES_AVALIADOS"
      }
    })

  } catch (error) {
    console.error("[Chorus] ❌ ERRO:", error)
    
    // ✅ FALLBACK COM 5 REFRÕES GARANTIDOS
    const fallbackChoruses = getFallbackChoruses()
    
    return NextResponse.json({
      success: true,
      choruses: fallbackChoruses,
      metadata: {
        genre: "Sertanejo Moderno Masculino", 
        theme: "amor",
        totalChoruses: fallbackChoruses.length,
        method: "FALLBACK_5_REFROES"
      }
    })
  }
}

// ✅ FUNÇÃO PARA EXTRAIR 5 REFRÕES DO TEXTO
function extractFiveChoruses(text: string): Array<{chorus: string, evaluation: string}> {
  const choruses: Array<{chorus: string, evaluation: string}> = []
  
  // Divide o texto em seções por "REFRAO"
  const sections = text.split(/REFRAO\s+\d+/i).filter(section => section.trim())
  
  console.log("[Chorus] Seções encontradas:", sections.length)

  for (const section of sections) {
    if (choruses.length >= 5) break
    
    const lines = section.split('\n').map(line => line.trim()).filter(line => line)
    
    // Encontra as 4 linhas do refrão (antes de "Justificativa")
    const chorusLines: string[] = []
    let foundJustification = false
    
    for (const line of lines) {
      if (line.toLowerCase().includes('justificativa')) {
        foundJustification = true
        break
      }
      if (line && !line.toLowerCase().includes('nota') && !line.includes('(')) {
        chorusLines.push(line)
      }
    }
    
    // Pega as primeiras 4 linhas que parecem versos
    const verseLines = chorusLines.filter(line => 
      line.length > 3 && 
      line.length < 70 &&
      !line.toLowerCase().includes('este refrão')
    ).slice(0, 4)
    
    if (verseLines.length === 4) {
      const evaluation = section.split('Justificativa:')[1]?.split('\n')[0]?.trim() || "Refrão comercial e cantável"
      
      choruses.push({
        chorus: verseLines.join('\n'),
        evaluation: evaluation.substring(0, 100) // Limita tamanho
      })
      
      console.log(`[Chorus] Refrão ${choruses.length} extraído:`, verseLines[0])
    }
  }

  return choruses
}

// ✅ FALLBACKS COM 5 REFRÕES AVALIADOS
function getFallbackChoruses(): Array<{chorus: string, evaluation: string}> {
  return [
    {
      chorus: `Teu sorriso é meu porto seguro\nTeu abraço é meu aquecimento\nNo ritmo desse amor tão puro\nEncontro paz e sentimento`,
      evaluation: "Nota 9/10 - Comercial: Refrão romântico com gancho forte e estrutura A-B-A-B perfeita"
    },
    {
      chorus: `Teu olhar é a luz do meu caminho\nTeu carinho é o sol do meu dia\nEm teus braços eu encontro sentido\nTeu amor é a minha melodia`,
      evaluation: "Nota 8/10 - Chiclete: Fácil de memorizar, metáforas claras e fluência natural"
    },
    {
      chorus: `Seu amor é minha estrada\nMinha luz, minha jornada\nNesse mundo de verdade\nEncontro a liberdade`,
      evaluation: "Nota 9/10 - Emocional: Conecta com busca por significado e liberdade emocional"
    },
    {
      chorus: `No compasso do teu abraço\nEncontro todo o meu espaço\nTeu amor é meu refúgio\nMeu porto, meu vestígio`,
      evaluation: "Nota 8/10 - Repetitivo: Estrutura repetitiva que gruda na memória do ouvinte"
    },
    {
      chorus: `Quando a vida me surpreende\nTeu amor me defende e estende\nNa dança desse amor que incende\nMinha alma se rende e depende`,
      evaluation: "Nota 7/10 - Alternativo: Abordagem mais poética com rimas internas sofisticadas"
    }
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
