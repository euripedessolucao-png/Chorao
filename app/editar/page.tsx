"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Wand2, Sparkles, Trash2, Search, Save, Copy, Zap, Music, Eye, Scan } from "lucide-react"
import { toast } from "sonner"
import { SyllableValidator } from "@/components/syllable-validator"

const GENRES = ["Sertanejo Moderno", "Sertanejo Universitário", "Pagode", "Funk", "MPB", "Pop"]
const MOODS = ["Romântico", "Nostálgico", "Empoderado", "Melancólico", "Feliz", "Sensual"]
const EMOTIONS = ["Paixão", "Saudade", "Empolgação", "Vulnerabilidade", "Confiança", "Superação"]

export default function EditarPage() {
  const [project, setProject] = useState({
    title: "",
    genre: "",
    lyrics: "",
    mood: "",
    bpm: 100,
    structure: "VERSO-REFRAO-PONTE"
  })

  const [analysis, setAnalysis] = useState({
    syllableScore: 0,
    rhymeScore: 0,
    structureScore: 0,
    suggestions: [] as string[]
  })

  const [activeTools, setActiveTools] = useState({
    syllableValidator: true,
    rhymeHelper: false,
    structureAnalyser: true
  })

  useEffect(() => {
    const editingProject = localStorage.getItem("editingProject")
    if (editingProject) {
      try {
        const projectData = JSON.parse(editingProject)
        setProject(projectData)
        analyzeLyrics(projectData.lyrics)
        localStorage.removeItem("editingProject")
        toast.success("Projeto carregado para edição")
      } catch (error) {
        toast.error("Erro ao carregar projeto")
      }
    }
  }, [])

  const analyzeLyrics = (lyrics: string) => {
    // Simulação de análise - na prática integrar com suas validações
    const lines = lyrics.split('\n').filter(l => l.trim() && !l.startsWith('['))
    const validLines = lines.filter(l => {
      const words = l.split(' ').length
      return words >= 3 && words <= 8
    })
    
    setAnalysis({
      syllableScore: Math.round((validLines.length / lines.length) * 100),
      rhymeScore: 75, // Placeholder
      structureScore: 85, // Placeholder
      suggestions: [
        "Refrão com gancho forte detectado",
        "Estrutura A-B-C identificada",
        "2 linhas precisam de ajuste métrico"
      ]
    })
  }

  const handleLyricsChange = (value: string) => {
    setProject(prev => ({ ...prev, lyrics: value }))
    analyzeLyrics(value)
  }

  const handleSave = () => {
    if (!project.title || !project.lyrics) {
      toast.error("Título e letra são obrigatórios")
      return
    }

    const projects = JSON.parse(localStorage.getItem("projects") || "[]")
    const projectToSave = {
      id: Date.now(),
      ...project,
      lastEdited: new Date().toISOString(),
      analysis
    }
    
    const existingIndex = projects.findIndex((p: any) => p.id === projectToSave.id)
    if (existingIndex !== -1) {
      projects[existingIndex] = projectToSave
    } else {
      projects.push(projectToSave)
    }
    
    localStorage.setItem("projects", JSON.stringify(projects))
    toast.success("Projeto salvo com sucesso!")
  }

  const handleAIEnhance = async (type: 'rhyme' | 'structure' | 'metrics') => {
    toast.info(`Otimizando ${type === 'rhyme' ? 'rimas' : type === 'structure' ? 'estrutura' : 'métrica'}...`)
    // Integrar com suas APIs de otimização
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 pt-20">
        {/* Header Moderno */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Editor Inteligente
            </h1>
            <p className="text-muted-foreground mt-2">
              Ferramentas profissionais para composição avançada
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => document.getElementById('analysis-panel')?.scrollIntoView()}>
              <Eye className="h-4 w-4 mr-2" />
              Análise
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Sidebar - Ferramentas */}
          <div className="xl:col-span-1 space-y-6">
            {/* Informações do Projeto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Projeto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Título</Label>
                  <Input 
                    value={project.title}
                    onChange={(e) => setProject(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Nome da música..."
                  />
                </div>
                
                <div>
                  <Label>Gênero</Label>
                  <Select value={project.genre} onValueChange={(value) => setProject(prev => ({ ...prev, genre: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {GENRES.map(genre => (
                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Humor</Label>
                  <Select value={project.mood} onValueChange={(value) => setProject(prev => ({ ...prev, mood: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {MOODS.map(mood => (
                        <SelectItem key={mood} value={mood}>{mood}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>BPM</Label>
                    <Input 
                      type="number"
                      value={project.bpm}
                      onChange={(e) => setProject(prev => ({ ...prev, bpm: parseInt(e.target.value) || 100 }))}
                    />
                  </div>
                  <div>
                    <Label>Estrutura</Label>
                    <Input value={project.structure} readOnly />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ferramentas de Análise */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="h-5 w-5" />
                  Análise Automática
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="syllable-check">Validador de Sílabas</Label>
                  <Checkbox 
                    id="syllable-check"
                    checked={activeTools.syllableValidator}
                    onCheckedChange={(checked) => setActiveTools(prev => ({ ...prev, syllableValidator: checked as boolean }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="rhyme-check">Otimizador de Rimas</Label>
                  <Checkbox 
                    id="rhyme-check"
                    checked={activeTools.rhymeHelper}
                    onCheckedChange={(checked) => setActiveTools(prev => ({ ... prev, rhymeHelper: checked as boolean }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="structure-check">Analisador de Estrutura</Label>
                  <Checkbox 
                    id="structure-check"
                    checked={activeTools.structureAnalyser}
                    onCheckedChange={(checked) => setActiveTools(prev => ({ ...prev, structureAnalyser: checked as boolean }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleAIEnhance('metrics')}>
                    <Zap className="h-3 w-3 mr-1" />
                    Métrica
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleAIEnhance('rhyme')}>
                    <Sparkles className="h-3 w-3 mr-1" />
                    Rimas
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Emoções e Sensações */}
            <Card>
              <CardHeader>
                <CardTitle>Atmosfera</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {EMOTIONS.map(emotion => (
                    <Badge key={emotion} variant="secondary" className="cursor-pointer">
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Área Principal - Editor */}
          <div className="xl:col-span-3 space-y-6">
            {/* Barra de Ferramentas Rápida */}
            <div className="flex gap-2 p-4 bg-white rounded-lg border shadow-sm">
              <Button variant="outline" size="sm">
                <Wand2 className="h-4 w-4 mr-2" />
                Sugerir Melhorias
              </Button>
              <Button variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copiar Letra
              </Button>
              <Button variant="outline" size="sm" onClick={() => setProject(prev => ({ ...prev, lyrics: "" }))}>
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Tudo
              </Button>
            </div>

            {/* Editor de Letra */}
            <Card>
              <CardHeader>
                <CardTitle>Letra da Música</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={project.lyrics}
                  onChange={(e) => handleLyricsChange(e.target.value)}
                  placeholder={`[INTRO - Suave, romântico]\nEscreva sua letra aqui...\n\n[VERSO 1 - Estabeleça a história]\nLinha por linha, com emoção\n\n[REFRAO - Gancho forte e memorável]\nRepita o tema principal`}
                  rows={20}
                  className="font-mono text-sm leading-relaxed resize-none"
                />
                
                {/* Validador de Sílabas Integrado */}
                {activeTools.syllableValidator && (
                  <div className="mt-4">
                    <SyllableValidator 
                      lyrics={project.lyrics}
                      maxSyllables={11}
                      onValidate={(result) => {
                        if (!result.valid) {
                          toast.warning(`${result.linesWithIssues} linhas precisam de ajuste`)
                        }
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Painel de Análise */}
            <Card id="analysis-panel">
              <CardHeader>
                <CardTitle>Análise da Composição</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{analysis.syllableScore}%</div>
                    <div className="text-sm text-muted-foreground">Métrica</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{analysis.rhymeScore}%</div>
                    <div className="text-sm text-muted-foreground">Rimas</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{analysis.structureScore}%</div>
                    <div className="text-sm text-muted-foreground">Estrutura</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Sugestões de Melhoria:</h4>
                  <div className="space-y-2">
                    {analysis.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                        <Sparkles className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <span className="text-sm">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
