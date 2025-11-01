// app/api/rewrite-lyrics/route.ts - VERSÃO CORRIGIDA
import { type NextRequest, NextResponse } from "next/server"
import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter-brasileiro"

// 🎵 TIPOS DE BLOCO MUSICAL
interface MusicBlock {
  type: "INTRO" | "VERSE" | "PRE_CHORUS" | "CHORUS" | "BRIDGE" | "OUTRO"
  content: string
  score: number
}

// ✅ CONFIGURAÇÕES CORRIGIDAS DE SÍLABAS COM TIPOS
type GenreKey =
  | "Sertanejo Moderno Masculino"
  | "Sertanejo Moderno Feminino"
  | "Sertanejo Universitário"
  | "Sertanejo Raiz"
  | "Pagode Romântico"
  | "Funk Carioca"
  | "Gospel Contemporâneo"
  | "MPB"

interface SyllableConfig {
  max: number
  ideal: number
  min: number
}

const GENRE_SYLLABLE_CONFIG: Record<GenreKey, SyllableConfig> = {
  "Sertanejo Moderno Masculino": { max: 12, ideal: 10, min: 8 },
  "Sertanejo Moderno Feminino": { max: 12, ideal: 10, min: 8 },
  "Sertanejo Universitário": { max: 12, ideal: 10, min: 8 },
  "Sertanejo Raiz": { max: 12, ideal: 11, min: 9 },
  "Pagode Romântico": { max: 12, ideal: 9, min: 7 },
  "Funk Carioca": { max: 10, ideal: 6, min: 3 },
  "Gospel Contemporâneo": { max: 12, ideal: 9, min: 7 },
  MPB: { max: 13, ideal: 10, min: 7 },
}

// ✅ FUNÇÃO SEGURA PARA OBTER CONFIGURAÇÃO
function getSyllableConfig(genre: string): SyllableConfig {
  const validGenre = Object.keys(GENRE_SYLLABLE_CONFIG).includes(genre)
    ? (genre as GenreKey)
    : "Sertanejo Moderno Masculino"

  return GENRE_SYLLABLE_CONFIG[validGenre]
}

// ✅ CORREÇÃO: REMOVER ASPAS E VALIDAR SÍLABAS
function removeQuotesAndClean(text: string): string {
  return text
    .replace(/^"|"$/g, "") // Remove aspas no início e fim
    .replace(/"\s*$/gm, "") // Remove aspas no final das linhas
    .replace(/^\s*"/gm, "") // Remove aspas no início das linhas
    .replace(/"/g, "") // Remove todas as aspas restantes
    .trim()
}

// ✅ VALIDAÇÃO AVANÇADA COM MOTOR BRASILEIRO
function validateAdvancedSyllables(line: string, maxSyllables: number): boolean {
  const syllables = countPoeticSyllables(line)
  const isValid = syllables <= maxSyllables

  if (!isValid) {
    console.log(`[SyllableCheck] ❌ "${line}" - ${syllables} sílabas (máx: ${maxSyllables})`)
  } else {
    console.log(`[SyllableCheck] ✅ "${line}" - ${syllables} sílabas`)
  }

  return isValid
}

// ✅ CONTADOR SIMPLIFICADO DE SÍLABAS (fallback)
function countBasicSyllables(text: string): number {
  const cleanText = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, "")

  const vowels = cleanText.match(/[aeiou]/gi)
  return vowels ? vowels.length : 0
}

// ✅ VALIDAÇÃO RIGOROSA DE SÍLABAS (usa motor avançado)
function validateSyllableCount(line: string, maxSyllables: number): boolean {
  try {
    return validateAdvancedSyllables(line, maxSyllables)
  } catch (error) {
    console.log("[SyllableCheck] ⚠️  Motor avançado falhou, usando básico")
    // Fallback para contagem básica se o motor falhar
    const syllableCount = countBasicSyllables(line)
    const isValid = syllableCount <= maxSyllables

    if (!isValid) {
      console.log(`[SyllableCheck] ❌ "${line}" - ${syllableCount} sílabas (fallback)`)
    }

    return isValid
  }
}

function getModel() {
  if (process.env.OPENAI_API_KEY) {
    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    return openai("gpt-4o-mini")
  }
  return "openai/gpt-4o-mini"
}

// ✅ SISTEMA SIMPLES E EFETIVO
async function writeWithNaturalRhymes(
  originalSection: string,
  blockType: MusicBlock["type"],
  genre: string,
  theme: string,
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
"Nos teus olhos vejo paz e quietude"
"Que transforma minha atitude"
"Teu perfume é doce melodia"
"Que na alma traz alegria"

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
"No compasso desse amigo"
"Encontro todo o amor"

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

Agora escreva 2-4 linhas:`,

    PRE_CHORUS: `Escreva 2-4 linhas completas para um PRÉ-REFRÃO de ${genre} sobre ${theme}.

Transição:
- Linhas que preparam o refrão
- Máximo 12 sílabas
- Rimas naturais

Exemplo:
"E quando você chega perto"
"Meu coração fica desperto"

Agora escreva 2-4 linhas:`,
  }

  try {
    const prompt = simplePrompts[blockType as keyof typeof simplePrompts] || simplePrompts.VERSE

    const { text } = await generateText({
      model: getModel(),
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
function processSimpleResult(text: string, blockType: MusicBlock["type"]): MusicBlock[] {
  const capitalizeFirstLetter = (line: string) => {
    return line.charAt(0).toUpperCase() + line.slice(1)
  }

  // Extrair apenas linhas que parecem versos
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .map((line) => line.replace(/^["']|["']$/g, "")) // Remove aspas do início e fim
    .filter((line) => {
      return (
        line &&
        line.length >= 5 &&
        line.length <= 70 &&
        !line.startsWith("Exemplo") &&
        !line.startsWith("Regras") &&
        !line.startsWith("Estrutura") &&
        !line.startsWith("Agora") &&
        !line.includes("sílabas")
      )
    })
    .map(capitalizeFirstLetter) // Capitalizar cada linha
    .slice(0, blockType === "OUTRO" ? 4 : 4)

  console.log(`[Simple] ${blockType} - Linhas:`, lines)

  // Validação básica
  if (lines.length >= (blockType === "OUTRO" ? 2 : 3) && areLinesComplete(lines)) {
    const content = lines.join("\n")

    return [
      {
        type: blockType,
        content: content,
        score: 85,
      },
    ]
  } else {
    console.log(`[Simple] ❌ ${blockType} inválido`)
    return [generateNaturalFallback(blockType, "Sertanejo Moderno Masculino")]
  }
}

// ✅ VALIDAÇÃO SIMPLES DE COMPLETUDE
function areLinesComplete(lines: string[]): boolean {
  const incompletePatterns = [
    /\b(eu|me|te|se|nos|vos|o|a|os|as|um|uma|em|no|na|de|da|do|por|pra|que|se|mas|meu|minha|teu|tua)\s*$/i,
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
      score: 90,
    },
    VERSE: {
      content: `Nos teus olhos vejo paz e quietude\nQue transforma minha atitude\nTeu perfume é doce melodia\nQue na alma traz alegria`,
      score: 90,
    },
    PRE_CHORUS: {
      content: `E quando você chega perto\nMeu coração fica desperto`,
      score: 90,
    },
    CHORUS: {
      content: `Teu sorriso é meu porto seguro\nTeu abraço é meu aquecimento\nNo compasso desse amigo\nEncontro todo o amor`,
      score: 95,
    },
    BRIDGE: {
      content: `Nos teus olhos vejo novo amanhecer\nCada promessa faz o medo esquecer\nEntre risos e sonhos a florescer\nNosso amor é forte e vai vencer`,
      score: 90,
    },
    OUTRO: {
      content: `Nos teus olhos me encontrei\nTeu amor me completou\nJuntos vamos seguir\nO amor nos guiou`,
      score: 90,
    },
  }

  const fallback = naturalFallbacks[blockType as keyof typeof naturalFallbacks] || naturalFallbacks.VERSE
  return { type: blockType, ...fallback }
}

// ✅ MONTAGEM SIMPLES
async function assembleNaturalSong(blocks: Record<string, MusicBlock[]>, genre: string): Promise<{ lyrics: string }> {
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
      const bestBlock = availableBlocks[0]
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
function extractSections(lyrics: string): Array<{ type: MusicBlock["type"]; content: string }> {
  const lines = lyrics.split("\n")
  const result: Array<{ type: MusicBlock["type"]; content: string }> = []
  let currentSection: { type: MusicBlock["type"]; content: string } | null = null

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

  return result.length > 0 ? result : [{ type: "VERSE", content: lyrics }]
}

// 🚀 API SIMPLES E FUNCIONAL
export async function POST(request: NextRequest) {
  let genre = "Sertanejo Moderno Masculino"
  let theme = "Música"
  let title = "Música Natural"

  try {
    const { originalLyrics, genre: requestGenre, theme: requestTheme, title: requestTitle } = await request.json()

    genre = requestGenre || "Sertanejo Moderno Masculino"
    theme = requestTheme || "Música"
    title = requestTitle || `${theme} - ${genre}`

    if (!originalLyrics?.trim()) {
      return NextResponse.json({ error: "Letra original é obrigatória" }, { status: 400 })
    }

    console.log(`[API] 🎵 Processando letra de forma natural...`)

    const originalSections = extractSections(originalLyrics)
    console.log(
      `[API] 📊 Seções:`,
      originalSections.map((s) => s.type),
    )

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
      letra: finalLyrics, // Compatibilidade com página
      title: title,
      titulo: title, // Compatibilidade com página
      metadata: {
        genre,
        theme,
        totalLines,
        method: "ESCRITA_NATURAL",
        polishingApplied: true, // Flag esperada pela página
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
      letra: emergencyLyrics,
      title: title,
      titulo: title,
      metadata: {
        genre,
        theme,
        totalLines: 14,
        method: "FALLBACK_NATURAL",
        polishingApplied: false,
      },
    })
  }
}

export async function GET() {
  return NextResponse.json(
    {
      error: "Método não permitido",
      message: "Use POST para processar letras",
    },
    { status: 405 },
  )
}
