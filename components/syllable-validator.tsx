"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter-brasileiro"

interface SyllableViolation {
  line: number
  text: string
  syllables: number
  expected: string
}

interface ValidationResult {
  valid: boolean
  totalLines: number
  linesWithIssues: number
  violations: SyllableViolation[]
}

interface SyllableValidatorProps {
  lyrics: string
  maxSyllables: number
  onValidate?: (result: ValidationResult) => void
}

export function SyllableValidator({ lyrics, maxSyllables, onValidate }: SyllableValidatorProps) {
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const validateSyllables = () => {
    if (!lyrics.trim()) {
      setResult(null)
      return
    }

    setIsValidating(true)

    try {
      const lines = lyrics
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith("[") && !line.startsWith("("))

      const violations: SyllableViolation[] = []

      lines.forEach((line, index) => {
        const syllableCount = countPoeticSyllables(line)

        if (syllableCount > maxSyllables) {
          violations.push({
            line: index + 1,
            text: line,
            syllables: syllableCount,
            expected: `máx ${maxSyllables}`,
          })
        }
      })

      const validationResult: ValidationResult = {
        valid: violations.length === 0,
        totalLines: lines.length,
        linesWithIssues: violations.length,
        violations,
      }

      setResult(validationResult)
      onValidate?.(validationResult)
    } catch (error) {
      console.error("Erro na validação de sílabas:", error)
    } finally {
      setIsValidating(false)
    }
  }

  useEffect(() => {
    if (lyrics.trim()) {
      const timeoutId = setTimeout(() => {
        validateSyllables()
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [lyrics, maxSyllables])

  if (!result) return null

  return (
    <Card className="mt-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          Validador de Sílabas
          <Badge variant={result.valid ? "default" : "secondary"}>
            {result.valid ? "✓ Validado" : `${result.linesWithIssues} problemas`}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="text-xs">
        {result.valid ? (
          <div className="text-green-600">
            ✓ Todos os {result.totalLines} versos estão dentro do limite de {maxSyllables} sílabas
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-red-600 font-medium">
              {result.linesWithIssues} verso(s) excedem o limite de {maxSyllables} sílabas:
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {result.violations.slice(0, 5).map((violation, index) => (
                <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-xs">
                  <div className="font-medium">
                    Linha {violation.line}: {violation.syllables} sílabas ({violation.expected})
                  </div>
                  <div className="text-muted-foreground truncate">{violation.text}</div>
                </div>
              ))}
              {result.violations.length > 5 && (
                <div className="text-muted-foreground text-center">
                  ... e mais {result.violations.length - 5} problema(s)
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
