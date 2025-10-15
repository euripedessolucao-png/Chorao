import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { getGenreConfig, detectSubGenre, getGenreRhythm } from "@/lib/genre-config"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"

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

    const subGenreInfo = detectSubGenre(additionalRequirements)
    const defaultRhythm = getGenreRhythm(genero)
    const finalRhythm = subGenreInfo.rhythm || defaultRhythm

    const universalRules = `
🎯 FÓRMULA DE SUCESSO 2024-2025 (PRIORIDADES ABSOLUTAS)

1. REFRÃO ULTRA-MEMORÁVEL (PRIORIDADE #1)
   - Primeira linha = GANCHO GRUDENTO que não sai da cabeça
   - Máximo 4 linhas, cada uma com 8-10 sílabas
   - Frases simples, diretas, fáceis de cantar junto
   - Repetição estratégica de palavras-chave
   - TESTE: Se não grudar na primeira escuta, refaça!

2. LINGUAGEM COLOQUIAL BRASILEIRA INTENSA
   - Fale como brasileiro fala na rua, no bar, na festa
   - Use MUITO: "cê", "tô", "pra", "né", "véio", "mano", "bicho"
   - Gírias regionais autênticas do gênero
   - ZERO vocabulário rebuscado ou poético demais
   - Parece conversa real, não poesia escrita

3. EMOÇÃO AUTÊNTICA > TÉCNICA
   - Sentimento genuíno é mais importante que rima perfeita
   - Conte história REAL com detalhes concretos
   - Cenas visuais claras (não abstrações)
   - Frases completas e coerentes (NUNCA corte no meio)
   - Se precisar escolher: EMOÇÃO vence MÉTRICA

4. ESTRUTURA COMERCIAL (3:00-3:30 minutos)
   - INTRO curta (8-12 segundos)
   - VERSE 1 (8 linhas) → PRE-CHORUS (2-4 linhas) → CHORUS (4 linhas)
   - VERSE 2 (8 linhas) → PRE-CHORUS → CHORUS (repete)
   - BRIDGE (8 linhas) → SOLO instrumental (8-16 segundos)
   - FINAL CHORUS (4 linhas com mais energia) → OUTRO (4 linhas ou fade)

5. MÉTRICA FLEXÍVEL (NÃO RÍGIDA)
   - Alvo: 8-12 sílabas por verso
   - Pode chegar a 13 se a frase estiver completa e natural
   - PRIORIDADE: Frase completa > Contagem exata
   - Respiração natural ao cantar

6. INSTRUÇÕES MUSICAIS DETALHADAS (ESTILO CLONE)
   - Cada seção tem nota de performance
   - Exemplo: [VERSE 1 - Voz suave, quase falada, ritmo de prosa sertaneja, foco na nostalgia]
   - Especifique: vocal, instrumentação, energia, emoção
   - Guie o intérprete com precisão
`

    const advancedModeRules = advancedMode
      ? `
🔥 MODO AVANÇADO ATIVADO

RIMAS PERFEITAS OBRIGATÓRIAS:
- Mínimo 50% de rimas ricas (classes gramaticais diferentes)
- Zero rimas falsas ou forçadas
- Rimas naturais que surgem da narrativa

MÉTRICA RIGOROSA:
- Máximo 12 sílabas ABSOLUTO
- Contagem precisa em cada verso
- Respiração natural garantida

GANCHOS PREMIUM:
- Refrão com hook na primeira linha
- Melodia grudenta e memorável
- Fácil de cantar em karaokê

LINGUAGEM LIMPA:
- Zero palavrões pesados
- Respeito e bom gosto
- Adequado para rádio

FIDELIDADE DE ESTILO:
- 100% fiel ao gênero escolhido
- Instrumentação autêntica
- Referências culturais corretas
`
      : ""

    const chorusContext = additionalRequirements?.match(/\[CHORUS\]\s*([\s\S]+?)(?=\n\n|\[|$)/i)?.[1]
      ? `\n\n✨ REFRÃO PRÉ-DEFINIDO (use exatamente como está):\n${additionalRequirements.match(/\[CHORUS\]\s*([\s\S]+?)(?=\n\n|\[|$)/i)![1].trim()}\n\n🎯 Construa toda a narrativa em torno deste refrão, fazendo os versos levarem naturalmente até ele.`
      : ""

    const structureGuide = `
📊 ESTRUTURA COMERCIAL OTIMIZADA (3:00-3:30 minutos para streaming)

[INTRO] (8-12 segundos instrumental)
Instrução: [INTRO - Instrumental suave com ${subGenreInfo.instruments || "instrumentos principais"}, estabelecendo o clima]

[VERSE 1] (8 linhas empilhadas)
Instrução: [VERSE 1 - Voz ${genero.includes("Funk") ? "confiante e direta" : "suave e narrativa"}, estabelecendo a história com detalhes concretos]
- Apresenta personagens, situação, contexto
- Linguagem coloquial intensa
- Cenas visuais claras

[PRE-CHORUS] (2-4 linhas)
Instrução: [PRE-CHORUS - Energia crescente, preparando emocionalmente para o refrão]
- Transição suave para o refrão
- Aumenta tensão emocional

[CHORUS] (4 linhas - O MOMENTO MAIS IMPORTANTE)
Instrução: [CHORUS - Energia máxima, grudento, fácil de cantar junto, repete palavras-chave]
- GANCHO na primeira linha
- Máximo 8-10 sílabas por linha
- Ultra-memorável

[VERSE 2] (8 linhas)
Instrução: [VERSE 2 - Desenvolve a história, novos detalhes, mantém energia]
- Avança a narrativa
- Novos ângulos da história

[PRE-CHORUS] (2-4 linhas - repete ou varia levemente)
Instrução: [PRE-CHORUS - Energia crescente novamente]

[CHORUS] (4 linhas - repete exatamente)
Instrução: [CHORUS - Repete com mesma energia, público já canta junto]

[BRIDGE] (8 linhas)
Instrução: [BRIDGE - Momento de reflexão profunda, pode ter solo de ${subGenreInfo.instruments?.split(",")[0] || "guitarra"}, mudança de perspectiva]
- Quebra o padrão
- Reflexão ou clímax emocional
- Prepara para final explosivo

[SOLO] (8-16 segundos instrumental)
Instrução: [SOLO - Instrumental de ${subGenreInfo.instruments?.split(",")[0] || "guitarra"}, momento de virtuosismo]

[FINAL CHORUS] (4 linhas - repete com MAIS intensidade)
Instrução: [FINAL CHORUS - Energia MÁXIMA, todos os instrumentos, público cantando junto, apoteose]

[OUTRO] (4 linhas ou fade out)
Instrução: [OUTRO - Fade out suave ou frase final marcante, deixa saudade]

(Instrumentos: [${subGenreInfo.instruments || (isBachata ? "electric guitar, synthesizer, electronic drums, accordion" : "guitar, bass, drums, keyboard")}] | BPM: ${subGenreInfo.bpm || metrics?.bpm || 100} | Ritmo: ${finalRhythm} | Estilo: ${genero})
`

    const prompt = `${universalRules}
${advancedModeRules}

🎵 Você é um compositor PROFISSIONAL brasileiro especializado em criar HITS de ${genero}.

Seu objetivo: Criar uma música que GRUDE NA CABEÇA e faça SUCESSO nas plataformas de streaming.

ESPECIFICAÇÕES DO CLIENTE:
📌 TEMA: ${tema || "amor e relacionamento"}
🎭 HUMOR: ${humor || "neutro"}
🎨 CRIATIVIDADE: ${criatividade}/10
${inspiracao ? `💡 INSPIRAÇÃO: ${inspiracao}` : ""}
${metaforas ? `🌟 METÁFORAS (use naturalmente): ${metaforas}` : ""}
${emocoes?.length ? `❤️ EMOÇÕES: ${emocoes.join(", ")}` : ""}
${titulo ? `📝 TÍTULO: ${titulo}` : ""}
${additionalRequirements ? `\n⚡ REQUISITOS ESPECIAIS (PRIORIDADE MÁXIMA):\n${additionalRequirements}` : ""}
${chorusContext}

${structureGuide}

🎯 REGRAS DE PROSÓDIA (${genreConfig.name}):
- Alvo: 8-12 sílabas por verso (pode chegar a 13 se frase completa)
- Respiração natural ao cantar
- Frases completas > Contagem exata

🔥 LEMBRE-SE:
1. REFRÃO GRUDENTO é prioridade #1
2. LINGUAGEM COLOQUIAL BRASILEIRA intensa
3. EMOÇÃO AUTÊNTICA > Técnica perfeita
4. FRASES COMPLETAS sempre
5. INSTRUÇÕES MUSICAIS detalhadas em cada seção

Escreva a letra completa AGORA, focando em criar um HIT:`

    console.log("[v0] Gerando letra otimizada para hit 2024-2025...")

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.85, // Aumentado para mais criatividade
    })

    let finalLyrics = text.trim()

    finalLyrics = finalLyrics.replace(/^(?:Título|Title):\s*.+$/gm, "").trim()
    finalLyrics = finalLyrics.replace(/^\*\*(?:Título|Title):\s*.+\*\*$/gm, "").trim()
    finalLyrics = finalLyrics.replace(/^#+\s*(?:Título|Title):\s*.+$/gm, "").trim()

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

    console.log("[v0] Letra gerada com sucesso - otimizada para hit!")

    return NextResponse.json({
      letra: finalLyrics,
      titulo: extractedTitle,
    })
  } catch (error) {
    console.error("[v0] Erro ao gerar letra:", error)
    return NextResponse.json(
      { error: "Erro ao gerar letra", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 },
    )
  }
}
