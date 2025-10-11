"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, Sparkles, TrendingUp, Copy, Zap } from "lucide-react"
import { toast } from "sonner"

interface HookResult {
  hook: string
  score: number
  suggestions: string[]
  placement: string[]
  tiktokTest: string
  transformations: Array<{
    original: string
    transformed: string
    reason: string
  }>
}

export function HookGenerator() {
  const [lyrics, setLyrics] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<HookResult | null>(null)

  const generateHook = async () => {
    if (!lyrics.trim()) {
      toast.error("Cole uma letra para gerar hooks")
      return
    }

    setIsGenerating(true)
    setResult(null)

    try {
      const response = await fetch("/api/generate-hook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lyrics: lyrics.trim() }),
      })

      if (!response.ok) throw new Error("Erro ao gerar hook")

      const data = await response.json()
      setResult(data)

      toast.success("Hook gerado com sucesso!")
    } catch (error) {
      toast.error("Erro ao gerar hook. Tente novamente.")
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Hook copiado!")
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Gerador de Hook & Ganchômetro
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Analise sua letra e gere hooks comerciais com pontuação de viralidade
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Cole sua letra para análise</Label>
            <Textarea
              placeholder="Cole a letra completa aqui..."
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              className="min-h-32"
              disabled={isGenerating}
            />
          </div>

          <Button onClick={generateHook} disabled={isGenerating || !lyrics.trim()} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analisando Gancho...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Hook & Ganchômetro
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resultados */}
      {result && (
        <div className="space-y-4">
          {/* Score Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Ganchômetro
                </span>
                <Badge variant={getScoreVariant(result.score)} className="text-lg">
                  <span className={getScoreColor(result.score)}>{result.score}/100</span>
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={result.score} className="h-3" />

              <div className="text-sm text-muted-foreground">
                {result.score >= 80 && "🔥 Potencial de hit! Hook muito memorável"}
                {result.score >= 60 && result.score < 80 && "✅ Bom hook comercial, pode viralizar"}
                {result.score < 60 && "💡 Hook precisa de otimização para melhor impacto"}
              </div>
            </CardContent>
          </Card>

          {/* Hook Principal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Hook Recomendado</span>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.hook)}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copiar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-lg font-medium text-center text-yellow-900">"{result.hook}"</p>
              </div>
            </CardContent>
          </Card>

          {/* Transformações Sugeridas */}
          {result.transformations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Transformações Sugeridas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.transformations.map((transformation, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground">Original:</div>
                        <div className="font-medium">{transformation.original}</div>
                      </div>
                      <div className="mx-4 text-muted-foreground">→</div>
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground">Otimizado:</div>
                        <div className="font-medium text-green-600">{transformation.transformed}</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">{transformation.reason}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Posicionamento */}
          {result.placement.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Estratégia de Posicionamento</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.placement.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Teste TikTok */}
          {result.tiktokTest && (
            <Card>
              <CardHeader>
                <CardTitle>Teste TikTok (5s)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-gray-50 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Como esse hook soaria em um clipe de 5 segundos:</p>
                  <p className="mt-2 font-medium">{result.tiktokTest}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sugestões */}
          {result.suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sugestões de Melhoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
