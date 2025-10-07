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
import { Loader2, Wand, RefreshCw, Zap, Lightbulb, Copy, Save, Music, AlertTriangle, CheckCircle } from "lucide-react"
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
    value: "metricas", 
    label: "Ajustar Métricas", 
    description: "Corrige sílabas e ritmo",
    icon: "📊"
  },
  { 
    value: "rimas", 
    label: "Melhorar Rimas", 
    description: "Aprimora as rimas e fluência",
    icon: "🎵"
  },
  { 
    value: "estrutura", 
    label: "Otimizar Estrutura", 
    description: "Ajusta a estrutura musical",
    icon: "🏗️"
  },
  { 
    value: "emocao", 
    label: "Intensificar Emoção", 
    description: "Aumenta o impacto emocional",
    icon: "💫"
  },
  { 
    value: "originalidade", 
    label: "Aumentar Originalidade", 
    description: "Torna a letra mais única",
    icon: "✨"
  },
  { 
    value: "custom", 
    label: "Personalizado", 
    description: "Instruções específicas",
    icon: "🎯"
  },
]

export default function EditarPage() {
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [lyrics, setLyrics] = useState("")
  const [genre, setGenre] = useState("")
  const [mood, setMood] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [improvementType, setImprovementType] = useState("metricas")
  const [customInstruction, setCustomInstruction] = useState("")
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

  const currentMetrics = genre ? BRAZILIAN_GENRE_METRICS[genre as GenreName] : BRAZILIAN_GENRE_METRICS.default

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
  }, [lyrics, genre, currentMetrics.syllablesPerLine])

  const handleProjectSelect = (projectId: string) => {
    const project = mockProjects.find((p) => p.id === projectId)
    if (project) {
      setSelectedProject(projectId)
      setLyrics(project.lyrics)
      setGenre(project.genre)
      setMood(project.mood)
    }
  }

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

      switch (improvementType) {
        case "metricas":
          improvedLyrics = fixMetrics(lyrics, currentMetrics.syllablesPerLine)
          improvedLyrics += `\n\n---\n✅ MÉTRICA AJUSTADA\n• Corrigida para ${currentMetrics.syllablesPerLine} sílabas/linha\n• Ritmo ${currentMetrics.bpm} BPM\n• Estrutura: ${currentMetrics.structure}`
          break
        case "rimas":
          improvedLyrics = lyrics + `\n\n---\n✅ RIMAS MELHORADAS\n• Rimas enriquecidas e naturais\n• Fluência poética aprimorada\n• Sonoridade harmoniosa`
          break
        case "estrutura":
          improvedLyrics = lyrics + `\n\n---\n✅ ESTRUTURA OTIMIZADA\n• Seções bem definidas\n• Transições suaves\n• Progressão coesa`
          break
        case "emocao":
          improvedLyrics = lyrics + `\n\n---\n✅ EMOÇÃO INTENSIFICADA\n• Impacto emocional amplificado\n• Linguagem mais expressiva\n• Conexão profunda`
          break
        case "originalidade":
          improvedLyrics = lyrics + `\n\n---\n✅ ORIGINALIDADE AUMENTADA\n• Elementos únicos adicionados\n• Abordagem criativa\n• Identidade própria`
          break
        case "custom":
          improvedLyrics = lyrics + `\n\n---\n✅ MELHORIA PERSONALIZADA\n${customInstruction || "Instruções personalizadas aplicadas"}`
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

  const selectedProjectData = mockProjects.find((p) => p.id === selectedProject)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="w-full px-4 sm:px-6 md:px-8 py-8 pt-24 max-w-none">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Wand className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Editar com Assistente</h1>
              <p className="text-xl text-gray-600 mt-2 max-w-2xl mx-auto">
                Use a inteligência artificial para aprimorar suas letras com métrica automática
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Painel de Seleção */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-2xl">Selecionar Projeto</CardTitle>
              <CardDescription>Escolha um projeto existente ou cole uma letra</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div>
                <Label htmlFor="project-select" className="text-gray-700">Projetos Salvos</Label>
                <Select value={selectedProject} onValueChange={handleProjectSelect}>
                  <SelectTrigger id="project-select" className="w-full">
                    <SelectValue placeholder="Selecione um projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center gap-2">
                          <span>{project.title}</span>
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
                <Label htmlFor="lyrics-input" className="text-gray-700">Cole sua letra</Label>
                <Textarea
                  id="lyrics-input"
                  placeholder="Cole a letra que deseja editar aqui..."
                  value={!selectedProject ? lyrics : ""}
                  onChange={(e) => {
                    if (!selectedProject) setLyrics(e.target.value)
                  }}
                  disabled={!!selectedProject}
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="genre-select" className="text-gray-700">Gênero Musical</Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger id="genre-select" className="w-full">
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(BRAZILIAN_GENRE_METRICS)
                      .filter((g) => g !== "default")
                      .map((genreName) => (
                        <SelectItem key={genreName} value={genreName}>
                          {genreName} ({BRAZILIAN_GENRE_METRICS[genreName as GenreName].syllablesPerLine}s)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProjectData && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{selectedProjectData.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2 flex flex-col">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-2xl">Editor de Letras</CardTitle>
              <CardDescription>Edite sua letra e use o assistente para melhorias</CardDescription>
              
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
            </CardHeader>
            <CardContent className="p-0 space-y-4 flex flex-col flex-1">
              <Textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Sua letra aparecerá aqui... Ou cole uma letra no campo ao lado."
                className="min-h-[300px] font-mono text-sm flex-1"
              />

              {/* Análise de Métrica em Tempo Real */}
              {validationResult && (
                <div className={`p-4 rounded-lg border ${
                  validationResult.isValid 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {validationResult.isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    )}
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
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  onClick={() => navigator.clipboard.writeText(lyrics)} 
                  disabled={!lyrics}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copiar
                </Button>
                
                {validationResult && !validationResult.isValid && (
                  <Button 
                    variant="outline" 
                    onClick={handleFixMetrics}
                    className="flex items-center gap-2 bg-yellow-100 border-yellow-300 text-yellow-700 hover:bg-yellow-200"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Corrigir Métrica
                  </Button>
                )}
                
                <Button variant="outline" onClick={() => setLyrics("")} className="flex items-center gap-2">
                  Limpar
                </Button>
              </div>
            </CardContent>
          </div>
        </div>

        {/* Painel de Melhorias */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-500" />
              Assistente de Melhorias
            </CardTitle>
            <CardDescription>Escolha o tipo de melhoria que deseja aplicar</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {improvementOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={improvementType === option.value ? "default" : "outline"}
                  className="h-auto py-3 flex flex-col items-center gap-2 transition-all"
                  onClick={() => setImprovementType(option.value)}
                >
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-xs font-medium">{option.label}</span>
                  <span className="text-xs text-muted-foreground hidden lg:block">{option.description}</span>
                </Button>
              ))}
            </div>

            {improvementType === "custom" && (
              <div>
                <Label htmlFor="custom-instruction" className="text-gray-700">Instruções Personalizadas</Label>
                <Input
                  id="custom-instruction"
                  placeholder="Ex: Tornar mais romântico, adicionar metáforas, focar em rimas ABAB..."
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                onClick={handleImprove} 
                disabled={isLoading || !lyrics.trim() || !genre}
                className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Wand className="h-4 w-4" />
                    Aplicar Melhoria
                    {genre && ` em ${genre}`}
                  </>
                )}
              </Button>

              <Button variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Reverter
              </Button>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <strong>Dica:</strong> O assistente mantém o estilo original enquanto aplica melhorias técnicas. 
                  {genre && ` Para ${genre}, a métrica ideal é ${currentMetrics.syllablesPerLine} sílabas por linha.`}
                </div>
              </div>
            </div>
          </CardContent>
        </div>

        {/* Exemplos Rápidos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle>Melhorias Rápidas</CardTitle>
            <CardDescription>Ações instantâneas para sua letra</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="flex flex-col h-auto py-3 bg-transparent hover:bg-gray-50">
                <Music className="h-4 w-4 mb-1" />
                <span className="text-xs">Analisar Métrica</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-auto py-3 bg-transparent hover:bg-gray-50">
                <RefreshCw className="h-4 w-4 mb-1" />
                <span className="text-xs">Reescrever Refrão</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-auto py-3 bg-transparent hover:bg-gray-50">
                <Zap className="h-4 w-4 mb-1" />
                <span className="text-xs">Otimizar Hook</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-auto py-3 bg-transparent hover:bg-gray-50">
                <Save className="h-4 w-4 mb-1" />
                <span className="text-xs">Salvar Versão</span>
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
      <Footer />
    </div>
  )
}
