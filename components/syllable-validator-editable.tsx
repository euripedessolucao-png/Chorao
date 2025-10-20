"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, AlertTriangle, XCircle, Edit2, Check, X, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { validateLyricsSyllables, countPoeticSyllables } from "@/lib/validation/syllable-counter"
import { validateVerseIntegrity } from "@/lib/validation/verse-integrity-validator"

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

interface EditableValidatorProps {
  lyrics: string
  maxSyllables?: number
  onValidate?: (result: ValidationResult) => void
  onLyricsChange?: (newLyrics: string) => void
  showEditControls?: boolean
}

export function EditableSyllableValidator({
  lyrics,
  maxSyllables = 11,
  onValidate,
  onLyricsChange,
  showEditControls = true,
}: EditableValidatorProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [integrityResult, setIntegrityResult] = useState<ReturnType<typeof validateVerseIntegrity> | null>(null)
  const [editingLine, setEditingLine] = useState<number | null>(null)
  const [editedText, setEditedText] = useState("")
  const [localLyrics, setLocalLyrics] = useState(lyrics)

  useEffect(() => {
    setLocalLyrics(lyrics)
  }, [lyrics])

  useEffect(() => {
    if (localLyrics.trim()) {
      const syllableResult = validateLyricsSyllables(localLyrics, maxSyllables)
      const integrity = validateVerseIntegrity(localLyrics)

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
    } else {
      setValidationResult(null)
      setIntegrityResult(null)
    }
  }, [localLyrics, maxSyllables, onValidate])

  const handleStartEdit = (lineNumber: number, currentText: string) => {
    setEditingLine(lineNumber)
    setEditedText(currentText)
  }

  const handleSaveEdit = () => {
    if (editingLine === null) return

    const lines = localLyrics.split("\n")
    const actualLineIndex = editingLine - 1

    if (actualLineIndex >= 0 && actualLineIndex < lines.length) {
      lines[actualLineIndex] = editedText
      const newLyrics = lines.join("\n")
      setLocalLyrics(newLyrics)
      onLyricsChange?.(newLyrics)
      toast.success("Verso editado com sucesso!")
    }

    setEditingLine(null)
    setEditedText("")
  }

  const handleCancelEdit = () => {
    setEditingLine(null)
    setEditedText("")
  }

  const handleReprocess = () => {
    toast.info("Reprocessando validação...")
    setValidationResult(null)
    setIntegrityResult(null)
    setTimeout(() => {
      const syllableResult = validateLyricsSyllables(localLyrics, maxSyllables)
      const integrity = validateVerseIntegrity(localLyrics)

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
      toast.success("Validação reprocessada!")
    }, 500)
  }

  if (!localLyrics.trim()) {
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                {integrityResult.longVerses > 0 ? (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    Limite de {maxSyllables} Sílabas Violado
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
              {showEditControls && (
                <Button size="sm" variant="outline" onClick={handleReprocess}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reprocessar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total de versos:</span>
              <Badge variant="secondary">{integrityResult.totalVerses}</Badge>
            </div>

            {integrityResult.longVerses > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Versos com +{maxSyllables} sílabas:</span>
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
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {integrityResult.issues.map((issue, index) => (
                    <Alert
                      key={index}
                      className={issue.severity === "error" ? "bg-white border-red-200" : "bg-white border-orange-200"}
                    >
                      <AlertDescription className="text-xs space-y-2">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium">Linha {issue.line}:</span>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                issue.severity === "error" ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"
                              }
                            >
                              {issue.syllables} sílabas
                            </Badge>
                            {showEditControls && editingLine !== issue.line && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2"
                                onClick={() => handleStartEdit(issue.line, issue.text)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {editingLine === issue.line ? (
                          <div className="space-y-2">
                            <Input
                              value={editedText}
                              onChange={(e) => setEditedText(e.target.value)}
                              className="text-xs font-mono"
                              placeholder="Edite o verso..."
                            />
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Sílabas: {countPoeticSyllables(editedText)}</span>
                              {countPoeticSyllables(editedText) <= maxSyllables ? (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              ) : (
                                <XCircle className="h-3 w-3 text-red-600" />
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="default" className="h-7" onClick={handleSaveEdit}>
                                <Check className="h-3 w-3 mr-1" />
                                Salvar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 bg-transparent"
                                onClick={handleCancelEdit}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <code className="text-xs bg-muted p-1 rounded block">"{issue.text}"</code>
                            <ul className="mt-2 space-y-1">
                              {issue.issues.map((i, idx) => (
                                <li key={idx} className="text-xs text-muted-foreground">
                                  • {i}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
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
