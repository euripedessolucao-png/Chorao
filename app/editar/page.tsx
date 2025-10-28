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
import { GenreSelect } from "@/components/genre-select"
import { validateSyllablesByGenre } from "@/lib/validation/absolute-syllable-enforcer"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChorusGenerator } from "@/components/chorus-generator"
import { Wand2 } from "lucide-react"

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

const GENRE_QUALITY_CONFIG = {
  Sertanejo: { max: 12, ideal: 10, rhymeQuality: 0.5 },
  "Sertanejo Moderno": { max: 12, ideal: 10, rhymeQuality: 0.5 },
  "Sertanejo Universitário": { max: 12, ideal: 10, rhymeQuality: 0.5 },
  "Sertanejo Sofrência": { max: 12, ideal: 10, rhymeQuality: 0.5 },
  "Sertanejo Raiz": { max: 12, ideal: 10, rhymeQuality: 0.5 },
  MPB: { max: 12, ideal: 9, rhymeQuality: 0.6 },
  "Bossa Nova": { max: 12, ideal: 9, rhymeQuality: 0.6 },
  Funk: { max: 12, ideal: 8, rhymeQuality: 0.3 },
  Pagode: { max: 12, ideal: 9, rhymeQuality: 0.4 },
  Samba: { max: 12, ideal: 9, rhymeQuality: 0.4 },
  Forró: { max: 12, ideal: 9, rhymeQuality: 0.4 },
  Axé: { max: 12, ideal: 8, rhymeQuality: 0.3 },
  Rock: { max: 12, ideal: 9, rhymeQuality: 0.4 },
  Pop: { max: 12, ideal: 9, rhymeQuality: 0.4 },
  Gospel: { max: 12, ideal: 9, rhymeQuality: 0.5 },
  default: { max: 12, ideal: 9, rhymeQuality: 0.4 },
}

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
  const [creativity, setCreativity] = useState([80])
  const [formattingStyle, setFormattingStyle] = useState<"padrao" | "performatico">("performatico")
  const [universalPolish, setUniversalPolish] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [savedInspirations, setSavedInspirations] = useState<Array<{ text: string; timestamp: number }>>([])
  const [showChorusDialog, setShowChorusDialog] = useState(false)
  const [selectedChoruses, setSelectedChoruses] = useState<any[]>([])

  const getSyllableConfig = (selectedGenre: string) => {
    const config =
      GENRE_QUALITY_CONFIG[selectedGenre as keyof typeof GENRE_QUALITY_CONFIG] || GENRE_QUALITY_CONFIG.default
    return {
      max: config.max,
      ideal: config.ideal,
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
      const syllableValidation = validateSyllablesByGenre("", genre)
      const currentSyllableConfig = {
        max: syllableValidation.maxSyllables,
        ideal: syllableValidation.maxSyllables,
      }

      const requestBody = {
        originalLyrics: lyrics,
        genre,
        mood: mood || "Romântico",
        theme: theme || "Amor",
        additionalRequirements: additionalReqs,
        title,
        syllableTarget: currentSyllableConfig,
        performanceMode: formattingStyle === "performatico" ? "performance" : "standard",
        temperature: Number.parseFloat(getTemperatureValue(creativity[0])),
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

      if (data.metadata?.polishingApplied) {
        toast.success("Letra editada com Sistema Universal de Qualidade!", {
          description: `Polimento específico para ${genre} aplicado com sucesso`,
        })
      } else {
        toast.success("Letra editada com sucesso!")
      }
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

  const handleGenerateChorus = () => {
    if (!genre || !theme) {
      toast.error("Selecione gênero e tema antes de gerar o refrão")
      return
    }
    setShowChorusDialog(true)
  }

  const handleSelectChoruses = (choruses: any[]) => {
    setSelectedChoruses(choruses)
  }

  const handleApplyChoruses = () => {
    if (selectedChoruses.length === 0) {
      toast.error("Selecione pelo menos um refrão")
      return
    }

    const chorusText = selectedChoruses.map((c) => c.chorus.replace(/\s\/\s/g, "\n")).join("\n\n")
    const updatedReqs = additionalReqs ? `${additionalReqs}\n\n[CHORUS]\n${chorusText}` : `[CHORUS]\n${chorusText}`

    setAdditionalReqs(updatedReqs)
    setShowChorusDialog(false)

    toast.success("Refrão(ões) adicionado(s) aos requisitos!")
  }

  const getTemperatureValue = (sliderValue: number) => {
    return (sliderValue / 100).toFixed(2)
  }

  const getTemperatureLabel = (temp: number) => {
    if (temp < 0.5) return "Muito Conservador"
    if (temp < 0.7) return "Conservador"
    if (temp < 0.85) return "Equilibrado"
    if (temp < 0.95) return "Criativo"
    return "Muito Criativo"
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
                    Buscar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coluna 2: Configurações */}
          <Card className="order-2 h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Configurações</CardTitle>
              <p className="text-xs text-muted-foreground">
                Personalize sua letra com ajustes de estilo e criatividade.
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold">Gênero Musical</Label>
                <GenreSelect value={genre} onValueChange={setGenre} />
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold">Mood</Label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecione um mood" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOODS.map((m) => (
                      <SelectItem key={m} value={m} className="text-xs">
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold">Tema</Label>
                <Input
                  placeholder="Digite um tema..."
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold">Requisitos Adicionais</Label>
                <Textarea
                  placeholder="Adicione requisitos adicionais..."
                  value={additionalReqs}
                  onChange={(e) => setAdditionalReqs(e.target.value)}
                  rows={3}
                  className="text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold">Estilo de Formatação</Label>
                <Select
                  value={formattingStyle}
                  onValueChange={(value) => setFormattingStyle(value as "padrao" | "performatico")}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecione um estilo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="padrao" className="text-xs">
                      Padrão
                    </SelectItem>
                    <SelectItem value="performatico" className="text-xs">
                      Performático
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold">Modo Avançado</Label>
                <Checkbox
                  checked={advancedMode}
                  onCheckedChange={(checked) => setAdvancedMode(checked === true)}
                  className="h-4 w-4"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold">Nível de Criatividade</Label>
                <Slider value={creativity} onValueChange={setCreativity} max={100} className="w-full h-4" />
                <Badge>{getTemperatureLabel(Number.parseFloat(getTemperatureValue(creativity[0])))}</Badge>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold">Polimento Universal</Label>
                <Checkbox
                  checked={universalPolish}
                  onCheckedChange={(checked) => setUniversalPolish(checked === true)}
                  className="h-4 w-4"
                />
              </div>
            </CardContent>
          </Card>

          {/* Coluna 3: Edição & Visualização */}
          <Card className="order-3 h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Edição & Visualização</CardTitle>
              <p className="text-xs text-muted-foreground">Cole sua letra aqui e visualize as alterações sugeridas.</p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Button
                variant="outline"
                className="w-full bg-transparent justify-start"
                size="sm"
                onClick={handleGenerateChorus}
                disabled={!genre || !theme || isEditing}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Gerar Refrão
              </Button>

              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold">Título</Label>
                <Input
                  placeholder="Digite o título..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="border rounded-lg p-3 bg-purple-50/50 space-y-2">
                <Label className="text-xs font-semibold">Letra Original</Label>
                <Textarea
                  placeholder="Cole a letra aqui..."
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  rows={10}
                  className="text-xs"
                />
              </div>

              <div className="border rounded-lg p-3 bg-purple-50/50 space-y-2">
                <Label className="text-xs font-semibold">Letra Editada</Label>
                <Textarea
                  placeholder="Aqui aparecerá a letra editada..."
                  value={lyrics}
                  readOnly
                  rows={10}
                  className="text-xs"
                />
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={handleEditLyrics} disabled={isEditing}>
                  {isEditing ? "Editando..." : "Editar Letra"}
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Salvar Projeto
                </Button>
                <Button size="sm" onClick={handleCopy}>
                  Copiar Letra
                </Button>
                <Button size="sm" onClick={handleClear}>
                  Limpar Letra
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showChorusDialog} onOpenChange={setShowChorusDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerador de Refrão</DialogTitle>
            <DialogDescription>
              A IA gerará automaticamente 5 refrões com notas. Selecione até 2 para adicionar aos requisitos.
            </DialogDescription>
          </DialogHeader>
          <ChorusGenerator
            genre={genre}
            theme={theme}
            mood={mood}
            onSelectChorus={handleSelectChoruses}
            showSelectionMode={true}
            maxSelection={2}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChorusDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApplyChoruses} disabled={selectedChoruses.length === 0}>
              Adicionar aos Requisitos ({selectedChoruses.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
