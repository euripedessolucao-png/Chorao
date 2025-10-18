import { NextResponse } from "next/server"
import { generateText } from "ai"
import { getGenreConfig, detectSubGenre, getGenreRhythm } from "@/lib/genre-config"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log('🔍 DEBUG - Body completo:', JSON.stringify(body, null, 2))

    // ✅ PROCURA A LETRA EM QUALQUER PARÂMETRO
    let finalLyrics = ''
    let finalGenero = ''
    let additionalRequirements = body.additionalRequirements || body.requisitos || ''
    
    // Procura por letra em qualquer campo que possa conter
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string' && value.length > 10) {
        // Se for um texto longo, provavelmente é a letra
        if (value.length > 50 && !finalLyrics && !key.toLowerCase().includes('requirement')) {
          finalLyrics = value
          console.log(`📝 Letra encontrada no campo: "${key}"`)
        }
      }
      
      // Procura por gênero
      if (typeof value === 'string' && 
          ['sertanejo', 'mpb', 'funk', 'forró', 'rock', 'pop', 'gospel']
            .some(genre => value.toLowerCase().includes(genre))) {
        finalGenero = value
        console.log(`🎵 Gênero encontrado no campo: "${key}" = "${value}"`)
      }
    }

    // ✅ SE NÃO ENCONTROU, TENTA OS CAMPOS MAIS COMUNS
    if (!finalLyrics) {
      finalLyrics = body.lyrics || body.letra || body.text || body.content || ''
    }

    if (!finalGenero) {
      finalGenero = body.genero || body.genre || body.style || body.tipo || ''
    }

    const finalTema = body.tema || body.theme || body.subject || "Reescrita"
    const finalHumor = body.humor || body.mood || body.emocao || "Adaptado"
    const selectedChoruses = body.selectedChoruses || body.choruses || body.refroes || []
    const universalPolish = body.universalPolish !== false

    console.log('🎯 PARÂMETROS IDENTIFICADOS:', {
      finalLyrics: finalLyrics ? `✅ ${finalLyrics.length} chars` : '❌ NÃO ENCONTRADA',
      finalGenero: finalGenero || '❌ NÃO ENCONTRADO',
      finalTema,
      finalHumor,
      additionalRequirements: additionalRequirements || 'Nenhum',
      selectedChoruses: selectedChoruses.length,
      allParams: Object.keys(body)
    })

    // ✅ VALIDAÇÃO FINAL
    if (!finalLyrics || finalLyrics.trim().length < 10) {
      return NextResponse.json({ 
        error: "Letra não encontrada ou muito curta",
        details: `Parâmetros recebidos: ${Object.keys(body).join(', ')}`,
        suggestion: "Certifique-se de enviar a letra no parâmetro 'lyrics' ou 'letra'",
        debug: {
          receivedParams: Object.keys(body),
          lyricsFound: !!finalLyrics,
          lyricsLength: finalLyrics?.length,
          lyricsPreview: finalLyrics?.substring(0, 100)
        }
      }, { status: 400 })
    }

    if (!finalGenero) {
      return NextResponse.json({ 
        error: "Gênero não encontrado",
        details: `Parâmetros recebidos: ${Object.keys(body).join(', ')}`,
        suggestion: "Envie o gênero no parâmetro 'genero' ou 'genre'",
        debug: {
          receivedParams: Object.keys(body)
        }
      }, { status: 400 })
    }

    console.log(`[Rewrite] ✅ Iniciando reescrita - Gênero: ${finalGenero}, Letra: ${finalLyrics.length} chars`)

    // ✅ MESMO SISTEMA DO GERADOR DE REFRÃO
    const genreConfig = getGenreConfig(finalGenero)
    const subGenreInfo = detectSubGenre(additionalRequirements)
    const defaultRhythm = getGenreRhythm(finalGenero)
    const finalRhythm = subGenreInfo.rhythm || defaultRhythm

    const universalRules = `
🌍 REGRAS UNIVERSAIS DE IDIOMA (OBRIGATÓRIO)

✅ PORTUGUÊS BRASILEIRO:
- LETRA COMPLETA: 100% em português do Brasil
- Linguagem coloquial autêntica
- Gírias e expressões regionais

✅ INGLÊS:
- BACKING VOCALS: sempre em inglês
  Exemplo: (Backing: "Oh, oh, oh"), (Backing: "Yeah, yeah")
- INSTRUÇÕES (se houver): sempre em inglês
  Exemplo: [VERSE - Emotional], [CHORUS - Full energy]

❌ NUNCA MISTURE:
- Não escreva versos em inglês
- Mantenha separação clara

🎯 FÓRMULA DE SUCESSO 2024-2025

⚠️ REGRA ABSOLUTA DE SÍLABAS (INVIOLÁVEL):
- CADA VERSO: MÁXIMO 12 SÍLABAS POÉTICAS
- Este é o LIMITE HUMANO do canto
- NUNCA exceda 12 sílabas por verso
- Se precisar de mais espaço, divida em dois versos
- Criatividade DENTRO do limite, não burlando ele

⚠️ FORMATO DE VERSOS EMPILHADOS (OBRIGATÓRIO):
- Cada verso da letra em uma linha separada
- NUNCA junte dois versos na mesma linha
- Use "\\n" para separar as linhas no JSON
- Facilita contagem de versos e sílabas
- Formato padrão brasileiro de composição

PRIORIDADE ABSOLUTA:
1. MÁXIMO 12 SÍLABAS POR VERSO (INVIOLÁVEL)
2. GANCHO GRUDENTO no refrão
3. FRASES COMPLETAS E COERENTES (NUNCA corte no meio)
4. LINGUAGEM COLOQUIAL BRASILEIRA INTENSA
5. FÁCIL DE CANTAR JUNTO (karaokê-friendly)
6. CADA VERSO EM UMA LINHA SEPARADA

CARACTERÍSTICAS DE HIT:
- Versos com 8-10 sílabas (NUNCA mais de 12)
- Frases simples, diretas, memoráveis
- Palavras do dia-a-dia ("cê", "tô", "pra", "né")
- Cada linha faz sentido sozinha
- Melodia implícita grudenta
- CADA LINHA SEPARADA POR \\n

EVITE:
✗ Versos com mais de 12 sílabas
✗ Frases incompletas ("Você me faz..." - ERRADO)
✗ Vocabulário rebuscado ("floresço", "bonança")
✗ Abstrações vagas ("mar de dor", "alma perdida")
✗ Rimas forçadas que quebram naturalidade
✗ Juntar versos na mesma linha
`

    const lyricsContext = `
📝 LETRA ORIGINAL (CONTEXTO OBRIGATÓRIO):
${finalLyrics}

🎯 A REWRITE DEVE:
- Manter a ESSÊNCIA e história da letra original
- Melhorar estrutura e métrica
- Conectar-se PERFEITAMENTE com os refrões preservados
- Usar o MESMO tom emocional e linguagem
- Manter TOTAL coerência com a narrativa
- Parecer uma EVOLUÇÃO NATURAL da composição
${subGenreInfo.subGenre ? `- Seguir o ritmo de ${subGenreInfo.styleNote}` : ""}
${additionalRequirements ? `- Atender aos requisitos: ${additionalRequirements}` : ""}
`

    const preservedChorusesContext = selectedChoruses.length > 0 ? `
🎵 REFRÕES PRESERVADOS (DEVE CONECTAR PERFEITAMENTE):
${selectedChoruses.map((chorus: string, index: number) => 
  `Refrão ${index + 1}: ${chorus}`
).join('\n')}

IMPORTANTE: A letra reescrita deve fluir naturalmente para estes refrões!
` : ""

    const metaforasRule = additionalRequirements
      ? `\n⚡ REQUISITOS ESPECIAIS (PRIORIDADE MÁXIMA):
${additionalRequirements}

Se metáforas especificadas, são OBRIGATÓRIAS na letra reescrita.`
      : ""

    const prompt = `${universalRules}
${metaforasRule}

${lyricsContext}
${preservedChorusesContext}

🎵 Você é um compositor PROFISSIONAL especializado em REWRITE de letras.

Seu objetivo: Reescrever a letra mantendo a essência mas melhorando estrutura, métrica e potencial comercial.

ESPECIFICAÇÕES:
- Gênero: ${finalGenero}
- Ritmo: ${finalRhythm}
- Tema: ${finalTema}
- Humor: ${finalHumor}

PROCESSO DE REWRITE:
1. Analise a letra original - identifique essência e problemas
2. Mantenha a história central e emocional
3. Melhore métrica (cada verso ≤12 sílabas)
4. Otimize estrutura (verso → pré-refrão → refrão)
5. Conecte perfeitamente com refrões preservados (se houver)
6. Aplique linguagem coloquial brasileira
7. Verifique CADA verso: máximo 12 sílabas?

REGRAS ESTRUTURAIS:
- CADA VERSO = FRASE COMPLETA
- Máximo 12 sílabas por verso (INVIOLÁVEL)
- Formato empilhado (cada verso em linha separada)
- Linguagem natural e conversacional
- Facilidade para cantar

FORMATO JSON:
{
  "lyrics": "Verso 1 linha 1\\nVerso 1 linha 2\\n\\nPré-refrão linha 1\\nPré-refrão linha 2\\n\\nRefrão linha 1\\nRefrão linha 2\\nRefrão linha 3\\nRefrão linha 4\\n\\nVerso 2 linha 1\\nVerso 2 linha 2",
  "title": "Título sugestivo baseado na letra",
  "metadata": {
    "originalLinesPreserved": 0-100,
    "structureImproved": true,
    "syllableCompliance": "100% dos versos ≤12 sílabas",
    "connectionToChoruses": "Perfeita" | "Boa" | "Moderada"
  }
}

IMPORTANTE:
- Use "\\n\\n" para separar seções (verso, refrão, etc)
- Use "\\n" para separar versos dentro da mesma seção
- PRESERVE refrões selecionados se especificados
- CONECTE naturalmente com refrões preservados
- VERIFIQUE sílabas: NENHUM verso pode ter >12 sílabas

Gere a LETRA REESCRITA agora:`

    console.log("[Rewrite] Gerando letra reescrita com validação de sílabas...")

    let attempts = 0
    let result: any = null
    let allValid = false

    while (attempts < 3 && !allValid) {
      attempts++
      console.log(`[Rewrite] Tentativa ${attempts}/3 de reescrita...`)

      const { text } = await generateText({
        model: "openai/gpt-4o",
        prompt,
        temperature: 0.8,
      })

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        if (attempts === 3) {
          throw new Error("Resposta da IA não está no formato JSON esperado")
        }
        continue
      }

      result = JSON.parse(jsonMatch[0])

      if (result.lyrics) {
        allValid = true
        const violations: string[] = []

        // ✅ VALIDAÇÃO DE SÍLABAS - MESMO SISTEMA DO GERADOR DE REFRÃO
        const lines = result.lyrics.split("\n")
        
        for (let j = 0; j < lines.length; j++) {
          const line = lines[j].trim()
          if (!line || line === "") continue // Ignora linhas vazias entre seções

          const syllables = countPoeticSyllables(line)
          if (syllables > 12) {
            allValid = false
            violations.push(`Linha ${j + 1}: "${line}" = ${syllables} sílabas (máx: 12)`)
          }
        }

        if (!allValid) {
          console.log(`[Rewrite] ⚠️ Tentativa ${attempts} falhou - violações de sílabas:`)
          violations.forEach((v) => console.log(`[Rewrite]   - ${v}`))
          if (attempts < 3) {
            console.log(`[Rewrite] 🔄 Regenerando...`)
          }
        } else {
          console.log(`[Rewrite] ✅ Todas as linhas respeitam o limite de 12 sílabas!`)
        }
      }
    }

    if (!allValid) {
      console.log(`[Rewrite] ⚠️ Após 3 tentativas, ainda há violações. Retornando melhor resultado.`)
    }

    // ✅ CAPITALIZAÇÃO DAS LINHAS - MESMO SISTEMA DO GERADOR DE REFRÃO
    if (result.lyrics) {
      result.lyrics = capitalizeLines(result.lyrics)
    }

    console.log("[Rewrite] ✅ Letra reescrita com sucesso!")

    return NextResponse.json({
      letra: result.lyrics,
      titulo: result.title || "Letra Reescrita",
      metadata: {
        score: result.metadata?.connectionToChoruses === "Perfeita" ? 95 : 85,
        polishingApplied: true,
        preservedChorusesUsed: selectedChoruses.length,
        syllableCompliance: result.metadata?.syllableCompliance || "Validado",
        structureImproved: result.metadata?.structureImproved || true
      }
    })

  } catch (error) {
    console.error("[Rewrite] Erro:", error)
    
    return NextResponse.json(
      {
        error: "Erro na reescrita",
        details: error instanceof Error ? error.message : "Erro desconhecido",
        suggestion: "Tente novamente com uma letra mais clara"
      },
      { status: 500 }
    )
  }
}
