import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { genre, theme, mood, additionalRequirements } = await request.json()

    if (!genre || !theme) {
      return NextResponse.json({ error: "Gênero e tema são obrigatórios" }, { status: 400 })
    }

    const languageRule = additionalRequirements
      ? `ATENÇÃO: Os requisitos adicionais do compositor têm PRIORIDADE ABSOLUTA sobre qualquer regra:\n${additionalRequirements}\n\n`
      : `REGRA UNIVERSAL DE LINGUAGEM (INVIOLÁVEL):
- Use APENAS palavras simples e coloquiais do dia-a-dia
- Fale como um humano comum fala na conversa cotidiana
- PROIBIDO: vocabulário rebuscado, poético, literário ou formal
- PERMITIDO: gírias, contrações, expressões populares
- Exemplo BOM: "tô", "cê", "pra", "né", "mano"
- Exemplo RUIM: "outono da alma", "florescer", "bonança"

`

    const isSertanejoModerno = genre.toLowerCase().includes("sertanejo moderno")

    let prompt: string

    if (isSertanejoModerno) {
      const isFeminejo = genre.toLowerCase().includes("feminino")
      const tone = isFeminejo
        ? "Empoderamento com leveza, ironia suave, celebração da autonomia"
        : "Vulnerabilidade com força, superação com amigos, respeito no amor"

      prompt = `${languageRule}Você é um compositor profissional de sertanejo moderno com sucessos nas paradas do Spotify, TikTok e rádios brasileiras.

TAREFA: Gere 5 opções de refrão grudento, radiofônico e viralizável para uma música com as seguintes características:
- Gênero: ${genre}
- Tema: ${theme}
- Humor: ${mood || "neutro"}
- Tom: ${tone}

REGRAS ESTRUTURAIS:
- Número de linhas: APENAS 2 ou 4 linhas (NUNCA 3 linhas)
- Máximo de 4 linhas por refrão

REGRAS DE PROSÓDIA:
Com vírgula:
  - Máximo 6 sílabas antes da vírgula
  - Máximo 6 sílabas depois da vírgula
  - Total máximo: 12 sílabas

Sem vírgula:
  - Mínimo: 5 sílabas
  - Máximo: 7 sílabas
  - Aceitável até: 8 sílabas

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

FORMATO DE SAÍDA (JSON):
{
  "variations": [
    {
      "chorus": "linha 1 / linha 2 / linha 3 / linha 4",
      "style": "Descrição do estilo (ex: Chiclete Radiofônico, Visual e Direto, etc)",
      "score": número de 1 a 10,
      "justification": "Breve explicação do porquê esse refrão funciona comercialmente"
    }
  ],
  "bestCommercialOptionIndex": índice da melhor opção (0-4)
}

IMPORTANTE:
- Cada variação deve ter um estilo diferente
- Os scores devem variar entre 7 e 10
- A melhor opção comercial deve ter score 9 ou 10
- Use "/" para separar linhas no campo "chorus"
- Seja criativo mas mantenha a comercialidade e as regras de prosódia

Gere as 5 variações agora:`
    } else {
      prompt = `${languageRule}Você é um compositor profissional especializado em criar refrões comerciais e grudentos.

TAREFA: Gere 5 variações de refrão para uma música com as seguintes características:
- Gênero: ${genre}
- Tema: ${theme}
- Humor: ${mood || "neutro"}

REGRAS DO REFRÃO GRUDENTO (2024-2025):
1. 4 linhas máximo
2. 5-6 palavras por linha
3. Repetição de palavras/linhas estratégica
4. Onomatopeias e vocalizações (Ê, ê, ê / Ô, ô, ô / Ah, ah, ah)
5. Verbos no imperativo quando apropriado
6. Prevalência de vogais abertas (A, E, O)
7. Rimas simples entre linhas (AABB ou ABAB)
8. Gancho logo na primeira linha
9. Formato preferido: 2 ou 4 linhas

FORMATO DE SAÍDA (JSON):
{
  "variations": [
    {
      "chorus": "linha 1 / linha 2 / linha 3 / linha 4",
      "style": "Descrição do estilo (ex: Repetitivo e Direto, Onomatopeico, etc)",
      "score": número de 1 a 10,
      "justification": "Breve explicação do porquê esse refrão funciona"
    }
  ],
  "bestCommercialOptionIndex": índice da melhor opção (0-4)
}

IMPORTANTE:
- Cada variação deve ter um estilo diferente
- Os scores devem variar entre 7 e 10
- A melhor opção comercial deve ter score 9 ou 10
- Use "/" para separar linhas no campo "chorus"
- Seja criativo mas mantenha a comercialidade

Gere as 5 variações agora:`
    }

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.8,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Resposta da IA não está no formato JSON esperado")
    }

    const result = JSON.parse(jsonMatch[0])

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
