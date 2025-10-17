import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { getGenreConfig, detectSubGenre, getGenreRhythm } from "@/lib/genre-config"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { countPoeticSyllables } from "@/lib/validation/syllableUtils"

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
🌍 REGRAS UNIVERSAIS DE IDIOMA (OBRIGATÓRIO)

✅ PORTUGUÊS BRASILEIRO:
- LETRAS DO REFRÃO: 100% em português do Brasil
- Linguagem coloquial autêntica
- Gírias e expressões regionais

✅ INGLÊS:
- BACKING VOCALS: sempre em inglês
  Exemplo: (Backing: "Oh, oh, oh"), (Backing: "Yeah, yeah")
- INSTRUÇÕES (se houver): sempre em inglês
  Exemplo: [CHORUS - Full energy, singalong moment]

❌ NUNCA MISTURE:
- Não escreva refrão em inglês
- Mantenha separação clara

🎯 FÓRMULA DE REFRÃO DE SUCESSO 2024-2025

⚠️ REGRA ABSOLUTA DE SÍLABAS (INVIOLÁVEL):
- CADA VERSO: MÁXIMO 12 SÍLABAS POÉTICAS
- Este é o LIMITE HUMANO do canto
- NUNCA exceda 12 sílabas por verso
- Se precisar de mais espaço, divida em dois versos
- Criatividade DENTRO do limite, não burlando ele

⚠️ FORMATO DE VERSOS EMPILHADOS (OBRIGATÓRIO):
- Cada verso do refrão em uma linha separada
- NUNCA junte dois versos na mesma linha
- Use "\\n" para separar as linhas no JSON
- Facilita contagem de versos e sílabas
- Formato padrão brasileiro de composição

EXEMPLO CORRETO (cada verso ≤12 sílabas):
"chorus": "Cê me testa, olha e sorri\\nSaudade é punhal no peito\\nTô no meu flow\\nVocê me faz sonhar"

EXEMPLO ERRADO (NÃO FAÇA):
"chorus": "Cê me testa, olha e sorri, saudade é punhal no peito" ❌ (versos juntos)
"chorus": "Você me deixou sozinho aqui pensando em tudo que passou" ❌ (mais de 12 sílabas)

PRIORIDADE ABSOLUTA:
1. MÁXIMO 12 SÍLABAS POR VERSO (INVIOLÁVEL)
2. GANCHO GRUDENTO (primeira linha deve grudar na cabeça)
3. FRASES COMPLETAS E COERENTES (NUNCA corte no meio)
4. LINGUAGEM COLOQUIAL BRASILEIRA INTENSA
5. FÁCIL DE CANTAR JUNTO (karaokê-friendly)
6. CADA VERSO EM UMA LINHA SEPARADA

CARACTERÍSTICAS DE HIT:
- Máximo 4 linhas, cada uma com 8-10 sílabas (NUNCA mais de 12)
- Frases simples, diretas, memoráveis
- Palavras do dia-a-dia ("cê", "tô", "pra", "né")
- Cada linha faz sentido sozinha
- Melodia implícita grudenta
- CADA LINHA SEPARADA POR \\n

EXEMPLOS DE HITS 2024-2025 (formato empilhado, ≤12 sílabas):
✓ "Cê me testa, olha e sorri\\nSaudade é punhal no peito\\nTô no meu flow\\nVocê me faz sonhar"
✓ "Se quer saber de mim\\nPergunte para mim\\nSe for falar do que passou\\nConta a parte que você errou"

EVITE:
✗ Versos com mais de 12 sílabas
✗ Frases incompletas ("Você me faz..." - ERRADO)
✗ Vocabulário rebuscado ("floresço", "bonança")
✗ Abstrações vagas ("mar de dor", "alma perdida")
✗ Rimas forçadas que quebram naturalidade
✗ Juntar versos na mesma linha
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
3. VERIFIQUE: Cada verso tem no máximo 12 sílabas?
4. Teste mental: É fácil de cantar junto?
5. Verifique: Conecta com a letra existente?

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

    let attempts = 0
    let result: any = null
    let allValid = false

    while (attempts < 3 && !allValid) {
      attempts++
      console.log(`[v0] Tentativa ${attempts}/3 de geração de refrão...`)

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

            const syllables = countSyllables(line)
            if (syllables > 12) {
              allValid = false
              violations.push(`Variação ${i + 1}, linha ${j + 1}: "${line}" = ${syllables} sílabas (máx: 12)`)
            }
          }
        }

        if (!allValid) {
          console.log(`[v0] ⚠️ Tentativa ${attempts} falhou - violações de sílabas:`)
          violations.forEach((v) => console.log(`[v0]   - ${v}`))
          if (attempts < 3) {
            console.log(`[v0] 🔄 Regenerando...`)
          }
        } else {
          console.log(`[v0] ✅ Todas as variações respeitam o limite de 12 sílabas!`)
        }
      }
    }

    if (!allValid) {
      console.log(`[v0] ⚠️ Após 3 tentativas, ainda há violações. Retornando melhor resultado.`)
    }

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
