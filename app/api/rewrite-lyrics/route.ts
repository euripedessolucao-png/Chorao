// app/api/rewrite-lyrics/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { buildGenreRulesPrompt } from "@/lib/validation/genre-rules-builder"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter-brasileiro"
import { getUniversalRhymeRules } from "@/lib/validation/universal-rhyme-rules"
import { formatInstrumentationForAI } from "@/lib/normalized-genre"
import { LineStacker } from "@/lib/utils/line-stacker"
import { validateSyllablesByGenre } from "@/lib/validation/absolute-syllable-enforcer"
import { fixLineToMaxSyllables } from "@/lib/validation/local-syllable-fixer"

// ✅ Importação correta
import { GENRE_CONFIGS } from "@/lib/genre-config"

// ✅ Função para máximo de sílabas
function getMaxSyllables(genre: string): number {
  const genreConfig = (GENRE_CONFIGS as any)[genre]
  if (!genreConfig?.prosody_rules?.syllable_count) return 12

  const syllableCount = genreConfig.prosody_rules.syllable_count

  if ("absolute_max" in syllableCount) {
    return syllableCount.absolute_max as number
  }
  if ("without_comma" in syllableCount) {
    const withoutComma = syllableCount.without_comma as { acceptable_up_to?: number; max?: number }
    return withoutComma.acceptable_up_to || withoutComma.max || 12
  }
  if ("with_comma" in syllableCount) {
    const withComma = syllableCount.with_comma as { total_max?: number }
    return withComma.total_max || 12
  }
  return 12
}

// ✅ CORRETOR AUTOMÁTICO DE VERSOS INCOMPLETOS
function fixIncompleteLines(lyrics: string): string {
  const lines = lyrics.split('\n')
  const fixedLines: string[] = []
  
  // Palavras que indicam verso incompleto
  const incompleteIndicators = ['que', 'do', 'por', 'me', 'te', 'em', 'a', 'o', 'de', 'da', 'no', 'na', 'com', 'se']
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim()
    
    // Ignora tags e linhas vazias
    if (!line || line.startsWith('### [') || line.startsWith('(Instrumentation)') || line.startsWith('(Genre)')) {
      fixedLines.push(line)
      continue
    }
    
    const cleanLine = line.replace(/\[.*?\]/g, "").replace(/\(.*?\)/g, "").trim()
    const lastWord = cleanLine.split(/\s+/).pop()?.toLowerCase()
    
    // ✅ CORREÇÃO: Se termina com palavra incompleta, completa a frase
    if (lastWord && incompleteIndicators.includes(lastWord)) {
      console.log(`[Corrector] 🔧 Corrigindo verso incompleto: "${line}"`)
      
      // Completar baseado no contexto
      if (lastWord === 'que') line += ' me dás'
      else if (lastWord === 'do') line += ' Senhor'
      else if (lastWord === 'por') line += ' tudo'
      else if (lastWord === 'me') line += ' sustenta'
      else if (lastWord === 'te') line += ' amo'
      else if (lastWord === 'em') line += ' Ti'
      else if (lastWord === 'de') line += ' graça'
      else if (lastWord === 'da') line += ' vida'
      else line += ' sempre'
      
      console.log(`[Corrector] ✅ Corrigido para: "${line}"`)
    }
    
    // ✅ CORREÇÃO: Remove pontuação de continuação
    if (line.endsWith(',') || line.endsWith('-')) {
      line = line.slice(0, -1).trim() + '.'
    }
    
    // ✅ CORREÇÃO: Adiciona pontuação final se faltar
    if (!line.endsWith('.') && !line.endsWith('!') && !line.endsWith('?') && !line.endsWith(']')) {
      line += '.'
    }
    
    fixedLines.push(line)
  }
  
  return fixedLines.join('\n')
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

    console.log(`[API] 🎵 Reescrevendo letra para: ${genre}`)

    const maxSyllables = getMaxSyllables(genre)
    const rhymeRules = getUniversalRhymeRules(genre)
    const genreRules = buildGenreRulesPrompt(genre)

    const prompt = `COMPOSITOR PROFISSIONAL DE ${genre.toUpperCase()}

TAREFA URGENTE: Reescrever esta letra mantendo VERSOS COMPLETOS.

🚨 REGRA CRÍTICA: CADA LINHA DEVE SER UMA FRASE COMPLETA
- NUNCA termine com: que, do, por, me, te, em, a, o, de, da
- Cada verso = sujeito + verbo + complemento
- Frases devem fazer sentido SOZINHAS

LETRA ORIGINAL:
${originalLyrics}

TEMA: ${theme || "Gratidão"}
HUMOR: ${mood || "Reverente"}
GÊNERO: ${genre}

${additionalRequirements ? `REQUISITOS: ${additionalRequirements}` : ""}

REGRAS TÉCNICAS:
- Máximo ${maxSyllables} sílabas por verso
- ${rhymeRules.requirePerfectRhymes ? "Rimas perfeitas" : "Rimas naturais"}
- Linguagem coloquial brasileira

ESTRUTURA:
${
  performanceMode === "performance" 
    ? `### [INTRO] (4 linhas)
### [VERSE 1] (6 linhas)  
### [PRE-CHORUS] (4 linhas)
### [CHORUS] (6 linhas)
### [VERSE 2] (6 linhas)
### [CHORUS] (6 linhas)
### [BRIDGE] (6 linhas)
### [CHORUS] (6 linhas)
### [OUTRO] (4 linhas)`
    : `### [Intro] (4 linhas)
### [Verso 1] (6 linhas)
### [Pré-Refrão] (4 linhas)
### [Refrão] (6 linhas)
### [Verso 2] (6 linhas)
### [Refrão] (6 linhas)
### [Ponte] (6 linhas)
### [Refrão] (6 linhas)
### [Outro] (4 linhas)`
}

EXEMPLOS CORRETOS:
✅ "Senhor, eu venho a Ti com gratidão"
✅ "De joelhos, agradeço pela vida"
✅ "Cada respiração me faz sentir Teu amor"

EXEMPLOS ERRADOS (NUNCA FAÇA):
❌ "Senhor, eu venho a Ti" (incompleto)
❌ "De joelhos, agradeço" (incompleto) 
❌ "Cada respiração que me" (incompleto)

Gere a letra COMPLETA com VERSOS COMPLETOS:`

    console.log(`[API] 🔄 Gerando letra...`)

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.7,
    })

    let finalLyrics = capitalizeLines(text)

    // ✅ ETAPA CRÍTICA: CORREÇÃO AUTOMÁTICA DE VERSOS INCOMPLETOS
    console.log("[API] 🔧 Aplicando correção automática de versos incompletos...")
    finalLyrics = fixIncompleteLines(finalLyrics)

    // ✅ LIMPEZA
    finalLyrics = finalLyrics
      .split("\n")
      .filter(line => {
        const trimmed = line.trim()
        return !trimmed.startsWith("Retorne") && 
               !trimmed.startsWith("REGRAS") && 
               !trimmed.includes("Explicação") &&
               !trimmed.includes("```") &&
               trimmed.length > 0
      })
      .join("\n")
      .trim()

    // ✅ CORREÇÃO DE SÍLABAS
    console.log("[API] 📏 Corrigindo sílabas...")
    const lines = finalLyrics.split("\n")
    const correctedLines: string[] = []
    let corrections = 0

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("### [") || trimmed.startsWith("(")) {
        correctedLines.push(line)
        continue
      }

      const lineWithoutTags = trimmed.replace(/\[.*?\]/g, "").replace(/\(.*?\)/g, "").trim()
      if (!lineWithoutTags) {
        correctedLines.push(line)
        continue
      }

      const syllables = countPoeticSyllables(lineWithoutTags)
      if (syllables > maxSyllables) {
        const fixed = fixLineToMaxSyllables(trimmed, maxSyllables)
        correctedLines.push(fixed)
        corrections++
      } else {
        correctedLines.push(line)
      }
    }

    if (corrections > 0) {
      console.log(`[API] ✅ ${corrections} verso(s) corrigido(s) para métrica`)
      finalLyrics = correctedLines.join("\n")
    }

    // ✅ PROCESSAMENTO FINAL
    console.log("[API] 📚 Empilhando versos...")
    const stackingResult = LineStacker.stackLines(finalLyrics)
    finalLyrics = stackingResult.stackedLyrics

    console.log("[API] 🎸 Adicionando instrumentação...")
    const instrumentation = formatInstrumentationForAI(genre, finalLyrics)
    finalLyrics = `${finalLyrics}\n\n${instrumentation}`

    const finalLineCount = finalLyrics.split('\n').filter(line => line.trim().length > 0).length
    console.log(`[API] ✅ Geração concluída: ${finalLineCount} linhas`)

    return NextResponse.json({
      success: true,
      lyrics: finalLyrics,
      title: title || `${theme || "Música"} - ${genre}`,
      metadata: {
        genre,
        performanceMode,
        maxSyllables,
        totalLines: finalLineCount,
        syllableCorrections: corrections,
      },
    })

  } catch (error) {
    console.error("[API] ❌ Erro:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro interno",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: "Método não permitido" }, { status: 405 })
}
