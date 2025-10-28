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

// ✅ NOVA ABORDAGEM: Geração por partes com validação rigorosa
async function generateCompleteSection(
  sectionType: string,
  context: string,
  genre: string,
  maxSyllables: number,
  lineCount: number
): Promise<string> {
  const prompt = `COMPOSITOR ESPECIALIZADO EM ${genre.toUpperCase()}

GERAR APENAS ${sectionType.toUpperCase()} - ${lineCount} LINHAS COMPLETAS

CONTEXTO DA MÚSICA:
${context}

REGRAS ABSOLUTAS:
- CADA LINHA deve ser uma FRASE COMPLETA
- NUNCA termine com: "que", "do", "por", "me", "te", "nos", "em", "a", "o"
- Cada verso deve fazer sentido SOZINHO
- Máximo ${maxSyllables} sílabas por linha
- Use pontuação final (. ! ?) em CADA linha

EXEMPLOS CORRETOS:
✅ "Senhor, eu Te agradeço pela vida"
✅ "Tua graça me sustenta a cada dia" 
✅ "O amor que sinto enche meu coração"
✅ "A família que me abraça com carinho"

EXEMPLOS ERRADOS (NUNCA FAÇA):
❌ "Senhor, eu Te agradeço pela" (INCOMPLETO)
❌ "Tua graça me sustenta a cada" (INCOMPLETO)
❌ "O amor que sinto enche meu" (INCOMPLETO)

Gere ${lineCount} linhas COMPLETAS para ${sectionType}:

${sectionType.toUpperCase()}:`

  const { text } = await generateText({
    model: "openai/gpt-4o-mini",
    prompt,
    temperature: 0.7,
  })

  return text.split('\n')
    .filter(line => line.trim().length > 0)
    .slice(0, lineCount)
    .join('\n')
}

// ✅ VALIDAÇÃO RIGOROSA DE VERSOS COMPLETOS
function validateCompleteLines(lyrics: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const lines = lyrics.split('\n')
  
  const incompleteEndings = [
    'que', 'do', 'por', 'me', 'te', 'nos', 'em', 'a', 'o', 'de', 'da', 
    'no', 'na', 'com', 'sem', 'se', 'que', 'um', 'uma', 'os', 'as'
  ]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || line.startsWith('[') || line.startsWith('(')) continue

    const cleanLine = line.replace(/\[.*?\]/g, "").replace(/\(.*?\)/g, "").trim()
    const lastWord = cleanLine.split(/\s+/).pop()?.toLowerCase()

    if (lastWord && incompleteEndings.includes(lastWord)) {
      errors.push(`Linha ${i + 1}: Termina com palavra incompleta "${lastWord}" - "${cleanLine}"`)
    }

    if (cleanLine.endsWith(',') || cleanLine.endsWith('-')) {
      errors.push(`Linha ${i + 1}: Termina com pontuação de continuação - "${cleanLine}"`)
    }

    const words = cleanLine.split(/\s+/).filter(w => w.length > 0)
    if (words.length < 3 && !cleanLine.match(/^(Amém|Aleluia|Glória|Oh|Ah)$/i)) {
      errors.push(`Linha ${i + 1}: Muito curta (${words.length} palavras) - "${cleanLine}"`)
    }
  }

  return { valid: errors.length === 0, errors }
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

    console.log(`[API] 🎵 GERANDO LETRA COMPLETA para: ${genre}`)

    const syllableValidation = validateSyllablesByGenre("", genre)
    const maxSyllables = syllableValidation.maxSyllables
    const rhymeRules = getUniversalRhymeRules(genre)

    // ✅ CONTEXTO PARA TODAS AS SEÇÕES
    const musicContext = `TEMA: ${theme || "Gratidão a Deus"}
HUMOR: ${mood || "Alegre e reverente"}
GÊNERO: ${genre}
LETRA ORIGINAL COMO INSPIRAÇÃO:
${originalLyrics}

${additionalRequirements ? `REQUISITOS: ${additionalRequirements}` : ''}`

    // ✅ GERAR CADA SEÇÃO SEPARADAMENTE
    console.log("[API] 🎼 Gerando seções individualmente...")
    
    const intro = await generateCompleteSection("Intro", musicContext, genre, maxSyllables, 4)
    const verse1 = await generateCompleteSection("Verso 1", musicContext, genre, maxSyllables, 4)
    const preChorus = await generateCompleteSection("Pré-Refrão", musicContext, genre, maxSyllables, 2)
    const chorus = await generateCompleteSection("Refrão", musicContext, genre, maxSyllables, 4)
    const verse2 = await generateCompleteSection("Verso 2", musicContext, genre, maxSyllables, 4)
    const bridge = await generateCompleteSection("Ponte", musicContext, genre, maxSyllables, 4)
    const outro = await generateCompleteSection("Outro", musicContext, genre, maxSyllables, 3)

    // ✅ MONTAR LETRA COMPLETA
    let finalLyrics = ""
    if (performanceMode === "performance") {
      finalLyrics = `[INTRO]
${intro}

[VERSE 1]
${verse1}

[PRE-CHORUS]
${preChorus}

[CHORUS]
${chorus}

[VERSE 2]
${verse2}

[CHORUS]
${chorus}

[BRIDGE]
${bridge}

[CHORUS]
${chorus}

[OUTRO]
${outro}`
    } else {
      finalLyrics = `[Intro]
${intro}

[Verso 1]
${verse1}

[Pré-Refrão]
${preChorus}

[Refrão]
${chorus}

[Verso 2]
${verse2}

[Refrão]
${chorus}

[Ponte]
${bridge}

[Refrão]
${chorus}

[Outro]
${outro}`
    }

    // ✅ CAPITALIZAR E VALIDAR
    finalLyrics = capitalizeLines(finalLyrics)
    
    console.log("[API] 🔍 Validando versos completos...")
    const validation = validateCompleteLines(finalLyrics)
    
    if (!validation.valid) {
      console.log("[API] ⚠️ Versos incompletos detectados, aplicando correções...")
      validation.errors.forEach(error => console.log(`[API]   - ${error}`))
      
      // ✅ CORREÇÃO AUTOMÁTICA DE SÍLABAS
      const lines = finalLyrics.split('\n')
      const correctedLines: string[] = []
      let corrections = 0

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith("(") || trimmed.startsWith("[")) {
          correctedLines.push(line)
          continue
        }

        const lineWithoutBrackets = trimmed.replace(/\[.*?\]/g, "").replace(/\(.*?\)/g, "").trim()
        if (!lineWithoutBrackets) {
          correctedLines.push(line)
          continue
        }

        const syllables = countPoeticSyllables(lineWithoutBrackets)
        if (syllables > maxSyllables) {
          const fixed = fixLineToMaxSyllables(trimmed, maxSyllables)
          correctedLines.push(fixed)
          corrections++
        } else {
          correctedLines.push(line)
        }
      }

      if (corrections > 0) {
        finalLyrics = correctedLines.join("\n")
        console.log(`[API] ✅ ${corrections} verso(s) corrigido(s) para métrica`)
      }
    }

    // ✅ EMPILHAR LINHAS E ADICIONAR INSTRUMENTAÇÃO
    console.log("[API] 📚 Empilhando versos...")
    const stackingResult = LineStacker.stackLines(finalLyrics)
    finalLyrics = stackingResult.stackedLyrics

    console.log("[API] 🎸 Adicionando instrumentação...")
    const instrumentation = formatInstrumentationForAI(genre, finalLyrics)
    finalLyrics = `${finalLyrics}\n\n${instrumentation}`

    // ✅ MÉTRICAS FINAIS
    const finalValidation = validateCompleteLines(finalLyrics)
    const lineCount = finalLyrics.split('\n').filter(line => line.trim().length > 0).length

    console.log(`[API] ✅ Geração concluída: ${lineCount} linhas`)
    console.log(`[API] ✅ Versos completos: ${finalValidation.valid ? 'SIM' : 'COM ERROS'}`)

    return NextResponse.json({
      success: true,
      lyrics: finalLyrics,
      title: title || `${theme || "Música"} - ${genre}`,
      metadata: {
        genre,
        performanceMode,
        maxSyllables,
        totalLines: lineCount,
        completeVerses: finalValidation.valid,
        validationErrors: finalValidation.errors,
        rhymeStyle: rhymeRules.requirePerfectRhymes ? "Rimas perfeitas" : "Rimas naturais",
      },
    })

  } catch (error) {
    console.error("[API] ❌ Erro na geração:", error)
    return NextResponse.json(
      {
        error: "Erro ao gerar letra completa",
        details: process.env.NODE_ENV === "development" ? (error as any)?.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: "Método não permitido" }, { status: 405 })
}
