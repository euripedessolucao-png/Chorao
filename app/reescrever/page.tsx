"use client"

import { useState } from "react"
import { toast } from "sonner"
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

  // ... resto do componente igual ...
}
