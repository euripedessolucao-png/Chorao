// app/editar/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Wand, RefreshCw, Zap, Lightbulb, Copy, Save, Music, AlertTriangle, CheckCircle, Sparkles } from "lucide-react"
import { ADVANCED_BRAZILIAN_METRICS, type GenreName, validateMetrics, fixMetrics, ThirdWayEngine } from "@/lib/third-way-converter"
import { ThirdWayAnalysis } from "@/components/third-way-analysis"

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

// Mock data - substitua pela sua API real
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

const improvementOptions = [
  { 
    value: "terceira-via", 
    label: "Terceira Via", 
    description: "Processo A/B automático completo",
    icon: "🔄"
  },
  { 
    value: "metricas", 
    label: "Otimizar Métricas", 
    description: "Terceira Via focada em sílabas",
    icon: "📊"
  },
  { 
    value: "rimas", 
    label: "Melhorar Rimas", 
    description: "Terceira Via nas conexões poéticas",
    icon: "🎵"
  },
  { 
    value: "emocao", 
    label: "Intensificar Emoção", 
    description: "Terceira Via no impacto emocional",
    icon: "💫"
  },
  { 
    value: "comercial", 
    label: "Versão Comercial", 
    description: "Terceira Via com apelo de massa",
    icon: "💰"
  },
  { 
    value: "custom", 
    label: "Personalizado", 
    description: "Terceira Via com instruções",
    icon: "🎯"
  },
]

export default function EditarPage() {
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [lyrics, setLyrics] = useState("")
  const [genre, setGenre] = useState<GenreName | "">("")
  const [mood, setMood] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [improvementType, setImprovementType] = useState("terceira-via")
  const [customInstruction, setCustomInstruction] = useState("")
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [showThirdWayAnalysis, setShowThirdWayAnalysis] = useState(false)
  const [improvementIntensity, setImprovementIntensity] = useState<1 | 2 | 3>(2)

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
    const project = mockProjects.find((p) => p.id === projectId)
    if (project) {
      setSelectedProject(projectId)
      setLyrics(project.lyrics)
      setGenre(project.genre as GenreName)
      setMood(project.mood)
    }
  }

  // MÉTODOS DA TERCEIRA VIA PARA EDIÇÃO (convertidos para funções)
  const applyThirdWayComplete = (lyrics: string, genre: GenreName, intensity: number): string => {
    const lines = lyrics.split('\n')
    return lines.map(line => {
      if (line.startsWith('[') || line.startsWith('(') || !line.trim()) {
        return line
      }
      // TERCEIRA VIA COMPLETA
      return ThirdWayEngine.generateThirdWayLine(
        extractThemeFromLine(line),
        genre,
        `Edição completa - Intensidade ${intensity}`
      )
    }).join('\n')
  }

  const applyThirdWayMetrics = (lyrics: string, genre: GenreName): string => {
    const lines = lyrics.split('\n')
    return lines.map(line => {
      if (line.startsWith('[') || line.startsWith('(') || !line.trim()) {
        return line
      }
      // TERCEIRA VIA focada em métrica
      return ThirdWayEngine.generateThirdWayLine(
        extractThemeFromLine(line),
        genre,
        "Otimização métrica - Terceira Via"
      )
    }).join('\n')
  }

  const applyThirdWayRhymes = (lyrics: string, genre: GenreName): string => {
    const lines = lyrics.split('\n')
    const optimizedLines = lines.map((line, index) => {
      if (line.startsWith('[') || line.startsWith('(') || !line.trim()) {
        return line
      }
      
      // TERCEIRA VIA para rimas
      const context = index > 0 ? lines[index - 1] : ""
      return ThirdWayEngine.generateThirdWayLine(
        extractThemeFromLine(line),
        genre,
        `Melhoria de rimas - Contexto: ${context}`
      )
    })
    
    return optimizedLines.join('\n')
  }

  const applyThirdWayEmotion = (lyrics: string, genre: GenreName, intensity: number): string => {
    const lines = lyrics.split('\n')
    return lines.map(line => {
      if (line.startsWith('[') || line.startsWith('(') || !line.trim()) {
        return line
      }
      
      return ThirdWayEngine.generateThirdWayLine(
        extractThemeFromLine(line),
        genre,
        `Intensificação emocional - Nível ${intensity}`
      )
    }).join('\n')
  }

  const applyThirdWayCommercial = (lyrics: string, genre: GenreName): string => {
    const lines = lyrics.split('\n')
    return lines.map(line => {
      if (line.startsWith('[') || line.startsWith('(') || !line.trim()) {
        return line
      }
      
      return ThirdWayEngine.generateThirdWayLine(
        extractThemeFromLine(line),
        genre,
        "Versão comercial - Apelo de massa"
      )
    }).join('\n')
  }

  const applyThirdWayCustom = (lyrics: string, genre: GenreName, instruction: string): string => {
    const lines = lyrics.split('\n')
    return lines.map(line => {
      if (line.startsWith('[') || line.startsWith('(') || !line.trim()) {
        return line
      }
      
      return ThirdWayEngine.generateThirdWayLine(
        extractThemeFromLine(line),
        genre,
        `Personalizado: ${instruction}`
      )
    }).join('\n')
  }

  const extractThemeFromLine = (line: string): string => {
    const commonThemes = ['amor', 'saudade', 'festa', 'dor', 'alegria', 'vida', 'tempo']
    const words = line.toLowerCase().split(' ')
    return words.find(word => commonThemes.includes(word)) || 'sentimentos'
  }

  // FUNÇÃO PRINCIPAL DE MELHORIA COM TERCEIRA VIA
  const handleImprove = async () => {
    if (!lyrics.trim()) {
      alert("Cole ou selecione uma letra para editar")
      return
    }

    if (!genre) {
      alert("Selecione o gênero musical")
      return
    }

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      let improvedLyrics = lyrics

      // APLICAÇÃO DA TERCEIRA VIA CONFORME O TIPO SELECIONADO
      switch (improvementType) {
        case "terceira-via":
          improvedLyrics = applyThirdWayComplete(lyrics, genre, improvementIntensity)
          improvedLyrics += `\n\n---\n✅ TERCEIRA VIA COMPLETA APLICADA\n• Processo A/B automático em todas as linhas\n• Intensidade: ${improvementIntensity}/3\n• Métrica garantida: ${currentMetrics.syllablesPerLine} sílabas`
          break
        case "metricas":
          improvedLyrics = applyThirdWayMetrics(lyrics, genre)
          improvedLyrics += `\n\n---\n✅ TERCEIRA VIA - MÉTRICA OTIMIZADA\n• Sílabas ajustadas para ${currentMetrics.syllablesPerLine}/linha\n• Processo silencioso: Variação A + B → Versão Final\n• Ritmo mantido em ${currentMetrics.bpm} BPM`
          break
        case "rimas":
          improvedLyrics = applyThirdWayRhymes(lyrics, genre)
          improvedLyrics += `\n\n---\n✅ TERCEIRA VIA - RIMAS APRIMORADAS\n• Conexões poéticas enriquecidas\n• Fluência natural preservada\n• Sonoridade harmoniosa`
          break
        case "emocao":
          improvedLyrics = applyThirdWayEmotion(lyrics, genre, improvementIntensity)
          improvedLyrics += `\n\n---\n✅ TERCEIRA VIA - EMOÇÃO INTENSIFICADA\n• Impacto emocional amplificado\n• Linguagem mais expressiva\n• Intensidade: ${improvementIntensity}/3`
          break
        case "comercial":
          improvedLyrics = applyThirdWayCommercial(lyrics, genre)
          improvedLyrics += `\n\n---\n✅ TERCEIRA VIA - VERSÃO COMERCIAL\n• Apelo de massa otimizado\n• Estrutura A/B analisada e combinada\n• Potencial de viralidade aumentado`
          break
        case "custom":
          improvedLyrics = applyThirdWayCustom(lyrics, genre, customInstruction)
          improvedLyrics += `\n\n---\n✅ TERCEIRA VIA - PERSONALIZADA\n${customInstruction || "Instruções aplicadas com processo A/B"}`
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

  const handleFixMetrics = () => {
    if (lyrics && genre) {
      const fixed = fixMetrics(lyrics, currentMetrics.syllablesPerLine)
      setLyrics(fixed)
    }
  }

  const handleSaveProject = () => {
    if (!lyrics) {
      alert("Por favor, adicione uma letra antes de salvar")
      return
    }
    
    // Simulação de salvamento
    const projectTitle = selectedProject 
      ? mockProjects.find(p => p.id === selectedProject)?.title 
      : "Projeto Editado"
    
    alert(`Projeto "${projectTitle}" salvo com sucesso!`)
    console.log("Projeto salvo:", { 
      title: projectTitle, 
      genre, 
      mood, 
      lyrics,
      thirdWayApplied: true 
    })
  }

  const selectedProjectData = mockProjects.find((p) => p.id === selectedProject)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Navigation />
      <div className="w-full px-4 sm:px-6 md:px-8 py-8 pt-24 max-w-none">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-white rounded-2xl shadow-lg">
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Editar com Terceira Via
              </h1>
              <p className="text-xl text-gray-600 mt-2 max-w-2xl mx-auto">
                Use o processo A/B automático para aprimorar suas letras com métrica perfeita
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Painel de Seleção */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-2xl">Selecionar Projeto</CardTitle>
              <CardDescription>Escolha um projeto existente ou cole uma letra</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div>
                <Label htmlFor="project-select" className="text-gray-700 font-semibold">Projetos Salvos</Label>
                <Select value={selectedProject} onValueChange={handleProjectSelect}>
                  <SelectTrigger id="project-select" className="w-full rounded-xl border-2">
                    <SelectValue placeholder="Selecione um projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{project.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {project.genre}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-gray-500 text-center">— OU —</div>

              <div>
                <Label htmlFor="lyrics-input" className="text-gray-700 font-semibold">Cole sua letra</Label>
                <Textarea
                  id="lyrics-input"
                  placeholder="Cole a letra que deseja editar aqui..."
                  value={!selectedProject ? lyrics : ""}
                  onChange={(e) => {
                    if (!selectedProject) setLyrics(e.target.value)
                  }}
                  disabled={!!selectedProject}
                  className="min-h-[100px] rounded-xl border-2"
                />
              </div>

              <div>
                <Label htmlFor="genre-select" className="text-gray-700 font-semibold">Gênero Musical</Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger id="genre-select" className="w-full rounded-xl border-2">
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(ADVANCED_BRAZILIAN_METRICS)
                      .filter((g) => g !== "default")
                      .map((genreName) => (
                        <SelectItem key={genreName} value={genreName}>
                          {genreName} ({ADVANCED_BRAZILIAN_METRICS[genreName as GenreName].syllablesPerLine}s)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProjectData && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{selectedProjectData.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                          {selectedProjectData.genre}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {selectedProjectData.mood}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedProject("")
                        setLyrics("")
                        setGenre("")
                        setMood("")
                      }}
                    >
                      Trocar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </div>

          {/* Painel de Edição */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:col-span-2 flex flex-col">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-2xl">Editor com Terceira Via</CardTitle>
              <CardDescription>Edite sua letra e use a Terceira Via para melhorias automáticas</CardDescription>
              
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
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                    ✅ Terceira Via
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0 space-y-4 flex flex-col flex-1">
              <Textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Sua letra aparecerá aqui... Ou cole uma letra no campo ao lado."
                className="min-h-[300px] font-mono text-sm flex-1 rounded-xl border-2"
              />

              {/* Análise de Métrica em Tempo Real */}
              {validationResult && (
                <div className={`p-4 rounded-xl border-2 ${
                  validationResult.isValid 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {validationResult.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    )}
                    <span className={`font-bold ${
                      validationResult.isValid 
                        ? 'text-green-800' 
                        : 'text-yellow-800'
                    }`}>
                      {validationResult.isValid 
                        ? 'Métrica Perfeita!' 
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
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  onClick={() => navigator.clipboard.writeText(lyrics)} 
                  disabled={!lyrics}
                  className="flex items-center gap-2 rounded-lg border-2"
                >
                  <Copy className="h-4 w-4" />
                  Copiar
                </Button>
                
                {validationResult && !validationResult.isValid && (
                  <Button 
                    variant="outline" 
                    onClick={handleFixMetrics}
                    className="flex items-center gap-2 bg-yellow-100 border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-200 rounded-lg"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Corrigir Métrica
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowThirdWayAnalysis(true)}
                  disabled={!lyrics}
                  className="flex items-center gap-2 bg-purple-100 border-2 border-purple-300 text-purple-700 hover:bg-purple-200 rounded-lg"
                >
                  <Sparkles className="h-4 w-4" />
                  Ver Terceira Via
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => setLyrics("")} 
                  className="flex items-center gap-2 rounded-lg border-2"
                >
                  Limpar
                </Button>
              </div>
            </CardContent>
          </div>
        </div>

        {/* Painel de Melhorias com Terceira Via */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mt-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-500" />
              Terceira Via - Melhorias Automáticas
            </CardTitle>
            <CardDescription>Escolha o tipo de melhoria com processo A/B automático</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {improvementOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={improvementType === option.value ? "default" : "outline"}
                  className={`h-auto py-3 flex flex-col items-center gap-2 transition-all rounded-xl ${
                    improvementType === option.value 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                      : "border-2"
                  }`}
                  onClick={() => setImprovementType(option.value)}
                >
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-xs font-semibold">{option.label}</span>
                  <span className="text-xs text-muted-foreground hidden lg:block">{option.description}</span>
                </Button>
              ))}
            </div>

            {/* Controles de Intensidade */}
            {(improvementType === "terceira-via" || improvementType === "emocao") && (
              <div className="border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-gray-700 font-semibold">Intensidade: {improvementIntensity}/3</Label>
                  <div className="text-sm text-gray-500">
                    {improvementIntensity === 1 && "Sutil"}
                    {improvementIntensity === 2 && "Moderado"}  
                    {improvementIntensity === 3 && "Intenso"}
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  value={improvementIntensity}
                  onChange={(e) => setImprovementIntensity(parseInt(e.target.value) as 1 | 2 | 3)}
                  className="w-full"
                />
              </div>
            )}

            {improvementType === "custom" && (
              <div>
                <Label htmlFor="custom-instruction" className="text-gray-700 font-semibold">Instruções para Terceira Via</Label>
                <Input
                  id="custom-instruction"
                  placeholder="Ex: Tornar mais romântico, adicionar metáforas, focar em rimas ABAB..."
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  className="rounded-xl border-2"
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                onClick={handleImprove} 
                disabled={isLoading || !lyrics.trim() || !genre}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center gap-2 rounded-xl text-lg font-bold py-4 shadow-lg hover:shadow-xl transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Aplicando Terceira Via...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Aplicar Terceira Via
                    {genre && ` em ${genre}`}
                  </>
                )}
              </Button>

              <Button 
                variant="outline" 
                className="flex items-center gap-2 rounded-xl border-2 py-4"
                onClick={handleSaveProject}
              >
                <Save className="h-5 w-5" />
                Salvar
              </Button>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-purple-800">
                  <strong>Terceira Via Ativa:</strong> Cada melhoria aplica automaticamente o processo de variação A + variação B → versão final. 
                  {genre && ` Para ${genre}, a métrica ideal é ${currentMetrics.syllablesPerLine} sílabas por linha.`}
                </div>
              </div>
            </div>
          </CardContent>
        </div>

        {/* Ações Rápidas com Terceira Via */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mt-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Melhorias Rápidas com Terceira Via
            </CardTitle>
            <CardDescription>Ações instantâneas aplicando processo A/B automático</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button 
                variant="outline" 
                className="flex flex-col h-auto py-4 bg-transparent hover:bg-gray-50 rounded-xl border-2"
                onClick={() => {
                  setImprovementType("metricas")
                  handleImprove()
                }}
              >
                <Music className="h-5 w-5 mb-2 text-blue-600" />
                <span className="text-xs font-semibold">Analisar Métrica</span>
                <span className="text-xs text-gray-500 mt-1">Terceira Via</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col h-auto py-4 bg-transparent hover:bg-gray-50 rounded-xl border-2"
                onClick={() => {
                  setImprovementType("rimas")
                  handleImprove()
                }}
              >
                <RefreshCw className="h-5 w-5 mb-2 text-green-600" />
                <span className="text-xs font-semibold">Reescrever Refrão</span>
                <span className="text-xs text-gray-500 mt-1">Terceira Via</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col h-auto py-4 bg-transparent hover:bg-gray-50 rounded-xl border-2"
                onClick={() => {
                  setImprovementType("comercial") 
                  handleImprove()
                }}
              >
                <Zap className="h-5 w-5 mb-2 text-yellow-600" />
                <span className="text-xs font-semibold">Otimizar Hook</span>
                <span className="text-xs text-gray-500 mt-1">Terceira Via</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col h-auto py-4 bg-transparent hover:bg-gray-50 rounded-xl border-2"
                onClick={handleSaveProject}
              >
                <Save className="h-5 w-5 mb-2 text-purple-600" />
                <span className="text-xs font-semibold">Salvar Versão</span>
                <span className="text-xs text-gray-500 mt-1">Com Terceira Via</span>
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
      <Footer />

      {/* Modal de Análise da Terceira Via */}
      {showThirdWayAnalysis && (
        <ThirdWayAnalysis
          isOpen={showThirdWayAnalysis}
          onClose={() => setShowThirdWayAnalysis(false)}
          originalLyrics={selectedProjectData?.lyrics || ""}
          rewrittenLyrics={lyrics}
          genre={genre}
          rewriteType={improvementType}
        />
      )}
    </div>
  )
}
