import { NextResponse } from "next/server"
import { generateText } from "ai"
import { getGenreConfig, detectSubGenre, getGenreRhythm } from "@/lib/genre-config"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"

export async function POST(request: Request) {
  try {
    const { lyrics, genre, additionalRequirements, advancedMode } = await request.json()

    if (!lyrics) {
      return NextResponse.json({ error: "Letra é obrigatória" }, { status: 400 })
    }

    const genreConfig = genre ? getGenreConfig(genre) : null
    const subGenreInfo = detectSubGenre(additionalRequirements || "")
    const defaultRhythm = genre ? getGenreRhythm(genre) : "Brasileiro"
    const finalRhythm = subGenreInfo.rhythm || defaultRhythm

    const universalRules = `
🎯 FÓRMULA DE HOOK DE SUCESSO 2024-2025

CARACTERÍSTICAS DE HOOK DE HIT:
1. ULTRA-CURTO: 4-8 palavras (máximo 10 sílabas)
2. GRUDENTO: Gruda na cabeça na primeira escuta
3. REPETÍVEL: Fácil de repetir e lembrar
4. QUOTABLE: Vira bordão, citável
5. VIRAL: Potencial para TikTok/Reels

EXEMPLOS DE HOOKS DE HITS 2024-2025:
✓ "Cê me testa, olha e sorri" (visual, direto, 7 palavras)
✓ "Tô no meu flow" (confiante, curto, 4 palavras)
✓ "Saudade é punhal no peito" (metáfora concreta, 5 palavras)
✓ "Você me faz sonhar" (simples, emocional, 4 palavras)

LINGUAGEM:
- Coloquial brasileira INTENSA
- Gírias e contrações ("cê", "tô", "pra", "né")
- Palavras do dia-a-dia
- ZERO vocabulário rebuscado

MÉTRICA:
- Ideal: 4-8 palavras
- Máximo: 10 sílabas
- Deve caber em 2-3 segundos ao falar
- Respiração natural

TESTE DE QUALIDADE:
- Consegue repetir 3x seguidas sem esquecer? ✓
- Soa natural em conversa? ✓
- Tem potencial viral? ✓
- Conecta com a letra? ✓
${subGenreInfo.subGenre ? `\n- Adapta ao ritmo de ${subGenreInfo.styleNote}? ✓` : `\n- Adapta ao ritmo de ${finalRhythm}? ✓`}
`

    const advancedModeRules = advancedMode
      ? `
🔥 MODO AVANÇADO - HOOK PREMIUM

CRITÉRIOS DE HIT:
- Score mínimo: 90/100 (padrão de hit)
- TikTok score mínimo: 9/10
- Viralidade garantida
- Quotable e memorável
- Adequado para rádio

TESTE RIGOROSO:
- Gruda em 3 segundos? ✓
- Vira bordão? ✓
- Funciona em karaokê? ✓
- Potencial de meme? ✓
`
      : ""

    const metaforasRule = additionalRequirements
      ? `\n⚡ REQUISITOS ESPECIAIS (PRIORIDADE MÁXIMA):
${additionalRequirements}

Se metáforas especificadas, são OBRIGATÓRIAS no hook.`
      : ""

    const prosodyRules = genreConfig
      ? `
📊 REGRAS DO GÊNERO (${genreConfig.name}):
- Ritmo: ${finalRhythm}
- Máximo: 10 sílabas
- Ideal: 4-8 palavras
- Estilo: ${genre}
`
      : ""

    const prompt = `${universalRules}
${advancedModeRules}
${metaforasRule}

📝 LETRA PARA ANALISAR:
${lyrics}

🎯 CONTEXTO CRÍTICO:
- Analise TODA a letra para capturar essência
- Hook deve ser a ALMA desta composição em 4-8 palavras
- NÃO crie hook genérico - único para ESTA letra
- Mantenha coerência total com tom e estilo
- Ritmo: ${finalRhythm}

${prosodyRules}

🎵 SUA TAREFA - CRIAR HOOK DE HIT:

1. GANCHÔMETRO (0-100)
   - Avalie: memorabilidade, repetibilidade, apelo emocional, viralidade
   - Padrão de hit: 85-100
   ${advancedMode ? "- Modo avançado: mínimo 90" : ""}

2. HOOK PRINCIPAL (4-8 palavras)
   - Gere 3 variações ultra-curtas:
     * Variação A: CHICLETE (repetitivo, grudento)
     * Variação B: BORDÃO (quotable, impactante)
     * Variação C: VIRAL (potencial TikTok máximo)
   - Escolha a MELHOR (score mais alto)

3. TRANSFORMAÇÕES SUGERIDAS
   - Pegue 2-3 trechos da letra
   - Transforme em hooks potenciais (4-8 palavras cada)
   - Mostre: Original → Hook + Razão

4. ESTRATÉGIA DE POSICIONAMENTO
   - Onde usar (intro, refrão, ponte, outro)
   - Quantas repetições (mínimo 3x na música)
   - Como maximizar impacto

5. TESTE TIKTOK/REELS
   - Como soaria em clipe de 5 segundos
   - Potencial viral (1-10)
   ${advancedMode ? "- Modo avançado: mínimo 9/10" : ""}
   - Hashtags sugeridas

6. SUGESTÕES DE MELHORIA
   - 3-4 sugestões para aumentar ganchômetro
   - Foco em simplicidade e viralidade

FORMATO JSON:
{
  "hook": "hook principal escolhido (4-8 palavras)",
  "hookVariations": [
    "variação A (chiclete)",
    "variação B (bordão)", 
    "variação C (viral)"
  ],
  "score": 90,
  "viralPotential": "alto/médio/baixo",
  "suggestions": ["sugestão 1", "sugestão 2", "sugestão 3"],
  "placement": {
    "positions": ["intro", "refrão", "outro"],
    "repetitions": 4,
    "strategy": "estratégia de maximização"
  },
  "tiktokTest": {
    "description": "como soaria em 5 segundos",
    "score": 9,
    "hashtags": ["#hook1", "#hook2", "#hook3"]
  },
  "transformations": [
    {
      "original": "trecho original da letra",
      "hookVersion": "versão hook (4-8 palavras)",
      "reason": "por que funciona como hook"
    }
  ],
  "commercialAnalysis": {
    "radioFriendly": true/false,
    "karaokeFriendly": true/false,
    "quotable": true/false,
    "memePotential": true/false
  }
}

CRITÉRIOS DE SCORE:
- 95-100: Hit garantido, viral instantâneo
- 90-94: Muito forte, alto potencial comercial
- 85-89: Bom comercialmente, funciona bem
- <85: Refaça, não atinge padrão de hit

IMPORTANTE:
- Hook DEVE ter 4-8 palavras (máximo 10 sílabas)
- Linguagem coloquial brasileira intensa
- Conecta perfeitamente com a letra
- Potencial viral máximo
- Fácil de repetir e lembrar

Retorne APENAS o JSON, sem markdown.`

    console.log("[v0] Gerando hook otimizado para hit 2024-2025...")

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt: prompt,
      temperature: 0.85, // Alta criatividade para hooks virais
      maxTokens: 2000, // Added token limit to prevent excessive generation
    })

    let parsedResult
    try {
      const cleanText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()
      parsedResult = JSON.parse(cleanText)
    } catch (parseError) {
      console.error("[v0] ❌ Erro ao fazer parse do JSON:", parseError)
      console.error("[v0] Texto recebido:", text)
      return NextResponse.json({ error: "Erro ao processar resposta da IA. Tente novamente." }, { status: 500 })
    }

    if (!parsedResult.hook) {
      console.error("[v0] ❌ Hook não encontrado na resposta")
      return NextResponse.json({ error: "Hook não foi gerado corretamente. Tente novamente." }, { status: 500 })
    }

    if (parsedResult.hook) {
      parsedResult.hook = capitalizeLines(parsedResult.hook)
    }
    if (parsedResult.hookVariations && Array.isArray(parsedResult.hookVariations)) {
      parsedResult.hookVariations = parsedResult.hookVariations.map((variation: string) => capitalizeLines(variation))
    }
    if (parsedResult.transformations && Array.isArray(parsedResult.transformations)) {
      parsedResult.transformations = parsedResult.transformations.map((t: any) => ({
        ...t,
        hookVersion: capitalizeLines(t.hookVersion),
      }))
    }

    console.log("[v0] ✅ Hook de hit gerado com sucesso!")
    console.log(`[v0] 📊 Score: ${parsedResult.score}/100`)
    console.log(`[v0] 🎯 TikTok Score: ${parsedResult.tiktokTest?.score || 0}/10`)

    return NextResponse.json(parsedResult)
  } catch (error) {
    console.error("[v0] ❌ Erro ao gerar hook:", error)
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
    return NextResponse.json({ error: `Erro ao gerar hook: ${errorMessage}. Tente novamente.` }, { status: 500 })
  }
}
