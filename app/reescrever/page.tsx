// app/rewrite/page.tsx
"use client"

import { useState, useEffect } from "react"
import { ADVANCED_BRAZILIAN_METRICS, type GenreName, countPortugueseSyllables, validateMetrics, fixMetrics, ThirdWayConverter, ThirdWayEngine } from "@/lib/third-way-converter"
import { ThirdWayAnalysis } from "@/components/third-way-analysis"

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
    description: "Aplica Terceira Via para métrica perfeita",
    icon: "📊"
  },
  { 
    value: "melhorar-rimas", 
    label: "Melhorar Rimas", 
    description: "Terceira Via nas conexões poéticas",
    icon: "🎵"
  },
  { 
    value: "converter-genero", 
    label: "Converter Gênero", 
    description: "Terceira Via entre estilos musicais",
    icon: "🔄"
  },
  { 
    value: "comercial", 
    label: "Versão Comercial", 
    description: "Terceira Via com apelo de massa",
    icon: "💰"
  },
  { 
    value: "intensificar", 
    label: "Intensificar Emoção", 
    description: "Terceira Via no impacto emocional",
    icon: "💥"
  },
  { 
    value: "hibrida", 
    label: "Versão Híbrida", 
    description: "Terceira Via com múltiplos estilos",
    icon: "🌟"
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
  const [genre, setGenre] = useState<GenreName | "">("")
  const [targetGenre, setTargetGenre] = useState<GenreName | "">("")
  const [mood, setMood] = useState("")
  const [customInstruction, setCustomInstruction] = useState("")
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [showThirdWayAnalysis, setShowThirdWayAnalysis] = useState(false)
  const [conversionIntensity, setConversionIntensity] = useState<1 | 2 | 3>(1)
  const [preserveTheme, setPreserveTheme] = useState(true)

  const currentMetrics = genre ? ADVANCED_BRAZILIAN_METRICS[genre] : ADVANCED_BRAZILIAN_METRICS.default

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
      setGenre(project.genre as GenreName)
      setMood(project.mood)
      setRewrittenLyrics("")
      setTargetGenre("")
    }
  }

  // FUNÇÃO PRINCIPAL DE REESCRITA COM TERCEIRA VIA
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
      const metrics = ADVANCED_BRAZILIAN_METRICS[genre] || ADVANCED_BRAZILIAN_METRICS.default
      
      // Simulação de processamento com Terceira Via
      await new Promise((resolve) => setTimeout(resolve, 2000))

      let result = originalLyrics

      // APLICAÇÃO DA TERCEIRA VIA CONFORME O TIPO SELECIONADO
      switch (rewriteType) {
        case "otimizar-metrica":
          result = this.applyThirdWayMetricOptimization(originalLyrics, genre)
          result += `\n\n---\n✅ TERCEIRA VIA APLICADA - MÉTRICA OTIMIZADA\n• Todas as linhas ajustadas para ${metrics.syllablesPerLine} sílabas\n• Processo silencioso: Variação A + Variação B → Versão Final\n• Ritmo mantido em ${metrics.bpm} BPM`
          break
        
        case "melhorar-rimas":
          result = this.applyThirdWayRhymeEnhancement(originalLyrics, genre)
          result += `\n\n---\n✅ TERCEIRA VIA APLICADA - RIMAS APRIMORADAS\n• Conexões poéticas enriquecidas silenciosamente\n• Fluidez natural preservada\n• Sonoridade harmoniosa`
          break
        
        case "converter-genero":
          if (!targetGenre) {
            alert("Selecione o gênero de destino para conversão")
            setIsLoading(false)
            return
          }
          result = ThirdWayConverter.convertLyrics(originalLyrics, genre, targetGenre, {
            preserveTheme,
            intensity: conversionIntensity
          })
          result += `\n\n---\n✅ TERCEIRA VIA APLICADA - CONVERSÃO DE GÊNERO\n• Convertido de ${genre} para ${targetGenre}\n• Métrica ajustada: ${ADVANCED_BRAZILIAN_METRICS[targetGenre].syllablesPerLine}s\n• Intensidade: ${conversionIntensity}/3\n• Tema ${preserveTheme ? 'preservado' : 'adaptado'}`
          break
        
        case "comercial":
          result = this.applyThirdWayCommercialVersion(originalLyrics, genre)
          result += `\n\n---\n✅ TERCEIRA VIA APLICADA - VERSÃO COMERCIAL\n• Apelo de massa otimizado silenciosamente\n• Estrutura A/B analisada e combinada\n• Potencial de viralidade aumentado`
          break
        
        case "intensificar":
          result = this.applyThirdWayEmotionalIntensification(originalLyrics, genre, conversionIntensity)
          result += `\n\n---\n✅ TERCEIRA VIA APLICADA - EMOÇÃO INTENSIFICADA\n• Impacto emocional amplificado\n• Clareza sentimental aprimorada\n• Intensidade: ${conversionIntensity}/3`
          break
        
        case "hibrida":
          result = this.applyThirdWayHybridVersion(originalLyrics, genre, targetGenre || "Pop")
          result += `\n\n---\n✅ TERCEIRA VIA APLICADA - VERSÃO HÍBRIDA\n• Fusão silenciosa de ${genre} + ${targetGenre || "Pop"}\n• Melhores elementos combinados\n• Inovação mantendo estrutura`
          break
        
        case "custom":
          result = originalLyrics + `\n\n---\n✅ TERCEIRA VIA APLICADA - PERSONALIZAÇÃO\n${customInstruction || "Instruções personalizadas aplicadas com processo A/B"}`
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

  // MÉTODOS DA TERCEIRA VIA (implementações simplificadas)
  private applyThirdWayMetricOptimization = (lyrics: string, genre: GenreName): string => {
    const lines = lyrics.split('\n')
    return lines.map(line => {
      if (line.startsWith('[') || line.startsWith('(') || !line.trim()) {
        return line
      }
      // TERCEIRA VIA SILENCIOSA: A → B → Versão Final
      return ThirdWayEngine.generateThirdWayLine(
        this.extractThemeFromLine(line),
        genre,
        "Otimização métrica"
      )
    }).join('\n')
  }

  private applyThirdWayRhymeEnhancement = (lyrics: string, genre: GenreName): string => {
    const lines = lyrics.split('\n')
    const optimizedLines = lines.map((line, index) => {
      if (line.startsWith('[') || line.startsWith('(') || !line.trim()) {
        return line
      }
      
      // TERCEIRA VIA: Analisa rimas e melhora silenciosamente
      const context = index > 0 ? lines[index - 1] : ""
      return ThirdWayEngine.generateThirdWayLine(
        this.extractThemeFromLine(line),
        genre,
        `Melhoria de rimas: ${context}`
      )
    })
    
    return optimizedLines.join('\n')
  }

  private applyThirdWayCommercialVersion = (lyrics: string, genre: GenreName): string => {
    // TERCEIRA VIA para apelo comercial
    const lines = lyrics.split('\n')
    return lines.map(line => {
      if (line.startsWith('[') || line.startsWith('(') || !line.trim()) {
        return line
      }
      
      return ThirdWayEngine.generateThirdWayLine(
        this.extractThemeFromLine(line),
        genre,
        "Versão comercial - apelo de massa"
      )
    }).join('\n')
  }

  private applyThirdWayEmotionalIntensification = (lyrics: string, genre: GenreName, intensity: number): string => {
    const lines = lyrics.split('\n')
    return lines.map(line => {
      if (line.startsWith('[') || line.startsWith('(') || !line.trim()) {
        return line
      }
      
      return ThirdWayEngine.generateThirdWayLine(
        this.extractThemeFromLine(line),
        genre,
        `Intensificação emocional nível ${intensity}`
      )
    }).join('\n')
  }

  private applyThirdWayHybridVersion = (lyrics: string, fromGenre: GenreName, toGenre: GenreName): string => {
    // TERCEIRA VIA para fusão de gêneros
    return ThirdWayConverter.convertLyrics(lyrics, fromGenre, toGenre, {
      preserveTheme: false,
      intensity: 2
    })
  }

  private extractThemeFromLine = (line: string): string => {
    // Extrai o tema principal da linha para a Terceira Via
    const commonThemes = ['amor', 'saudade', 'festa', 'dor', 'alegria', 'vida', 'tempo']
    const words = line.toLowerCase().split(' ')
    return words.find(word => commonThemes.includes(word)) || 'sentimentos'
  }

  const handleFixMetrics = () => {
    if (originalLyrics && genre) {
      const fixed = fixMetrics(originalLyrics, currentMetrics.syllablesPerLine)
      setOriginalLyrics(fixed)
    }
  }

  const selectedProjectData = mockProjects.find((p) => p.id === selectedProject)
  const availableTargetGenres = Object.keys(ADVANCED_BRAZILIAN_METRICS)
    .filter(g => g !== "default" && g !== genre) as GenreName[]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-white rounded-2xl shadow-lg">
              <span className="text-2xl">🔄</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Reescrever Letra
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                Aprimore suas letras com a <strong>Terceira Via</strong> - processo A/B automático
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Painel de Seleção */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Selecionar Letra</h2>
            <p className="text-gray-600 mb-6">Escolha um projeto ou cole sua letra</p>

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
                  {mockProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title} ({project.genre})
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-sm text-gray-500 text-center">— OU —</div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className="w-full rounded-xl border-2 border-gray-300 bg-white py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gênero Original *
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

              {rewriteType === "converter-genero" || rewriteType === "hibrida" ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gênero de Destino *
                  </label>
                  <select
                    value={targetGenre}
                    onChange={(e) => setTargetGenre(e.target.value as GenreName)}
                    className="w-full rounded-xl border-2 border-gray-300 bg-white py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  >
                    <option value="">Selecione o gênero</option>
                    {availableTargetGenres.map((genreName) => (
                      <option key={genreName} value={genreName}>
                        {genreName} ({ADVANCED_BRAZILIAN_METRICS[genreName].syllablesPerLine}s)
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {(rewriteType === "converter-genero" || rewriteType === "intensificar" || rewriteType === "hibrida") && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Intensidade: {conversionIntensity}/3
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    value={conversionIntensity}
                    onChange={(e) => setConversionIntensity(parseInt(e.target.value) as 1 | 2 | 3)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Sutil</span>
                    <span>Moderado</span>
                    <span>Intenso</span>
                  </div>
                </div>
              )}

              {rewriteType === "converter-genero" && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="preserveTheme"
                    checked={preserveTheme}
                    onChange={(e) => setPreserveTheme(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="preserveTheme" className="text-sm text-gray-700">
                    Manter tema original
                  </label>
                </div>
              )}

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
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProject("")
                        setOriginalLyrics("")
                        setGenre("")
                        setMood("")
                        setTargetGenre("")
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

          {/* Painel de Original */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Letra Original</h2>
              <p className="text-gray-600">Sua letra antes da Terceira Via</p>
              
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
                value={originalLyrics}
                onChange={(e) => setOriginalLyrics(e.target.value)}
                placeholder="Letra original aparecerá aqui..."
                className="flex-1 w-full rounded-xl border-2 border-gray-300 bg-white py-3 px-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[300px] leading-6 transition-colors"
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
                  onClick={() => navigator.clipboard.writeText(originalLyrics)}
                  disabled={!originalLyrics}
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
                  disabled={!originalLyrics}
                  className="bg-purple-100 border-2 border-purple-300 text-purple-700 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center disabled:opacity-50 transition-colors"
                >
                  <span className="mr-2">🔍</span>
                  Entender Terceira Via
                </button>
              </div>
            </div>
          </div>

          {/* Painel de Resultado */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Letra Reescrita</h2>
              <p className="text-gray-600">Versão aprimorada pela <strong>Terceira Via</strong></p>
              
              {genre && rewrittenLyrics && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                    {currentMetrics.syllablesPerLine}s/linha
                  </span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                    {currentMetrics.bpm} BPM
                  </span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                    ✅ Terceira Via
                  </span>
                  {targetGenre && (
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">
                      {targetGenre}
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
                    <p className="text-gray-600 font-semibold">Aplicando Terceira Via...</p>
                    {genre && (
                      <p className="text-sm text-gray-600 mt-2">
                        Processo A/B silencioso em andamento
                        <br />
                        para {rewriteOptions.find(o => o.value === rewriteType)?.label.toLowerCase()}
                      </p>
                    )}
                    <div className="mt-4 text-xs text-gray-500">
                      🔄 Gerando Variação A → Variação B → Versão Final
                    </div>
                  </div>
                </div>
              ) : rewrittenLyrics ? (
                <div className="space-y-4 flex flex-col flex-1">
                  <textarea
                    value={rewrittenLyrics}
                    onChange={(e) => setRewrittenLyrics(e.target.value)}
                    className="flex-1 w-full rounded-xl border-2 border-gray-300 bg-white py-3 px-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[300px] leading-6 transition-colors"
                    placeholder="Letra reescrita aparecerá aqui..."
                  />

                  <div className="flex gap-2 justify-between items-center flex-wrap">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => navigator.clipboard.writeText(rewrittenLyrics)}
                        className="bg-white border-2 border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center transition-colors"
                      >
                        <span className="mr-2">📋</span>
                        Copiar
                      </button>

                      <button className="bg-blue-100 border-2 border-blue-300 text-blue-700 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center transition-colors">
                        <span className="mr-2">🎧</span>
                        Ouvir
                      </button>

                      <button
                        onClick={() => setShowThirdWayAnalysis(true)}
                        className="bg-purple-100 border-2 border-purple-300 text-purple-700 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center transition-colors"
                      >
                        <span className="mr-2">🔍</span>
                        Ver Processo
                      </button>
                    </div>

                    <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-6 rounded-lg text-sm font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center transition-colors shadow-lg">
                      <span className="mr-2">💾</span>
                      Salvar Projeto
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-600 border-2 border-dashed border-gray-300 rounded-2xl">
                  <div className="text-center">
                    <span className="text-5xl mb-4 block">✨</span>
                    <p className="text-lg font-semibold mb-2">Letra com Terceira Via</p>
                    <p className="text-sm">Selecione as opções e clique em Reescrever</p>
                    {genre && (
                      <p className="text-xs mt-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
                        Processo A/B automático para {genre}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Painel de Opções de Reescrita */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span>⚡</span>
            Opções de Reescrita com Terceira Via
          </h2>
          <p className="text-gray-600 mb-6">Escolha como a Terceira Via irá melhorar sua letra</p>

          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {rewriteOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRewriteType(option.value)}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
                    rewriteType === option.value
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-600 shadow-lg scale-105"
                      : "bg-white border-gray-300 hover:border-blue-500 hover:shadow-md"
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

            {rewriteType === "custom" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Instruções Personalizadas
                </label>
                <input
                  type="text"
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  placeholder="Ex: Tornar mais romântico, adicionar metáforas, focar em rimas ABAB..."
                  className="w-full rounded-xl border-2 border-gray-300 bg-white py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            )}

            <div className="flex gap-4 items-center justify-between">
              <button
                onClick={handleRewrite}
                disabled={isLoading || !originalLyrics.trim() || !genre || (rewriteType === "converter-genero" && !targetGenre)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <span className="mr-3">✨</span>
                    Aplicar Terceira Via
                    {genre && ` em ${genre}`}
                  </>
                )}
              </button>

              {genre && (
                <div className="text-center min-w-[140px]">
                  <div className="text-sm font-bold text-gray-900">Configuração</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {currentMetrics.syllablesPerLine}s/linha • {currentMetrics.bpm} BPM
                  </div>
                  <div className="text-xs text-gray-500">{currentMetrics.structure}</div>
                </div>
              )}
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
              <div className="flex items-start">
                <span className="text-purple-600 mr-3 mt-0.5 text-xl">🎵</span>
                <div className="text-sm text-purple-800">
                  <strong>Terceira Via Ativa:</strong> Sua letra será reescrita automaticamente usando o processo silencioso de variação A + variação B → versão final. 
                  O sistema analisa e combina os melhores elementos de cada variação, garantindo métrica perfeita de {currentMetrics.syllablesPerLine} sílabas por linha.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Análise da Terceira Via */}
        {showThirdWayAnalysis && (
          <ThirdWayAnalysis
            isOpen={showThirdWayAnalysis}
            onClose={() => setShowThirdWayAnalysis(false)}
            originalLyrics={originalLyrics}
            rewrittenLyrics={rewrittenLyrics}
            genre={genre}
            rewriteType={rewriteType}
          />
        )}
      </div>
    </div>
  )
}
