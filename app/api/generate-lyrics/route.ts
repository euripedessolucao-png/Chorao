import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { getGenreConfig, detectSubGenre, getGenreRhythm } from "@/lib/genre-config"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { validateLyricsSyllables } from "@/lib/validation/syllableUtils"

export async function POST(request: NextRequest) {
  try {
    const {
      genero,
      humor,
      tema,
      criatividade,
      inspiracao,
      metaforas,
      emocoes,
      titulo,
      formattingStyle,
      additionalRequirements,
      metrics,
      advancedMode,
    } = await request.json()

    if (!genero) {
      return NextResponse.json({ error: "Gênero é obrigatório" }, { status: 400 })
    }

    const genreConfig = getGenreConfig(genero)
    const isPerformanceMode = formattingStyle === "performatico"
    const isBachata = genero.toLowerCase().includes("bachata")
    const isSertanejoModerno = genero.toLowerCase().includes("sertanejo moderno")

    const subGenreInfo = detectSubGenre(additionalRequirements)
    const defaultRhythm = getGenreRhythm(genero)
    const finalRhythm = subGenreInfo.rhythm || defaultRhythm

    const prompt = `🎵 Você é um compositor PROFISSIONAL brasileiro especializado em criar HITS de ${genero}.

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
   - (Instrumentos: list | BPM: number | Ritmo: ${finalRhythm} | Estilo: ${genero})

5. REFRÃO GRUDENTO (PRIORIDADE #1):
   - Primeira linha = gancho memorável
   - 4 linhas máximo, 8-10 sílabas cada
   - Simples, direto, fácil de cantar

ESPECIFICAÇÕES:
- TEMA: ${tema || "amor e relacionamento"}
- HUMOR: ${humor || "neutro"}
- CRIATIVIDADE: ${criatividade}/10
${inspiracao ? `- INSPIRAÇÃO: ${inspiracao}` : ""}
${metaforas ? `- METÁFORAS: ${metaforas}` : ""}
${emocoes?.length ? `- EMOÇÕES: ${emocoes.join(", ")}` : ""}
${titulo ? `- TÍTULO: ${titulo}` : ""}
${additionalRequirements ? `\n⚡ REQUISITOS ESPECIAIS:\n${additionalRequirements}` : ""}

Escreva a letra completa AGORA:`

    console.log("[v0] 🎵 Gerando letra...")

    let finalLyrics = ""
    let attempts = 0
    const maxAttempts = 3

    while (attempts < maxAttempts) {
      attempts++
      console.log(`[v0] 🔄 Tentativa ${attempts}/${maxAttempts}`)

      try {
        const { text } = await generateText({
          model: "openai/gpt-4o",
          prompt:
            attempts > 0
              ? `${prompt}\n\n⚠️ ATENÇÃO: Tentativa anterior teve versos >12 sílabas. REGENERE com MÁXIMO 12 sílabas por verso.`
              : prompt,
          temperature: 0.85,
        })

        finalLyrics = text.trim()

        // Remove duplicate titles
        finalLyrics = finalLyrics.replace(/^(?:Título|Title):\s*.+$/gm, "").trim()
        finalLyrics = finalLyrics.replace(/^\*\*(?:Título|Title):\s*.+\*\*$/gm, "").trim()

        // Validate syllables
        const validation = validateLyricsSyllables(finalLyrics, 12)

        if (validation.valid) {
          console.log(`[v0] ✅ Validação passou na tentativa ${attempts}`)
          break
        } else {
          console.log(`[v0] ⚠️ ${validation.linesWithIssues} versos excedem 12 sílabas`)
          validation.violations.forEach((v) => {
            console.log(`[v0]   Linha ${v.line}: "${v.text}" (${v.syllables} sílabas)`)
          })

          if (attempts === maxAttempts) {
            console.log(`[v0] ⚠️ Máximo de tentativas. Retornando melhor resultado.`)
          }
        }
      } catch (error) {
        console.error(`[v0] ❌ Erro na tentativa ${attempts}:`, error)
        if (attempts === maxAttempts) {
          throw error
        }
      }
    }

    // Extract title
    let extractedTitle = titulo || ""
    if (!extractedTitle) {
      const chorusMatch = finalLyrics.match(/\[(?:CHORUS|REFRÃO)[^\]]*\]\s*\n([^\n]+)/i)
      if (chorusMatch?.[1]) {
        extractedTitle = chorusMatch[1].trim().split(" ").slice(0, 4).join(" ")
      }
    }

    if (extractedTitle) {
      finalLyrics = `Título: ${extractedTitle}\n\n${finalLyrics}`
    }

    finalLyrics = capitalizeLines(finalLyrics)

    console.log("[v0] ✅ Letra gerada com sucesso!")

    return NextResponse.json({
      letra: finalLyrics,
      titulo: extractedTitle,
    })
  } catch (error) {
    console.error("[v0] ❌ Erro ao gerar letra:", error)
    return NextResponse.json(
      {
        error: "Erro ao gerar letra",
        details: error instanceof Error ? error.message : "Erro desconhecido",
        suggestion: "Tente novamente ou simplifique os requisitos",
      },
      { status: 500 },
    )
  }
}
