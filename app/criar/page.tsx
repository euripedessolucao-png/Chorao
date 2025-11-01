// app/criar/page.tsx - VERSÃO COMPLETA E CORRIGIDA
"use client"

import { useState } from "react"
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
import { Sparkles, Save, Search, Loader2, Zap, Copy, Trash2, Wand2, Star, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EMOTIONS } from "@/lib/genres"
import { GenreSelect } from "@/components/genre-select"
import { HookGenerator } from "@/components/hook-generator"
import { SyllableValidatorEditable } from "@/components/syllable-validator-editable"
import { RhymeAnalyzer } from "@/components/rhyme-analyzer"
import { ProcessingStatus } from "@/components/processing-status"
import { SubgenreSelect } from "@/components/subgenre-select"
import { ChorusGenerator } from "@/components/chorus-generator"

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

type ChorusVariation = {
  chorus: string
  style: string
  score: number
  justification: string
}

type ChorusResponse = {
  variations: ChorusVariation[]
  bestCommercialOptionIndex: number
}

export default function CriarPage() {
  const [genre, setGenre] = useState("")
  const [subgenre, setSubgenre] = useState("")
  const [mood, setMood] = useState("")
  const [theme, setTheme] = useState("")
  const [avoidWords, setAvoidWords] = useState("")
  const [additionalReqs, setAdditionalReqs] = useState("")
  const [useDiary, setUseDiary] = useState(true)
  const [advancedMode, setAdvancedMode] = useState(false)
  const [creativity, setCreativity] = useState([85])
  const [inspirationText, setInspirationText] = useState("")
  const [literaryGenre, setLiteraryGenre] = useState("")
  const [literaryEmotion, setLiteraryEmotion] = useState("")
  const [metaphorSearch, setMetaphorSearch] = useState("")
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [title, setTitle] = useState("")
  const [chords, setChords] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showChorusDialog, setShowChorusDialog] = useState(false)
  const [selectedChoruses, setSelectedChoruses] = useState<any[]>([])
  const [showHookDialog, setShowHookDialog] = useState(false)
  const [selectedHook, setSelectedHook] = useState<string | null>(null)
  const [formattingStyle, setFormattingStyle] = useState("padrao")
  const [universalPolish, setUniversalPolish] = useState(false)

  const processingSteps = [
    { id: "validate", label: "Validando parâmetros", duration: 500 },
    { id: "generate", label: "Gerando letra com IA", duration: 8000 },
    { id: "capitalize", label: "Capitalizando linhas", duration: 300 },
    { id: "enforce", label: "🎯 Aplicando correção automática de sílabas", duration: 1500 },
    { id: "commercial", label: "⭐ Selecionando melhor refrão comercial", duration: 1000 },
    { id: "stack", label: "Empilhando versos (LineStacker)", duration: 1000 },
    { id: "performance", label: "Formatando performance", duration: 800 },
    { id: "instrumentation", label: "Adicionando instrumentação", duration: 500 },
    { id: "validate-final", label: "Validação final de métrica", duration: 400 },
  ]

  const getSyllableConfig = (selectedGenre: string) => {
    const config =
      GENRE_QUALITY_CONFIG[selectedGenre as keyof typeof GENRE_QUALITY_CONFIG] || GENRE_QUALITY_CONFIG.default
    return {
      max: config.max,
      ideal: config.ideal,
    }
  }

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions((prev) => (prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]))
  }

  const handleGenerateLyrics = async () => {
    if (!genre) {
      toast.error("Por favor, selecione um gênero musical")
      return
    }

    setIsGenerating(true)

    try {
      const syllableConfig = getSyllableConfig(genre)

      const fullRequirements = subgenre ? `${additionalReqs}\n\nRitmo/Subgênero: ${subgenre}` : additionalReqs

      const response = await fetch("/api/generate-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genre: genre,
          mood: mood,
          theme: theme,
          title: title,
          additionalRequirements: fullRequirements,
          performanceMode: formattingStyle === "performatico" ? "performance" : "standard",
          temperature: Number.parseFloat(getTemperatureValue(creativity[0])),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar letra")
      }

      setLyrics(data.letra || data.lyrics)
      if (data.titulo && !title) {
        setTitle(data.titulo)
      }

      if (data.metadata?.polishingApplied) {
        toast.success("Letra gerada com Sistema Universal de Qualidade!", {
          description: `Polimento específico para ${genre} aplicado com sucesso`,
        })
      } else {
        toast.success("Letra gerada com sucesso!")
      }
    } catch (error) {
      console.error("[v0] Error generating lyrics:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao gerar letra")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveProject = () => {
    if (!title || !lyrics) {
      toast.error("Adicione um título e letra antes de salvar")
      return
    }

    const projects = JSON.parse(localStorage.getItem("projects") || "[]")
    const newProject = {
      id: Date.now(),
      title,
      genre,
      lyrics,
      chords,
      date: new Date().toISOString(),
    }
    projects.push(newProject)
    localStorage.setItem("projects", JSON.stringify(projects))

    toast.success("Projeto salvo com sucesso!")
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
      toast.info("Usando o refrão melhor avaliado automaticamente")
    }

    const bestChorus = selectedChoruses[0] || selectedChoruses
    const chorusText = bestChorus.chorus.replace(/\s\/\s/g, "\n")
    
    const updatedReqs = additionalReqs 
      ? `${additionalReqs}\n\n[REFRAO_COMERCIAL]\n${chorusText}`
      : `[REFRAO_COMERCIAL]\n${chorusText}`

    setAdditionalReqs(updatedReqs)
    setShowChorusDialog(false)

    toast.success("🎵 Refrão comercial aplicado!", {
      description: "Melhor opção selecionada automaticamente com correção de sílabas"
    })
  }

  const handleSelectHook = (hook: string) => {
    setSelectedHook(hook)
  }

  const handleApplyHook = () => {
    if (!selectedHook) {
      toast.error("Selecione um hook")
      return
    }

    const hookText = `[HOOK]\n${selectedHook}`
    const updatedReqs = additionalReqs ? `${additionalReqs}\n\n${hookText}` : hookText

    setAdditionalReqs(updatedReqs)
    setShowHookDialog(false)

    toast.success("Hook adicionado aos requisitos!")
  }

  const handleClearLyrics = () => {
    if (
      window.confirm("Limpar letra? Esta ação irá limpar o título, letra e acordes. Esta ação não pode ser desfeita.")
    ) {
      setLyrics("")
      setTitle("")
      setChords("")
      toast.success("Letra limpa com sucesso!")
    }
  }

  const renderStars = (score: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < score ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
          />
        ))}
      </div>
    )
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
    <div className="bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-4 pt-20">
        <h1 className="text-2xl font-bold text-left mb-4">Criar Nova Letra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Coluna 1: Parâmetros da Letra */}
          <Card className="order-1 h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Parâmetros da Letra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                Mostrar informações dos gêneros
              </Button>

              <div className="space-y-3 border rounded-lg p-3 bg-blue-50/30">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">1. Gênero Musical</Label>
                  <GenreSelect
                    value={genre}
                    onValueChange={(value) => {
                      setGenre(value)
                      setSubgenre("")
                    }}
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">2. Ritmo/Subgênero</Label>
                  <SubgenreSelect genre={genre} value={subgenre} onValueChange={setSubgenre} />
                  {!genre && <p className="text-xs text-muted-foreground italic">Selecione um gênero primeiro</p>}
                  {genre && subgenre && (
                    <div className="bg-green-50 border border-green-200 rounded p-2 text-xs text-green-700">
                      <div className="font-semibold">Ritmo selecionado: {subgenre}</div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Tema</Label>
                  <Input
                    placeholder="Amor, Perda, Jornada, etc."
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="h-9"
                  />
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                    Buscar ideias de Tema
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Use Tema para definir "o quê" da sua música (a história) e Sensações & Emoções para definir "como" a
                    história é contada (o sentimento).
                  </p>
                </div>
              </div>

              {currentSyllableConfig && (
                <div className="bg-green-50 border border-green-200 rounded p-2 text-xs">
                  <div className="font-semibold text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    Sistema Automático Ativo
                  </div>
                  <div className="text-green-700 mt-1">
                    • Correção automática de sílabas ({currentSyllableConfig.max} máx)
                  </div>
                  <div className="text-green-700">
                    • Seleção do melhor refrão comercial
                  </div>
                  <div className="text-green-700">
                    • Polimento universal por gênero
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs">Humor</Label>
                <Input
                  placeholder="Ex: Feliz, Triste, Nostálgico, Melancólico..."
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="h-9"
                />
                <p className="text-xs text-muted-foreground">Descreva o humor/sentimento desejado para a composição</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Evitar palavras (separe por vírgula)</Label>
                <Input
                  placeholder="Ex: coraçãozinho, saudadezinha, meu lençol"
                  value={avoidWords}
                  onChange={(e) => setAvoidWords(e.target.value)}
                  className="h-9"
                />
                <p className="text-xs text-muted-foreground">
                  Indique palavras ou frases que NÃO devem aparecer na letra.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Requisitos Adicionais</Label>
                <Textarea
                  placeholder="Quaisquer elementos específicos que você queira incluir..."
                  value={additionalReqs}
                  onChange={(e) => setAdditionalReqs(e.target.value)}
                  rows={2}
                  className="text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Forneça referências de artistas, compositores ou estilos específicos para a IA emular durante a
                  escrita.
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="useDiary"
                  checked={useDiary}
                  onCheckedChange={(checked) => setUseDiary(checked as boolean)}
                />
                <div>
                  <Label htmlFor="useDiary" className="text-xs cursor-pointer">
                    Usar inspirações do Diário
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Inclui automaticamente todas as inspirações salvas no seu diário na geração da letra.
                  </p>
                </div>
              </div>

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
                    Rimas perfeitas, métrica rigorosa, ganchos premium em PT-BR, linguagem limpa e fidelidade de estilo.
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
                    <span className="font-semibold text-primary">0.85 (padrão)</span>
                    <span>1.00</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-800">
                    <div className="font-semibold flex items-center gap-1">⚠️ Controle Sensível</div>
                    <div className="mt-1">
                      {Number.parseFloat(getTemperatureValue(creativity[0])) < 0.7 &&
                        "Respostas mais previsíveis e conservadoras. Ideal para manter padrões estabelecidos."}
                      {Number.parseFloat(getTemperatureValue(creativity[0])) >= 0.7 &&
                        Number.parseFloat(getTemperatureValue(creativity[0])) < 0.85 &&
                        "Equilíbrio entre criatividade e consistência. Bom para a maioria dos casos."}
                      {Number.parseFloat(getTemperatureValue(creativity[0])) >= 0.85 &&
                        Number.parseFloat(getTemperatureValue(creativity[0])) < 0.95 &&
                        "Alta criatividade e originalidade. Recomendado para letras comerciais e inovadoras."}
                      {Number.parseFloat(getTemperatureValue(creativity[0])) >= 0.95 &&
                        "Máxima criatividade e experimentação. Pode gerar resultados inesperados e únicos."}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <Label className="text-xs">Qualidade do Modelo</Label>
                    <span className="text-xs text-muted-foreground">Equilíbrio (padrão)</span>
                  </div>
                  <Select defaultValue="standard">
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Equilíbrio (padrão)</SelectItem>
                      <SelectItem value="high">Alta Qualidade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <Label className="text-xs">Estilo de Formatação</Label>
                    <span className="text-xs text-muted-foreground">
                      {formattingStyle === "padrao" ? "Padrão" : "Performático"}
                    </span>
                  </div>
                  <Select value={formattingStyle} onValueChange={setFormattingStyle}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="padrao">Padrão</SelectItem>
                      <SelectItem value="performatico">Performático</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formattingStyle === "performatico"
                      ? "FORMATO PROFISSIONAL: Instruções em inglês, letras empilhadas, backing vocals, estrutura A-B-C"
                      : "Formato simples com marcadores básicos"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coluna 2: Inspiração & Sensações */}
          <Card className="order-2 h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Inspiração & Sensações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="border rounded-lg p-3 bg-purple-50/50 space-y-2">
                <Label className="text-xs font-semibold">Diário de Inspiração</Label>
                <p className="text-xs text-muted-foreground">
                  Adicione textos, áudios, imagens ou links que representam experiências, sensações ou histórias reais.
                </p>
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
                <p className="text-xs text-muted-foreground">
                  Busque referências criativas em best-sellers, romances e grandes histórias do mundo todo.
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Gênero musical"
                    value={literaryGenre}
                    onChange={(e) => setLiteraryGenre(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Input
                    placeholder="Emoção (opcional)"
                    value={literaryEmotion}
                    onChange={(e) => setLiteraryEmotion(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Button size="sm" className="h-8">
                    Buscar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Busque por um tema ou palavra-chave.</p>
              </div>

              <div className="border rounded-lg p-3 bg-purple-50/50 space-y-2">
                <Label className="text-xs font-semibold">Metáforas Inteligentes</Label>
                <p className="text-xs text-muted-foreground">Busque metáforas por tema para enriquecer sua letra.</p>
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
                <p className="text-xs text-muted-foreground">Busque por um tema ou palavra-chave.</p>
              </div>

              <div className="border rounded-lg p-3 bg-purple-50/50 space-y-2">
                <Label className="text-xs font-semibold">Sensações & Emoções</Label>
                <p className="text-xs text-muted-foreground">
                  O "como" a história será contada. O sentimento que dará o tom da letra.
                </p>
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
                <p className="text-xs text-muted-foreground">
                  Dica: A letra será reescrita com base no conteúdo que você colar, mas o Tema será inferido pela IA.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Coluna 3: Ferramentas e Resultado */}
          <div className="order-3 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ferramentas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full bg-transparent justify-start"
                  size="sm"
                  onClick={() => setShowHookDialog(true)}
                  disabled={isGenerating}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Gerador de Hook
                </Button>

                <Button
                  variant="outline"
                  className="w-full bg-transparent justify-start"
                  size="sm"
                  onClick={handleGenerateChorus}
                  disabled={!genre || !theme || isGenerating}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  🎯 Refrão Comercial Automático
                </Button>

                <Button
                  className="w-full justify-start"
                  size="sm"
                  onClick={handleGenerateLyrics}
                  disabled={isGenerating || !genre}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando com Sistema Automático...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      🚀 Gerar com Sistema Automático
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <ProcessingStatus
                    isProcessing={isGenerating}
                    steps={processingSteps}
                    onComplete={() => console.log("[v0] Processing completed")}
                  />
                )}

                {universalPolish && genre && (
                  <div className="bg-green-50 border border-green-200 rounded p-2 text-xs text-green-700">
                    <div className="font-semibold">Sistema Universal Ativo</div>
                    <div>Polimento específico para {genre} habilitado</div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Resultado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Input
                  placeholder="Título da música..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-9"
                />

                <div className="space-y-2">
                  <Label className="text-xs">Acordes</Label>
                  <Textarea
                    placeholder="Os acordes gerados aparecerão aqui..."
                    value={chords}
                    onChange={(e) => setChords(e.target.value)}
                    rows={3}
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Letra</Label>
                  <Textarea
                    placeholder="Sua letra aparecerá aqui..."
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    rows={12}
                    className="font-mono text-xs"
                  />

                  <SyllableValidatorEditable
                    lyrics={lyrics}
                    onLyricsChange={setLyrics}
                    maxSyllables={currentSyllableConfig?.max || 12}
                    genre={genre}
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
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      if (!lyrics.trim()) {
                        toast.error("Nada para copiar", {
                          description: "A letra está vazia.",
                        })
                        return
                      }
                      navigator.clipboard.writeText(lyrics)
                      toast.success("Letra copiada para a área de transferência!")
                    }}
                    disabled={!lyrics}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={handleClearLyrics}
                    disabled={!lyrics && !title && !chords}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Limpar
                  </Button>
                  <Button size="sm" className="flex-1" onClick={handleSaveProject} disabled={!title || !lyrics}>
                    <Save className="h-3 w-3 mr-1" />
                    Salvar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showHookDialog} onOpenChange={setShowHookDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerador de Hook & Ganchômetro</DialogTitle>
            <DialogDescription>
              Analise sua letra e escolha o melhor hook entre 3 variações geradas pela Terceira Via
            </DialogDescription>
          </DialogHeader>
          <HookGenerator onSelectHook={handleSelectHook} showSelectionMode={true} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHookDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApplyHook} disabled={!selectedHook}>
              Adicionar aos Requisitos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showChorusDialog} onOpenChange={setShowChorusDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>🎵 Refrão Comercial Automático</DialogTitle>
            <DialogDescription>
              <div className="space-y-2">
                <p>O sistema já seleciona automaticamente o <strong>melhor refrão comercial</strong> para você!</p>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Correção automática de sílabas aplicada</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <Star className="h-4 w-4" />
                  <span className="text-sm font-medium">Melhor opção comercial já selecionada</span>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          <ChorusGenerator
            genre={genre}
            theme={theme}
            mood={mood}
            onSelectChorus={handleSelectChoruses}
            showSelectionMode={true}
            maxSelection={1}
          />

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-semibold text-blue-800">Sistema Inteligente Ativo</h4>
                <p className="text-sm text-blue-700">
                  O refrão <strong>melhor avaliado comercialmente</strong> já está pré-selecionado. 
                  O sistema aplica automaticamente correções de sílabas para garantir a métrica perfeita.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChorusDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApplyChoruses} disabled={selectedChoruses.length === 0}>
              ✅ Usar Refrão Recomendado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
