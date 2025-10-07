"use client"

import { useState } from "react"
import { Sparkles, Copy, Save, Loader2, AlertCircle, RotateCcw } from "lucide-react"

interface GenreMetrics {
  syllablesPerLine: number;
  bpm: number;
  structure: string;
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

export function RewriteLyricsForm() {
  const [letraOriginal, setLetraOriginal] = useState("")
  const [letraReescrita, setLetraReescrita] = useState("")
  const [genero, setGenero] = useState("")
  const [tipoReescrita, setTipoReescrita] = useState("melhoria-metrica")
  const [intensidade, setIntensidade] = useState("media")
  const [isRewriting, setIsRewriting] = useState(false)

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

  const problematicLines = validateMetrics(letraOriginal)

  const showAlert = (title: string, description?: string) => {
    alert(title + (description ? `\n\n${description}` : ''))
  }

  const handleReescreverLetra = async () => {
    if (!letraOriginal.trim()) {
      showAlert("Erro", "Cole uma letra para reescrever primeiro.")
      return
    }

    if (!genero) {
      showAlert("Erro", "Selecione o gênero musical.")
      return
    }

    setIsRewriting(true)
    try {
      const response = await fetch("/api/rewrite-lyrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          letraOriginal,
          genero,
          tipoReescrita,
          intensidade,
          metrics: currentMetrics,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao reescrever letra")
      }

      const data = await response.json()
      setLetraReescrita(data.letraReescrita)

      showAlert("Letra reescrita com sucesso!", "Sua letra foi aprimorada usando técnicas avançadas.")
    } catch (error) {
      console.error("[v0] Error:", error)
      showAlert("Erro ao reescrever letra", "Ocorreu um erro ao processar a letra. Por favor, tente novamente.")
    } finally {
      setIsRewriting(false)
    }
  }

  const handleCorrigirMetrica = () => {
    const fixed = letraOriginal
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
    setLetraOriginal(fixed)

    showAlert("Métrica corrigida!", "As linhas foram ajustadas para a métrica ideal.")
  }

  const handleCopiarLetra = () => {
    if (!letraReescrita) {
      showAlert("Nenhuma letra para copiar", "Reescreva uma letra primeiro antes de copiar.")
      return
    }

    navigator.clipboard.writeText(letraReescrita)
    showAlert("Letra copiada!", "A letra reescrita foi copiada para a área de transferência.")
  }

  const handleRestaurarOriginal = () => {
    setLetraReescrita("")
    showAlert("Original restaurada", "A letra original foi restaurada.")
  }

  // Classes CSS para estilização
  const cardClass = "bg-white rounded-lg border border-gray-200 shadow-sm p-6"
  const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  const textareaClass = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[200px] resize-none"
  const selectClass = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  const buttonClass = "w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center gap-2"
  const buttonOutlineClass = "w-full border border-gray-300 bg-white text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2"

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* COLUNA 1: Letra Original */}
      <div className={cardClass}>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Letra Original</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="genero" className="block text-sm font-medium text-gray-700">
              Gênero Musical
            </label>
            <select
              id="genero"
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
              className={selectClass}
            >
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
            <label htmlFor="letra-original" className="block text-sm font-medium text-gray-700">
              Cole sua letra aqui
            </label>
            <textarea
              id="letra-original"
              placeholder="Cole a letra que deseja reescrever..."
              className={`${textareaClass} font-mono text-sm`}
              value={letraOriginal}
              onChange={(e) => setLetraOriginal(e.target.value)}
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

          <div className="flex gap-2">
            {problematicLines && problematicLines.length > 0 && (
              <button
                onClick={handleCorrigirMetrica}
                className="flex-1 border border-yellow-500 text-yellow-600 bg-yellow-50 py-2 px-4 rounded-lg font-medium hover:bg-yellow-100 flex items-center justify-center gap-2"
              >
                Corrigir Métrica
              </button>
            )}
          </div>
        </div>
      </div>

      {/* COLUNA 2: Configurações de Reescrita */}
      <div className={cardClass}>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Configurações</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="tipo-reescrita" className="block text-sm font-medium text-gray-700">
              Tipo de Reescrita
            </label>
            <select
              id="tipo-reescrita"
              value={tipoReescrita}
              onChange={(e) => setTipoReescrita(e.target.value)}
              className={selectClass}
            >
              <option value="melhoria-metrica">Melhoria de Métrica</option>
              <option value="otimizacao-rimas">Otimização de Rimas</option>
              <option value="intensificacao-emocao">Intensificação Emocional</option>
              <option value="versao-comercial">Versão Comercial</option>
              <option value="estilo-diferente">Mudança de Estilo</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="intensidade" className="block text-sm font-medium text-gray-700">
              Intensidade da Reescrita
            </label>
            <select
              id="intensidade"
              value={intensidade}
              onChange={(e) => setIntensidade(e.target.value)}
              className={selectClass}
            >
              <option value="leve">Leve (preserva original)</option>
              <option value="media">Média (equilibrada)</option>
              <option value="intensa">Intensa (mudanças significativas)</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Opções Avançadas</label>
            <div className="space-y-2">
              {[
                "Manter estrutura original",
                "Otimizar para streaming",
                "Adicionar metáforas",
                "Intensificar emoções"
              ].map((opcao) => (
                <div key={opcao} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={opcao}
                    defaultChecked
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={opcao} className="text-sm text-gray-700 cursor-pointer">
                    {opcao}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleReescreverLetra}
            className={buttonClass}
            disabled={isRewriting || !letraOriginal.trim() || !genero}
          >
            {isRewriting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Reescrever Letra
              </>
            )}
          </button>

          <div className="p-4 bg-purple-50 rounded-md border border-purple-200">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 mt-0.5" />
              <div className="text-sm text-purple-700">
                <strong>Terceira Via Ativa:</strong> Sua letra será processada usando variação A + variação B → versão final
                para garantir a melhor qualidade possível.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COLUNA 3: Letra Reescrita */}
      <div className={cardClass}>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Letra Reescrita</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="letra-reescrita" className="block text-sm font-medium text-gray-700">
              Resultado da Reescrita
            </label>
            <textarea
              id="letra-reescrita"
              placeholder="A letra reescrita aparecerá aqui..."
              className={`${textareaClass} font-mono text-sm`}
              value={letraReescrita}
              onChange={(e) => setLetraReescrita(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <button className={buttonOutlineClass} onClick={handleCopiarLetra}>
                <Copy className="w-4 h-4" />
                Copiar
              </button>
              <button className={buttonOutlineClass}>
                <Save className="w-4 h-4" />
                Salvar
              </button>
            </div>
            
            <button 
              onClick={handleRestaurarOriginal}
              className="w-full border border-gray-300 bg-white text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Restaurar Original
            </button>
          </div>

          {letraReescrita && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-600 text-sm">Reescrita Concluída</span>
              </div>
              <p className="text-sm text-green-700">
                Sua letra foi aprimorada usando técnicas avançadas de Terceira Via.
                {tipoReescrita === "melhoria-metrica" && " Métrica otimizada para o gênero selecionado."}
                {tipoReescrita === "otimizacao-rimas" && " Rimas e estrutura poética aprimoradas."}
                {tipoReescrita === "intensificacao-emocao" && " Impacto emocional intensificado."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
