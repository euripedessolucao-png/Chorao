// components/syllable-validator-editable.tsx - VERSÃO CORRIGIDA

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, AlertTriangle, XCircle, Edit2, Check, X } from "lucide-react"
import { countPoeticSyllables, validateSyllableLimit } from "@/lib/validation/syllable-counter"
import { toast } from "sonner"

interface LineValidation {
  line: string
  syllables: number
  lineNumber: number
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
      
      // ✅ CORREÇÃO: Validar se excede o limite
      if (syllables > maxSyllables) {
        // Obter sugestões se disponível
        let suggestions: string[] = []
        
        // Tentar obter sugestões da função validateSyllableLimit se retornar um objeto
        try {
          const validationResult = validateSyllableLimit(line, maxSyllables)
          if (typeof validationResult === 'object' && validationResult.suggestions) {
            suggestions = validationResult.suggestions
          }
        } catch (error) {
          // Se falhar, usar array vazio
          suggestions = []
        }
        
        validations.push({
          line: line.trim(),
          syllables: syllables,
          lineNumber: index + 1,
          suggestions: suggestions
        })
      }
    }
  })

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

  // ✅ FUNÇÃO PARA GERAR SUGESTÕES SIMPLES
  const generateSimpleSuggestions = (line: string, currentSyllables: number): string[] => {
    const suggestions: string[] = []
    const words = line.split(' ')
    
    // Sugestão 1: Remover artigos
    if (words.length > 3) {
      const withoutArticles = words.filter(word => 
        !['o', 'a', 'os', 'as', 'um', 'uma'].includes(word.toLowerCase())
      ).join(' ')
      if (withoutArticles !== line) {
        suggestions.push(withoutArticles)
      }
    }
    
    // Sugestão 2: Contrações básicas
    const withContractions = line
      .replace(/\bpara\b/gi, 'pra')
      .replace(/\bvocê\b/gi, 'cê')
      .replace(/\bestá\b/gi, 'tá')
      .replace(/\bde amor\b/gi, "d'amor")
      .replace(/\bque eu\b/gi, "qu'eu")
    
    if (withContractions !== line) {
      suggestions.push(withContractions)
    }
    
    return suggestions.slice(0, 2) // Limitar a 2 sugestões
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
          {validations.map((validation, index) => {
            // Gerar sugestões se não tiver
            const finalSuggestions = validation.suggestions.length > 0 
              ? validation.suggestions 
              : generateSimpleSuggestions(validation.line, validation.syllables)
            
            return (
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
                              saveEdit(validation.lineNumber, input?.value || validation.line)
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

                {/* SUGESTÕES SEGURAS */}
                {finalSuggestions.length > 0 && !editingLines.has(validation.lineNumber) && (
                  <div className="mt-3 pt-3 border-t border-amber-100">
                    <span className="text-xs font-medium text-gray-600 mb-2 block">
                      Sugestões automáticas:
                    </span>
                    <div className="space-y-2">
                      {finalSuggestions.map((suggestion, suggestionIndex) => {
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
                {finalSuggestions.length === 0 && !editingLines.has(validation.lineNumber) && (
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
            )
          })}
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
