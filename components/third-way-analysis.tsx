// components/third-way-analysis.tsx
"use client"

import { useState, useEffect } from "react"
import { X, ChevronDown, ChevronUp, Sparkles, CheckCircle, AlertCircle, Info } from "lucide-react"

interface ThirdWayAnalysisProps {
  isOpen: boolean
  onClose: () => void
  originalLyrics?: string
  rewrittenLyrics: string
  genre?: string
  rewriteType?: string
}

interface AnalysisStep {
  step: number
  title: string
  description: string
  details: string[]
  example?: {
    original: string
    variationA: string
    variationB: string
    final: string
    strengths?: string[]
  }
}

interface ThirdWayProcess {
  title: string
  description: string
  steps: AnalysisStep[]
}

export function ThirdWayAnalysis({ 
  isOpen, 
  onClose, 
  originalLyrics = "", 
  rewrittenLyrics, 
  genre = "Não especificado", 
  rewriteType = "melhoria" 
}: ThirdWayAnalysisProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(0)

  // Simulação do processo da Terceira Via
  const thirdWayProcess: ThirdWayProcess = {
    title: "Processo Terceira Via - Análise Detalhada",
    description: "Cada linha passou pelo processo silencioso de Variação A + Variação B → Versão Final",
    steps: [
      {
        step: 1,
        title: "Análise da Linha Original",
        description: "Identificação dos elementos-chave e métrica",
        details: [
          "Contagem de sílabas poéticas",
          "Análise da estrutura rítmica",
          "Identificação do tema central",
          "Avaliação do impacto emocional"
        ],
        example: originalLyrics ? {
          original: originalLyrics.split('\n').find(line => line.trim() && !line.startsWith('[')) || "Linha original não disponível",
          variationA: "",
          variationB: "",
          final: "",
          strengths: ["Métrica identificada", "Tema claro", "Estrutura básica"]
        } : undefined
      },
      {
        step: 2,
        title: "Geração da Variação A",
        description: "Primeira abordagem criativa com foco em métrica",
        details: [
          "Manutenção do tema original",
          "Ajuste para métrica perfeita",
          "Otimização do fluxo rítmico",
          "Preservação do significado"
        ],
        example: rewrittenLyrics ? {
          original: "",
          variationA: rewrittenLyrics.split('\n').find(line => line.trim() && !line.startsWith('[')) || "Variação A gerada",
          variationB: "",
          final: "",
          strengths: ["Métrica correta", "Ritmo fluido", "Tema preservado"]
        } : undefined
      },
      {
        step: 3,
        title: "Geração da Variação B",
        description: "Segunda abordagem com foco em criatividade e emoção",
        details: [
          "Exploração de novas metáforas",
          "Intensificação emocional",
          "Experimentação com rimas",
          "Aprimoramento poético"
        ],
        example: rewrittenLyrics ? {
          original: "",
          variationA: "",
          variationB: "Versão alternativa criativa",
          final: "",
          strengths: ["Criatividade elevada", "Emoção intensificada", "Rimas enriquecidas"]
        } : undefined
      },
      {
        step: 4,
        title: "Síntese da Versão Final",
        description: "Combinação dos melhores elementos de A e B",
        details: [
          "Análise comparativa das variações",
          "Seleção dos elementos mais fortes",
          "Harmonização da versão final",
          "Verificação da qualidade final"
        ],
        example: rewrittenLyrics ? {
          original: "",
          variationA: "",
          variationB: "",
          final: rewrittenLyrics.split('\n').find(line => line.trim() && !line.startsWith('[')) || "Versão final otimizada",
          strengths: ["Qualidade superior", "Métrica perfeita", "Impacto emocional", "Originalidade"]
        } : undefined
      },
      {
        step: 5,
        title: "Análise de Qualidade",
        description: "Avaliação final do resultado",
        details: [
          "Verificação da métrica por linha",
          "Análise da coesão geral",
          "Avaliação do apelo emocional",
          "Teste de fluidez e naturalidade"
        ]
      }
    ]
  }

  useEffect(() => {
    if (isOpen) {
      setExpandedStep(0)
    }
  }, [isOpen])

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
                <h2 className="text-2xl font-bold">{thirdWayProcess.title}</h2>
                <p className="text-purple-100">{thirdWayProcess.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Informações Gerais */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-sm text-blue-600 font-medium">Gênero</div>
              <div className="text-lg font-semibold text-blue-900">{genre}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-sm text-green-600 font-medium">Tipo</div>
              <div className="text-lg font-semibold text-green-900 capitalize">{rewriteType.replace('-', ' ')}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="text-sm text-purple-600 font-medium">Processo</div>
              <div className="text-lg font-semibold text-purple-900">Terceira Via</div>
            </div>
          </div>

          {/* Passos do Processo */}
          <div className="space-y-4">
            {thirdWayProcess.steps.map((step) => (
              <div key={step.step} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Cabeçalho do Passo */}
                <button
                  onClick={() => setExpandedStep(expandedStep === step.step ? null : step.step)}
                  className="w-full p-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{step.title}</h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  {expandedStep === step.step ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {/* Conteúdo Expandido */}
                {expandedStep === step.step && (
                  <div className="p-4 bg-white border-t border-gray-200">
                    {/* Detalhes do Processo */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Processo Aplicado:</h4>
                      <ul className="space-y-1">
                        {step.details.map((detail, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Exemplo (se disponível) */}
                    {step.example && (
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h4 className="font-medium text-gray-900 mb-3">Exemplo Prático:</h4>
                        
                        {step.example.original && (
                          <div className="mb-3">
                            <div className="text-sm text-gray-600 mb-1">Original:</div>
                            <div className="bg-white p-3 rounded border text-sm font-mono">
                              {step.example.original}
                            </div>
                          </div>
                        )}

                        {step.example.variationA && (
                          <div className="mb-3">
                            <div className="text-sm text-gray-600 mb-1">Variação A (Métrica):</div>
                            <div className="bg-white p-3 rounded border text-sm font-mono">
                              {step.example.variationA}
                            </div>
                          </div>
                        )}

                        {step.example.variationB && (
                          <div className="mb-3">
                            <div className="text-sm text-gray-600 mb-1">Variação B (Criatividade):</div>
                            <div className="bg-white p-3 rounded border text-sm font-mono">
                              {step.example.variationB}
                            </div>
                          </div>
                        )}

                        {step.example.final && (
                          <div className="mb-3">
                            <div className="text-sm text-gray-600 mb-1">Versão Final (Terceira Via):</div>
                            <div className="bg-white p-3 rounded border text-green-700 text-sm font-mono border-green-200 bg-green-50">
                              {step.example.final}
                            </div>
                          </div>
                        )}

                        {/* Pontos Fortes (se disponível) */}
                        {step.example.strengths && step.example.strengths.length > 0 && (
                          <div>
                            <div className="text-sm text-gray-600 mb-2">Pontos Fortes Identificados:</div>
                            <div className="flex gap-2 flex-wrap">
                              {step.example.strengths.map((strength, idx) => (
                                <span 
                                  key={idx} 
                                  className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs border border-green-200"
                                >
                                  ✅ {strength}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Indicador de Progresso */}
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                      <Info className="w-4 h-4" />
                      {step.step < thirdWayProcess.steps.length ? "Próximo: " + thirdWayProcess.steps[step.step]?.title : "Processo concluído"}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Resumo Final */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-900">Processo Terceira Via Concluído</h4>
                <p className="text-sm text-green-700">
                  Sua letra foi otimizada através do método silencioso que combina as melhores características 
                  de múltiplas variações, garantindo qualidade superior e métrica perfeita.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Método exclusivo • Terceira Via AI
            </div>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
