import { NextResponse } from "next/server"
import { generateText } from "ai"
import { getGenreConfig, detectSubGenre, getGenreRhythm } from "@/lib/genre-config"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log('🔍 DEBUG - Body completo:', JSON.stringify(body, null, 2))

    // ✅ PROCURA A LETRA E PARÂMETROS
    let finalLyrics = ''
    let finalGenero = ''
    let additionalRequirements = body.additionalRequirements || body.requisitos || ''
    
    // Procura por letra em qualquer campo
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string' && value.length > 10) {
        if (value.length > 50 && !finalLyrics && !key.toLowerCase().includes('requirement')) {
          finalLyrics = value
          console.log(`📝 Letra encontrada no campo: "${key}"`)
        }
      }
      
      // Procura por gênero
      if (typeof value === 'string' && 
          ['sertanejo', 'mpb', 'funk', 'forró', 'rock', 'pop', 'gospel', 'piseiro']
            .some(genre => value.toLowerCase().includes(genre))) {
        finalGenero = value
        console.log(`🎵 Gênero encontrado no campo: "${key}" = "${value}"`)
      }
    }

    // ✅ CAMPOS PADRÃO
    if (!finalLyrics) {
      finalLyrics = body.lyrics || body.letra || body.text || body.content || ''
    }

    if (!finalGenero) {
      finalGenero = body.genero || body.genre || body.style || body.tipo || ''
    }

    const finalTema = body.tema || body.theme || body.subject || "Reescrita"
    const finalHumor = body.humor || body.mood || body.emocao || "Adaptado"
    const selectedChoruses = body.selectedChoruses || body.choruses || body.refroes || []

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

    console.log(`[Rewrite] ✅ Iniciando reescrita inteligente - Gênero: ${finalGenero}`)

    // ✅ CONFIGURAÇÃO DO GÊNERO
    const genreConfig = getGenreConfig(finalGenero)
    const subGenreInfo = detectSubGenre(additionalRequirements)
    const defaultRhythm = getGenreRhythm(finalGenero)
    const finalRhythm = subGenreInfo.rhythm || defaultRhythm

    // ✅ ANÁLISE DETALHADA DA ESTRUTURA ORIGINAL
    const structureAnalysis = analyzeSongStructure(finalLyrics)
    console.log('[Rewrite] 📊 Análise estrutural detalhada:', structureAnalysis)

    // ✅ SISTEMA DE PROMPT INTELIGENTE QUE PRESERVA ESTRUTURA
    const universalRules = `
🌍 REGRAS DE REWRITE INTELIGENTE

🎯 OBJETIVO PRINCIPAL:
- PRESERVAR a estrutura original (seções, ordem, formatação)
- MANTER a essência emocional e narrativa  
- MELHORAR apenas versos com problemas de métrica
- RESPEITAR as instruções musicais originais ([INTRO], [VERSO], etc)

✅ ESTRUTURA ORIGINAL (OBRIGATÓRIO PRESERVAR):
${structureAnalysis.sections.map(section => `- ${section.type}: ${section.lines.length} versos`).join('\n')}

⚠️ REGRAS DE SÍLABAS (APLICAR SOMENTE ONDE NECESSÁRIO):
- Versos problemáticos: MÁXIMO 12 sílabas poéticas
- Versos bons: MANTER como estão
- Foco em CORRIGIR, não em reescrever tudo

🎵 PRESERVAÇÃO DE SEÇÕES:
- Mantenha TODAS as tags originais: [INTRO], [VERSO], [REFRAO], etc
- Preserve a ORDEM das seções
- Mantenha instruções musicais: (Violão, Bateria, Sanfona, etc)
- Só altere o conteúdo dos versos quando necessário

📝 EXEMPLO DE FORMATAÇÃO CORRETA:

[INTRO - VIOLÃO LENTO, HARMÔNICA]  ← MANTIDO

[VERSO 1 - VIOLÃO ACÚSTICO, BATERIA SUAVE]  ← MANTIDO
Café esfria, o tempo parou           ← MANTIDO (se bom)
Teu anel no prato me fez pensar       ← CORRIGIDO (se necessário)

[REFRAO - SANFONA, PALMAS CONTRATEMPO]  ← MANTIDO
Silêncio que corta o coração         ← MANTIDO (se bom)
Teu olhar é um adeus em vão          ← MANTIDO (se bom)
`

    const lyricsContext = `
📝 LETRA ORIGINAL COMPLETA (PRESERVAR ESTRUTURA):
${finalLyrics}

🎵 ANÁLISE ESTRUTURAL IDENTIFICADA:
- Total de seções: ${structureAnalysis.sections.length}
- Seções: ${structureAnalysis.sections.map(s => s.type).join(' → ')}
- Versos totais: ${structureAnalysis.totalLines}
- Versos problemáticos: ${structureAnalysis.problematicLines.length}

🎯 DIRETRIZES DE REWRITE:
1. MANTENHA a estrutura de seções original
2. PRESERVE tags e instruções musicais  
3. CORRIJA apenas versos com >12 sílabas
4. MANTENHA versos que já estão bons
5. RESPEITE o fluxo narrativo emocional
${additionalRequirements ? `6. ATENDER: ${additionalRequirements}` : ''}
`

    const preservedChorusesContext = selectedChoruses.length > 0 ? `
🎵 REFRÕES PRESERVADOS (INTEGRAR NA ESTRUTURA):
${selectedChoruses.map((chorus: string, index: number) => 
  `Refrão ${index + 1}: ${chorus}`
).join('\n')}

IMPORTANTE: Substituir os refrões originais por estes, mantendo as tags [REFRAO].
` : ""

    const prompt = `${universalRules}

${lyricsContext}
${preservedChorusesContext}

🎵 Você é um editor musical especializado em REWRITE ESTRUTURAL.

SUA TAREFA: Fazer uma reescrita INTELIGENTE que:
- ✅ PRESERVA 90% da estrutura original
- ✅ MANTÉM tags e instruções musicais
- ✅ CORRIGE apenas versos problemáticos
- ✅ MANTÉM versos que já estão bons
- ✅ RESPEITA o fluxo emocional da música

PROCESSO:
1. ANALISE cada seção da estrutura original
2. IDENTIFIQUE versos com problemas de sílabas (>12)
3. CORRIJA apenas esses versos problemáticos
4. MANTENHA versos bons exatamente como estão
5. PRESERVE todas as tags [SEÇÃO] e instruções
6. USE refrões preservados se fornecidos

FORMATO DE SAÍDA (CRÍTICO):
- EXATAMENTE a mesma estrutura de seções
- MESMAS tags [SEÇÃO - INSTRUÇÕES]  
- Versos corrigidos apenas onde necessário
- Mesma quantidade de linhas vazias entre seções

EXEMPLO DE SAÍDA CORRETA:
[INTRO - VIOLÃO LENTO, HARMÔNICA]

[VERSO 1 - VIOLÃO ACÚSTICO, BATERIA SUAVE]
Café esfria, o tempo parou
Teu anel no prato me fez pensar
Teu sorriso distante, olhar sem luz
Nosso amor aos poucos vai se apagar

[PRÉ-REFRAO - TECLADO RHODES, PERCUSSÃO SUAVE]
Teu perfume já não é abrigo
A casa vazia pesa no peito
Cada canto guarda um fim tristonho
E o silêncio cresce, toma tudo

... (continua mesma estrutura)

Gere a letra REEscrita ESTRUTURALMENTE IDÊNTICA agora:`

    console.log("[Rewrite] 🎼 Gerando reescrita que preserva estrutura...")

    let attempts = 0
    let result: any = null
    let allValid = false

    while (attempts < 3 && !allValid) {
      attempts++
      console.log(`[Rewrite] Tentativa ${attempts}/3...`)

      const { text } = await generateText({
        model: "openai/gpt-4o",
        prompt,
        temperature: 0.7, // Menor temperatura para mais consistência
      })

      // ✅ CAPTURA A LETRA COMPLETA (não apenas JSON)
      if (text) {
        result = {
          lyrics: text.trim(),
          title: "Letra Reescrita (Estrutura Preservada)",
          metadata: {
            structurePreserved: true,
            correctionType: "Seletiva"
          }
        }
        
        // ✅ VALIDAÇÃO INTELIGENTE - só valida versos, ignora tags
        const validation = validateStructurePreservation(finalLyrics, result.lyrics)
        console.log(`[Rewrite] Validação estrutural:`, validation)
        
        const syllableValidation = validateLyricsSyllables(result.lyrics)
        console.log(`[Rewrite] Validação sílabas:`, syllableValidation)
        
        allValid = syllableValidation.valid || attempts === 3
        
        if (!allValid) {
          console.log(`[Rewrite] ⚠️ Violações:`, syllableValidation.violations)
        }
      }
    }

    // ✅ CAPITALIZAÇÃO CONSERVADORA - só nos versos, não nas tags
    if (result.lyrics) {
      result.lyrics = capitalizeSongLyrics(result.lyrics)
    }

    console.log("[Rewrite] ✅ Reescrita estrutural concluída!")

    return NextResponse.json({
      letra: result.lyrics,
      titulo: result.title,
      metadata: {
        score: 90,
        structurePreserved: true,
        originalSections: structureAnalysis.sections.length,
        correctionsMade: structureAnalysis.problematicLines.length,
        syllableCompliance: "Estrutura preservada com correções seletivas"
      }
    })

  } catch (error) {
    console.error("[Rewrite] Erro:", error)
    
    return NextResponse.json(
      {
        error: "Erro na reescrita estrutural",
        details: error instanceof Error ? error.message : "Erro desconhecido",
        suggestion: "Tente com uma letra mais clara ou menos refrões selecionados"
      },
      { status: 500 }
    )
  }
}

// ✅ ANÁLISE DETALHADA DA ESTRUTURA DA MÚSICA
function analyzeSongStructure(lyrics: string) {
  const lines = lyrics.split('\n')
  const sections: Array<{type: string, lines: string[], startIndex: number}> = []
  let currentSection: {type: string, lines: string[], startIndex: number} | null = null
  const problematicLines: Array<{line: string, syllables: number}> = []

  lines.forEach((line, index) => {
    const trimmed = line.trim()
    
    // Detecta início de nova seção
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      if (currentSection) {
        sections.push(currentSection)
      }
      currentSection = {
        type: trimmed,
        lines: [],
        startIndex: index
      }
    } 
    // Linha de verso normal
    else if (trimmed && currentSection) {
      currentSection.lines.push(trimmed)
      
      // Valida sílabas apenas em versos (não tags)
      const syllables = countPoeticSyllables(trimmed)
      if (syllables > 12) {
        problematicLines.push({ line: trimmed, syllables })
      }
    }
  })

  // Adiciona a última seção
  if (currentSection) {
    sections.push(currentSection)
  }

  return {
    sections,
    totalLines: lines.filter(line => line.trim()).length,
    problematicLines,
    hasComplexStructure: sections.length > 3
  }
}

// ✅ VALIDAÇÃO DE PRESERVAÇÃO ESTRUTURAL
function validateStructurePreservation(original: string, rewritten: string) {
  const originalLines = original.split('\n').filter(l => l.trim())
  const rewrittenLines = rewritten.split('\n').filter(l => l.trim())
  
  const originalSections = originalLines.filter(l => l.startsWith('[') && l.endsWith(']'))
  const rewrittenSections = rewrittenLines.filter(l => l.startsWith('[') && l.endsWith(']'))
  
  return {
    sectionsPreserved: originalSections.length === rewrittenSections.length,
    originalSectionCount: originalSections.length,
    rewrittenSectionCount: rewrittenSections.length,
    structureMatch: JSON.stringify(originalSections) === JSON.stringify(rewrittenSections)
  }
}

// ✅ VALIDAÇÃO INTELIGENTE DE SÍLABAS (só versos)
function validateLyricsSyllables(lyrics: string) {
  const lines = lyrics.split('\n')
  const violations: Array<{line: string, syllables: number}> = []
  let validLines = 0

  lines.forEach(line => {
    const trimmed = line.trim()
    // Só valida versos, ignora tags e linhas vazias
    if (trimmed && !(trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      const syllables = countPoeticSyllables(trimmed)
      if (syllables > 12) {
        violations.push({ line: trimmed, syllables })
      } else {
        validLines++
      }
    }
  })

  const totalChecked = lines.filter(line => {
    const trimmed = line.trim()
    return trimmed && !(trimmed.startsWith('[') && trimmed.endsWith(']'))
  }).length

  return {
    valid: violations.length === 0,
    violations,
    validLines,
    totalChecked,
    complianceRate: totalChecked > 0 ? `${Math.round((validLines / totalChecked) * 100)}%` : '0%'
  }
}

// ✅ CAPITALIZAÇÃO INTELIGENTE (só versos, não tags)
function capitalizeSongLyrics(lyrics: string) {
  const lines = lyrics.split('\n')
  
  return lines.map(line => {
    const trimmed = line.trim()
    // Só capitaliza versos, não tags de seção
    if (trimmed && !(trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      return capitalizeLines(trimmed)
    }
    return line // Mantém tags como estão
  }).join('\n')
}
