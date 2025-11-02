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
import { RefreshCw, Save, Search, Loader2, Zap, Copy, Trash2, Wand2, Star, Trophy } from "lucide-react"
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
import { getGenreMetrics } from "@/lib/metrics/brazilian-metrics"

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

export default function ReescreverPage() {
  const [originalLyrics, setOriginalLyrics] = useState("")
  const [genre, setGenre] = useState("")
  const [mood, setMood] = useState("")
  const [theme, setTheme] = useState("")
  const [avoidWords, setAvoidWords] = useState("")
  const [additionalReqs, setAdditionalReqs] = useState("")
  const [useDiary, setUseDiary] = useState(true)
  const [advancedMode, setAdvancedMode] = useState(false)
  const [creativity, setCreativity] = useState([80])
  const [inspirationText, setInspirationText] = useState("")
  const [literaryGenre, setLiteraryGenre] = useState("")
  const [literaryEmotion, setLiteraryEmotion] = useState("")
  const [metaphorSearch, setMetaphorSearch] = useState("")
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [title, setTitle] = useState("")
  const [chords, setChords] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [isRewriting, setIsRewriting] = useState(false)
  const [showHookDialog, setShowHookDialog] = useState(false)
  const [selectedHook, setSelectedHook] = useState<string | null>(null)
  const [showChorusDialog, setShowChorusDialog] = useState(false)
  const [chorusData, setChorusData] = useState<ChorusResponse | null>(null)
  const [selectedChoruses, setSelectedChoruses] = useState<ChorusVariation[]>([])
  const [isGeneratingChorus, setIsGeneratingChorus] = useState(false)
  const [formattingStyle, setFormattingStyle] = useState("performatico")
  const [universalPolish, setUniversalPolish] = useState(true)

  const getSyllableConfig = (selectedGenre: string) => {
    const config =
      GENRE_QUALITY_CONFIG[selectedGenre as keyof typeof GENRE_QUALITY_CONFIG] || GENRE_QUALITY_CONFIG.default
    return {
      min: config.min,
      max: config.max,
      ideal: config.ideal,
    }
  }

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions((prev) => (prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]))
  }

  const handleRewriteLyrics = async () => {
    if (!originalLyrics.trim()) {
      toast.error("Por favor, cole a letra original para reescrever")
      return
    }

    if (!genre) {
      toast.error("Por favor, selecione um gênero musical")
      return
    }

    setIsRewriting(true)

    try {
      const genreMetrics = getGenreMetrics(genre)
      const syllableConfig = getSyllableConfig(genre)

      const response = await fetch("/api/rewrite-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalLyrics,
          genre: genre, // ✅ Changed from "genero" to "genre"
          mood: mood,
          theme: theme,
          additionalRequirements: additionalReqs,
          title: title,
          syllableTarget: syllableConfig,
          performanceMode: formattingStyle === "performatico" ? "performance" : "standard",
          temperature: Number.parseFloat(getTemperatureValue(creativity[0])),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao reescrever letra")
      }

      setLyrics(data.letra || data.lyrics)
      if (data.titulo && !title) {
        setTitle(data.titulo)
      }

      if (data.metadata?.polishingApplied) {
        toast.success("Letra reescrita com Sistema Universal de Qualidade!", {
          description: `Polimento específico para ${genre} aplicado com sucesso`,
        })
      } else {
        toast.success("Letra reescrita com sucesso!")
      }
    } catch (error) {
      console.error("[v0] Error rewriting lyrics:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao reescrever letra")
    } finally {
      setIsRewriting(false)
    }
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

  return (
    <div className="bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-4 pt-20">
        <h1 className="text-2xl font-bold text-left mb-4">Reescrever Letra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Coluna 1: Parâmetros de Reescrita */}
          <Card className="order-1 h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Parâmetros de Reescrita</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-2">
                <Label className="text-xs">Letra Original</Label>
                <Textarea
                  placeholder="Cole aqui a letra que deseja reescrever..."
                  value={originalLyrics}
                  onChange={(e) => setOriginalLyrics(e.target.value)}
                  rows={8}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Cole a letra que você quer melhorar. A IA vai reescrevê-la mantendo a essência.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Gênero</Label>
                <GenreSelect value={genre} onValueChange={setGenre} className="h-9" />

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
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Humor</Label>
                <Input
                  placeholder="Ex: Feliz, Triste, Nostálgico..."
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Tema</Label>
                <Input
                  placeholder="Amor, Perda, Jornada, etc."
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Evitar palavras (separe por vírgula)</Label>
                <Input
                  placeholder="Ex: coraçãozinho, saudadezinha"
                  value={avoidWords}
                  onChange={(e) => setAvoidWords(e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Requisitos Adicionais</Label>
                <Textarea
                  placeholder="Mudanças específicas que você quer..."
                  value={additionalReqs}
                  onChange={(e) => setAdditionalReqs(e.target.value)}
                  rows={2}
                  className="text-xs"
                />
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
                    <span className="font-semibold text-primary">0.80 (padrão)</span>
                    <span>1.00</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-800">
                    <div className="font-semibold flex items-center gap-1">⚠️ Controle Sensível</div>
                    <div className="mt-1">
                      {Number.parseFloat(getTemperatureValue(creativity[0])) < 0.7 &&
                        "Reescrita conservadora mantendo estrutura original. Mudanças mínimas."}
                      {Number.parseFloat(getTemperatureValue(creativity[0])) >= 0.7 &&
                        Number.parseFloat(getTemperatureValue(creativity[0])) < 0.85 &&
                        "Equilíbrio entre preservação e inovação. Recomendado para reescritas."}
                      {Number.parseFloat(getTemperatureValue(creativity[0])) >= 0.85 &&
                        Number.parseFloat(getTemperatureValue(creativity[0])) < 0.95 &&
                        "Reescrita criativa com mudanças significativas mantendo essência."}
                      {Number.parseFloat(getTemperatureValue(creativity[0])) >= 0.95 &&
                        "Reescrita experimental com máxima liberdade criativa."}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Estilo de Formatação</Label>
                  <Select value={formattingStyle} onValueChange={setFormattingStyle}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="padrao">Padrão</SelectItem>
                      <SelectItem value="performatico">Performático</SelectItem>
                    </SelectContent>
                  </Select>
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
                  </TabsContent>
                </Tabs>
              </div>

              <div className="border rounded-lg p-3 bg-purple-50/50 space-y-2">
                <Label className="text-xs font-semibold">Inspiração Literária Global</Label>
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
              </div>

              <div className="border rounded-lg p-3 bg-purple-50/50 space-y-2">
                <Label className="text-xs font-semibold">Metáforas Inteligentes</Label>
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
                  disabled={isRewriting || isGeneratingChorus}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Gerador de Hook
                </Button>

                <Button
                  variant="outline"
                  className="w-full bg-transparent justify-start"
                  size="sm"
                  onClick={handleGenerateChorus}
                  disabled={!genre || !theme || isRewriting || isGeneratingChorus}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Gerar Refrão
                </Button>

                <Button
                  className="w-full justify-start"
                  size="sm"
                  onClick={handleRewriteLyrics}
                  disabled={isRewriting || !originalLyrics || !genre}
                >
                  {isRewriting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Reescrevendo...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {universalPolish ? "Reescrever com Polimento Universal" : "Reescrever Letra"}
                    </>
                  )}
                </Button>

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
                  <Label className="text-xs">Letra Reescrita</Label>
                  <Textarea
                    placeholder="Sua letra reescrita aparecerá aqui..."
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    rows={12}
                    className="font-mono text-xs"
                  />

                  <SyllableValidatorEditable
                    lyrics={lyrics}
                    maxSyllables={currentSyllableConfig?.max || 12}
                    onLyricsChange={(newLyrics) => {
                      setLyrics(newLyrics)
                      toast.success("Letra atualizada com correções!")
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
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      if (!lyrics.trim()) {
                        toast.error("Nada para copiar")
                        return
                      }
                      navigator.clipboard.writeText(lyrics)
                      toast.success("Letra copiada!")
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
                  <Button size="sm" className="flex-1" disabled={!title || !lyrics}>
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
          <HookGenerator
            onSelectHook={handleSelectHook}
            showSelectionMode={true}
            initialLyrics={originalLyrics}
            initialGenre={genre}
            initialTheme={theme}
          />
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
