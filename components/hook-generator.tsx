"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, Sparkles, TrendingUp, Zap, Check } from "lucide-react"
import { toast } from "sonner"

interface HookResult {
  hook: string
  hookVariations: string[]
  score: number
  suggestions: string[]
  placement: string[]
  tiktokTest: string
  tiktokScore: number
  transformations: Array<{
    original: string
    variations: string[]
    transformed: string
    reason: string
  }>
}

interface HookGeneratorProps {
  onSelectHook?: (hook: string) => void
  showSelectionMode?: boolean
  initialLyrics?: string
  initialGenre?: string
  initialTheme?: string // ✅ PROP ADICIONADA
}

export function HookGenerator({
  onSelectHook,
  showSelectionMode = false,
  initialLyrics = "",
  initialGenre = "",
  initialTheme = "", // ✅ PROP ADICIONADA AQUI TAMBÉM
}: HookGeneratorProps) {
  const [lyrics, setLyrics] = useState(initialLyrics)
  const [genre, setGenre] = useState(initialGenre)
  const [theme, setTheme] = useState(initialTheme) // ✅ STATE ADICIONADO
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<HookResult | null>(null)
  const [selectedHook, setSelectedHook] = useState<string | null>(null)

  useEffect(() => {
    if (initialLyrics) setLyrics(initialLyrics)
  }, [initialLyrics])

  useEffect(() => {
    if (initialGenre) setGenre(initialGenre)
  }, [initialGenre])

  useEffect(() => {
    if (initialTheme) setTheme(initialTheme)
  }, [initialTheme])

  useEffect(() => {
    if (initialLyrics && initialGenre && initialTheme && !result && !isGenerating) {
      generateHook()
    }
  }, [initialLyrics, initialGenre, initialTheme])

  const generateHook = async () => {
    if (!lyrics.trim()) {
      toast.error("Cole uma letra para gerar hooks")
      return
    }

    setIsGenerating(true)
    setResult(null)
    setSelectedHook(null)

    try {
      const response = await fetch("/api/generate-hook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lyrics: lyrics.trim(),
          genre,
          theme, // ✅ ENVIANDO TEMA PARA A API
        }),
      })

      if (!response.ok) throw new Error("Erro ao gerar hook")

      const data = await response.json()
      setResult(data)

      if (showSelectionMode && data.hook) {
        setSelectedHook(data.hook)
      }

      toast.success("Hooks gerados com sucesso!")
    } catch (error) {
      toast.error("Erro ao gerar hook. Tente novamente.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelectHook = (hook: string) => {
    setSelectedHook(hook)
    if (onSelectHook) {
      onSelectHook(hook)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreVariant = (score: number): "default" | "secondary" | "outline" => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "outline"
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
            {initialLyrics
              ? "Gerando automaticamente 3 hooks da letra..."
              : "Analise sua letra e gere 3 variações de hooks comerciais com pontuação de viralidade"}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!initialLyrics && (
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
          )}

          {initialLyrics && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✓ Usando letra já colada ({lyrics.split("\n").filter((l) => l.trim()).length} linhas)
                {genre && ` • Gênero: ${genre}`}
                {theme && ` • Tema: ${theme}`} {/* ✅ MOSTRANDO TEMA SE EXISTIR */}
              </p>
            </div>
          )}

          {!initialLyrics && (
            <Button onClick={generateHook} disabled={isGenerating || !lyrics.trim()} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisando Gancho...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar 3 Hooks & Ganchômetro
                </>
              )}
            </Button>
          )}

          {initialLyrics && isGenerating && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-sm">Gerando 3 hooks automaticamente...</span>
            </div>
          )}
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

          <Card>
            <CardHeader>
              <CardTitle>
                {showSelectionMode ? "Escolha o Melhor Hook (1 de 3)" : "Variações de Hook Geradas"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {showSelectionMode
                  ? "Selecione o hook que melhor se encaixa na sua composição"
                  : "3 variações geradas pela Terceira Via"}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Main Hook - Best Option */}
              <Card
                className={`cursor-pointer transition-all ${
                  selectedHook === result.hook
                    ? "border-primary ring-2 ring-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => showSelectionMode && handleSelectHook(result.hook)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default" className="bg-green-600">
                          Melhor Opção
                        </Badge>
                        <span className="text-xs text-muted-foreground">Síntese das 3 variações</span>
                      </div>
                      <p className="text-lg font-medium">"{result.hook}"</p>
                    </div>
                    {showSelectionMode && selectedHook === result.hook && (
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Variations */}
              {result.hookVariations.map((variation, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all ${
                    selectedHook === variation
                      ? "border-primary ring-2 ring-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => showSelectionMode && handleSelectHook(variation)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Variação {index + 1}</Badge>
                        </div>
                        <p className="text-lg font-medium">"{variation}"</p>
                      </div>
                      {showSelectionMode && selectedHook === variation && (
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
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

export default HookGenerator
