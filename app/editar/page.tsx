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
import { GenreSelect } from "@/components/genre-select"
import { getGenreMetrics } from "@/lib/metrics/brazilian-metrics"

const MOODS = ["Feliz", "Triste", "Nostálgico", "Romântico", "Animado", "Melancólico"]
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
  const [formattingStyle, setFormattingStyle] = useState<"standard" | "performatico">("standard")
  const [isEditing, setIsEditing] = useState(false)
  const [savedInspirations, setSavedInspirations] = useState<Array<{ text: string; timestamp: number }>>([])

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
      const genreMetrics = getGenreMetrics(genre)

      const syllableConfig = {
        min: genreMetrics.syllableRange.min,
        max: genreMetrics.syllableRange.max,
        ideal:
          genreMetrics.syllableRange.ideal ||
          Math.floor((genreMetrics.syllableRange.min + genreMetrics.syllableRange.max) / 2),
      }

      const inspirationsText = savedInspirations.map((i) => i.text).join("\n\n")

      const requestBody = {
        originalLyrics: lyrics,
        genre,
        mood: mood || "Romântico",
        theme: theme || "Amor",
        creativity: "equilibrado",
        formattingStyle: formattingStyle,
        additionalRequirements: additionalReqs,
        advancedMode: advancedMode,
        universalPolish: true,
        syllableTarget: syllableConfig,
        emotions: selectedEmotions,
        inspiration: inspirationsText || inspirationText,
        metaphors: metaphorSearch,
        title,
        performanceMode: formattingStyle === "performatico" ? "performance" : "standard",
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
        description: `Score: ${data.metadata?.finalScore || "N/A"} | Modo: ${data.metadata?.performanceMode || "padrão"}`,
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
      toast.success("Letra limpa", {
        description: "A letra foi removida do editor.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-4 pt-20">
        <h1 className="text-2xl font-bold text-left mb-4">
          {projectId ? `Editando: ${title || "Sem título"}` : "Modo Editar com Assistente"}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:items-start">
          {/* Coluna 1: Inspiração & Sensações */}
          <Card className="order-1 h-fit">
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
                    <Button size="sm" variant="secondary" className="w-full" onClick={addInspiration}>
                      Adicionar Inspiração
                    </Button>
                    {savedInspirations.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center">Nenhuma inspiração salva ainda.</p>
                    ) : (
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {savedInspirations.map((insp, idx) => (
                          <div key={idx} className="text-xs p-2 bg-muted rounded">
                            {insp.text}
                          </div>
                        ))}
                      </div>
                    )}
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
          <Card className="order-2 h-fit">
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
                <GenreSelect value={genre} onValueChange={setGenre} />

                <Label className="text-xs font-semibold">Humor (para sugestões)</Label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecione o humor" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Label className="text-xs font-semibold">Tema (opcional)</Label>
                <Input
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Ex: Amor, Saudade..."
                  className="h-9"
                />

                <Label className="text-xs font-semibold">Instruções Adicionais</Label>
                <Textarea
                  value={additionalReqs}
                  onChange={(e) => setAdditionalReqs(e.target.value)}
                  placeholder="Descreva as mudanças..."
                  rows={2}
                  className="text-xs"
                />

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="advancedMode"
                    checked={advancedMode}
                    onCheckedChange={(checked) => setAdvancedMode(checked as boolean)}
                  />
                  <Label htmlFor="advancedMode" className="text-xs cursor-pointer">
                    Modo Avançado
                  </Label>
                </div>
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
            </CardContent>
          </Card>

          {/* Coluna 3: Editor de Letra */}
          <div className="order-3 space-y-4 h-fit">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Editor</CardTitle>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={handleEditLyrics}
                    disabled={isEditing || !lyrics || !genre}
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    <span className="text-xs">{isEditing ? "Editando..." : "Editar"}</span>
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
                    placeholder="Cole aqui a letra que deseja editar..."
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
