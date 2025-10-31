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
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
// ✅ CORREÇÃO: Remover ChorusGenerator temporariamente ou ajustar
// import { ChorusGenerator } from "@/components/chorus-generator"
import { Wand2 } from "lucide-react"

const MOODS = ["Feliz", "Triste", "Nostálgico", "Romântico", "Animado", "Melancólicico"]
const EMOTIONS = [
  "Alegria", "Alívio", "Amor", "Ansiedade", "Confusão", "Conexão", "Coragem", "Culpa",
  "Desapego", "Desilusão", "Desprezo", "Empolgação", "Empoderamento", "Encantamento",
  "Esperança", "Euforia", "Gratidão", "Inveja", "Liberdade", "Medo", "Melancolia",
  "Nostalgia", "Orgulho", "Paixão", "Paz", "Raiva", "Saudade", "Solidão", "Tensão",
  "Ternura", "Tristeza", "Vergonha"
]

const GENRES = [
  "Sertanejo",
  "Sertanejo Moderno", 
  "Sertanejo Universitário",
  "Sertanejo Sofrência",
  "Sertanejo Raiz",
  "MPB",
  "Bossa Nova",
  "Funk",
  "Pagode",
  "Samba",
  "Forró",
  "Axé",
  "Rock",
  "Pop",
  "Gospel"
]

const GENRE_QUALITY_CONFIG = {
  "Sertanejo": { max: 12, ideal: 9, min: 7, rhymeQuality: 0.5 },
  "Sertanejo Moderno": { max: 12, ideal: 9, min: 7, rhymeQuality: 0.5 },
  "Sertanejo Universitário": { max: 12, ideal: 9, min: 7, rhymeQuality: 0.5 },
  "Sertanejo Sofrência": { max: 12, ideal: 9, min: 7, rhymeQuality: 0.5 },
  "Sertanejo Raiz": { max: 12, ideal: 10, min: 8, rhymeQuality: 0.6 },
  "MPB": { max: 13, ideal: 10, min: 7, rhymeQuality: 0.7 },
  "Bossa Nova": { max: 12, ideal: 9, min: 7, rhymeQuality: 0.6 },
  "Funk": { max: 12, ideal: 6, min: 3, rhymeQuality: 0.3 },
  "Pagode": { max: 12, ideal: 9, min: 7, rhymeQuality: 0.4 },
  "Samba": { max: 12, ideal: 9, min: 7, rhymeQuality: 0.4 },
  "Forró": { max: 12, ideal: 9, min: 7, rhymeQuality: 0.4 },
  "Axé": { max: 12, ideal: 8, min: 6, rhymeQuality: 0.3 },
  "Rock": { max: 12, ideal: 10, min: 7, rhymeQuality: 0.4 },
  "Pop": { max: 12, ideal: 9, min: 7, rhymeQuality: 0.4 },
  "Gospel": { max: 12, ideal: 9, min: 7, rhymeQuality: 0.5 },
  "default": { max: 12, ideal: 9, min: 7, rhymeQuality: 0.4 },
}

export default function EditarPage() {
  const [genre, setGenre] = useState("")
  const [subgenre, setSubgenre] = useState("")
  const [mood, setMood] = useState("")
  const [theme, setTheme] = useState("")
  const [inspirationText, setInspirationText] = useState("")
  const [literaryGenre, setLiteraryGenre] = useState("")
  const [metaphorSearch, setMetaphorSearch] = useState("")
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [title, setTitle] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [projectId, setProjectId] = useState<number | null>(null)
  const [additionalReqs, setAdditionalReqs] = useState("")
  const [advancedMode, setAdvancedMode] = useState(false)
  const [creativity, setCreativity] = useState([80])
  const [formattingStyle, setFormattingStyle] = useState<"padrao" | "performatico">("performatico")
  const [universalPolish, setUniversalPolish] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [savedInspirations, setSavedInspirations] = useState<Array<{ text: string; timestamp: number }>>([])
  const [showChorusDialog, setShowChorusDialog] = useState(false)
  const [selectedChoruses, setSelectedChoruses] = useState<any[]>([])

  const getSyllableConfig = (selectedGenre: string) => {
    const config = GENRE_QUALITY_CONFIG[selectedGenre as keyof typeof GENRE_QUALITY_CONFIG] || GENRE_QUALITY_CONFIG.default
    return {
      max: config.max,
      ideal: config.ideal,
      min: config.min
    }
  }

  useEffect(() => {
    const editingProject = localStorage.getItem("editingProject")
    if (editingProject) {
      try {
        const project = JSON.parse(editingProject)
        setProjectId(project.id)
        setTitle(project.title || "")
        setLyrics(project.lyrics || "")
        setGenre(project.genre || "")
        localStorage.removeItem("editingProject")
        toast.success("Projeto carregado", {
          description: `"${project.title}" foi carregado no editor.`,
        })
      } catch (error) {
        toast.error("Erro ao carregar projeto")
      }
    }
  }, [])

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions((prev) => 
      prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
    )
  }

  const addInspiration = () => {
    if (!inspirationText.trim()) {
      toast.error("Digite uma inspiração primeiro")
      return
    }
    setSavedInspirations((prev) => [...prev, { text: inspirationText, timestamp: Date.now() }])
    setInspirationText("")
    toast.success("Inspiração adicionada")
  }

  const handleEditLyrics = async () => {
    if (!lyrics.trim()) {
      toast.error("Por favor, cole a letra para editar")
      return
    }

    if (!genre) {
      toast.error("Por favor, selecione um gênero")
      return
    }

    setIsEditing(true)

    try {
      const fullRequirements = subgenre ? 
        `${additionalReqs}\n\nRitmo/Subgênero: ${subgenre}` : 
        additionalReqs

      const requestBody = {
        originalLyrics: lyrics,
        genre,
        mood: mood || "Romântico",
        theme: theme || "Amor",
        additionalRequirements: fullRequirements,
        title,
        performanceMode: formattingStyle === "performatico" ? "performance" : "standard",
        creativity: getCreativityLevel(creativity[0]),
        applyFinalPolish: universalPolish
      }

      const response = await fetch("/api/rewrite-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Erro ${response.status} na API`)
      }

      if (!data.lyrics && !data.letra) {
        throw new Error("Resposta da API não contém letra")
      }

      setLyrics(data.lyrics || data.letra)
      if (data.title && !title) {
        setTitle(data.title)
      }

      toast.success("Letra editada com sucesso!", {
        description: `Reescrita no estilo ${genre}`,
      })
    } catch (error) {
      console.error("Erro na edição:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao editar letra")
    } finally {
      setIsEditing(false)
    }
  }

  const handleSave = () => {
    if (!title.trim() || !lyrics.trim()) {
      toast.error("Campos obrigatórios", {
        description: "Por favor, preencha o título e a letra antes de salvar.",
      })
      return
    }

    const projects = JSON.parse(localStorage.getItem("projects") || "[]")

    if (projectId) {
      const index = projects.findIndex((p: any) => p.id === projectId)
      if (index !== -1) {
        projects[index] = {
          ...projects[index],
          title,
          lyrics,
          genre,
          date: new Date().toISOString(),
        }
      }
    } else {
      const newProject = {
        id: Date.now(),
        title,
        genre,
        lyrics,
        date: new Date().toISOString(),
      }
      projects.push(newProject)
      setProjectId(newProject.id)
    }

    localStorage.setItem("projects", JSON.stringify(projects))

    toast.success("Projeto salvo", {
      description: `"${title}" foi salvo com sucesso na galeria.`,
    })
  }

  const handleCopy = () => {
    if (!lyrics.trim()) {
      toast.error("Nada para copiar", {
        description: "A letra está vazia.",
      })
      return
    }

    navigator.clipboard.writeText(lyrics)
    toast.success("Letra copiada", {
      description: "A letra foi copiada para a área de transferência.",
    })
  }

  const handleClear = () => {
    if (window.confirm("Tem certeza que deseja limpar a letra? Esta ação não pode ser desfeita.")) {
      setLyrics("")
      setTitle("")
      toast.success("Letra limpa")
    }
  }

  // ✅ CORREÇÃO: Simplificar função de gerar refrões
  const handleGenerateChorus = () => {
    if (!genre || !theme) {
      toast.error("Selecione gênero e tema antes de gerar o refrão")
      return
    }
    
    // ✅ CORREÇÃO: Mostrar mensagem informativa em vez do dialog problemático
    toast.info("Funcionalidade de refrões em desenvolvimento", {
      description: "Em breve você poderá gerar refrões automaticamente!",
    })
    
    // ✅ CORREÇÃO: Adicionar um exemplo simples aos requisitos
    const exampleChorus = `[REFRAO_EXEMPLO]
Teu amor me transformou
Minha vida renovou
Nesse sentimento puro
Que no peito guardou`

    const updatedReqs = additionalReqs ? 
      `${additionalReqs}\n\n${exampleChorus}` : 
      exampleChorus

    setAdditionalReqs(updatedReqs)
  }

  // ✅ CORREÇÃO: Remover funções não utilizadas
  // const handleSelectChoruses = (choruses: any[]) => {
  //   setSelectedChoruses(choruses)
  // }

  // const handleApplyChoruses = () => {
  //   if (selectedChoruses.length === 0) {
  //     toast.error("Selecione pelo menos um refrão")
  //     return
  //   }

  //   const chorusText = selectedChoruses.map((c) => c.chorus.replace(/\s\/\s/g, "\n")).join("\n\n")
  //   const updatedReqs = additionalReqs ? 
  //     `${additionalReqs}\n\n[CHORUS]\n${chorusText}` : 
  //     `[CHORUS]\n${chorusText}`

  //   setAdditionalReqs(updatedReqs)
  //   setShowChorusDialog(false)

  //   toast.success("Refrão(ões) adicionado(s) aos requisitos!")
  // }

  const getCreativityLevel = (sliderValue: number): "conservador" | "equilibrado" | "ousado" => {
    if (sliderValue < 40) return "conservador"
    if (sliderValue < 70) return "equilibrado"
    return "ousado"
  }

  const getCreativityLabel = (value: number) => {
    if (value < 40) return "Muito Conservador"
    if (value < 70) return "Equilibrado"
    return "Muito Criativo"
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Editor de Letras</h1>
              <p className="text-muted-foreground mt-2">
                Edite e refine suas letras com inteligência artificial
              </p>
            </div>
            
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleCopy}>
                Copiar Letra
              </Button>
              <Button variant="outline" onClick={handleClear}>
                Limpar Tudo
              </Button>
              <Button onClick={handleSave}>
                Salvar Projeto
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* COLUNA ESQUERDA - CONFIGURAÇÕES */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título da Música</Label>
                    <Input
                      id="title"
                      placeholder="Digite o título..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Gênero Musical</Label>
                    <Select value={genre} onValueChange={setGenre}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o gênero" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENRES.map((genreOption) => (
                          <SelectItem key={genreOption} value={genreOption}>
                            {genreOption}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Subgênero/Ritmo</Label>
                    <Input
                      placeholder="Ex: Arrocha, Piseiro, etc..."
                      value={subgenre}
                      onChange={(e) => setSubgenre(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tema Principal</Label>
                    <Input
                      placeholder="Ex: Amor, Saudade, Superação..."
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Clima da Música</Label>
                    <Select value={mood} onValueChange={setMood}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o clima" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOODS.map((moodOption) => (
                          <SelectItem key={moodOption} value={moodOption}>
                            {moodOption}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configurações Avançadas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nível de Criatividade</Label>
                    <div className="space-y-4">
                      <Slider
                        value={creativity}
                        onValueChange={setCreativity}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-sm text-muted-foreground text-center">
                        {getCreativityLabel(creativity[0])}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Formatação</Label>
                    <Select value={formattingStyle} onValueChange={(value: "padrao" | "performatico") => setFormattingStyle(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="performatico">Performática (Recomendado)</SelectItem>
                        <SelectItem value="padrao">Padrão</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="polish"
                      checked={universalPolish}
                      onCheckedChange={(checked) => setUniversalPolish(checked as boolean)}
                    />
                    <Label htmlFor="polish">Aplicar polimento final</Label>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleGenerateChorus}
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Gerar Refrões
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Requisitos Adicionais</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Instruções específicas, referências, elementos a incluir..."
                    value={additionalReqs}
                    onChange={(e) => setAdditionalReqs(e.target.value)}
                    rows={6}
                  />
                </CardContent>
              </Card>
            </div>

            {/* COLUNA DIREITA - EDITOR */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Editor de Letras</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Cole ou digite sua letra aqui..."
                      value={lyrics}
                      onChange={(e) => setLyrics(e.target.value)}
                      rows={20}
                      className="font-mono text-sm"
                    />
                    
                    <div className="flex justify-between">
                      <div className="text-sm text-muted-foreground">
                        {lyrics.length} caracteres • {lyrics.split('\n').length} linhas
                      </div>
                      
                      <Button 
                        onClick={handleEditLyrics} 
                        disabled={isEditing || !lyrics.trim() || !genre}
                        className="min-w-32"
                      >
                        {isEditing ? "Editando..." : "Editar Letra"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* ✅ CORREÇÃO: Remover dialog problemático temporariamente */}
      {/* <Dialog open={showChorusDialog} onOpenChange={setShowChorusDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Gerador de Refrões</DialogTitle>
            <DialogDescription>
              Gere e selecione refrões para sua música no estilo {genre}
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[60vh]">
            <ChorusGenerator
              genre={genre}
              theme={theme}
              onChorusesGenerated={handleSelectChoruses}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChorusDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApplyChoruses}>
              Aplicar Refrões Selecionados
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div>
  )
}
