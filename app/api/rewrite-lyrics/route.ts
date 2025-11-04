// app/api/rewrite-lyrics/route.ts - MELHORIA SEGURA MANTENDO SUA ESTRUTURA
import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { formatToPerformanceStructure, addInstrumentalSolo } from "@/lib/formatters/performance-structure-formatter"
import { reviewAndFixAllLines } from "@/lib/validation/auto-syllable-fixer"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter-brasileiro"

// Prompt mais inteligente para versos completos
function createImprovedPrompt(
  originalLyrics: string,
  genre: string,
  theme: string,
  mood?: string,
  additionalRequirements?: string,
  performanceMode?: string,
): string {
  const structureInstructions =
    performanceMode === "performance"
      ? `
ESTRUTURA OBRIGATÓRIA (Sertanejo Moderno):
- Use PART A para versos (PART A, PART A2, etc)
- Use PART B para refrões (sempre PART B)
- Use PART C para ponte (se houver)
- Formato: [PART X - Label - Descrição instrumental]

EXEMPLO DE FORMATO:
[PART A - Verse 1 - Male vocal starts, light percussion]
Linha 1 do verso
Linha 2 do verso
Linha 3 do verso
Linha 4 do verso

[PART B - Chorus - Full band enters, energetic beat]
Linha 1 do refrão
Linha 2 do refrão
Linha 3 do refrão
Linha 4 do refrão
`
      : ""

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
${structureInstructions}

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

    const {
      originalLyrics,
      genre,
      theme,
      title,
      mood,
      additionalRequirements,
      performanceMode = "standard",
      syllableTarget,
    } = body

    console.log("[v1] Letra original (primeiros 100 chars):", originalLyrics?.substring(0, 100))
    console.log("[v1] Gênero:", genre)
    console.log("[v1] Tema:", theme)
    console.log("[v1] Título:", title)
    console.log("[v1] Modo performático:", performanceMode)
    console.log("[v1] Limite de sílabas:", syllableTarget?.max || 12)

    if (!originalLyrics?.trim()) {
      console.log("[v1] ❌ ERRO: Letra original vazia")
      return NextResponse.json({ error: "Letra original é obrigatória" }, { status: 400 })
    }

    const prompt = createImprovedPrompt(originalLyrics, genre, theme, mood, additionalRequirements, performanceMode)

    console.log("[v1] Prompt melhorado criado")
    console.log("[v1] Chamando generateText com Vercel AI Gateway...")

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.7,
    })

    console.log("[v1] Resposta recebida (primeiros 200 chars):", text?.substring(0, 200))
    console.log("[v1] Tamanho da resposta:", text?.length)

    if (!text || text.trim().length === 0) {
      console.log("[v1] ❌ ERRO: Resposta vazia da IA")
      throw new Error("IA retornou resposta vazia")
    }

    let cleanedLyrics = text
      .replace(/^"|"$/g, "")
      .replace(/"\s*$/gm, "")
      .replace(/^\s*"/gm, "")
      .replace(/^(?:Explicação|Análise|Letra reescrita):/gi, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim()

    if (!cleanedLyrics || cleanedLyrics.trim().length === 0) {
      console.log("[v1] ❌ ERRO: Letra limpa está vazia após processamento")
      throw new Error("Letra processada está vazia")
    }

    const maxSyllables = syllableTarget?.max || 12
    console.log(`[v1] 🔧 Aplicando correção automática de sílabas (máximo: ${maxSyllables})...`)

    const fixResult = reviewAndFixAllLines(cleanedLyrics, maxSyllables)
    cleanedLyrics = fixResult.correctedLyrics

    if (!cleanedLyrics || cleanedLyrics.trim().length === 0) {
      console.log("[v1] ❌ ERRO: Letra está vazia após correção de sílabas")
      throw new Error("Letra vazia após correção de sílabas")
    }

    console.log(`[v1] ✅ Correção de sílabas concluída:`)
    console.log(`[v1]    - Linhas corrigidas: ${fixResult.corrections.length}`)
    console.log(`[v1]    - Métodos usados: ${fixResult.corrections.map((c) => c.method).join(", ")}`)

    if (fixResult.corrections.length > 0) {
      console.log(`[v1] 📊 Exemplos de correções:`)
      fixResult.corrections.slice(0, 3).forEach((correction) => {
        console.log(`[v1]    - "${correction.original}" (${correction.syllablesBefore} sílabas)`)
        console.log(`[v1]      → "${correction.corrected}" (${correction.syllablesAfter} sílabas)`)
      })
    }

    if (performanceMode === "performance") {
      console.log("[v1] 🎭 Aplicando formatação performática PART A/B/C...")
      console.log("[v1] Letra antes da formatação (primeiros 100 chars):", cleanedLyrics.substring(0, 100))
      console.log("[v1] Tipo de cleanedLyrics:", typeof cleanedLyrics)
      console.log("[v1] cleanedLyrics é undefined?", cleanedLyrics === undefined)
      console.log("[v1] cleanedLyrics é null?", cleanedLyrics === null)

      cleanedLyrics = formatToPerformanceStructure(cleanedLyrics, genre, "performance")

      if (!cleanedLyrics || cleanedLyrics.trim().length === 0) {
        console.log("[v1] ❌ ERRO: Letra está vazia após formatação performática")
        throw new Error("Letra vazia após formatação performática")
      }

      // Adiciona solo instrumental se houver ponte
      if (cleanedLyrics.includes("PART C")) {
        cleanedLyrics = addInstrumentalSolo(cleanedLyrics, genre)
      }

      console.log("[v1] ✅ Formatação performática aplicada")
    }

    console.log("[v1] Letra limpa (primeiros 200 chars):", cleanedLyrics.substring(0, 200))

    const lines = cleanedLyrics.split("\n").filter((line) => line.trim().length > 0)
    console.log(`[v1] 📊 Estatísticas: ${lines.length} linhas, ${cleanedLyrics.length} caracteres`)

    const violatingLines = lines.filter((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("[") || /^$$[^)]*$$$/.test(trimmed)) return false
      return countPoeticSyllables(line) > maxSyllables
    })

    if (violatingLines.length > 0) {
      console.log(`[v1] ⚠️ AVISO: ${violatingLines.length} linha(s) ainda excedem ${maxSyllables} sílabas após correção`)
      violatingLines.slice(0, 3).forEach((line) => {
        console.log(`[v1]    - "${line.substring(0, 50)}..." (${countPoeticSyllables(line)} sílabas)`)
      })
    } else {
      console.log(`[v1] ✅ Todas as linhas respeitam o limite de ${maxSyllables} sílabas`)
    }

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
        performanceMode,
        syllableCorrections: fixResult.corrections.length,
        version: "v1-improved-with-syllable-fix",
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
