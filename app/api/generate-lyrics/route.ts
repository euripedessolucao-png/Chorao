import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { getGenreConfig } from "@/lib/genre-config"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { validateRhymesForGenre } from "@/lib/validation/rhyme-validator"
import { buildUniversalRulesPrompt } from "@/lib/rules/universal-rules"

export async function POST(request: NextRequest) {
  try {
    const {
      genero,
      humor,
      tema,
      criatividade,
      inspiracao,
      metaforas,
      emocoes,
      titulo,
      formattingStyle,
      additionalRequirements,
      metrics,
    } = await request.json()

    if (!genero) {
      return NextResponse.json({ error: "Gênero é obrigatório" }, { status: 400 })
    }

    const genreConfig = getGenreConfig(genero)
    const isPerformanceMode = formattingStyle === "performatico"
    const isBachata = genero.toLowerCase().includes("bachata")

    const universalRulesPrompt = buildUniversalRulesPrompt(genero)

    const rhymeInstructions = genero.toLowerCase().includes("sertanejo raiz")
      ? `\n\nREGRAS DE RIMA (OBRIGATÓRIAS PARA SERTANEJO RAIZ):
- Use RIMAS RICAS: palavras de classes gramaticais DIFERENTES (substantivo + verbo, adjetivo + substantivo)
- Exemplos de rimas ricas: "coração" (substantivo) + "canção" (substantivo) é POBRE
- Exemplos de rimas ricas: "amor" (substantivo) + "cantar" (verbo) é RICA
- Exemplos de rimas ricas: "flor" (substantivo) + "melhor" (adjetivo) é RICA
- PROIBIDO: rimas pobres (mesma classe gramatical) ou rimas falsas
- OBRIGATÓRIO: Pelo menos 50% das rimas devem ser ricas
- Rimas perfeitas (consoantes): som completo igual a partir da última vogal tônica
- Exemplos: "jardim/capim", "porteira/bananeira", "viola/sacola", "sertão/coração"`
      : genero.toLowerCase().includes("sertanejo moderno")
        ? `\n\nREGRAS DE RIMA (SERTANEJO MODERNO):
- PREFIRA rimas ricas (classes gramaticais diferentes)
- Aceita algumas rimas pobres (mesma classe) se forem naturais
- Aceita poucas rimas falsas (máximo 20%) se servirem à narrativa
- Exemplos de rimas ricas: "amor" (substantivo) + "melhor" (adjetivo)
- Rimas devem soar naturais, não forçadas`
        : genero.toLowerCase().includes("mpb")
          ? `\n\nREGRAS DE RIMA (MPB):
- Alta qualidade de rimas: prefira rimas ricas e perfeitas
- Evite rimas óbvias ou clichês ("amor/dor", "paixão/ilusão")
- Use rimas criativas e surpreendentes
- Rimas toantes (apenas vogais) são aceitáveis se bem usadas`
          : genero.toLowerCase().includes("pagode") || genero.toLowerCase().includes("samba")
            ? `\n\nREGRAS DE RIMA (PAGODE/SAMBA):
- Rimas naturais e fluidas, que não quebrem o swing
- Varie entre rimas ricas e pobres para evitar monotonia
- Rimas devem facilitar a cantabilidade, não dificultar`
            : `\n\nREGRAS DE RIMA:
- Use rimas naturais que soem bem ao cantar
- Prefira rimas ricas (classes gramaticais diferentes) quando possível
- Evite rimas forçadas ou artificiais`

    let chorusContext = ""
    if (additionalRequirements) {
      const chorusMatch = additionalRequirements.match(/\[CHORUS\]\s*([\s\S]+?)(?=\n\n|\[|$)/i)
      if (chorusMatch) {
        chorusContext = `\n\nREFRÃO PRÉ-DEFINIDO (use exatamente como está):\n${chorusMatch[1].trim()}\n\nConstrua a narrativa da música em torno deste refrão. O refrão deve aparecer pelo menos 2 vezes na estrutura.`
      }
    }

    const structureGuide = chorusContext
      ? `ESTRUTURA OBRIGATÓRIA (3:30 de duração):
[INTRO] (instrumental, 8-12 segundos)
[VERSE 1] (4 linhas)
[PRE-CHORUS] (2 linhas) - preparação emocional
[CHORUS] (use o refrão pré-definido)
[VERSE 2] (4 linhas) - desenvolve a história
[PRE-CHORUS] (2 linhas)
[CHORUS] (repete o refrão pré-definido)
[BRIDGE] (2-4 linhas) - momento de reflexão ou virada
[CHORUS] (repete o refrão pré-definido)
[OUTRO] (fade out ou repetição do hook)`
      : genero.toLowerCase().includes("sertanejo moderno")
        ? `ESTRUTURA CHICLETE (repetição comercial):
[INTRO] (instrumental)
[VERSE 1] (4 linhas)
[CHORUS] (2-4 linhas, grudento)
[VERSE 2] (4 linhas)
[CHORUS] (repete)
[BRIDGE] (2 linhas)
[CHORUS] (repete 2x para fixar)
[OUTRO]`
        : `ESTRUTURA COMERCIAL (3:30):
[INTRO] (instrumental, 8-12 segundos)
[VERSE 1] (4 linhas)
[PRE-CHORUS] (2 linhas)
[CHORUS] (2-4 linhas)
[VERSE 2] (4 linhas)
[PRE-CHORUS] (2 linhas)
[CHORUS] (repete)
[BRIDGE] (2-4 linhas)
[CHORUS] (repete)
[OUTRO]`

    const performanceInstructions = isPerformanceMode
      ? `\n\nFORMATO PERFORMÁTICO:
- Adicione descrições de palco entre parênteses: (sobe o tom), (pausa dramática), (repete 2x), (a cappella)
- Indique momentos instrumentais: [GUITAR SOLO], [DRUM BREAK]
- Marque dinâmicas: (suave), (crescendo), (explosivo)
- No final, adicione: (Instruments: [lista em inglês] | BPM: ${metrics?.bpm || 100} | Style: ${genero})`
      : `\n\nFORMATO PADRÃO:
- Use apenas marcadores de estrutura em inglês: [INTRO], [VERSE], [CHORUS], [BRIDGE], [OUTRO]
- Mantenha a letra limpa e direta
- No final, adicione: (Instruments: [lista em inglês] | BPM: ${metrics?.bpm || 100} | Style: ${genero})`

    const prompt = `${universalRulesPrompt}

Você é um compositor profissional brasileiro especializado em ${genero}.

TAREFA: Escreva uma letra completa seguindo as especificações abaixo.

TEMA: ${tema || "amor e relacionamento"}
HUMOR: ${humor || "neutro"}
CRIATIVIDADE: ${criatividade}
${inspiracao ? `INSPIRAÇÃO: ${inspiracao}` : ""}
${metaforas ? `METÁFORAS DESEJADAS (PRIORIDADE ABSOLUTA): ${metaforas}\nRESPEITE E INSIRA estas metáforas na letra de forma natural e criativa.` : ""}
${emocoes && emocoes.length > 0 ? `EMOÇÕES: ${emocoes.join(", ")}` : ""}
${titulo ? `TÍTULO SUGERIDO: ${titulo}` : ""}
${additionalRequirements ? `\nREQUISITOS ADICIONAIS (PRIORIDADE ABSOLUTA):\n${additionalRequirements}\nRESPEITE todos os requisitos adicionais, especialmente metáforas solicitadas.` : ""}
${chorusContext}

${structureGuide}

REGRAS DE PROSÓDIA (${genreConfig.name}):
Com vírgula (conta como 2 versos):
  - Máximo ${genreConfig.prosody_rules.syllable_count.with_comma.max_before_comma} sílabas antes da vírgula
  - Máximo ${genreConfig.prosody_rules.syllable_count.with_comma.max_after_comma} sílabas depois da vírgula
  - Total máximo: ${genreConfig.prosody_rules.syllable_count.with_comma.total_max} sílabas

Sem vírgula (1 verso):
  - Mínimo: ${genreConfig.prosody_rules.syllable_count.without_comma.min} sílabas
  - Máximo: ${genreConfig.prosody_rules.syllable_count.without_comma.max} sílabas
  - Aceitável até: ${genreConfig.prosody_rules.syllable_count.without_comma.acceptable_up_to} sílabas

LINGUAGEM:
- Use português brasileiro coloquial e natural
- Evite clichês excessivos
- Mantenha coerência narrativa
- Rimas naturais (não forçadas)

${performanceInstructions}

Escreva a letra completa agora:`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.8,
    })

    let finalLyrics = text.trim()

    const rhymeValidation = validateRhymesForGenre(finalLyrics, genero)
    if (!rhymeValidation.valid) {
      console.log("[v0] Avisos de rima:", rhymeValidation.warnings)
      console.log("[v0] Erros de rima:", rhymeValidation.errors)
      console.log("[v0] Score de rima:", rhymeValidation.analysis.score)
    }

    let extractedTitle = titulo || ""
    const titleMatch = finalLyrics.match(/^Title:\s*(.+)$/m)
    if (titleMatch?.[1]) {
      extractedTitle = titleMatch[1].trim()
    } else if (!extractedTitle) {
      const chorusMatch = finalLyrics.match(/\[(?:CHORUS|REFRÃO)[^\]]*\]\s*\n([^\n]+)/i)
      if (chorusMatch?.[1]) {
        extractedTitle = chorusMatch[1].trim().split(" ").slice(0, 4).join(" ")
        finalLyrics = `Title: ${extractedTitle}\n\n${finalLyrics}`
      }
    }

    if (isPerformanceMode && !finalLyrics.includes("(Instruments:")) {
      const instruments = isBachata
        ? "electric guitar, synthesizer, electronic drums, accordion"
        : "guitar, bass, drums, keyboard"
      finalLyrics += `\n\n(Instruments: [${instruments}] | BPM: ${metrics?.bpm || 100} | Style: ${genero})`
    }

    finalLyrics = capitalizeLines(finalLyrics)

    return NextResponse.json({
      letra: finalLyrics,
      titulo: extractedTitle,
      rhymeAnalysis: rhymeValidation.analysis,
      rhymeWarnings: rhymeValidation.warnings,
    })
  } catch (error) {
    console.error("[v0] Erro ao gerar letra:", error)
    return NextResponse.json(
      { error: "Erro ao gerar letra", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 },
    )
  }
}
