// app/criar/page.tsx
"use client"

// ... imports iguais ...

// ✅ REMOVA a constante BRAZILIAN_GENRE_METRICS local
// import { BRAZILIAN_GENRE_METRICS } from "@/lib/metrics/brazilian-metrics"; // ✅ IMPORT CORRETO

export default function CriarPage() {
  // ... estados iguais ...

  const handleGenerateLyrics = async () => {
    // ... validações ...

    setIsGenerating(true)

    try {
      // ✅ Obtém métricas reais do gênero
      const genreMetrics = BRAZILIAN_GENRE_METRICS[genre as keyof typeof BRAZILIAN_GENRE_METRICS] || BRAZILIAN_GENRE_METRICS.default;
      
      // ✅ Usa faixa realista
      const syllableConfig = {
        min: genreMetrics.syllableRange.min,
        max: genreMetrics.syllableRange.max,
        ideal: genreMetrics.syllableRange.ideal || Math.floor((genreMetrics.syllableRange.min + genreMetrics.syllableRange.max) / 2)
      };

      const requestBody = {
        // ✅ Nomes de campo alinhados com a API
        genre,          // ✅ não "genero"
        mood: mood || "Romântico",
        theme: theme || "Amor",
        creativity: "equilibrado",
        formattingStyle,
        additionalRequirements: additionalReqs,
        advancedMode,
        universalPolish: true,
        syllableTarget: syllableConfig,
        // ✅ NÃO envia "metrics"
        emotions: selectedEmotions,
        inspiration: savedInspirations.map(i => i.text).join("\n\n") || inspirationText,
        metaphors: metaphorSearch,
        title,
        performanceMode: formattingStyle === "performatico" ? "performance" : "standard",
      }

      const response = await fetch("/api/generate-lyrics", {
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

      toast.success("Letra criada com sucesso!", {
        description: `Score: ${data.metadata?.finalScore || "N/A"} | Modo: ${data.metadata?.performanceMode || "padrão"}`,
      })
    } catch (error) {
      console.error("Erro na criação:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao criar letra")
    } finally {
      setIsGenerating(false)
    }
  }

  // ... resto do componente igual ...
}
