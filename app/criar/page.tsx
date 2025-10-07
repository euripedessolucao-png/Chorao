"use client"

import type React from "react"

import { useState } from "react"
import { BRAZILIAN_GENRE_METRICS, validateMetrics, fixMetrics, type GenreName } from "@/lib/metrics"

export default function CreatePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [generatedLyrics, setGeneratedLyrics] = useState("")
  const [title, setTitle] = useState("")
  const [genre, setGenre] = useState("")
  const [theme, setTheme] = useState("")
  const [creativityLevel, setCreativityLevel] = useState("equilibrado")

  const genres = Object.keys(BRAZILIAN_GENRE_METRICS).filter((g) => g !== "default")

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!genre || !theme) {
      alert("Por favor, preencha o gênero e o tema")
      return
    }

    setIsLoading(true)
    setGeneratedLyrics("")

    try {
      const metrics = BRAZILIAN_GENRE_METRICS[genre as GenreName] || BRAZILIAN_GENRE_METRICS.default

      const response = await fetch("/api/generate-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genero: genre,
          tema: theme,
          criatividade: creativityLevel,
          metrics: metrics,
        }),
      })

      if (!response.ok) throw new Error("Erro ao gerar letra")

      const data = await response.json()
      setGeneratedLyrics(data.letra)
      setTitle(`Música sobre ${theme}`)
    } catch (error) {
      console.error("[v0] Erro ao gerar letra:", error)
      alert("Erro ao gerar letra. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const currentMetrics = BRAZILIAN_GENRE_METRICS[genre as GenreName] || BRAZILIAN_GENRE_METRICS.default
  const problematicLines = validateMetrics(generatedLyrics, genre)

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Criar Nova Letra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Painel de Parâmetros */}
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <h2 className="text-2xl font-semibold text-card-foreground mb-2">Parâmetros da Letra</h2>
            <p className="text-muted-foreground mb-6">Configure o gênero e tema para gerar sua letra</p>

            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Gênero Musical *</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full rounded-md border border-input bg-background py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Escolha o gênero</option>
                  {genres.map((genreName) => (
                    <option key={genreName} value={genreName}>
                      {genreName} ({BRAZILIAN_GENRE_METRICS[genreName as GenreName].syllablesPerLine}s)
                    </option>
                  ))}
                </select>

                {genre && (
                  <div className="mt-3 p-3 bg-primary/10 rounded-md border border-primary/20">
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-primary">Métrica:</span>
                        <div className="font-medium text-primary">{currentMetrics.syllablesPerLine} sílabas/linha</div>
                      </div>
                      <div>
                        <span className="text-primary">Ritmo:</span>
                        <div className="font-medium text-primary">{currentMetrics.bpm} BPM</div>
                      </div>
                      <div>
                        <span className="text-primary">Estrutura:</span>
                        <div className="font-medium text-primary">{currentMetrics.structure}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Tema *</label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Digite o tema da sua música..."
                  className="w-full rounded-md border border-input bg-background py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Nível de Criatividade</label>
                <select
                  value={creativityLevel}
                  onChange={(e) => setCreativityLevel(e.target.value)}
                  className="w-full rounded-md border border-input bg-background py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="conservador">Conservador</option>
                  <option value="equilibrado">Equilibrado</option>
                  <option value="ousado">Ousado</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading || !genre || !theme}
                className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-md font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">🔄</span>
                    Gerando...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🎵</span>
                    Gerar Letra com Métrica {currentMetrics.syllablesPerLine}s
                  </>
                )}
              </button>

              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start">
                  <span className="text-green-600 dark:text-green-400 mr-2 mt-0.5">⚡</span>
                  <div className="text-sm text-green-800 dark:text-green-200">
                    <strong>Sistema de Métrica Ativo:</strong> Sua letra será gerada automaticamente com a métrica ideal
                    para <strong>{genre || "o gênero selecionado"}</strong>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Painel de Resultado */}
          <div className="bg-card rounded-lg shadow-sm border p-6 flex flex-col">
            <div className="mb-6">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título da Música"
                className="w-full text-2xl font-bold border-none focus:outline-none focus:ring-0 p-0 bg-transparent"
                disabled={!generatedLyrics}
              />

              {genre && generatedLyrics && (
                <div className="flex gap-2 mt-3">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {currentMetrics.syllablesPerLine}s/linha
                  </span>
                  <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-950 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-200">
                    {currentMetrics.bpm}BPM
                  </span>
                  <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-950 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:text-purple-200">
                    {currentMetrics.structure}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <span className="animate-spin text-4xl mb-4 block">🔄</span>
                    <p className="text-muted-foreground">Criando sua letra...</p>
                    {genre && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Aplicando métrica de {currentMetrics.syllablesPerLine} sílabas/linha
                      </p>
                    )}
                  </div>
                </div>
              ) : generatedLyrics ? (
                <div className="space-y-4 flex flex-col flex-1">
                  <textarea
                    value={generatedLyrics}
                    onChange={(e) => setGeneratedLyrics(e.target.value)}
                    className="flex-1 w-full rounded-md border border-input bg-background py-2 px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring min-h-[400px]"
                    placeholder="Sua letra aparecerá aqui..."
                  />

                  {problematicLines && problematicLines.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span>⚠️</span>
                        <span className="font-medium text-yellow-800 dark:text-yellow-200">
                          Ajuste de Métrica Recomendado
                        </span>
                      </div>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                        <strong>{genre}</strong> recomenda até{" "}
                        <strong>{currentMetrics.syllablesPerLine} sílabas</strong> por linha.
                        {problematicLines.length} linha(s) precisam de ajuste.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 justify-between items-center">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(generatedLyrics)}
                        className="bg-background border text-foreground py-2 px-4 rounded-md text-sm font-medium hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 flex items-center"
                      >
                        <span className="mr-2">📋</span>
                        Copiar
                      </button>

                      {problematicLines && problematicLines.length > 0 && (
                        <button
                          onClick={() => {
                            const fixed = fixMetrics(generatedLyrics, currentMetrics.syllablesPerLine)
                            setGeneratedLyrics(fixed)
                          }}
                          className="bg-yellow-100 dark:bg-yellow-950 border border-yellow-300 dark:border-yellow-800 text-yellow-700 dark:text-yellow-200 py-2 px-4 rounded-md text-sm font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 flex items-center"
                        >
                          <span className="mr-2">🔄</span>
                          Corrigir Métrica
                        </button>
                      )}
                    </div>

                    <button className="bg-primary text-primary-foreground py-2 px-4 rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 flex items-center">
                      <span className="mr-2">💾</span>
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <span className="text-4xl mb-4 block">🎵</span>
                    <p>Preencha os parâmetros e gere sua primeira letra!</p>
                    {genre && (
                      <p className="text-sm mt-2">
                        Métrica automática: {currentMetrics.syllablesPerLine} sílabas/linha
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
