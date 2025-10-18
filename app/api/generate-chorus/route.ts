import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { getGenreConfig, detectSubGenre, getGenreRhythm } from "@/lib/genre-config"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter"

export async function POST(request: NextRequest) {
  try {
    const { 
      genre, 
      theme, 
      mood, 
      additionalRequirements, 
      lyrics,  // ✅ OPCIONAL - funciona com ou sem
      advancedMode 
    } = await request.json()

    console.log('🎵 [Generate-Chorus] Parâmetros:', {
      genre,
      theme,
      mood,
      hasLyrics: !!lyrics,
      lyricsLength: lyrics?.length
    })

    if (!genre || !theme) {
      return NextResponse.json({ 
        error: "Gênero e tema são obrigatórios",
        suggestion: "Selecione um gênero musical e digite um tema para gerar refrões"
      }, { status: 400 })
    }

    const genreConfig = getGenreConfig(genre)
    const subGenreInfo = detectSubGenre(additionalRequirements)
    const defaultRhythm = getGenreRhythm(genre)
    const finalRhythm = subGenreInfo.rhythm || defaultRhythm

    // ✅ CONTEXTO INTELIGENTE - funciona COM ou SEM letra
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
🎯 CONTEXTO DE CRIAÇÃO LIVRE:
- Crie refrões ORIGINAIS sobre "${theme}"
- Use linguagem autêntica do ${genre}
- Desenvolva uma narrativa coerente
- Cada variação pode explorar ângulos diferentes
`

    const universalRules = `
🌍 REGRAS UNIVERSAIS DE IDIOMA (OBRIGATÓRIO)

✅ PORTUGUÊS BRASILEIRO:
- LETRAS DO REFRÃO: 100% em português do Brasil
- Linguagem coloquial autêntica
- Gírias e expressões regionais
- Contrações: "cê", "tô", "pra", "tá"

✅ INGLÊS:
- BACKING VOCALS: sempre em inglês
  Exemplo: (Backing: "Oh, oh, oh"), (Backing: "Yeah, yeah")
- INSTRUÇÕES (se houver): sempre em inglês
  Exemplo: [CHORUS - Full energy, singalong moment]

🎯 FÓRMULA DE REFRÃO DE SUCESSO 2024-2025

⚠️ REGRA ABSOLUTA DE SÍLABAS (INVIOLÁVEL):
- CADA VERSO: MÁXIMO 12 SÍLABAS POÉTICAS
- Este é o LIMITE HUMANO do canto
- NUNCA exceda 12 sílabas por verso
- Criatividade DENTRO do limite, não burlando ele

⚠️ FORMATO DE VERSOS EMPILHADOS (OBRIGATÓRIO):
- Cada verso do refrão em uma linha separada
- NUNCA junte dois versos na mesma linha
- Use "\\n" para separar as linhas no JSON

EXEMPLO CORRETO (cada verso ≤12 sílabas):
"chorus": "Cê me testa, olha e sorri\\nSaudade é punhal no peito\\nTô no meu flow\\nVocê me faz sonhar"

PRIORIDADE ABSOLUTA:
1. MÁXIMO 12 SÍLABAS POR VERSO (INVIOLÁVEL)
2. GANCHO GRUDENTO (primeira linha deve grudar na cabeça)
3. FRASES COMPLETAS E COERENTES
4. LINGUAGEM COLOQUIAL BRASILEIRA INTENSA
5. FÁCIL DE CANTAR JUNTO (karaokê-friendly)

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

${subGenreInfo.subGenre ? `- Seguir o ritmo de ${subGenreInfo.styleNote}` : ""}

🎵 Você é um compositor PROFISSIONAL especializado em criar REFRÕES DE HIT.

Seu objetivo: Criar refrões que GRUDEM NA CABEÇA e façam SUCESSO nas plataformas.

ESPECIFICAÇÕES:
- Gênero: ${genre}
- Ritmo: ${finalRhythm}
- Tema: ${theme}
- Humor: ${mood || "adequado ao tema"}
${lyrics ? '- Contexto: Baseado na letra existente' : '- Contexto: Criação original'}

PROCESSO PARA CADA VARIAÇÃO:
1. Identifique o GANCHO principal (frase que vai grudar)
2. Construa em torno do gancho com frases completas
3. VERIFIQUE: Cada verso tem no máximo 12 sílabas?
4. Teste mental: É fácil de cantar junto?
5. ${lyrics ? 'Verifique: Conecta com a letra existente?' : 'Verifique: Desenvolve o tema coerentemente?'}

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
      "justification": "Por que este refrão funciona bem",
      "hookLine": "A linha que vai grudar na cabeça",
      "commercialAppeal": "Potencial de sucesso comercial",
      "singAlongFactor": "Facilidade para cantar junto"
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
- ${lyrics ? 'Use contexto da letra existente' : 'Desenvolva o tema coerentemente'}
- Cada variação TOTALMENTE DIFERENTE
- Todos scores 8-10 (padrão de hit)
- Melhor opção: score 10
- GANCHO na primeira linha sempre
- Frases completas e coerentes

Gere as 5 variações de REFRÃO DE HIT agora:`

    console.log(`[Generate-Chorus] Gerando refrões ${lyrics ? 'com contexto' : 'originais'}...`)

    let attempts = 0
    let result: any = null
    let allValid = false

    while (attempts < 3 && !allValid) {
      attempts++
      console.log(`[Generate-Chorus] Tentativa ${attempts}/3...`)

      const { text } = await generateText({
        model: "openai/gpt-4o",
        prompt,
        temperature: 0.8,
      })

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.log(`[Generate-Chorus] ❌ Resposta não é JSON, tentativa ${attempts}`)
        if (attempts === 3) {
          // ✅ FALLBACK: Geração simples se JSON falhar
          return await generateFallbackChoruses(genre, theme, mood)
        }
        continue
      }

      try {
        result = JSON.parse(jsonMatch[0])

        if (result.variations && Array.isArray(result.variations)) {
          allValid = true
          const violations: string[] = []

          // ✅ VALIDAÇÃO DE SÍLABAS
          for (let i = 0; i < result.variations.length; i++) {
            const variation = result.variations[i]
            const lines = variation.chorus.split("\\n")

            for (let j = 0; j < lines.length; j++) {
              const line = lines[j].trim()
              if (!line) continue

              const syllables = countPoeticSyllables(line)
              if (syllables > 12) {
                allValid = false
                violations.push(`Variação ${i + 1}, linha ${j + 1}: "${line}" = ${syllables} sílabas`)
              }
            }
          }

          if (!allValid && attempts < 3) {
            console.log(`[Generate-Chorus] ⚠️ Violações de sílabas, regenerando...`)
            violations.forEach(v => console.log(`   - ${v}`))
          } else if (allValid) {
            console.log(`[Generate-Chorus] ✅ Todas as variações válidas!`)
          }
        }
      } catch (error) {
        console.log(`[Generate-Chorus] ❌ Erro no JSON, tentativa ${attempts}:`, error)
        if (attempts === 3) {
          return await generateFallbackChoruses(genre, theme, mood)
        }
      }
    }

    // ✅ CAPITALIZAÇÃO E FORMATAÇÃO FINAL
    if (result.variations) {
      result.variations = result.variations.map((variation: any) => ({
        ...variation,
        chorus: capitalizeLines(variation.chorus.replace(/\\n/g, '\n')).replace(/\n/g, '\\n'),
        justification: variation.justification || "Refrão otimizado para sucesso comercial"
      }))
    }

    // ✅ GARANTE MELHOR OPÇÃO
    if (result.bestCommercialOptionIndex === undefined) {
      result.bestCommercialOptionIndex = 0
    }

    console.log(`[Generate-Chorus] ✅ ${result.variations.length} refrões gerados com sucesso!`)

    return NextResponse.json(result)

  } catch (error) {
    console.error("[Generate-Chorus] ❌ Erro:", error)
    
    // ✅ FALLBACK FINAL EM CASO DE ERRO
    try {
      const fallback = await generateFallbackChoruses(
        (await request.json()).genre, 
        (await request.json()).theme, 
        (await request.json()).mood
      )
      return fallback
    } catch (fallbackError) {
      return NextResponse.json(
        {
          error: "Erro ao gerar refrões",
          details: error instanceof Error ? error.message : "Erro desconhecido",
          suggestion: "Tente novamente com um tema mais específico"
        },
        { status: 500 }
      )
    }
  }
}

// ✅ FALLBACK PARA QUANDO O SISTEMA PRINCIPAL FALHAR
async function generateFallbackChoruses(genre: string, theme: string, mood: string = "neutro") {
  console.log('[Generate-Chorus] 🔄 Usando fallback...')
  
  const prompt = `Gere 3 refrões sobre "${theme}" no estilo ${genre}:
- Máximo 4 linhas cada
- Máximo 12 sílabas por linha
- Linguagem coloquial brasileira
- Contrações: "cê", "tô", "pra", "tá"
- Humor: ${mood}

Formato JSON simples:
{
  "variations": [
    {
      "chorus": "Linha 1\\nLinha 2\\nLinha 3\\nLinha 4",
      "style": "Estilo Comercial",
      "score": 8,
      "justification": "Refrão cativante e memorável"
    }
  ],
  "bestCommercialOptionIndex": 0
}`

  const { text } = await generateText({
    model: "openai/gpt-4o",
    prompt,
    temperature: 0.7
  })

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    const result = JSON.parse(jsonMatch[0])
    
    // ✅ FORMATAÇÃO BÁSICA
    if (result.variations) {
      result.variations = result.variations.map((variation: any) => ({
        ...variation,
        chorus: capitalizeLines(variation.chorus.replace(/\\n/g, '\n')).replace(/\n/g, '\\n')
      }))
    }
    
    return NextResponse.json(result)
  }

  // ✅ FALLBACK ABSOLUTO
  return NextResponse.json({
    variations: [
      {
        chorus: `Vou cantar sobre ${theme}\\nNo ritmo do ${genre}\\nCom alegria no peito\\nE muita emoção pra te dar`,
        style: "Estilo Básico",
        score: 7,
        justification: "Refrão funcional para começar"
      }
    ],
    bestCommercialOptionIndex: 0
  })
}
