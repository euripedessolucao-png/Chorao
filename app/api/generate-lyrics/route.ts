import { NextResponse } from "next/server"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { MetaComposer } from "@/lib/orchestrator/meta-composer"

const GENRE_CONFIG = {
  "Sertanejo": { min: 9, max: 11, ideal: 10 },
  "Sertanejo Moderno": { min: 9, max: 11, ideal: 10 },
  "Sertanejo Universitário": { min: 9, max: 11, ideal: 10 },
  "Sertanejo Sofrência": { min: 9, max: 11, ideal: 10 },
  "Sertanejo Raiz": { min: 9, max: 11, ideal: 10 },
  "MPB": { min: 7, max: 12, ideal: 9 },
  "Funk": { min: 6, max: 10, ideal: 8 },
  "Forró": { min: 8, max: 11, ideal: 9 },
  "Pagode": { min: 7, max: 11, ideal: 9 },
  "Samba": { min: 7, max: 11, ideal: 9 },
  "Axé": { min: 6, max: 10, ideal: 8 },
  "Rock": { min: 7, max: 11, ideal: 9 },
  "Pop": { min: 7, max: 11, ideal: 9 },
  "Gospel": { min: 8, max: 11, ideal: 9 },
  "default": { min: 7, max: 11, ideal: 9 }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      genero,
      humor,
      tema,
      additionalRequirements,
      universalPolish = true,
      selectedChoruses = [],
      syllableTarget,
      // Outros parâmetros que podem conter refrões/hooks
      inspiracao,
      metaforas,
      formattingStyle,
      advancedMode
    } = body

    if (!genero) {
      return NextResponse.json({ 
        error: "Gênero é obrigatório"
      }, { status: 400 })
    }

    if (!tema) {
      return NextResponse.json({ 
        error: "Tema é obrigatório"
      }, { status: 400 })
    }

    // ✅ CONFIGURAÇÃO DE SÍLABAS
    const finalSyllableTarget = syllableTarget || GENRE_CONFIG[genero as keyof typeof GENRE_CONFIG] || GENRE_CONFIG.default

    // ✅ EXTRAI REFRÕES DOS REQUISITOS ADICIONAIS
    const extractChorusesFromRequirements = (reqs: string): string[] => {
      if (!reqs) return []
      
      const choruses: string[] = []
      
      // Padrão 1: [CHORUS] seguido de texto
      const chorusMatch = reqs.match(/\[CHORUS\][\s\S]*?(\n\n|$)/i)
      if (chorusMatch) {
        const chorusText = chorusMatch[0].replace(/\[CHORUS\]/i, '').trim()
        if (chorusText) {
          // Divide por linhas vazias para múltiplos refrões
          const chorusBlocks = chorusText.split(/\n\s*\n/).filter(block => block.trim())
          chorusBlocks.forEach(block => {
            const lines = block.split('\n').map(line => line.trim()).filter(line => line)
            if (lines.length >= 2) {
              choruses.push(lines.join(' / '))
            }
          })
        }
      }
      
      // Padrão 2: [HOOK] seguido de texto
      const hookMatch = reqs.match(/\[HOOK\][\s\S]*?(\n\n|$)/i)
      if (hookMatch) {
        const hookText = hookMatch[0].replace(/\[HOOK\]/i, '').trim()
        if (hookText) {
          choruses.push(hookText.replace(/\n/g, ' / '))
        }
      }
      
      console.log(`[Generate-Lyrics] Refrões extraídos dos requisitos: ${choruses.length}`)
      return choruses
    }

    // ✅ COMBINA REFRÕES EXPLÍCITOS + REFRÕES DOS REQUISITOS
    const requirementChoruses = extractChorusesFromRequirements(additionalRequirements || '')
    const allPreservedChoruses = [...selectedChoruses, ...requirementChoruses]
    
    console.log(`[Generate-Lyrics] Refrões totais: ${allPreservedChoruses.length} (${selectedChoruses.length} explícitos + ${requirementChoruses.length} dos requisitos)`)

    // ✅ CONSTRÓI REQUISITOS CLAROS PARA O META-COMPOSER
    const buildAdditionalRequirements = (originalReqs: string, hasChoruses: boolean) => {
      let requirements = originalReqs || ''
      
      if (hasChoruses) {
        const chorusSection = `
🎵 REFRÕES/HOOKS PARA USAR NA COMPOSIÇÃO:

${allPreservedChoruses.map((chorus, i) => 
  `REFRÃO ${i+1}:\n${chorus.split('/').map(line => `• ${line.trim()}`).join('\n')}`
).join('\n\n')}

INSTRUÇÕES:
- USE estes refrões exatamente como fornecidos
- INTEGRE naturalmente na narrativa do tema: "${tema}"
- CADA refrão deve aparecer pelo menos 2 vezes
- MANTENHA a estrutura original dos refrões
`
        requirements = requirements ? `${requirements}\n\n${chorusSection}` : chorusSection
      }
      
      // Adiciona instruções de formatação se necessário
      if (formattingStyle === 'performatico') {
        const formattingSection = `
🎼 FORMATAÇÃO PERFORMÁTICA:
- Use estrutura: [INTRO] / [VERSE] / [CHORUS] / [BRIDGE] / [OUTRO]
- Instruções em inglês: (Instruments: guitar, bass, drums)
- Backing vocals em inglês: (Backing: "Oh, oh, oh")
- Letras empilhadas, uma por linha
`
        requirements = requirements ? `${requirements}\n\n${formattingSection}` : formattingSection
      }
      
      return requirements
    }

    const finalAdditionalRequirements = buildAdditionalRequirements(additionalRequirements, allPreservedChoruses.length > 0)

    const compositionRequest = {
      genre: genero,
      theme: tema,
      mood: humor || "Adaptado",
      additionalRequirements: finalAdditionalRequirements,
      syllableTarget: finalSyllableTarget,
      applyFinalPolish: universalPolish,
      preservedChoruses: allPreservedChoruses, // ✅ AGORA INCLUI REFRÕES DOS REQUISITOS
      creativity: body.criatividade || "equilibrado"
    }

    console.log(`[Generate-Lyrics] Iniciando composição com ${allPreservedChoruses.length} refrões preservados`)

    const result = await MetaComposer.compose(compositionRequest)
    
    let finalLyrics = result.lyrics
    
    // ✅ ADICIONA INSTRUMENTAÇÃO SE NECESSÁRIO
    if (!finalLyrics.includes("(Instrumentos:") && !finalLyrics.includes("(Instruments:")) {
      const instrumentList = formattingStyle === 'performatico' 
        ? `(Instruments: guitar, bass, drums, keyboard | Style: ${genero})`
        : `(Instrumentos: violão, baixo, bateria, teclado | Estilo: ${genero})`
      finalLyrics = finalLyrics.trim() + "\n\n" + instrumentList
    }
    
    finalLyrics = capitalizeLines(finalLyrics)

    console.log(`[Generate-Lyrics] ✅ Letra gerada! Score: ${result.metadata.finalScore}, Rimas: ${result.metadata.rhymeScore}%, Refrões preservados: ${result.metadata.chorusPreservation?.allPreserved ? 'SIM' : 'NÃO'}`)

    return NextResponse.json({
      letra: finalLyrics,
      titulo: result.title,
      metadata: {
        score: result.metadata.finalScore,
        rhymeScore: result.metadata.rhymeScore,
        rhymeTarget: result.metadata.rhymeTarget,
        polishingApplied: result.metadata.polishingApplied,
        preservedChorusesUsed: result.metadata.preservedChorusesUsed,
        chorusPreservation: result.metadata.chorusPreservation
      }
    })
    
  } catch (error) {
    console.error("[Generate-Lyrics] Erro:", error)

    return NextResponse.json(
      {
        error: "Erro ao gerar letra",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    )
  }
}
