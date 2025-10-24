// app/editar/page.tsx

"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { RefreshCw, Save, Copy, Search, Loader2, Star, Trophy, Trash2, Zap, Wand2 } from "lucide-react"
import { toast } from "sonner"
import { EMOTIONS } from "@/lib/genres"
import { GenreSelect } from "@/components/genre-select"
import { SyllableValidatorEditable } from "@/components/syllable-validator-editable"
import { InspirationManager } from "@/components/inspiration-manager"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { HookGenerator } from "@/components/hook-generator"
import { BRAZILIAN_GENRE_METRICS } from "@/lib/metrics/brazilian-metrics" // ✅ IMPORT CORRETO

// REMOVA a constante local BRAZILIAN_GENRE_METRICS

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
  // ... estados iguais ...

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
      // ✅ Obtém métricas reais do gênero
      const genreMetrics = BRAZILIAN_GENRE_METRICS[genre as keyof typeof BRAZILIAN_GENRE_METRICS] 
        || BRAZILIAN_GENRE_METRICS.default;
      
      const syllableConfig = {
        min: genreMetrics.syllableRange.min,
        max: genreMetrics.syllableRange.max,
        ideal: genreMetrics.syllableRange.ideal || Math.floor((genreMetrics.syllableRange.min + genreMetrics.syllableRange.max) / 2)
      };

      const inspirationsText = savedInspirations.map((i) => i.text).join("\n\n")

      // ✅ Nomes de campo alinhados com a API
      const requestBody = {
        originalLyrics: lyrics, // ✅ não "letraOriginal"
        genre,                  // ✅ não "genero"
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

      if (!data.lyrics) { // ✅ "lyrics", não "letra"
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

  // ... resto do componente igual, com as mesmas correções de nomes de campos ...
}
