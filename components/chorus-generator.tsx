"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Wand2, Star, Trophy, Check } from "lucide-react"
import { toast } from "sonner"

interface ChorusVariation {
  chorus: string
  style: string
  score: number
  justification: string
}

interface ChorusGeneratorProps {
  genre: string
  theme: string
  mood?: string
  lyrics?: string // Adicionando prop para letra original
  onSelectChorus?: (choruses: ChorusVariation[]) => void
  showSelectionMode?: boolean
  maxSelection?: number
}

export function ChorusGenerator({
  genre,
  theme,
  mood = "",
  lyrics = "", // Adicionando lyrics com valor padrão
  onSelectChorus,
  showSelectionMode = false,
  maxSelection = 2,
}: ChorusGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [variations, setVariations] = useState<ChorusVariation[]>([])
  const [bestIndex, setBestIndex] = useState<number>(-1)
  const [selectedChoruses, setSelectedChoruses] = useState<ChorusVariation[]>([])

  useEffect(() => {
    if (genre && theme && variations.length === 0 && !isGenerating) {
      generateChorus()
    }
  }, [genre, theme])

  useEffect(() => {
    if (onSelectChorus && selectedChoruses.length > 0) {
      onSelectChorus(selectedChoruses)
    }
  }, [selectedChoruses])

  const generateChorus = async () => {
    setIsGenerating(true)
    setVariations([])
    setSelectedChoruses([])

    try {
      const response = await fetch("/api/generate-chorus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genre,
          theme,
          mood,
          lyrics, // Enviando letra original para a API
          advancedMode: true,
        }),
      })

      if (!response.ok) throw new Error("Erro ao gerar refrão")

      const data = await response.json()
      setVariations(data.variations || [])
      setBestIndex(data.bestCommercialOptionIndex ?? -1)

      if (data.bestCommercialOptionIndex !== undefined && data.variations[data.bestCommercialOptionIndex]) {
        setSelectedChoruses([data.variations[data.bestCommercialOptionIndex]])
      }

      toast.success("5 refrões gerados com sucesso!")
    } catch (error) {
      toast.error("Erro ao gerar refrão. Tente novamente.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelectChorus = (chorus: ChorusVariation) => {
    setSelectedChoruses((prev) => {
      const isSelected = prev.find((c) => c.chorus === chorus.chorus)

      if (isSelected) {
        return prev.filter((c) => c.chorus !== chorus.chorus)
      }

      if (prev.length < maxSelection) {
        return [...prev, chorus]
      } else {
        toast.error(`Você pode selecionar no máximo ${maxSelection} refrões`)
        return prev
      }
    })
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-600" />
            Gerador de Refrão
          </CardTitle>
          <p className="text-sm text-muted-foreground">Gerando automaticamente 5 refrões com notas para escolha</p>
        </CardHeader>
        <CardContent>
          {isGenerating && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <span>Gerando 5 refrões...</span>
            </div>
          )}

          {!isGenerating && variations.length === 0 && (
            <div className="text-center p-4 text-muted-foreground">Nenhum refrão gerado ainda</div>
          )}
        </CardContent>
      </Card>

      {variations.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {showSelectionMode
              ? `Selecione até ${maxSelection} refrões para adicionar aos requisitos`
              : "5 variações de refrão geradas"}
          </p>

          {variations.map((variation, index) => (
            <Card
              key={index}
              className={`cursor-pointer transition-all ${
                selectedChoruses.find((c) => c.chorus === variation.chorus)
                  ? "border-primary ring-2 ring-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => showSelectionMode && handleSelectChorus(variation)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-base">{variation.style}</CardTitle>
                    <div className="flex items-center gap-2">
                      {renderStars(variation.score)}
                      <span className="text-xs font-bold text-muted-foreground">({variation.score}/10)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {bestIndex === index && (
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                        <Trophy className="h-3 w-3 mr-1" />
                        Melhor Opção
                      </Badge>
                    )}
                    {showSelectionMode && selectedChoruses.find((c) => c.chorus === variation.chorus) && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
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
      )}
    </div>
  )
}

export default ChorusGenerator
