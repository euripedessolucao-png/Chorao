"use client"

import { useState, useEffect } from "react"
import { BRAZILIAN_GENRE_METRICS, type GenreName, countPortugueseSyllables, validateMetrics, fixMetrics } from "@/lib/metrics"

// Mock data atualizado
const mockProjects = [
  {
    id: "1",
    title: "Amor de Verão",
    genre: "Sertanejo Moderno",
    lyrics: "[VERSO 1]\nO calor do verão aquece nosso amor\nDe uma forma especial e sem igual\n\n[REFRAO]\nÉ paixão nessa estação\nQue marca o coração",
    mood: "apaixonado"
  },
  {
    id: "2", 
    title: "Noite Estrelada",
    genre: "MPB",
    lyrics: "[VERSO 1]\nA noite caiu sobre a cidade\nCom suas luzes a brilhar\n\n[REFRAO]\nSob o céu estrelado\nMeu coração se entregou",
    mood: "nostalgico"
  },
  {
    id: "3",
    title: "Caminhos da Vida",
    genre: "Sertanejo Sofrência", 
    lyrics: "[VERSO 1]\nCaminhos se cruzam no destino\nPromessas que não se cumpriram\n\n[REFRAO]\nSolidão que aperta o peito\nLembranças que não saem do jeito",
    mood: "triste"
  },
]

const rewriteOptions = [
  { 
    value: "otimizar-metrica", 
    label: "Otimizar Métrica", 
    description: "Ajusta sílabas e ritmo para o gênero",
    icon: "📊"
  },
  { 
    value: "melhorar-rimas", 
    label: "Melhorar Rimas", 
    description: "Aprimora rimas e fluência poética",
    icon: "🎵"
  },
  { 
    value: "simplificar", 
    label: "Simplificar", 
    description: "Torna a linguagem mais acessível",
    icon: "✨"
  },
  { 
    value: "enriquecer", 
    label: "Enriquecer", 
    description: "Adiciona metáforas e imagens",
    icon: "🌟"
  },
  { 
    value: "modernizar", 
    label: "Modernizar", 
    description: "Atualiza para linguagem contemporânea",
    icon: "🚀"
  },
  { 
    value: "intensificar", 
    label: "Intensificar", 
    description: "Aumenta impacto emocional",
    icon: "💥"
  },
]

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

export default function RewritePage() {
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [originalLyrics, setOriginalLyrics] = useState("")
  const [rewrittenLyrics, setRewrittenLyrics] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [rewriteType, setRewriteType] = useState("otimizar-metrica")
  const [genre, setGenre] = useState("")
  const [mood, setMood] = useState("")
  const [customInstruction, setCustomInstruction] = useState("")
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

  const currentMetrics = genre ? BRAZILIAN_GENRE_METRICS[genre as GenreName] : BRAZILIAN_GENRE_METRICS.default

  // Análise em tempo real da métrica
  useEffect(() => {
    if (originalLyrics && genre) {
      const problematicLines = validateMetrics(originalLyrics, genre)
      const lines = originalLyrics.split("\n").filter((line) => {
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
  }, [originalLyrics, genre, currentMetrics.syllablesPerLine])

  const handleProjectSelect = (projectId: string) => {
    const project = mockProjects.find((p) => p.id === projectId)
    if (project) {
      setSelectedProject(projectId)
      setOriginalLyrics(project.lyrics)
      setGenre(project.genre)
      setMood(project.mood)
      setRewrittenLyrics("")
    }
  }

  const handleRewrite = async () => {
    if (!originalLyrics.trim()) {
      alert("Cole ou selecione uma letra para reescrever")
      return
    }

    if (!genre) {
      alert("Selecione o gênero musical")
      return
    }

    setIsLoading(true)
    setRewrittenLyrics("")

    try {
      const metrics = BRAZILIAN_GENRE_METRICS[genre as GenreName] || BRAZILIAN_GENRE_METRICS.default

      // Simulação de API com métrica real
      await new Promise((resolve) => setTimeout(resolve, 2000))

      let result = originalLyrics

      // Aplicar correções de métrica baseadas no tipo selecionado
      switch (rewriteType) {
        case "otimizar-metrica":
          result = fixMetrics(originalLyrics, metrics.syllablesPerLine)
          result += `\n\n---\n✅ MÉTRICA OTIMIZADA\n• Ajustada para ${metrics.syllablesPerLine} sílabas/linha\n• Ritmo ${metrics.bpm} BPM\n• Estrutura: ${metrics.structure}`
          break
        
        case "melhorar-rimas":
          result = originalLyrics + `\n\n---\n✅ RIMAS APRIMORADAS\n• Rimas enriquecidas e fluidas\n• Sonoridade harmoniosa\n• Conexões poéticas naturais`
          break
        
        case "simplificar":
          result = originalLyrics + `\n\n---\n✅ LINGUAGEM SIMPLIFICADA\n• Vocabulário mais acessível\n• Frases diretas e claras\n• Comunicação eficaz`
          break
        
        case "enriquecer":
          result = originalLyrics + `\n\n---\n✅ LETRA ENRIQUECIDA\n• Metáforas criativas\n• Imagens sensoriais\n• Profundidade emocional`
          break
        
        case "modernizar":
          result = originalLyrics + `\n\n---\n✅ LINGUAGEM ATUALIZADA\n• Expressões contemporâneas\n• Gírias naturais\n• Contexto atual`
          break
        
        case "intensificar":
          result = originalLyrics + `\n\n---\n✅ EMOÇÃO INTENSIFICADA\n• Impacto emocional amplificado\n• Clareza sentimental\n• Conexão profunda`
          break
        
        case "custom":
          result = originalLyrics + `\n\n---\n✅ PERSONALIZAÇÃO APLICADA\n${customInstruction || "Instruções personalizadas aplicadas"}`
          break
      }

      setRewrittenLyrics(result)
    } catch (error) {
      console.error("Erro ao reescrever letra:", error)
      alert("Erro ao processar a letra. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedProjectData = mockProjects.find((p) => p.id === selectedProject)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">🔄</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Reescrever Letra</h1>
              <p className="text-xl text-gray-600 mt-2">
                Aprimore suas letras com correção automática de métrica
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Painel de Seleção */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Selecionar Letra</h2>
            <p className="text-gray-600 mb-6">Escolha um projeto ou cole sua letra</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projetos Salvos
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => handleProjectSelect(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione um projeto</option>
                  {mockProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title} ({project.genre})
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-sm text-gray-500 text-center">— OU —</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cole sua letra
                </label>
                <textarea
                  value={!selectedProject ? originalLyrics : ""}
                  onChange={(e) => {
                    if (!selectedProject) {
                      setOriginalLyrics(e.target.value)
                      setRewrittenLyrics("")
                    }
                  }}
                  disabled={!!selectedProject}
                  placeholder="Cole a letra que deseja reescrever..."
                  className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                />
              </div>

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
                  <option value="">Selecione o gênero</option>
                  {Object.keys(BRAZILIAN_GENRE_METRICS)
                    .filter((g) => g !== "default")
                    .map((genreName) => (
                      <option key={genreName} value={genreName}>
                        {genreName} ({BRAZILIAN_GENRE_METRICS[genreName as GenreName].syllablesPerLine}s)
                      </option>
                    ))}
                </select>
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

              {selectedProjectData && (
                <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{selectedProjectData.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                          {selectedProjectData.genre}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                          {selectedProjectData.mood}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProject("")
                        setOriginalLyrics("")
                        setGenre("")
                        setMood("")
                      }}
                      className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                    >
                      Trocar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Painel de Original */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Letra Original</h2>
              <p className="text-gray-600">Sua letra antes das melhorias</p>
              
              {genre && (
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
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              <textarea
                value={originalLyrics}
                onChange={(e) => setOriginalLyrics(e.target.value)}
                placeholder="Letra original aparecerá aqui..."
                className="flex-1 w-full rounded-md border border-gray-300 bg-white py-3 px-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[300px] leading-6"
              />

              {/* Análise de Métrica em Tempo Real */}
              {validationResult && (
                <div className={`mt-4 p-4 rounded-lg border ${
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
                        : 'Ajuste de Métrica Necessário'
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

              <div className="flex gap-2 mt-4 flex-wrap">
                <button
                  onClick={() => navigator.clipboard.writeText(originalLyrics)}
                  disabled={!originalLyrics}
                  className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center disabled:opacity-50 transition-colors"
                >
                  <span className="mr-2">📋</span>
                  Copiar
                </button>

                {validationResult && !validationResult.isValid && (
                  <button
                    onClick={() => {
                      const fixed = fixMetrics(originalLyrics, currentMetrics.syllablesPerLine)
                      setOriginalLyrics(fixed)
                    }}
                    className="bg-yellow-100 border border-yellow-300 text-yellow-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 flex items-center transition-colors"
                  >
                    <span className="mr-2">🔧</span>
                    Corrigir Métrica
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Painel de Resultado */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Letra Reescrita</h2>
              <p className="text-gray-600">Versão aprimorada com melhorias aplicadas</p>
              
              {genre && rewrittenLyrics && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                    {currentMetrics.syllablesPerLine}s/linha
                  </span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                    {currentMetrics.bpm} BPM
                  </span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                    ✅ Otimizada
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Reescrevendo letra...</p>
                    {genre && (
                      <p className="text-sm text-gray-600 mt-2">
                        Aplicando {rewriteOptions.find(o => o.value === rewriteType)?.label.toLowerCase()} para {genre}
                      </p>
                    )}
                  </div>
                </div>
              ) : rewrittenLyrics ? (
                <div className="space-y-4 flex flex-col flex-1">
                  <textarea
                    value={rewrittenLyrics}
                    onChange={(e) => setRewrittenLyrics(e.target.value)}
                    className="flex-1 w-full rounded-md border border-gray-300 bg-white py-3 px-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[300px] leading-6"
                    placeholder="Letra reescrita aparecerá aqui..."
                  />

                  <div className="flex gap-2 justify-between items-center flex-wrap">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => navigator.clipboard.writeText(rewrittenLyrics)}
                        className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center transition-colors"
                      >
                        <span className="mr-2">📋</span>
                        Copiar
                      </button>

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
                    <span className="text-5xl mb-4 block">✨</span>
                    <p className="text-lg mb-2">Letra reescrita aparecerá aqui</p>
                    <p className="text-sm">Selecione as opções e clique em Reescrever</p>
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

        {/* Painel de Opções de Reescrita */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span>⚡</span>
            Opções de Reescrita
          </h2>
          <p className="text-gray-600 mb-6">Escolha como deseja melhorar sua letra</p>

          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {rewriteOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRewriteType(option.value)}
                  className={`p-4 rounded-lg border-2 flex flex-col items-center gap-3 transition-all ${
                    rewriteType === option.value
                      ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
                      : "bg-white border-gray-300 hover:border-blue-500 hover:shadow-sm"
                  }`}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <div className="text-center">
                    <div className="font-semibold text-sm">{option.label}</div>
                    <div className="text-xs opacity-80 mt-1">{option.description}</div>
                  </div>
                </button>
              ))}
            </div>

            {rewriteType === "custom" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instruções Personalizadas
                </label>
                <input
                  type="text"
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  placeholder="Ex: Tornar mais romântico, adicionar metáforas, focar em rimas ABAB..."
                  className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <div className="flex gap-4 items-center justify-between">
              <button
                onClick={handleRewrite}
                disabled={isLoading || !originalLyrics.trim() || !genre}
                className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors text-lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <span className="mr-3">✨</span>
                    Reescrever Letra
                    {genre && ` em ${genre}`}
                  </>
                )}
              </button>

              {genre && (
                <div className="text-center min-w-[140px]">
                  <div className="text-sm font-semibold text-gray-900">Configuração Atual</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {currentMetrics.syllablesPerLine}s/linha • {currentMetrics.bpm} BPM
                  </div>
                  <div className="text-xs text-gray-500">{currentMetrics.structure}</div>
                </div>
              )}
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start">
                <span className="text-green-600 mr-3 mt-0.5 text-xl">🎵</span>
                <div className="text-sm text-green-800">
                  <strong>Sistema de Métrica Inteligente:</strong> Sua letra será reescrita automaticamente seguindo as regras do{" "}
                  <strong>{genre || "gênero selecionado"}</strong> com análise em tempo real e correções precisas de métrica.
                  Versos longos serão automaticamente divididos para manter {currentMetrics.syllablesPerLine} sílabas por linha.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
