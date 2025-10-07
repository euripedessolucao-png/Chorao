// components/third-way-analysis.tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

interface ThirdWayAnalysisProps {
  isOpen: boolean
  onClose: () => void
  originalLyrics: string
  rewrittenLyrics: string
  genre: string
  rewriteType: string
}

export function ThirdWayAnalysis({ 
  isOpen, 
  onClose, 
  originalLyrics, 
  rewrittenLyrics, 
  genre, 
  rewriteType 
}: ThirdWayAnalysisProps) {
  const [activeStep, setActiveStep] = useState<number>(0)

  // Dados de exemplo do processo Terceira Via
  const thirdWayProcess = {
    steps: [
      {
        title: "Análise da Linha Original",
        description: "O sistema identifica o tema principal e a estrutura métrica",
        example: {
          original: "O calor do verão aquece nosso amor especial",
          analysis: "7 sílabas - precisa de ajuste para 6 sílabas"
        }
      },
      {
        title: "Geração da Variação A",
        description: "Primeira versão focada em clareza emocional",
        example: {
          variationA: "O verão aquece o amor",
          strengths: ["Clareza emocional", "Simplicidade"],
          weaknesses: ["Poucas imagens"]
        }
      },
      {
        title: "Geração da Variação B", 
        description: "Segunda versão focada em imagens poéticas",
        example: {
          variationB: "Calor da estação no coração",
          strengths: ["Imagens sensoriais", "Rima interna"],
          weaknesses: ["Emoção menos clara"]
        }
      },
      {
        title: "Análise Comparativa",
        description: "Identificação dos melhores elementos de cada variação",
        example: {
          bestOfA: "Clareza emocional de 'aquece o amor'",
          bestOfB: "Imagem poética de 'calor da estação'",
          combination: "Calor do verão aquece o amor"
        }
      },
      {
        title: "Composição da Terceira Via",
        description: "Versão final combinando os pontos fortes",
        example: {
          thirdWay: "O calor do verão aquece o amor",
          syllables: 6,
          emotionalScore: "Alto",
          imageryScore: "Alto",
          rhymeScore: "Médio"
        }
      },
      {
        title: "Validação Métrica Final",
        description: "Garantia de que a linha segue as regras do gênero",
        example: {
          finalLine: "O calor do verão aquece o amor",
          validation: "✅ 6 sílabas - Perfeito para Sertanejo Moderno",
          structure: "Métrica correta mantida"
        }
      }
    ],
    benefits: [
      "Qualidade superior às variações individuais",
      "Métrica perfeita garantida", 
      "Balanceamento entre emoção e poesia",
      "Processo totalmente automático",
      "Aplicado em todas as linhas da letra"
    ]
  }

  const getRewriteTypeDescription = (type: string) => {
    const descriptions = {
      "otimizar-metrica": "Otimização métrica usando Terceira Via",
      "melhorar-rimas": "Aprimoramento de rimas com processo A/B",
      "converter-genero": "Conversão entre gêneros com Terceira Via",
      "comercial": "Versão comercial otimizada automaticamente",
      "intensificar": "Intensificação emocional inteligente",
      "hibrida": "Fusão híbrida com melhor de dois mundos"
    }
    return descriptions[type as keyof typeof descriptions] || "Processo Terceira Via"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <span className="text-3xl">🔍</span>
            Entendendo a Terceira Via
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cabeçalho Informativo */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <span className="text-blue-600 text-lg">🔄</span>
              </div>
              <div>
                <h3 className="font-bold text-blue-800 text-lg mb-2">
                  Como a Terceira Via Funciona
                </h3>
                <p className="text-blue-700 text-sm">
                  Processo automático que cria duas variações (A e B) de cada verso, 
                  analisa seus pontos fortes e compõe uma versão final superior combinando 
                  o melhor de cada uma, sempre mantendo a métrica correta do gênero.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {getRewriteTypeDescription(rewriteType)}
                  </Badge>
                  {genre && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {genre}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Processo em Etapas */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <span>📋</span>
              Processo Passo a Passo
            </h4>

            <div className="grid grid-cols-6 gap-2 mb-4">
              {thirdWayProcess.steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                    activeStep === index
                      ? "bg-blue-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {/* Conteúdo da Etapa Ativa */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 rounded-full p-3">
                  <span className="text-blue-600 font-bold text-lg">
                    {activeStep + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-gray-900 text-lg mb-2">
                    {thirdWayProcess.steps[activeStep].title}
                  </h5>
                  <p className="text-gray-600 mb-4">
                    {thirdWayProcess.steps[activeStep].description}
                  </p>

                  {/* Exemplo Interativo */}
                  <div className="space-y-3">
                    {activeStep === 0 && (
                      <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
                        <div className="font-mono text-sm bg-white p-3 rounded border">
                          "{thirdWayProcess.steps[0].example.original}"
                        </div>
                        <p className="text-yellow-700 text-sm mt-2">
                          {thirdWayProcess.steps[0].example.analysis}
                        </p>
                      </div>
                    )}

                    {activeStep === 1 && (
                      <div className="space-y-3">
                        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                          <h6 className="font-semibold text-blue-800 mb-2">Variação A:</h6>
                          <div className="font-mono text-sm bg-white p-3 rounded border">
                            "{thirdWayProcess.steps[1].example.variationA}"
                          </div>
                          <div className="flex gap-2 mt-2">
                            {thirdWayProcess.steps[1].example.strengths.map((strength, idx) => (
                              <Badge key={idx} variant="outline" className="bg-green-100 text-green-700">
                                ✅ {strength}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeStep === 2 && (
                      <div className="space-y-3">
                        <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                          <h6 className="font-semibold text-purple-800 mb-2">Variação B:</h6>
                          <div className="font-mono text-sm bg-white p-3 rounded border">
                            "{thirdWayProcess.steps[2].example.variationB}"
                          </div>
                          <div className="flex gap-2 mt-2">
                            {thirdWayProcess.steps[2].example.strengths.map((strength, idx) => (
                              <Badge key={idx} variant="outline" className="bg-green-100 text-green-700">
                                ✅ {strength}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeStep === 3 && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-green-50 rounded-lg p-3 border-2 border-green-200">
                            <h6 className="font-semibold text-green-800 text-sm">Melhor de A:</h6>
                            <p className="text-green-700 text-sm">
                              {thirdWayProcess.steps[3].example.bestOfA}
                            </p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3 border-2 border-green-200">
                            <h6 className="font-semibold text-green-800 text-sm">Melhor de B:</h6>
                            <p className="text-green-700 text-sm">
                              {thirdWayProcess.steps[3].example.bestOfB}
                            </p>
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-200">
                          <h6 className="font-semibold text-blue-800 text-sm">Combinação Ideal:</h6>
                          <p className="text-blue-700 text-sm font-mono">
                            "{thirdWayProcess.steps[3].example.combination}"
                          </p>
                        </div>
                      </div>
                    )}

                    {activeStep === 4 && (
                      <div className="space-y-3">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-300">
                          <h6 className="font-semibold text-green-800 mb-2">Terceira Via - Versão Final:</h6>
                          <div className="font-mono text-lg bg-white p-4 rounded border-2 border-green-200 font-bold text-green-800">
                            "{thirdWayProcess.steps[4].example.thirdWay}"
                          </div>
                          <div className="grid grid-cols-3 gap-2 mt-3">
                            <div className="text-center p-2 bg-white rounded border">
                              <div className="text-xs text-gray-600">Sílabas</div>
                              <div className="font-bold text-green-600">{thirdWayProcess.steps[4].example.syllables}</div>
                            </div>
                            <div className="text-center p-2 bg-white rounded border">
                              <div className="text-xs text-gray-600">Emoção</div>
                              <div className="font-bold text-blue-600">{thirdWayProcess.steps[4].example.emotionalScore}</div>
                            </div>
                            <div className="text-center p-2 bg-white rounded border">
                              <div className="text-xs text-gray-600">Imagens</div>
                              <div className="font-bold text-purple-600">{thirdWayProcess.steps[4].example.imageryScore}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeStep === 5 && (
                      <div className="space-y-3">
                        <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                          <h6 className="font-semibold text-green-800 mb-2">Validação Final:</h6>
                          <div className="font-mono text-sm bg-white p-3 rounded border">
                            "{thirdWayProcess.steps[5].example.finalLine}"
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <span className="text-green-600">✅</span>
                            <span className="text-green-700 font-semibold">
                              {thirdWayProcess.steps[5].example.validation}
                            </span>
                          </div>
                          <p className="text-green-600 text-sm mt-2">
                            {thirdWayProcess.steps[5].example.structure}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Navegação entre Etapas */}
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                >
                  ← Anterior
                </Button>
                
                <div className="text-sm text-gray-500">
                  Etapa {activeStep + 1} de {thirdWayProcess.steps.length}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setActiveStep(Math.min(thirdWayProcess.steps.length - 1, activeStep + 1))}
                  disabled={activeStep === thirdWayProcess.steps.length - 1}
                >
                  Próximo →
                </Button>
              </div>
            </div>
          </div>

          {/* Benefícios da Terceira Via */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
              <span>⭐</span>
              Benefícios do Processo
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {thirdWayProcess.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="bg-green-100 rounded-full p-1">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <span className="text-sm text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Aplicação Prática */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
              <span>🎯</span>
              Na Sua Letra
            </h4>
            <div className="space-y-4">
              <div>
                <h5 className="font-semibold text-gray-700 mb-2">Original:</h5>
                <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm border">
                  {originalLyrics || "Nenhuma letra original fornecida"}
                </div>
              </div>
              
              <div>
                <h5 className="font-semibold text-gray-700 mb-2">Com Terceira Via:</h5>
                <div className="bg-green-50 rounded-lg p-4 font-mono text-sm border-2 border-green-200">
                  {rewrittenLyrics || "Processo Terceira Via será aplicado ao reescrever"}
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-700 text-sm">
                  <strong>Nota:</strong> Este processo ocorre automaticamente em cada linha da sua letra, 
                  garantindo qualidade superior e métrica perfeita sem necessidade de configuração manual.
                </p>
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <div className="text-sm text-gray-500">
              Processo Terceira Via • Automático e Silencioso
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
