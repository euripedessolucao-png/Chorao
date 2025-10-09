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
import { RefreshCw, Save, Copy, Search, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { GENRE_CONFIGS } from "@/lib/genre-config"

const GENRES = ["Pop", "Sertanejo Moderno", "MPB", "Rock", "Funk"]
const MOODS = ["Feliz", "Triste", "Nostálgico", "Apaixonado"]
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

export default function ReescreverPage() {
  const [originalLyrics, setOriginalLyrics] = useState("")
  const [genre, setGenre] = useState("")
  const [theme, setTheme] = useState("")
  const [avoidWords, setAvoidWords] = useState("")
  const [additionalReqs, setAdditionalReqs] = useState("")
  const [useDiary, setUseDiary] = useState(true)
  const [inspirationText, setInspirationText] = useState("")
  const [literaryGenre, setLiteraryGenre] = useState("")
  const [metaphorSearch, setMetaphorSearch] = useState("")
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [title, setTitle] = useState("")
  const [chords, setChords] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [isRewriting, setIsRewriting] = useState(false)

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions((prev) => (prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]))
  }

  const handleRewriteLyrics = async () => {
    if (!originalLyrics) {
      toast.error("Por favor, cole a letra original")
      return
    }

    if (!genre) {
      toast.error("Por favor, selecione um gênero")
      return
    }

    setIsRewriting(true)

    try {
      const genreConfig = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS]

      const response = await fetch("/api/rewrite-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          letraOriginal: originalLyrics,
          generoConversao: genre,
          conservarImagens: true,
          polirSemMexer: false,
          metrics: BRAZILIAN_GENRE_METRICS[genre as keyof typeof BRAZILIAN_GENRE_METRICS] || BRAZILIAN_GENRE_METRICS.default,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao reescrever letra")
      }

      setLyrics(data.letra)
      toast.success("Letra reescrita com sucesso!")
    } catch (error) {
      console.error("[v0] Error rewriting lyrics:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao reescrever letra")
    } finally {
      setIsRewriting(false)
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-center mb-6">Reescrever Letras</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Coluna 1: Reescrever no Gênero */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Reescrever no Gênero</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-2">
                <Label className="text-xs">Cole sua letra</Label>
                <Textarea
                  placeholder="Cole o rascunho da sua letra..."
                  value={originalLyrics}
                  onChange={(e) => setOriginalLyrics(e.target.value)}
                  rows={4}
                  className="text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Indique palavras ou frases que NÃO devem aparecer na letra.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Gênero para Reescrever</Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENRES.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Evitar palavras (separe por vírgula)</Label>
                <Input
                  placeholder="Ex: coraçãozinho, saudadezinha, meu lençol"
                  value={avoidWords}
                  onChange={(e) => setAvoidWords(e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Requisitos Adicionais</Label>
                <Textarea
                  placeholder="Quaisquer elementos específicos..."
                  value={additionalReqs}
                  onChange={(e) => setAdditionalReqs(e.target.value)}
                  rows={2}
                  className="text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Forneça referências de artistas, compositores ou estilos específicos para a IA emular durante a
                  reescrita.
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
                    Inclui automaticamente todas as inspirações salvas no seu diário na reescrita.
                  </p>
                </div>
              </div>

              <Button
                className="w-full"
                size="sm"
                onClick={handleRewriteLyrics}
                disabled={isRewriting || !originalLyrics || !genre}
              >
                {isRewriting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reescrevendo...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reescrever Letra
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Coluna 2: Inspiração & Sensações */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Inspiração & Sensações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {/* Diário de Inspiração */}
              <div className="border rounded-lg p-3 bg-purple-50/50 space-y-2">
                <Label className="text-xs font-semibold">Diário de Inspiração</Label>
                <p className="text-xs text-muted-foreground">
                  Adicione textos, áudios, imagens ou links que representam experiências.
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
                  Busque referências criativas em best-sellers e romances.
                </p>
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
              </div>

              {/* Ferramentas de Composição */}
              <div className="border rounded-lg p-3 bg-purple-50/50 space-y-2">
                <Label className="text-xs font-semibold">Ferramentas de Composição</Label>
                <p className="text-xs text-muted-foreground">
                  Use estas ferramentas para enriquecer sua letra durante a reescrita.
                </p>
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

              {/* Sensações & Emoções */}
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

          {/* Coluna 3: Título da Música */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Título da Música (opcional)</CardTitle>
                <Button variant="ghost" size="sm">
                  <Copy className="h-3 w-3" />
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

              <Button variant="outline" size="sm" className="w-full bg-transparent">
                Validar métrica
              </Button>

              <div className="space-y-2">
                <Label className="text-xs">Acordes</Label>
                <Textarea
                  placeholder="Os acordes reescritos aparecerão aqui..."
                  value={chords}
                  onChange={(e) => setChords(e.target.value)}
                  rows={3}
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Letra</Label>
                <Textarea
                  placeholder="Sua letra reescrita aparecerá aqui..."
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  rows={12}
                  className="font-mono text-xs"
                />
              </div>

              <Button size="sm" className="w-full" onClick={handleSaveProject} disabled={!title || !lyrics}>
                <Save className="mr-2 h-3 w-3" />
                Salvar Projeto
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
