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
import { RefreshCw, Sparkles, Trash2, Search, Save, Copy } from "lucide-react"
import { toast } from "sonner"
import { GenreSelect } from "@/components/genre-select"
import { SyllableValidator } from "@/components/syllable-validator"
import { RhymeAnalyzer } from "@/components/rhyme-analyzer"
import { validateSyllablesByGenre } from "@/lib/validation/absolute-syllable-enforcer"

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
  Sertanejo: { min: 9, max: 11, ideal: 10, rhymeQuality: 0.5 },
  "Sertanejo Moderno": { min: 9, max: 11, ideal: 10, rhymeQuality: 0.5 },
  "Sertanejo Universitário": { min: 9, max: 11, ideal: 10, rhymeQuality: 0.5 },
  "Sertanejo Sofrência": { min: 9, max: 11, ideal: 10, rhymeQuality: 0.5 },
  "Sertanejo Raiz": { min: 9, max: 11, ideal: 10, rhymeQuality: 0.5 },
  MPB: { min: 7, max: 12, ideal: 9, rhymeQuality: 0.6 },
  "Bossa Nova": { min: 7, max: 12, ideal: 9, rhymeQuality: 0.6 },
  Funk: { min: 6, max: 10, ideal: 8, rhymeQuality: 0.3 },
  Pagode: { min: 7, max: 11, ideal: 9, rhymeQuality: 0.4 },
  Samba: { min: 7, max: 11, ideal: 9, rhymeQuality: 0.4 },
  Forró: { min: 8, max: 11, ideal: 9, rhymeQuality: 0.4 },
  Axé: { min: 6, max: 10, ideal: 8, rhymeQuality: 0.3 },
  Rock: { min: 7, max: 11, ideal: 9, rhymeQuality: 0.4 },
  Pop: { min: 7, max: 11, ideal: 9, rhymeQuality: 0.4 },
  Gospel: { min: 8, max: 11, ideal: 9, rhymeQuality: 0.5 },
  default: { min: 7, max: 11, ideal: 9, rhymeQuality: 0.4 },
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
  const [creativity, setCreativity] = useState([80]) // Default 80 = 0.80 temperature
  const [formattingStyle, setFormattingStyle] = useState<"padrao" | "performatico">("performatico")
  const [universalPolish, setUniversalPolish] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [savedInspirations, setSavedInspirations] = useState<Array<{ text: string; timestamp: number }>>([])

  const getSyllableConfig = (selectedGenre: string) => {
    const config =
      GENRE_QUALITY_CONFIG[selectedGenre as keyof typeof GENRE_QUALITY_CONFIG] || GENRE_QUALITY_CONFIG.default
    return {
      min: config.min,
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
    const maxSyllables = syllableValidation.maxSyllables

    const requestBody = {
      originalLyrics: lyrics,
      genre,
      mood: mood || "Romântico",
      theme: theme || "Amor",
      additionalRequirements: additionalReqs,
      title,
      syllableTarget: currentSyllableConfig, // ✅ CORRIGIDO
      performanceMode: formattingStyle === "performatico" ? "performance" : "standard",
      temperature: Number.parseFloat(getTemperatureValue(creativity[0])),
    }

    // ... resto do código ...
  } catch (error) {
    // ...
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

  const currentSyllableConfig = genre ? getSyllableConfig(genre) : null

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

                {currentSyllableConfig && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs">
                    <div className="font-semibold text-blue-800">Configuração {genre}:</div>
                    <div className="text-blue-700">
                      Sílabas: {currentSyllableConfig.min}-{currentSyllableConfig.max} (ideal:{" "}
                      {currentSyllableConfig.ideal})
                    </div>
                    <div className="text-blue-700">
                      Rimas:{" "}
                      {GENRE_QUALITY_CONFIG[genre as keyof typeof GENRE_QUALITY_CONFIG]?.rhymeQuality * 100 || 40}%
                      mínimas
                    </div>
                  </div>
                )}

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

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="advancedMode"
                    checked={advancedMode}
                    onCheckedChange={(checked) => setAdvancedMode(checked as boolean)}
                  />
                  <div>
                    <Label htmlFor="advancedMode" className="text-xs cursor-pointer font-semibold">
                      Modo Avançado
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Rimas perfeitas, métrica rigorosa, ganchos premium em PT-BR, linguagem limpa e fidelidade de
                      estilo.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="universalPolish"
                    checked={universalPolish}
                    onCheckedChange={(checked) => setUniversalPolish(checked as boolean)}
                  />
                  <div>
                    <Label htmlFor="universalPolish" className="text-xs cursor-pointer font-semibold text-green-600">
                      Sistema Universal de Polimento
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Aplica polimento específico por gênero, correção automática de rimas e instrumentos em inglês.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 border rounded-lg p-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-xs font-semibold">Temperatura da IA</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-mono font-bold text-primary">
                        {getTemperatureValue(creativity[0])}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {getTemperatureLabel(Number.parseFloat(getTemperatureValue(creativity[0])))}
                      </Badge>
                    </div>
                  </div>
                  <Slider
                    value={creativity}
                    onValueChange={setCreativity}
                    min={50}
                    max={100}
                    step={1}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.50</span>
                    <span>0.70</span>
                    <span className="font-semibold text-primary">0.80 (padrão)</span>
                    <span>1.00</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-800">
                    <div className="font-semibold flex items-center gap-1">⚠️ Controle Sensível</div>
                    <div className="mt-1">
                      {Number.parseFloat(getTemperatureValue(creativity[0])) < 0.7 &&
                        "Edições conservadoras e previsíveis. Mantém estrutura original."}
                      {Number.parseFloat(getTemperatureValue(creativity[0])) >= 0.7 &&
                        Number.parseFloat(getTemperatureValue(creativity[0])) < 0.85 &&
                        "Equilíbrio entre preservação e criatividade nas edições."}
                      {Number.parseFloat(getTemperatureValue(creativity[0])) >= 0.85 &&
                        Number.parseFloat(getTemperatureValue(creativity[0])) < 0.95 &&
                        "Edições criativas com mudanças significativas."}
                      {Number.parseFloat(getTemperatureValue(creativity[0])) >= 0.95 &&
                        "Edições experimentais com máxima liberdade criativa."}
                    </div>
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
              </div>
            </CardContent>
          </Card>

          {/* Coluna 3: Editor de Letra */}
          <Card className="order-3 space-y-4 h-fit">
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
                  <span className="text-xs">
                    {isEditing ? "Editando..." : universalPolish ? "Editar com Polimento" : "Editar"}
                  </span>
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

              {universalPolish && genre && (
                <div className="bg-green-50 border border-green-200 rounded p-2 text-xs text-green-700 mt-2">
                  <div className="font-semibold">Sistema Universal Ativo</div>
                  <div>Polimento específico para {genre} habilitado</div>
                </div>
              )}
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

                <SyllableValidator
                  lyrics={lyrics}
                  maxSyllables={currentSyllableConfig?.max || 11}
                  onValidate={(result) => {
                    if (!result.valid) {
                      toast.warning(`${result.linesWithIssues} versos fora do padrão ${genre}`, {
                        description: `Use ${currentSyllableConfig?.min}-${currentSyllableConfig?.max} sílabas`,
                        duration: 5000,
                      })
                    }
                  }}
                />

                <RhymeAnalyzer
                  lyrics={lyrics}
                  genre={genre}
                  onAnalysis={(report) => {
                    if (report.overallScore < 60) {
                      toast.warning(`Rimas precisam de melhoria (Score: ${report.overallScore})`)
                    }
                  }}
                />
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={handleCopy} disabled={!lyrics}>
                  <Copy className="h-3 w-3 mr-1" />
                  Copiar
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-transparent"
                  variant="outline"
                  onClick={handleSave}
                  disabled={!title || !lyrics}
                >
                  <Save className="h-3 w-3 mr-1" />
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
