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
import { Sparkles, Save, Search } from "lucide-react"

const GENRES = ["Pop", "Sertanejo Moderno", "Sertanejo Universitário", "MPB", "Rock", "Funk", "Pagode", "Forró"]

const MOODS = ["Feliz", "Triste", "Nostálgico", "Apaixonado", "Revoltado", "Esperançoso", "Melancólico"]

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

export default function CriarPage() {
  const [genre, setGenre] = useState("")
  const [mood, setMood] = useState("")
  const [theme, setTheme] = useState("")
  const [avoidWords, setAvoidWords] = useState("")
  const [additionalReqs, setAdditionalReqs] = useState("")
  const [useDiary, setUseDiary] = useState(true)
  const [creativity, setCreativity] = useState([50])
  const [inspirationText, setInspirationText] = useState("")
  const [literaryGenre, setLiteraryGenre] = useState("")
  const [literaryEmotion, setLiteraryEmotion] = useState("")
  const [metaphorSearch, setMetaphorSearch] = useState("")
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [title, setTitle] = useState("")
  const [chords, setChords] = useState("")
  const [lyrics, setLyrics] = useState("")

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions((prev) => (prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]))
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-center mb-6">Criar Nova Letra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Coluna 1: Parâmetros da Letra */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Parâmetros da Letra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                Mostrar informações dos gêneros
              </Button>

              <div className="space-y-2">
                <Label className="text-xs">Gênero</Label>
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
                <Label className="text-xs">Humor</Label>
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

              <div className="space-y-3 border rounded-lg p-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <Label className="text-xs">Nível de Criatividade</Label>
                    <span className="text-xs text-muted-foreground">Equilibrado</span>
                  </div>
                  <Slider value={creativity} onValueChange={setCreativity} max={100} step={1} />
                  <p className="text-xs text-muted-foreground mt-1">
                    Equilíbrio entre tradição e originalidade com alta qualidade
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
                    <span className="text-xs text-muted-foreground">Padrão (fixo)</span>
                  </div>
                  <p className="text-xs text-muted-foreground">O formato é padrão e não pode ser alterado.</p>
                </div>
              </div>

              <Button className="w-full" size="sm">
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar Letra Completa
              </Button>

              <div className="border-t pt-2">
                <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                  📈 Tendências Atuais: Geral
                </Button>
              </div>
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

          {/* Coluna 3: Título da Música */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Título da Música</CardTitle>
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
              </div>

              <Button size="sm" className="w-full">
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
