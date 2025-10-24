"use client"

import type React from "react"
import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, Upload, Mic2, Trash2, Download, TrendingUp, Star, Music } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HookGenerator } from "@/components/hook-generator"

function ResultadoAvaliacao({ resultado, analiseHook }: { resultado: string | null; analiseHook: string | null }) {
  if (!resultado && !analiseHook) return null

  // Função para extrair dados do texto da IA
  const extrairDados = (texto: string | null, hook: string | null) => {
    const notaMatch = texto?.match(/NOTA:\s*(\d+\.?\d*)\/10/)
    const ganchometroMatch = hook?.match(/GANCHÔMETRO:\s*(\d+)\/100/)
    const hookMatch = hook?.match(/HOOK IDENTIFICADO:\s*"([^"]+)"/)

    return {
      nota: notaMatch ? Number.parseFloat(notaMatch[1]) : null,
      ganchometro: ganchometroMatch ? Number.parseInt(ganchometroMatch[1]) : null,
      hook: hookMatch ? hookMatch[1] : null,
    }
  }

  const dados = extrairDados(resultado, analiseHook)

  return (
    <div className="space-y-6">
      {/* Cartão de Métricas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Métricas da Cantada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nota Geral */}
          {dados.nota && (
            <div className="flex items-center justify-between">
              <div>
                <Label>Nota Geral</Label>
                <p className="text-sm text-muted-foreground">Performance vocal completa</p>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {dados.nota}/10
              </Badge>
            </div>
          )}

          {/* Ganchômetro */}
          {dados.ganchometro !== null && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Ganchômetro</Label>
                <Badge variant={dados.ganchometro >= 70 ? "default" : "secondary"}>{dados.ganchometro}/100</Badge>
              </div>
              <Progress value={dados.ganchometro} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {dados.ganchometro >= 80
                  ? "🔥 Potencial de hit!"
                  : dados.ganchometro >= 60
                    ? "✅ Bom potencial comercial"
                    : "💡 Pode melhorar"}
              </p>
            </div>
          )}

          {/* Hook Identificado */}
          {dados.hook && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <Label className="text-yellow-800 dark:text-yellow-200">🎵 Hook Identificado</Label>
              <p className="mt-2 text-lg font-medium text-yellow-900 dark:text-yellow-100">"{dados.hook}"</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Este trecho tem maior potencial de viralidade
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Análise Detalhada */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Avaliação Principal */}
        {resultado && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-600" />
                Análise Completa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap font-sans text-sm">{resultado}</pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Análise do Hook */}
        {analiseHook && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Análise Comercial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap font-sans text-sm">{analiseHook}</pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function MelodyAnalysisResults({ analysis }: { analysis: any }) {
  return (
    <div className="space-y-4">
      {/* Score Geral */}
      <div className="flex items-center justify-between">
        <Label>Encaixe Melódico</Label>
        <Badge variant={analysis.score >= 80 ? "default" : "secondary"} className="text-lg px-3 py-1">
          {analysis.score}/100
        </Badge>
      </div>
      <Progress value={analysis.score} className="h-2" />

      {/* Métricas Específicas */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <Label className="text-xs">Prosódia</Label>
          <Progress value={analysis.metrics.prosody} className="h-1 mt-1" />
          <span className="text-xs text-muted-foreground">{analysis.metrics.prosody}%</span>
        </div>
        <div>
          <Label className="text-xs">Emoção</Label>
          <Progress value={analysis.metrics.emotion} className="h-1 mt-1" />
          <span className="text-xs text-muted-foreground">{analysis.metrics.emotion}%</span>
        </div>
        <div>
          <Label className="text-xs">Ritmo</Label>
          <Progress value={analysis.metrics.rhythm} className="h-1 mt-1" />
          <span className="text-xs text-muted-foreground">{analysis.metrics.rhythm}%</span>
        </div>
        <div>
          <Label className="text-xs">Clímax</Label>
          <Progress value={analysis.metrics.climax} className="h-1 mt-1" />
          <span className="text-xs text-muted-foreground">{analysis.metrics.climax}%</span>
        </div>
      </div>

      {/* Sugestões */}
      {analysis.suggestions && analysis.suggestions.length > 0 && (
        <div>
          <Label>Sugestões de Ajuste</Label>
          <div className="mt-2 space-y-2">
            {analysis.suggestions.map((suggestion: string, index: number) => (
              <div key={index} className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <p className="text-sm">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trechos Destacados */}
      {analysis.highlights && analysis.highlights.length > 0 && (
        <div>
          <Label>Trechos com Bom Encaixe</Label>
          <div className="mt-2 space-y-2">
            {analysis.highlights.map((highlight: any, index: number) => (
              <div key={index} className="p-2 border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20">
                <p className="text-sm font-medium">{highlight.text}</p>
                <p className="text-xs text-muted-foreground">{highlight.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botão de Copiar */}
      <Button
        variant="outline"
        size="sm"
        className="w-full bg-transparent"
        onClick={() => {
          const textoCompleto = `ANÁLISE DE ENCAIXE MELÓDICO\n\nScore: ${analysis.score}/100\n\nMétricas:\n- Prosódia: ${analysis.metrics.prosody}%\n- Emoção: ${analysis.metrics.emotion}%\n- Ritmo: ${analysis.metrics.rhythm}%\n- Clímax: ${analysis.metrics.climax}%\n\nSugestões:\n${analysis.suggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")}`
          navigator.clipboard.writeText(textoCompleto)
          toast.success("Análise copiada!")
        }}
      >
        <Download className="h-4 w-4 mr-2" />
        Copiar Análise
      </Button>
    </div>
  )
}

export default function AvaliarPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [lyrics, setLyrics] = useState("")
  const [title, setTitle] = useState("")
  const [genre, setGenre] = useState("") // Added genre state
  const [isLoading, setIsLoading] = useState(false)
  const [avaliacao, setAvaliacao] = useState<string | null>(null)
  const [analiseHook, setAnaliseHook] = useState<string | null>(null)

  const [melodyFile, setMelodyFile] = useState<File | null>(null)
  const [melodyLyrics, setMelodyLyrics] = useState("")
  const [melodyTitle, setMelodyTitle] = useState("")
  const [isAnalyzingMelody, setIsAnalyzingMelody] = useState(false)
  const [melodyAnalysis, setMelodyAnalysis] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!audioFile || !lyrics.trim()) {
      toast.error("Envie o MP3 e cole a letra para continuar.")
      return
    }

    setIsLoading(true)
    setAvaliacao(null)
    setAnaliseHook(null)

    try {
      const formData = new FormData()
      formData.append("audio", audioFile)
      formData.append("lyrics", lyrics)
      formData.append("title", title)
      formData.append("genre", genre) // Added genre to formData

      const response = await fetch("/api/avaliar-cantada", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erro ao avaliar cantada")
      }

      const data = await response.json()

      setAvaliacao(data.avaliacao)
      setAnaliseHook(data.analiseHook)
      toast.success("Cantada avaliada com sucesso!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao avaliar cantada. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const limparLetraPt = (texto: string) => {
    try {
      let t = texto
      t = t.replace(/\[[^\]]*\]/g, "")
      t = t.replace(/$$[^)]*$$/g, "")
      t = t
        .split("\n")
        .map((l) => l.replace(/\s+/g, " ").trim())
        .filter((l) => l.length > 0)
        .join("\n")
      return t
    } catch {
      return texto
    }
  }

  const handleClearForm = () => {
    setAudioFile(null)
    setLyrics("")
    setTitle("")
    setGenre("") // Clear genre state
    setAvaliacao(null)
    setAnaliseHook(null)
    toast.success("Formulário limpo")
  }

  const handleMelodySubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!melodyFile || !melodyLyrics.trim()) {
      toast.error("Envie a melodia e a letra para análise de encaixe")
      return
    }

    setIsAnalyzingMelody(true)
    setMelodyAnalysis(null)

    try {
      const formData = new FormData()
      formData.append("melody", melodyFile)
      formData.append("lyrics", melodyLyrics)
      formData.append("title", melodyTitle)

      const response = await fetch("/api/analyze-melody-fit", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erro na análise de encaixe")
      }

      const data = await response.json()
      setMelodyAnalysis(data)
      toast.success("Análise de encaixe concluída!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro na análise. Tente novamente.")
    } finally {
      setIsAnalyzingMelody(false)
    }
  }

  const handleClearMelodyForm = () => {
    setMelodyFile(null)
    setMelodyLyrics("")
    setMelodyTitle("")
    setMelodyAnalysis(null)
    toast.success("Formulário limpo")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-4 pt-20">
        <h1 className="text-2xl font-bold text-left mb-4">Avaliar Cantada + Hook</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Formulário de Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic2 className="h-5 w-5 text-primary" />
                Enviar Cantada
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Receba nota vocal + análise comercial com Ganchômetro e sugestões para viralizar
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="genre">Gênero (opcional)</Label>
                  <Select value={genre} onValueChange={setGenre}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Selecione o gênero..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sertanejo Moderno">Sertanejo Moderno</SelectItem>
                      <SelectItem value="Funk">Funk</SelectItem>
                      <SelectItem value="Pagode">Pagode</SelectItem>
                      <SelectItem value="MPB">MPB</SelectItem>
                      <SelectItem value="Gospel">Gospel</SelectItem>
                      <SelectItem value="Bachata">Bachata</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Ajuda a análise de hook e refrão a seguir as regras do gênero
                  </p>
                </div>

                {/* Arquivo de Áudio */}
                <div className="space-y-2">
                  <Label htmlFor="audio-file">Arquivo MP3 da Cantada</Label>
                  <Input
                    id="audio-file"
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    disabled={isLoading}
                  />
                  {audioFile && (
                    <p className="text-sm text-muted-foreground">
                      Arquivo selecionado: {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">Formatos suportados: MP3, WAV, M4A (máx. 50MB)</p>
                </div>

                {/* Título Opcional */}
                <div className="space-y-2">
                  <Label htmlFor="title">Título (opcional)</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Ex.: Take 02 - versão final"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {/* Letra */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="lyrics">Letra da Música</Label>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setLyrics((prev) => limparLetraPt(prev))}
                      disabled={isLoading || !lyrics}
                    >
                      Limpar formatação
                    </Button>
                  </div>
                  <Textarea
                    id="lyrics"
                    placeholder="Cole aqui a letra completa da sua música..."
                    className="min-h-48 resize-none font-mono text-sm"
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-sm text-muted-foreground">
                    A letra será analisada para métrica, rima e potencial comercial
                  </p>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isLoading || !audioFile || !lyrics.trim()}
                    size="default"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analisando Performance & Hook...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Avaliar Cantada Completa
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" size="default" onClick={handleClearForm} disabled={isLoading}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {lyrics.trim() && (
                  <div className="pt-4 border-t">
                    <Label className="text-sm font-semibold mb-2 block">Gerar Hook da Letra</Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Use a letra já colada acima para gerar hooks comerciais
                    </p>
                    <HookGenerator initialLyrics={lyrics} initialGenre={genre} showSelectionMode={false} />
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Resultados da Avaliação */}
          <Card>
            <CardHeader>
              <CardTitle>Resultado da Avaliação</CardTitle>
              <p className="text-sm text-muted-foreground">A avaliação detalhada aparecerá aqui após o processamento</p>
            </CardHeader>

            <CardContent>
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Analisando sua cantada e hook...</p>
                </div>
              )}

              {!isLoading && !avaliacao && !analiseHook && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                  <Mic2 className="h-12 w-12 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Envie um arquivo de áudio e a letra para receber sua avaliação completa
                  </p>
                </div>
              )}

              {!isLoading && (avaliacao || analiseHook) && (
                <div className="space-y-4">
                  <ResultadoAvaliacao resultado={avaliacao} analiseHook={analiseHook} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    onClick={() => {
                      const textoCompleto = `${avaliacao || ""}\n\n═══════════════════════════════════════\n\n${analiseHook || ""}`
                      navigator.clipboard.writeText(textoCompleto)
                      toast.success("Avaliação completa copiada!")
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Copiar Avaliação Completa
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-left mb-4 flex items-center gap-2">
            <Music className="h-6 w-6 text-purple-600" />
            Compor na Melodia
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Carregue uma melodia de referência e compose a letra em cima - validamos o encaixe perfeito
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* Formulário de Composição */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-purple-600" />
                  Sua Melodia e Letra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMelodySubmit} className="space-y-4">
                  {/* Upload da Melodia */}
                  <div className="space-y-2">
                    <Label htmlFor="melody-file">Melodia de Referência</Label>
                    <Input
                      id="melody-file"
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setMelodyFile(e.target.files?.[0] || null)}
                      disabled={isAnalyzingMelody}
                    />
                    {melodyFile && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {melodyFile.name} ({(melodyFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                        <audio controls className="w-full" src={URL.createObjectURL(melodyFile)} />
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">MP3, WAV, M4A (até 50MB)</p>
                  </div>

                  {/* Título */}
                  <div className="space-y-2">
                    <Label htmlFor="melody-title">Título (opcional)</Label>
                    <Input
                      id="melody-title"
                      type="text"
                      placeholder="Nome da sua composição"
                      value={melodyTitle}
                      onChange={(e) => setMelodyTitle(e.target.value)}
                      disabled={isAnalyzingMelody}
                    />
                  </div>

                  {/* Letra */}
                  <div className="space-y-2">
                    <Label htmlFor="melody-lyrics">Sua Letra</Label>
                    <Textarea
                      id="melody-lyrics"
                      placeholder="Compose sua letra aqui enquanto ouve a melodia..."
                      className="min-h-48 resize-none font-mono text-sm"
                      value={melodyLyrics}
                      onChange={(e) => setMelodyLyrics(e.target.value)}
                      disabled={isAnalyzingMelody}
                    />
                    <p className="text-sm text-muted-foreground">
                      Ouça a melodia e escreva a letra que encaixe perfeitamente
                    </p>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isAnalyzingMelody || !melodyFile || !melodyLyrics.trim()}
                    >
                      {isAnalyzingMelody ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analisando Encaixe...
                        </>
                      ) : (
                        <>
                          <Star className="h-4 w-4 mr-2" />
                          Validar Encaixe Perfeito
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClearMelodyForm}
                      disabled={isAnalyzingMelody}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Resultados da Análise */}
            <Card>
              <CardHeader>
                <CardTitle>Análise de Encaixe</CardTitle>
                <p className="text-sm text-muted-foreground">Avaliação de como sua letra encaixa na melodia</p>
              </CardHeader>
              <CardContent>
                {isAnalyzingMelody && (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                    <p className="text-sm text-muted-foreground">Analisando encaixe melódico...</p>
                  </div>
                )}

                {!isAnalyzingMelody && !melodyAnalysis && (
                  <div className="space-y-6">
                    {/* Player Fixo */}
                    {melodyFile && (
                      <div className="p-4 border rounded-lg bg-muted/30">
                        <Label>Melodia de Referência</Label>
                        <audio controls className="w-full mt-2" src={URL.createObjectURL(melodyFile)} />
                        <p className="text-sm text-muted-foreground mt-2">Ouça enquanto compõe para melhor encaixe</p>
                      </div>
                    )}

                    {/* Dicas */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Dicas para Encaixe Perfeito</Label>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-0.5">
                            1
                          </Badge>
                          <span>Ouça a melodia várias vezes antes de começar</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-0.5">
                            2
                          </Badge>
                          <span>Note onde a melodia sobe/desce - coloque palavras importantes nesses pontos</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-0.5">
                            3
                          </Badge>
                          <span>Use sílabas abertas (a, e, o) nas notas longas</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-0.5">
                            4
                          </Badge>
                          <span>Palavras emocionais combinam com picos melódicos</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!isAnalyzingMelody && melodyAnalysis && <MelodyAnalysisResults analysis={melodyAnalysis} />}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
