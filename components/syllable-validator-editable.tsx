// components/syllable-validator-editable.tsx - VERSÃO CORRIGIDA

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, AlertTriangle, XCircle, Edit2, Check, X, Lightbulb } from "lucide-react"
import { countPortugueseSyllables } from "@/lib/validation/syllable-counter"
import { toast } from "sonner"

interface LineValidation {
  line: string
  syllables: number
  lineNumber: number
  suggestions: string[]
  severity: "warning" | "error"
}

interface SyllableValidatorEditableProps {
  lyrics: string
  maxSyllables?: number
  onLyricsChange: (newLyrics: string) => void
}

export function SyllableValidatorEditable({
  lyrics,
  maxSyllables = 11,
  onLyricsChange,
}: SyllableValidatorEditableProps) {
  const [editingLines, setEditingLines] = useState<Set<number>>(new Set())
  const [showTips, setShowTips] = useState(false)

  // ✅ FUNÇÃO MELHORADA: Gera sugestões inteligentes
  const generateSmartSuggestions = (line: string, currentSyllables: number, maxSyllables: number): string[] => {
    const suggestions: string[] = []
    const words = line.split(" ")
    const difference = currentSyllables - maxSyllables

    // Estratégia 1: Remoção inteligente de palavras
    if (words.length > 1 && difference <= 3) {
      // Tenta remover a última palavra
      const withoutLastWord = words.slice(0, -1).join(" ")
      const syllablesWithoutLast = countPortugueseSyllables(withoutLastWord)
      if (syllablesWithoutLast <= maxSyllables && syllablesWithoutLast >= maxSyllables - 2) {
        suggestions.push(withoutLastWord + " ✓")
      }

      // Tenta remover palavras intermediárias não essenciais
      const nonEssentialWords = ["o", "a", "um", "uma", "de", "do", "da", "em", "no", "na"]
      for (let i = words.length - 2; i > 0; i--) {
        if (nonEssentialWords.includes(words[i].toLowerCase())) {
          const filteredWords = words.filter((_, index) => index !== i)
          const newLine = filteredWords.join(" ")
          const newSyllables = countPortugueseSyllables(newLine)
          if (newSyllables <= maxSyllables && newSyllables >= maxSyllables - 1) {
            suggestions.push(newLine + " ✂️")
            break
          }
        }
      }
    }

    // Estratégia 2: Contrações avançadas
    const advancedContractions: [RegExp, string, string][] = [
      [/\bde amor\b/gi, "d'amor", "🎭"],
      [/\bque eu\b/gi, "qu'eu", "🎭"],
      [/\bpara o\b/gi, "pro", "🔧"],
      [/\bpara a\b/gi, "pra", "🔧"],
      [/\bpara\b/gi, "pra", "🔧"],
      [/\bvocê\b/gi, "cê", "🔧"],
      [/\bcomigo\b/gi, "c'migo", "🎭"],
      [/\bcontigo\b/gi, "c'tigo", "🎭"],
      [/\bestá\b/gi, "tá", "🔧"],
      [/\bestou\b/gi, "tô", "🔧"],
      [/\bvamos\b/gi, "vamo", "🔧"],
      [/\btambém\b/gi, "também", "✂️"],
    ]

    advancedContractions.forEach(([regex, replacement, icon]) => {
      if (regex.test(line)) {
        const newLine = line.replace(regex, replacement)
        const newSyllables = countPortugueseSyllables(newLine)
        if (newSyllables <= maxSyllables && newSyllables > 0) {
          suggestions.push(`${newLine} ${icon}`)
        }
      }
    })

    // Estratégia 3: Reestruturação criativa
    if (difference >= 3 && words.length >= 4) {
      const shortenedVersions = [
        line.replace(/\bmuito\b/gi, "mto"),
        line.replace(/\bgostaria\b/gi, "queria"),
        line.replace(/\bpoderíamos\b/gi, "dava"),
        line.replace(/\bacredito\b/gi, "acho"),
        line.replace(/\brealmente\b/gi, "mesmo"),
      ]

      shortenedVersions.forEach(version => {
        if (version !== line) {
          const newSyllables = countPortugueseSyllables(version)
          if (newSyllables <= maxSyllables) {
            suggestions.push(version + " 💡")
          }
        }
      })
    }

    return [...new Set(suggestions)].slice(0, 4)
  }

  // ✅ ANÁLISE INTELIGENTE DAS LINHAS
  const lines = lyrics.split("\n")
  const validations: LineValidation[] = []
  let totalLines = 0
  let validLines = 0

  lines.forEach((line, index) => {
    if (line.trim() && !line.startsWith("[") && !line.startsWith("(") && !line.includes("Instruments:")) {
      totalLines++
      const syllables = countPortugueseSyllables(line)
      
      if (syllables <= maxSyllables) {
        validLines++
      } else {
        const severity = syllables > maxSyllables + 3 ? "error" : "warning"
        const suggestions = generateSmartSuggestions(line, syllables, maxSyllables)
        
        validations.push({
          line: line.trim(),
          syllables: syllables,
          lineNumber: index + 1,
          suggestions: suggestions,
          severity: severity
        })
      }
    }
  })

  const validationScore = totalLines > 0 ? (validLines / totalLines) * 100 : 100

  // ✅ FUNÇÕES DE EDIÇÃO
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
    const newLyrics = newLines.join("\n")
    onLyricsChange(newLyrics)
    toggleEdit(lineNumber)
    toast.success("Linha atualizada com sucesso!")
  }

  const applySuggestion = (lineNumber: number, suggestion: string) => {
    const cleanSuggestion = suggestion.replace(/ [✓✂️🎭🔧💡]$/, "").trim()
    const newLines = [...lines]
    newLines[lineNumber - 1] = cleanSuggestion
    const newLyrics = newLines.join("\n")
    onLyricsChange(newLyrics)
    toast.success("Sugestão aplicada com sucesso!")
  }

  const cancelEdit = (lineNumber: number) => {
    toggleEdit(lineNumber)
  }

  // ✅ COMPORTAMENTO INTELIGENTE
  if (validations.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">
                ✅ {validationScore.toFixed(0)}% válido - Todos os versos respeitam {maxSyllables} sílabas!
              </span>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              {validLines}/{totalLines}
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center text-amber-800">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Validação de Sílabas Inteligente
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTips(!showTips)}
            className="h-6 text-amber-700"
          >
            <Lightbulb className="h-3 w-3 mr-1" />
            Dicas
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* STATUS GERAL */}
        <div className="flex items-center justify-between p-3 bg-amber-100 rounded-lg">
          <div className="space-y-1">
            <span className="text-sm font-medium text-amber-800">
              ⚠️ {validations.length} verso(s) precisam de ajuste
            </span>
            <div className="text-xs text-amber-600">
              Pontuação: {validationScore.toFixed(1)}% • {validLines}/{totalLines} versos válidos
            </div>
          </div>
          <Badge variant="outline" className={`${
            validationScore >= 80 ? "bg-green-100 text-green-800" : 
            validationScore >= 60 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
          }`}>
            {validationScore.toFixed(0)}%
          </Badge>
        </div>

        {/* DICAS EXPANDÍVEIS */}
        {showTips && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center">
                <span className="mr-2">🎭</span>
                <span>Elisão poética (d'amor, qu'eu)</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">🔧</span>
                <span>Contrações (pra, cê, tá)</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">✂️</span>
                <span>Remoção de palavras não essenciais</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">💡</span>
                <span>Reestruturação criativa</span>
              </div>
            </div>
          </div>
        )}

        {/* LISTA DE PROBLEMAS */}
        <div className="space-y-3">
          {validations.map((validation, index) => (
            <div 
              key={index} 
              className={`p-3 border rounded-lg ${
                validation.severity === "error" 
                  ? "bg-red-50 border-red-200" 
                  : "bg-amber-50 border-amber-200"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-amber-700">
                      Linha {validation.lineNumber}
                    </span>
                    <Badge variant="outline" className={
                      validation.severity === "error" 
                        ? "bg-red-100 text-red-700" 
                        : "bg-amber-100 text-amber-700"
                    }>
                      {validation.syllables} sílabas
                    </Badge>
                    {/* ✅ CORREÇÃO: Removido o Badge com variant="destructive" */}
                    {validation.severity === "error" && (
                      <Badge variant="outline" className="bg-red-100 text-red-700 text-xs">
                        Crítico
                      </Badge>
                    )}
                  </div>

                  {/* MODO EDIÇÃO */}
                  {editingLines.has(validation.lineNumber) ? (
                    <div className="space-y-2">
                      <Input
                        defaultValue={validation.line}
                        className="text-sm font-mono"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            saveEdit(validation.lineNumber, e.currentTarget.value)
                          } else if (e.key === "Escape") {
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
                              `input[defaultValue="${validation.line}"]`,
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
                      <p className="text-sm text-gray-700 font-mono flex-1">"{validation.line}"</p>
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

              {/* SUGESTÕES INTELIGENTES */}
              {validation.suggestions.length > 0 && !editingLines.has(validation.lineNumber) && (
                <div className="mt-3 pt-3 border-t border-amber-200">
                  <span className="text-xs font-medium text-gray-600 mb-2 block">
                    Sugestões inteligentes:
                  </span>
                  <div className="space-y-2">
                    {validation.suggestions.map((suggestion, suggestionIndex) => {
                      const cleanSuggestion = suggestion.replace(/ [✓✂️🎭🔧💡]$/, "").trim()
                      const suggestionSyllables = countPortugueseSyllables(cleanSuggestion)
                      return (
                        <div
                          key={suggestionIndex}
                          className="flex items-center justify-between p-2 bg-blue-50 border border-blue-100 rounded text-sm"
                        >
                          <div className="flex-1">
                            <p className="font-mono text-blue-800 text-xs">{suggestion}</p>
                            <p className="text-xs text-blue-600 mt-1">
                              {suggestionSyllables} sílabas • {maxSyllables - suggestionSyllables > 0 ? 
                                `+${maxSyllables - suggestionSyllables} disponíveis` : 
                                "perfeito!"}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => applySuggestion(validation.lineNumber, cleanSuggestion)}
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
                <div className="mt-3 pt-3 border-t border-amber-200">
                  <div className="flex items-center text-amber-600">
                    <XCircle className="h-3 w-3 mr-1" />
                    <span className="text-xs">Edite manualmente para corrigir</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* DICA FINAL */}
        <div className="p-3 bg-amber-100 border border-amber-200 rounded">
          <p className="text-xs text-amber-800">
            💡 <strong>Dica profissional:</strong> Versos com 9-11 sílabas soam mais naturais. 
            Use as sugestões automáticas ou edite manualmente para perfeição métrica.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default SyllableValidatorEditable
