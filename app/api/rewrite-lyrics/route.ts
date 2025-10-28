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
  return 12
}

// ✅ CORRETOR ULTRA-EFETIVO - VERSÃO FINAL
function ultraFixIncompleteLines(lyrics: string): string {
  console.log("[UltraCorrector] 🚀 INICIANDO CORREÇÃO ULTRA-EFETIVA")
  
  const lines = lyrics.split('\n')
  const fixedLines: string[] = []
  
  let corrections = 0

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim()
    
    // Ignora tags e metadata
    if (!line || line.startsWith('### [') || line.startsWith('(Instrumentation)') || line.startsWith('(Genre)')) {
      fixedLines.push(line)
      continue
    }

    // Remove aspas se existirem
    line = line.replace(/^"|"$/g, '').trim()
    
    const cleanLine = line.replace(/\[.*?\]/g, "").replace(/\(.*?\)/g, "").trim()
    if (!cleanLine) {
      fixedLines.push(line)
      continue
    }

    const lastWord = cleanLine.split(/\s+/).pop()?.toLowerCase() || ''
    const words = cleanLine.split(/\s+/).filter(w => w.length > 0)
    
    // ✅ DETECTA VERSOS INCOMPLETOS COM MAIS PRECISÃO
    const isIncomplete = 
      (lastWord && ['que', 'do', 'por', 'me', 'te', 'em', 'a', 'o', 'de', 'da', 'no', 'na', 'com', 'se', 'tão', 'e', 'diante', 'aberto', 'vida', 'fonte', 'trazendo', 'cada', 'meu', 'Tua', 'sempre', 'lindo', 'fluindo', 'canção', 'sou', 'passou', 'luta', 'mão', 'razão', 'lar', 'caminho', 'essência', 'alma', 'força', 'lição', 'luz', 'paz', 'hino'].includes(lastWord)) ||
      cleanLine.endsWith(',') ||
      cleanLine.endsWith('-') ||
      words.length < 3

    if (isIncomplete) {
      console.log(`[UltraCorrector] 🚨 VERSO INCOMPLETO: "${cleanLine}"`)
      
      let fixedLine = line
      
      // Remove pontuação problemática
      if (fixedLine.endsWith(',') || fixedLine.endsWith('-')) {
        fixedLine = fixedLine.slice(0, -1).trim()
      }

      // ✅ CORREÇÕES ESPECÍFICAS BASEADAS NOS PADRÕES IDENTIFICADOS
      if (lastWord === 'rosto') fixedLine += ' iluminado'
      else if (lastWord === 'caminho') fixedLine += ' da vida'
      else if (lastWord === 'dom') fixedLine += ' divino'
      else if (lastWord === 'alma') fixedLine += ' se renova'
      else if (lastWord === 'essência') fixedLine += ' divina'
      else if (lastWord === 'lindo') fixedLine += ' ao meu redor'
      else if (lastWord === 'fluindo') fixedLine += ' em mim'
      else if (lastWord === 'canção') fixedLine += ' da vida'
      else if (lastWord === 'sou') fixedLine += ' hoje'
      else if (lastWord === 'passou') fixedLine += ' até aqui'
      else if (lastWord === 'luta') fixedLine += ' que enfrento'
      else if (lastWord === 'mão') fixedLine += ' amiga'
      else if (lastWord === 'razão') fixedLine += ' do meu viver'
      else if (lastWord === 'lar') fixedLine += ' eterno'
      else if (lastWord === 'lição') fixedLine += ' aprendida'
      else if (lastWord === 'luz') fixedLine += ' divina'
      else if (lastWord === 'paz') fixedLine += ' infinita'
      else if (lastWord === 'hino') fixedLine += ' de louvor'
      else if (lastWord === 'força') fixedLine += ' que me sustenta'
      else {
        // Completamento genérico inteligente
        fixedLine += ' que recebo de Ti'
      }
      
      // Garante pontuação final adequada
      if (!fixedLine.endsWith('.') && !fixedLine.endsWith('!') && !fixedLine.endsWith('?') && !fixedLine.endsWith('"')) {
        fixedLine += '.'
      }
      
      // Restaura aspas se necessário
      if (lines[i].trim().startsWith('"')) {
        fixedLine = `"${fixedLine}"`
      }
      
      console.log(`[UltraCorrector] ✅ CORRIGIDO: "${fixedLine}"`)
      fixedLines.push(fixedLine)
      corrections++
    } else {
      fixedLines.push(line)
    }
  }

  console.log(`[UltraCorrector] 🎉 CORREÇÃO CONCLUÍDA: ${corrections} versos corrigidos`)
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

    console.log(`[API] 🎵 Iniciando reescrita ULTRA para: ${genre}`)

    const maxSyllables = getMaxSyllables(genre)
    const rhymeRules = getUniversalRhymeRules(genre)
    const genreRules = buildGenreRulesPrompt(genre)

    // ✅ PROMPT HIPER-EXPLÍCITO
    const prompt = `COMPOSITOR ULTRA-PROFISSIONAL - ${genre.toUpperCase()}

🔥🔥🔥 INSTRUÇÃO ULTRA-CRÍTICA: VERSOS 100% COMPLETOS 🔥🔥🔥

CADA VERSO DEVE SER UMA FRASE COMPLETA E INDEPENDENTE.

🚫🚫🚫 PROIBIDO ABSOLUTAMENTE TERMINAR COM:
rosto, caminho, dom, alma, essência, lindo, fluindo, canção, sou, passou, luta, mão, razão, lar, lição, luz, paz, hino, força, que, do, por, me, te, em, a, o, de, da, no, na, com, se, tão, e

✅✅✅ EXEMPLOS DE VERSOS COMPLETOS OBRIGATÓRIOS:
"Hoje eu acordo com um sorriso no rosto iluminado"
"Os raios do sol iluminam meu caminho abençoado" 
"Com o coração cheio de gratidão e amor"
"Vivo cada momento como um dom divino"

LETRA ORIGINAL:
${originalLyrics}

TEMA: ${theme || "Gratidão divina"}
HUMOR: ${mood || "Reverente e alegre"}

${additionalRequirements ? `REQUISITOS: ${additionalRequirements}` : ""}

TÉCNICA ULTRA-RIGOROSA:
- Máximo ${maxSyllables} sílabas por verso
- ${rhymeRules.requirePerfectRhymes ? "Rimas perfeitas obrigatórias" : "Rimas naturais"}
- Linguagem apropriada para ${genre}
- VERSOS COMPLETOS OU NÃO ENVIE

ESTRUTURA PERFEITA:
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

⚠️⚠️⚠️ SE UM ÚNICO VERSO ESTIVER INCOMPLETO, A MÚSICA SERÁ REJEITADA.

GERE APENAS VERSOS 100% COMPLETOS E PERFEITOS:`

    console.log(`[API] 🔄 Solicitando geração ULTRA da IA...`)

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.7,
    })

    let finalLyrics = capitalizeLines(text)
    console.log("[API] 📝 Resposta bruta recebida")

    // ✅ ETAPA ULTRA-CRÍTICA: CORREÇÃO DEFINITIVA
    console.log("[API] 🚀 Aplicando correção ULTRA-EFETIVA...")
    finalLyrics = ultraFixIncompleteLines(finalLyrics)

    // ✅ LIMPEZA FINAL
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

    // ✅ CORREÇÃO DE SÍLABAS ULTRA-PRECISA
    console.log("[API] 📏 Ajustando métrica ultra-precisamente...")
    const lines = finalLyrics.split("\n")
    const correctedLines: string[] = []
    let syllableCorrections = 0

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("### [") || trimmed.startsWith("(")) {
        correctedLines.push(line)
        continue
      }

      const cleanLine = trimmed.replace(/\[.*?\]/g, "").replace(/\(.*?\)/g, "").replace(/^"|"$/g, '').trim()
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

    // ✅ FINALIZAÇÃO ULTRA
    console.log("[API] 📚 Aplicando empilhamento profissional...")
    const stackingResult = LineStacker.stackLines(finalLyrics)
    finalLyrics = stackingResult.stackedLyrics

    console.log("[API] 🎸 Adicionando instrumentação...")
    const instrumentation = formatInstrumentationForAI(genre, finalLyrics)
    finalLyrics = `${finalLyrics}\n\n${instrumentation}`

    const totalLines = finalLyrics.split('\n').filter(line => line.trim().length > 0).length
    console.log(`[API] 🎉 PROCESSO ULTRA CONCLUÍDO: ${totalLines} linhas PERFEITAS`)

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
        quality: "ULTRA_PROCESSED"
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
