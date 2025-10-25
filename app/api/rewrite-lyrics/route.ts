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
import { validateSyllablesByGenre } from "@/lib/validation/absolute-syllable-enforcer"
import { LineStacker } from "@/lib/utils/line-stacker"
import { MetaComposer } from "@/lib/orchestrator/meta-composer"

// Função auxiliar para correção rápida de sílabas
function applyQuickSyllableFix(line: string, maxSyllables: number): string {
  let fixedLine = line
  const syllables = countPoeticSyllables(line)
  
  if (syllables <= maxSyllables) return fixedLine

  // Aplica contrações comuns
  const contractions = [
    { regex: /\bvocê\b/gi, replacement: "cê" },
    { regex: /\bpara\b/gi, replacement: "pra" },
    { regex: /\bestou\b/gi, replacement: "tô" },
    { regex: /\bcomigo\b/gi, replacement: "c'migo" },
    { regex: /\bde\s+(\w)/gi, replacement: "d'$1" },
    { regex: /\b(\w+)ão\b/gi, replacement: "$1ão" }, // Mantém mas remove artigo se necessário
  ]

  for (const contraction of contractions) {
    const testLine = fixedLine.replace(contraction.regex, contraction.replacement)
    const testSyllables = countPoeticSyllables(testLine)
    
    if (testSyllables <= maxSyllables) {
      fixedLine = testLine
      break
    }
  }

  // Se ainda estiver longo, remove palavras desnecessárias
  if (countPoeticSyllables(fixedLine) > maxSyllables) {
    const words = fixedLine.split(' ')
    const removals = ['o', 'a', 'um', 'uma', 'de', 'em', 'por']
    
    for (let i = words.length - 1; i >= 0; i--) {
      if (removals.includes(words[i].toLowerCase())) {
        const testLine = words.filter((_, index) => index !== i).join(' ')
        if (countPoeticSyllables(testLine) <= maxSyllables) {
          fixedLine = testLine
          break
        }
      }
    }
  }

  return fixedLine
}

export async function POST(request: NextRequest) {
  try {
    const {
      originalLyrics,
      genre,
      mood,
      theme,
      additionalRequirements,
      title,
      creativity = "conservador",
      performanceMode = "standard",
      useIntelligentElisions = true,
    } = await request.json()

    // Validação robusta
    if (!originalLyrics?.trim()) {
      return NextResponse.json({ error: "Letra original é obrigatória" }, { status: 400 })
    }

    if (!genre || typeof genre !== "string" || !genre.trim()) {
      return NextResponse.json({ error: "Gênero é obrigatório" }, { status: 400 })
    }

    console.log(`[API] 🎵 Reescrevendo para gênero: ${genre}`)

    // Usa o MetaComposer para reescrita avançada
    const compositionResult = await MetaComposer.compose({
      originalLyrics,
      genre,
      theme: theme || "Manter tema original",
      mood: mood || "Manter humor original",
      additionalRequirements,
      creativity,
      performanceMode,
      useIntelligentElisions,
      applyFinalPolish: true,
      syllableTarget: {
        min: 7,
        max: 11,
        ideal: 9,
      },
    })

    let finalLyrics = compositionResult.lyrics

    // Validação final de sílabas
    const syllableValidation = validateSyllablesByGenre(finalLyrics, genre)
    
    if (!syllableValidation.isValid) {
      console.warn("⚠️ Validação de sílabas falhou:", syllableValidation.message)
      
      // Aplica correções manuais para linhas problemáticas
      const lines = finalLyrics.split('\n')
      const correctedLines = lines.map(line => {
        if (line.trim() && !line.startsWith("[") && !line.startsWith("(") && !line.includes("Instruments:")) {
          const syllables = countPoeticSyllables(line)
          if (syllables > syllableValidation.maxSyllables) {
            return applyQuickSyllableFix(line, syllableValidation.maxSyllables)
          }
        }
        return line
      })
      
      finalLyrics = correctedLines.join('\n')
    }

    // Aplica formatação de performance se necessário
    if (shouldUsePerformanceFormat(genre, performanceMode)) {
      finalLyrics = formatSertanejoPerformance(finalLyrics)
    }

    // Stack de linhas para melhor legibilidade
    const stackingResult = LineStacker.stackLines(finalLyrics)
    finalLyrics = stackingResult.stackedLyrics

    console.log("✅ Reescrita finalizada com sucesso!")
    console.log(`📊 Métricas: Score ${compositionResult.metadata.finalScore.toFixed(1)}`)

    return NextResponse.json({
      success: true,
      lyrics: finalLyrics,
      title: title || compositionResult.title,
      metadata: {
        ...compositionResult.metadata,
        syllableValidation: {
          isValid: syllableValidation.isValid,
          message: syllableValidation.message,
          maxSyllables: syllableValidation.maxSyllables,
        },
        rewritingApplied: true,
      },
    })

  } catch (error) {
    console.error("❌ Erro na reescrita:", error)
    
    return NextResponse.json(
      { 
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: "Método não permitido" }, { status: 405 })
}
