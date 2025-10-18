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
import { Sparkles, Save, Search, Loader2, Zap, Copy, Trash2, Wand2, Star, Trophy } from "lucide-react"
import { GENRE_CONFIGS } from "@/lib/genre-config"
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
import { SyllableValidator } from "@/components/syllable-validator"

const BRAZILIAN_GENRE_METRICS = {
  "Sertanejo Moderno": { syllablesPerLine: 6, bpm: 90, structure: "VERSO-REFRAO-PONTE" },
  Sertanejo: { syllablesPerLine: 7, bpm: 85, structure: "VERSO-REFRAO-PONTE" },
  "Sertanejo Universitário": { syllablesPerLine: 6, bpm: 95, structure: "VERSO-REFRAO" },
  "Sertanejo Sofrência": { syllablesPerLine: 8, bpm: 75, structure: "VERSO-REFRAO-PONTE" },
  "Sertanejo Raiz": { syllablesPerLine: 10, bpm: 80, structure: "VERSO-REFRAO" },
  Pagode: { syllablesPerLine: 7, bpm: 100, structure: "VERSO-REFRAO" },
  Samba: { syllablesPerLine: 7, bpm: 105, structure: "VERSO-REFRAO-PONTE" },
  Forró: { syllablesPerLine: 8, bpm: 120, structure: "VERSO-REFRAO" },
  Axé: { syllablesPerLine: 6, bpm: 130, structure: "VERSO-REFRAO" },
  MPB: { syllablesPerLine: 9, bpm: 90, structure: "VERSO-REFRAO-PONTE" },
  "Bossa Nova": { syllablesPerLine: 8, bpm: 70, structure: "VERSO-REFRAO" },
  Rock: { syllablesPerLine: 8, bpm: 115, structure: "VERSO-REFRAO-SOLO" },
  Pop: { syllablesPerLine: 7, bpm: 110, structure: "VERSO-REFRAO-PONTE" },
  Funk: { syllablesPerLine: 6, bpm: 125, structure: "REFRAO-VERSO" },
  Gospel: { syllablesPerLine: 8, bpm: 85, structure: "VERSO-REFRAO-PONTE" },
  default: { syllablesPerLine: 8, bpm: 100, structure: "VERSO-REFRAO" },
} as const

// ✅ CONFIGURAÇÃO UNIVERSAL DE QUALIDADE POR GÊNERO
const GENRE_QUALITY_CONFIG = {
  "Sertanejo": { min: 9, max: 11, ideal: 10, rhymeQuality: 0.5 },
  "Sertanejo Moderno": { min: 9, max: 11, ideal: 10, rhymeQuality: 0.5 },
  "Sertanejo Universitário": { min: 9, max: 11, ideal: 10, rhymeQuality: 0.5 },
  "Sertanejo Sofrência": { min: 9, max: 11, ideal: 10, rhymeQuality: 0.5 },
  "Sertanejo Raiz": { min: 9, max: 11, ideal: 10, rhymeQuality: 0.5 },
  "MPB": { min: 7, max: 12, ideal: 9, rhymeQuality: 0.6 },
  "Bossa Nova": { min: 7, max: 12, ideal: 9, rhymeQuality: 0.6 },
  "Funk": { min: 6, max: 10, ideal: 8, rhymeQuality: 0.3 },
  "Pagode": { min: 7, max: 11, ideal: 9, rhymeQuality: 0.4 },
  "Samba": { min: 7, max: 11, ideal: 9, rhymeQuality: 0.4 },
  "Forró": { min: 8, max: 11, ideal: 9, rhymeQuality: 0.4 },
  "Axé": { min: 6, max: 10, ideal: 8, rhymeQuality: 0.3 },
  "Rock": { min: 7, max: 11, ideal: 9, rhymeQuality: 0.4 },
  "Pop": { min: 7, max: 11, ideal: 9, rhymeQuality: 0.4 },
  "Gospel": { min: 8, max: 11, ideal: 9, rhymeQuality: 0.5 },
  "default": { min: 7, max: 11, ideal: 9, rhymeQuality: 0.4 }
}

const GENRES = ["Pop", "Sertanejo Moderno", "Sertanejo Universitário", "MPB", "Rock", "Funk", "Pagode", "Forró"]

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
  const [mood, setMood] = useState("")
  const [theme, setTheme] = useState("")
  const [avoidWords, setAvoidWords] = useState("")
  const [additionalReqs, setAdditionalReqs] = useState("")
  const [useDiary, setUseDiary] = useState(true)
  const [advancedMode, setAdvancedMode] = useState(false)
  const [creativity, setCreativity] = useState([50])
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
  const [chorusData, setChorusData] = useState<ChorusResponse | null>(null)
  const [selectedChoruses, setSelectedChoruses] = useState<ChorusVariation[]>([])
  const [isGeneratingChorus, setIsGeneratingChorus] = useState(false)
  const [showHookDialog, setShowHookDialog] = useState(false)
  const [selectedHook, setSelectedHook] = useState<string | null>(null)
  const [formattingStyle, setFormattingStyle] = useState("performatico")
  const [universalPolish, setUniversalPolish] = useState(true)

  // ✅ OBTER CONFIGURAÇÃO DE SÍLABAS POR GÊNERO
  const getSyllableConfig = (selectedGenre: string) => {
    const config = GENRE_QUALITY_CONFIG[selectedGenre as keyof typeof GENRE_QUALITY_CONFIG] || GENRE_QUALITY_CONFIG.default
    return {
      min: config.min,
      max: config.max,
      ideal: config.ideal
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
      const genreConfig = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS]
      const syllableConfig = getSyllableConfig(genre)

      const response = await fetch("/api/generate-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genero: genre,
          humor: mood,
          tema: theme,
          criatividade: creativity[0] < 33 ? "conservador" : creativity[0] < 66 ? "equilibrado" : "ousado",
          inspiracao: inspirationText,
          metaforas: metaphorSearch,
          emocoes: selectedEmotions,
          titulo: title,
          formattingStyle: formattingStyle,
          additionalRequirements: additionalReqs,
          advancedMode: advancedMode,
          universalPolish: universalPolish,
          syllableTarget: syllableConfig,
          metrics:
            BRAZILIAN_GENRE_METRICS[genre as keyof typeof BRAZILIAN_GENRE_METRICS] || BRAZILIAN_GENRE_METRICS.default,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar letra")
      }

      setLyrics(data.letra)
      if (data.titulo && !title) {
        setTitle(data.titulo)
      }
      
      // ✅ FEEDBACK DO SISTEMA UNIVERSAL
      if (data.metadata?.polishingApplied) {
        toast.success("Letra gerada com Sistema Universal de Qualidade!", {
          description: `Polimento específico para ${genre} aplicado com sucesso`
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

  const handleGenerateChorus = async () => {
    if (!genre || !theme) {
      toast.error("Selecione gênero e tema antes de gerar o refrão")
      return
    }

    setShowChorusDialog(true)
    setIsGeneratingChorus(true)
    setChorusData(null)
    setSelectedChoruses([])

    try {
      const response = await fetch("/api/generate-chorus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genre,
          theme,
          mood,
          advancedMode: advancedMode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar refrão")
      }

      setChorusData(data)

      // Selecionar automaticamente a melhor opção comercial
      if (data.bestCommercialOptionIndex !== undefined && data.variations[data.bestCommercialOptionIndex]) {
        setSelectedChoruses([data.variations[data.bestCommercialOptionIndex]])
      }

      toast.success("Refrões gerados com sucesso!")
    } catch (error) {
      console.error("[v0] Error generating chorus:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao gerar refrão")
      setShowChorusDialog(false)
    } finally {
      setIsGeneratingChorus(false)
    }
  }

  const handleSelectChorus = (chorus: ChorusVariation) => {
    setSelectedChoruses((prev) => {
      if (prev.find((c) => c.chorus === chorus.chorus)) {
        return prev.filter((c) => c.chorus !== chorus.chorus)
      }
      if (prev.length < 2) {
        return [...prev, chorus]
      } else {
        toast.error("Você pode selecionar no máximo 2 refrões")
        return prev
      }
    })
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

  // ✅ EXIBIR CONFIGURAÇÃO ATUAL DO GÊNERO
  const currentSyllableConfig = genre ? getSyllableConfig(genre) : null

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

              <div className="space-y-2">
                <Label className="text-xs">Gênero</Label>
                <GenreSelect value={genre} onValueChange={setGenre} className="h-9" />
                
                {/* ✅ EXIBIR CONFIGURAÇÃO DO GÊNERO SELECIONADO */}
                {currentSyllableConfig && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs">
                    <div className="font-semibold text-blue-800">Configuração {genre}:</div>
                    <div className="text-blue-700">
                      Sílabas: {currentSyllableConfig.min}-{currentSyllableConfig.max} (ideal: {currentSyllableConfig.ideal})
                    </div>
                    <div className="text-blue-700">
                      Rimas: {(GENRE_QUALITY_CONFIG[genre as keyof typeof GENRE_QUALITY_CONFIG]?.rhymeQuality * 100 || 40)}% mínimas
                    </div>
                  </div>
                )}
              </div>

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

              {/* ✅ NOVO: POLIMENTO UNIVERSAL */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="universalPolish"
                  checked={universalPolish}
                  onCheckedChange={(checked) => setUniversalPolish(checked as boolean)}
                />
                <div>
                  <Label htmlFor="universalPolish" className="text-xs cursor-pointer font-semibold text-green-600">
                    🎵 Sistema Universal de Polimento
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Aplica polimento específico por gênero, correção automática de rimas e instrumentos em inglês.
                  </p>
                </div>
              </div>

              <div className="space-y-3 border rounded-lg p-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <Label className="text-xs">Nível de Criatividade</Label>
                    <span className="text-xs text-muted-foreground">
                      {creativity[0] < 33 ? "Conservador" : creativity[0] < 66 ? "Equilibrado" : "Ousado"}
                    </span>
                  </div>
                  <Slider value={creativity} onValueChange={setCreativity} max={100} step={1} />
                  <p className="text-xs text-muted-foreground mt-1">
                    {creativity[0] < 33 
                      ? "Tradicional e previsível" 
                      : creativity[0] < 66 
                      ? "Equilíbrio entre tradição e originalidade" 
                      : "Originalidade e inovação máxima"}
                  </p>
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
                      ? "✅ FORMATO PROFISSIONAL: Instruções em inglês, letras empilhadas, backing vocals, estrutura A-B-C"
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
              {/* Diário de Inspiração */}
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

              {/* Inspiração Literária Global */}
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

              {/* Metáforas Inteligentes */}
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

              {/* Sensações & Emoções */}
              <div className="border rounded-lg p-3 bg-purple-50/50 space-y-2">
                <Label className="text-xs font-semibold">Sensações & Emoções</Label>
                <p className="text-xs text-muted-foreground">
                  O "como" a história será contada. O sentimento que dará o ton da letra.
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
            {/* Ferramentas de Composição */}
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
                  disabled={isGenerating || isGeneratingChorus}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Gerador de Hook
                </Button>

                <Button
                  variant="outline"
                  className="w-full bg-transparent justify-start"
                  size="sm"
                  onClick={handleGenerateChorus}
                  disabled={!genre || !theme || isGenerating || isGeneratingChorus}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Gerar Refrão
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
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {universalPolish ? "🎵 Gerar com Polimento Universal" : "Gerar Letra"}
                    </>
                  )}
                </Button>
                
                {/* ✅ STATUS DO SISTEMA UNIVERSAL */}
                {universalPolish && genre && (
                  <div className="bg-green-50 border border-green-200 rounded p-2 text-xs text-green-700">
                    <div className="font-semibold">Sistema Universal Ativo</div>
                    <div>Polimento específico para {genre} habilitado</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resultado */}
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
                  
                  {/* ✅ VALIDADOR DE SÍLABAS - CORRIGIDO (sem minSyllables) */}
                  <SyllableValidator
                    lyrics={lyrics}
                    maxSyllables={currentSyllableConfig?.max || 11}
                    onValidate={(result) => {
                      if (!result.valid) {
                        console.log(`⚠️ ${result.linesWithIssues} versos com problemas:`)
                        result.violations.forEach((v) => {
                          console.log(`  Linha ${v.line}: "${v.text}" → ${v.syllables} sílabas`)
                        })
                        
                        const minSyllables = currentSyllableConfig?.min || 7
                        const maxSyllables = currentSyllableConfig?.max || 11
                        
                        toast.warning(`${result.linesWithIssues} versos fora do padrão ${genre}`, {
                          description: `Use ${minSyllables}-${maxSyllables} sílabas`,
                          duration: 5000
                        })
                      } else if (result.totalLines > 0) {
                        toast.success(`✓ Letra validada: ${result.totalLines} versos dentro do padrão ${genre}`)
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

      {/* Dialog para Sugestões de Refrão */}
      <Dialog open={showChorusDialog} onOpenChange={setShowChorusDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sugestões de Refrão</DialogTitle>
            <DialogDescription>
              A IA gerou 5 variações de refrão com base no seu tema e gênero. A opção mais comercial foi selecionada
              automaticamente. Você pode selecionar até 2 para adicionar aos requisitos.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            {isGeneratingChorus && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Gerando refrões...</span>
              </div>
            )}

            {chorusData &&
              chorusData.variations.map((variation, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all ${
                    selectedChoruses.find((c) => c.chorus === variation.chorus)
                      ? "border-primary ring-2 ring-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleSelectChorus(variation)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{variation.style}</CardTitle>
                        <div className="flex items-center gap-2">
                          {renderStars(variation.score)}
                          <span className="text-xs font-bold text-muted-foreground">({variation.score}/10)</span>
                        </div>
                      </div>
                      {chorusData.bestCommercialOptionIndex === index && (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                          <Trophy className="h-3 w-3 mr-1" />
                          Melhor Opção Comercial
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm whitespace-pre-line font-mono bg-muted/50 p-3 rounded">
                      {variation.chorus.replace(/\s\/\s/g, "\n")}
                    </p>
                    <p className="text-xs text-muted-foreground italic">{variation.justification}</p>
                  </CardContent>
                </Card>
              ))}
          </div>

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
