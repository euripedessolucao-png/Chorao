import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { getGenreConfig, detectSubGenre, getGenreRhythm } from "@/lib/genre-config"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"

export async function POST(request: NextRequest) {
  try {
    const { genre, theme, mood, additionalRequirements, lyrics } = await request.json()

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
LETRA EXISTENTE (CONTEXTO OBRIGATÓRIO):
${lyrics}

IMPORTANTE: O refrão DEVE:
- Conectar-se tematicamente com esta letra
- Usar o mesmo tom emocional
- Manter coerência com a história/narrativa
- Parecer parte natural desta composição
- Respeitar o estilo e linguagem estabelecidos
${subGenreInfo.subGenre ? `- Seguir o ritmo de ${subGenreInfo.styleNote}` : ""}
`

    const universalRules = `
🎵 REGRAS UNIVERSAIS - TERCEIRA VIA

PRIORIDADES (EM ORDEM):
1. FRASES COMPLETAS E COERENTES (NUNCA corte frases no meio)
2. LINGUAGEM SIMPLES E BRASILEIRA
3. MÉTRICA NATURAL (ideal 8-12 sílabas, mas frases completas são mais importantes)
4. EMOÇÃO E GANCHO MEMORÁVEL

LINGUAGEM:
- Palavras do dia-a-dia, coloquiais
- PROIBIDO: rebuscado, poético, literário
- PERMITIDO: gírias, contrações ("tô", "cê", "pra")

MÉTRICA (GUIDELINE, NÃO REGRA ABSOLUTA):
- Ideal: 8-12 sílabas por verso
- Cada verso cabe em um fôlego natural
- Se necessário ultrapassar 12 sílabas para completar a frase, FAÇA
- NUNCA corte uma frase no meio para respeitar sílabas
- Versos empilhados (um por linha)

PROCESSO TERCEIRA VIA PARA REFRÃO:
- (A) Métrica/Ritmo: fluidez e respiração natural
- (B) Emoção/Gancho: memorável, autêntico e grudento
- (C) Síntese: combine A+B = refrão comercial perfeito

IMPORTANTE NA SÍNTESE (C):
- Priorize frases completas e coerentes
- Cada linha deve fazer sentido sozinha
- NUNCA deixe frases pela metade
- Exemplo ERRADO: "Você me faz" (incompleto)
- Exemplo CERTO: "Você me faz sonhar" (completo)
`

    const metaforasRule = additionalRequirements
      ? `\nREQUISITOS ADICIONAIS (PRIORIDADE ABSOLUTA):
${additionalRequirements}

METÁFORAS: Se especificadas, são OBRIGATÓRIAS no refrão.`
      : ""

    const prompt = `${universalRules}${metaforasRule}

${lyricsContext}

Você é um compositor profissional especializado em refrões comerciais.

TAREFA: Gere 5 variações de refrão aplicando TERCEIRA VIA.

ESPECIFICAÇÕES:
- Gênero: ${genre}
- Ritmo: ${finalRhythm}
- Tema: ${theme}
- Humor: ${mood || "neutro"}

PROCESSO PARA CADA VARIAÇÃO:
1. Gere versão (A): foco em MÉTRICA e FLUIDEZ natural
2. Gere versão (B): foco em EMOÇÃO e GANCHO memorável
3. Síntese (C): combine o melhor de A e B = refrão final
   ATENÇÃO: Cada linha DEVE ser uma frase completa e coerente
   NUNCA corte frases no meio para respeitar sílabas

REGRAS ESTRUTURAIS:
- 2 ou 4 linhas por refrão (NUNCA 3)
- Versos empilhados (um por linha)
- Máximo 4 linhas total
- CADA LINHA DEVE SER UMA FRASE COMPLETA
- CRIATIVIDADE: cada opção deve ser ÚNICA

REGRAS DE PROSÓDIA (${genreConfig.name}):
- Com vírgula: máx ${genreConfig.prosody_rules.syllable_count.with_comma.max_before_comma} sílabas antes, ${genreConfig.prosody_rules.syllable_count.with_comma.max_after_comma} depois
- Sem vírgula: ${genreConfig.prosody_rules.syllable_count.without_comma.min}-${genreConfig.prosody_rules.syllable_count.without_comma.max} sílabas (ideal, não absoluto)

DIVERSIDADE CRIATIVA (OBRIGATÓRIA):
- Opção 1: Chiclete radiofônico (repetição estratégica)
- Opção 2: Visual e direto (cena clara)
- Opção 3: Bordão impactante (frase marcante)
- Opção 4: Emocional e leve (vulnerabilidade)
- Opção 5: Surpreendente (abordagem inesperada)

FORMATO JSON:
{
  "variations": [
    {
      "chorus": "linha 1 completa\\nlinha 2 completa\\nlinha 3 completa\\nlinha 4 completa",
      "style": "Descrição do estilo",
      "score": 1-10,
      "justification": "Por que funciona comercialmente",
      "terceiraViaProcess": {
        "metricVersion": "versão A (métrica)",
        "emotionalVersion": "versão B (emoção)",
        "synthesis": "versão C final (síntese)"
      }
    }
  ],
  "bestCommercialOptionIndex": 0-4
}

IMPORTANTE:
- Use o contexto da letra existente
- Cada variação COMPLETAMENTE DIFERENTE
- Scores entre 7-10
- Melhor opção: score 9-10
- Use "\\n" para separar linhas
- CADA LINHA DEVE SER UMA FRASE COMPLETA E COERENTE
- NUNCA corte frases no meio

Gere as 5 variações CRIATIVAS agora:`

    console.log("[v0] Gerando refrão com Terceira Via e contexto da letra...")

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
    }

    console.log("[v0] Refrão gerado com sucesso usando Terceira Via")

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Erro ao gerar refrão:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao gerar refrão",
      },
      { status: 500 },
    )
  }
}
