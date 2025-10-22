// app/api/validation/syllable-counter.ts - VERSÃO DEFINITIVA SIMPLIFICADA

import { NextResponse } from "next/server"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter"

export async function POST(request: Request) {
  try {
    const { lyrics, maxSyllables = 11 } = await request.json()

    if (!lyrics) {
      return NextResponse.json({ error: "Lyrics are required" }, { status: 400 })
    }

    const lines = lyrics.split('\n')
    const validations = []

    for (const [index, line] of lines.entries()) {
      if (line.trim() && !line.startsWith('[') && !line.startsWith('(') && !line.includes('Instruments:')) {
        // ✅ SOLUÇÃO DEFINITIVA: Contagem direta sem dependência de funções problemáticas
        const syllables = countPoeticSyllables(line)
        const isValid = syllables <= maxSyllables
        
        if (!isValid) {
          // ✅ Gerar sugestões básicas localmente
          const suggestions = generateBasicSuggestions(line, maxSyllables)
          
          validations.push({
            line: line.trim(),
            syllables: syllables,
            lineNumber: index + 1,
            suggestions: suggestions
          })
        }
      }
    }

    return NextResponse.json({
      valid: validations.length === 0,
      violations: validations,
      summary: {
        totalLines: lines.length,
        problematicLines: validations.length,
        maxSyllables
      }
    })

  } catch (error) {
    console.error("Syllable validation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// ✅ Função local para gerar sugestões básicas
function generateBasicSuggestions(line: string, maxSyllables: number): string[] {
  const suggestions: string[] = []
  const words = line.split(/\s+/)
  
  // Sugestão 1: Contrações comuns
  const contractions: [string, string][] = [
    [' para ', ' pra '],
    [' você ', ' cê '],
    [' está ', ' tá '],
    [' estou ', ' tô '],
    [' de ', ' d' ],
    [' que ', ' q' ],
  ]
  
  for (const [from, to] of contractions) {
    if (line.includes(from)) {
      const suggestion = line.replace(new RegExp(from, 'g'), to)
      const syllables = countPoeticSyllables(suggestion)
      if (syllables <= maxSyllables) {
        suggestions.push(suggestion)
      }
    }
  }
  
  // Sugestão 2: Remover última palavra se possível
  if (words.length > 2) {
    const withoutLast = words.slice(0, -1).join(' ')
    const syllables = countPoeticSyllables(withoutLast)
    if (syllables <= maxSyllables && syllables > 0) {
      suggestions.push(withoutLast)
    }
  }
  
  return suggestions.slice(0, 3)
}

export async function GET(request: Request) {
  return NextResponse.json({ 
    message: "Syllable validation API is running",
    endpoints: {
      POST: "/api/validation/syllable-counter - Validate lyrics syllables"
    }
  })
}
