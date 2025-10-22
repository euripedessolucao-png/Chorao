// app/api/validation/syllable-counter.ts - VERSÃO DEFINITIVA

import { NextResponse } from "next/server"
import { countPoeticSyllables, getIntelligentSuggestions } from "@/lib/validation/syllable-counter"

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
        // ✅ SOLUÇÃO DEFINITIVA: Contagem direta sem dependência de validateSyllableLimit
        const syllables = countPoeticSyllables(line)
        const isValid = syllables <= maxSyllables
        
        if (!isValid) {
          const suggestions = getIntelligentSuggestions(line, maxSyllables)
          
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

export async function GET(request: Request) {
  return NextResponse.json({ 
    message: "Syllable validation API is running",
    endpoints: {
      POST: "/api/validation/syllable-counter - Validate lyrics syllables"
    }
  })
}
