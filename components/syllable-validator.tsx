"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { validateLyricsSyllables } from "@/lib/validation/syllable-counter"
import { validateVerseIntegrity, formatValidationReport } from "@/lib/validation/verse-integrity-validator"

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
  const [integrityResult, setIntegrityResult] = useState<ReturnType<typeof validateVerseIntegrity> | null>(null)

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

      if (formattedResult.valid && integrity.brokenVerses === 0) {
        toast.success(`✓ Letra validada: ${integrity.totalVerses} versos perfeitos`)
      } else {
        if (integrity.longVerses > 0) {
          toast.error(`❌ ${integrity.longVerses} verso(s) com mais de ${maxSyllables} sílabas`, {
            description: "LIMITE ABSOLUTO VIOLADO",
            duration: 8000,
          })
        }
        if (integrity.brokenVerses > 0) {
          toast.warning(`⚠️ ${integrity.brokenVerses} verso(s) incompleto(s) ou quebrado(s)`, {
            description: "Clique para ver detalhes",
            duration: 6000,
            action: {
              label: "Ver",
              onClick: () => {
                console.log(formatValidationReport(integrity))
                alert(formatValidationReport(integrity))
              },
            },
          })
        }
      }
    } else {
      setValidationResult(null)
      setIntegrityResult(null)
    }
  }, [lyrics, maxSyllables, onValidate])

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
                  Limite de 12 Sílabas Violado
                </>
              ) : integrityResult.brokenVerses > 0 ? (
                <>
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  Versos Incompletos Detectados
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Validação Concluída
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total de versos:</span>
              <Badge variant="secondary">{integrityResult.totalVerses}</Badge>
            </div>

            {integrityResult.longVerses > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Versos com +12 sílabas:</span>
                <Badge className="bg-red-600 text-white hover:bg-red-700 border-red-700">
                  {integrityResult.longVerses}
                </Badge>
              </div>
            )}

            {integrityResult.brokenVerses > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Versos incompletos:</span>
                <Badge className="bg-orange-500 text-white hover:bg-orange-600 border-orange-600">
                  {integrityResult.brokenVerses}
                </Badge>
              </div>
            )}

            {integrityResult.issues.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium">Problemas encontrados:</span>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {integrityResult.issues.map((issue, index) => (
                    <Alert
                      key={index}
                      className={issue.severity === "error" ? "bg-white border-red-200" : "bg-white border-orange-200"}
                    >
                      <AlertDescription className="text-xs">
                        <div className="flex justify-between mb-1">
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
                        <code className="text-xs bg-muted p-1 rounded block mt-1">"{issue.text}"</code>
                        <ul className="mt-2 space-y-1">
                          {issue.issues.map((i, idx) => (
                            <li key={idx} className="text-xs text-muted-foreground">
                              • {i}
                            </li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {validationResult.valid && integrityResult.brokenVerses === 0 && (
              <Alert className="bg-green-100 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 text-sm">
                  ✅ Todos os {integrityResult.totalVerses} versos estão perfeitos: dentro do limite de {maxSyllables}{" "}
                  sílabas e completos!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
