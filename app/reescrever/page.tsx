"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Copy, Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { GenreSelect } from "@/components/genre-select"
import { getGenreMetrics } from "@/lib/metrics/brazilian-metrics"

export default function ReescreverPage() {
  const [originalLyrics, setOriginalLyrics] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [genre, setGenre] = useState("Sertanejo Moderno")
  const [mood, setMood] = useState("")
  const [theme, setTheme] = useState("")
  const [formattingStyle, setFormattingStyle] = useState("standard")
  const [additionalReqs, setAdditionalReqs] = useState("")
  const [advancedMode, setAdvancedMode] = useState(false)
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [inspirationText, setInspirationText] = useState("")
  const [metaphorSearch, setMetaphorSearch] = useState("")
  const [title, setTitle] = useState("")
  const [isRewriting, setIsRewriting] = useState(false)
  const [savedInspirations, setSavedInspirations] = useState<Array<{ id: string; text: string; timestamp: number }>>([])

  const handleRewriteLyrics = async () => {
    if (!originalLyrics.trim()) {
      toast.error("Por favor, cole a letra original para reescrever")
      return
    }

    setIsRewriting(true)

    try {
      const genreMetrics = getGenreMetrics(genre)

      const syllableConfig = {
        min: genreMetrics.syllableRange.min,
        max: genreMetrics.syllableRange.max,
        ideal:
          genreMetrics.syllableRange.ideal ||
          Math.floor((genreMetrics.syllableRange.min + genreMetrics.syllableRange.max) / 2),
      }

      const requestBody = {
        originalLyrics,
        genre,
        mood: mood || "Romântico",
        theme: theme || "Amor",
        creativity: "equilibrado",
        formattingStyle,
        additionalRequirements: additionalReqs,
        advancedMode,
        universalPolish: true,
        syllableTarget: syllableConfig,
        emotions: selectedEmotions,
        inspiration: savedInspirations.map((i) => i.text).join("\n\n") || inspirationText,
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
        throw new Error(data.error || `Erro ${response.status}`)
      }

      if (!data.lyrics) {
        throw new Error("Resposta inválida da API")
      }

      setLyrics(data.lyrics)
      if (data.title && !title) setTitle(data.title)

      toast.success("Letra reescrita com sucesso!", {
        description: `Score: ${data.metadata?.finalScore || "N/A"} | Modo: ${data.metadata?.performanceMode || "padrão"}`,
      })
    } catch (error) {
      console.error("Erro na reescrita:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao reescrever")
    } finally {
      setIsRewriting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Reescrever Letra</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="originalLyrics">Letra Original</Label>
                <Textarea
                  id="originalLyrics"
                  value={originalLyrics}
                  onChange={(e) => setOriginalLyrics(e.target.value)}
                  placeholder="Cole aqui a letra que deseja reescrever..."
                  rows={10}
                  className="font-mono"
                />
              </div>

              <div>
                <Label htmlFor="genre">Gênero Musical</Label>
                <GenreSelect value={genre} onValueChange={setGenre} />
              </div>

              <div>
                <Label htmlFor="theme">Tema</Label>
                <Input
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Ex: Amor, Saudade, Festa..."
                />
              </div>

              <div>
                <Label htmlFor="mood">Clima</Label>
                <Input
                  id="mood"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  placeholder="Ex: Romântico, Animado, Melancólico..."
                />
              </div>

              <div>
                <Label htmlFor="title">Título (opcional)</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Deixe em branco para manter o original"
                />
              </div>

              <div>
                <Label htmlFor="formattingStyle">Estilo de Formatação</Label>
                <select
                  id="formattingStyle"
                  value={formattingStyle}
                  onChange={(e) => setFormattingStyle(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="standard">Padrão</option>
                  <option value="performatico">Performático</option>
                </select>
              </div>

              <div>
                <Label htmlFor="additionalReqs">Requisitos Adicionais (opcional)</Label>
                <Textarea
                  id="additionalReqs"
                  value={additionalReqs}
                  onChange={(e) => setAdditionalReqs(e.target.value)}
                  placeholder="Descreva mudanças específicas que deseja..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="advancedMode"
                  checked={advancedMode}
                  onCheckedChange={(checked) => setAdvancedMode(checked as boolean)}
                />
                <Label htmlFor="advancedMode">Modo Avançado</Label>
              </div>
            </div>

            <Button onClick={handleRewriteLyrics} disabled={isRewriting || !originalLyrics} className="w-full">
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

            {lyrics && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Letra Reescrita</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(lyrics)
                      toast.success("Letra copiada!")
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar
                  </Button>
                </div>
                <Textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} rows={15} className="font-mono" />
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
