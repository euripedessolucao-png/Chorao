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

import { GENRE_CONFIGS } from "@/lib/genre-config"

function getMaxSyllables(genre: string): number {
  const genreConfig = (GENRE_CONFIGS as any)[genre]
  if (!genreConfig?.prosody_rules?.syllable_count) return 12

  const syllableCount = genreConfig.prosody_rules.syllable_count
  if ("absolute_max" in syllableCount) return syllableCount.absolute_max as number
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

// ✅ CORRETOR SUPER AGRESSIVO - SEM DUPLICAÇÕES
function aggressivelyFixIncompleteLines(lyrics: string): string {
  console.log("[Corrector] 🚨 INICIANDO CORREÇÃO AGRESSIVA DE VERSOS INCOMPLETOS")
  
  const lines = lyrics.split('\n')
  const fixedLines: string[] = []
  
  // ✅ PADRÕES DE CORREÇÃO - SEM DUPLICAÇÕES
  const completionPatterns: { [key: string]: string } = {
    'diante': 'de Ti',
    'aberto,': 'e grato',
    'vida e': 'pela graça',
    'agradeço': 'pela vida',
    'viver e de': 'amar em Ti',
    'fonte': 'de vida',
    'trazendo': 'renovação',
    'tão': 'puro',
    'criaste': 'o universo',
    'por': 'cada mar',
    'é': 'nosso lar',
    'posso': 'receber',
    'cada': 'momento',
    'que me': 'acolhe',
    'ser': 'amado',
    'quero': 'cantar',
    'Tua': 'presença',
    'em': 'amor',
    'Tu': 'estás aqui',
    'o Teu': 'caminho',
    'que é': 'Teu dom',
    'com': 'Tua criação',
    'de': 'filho Teu',
    'sempre': 'fiel'
  }

  let corrections = 0

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim()
    
    // Ignora tags e metadata
    if (!line || line.startsWith('### [') || line.startsWith('(Instrumentation)') || line.startsWith('(Genre)')) {
      fixedLines.push(line)
      continue
    }

    const cleanLine = line.replace(/\[.*?\]/g, "").replace(/\(.*?\)/g, "").trim()
    const lastWord = cleanLine.split(/\s+/).pop()?.toLowerCase() || ''
    
    // ✅ DETECTA SE É VERSO INCOMPLETO
    const incompleteWords = ['que', 'do', 'por', 'me', 'te', 'em', 'a', 'o', 'de', 'da', 'no', 'na', 'com', 'se', 'tão', 'e', 'diante', 'aberto', 'vida', 'fonte', 'trazendo', 'cada', 'meu', 'Tua', 'sempre']
    const isIncomplete = 
      (lastWord && incompleteWords.includes(lastWord)) ||
      cleanLine.endsWith(',') ||
      cleanLine.endsWith('-') ||
      (cleanLine.split(/\s+/).filter(w => w.length > 0).length < 3)

    if (isIncomplete) {
      console.log(`[Corrector] 🚨 VERSO INCOMPLETO DETECTADO: "${line}"`)
      
      // ✅ CORREÇÃO INTELIGENTE BASEADA NO CONTEXTO
      let fixedLine = line
      
      // Remove pontuação de continuação
      if (fixedLine.endsWith(',') || fixedLine.endsWith('-')) {
        fixedLine = fixedLine.slice(0, -1).trim()
      }
      
      // Aplica completamento baseado no padrão
      if (completionPatterns[lastWord]) {
        fixedLine += ' ' + completionPatterns[lastWord]
      } else {
        // Completamento genérico baseado no contexto
        if (lastWord === 'que') fixedLine += ' Deus me deu'
        else if (lastWord === 'do') fixedLine += ' Senhor'
        else if (lastWord === 'por') fixedLine += ' tudo'
        else if (lastWord === 'me') fixedLine += ' guia'
        else if (lastWord === 'te') fixedLine += ' amo'
        else if (lastWord === 'de') fixedLine += ' amor'
        else if (lastWord === 'meu') fixedLine += ' coração'
        else if (lastWord === 'e') fixedLine += ' graça'
        else fixedLine += ' sempre'
      }
      
      // Garante pontuação final
      if (!fixedLine.endsWith('.') && !fixedLine.endsWith('!') && !fixedLine.endsWith('?')) {
        fixedLine += '.'
      }
      
      console.log(`[Corrector] ✅ CORRIGIDO PARA: "${fixedLine}"`)
      fixedLines.push(fixedLine)
      corrections++
    } else {
      fixedLines.push(line)
    }
  }

  console.log(`[Corrector] 🎉 CORREÇÃO CONCLUÍDA: ${corrections} versos corrigidos`)
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

    console.log(`[API] 🎵 Iniciando reescrita para: ${genre}`)

    const maxSyllables = getMaxSyllables(genre)
    const rhymeRules = getUniversalRhymeRules(genre)
    const genreRules = buildGenreRulesPrompt(genre)

    // ✅ PROMPT ULTRA-EXPLÍCITO
    const prompt = `COMPOSITOR PROFISSIONAL - GÊNERO: ${genre.toUpperCase()}

🚨🚨🚨 INSTRUÇÃO CRÍTICA: VERSOS COMPLETOS OU NÃO ENVIE 🚨🚨🚨

CADA VERSO DEVE SER UMA FRASE COMPLETA E INDEPENDENTE.

🚫 PROIBIDO TERMINAR COM:
que, do, por, me, te, em, a, o, de, da, no, na, com, se, tão, e, diante, aberto, vida, fonte, trazendo, cada, meu, Tua, sempre

✅ EXEMPLOS DE VERSOS COMPLETOS:
"Senhor, hoje estou aqui diante de Ti"
"Com o coração aberto e cheio de gratidão" 
"Agradeço pela vida e por Tua graça"
"Teu amor me renova e me sustenta sempre"

LETRA ORIGINAL (INSPIRAÇÃO):
${originalLyrics}

TEMA: ${theme || "Gratidão divina"}
HUMOR: ${mood || "Reverente e alegre"}

${additionalRequirements ? `REQUISITOS: ${additionalRequirements}` : ""}

TÉCNICA:
- Máximo ${maxSyllables} sílabas por verso
- ${rhymeRules.requirePerfectRhymes ? "Rimas perfeitas" : "Rimas naturais"}
- Linguagem gospel contemporânea

ESTRUTURA:
${
  performanceMode === "performance" 
    ? `### [INTRO] (4 linhas COMPLETAS)
### [VERSE 1] (6 linhas COMPLETAS)  
### [PRE-CHORUS] (4 linhas COMPLETAS)
### [CHORUS] (6 linhas COMPLETAS)
### [VERSE 2] (6 linhas COMPLETAS)
### [CHORUS] (6 linhas COMPLETAS)
### [BRIDGE] (6 linhas COMPLETAS)
### [CHORUS] (6 linhas COMPLETAS)
### [OUTRO] (4 linhas COMPLETAS)`
    : `### [Intro] (4 linhas COMPLETAS)
### [Verso 1] (6 linhas COMPLETAS)
### [Pré-Refrão] (4 linhas COMPLETAS)
### [Refrão] (6 linhas COMPLETAS)
### [Verso 2] (6 linhas COMPLETAS)
### [Refrão] (6 linhas COMPLETAS)
### [Ponte] (6 linhas COMPLETAS)
### [Refrão] (6 linhas COMPLETAS)
### [Outro] (4 linhas COMPLETAS)`
}

SE GERAR VERSO INCOMPLETO, A MÚSICA SERÁ INUTILIZÁVEL.

GERE APENAS VERSOS COMPLETOS:`

    console.log(`[API] 🔄 Solicitando geração da IA...`)

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.7,
    })

    let finalLyrics = capitalizeLines(text)
    console.log("[API] 📝 Resposta bruta da IA recebida")

    // ✅ ETAPA CRÍTICA: CORREÇÃO AGRESSIVA
    console.log("[API] 🚀 Aplicando correção agressiva...")
    finalLyrics = aggressivelyFixIncompleteLines(finalLyrics)

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
    console.log("[API] 📏 Ajustando métrica...")
    const lines = finalLyrics.split("\n")
    const correctedLines: string[] = []
    let syllableCorrections = 0

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("### [") || trimmed.startsWith("(")) {
        correctedLines.push(line)
        continue
      }

      const cleanLine = trimmed.replace(/\[.*?\]/g, "").replace(/\(.*?\)/g, "").trim()
      if (!cleanLine) {
        correctedLines.push(line)
        continue
      }

      const syllables = countPoeticSyllables(cleanLine)
      if (syllables > maxSyllables) {
        const fixed = fixLineToMaxSyllables(trimmed, maxSyllables)
        correctedLines.push(fixed)
        syllableCorrections++
      } else {
        correctedLines.push(line)
      }
    }

    if (syllableCorrections > 0) {
      console.log(`[API] ✅ ${syllableCorrections} ajustes de sílaba aplicados`)
      finalLyrics = correctedLines.join("\n")
    }

    // ✅ FINALIZAÇÃO
    console.log("[API] 📚 Aplicando empilhamento...")
    const stackingResult = LineStacker.stackLines(finalLyrics)
    finalLyrics = stackingResult.stackedLyrics

    console.log("[API] 🎸 Adicionando instrumentação...")
    const instrumentation = formatInstrumentationForAI(genre, finalLyrics)
    finalLyrics = `${finalLyrics}\n\n${instrumentation}`

    const totalLines = finalLyrics.split('\n').filter(line => line.trim().length > 0).length
    console.log(`[API] 🎉 PROCESSO CONCLUÍDO: ${totalLines} linhas`)

    return NextResponse.json({
      success: true,
      lyrics: finalLyrics,
      title: title || `${theme || "Música"} - ${genre}`,
      metadata: {
        genre,
        performanceMode,
        maxSyllables,
        totalLines,
        syllableCorrections,
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
