"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { generateRhymeReport } from "@/lib/validation/rhyme-enhancer"

interface RhymeReport {
  overallScore: number
  rhymeDistribution: {
    rica: number
    perfeita: number
    pobre: number
    toante: number
    [key: string]: number
  }
  validation: {
    valid: boolean
    errors: string[]
    warnings: string[]
  }
  suggestions: string[]
  scheme: string[]
}

interface RhymeAnalyzerProps {
  lyrics: string
  genre: string
  onAnalysis?: (report: RhymeReport) => void
}

export function RhymeAnalyzer({ lyrics, genre, onAnalysis }: RhymeAnalyzerProps) {
  const [report, setReport] = useState<RhymeReport | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeRhymes = async () => {
    if (!lyrics.trim()) return
    
    setIsAnalyzing(true)
    try {
      const analysis = generateRhymeReport(lyrics, genre) as RhymeReport
      setReport(analysis)
      onAnalysis?.(analysis)
    } catch (error) {
      console.error('Erro na análise de rimas:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "rica": return "bg-green-100 text-green-800"
      case "perfeita": return "bg-blue-100 text-blue-800"
      case "pobre": return "bg-yellow-100 text-yellow-800"
      case "toante": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          Analisador de Rimas
          <Button 
            size="sm" 
            onClick={analyzeRhymes}
            disabled={isAnalyzing || !lyrics.trim()}
          >
            {isAnalyzing ? "Analisando..." : "Analisar Rimas"}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {report && (
          <div className="space-y-4 text-sm">
            {/* Score Geral */}
            <div className="flex items-center justify-between">
              <span>Score Geral:</span>
              <Badge className={getScoreColor(report.overallScore)}>
                {report.overallScore.toFixed(0)}/100
              </Badge>
            </div>

            {/* Distribuição */}
            <div>
              <span className="font-medium">Distribuição:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(report.rhymeDistribution).map(([type, count]) => (
                  <Badge key={type} variant="secondary" className={getTypeColor(type)}>
                    {type}: {count as number}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Validação */}
            {!report.validation.valid && (
              <div className="text-red-600 text-xs">
                <strong>Problemas:</strong> {report.validation.errors.join(', ')}
              </div>
            )}

            {report.validation.warnings.length > 0 && (
              <div className="text-yellow-600 text-xs">
                <strong>Avisos:</strong> {report.validation.warnings.join(', ')}
              </div>
            )}

            {/* Sugestões */}
            {report.suggestions.length > 0 && (
              <div className="text-blue-600 text-xs">
                <strong>Sugestões:</strong> {report.suggestions.join(' ')}
              </div>
            )}

            {/* Esquema */}
            <div className="text-xs">
              <strong>Esquema:</strong> {report.scheme.join('-')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
