import { generateText } from "ai"
import { NextResponse } from "next/server"
import { BACHATA_BRASILEIRA_2024 } from "@/lib/genres/bachata_brasileira_2024"
import { SERTANEJO_MODERNO_2024 } from "@/lib/genres/sertanejo_moderno_2024"
import { GENRE_CONFIGS, detectSubGenre, getGenreRhythm } from "@/lib/genre-config"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"

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
    const isPerformanceMode = formattingStyle === "performatico"

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

    console.log(`[v0] 🎵 Gênero detectado: ${generoConversao}`)
    console.log(`[v0] 🎯 É Sertanejo Raiz? ${isSertanejoRaiz}`)
    console.log(`[v0] 🎯 É Sertanejo Moderno? ${isSertanejoModerno}`)
    console.log(`[v0] 🎵 Ritmo: ${finalRhythm}`)

    const instrumentMatch = letraOriginal.match(/\(Instruments?:\s*\[([^\]]+)\]/i)
    const originalInstruments = instrumentMatch ? instrumentMatch[1].trim() : null

    const universalRulesPrompt = `
🎯 FÓRMULA DE SUCESSO 2024-2025 (REESCRITA)

1. REFRÃO ULTRA-MEMORÁVEL (PRIORIDADE #1)
   - Primeira linha = GANCHO GRUDENTO
   - Máximo 4 linhas, 8-10 sílabas cada
   - Frases simples, diretas, fáceis de cantar junto
   - Repetição estratégica de palavras-chave

2. LINGUAGEM COLOQUIAL BRASILEIRA INTENSA
   - Fale como brasileiro fala na rua
   - Use MUITO: "cê", "tô", "pra", "né", "véio", "mano"
   - Gírias regionais autênticas
   - ZERO vocabulário rebuscado

3. EMOÇÃO AUTÊNTICA > TÉCNICA
   - Sentimento genuíno > rima perfeita
   - História REAL com detalhes concretos
   - Cenas visuais claras
   - Frases completas (NUNCA corte no meio)

4. ESTRUTURA COMERCIAL (3:00-3:30)
   - INTRO (8-12s) → VERSE 1 (8 linhas) → PRE-CHORUS (2-4) → CHORUS (4)
   - VERSE 2 (8) → PRE-CHORUS → CHORUS → BRIDGE (8) → SOLO (8-16s)
   - FINAL CHORUS (4) → OUTRO (4 ou fade)

5. MÉTRICA FLEXÍVEL
   - Alvo: 8-12 sílabas
   - Pode chegar a 13 se frase completa
   - PRIORIDADE: Frase completa > Contagem exata

6. INSTRUÇÕES MUSICAIS DETALHADAS
   - Cada seção tem nota de performance
   - Especifique: vocal, instrumentação, energia
   - Guie o intérprete com precisão
`

    const advancedModeRules = advancedMode
      ? `
🔥 MODO AVANÇADO ATIVADO

- Rimas perfeitas obrigatórias (50% ricas mínimo)
- Métrica rigorosa (máx 12 sílabas ABSOLUTO)
- Ganchos premium (hook na primeira linha)
- Linguagem limpa (adequado para rádio)
- Fidelidade de estilo (100% autêntico)
`
      : ""

    const formatoEstrutura = `
📊 FORMATO DE SAÍDA (3:00-3:30 minutos)

[INTRO] (8-12 segundos)
Instrução: [INTRO - ${subGenreInfo.instruments || "instrumentos principais"}, estabelecendo clima]

[VERSE 1] (8 linhas)
Instrução: [VERSE 1 - Voz narrativa, estabelecendo história com detalhes concretos]
[8 linhas em português]

[PRE-CHORUS] (2-4 linhas)
Instrução: [PRE-CHORUS - Energia crescente, preparando para refrão]
[2-4 linhas em português]

[CHORUS] (4 linhas - MOMENTO MAIS IMPORTANTE)
Instrução: [CHORUS - Energia máxima, grudento, fácil de cantar junto]
[4 linhas em português]

[VERSE 2] (8 linhas)
Instrução: [VERSE 2 - Desenvolve história, novos detalhes]
[8 linhas em português]

[PRE-CHORUS] (2-4 linhas)
Instrução: [PRE-CHORUS - Energia crescente novamente]
[2-4 linhas em português]

[CHORUS] (4 linhas - repete)
Instrução: [CHORUS - Repete com mesma energia]
[4 linhas em português]

[BRIDGE] (8 linhas)
Instrução: [BRIDGE - Reflexão profunda, pode ter solo, mudança de perspectiva]
[8 linhas em português]

[SOLO] (8-16 segundos)
Instrução: [SOLO - Instrumental de ${subGenreInfo.instruments?.split(",")[0] || "guitarra"}]

[FINAL CHORUS] (4 linhas)
Instrução: [FINAL CHORUS - Energia MÁXIMA, apoteose]
[4 linhas em português]

[OUTRO] (4 linhas ou fade)
Instrução: [OUTRO - Fade out suave ou frase final marcante]
[4 linhas em português ou fade]

(Instrumentos: [${subGenreInfo.instruments || originalInstruments || "guitar, bass, drums, keyboard"}] | BPM: ${subGenreInfo.bpm || metrics?.bpm || 100} | Ritmo: ${finalRhythm} | Estilo: ${generoConversao})
`

    const prompt = `${universalRulesPrompt}
${advancedModeRules}

🎵 Você é um compositor PROFISSIONAL especializado em criar HITS de ${generoConversao}.

⚠️ TAREFA: REESCREVER A LETRA ABAIXO (NÃO CRIAR UMA NOVA!)
- Mantenha a MESMA HISTÓRIA e TEMA CENTRAL
- Mantenha a MESMA ESTRUTURA NARRATIVA
- Mantenha os MESMOS PERSONAGENS e SITUAÇÕES
- APENAS melhore para padrões de HIT 2024-2025

LETRA ORIGINAL PARA REESCREVER:
${letraOriginal}

INSTRUÇÕES DE REESCRITA:
${conservarImagens ? "- CONSERVE as imagens e metáforas originais EXATAMENTE" : "- MELHORE as imagens mantendo o tema"}
${polirSemMexer ? "- MANTENHA a estrutura original, apenas aprimorando" : "- ADAPTE para estrutura de HIT (3:00-3:30)"}
- Preserve a mensagem emocional central
- Mantenha personagens e situações
- Adapte vocabulário para ${generoConversao}
- ESCREVA FRASES COMPLETAS (não corte no meio)
- PRIORIZE: Frase completa > Limite de sílabas
- REFRÃO GRUDENTO é prioridade #1
- LINGUAGEM COLOQUIAL BRASILEIRA intensa
- INSTRUÇÕES MUSICAIS detalhadas em cada seção

${
  isSertanejoRaiz
    ? `
🎯 SERTANEJO RAIZ ESPECIAL:
- MÍNIMO 50% de RIMAS RICAS (classes diferentes)
- ZERO rimas falsas
- Rimas concretas: porteira/bananeira, viola/sacola
- EVITE rimas abstratas: amor/dor, paixão/razão
`
    : ""
}

${formatoEstrutura}

🔥 LEMBRE-SE:
1. REFRÃO GRUDENTO é prioridade #1
2. LINGUAGEM COLOQUIAL BRASILEIRA intensa
3. EMOÇÃO AUTÊNTICA > Técnica perfeita
4. FRASES COMPLETAS sempre
5. INSTRUÇÕES MUSICAIS detalhadas

Reescreva a letra AGORA, transformando em HIT:`

    console.log("[v0] Iniciando reescrita otimizada para hit...")

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt: prompt,
      temperature: 0.8, // Aumentado para mais criatividade
    })

    let finalLyrics = text.trim()

    finalLyrics = finalLyrics.replace(/^(?:Título|Title):\s*.+$/gm, "").trim()
    finalLyrics = finalLyrics.replace(/^\*\*(?:Título|Title):\s*.+\*\*$/gm, "").trim()
    finalLyrics = finalLyrics.replace(/^#+\s*(?:Título|Title):\s*.+$/gm, "").trim()

    if (!finalLyrics.includes("(Instrumentos:")) {
      const instrumentList = `(Instrumentos: [${subGenreInfo.instruments || originalInstruments || "guitar, bass, drums, keyboard"}] | BPM: ${subGenreInfo.bpm || metrics?.bpm || 100} | Ritmo: ${finalRhythm} | Estilo: ${generoConversao})`
      finalLyrics = finalLyrics.trim() + "\n\n" + instrumentList
    }

    finalLyrics = capitalizeLines(finalLyrics)

    console.log("[v0] ✅ Reescrita concluída - otimizada para hit!")

    return NextResponse.json({
      letra: finalLyrics,
    })
  } catch (error) {
    console.error("[v0] ❌ Error rewriting lyrics:", error)

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
