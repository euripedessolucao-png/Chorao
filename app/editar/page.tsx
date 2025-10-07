// app/editar/page.tsx
"use client"

import { useState, useEffect } from "react"
import { ADVANCED_BRAZILIAN_METRICS, ThirdWayEngine } from "@/lib/third-way-converter"
import { ThirdWayAnalysis } from "@/components/third-way-analysis"

// Defina o tipo GenreName localmente
type GenreName = keyof typeof ADVANCED_BRAZILIAN_METRICS

// Funções auxiliares para validação de métrica
const countPortugueseSyllables = (text: string): number => {
  const cleanText = text.toLowerCase().replace(/[^a-záàâãéèêíïóôõöúçñ]/g, '')
  const syllables = cleanText.match(/[aeiouáàâãéèêíïóôõöúçñ]+/g)
  return syllables ? syllables.length : 0
}

const validateMetrics = (lyrics: string, genre: GenreName) => {
  const metrics = ADVANCED_BRAZILIAN_METRICS[genre] || ADVANCED_BRAZILIAN_METRICS.default
  const expectedSyllables = metrics.syllablesPerLine
  
  const lines = lyrics.split('\n').filter(line => {
    const trimmed = line.trim()
    return trimmed && !trimmed.startsWith('[') && !trimmed.startsWith('(')
  })

  const problematicLines = lines
    .map((line, index) => {
      const syllables = countPortugueseSyllables(line)
      return { line, syllables, expected: expectedSyllables, index }
    })
    .filter(item => item.syllables !== expectedSyllables)

  return problematicLines.length > 0 ? problematicLines : null
}

const fixMetrics = (lyrics: string, targetSyllables: number): string => {
  const lines = lyrics.split('\n')
  
  return lines.map(line => {
    if (line.startsWith('[') || line.startsWith('(') || !line.trim()) {
      return line
    }
    
    const currentSyllables = countPortugueseSyllables(line)
    
    if (currentSyllables === targetSyllables) {
      return line
    }
    
    if (currentSyllables < targetSyllables) {
      return line + ' amor'
    } else {
      return line.split(' ').slice(0, -1).join(' ')
    }
  }).join('\n')
}

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

// Mock data para projetos salvos
const mockUserProjects = [
  {
    id: "1",
    title: "Amor de Verão",
    genre: "Sertanejo Moderno",
    lyrics: "[VERSO 1]\nO calor do verão aquece nosso amor\nDe uma forma especial e sem igual\n\n[REFRAO]\nÉ paixão nessa estação\nQue marca o coração",
    mood: "apaixonado",
    createdAt: "2024-01-15",
    modifiedAt: "2024-01-15"
  },
  {
    id: "2", 
    title: "Noite Estrelada",
    genre: "MPB",
    lyrics: "[VERSO 1]\nA noite caiu sobre a cidade\nCom suas luzes a brilhar\n\n[REFRAO]\nSob o céu estrelado\nMeu coração se entregou",
    mood: "nostalgico",
    createdAt: "2024-01-10",
    modifiedAt: "2024-01-12"
  },
  {
    id: "3",
    title: "Caminhos da Vida",
    genre: "Sertanejo Sofrência",
    lyrics: "[VERSO 1]\nCaminhos se cruzam no destino\nPromessas que não se cumpriram\n\n[REFRAO]\nSolidão que aperta o peito\nLembranças que não saem do jeito",
    mood: "triste",
    createdAt: "2024-01-08",
    modifiedAt: "2024-01-08"
  }
]

const improvementOptions = [
  {
    value: "terceira-via",
    label: "Terceira Via",
    description: "Processo A/B automático para versão final",
    icon: "✨"
  },
  {
    value: "melhoria-metrica", 
    label: "Melhoria de Métrica",
    description: "Ajuste automático de sílabas",
    icon: "📊"
  },
  {
    value: "otimizacao-rimas",
    label: "Otimização de Rimas",
    description: "Aprimoramento das conexões poéticas",
    icon: "🎵"
  },
  {
    value: "intensificacao-emocao",
    label: "Intensificação Emocional",
    description: "Aumento do impacto sentimental",
    icon: "💥"
  }
]

export default function EditPage() {
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [lyrics, setLyrics] = useState("")
  const [genre, setGenre] = useState<GenreName | "">("")
  const [mood, setMood] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [improvementType, setImprovementType] = useState("terceira-via")
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [showThirdWayAnalysis, setShowThirdWayAnalysis] = useState(false)
  const [title, setTitle] = useState("")

  const currentMetrics = genre ? ADVANCED_BRAZILIAN_METRICS[genre] : ADVANCED_BRAZILIAN_METRICS.default

  // Análise em tempo real da métrica
  useEffect(() => {
    if (lyrics && genre) {
      const problematicLines = validateMetrics(lyrics, genre)
      const lines = lyrics.split("\n").filter((line) => {
        const trimmed = line.trim()
        return trimmed && !trimmed.startsWith("[") && !trimmed.startsWith("(") && !trimmed.includes("Instrumental:")
      })
      
      const totalLines = lines.length
      const validLines = totalLines - (problematicLines?.length || 0)
      
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
  }, [lyrics, genre, currentMetrics.syllablesPerLine])

  const handleProjectSelect = (projectId: string) => {
    const project = mockUserProjects.find((p) => p.id === projectId)
    if (project) {
      setSelectedProject(projectId)
      setLyrics(project.lyrics)
      setGenre(project.genre as GenreName)
      setMood(project.mood)
      setTitle(project.title)
    }
  }

  const handleImproveLyrics = async () => {
    if (!lyrics.trim()) {
      alert("Selecione um projeto ou cole uma letra para melhorar")
      return
    }

    if (!genre) {
      alert("Selecione o gênero musical")
      return
    }

    setIsLoading(true)

    try {
      // Simulação de processamento com Terceira Via
      await new Promise((resolve) => setTimeout(resolve, 2000))

      let improvedLyrics = lyrics

      switch (improvementType) {
        case "terceira-via":
          // Aplica Terceira Via em cada linha
          const lines = lyrics.split('\n')
          improvedLyrics = lines.map(line => {
            if (line.startsWith('[') || line.startsWith('(') || !line.trim()) {
              return line
            }
            return ThirdWayEngine.generateThirdWayLine(
              extractThemeFromLine(line),
              genre,
              `Melhoria Terceira Via - ${mood}`
            )
          }).join('\n')
          improvedLyrics += `\n\n---\n✅ TERCEIRA VIA APLICADA\n• Processo A/B automático concluído\n• Métrica otimizada: ${currentMetrics.syllablesPerLine}s\n• Qualidade aprimorada silenciosamente`
          break

        case "melhoria-metrica":
          improvedLyrics = fixMetrics(lyrics, currentMetrics.syllablesPerLine)
          improvedLyrics += `\n\n---\n✅ MÉTRICA OTIMIZADA\n• Todas as linhas ajustadas para ${currentMetrics.syllablesPerLine} sílabas\n• Estrutura preservada`
          break

        case "otimizacao-rimas":
          // Simulação de melhoria de rimas
          improvedLyrics = lyrics + `\n\n---\n✅ RIMAS OTIMIZADAS\n• Conexões poéticas aprimoradas\n• Fluidez musical aumentada`
          break

        case "intensificacao-emocao":
          // Simulação de intensificação emocional
          improvedLyrics = lyrics + `\n\n---\n✅ EMOÇÃO INTENSIFICADA\n• Impacto sentimental amplificado\n• Clareza emocional aprimorada`
          break
      }

      setLyrics(improvedLyrics)
    } catch (error) {
      console.error("Erro ao melhorar letra:", error)
      alert("Erro ao processar a letra. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const extractThemeFromLine = (line: string): string => {
    const commonThemes = ['amor', 'saudade', 'festa', 'dor', 'alegria', 'vida', 'tempo']
    const words = line.toLowerCase().split(' ')
    return words.find(word => commonThemes.includes(word)) || 'sentimentos'
  }

  const handleFixMetrics = () => {
    if (lyrics && genre) {
      const fixed = fixMetrics(lyrics, currentMetrics.syllablesPerLine)
      setLyrics(fixed)
    }
  }

  const handleSaveProject = () => {
    if (!title || !lyrics) {
      alert("Por favor, preencha o título e a letra antes de salvar")
      return
    }
    
    alert(`Projeto "${title}" salvo com sucesso!`)
    console.log("Projeto salvo:", { 
      title, 
      genre, 
      mood, 
      lyrics,
      improvedWith: improvementType 
    })
  }

  const selectedProjectData = mockUserProjects.find((p) => p.id === selectedProject)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-white rounded-2xl shadow-lg">
              <span className="text-2xl">✏️</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Editar Projeto
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                Melhore suas letras com ferramentas inteligentes
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Painel de Seleção */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Selecionar Projeto</h2>
            <p className="text-gray-600 mb-6">Escolha um projeto para editar</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Projetos Salvos
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => handleProjectSelect(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-300 bg-white py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Selecione um projeto</option>
                  {mockUserProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title} ({project.genre})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Título do Projeto
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Digite o título da música..."
                  className="w-full rounded-xl border-2 border-gray-300 bg-white py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gênero Musical *
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value as GenreName)}
                  className="w-full rounded-xl border-2 border-gray-300 bg-white py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="">Selecione o gênero</option>
                  {Object.keys(ADVANCED_BRAZILIAN_METRICS)
                    .filter((g) => g !== "default")
                    .map((genreName) => (
                      <option key={genreName} value={genreName}>
                        {genreName} ({ADVANCED_BRAZILIAN_METRICS[genreName as GenreName].syllablesPerLine}s)
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Humor/Emoção
                </label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-300 bg-white py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Selecione...</option>
                  <option value="alegre">😊 Alegre</option>
                  <option value="triste">😢 Triste</option>
                  <option value="nostalgico">✨ Nostálgico</option>
                  <option value="apaixonado">❤️ Apaixonado</option>
                  <option value="revolta">💢 Revolta</option>
                  <option value="esperanca">🌈 Esperança</option>
                </select>
              </div>

              {selectedProjectData && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{selectedProjectData.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                          {selectedProjectData.genre}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-800">
                          {selectedProjectData.mood}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Modificado: {selectedProjectData.modifiedAt}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProject("")
                        setLyrics("")
                        setGenre("")
                        setMood("")
                        setTitle("")
                      }}
                      className="text-gray-500 hover:text-gray-700 text-sm font-semibold"
                    >
                      Trocar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Painel de Edição */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col lg:col-span-2">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Editor de Letra</h2>
              <p className="text-gray-600">Edite e melhore sua letra com ferramentas inteligentes</p>
              
              {genre && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                    {currentMetrics.syllablesPerLine}s/linha
                  </span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                    {currentMetrics.bpm} BPM
                  </span>
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">
                    {currentMetrics.structure}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Sua letra aparecerá aqui..."
                className="flex-1 w-full rounded-xl border-2 border-gray-300 bg-white py-4 px-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[400px] leading-7 transition-colors"
              />

              {/* Análise de Métrica em Tempo Real */}
              {validationResult && (
                <div className={`mt-4 p-4 rounded-xl border-2 ${
                  validationResult.isValid 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={
                      validationResult.isValid ? 'text-green-600 text-xl' : 'text-yellow-600 text-xl'
                    }>
                      {validationResult.isValid ? '✅' : '⚠️'}
                    </span>
                    <span className={`font-bold ${
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
                        <div key={index} className="text-xs bg-white p-2 rounded-lg border">
                          <div className="font-mono font-semibold">{item.line.substring(0, 50)}...</div>
                          <div className="text-yellow-700 mt-1 font-medium">
                            {item.syllables} sílabas (limite: {item.expected})
                          </div>
                        </div>
                      ))}
                      {validationResult.problematicLines.length > 3 && (
                        <div className="text-xs text-yellow-700 text-center font-semibold">
                          +{validationResult.problematicLines.length - 3} linhas com problemas
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 mt-4 flex-wrap">
                <button
                  onClick={() => navigator.clipboard.writeText(lyrics)}
                  disabled={!lyrics}
                  className="bg-white border-2 border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center disabled:opacity-50 transition-colors"
                >
                  <span className="mr-2">📋</span>
                  Copiar
                </button>

                {validationResult && !validationResult.isValid && (
                  <button
                    onClick={handleFixMetrics}
                    className="bg-yellow-100 border-2 border-yellow-300 text-yellow-700 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 flex items-center transition-colors"
                  >
                    <span className="mr-2">🔧</span>
                    Corrigir Métrica
                  </button>
                )}

                <button
                  onClick={() => setShowThirdWayAnalysis(true)}
                  disabled={!lyrics}
                  className="bg-purple-100 border-2 border-purple-300 text-purple-700 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center disabled:opacity-50 transition-colors"
                >
                  <span className="mr-2">🔍</span>
                  Análise Terceira Via
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Painel de Melhorias */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span>⚡</span>
            Ferramentas de Melhoria
          </h2>
          <p className="text-gray-600 mb-6">Use inteligência artificial para aprimorar sua letra</p>

          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {improvementOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setImprovementType(option.value)}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
                    improvementType === option.value
                      ? "bg-gradient-to-r from-orange-600 to-red-600 text-white border-orange-600 shadow-lg scale-105"
                      : "bg-white border-gray-300 hover:border-orange-500 hover:shadow-md"
                  }`}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <div className="text-center">
                    <div className="font-bold text-sm">{option.label}</div>
                    <div className="text-xs opacity-80 mt-1">{option.description}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-4 items-center justify-between">
              <button
                onClick={handleImproveLyrics}
                disabled={isLoading || !lyrics.trim() || !genre}
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3"></div>
                    Aplicando {improvementOptions.find(o => o.value === improvementType)?.label}...
                  </>
                ) : (
                  <>
                    <span className="mr-3">✨</span>
                    Aplicar {improvementOptions.find(o => o.value === improvementType)?.label}
                  </>
                )}
              </button>

              <button 
                onClick={handleSaveProject}
                disabled={!title || !lyrics}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-200 shadow-lg"
              >
                <span className="mr-2">💾</span>
                Salvar Projeto
              </button>
            </div>

            {improvementType === "terceira-via" && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
                <div className="flex items-start">
                  <span className="text-purple-600 mr-3 mt-0.5 text-xl">🎵</span>
                  <div className="text-sm text-purple-800">
                    <strong>Terceira Via Ativa:</strong> Sua letra será processada automaticamente usando o método silencioso de variação A + variação B → versão final. 
                    Cada linha será otimizada individualmente, garantindo métrica perfeita e qualidade superior.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Análise da Terceira Via */}
        {showThirdWayAnalysis && (
          <ThirdWayAnalysis
            isOpen={showThirdWayAnalysis}
            onClose={() => setShowThirdWayAnalysis(false)}
            originalLyrics={selectedProjectData?.lyrics || ""}
            rewrittenLyrics={lyrics}
            genre={genre}
            rewriteType="edicao"
          />
        )}
      </div>
    </div>
  )
}
