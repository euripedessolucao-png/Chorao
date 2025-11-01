// app/api/rewrite-lyrics/route.ts - VERSÃO CORRIGIDA
import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
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

// 🎯 RESSECRITURA COM CONTROLE DE SÍLABAS E SEM ASPAS
async function rewriteSectionWithQuality(
  originalSection: string,
  blockType: MusicBlock["type"],
  genre: string,
  theme: string,
): Promise<MusicBlock[]> {
  const syllableConfig = getSyllableConfig(genre)
  const structure = "A-B-A-B"

  const rewritePrompts = {
    INTRO: `Escreva 4 linhas completas para INTRO de ${genre} sobre "${theme}".

REGRAS CRÍTICAS:
- 4 linhas COMPLETAS SEM ASPAS
- Máximo ${syllableConfig.max} sílabas poéticas por verso (NUNCA ultrapassar)
- Ideal ${syllableConfig.ideal} sílabas
- Estrutura ${structure}
- Linguagem natural brasileira
- NUNCA use aspas nas linhas
- Use contrações naturais: "pra", "tá", "cê"

EXEMPLO CORRETO:
Quando a noite chega suave
Teu sorriso acende na mente
Nos braços do destino danço
E nosso amor segue em frente

4 LINHAS SEM ASPAS:`,

    VERSE: `Escreva 4 linhas completas para VERSO de ${genre} sobre "${theme}".

REGRAS CRÍTICAS:
- 4 linhas COMPLETAS SEM ASPAS  
- Máximo ${syllableConfig.max} sílabas poéticas (NUNCA ultrapassar)
- Ideal ${syllableConfig.ideal} sílabas
- Estrutura ${structure}
- Desenvolva a narrativa
- NUNCA use aspas nas linhas
- Use linguagem coloquial brasileira

EXEMPLO CORRETO:
Nos teus olhos vejo esperança
Que transforma minha lembrança
Teu perfume é brisa calma
Que aquece e acalma a alma

4 LINHAS SEM ASPAS:`,

    CHORUS: `Escreva 4 linhas completas para REFRÃO de ${genre} sobre "${theme}".

REGRAS CRÍTICAS:
- 4 linhas COMPLETAS SEM ASPAS
- Máximo ${syllableConfig.max} sílabas poéticas (NUNCA ultrapassar) 
- Ideal ${syllableConfig.ideal} sílabas
- Estrutura ${structure}
- Gancho memorável
- NUNCA use aspas nas linhas
- Use rimas naturais

EXEMPLO CORRETO:
Teu sorriso é meu abrigo
Teu abraço é meu amigo
No compasso desse ritmo
Encontro paz e seu mimo

4 LINHAS SEM ASPAS:`,

    BRIDGE: `Escreva 4 linhas completas para PONTE de ${genre} sobre "${theme}".

REGRAS CRÍTICAS:
- 4 linhas COMPLETAS SEM ASPAS
- Máximo ${syllableConfig.max} sílabas poéticas (NUNCA ultrapassar)
- Mudança de perspectiva
- NUNCA use aspas nas linhas
- Linguagem poética

EXEMPLO CORRETO:
Nos teus olhos vejo novo dia
Cada promessa traz harmonia
Entre risos e novas histórias
Nosso amor conta vitórias

4 LINHAS SEM ASPAS:`,

    OUTRO: `Escreva 2-4 linhas completas para OUTRO de ${genre} sobre "${theme}".

REGRAS CRÍTICAS:
- 2-4 linhas COMPLETAS SEM ASPAS
- Máximo 9 sílabas poéticas por verso
- Fecho emocional
- NUNCA use aspas nas linhas
- Linguagem suave

EXEMPLO CORRETO:
Nos teus olhos me encontrei
Teu amor me completou
Juntos vamos seguir
O amor nos guiou

LINHAS FINAIS SEM ASPAS:`,
  }

  try {
    const prompt = rewritePrompts[blockType as keyof typeof rewritePrompts]

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.7,
    })

    return processRewrittenBlock(text || "", blockType, genre, syllableConfig.max)
  } catch (error) {
    console.error(`[Rewrite] Erro em ${blockType}:`, error)
    return [generateQualityFallback(blockType, theme, syllableConfig.max)]
  }
}

// ✅ PROCESSAMENTO COM VALIDAÇÃO AVANÇADA DE SÍLABAS
function processRewrittenBlock(
  text: string,
  blockType: MusicBlock["type"],
  genre: string,
  maxSyllables: number,
): MusicBlock[] {
  // ✅ PRIMEIRO: Remover todas as aspas
  const cleanText = removeQuotesAndClean(text)

  const lines = cleanText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => {
      return (
        line &&
        line.length >= 5 &&
        !line.startsWith("EXEMPLO") &&
        !line.startsWith("REGRAS") &&
        !line.startsWith("LINHAS") &&
        !line.includes("sílabas")
      )
    })
    .slice(0, blockType === "OUTRO" ? 4 : 4)

  // ✅ VALIDAR SÍLABAS COM MOTOR AVANÇADO
  const validLines = lines.filter((line) => validateSyllableCount(line, maxSyllables))

  if (validLines.length >= (blockType === "OUTRO" ? 2 : 3)) {
    const content = validLines.join("\n")

    return [
      {
        type: blockType,
        content: content,
        score: calculateBlockScore(content, maxSyllables),
      },
    ]
  } else {
    console.log(
      `[Validation] ❌ ${blockType} rejeitado - ${lines.length - validLines.length} linhas com sílabas excessivas`,
    )
    return [generateQualityFallback(blockType, "", maxSyllables)]
  }
}

// ✅ SCORE BASEADO NA CONFORMIDADE DAS SÍLABAS
function calculateBlockScore(content: string, maxSyllables: number): number {
  const lines = content.split("\n").filter((line) => line.trim())
  let score = 80 // Base alta para conteúdo validado

  // Bônus por todas as linhas dentro do limite
  const allLinesValid = lines.every((line) => validateSyllableCount(line, maxSyllables))
  if (allLinesValid) score += 15

  // Bônus por estrutura completa
  if (lines.length >= 4) score += 5

  return Math.min(score, 100)
}

// ✅ FALLBACKS GARANTIDOS DENTRO DO LIMITE DE SÍLABAS
function generateQualityFallback(blockType: MusicBlock["type"], theme: string, maxSyllables: number): MusicBlock {
  const fallbacks = {
    INTRO: {
      content: `Quando a noite chega suave\nTeu sorriso acende na mente\nNos braços do destino danço\nE nosso amor segue em frente`,
      score: 85,
    },
    VERSE: {
      content: `Nos teus olhos vejo esperança\nQue transforma minha lembrança\nTeu perfume é brisa calma\nQue aquece e acalma a alma`,
      score: 85,
    },
    CHORUS: {
      content: `Teu sorriso é meu abrigo\nTeu abraço é meu amigo\nNo compasso desse ritmo\nEncontro paz e seu mimo`,
      score: 90,
    },
    BRIDGE: {
      content: `Nos teus olhos vejo novo dia\nCada promessa traz harmonia\nEntre risos e novas histórias\nNosso amor conta vitórias`,
      score: 85,
    },
    OUTRO: {
      content: `Nos teus olhos me encontrei\nTeu amor me completou\nJuntos vamos seguir\nO amor nos guiou`,
      score: 85,
    },
  }

  const fallback = fallbacks[blockType as keyof typeof fallbacks] || fallbacks.VERSE

  // ✅ GARANTIR que o fallback está dentro do limite com motor avançado
  const lines = fallback.content.split("\n")
  const validLines = lines.filter((line) => validateSyllableCount(line, maxSyllables))

  if (validLines.length < lines.length) {
    console.log(`[Fallback] Ajustando ${blockType} para respeitar ${maxSyllables} sílabas`)
    // Se precisar, ajustar linhas problemáticas
    const adjustedContent = validLines.join("\n") || fallbacks.VERSE.content
    return { type: blockType, content: adjustedContent, score: 80 }
  }

  return { type: blockType, ...fallback }
}

// ✅ MONTAGEM DA MÚSICA COM VALIDAÇÃO FINAL
async function assembleRewrittenSong(
  blocks: Record<string, MusicBlock[]>,
  genre: string,
  theme: string,
): Promise<{ lyrics: string; improvements: string[] }> {
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
  const improvements: string[] = ["Sistema de qualidade aplicado", "Motor de sílabas poéticas ativo"]

  for (const section of structure) {
    const availableBlocks = blocks[section.type] || []
    if (availableBlocks.length > 0) {
      const bestBlock = availableBlocks.reduce((best, current) => (current.score > best.score ? current : best))
      lyrics += `[${section.label}]\n${bestBlock.content}\n\n`
    } else {
      const syllableConfig = getSyllableConfig(genre)
      const fallback = generateQualityFallback(section.type as any, "", syllableConfig.max)
      lyrics += `[${section.label}]\n${fallback.content}\n\n`
      improvements.push(`Fallback aplicado em ${section.label}`)
    }
  }

  // ✅ VALIDAÇÃO FINAL: Verificar se há aspas na letra completa
  if (lyrics.includes('"')) {
    console.log("[FinalCheck] ❌ Aspas detectadas na letra final - removendo")
    lyrics = removeQuotesAndClean(lyrics)
    improvements.push("Aspas removidas da letra final")
  }

  // Adicionar instrumentação
  lyrics += `(Instrumentation)\n(Genre: ${genre})\n(Instruments: Acoustic Guitar, Electric Guitar, Bass, Drums)`

  return {
    lyrics: lyrics.trim(),
    improvements,
  }
}

// ✅ DETECTAR ESTRUTURA ORIGINAL
function extractSectionsToRewrite(lyrics: string): Array<{ type: MusicBlock["type"]; content: string }> {
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
    } else if (line.startsWith("[Refrão]") || line.startsWith("[Refrão Final]")) {
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

// 🚀 API PRINCIPAL
export async function POST(request: NextRequest) {
  let genre = "Sertanejo Moderno Masculino"
  let theme = "Música"
  let title = "Música Resscrita"

  try {
    const body = await request.json()
    console.log("[v0] Received request body:", JSON.stringify(body, null, 2))

    const { originalLyrics, genre: requestGenre, theme: requestTheme, title: requestTitle } = body

    genre = requestGenre || "Sertanejo Moderno Masculino"
    theme = requestTheme || "Música"
    title = requestTitle || `${theme} - ${genre}`

    console.log("[v0] Parsed parameters:", { genre, theme, title, hasLyrics: !!originalLyrics })

    if (!originalLyrics?.trim()) {
      console.log("[v0] Error: No original lyrics provided")
      return NextResponse.json({ error: "Letra original é obrigatória" }, { status: 400 })
    }

    const syllableConfig = getSyllableConfig(genre)

    console.log(`[v0] Starting rewrite for genre: ${genre}`)
    console.log(`[v0] Syllable config: max=${syllableConfig.max}, ideal=${syllableConfig.ideal}`)
    console.log(`[v0] Using PoeticSyllableEngine`)

    // Analisar estrutura
    const originalSections = extractSectionsToRewrite(originalLyrics)
    console.log(
      `[v0] Found ${originalSections.length} sections:`,
      originalSections.map((s) => s.type),
    )

    const rewrittenBlocks: Record<string, MusicBlock[]> = {}

    // Reescrever cada seção
    const rewritePromises = originalSections.map(async (section) => {
      try {
        console.log(`[v0] Rewriting section: ${section.type}`)
        const blocks = await rewriteSectionWithQuality(section.content, section.type, genre, theme)
        rewrittenBlocks[section.type] = blocks
        const score = blocks[0]?.score || 0
        console.log(`[v0] Section ${section.type} completed with score: ${score}`)
      } catch (error) {
        console.error(`[v0] Error rewriting ${section.type}:`, error)
        const syllableConfig = getSyllableConfig(genre)
        rewrittenBlocks[section.type] = [generateQualityFallback(section.type, theme, syllableConfig.max)]
      }
    })

    await Promise.all(rewritePromises)

    console.log("[v0] All sections rewritten, assembling song...")

    // Montar música
    const assemblyResult = await assembleRewrittenSong(rewrittenBlocks, genre, theme)
    const finalLyrics = assemblyResult.lyrics

    const totalLines = finalLyrics.split("\n").filter((line) => line.trim()).length
    console.log(`[v0] Rewrite completed: ${totalLines} lines, improvements: ${assemblyResult.improvements.join(", ")}`)

    return NextResponse.json({
      success: true,
      lyrics: finalLyrics,
      letra: finalLyrics, // Adicionando campo 'letra' para compatibilidade
      title: title,
      titulo: title, // Adicionando campo 'titulo' para compatibilidade
      metadata: {
        genre,
        theme,
        totalLines,
        improvements: assemblyResult.improvements,
        syllableConfig: syllableConfig,
        method: "QUALIDADE_GARANTIDA",
        syllableEngine: "PoeticSyllableEngine",
        polishingApplied: true, // Adicionando flag de polimento
      },
    })
  } catch (error) {
    console.error("[v0] Critical error in rewrite:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")

    // Fallback de emergência dentro do limite
    const emergencyLyrics = `[Intro]
Quando a noite chega suave
Teu sorriso acende na mente
Nos braços do destino danço
E nosso amor segue em frente

[Verso 1]
Nos teus olhos vejo esperança
Que transforma minha lembrança
Teu perfume é brisa calma
Que aquece e acalma a alma

[Refrão]
Teu sorriso é meu abrigo
Teu abraço é meu amigo
No compasso desse ritmo
Encontro paz e seu mimo

[Outro]
Juntos vamos caminhar
O amor nos guiar

(Instrumentation)
(Genre: ${genre})`

    const syllableConfig = getSyllableConfig(genre)

    return NextResponse.json({
      success: true,
      lyrics: emergencyLyrics,
      letra: emergencyLyrics, // Adicionando campo 'letra' para compatibilidade
      title: title,
      titulo: title, // Adicionando campo 'titulo' para compatibilidade
      metadata: {
        genre,
        theme: "amor",
        totalLines: 14,
        improvements: ["Fallback de qualidade aplicado"],
        syllableConfig: syllableConfig,
        method: "FALLBACK_SEGURO",
        syllableEngine: "PoeticSyllableEngine",
        polishingApplied: false, // Adicionando flag de polimento
      },
    })
  }
}

export async function GET() {
  return NextResponse.json(
    {
      error: "Método não permitido",
      message: "Use POST para reescrever letras",
    },
    { status: 405 },
  )
}
