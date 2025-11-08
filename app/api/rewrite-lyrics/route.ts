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

    const prompt = `SISTEMA DE COMPOSIÇÃO PROFISSIONAL - ${genre.toUpperCase()}

🚨 REGRA NÚMERO 1 - VERSOS COMPLETOS (NÃO NEGOCIÁVEL):
TODO verso deve ser uma frase completa com sentido próprio.
NUNCA escreva frases incompletas ou cortadas.

❌ EXEMPLOS DE VERSOS PROIBIDOS (INCOMPLETOS):
"ferido, eu sigo frente" → ERRADO! Quem está ferido?
"é hora eu me, menina" → ERRADO! Cortado no meio
"Teu amor me, não dá" → ERRADO! "me" o quê?
"O mundo é teu, e eu nã" → ERRADO! Palavra cortada
"com essa" → ERRADO! Com essa o quê?
"pro seu" → ERRADO! Pro seu o quê?
"partido, eu sigo frente" → ERRADO! Quem/O que está partido?
"cada canto e esquina" → ERRADO! Falta verbo e sujeito

✅ EXEMPLOS DE VERSOS CORRETOS (COMPLETOS):
"Mesmo ferido, eu sigo em frente com coragem"
"É hora de me libertar dessa tristeza, menina"
"Teu amor não me completa mais, não dá"
"O mundo é teu, e eu não faço mais parte"
"Não quero viver com essa dor no peito"
"Não sou mais consolo pro seu coração vazio"
"De coração partido, eu sigo em frente sozinho"
"Te procurei em cada canto e esquina da cidade"

LETRA ORIGINAL (base para reescrita):
${originalLyrics}

TEMA: ${theme || "Amor e saudade"}
HUMOR: ${mood || "Emotivo"}
GÊNERO: ${genre}

${
  additionalRequirements
    ? `
🎯 ELEMENTOS OBRIGATÓRIOS (PRIORIDADE MÁXIMA):
${additionalRequirements}

⚠️ ESTES ELEMENTOS SÃO OBRIGATÓRIOS E DEVEM SER INCLUÍDOS EXATAMENTE COMO ESTÃO.
Se houver refrão ou hook especificado, use-o LITERALMENTE e construa os versos ao redor dele.
`
    : ""
}

📏 LIMITES DE MÉTRICA (RÍGIDOS):
- Ideal: ${idealSyllables} sílabas poéticas por verso
- Máximo ABSOLUTO: ${maxSyllables} sílabas (NUNCA ultrapassar)
- Mínimo: ${syllableLimits.min} sílabas
- ${rhymeRules.requirePerfectRhymes ? "Rimas RICAS e PERFEITAS são obrigatórias" : "Use rimas RICAS sempre que possível"}

🎵 ESTRUTURA EXATA (RESPEITE RIGOROSAMENTE):
${
  performanceMode === "performance"
    ? `### [INTRO] - 4 linhas completas
### [VERSO 1] - 4 linhas completas
### [PRÉ-REFRÃO] - 4 linhas completas
### [REFRÃO] - 4 linhas completas
### [VERSO 2] - 4 linhas completas
### [REFRÃO] - 4 linhas completas (IDÊNTICO ao primeiro)
### [PONTE] - 4 linhas completas
### [REFRÃO] - 4 linhas completas (IDÊNTICO ao primeiro)
### [OUTRO] - 4 linhas completas`
    : `### [Intro] - 4 linhas completas
### [Verso 1] - 4 linhas completas
### [Pré-Refrão] - 4 linhas completas
### [Refrão] - 4 linhas completas
### [Verso 2] - 4 linhas completas
### [Refrão] - 4 linhas completas (IDÊNTICO ao primeiro)
### [Ponte] - 4 linhas completas
### [Refrão] - 4 linhas completas (IDÊNTICO ao primeiro)
### [Outro] - 4 linhas completas`
}

⚠️ REGRAS ABSOLUTAS:
1. Cada seção tem EXATAMENTE 4 linhas (não 3, não 5, não 10 - EXATAMENTE 4)
2. O REFRÃO é IDÊNTICO nas 3 repetições (mesmas 4 linhas)
3. NUNCA adicione linhas extras fora das seções
4. TODO verso deve ter sujeito + verbo + complemento (frase completa)
5. NUNCA termine verso com preposição solta (de, da, pro, pra, com, sem, que)
6. NUNCA corte palavras no meio (nã, me,, frente sem sujeito)

🎼 RIMAS RICAS (use estas terminações):
- amor/calor/dor/flor/sabor/valor/fervor
- coração/canção/emoção/ilusão/paixão/solidão
- vida/ferida/partida/esquecida/querida/despedida
- noite/açoite/dezoito
- dia/alegria/fantasia/harmonia/melodia/agonia

💡 ORDEM DE PRIORIDADE:
1º) INCLUIR requisitos obrigatórios (se houver refrão/hook especificado)
2º) VERSOS COMPLETOS (frases com sentido próprio)
3º) EXATAMENTE 4 linhas por seção
4º) RIMAS RICAS entre versos
5º) Dentro do limite de ${maxSyllables} sílabas

IMPORTANTE: 
- Retorne APENAS a letra
- SEM aspas nas linhas
- SEM explicações
- SEM notas

Gere a letra reescrita agora:`

    console.log(`[API] 🤖 Solicitando reescrita à IA com prompt ultra-rigoroso...`)

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.7,
    })

    let finalLyrics = cleanLyricsFromAI(text)
    console.log("[API] 📝 Letra bruta recebida da IA")

    finalLyrics = capitalizeLines(finalLyrics)
    console.log("[API] ✅ Linhas capitalizadas")

    console.log("[API] 📐 Aplicando estrutura rígida (4 linhas por seção)...")
    finalLyrics = enforceSectionStructure(finalLyrics, genre)
    console.log("[API] ✅ Estrutura aplicada")

    console.log("[API] 🔍 Detectando e completando versos incompletos...")
    const completionResult = await fixAllIncompleteVerses(finalLyrics, genre, maxSyllables)
    if (completionResult.fixedCount > 0) {
      console.log(`[API] ✅ ${completionResult.fixedCount} verso(s) incompleto(s) foram completados`)
      finalLyrics = completionResult.fixedLyrics
    } else {
      console.log("[API] ✓ Nenhum verso incompleto detectado")
    }

    console.log("[API] 🔧 Corrigindo palavras cortadas...")
    const fixResult = reviewAndFixAllLines(finalLyrics, maxSyllables)
    if (fixResult.corrections.length > 0) {
      console.log(`[API] ✅ ${fixResult.corrections.length} palavra(s) cortada(s) corrigida(s)`)
      finalLyrics = fixResult.fixedLyrics
    } else {
      console.log("[API] ✓ Nenhuma palavra cortada encontrada")
    }

    console.log("[API] 🎵 Validando e melhorando rimas...")
    const rhymeValidation = validateRhymesForGenre(finalLyrics, genre)
    if (!rhymeValidation.valid || rhymeValidation.warnings.length > 0) {
      console.log("[API] 🔧 Aplicando melhorias de rima...")
      const rhymeEnhancement = await enhanceLyricsRhymes(finalLyrics, genre, theme || "tema", 0.8)
      if (rhymeEnhancement.improvements.length > 0) {
        console.log(`[API] ✅ ${rhymeEnhancement.improvements.length} rima(s) melhorada(s)`)
        finalLyrics = rhymeEnhancement.enhancedLyrics
      }
    } else {
      console.log("[API] ✓ Rimas validadas com sucesso")
    }

    console.log("[API] 🎤 Aplicando contrações naturais brasileiras...")
    finalLyrics = await enforceSyllableLimitAll(finalLyrics, maxSyllables)
    console.log("[API] ✅ Contrações aplicadas")

    console.log("[API] 📚 Aplicando empilhamento inteligente...")
    const stackingResult = LineStacker.stackLines(finalLyrics)
    finalLyrics = stackingResult.stackedLyrics
    console.log("[API] ✅ Empilhamento concluído")

    if (shouldUsePerformanceFormat(genre, performanceMode)) {
      console.log("[API] 🎭 Aplicando formato de performance...")
      finalLyrics = formatSertanejoPerformance(finalLyrics, genre)
    }

    console.log("[API] 🎸 Adicionando instrumentação...")
    const instrumentation = formatInstrumentationForAI(genre, finalLyrics)
    finalLyrics = `${finalLyrics}\n\n${instrumentation}`

    const totalLines = finalLyrics.split("\n").filter((line) => line.trim().length > 0).length
    console.log(`[API] 🎉 REESCRITA CONCLUÍDA COM SUCESSO: ${totalLines} linhas totais`)

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
        quality: "COMPLETE_VERSES_RICH_RHYMES_STRICT_STRUCTURE",
        incompleteverses_fixed: completionResult.fixedCount,
        syllable_corrections: fixResult.corrections.length,
      },
    })
  } catch (error) {
    console.error("[API] ❌ Erro crítico na reescrita:", error)
    return NextResponse.json(
      {
        error: "Falha na reescrita da letra",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: "Método não permitido" }, { status: 405 })
}
