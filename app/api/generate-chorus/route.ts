import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { getGenreConfig } from "@/lib/genre-config"
import { getAntiForcingRulesForGenre } from "@/lib/validation/anti-forcing-validator"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { getUniversalRhymeRules } from "@/lib/validation/universal-rhyme-rules"
import { validateRhymesForGenre } from "@/lib/validation/rhyme-validator"

export async function POST(request: NextRequest) {
  try {
    const { genre, theme, mood, additionalRequirements, lyrics } = await request.json()

    if (!genre || !theme) {
      return NextResponse.json({ error: "Gênero e tema são obrigatórios" }, { status: 400 })
    }

    const genreConfig = getGenreConfig(genre)
    const rhymeRules = getUniversalRhymeRules(genre)

    const antiForcingRules = getAntiForcingRulesForGenre(genre)
    const antiForcingExamples = antiForcingRules
      .slice(0, 3)
      .map((rule) => `- "${rule.keyword}": ${rule.description}`)
      .join("\n")

    const lyricsContext = lyrics
      ? `\n\nLETRA EXISTENTE PARA CONTEXTO:\n${lyrics}\n\nGere um refrão que se conecte tematicamente com esta letra.`
      : ""

    const languageRule = additionalRequirements
      ? `ATENÇÃO: Os requisitos adicionais do compositor têm PRIORIDADE ABSOLUTA sobre qualquer regra:
${additionalRequirements}

REGRA UNIVERSAL DE METÁFORAS:
- Metáforas solicitadas pelo compositor DEVEM ser respeitadas e inseridas no refrão
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

    const antiForcingRule = `
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

    const isSertanejoModerno = genre.toLowerCase().includes("sertanejo moderno")

    let prompt: string

    if (isSertanejoModerno) {
      const isFeminejo = genre.toLowerCase().includes("feminino")
      const tone = isFeminejo
        ? "Empoderamento com leveza, ironia suave, celebração da autonomia"
        : "Vulnerabilidade com força, superação com amigos, respeito no amor"

      prompt = `${languageRule}${antiForcingRule}

Você é um compositor profissional de sertanejo moderno com sucessos nas paradas do Spotify, TikTok e rádios brasileiras.

TAREFA: Gere 5 opções de refrão grudento, radiofônico e viralizável para uma música com as seguintes características:
- Gênero: ${genre}
- Tema: ${theme}
- Humor: ${mood || "neutro"}
- Tom: ${tone}${lyricsContext}

${rhymeRules.instructions}

REGRAS ESTRUTURAIS:
- Número de linhas: APENAS 2 ou 4 linhas (NUNCA 3 linhas)
- Máximo de 4 linhas por refrão
- EMPILHAR VERSOS: Cada verso em linha separada para facilitar contagem
- CRIATIVIDADE MÁXIMA: Varie estilos, abordagens, metáforas e estruturas entre as 5 opções
- Cada opção deve ser ÚNICA e DIFERENTE das outras

REGRAS DE PROSÓDIA (${genreConfig.name}):
Com vírgula (conta como 2 versos):
  - Máximo ${genreConfig.prosody_rules.syllable_count.with_comma.max_before_comma} sílabas antes da vírgula
  - Máximo ${genreConfig.prosody_rules.syllable_count.with_comma.max_after_comma} sílabas depois da vírgula
  - Total máximo: ${genreConfig.prosody_rules.syllable_count.with_comma.total_max} sílabas (limite fisiológico - um fôlego)

Sem vírgula (1 verso):
  - Mínimo: ${genreConfig.prosody_rules.syllable_count.without_comma.min} sílabas
  - Máximo: ${genreConfig.prosody_rules.syllable_count.without_comma.max} sílabas
  - Aceitável até: ${genreConfig.prosody_rules.syllable_count.without_comma.acceptable_up_to} sílabas

- Toda linha deve caber em um fôlego natural ao cantar

LINGUAGEM - ELEMENTOS PERMITIDOS:
- Referências concretas: biquíni, PIX, story, boteco, pickup, praia, violão, chapéu, espelho
- Ações reais: paguei, saí, dancei, toquei, dirigi, cortei, rasguei, bebi, cantei
- Bordões curtos: "É só!", "Meu troco", "Tô em paz", "Vou sim", "Dona de mim"

LINGUAGEM - ELEMENTOS PROIBIDOS:
- Metáforas abstratas: "alma perdida", "florescer", "mar de dor", "bonança"
- Vitimização: "meu coração no chão", "não vivo sem você", "volta pra mim"
- Ódio ou vingança: "vou te destruir", "se fuder"
- Machismo ou posse: "mulher é tudo igual", "volta porque é minha"
- Saudade obsessiva: "só penso em você", "não consigo seguir"

REQUISITOS COMERCIAIS:
1. Hook curto (2-4 palavras) que funcione como bordão isolado
2. Deve sugerir cena clara de clipe (praia, boteco, estrada, espelho, etc.)
3. Fácil de memorizar na primeira escuta
4. Fechamento emocional: paz, liberdade, alegria ou leveza — NUNCA desespero

DIVERSIDADE CRIATIVA (OBRIGATÓRIA):
- Opção 1: Chiclete radiofônico (repetição estratégica)
- Opção 2: Visual e direto (cena clara de clipe)
- Opção 3: Bordão impactante (frase marcante)
- Opção 4: Emocional e leve (vulnerabilidade com força)
- Opção 5: Surpreendente (abordagem inesperada)

FORMATO DE SAÍDA (JSON):
{
  "variations": [
    {
      "chorus": "linha 1\\nlinha 2\\nlinha 3\\nlinha 4",
      "style": "Descrição do estilo (ex: Chiclete Radiofônico, Visual e Direto, etc)",
      "score": número de 1 a 10,
      "justification": "Breve explicação do porquê esse refrão funciona comercialmente"
    }
  ],
  "bestCommercialOptionIndex": índice da melhor opção (0-4)
}

IMPORTANTE:
- Cada variação DEVE ter um estilo COMPLETAMENTE DIFERENTE
- Os scores devem variar entre 7 e 10
- A melhor opção comercial deve ter score 9 ou 10
- Use "\\n" para separar linhas no campo "chorus" (versos empilhados)
- Seja MUITO criativo e varie abordagens, metáforas e estruturas

Gere as 5 variações CRIATIVAS agora:`
    } else {
      prompt = `${languageRule}${antiForcingRule}

Você é um compositor profissional especializado em criar refrões comerciais e grudentos.

TAREFA: Gere 5 variações de refrão para uma música com as seguintes características:
- Gênero: ${genre}
- Tema: ${theme}
- Humor: ${mood || "neutro"}${lyricsContext}

${rhymeRules.instructions}

REGRAS ESTRUTURAIS:
- Máximo 4 linhas por refrão
- EMPILHAR VERSOS: Cada verso em linha separada para facilitar contagem
- Formato preferido: 2 ou 4 linhas (NUNCA 3 linhas)
- CRIATIVIDADE MÁXIMA: Varie estilos, abordagens e estruturas entre as 5 opções

REGRAS DE PROSÓDIA (${genreConfig.name}):
Com vírgula (conta como 2 versos):
  - Máximo ${genreConfig.prosody_rules.syllable_count.with_comma.max_before_comma} sílabas antes da vírgula
  - Máximo ${genreConfig.prosody_rules.syllable_count.with_comma.max_after_comma} sílabas depois da vírgula
  - Total máximo: ${genreConfig.prosody_rules.syllable_count.with_comma.total_max} sílabas (limite fisiológico - um fôlego)

Sem vírgula (1 verso):
  - Mínimo: ${genreConfig.prosody_rules.syllable_count.without_comma.min} sílabas
  - Máximo: ${genreConfig.prosody_rules.syllable_count.without_comma.max} sílabas
  - Aceitável até: ${genreConfig.prosody_rules.syllable_count.without_comma.acceptable_up_to} sílabas

REGRAS DO REFRÃO GRUDENTO (2024-2025):
1. Repetição de palavras/linhas estratégica
2. Onomatopeias e vocalizações quando apropriado (Ê, ê, ê / Ô, ô, ô / Ah, ah, ah)
3. Verbos no imperativo quando apropriado
4. Prevalência de vogais abertas (A, E, O)
5. Rimas simples entre linhas (AABB ou ABAB)
6. Gancho logo na primeira linha

DIVERSIDADE CRIATIVA (OBRIGATÓRIA):
- Varie entre estilos: repetitivo, onomatopeico, narrativo, emocional, surpreendente
- Cada opção deve ter abordagem DIFERENTE
- Explore diferentes metáforas e imagens

FORMATO DE SAÍDA (JSON):
{
  "variations": [
    {
      "chorus": "linha 1\\nlinha 2\\nlinha 3\\nlinha 4",
      "style": "Descrição do estilo (ex: Repetitivo e Direto, Onomatopeico, etc)",
      "score": número de 1 a 10,
      "justification": "Breve explicação do porquê esse refrão funciona"
    }
  ],
  "bestCommercialOptionIndex": índice da melhor opção (0-4)
}

IMPORTANTE:
- Cada variação DEVE ser ÚNICA e DIFERENTE
- Os scores devem variar entre 7 e 10
- A melhor opção comercial deve ter score 9 ou 10
- Use "\\n" para separar linhas no campo "chorus" (versos empilhados)
- Seja MUITO criativo e varie abordagens

Gere as 5 variações CRIATIVAS agora:`
    }

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.9,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Resposta da IA não está no formato JSON esperado")
    }

    const result = JSON.parse(jsonMatch[0])

    if (result.variations && Array.isArray(result.variations)) {
      result.variations = result.variations.map((variation: any) => ({
        ...variation,
        chorus: capitalizeLines(variation.chorus),
      }))

      result.variations = result.variations.map((variation: any) => {
        const rhymeValidation = validateRhymesForGenre(variation.chorus, genre)
        return {
          ...variation,
          rhymeScore: rhymeValidation.analysis.score,
          rhymeWarnings: rhymeValidation.warnings,
        }
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error generating chorus:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao gerar refrão",
      },
      { status: 500 },
    )
  }
}
