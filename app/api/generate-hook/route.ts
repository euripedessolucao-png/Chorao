import { NextResponse } from "next/server"
import { generateText } from "ai"
import { getGenreConfig, detectSubGenre, getGenreRhythm } from "@/lib/genre-config"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"

export async function POST(request: Request) {
  try {
    const { lyrics, genre, additionalRequirements } = await request.json()

    if (!lyrics) {
      return NextResponse.json({ error: "Letra é obrigatória" }, { status: 400 })
    }

    const genreConfig = genre ? getGenreConfig(genre) : null
    const subGenreInfo = detectSubGenre(additionalRequirements)
    const defaultRhythm = genre ? getGenreRhythm(genre) : "Brasileiro"
    const finalRhythm = subGenreInfo.rhythm || defaultRhythm

    const universalRules = `
🎵 REGRAS UNIVERSAIS - TERCEIRA VIA PARA HOOKS

1. LINGUAGEM SIMPLES E BRASILEIRA
   - Palavras do dia-a-dia, coloquiais
   - PROIBIDO: rebuscado, poético, literário
   - PERMITIDO: gírias, contrações ("tô", "cê", "pra")

2. MÉTRICA (MÁXIMO 12 SÍLABAS - REGRA ABSOLUTA)
   - Hook deve ser curto e memorável
   - MÁXIMO 12 SÍLABAS POÉTICAS (INVIOLÁVEL)
   - Preferência por 6-8 palavras
   - Se necessário, corte palavras para respeitar o limite

3. PROCESSO TERCEIRA VIA PARA HOOKS
   - (A) Métrica/Ritmo: fluidez e brevidade (máx 12 sílabas)
   - (B) Emoção/Impacto: memorável e viral
   - (C) Síntese: combine A+B = hook perfeito (RESPEITANDO 12 sílabas)

IMPORTANTE NA SÍNTESE (C):
- NUNCA exceda 12 sílabas
- Hooks devem ser ainda mais curtos (6-8 palavras ideal)
- Priorize brevidade e impacto sobre complexidade
${subGenreInfo.subGenre ? `\n- Adapte ao ritmo de ${subGenreInfo.styleNote}` : `\n- Adapte ao ritmo de ${finalRhythm}`}
`

    const metaforasRule = additionalRequirements
      ? `\nREQUISITOS ADICIONAIS (PRIORIDADE ABSOLUTA):
${additionalRequirements}

METÁFORAS: Se especificadas, são OBRIGATÓRIAS no hook.`
      : ""

    const prosodyRules = genreConfig
      ? `
REGRAS DE PROSÓDIA (${genreConfig.name}):
- Ritmo: ${finalRhythm}
- Máximo 12 sílabas poéticas
- Deve caber em um fôlego natural
- Preferência por 6-8 palavras
`
      : ""

    const prompt = `${universalRules}${metaforasRule}

LETRA PARA ANALISAR:
${lyrics}

CONTEXTO IMPORTANTE:
- Analise TODA a letra para entender tema, emoção e narrativa
- O hook deve REFLETIR e AMPLIFICAR a essência desta letra
- NÃO crie hook genérico - único para ESTA composição
- Mantenha coerência com tom emocional e estilo
- Ritmo da composição: ${finalRhythm}

${prosodyRules}

SUA TAREFA - APLICANDO TERCEIRA VIA:

1. GANCHÔMETRO (0-100)
   - Nota baseada em: memorabilidade, repetição, apelo emocional, viralidade

2. HOOK PRINCIPAL (Gerado via Terceira Via)
   - Gere 3 variações do hook (máx 8 palavras cada):
     * Variação A: foco em MÉTRICA e FLUIDEZ (máx 12 sílabas)
     * Variação B: foco em EMOÇÃO e IMPACTO (máx 12 sílabas)
     * Variação C: SÍNTESE (combine melhor de A e B, MÁXIMO 12 sílabas)
   - Resultado final: hook principal otimizado (versão C, respeitando limite)

3. TRANSFORMAÇÕES SUGERIDAS
   - Pegue 2-3 trechos da letra
   - Para cada um, aplique Terceira Via:
     * Original → Variação A (métrica) → Variação B (emoção) → Síntese C
   - Mostre: Original → Transformado + Razão

4. ESTRATÉGIA DE POSICIONAMENTO
   - Onde posicionar (intro, refrão, ponte)
   - Quantas repetições

5. TESTE TIKTOK
   - Como soaria em clipe de 5 segundos
   - Potencial de viralidade (1-10)

6. SUGESTÕES DE MELHORIA
   - 3-4 sugestões específicas para aumentar ganchômetro
   - Baseadas em linguagem simples e coloquial

FORMATO JSON:
{
  "hook": "hook principal otimizado (síntese C)",
  "hookVariations": ["variação A (métrica)", "variação B (emoção)", "variação C (síntese)"],
  "score": 85,
  "suggestions": ["sugestão 1", "sugestão 2", "sugestão 3"],
  "placement": ["posicionamento 1", "posicionamento 2"],
  "tiktokTest": "descrição do teste",
  "tiktokScore": 8,
  "transformations": [
    {
      "original": "trecho original",
      "variations": ["var A (métrica)", "var B (emoção)", "var C (síntese)"],
      "transformed": "melhor transformação (C)", 
      "reason": "razão da transformação"
    }
  ],
  "terceiraViaProcess": {
    "metricFocus": "análise do foco métrico",
    "emotionalFocus": "análise do foco emocional",
    "synthesis": "como A+B foram combinados"
  }
}

IMPORTANTE:
- Use linguagem simples e coloquial brasileira
- Evite metáforas abstratas
- Foque em palavras do dia-a-dia
- Hook deve soar natural
- Aplique Terceira Via em cada transformação

Retorne APENAS o JSON, sem markdown.`

    console.log("[v0] Gerando hook com Terceira Via e contexto da letra...")

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt: prompt,
      temperature: 0.85,
    })

    const cleanText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()
    const parsedResult = JSON.parse(cleanText)

    if (parsedResult.hook) {
      parsedResult.hook = capitalizeLines(parsedResult.hook)
    }
    if (parsedResult.hookVariations && Array.isArray(parsedResult.hookVariations)) {
      parsedResult.hookVariations = parsedResult.hookVariations.map((variation: string) => capitalizeLines(variation))
    }
    if (parsedResult.transformations && Array.isArray(parsedResult.transformations)) {
      parsedResult.transformations = parsedResult.transformations.map((t: any) => ({
        ...t,
        transformed: capitalizeLines(t.transformed),
        variations: t.variations?.map((v: string) => capitalizeLines(v)) || t.variations,
      }))
    }

    console.log("[v0] Hook gerado com sucesso usando Terceira Via")

    return NextResponse.json(parsedResult)
  } catch (error) {
    console.error("[v0] Erro ao gerar hook:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
