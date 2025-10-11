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
import { Loader2, Upload, Mic2, Trash2, Download, TrendingUp, Star } from "lucide-react"
import { toast } from "sonner"

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

export default function AvaliarPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [lyrics, setLyrics] = useState("")
  const [title, setTitle] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [avaliacao, setAvaliacao] = useState<string | null>(null)
  const [analiseHook, setAnaliseHook] = useState<string | null>(null)

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
    setAvaliacao(null)
    setAnaliseHook(null)
    toast.success("Formulário limpo")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-2xl font-bold mb-6">Avaliar Cantada + Hook</h1>

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
      </div>
    </div>
  )
}
