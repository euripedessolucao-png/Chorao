"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Copy, Save, Loader2, AlertCircle } from "lucide-react"

interface GenreMetrics {
  syllablesPerLine: number;
  bpm: number;
  structure: string;
}

const BRAZILIAN_GENRE_METRICS: Record<string, GenreMetrics> = {
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
}

function countPortugueseSyllables(word: string): number {
  if (!word.trim()) return 0

  const cleanWord = word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zà-úâ-ûã-õä-üç]/g, "")

  if (cleanWord.length === 0) return 0

  let syllableCount = 0
  let i = 0

  while (i < cleanWord.length) {
    const currentChar = cleanWord[i]

    if ("aeiouáéíóúâêîôûàèìòùãõ".includes(currentChar)) {
      syllableCount++

      if (i + 1 < cleanWord.length) {
        const nextChar = cleanWord[i + 1]
        if (
          ("aeo".includes(currentChar) && "iu".includes(nextChar)) ||
          ("iu".includes(currentChar) && "aeo".includes(nextChar))
        ) {
          i++
        }
      }
    }
    i++
  }

  return Math.max(1, syllableCount)
}

export function CreateLyricsForm() {
  const [genero, setGenero] = useState("")
  const [humor, setHumor] = useState("")
  const [tema, setTema] = useState("")
  const [criatividade, setCriatividade] = useState("equilibrado")
  const [hook, setHook] = useState("")
  const [inspiracao, setInspiracao] = useState("")
  const [metaforas, setMetaforas] = useState("")
  const [emocoes, setEmocoes] = useState<string[]>([])
  const [titulo, setTitulo] = useState("")
  const [letraGerada, setLetraGerada] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const currentMetrics =
    genero && BRAZILIAN_GENRE_METRICS[genero] ? BRAZILIAN_GENRE_METRICS[genero] : BRAZILIAN_GENRE_METRICS.default

  const validateMetrics = (lyrics: string) => {
    if (!genero || !lyrics) return null

    const metrics = BRAZILIAN_GENRE_METRICS[genero] || BRAZILIAN_GENRE_METRICS.default
    const maxSyllables = metrics.syllablesPerLine

    const lines = lyrics.split("\n").filter((line) => {
      const trimmed = line.trim()
      return trimmed && !trimmed.startsWith("[") && !trimmed.startsWith("(") && !trimmed.includes("Instrumental:")
    })

    const problematicLines = lines
      .map((line) => ({
        line,
        syllables: countPortugueseSyllables(line),
      }))
      .filter((item) => item.syllables > maxSyllables)

    return problematicLines
  }

  const problematicLines = validateMetrics(letraGerada)

  const handleEmocaoToggle = (emocao: string) => {
    setEmocoes((prev) => (prev.includes(emocao) ? prev.filter((e) => e !== emocao) : [...prev, emocao]))
  }

  const showAlert = (title: string, description?: string) => {
    alert(title + (description ? `\n\n${description}` : ''))
  }

  const handleGerarLetra = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-lyrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          genero,
          humor,
          tema,
          criatividade,
          hook,
          inspiracao,
          metaforas,
          emocoes,
          titulo,
          metrics: currentMetrics,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao gerar letra")
      }

      const data = await response.json()
      setLetraGerada(data.letra)

      showAlert("Letra gerada com sucesso!", "Sua letra foi criada. Você pode editá-la ou salvá-la.")
    } catch (error) {
      console.error("[v0] Error:", error)
      showAlert("Erro ao gerar letra", "Ocorreu um erro ao gerar a letra. Por favor, tente novamente.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCorrigirMetrica = () => {
    const fixed = letraGerada
      .split("\n")
      .map((line) => {
        if (countPortugueseSyllables(line) > currentMetrics.syllablesPerLine) {
          const words = line.split(" ")
          if (words.length > 2) {
            const mid = Math.floor(words.length / 2)
            return words.slice(0, mid).join(" ") + "\n" + words.slice(mid).join(" ")
          }
        }
        return line
      })
      .join("\n")
    setLetraGerada(fixed)

    showAlert("Métrica corrigida!", "As linhas foram ajustadas para a métrica ideal.")
  }

  const handleCopiarLetra = () => {
    if (!letraGerada) {
      showAlert("Nenhuma letra para copiar", "Gere uma letra primeiro antes de copiar.")
      return
    }

    navigator.clipboard.writeText(letraGerada)
    showAlert("Letra copiada!", "A letra foi copiada para a área de transferência.")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* COLUNA 1: Parâmetros da Letra */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">Parâmetros da Letra</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="genero">Gênero Musical</Label>
            <Select value={genero} onValueChange={setGenero}>
              <SelectTrigger id="genero">
                <SelectValue placeholder="Selecione o gênero" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(BRAZILIAN_GENRE_METRICS)
                  .filter((g) => g !== "default")
                  .map((genreName) => (
                    <SelectItem key={genreName} value={genreName}>
                      {genreName} ({BRAZILIAN_GENRE_METRICS[genreName].syllablesPerLine}s)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {genero && (
              <div className="mt-3 p-3 bg-primary/10 rounded-md border border-primary/20">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Métrica:</span>
                    <div className="font-medium text-foreground">{currentMetrics.syllablesPerLine} sílabas/linha</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ritmo:</span>
                    <div className="font-medium text-foreground">{currentMetrics.bpm} BPM</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estrutura:</span>
                    <div className="font-medium text-foreground text-xs">{currentMetrics.structure}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="humor">Humor</Label>
            <Select value={humor} onValueChange={setHumor}>
              <SelectTrigger id="humor">
                <SelectValue placeholder="Selecione o humor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feliz">Feliz</SelectItem>
                <SelectItem value="triste">Triste</SelectItem>
                <SelectItem value="romantico">Romântico</SelectItem>
                <SelectItem value="nostalgico">Nostálgico</SelectItem>
                <SelectItem value="energetico">Energético</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tema">Tema</Label>
            <Input
              id="tema"
              placeholder="Ex: Amor, Perda, Jornada..."
              value={tema}
              onChange={(e) => setTema(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="criatividade">Nível de Criatividade</Label>
            <Select value={criatividade} onValueChange={setCriatividade}>
              <SelectTrigger id="criatividade">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservador">Conservador</SelectItem>
                <SelectItem value="equilibrado">Equilibrado</SelectItem>
                <SelectItem value="ousado">Ousado</SelectItem>
                <SelectItem value="experimental">Experimental</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hook">Hook/Refrão (opcional)</Label>
            <Input
              id="hook"
              placeholder="Digite um refrão marcante..."
              value={hook}
              onChange={(e) => setHook(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* COLUNA 2: Inspiração & Sensações */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">Inspiração & Sensações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inspiracao">Inspiração Literária</Label>
            <Textarea
              id="inspiracao"
              placeholder="Descreva referências literárias, poemas ou textos que inspiram..."
              className="min-h-[120px] resize-none"
              value={inspiracao}
              onChange={(e) => setInspiracao(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaforas">Metáforas Inteligentes</Label>
            <Textarea
              id="metaforas"
              placeholder="Sugira metáforas ou figuras de linguagem que gostaria de ver..."
              className="min-h-[120px] resize-none"
              value={metaforas}
              onChange={(e) => setMetaforas(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>Tags de Emoção</Label>
            <div className="space-y-2">
              {["Alegria", "Tristeza", "Saudade", "Paixão"].map((emocao) => (
                <div key={emocao} className="flex items-center space-x-2">
                  <Checkbox
                    id={emocao}
                    checked={emocoes.includes(emocao)}
                    onCheckedChange={() => handleEmocaoToggle(emocao)}
                  />
                  <Label htmlFor={emocao} className="text-sm font-normal cursor-pointer">
                    {emocao}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* COLUNA 3: Preview da Letra */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">Preview da Letra</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título da Música</Label>
            <Input
              id="titulo"
              placeholder="Digite o título..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="letra">Letra Gerada</Label>
            <Textarea
              id="letra"
              placeholder="A letra gerada aparecerá aqui..."
              className="min-h-[300px] resize-none font-mono text-sm"
              value={letraGerada}
              onChange={(e) => setLetraGerada(e.target.value)}
            />
          </div>

          {problematicLines && problematicLines.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-yellow-600 text-sm">Ajuste de Métrica Recomendado</span>
              </div>
              <p className="text-sm text-yellow-600/90">
                <strong>{genero}</strong> recomenda até <strong>{currentMetrics.syllablesPerLine} sílabas</strong> por
                linha.
                {problematicLines.length} linha(s) precisam de ajuste.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleGerarLetra}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Letra
                </>
              )}
            </Button>

            {problematicLines && problematicLines.length > 0 && (
              <Button
                onClick={handleCorrigirMetrica}
                variant="outline"
                size="lg"
                className="w-full border-yellow-500/20 text-yellow-600 hover:bg-yellow-500/10 bg-transparent"
              >
                Corrigir Métrica
              </Button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="lg">
                <Save className="w-4 h-4 mr-2" />
                Salvar Projeto
              </Button>
              <Button variant="outline" size="lg" onClick={handleCopiarLetra}>
                <Copy className="w-4 h-4 mr-2" />
                Copiar Letra
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
