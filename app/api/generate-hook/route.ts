import { NextResponse } from "next/server"
import { generateText } from "ai"
import { getGenreConfig } from "@/lib/genre-config"
import { getAntiForcingRulesForGenre } from "@/lib/validation/anti-forcing-validator"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { getUniversalRhymeRules } from "@/lib/validation/universal-rhyme-rules"
import { validateRhymesForGenre } from "@/lib/validation/rhyme-validator"

export async function POST(request: Request) {
  try {
    const { lyrics, genre, additionalRequirements } = await request.json()

    if (!lyrics) {
      return NextResponse.json({ error: "Letra é obrigatória" }, { status: 400 })
    }

    const genreConfig = genre ? getGenreConfig(genre) : null
    const rhymeRules = genre ? getUniversalRhymeRules(genre) : null

    const antiForcingRules = genre ? getAntiForcingRulesForGenre(genre) : []
    const antiForcingExamples = antiForcingRules
      .slice(0, 3)
      .map((rule) => `- "${rule.keyword}": ${rule.description}`)
      .join("\n")

    const languageRule = additionalRequirements
      ? `ATENÇÃO: Os requisitos adicionais do compositor têm PRIORIDADE ABSOLUTA sobre qualquer regra:
${additionalRequirements}

REGRA UNIVERSAL DE METÁFORAS:
- Metáforas solicitadas pelo compositor DEVEM ser respeitadas e inseridas no hook
- Não altere, ignore ou substitua metáforas especificadas nos requisitos adicionais
- Integre as metáforas de forma natural no contexto emocional da música
- Se o compositor pediu uma metáfora específica, ela é OBRIGATÓRIA na composição

`
      : `REGRA UNIVERSAL DE LINGUAGEM (INVIOLÁVEL):
- Use APENAS palavras simples e coloquiais do dia-a-dia brasileiro
- Fale como um humano comum fala na conversa cotidiana
- PROIBIDO: vocabulário rebuscado, poético, literário ou formal
- PERMITIDO: gírias, contrações, expressões populares brasileiras
- Exemplo BOM: "tô", "cê", "pra", "né", "mano", "véio"
- Exemplo RUIM: "outono da alma", "florescer", "bonança", "perecer"

`

    const antiForcingRule =
      genre && antiForcingExamples
        ? `
🚫 REGRA UNIVERSAL ANTI-FORÇAÇÃO (CRÍTICA):
Você é um compositor humano, não um robô de palavras-chave.
- Se for relevante para a emoção da cena, você PODE usar referências do gênero
- NUNCA force essas palavras só para "cumprir regras"
- A cena deve surgir NATURALMENTE da dor, alegria, superação ou celebração
- Se a narrativa não pedir uma referência específica, NÃO a inclua
- Autenticidade é mais importante que atualidade forçada

Exemplos para ${genre}:
${antiForcingExamples}

EXEMPLO RUIM: "Ela de biquíni à meia-noite no jantar" (incoerente, forçado)
EXEMPLO BOM: "Meu biquíni novo, o que você chamava de falha" (coerente com emoção)
`
        : ""

    const prosodyRules = genreConfig
      ? `
REGRAS DE PROSÓDIA (${genreConfig.name}):
Com vírgula (conta como 2 versos):
  - Máximo ${genreConfig.prosody_rules.syllable_count.with_comma.max_before_comma} sílabas antes da vírgula
  - Máximo ${genreConfig.prosody_rules.syllable_count.with_comma.max_after_comma} sílabas depois da vírgula
  - Total máximo: ${genreConfig.prosody_rules.syllable_count.with_comma.total_max} sílabas (limite fisiológico - um fôlego)

Sem vírgula (1 verso):
  - Mínimo: ${genreConfig.prosody_rules.syllable_count.without_comma.min} sílabas
  - Máximo: ${genreConfig.prosody_rules.syllable_count.without_comma.max} sílabas
  - Aceitável até: ${genreConfig.prosody_rules.syllable_count.without_comma.acceptable_up_to} sílabas
`
      : ""

    const prompt = `${languageRule}${antiForcingRule}

Você é um especialista em hooks musicais e viralidade. Analise esta letra e gere hooks comerciais usando a Terceira Via (3 variações → síntese).

LETRA PARA ANALISAR:
${lyrics}
${prosodyRules}
${rhymeRules ? `\n${rhymeRules.instructions}` : ""}

SUA TAREFA - APLICANDO TERCEIRA VIA:

1. GANCHÔMETRO (0-100)
   - Dê uma nota baseada em: memorabilidade, repetição estratégica, apelo emocional, potencial de viralidade

2. HOOK PRINCIPAL (Gerado via Terceira Via)
   - Gere 3 variações do hook principal (máximo 8 palavras cada)
   - Combine os melhores elementos das 3 variações
   - Resultado final: UM hook principal otimizado
   - Deve ser cativante, simples e fácil de lembrar
   - RESPEITE as regras de rima do gênero

3. TRANSFORMAÇÕES SUGERIDAS
   - Pegue 2-3 trechos da letra e transforme em hooks melhores
   - Para cada transformação, gere 3 variações e escolha a melhor
   - Mostre: Original → Transformado + Razão da mudança
   - APLIQUE as regras de rima nas transformações

4. ESTRATÉGIA DE POSICIONAMENTO
   - Onde posicionar o hook na música (intro, refrão, ponte, etc.)
   - Quantas repetições sugeridas

5. TESTE TIKTOK
   - Como esse hook soaria em um clipe de 5 segundos
   - Potencial de viralidade (1-10)

6. SUGESTÕES DE MELHORIA
   - 3-4 sugestões específicas para aumentar o ganchômetro
   - Baseadas nas regras de linguagem simples e coloquial
   - Incluir sugestões de melhoria de rimas se necessário

FORMATO DE RESPOSTA EM JSON:
{
  "hook": "hook principal otimizado aqui",
  "hookVariations": ["variação 1", "variação 2", "variação 3"],
  "score": 85,
  "suggestions": ["sugestão 1", "sugestão 2", "sugestão 3"],
  "placement": ["posicionamento 1", "posicionamento 2"],
  "tiktokTest": "descrição do teste tiktok",
  "tiktokScore": 8,
  "transformations": [
    {
      "original": "trecho original",
      "variations": ["var 1", "var 2", "var 3"],
      "transformed": "melhor transformação", 
      "reason": "razão da transformação"
    }
  ]
}

IMPORTANTE:
- Use linguagem simples e coloquial brasileira
- Evite metáforas abstratas e vocabulário rebuscado
- Foque em palavras do dia-a-dia
- O hook deve soar natural, como algo que um brasileiro falaria
- Respeite as regras de prosódia se fornecidas
- APLIQUE as regras de rima do gênero

Retorne APENAS o JSON, sem markdown ou texto adicional.`

    let parsedResult: any
    let bestResult: any = null
    let bestScore = 0
    const maxAttempts = genre?.toLowerCase().includes("sertanejo raiz") ? 3 : 1

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const { text } = await generateText({
        model: "openai/gpt-4o",
        prompt: prompt,
        temperature: 0.85 + attempt * 0.05, // Aumenta temperatura em tentativas subsequentes
      })

      try {
        const cleanText = text
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim()
        parsedResult = JSON.parse(cleanText)
      } catch (parseError) {
        console.error("[v0] Error parsing hook response:", parseError)
        if (attempt === maxAttempts - 1) {
          return NextResponse.json({ error: "Erro ao processar resposta da IA" }, { status: 500 })
        }
        continue
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
          transformed: capitalizeLines(t.transformed),
          variations: t.variations?.map((v: string) => capitalizeLines(v)) || t.variations,
        }))
      }

      if (genre && parsedResult.hook) {
        const rhymeValidation = validateRhymesForGenre(parsedResult.hook, genre)
        parsedResult.rhymeScore = rhymeValidation.analysis.score
        parsedResult.rhymeWarnings = rhymeValidation.warnings

        console.log(`[v0] Hook generation attempt ${attempt + 1}/${maxAttempts}:`, {
          score: parsedResult.score,
          rhymeScore: parsedResult.rhymeScore,
          genre,
        })

        const totalScore = (parsedResult.score || 0) + (parsedResult.rhymeScore || 0)
        if (totalScore > bestScore) {
          bestScore = totalScore
          bestResult = parsedResult
        }

        if (parsedResult.rhymeScore >= 7 && parsedResult.score >= 70) {
          break
        }
      } else {
        bestResult = parsedResult
        break
      }
    }

    return NextResponse.json(bestResult || parsedResult)
  } catch (error) {
    console.error("[v0] Error generating hook:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
