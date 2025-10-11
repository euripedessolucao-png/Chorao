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
import { RefreshCw, Sparkles, Trash2, Search, Save, Copy } from "lucide-react"
import { toast } from "sonner"

const GENRES = ["Pop", "Sertanejo Moderno", "MPB"]
const MOODS = ["Feliz", "Triste", "Nostálgico"]
const EMOTIONS = [
  "Alegria",
  "Alívio",
  "Amor",
  "Ansiedade",
  "Confusão",
  "Conexão",
  "Coragem",
  "Culpa",
  "Desapego",
  "Desilusão",
  "Desprezo",
  "Empolgação",
  "Empoderamento",
  "Encantamento",
  "Esperança",
  "Euforia",
  "Gratidão",
  "Inveja",
  "Liberdade",
  "Medo",
  "Melancolia",
  "Nostalgia",
  "Orgulho",
  "Paixão",
  "Paz",
  "Raiva",
  "Saudade",
  "Solidão",
  "Tensão",
  "Ternura",
  "Tristeza",
  "Vergonha",
]

export default function EditarPage() {
  const [showExplanations, setShowExplanations] = useState(true)
  const [showQuickTips, setShowQuickTips] = useState(true)
  const [showChallenges, setShowChallenges] = useState(false)
  const [genre, setGenre] = useState("")
  const [mood, setMood] = useState("")
  const [inspirationText, setInspirationText] = useState("")
  const [literaryGenre, setLiteraryGenre] = useState("")
  const [metaphorSearch, setMetaphorSearch] = useState("")
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [selectedText, setSelectedText] = useState("")
  const [title, setTitle] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [projectId, setProjectId] = useState<number | null>(null)

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
    setSelectedEmotions((prev) => (prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]))
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
      toast.success("Letra limpa", {
        description: "A letra foi removida do editor.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-6 pt-24">
        <h1 className="text-2xl font-bold text-center mb-6">
          {projectId ? `Editando: ${title || "Sem título"}` : "Modo Editar com Assistente"}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Coluna 1: Inspiração & Sensações */}
          <Card className="order-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Inspiração & Sensações</CardTitle>
              <p className="text-xs text-muted-foreground">
                Acesse rapidamente seu diário de inspiração, metáforas e emoções, tudo em um só lugar.
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="border rounded-lg p-3 bg-purple-50/50 space-y-2">
                <Label className="text-xs font-semibold">Diário de Inspiração</Label>
                <p className="text-xs text-muted-foreground">Adicione textos, áudios, imagens ou links.</p>
                <Tabs defaultValue="text">
                  <TabsList className="grid w-full grid-cols-4 h-8">
                    <TabsTrigger value="text" className="text-xs">
                      Texto
                    </TabsTrigger>
                    <TabsTrigger value="image" className="text-xs">
                      Imagem
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
                      className="text-xs"
                    />
                    <Button size="sm" variant="secondary" className="w-full">
                      Adicionar Inspiração
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">Nenhuma inspiração salva ainda.</p>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="border rounded-lg p-3 bg-purple-50/50 space-y-2">
                <Label className="text-xs font-semibold">Inspiração Literária Global</Label>
                <p className="text-xs text-muted-foreground">Busque referências criativas em best-sellers.</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Gênero musical"
                    value={literaryGenre}
                    onChange={(e) => setLiteraryGenre(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Button size="sm" className="h-8">
                    Buscar
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-3 bg-purple-50/50 space-y-2">
                <Label className="text-xs font-semibold">Metáforas Inteligentes</Label>
                <p className="text-xs text-muted-foreground">Busque metáforas por tema.</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar metáfora por tema..."
                    value={metaphorSearch}
                    onChange={(e) => setMetaphorSearch(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Button size="sm" variant="secondary" className="h-8">
                    <Search className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-3 bg-purple-50/50 space-y-2">
                <Label className="text-xs font-semibold">Sensações & Emoções</Label>
                <p className="text-xs text-muted-foreground">O "como" a história será contada.</p>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
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

          {/* Coluna 2: Ferramentas de Edição */}
          <Card className="order-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ferramentas de Edição</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="border rounded-lg p-3 space-y-2">
                <Label className="text-xs font-semibold">Preferências do Modo Assistente</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showExplanations"
                      checked={showExplanations}
                      onCheckedChange={(checked) => setShowExplanations(checked as boolean)}
                    />
                    <Label htmlFor="showExplanations" className="text-xs cursor-pointer">
                      Mostrar explicações de sugestões
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showQuickTips"
                      checked={showQuickTips}
                      onCheckedChange={(checked) => setShowQuickTips(checked as boolean)}
                    />
                    <Label htmlFor="showQuickTips" className="text-xs cursor-pointer">
                      Exibir dicas rápidas de composição
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showChallenges"
                      checked={showChallenges}
                      onCheckedChange={(checked) => setShowChallenges(checked as boolean)}
                    />
                    <Label htmlFor="showChallenges" className="text-xs cursor-pointer">
                      Ativar desafios e lições interativas
                    </Label>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-3 space-y-2">
                <Label className="text-xs font-semibold">Gênero (para sugestões)</Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Pop" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENRES.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Label className="text-xs font-semibold">Humor (para sugestões)</Label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Feliz" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg p-3 space-y-2">
                <Label className="text-xs font-semibold">Ferramentas</Label>
                <div className="space-y-1">
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs bg-transparent">
                    Encontrar Rimas
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs bg-transparent">
                    Encontrar Sinônimos
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs bg-transparent">
                    Completar Verso
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs bg-transparent">
                    Expressões Estratégicas
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-3 space-y-2">
                <Label className="text-xs font-semibold">Texto Selecionado</Label>
                <p className="text-xs text-muted-foreground">Selecione texto para ativar estas opções</p>
                <Button size="sm" variant="secondary" className="w-full" disabled>
                  Salvar Trecho
                </Button>
                <Button size="sm" variant="secondary" className="w-full" disabled>
                  Reescrever Seleção
                </Button>
              </div>

              <div className="border rounded-lg p-3 space-y-2">
                <Label className="text-xs font-semibold">Trechos Salvos</Label>
                <p className="text-xs text-muted-foreground text-center">Nenhum trecho salvo encontrado</p>
              </div>
            </CardContent>
          </Card>

          {/* Coluna 3: Editor de Letra */}
          <div className="order-3 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Editor</CardTitle>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Sparkles className="h-3 w-3 mr-1" />
                    <span className="text-xs">Sugerir</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <span className="text-xs">📊 Validar</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    <span className="text-xs">Refazer</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClear}>
                    <Trash2 className="h-3 w-3 mr-1" />
                    <span className="text-xs">Limpar</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Input
                  placeholder="Título da música..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-9"
                />

                <div className="space-y-2">
                  <Label className="text-xs">Letra</Label>
                  <Textarea
                    placeholder="Sua letra aparecerá aqui..."
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    rows={18}
                    className="font-mono text-xs"
                  />
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={handleCopy}>
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </Button>
                  <Button size="sm" className="flex-1 bg-transparent" variant="outline" onClick={handleSave}>
                    <Save className="h-3 w-3 mr-1" />
                    Salvar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
