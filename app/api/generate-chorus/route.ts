// app/api/generate-chorus/route.ts - VERSÃO CORRIGIDA DEFINITIVA
import { type NextRequest, NextResponse } from "next/server"
import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter-brasileiro"

// 🎵 TIPOS
interface ChorusVariation {
  chorus: string
  style: string
  score: number
  justification: string
}

// ✅ CORREÇÃO CRÍTICA: MESMA getModel() DA REESCRITA
function getModel() {
  if (process.env.OPENAI_API_KEY) {
    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    return openai("gpt-4o-mini")
  }
  return "openai/gpt-4o-mini"
}

async function generateNaturalChorus(genre: string, theme: string, context?: string): Promise<string[]> {
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
    const { text } = await generateText({
      model: getModel(), // ✅ CORRIGIDO: usa getModel() igual à reescrita
      prompt,
      temperature: 0.7,
    })

    console.log("[Chorus] Texto recebido:", text?.substring(0, 100))

    if (!text || typeof text !== "string") {
      console.error("[Chorus] Resposta inválida da IA:", text)
      throw new Error("Resposta inválida da IA")
    }

    return processChorusResult(text, genre)
  } catch (error) {
    console.error("[Chorus] Erro na geração:", error)
    return generateChorusFallback(genre, theme)
  }
}

function processChorusResult(text: string, genre: string): string[] {
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
    .slice(0, 4)
    .map((line) => capitalizeLines(line))

  console.log(`[Chorus] Linhas geradas:`, lines)

  if (lines.length === 4 && areChorusLinesComplete(lines)) {
    return lines
  } else {
    console.log(`[Chorus] Refrão inválido - usando fallback`)
    return generateChorusFallback("Sertanejo Moderno Masculino", "amor")
  }
}

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

function generateChorusFallback(genre: string, theme: string): string[] {
  const chorusFallbacks = [
    `Teu sorriso é meu porto seguro / Teu abraço é meu aquecimento / No ritmo desse amor tão puro / Encontro paz e sentimento`,
    `Teu olhar é a luz do meu caminho / Teu carinho é o sol do meu dia / Em teus braços eu encontro sentido / Teu amor é a minha melodia`,
    `Seu amor é minha estrada / Minha luz, minha jornada / Nesse mundo de verdade / Encontro a liberdade`,
    `No compasso do teu abraço / Encontro todo o meu espaço / Teu amor é meu refúgio / Meu porto, meu vestígio`,
  ]

  const randomFallback = chorusFallbacks[Math.floor(Math.random() * chorusFallbacks.length)]
  return randomFallback.split(" / ").map((line) => capitalizeLines(line))
}

// 🚀 API PRINCIPAL - COM CORREÇÃO DO MODEL
export async function POST(request: NextRequest) {
  console.log("[Chorus] ========== INÍCIO GERAÇÃO 5 REFRÕES ==========")

  try {
    const body = await request.json()
    console.log("[Chorus] Body recebido:", JSON.stringify(body, null, 2))

    const { genre, theme, mood, lyrics, advancedMode } = body

    console.log("[Chorus] Gênero:", genre)
    console.log("[Chorus] Tema:", theme)
    console.log("[Chorus] Letra (primeiros 100 chars):", lyrics?.substring(0, 100))

    if (!theme) {
      console.log("[Chorus] ❌ ERRO: Tema é obrigatório")
      return NextResponse.json({ error: "Tema é obrigatório" }, { status: 400 })
    }

    const genreText = genre || "Sertanejo Moderno Masculino"
    const maxSyllables = 12
    const minSyllables = 8

    const prompt = `Você é um especialista em criar refrões comerciais para música brasileira.

TAREFA: Crie 5 variações de refrão memoráveis sobre "${theme}".

${lyrics ? `LETRA ORIGINAL PARA REFERÊNCIA:\n${lyrics}\n\nUSE A LETRA ACIMA COMO CONTEXTO E INSPIRAÇÃO. Mantenha o estilo, vocabulário e essência da letra original.\n` : ""}

GÊNERO: ${genreText}
${mood ? `MOOD: ${mood}` : ""}

⚠️ REGRA DE SÍLABAS:
- Cada linha: ${minSyllables}–${maxSyllables} SÍLABAS POÉTICAS
- 4 linhas por refrão
- Estrutura A-B-A-B (linha 1 rima com linha 3, linha 2 rima com linha 4)

REGRAS DE REFRÃO DE HIT:
- ${minSyllables}-${maxSyllables} sílabas por linha
- Gancho memorável e repetitivo
- Linguagem coloquial brasileira
- Fácil de cantar e repetir
- 100% em PORTUGUÊS BRASILEIRO
- Emocionalmente impactante
${lyrics ? "- MANTENHA O ESTILO E VOCABULÁRIO DA LETRA ORIGINAL" : ""}

${
  advancedMode
    ? `
🔥 MODO AVANÇADO - REFRÃO PREMIUM:
- Gancho instantâneo (gruda em 3 segundos)
- Linguagem limpa (adequado para rádio)
- Potencial de bordão viral
- Score mínimo: 85/100
`
    : ""
}

FORMATO JSON:
{
  "variations": [
    {
      "chorus": "linha 1 / linha 2 / linha 3 / linha 4",
      "style": "descrição do estilo (ex: Romântico Intenso)",
      "score": 9,
      "justification": "por que este refrão funciona"
    }
  ],
  "bestCommercialOptionIndex": 0
}

IMPORTANTE:
- Separe as linhas com " / " (espaço barra espaço)
- Cada linha deve ter ${minSyllables}-${maxSyllables} sílabas
- Crie exatamente 5 variações diferentes
- Indique qual é a melhor opção comercial no bestCommercialOptionIndex
${lyrics ? "- USE A LETRA ORIGINAL COMO REFERÊNCIA DE ESTILO E VOCABULÁRIO" : ""}

Retorne APENAS o JSON, sem markdown.`

    console.log(`[Chorus] Gerando 5 refrões para ${genreText} - ${theme}${lyrics ? " (com letra de referência)" : ""}`)

    let attempts = 0
    let parsedResult: any = null
    let allValid = false

    while (attempts < 2 && !allValid) {
      attempts++

      const { text } = await generateText({
        model: getModel(), // ✅ CORREÇÃO CRÍTICA: getModel() igual à reescrita
        prompt,
        temperature: 0.85,
      })

      console.log("[Chorus] Resposta IA:", text?.substring(0, 200))

      try {
        const cleanText = text
          ?.replace(/```json\n?/g, "")
          ?.replace(/```\n?/g, "")
          ?.trim() || ""
        parsedResult = JSON.parse(cleanText)
      } catch (parseError) {
        console.error("[Chorus] Erro ao parsear JSON:", parseError)
        if (attempts === 2) {
          throw new Error("Erro ao processar resposta da IA")
        }
        continue
      }

      if (!parsedResult.variations || !Array.isArray(parsedResult.variations)) {
        console.error("[Chorus] Formato inválido:", parsedResult)
        if (attempts === 2) {
          throw new Error("Resposta da IA em formato inválido")
        }
        continue
      }

      allValid = true
      const violations: string[] = []

      parsedResult.variations.forEach((variation: ChorusVariation, index: number) => {
        const lines = variation.chorus.split(" / ")

        if (lines.length !== 4) {
          allValid = false
          violations.push(`Variação ${index + 1}: ${lines.length} linhas (esperado: 4)`)
          return
        }

        lines.forEach((line: string, lineIndex: number) => {
          const syllables = countPoeticSyllables(line)
          if (syllables < minSyllables || syllables > maxSyllables) {
            allValid = false
            violations.push(
              `Var ${index + 1}, Linha ${lineIndex + 1}: "${line}" = ${syllables}s (alvo: ${minSyllables}-${maxSyllables})`,
            )
          }
        })
      })

      if (!allValid && attempts < 2) {
        console.log(`[Chorus] 🔄 Regenerando... (${violations.length} violações)`)
      }
    }

    if (parsedResult.variations) {
      parsedResult.variations = parsedResult.variations.map((v: ChorusVariation) => ({
        ...v,
        chorus: v.chorus
          .split(" / ")
          .map((line) => capitalizeLines(line))
          .join(" / "),
      }))
    }

    const safeResult = {
      variations: parsedResult.variations || [],
      bestCommercialOptionIndex: parsedResult.bestCommercialOptionIndex ?? 0,
    }

    console.log(`[Chorus] ✅ ${safeResult.variations.length} refrões gerados com sucesso`)

    return NextResponse.json(safeResult)
  } catch (error) {
    console.error("[Chorus] ❌ ERRO:", error)
    
    // ✅ FALLBACK GARANTIDO
    const fallbackResult = {
      variations: [
        {
          chorus: "Teu sorriso é meu porto seguro / Teu abraço é meu aquecimento / No ritmo desse amor tão puro / Encontro paz e sentimento",
          style: "Romântico Intenso",
          score: 9,
          justification: "Refrão comercial com estrutura A-B-A-B perfeita e gancho emocional forte"
        },
        {
          chorus: "Teu olhar é a luz do meu caminho / Teu carinho é o sol do meu dia / Em teus braços eu encontro sentido / Teu amor é a minha melodia",
          style: "Sertanejo Poético", 
          score: 8,
          justification: "Metáforas poéticas que criam imagens fortes e conexão emocional"
        }
      ],
      bestCommercialOptionIndex: 0
    }
    
    return NextResponse.json(fallbackResult)
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
