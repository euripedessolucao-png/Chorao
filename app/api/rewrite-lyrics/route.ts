import { generateText } from "ai"
import { NextResponse } from "next/server"
import { BACHATA_BRASILEIRA_2024 } from "@/lib/genres/bachata_brasileira_2024"
import { SERTANEJO_MODERNO_2024 } from "@/lib/genres/sertanejo_moderno_2024"
import { GENRE_CONFIGS, detectSubGenre, getGenreRhythm } from "@/lib/genre-config"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { validateLyricsSyllables } from "@/lib/validation/syllableUtils"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.letraOriginal || body.letraOriginal.trim().length === 0) {
      return NextResponse.json({ error: "Letra original é obrigatória para reescrita" }, { status: 400 })
    }

    if (!body.generoConversao) {
      return NextResponse.json({ error: "Gênero é obrigatório para reescrita" }, { status: 400 })
    }

    const {
      letraOriginal,
      generoConversao,
      conservarImagens,
      polirSemMexer,
      metrics,
      formattingStyle,
      additionalRequirements,
      advancedMode,
    } = body

    const genreLower = generoConversao.toLowerCase()
    const isBachata = genreLower.includes("bachata")
    const isSertanejoRaiz = genreLower.includes("sertanejo raiz") || genreLower.includes("sertanejo-raiz")
    const isSertanejoModerno = genreLower.includes("sertanejo") && !isSertanejoRaiz
    const isSertanejo = isSertanejoRaiz || isSertanejoModerno

    const subGenreInfo = detectSubGenre(additionalRequirements)
    const defaultRhythm = getGenreRhythm(generoConversao)
    const finalRhythm = subGenreInfo.rhythm || defaultRhythm

    let genreConfig
    if (isBachata) {
      genreConfig = BACHATA_BRASILEIRA_2024
    } else if (isSertanejoRaiz) {
      genreConfig = GENRE_CONFIGS["Sertanejo Raiz"]
    } else if (isSertanejoModerno) {
      genreConfig = SERTANEJO_MODERNO_2024
    } else {
      genreConfig = GENRE_CONFIGS[generoConversao as keyof typeof GENRE_CONFIGS]
    }

    console.log(`[v0] 🎵 Reescrevendo para: ${generoConversao}`)

    const instrumentMatch = letraOriginal.match(/\(Instruments?:\s*\[([^\]]+)\]/i)
    const originalInstruments = instrumentMatch ? instrumentMatch[1].trim() : null

    const prompt = `🎵 Você é um compositor PROFISSIONAL brasileiro especializado em ${generoConversao}.

⚠️ TAREFA: REESCREVER A LETRA ABAIXO (NÃO CRIAR UMA NOVA!)
- Mantenha a MESMA HISTÓRIA e TEMA
- Mantenha a MESMA ESTRUTURA NARRATIVA
- APENAS melhore para padrões de HIT 2024-2025

LETRA ORIGINAL:
${letraOriginal}

⚠️ REGRAS UNIVERSAIS ABSOLUTAS:

1. IDIOMA:
   - LETRAS: 100% português brasileiro coloquial
   - INSTRUÇÕES: 100% inglês dentro de [colchetes]
   - BACKING VOCALS: (Backing: "texto") em parênteses
   - INSTRUMENTOS: inglês na linha final

2. FORMATO LIMPO:
   - [SECTION - Performance instructions in English]
   - Letra em português (sem colchetes)
   - Um verso por linha (empilhado)
   - (Backing: "text") quando necessário

3. LIMITE DE 12 SÍLABAS (INVIOLÁVEL):
   - MÁXIMO ABSOLUTO: 12 sílabas poéticas por verso
   - Use contrações: você→cê, está→tá, para→pra
   - Frases completas sempre

4. ESTRUTURA ${isSertanejoModerno ? "A, B, C" : "PADRÃO"} (3:00-3:30):
   - [INTRO - Instructions, (8-12 SECONDS)]
   - [VERSE 1${isSertanejoModerno ? " - A" : ""} - Instructions] (4-8 linhas)
   - [PRE-CHORUS - Instructions] (2-4 linhas)
   - [CHORUS${isSertanejoModerno ? " - B" : ""} - Instructions] (4 linhas)
   - [VERSE 2${isSertanejoModerno ? " - A" : ""} - Instructions] (4-8 linhas)
   - [PRE-CHORUS - Instructions]
   - [CHORUS${isSertanejoModerno ? " - B" : ""} - Instructions]
   - [BRIDGE${isSertanejoModerno ? " - C" : ""} - Instructions] (4-6 linhas)
   - [SOLO - Instrument, (8-16 SECONDS)]
   - [FINAL CHORUS${isSertanejoModerno ? " - B" : ""} - Instructions]
   - [OUTRO - Instructions] (2-4 linhas)
   - (Instrumentos: list | BPM: number | Ritmo: ${finalRhythm} | Estilo: ${generoConversao})

5. REFRÃO GRUDENTO (PRIORIDADE #1):
   - Primeira linha = gancho memorável
   - 4 linhas máximo, 8-10 sílabas cada
   - Simples, direto, fácil de cantar

INSTRUÇÕES DE REESCRITA:
${conservarImagens ? "- CONSERVE as imagens e metáforas EXATAMENTE" : "- MELHORE as imagens mantendo o tema"}
${polirSemMexer ? "- MANTENHA a estrutura, apenas aprimorando" : "- ADAPTE para estrutura de HIT"}
- Preserve a mensagem emocional central
- Mantenha personagens e situações
- MÁXIMO 12 SÍLABAS POR VERSO (ABSOLUTO)
- LINGUAGEM COLOQUIAL BRASILEIRA intensa
${additionalRequirements ? `\n⚡ REQUISITOS ESPECIAIS:\n${additionalRequirements}` : ""}

Reescreva a letra AGORA:`

    console.log("[v0] 🔄 Iniciando reescrita...")

    let finalLyrics = ""
    let attempt = 0
    const maxAttempts = 3

    while (attempt < maxAttempts) {
      attempt++
      console.log(`[v0] 🔄 Tentativa ${attempt}/${maxAttempts}`)

      try {
        const { text } = await generateText({
          model: "openai/gpt-4o",
          prompt:
            attempt > 0
              ? `${prompt}\n\n⚠️ ATENÇÃO: Tentativa anterior teve versos >12 sílabas. REGENERE com MÁXIMO 12 sílabas por verso.`
              : prompt,
          temperature: 0.8,
        })

        let lyrics = text.trim()

        // Remove duplicate titles
        lyrics = lyrics.replace(/^(?:Título|Title):\s*.+$/gm, "").trim()
        lyrics = lyrics.replace(/^\*\*(?:Título|Title):\s*.+\*\*$/gm, "").trim()

        // Validate syllables
        const validation = validateLyricsSyllables(lyrics, 12)

        if (validation.valid) {
          console.log(`[v0] ✅ Validação passou na tentativa ${attempt}`)
          finalLyrics = lyrics
          break
        } else {
          console.log(`[v0] ⚠️ ${validation.linesWithIssues} versos excedem 12 sílabas`)
          validation.violations.forEach((v) => {
            console.log(`[v0]   Linha ${v.line}: "${v.text}" (${v.syllables} sílabas)`)
          })

          if (attempt === maxAttempts) {
            console.log(`[v0] ⚠️ Máximo de tentativas. Retornando melhor resultado.`)
            finalLyrics = lyrics
          }
        }
      } catch (error) {
        console.error(`[v0] ❌ Erro na tentativa ${attempt}:`, error)
        if (attempt === maxAttempts) {
          throw error
        }
      }
    }

    // Add instruments if missing
    if (!finalLyrics.includes("(Instrumentos:")) {
      const instrumentList = `(Instrumentos: ${subGenreInfo.instruments || originalInstruments || "guitar, bass, drums, keyboard"} | BPM: ${subGenreInfo.bpm || metrics?.bpm || 100} | Ritmo: ${finalRhythm} | Estilo: ${generoConversao})`
      finalLyrics = finalLyrics.trim() + "\n\n" + instrumentList
    }

    finalLyrics = capitalizeLines(finalLyrics)

    console.log("[v0] ✅ Reescrita concluída!")

    return NextResponse.json({
      letra: finalLyrics,
    })
  } catch (error) {
    console.error("[v0] ❌ Erro ao reescrever letra:", error)

    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"

    return NextResponse.json(
      {
        error: "Erro ao reescrever letra",
        details: errorMessage,
        suggestion: "Tente novamente ou simplifique a letra original",
      },
      { status: 500 },
    )
  }
}
