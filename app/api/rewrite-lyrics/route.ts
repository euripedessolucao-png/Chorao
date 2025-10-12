import { generateText } from "ai"
import { NextResponse } from "next/server"
import { ThirdWayEngine } from "@/lib/third-way-converter"
import { BACHATA_BRASILEIRA_2024 } from "@/lib/genres/bachata_brasileira_2024"
import { SERTANEJO_MODERNO_2024 } from "@/lib/genres/sertanejo_moderno_2024"
import { GENRE_CONFIGS } from "@/lib/genre-config"
import { getAntiForcingRulesForGenre } from "@/lib/validation/anti-forcing-validator"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { validateRhymesForGenre } from "@/lib/validation/rhyme-validator"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      letraOriginal,
      generoConversao,
      conservarImagens,
      polirSemMexer,
      metrics,
      formattingStyle,
      additionalRequirements,
    } = body

    const isBachata = generoConversao.toLowerCase().includes("bachata")
    const isSertanejo = generoConversao.toLowerCase().includes("sertanejo")
    const isPerformanceMode = formattingStyle === "performatico"

    const genreConfig = isBachata
      ? BACHATA_BRASILEIRA_2024
      : isSertanejo
        ? SERTANEJO_MODERNO_2024
        : GENRE_CONFIGS[generoConversao as keyof typeof GENRE_CONFIGS]

    const instrumentMatch = letraOriginal.match(/\(Instruments?:\s*\[([^\]]+)\]/i)
    const originalInstruments = instrumentMatch ? instrumentMatch[1].trim() : null

    const hasPerformanceMode =
      /\[(?:INTRO|VERSE|CHORUS|BRIDGE|OUTRO)\s*-\s*[^\]]+\]/.test(letraOriginal) || isPerformanceMode

    const antiForcingRules = getAntiForcingRulesForGenre(generoConversao)
    const antiForcingExamples = antiForcingRules
      .slice(0, 3)
      .map((rule) => `- "${rule.keyword}": ${rule.description}`)
      .join("\n")

    const rhymeInstructions = generoConversao.toLowerCase().includes("sertanejo raiz")
      ? `\n\n🎵 REGRAS DE RIMA PARA SERTANEJO RAIZ (OBRIGATÓRIAS E INVIOLÁVEIS):

⭐ RIMA RICA É OBRIGATÓRIA (mínimo 50% das rimas):
- Rima Rica = palavras de CLASSES GRAMATICAIS DIFERENTES
- Substantivo + Verbo: "amor" (substantivo) + "cantar" (verbo) ✓
- Substantivo + Adjetivo: "flor" (substantivo) + "melhor" (adjetivo) ✓
- Verbo + Adjetivo: "partir" (verbo) + "sentir" (verbo) ✗ (mesma classe = POBRE)

📋 EXEMPLOS DE RIMAS RICAS PERFEITAS:
1. "porteira" (substantivo) + "bananeira" (substantivo) - ACEITO (objetos diferentes)
2. "viola" (substantivo) + "sacola" (substantivo) - ACEITO
3. "sertão" (substantivo) + "coração" (substantivo) - ACEITO
4. "jardim" (substantivo) + "capim" (substantivo) - ACEITO
5. "amor" (substantivo) + "flor" (substantivo) - ACEITO
6. "cantar" (verbo) + "luar" (substantivo) - RICO ✓
7. "partir" (verbo) + "sentir" (verbo) - POBRE ✗
8. "paixão" (substantivo) + "razão" (substantivo) - ACEITO

❌ EXEMPLOS DE RIMAS POBRES (EVITAR):
- "amor" + "dor" (ambos substantivos abstratos)
- "cantar" + "amar" (ambos verbos)
- "feliz" + "infeliz" (ambos adjetivos)

🚫 RIMAS FALSAS SÃO PROIBIDAS:
- "peito" + "abraço" ✗ (não rimam)
- "jardim" + "dor" ✗ (não rimam)
- "mão" + "recado" ✗ (não rimam)

✅ COMO CRIAR RIMAS RICAS:
1. Escolha a palavra final do verso (ex: "porteira")
2. Busque uma palavra que rime PERFEITAMENTE (ex: "bananeira", "poeira", "madeira")
3. Verifique se são classes diferentes OU objetos concretos diferentes
4. Se for mesma classe abstrata (amor/dor), TROQUE por outra palavra

IMPORTANTE: A tradição do Sertanejo Raiz e moda de viola EXIGE rimas ricas e perfeitas.
Compositores como Almir Sater, Chitãozinho & Xororó sempre usam rimas de alta qualidade.`
      : generoConversao.toLowerCase().includes("sertanejo moderno")
        ? `\n\nREGRAS DE RIMA (SERTANEJO MODERNO):
- PREFIRA rimas ricas (classes gramaticais diferentes)
- Aceita algumas rimas pobres (mesma classe) se forem naturais
- Aceita poucas rimas falsas (máximo 20%) se servirem à narrativa
- Exemplos de rimas ricas: "amor" (substantivo) + "melhor" (adjetivo)
- Rimas devem soar naturais, não forçadas`
        : generoConversao.toLowerCase().includes("mpb")
          ? `\n\nREGRAS DE RIMA (MPB):
- Alta qualidade de rimas: prefira rimas ricas e perfeitas
- Evite rimas óbvias ou clichês ("amor/dor", "paixão/ilusão")
- Use rimas criativas e surpreendentes
- Rimas toantes (apenas vogais) são aceitáveis se bem usadas`
          : generoConversao.toLowerCase().includes("pagode") || generoConversao.toLowerCase().includes("samba")
            ? `\n\nREGRAS DE RIMA (PAGODE/SAMBA):
- Rimas naturais e fluidas, que não quebrem o swing
- Varie entre rimas ricas e pobres para evitar monotonia
- Rimas devem facilitar a cantabilidade, não dificultar`
            : `\n\nREGRAS DE RIMA:
- Use rimas naturais que soem bem ao cantar
- Prefira rimas ricas (classes gramaticais diferentes) quando possível
- Evite rimas forçadas ou artificiais`

    const languageRule = additionalRequirements
      ? `ATENÇÃO: Os requisitos adicionais do compositor têm PRIORIDADE ABSOLUTA sobre qualquer regra abaixo:
${additionalRequirements}

REGRA UNIVERSAL DE METÁFORAS:
- Metáforas solicitadas pelo compositor DEVEM ser respeitadas e inseridas na letra
- Não altere, ignore ou substitua metáforas especificadas nos requisitos adicionais
- Integre as metáforas de forma natural no contexto emocional da música
- Se o compositor pediu uma metáfora específica, ela é OBRIGATÓRIA na composição

`
      : `REGRA UNIVERSAL DE LINGUAGEM (INVIOLÁVEL):
- Use APENAS palavras simples e coloquiais do dia-a-dia
- Fale como um humano comum fala na conversa cotidiana
- PROIBIDO: vocabulário rebuscado, poético, literário ou formal
- PERMITIDO: gírias, contrações, expressões populares
- Exemplo BOM: "tô", "cê", "pra", "né", "mano"
- Exemplo RUIM: "outono da alma", "florescer", "bonança"

`

    const antiForcingRule = `
🚫 REGRA UNIVERSAL ANTI-FORÇAÇÃO (CRÍTICA):
Você é um compositor humano, não um robô de palavras-chave.
- Se for relevante para a emoção da cena, você PODE usar referências do gênero
- NUNCA force essas palavras só para "cumprir regras"
- A cena deve surgir NATURALMENTE da dor, alegria, superação ou celebração
- Se a narrativa não pedir uma referência específica, NÃO a inclua
- Autenticidade é mais importante que atualidade forçada

Exemplos para ${generoConversao}:
${antiForcingExamples}

EXEMPLO RUIM: "Ela de biquíni à meia-noite no jantar" (incoerente, forçado)
EXEMPLO BOM: "Meu biquíni novo, o que você chamava de falha" (coerente com emoção)
`

    const genreSpecificGuidance = generoConversao.toLowerCase().includes("sertanejo moderno")
      ? `
🎯 SERTANEJO MODERNO 2025 - CARACTERÍSTICAS OBRIGATÓRIAS:

TOM CORRETO (OBRIGATÓRIO):
- Confidente e sincero (NÃO dramático ou pesado)
- Vulnerabilidade COM atitude (NÃO sofrência passiva)
- Às vezes brincalhão e leve (NÃO sempre sério)
- Saudade SAUDÁVEL (NÃO dependência tóxica)

TEMAS PERMITIDOS:
✅ Superação com leveza ("errei mas cresci", "tô em paz comigo")
✅ Celebração da vida simples (boteco, amigos, estrada, violão)
✅ Nova chance ou paz interior (NÃO "não vivo sem você")
✅ Reflexão ou cura com amigos (cerveja, conversa, música)
✅ Amor que liberta (NÃO amor que prende)

TEMAS PROIBIDOS:
❌ Drama excessivo ("meu mundo desabou", "não consigo viver")
❌ Sofrência passiva ("choro no travesseiro", "solidão me mata")
❌ Dependência tóxica ("só penso em você", "volta pra mim")
❌ Metáforas abstratas pesadas ("mar de dor", "alma perdida")
❌ Masculinidade tóxica ("mulher é tudo igual", "vou destruir")

LINGUAGEM OBRIGATÓRIA:
- Objetos concretos: cerveja, violão, boteco, estrada, caminhonete, chapéu
- Ações de superação: errei, aprendi, segui, curei, cresci, perdoei
- Frases de paz: "tô em paz comigo", "amor que prende não é amor"

NARRATIVA OBRIGATÓRIA:
Início (erro ou dor leve) → Meio (reflexão/cura com amigos) → Fim (nova chance OU paz interior)

TRANSFORME DRAMA PESADO EM SUPERAÇÃO LEVE:
- "O silêncio pesa" → "Errei, mas aprendi"
- "Suspeitas no ar" → "Hoje tô em paz comigo"
- "Não vivo sem você" → "Amor que prende não é amor"
`
      : ""

    const metricInfo = metrics
      ? `\n\nMÉTRICA DO GÊNERO:
- Sílabas por linha: ${metrics.syllablesPerLine}
- Máximo absoluto: ${metrics.maxSyllables || metrics.syllablesPerLine + 2}
- BPM: ${metrics.bpm}
- Estrutura: ${metrics.structure}`
      : ""

    const formatoEstrutura = isPerformanceMode
      ? `FORMATO DE SAÍDA OBRIGATÓRIO (MODO PERFORMÁTICO):
Título: [título derivado do refrão - 2 a 4 palavras impactantes]

[INTRO - Descrição detalhada da instrumentação, atmosfera e entrada musical]

[VERSE 1 - Descrição da voz, instrumentação e ritmo]
[primeiro verso completo - 4 linhas em português]

[CHORUS - Descrição da energia, instrumentos e dinâmica]
[refrão completo em português]
(Performance: [direções de palco se houver])

[VERSE 2 - Descrição das mudanças musicais]
[segundo verso completo em português]

[BRIDGE - Descrição da pausa dramática e mudança]
[ponte completa em português]

[FINAL CHORUS - Descrição da energia máxima]
[refrão final em português]

[OUTRO - Descrição do fade out e encerramento]
[encerramento completo em português]

(Instruments: [lista completa de instrumentos em inglês] | BPM: ${metrics?.bpm || 100} | Style: ${generoConversao})`
      : `FORMATO DE SAÍDA OBRIGATÓRIO:
Título: [título derivado do refrão]

[INTRO]
[introdução em português]

[VERSO 1]
[primeiro verso completo em português]

[REFRÃO]
[refrão principal completo em português]

[VERSO 2]
[segundo verso completo em português]

[PONTE]
[transição em português]

[OUTRO]
[encerramento em português]

(Instruments: [lista de instrumentos] | BPM: ${metrics?.bpm || 100} | Style: ${generoConversao})`

    const prompt = `${languageRule}${antiForcingRule}${genreSpecificGuidance}${rhymeInstructions}

Você é um compositor profissional especializado em ${generoConversao}.

LETRA ORIGINAL PARA REESCREVER:
${letraOriginal}

INSTRUÇÕES DE REESCRITA:
${conservarImagens ? "- CONSERVE as imagens e metáforas originais" : "- CRIE novas imagens e metáforas"}
${polirSemMexer ? "- MANTENHA a estrutura original, apenas aprimorando" : "- ADAPTE a estrutura para ${generoConversao}"}
- Preserve a mensagem emocional central
- Adapte o vocabulário para ${generoConversao}
- ESCREVA VERSOS COMPLETOS (não apenas palavras soltas)
- Cada linha deve ser uma frase completa e coerente
- NUNCA concatene palavras (ex: "nãsãnossas" está ERRADO, use "não são nossas")
- SEMPRE escreva palavras completas e corretas
${isBachata ? "- RESPEITE O LIMITE DE 12 SÍLABAS POR LINHA (máximo absoluto)" : ""}
${hasPerformanceMode ? "- MANTENHA as descrições performáticas detalhadas entre colchetes" : ""}
${originalInstruments ? `- INCLUA a lista de instrumentos no final: ${originalInstruments}` : ""}${metricInfo}

FORMATAÇÃO DE VERSOS (IMPORTANTE):
- EMPILHE os versos em linhas separadas (um verso por linha)
- EXCEÇÃO: Combine versos na mesma linha SOMENTE quando se completam semanticamente
- Exemplo CORRETO (empilhado):
  Você diz que me ama
  Mas não mostra
- Exemplo CORRETO (completam-se):
  Você diz que me ama, mas não mostra
- MOTIVO: Facilita contagem visual de versos e detecção de erros
- Esta regra vale para TODOS os gêneros (exceto quando versos se completam)

REGRAS DO GÊNERO:
${JSON.stringify(genreConfig?.language_rules || {}, null, 2)}

${formatoEstrutura}

IMPORTANTE: 
- A LETRA COMPLETA (parte cantada) deve ser SEMPRE em PORTUGUÊS
- INSTRUÇÕES e INSTRUMENTOS em INGLÊS
- ESCREVA VERSOS COMPLETOS, não apenas palavras soltas
- NUNCA concatene ou quebre palavras
- SEMPRE escreva frases completas e gramaticalmente corretas
${isBachata ? "- CADA LINHA DEVE TER NO MÁXIMO 12 SÍLABAS" : ""}
- SEMPRE inclua a lista de instrumentos no final
- Retorne APENAS a letra formatada completa, sem comentários adicionais.`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt: prompt,
      temperature: 0.7,
    })

    const lines = text.split("\n")
    const processedLines = await Promise.all(
      lines.map(async (line, index) => {
        if (line.startsWith("[") || line.startsWith("(") || line.startsWith("Título:") || !line.trim()) {
          return line
        }

        try {
          const improvedLine = await ThirdWayEngine.generateThirdWayLine(
            line,
            generoConversao,
            genreConfig,
            `Reescrevendo linha ${index + 1} de ${generoConversao}`,
            isPerformanceMode,
            additionalRequirements,
          )
          return improvedLine
        } catch (error) {
          console.error(`[v0] Erro ao processar linha ${index + 1}:`, error)
          return line
        }
      }),
    )

    let finalLyrics = processedLines.join("\n")

    const rhymeValidation = validateRhymesForGenre(finalLyrics, generoConversao)

    if (!rhymeValidation.valid) {
      console.log("[v0] ⚠️ Avisos de rima:", rhymeValidation.warnings)
      console.log("[v0] ❌ Erros de rima:", rhymeValidation.errors)
      console.log("[v0] 📊 Score de rima:", rhymeValidation.analysis.score)
      console.log("[v0] 📋 Esquema de rimas:", rhymeValidation.analysis.scheme.join(""))

      // Para Sertanejo Raiz, rejeitar se não atender aos padrões
      if (generoConversao.toLowerCase().includes("sertanejo raiz")) {
        const richRhymePercentage =
          rhymeValidation.analysis.quality.filter((q) => q.type === "rica").length /
          rhymeValidation.analysis.quality.length

        if (richRhymePercentage < 0.5) {
          console.log(
            `[v0] 🔄 Regenerando: Sertanejo Raiz precisa de 50% rimas ricas, atual: ${(richRhymePercentage * 100).toFixed(0)}%`,
          )

          // Adicionar feedback específico ao prompt
          const rhymeFeedback = `
ATENÇÃO: A letra anterior teve apenas ${(richRhymePercentage * 100).toFixed(0)}% de rimas ricas.
Sertanejo Raiz EXIGE pelo menos 50% de rimas ricas.

CORRIJA usando estes exemplos:
- "porteira/bananeira" (substantivos concretos) ✓
- "viola/sacola" (substantivos concretos) ✓
- "sertão/coração" (substantivos) ✓
- "jardim/capim" (substantivos da natureza) ✓

EVITE:
- "amor/dor" (muito abstrato e pobre)
- "paixão/razão" (muito abstrato e pobre)
- Palavras que não rimam perfeitamente
`

          const { text: regeneratedText } = await generateText({
            model: "openai/gpt-4o",
            prompt: prompt + rhymeFeedback,
            temperature: 0.8, // Aumentar temperatura para mais criatividade
          })

          const regeneratedLines = regeneratedText.split("\n")
          const reprocessedLines = await Promise.all(
            regeneratedLines.map(async (line, index) => {
              if (line.startsWith("[") || line.startsWith("(") || line.startsWith("Título:") || !line.trim()) {
                return line
              }

              try {
                const improvedLine = await ThirdWayEngine.generateThirdWayLine(
                  line,
                  generoConversao,
                  genreConfig,
                  `Reescrevendo linha ${index + 1} com rimas ricas`,
                  isPerformanceMode,
                  additionalRequirements,
                )
                return improvedLine
              } catch (error) {
                console.error(`[v0] Erro ao processar linha ${index + 1}:`, error)
                return line
              }
            }),
          )

          finalLyrics = reprocessedLines.join("\n")

          // Validar novamente
          const secondValidation = validateRhymesForGenre(finalLyrics, generoConversao)
          console.log("[v0] 🔄 Segunda validação - Score:", secondValidation.analysis.score)
          console.log("[v0] 🔄 Segunda validação - Esquema:", secondValidation.analysis.scheme.join(""))
        }
      }
    } else {
      console.log("[v0] ✅ Rimas validadas com sucesso!")
      console.log("[v0] 📊 Score de rima:", rhymeValidation.analysis.score)
      console.log("[v0] 📋 Esquema de rimas:", rhymeValidation.analysis.scheme.join(""))
    }

    let extractedTitle = ""
    const titleMatch = finalLyrics.match(/^Título:\s*(.+)$/m)
    if (titleMatch?.[1]) {
      extractedTitle = titleMatch[1].trim()
    } else {
      const chorusMatch = finalLyrics.match(/\[(?:CHORUS|REFRÃO)[^\]]*\]\s*\n([^\n]+)/i)
      if (chorusMatch?.[1]) {
        extractedTitle = chorusMatch[1].trim().split(" ").slice(0, 4).join(" ")
        finalLyrics = `Título: ${extractedTitle}\n\n${finalLyrics}`
      }
    }

    if (!finalLyrics.includes("(Instruments:")) {
      const instrumentList = originalInstruments
        ? `(Instruments: [${originalInstruments}] | BPM: ${metrics?.bpm || 100} | Style: ${generoConversao})`
        : `(Instruments: [${isBachata ? "electric guitar, synthesizer, electronic drums, accordion" : "guitar, bass, drums, keyboard"}] | BPM: ${metrics?.bpm || 100} | Style: ${generoConversao})`

      finalLyrics = finalLyrics.trim() + "\n\n" + instrumentList
    }

    finalLyrics = capitalizeLines(finalLyrics)

    return NextResponse.json({
      letra: finalLyrics,
      titulo: extractedTitle,
      rhymeAnalysis: rhymeValidation.analysis,
      rhymeWarnings: rhymeValidation.warnings,
    })
  } catch (error) {
    console.error("[v0] Error rewriting lyrics:", error)

    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"

    return NextResponse.json(
      {
        error: "Erro ao reescrever letra.",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
