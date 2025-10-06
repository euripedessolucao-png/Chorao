"use client"

import type React from "react"
import { useState } from "react"

// Sistema de métricas por gênero brasileiro
const BRAZILIAN_GENRE_METRICS = {
  "Sertanejo Moderno": { syllablesPerLine: 6, bpm: 90, structure: "VERSO-REFRAO-PONTE" },
  Sertanejo: { syllablesPerLine: 7, bpm: 85, structure: "VERSO-REFRAO-PONTE" },
  "Sertanejo Universitário": { syllablesPerLine: 6, bpm: 95, structure: "VERSO-REFRAO" },
  "Sertanejo Sofrência": { syllablesPerLine: 8, bpm: 75, structure: "VERSO-REFRAO-PONTE" },
  "Sertanejo Raiz": { syllablesPerLine: 10, bpm: 80, structure: "VERSO-REFRAO" },
  Pagode: { syllablesPerLine: 7, bpm: 100, structure: "VERSO-REFRAO" },
  Samba: { syllablesPerLine: 7, bpm: 105, structure: "VERSO-REFRAO-PONTE" },
  Forró: { syllablesPerLine: 8, bpm: 120, structure: "VERSO-REFRAO" },
  Axé: { syllablesPerLine: 6, bpm: 130, structure: "VERSO-REFRAO" },
  MPB: { syllablesPerLine: 9, bpm: 90, structure: "VERSO-REFRAO-PONTE" },
  "Bossa Nova": { syllablesPerLine: 8, bpm: 70, structure: "VERSO-REFRAO" },
  Rock: { syllablesPerLine: 8, bpm: 115, structure: "VERSO-REFRAO-SOLO" },
  Pop: { syllablesPerLine: 7, bpm: 110, structure: "VERSO-REFRAO-PONTE" },
  Funk: { syllablesPerLine: 6, bpm: 125, structure: "REFRAO-VERSO" },
  Gospel: { syllablesPerLine: 8, bpm: 85, structure: "VERSO-REFRAO-PONTE" },
  default: { syllablesPerLine: 8, bpm: 100, structure: "VERSO-REFRAO" },
}

// Função para contar sílabas em português
function countPortugueseSyllables(word: string): number {
  if (!word.trim()) return 0

  const cleanWord = word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zà-úâ-ûã-õä-üç]/g, "")

  if (cleanWord.length === 0) return 0

  let syllableCount = 0
  let i = 0

  while (i < cleanWord.length) {
    const currentChar = cleanWord[i]

    if ("aeiouáéíóúâêîôûàèìòùãõ".includes(currentChar)) {
      syllableCount++

      if (i + 1 < cleanWord.length) {
        const nextChar = cleanWord[i + 1]
        if (
          ("aeo".includes(currentChar) && "iu".includes(nextChar)) ||
          ("iu".includes(currentChar) && "aeo".includes(nextChar))
        ) {
          i++
        }
      }
    }
    i++
  }

  return Math.max(1, syllableCount)
}

export default function CreatePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [generatedLyrics, setGeneratedLyrics] = useState("")
  const [title, setTitle] = useState("")
  const [genre, setGenre] = useState("")
  const [theme, setTheme] = useState("")
  const [creativityLevel, setCreativityLevel] = useState("medium")

  const genres = [
    "Sertanejo Moderno",
    "Sertanejo",
    "Sertanejo Universitário",
    "Sertanejo Sofrência",
    "Sertanejo Raiz",
    "Pagode",
    "Samba",
    "Forró",
    "Axé",
    "MPB",
    "Bossa Nova",
    "Rock",
    "Pop",
    "Funk",
    "Gospel",
  ]

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!genre || !theme) {
      alert("Por favor, preencha o gênero e o tema")
      return
    }

    setIsLoading(true)
    setGeneratedLyrics("")

    try {
      const metrics = BRAZILIAN_GENRE_METRICS[genre] || BRAZILIAN_GENRE_METRICS.default

      // Simulação de API
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const result = {
        lyrics: `[INTRO]\nUma nova história vai começar\n\n[VERSO 1]\n${theme} na melodia do coração\nCada verso escrito com emoção\n\n[REFRAO]\nEsta música é pra você cantar\nE no ritmo da vida dançar\n\nMétrica: ${metrics.syllablesPerLine} sílabas/linha | BPM: ${metrics.bpm}`,
        title: `Música sobre ${theme}`,
      }

      setGeneratedLyrics(result.lyrics)
      setTitle(result.title)
    } catch (error) {
      console.error("Erro ao gerar letra:", error)
      alert("Erro ao gerar letra. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const currentMetrics = genre ? BRAZILIAN_GENRE_METRICS[genre] : BRAZILIAN_GENRE_METRICS.default

  // Validar métrica da letra gerada
  const validateMetrics = (lyrics: string) => {
    if (!genre || !lyrics) return null

    const metrics = BRAZILIAN_GENRE_METRICS[genre] || BRAZILIAN_GENRE_METRICS.default
    const maxSyllables = metrics.syllablesPerLine

    const lines = lyrics.split("\n").filter((line) => {
      const trimmed = line.trim()
      return trimmed && !trimmed.startsWith("[") && !trimmed.startsWith("(") && !trimmed.includes("Instrumental:")
    })

    const problematicLines = lines
      .map((line, index) => ({
        line,
        syllables: countPortugueseSyllables(line),
      }))
      .filter((item) => item.syllables > maxSyllables)

    return problematicLines
  }

  const problematicLines = validateMetrics(generatedLyrics)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Criar Nova Letra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Painel de Parâmetros */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Parâmetros da Letra</h2>
            <p className="text-gray-600 mb-6">Configure o gênero e tema para gerar sua letra</p>

            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gênero Musical *</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Escolha o gênero</option>
                  {genres.map((genreName) => (
                    <option key={genreName} value={genreName}>
                      {genreName} ({BRAZILIAN_GENRE_METRICS[genreName]?.syllablesPerLine || 8}s)
                    </option>
                  ))}
                </select>

                {genre && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-blue-700">Métrica:</span>
                        <div className="font-medium text-blue-900">{currentMetrics.syllablesPerLine} sílabas/linha</div>
                      </div>
                      <div>
                        <span className="text-blue-700">Ritmo:</span>
                        <div className="font-medium text-blue-900">{currentMetrics.bpm} BPM</div>
                      </div>
                      <div>
                        <span className="text-blue-700">Estrutura:</span>
                        <div className="font-medium text-blue-900">{currentMetrics.structure}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tema *</label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Digite o tema da sua música..."
                  className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nível de Criatividade</label>
                <select
                  value={creativityLevel}
                  onChange={(e) => setCreativityLevel(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Conservador</option>
                  <option value="medium">Equilibrado</option>
                  <option value="high">Ousado</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading || !genre || !theme}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start">
                  <span className="text-green-600 mr-2 mt-0.5">⚡</span>
                  <div className="text-sm text-green-800">
                    <strong>Sistema de Métrica Ativo:</strong> Sua letra será gerada automaticamente com a métrica ideal
                    para <strong>{genre || "o gênero selecionado"}</strong>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Painel de Resultado */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col">
            <div className="mb-6">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título da Música"
                className="w-full text-2xl font-bold border-none focus:outline-none focus:ring-0 p-0"
                disabled={!generatedLyrics}
              />

              {genre && generatedLyrics && (
                <div className="flex gap-2 mt-3">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {currentMetrics.syllablesPerLine}s/linha
                  </span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    {currentMetrics.bpm}BPM
                  </span>
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
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
                    <p className="text-gray-600">Criando sua letra...</p>
                    {genre && (
                      <p className="text-sm text-gray-600 mt-2">
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
                    className="flex-1 w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[400px]"
                    placeholder="Sua letra aparecerá aqui..."
                  />

                  {/* Validação de Métrica */}
                  {problematicLines && problematicLines.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span>⚠️</span>
                        <span className="font-medium text-yellow-800">Ajuste de Métrica Recomendado</span>
                      </div>
                      <p className="text-sm text-yellow-700 mb-2">
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
                        className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                      >
                        <span className="mr-2">📋</span>
                        Copiar
                      </button>

                      {problematicLines && problematicLines.length > 0 && (
                        <button
                          onClick={() => {
                            // Correção simples: adicionar quebra em linhas longas
                            const fixed = generatedLyrics
                              .split("\n")
                              .map((line) => {
                                if (countPortugueseSyllables(line) > currentMetrics.syllablesPerLine) {
                                  const words = line.split(" ")
                                  if (words.length > 2) {
                                    const mid = Math.floor(words.length / 2)
                                    return words.slice(0, mid).join(" ") + "\n" + words.slice(mid).join(" ")
                                  }
                                }
                                return line
                              })
                              .join("\n")
                            setGeneratedLyrics(fixed)
                          }}
                          className="bg-yellow-100 border border-yellow-300 text-yellow-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 flex items-center"
                        >
                          <span className="mr-2">🔄</span>
                          Corrigir Métrica
                        </button>
                      )}
                    </div>

                    <button className="bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center">
                      <span className="mr-2">💾</span>
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-600">
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
