"use client"

import { useState } from "react"
import { toast } from "sonner"
import { getGenreMetrics } from "@/lib/metrics/brazilian-metrics"

type ChorusVariation = {
  chorus: string
  style: string
  score: number
  justification: string
}

type ChorusResponse = {
  variations: ChorusVariation[]
  bestCommercialOptionIndex: number
}

export default function EditarPage() {
  const [lyrics, setLyrics] = useState("")
  const [genre, setGenre] = useState("")
  const [mood, setMood] = useState("")
  const [theme, setTheme] = useState("")
  const [title, setTitle] = useState("")
  const [formattingStyle, setFormattingStyle] = useState<"standard" | "performatico">("standard")
  const [additionalReqs, setAdditionalReqs] = useState("")
  const [advancedMode, setAdvancedMode] = useState(false)
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [inspirationText, setInspirationText] = useState("")
  const [metaphorSearch, setMetaphorSearch] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [savedInspirations, setSavedInspirations] = useState<Array<{ text: string; timestamp: number }>>([])

  const handleEditLyrics = async () => {
    if (!lyrics.trim()) {
      toast.error("Por favor, cole a letra para editar")
      return
    }

    if (!genre) {
      toast.error("Por favor, selecione um gênero")
      return
    }

    setIsEditing(true)

    try {
      const genreMetrics = getGenreMetrics(genre)

      const syllableConfig = {
        min: genreMetrics.syllableRange.min,
        max: genreMetrics.syllableRange.max,
        ideal:
          genreMetrics.syllableRange.ideal ||
          Math.floor((genreMetrics.syllableRange.min + genreMetrics.syllableRange.max) / 2),
      }

      const inspirationsText = savedInspirations.map((i) => i.text).join("\n\n")

      const requestBody = {
        originalLyrics: lyrics,
        genre,
        mood: mood || "Romântico",
        theme: theme || "Amor",
        creativity: "equilibrado",
        formattingStyle: formattingStyle,
        additionalRequirements: additionalReqs,
        advancedMode: advancedMode,
        universalPolish: true,
        syllableTarget: syllableConfig,
        emotions: selectedEmotions,
        inspiration: inspirationsText || inspirationText,
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
        throw new Error(data.error || `Erro ${response.status} na API`)
      }

      if (!data.lyrics) {
        throw new Error("Resposta da API não contém letra")
      }

      setLyrics(data.lyrics)
      if (data.title && !title) {
        setTitle(data.title)
      }

      toast.success("Letra editada com sucesso!", {
        description: `Score: ${data.metadata?.finalScore || "N/A"} | Modo: ${data.metadata?.performanceMode || "padrão"}`,
      })
    } catch (error) {
      console.error("💥 ERRO na edição:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao editar letra")
    } finally {
      setIsEditing(false)
    }
  }
}
