// app/api/rewrite-lyrics/route.ts

import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { buildGenreRulesPrompt } from "@/lib/validation/genre-rules-builder"
import { getGenreMetrics } from "@/lib/metrics/brazilian-metrics"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter-brasileiro"
import { getUniversalRhymeRules } from "@/lib/validation/universal-rhyme-rules"
import {
  formatSertanejoPerformance,
  shouldUsePerformanceFormat,
} from "@/lib/formatters/sertanejo-performance-formatter"
import { formatInstrumentationForAI } from "@/lib/normalized-genre"
import { AbsoluteSyllableEnforcer } from "@/lib/validation/absolute-syllable-enforcer"
import { LineStacker } from "@/lib/utils/line-stacker"

export async function POST(request: NextRequest) {
  try {
    const {
      originalLyrics, // nome correto
      genre, // nome correto
      mood,
      theme,
      additionalRequirements,
      title,
      syllableTarget,
      performanceMode = "standard",
    } = await request.json()

    // Validação robusta
    if (!originalLyrics?.trim()) {
      return NextResponse.json({ error: "Letra original é obrigatória" }, { status: 400 })
    }

    if (!genre || typeof genre !== "string" || !genre.trim()) {
      return NextResponse.json({ error: "Gênero é obrigatório" }, { status: 400 })
    }

    console.log(`[API] 🎵 Reescrevendo para gênero: ${genre}`)

    // Obtém métricas reais do gênero
    const genreMetrics = getGenreMetrics(genre)

    const maxSyllables = Math.min(genreMetrics.syllableRange.max, 12)
    const minSyllables = genreMetrics.syllableRange.min

    // Obtém regras de rima
    const rhymeRules = getUniversalRhymeRules(genre)

    // Constrói prompt com métrica realista
    const genreRules = buildGenreRulesPrompt(genre)
    const prompt = `Você é um compositor brasileiro especializado em ${genre}.

TAREFA: Reescrever e melhorar a letra abaixo mantendo a essência.

LETRA ORIGINAL:
${originalLyrics}

TEMA: ${theme || "Manter tema original"}
HUMOR: ${mood || "Manter humor original"}
${additionalRequirements ? `REQUISITOS: ${additionalRequirements}` : ""}

REGRAS DE MÉTRICA:
- Cada verso deve ter ENTRE ${minSyllables} E ${maxSyllables} SÍLABAS
- Use contrações naturais: "você" → "cê", "para" → "pra", "estou" → "tô"
- Evite versos com mais de ${maxSyllables} sílabas

REGRAS DE RIMA:
- ${rhymeRules.requirePerfectRhymes ? "Rimas devem ser perfeitas (consoantes)" : "Rimas naturais são aceitáveis"}
- ${rhymeRules.minRichRhymePercentage > 0 ? `Mínimo de ${rhymeRules.minRichRhymePercentage}% de rimas ricas` : "Rimas pobres aceitáveis"}

${genreRules.fullPrompt}

INSTRUÇÕES:
- Melhore a qualidade mantendo o tema e estrutura original
- Corrija problemas de métrica e rima naturalmente  
- Use linguagem brasileira autêntica
- Evite clichês ("coraçãozinho", "lágrimas no rosto")
- ${performanceMode === "performance" ? "Formate com tags em inglês: [Verse], [Chorus], [Bridge]" : "Use tags em português: [Verso], [Refrão], [Ponte]"}

Retorne APENAS a letra reescrita, sem explicações.`

    console.log(`[API] 🎵 Gerando com métrica ${minSyllables}-${maxSyllables} sílabas...`)

    const { text } = await generateText({
      model: "openai/gpt-4o-mini", // mais rápido e barato
      prompt,
      temperature: 0.85, // Aumentado para melhor variação mantendo essência
    })

    // Validação pós-geração
    let finalLyrics = capitalizeLines(text)

    // Remove explicações da IA
    finalLyrics = finalLyrics
      .split("\n")
      .filter(
        (line) =>
          !line.trim().startsWith("Retorne") && !line.trim().startsWith("INSTRUÇÕES") && !line.includes("Explicação"),
      )
      .join("\n")
      .trim()

    console.log("[API] 🔧 Aplicando correção automática de sílabas...")
    const enforcementResult = AbsoluteSyllableEnforcer.validateAndFix(finalLyrics)
    if (enforcementResult.corrections > 0) {
      console.log(`[API] ✅ ${enforcementResult.corrections} verso(s) corrigido(s) automaticamente`)
      finalLyrics = enforcementResult.correctedLyrics
    }

    console.log("[API] 📚 Empilhando versos...")
    const stackResult = LineStacker.stackLines(finalLyrics)
    finalLyrics = stackResult.stackedLyrics
    if (stackResult.improvements.length > 0) {
      console.log(`[API] ✅ ${stackResult.improvements.length} melhoria(s) de empilhamento aplicadas`)
    }

    if (shouldUsePerformanceFormat(genre, performanceMode)) {
      finalLyrics = formatSertanejoPerformance(finalLyrics, genre)
    }

    const instrumentation = formatInstrumentationForAI(genre, finalLyrics)
    finalLyrics = `${finalLyrics}\n\n${instrumentation}`

    const lines = finalLyrics.split("\n")
    let validLines = 0
    let totalLines = 0

    for (const line of lines) {
      if (line.trim() && !line.startsWith("[") && !line.startsWith("(")) {
        totalLines++
        const syllables = countPoeticSyllables(line)
        if (syllables >= minSyllables && syllables <= maxSyllables) {
          validLines++
        }
      }
    }

    const validityRatio = totalLines > 0 ? validLines / totalLines : 1
    const finalScore = Math.round(validityRatio * 100)

    console.log(`[API] ✅ Validação: ${finalScore}% das linhas dentro da métrica`)

    return NextResponse.json({
      lyrics: finalLyrics, // nome consistente
      title: title || "Letra Reescrita",
      metadata: {
        finalScore,
        polishingApplied: true,
        performanceMode,
        syllableRange: { min: minSyllables, max: maxSyllables },
        genre: genre,
        syllableCorrections: enforcementResult.corrections,
      },
    })
  } catch (error) {
    console.error("[API] ❌ Erro na reescrita:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro interno",
        details: process.env.NODE_ENV === "development" ? (error as any)?.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: "Método não permitido" }, { status: 405 })
}
