"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertTriangle, XCircle, Lightbulb, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { validateLyricsSyllables } from "@/lib/validation/syllable-counter"
import { validateVerseIntegrity } from "@/lib/validation/verse-integrity-validator"
import { SyllableSuggestionEngine, type SyllableSuggestion } from "@/lib/validation/syllable-suggestion-engine"

interface ValidationResult {
  valid: boolean
  violations: Array<{
    line: number
    text: string
    syllables: number
    expected: number
  }>
  totalLines: number
  linesWithIssues: number
}

interface SyllableValidatorWithSuggestionsProps {
  lyrics: string
  maxSyllables?: number
  onValidate?: (result: ValidationResult) => void
  onApplySuggestion?: (lineNumber: number, newText: string) => void
}

export function SyllableValidatorWithSuggestions({
  lyrics,
  maxSyllables = 11,
  onValidate,
  onApplySuggestion,
}: SyllableValidatorWithSuggestionsProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [integrityResult, setIntegrityResult] = useState<ReturnType<typeof validateVerseIntegrity> | null>(null)
  const [suggestions, setSuggestions] = useState<Map<number, SyllableSuggestion>>(new Map())
  const [copiedSuggestion, setCopiedSuggestion] = useState<number | null>(null)

  useEffect(() => {
    if (lyrics.trim()) {
      const syllableResult = validateLyricsSyllables(lyrics, maxSyllables)
      const integrity = validateVerseIntegrity(lyrics)

      const formattedResult: ValidationResult = {
        valid: syllableResult.valid && integrity.valid,
        violations: syllableResult.violations.map((v) => ({
          line: v.lineNumber,
          text: v.line,
          syllables: v.syllables,
          expected: maxSyllables,
        })),
        totalLines: integrity.totalVerses,
        linesWithIssues: syllableResult.violations.length + integrity.brokenVerses,
      }

      setValidationResult(formattedResult)
      setIntegrityResult(integrity)
      onValidate?.(formattedResult)

      const newSuggestions = new Map<number, SyllableSuggestion>()
      syllableResult.violations.forEach((violation) => {
        const suggestion = SyllableSuggestionEngine.generateSuggestion(violation.line, maxSyllables)
        if (suggestion) {
          newSuggestions.set(violation.lineNumber, suggestion)
        }
      })
      setSuggestions(newSuggestions)
    } else {
      setValidationResult(null)
      setIntegrityResult(null)
      setSuggestions(new Map())
    }
  }, [lyrics, maxSyllables, onValidate])

  const handleCopySuggestion = (lineNumber: number, suggestion: string) => {
    navigator.clipboard.writeText(suggestion)
    setCopiedSuggestion(lineNumber)
    toast.success("Sugestão copiada!")
    setTimeout(() => setCopiedSuggestion(null), 2000)
  }

  const handleApplySuggestion = (lineNumber: number, suggestion: string) => {
    onApplySuggestion?.(lineNumber, suggestion)
    toast.success("Sugestão aplicada!")
  }

  if (!lyrics.trim()) {
    return null
  }

  return (
    <div className="space-y-4">
      {validationResult && integrityResult && (
        <Card
          className={
            integrityResult.longVerses > 0
              ? "border-red-200 bg-red-50"
              : integrityResult.brokenVerses > 0
                ? "border-orange-200 bg-orange-50"
                : "border-green-200 bg-green-50"
          }
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              {integrityResult.longVerses > 0 ? (
                <>
                  <XCircle className="h-4 w-4 text-red-600" />
                  Guardião: {integrityResult.longVerses} verso(s) precisam de ajuste
                </>
              ) : integrityResult.brokenVerses > 0 ? (
                <>
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  Versos Incompletos Detectados
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />✨ Letra Perfeita!
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {integrityResult.issues.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium">Problemas encontrados:</span>
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {integrityResult.issues.map((issue, index) => {
                    const suggestion = suggestions.get(issue.line)

                    return (
                      <Alert
                        key={index}
                        className={
                          issue.severity === "error" ? "bg-white border-red-200" : "bg-white border-orange-200"
                        }
                      >
                        <AlertDescription className="text-xs space-y-2">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium">Linha {issue.line}:</span>
                            <Badge
                              variant="outline"
                              className={
                                issue.severity === "error" ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"
                              }
                            >
                              {issue.syllables} sílabas
                            </Badge>
                          </div>

                          <code className="text-xs bg-muted p-1 rounded block">"{issue.text}"</code>

                          {suggestion && (
                            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md data-no-copy">
                              <div className="flex items-start gap-2 mb-2">
                                <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-xs font-semibold text-blue-900 mb-1">💡 Sugestão do Guardião:</p>
                                  <code className="text-xs bg-white p-1 rounded block border border-blue-200 mb-1">
                                    "{suggestion.suggestion}"
                                  </code>
                                  <div className="flex items-center gap-2 text-xs text-blue-700 mb-1">
                                    <span>
                                      {suggestion.syllables.before} → {suggestion.syllables.after} sílabas
                                    </span>
                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                  </div>
                                  <p className="text-xs text-blue-600 italic">{suggestion.explanation}</p>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs bg-transparent"
                                  onClick={() => handleCopySuggestion(issue.line, suggestion.suggestion)}
                                >
                                  {copiedSuggestion === issue.line ? (
                                    <>
                                      <Check className="h-3 w-3 mr-1" />
                                      Copiado!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3 mr-1" />
                                      Copiar
                                    </>
                                  )}
                                </Button>
                                {onApplySuggestion && (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                                    onClick={() => handleApplySuggestion(issue.line, suggestion.suggestion)}
                                  >
                                    Aplicar
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}

                          <ul className="mt-2 space-y-1">
                            {issue.issues.map((i, idx) => (
                              <li key={idx} className="text-xs text-muted-foreground">
                                • {i}
                              </li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
