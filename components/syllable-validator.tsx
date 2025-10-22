// components/syllable-validator-editable.tsx - VERSÃO COMPLETAMENTE NOVA

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, AlertTriangle, XCircle, Edit2, Check, X } from "lucide-react"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter"
import { toast } from "sonner"

interface LineValidation {
  line: string
  syllables: number
  lineNumber: number
  isValid: boolean
  suggestions: string[]
}

interface SyllableValidatorEditableProps {
  lyrics: string
  maxSyllables?: number
  onLyricsChange: (newLyrics: string) => void
}

export function SyllableValidatorEditable({ 
  lyrics, 
  maxSyllables = 11,
  onLyricsChange 
}: SyllableValidatorEditableProps) {
  const [editingLines, setEditingLines] = useState<Set<number>>(new Set())

  // Analisa todas as linhas da letra
  const lines = lyrics.split('\n')
  const validations: LineValidation[] = []

  lines.forEach((line, index) => {
    if (line.trim() && !line.startsWith('[') && !line.startsWith('(') && !line.includes('Instruments:')) {
      const syllables = countPoeticSyllables(line)
      const isValid = syllables <= maxSyllables
      
      if (!isValid) {
        // Gerar sugestões simples baseadas na contagem de sílabas
        const suggestions = generateSuggestions(line, maxSyllables)
        
        validations.push({
          line: line.trim(),
          syllables: syllables,
          lineNumber: index + 1,
          isValid: isValid,
          suggestions: suggestions
        })
      }
    }
  })

  // Função para gerar sugestões básicas
  const generateSuggestions = (line: string, maxSyllables: number): string[] => {
    const suggestions: string[] = []
    const words = line.split(' ')
    
    // Sugestão 1: Remover última palavra se tiver mais de maxSyllables + 2
    if (words.length > 1) {
      const withoutLastWord = words.slice(0, -1).join(' ')
      const syllablesWithoutLast = countPoeticSyllables(withoutLastWord)
      if (syllablesWithoutLast <= maxSyllables && syllablesWithoutLast > 0) {
        suggestions.push(withoutLastWord)
      }
    }
    
    // Sugestão 2: Contrações comuns
    const contractions: [string, string][] = [
      [' para ', ' pra '],
      [' você ', ' cê '],
      [' está ', ' tá '],
      [' estou ', ' tô '],
      [' com ', ' c/ '],
      [' de ', ' d' ],
      [' que ', ' q' ],
      [' não ', ' num '],
      [' uma ', ' ' ],
      [' um ', ' ' ],
    ]
    
    contractions.forEach(([from, to]) => {
      if (line.includes(from)) {
        const newLine = line.replace(new RegExp(from, 'g'), to)
        const syllables = countPoeticSyllables(newLine)
        if (syllables <= maxSyllables && syllables > 0) {
          suggestions.push(newLine.trim())
        }
      }
    })
    
    return suggestions.slice(0, 3) // Limitar a 3 sugestões
  }

  const toggleEdit = (lineNumber: number) => {
    const newEditingLines = new Set(editingLines)
    if (newEditingLines.has(lineNumber)) {
      newEditingLines.delete(lineNumber)
    } else {
      newEditingLines.add(lineNumber)
    }
    setEditingLines(newEditingLines)
  }

  const saveEdit = (lineNumber: number, newText: string) => {
    const newLines = [...lines]
    newLines[lineNumber - 1] = newText
    const newLyrics = newLines.join('\n')
    onLyricsChange(newLyrics)
    toggleEdit(lineNumber)
    toast.success("Linha atualizada com sucesso!")
  }

  const applySuggestion = (lineNumber: number, suggestion: string) => {
    const newLines = [...lines]
    newLines[lineNumber - 1] = suggestion
    const newLyrics = newLines.join('\n')
    onLyricsChange(newLyrics)
    toast.success("Sugestão aplicada com sucesso!")
  }

  const cancelEdit = (lineNumber: number) => {
    toggleEdit(lineNumber)
  }

  if (validations.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center text-green-700">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">
              ✅ Todos os versos respeitam o limite de {maxSyllables} sílabas!
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center text-amber-800">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Validação de Sílabas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-amber-700">
            ⚠️ {validations.length} verso(s) com mais de {maxSyllables} sílabas
          </span>
          <Badge variant="outline" className="bg-amber-100 text-amber-800">
            {validations.length} problema(s)
          </Badge>
        </div>

        <div className="space-y-3">
          {validations.map((validation, index) => (
            <div key={index} className="p-3 bg-white border border-amber-100 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-amber-700">
                      Linha {validation.lineNumber}
                    </span>
                    <Badge variant="outline" className="bg-red-100 text-red-700">
                      {validation.syllables} sílabas
                    </Badge>
                  </div>
                  
                  {editingLines.has(validation.lineNumber) ? (
                    <div className="space-y-2">
                      <Input
                        defaultValue={validation.line}
                        className="text-sm font-mono"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            saveEdit(validation.lineNumber, e.currentTarget.value)
                          } else if (e.key === 'Escape') {
                            cancelEdit(validation.lineNumber)
                          }
                        }}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => {
                            const input = document.querySelector<HTMLInputElement>(
                              `input[defaultValue="${validation.line}"]`
                            )
                            if (input) {
                              saveEdit(validation.lineNumber, input.value)
                            }
                          }}
                          className="h-7"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Salvar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => cancelEdit(validation.lineNumber)}
                          className="h-7"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <p className="text-sm text-gray-700 font-mono flex-1">
                        "{validation.line}"
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleEdit(validation.lineNumber)}
                        className="h-7 ml-2"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* SUGESTÕES */}
              {validation.suggestions.length > 0 && !editingLines.has(validation.lineNumber) && (
                <div className="mt-3 pt-3 border-t border-amber-100">
                  <span className="text-xs font-medium text-gray-600 mb-2 block">
                    Sugestões automáticas:
                  </span>
                  <div className="space-y-2">
                    {validation.suggestions.map((suggestion, suggestionIndex) => {
                      const suggestionSyllables = countPoeticSyllables(suggestion)
                      return (
                        <div
                          key={suggestionIndex}
                          className="flex items-center justify-between p-2 bg-blue-50 border border-blue-100 rounded text-sm"
                        >
                          <div className="flex-1">
                            <p className="font-mono text-blue-800 text-xs">
                              {suggestion}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              {suggestionSyllables} sílabas
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => applySuggestion(validation.lineNumber, suggestion)}
                            className="h-6 px-2 text-blue-600 hover:text-blue-800"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* SEM SUGESTÕES */}
              {validation.suggestions.length === 0 && !editingLines.has(validation.lineNumber) && (
                <div className="mt-3 pt-3 border-t border-amber-100">
                  <div className="flex items-center text-amber-600">
                    <XCircle className="h-3 w-3 mr-1" />
                    <span className="text-xs">
                      Edite manualmente para corrigir
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-3 bg-amber-100 border border-amber-200 rounded">
          <p className="text-xs text-amber-800">
            💡 <strong>Dica:</strong> Use contrações como "pra", "cê", "tá" e elisões como "d'amor", "qu'eu" para reduzir sílabas sem quebrar palavras.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default SyllableValidatorEditable
