// app/api/rewrite-lyrics/route.ts - MELHORIA SEGURA MANTENDO SUA ESTRUTURA
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

// ✅ MELHORIA 1: Prompt mais inteligente para versos completos
function createImprovedPrompt(originalLyrics: string, genre: string, theme: string, mood?: string, additionalRequirements?: string): string {
  return `Você é um compositor profissional de ${genre || "música brasileira"}.

TAREFA: Reescreva a letra abaixo melhorando a qualidade poética e musical.

LETRA ORIGINAL:
${originalLyrics}

REGRAS IMPORTANTES:
1. Mantenha a MESMA ESTRUTURA (Intro, Versos, Refrão, Ponte, Outro)
2. Versos devem ser COMPLETOS (nunca cortados no meio)
3. Rimas naturais e fluidez poética
4. Linguagem rica mas acessível
5. Mantenha o tema: ${theme || "o tema original"}
${mood ? `6. Tom emocional: ${mood}` : ""}
${additionalRequirements ? `7. Requisitos extras: ${additionalRequirements}` : ""}

DICAS PARA VERSOS COMPLETOS:
- Evite versos que terminem com: "e", "o", "a", "de", "que", "me", "te"
- Cada verso deve ter sentido completo
- Prefira frases com sujeito + verbo + complemento

EXEMPLOS DE VERSOS COMPLETOS:
❌ "E eu me..." → ✅ "E eu me encontro em teus braços"
❌ "No teu olhar, um..." → ✅ "No teu olhar vejo esperança"
❌ "Que me faz..." → ✅ "Que me faz sentir renovado"

Retorne APENAS a letra reescrita, sem explicações.`
}

export async function POST(request: NextRequest) {
  console.log("[v1] ========== INÍCIO DA REESCRITA MELHORADA ==========")

  try {
    const body = await request.json()
    console.log("[v1] Body recebido:", JSON.stringify(body, null, 2))

    const { originalLyrics, genre, theme, title, mood, additionalRequirements } = body

    console.log("[v1] Letra original (primeiros 100 chars):", originalLyrics?.substring(0, 100))
    console.log("[v1] Gênero:", genre)
    console.log("[v1] Tema:", theme)
    console.log("[v1] Título:", title)

    if (!originalLyrics?.trim()) {
      console.log("[v1] ❌ ERRO: Letra original vazia")
      return NextResponse.json({ error: "Letra original é obrigatória" }, { status: 400 })
    }

    // ✅ USANDO PROMPT MELHORADO
    const prompt = createImprovedPrompt(originalLyrics, genre, theme, mood, additionalRequirements)

    console.log("[v1] Prompt melhorado criado")
    console.log("[v1] Chamando generateText...")

    const { text } = await generateText({
      model: getModel(),
      prompt,
      temperature: 0.7,
    })

    console.log("[v1] Resposta recebida (primeiros 200 chars):", text?.substring(0, 200))
    console.log("[v1] Tamanho da resposta:", text?.length)

    if (!text || text.trim().length === 0) {
      console.log("[v1] ❌ ERRO: Resposta vazia da IA")
      throw new Error("IA retornou resposta vazia")
    }

    // ✅ MELHORIA 2: Limpeza mais robusta
    const cleanedLyrics = text
      .replace(/^"|"$/g, "")
      .replace(/"\s*$/gm, "") 
      .replace(/^\s*"/gm, "")
      .replace(/^(?:Explicação|Análise|Letra reescrita):/gi, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim()

    console.log("[v1] Letra limpa (primeiros 200 chars):", cleanedLyrics.substring(0, 200))
    
    // ✅ MELHORIA 3: Log de qualidade básica
    const lines = cleanedLyrics.split('\n').filter(line => line.trim().length > 0)
    console.log(`[v1] 📊 Estatísticas: ${lines.length} linhas, ${cleanedLyrics.length} caracteres`)

    console.log("[v1] ========== FIM DA REESCRITA MELHORADA ==========")

    return NextResponse.json({
      success: true,
      lyrics: cleanedLyrics,
      letra: cleanedLyrics,
      title: title || `${theme || "Música"} - ${genre || "Reescrita"}`,
      titulo: title || `${theme || "Música"} - ${genre || "Reescrita"}`,
      metadata: {
        genre,
        theme,
        method: "REESCRITA_MELHORADA",
        polishingApplied: true,
        linesCount: lines.length,
        version: "v1-improved"
      },
    })
  } catch (error) {
    console.error("[v1] ❌ ERRO FATAL:", error)
    console.error("[v1] Stack trace:", error instanceof Error ? error.stack : "N/A")

    return NextResponse.json(
      {
        error: "Erro ao reescrever letra",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json(
    {
      error: "Método não permitido",
      message: "Use POST para processar letras",
    },
    { status: 405 },
  )
}
