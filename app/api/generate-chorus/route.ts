import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { getGenreConfig, detectSubGenre, getGenreRhythm } from "@/lib/genre-config"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter-brasileiro"

export async function POST(request: NextRequest) {
  try {
    const { genre, theme, mood, additionalRequirements, lyrics, advancedMode } = await request.json()

    // ✅ VALIDAÇÃO FLEXÍVEL - NÃO EXIGE LETRA EXISTENTE
    if (!genre || !theme) {
      return NextResponse.json({ error: "Gênero e tema são obrigatórios" }, { status: 400 })
    }

    const genreConfig = getGenreConfig(genre)
    const subGenreInfo = detectSubGenre(additionalRequirements)
    const defaultRhythm = getGenreRhythm(genre)
    const finalRhythm = subGenreInfo.rhythm || defaultRhythm

    // ✅ CONTEXTO FLEXÍVEL - FUNCIONA COM OU SEM LETRA
    const lyricsContext = lyrics
      ? `
📝 LETRA EXISTENTE (CONTEXTO OBRIGATÓRIO):
${lyrics}

🎯 O REFRÃO DEVE:
- Conectar-se PERFEITAMENTE com esta letra
- Usar o MESMO tom emocional e linguagem
- Manter TOTAL coerência com a história
- Parecer parte NATURAL desta composição
`
      : `
🎯 CRIAR REFRÃO ORIGINAL PARA:
- Tema: ${theme}
- Humor: ${mood || "adaptável"}
- Gênero: ${genre}

🎯 O REFRÃO DEVE:
- Ser AUTÔNOMO e funcionar sozinho
- Introduzir o tema de forma impactante  
- Criar gancho memorável na primeira linha
- Ter potencial para ser o momento mais marcante
`

    const universalRules = `
🌍 REGRAS UNIVERSAIS DE REFRÃO (OBRIGATÓRIO)

✅ PORTUGUÊS BRASILEIRO:
- REFRÃO: 100% em português do Brasil
- Linguagem coloquial autêntica: "cê", "tô", "pra", "tá"
- Gírias e expressões regionais

✅ INGLÊS (APENAS INSTRUÇÕES):
- BACKING VOCALS: (Backing: "Oh, oh, oh"), (Backing: "Yeah, yeah")
- INSTRUÇÕES: [CHORUS - Full energy, singalong moment]

🎯 FÓRMULA DE REFRÃO DE SUCESSO:

⚠️ REGRA ABSOLUTA DE SÍLABAS:
- CADA VERSO: MÁXIMO 12 SÍLABAS POÉTICAS
- Ideal: 8-10 sílabas por verso
- NUNCA exceda 12 sílabas - limite humano do canto

⚠️ FORMATO DE VERSOS EMPILHADOS:
- Cada verso do refrão em uma linha separada
- Use "\\n" para separar as linhas no JSON
- Formato padrão brasileiro de composição

PRIORIDADE ABSOLUTA:
1. MÁXIMO 12 SÍLABAS POR VERSO
2. GANCHO GRUDENTO (primeira linha deve grudar na cabeça)
3. FRASES COMPLETAS E COERENTES
4. LINGUAGEM COLOQUIAL BRASILEIRA INTENSA
5. FÁCIL DE CANTAR JUNTO

CARACTERÍSTICAS DE HIT:
- Máximo 4 linhas, cada uma com 8-10 sílabas
- Frases simples, diretas, memoráveis
- Palavras do dia-a-dia
- Cada linha faz sentido sozinha
- Melodia implícita grudenta
`

    const advancedModeRules = advancedMode
      ? `
🔥 MODO AVANÇADO - CRITÉRIOS DE HIT

GANCHO PREMIUM:
- Primeira linha DEVE ser o gancho principal
- Teste: Se não grudar em 3 segundos, refaça
- Melodia implícita clara e memorável

RIMAS PERFEITAS:
- Mínimo 50% de rimas ricas para ${genre}
- Zero rimas falsas ou forçadas
- Rimas naturais da narrativa

LINGUAGEM LIMPA:
- Adequado para rádio e streaming
- Zero palavrões pesados
- Respeito e bom gosto
`
      : ""

    const metaforasRule = additionalRequirements
      ? `
⚡ REQUISITOS ESPECIAIS (PRIORIDADE MÁXIMA):
${additionalRequirements}

Se metáforas especificadas, são OBRIGATÓRIAS no refrão.`
      : ""

    const prompt = `${universalRules}
${advancedModeRules}
${metaforasRule}

${lyricsContext}
${subGenreInfo.subGenre ? `- Seguir o ritmo de ${subGenreInfo.styleNote}` : ""}

🎵 Você é um compositor PROFISSIONAL especializado em REFRÕES DE HIT.

ESPECIFICAÇÕES:
- Gênero: ${genre}
- Ritmo: ${finalRhythm}
- Tema: ${theme}
- Humor: ${mood || "neutro"}

PROCESSO PARA CADA VARIAÇÃO:
1. Identifique o GANCHO principal (frase que vai grudar)
2. Construa em torno do gancho com frases completas
3. VERIFIQUE: Cada verso tem no máximo 12 sílabas?
4. Teste mental: É fácil de cantar junto?
5. ${lyrics ? "Verifique: Conecta com a letra existente?" : "Verifique: Funciona como refrão autônomo?"}

REGRAS ESTRUTURAIS:
- 4 linhas por refrão (padrão comercial)
- Cada linha: 8-10 sílabas (NUNCA mais de 12)
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
  "bestCommercialOptionIndex": 0-4,
  "generationType": "${lyrics ? "BasedOnExistingLyrics" : "OriginalCreation"}"
}

CRITÉRIOS DE SCORE:
- 10: Hit garantido, gruda na primeira escuta
- 9: Muito forte, potencial de sucesso alto  
- 8: Bom comercialmente, funciona bem
- <8: Refaça, não atinge padrão de hit

IMPORTANTE:
- ${lyrics ? "Use contexto da letra existente" : "Crie refrão autônomo e impactante"}
- Cada variação TOTALMENTE DIFERENTE
- Todos scores 8-10 (padrão de hit)
- Melhor opção: score 10
- GANCHO na primeira linha sempre
- Frases completas e coerentes

Gere as 5 variações de REFRÃO DE HIT agora:`

    console.log(`[Chorus-Generator] Gerando refrão: ${lyrics ? "baseado em letra existente" : "criação original"}`)

    let attempts = 0
    let result: any = null
    let allValid = false

    while (attempts < 3 && !allValid) {
      attempts++
      console.log(`[Chorus-Generator] Tentativa ${attempts}/3...`)

      const { text } = await generateText({
        model: "openai/gpt-4o",
        prompt,
        temperature: 0.9,
      })

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        if (attempts === 3) {
          throw new Error("Resposta da IA não está no formato JSON esperado")
        }
        continue
      }

      result = JSON.parse(jsonMatch[0])

      if (result.variations && Array.isArray(result.variations)) {
        allValid = true
        const violations: string[] = []

        for (let i = 0; i < result.variations.length; i++) {
          const variation = result.variations[i]
          const lines = variation.chorus.split("\\n")

          for (let j = 0; j < lines.length; j++) {
            const line = lines[j].trim()
            if (!line) continue

            const syllables = countPoeticSyllables(line)
            if (syllables > 12) {
              allValid = false
              violations.push(`Variação ${i + 1}, linha ${j + 1}: "${line}" = ${syllables} sílabas (máx: 12)`)
            }
          }
        }

        if (!allValid) {
          console.log(`[Chorus-Generator] ⚠️ Tentativa ${attempts} falhou - violações de sílabas:`)
          violations.forEach((v) => console.log(`[Chorus-Generator]   - ${v}`))
          if (attempts < 3) {
            console.log(`[Chorus-Generator] 🔄 Regenerando...`)
          }
        } else {
          console.log(`[Chorus-Generator] ✅ Todas as variações respeitam o limite de 12 sílabas!`)
        }
      }
    }

    if (!allValid) {
      console.log(`[Chorus-Generator] ⚠️ Após 3 tentativas, ainda há violações. Retornando melhor resultado.`)
    }

    if (result.variations && Array.isArray(result.variations)) {
      result.variations = result.variations.map((variation: any) => ({
        ...variation,
        chorus: capitalizeLines(variation.chorus),
      }))
    }

    console.log(`[Chorus-Generator] ✅ Refrão gerado com sucesso! Tipo: ${lyrics ? "Baseado em letra" : "Original"}`)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[Chorus-Generator] ❌ Erro ao gerar refrão:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao gerar refrão",
      },
      { status: 500 },
    )
  }
}
