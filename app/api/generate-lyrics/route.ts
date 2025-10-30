import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { buildGenreRulesPrompt } from "@/lib/validation/genre-rules-builder"
import { getUniversalRhymeRules } from "@/lib/validation/universal-rhyme-rules"
import {
  formatSertanejoPerformance,
  shouldUsePerformanceFormat,
} from "@/lib/formatters/sertanejo-performance-formatter"
import { formatInstrumentationForAI } from "@/lib/normalized-genre"
import { LineStacker } from "@/lib/utils/line-stacker"
import { enhanceLyricsRhymes } from "@/lib/validation/rhyme-enhancer"
import { validateRhymesForGenre } from "@/lib/validation/rhyme-validator"
import { validateSyllablesByGenre } from "@/lib/validation/absolute-syllable-enforcer"
import { enforceSyllableLimitAll } from "@/lib/validation/intelligent-rewriter"

// ✅ CORRETOR SUPER-EFETIVO - DETECÇÃO EXPANDIDA
function superFixIncompleteLines(lyrics: string): string {
  console.log("[SuperCorrector] 🚀 INICIANDO CORREÇÃO SUPER-EFETIVA")

  const lines = lyrics.split("\n")
  const fixedLines: string[] = []

  let corrections = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Ignora tags e metadata
    if (!line || line.startsWith("### [") || line.startsWith("(Instrumentation)") || line.startsWith("(Genre)")) {
      fixedLines.push(line)
      continue
    }

    const cleanLine = line
      .replace(/\[.*?\]/g, "")
      .replace(/$$.*?$$/g, "")
      .replace(/^"|"$/g, "")
      .trim()
    if (!cleanLine) {
      fixedLines.push(line)
      continue
    }

    const words = cleanLine.split(/\s+/).filter((w) => w.length > 0)
    const lastWord = words[words.length - 1]?.toLowerCase() || ""

    // ✅ DETECÇÃO EXPANDIDA - MAIS AGRESSIVA
    const isIncomplete =
      words.length < 3 || // Menos de 3 palavras
      /[,-]$/.test(cleanLine) || // Termina com vírgula ou traço
      /\b(e|a|o|que|com|pra|pro|num|numa|de|da|do|em|no|na|por|me|te|se|um|uma)\s*$/i.test(cleanLine) || // Termina com preposição/artigo
      /^(a|e|o|que|com|pra|de|da|do|em|no|na|por|me|te|se|um|uma)$/i.test(cleanLine) // Apenas uma palavra problemática

    if (isIncomplete && words.length > 0) {
      console.log(`[SuperCorrector] 🚨 VERSO INCOMPLETO: "${cleanLine}"`)

      let fixedLine = line

      // Remove pontuação problemática
      fixedLine = fixedLine.replace(/[,-]\s*$/, "").trim()

      // ✅ COMPLETAMENTOS ESPECÍFICOS PARA OS PADRÕES ENCONTRADOS
      const specificCompletions: Record<string, string> = {
        e: "com amor",
        a: "minha vida",
        que: "Deus me deu",
        com: "muito amor",
        pra: "viver",
        pro: "meu bem",
        me: "ajudar",
        te: "amar",
        se: "entregar",
        um: "presente",
        uma: "bênção",
        no: "coração",
        na: "alma",
        de: "gratidão",
        do: "Senhor",
        da: "minha vida",
        em: "Deus",
        por: "tudo",
        "sinto a": "Tua presença",
        "deixa o": "coração cantar",
        "que sou e": "tudo que tenho",
        "eu quero": "agradecer",
        "sempre a": "Te louvar",
        "me ajuda a": "crescer",
        "que sou com": "Ti",
        "alguém pra": "abençoar",
        "agradar e": "servir",
        "vou me": "entregar",
        "sinto Tua luz e": "Tua graça",
        "sonhar que": "um dia realizarei",
      }

      // Primeiro tenta match exato com a frase
      let matched = false
      for (const [pattern, completion] of Object.entries(specificCompletions)) {
        if (cleanLine.toLowerCase().endsWith(pattern)) {
          fixedLine = fixedLine.slice(0, -pattern.length).trim() + " " + completion
          matched = true
          break
        }
      }

      // Se não encontrou match específico, usa completamento por última palavra
      if (!matched && specificCompletions[lastWord]) {
        fixedLine += " " + specificCompletions[lastWord]
      } else if (!matched) {
        // Completamento genérico inteligente
        const genericCompletions = [
          "com gratidão no coração",
          "e amor infinito",
          "pra sempre Te louvar",
          "com fé e esperança",
          "que renova minha alma",
          "em cada momento",
          "com muita alegria",
        ]
        const randomCompletion = genericCompletions[Math.floor(Math.random() * genericCompletions.length)]
        fixedLine += " " + randomCompletion
      }

      // Garante pontuação final adequada
      if (!/[.!?]$/.test(fixedLine)) {
        fixedLine = fixedLine.replace(/[.,;:]$/, "") + "."
      }

      console.log(`[SuperCorrector] ✅ CORRIGIDO: "${fixedLine}"`)
      fixedLines.push(fixedLine)
      corrections++
    } else {
      fixedLines.push(line)
    }
  }

  console.log(`[SuperCorrector] 🎉 CORREÇÃO CONCLUÍDA: ${corrections} versos corrigidos`)
  return fixedLines.join("\n")
}

export async function POST(request: NextRequest) {
  try {
    const {
      genre,
      mood,
      theme,
      additionalRequirements = "",
      performanceMode = "standard",
      title,
    } = await request.json()

    if (!genre || typeof genre !== "string" || !genre.trim()) {
      return NextResponse.json({ error: "Gênero é obrigatório" }, { status: 400 })
    }
    if (!theme || typeof theme !== "string" || !theme.trim()) {
      return NextResponse.json({ error: "Tema é obrigatório" }, { status: 400 })
    }

    console.log(`[API] 🎵 Criando letra para: ${genre} | Tema: ${theme}`)

    const syllableValidation = validateSyllablesByGenre("", genre)
    const maxSyllables = syllableValidation.maxSyllables

    const rhymeRules = getUniversalRhymeRules(genre)
    const genreRules = buildGenreRulesPrompt(genre)

    const additionalReqsSection = additionalRequirements?.trim()
      ? `
⚠️ REQUISITOS ADICIONAIS (OBRIGATÓRIOS - NÃO PODEM SER IGNORADOS):
${additionalRequirements}

ATENÇÃO CRÍTICA SOBRE HOOKS E REFRÕES ESCOLHIDOS:
- Se houver [HOOK] nos requisitos acima, você DEVE usar esse hook LITERALMENTE na música
- Se houver [CHORUS] ou [REFRÃO] nos requisitos acima, você DEVE usar esse refrão LITERALMENTE como O REFRÃO da música
- NÃO crie um novo refrão se já foi fornecido um - USE O FORNECIDO
- NÃO crie um novo hook se já foi fornecido um - USE O FORNECIDO
- Os VERSOS devem ser escritos para COMPLETAR e CONECTAR com o hook/refrão escolhido
- A letra deve ser construída EM TORNO do hook/refrão fornecido, não ignorá-lo
- Você DEVE seguir TODOS os outros requisitos adicionais acima
- Os requisitos adicionais têm prioridade ABSOLUTA sobre qualquer outra instrução
`
      : ""

    // ✅ PROMPT PERFEITO - ABORDAGEM POSITIVA E CONSTRUTIVA
    const prompt = `COMPOSITOR PROFISSIONAL BRASILEIRO - ${genre.toUpperCase()}

🎯 OBJETIVO PRINCIPAL: Criar VERSOS COMPLETOS e COERENTES

📝 REGRA DE OURO: 
CADA VERSO = FRASE COMPLETA (sujeito + verbo + complemento)

✅ EXEMPLOS DE VERSOS COMPLETOS:
"Hoje eu venho aqui de coração aberto" 
"Com gratidão transbordando em meu peito"
"Teu amor me renova a cada amanhecer"
"A vida é uma bênção que eu agradeço"
"Nos braços de Deus encontro meu abrigo"

🚫 EVITAR VERSOS INCOMPLETOS:
"Coração aberto" ❌ (incompleto)
"De gratidão" ❌ (incompleto) 
"Renovando a cada" ❌ (incompleto)

TEMA: ${theme}
HUMOR: ${mood || "Adaptado ao tema"}
GÊNERO: ${genre}

${additionalReqsSection}

📏 TÉCNICA MUSICAL BRASILEIRA:
- Máximo ${maxSyllables} sílabas por verso
- ${rhymeRules.requirePerfectRhymes ? "Rimas perfeitas" : "Rimas naturais"}
- Linguagem apropriada para ${genre}
- Versos autocontidos e completos
- Emoção genuína e autenticidade

${genreRules.fullPrompt}

🎵 ESTRUTURA SUGERIDA:
${
  performanceMode === "performance"
    ? `### [INTRO] (4 linhas)
### [VERSO 1] (6 linhas)  
### [PRÉ-REFRAO] (4 linhas)
### [REFRAO] (6 linhas)
### [VERSO 2] (6 linhas)
### [REFRAO] (6 linhas)
### [PONTE] (6 linhas)
### [REFRAO] (6 linhas)
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

💡 DICA CRÍTICA: 
Pense em CADA VERSO como uma mini-história completa
Se ficar muito longo, REESCREVA completamente mantendo a mensagem
Mantenha a naturalidade da língua portuguesa brasileira

Gere a letra com VERSOS COMPLETOS e EMOCIONALMENTE IMPACTANTES:`

    console.log(`[API] 🎵 Gerando com limite máximo de ${maxSyllables} sílabas...`)
    if (additionalRequirements) {
      console.log(`[API] ⚠️ REQUISITOS ADICIONAIS OBRIGATÓRIOS DETECTADOS`)
    }

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.85,
      maxOutputTokens: 2500, // Garante resposta completa sem cortes
    })

    let finalLyrics = capitalizeLines(text)

    // ✅ ETAPA CRÍTICA: CORREÇÃO DE VERSOS INCOMPLETOS
    console.log("[API] 🔧 Aplicando correção super-efetiva de versos incompletos...")
    finalLyrics = superFixIncompleteLines(finalLyrics)

    finalLyrics = finalLyrics
      .split("\n")
      .filter(
        (line) =>
          !line.trim().startsWith("Retorne") && !line.trim().startsWith("REGRAS") && !line.includes("Explicação"),
      )
      .join("\n")
      .trim()

    console.log("[API] 🎵 Validando qualidade das rimas...")
    const rhymeValidation = validateRhymesForGenre(finalLyrics, genre)
    if (!rhymeValidation.valid || rhymeValidation.warnings.length > 0) {
      console.log("[API] 🔧 Melhorando rimas automaticamente...")
      const rhymeEnhancement = await enhanceLyricsRhymes(finalLyrics, genre, theme, 0.7)
      if (rhymeEnhancement.improvements.length > 0) {
        console.log(`[API] ✅ ${rhymeEnhancement.improvements.length} rima(s) melhorada(s)`)
        finalLyrics = rhymeEnhancement.enhancedLyrics
      }
    }

    console.log("[API] 🔧 Aplicando sistema de sílabas cantáveis...")
    finalLyrics = await enforceSyllableLimitAll(finalLyrics, maxSyllables)

    console.log("[API] 📚 Empilhando versos...")
    const stackResult = LineStacker.stackLines(finalLyrics)
    if (stackResult.improvements.length > 0) {
      console.log(`[API] ✅ ${stackResult.improvements.length} verso(s) empilhado(s)`)
    }
    finalLyrics = stackResult.stackedLyrics

    if (genre.toLowerCase().includes("raiz")) {
      const forbiddenInstruments = ["electric guitar", "808", "synth", "drum machine", "bateria eletrônica"]
      const lowerLyrics = finalLyrics.toLowerCase()
      if (forbiddenInstruments.some((inst) => lowerLyrics.includes(inst))) {
        finalLyrics = finalLyrics
          .replace(/electric guitar/gi, "acoustic guitar")
          .replace(/808|drum machine|bateria eletrônica/gi, "light percussion")
          .replace(/synth/gi, "sanfona")
      }
    }

    if (shouldUsePerformanceFormat(genre, performanceMode)) {
      console.log("[API] 🎭 Aplicando formatação de performance...")
      finalLyrics = formatSertanejoPerformance(finalLyrics, genre)
    }

    const instrumentation = formatInstrumentationForAI(genre, finalLyrics)
    finalLyrics = `${finalLyrics}\n\n${instrumentation}`

    const finalValidation = validateSyllablesByGenre(finalLyrics, genre)
    const validityRatio = finalValidation.violations.length === 0 ? 1 : 0
    const finalScore = Math.round(validityRatio * 100)

    console.log(`[API] ✅ Validação final: ${finalScore}% dentro da métrica (${genre})`)

    return NextResponse.json({
      lyrics: finalLyrics,
      title: title || `${theme} - ${genre}`,
      meta: {
        finalScore,
        genre,
        performanceMode,
        maxSyllables,
        syllableCorrections: 0,
        syllableViolations: finalValidation.violations.length,
      },
    })
  } catch (error) {
    console.error("[API] ❌ Erro na criação:", error)
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
