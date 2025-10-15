import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { getGenreConfig, detectSubGenre, getGenreRhythm } from "@/lib/genre-config"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"

export async function POST(request: NextRequest) {
  try {
    const { genre, theme, mood, additionalRequirements, lyrics, advancedMode } = await request.json()

    if (!genre || !theme) {
      return NextResponse.json({ error: "Gênero e tema são obrigatórios" }, { status: 400 })
    }

    if (!lyrics) {
      return NextResponse.json(
        { error: "Letra base é obrigatória. Cole a letra na aba Reescrever antes de gerar o refrão." },
        { status: 400 },
      )
    }

    const genreConfig = getGenreConfig(genre)
    const subGenreInfo = detectSubGenre(additionalRequirements)
    const defaultRhythm = getGenreRhythm(genre)
    const finalRhythm = subGenreInfo.rhythm || defaultRhythm

    const lyricsContext = `
📝 LETRA EXISTENTE (CONTEXTO OBRIGATÓRIO):
${lyrics}

🎯 O REFRÃO DEVE:
- Conectar-se PERFEITAMENTE com esta letra
- Usar o MESMO tom emocional e linguagem
- Manter TOTAL coerência com a história
- Parecer parte NATURAL desta composição
- Ser o MOMENTO MAIS MEMORÁVEL da música
- GRUDAR NA CABEÇA na primeira escuta
${subGenreInfo.subGenre ? `- Seguir o ritmo de ${subGenreInfo.styleNote}` : ""}
`

    const universalRules = `
🎯 FÓRMULA DE REFRÃO DE SUCESSO 2024-2025

PRIORIDADE ABSOLUTA:
1. GANCHO GRUDENTO (primeira linha deve grudar na cabeça)
2. FRASES COMPLETAS E COERENTES (NUNCA corte no meio)
3. LINGUAGEM COLOQUIAL BRASILEIRA INTENSA
4. FÁCIL DE CANTAR JUNTO (karaokê-friendly)
5. REPETIÇÃO ESTRATÉGICA de palavras-chave

CARACTERÍSTICAS DE HIT:
- Máximo 4 linhas, cada uma com 8-10 sílabas
- Frases simples, diretas, memoráveis
- Palavras do dia-a-dia ("cê", "tô", "pra", "né")
- Cada linha faz sentido sozinha
- Melodia implícita grudenta

EXEMPLOS DE HITS 2024-2025:
✓ "Cê me testa, olha e sorri" (direto, visual, grudento)
✓ "Saudade é punhal cravado no peito" (metáfora concreta, impactante)
✓ "Tô no meu flow, meu beat é pesado" (confiante, repetitivo)

EVITE:
✗ Frases incompletas ("Você me faz..." - ERRADO)
✗ Vocabulário rebuscado ("floresço", "bonança")
✗ Abstrações vagas ("mar de dor", "alma perdida")
✗ Rimas forçadas que quebram naturalidade
`

    const advancedModeRules = advancedMode
      ? `
🔥 MODO AVANÇADO - CRITÉRIOS DE HIT

GANCHO PREMIUM:
- Primeira linha DEVE ser o gancho principal
- Teste: Se não grudar em 3 segundos, refaça
- Melodia implícita clara e memorável

RIMAS PERFEITAS:
- Mínimo 50% de rimas ricas
- Zero rimas falsas ou forçadas
- Rimas naturais da narrativa

LINGUAGEM LIMPA:
- Adequado para rádio e streaming
- Zero palavrões pesados
- Respeito e bom gosto

MÉTRICA COMERCIAL:
- 8-10 sílabas por linha (ideal para melodia)
- Respiração natural garantida
- Fácil de cantar em karaokê
`
      : ""

    const metaforasRule = additionalRequirements
      ? `\n⚡ REQUISITOS ESPECIAIS (PRIORIDADE MÁXIMA):
${additionalRequirements}

Se metáforas especificadas, são OBRIGATÓRIAS no refrão.`
      : ""

    const prompt = `${universalRules}
${advancedModeRules}
${metaforasRule}

${lyricsContext}

🎵 Você é um compositor PROFISSIONAL especializado em criar REFRÕES DE HIT.

Seu objetivo: Criar refrões que GRUDEM NA CABEÇA e façam SUCESSO nas plataformas.

ESPECIFICAÇÕES:
- Gênero: ${genre}
- Ritmo: ${finalRhythm}
- Tema: ${theme}
- Humor: ${mood || "neutro"}

PROCESSO PARA CADA VARIAÇÃO:
1. Identifique o GANCHO principal (frase que vai grudar)
2. Construa em torno do gancho com frases completas
3. Teste mental: É fácil de cantar junto?
4. Verifique: Conecta com a letra existente?

REGRAS ESTRUTURAIS:
- 4 linhas por refrão (padrão comercial)
- Cada linha: 8-10 sílabas (ideal para melodia)
- CADA LINHA = FRASE COMPLETA
- Primeira linha = GANCHO PRINCIPAL
- Repetição estratégica de palavras-chave

DIVERSIDADE CRIATIVA (5 ESTILOS):
1. CHICLETE RADIOFÔNICO: Repetição estratégica, grudento
2. VISUAL E DIRETO: Cena clara, imagem concreta
3. BORDÃO IMPACTANTE: Frase marcante, quotable
4. EMOCIONAL E LEVE: Vulnerabilidade autêntica
5. SURPREENDENTE: Abordagem inesperada, criativa

FORMATO JSON:
{
  "variations": [
    {
      "chorus": "linha 1 (GANCHO)\\nlinha 2 completa\\nlinha 3 completa\\nlinha 4 completa",
      "style": "Estilo (ex: Chiclete Radiofônico)",
      "score": 8-10,
      "hookLine": "A linha que vai grudar na cabeça",
      "commercialAppeal": "Por que vai fazer sucesso",
      "singAlongFactor": "Por que é fácil cantar junto"
    }
  ],
  "bestCommercialOptionIndex": 0-4
}

CRITÉRIOS DE SCORE:
- 10: Hit garantido, gruda na primeira escuta
- 9: Muito forte, potencial de sucesso alto
- 8: Bom comercialmente, funciona bem
- <8: Refaça, não atinge padrão de hit

IMPORTANTE:
- Use contexto da letra existente
- Cada variação TOTALMENTE DIFERENTE
- Todos scores 8-10 (padrão de hit)
- Melhor opção: score 10
- GANCHO na primeira linha sempre
- Frases completas e coerentes

Gere as 5 variações de REFRÃO DE HIT agora:`

    console.log("[v0] Gerando refrão otimizado para hit 2024-2025...")

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.9, // Alta criatividade para hits
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
    }

    console.log("[v0] ✅ Refrão de hit gerado com sucesso!")

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] ❌ Erro ao gerar refrão:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao gerar refrão",
      },
      { status: 500 },
    )
  }
}
