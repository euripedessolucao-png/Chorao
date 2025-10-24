// components/third-way-analysis.tsx (ATUALIZADO)

import { useState, useEffect } from "react"
import { X, ChevronDown, ChevronUp, Sparkles, CheckCircle, AlertCircle, Info } from "lucide-react"
import { analisarTerceiraVia } from "@/lib/terceira-via/analysis" // ✅ Dados reais

interface ThirdWayAnalysisProps {
  isOpen: boolean
  onClose: () => void
  originalLyrics?: string
  rewrittenLyrics: string
  genre?: string
  rewriteType?: string
}

export function ThirdWayAnalysis({ 
  isOpen, 
  onClose, 
  originalLyrics = "", 
  rewrittenLyrics, 
  genre = "Sertanejo Moderno", 
  rewriteType = "melhoria" 
}: ThirdWayAnalysisProps) {
  const [analysis, setAnalysis] = useState<any>(null)
  const [expandedStep, setExpandedStep] = useState<number | null>(0)

  useEffect(() => {
    if (isOpen && rewrittenLyrics && genre) {
      // ✅ Usa a análise REAL do seu sistema
      const result = analisarTerceiraVia(rewrittenLyrics, genre, "Tema não especificado")
      setAnalysis(result)
    }
  }, [isOpen, rewrittenLyrics, genre])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Análise Terceira Via - Resultado Real</h2>
                <p className="text-purple-100">Baseado na sua letra reescrita e regras do gênero {genre}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:text-purple-200">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {analysis ? (
            <>
              {/* Score Geral */}
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-700">{analysis.score_geral}/100</div>
                  <div className="text-green-600">Score de Qualidade Terceira Via</div>
                </div>
              </div>

              {/* Pontos Fortes */}
              {analysis.pontos_fortes.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Pontos Fortes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {analysis.pontos_fortes.map((point: string, idx: number) => (
                      <div key={idx} className="bg-green-50 text-green-800 p-3 rounded border border-green-200 text-sm">
                        ✅ {point}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pontos Fracos / Sugestões */}
              {(analysis.pontos_fracos.length > 0 || analysis.sugestoes.length > 0) && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    Oportunidades de Melhoria
                  </h3>
                  <div className="space-y-2">
                    {analysis.pontos_fracos.map((point: string, idx: number) => (
                      <div key={idx} className="bg-yellow-50 text-yellow-800 p-3 rounded border border-yellow-200 text-sm">
                        ⚠️ {point}
                      </div>
                    ))}
                    {analysis.sugestoes.map((sug: string, idx: number) => (
                      <div key={idx} className="bg-blue-50 text-blue-800 p-3 rounded border border-blue-200 text-sm">
                        💡 {sug}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Métrica por Gênero */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-900 mb-2">Métrica Verificada</h3>
                <p className="text-sm text-gray-600">
                  Sua letra foi validada contra as regras de <strong>{genre}</strong>:
                  {analysis.metric_analysis.syllable_compliance >= 90 ? (
                    <span className="text-green-600"> ✅ {analysis.metric_analysis.syllable_compliance}% das linhas dentro do limite</span>
                  ) : (
                    <span className="text-yellow-600"> ⚠️ {analysis.metric_analysis.syllable_compliance}% dentro do limite</span>
                  )}
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Info className="w-8 h-8 mx-auto mb-2" />
              Analisando sua letra...
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Análise baseada em {genre} • Terceira Via AI
            </div>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
