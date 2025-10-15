import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { getGenreConfig, detectSubGenre, getGenreRhythm } from "@/lib/genre-config"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { validateLyricsSyllables } from "@/lib/syllable-counter"

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

    const syllableRule = `
⚠️ REGRA UNIVERSAL ABSOLUTA - LIMITE DE 12 SÍLABAS (INVIOLÁVEL)

🎵 CONTAGEM DE SÍLABAS POÉTICAS:
- MÁXIMO ABSOLUTO: 12 sílabas poéticas por verso
- Este é o LIMITE HUMANO do canto
- Conta até a última sílaba tônica
- Elisão/Sinalefa: une vogais entre palavras (ex: "de amor" = "dea-mor" = 2 sílabas)

✅ EXEMPLOS CORRETOS (≤12 sílabas):
- "Lem-bro-bem-lá-do-fo-gão" = 7 sílabas ✓
- "O-rá-dio-to-can-do-um-som-de-pe-ão" = 11 sílabas ✓
- "Mú-si-ca-de-es-tra-da-cau-so-do-cu-rral" = 12 sílabas ✓
- "Sau-da-de-é-pu-nhal-cra-va-do-no-pei-to" = 12 sílabas ✓

❌ EXEMPLOS ERRADOS (>12 sílabas - NUNCA FAÇA):
- "Os-ó-io-de-le-ma-re-ja-vam-que-ren-do-o-cul-tar" = 15 sílabas ✗
- "A-bra-ce-for-te-com-to-do-o-ca-lor-que-a-al-ma-tem" = 16 sílabas ✗

🎯 COMO SER CRIATIVO DENTRO DO LIMITE:
- Use contrações: "você" → "cê", "está" → "tá", "para" → "pra"
- Elisão natural: "de amor" → "d'amor", "que eu" → "qu'eu"
- Frases diretas e simples
- Corte palavras desnecessárias
- Priorize impacto emocional em poucas sílabas

🔥 PRIORIDADE: FRASE COMPLETA + ≤12 SÍLABAS
- Nunca corte frase no meio
- Se não couber em 12 sílabas, REESCREVA a frase inteira
- Use criatividade para expressar a mesma emoção em menos sílabas
`

    const universalRules = `
🎯 FÓRMULA DE SUCESSO 2024-2025 (PRIORIDADES ABSOLUTAS)

${syllableRule}

1. REFRÃO ULTRA-MEMORÁVEL (PRIORIDADE #1)
   - Primeira linha = GANCHO GRUDENTO que não sai da cabeça
   - Máximo 4 linhas, cada uma com 8-10 sílabas (NUNCA mais de 12)
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
- Máximo 12 sílabas ABSOLUTO (sem exceções)
- Contagem precisa em cada verso
- Respiração natural garantida
- Validação automática de sílabas

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

⚠️ FORMATO DE VERSOS EMPILHADOS (OBRIGATÓRIO):
- Cada verso em uma linha separada
- NUNCA junte dois versos na mesma linha
- Exceção: apenas quando o segundo verso é continuação DIRETA do primeiro
- Facilita contagem de versos e sílabas
- Formato padrão brasileiro de composição

⚠️ CADA VERSO: MÁXIMO 12 SÍLABAS POÉTICAS (ABSOLUTO)

[INTRO] (8-12 segundos instrumental)
Instrução: [INTRO - Instrumental suave com ${subGenreInfo.instruments || "instrumentos principais"}, estabelecendo o clima]

[VERSE 1] (8 linhas empilhadas - uma por linha)
Instrução: [VERSE 1 - Voz ${genero.includes("Funk") ? "confiante e direta" : "suave e narrativa"}, estabelecendo a história com detalhes concretos]
- Apresenta personagens, situação, contexto
- Linguagem coloquial intensa
- Cenas visuais claras
- CADA VERSO EM UMA LINHA SEPARADA

[PRE-CHORUS] (2-4 linhas empilhadas)
Instrução: [PRE-CHORUS - Energia crescente, preparando emocionalmente para o refrão]
- Transição suave para o refrão
- Aumenta tensão emocional
- CADA VERSO EM UMA LINHA SEPARADA

[CHORUS] (4 linhas empilhadas - O MOMENTO MAIS IMPORTANTE)
Instrução: [CHORUS - Energia máxima, grudento, fácil de cantar junto, repete palavras-chave]
- GANCHO na primeira linha
- Máximo 8-10 sílabas por linha
- Ultra-memorável
- CADA VERSO EM UMA LINHA SEPARADA

[VERSE 2] (8 linhas empilhadas)
Instrução: [VERSE 2 - Desenvolve a história, novos detalhes, mantém energia]
- Avança a narrativa
- Novos ângulos da história
- CADA VERSO EM UMA LINHA SEPARADA

[PRE-CHORUS] (2-4 linhas empilhadas - repete ou varia levemente)
Instrução: [PRE-CHORUS - Energia crescente novamente]

[CHORUS] (4 linhas empilhadas - repete exatamente)
Instrução: [CHORUS - Repete com mesma energia, público já canta junto]

[BRIDGE] (8 linhas empilhadas)
Instrução: [BRIDGE - Momento de reflexão profunda, pode ter solo de ${subGenreInfo.instruments?.split(",")[0] || "guitarra"}, mudança de perspectiva]
- Quebra o padrão
- Reflexão ou clímax emocional
- Prepara para final explosivo
- CADA VERSO EM UMA LINHA SEPARADA

[SOLO] (8-16 segundos instrumental)
Instrução: [SOLO - Instrumental de ${subGenreInfo.instruments?.split(",")[0] || "guitarra"}, momento de virtuosismo]

[FINAL CHORUS] (4 linhas empilhadas - repete com MAIS intensidade)
Instrução: [FINAL CHORUS - Energia MÁXIMA, todos os instrumentos, público cantando junto, apoteose]

[OUTRO] (4 linhas empilhadas ou fade out)
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
- MÁXIMO ABSOLUTO: 12 sílabas poéticas por verso
- Respiração natural ao cantar
- Frases completas sempre
- Use contrações e elisão para caber no limite

🔥 LEMBRE-SE:
1. MÁXIMO 12 SÍLABAS POR VERSO (INVIOLÁVEL)
2. REFRÃO GRUDENTO é prioridade #1
3. LINGUAGEM COLOQUIAL BRASILEIRA intensa
4. EMOÇÃO AUTÊNTICA > Técnica perfeita
5. FRASES COMPLETAS sempre
6. INSTRUÇÕES MUSICAIS detalhadas em cada seção

Escreva a letra completa AGORA, focando em criar um HIT:`

    console.log("[v0] Gerando letra otimizada para hit 2024-2025...")

    let finalLyrics = ""
    let attempts = 0
    const maxAttempts = 3

    while (attempts < maxAttempts) {
      const { text } = await generateText({
        model: "openai/gpt-4o",
        prompt:
          attempts > 0
            ? `${prompt}\n\n⚠️ ATENÇÃO: A tentativa anterior teve versos com MAIS DE 12 SÍLABAS. Isso é INACEITÁVEL.\nREGENERE garantindo que TODOS os versos tenham NO MÁXIMO 12 sílabas poéticas.\nUse contrações, elisão e criatividade para caber no limite.`
            : prompt,
        temperature: 0.85,
      })

      finalLyrics = text.trim()

      // Valida sílabas
      const validation = validateLyricsSyllables(finalLyrics, 12)

      if (validation.valid) {
        console.log("[v0] ✓ Letra aprovada - todos os versos dentro do limite de 12 sílabas")
        break
      } else {
        attempts++
        console.log(`[v0] ✗ Tentativa ${attempts}: ${validation.violations.length} versos excedem 12 sílabas`)

        if (attempts < maxAttempts) {
          console.log("[v0] Regenerando letra...")
        } else {
          console.log("[v0] ⚠️ Máximo de tentativas atingido. Retornando melhor resultado com avisos.")
          // Adiciona aviso ao usuário
          finalLyrics = `⚠️ AVISO: Alguns versos podem exceder 12 sílabas. Revise manualmente.\n\n${finalLyrics}`
        }
      }
    }

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
