// app/api/rewrite-lyrics/route.ts - VERSÃO FINAL SIMPLIFICADA
import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

// 🎵 TIPOS DE BLOCO MUSICAL
interface MusicBlock {
  type: "INTRO" | "VERSE" | "PRE_CHORUS" | "CHORUS" | "BRIDGE" | "OUTRO"
  content: string
  score: number
}

// ✅ SISTEMA SIMPLES E EFETIVO
async function writeWithNaturalRhymes(
  originalSection: string,
  blockType: MusicBlock["type"],
  genre: string,
  theme: string
): Promise<MusicBlock[]> {
  
  const simplePrompts = {
    INTRO: `Escreva 4 linhas completas para uma INTRO de ${genre} sobre ${theme}.

Cada linha deve:
- Ter sentido completo
- Máximo 12 sílabas  
- Rimas naturais (ex: aparece/oferece, dança/avança)

Exemplo bom:
"Quando a noite chega e a lua aparece"
"Teu sorriso brilha e me oferece"
"Nos braços do destino a vida dança" 
"E nosso amor sempre avança"

Agora escreva 4 linhas:`,

    VERSE: `Escreva 4 linhas completas para um VERSO de ${genre} sobre ${theme}.

Regras:
- Linhas 1 e 2 rimam entre si
- Linhas 3 e 4 rimam entre si  
- Todas as linhas completas
- Máximo 12 sílabas

Exemplo:
"Nos teus olhos vejo paz e calma"
"Que acalenta e cura toda a alma" 
"Teu perfume é brisa de verão"
"Que aquece e alegra o coração"

Agora escreva 4 linhas:`,

    CHORUS: `Escreva 4 linhas completas para um REFRÃO de ${genre} sobre ${theme}.

Estrutura A-B-A-B:
- Linha 1 rima com linha 3
- Linha 2 rima com linha 4
- Todas completas e memoráveis
- Máximo 12 sílabas

Exemplo:
"Teu sorriso é meu porto seguro"
"Teu abraço é meu aquecimento"  
"No ritmo desse amor tão puro"
"Encontro paz e sentimento"

Agora escreva 4 linhas:`,

    BRIDGE: `Escreva 4 linhas completas para uma PONTE de ${genre} sobre ${theme}.

Mudança de perspectiva:
- Linhas completas com nova emoção
- Rimas que reforcem a mudança
- Máximo 12 sílabas

Exemplo:
"Nos teus olhos vejo novo amanhecer"
"Cada promessa faz o medo esquecer" 
"Entre risos e sonhos a florescer"
"Nosso amor é forte e vai vencer"

Agora escreva 4 linhas:`,

    OUTRO: `Escreva 2-4 linhas completas para um OUTRO de ${genre} sobre ${theme}.

Fecho suave:
- Linhas curtas e conclusivas
- Máximo 9 sílabas
- Rimas suaves

Exemplo:
"Nos teus olhos me encontrei"
"Teu amor me completou"
"Juntos vamos seguir"
"O amor nos guiou"

Agora escreva 2-4 linhas:`
  }

  try {
    const prompt = simplePrompts[blockType as keyof typeof simplePrompts]
    
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.7,
    })

    return processSimpleResult(text || "", blockType)
  } catch (error) {
    console.error(`[SimpleWrite] Erro em ${blockType}:`, error)
    return [generateNaturalFallback(blockType, genre)]
  }
}

// ✅ PROCESSAMENTO SIMPLES
function processSimpleResult(
  text: string, 
  blockType: MusicBlock["type"]
): MusicBlock[] {
  
  // Extrair apenas linhas que parecem versos
  const lines = text.split("\n")
    .map(line => line.trim())
    .filter(line => {
      return line && 
             line.length >= 5 && 
             line.length <= 70 &&
             !line.startsWith("Exemplo") &&
             !line.startsWith("Regras") &&
             !line.startsWith("Estrutura") &&
             !line.startsWith("Agora") &&
             !line.includes("sílabas")
    })
    .slice(0, blockType === "OUTRO" ? 4 : 4)

  console.log(`[Simple] ${blockType} - Linhas:`, lines)

  // Validação básica
  if (lines.length >= (blockType === "OUTRO" ? 2 : 3) && areLinesComplete(lines)) {
    const content = lines.join("\n")
    
    return [{
      type: blockType,
      content: content,
      score: 85, // Score alto para conteúdo simples e válido
    }]
  } else {
    console.log(`[Simple] ❌ ${blockType} inválido`)
    return [generateNaturalFallback(blockType, "Sertanejo Moderno Masculino")]
  }
}

// ✅ VALIDAÇÃO SIMPLES DE COMPLETUDE
function areLinesComplete(lines: string[]): boolean {
  const incompletePatterns = [
    /\b(eu|me|te|se|nos|vos|o|a|os|as|um|uma|em|no|na|de|da|do|por|pra|que|se|mas|meu|minha|teu|tua)\s*$/i
  ]

  for (const line of lines) {
    for (const pattern of incompletePatterns) {
      if (pattern.test(line)) {
        return false
      }
    }
  }
  return true
}

// ✅ FALLBACKS NATURAIS
function generateNaturalFallback(blockType: MusicBlock["type"], genre: string): MusicBlock {
  const naturalFallbacks = {
    INTRO: {
      content: `Quando a noite chega e a lua aparece\nTeu sorriso brilha e me oferece\nNos braços do destino a vida dança\nE nosso amor sempre avança`,
      score: 90
    },
    VERSE: {
      content: `Nos teus olhos vejo paz e calma\nQue acalenta e cura toda a alma\nTeu perfume é brisa de verão\nQue aquece e alegra o coração`,
      score: 90
    },
    CHORUS: {
      content: `Teu sorriso é meu porto seguro\nTeu abraço é meu aquecimento\nNo ritmo desse amor tão puro\nEncontro paz e sentimento`,
      score: 95
    },
    BRIDGE: {
      content: `Nos teus olhos vejo novo amanhecer\nCada promessa faz o medo esquecer\nEntre risos e sonhos a florescer\nNosso amor é forte e vai vencer`,
      score: 90
    },
    OUTRO: {
      content: `Nos teus olhos me encontrei\nTeu amor me completou\nJuntos vamos seguir\nO amor nos guiou`,
      score: 90
    }
  }

  const fallback = naturalFallbacks[blockType as keyof typeof naturalFallbacks] || naturalFallbacks.VERSE
  return { type: blockType, ...fallback }
}

// ✅ MONTAGEM SIMPLES
async function assembleNaturalSong(
  blocks: Record<string, MusicBlock[]>,
  genre: string
): Promise<{ lyrics: string }> {
  
  const structure = [
    { type: "INTRO", label: "Intro" },
    { type: "VERSE", label: "Verso 1" },
    { type: "CHORUS", label: "Refrão" },
    { type: "VERSE", label: "Verso 2" },
    { type: "CHORUS", label: "Refrão" },
    { type: "BRIDGE", label: "Ponte" },
    { type: "CHORUS", label: "Refrão Final" },
    { type: "OUTRO", label: "Outro" },
  ]

  let lyrics = ""

  for (const section of structure) {
    const availableBlocks = blocks[section.type] || []
    if (availableBlocks.length > 0) {
      const bestBlock = availableBlocks[0] // Pega o primeiro (já é validado)
      lyrics += `[${section.label}]\n${bestBlock.content}\n\n`
    } else {
      const fallback = generateNaturalFallback(section.type as any, genre)
      lyrics += `[${section.label}]\n${fallback.content}\n\n`
    }
  }

  lyrics += `(Instrumentation)\n(Genre: ${genre})\n(Instruments: Acoustic Guitar, Electric Guitar, Bass, Drums)`

  return { lyrics: lyrics.trim() }
}

// ✅ DETECTAR ESTRUTURA SIMPLES
function extractSections(lyrics: string): Array<{type: MusicBlock["type"], content: string}> {
  const lines = lyrics.split("\n")
  const result: Array<{type: MusicBlock["type"], content: string}> = []
  let currentSection: {type: MusicBlock["type"], content: string} | null = null

  for (const line of lines) {
    if (line.startsWith("[Intro]")) {
      if (currentSection) result.push(currentSection)
      currentSection = { type: "INTRO", content: "" }
    } else if (line.startsWith("[Verso 1]") || line.startsWith("[Verso 2]")) {
      if (currentSection) result.push(currentSection)
      currentSection = { type: "VERSE", content: "" }
    } else if (line.startsWith("[Refrão]")) {
      if (currentSection) result.push(currentSection)
      currentSection = { type: "CHORUS", content: "" }
    } else if (line.startsWith("[Ponte]")) {
      if (currentSection) result.push(currentSection)
      currentSection = { type: "BRIDGE", content: "" }
    } else if (line.startsWith("[Outro]")) {
      if (currentSection) result.push(currentSection)
      currentSection = { type: "OUTRO", content: "" }
    } else if (currentSection && line.trim() && !line.startsWith("(")) {
      currentSection.content += line + "\n"
    }
  }

  if (currentSection) result.push(currentSection)

  return result.length > 0 ? result : [
    { type: "VERSE", content: lyrics }
  ]
}

// 🚀 API SIMPLES E FUNCIONAL
export async function POST(request: NextRequest) {
  let genre = "Sertanejo Moderno Masculino"
  let theme = "Música"
  let title = "Música Natural"

  try {
    const { 
      originalLyrics, 
      genre: requestGenre, 
      theme: requestTheme, 
      title: requestTitle 
    } = await request.json()

    genre = requestGenre || "Sertanejo Moderno Masculino"
    theme = requestTheme || "Música"
    title = requestTitle || `${theme} - ${genre}`

    if (!originalLyrics?.trim()) {
      return NextResponse.json({ error: "Letra original é obrigatória" }, { status: 400 })
    }

    console.log(`[API] 🎵 Processando letra de forma natural...`)

    const originalSections = extractSections(originalLyrics)
    console.log(`[API] 📊 Seções:`, originalSections.map(s => s.type))

    const rewrittenBlocks: Record<string, MusicBlock[]> = {}

    // Processar cada seção
    const processingPromises = originalSections.map(async (section) => {
      try {
        const blocks = await writeWithNaturalRhymes(section.content, section.type, genre, theme)
        rewrittenBlocks[section.type] = blocks
        console.log(`[API] ✅ ${section.type} - Processado`)
      } catch (error) {
        console.error(`[API] ❌ Erro em ${section.type}:`, error)
        rewrittenBlocks[section.type] = [generateNaturalFallback(section.type, genre)]
      }
    })

    await Promise.all(processingPromises)

    const assemblyResult = await assembleNaturalSong(rewrittenBlocks, genre)
    const finalLyrics = assemblyResult.lyrics

    const totalLines = finalLyrics.split("\n").filter((line) => line.trim()).length
    console.log(`[API] 🎉 Concluído: ${totalLines} linhas`)

    return NextResponse.json({
      success: true,
      lyrics: finalLyrics,
      title: title,
      metadata: {
        genre,
        theme,
        totalLines,
        method: "ESCRITA_NATURAL"
      },
    })

  } catch (error) {
    console.error("[API] ❌ Erro:", error)

    // Fallback natural
    const emergencyLyrics = `[Intro]
Quando a noite chega suave e calma
Teu sorriso acende luz na alma
Nos braços do destino a vida gira
E nosso amor no peito inspira

[Verso 1]
Nos teus olhos vejo paz e quietude
Que transforma minha atitude
Teu perfume é doce melodia
Que na alma traz alegria

[Refrão]
Teu sorriso é meu abrigo
Teu abraço é meu calor
No compasso desse amigo
Encontro todo o amor

[Outro]
Juntos vamos caminhar
O amor nos guiar

(Instrumentation)
(Genre: ${genre})`

    return NextResponse.json({
      success: true,
      lyrics: emergencyLyrics,
      title: title,
      metadata: {
        genre,
        theme,
        totalLines: 14,
        method: "FALLBACK_NATURAL"
      },
    })
  }
}

export async function GET() {
  return NextResponse.json({ 
    error: "Método não permitido",
    message: "Use POST para processar letras"
  }, { status: 405 })
}
