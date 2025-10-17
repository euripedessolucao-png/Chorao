"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { validateLyricsSyllables } from "@/lib/validation/syllable-counter" // ← IMPORT DIRETO

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

interface SyllableValidatorProps {
  lyrics: string
  maxSyllables?: number
  onValidate?: (result: ValidationResult) => void
}

export function SyllableValidator({ lyrics, maxSyllables = 12, onValidate }: SyllableValidatorProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

  useEffect(() => {
    if (lyrics.trim()) {
      const result = validateLyricsSyllables(lyrics, maxSyllables)
      
      const formattedResult: ValidationResult = {
        valid: result.valid,
        violations: result.violations.map(v => ({
          line: v.lineNumber,
          text: v.line,
          syllables: v.syllables,
          expected: maxSyllables
        })),
        totalLines: result.violations.length + (result.valid ? 1 : 0),
        linesWithIssues: result.violations.length
      }
      
      setValidationResult(formattedResult)
      onValidate?.(formattedResult)

      if (formattedResult.valid) {
        toast.success(`✓ Letra validada: ${formattedResult.totalLines} versos dentro do limite`)
      } else {
        toast.warning(`⚠️ ${formattedResult.linesWithIssues} versos com mais de ${maxSyllables} sílabas`)
      }
    } else {
      setValidationResult(null)
    }
  }, [lyrics, maxSyllables, onValidate])

  if (!lyrics.trim()) {
    return null
  }

  return (
    <div className="space-y-4">
      {validationResult && (
        <Card className={validationResult.valid ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              {validationResult.valid ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Validação Concluída
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  Problemas Encontrados
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total de versos:</span>
              <Badge variant="secondary">{validationResult.totalLines}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Versos com problemas:</span>
              <Badge
                variant="secondary"
                className={validationResult.valid ? "" : "bg-red-100 text-red-800 border-red-200"}
              >
                {validationResult.linesWithIssues}
              </Badge>
            </div>

            {!validationResult.valid && (
              <div className="space-y-2">
                <span className="text-sm font-medium">Versos problemáticos:</span>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {validationResult.violations.map((violation, index) => (
                    <Alert key={index} className="bg-white border-orange-200">
                      <AlertDescription className="text-xs">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">Linha {violation.line}:</span>
                          <Badge variant="outline" className="bg-red-100 text-red-800">
                            {violation.syllables} sílabas
                          </Badge>
                        </div>
                        <code className="text-xs bg-muted p-1 rounded block mt-1">"{violation.text}"</code>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {validationResult.valid && (
              <Alert className="bg-green-100 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 text-sm">
                  Todos os versos estão dentro do limite de {maxSyllables} sílabas poéticas!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
