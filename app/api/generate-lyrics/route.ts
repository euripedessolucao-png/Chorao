import { generateText } from "ai"
import { NextResponse } from "next/server"
import { capitalizeLines } from "@/lib/utils/capitalize-lyrics"
import { SyllableEnforcer } from "@/lib/validation/syllableEnforcer"
import { MetaComposer } from "@/lib/orchestrator/meta-composer"

// ✅ CONFIGURAÇÃO UNIVERSAL DE QUALIDADE POR GÊNERO
const GENRE_QUALITY_CONFIG = {
  "Sertanejo": { min: 9, max: 11, ideal: 10, rhymeQuality: 0.5 },
  "Sertanejo Moderno": { min: 9, max: 11, ideal: 10, rhymeQuality: 0.5 },
  "Sertanejo Universitário": { min: 9, max: 11, ideal: 10, rhymeQuality: 0.5 },
  "Sertanejo Sofrência": { min: 9, max: 11, ideal: 10, rhymeQuality: 0.5 },
  "Sertanejo Raiz": { min: 9, max: 11, ideal: 10, rhymeQuality: 0.5 },
  "MPB": { min: 7, max: 12, ideal: 9, rhymeQuality: 0.6 },
  "Bossa Nova": { min: 7, max: 12, ideal: 9, rhymeQuality: 0.6 },
  "Funk": { min: 6, max: 10, ideal: 8, rhymeQuality: 0.3 },
  "Pagode": { min: 7, max: 11, ideal: 9, rhymeQuality: 0.4 },
  "Samba": { min: 7, max: 11, ideal: 9, rhymeQuality: 0.4 },
  "Forró": { min: 8, max: 11, ideal: 9, rhymeQuality: 0.4 },
  "Axé": { min: 6, max: 10, ideal: 8, rhymeQuality: 0.3 },
  "Rock": { min: 7, max: 11, ideal: 9, rhymeQuality: 0.4 },
  "Pop": { min: 7, max: 11, ideal: 9, rhymeQuality: 0.4 },
  "Gospel": { min: 8, max: 11, ideal: 9, rhymeQuality: 0.5 },
  "default": { min: 7, max: 11, ideal: 9, rhymeQuality: 0.4 }
}

// ✅ FUNÇÕES AUXILIARES SIMPLIFICADAS
function extractChorusesFromInstructions(instructions?: string): string[] | null {
  if (!instructions) return null

  const chorusMatches = instructions.match(/refr[ãa]o[:\s]*([^\.]+)/gi)
  if (!chorusMatches) return null

  const choruses: string[] = []
  
  chorusMatches.forEach(match => {
    const chorusText = match.replace(/refr[ãa]o[:\s]*/gi, '').trim()
    if (chorusText && chorusText.length > 10) {
      choruses.push(chorusText)
    }
  })

  return choruses.length > 0 ? choruses : null
}

function extractThemeFromInput(tema: string, inspiracao?: string): string {
  if (tema.toLowerCase().includes('amor') || tema.toLowerCase().includes('coração')) return 'Amor'
  if (tema.toLowerCase().includes('saudade') || tema.toLowerCase().includes('nostalgia')) return 'Saudade'
  if (tema.toLowerCase().includes('festa') || tema.toLowerCase().includes('celebração')) return 'Festa'
  if (tema.toLowerCase().includes('vida') || tema.toLowerCase().includes('caminho')) return 'Vida'
  if (inspiracao?.toLowerCase().includes('amor')) return 'Amor'
  return tema
}

function extractMoodFromInput(humor?: string, emocoes?: string[]): string {
  if (humor) {
    if (humor.toLowerCase().includes('triste') || humor.toLowerCase().includes('melancólico')) return 'Melancólico'
    if (humor.toLowerCase().includes('alegre') || humor.toLowerCase().includes('feliz')) return 'Alegre'
    if (humor.toLowerCase().includes('romântico') || humor.toLowerCase().includes('paixão')) return 'Romântico'
    if (humor.toLowerCase().includes('raiva') || humor.toLowerCase().includes('intenso')) return 'Intenso'
  }
  
  if (emocoes && emocoes.length > 0) {
    if (emocoes.some(e => e.toLowerCase().includes('triste'))) return 'Melancólico'
    if (emocoes.some(e => e.toLowerCase().includes('alegre'))) return 'Alegre'
    if (emocoes.some(e => e.toLowerCase().includes('amor'))) return 'Romântico'
  }
  
  return 'Romântico'
}

function applyFinalFormatting(lyrics: string, genero: string, metrics?: any): string {
  let formattedLyrics = lyrics

  if (!formattedLyrics.includes("(Instrumentos:")) {
    const instrumentList = `(Instrumentos: guitar, bass, drums, keyboard | BPM: ${metrics?.bpm || 100} | Ritmo: ${genero} | Estilo: ${genero})`
    formattedLyrics = formattedLyrics.trim() + "\n\n" + instrumentList
  }

  formattedLyrics = capitalizeLines(formattedLyrics)
  return formattedLyrics
}

// ✅ OBTÉM CONFIGURAÇÃO DE SÍLABAS POR GÊNERO
function getSyllableConfig(genero: string) {
  return GENRE_QUALITY_CONFIG[genero as keyof typeof GENRE_QUALITY_CONFIG] || GENRE_QUALITY_CONFIG.default
}

// ✅ ROTA PRINCIPAL CORRIGIDA - SEM DEPENDÊNCIA DE LETRA COLADA
export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log('🎵 [Generate] Parâmetros recebidos:', {
      genero: body.genero,
      tema: body.tema,
      humor: body.humor,
      selectedChoruses: body.selectedChoruses?.length || 0
    })

    const {
      genero,
      humor,
      tema,
      criatividade = "equilibrado",
      inspiracao,
      metaforas,
      emocoes = [],
      titulo,
      formattingStyle = "performatico",
      additionalRequirements,
      advancedMode = false,
      universalPolish = true,
      syllableTarget,
      metrics = { bpm: 100, structure: "VERSO-REFRAO" },
      selectedChoruses,
    } = body

    // ✅ VALIDAÇÃO SIMPLES - APENAS GÊNERO E TEMA
    if (!genero) {
      return NextResponse.json({ 
        error: "Gênero é obrigatório",
        suggestion: "Selecione um gênero musical como Sertanejo, MPB, Funk, etc."
      }, { status: 400 })
    }

    if (!tema) {
      return NextResponse.json({ 
        error: "Tema é obrigatório", 
        suggestion: "Digite um tema como Amor, Saudade, Festa, Amizade, etc."
      }, { status: 400 })
    }

    // ✅ CONFIGURAÇÃO AUTOMÁTICA POR GÊNERO
    const autoSyllableConfig = getSyllableConfig(genero)
    const finalSyllableTarget = syllableTarget || autoSyllableConfig

    console.log(`[Generate] Configuração ${genero}: ${finalSyllableTarget.min}-${finalSyllableTarget.max}s`)
    console.log(`[Generate] Polimento Universal: ${universalPolish ? 'ATIVO' : 'INATIVO'}`)

    // ✅ EXTRAI refrões selecionados se existirem
    const extractedChoruses = selectedChoruses || extractChorusesFromInstructions(additionalRequirements) || []

    let finalLyrics: string
    let generationMode: "preservation" | "universal" | "normal" = "normal"

    // ✅ DECISÃO INTELIGENTE: Preservar refrões ou geração com Sistema Universal
    if (extractedChoruses.length > 0) {
      console.log(`[Generate] 🎯 Modo preservação ativo: ${extractedChoruses.length} refrões selecionados`)
      generationMode = "preservation"
      
      // ✅ USA META-COMPOSER com refrões preservados
      const compositionRequest = {
        genre: genero,
        theme: extractThemeFromInput(tema, inspiracao),
        mood: extractMoodFromInput(humor, emocoes),
        additionalRequirements: additionalRequirements || '',
        syllableTarget: finalSyllableTarget,
        applyFinalPolish: universalPolish,
        preservedChoruses: extractedChoruses
      }

      const result = await MetaComposer.compose(compositionRequest)
      finalLyrics = result.lyrics

      console.log(`[Generate] Composição com preservação concluída - Score: ${result.metadata.finalScore.toFixed(2)}`)
      
    } else if (universalPolish) {
      // ✅ SISTEMA UNIVERSAL DE QUALIDADE
      console.log(`[Generate] 🎵 Sistema Universal ativo para: ${genero}`)
      generationMode = "universal"
      
      const compositionRequest = {
        genre: genero,
        theme: extractThemeFromInput(tema, inspiracao),
        mood: extractMoodFromInput(humor, emocoes),
        additionalRequirements,
        syllableTarget: finalSyllableTarget,
        applyFinalPolish: true,
        creativity: criatividade
      }

      const result = await MetaComposer.compose(compositionRequest)
      finalLyrics = result.lyrics

      console.log(`[Generate] Sistema Universal finalizado - Score: ${result.metadata.finalScore.toFixed(2)}`)
      
    } else {
      // ✅ FALLBACK: geração normal (sem refrões selecionados e sem polimento universal)
      console.log(`[Generate] Modo geração normal para: ${genero} - ${tema}`)
      generationMode = "normal"
      
      finalLyrics = await generateNormalLyrics(
        genero,
        humor || 'Romântico',
        tema,
        criatividade,
        additionalRequirements,
        finalSyllableTarget
      )
    }

    // ✅ APLICA FORMATAÇÃO FINAL
    finalLyrics = applyFinalFormatting(finalLyrics, genero, metrics)

    console.log(`[Generate] ✅ Geração concluída! Modo: ${generationMode}`)

    return NextResponse.json({
      letra: finalLyrics,
      titulo: titulo || extractTitleFromLyrics(finalLyrics),
      metadata: {
        preservedChoruses: extractedChoruses.length,
        generationMode: generationMode,
        syllableConfig: finalSyllableTarget,
        universalPolish: universalPolish,
        genre: genero
      }
    })
    
  } catch (error) {
    console.error("[Generate] Erro ao gerar letra:", error)

    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"

    return NextResponse.json(
      {
        error: "Erro ao gerar letra",
        details: errorMessage,
        suggestion: "Tente novamente com um tema mais específico",
      },
      { status: 500 },
    )
  }
}

// ✅ FUNÇÃO DE GERAÇÃO NORMAL SIMPLIFICADA
async function generateNormalLyrics(
  genero: string,
  humor: string,
  tema: string,
  criatividade: string,
  additionalRequirements?: string,
  syllableTarget = getSyllableConfig(genero)
): Promise<string> {
  
  const prompt = `COMPOSIÇÃO MUSICAL - ${genero.toUpperCase()}

TEMA: ${tema}
HUMOR: ${humor}
GÊNERO: ${genero}
SÍLABAS: ${syllableTarget.min}-${syllableTarget.max} por linha

CONTRAÇÕES OBRIGATÓRIAS:
• "você" → "cê" 
• "estou" → "tô" 
• "para" → "pra" 
• "está" → "tá"

${additionalRequirements ? `REQUISITOS ADICIONAIS:\n${additionalRequirements}\n` : ''}

CRIE UMA LETRA AUTÊNTICA NO ESTILO ${genero} SOBRE "${tema}" COM SENTIMENTO ${humor}.

RETORNE APENAS A LETRA COMPLETA:`

  const { text } = await generateText({
    model: "openai/gpt-4o",
    prompt,
    temperature: criatividade === "ousado" ? 0.8 : criatividade === "conservador" ? 0.5 : 0.7
  })

  return text.trim()
}

function extractTitleFromLyrics(lyrics: string): string {
  const titleMatch = lyrics.match(/^Titulo:\s*(.+)$/m)
  if (titleMatch?.[1]) return titleMatch[1].trim()

  const chorusMatch = lyrics.match(/\[(?:CHORUS|REFRÃO)[^\]]*\]\s*\n([^\n]+)/i)
  if (chorusMatch?.[1]) {
    return chorusMatch[1].trim().split(" ").slice(0, 4).join(" ")
  }

  return "Composição Musical"
}
