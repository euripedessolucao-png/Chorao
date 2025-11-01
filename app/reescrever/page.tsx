// app/reescrever/page.tsx - COM DEFAULT EXPORT CORRIGIDO
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Music, Wand2, Download, Copy, AlertCircle } from "lucide-react"
import { toast } from "sonner"

// ✅ COMPONENTE PRINCIPAL COM DEFAULT EXPORT
export default function ReescreverPage() {
  const [originalLyrics, setOriginalLyrics] = useState("")
  const [rewrittenLyrics, setRewrittenLyrics] = useState("")
  const [genre, setGenre] = useState("Sertanejo Moderno Masculino")
  const [theme, setTheme] = useState("")
  const [title, setTitle] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleRewrite = async () => {
    if (!originalLyrics.trim()) {
      toast.error("Por favor, cole a letra original")
      return
    }

    setIsLoading(true)
    setRewrittenLyrics("")

    try {
      const response = await fetch("/api/rewrite-lyrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalLyrics,
          genre,
          theme: theme || "amor",
          title: title || `${theme || "Música"} - ${genre}`,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setRewrittenLyrics(data.lyrics)
        toast.success("Letra reescrita com sucesso!")
      } else {
        toast.error(data.error || "Erro ao reescrever letra")
      }
    } catch (error) {
      console.error("Erro:", error)
      toast.error("Erro de conexão")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(rewrittenLyrics)
    toast.success("Letra copiada para a área de transferência!")
  }

  const handleDownload = () => {
    const element = document.createElement("a")
    const file = new Blob([rewrittenLyrics], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `letra-${title || "reescrita"}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success("Letra baixada com sucesso!")
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Music className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Reescrever Letras</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Transforme suas letras com IA. Melhore a qualidade poética, métrica e estrutura mantendo a essência original.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUNA ESQUERDA - ENTRADA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Letra Original
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Gênero Musical</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Sertanejo Moderno Masculino">Sertanejo Moderno Masculino</option>
                  <option value="Sertanejo Moderno Feminino">Sertanejo Moderno Feminino</option>
                  <option value="Sertanejo Universitário">Sertanejo Universitário</option>
                  <option value="Pagode Romântico">Pagode Romântico</option>
                  <option value="Funk Carioca">Funk Carioca</option>
                  <option value="MPB">MPB</option>
                  <option value="Gospel Contemporâneo">Gospel Contemporâneo</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Tema Principal</label>
                <Input
                  placeholder="ex: amor, saudade, superação..."
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Título (opcional)</label>
              <Input
                placeholder="Título da música..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cole sua letra aqui</label>
              <Textarea
                placeholder={`[Intro]
Eu estava só, caminhando na estrada...
[Verso 1]
Minha vida era vazia sem você...`}
                value={originalLyrics}
                onChange={(e) => setOriginalLyrics(e.target.value)}
                rows={12}
                className="resize-none font-mono text-sm"
              />
            </div>

            <Button 
              onClick={handleRewrite} 
              disabled={isLoading || !originalLyrics.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Reescrevendo...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Reescrever Letra
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* COLUNA DIREITA - RESULTADO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Letra Reescrita
              </div>
              {rewrittenLyrics && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Pronto
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rewrittenLyrics ? (
              <>
                <div className="relative">
                  <Textarea
                    value={rewrittenLyrics}
                    readOnly
                    rows={16}
                    className="resize-none font-mono text-sm bg-muted/50"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleCopy} variant="outline" className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                  <Button onClick={handleDownload} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </Button>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Dica:</strong> A letra foi otimizada com correção automática de sílabas, 
                    rimas naturais e estrutura poética melhorada.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Letra reescrita aparecerá aqui</p>
                <p className="text-sm mt-2">Cole uma letra e clique em "Reescrever Letra"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* INFORMACOES ADICIONAIS */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">🎵 Como funciona:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <Badge variant="outline" className="bg-purple-100">1. Análise</Badge>
              <p>O sistema analisa a estrutura e métrica da letra original</p>
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className="bg-blue-100">2. Reescrever</Badge>
              <p>IA especializada reescreve mantendo a essência mas melhorando a qualidade</p>
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className="bg-green-100">3. Corrigir</Badge>
              <p>Correção automática de sílabas para garantir a métrica perfeita</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ✅ COMPONENTES ADICIONAIS (se necessário) com export named
export function AdditionalComponent() {
  return null
}
