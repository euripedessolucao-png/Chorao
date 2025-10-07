// app/criar/page.tsx
"use client"

import type React from "react"
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
    mood: "apaixonado"
  },
  {
    id: "2", 
    title: "Noite Estrelada",
    genre: "MPB",
    lyrics: "[VERSO 1]\nA noite caiu sobre a cidade\nCom suas luzes a brilhar\n\n[REFRAO]\nSob o céu estrelado\nMeu coração se entregou",
    mood: "nostalgico"
  }
]

// Opções avançadas de criação
const creationStyles = [
  {
    value: "traditional",
    label: "Tradicional",
    description: "Estrutura clássica do gênero",
    icon: "🏛️"
  },
  {
    value: "commercial", 
    label: "Comercial",
    description: "Apelo de massa com Terceira Via",
    icon: "💰"
  },
  {
    value: "emotional",
    label: "Emocional",
    description: "Foco em sentimentos profundos",
    icon: "💖"
  },
  {
    value: "experimental",
    label: "Experimental",
    description: "Inovação com base sólida",
    icon: "🔬"
  }
]

export default function CreatePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [generatedLyrics, setGeneratedLyrics] = useState("")
  const [title, setTitle] = useState("")
  const [genre, setGenre] = useState<GenreName | "">("")
  const [theme, setTheme] = useState("")
  const [mood, setMood] = useState("")
  const [creativityLevel, setCreativityLevel] = useState("equilibrado")
  const [creationStyle, setCreationStyle] = useState("traditional")
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [selectedProject, setSelectedProject] = useState("")
  const [useProjectAsBase, setUseProjectAsBase] = useState(false)
  const [showThirdWayAnalysis, setShowThirdWayAnalysis] = useState(false)
  const [advancedOptions, setAdvancedOptions] = useState({
    useInspirations: true,
    generateChorus: true,
    includeMetaphors: true,
    emotionalIntensity: 2 as 1 | 2 | 3
  })

  const genres = Object.keys(ADVANCED_BRAZILIAN_METRICS).filter((g) => g !== "default")
  const currentMetrics = genre ? ADVANCED_BRAZILIAN_METRICS[genre] : ADVANCED_BRAZILIAN_METRICS.default

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

  // Carregar projeto selecionado
  useEffect(() => {
    if (selectedProject && useProjectAsBase) {
      const project = mockUserProjects.find(p => p.id === selectedProject)
      if (project) {
        setGenre(project.genre as GenreName)
        setMood(project.mood)
        setTitle(project.title + " - Nova Versão")
        setGeneratedLyrics(project.lyrics)
      }
    }
  }, [selectedProject, useProjectAsBase])

  // GERADOR DE VERSO COM TERCEIRA VIA
  const generateVerseWithThirdWay = (
    theme: string, 
    genre: GenreName, 
    mood: string,
    options: typeof advancedOptions
  ): string => {
    const lines = []
    const lineCount = genre.includes("Sertanejo") ? 4 : 3
    
    for (let i = 0; i < lineCount; i++) {
      // TERCEIRA VIA SILENCIOSA aplicada em cada linha
      const line = ThirdWayEngine.generateThirdWayLine(
        theme,
        genre,
        `Verso ${i + 1} - ${mood} - Intensidade ${options.emotionalIntensity}`
      )
      lines.push(line)
    }
    
    return lines.join('\n')
  }

  // GERADOR DE REFRÃO COM TERCEIRA VIA
  const generateChorusWithThirdWay = (
    theme: string,
    genre: GenreName,
    mood: string,
    options: typeof advancedOptions
  ): string => {
    if (!options.generateChorus) return "(Refrão opcional)"

    const lines = []
    const lineCount = 4 // Refrão geralmente tem 4 linhas
    
    for (let i = 0; i < lineCount; i++) {
      // TERCEIRA VIA para refrão memorável
      const line = ThirdWayEngine.generateThirdWayLine(
        theme,
        genre, 
        `Refrão ${i + 1} - ${mood} - Comercial: ${options.emotionalIntensity}`
      )
      lines.push(line)
    }
    
    return lines.join('\n')
  }

  // GERADOR DE PONTE COM TERCEIRA VIA
  const generateBridgeWithThirdWay = (
    theme: string,
    genre: GenreName,
    mood: string,
    options: typeof advancedOptions
  ): string => {
    const lines = []
    const lineCount = 2 // Ponte geralmente mais curta
    
    for (let i = 0; i < lineCount; i++) {
      // TERCEIRA VIA para contraste emocional
      const line = ThirdWayEngine.generateThirdWayLine(
        theme,
        genre,
        `Ponte ${i + 1} - Contraste - ${mood}`
      )
      lines.push(line)
    }
    
    return lines.join('\n')
  }

  // GERADOR DE SOLO/INSTRUMENTAL
  const generateSoloWithThirdWay = (
    theme: string,
    genre: GenreName,
    options: typeof advancedOptions
  ): string => {
    return `(Instrumental - ${genre})\n(Mantendo ritmo de ${currentMetrics.bpm} BPM)`
  }

  // GERADOR COM TERCEIRA VIA COMPLETA
  const generateWithThirdWay = (
    theme: string, 
    genre: GenreName, 
    mood: string, 
    style: string,
    options: typeof advancedOptions
  ): string => {
    const structure = currentMetrics.structure.split('-')
    let lyrics = ""

    structure.forEach(section => {
      lyrics += `[${section}]\n`
      
      switch (section) {
        case 'VERSO':
          lyrics += generateVerseWithThirdWay(theme, genre, mood, options) + "\n\n"
          break
        case 'REFRAO':
          lyrics += generateChorusWithThirdWay(theme, genre, mood, options) + "\n\n"
          break
        case 'PONTE':
          lyrics += generateBridgeWithThirdWay(theme, genre, mood, options) + "\n\n"
          break
        case 'SOLO':
          lyrics += generateSoloWithThirdWay(theme, genre, options) + "\n\n"
          break
      }
    })

    return lyrics.trim()
  }

  // GERADOR DE TÍTULO INTELIGENTE
  const generateTitle = (theme: string, genre: GenreName, mood: string): string => {
    const themes: Record<string, string[]> = {
      "Sertanejo Moderno": ["Meu Amor", "Nossa História", "Do Jeito Que É"],
      "Sertanejo Universitário": ["Balada", "Festa", "Momento"], 
      "Sertanejo Sofrência": ["Despedida", "Lembranças", "Adeus"],
      "Pagode": ["Samba", "Felicidade", "Encontro"],
      "Funk": ["Pancadão", "Vibração", "Noite"],
      "MPB": ["Caminhos", "Vida", "Tempo"]
    }
    
    const genreTitles = themes[genre] || ["Minha Música", "Canção", "Melodia"]
    const randomTitle = genreTitles[Math.floor(Math.random() * genreTitles.length)]
    
    return `${randomTitle} de ${theme}`
  }

  // FUNÇÃO PRINCIPAL DE CRIAÇÃO COM TERCEIRA VIA
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!genre || !theme) {
      alert("Por favor, preencha o gênero e o tema")
      return
    }

    setIsLoading(true)
    setGeneratedLyrics("")

    try {
      // Simulação de geração com Terceira Via
      await new Promise(resolve => setTimeout(resolve, 2500))

      // GERAÇÃO COM TERCEIRA VIA AUTOMÁTICA
      let letra = generateWithThirdWay(theme, genre, mood, creationStyle, advancedOptions)
      
      setGeneratedLyrics(letra)
      setTitle(generateTitle(theme, genre, mood))
      
    } catch (error) {
      console.error("Erro ao gerar letra:", error)
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

  const handleSaveProject = () => {
    if (!title || !generatedLyrics) {
      alert("Por favor, gere uma letra antes de salvar")
      return
    }
    
    // Simulação de salvamento
    alert(`Projeto "${title}" salvo com sucesso!`)
    console.log("Projeto salvo:", { 
      title, 
      genre, 
      mood, 
      lyrics: generatedLyrics,
      thirdWayApplied: true 
    })
  }

  const handleUseProjectTemplate = (projectId: string) => {
    setSelectedProject(projectId)
    setUseProjectAsBase(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 bg-white rounded-2xl shadow-lg">
              <span className="text-3xl">🎵</span>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Criar Nova Letra
              </h1>
              <p className="text-xl text-gray-600 mt-3">
                Composição inteligente com <strong>Terceira Via</strong> automática
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Painel de Projetos (Sidebar) */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📁</span>
              Meus Projetos
            </h2>
            <p className="text-gray-600 mb-6">Use como inspiração para Terceira Via</p>

            <div className="space-y-3 mb-6">
              {mockUserProjects.map((project) => (
                <div
                  key={project.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedProject === project.id 
                      ? "border-green-500 bg-green-50" 
                      : "border-gray-200 hover:border-green-300"
                  }`}
                  onClick={() => handleUseProjectTemplate(project.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {project.genre}
                        </span>
                        <span className="text-xs text-gray-500">{project.mood}</span>
                      </div>
                    </div>
                    {selectedProject === project.id && (
                      <span className="text-green-500">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-xl mt-0.5">💡</span>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-1">Terceira Via Ativa</h4>
                  <p className="text-sm text-blue-700">
                    Todo projeto novo aplica automaticamente o processo A/B → Versão Final
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Painel de Parâmetros */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuração</h2>
            <p className="text-gray-600 mb-6">Defina os parâmetros da composição</p>

            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Gênero Musical *
                </label>
                <select
                  value={genre}
                  onChange={(e) => {
                    setGenre(e.target.value as GenreName)
                    setUseProjectAsBase(false)
                  }}
                  className="w-full rounded-xl border-2 border-gray-300 bg-white py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="">Escolha o gênero</option>
                  {genres.map((genreName) => (
                    <option key={genreName} value={genreName}>
                      {genreName} ({ADVANCED_BRAZILIAN_METRICS[genreName as GenreName].syllablesPerLine}s)
                    </option>
                  ))}
                </select>

                {genre && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                      <span>🎯</span>
                      Regras do {genre}
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-blue-600 font-semibold">Métrica</div>
                        <div className="text-blue-800 font-bold text-lg">{currentMetrics.syllablesPerLine}s/linha</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-green-600 font-semibold">Ritmo</div>
                        <div className="text-green-800 font-bold text-lg">{currentMetrics.bpm} BPM</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg col-span-2">
                        <div className="text-purple-600 font-semibold">Estrutura</div>
                        <div className="text-purple-800 font-bold">{currentMetrics.structure}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tema da Música *
                </label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Ex: amor não correspondido, saudade da infância, superação..."
                  className="w-full rounded-xl border-2 border-gray-300 bg-white py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Estilo de Criação
                  </label>
                  <select
                    value={creationStyle}
                    onChange={(e) => setCreationStyle(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-300 bg-white py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {creationStyles.map(style => (
                      <option key={style.value} value={style.value}>
                        {style.icon} {style.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Opções Avançadas */}
              <div className="border-2 border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>⚙️</span>
                  Opções Avançadas
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700">Intensidade Emocional</label>
                    <select
                      value={advancedOptions.emotionalIntensity}
                      onChange={(e) => setAdvancedOptions(prev => ({
                        ...prev,
                        emotionalIntensity: parseInt(e.target.value) as 1 | 2 | 3
                      }))}
                      className="rounded-lg border border-gray-300 py-1 px-2 text-sm"
                    >
                      <option value={1}>Suave</option>
                      <option value={2}>Moderado</option>
                      <option value={3}>Intenso</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="generateChorus"
                      checked={advancedOptions.generateChorus}
                      onChange={(e) => setAdvancedOptions(prev => ({
                        ...prev,
                        generateChorus: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="generateChorus" className="text-sm text-gray-700">
                      Gerar refrão automático
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeMetaphors"
                      checked={advancedOptions.includeMetaphors}
                      onChange={(e) => setAdvancedOptions(prev => ({
                        ...prev,
                        includeMetaphors: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="includeMetaphors" className="text-sm text-gray-700">
                      Incluir metáforas inteligentes
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !genre || !theme}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Aplicando Terceira Via...
                  </>
                ) : (
                  <>
                    <span className="mr-3 text-xl">✨</span>
                    Criar com Terceira Via
                    {genre && ` em ${genre}`}
                  </>
                )}
              </button>

              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
                <div className="flex items-start gap-3">
                  <span className="text-purple-600 text-xl mt-0.5">⚡</span>
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-2">Terceira Via Ativa</h4>
                    <p className="text-sm text-purple-700">
                      Cada linha será gerada usando o processo silencioso: 
                      <strong> Variação A → Variação B → Versão Final</strong>. 
                      Métrica garantida de {currentMetrics.syllablesPerLine} sílabas.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Painel de Resultado */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col">
            <div className="mb-6">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título da Música..."
                className="w-full text-3xl font-bold border-none focus:outline-none focus:ring-0 p-0 bg-transparent placeholder:text-gray-400"
                disabled={!generatedLyrics}
              />

              {genre && generatedLyrics && (
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                    {currentMetrics.syllablesPerLine}s/linha
                  </span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                    {currentMetrics.bpm} BPM
                  </span>
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-800">
                    {currentMetrics.structure}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                    ✅ Terceira Via
                  </span>
                  {mood && (
                    <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-800">
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
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg font-semibold">Criando com Terceira Via...</p>
                    {genre && (
                      <p className="text-sm text-gray-600 mt-2">
                        Processo A/B silencioso em andamento
                        <br />
                        para {genre} com {currentMetrics.syllablesPerLine} sílabas
                      </p>
                    )}
                    <div className="mt-4 text-xs text-gray-500">
                      🔄 Gerando Variação A → Variação B → Versão Final
                    </div>
                  </div>
                </div>
              ) : generatedLyrics ? (
                <div className="space-y-4 flex flex-col flex-1">
                  <textarea
                    value={generatedLyrics}
                    onChange={(e) => setGeneratedLyrics(e.target.value)}
                    className="flex-1 w-full rounded-xl border-2 border-gray-300 bg-white py-4 px-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[400px] leading-7 resize-none"
                    placeholder="Sua letra criada com Terceira Via aparecerá aqui..."
                  />

                  {/* Análise de Métrica */}
                  {validationResult && (
                    <div className={`p-4 rounded-xl border-2 ${
                      validationResult.isValid 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-yellow-50 border-yellow-200'
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`text-2xl ${
                          validationResult.isValid ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {validationResult.isValid ? '✅' : '⚠️'}
                        </span>
                        <div>
                          <span className={`font-bold text-lg ${
                            validationResult.isValid 
                              ? 'text-green-800' 
                              : 'text-yellow-800'
                          }`}>
                            {validationResult.isValid 
                              ? 'Métrica Perfeita!' 
                              : 'Ajuste Recomendado'
                            }
                          </span>
                          <p className={`text-sm ${
                            validationResult.isValid 
                              ? 'text-green-700' 
                              : 'text-yellow-700'
                          }`}>
                            {validationResult.isValid 
                              ? `Todas as ${validationResult.totalLines} linhas seguem a métrica.`
                              : `${validationResult.problematicLines?.length || 0} de ${validationResult.totalLines} linhas precisam de ajuste.`
                            }
                          </p>
                        </div>
                      </div>

                      {!validationResult.isValid && validationResult.problematicLines && (
                        <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                          {validationResult.problematicLines.slice(0, 3).map((item, index) => (
                            <div key={index} className="text-xs bg-white p-3 rounded-lg border">
                              <div className="font-mono font-semibold">{item.line.substring(0, 60)}...</div>
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

                  <div className="flex gap-3 justify-between items-center flex-wrap">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => navigator.clipboard.writeText(generatedLyrics)}
                        className="bg-white border-2 border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center transition-colors"
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
                        className="bg-purple-100 border-2 border-purple-300 text-purple-700 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center transition-colors"
                      >
                        <span className="mr-2">🔍</span>
                        Ver Terceira Via
                      </button>
                    </div>

                    <button 
                      onClick={handleSaveProject}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-6 rounded-lg text-sm font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center transition-colors shadow-lg"
                    >
                      <span className="mr-2">💾</span>
                      Salvar Projeto
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-600 border-2 border-dashed border-gray-300 rounded-2xl">
                  <div className="text-center">
                    <span className="text-6xl mb-4 block">🎵</span>
                    <p className="text-xl font-semibold mb-2">Sua letra com Terceira Via</p>
                    <p className="text-sm">Configure os parâmetros e crie sua composição!</p>
                    {genre && (
                      <p className="text-xs mt-3 bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                        Processo A/B automático para {genre}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rodapé Informativo */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mt-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center gap-3">
            <span>🚀</span>
            Criação com Terceira Via
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: "🔄", 
                title: "Processo A/B Automático", 
                desc: "Cada linha gerada através de variação A + variação B → versão final" 
              },
              { 
                icon: "🎯", 
                title: "Métrica Perfeita", 
                desc: "Garantia automática de sílabas corretas para cada gênero" 
              },
              { 
                icon: "💡", 
                title: "Qualidade Superior", 
                desc: "Combina os melhores elementos de múltiplas variações" 
              },
              { 
                icon: "⚡", 
                title: "Rápido e Silencioso", 
                desc: "Processo totalmente automático sem necessidade de configuração" 
              }
            ].map((item, index) => (
              <div key={index} className="text-center p-4">
                <div className="bg-gradient-to-br from-green-100 to-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
            <div className="flex items-start gap-4">
              <span className="text-green-600 text-2xl mt-1">💡</span>
              <div>
                <h4 className="font-bold text-green-800 text-lg mb-2">Inovação na Composição</h4>
                <p className="text-green-700">
                  A <strong>Terceira Via</strong> revoluciona a criação musical aplicando um processo de melhoria contínua 
                  em cada linha. Em vez de uma única tentativa, o sistema gera múltiplas variações, analisa seus pontos 
                  fortes e combina o melhor de cada uma, resultando em letras com qualidade superior, métrica perfeita 
                  e apelo emocional amplificado - tudo de forma totalmente automática e transparente para você.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Análise da Terceira Via */}
        {showThirdWayAnalysis && (
          <ThirdWayAnalysis
            isOpen={showThirdWayAnalysis}
            onClose={() => setShowThirdWayAnalysis(false)}
            originalLyrics=""
            rewrittenLyrics={generatedLyrics}
            genre={genre}
            rewriteType="criacao"
          />
        )}
      </div>
    </div>
  )
}
