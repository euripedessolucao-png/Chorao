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
    const isSertanejoModerno = genero.toLowerCase().includes("sertanejo moderno")

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

    const stackingRules = `
🎵 FORMATO BRASILEIRO DE EMPILHAMENTO (OBRIGATÓRIO)

📝 REGRA ABSOLUTA DE ESTRUTURA:
• CADA VERSO EM UMA LINHA SEPARADA
• NUNCA junte dois versos na mesma linha
• EXCEÇÃO: apenas quando o segundo verso é continuação DIRETA do primeiro

✅ EXEMPLO CORRETO (EMPILHADO):
[VERSE 1]
Se quer saber de mim
Pergunte para mim
Se for falar do que passou
Conta a parte que você errou
Não vem com esse papo furado
Dizendo que foi enganado

❌ EXEMPLO ERRADO (NÃO EMPILHADO):
[VERSE 1]
Se quer saber de mim, pergunte para mim
Se for falar do que passou, conta a parte que você errou
Não vem com esse papo furado dizendo que foi enganado

🎼 POR QUE EMPILHAR?
• Facilita contagem de sílabas
• Formato padrão da indústria brasileira
• Melhor visualização da estrutura
• Mais fácil para o cantor ler

🔥 ESTRUTURA POR SEÇÃO:
• VERSE: 6-8 linhas empilhadas
• PRE-CHORUS: 2-4 linhas empilhadas
• CHORUS: 4 linhas empilhadas (PADRÃO OURO)
• BRIDGE: 4-6 linhas empilhadas
• OUTRO: 2-4 linhas empilhadas

ESCREVA SEMPRE NO FORMATO EMPILHADO BRASILEIRO!
`

    const universalRules = `
🎯 FÓRMULA DE SUCESSO 2024-2025 (PRIORIDADES ABSOLUTAS)

${stackingRules}

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
📊 ESTRUTURA LIMPA PARA PERFORMANCE (3:00-3:30 minutos)

⚠️ FORMATO OBRIGATÓRIO:
- INSTRUÇÕES: Em inglês, dentro de [colchetes]
- LETRAS CANTADAS: Em português, SEM colchetes
- BACKING VOCALS: (Backing: "texto") em parênteses
- CADA VERSO: Uma linha separada (empilhado)
- MÁXIMO: 12 sílabas poéticas por verso

${
  isSertanejoModerno
    ? `
🎵 SERTANEJO MODERNO - ESTRUTURA A, B, C:
- A = VERSE (narrativa, história)
- B = CHORUS (gancho grudento, repetitivo)
- C = BRIDGE (nova perspectiva, reflexão)
`
    : ""
}

📝 EXEMPLO DE FORMATO CORRETO:

[INTRO - ${subGenreInfo.instruments?.split(",")[0] || "Acoustic guitar"} with subtle percussion, setting nostalgic tone, (8-12 SECONDS)]

[VERSE 1${isSertanejoModerno ? " - A" : ""} - Narrative voice, intimate vocal delivery, establishing story with concrete details]
Primeira linha da letra em português
Segunda linha da letra em português
Terceira linha da letra em português
Quarta linha da letra em português

[PRE-CHORUS - Building energy, drums and bass enter, preparing emotional peak]
Linha do pré-refrão em português
Outra linha do pré-refrão em português

[CHORUS${isSertanejoModerno ? " - B" : ""} - Full instrumentation, emotional and anthemic, maximum energy, crowd sing-along feel]
(Backing: "Oh, oh, oh")
Primeira linha do refrão em português
Segunda linha do refrão em português
Terceira linha do refrão em português
Quarta linha do refrão em português

[VERSE 2${isSertanejoModerno ? " - A" : ""} - Return to softer arrangement, intimate feel, develops story with new details]
Primeira linha do segundo verso
Segunda linha do segundo verso
Terceira linha do segundo verso
Quarta linha do segundo verso

[PRE-CHORUS - Energy building again, tension rising]
Linha do pré-refrão em português
Outra linha do pré-refrão em português

[CHORUS${isSertanejoModerno ? " - B" : ""} - Full band, celebratory energy, repeat with same intensity]
(Backing: "Oh, oh, oh")
Primeira linha do refrão em português
Segunda linha do refrão em português
Terceira linha do refrão em português
Quarta linha do refrão em português

[BRIDGE${isSertanejoModerno ? " - C" : ""} - Stripped down arrangement, reflective mood, perspective change, can include solo]
Primeira linha da ponte em português
Segunda linha da ponte em português
Terceira linha da ponte em português
Quarta linha da ponte em português

[SOLO - ${subGenreInfo.instruments?.split(",")[0] || "Guitar"} instrumental solo, emotional peak, (8-16 SECONDS)]

[FINAL CHORUS${isSertanejoModerno ? " - B" : ""} - Maximum energy, apotheosis, vocal ad-libs and harmonies, explosive finish]
(Backing: "Oh, oh, oh")
Primeira linha do refrão em português
Segunda linha do refrão em português
Terceira linha do refrão em português
Quarta linha do refrão em português
(repeat last two lines with vocal ad-libs)

[OUTRO - Gradual fade with soft instrumentation or striking final phrase]
Linha final em português
Outra linha final em português

(Instrumentos: ${subGenreInfo.instruments || "acoustic guitar, electric guitar, bass, drums, keyboard"} | BPM: ${subGenreInfo.bpm || metrics?.bpm || 100} | Ritmo: ${finalRhythm} | Estilo: ${genero})

🎯 GUIA DE INSTRUÇÕES DE PERFORMANCE:

DINÂMICAS (Dynamics):
- Soft: suave, delicado, íntimo
- Moderate: equilibrado, médio
- Loud: forte, potente
- Building: crescendo, aumentando
- Fading: diminuindo, desvanecendo

ENERGIA (Energy Levels):
- Low energy: calmo, reflexivo
- Building energy: aumentando tensão
- High energy: intenso, vibrante
- Maximum energy: explosivo, climático
- Explosive: pico emocional

INSTRUMENTAÇÃO:
- Especifique quais instrumentos estão ativos
- Indique quando instrumentos entram/saem
- Exemplo: "Full band enters: driving drums, pop bassline, synth lead"
- Exemplo: "Stripped down to acoustic guitar and voice"

DIREÇÃO EMOCIONAL:
- Intimate: íntimo, pessoal
- Reflective: reflexivo, pensativo
- Celebratory: celebrativo, festivo
- Anthemic: grandioso, hino
- Nostalgic: nostálgico, saudoso

TÉCNICAS VOCAIS:
- Narrative voice: voz narrativa, contando história
- Emotional delivery: entrega emocional intensa
- Vocal ad-libs: improvisações vocais
- Belted vocals: voz potente, projetada
- Whispered: sussurrado

RITMO E GROOVE:
- Driving rhythm: ritmo pulsante, energético
- Laid-back groove: groove relaxado
- Four-on-the-floor: batida constante em 4/4

TRANSIÇÕES:
- Smooth transition: transição suave
- Build-up: construção gradual
- Break down: quebra, redução
- Drop: queda, entrada forte

🎯 REGRAS CRÍTICAS:
1. INSTRUÇÕES sempre em INGLÊS dentro de [colchetes]
2. LETRAS sempre em PORTUGUÊS (sem colchetes)
3. BACKING VOCALS: (Backing: "texto") em parênteses
4. CADA VERSO em uma LINHA SEPARADA
5. MÁXIMO 12 SÍLABAS por verso
6. ${isSertanejoModerno ? "Labels A, B, C para Sertanejo Moderno" : "Sem labels A, B, C para este gênero"}
7. Tempo em SEGUNDOS: (8-12 SECONDS), (8-16 SECONDS)
8. INSTRUMENTOS em INGLÊS na linha final
9. INSTRUÇÕES DETALHADAS: especifique dinâmica, energia, instrumentação, emoção
10. SEJA PROFISSIONAL: use terminologia de produção musical
`

    const universalLanguageRules = `
🌍 REGRAS UNIVERSAIS DE IDIOMA (OBRIGATÓRIO)

✅ PORTUGUÊS BRASILEIRO:
- LETRAS CANTADAS: 100% em português do Brasil
- Linguagem coloquial autêntica
- Gírias e expressões regionais

✅ INGLÊS:
- INSTRUÇÕES DE PERFORMANCE: sempre em inglês
  Exemplo: [VERSE 1 - Soft voice, narrative style, building emotion]
- LISTA DE INSTRUMENTOS: sempre em inglês
  Exemplo: (Instrumentos: acoustic guitar, bass, drums, keyboard | ...)
- BACKING VOCALS: sempre em inglês
  Exemplo: (Backing: "Oh, oh, oh"), (Backing: "Yeah, yeah")
- LABELS DE ESTRUTURA: sempre em inglês
  Exemplo: INTRO, VERSE 1, PRE-CHORUS, CHORUS, BRIDGE, SOLO, OUTRO

❌ NUNCA MISTURE:
- Não escreva letras em inglês
- Não escreva instruções em português
- Mantenha separação clara

📝 EXEMPLO CORRETO:

INTRO
[Soft acoustic guitar, building anticipation]

VERSE 1
[Narrative voice, intimate and emotional]
Eu te amei demais
Mas você não quis ficar
Agora a saudade dói
E não consigo te esquecer

PRE-CHORUS
[Energy building, drums enter]
Tudo que eu queria
Era você do meu lado

CHORUS
[Full band, emotional peak, singalong energy]
(Backing: "Oh, oh, oh")
Volta pra mim, meu amor
Sem você não sei viver
Volta pra mim, por favor
Você é tudo que eu quero ter

(Instrumentos: acoustic guitar, electric guitar, bass, drums, keyboard | BPM: 85 | Ritmo: Balada Sertaneja | Estilo: Sertanejo Romântico)
`

    const prompt = `${universalLanguageRules}

${universalRules}
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
