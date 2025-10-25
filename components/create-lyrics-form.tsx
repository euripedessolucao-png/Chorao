"use client"

import { useState } from "react"
import { Sparkles, Copy, Save, Loader2, AlertCircle } from "lucide-react"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter"

interface GenreMetrics {
  syllablesPerLine: number
  bpm: number
  structure: string
}

const BRAZILIAN_GENRE_METRICS: Record<string, GenreMetrics> = {
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

function countPortugueseSyllables(word: string): number {
  return countPoeticSyllables(word)
}

export function CreateLyricsForm() {
  const [genero, setGenero] = useState("")
  const [humor, setHumor] = useState("")
  const [tema, setTema] = useState("")
  const [criatividade, setCriatividade] = useState("equilibrado")
  const [hook, setHook] = useState("")
  const [inspiracao, setInspiracao] = useState("")
  const [metaforas, setMetaforas] = useState("")
  const [emocoes, setEmocoes] = useState<string[]>([])
  const [titulo, setTitulo] = useState("")
  const [letraGerada, setLetraGerada] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const currentMetrics =
    genero && BRAZILIAN_GENRE_METRICS[genero] ? BRAZILIAN_GENRE_METRICS[genero] : BRAZILIAN_GENRE_METRICS.default

  const validateMetrics = (lyrics: string) => {
    if (!genero || !lyrics) return null

    const metrics = BRAZILIAN_GENRE_METRICS[genero] || BRAZILIAN_GENRE_METRICS.default
    const maxSyllables = metrics.syllablesPerLine

    const lines = lyrics.split("\n").filter((line) => {
      const trimmed = line.trim()
      return trimmed && !trimmed.startsWith("[") && !trimmed.startsWith("(") && !trimmed.includes("Instrumental:")
    })

    const problematicLines = lines
      .map((line) => ({
        line,
        syllables: countPortugueseSyllables(line),
      }))
      .filter((item) => item.syllables > maxSyllables)

    return problematicLines
  }

  const problematicLines = validateMetrics(letraGerada)

  const handleEmocaoToggle = (emocao: string) => {
    setEmocoes((prev) => (prev.includes(emocao) ? prev.filter((e) => e !== emocao) : [...prev, emocao]))
  }

  const showAlert = (title: string, description?: string) => {
    alert(title + (description ? `\n\n${description}` : ""))
  }

  const handleGerarLetra = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-lyrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          genero,
          humor,
          tema,
          criatividade,
          hook,
          inspiracao,
          metaforas,
          emocoes,
          titulo,
          metrics: currentMetrics,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao gerar letra")
      }

      const data = await response.json()
      setLetraGerada(data.letra)

      showAlert("Letra gerada com sucesso!", "Sua letra foi criada. Você pode editá-la ou salvá-la.")
    } catch (error) {
      console.error("[v0] Error:", error)
      showAlert("Erro ao gerar letra", "Ocorreu um erro ao gerar a letra. Por favor, tente novamente.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCorrigirMetrica = () => {
    const fixed = letraGerada
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
    setLetraGerada(fixed)

    showAlert("Métrica corrigida!", "As linhas foram ajustadas para a métrica ideal.")
  }

  const handleCopiarLetra = () => {
    if (!letraGerada) {
      showAlert("Nenhuma letra para copiar", "Gere uma letra primeiro antes de copiar.")
      return
    }

    navigator.clipboard.writeText(letraGerada)
    showAlert("Letra copiada!", "A letra foi copiada para a área de transferência.")
  }

  // Classes CSS para estilização
  const cardClass = "bg-white rounded-lg border border-gray-200 shadow-sm p-6"
  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  const textareaClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] resize-none"
  const selectClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  const buttonClass =
    "w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center gap-2"
  const buttonOutlineClass =
    "w-full border border-gray-300 bg-white text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2"

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* COLUNA 1: Parâmetros da Letra */}
      <div className={cardClass}>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Parâmetros da Letra</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="genero" className="block text-sm font-medium text-gray-700">
              Gênero Musical
            </label>
            <select id="genero" value={genero} onChange={(e) => setGenero(e.target.value)} className={selectClass}>
              <option value="">Selecione o gênero</option>
              {Object.keys(BRAZILIAN_GENRE_METRICS)
                .filter((g) => g !== "default")
                .map((genreName) => (
                  <option key={genreName} value={genreName}>
                    {genreName} ({BRAZILIAN_GENRE_METRICS[genreName].syllablesPerLine}s)
                  </option>
                ))}
            </select>

            {genero && (
              <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Métrica:</span>
                    <div className="font-medium text-gray-900">{currentMetrics.syllablesPerLine} sílabas/linha</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Ritmo:</span>
                    <div className="font-medium text-gray-900">{currentMetrics.bpm} BPM</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Estrutura:</span>
                    <div className="font-medium text-gray-900 text-xs">{currentMetrics.structure}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="humor" className="block text-sm font-medium text-gray-700">
              Humor
            </label>
            <select id="humor" value={humor} onChange={(e) => setHumor(e.target.value)} className={selectClass}>
              <option value="">Selecione o humor</option>
              <option value="feliz">Feliz</option>
              <option value="triste">Triste</option>
              <option value="romantico">Romântico</option>
              <option value="nostalgico">Nostálgico</option>
              <option value="energetico">Energético</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="tema" className="block text-sm font-medium text-gray-700">
              Tema
            </label>
            <input
              id="tema"
              type="text"
              placeholder="Ex: Amor, Perda, Jornada..."
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="criatividade" className="block text-sm font-medium text-gray-700">
              Nível de Criatividade
            </label>
            <select
              id="criatividade"
              value={criatividade}
              onChange={(e) => setCriatividade(e.target.value)}
              className={selectClass}
            >
              <option value="conservador">Conservador</option>
              <option value="equilibrado">Equilibrado</option>
              <option value="ousado">Ousado</option>
              <option value="experimental">Experimental</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="hook" className="block text-sm font-medium text-gray-700">
              Hook/Refrão (opcional)
            </label>
            <input
              id="hook"
              type="text"
              placeholder="Digite um refrão marcante..."
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* COLUNA 2: Inspiração & Sensações */}
      <div className={cardClass}>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Inspiração & Sensações</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="inspiracao" className="block text-sm font-medium text-gray-700">
              Inspiração Literária
            </label>
            <textarea
              id="inspiracao"
              placeholder="Descreva referências literárias, poemas ou textos que inspiram..."
              className={textareaClass}
              value={inspiracao}
              onChange={(e) => setInspiracao(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="metaforas" className="block text-sm font-medium text-gray-700">
              Metáforas Inteligentes
            </label>
            <textarea
              id="metaforas"
              placeholder="Sugira metáforas ou figuras de linguagem que gostaria de ver..."
              className={textareaClass}
              value={metaforas}
              onChange={(e) => setMetaforas(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Tags de Emoção</label>
            <div className="space-y-2">
              {["Alegria", "Tristeza", "Saudade", "Paixão"].map((emocao) => (
                <div key={emocao} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={emocao}
                    checked={emocoes.includes(emocao)}
                    onChange={() => handleEmocaoToggle(emocao)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={emocao} className="text-sm text-gray-700 cursor-pointer">
                    {emocao}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* COLUNA 3: Preview da Letra */}
      <div className={cardClass}>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Preview da Letra</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">
              Título da Música
            </label>
            <input
              id="titulo"
              type="text"
              placeholder="Digite o título..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="letra" className="block text-sm font-medium text-gray-700">
              Letra Gerada
            </label>
            <textarea
              id="letra"
              placeholder="A letra gerada aparecerá aqui..."
              className={`${textareaClass} min-h-[300px] font-mono text-sm`}
              value={letraGerada}
              onChange={(e) => setLetraGerada(e.target.value)}
            />
          </div>

          {problematicLines && problematicLines.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-yellow-600 text-sm">Ajuste de Métrica Recomendado</span>
              </div>
              <p className="text-sm text-yellow-600">
                <strong>{genero}</strong> recomenda até <strong>{currentMetrics.syllablesPerLine} sílabas</strong> por
                linha.
                {problematicLines.length} linha(s) precisam de ajuste.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <button onClick={handleGerarLetra} className={buttonClass} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Gerar Letra
                </>
              )}
            </button>

            {problematicLines && problematicLines.length > 0 && (
              <button
                onClick={handleCorrigirMetrica}
                className="w-full border border-yellow-500 text-yellow-600 bg-yellow-50 py-2 px-4 rounded-lg font-medium hover:bg-yellow-100 flex items-center justify-center gap-2"
              >
                Corrigir Métrica
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button className={buttonOutlineClass}>
                <Save className="w-4 h-4" />
                Salvar Projeto
              </button>
              <button className={buttonOutlineClass} onClick={handleCopiarLetra}>
                <Copy className="w-4 h-4" />
                Copiar Letra
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
