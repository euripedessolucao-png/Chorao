// app/editar/page.tsx - VERSÃO CORRIGIDA COM LAYOUT DO EDITOR
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Wand2, Copy, Trash2, Save, ArrowLeft, Sparkles } from "lucide-react"

const MOODS = ["Feliz", "Triste", "Nostálgico", "Romântico", "Animado", "Melancólico"]
const EMOTIONS = [
  "Alegria", "Alívio", "Amor", "Ansiedade", "Confusão", "Conexão", "Coragem", "Culpa",
  "Desapego", "Desilusão", "Desprezo", "Empolgação", "Empoderamento", "Encantamento",
  "Esperança", "Euforia", "Gratidão", "Inveja", "Liberdade", "Medo", "Melancolia",
  "Nostalgia", "Orgulho", "Paixão", "Paz", "Raiva", "Saudade", "Solidão", "Tensão",
  "Ternura", "Tristeza", "Vergonha"
]

const GENRES = [
  "Sertanejo Moderno Masculino",
  "Sertanejo Moderno Feminino", 
  "Sertanejo Universitário",
  "Sertanejo Raiz",
  "Pagode Romântico",
  "Funk Carioca",
  "Gospel Contemporâneo",
  "MPB"
]

export default function EditarPage() {
  const router = useRouter()
  const [genre, setGenre] = useState("")
  const [mood, setMood] = useState("")
  const [theme, setTheme] = useState("")
  const [inspirationText, setInspirationText] = useState("")
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [title, setTitle] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [additionalReqs, setAdditionalReqs] = useState("")
  const [creativity, setCreativity] = useState([80])
  const [universalPolish, setUniversalPolish] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [savedInspirations, setSavedInspirations] = useState<Array<{ text: string; timestamp: number }>>([])

  useEffect(() => {
    const editingProject = localStorage.getItem("editingProject")
    if (editingProject) {
      try {
        const project = JSON.parse(editingProject)
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
      const requestBody = {
        originalLyrics: lyrics,
        genre,
        mood: mood || "Romântico",
        theme: theme || "Amor",
        additionalRequirements: additionalReqs,
        title,
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

      if (!data.lyrics) {
        throw new Error("Resposta da API não contém letra")
      }

      setLyrics(data.lyrics)
      if (data.title && !title) {
        setTitle(data.title)
      }

      toast.success("Letra editada com sucesso!", {
        description: `Reescrita no estilo ${genre} com ${universalPolish ? 'polimento universal' : 'melhorias básicas'}`,
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
    const projectId = Date.now()

    const newProject = {
      id: projectId,
      title,
      genre,
      lyrics,
      date: new Date().toISOString(),
    }
    projects.push(newProject)

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

  const loadExample = () => {
    setLyrics(`[Intro]
Quando a noite vem e a lua brilha,
Teu olhar ilumina meu coração,
Nos ritmos que a paixão entende,
Nessa dança, somos só emoção.

[Verso 1]
Nos teus olhos, um mar profundo,
Navego em sonhos, me perco no mundo,
Teu perfume é a brisa suave,
Que embala d'amor, me faz tão leve.

[Refrão]
Teu sorriso é meu abrigo,
Teu abraço, meu amanhecer, 
No ritmo do amor, eu sigo,
Com você, eu quero viver.`)
    setTitle("Nosso Amor")
    setTheme("amor e paixão")
    setGenre("Sertanejo Moderno Masculino")
  }

  const getCreativityLevel = (sliderValue: number): "conservador" | "equilibrado" | "criativo" => {
    if (sliderValue < 60) return "conservador"
    if (sliderValue < 80) return "equilibrado"
    return "criativo"
  }

  const getCreativityLabel = (value: number) => {
    if (value < 60) return "Conservador"
    if (value < 80) return "Equilibrado"
    return "Criativo"
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 pt-20">
        <div className="max-w-7xl mx-auto">
          {/* Cabeçalho */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/criar")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Editor de Letras</h1>
              <p className="text-muted-foreground">
                Edite e refine suas letras com rimas naturais e estrutura profissional
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* COLUNA 1: INSPIRAÇÃO & CONFIGURAÇÕES */}
            <div className="space-y-6">
              {/* Card de Inspiração */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Inspiração & Sensações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Label>Diário de Inspiração</Label>
                    <Tabs defaultValue="text">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="text" className="text-xs">
                          Texto
                        </TabsTrigger>
                        <TabsTrigger value="audio" className="text-xs">
                          Áudio
                        </TabsTrigger>
                        <TabsTrigger value="link" className="text-xs">
                          Link
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="text" className="space-y-2">
                        <Textarea
                          placeholder="Adicione uma inspiração textual..."
                          value={inspirationText}
                          onChange={(e) => setInspirationText(e.target.value)}
                          rows={3}
                          className="text-sm"
                        />
                        <Button size="sm" onClick={addInspiration} className="w-full">
                          Adicionar Inspiração
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </div>

                  <div className="space-y-2">
                    <Label>Sensações & Emoções</Label>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {EMOTIONS.map((emotion) => (
                        <Badge
                          key={emotion}
                          variant={selectedEmotions.includes(emotion) ? "default" : "outline"}
                          className="cursor-pointer text-xs"
                          onClick={() => toggleEmotion(emotion)}
                        >
                          {emotion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card de Configurações */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Configurações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
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

                    <div className="space-y-2">
                      <Label>Tema Principal</Label>
                      <Input
                        placeholder="Ex: Amor, Saudade, Superação..."
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Criatividade da IA</Label>
                        <Badge variant="outline">
                          {getCreativityLabel(creativity[0])}
                        </Badge>
                      </div>
                      <Slider
                        value={creativity}
                        onValueChange={setCreativity}
                        max={100}
                        step={10}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="polish"
                        checked={universalPolish}
                        onCheckedChange={(checked) => setUniversalPolish(checked as boolean)}
                      />
                      <Label htmlFor="polish" className="text-sm">
                        Aplicar polimento universal
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* COLUNA 2 & 3: EDITOR PRINCIPAL */}
            <div className="lg:col-span-2 space-y-6">
              {/* Card do Editor */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Editor de Letras</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={loadExample}>
                        <Sparkles className="h-4 w-4 mr-1" />
                        Exemplo
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleClear}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Limpar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Label>Título da Música</Label>
                    <Input
                      placeholder="Digite o título da música..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Letra Original</Label>
                    <Textarea
                      placeholder="Cole aqui a letra que deseja editar..."
                      value={lyrics}
                      onChange={(e) => setLyrics(e.target.value)}
                      rows={16}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Instruções de Edição (Opcional)</Label>
                    <Textarea
                      placeholder="Descreva as mudanças que deseja: rimas, estrutura, emoção..."
                      value={additionalReqs}
                      onChange={(e) => setAdditionalReqs(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={handleEditLyrics}
                      disabled={isEditing || !lyrics.trim() || !genre}
                      className="flex-1"
                      size="lg"
                    >
                      <Wand2 className="h-4 w-4 mr-2" />
                      {isEditing ? "Editando..." : "Editar Letra"}
                    </Button>
                    
                    <Button variant="outline" onClick={handleCopy} disabled={!lyrics}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </Button>
                    
                    <Button variant="outline" onClick={handleSave} disabled={!title || !lyrics}>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                  </div>

                  {universalPolish && genre && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                      <div className="font-semibold">🎯 Sistema Universal Ativo</div>
                      <div>Polimento específico para {genre} será aplicado</div>
                      <div className="text-xs mt-1">
                        • Versos completos e coerentes<br/>
                        • Rimas naturais e fluentes<br/>
                        • Estrutura profissional A-B-A-B
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
