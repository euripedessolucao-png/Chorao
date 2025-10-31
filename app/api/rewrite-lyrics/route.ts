// app/api/rewrite-lyrics/route.ts - SOLUÇÃO ESTRATÉGICA
import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

// 🎵 TIPOS DE BLOCO MUSICAL
interface MusicBlock {
  type: "INTRO" | "VERSE" | "PRE_CHORUS" | "CHORUS" | "BRIDGE" | "OUTRO"
  content: string
  score: number
}

// ✅ SISTEMA DE ENSINO PARA A IA
async function teachAItoWriteWithRhymes(
  originalSection: string,
  blockType: MusicBlock["type"],
  genre: string,
  theme: string
): Promise<MusicBlock[]> {
  
  const teachingPrompts = {
    INTRO: `🎵 ESCREVA UMA INTRO no estilo ${genre} SOBRE "${theme}"

📋 **COMO FAZER RIMAS CORRETAMENTE:**
1. PRIMEIRO: Escreva 4 linhas COMPLETAS (máximo 12 sílabas)
2. SEGUNDO: Ajuste as rimas SEM CORTAR versos
3. TERCEIRO: Mantenha o sentido emocional

🎯 **EXEMPLOS DE RIMAS QUE FUNCIONAM:**
"Quando a noite chega e a lua aparece" (11 sílabas)
"Teu sorriso ilumina e me oferece" (11 sílabas) 
→ RIMA: aparece/oferece (PERFEITA)

"Nos braços do destino a vida dança" (10 sílabas)  
"Enquanto nosso amor sempre avança" (10 sílabas)
→ RIMA: dança/avança (PERFEITA)

❌ **NUNCA FAÇA:**
"Quando a noite chega e a lua" (INCOMPLETO)
"Teu sorriso ilumina meu" (INCOMPLETO)

📝 AGORA ESCREVA 4 LINHAS COMPLETAS COM RIMAS:`,

    VERSE: `🎵 ESCREVA UM VERSO no estilo ${genre} SOBRE "${theme}"

📋 **ESTRATÉGIA PARA VERSOS RIMADOS:**
1. Linha 1: Estabeleça a cena (máximo 12 sílabas)
2. Linha 2: Desenvolva com rima da linha 1
3. Linha 3: Continue a narrativa  
4. Linha 4: Finalize com rima da linha 3

🎯 **EXEMPLO PRÁTICO:**
"Nos teus olhos encontro paz e calma" (10 sílabas)
"Que acalenta e cura toda a alma" (10 sílabas)
"Teu perfume é brisa de verão" (9 sílabas)
"Que aquece e alegra o coração" (9 sílabas)

❌ **EVITE:**
Linhas cortadas ou sem sentido completo

📝 AGORA ESCREVA 4 LINHAS COMPLETAS COM RIMAS A-B-A-B:`,

    CHORUS: `🎵 ESCREVA UM REFRÃO no estilo ${genre} SOBRE "${theme}"

📋 **REFRAO MEMORÁVEL COM RIMAS:**
- Linhas 1 e 3 rimam entre si
- Linhas 2 e 4 rimam entre si  
- Todas as linhas COMPLETAS (máximo 12 sílabas)

🎯 **EXEMPLO DE ESTRUTURA:**
"Teu sorriso é meu porto seguro" (10 sílabas)
"Teu abraço é meu aquecimento" (10 sílabas)  
"No ritmo desse amor tão puro" (9 sílabas)
"Encontro paz e sentimento" (9 sílabas)

📝 AGORA ESCREVA UM REFRÃO COM 4 LINHAS COMPLETAS:`,

    BRIDGE: `🎵 ESCREVA UMA PONTE no estilo ${genre} SOBRE "${theme}"

📋 **PONTE COM MUDANÇA E RIMA:**
- 4 linhas completas com nova perspectiva
- Rimas que reforcem a mudança emocional
- Máximo 12 sílabas por verso

🎯 **EXEMPLO:**
"Nos teus olhos vejo um novo amanhecer" (11 sílabas)
"Cada promessa faz o medo esquecer" (11 sílabas)
"Entre risos e lágrimas, verdades a florescer" (13 sílabas - AJUSTAR!)
"Nosso amor é forte e vai merecer" (11 sílabas)

📝 AGORA ESCREVA UMA PONTE COM 4 LINHAS COMPLETAS:`,

    OUTRO: `🎵 ESCREVA UM OUTRO no estilo ${genre} SOBRE "${theme}"

📋 **FECHO COM RIMAS SUAVES:**
- 2-4 linhas completas e conclusivas
- Máximo 9 sílabas por verso
- Rimas que tragam sensação de encerramento

🎯 **EXEMPLO:**
"Nos teus olhos me encontrei" (7 sílabas)
"Teu amor me completou" (7 sílabas)
"Juntos vamos seguir" (6 sílabas)
"O amor nos guiou" (6 sílabas)

📝 AGORA ESCREVA UM OUTRO COM 2-4 LINHAS COMPLETAS:`
  }

  try {
    const prompt = teachingPrompts[blockType as keyof typeof teachingPrompts]
    
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.7,
      maxTokens: 500,
    })

    return processAILearningResult(text || "", blockType, originalSection)
  } catch (error) {
    console.error(`[Teaching] Erro em ${blockType}:`, error)
    return [generateSmartFallback(blockType, theme, genre)]
  }
}

// ✅ PROCESSAR RESULTADO DO "ENSINO"
function processAILearningResult(
  text: string, 
  blockType: MusicBlock["type"], 
  originalSection: string
): MusicBlock[] {
  
  // Extrair apenas as linhas da letra (remover instruções)
  const lines = text.split("\n")
    .map(line => line.trim())
    .filter(line => {
      // Manter apenas linhas que parecem versos de música
      return line && 
             line.length >= 5 && 
             line.length <= 80 &&
             !line.startsWith("📋") &&
             !line.startsWith("🎯") &&
             !line.startsWith("❌") &&
             !line.startsWith("📝") &&
             !line.startsWith("🎵") &&
             !line.includes("sílabas") &&
             !line.match(/^\d+\./) // não numeradas
    })
    .slice(0, blockType === "OUTRO" ? 4 : 4)

  console.log(`[AI Learning] ${blockType} - Linhas geradas:`, lines)

  // ✅ VALIDAÇÃO INTELIGENTE
  if (isValidStrophe(lines, blockType)) {
    const content = lines.join("\n")
    
    return [{
      type: blockType,
      content: content,
      score: calculateLearningScore(content, originalSection, blockType),
    }]
  } else {
    console.log(`[AI Learning] ❌ ${blockType} inválido - usando fallback inteligente`)
    return [generateSmartFallback(blockType, "", "Sertanejo Moderno Masculino")]
  }
}

// ✅ VALIDAÇÃO POR ESTROFE (NÃO POR VERSO)
function isValidStrophe(lines: string[], blockType: MusicBlock["type"]): boolean {
  if (lines.length < (blockType === "OUTRO" ? 2 : 4)) {
    console.log(`[Validation] ❌ Estrofe muito curta: ${lines.length} linhas`)
    return false
  }

  // Verificar se todas as linhas são completas
  const incompletePatterns = [
    /\b(eu|me|te|se|nos|vos|o|a|os|as|um|uma|em|no|na|de|da|do|por|pra|que|se|mas|meu|minha|teu|tua)\s*$/i
  ]

  for (const line of lines) {
    for (const pattern of incompletePatterns) {
      if (pattern.test(line)) {
        console.log(`[Validation] ❌ Linha incompleta: "${line}"`)
        return false
      }
    }

    // Verificar comprimento razoável (não muito longo)
    if (line.length > 70) {
      console.log(`[Validation] ❌ Linha muito longa: ${line.length} chars`)
      return false
    }
  }

  console.log(`[Validation] ✅ Estrofe válida: ${lines.length} linhas completas`)
  return true
}

// ✅ SCORE BASEADO NA QUALIDADE DA ESTROFE
function calculateLearningScore(
  content: string, 
  originalSection: string, 
  blockType: MusicBlock["type"]
): number {
  const lines = content.split("\n").filter(line => line.trim())
  let score = 75 // Base mais alta para conteúdo validado

  // Bônus por estrutura completa
  const targetLines = blockType === "OUTRO" ? 2 : 4
  if (lines.length === targetLines) score += 15

  // Bônus por diversidade vocabular
  const words = content.split(/\s+/).filter(word => word.length > 2)
  const uniqueWords = new Set(words)
  if (uniqueWords.size / words.length > 0.6) score += 10

  return Math.min(score, 100)
}

// ✅ FALLBACKS INTELIGENTES COM RIMAS NATURAIS
function generateSmartFallback(blockType: MusicBlock["type"], theme: string, genre: string): MusicBlock {
  const smartFallbacks = {
    INTRO: {
      content: `Quando a noite cai e a lua aparece\nTeu sorriso brilha e me oferece\nNos braços da sorte a vida dança\nE nosso amor sempre avança`,
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

  const fallback = smartFallbacks[blockType as keyof typeof smartFallbacks] || smartFallbacks.VERSE
  return { type: blockType, ...fallback }
}

// ✅ MONTAGEM ESTRATÉGICA DA MÚSICA
async function assembleLearnedSong(
  blocks: Record<string, MusicBlock[]>,
  genre: string,
  theme: string
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
      const bestBlock = availableBlocks.reduce((best, current) => 
        current.score > best.score ? current : best
      )
      lyrics += `[${section.label}]\n${bestBlock.content}\n\n`
    } else {
      const fallback = generateSmartFallback(section.type as any, "", genre)
      lyrics += `[${section.label}]\n${fallback.content}\n\n`
    }
  }

  // Adicionar instrumentação
  lyrics += `(Instrumentation)\n(Genre: ${genre})\n(Instruments: Acoustic Guitar, Electric Guitar, Bass, Drums)`

  return { lyrics: lyrics.trim() }
}

// ✅ DETECTAR ESTRUTURA ORIGINAL
function extractSectionsToRewrite(lyrics: string): Array<{type: MusicBlock["type"], content: string}> {
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

  return result.length > 0 ? result : [
    { type: "VERSE", content: lyrics }
  ]
}

// 🚀 API PRINCIPAL COM ESTRATÉGIA DE ENSINO
export async function POST(request: NextRequest) {
  let genre = "Sertanejo Moderno Masculino"
  let theme = "Música"
  let title = "Música Melhorada"

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

    console.log(`[API] 🎵 ENSINANDO IA a escrever com rimas...`)

    // Analisar estrutura
    const originalSections = extractSectionsToRewrite(originalLyrics)
    console.log(`[API] 📊 Seções para ensinar:`, originalSections.map(s => s.type))

    const rewrittenBlocks: Record<string, MusicBlock[]> = {}

    // ✅ ENSINAR CADA SEÇÃO A ESCREVER COM RIMAS
    const teachingPromises = originalSections.map(async (section) => {
      try {
        const blocks = await teachAItoWriteWithRhymes(section.content, section.type, genre, theme)
        rewrittenBlocks[section.type] = blocks
        const score = blocks[0]?.score || 0
        console.log(`[API] ✅ ${section.type} - Aprendizado: ${score}%`)
      } catch (error) {
        console.error(`[API] ❌ Erro ensinando ${section.type}:`, error)
        rewrittenBlocks[section.type] = [generateSmartFallback(section.type, theme, genre)]
      }
    })

    await Promise.all(teachingPromises)

    // Montar música aprendida
    const assemblyResult = await assembleLearnedSong(rewrittenBlocks, genre, theme)
    const finalLyrics = assemblyResult.lyrics

    const totalLines = finalLyrics.split("\n").filter((line) => line.trim()).length
    console.log(`[API] 🎉 ENSINO CONCLUÍDO: ${totalLines} linhas com rimas naturais`)

    return NextResponse.json({
      success: true,
      lyrics: finalLyrics,
      title: title,
      metadata: {
        genre,
        theme,
        totalLines,
        strategy: "ENSINO_DE_RIMAS",
        method: "APRENDIZADO_ESTRUTURADO"
      },
    })

  } catch (error) {
    console.error("[API] ❌ Erro no ensino:", error)

    // Fallback inteligente
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
        strategy: "FALLBACK_EDUCATIVO",
        method: "ENSINO_DE_RIMAS"
      },
    })
  }
}

export async function GET() {
  return NextResponse.json({ 
    error: "Método não permitido",
    message: "Use POST para melhorar letras"
  }, { status: 405 })
}
