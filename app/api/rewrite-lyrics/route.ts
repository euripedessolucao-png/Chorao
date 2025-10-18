import { generateText } from "ai"
import { NextResponse } from "next/server"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { SyllableEnforcer } from "@/lib/validation/syllableEnforcer"
import { LineStacker } from "@/lib/utils/line-stacker"
import { MetaComposer } from "@/lib/orchestrator/meta-composer"

// ✅ FUNÇÃO AUXILIAR PARA VALIDAR JSON
async function safeJsonParse(request: Request) {
  try {
    const text = await request.text()
    console.log("[API] Raw body received:", text.substring(0, 200))

    if (!text || text.trim() === "") {
      throw new Error("Body vazio")
    }

    const parsed = JSON.parse(text)
    console.log("[API] JSON parseado com sucesso")
    return parsed
  } catch (error) {
    console.error("[API] ERRO no parse do JSON:", error)
    throw new Error("JSON inválido no corpo da requisição")
  }
}

// ✅ CONFIGURAÇÃO UNIVERSAL DE QUALIDADE POR GÊNERO
const GENRE_QUALITY_CONFIG = {
  Sertanejo: { min: 9, max: 11, ideal: 10, rhymeQuality: 0.5 },
  "Sertanejo Moderno": { min: 9, max: 11, ideal: 10, rhymeQuality: 0.5 },
  "Sertanejo Universitário": { min: 9, max: 11, ideal: 10, rhymeQuality: 0.5 },
  "Sertanejo Sofrência": { min: 9, max: 11, ideal: 10, rhymeQuality: 0.5 },
  "Sertanejo Raiz": { min: 9, max: 11, ideal: 10, rhymeQuality: 0.5 },
  MPB: { min: 7, max: 12, ideal: 9, rhymeQuality: 0.6 },
  "Bossa Nova": { min: 7, max: 12, ideal: 9, rhymeQuality: 0.6 },
  Funk: { min: 6, max: 10, ideal: 8, rhymeQuality: 0.3 },
  Pagode: { min: 7, max: 11, ideal: 9, rhymeQuality: 0.4 },
  Samba: { min: 7, max: 11, ideal: 9, rhymeQuality: 0.4 },
  Forró: { min: 8, max: 11, ideal: 9, rhymeQuality: 0.4 },
  Axé: { min: 6, max: 10, ideal: 8, rhymeQuality: 0.3 },
  Rock: { min: 7, max: 11, ideal: 9, rhymeQuality: 0.4 },
  Pop: { min: 7, max: 11, ideal: 9, rhymeQuality: 0.4 },
  Gospel: { min: 8, max: 11, ideal: 9, rhymeQuality: 0.5 },
  default: { min: 7, max: 11, ideal: 9, rhymeQuality: 0.4 },
}

// ✅ FUNÇÕES AUXILIARES
function extractChorusesFromInstructions(instructions?: string): string[] | null {
  if (!instructions) return null

  const chorusMatches = instructions.match(/refr[ãa]o[:\s]*([^.]+)/gi)
  if (!chorusMatches) return null

  const choruses: string[] = []

  chorusMatches.forEach((match) => {
    const chorusText = match.replace(/refr[ãa]o[:\s]*/gi, "").trim()
    if (chorusText && chorusText.length > 10) {
      choruses.push(chorusText)
    }
  })

  return choruses.length > 0 ? choruses : null
}

function extractThemeFromInput(tema: string, inspiracao?: string): string {
  if (tema.toLowerCase().includes("amor") || tema.toLowerCase().includes("coração")) return "Amor"
  if (tema.toLowerCase().includes("saudade") || tema.toLowerCase().includes("nostalgia")) return "Saudade"
  if (tema.toLowerCase().includes("festa") || tema.toLowerCase().includes("celebração")) return "Festa"
  if (tema.toLowerCase().includes("vida") || tema.toLowerCase().includes("caminho")) return "Vida"
  if (inspiracao?.toLowerCase().includes("amor")) return "Amor"
  return tema
}

function extractMoodFromInput(humor?: string, emocoes?: string[]): string {
  if (humor) {
    if (humor.toLowerCase().includes("triste") || humor.toLowerCase().includes("melancólico")) return "Melancólico"
    if (humor.toLowerCase().includes("alegre") || humor.toLowerCase().includes("feliz")) return "Alegre"
    if (humor.toLowerCase().includes("romântico") || humor.toLowerCase().includes("paixão")) return "Romântico"
    if (humor.toLowerCase().includes("raiva") || humor.toLowerCase().includes("intenso")) return "Intenso"
  }

  if (emocoes && emocoes.length > 0) {
    if (emocoes.some((e) => e.toLowerCase().includes("triste"))) return "Melancólico"
    if (emocoes.some((e) => e.toLowerCase().includes("alegre"))) return "Alegre"
    if (emocoes.some((e) => e.toLowerCase().includes("amor"))) return "Romântico"
  }

  return "Romântico"
}

// ✅ FUNÇÃO PARA NORMALIZAR CRIATIVIDADE
function normalizeCreativity(criatividade: string): "equilibrado" | "conservador" | "ousado" {
  if (criatividade === "conservador") return "conservador"
  if (criatividade === "ousado") return "ousado"
  return "equilibrado"
}

function applyFinalFormatting(lyrics: string, genero: string, metrics?: any): string {
  let formattedLyrics = lyrics

  if (!formattedLyrics.includes("(Instrumentos:")) {
    const instrumentList = `(Instrumentos: guitar, bass, drums, keyboard | BPM: ${metrics?.bpm || 100} | Ritmo: ${genero} | Estilo: ${genero})`
    formattedLyrics = formattedLyrics.trim() + "\n\n" + instrumentList
  }

  formattedLyrics = capitalizeLines(formattedLyrics)
  return formattedLyrics
}

// ✅ OBTÉM CONFIGURAÇÃO DE SÍLABAS POR GÊNERO
function getSyllableConfig(genero: string) {
  return GENRE_QUALITY_CONFIG[genero as keyof typeof GENRE_QUALITY_CONFIG] || GENRE_QUALITY_CONFIG.default
}

// ✅ FUNÇÃO PARA REWRITE COM REFRÕES PRESERVADOS USANDO META-COMPOSER
async function rewriteWithPreservedChoruses(
  letraOriginal: string,
  extractedChoruses: string[],
  genero: string,
  tema: string,
  humor: string,
  syllableTarget: any,
  universalPolish: boolean,
  additionalRequirements?: string,
): Promise<string> {
  console.log(`[RewritePreserved] Reescrita com ${extractedChoruses.length} refrões preservados`)

  const compositionRequest = {
    genre: genero,
    theme: extractThemeFromInput(tema),
    mood: extractMoodFromInput(humor),
    additionalRequirements: additionalRequirements || "",
    syllableTarget: syllableTarget,
    applyFinalPolish: universalPolish,
    preserveRhymes: true,
    applyTerceiraVia: true,
    preservedChoruses: extractedChoruses,
    originalLyrics: letraOriginal,
  }

  try {
    const result = await MetaComposer.compose(compositionRequest)

    console.log(`[RewritePreserved] Reescrita concluída - Score: ${result.metadata.finalScore.toFixed(2)}`)
    if (result.metadata.preservedChorusesUsed) {
      console.log(`[RewritePreserved] ✅ ${extractedChoruses.length} refrões preservados aplicados`)
    }

    return result.lyrics
  } catch (error) {
    console.error("[RewritePreserved] Erro no MetaComposer, usando fallback:", error)
    return await rewriteNormally(
      letraOriginal,
      genero,
      humor,
      tema,
      "equilibrado",
      undefined,
      undefined,
      [],
      additionalRequirements,
      universalPolish,
      syllableTarget,
    )
  }
}

// ✅ FUNÇÃO DE REWRITE NORMAL
async function rewriteNormally(
  letraOriginal: string,
  genero: string,
  humor: string,
  tema: string,
  criatividade: string,
  inspiracao?: string,
  metaforas?: string,
  emocoes: string[] = [],
  additionalRequirements?: string,
  universalPolish = true,
  syllableTarget = getSyllableConfig(genero),
  metrics = { bpm: 100, structure: "VERSO-REFRAO" },
): Promise<string> {
  console.log(`[RewriteNormally] Reescrita para: ${genero} - ${tema}`)
  console.log(
    `[RewriteNormally] Configuração sílabas: ${syllableTarget.min}-${syllableTarget.max} (ideal: ${syllableTarget.ideal})`,
  )

  if (universalPolish) {
    console.log(`[RewriteNormally] 🎵 Usando MetaComposer para polimento universal`)

    const compositionRequest = {
      genre: genero,
      theme: extractThemeFromInput(tema, inspiracao),
      mood: extractMoodFromInput(humor, emocoes),
      additionalRequirements: additionalRequirements || "",
      syllableTarget: syllableTarget,
      applyFinalPolish: true,
      preserveRhymes: true,
      applyTerceiraVia: true,
      originalLyrics: letraOriginal,
      creativity: normalizeCreativity(criatividade),
    }

    try {
      const result = await MetaComposer.compose(compositionRequest)
      console.log(`[RewriteNormally] MetaComposer finalizado - Score: ${result.metadata.finalScore.toFixed(2)}`)
      return result.lyrics
    } catch (error) {
      console.error("[RewriteNormally] Erro no MetaComposer, continuando com reescrita normal:", error)
    }
  }

  const temperature = criatividade === "conservador" ? 0.5 : criatividade === "ousado" ? 0.9 : 0.7

  const emotionsText = emocoes.length > 0 ? `Emoções: ${emocoes.join(", ")}` : ""
  const inspirationText = inspiracao ? `Inspiração: ${inspiracao}` : ""
  const metaphorsText = metaforas ? `Metáforas relacionadas: ${metaforas}` : ""

  const prompt = `You are a professional Brazilian music composer specializing in ${genero}.

TASK: Rewrite and improve the following song lyrics based on the theme and requirements below.

ORIGINAL LYRICS:
${letraOriginal}

THEME: ${tema}
MOOD: ${humor || "varies with the story"}
${emotionsText}
${inspirationText}
${metaphorsText}

UNIVERSAL RULES:

1. LANGUAGE:
   - Sung lyrics: Brazilian Portuguese (colloquial)
   - Performance instructions: English in [brackets]
   - Backing vocals: (Backing: "text") in parentheses
   - Instruments: English in final line

2. CLEAN FORMAT:
   - [SECTION - Performance instructions in English]
   - Lyrics in Portuguese (no brackets)
   - One verse per line (stacked)
   - (Backing: "text") when needed

3. SYLLABLE LIMIT (${syllableTarget.max} maximum):
   - Maximum ${syllableTarget.max} poetic syllables per verse
   - Minimum ${syllableTarget.min} poetic syllables per verse  
   - Ideal ${syllableTarget.ideal} poetic syllables
   - Use contractions: você→cê, está→tá, para→pra
   - Complete phrases always

4. MAINTAIN STRUCTURE:
   - Keep the original song structure
   - Improve lyrics quality and flow
   - Enhance rhymes and poetic elements

CREATIVITY LEVEL: ${criatividade}
${additionalRequirements ? `\nSPECIAL REQUIREMENTS:\n${additionalRequirements}` : ""}

Rewrite and improve the song now:`

  console.log("[RewriteNormally] Iniciando reescrita com GPT...")

  const { text } = await generateText({
    model: "openai/gpt-4o",
    prompt,
    temperature,
  })

  let lyrics = text.trim()
  lyrics = lyrics.replace(/^(?:Título|Title):\s*.+$/gm, "").trim()
  lyrics = lyrics.replace(/^\*\*(?:Título|Title):\s*.+\*\*$/gm, "").trim()

  console.log(`[RewriteNormally] Aplicando imposição rigorosa de sílabas...`)
  const enforcedResult = await SyllableEnforcer.enforceSyllableLimits(lyrics, syllableTarget, genero)

  if (enforcedResult.corrections > 0) {
    console.log(`[RewriteNormally] ${enforcedResult.corrections} linhas corrigidas automaticamente`)
    lyrics = enforcedResult.correctedLyrics
  }

  console.log("[RewriteNormally] Aplicando empilhamento profissional...")
  const stackingResult = LineStacker.stackLines(lyrics)
  lyrics = stackingResult.stackedLyrics

  return lyrics
}

function extractTitleFromLyrics(lyrics: string): string {
  const titleMatch = lyrics.match(/^Titulo:\s*(.+)$/m)
  if (titleMatch?.[1]) return titleMatch[1].trim()

  const chorusMatch = lyrics.match(/\[(?:CHORUS|REFRÃO)[^\]]*\]\s*\n([^\n]+)/i)
  if (chorusMatch?.[1]) {
    return chorusMatch[1].trim().split(" ").slice(0, 4).join(" ")
  }

  return "Música Reescrita"
}

// ✅ ROTA PRINCIPAL COM TRATAMENTO ROBUSTO DE JSON
export async function POST(request: Request) {
  console.log("[API] === INICIANDO REQUISIÇÃO REWRITE-LYRICS ===")

  let body: any = {}

  try {
    // ✅ TENTA PARSEAR O JSON DE FORMA SEGURA
    body = await safeJsonParse(request)

    console.log("[API] ✅ JSON parseado com sucesso")
    console.log("[API] Campos recebidos:", Object.keys(body))
  } catch (error) {
    console.error("[API] ❌ ERRO CRÍTICO: Falha no parse do JSON")

    // ✅ RESPOSTA DE ERRO DETALHADA
    return NextResponse.json(
      {
        error: "JSON inválido",
        details: "O corpo da requisição não contém JSON válido",
        suggestion: "Verifique se está enviando application/json e um JSON válido",
      },
      {
        status: 400,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      },
    )
  }

  try {
    const {
      letraOriginal,
      genero,
      generoConversao,
      humor,
      tema,
      criatividade = "equilibrado",
      inspiracao,
      metaforas,
      emocoes = [],
      titulo,
      formattingStyle = "performatico",
      additionalRequirements,
      advancedMode = false,
      universalPolish = true,
      syllableTarget,
      metrics = { bpm: 100, structure: "VERSO-REFRAO" },
      selectedChoruses,
    } = body

    // ✅ DEBUG DETALHADO
    console.log("[API] === DEBUG DETALHADO ===")
    console.log("[API] genero recebido:", genero)
    console.log("[API] generoConversao recebido:", generoConversao)
    console.log("[API] finalGenero usado:", genero || generoConversao || "Sertanejo")
    console.log("[API] letraOriginal (primeiros 100 chars):", letraOriginal?.substring(0, 100))

    // ✅ CORREÇÃO: Usa qualquer um dos dois campos de gênero
    const finalGenero = genero || generoConversao || "Sertanejo"

    // ✅ VALIDAÇÕES ROBUSTAS
    if (!letraOriginal || letraOriginal.trim() === "") {
      console.log("[API] ERRO: Letra original vazia")
      return NextResponse.json(
        {
          error: "Letra original é obrigatória",
          received: letraOriginal,
          suggestion: "Cole a letra original antes de reescrever",
        },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        },
      )
    }

    if (
      !finalGenero ||
      finalGenero.trim() === "" ||
      finalGenero === "undefined" ||
      finalGenero === "null" ||
      finalGenero === "Selecione um gênero"
    ) {
      console.log("[API] ERRO: Gênero inválido:", finalGenero)
      return NextResponse.json(
        {
          error: "Gênero é obrigatório",
          receivedGenero: genero,
          receivedGeneroConversao: generoConversao,
          finalGenero: finalGenero,
          suggestion: "Selecione um gênero válido antes de reescrever",
        },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        },
      )
    }

    console.log("[API] ✅ Dados validados com sucesso")
    console.log(`[API] Processando reescrita para: ${finalGenero}`)

    // ✅ CONTINUA com o processamento normal...
    const autoSyllableConfig = getSyllableConfig(finalGenero)
    const finalSyllableTarget = syllableTarget || autoSyllableConfig

    console.log(`[Rewrite] Processando: ${finalGenero} - ${tema}`)
    console.log(
      `[Rewrite] Configuração ${finalGenero}: ${finalSyllableTarget.min}-${finalSyllableTarget.max}s (ideal: ${finalSyllableTarget.ideal}s)`,
    )
    console.log(`[Rewrite] Polimento Universal: ${universalPolish ? "ATIVO" : "INATIVO"}`)

    const extractedChoruses = selectedChoruses || extractChorusesFromInstructions(additionalRequirements) || []

    let finalLyrics: string
    let rewriteMode: "preservation" | "universal" | "normal" = "normal"

    try {
      if (extractedChoruses.length > 0) {
        console.log(`[Rewrite] 🎯 Modo preservação ativo: ${extractedChoruses.length} refrões selecionados`)
        rewriteMode = "preservation"

        finalLyrics = await rewriteWithPreservedChoruses(
          letraOriginal,
          extractedChoruses,
          finalGenero,
          tema || "Amor",
          humor || "Romântico",
          finalSyllableTarget,
          universalPolish,
          additionalRequirements,
        )
      } else if (universalPolish) {
        console.log(`[Rewrite] 🎵 Sistema Universal ativo para: ${finalGenero}`)
        rewriteMode = "universal"

        const compositionRequest = {
          genre: finalGenero,
          theme: extractThemeFromInput(tema || "Amor", inspiracao),
          mood: extractMoodFromInput(humor, emocoes),
          additionalRequirements,
          syllableTarget: finalSyllableTarget,
          applyFinalPolish: true,
          creativity: normalizeCreativity(criatividade),
          preserveRhymes: true,
          applyTerceiraVia: true,
          originalLyrics: letraOriginal,
        }

        try {
          const result = await MetaComposer.compose(compositionRequest)
          finalLyrics = result.lyrics

          console.log(`[Rewrite] Sistema Universal finalizado - Score: ${result.metadata.finalScore.toFixed(2)}`)
          if (result.metadata.polishingApplied) {
            console.log(`[Rewrite] ✅ Polimento específico para ${finalGenero} aplicado`)
          }
        } catch (metaComposerError) {
          console.error("[Rewrite] ❌ ERRO no MetaComposer:", metaComposerError)
          console.log("[Rewrite] 🔄 Fallback para reescrita normal...")

          // Fallback para modo normal
          finalLyrics = await rewriteNormally(
            letraOriginal,
            finalGenero,
            humor || "Romântico",
            tema || "Amor",
            criatividade,
            inspiracao,
            metaforas,
            emocoes,
            additionalRequirements,
            false, // Desativa polimento universal no fallback
            finalSyllableTarget,
            metrics,
          )
        }
      } else {
        console.log(`[Rewrite] Modo reescrita normal para: ${finalGenero} - ${tema}`)
        rewriteMode = "normal"

        finalLyrics = await rewriteNormally(
          letraOriginal,
          finalGenero,
          humor || "Romântico",
          tema || "Amor",
          criatividade,
          inspiracao,
          metaforas,
          emocoes,
          additionalRequirements,
          universalPolish,
          finalSyllableTarget,
          metrics,
        )
      }
    } catch (rewriteError) {
      console.error("[API] ❌ ERRO durante reescrita:", rewriteError)

      const errorMessage = rewriteError instanceof Error ? rewriteError.message : "Erro desconhecido durante reescrita"

      return NextResponse.json(
        {
          error: "Erro ao processar reescrita",
          details: errorMessage,
          mode: rewriteMode,
          genre: finalGenero,
          suggestion: "Tente simplificar os requisitos ou usar modo normal",
          step: "processamento_reescrita",
        },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        },
      )
    }

    if (!finalLyrics || finalLyrics.trim() === "") {
      console.error("[API] ❌ ERRO: Letra final vazia após processamento")
      return NextResponse.json(
        {
          error: "Falha ao gerar letra",
          details: "O sistema não conseguiu gerar uma letra válida",
          mode: rewriteMode,
          suggestion: "Tente novamente com uma letra mais simples",
        },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        },
      )
    }

    finalLyrics = applyFinalFormatting(finalLyrics, finalGenero, metrics)

    console.log(`[Rewrite] ✅ Reescrita concluída! Modo: ${rewriteMode}`)

    const responseData = {
      success: true,
      letra: finalLyrics,
      titulo: titulo || extractTitleFromLyrics(finalLyrics),
      metadata: {
        preservedChoruses: extractedChoruses.length,
        rewriteMode: rewriteMode,
        syllableConfig: finalSyllableTarget,
        universalPolish: universalPolish,
        genre: finalGenero,
        timestamp: new Date().toISOString(),
      },
    }

    console.log("[API] 📤 Enviando resposta de sucesso...")

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    })
  } catch (error) {
    console.error("[API] ❌ ERRO INTERNO INESPERADO:", error)

    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
    const errorStack = error instanceof Error ? error.stack : undefined

    console.error("[API] Stack trace:", errorStack)

    return NextResponse.json(
      {
        error: "Erro interno ao reescrever letra",
        details: errorMessage,
        suggestion: "Tente novamente com uma letra mais simples ou entre em contato com o suporte",
        step: "erro_inesperado",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      },
    )
  }
}

// ✅ HANDLE OPTIONS FOR CORS
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
