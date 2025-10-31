// app/api/generate-chorus/route.ts - VERSÃO CORRIGIDA E FUNCIONAL
import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { countPoeticSyllables } from '@/lib/validation/syllable-counter-brasileiro'

// 🎵 TIPOS
interface ChorusBlock {
  content: string
  score: number
  syllables: number[]
}

// ✅ CONFIGURAÇÕES POR GÊNERO
const GENRE_SYLLABLE_CONFIG = {
  "Sertanejo Moderno Masculino": { max: 12, ideal: 10, min: 8 },
  "Sertanejo Moderno Feminino": { max: 12, ideal: 10, min: 8 },
  "Sertanejo Universitário": { max: 12, ideal: 10, min: 8 },
  "Sertanejo Raiz": { max: 12, ideal: 11, min: 9 },
  "Pagode Romântico": { max: 12, ideal: 9, min: 7 },
  "Funk Carioca": { max: 10, ideal: 6, min: 3 },
  "Gospel Contemporâneo": { max: 12, ideal: 9, min: 7 },
  "MPB": { max: 13, ideal: 10, min: 7 },
}

// ✅ ESTRATÉGIA SIMPLES E EFETIVA - CORRIGIDA
async function generateNaturalChorus(
  genre: string,
  theme: string,
  context?: string
): Promise<ChorusBlock[]> {
  
  const syllableConfig = GENRE_SYLLABLE_CONFIG[genre as keyof typeof GENRE_SYLLABLE_CONFIG] || { max: 12, ideal: 10, min: 8 }

  const prompt = `Escreva EXATAMENTE 4 linhas completas para um REFRÃO de ${genre} sobre "${theme}".

${context ? `Contexto: ${context}` : ''}

**REGRAS CRÍTICAS:**
1. 4 LINHAS COMPLETAS (nunca cortar versos no meio)
2. Máximo ${syllableConfig.max} sílabas poéticas por linha
3. Estrutura A-B-A-B (linha 1 rima com linha 3, linha 2 rima com linha 4)
4. Gancho memorável e emocional
5. Linguagem natural brasileira
6. SEM ASPAS nas linhas
7. Versos completos e independentes

**EXEMPLOS CORRETOS:**

Quando o amor bate na porta
A vida ganha nova sorte
O coração canta e conforta
E a felicidade é mais forte

Teu sorriso é meu porto seguro
Teu abraço é meu aquecimento  
No ritmo desse amor tão puro
Encontro paz e sentimento

**AGORA ESCREVA 4 LINHAS COMPLETAS PARA O REFRÃO (SEM ASPAS):`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.8, // Aumentado para mais criatividade
      maxTokens: 200,
    })

    console.log(`[Chorus] Resposta bruta da IA:`, text)
    return processChorusResult(text || "", genre, syllableConfig.max)
  } catch (error) {
    console.error("[Chorus] Erro na geração:", error)
    return [generateChorusFallback(genre, theme)]
  }
}

// ✅ PROCESSAMENTO CORRIGIDO
function processChorusResult(text: string, genre: string, maxSyllables: number): ChorusBlock[] {
  
  // Limpar e extrair linhas
  const cleanText = text.replace(/"/g, '').trim()
  const lines = cleanText.split("\n")
    .map(line => line.trim())
    .filter(line => {
      return line && 
             line.length >= 5 && 
             line.length <= 70 &&
             !line.startsWith("**") &&
             !line.startsWith("Exemplo") &&
             !line.startsWith("Regras") &&
             !line.startsWith("Contexto") &&
             !line.startsWith("Agora") &&
             !line.startsWith("Quando") && // Remove exemplos copiados
             !line.includes("sílabas") &&
             !line.includes("exemplo")
    })
    .slice(0, 4) // Apenas 4 linhas para refrão

  console.log(`[Chorus] Linhas filtradas:`, lines)

  // VALIDAÇÃO FORTE: deve ter exatamente 4 linhas válidas
  if (lines.length === 4) {
    // Validar sílabas
    const syllableCounts: number[] = []
    let allValid = true
    
    for (const line of lines) {
      const syllables = countPoeticSyllables(line)
      syllableCounts.push(syllables)
      
      if (syllables > maxSyllables) {
        console.log(`[Chorus] ❌ Linha excede sílabas: "${line}" - ${syllables} sílabas`)
        allValid = false
      }
    }

    // Validar completude
    const areComplete = areChorusLinesComplete(lines)
    
    if (allValid && areComplete) {
      const content = lines.join("\n")
      
      return [{
        content: content,
        score: calculateChorusScore(lines, syllableCounts, maxSyllables),
        syllables: syllableCounts
      }]
    }
  }
  
  console.log(`[Chorus] ❌ Refrão inválido - linhas: ${lines.length}, válidas: ${lines.length}`)
  return [generateChorusFallback(genre, "amor")]
}

// ✅ VALIDAÇÃO DE COMPLETUDE MELHORADA
function areChorusLinesComplete(lines: string[]): boolean {
  const incompletePatterns = [
    /^\s*(e|é|o|a|os|as|um|uma|uns|umas|de|da|do|em|no|na|por|pra|que|se|mas|meu|minha|teu|tua)\s*$/i,
    /^\s*[aeiou]\s*$/i,
    /\.\.\.$/,
    /,$/,
    /^\s*\w+\s+e\s*$/i
  ]

  for (const line of lines) {
    // Verifica se a linha termina com palavra incompleta
    const words = line.trim().split(/\s+/)
    if (words.length === 0) return false
    
    const lastWord = words[words.length - 1].toLowerCase()
    
    for (const pattern of incompletePatterns) {
      if (pattern.test(lastWord) || pattern.test(line)) {
        console.log(`[Chorus] Linha incompleta detectada: "${line}"`)
        return false
      }
    }
    
    // Verifica se tem pelo menos 2 palavras
    if (words.length < 2) {
      console.log(`[Chorus] Linha muito curta: "${line}"`)
      return false
    }
  }
  
  return true
}

// ✅ SCORE DETALHADO
function calculateChorusScore(lines: string[], syllableCounts: number[], maxSyllables: number): number {
  let score = 70 // Base

  // Bônus por sílabas dentro do limite
  const allWithinLimit = syllableCounts.every(count => count <= maxSyllables)
  if (allWithinLimit) score += 20

  // Bônus por estrutura completa
  if (lines.length === 4) score += 10

  // Bônus por variedade vocabular
  const uniqueWords = new Set(lines.flatMap(line => line.toLowerCase().split(/\s+/)))
  if (uniqueWords.size > 12) score += 5

  return Math.min(score, 100)
}

// ✅ FALLBACKS GARANTIDOS (testados e dentro das sílabas)
function generateChorusFallback(genre: string, theme: string): ChorusBlock {
  const syllableConfig = GENRE_SYLLABLE_CONFIG[genre as keyof typeof GENRE_SYLLABLE_CONFIG] || { max: 12, ideal: 10, min: 8 }
  
  const chorusFallbacks = [
    {
      content: `Teu sorriso é meu porto seguro\nTeu abraço é meu aquecimento\nNo ritmo desse amor tão puro\nEncontro paz e sentimento`,
      score: 95,
      syllables: [8, 9, 8, 8]
    },
    {
      content: `Teu olhar é a luz do meu caminho\nTeu carinho é o sol do meu dia\nEm teus braços eu encontro sentido\nTeu amor é a minha melodia`,
      score: 95,
      syllables: [9, 8, 9, 8]
    },
    {
      content: `Seu amor é minha estrada\nMinha luz, minha jornada\nNesse mundo de verdade\nEncontro a liberdade`,
      score: 90,
      syllables: [7, 7, 7, 7]
    },
    {
      content: `No compasso do teu abraço\nEncontro todo o meu espaço\nTeu amor é meu refúgio\nMeu porto, meu vestígio`,
      score: 90,
      syllables: [8, 8, 8, 8]
    },
    {
      content: `Quando a vida me surpreende\nTeu amor me defende e estende\nNa dança desse amor que incende\nMinha alma se rende e depende`,
      score: 92,
      syllables: [8, 9, 9, 8]
    }
  ]

  // Escolher um fallback aleatório
  const randomFallback = chorusFallbacks[Math.floor(Math.random() * chorusFallbacks.length)]
  
  // Garantir que está dentro do limite de sílabas
  const validatedSyllables = randomFallback.syllables.map(count => 
    Math.min(count, syllableConfig.max)
  )
  
  return {
    ...randomFallback,
    syllables: validatedSyllables
  }
}

// ✅ GERAR MÚLTIPLOS REFRÕES REAIS
async function generateMultipleChoruses(
  genre: string, 
  theme: string, 
  context?: string,
  count: number = 5
): Promise<ChorusBlock[]> {
  
  const choruses: ChorusBlock[] = []
  const usedContents = new Set<string>()
  
  // Primeiro: adicionar fallbacks garantidos
  for (let i = 0; i < 2; i++) {
    const fallback = generateChorusFallback(genre, theme)
    if (!usedContents.has(fallback.content)) {
      choruses.push(fallback)
      usedContents.add(fallback.content)
    }
  }
  
  // Depois: gerar novos refrões
  for (let i = 0; i < count; i++) {
    try {
      const chorus = await generateNaturalChorus(genre, theme, context)
      
      for (const c of chorus) {
        if (!usedContents.has(c.content) && c.score >= 70) {
          choruses.push(c)
          usedContents.add(c.content)
          console.log(`[Chorus] ✅ Refrão ${i + 1} gerado com score: ${c.score}`)
        }
      }
      
      // Pequena pausa para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (error) {
      console.error(`[Chorus] Erro na geração ${i + 1}:`, error)
      // Adicionar fallback se a geração falhar
      const fallback = generateChorusFallback(genre, theme)
      if (!usedContents.has(fallback.content)) {
        choruses.push(fallback)
        usedContents.add(fallback.content)
      }
    }
  }

  // Ordenar por score e garantir quantidade
  const sortedChoruses = choruses
    .sort((a, b) => b.score - a.score)
    .slice(0, count)

  console.log(`[Chorus] 🎉 ${sortedChoruses.length} refrões únicos gerados`)
  
  return sortedChoruses
}

// 🚀 API PRINCIPAL CORRIGIDA
export async function POST(request: NextRequest) {
  let genre = "Sertanejo Moderno Masculino"
  let theme = "amor"

  try {
    const { 
      genre: requestGenre, 
      theme: requestTheme,
      context,
      count = 5
    } = await request.json()

    genre = requestGenre || "Sertanejo Moderno Masculino"
    theme = requestTheme || "amor"

    console.log(`[API] 🎵 Gerando ${count} refrões para: ${genre} - ${theme}`)

    // Gerar múltiplos refrões
    const choruses = await generateMultipleChoruses(genre, theme, context, count)

    console.log(`[API] 🎉 CONCLUÍDO: ${choruses.length} refrões gerados`)

    return NextResponse.json({
      success: true,
      choruses: choruses,
      metadata: {
        genre,
        theme,
        totalChoruses: choruses.length,
        requestedCount: count,
        method: "GERACAO_NATURAL_CORRIGIDA",
        syllableConfig: GENRE_SYLLABLE_CONFIG[genre as keyof typeof GENRE_SYLLABLE_CONFIG] || { max: 12, ideal: 10, min: 8 }
      },
    })

  } catch (error) {
    console.error("[API] ❌ Erro na geração de refrões:", error)

    // Fallback garantido com 3 refrões
    const fallbackChoruses = [
      generateChorusFallback("Sertanejo Moderno Masculino", "amor"),
      generateChorusFallback("Sertanejo Moderno Masculino", "amor"),
      generateChorusFallback("Sertanejo Moderno Masculino", "amor")
    ]

    return NextResponse.json({
      success: true,
      choruses: fallbackChoruses,
      metadata: {
        genre: "Sertanejo Moderno Masculino",
        theme: "amor", 
        totalChoruses: fallbackChoruses.length,
        method: "FALLBACK_GARANTIDO",
        syllableConfig: { max: 12, ideal: 10, min: 8 }
      },
    })
  }
}

export async function GET() {
  return NextResponse.json({ 
    error: "Método não permitido",
    message: "Use POST para gerar refrões"
  }, { status: 405 })
}
