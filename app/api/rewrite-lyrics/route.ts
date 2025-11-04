import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { buildGenreRulesPrompt } from "@/lib/validation/genre-rules-builder"
import { enforceSyllableLimitAll } from "@/lib/validation/intelligent-rewriter"
import { getUniversalRhymeRules } from "@/lib/validation/universal-rhyme-rules"
import {
  formatSertanejoPerformance,
  shouldUsePerformanceFormat,
} from "@/lib/formatters/sertanejo-performance-formatter"
import { formatInstrumentationForAI } from "@/lib/normalized-genre"
import { LineStacker } from "@/lib/utils/line-stacker"
import { enhanceLyricsRhymes } from "@/lib/validation/rhyme-enhancer"
import { validateRhymesForGenre } from "@/lib/validation/rhyme-validator"
import { GENRE_CONFIGS, getSyllableLimitsForGenre } from "@/lib/genre-config"
import { cleanLyricsFromAI } from "@/lib/utils/remove-quotes-and-clean"
import { reviewAndFixAllLines } from "@/lib/validation/auto-syllable-fixer"
import { fixAllIncompleteVerses } from "@/lib/validation/verse-completer"
import { enforceSectionStructure } from "@/lib/validation/section-structure-enforcer"

function getMaxSyllables(genre: string): number {
  const genreConfig = (GENRE_CONFIGS as any)[genre]
  if (!genreConfig?.prosody_rules?.syllable_count) return 12
  const syllableCount = genreConfig.prosody_rules.syllable_count
  if ("absolute_max" in syllableCount) return syllableCount.absolute_max as number
  if ("without_comma" in syllableCount) {
    const withoutComma = syllableCount.without_comma as { acceptable_up_to?: number; max?: number }
    return withoutComma.acceptable_up_to || withoutComma.max || 12
  }
  return 12
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
      performanceMode = "standard",
    } = await request.json()

    if (!originalLyrics?.trim()) {
      return NextResponse.json({ error: "Letra original é obrigatória" }, { status: 400 })
    }
    if (!genre || typeof genre !== "string" || !genre.trim()) {
      return NextResponse.json({ error: "Gênero é obrigatório" }, { status: 400 })
    }

    console.log(`[API] 🎵 Iniciando reescrita para: ${genre}`)

    const syllableLimits = getSyllableLimitsForGenre(genre)
    const maxSyllables = syllableLimits.max
    const idealSyllables = syllableLimits.ideal

    const rhymeRules = getUniversalRhymeRules(genre)
    const genreRules = buildGenreRulesPrompt(genre)

    const prompt = `COMPOSITOR PROFISSIONAL BRASILEIRO - ${genre.toUpperCase()}

🎯 MISSÃO: Reescrever a letra mantendo VERSOS COMPLETOS e RIMAS RICAS

📝 EXEMPLOS DE VERSOS COMPLETOS (CORRETO):
✅ "Hoje eu venho aqui de coração aberto"
✅ "Com gratidão transbordando em meu peito"
✅ "Teu amor me renova a cada amanhecer"
✅ "Nos braços de Deus encontro meu abrigo"
✅ "A vida é uma bênção que eu agradeço"

🚫 NUNCA FAÇA VERSOS INCOMPLETOS (ERRADO):
❌ "Se você chora, não sei se é" (incompleto - "se é" o quê?)
❌ "Não quero mais viver com essa" (incompleto - "com essa" o quê?)
❌ "Não quero ser consolo pro seu" (incompleto - "pro seu" o quê?)
❌ "Do calor que você me" (incompleto - cortado)
❌ "Com coração, implorando" (incompleto - "implorando" o quê?)

LETRA ORIGINAL (inspiração):
${originalLyrics}

TEMA: ${theme || "Amor e saudade"}
HUMOR: ${mood || "Emotivo"}
GÊNERO: ${genre}

${
  additionalRequirements
    ? `
🎯 REQUISITOS OBRIGATÓRIOS (DEVEM SER INCLUÍDOS):
${additionalRequirements}

⚠️ ATENÇÃO: Os requisitos acima são OBRIGATÓRIOS e NÃO NEGOCIÁVEIS. 
Se houver um refrão ou hook especificado, você DEVE incorporá-lo EXATAMENTE como está na letra reescrita. 
Construa TODOS os versos em torno desses elementos obrigatórios.
`
    : ""
}

📏 MÉTRICA MUSICAL:
- Ideal: ${idealSyllables} sílabas por verso
- Máximo ABSOLUTO: ${maxSyllables} sílabas (NUNCA ultrapassar)
- Mínimo: ${syllableLimits.min} sílabas
- ${rhymeRules.requirePerfectRhymes ? "Rimas RICAS e PERFEITAS obrigatórias" : "Rimas RICAS sempre que possível"}
- NUNCA use aspas nas linhas
- NUNCA deixe versos incompletos

🎵 ESTRUTURA:
${
  performanceMode === "performance"
    ? `### [INTRO] (4 linhas completas)
### [VERSO 1] (6 linhas completas)  
### [PRÉ-REFRÃO] (4 linhas completas)
### [REFRÃO] (6 linhas completas)
### [VERSO 2] (6 linhas completas)
### [REFRÃO] (6 linhas completas)
### [PONTE] (6 linhas completas)
### [REFRÃO] (6 linhas completas)
### [OUTRO] (4 linhas completas)`
    : `### [Intro] (4 linhas completas)
### [Verso 1] (6 linhas completas)
### [Pré-Refrão] (4 linhas completas)
### [Refrão] (6 linhas completas)
### [Verso 2] (6 linhas completas)
### [Refrão] (6 linhas completas)
### [Ponte] (6 linhas completas)
### [Refrão] (6 linhas completas)
### [Outro] (4 linhas completas)`
}

💡 PRIORIDADES (EM ORDEM):
1. INCLUIR REQUISITOS OBRIGATÓRIOS (refrão/hook especificados) - NÃO NEGOCIÁVEL
2. VERSOS COMPLETOS (sujeito + verbo + complemento) - OBRIGATÓRIO
3. RIMAS RICAS (amor/calor, coração/canção, vida/ferida) - MUITO IMPORTANTE
4. Dentro do limite de ${maxSyllables} sílabas - OBRIGATÓRIO
5. Linguagem natural e cantável - IMPORTANTE

🎼 EXEMPLOS DE RIMAS RICAS:
- amor → calor, dor, flor, sabor, valor
- coração → canção, emoção, ilusão, paixão
- vida → ferida, partida, esquecida, querida
- noite → açoite, dezoito
- dia → alegria, fantasia, harmonia, melodia

IMPORTANTE: Retorne APENAS as linhas da letra, SEM aspas, SEM explicações.

Gere a letra reescrita agora:`

    console.log(`[API] 🔄 Solicitando reescrita da IA...`)

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.7,
    })

    let finalLyrics = cleanLyricsFromAI(text)
    finalLyrics = capitalizeLines(finalLyrics)
    console.log("[API] 📝 Resposta bruta recebida")

    console.log("[API] 📐 Aplicando limites de linhas por seção...")
    finalLyrics = enforceSectionStructure(finalLyrics, genre)

    console.log("[API] 🔍 Detectando e completando versos incompletos...")
    const completionResult = await fixAllIncompleteVerses(finalLyrics, genre, maxSyllables)
    if (completionResult.fixedCount > 0) {
      console.log(`[API] ✅ ${completionResult.fixedCount} verso(s) incompleto(s) completado(s)`)
      finalLyrics = completionResult.fixedLyrics
    }

    console.log("[API] 🔍 Revisão: corrigindo palavras cortadas...")
    const initialFixResult = reviewAndFixAllLines(finalLyrics, maxSyllables)
    if (initialFixResult.corrections.length > 0) {
      console.log(`[API] ✅ ${initialFixResult.corrections.length} correção(ões) aplicada(s)`)
      finalLyrics = initialFixResult.fixedLyrics
    }

    console.log("[API] 🎵 Validando qualidade das rimas...")
    const rhymeValidation = validateRhymesForGenre(finalLyrics, genre)
    if (!rhymeValidation.valid || rhymeValidation.warnings.length > 0) {
      console.log("[API] 🔧 Melhorando rimas automaticamente...")
      const rhymeEnhancement = await enhanceLyricsRhymes(finalLyrics, genre, theme || "tema", 0.8)
      if (rhymeEnhancement.improvements.length > 0) {
        console.log(`[API] ✅ ${rhymeEnhancement.improvements.length} rima(s) melhorada(s) para RICA`)
        finalLyrics = rhymeEnhancement.enhancedLyrics
      }
    }

    console.log("[API] 🎤 Aplicando reescrita inteligente com elisões...")
    finalLyrics = await enforceSyllableLimitAll(finalLyrics, maxSyllables)

    console.log("[API] 📚 Aplicando empilhamento...")
    const stackingResult = LineStacker.stackLines(finalLyrics)
    finalLyrics = stackingResult.stackedLyrics

    if (shouldUsePerformanceFormat(genre, performanceMode)) {
      finalLyrics = formatSertanejoPerformance(finalLyrics, genre)
    }

    console.log("[API] 🎸 Adicionando instrumentação...")
    const instrumentation = formatInstrumentationForAI(genre, finalLyrics)
    finalLyrics = `${finalLyrics}\n\n${instrumentation}`

    const totalLines = finalLyrics.split("\n").filter((line) => line.trim().length > 0).length
    console.log(`[API] 🎉 PROCESSO CONCLUÍDO: ${totalLines} linhas`)

    return NextResponse.json({
      success: true,
      lyrics: finalLyrics,
      title: title || `${theme || "Música"} - ${genre}`,
      metadata: {
        genre,
        performanceMode,
        maxSyllables,
        idealSyllables,
        totalLines,
        quality: "COMPLETE_VERSES_RICH_RHYMES",
      },
    })
  } catch (error) {
    console.error("[API] ❌ Erro crítico:", error)
    return NextResponse.json(
      {
        error: "Falha na geração da letra",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: "Método não permitido" }, { status: 405 })
}
