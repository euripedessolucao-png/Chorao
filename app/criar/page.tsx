"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { BRAZILIAN_GENRE_METRICS, type GenreName, countPortugueseSyllables, validateMetrics, fixMetrics } from "@/lib/metrics"

interface ValidationResult {
  isValid: boolean
  problematicLines?: Array<{
    line: string
    syllables: number
    expected: number
    index?: number
  }> | null
  totalLines: number
  validLines: number
}

export default function CreatePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [generatedLyrics, setGeneratedLyrics] = useState("")
  const [title, setTitle] = useState("")
  const [genre, setGenre] = useState("")
  const [theme, setTheme] = useState("")
  const [mood, setMood] = useState("")
  const [creativityLevel, setCreativityLevel] = useState("equilibrado")
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

  const genres = Object.keys(BRAZILIAN_GENRE_METRICS).filter((g) => g !== "default")
  const currentMetrics = genre ? BRAZILIAN_GENRE_METRICS[genre as GenreName] : BRAZILIAN_GENRE_METRICS.default

  // Análise em tempo real da métrica
  useEffect(() => {
    if (generatedLyrics && genre) {
      const problematicLines = validateMetrics(generatedLyrics, genre)
      const lines = generatedLyrics.split("\n").filter((line) => {
        const trimmed = line.trim()
        return trimmed && !trimmed.startsWith("[") && !trimmed.startsWith("(") && !trimmed.includes("Instrumental:")
      })
      
      const totalLines = lines.length
      const validLines = totalLines - (problematicLines?.length || 0)
      
      // Converter o resultado para o formato esperado
      const convertedProblematicLines = problematicLines?.map(item => ({
        line: item.line,
        syllables: item.syllables,
        expected: currentMetrics.syllablesPerLine,
        index: item.index
      }))
      
      setValidationResult({
        isValid: !problematicLines || problematicLines.length === 0,
        problematicLines: convertedProblematicLines,
        totalLines,
        validLines
      })
    } else {
      setValidationResult(null)
    }
  }, [generatedLyrics, genre, currentMetrics.syllablesPerLine])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!genre || !theme) {
      alert("Por favor, preencha o gênero e o tema")
      return
    }

    setIsLoading(true)
    setGeneratedLyrics("")

    try {
      const metrics = BRAZILIAN_GENRE_METRICS[genre as GenreName] || BRAZILIAN_GENRE_METRICS.default

      const response = await fetch("/api/generate-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genero: genre,
          tema: theme,
          humor: mood,
          criatividade: creativityLevel,
          metrics: metrics,
          estrutura: metrics.structure,
          bpm: metrics.bpm,
          silabasPorLinha: metrics.syllablesPerLine
        }),
      })

      if (!response.ok) throw new Error("Erro ao gerar letra")

      const data = await response.json()
      setGeneratedLyrics(data.letra)
      setTitle(data.titulo || `Música sobre ${theme}`)
    } catch (error) {
      console.error("[v0] Erro ao gerar letra:", error)
      alert("Erro ao gerar letra. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFixMetrics = () => {
    if (generatedLyrics && genre) {
      const fixed = fixMetrics(generatedLyrics, currentMetrics.syllablesPerLine)
      setGeneratedLyrics(fixed)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">🎵</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Criar Nova Letra</h1>
              <p className="text-xl text-gray-600 mt-2">
                Crie letras originais com métrica automática para cada gênero
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Painel de Parâmetros */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Parâmetros da Letra</h2>
            <p className="text-gray-600 mb-6">Configure o gênero e tema para gerar sua letra</p>

            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gênero Musical *
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Escolha o gênero</option>
                  {genres.map((genreName) => (
                    <option key={genreName} value={genreName}>
                      {genreName} ({BRAZILIAN_GENRE_METRICS[genreName as GenreName].syllablesPerLine}s)
                    </option>
                  ))}
                </select>

                {genre && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">Regras do {genre}:</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-blue-700">Métrica:</span>
                        <div className="font-medium text-blue-800">{currentMetrics.syllablesPerLine} sílabas/linha</div>
                      </div>
                      <div>
                        <span className="text-blue-700">Ritmo:</span>
                        <div className="font-medium text-blue-800">{currentMetrics.bpm} BPM</div>
                      </div>
                      <div>
                        <span className="text-blue-700">Estrutura:</span>
                        <div className="font-medium text-blue-800">{currentMetrics.structure}</div>
                      </div>
                      <div>
                        <span className="text-blue-700">Estilo:</span>
                        <div className="font-medium text-blue-800">{genre}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tema da Música *
                </label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Ex: amor não correspondido, saudade da infância..."
                  className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Humor/Emoção
                </label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione o humor</option>
                  <option value="alegre">Alegre</option>
                  <option value="triste">Triste</option>
                  <option value="nostalgico">Nostálgico</option>
                  <option value="apaixonado">Apaixonado</option>
                  <option value="revolta">Revolta</option>
                  <option value="esperanca">Esperança</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível de Criatividade
                </label>
                <select
                  value={creativityLevel}
                  onChange={(e) => setCreativityLevel(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="conservador">Conservador (Estrutura Tradicional)</option>
                  <option value="equilibrado">Equilibrado (Balanceado)</option>
                  <option value="ousado">Ousado (Inovador)</option>
                </select>
                <p className="text-xs text-gray-600 mt-1">
                  {creativityLevel === "conservador" && "Mantém estrutura tradicional do gênero"}
                  {creativityLevel === "equilibrado" && "Balance entre tradição e inovação"}
                  {creativityLevel === "ousado" && "Introduz elementos criativos ousados"}
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !genre || !theme}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Gerando Letra...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🎵</span>
                    Gerar Letra {genre && `em ${genre}`}
                  </>
                )}
              </button>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start">
                  <span className="text-green-600 mr-2 mt-0.5">⚡</span>
                  <div className="text-sm text-green-800">
                    <strong>Sistema de Métrica Inteligente:</strong> Sua letra seguirá automaticamente as regras do{" "}
                    <strong>{genre || "gênero selecionado"}</strong> com {currentMetrics.syllablesPerLine} sílabas por linha.
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Painel de Resultado */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col">
            <div className="mb-6">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título da Música"
                className="w-full text-2xl font-bold border-none focus:outline-none focus:ring-0 p-0 bg-transparent placeholder:text-gray-400"
                disabled={!generatedLyrics}
              />

              {genre && generatedLyrics && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                    {currentMetrics.syllablesPerLine}s/linha
                  </span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                    {currentMetrics.bpm} BPM
                  </span>
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                    {currentMetrics.structure}
                  </span>
                  {mood && (
                    <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800">
                      {mood}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Criando sua letra...</p>
                    {genre && (
                      <p className="text-sm text-gray-600 mt-2">
                        Aplicando métrica de {currentMetrics.syllablesPerLine} sílabas/linha no estilo {genre}
                      </p>
                    )}
                  </div>
                </div>
              ) : generatedLyrics ? (
                <div className="space-y-4 flex flex-col flex-1">
                  <textarea
                    value={generatedLyrics}
                    onChange={(e) => setGeneratedLyrics(e.target.value)}
                    className="flex-1 w-full rounded-md border border-gray-300 bg-white py-3 px-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[400px] leading-6"
                    placeholder="Sua letra aparecerá aqui..."
                  />

                  {/* Análise de Métrica */}
                  {validationResult && (
                    <div className={`p-4 rounded-lg border ${
                      validationResult.isValid 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-yellow-50 border-yellow-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={
                          validationResult.isValid ? 'text-green-600' : 'text-yellow-600'
                        }>
                          {validationResult.isValid ? '✅' : '⚠️'}
                        </span>
                        <span className={`font-medium ${
                          validationResult.isValid 
                            ? 'text-green-800' 
                            : 'text-yellow-800'
                        }`}>
                          {validationResult.isValid 
                            ? 'Métrica Correta!' 
                            : 'Ajuste de Métrica Recomendado'
                          }
                        </span>
                      </div>
                      <p className={`text-sm ${
                        validationResult.isValid 
                          ? 'text-green-700' 
                          : 'text-yellow-700'
                      }`}>
                        {validationResult.isValid 
                          ? `Todas as ${validationResult.totalLines} linhas seguem a métrica de ${currentMetrics.syllablesPerLine} sílabas.`
                          : `${validationResult.problematicLines?.length || 0} de ${validationResult.totalLines} linhas precisam de ajuste.`
                        }
                      </p>

                      {!validationResult.isValid && validationResult.problematicLines && (
                        <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                          {validationResult.problematicLines.slice(0, 3).map((item, index) => (
                            <div key={index} className="text-xs bg-white p-2 rounded border">
                              <div className="font-mono">{item.line.substring(0, 50)}...</div>
                              <div className="text-yellow-700 mt-1">
                                {item.syllables} sílabas (limite: {item.expected})
                              </div>
                            </div>
                          ))}
                          {validationResult.problematicLines.length > 3 && (
                            <div className="text-xs text-yellow-700 text-center">
                              +{validationResult.problematicLines.length - 3} linhas com problemas
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 justify-between items-center flex-wrap">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => navigator.clipboard.writeText(generatedLyrics)}
                        className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center transition-colors"
                      >
                        <span className="mr-2">📋</span>
                        Copiar Letra
                      </button>

                      {validationResult && !validationResult.isValid && (
                        <button
                          onClick={handleFixMetrics}
                          className="bg-yellow-100 border border-yellow-300 text-yellow-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 flex items-center transition-colors"
                        >
                          <span className="mr-2">🔧</span>
                          Corrigir Métrica
                        </button>
                      )}

                      <button className="bg-blue-100 border border-blue-300 text-blue-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center transition-colors">
                        <span className="mr-2">🎧</span>
                        Ouvir
                      </button>
                    </div>

                    <button className="bg-blue-600 text-white py-2 px-6 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center transition-colors">
                      <span className="mr-2">💾</span>
                      Salvar Projeto
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-600 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <span className="text-5xl mb-4 block">🎵</span>
                    <p className="text-lg mb-2">Sua letra aparecerá aqui</p>
                    <p className="text-sm">Preencha os parâmetros ao lado e gere sua composição!</p>
                    {genre && (
                      <p className="text-xs mt-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Métrica: {currentMetrics.syllablesPerLine} sílabas/linha
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>🎯</span>
            Sistema de Métrica Automática
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 text-xl">📊</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Análise em Tempo Real</h3>
              <p className="text-sm text-gray-600">Validação automática da métrica enquanto você compõe</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 text-xl">🔧</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Correção Automática</h3>
              <p className="text-sm text-gray-600">Ajuste inteligente de versos longos com um clique</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 text-xl">🎵</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Gêneros Especializados</h3>
              <p className="text-sm text-gray-600">Regras específicas para cada estilo musical brasileiro</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 text-xl">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Geração Rápida</h3>
              <p className="text-sm text-gray-600">Letras criadas instantaneamente com métrica perfeita</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start">
              <span className="text-gray-600 mr-3 mt-0.5 text-xl">💡</span>
              <div className="text-sm text-gray-700">
                <strong>Dica Profissional:</strong> O sistema garante que sua letra tenha a métrica correta para o gênero selecionado. 
                Versos com mais de {currentMetrics.syllablesPerLine} sílabas são automaticamente destacados e podem ser corrigidos com um clique.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
