"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Search } from "lucide-react"

export function InspirationDiaryPanel() {
  const [inspirationType, setInspirationType] = useState<"text" | "image" | "audio" | "link">("text")
  const [inspirationText, setInspirationText] = useState("")

  return (
    <div className="border rounded-lg bg-muted/50 p-4">
      <h3 className="font-bold mb-1 text-primary">Diário de Inspiração</h3>
      <p className="text-xs text-muted-foreground mb-3">
        Adicione textos, áudios, imagens ou links que representam experiências, sensações ou histórias reais. Eles serão
        usados como inspiração para compor suas letras.
      </p>

      <div className="flex gap-2 mb-3">
        <Button
          variant={inspirationType === "text" ? "default" : "outline"}
          size="sm"
          onClick={() => setInspirationType("text")}
        >
          Texto
        </Button>
        <Button
          variant={inspirationType === "image" ? "default" : "outline"}
          size="sm"
          onClick={() => setInspirationType("image")}
        >
          Imagem
        </Button>
        <Button
          variant={inspirationType === "audio" ? "default" : "outline"}
          size="sm"
          onClick={() => setInspirationType("audio")}
        >
          Áudio
        </Button>
        <Button
          variant={inspirationType === "link" ? "default" : "outline"}
          size="sm"
          onClick={() => setInspirationType("link")}
        >
          Link
        </Button>
      </div>

      <Textarea
        placeholder="Adicione uma inspiração textual..."
        value={inspirationText}
        onChange={(e) => setInspirationText(e.target.value)}
        className="mb-2 min-h-[80px]"
      />

      <Button className="w-full" size="sm">
        Adicionar Inspiração
      </Button>

      <p className="text-xs text-muted-foreground mt-2">Nenhuma inspiração salva ainda.</p>
    </div>
  )
}

export function InspirationGlobalPanel({
  onInsertSuggestion,
}: {
  onInsertSuggestion: (suggestion: string) => void
}) {
  const [genreQuery, setGenreQuery] = useState("")
  const [emotionQuery, setEmotionQuery] = useState("")

  return (
    <div className="border rounded-lg bg-muted/50 p-4">
      <h3 className="font-bold mb-1 text-primary">Inspiração Literária Global</h3>
      <p className="text-xs text-muted-foreground mb-3">
        Busque referências criativas em best-sellers, romances e grandes histórias do mundo todo. A IA transforma tudo
        em sugestões originais, seguras e adaptadas à música brasileira.
      </p>

      <div className="flex gap-2 mb-2">
        <Input
          placeholder="Gênero musical"
          value={genreQuery}
          onChange={(e) => setGenreQuery(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder="Emoção (opcional)"
          value={emotionQuery}
          onChange={(e) => setEmotionQuery(e.target.value)}
          className="flex-1"
        />
        <Button size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function MetaphorPanel({
  genre,
  mood,
  onInsert,
}: {
  genre: string
  mood: string
  onInsert: (metaphor: string) => void
}) {
  const [query, setQuery] = useState("")
  const [metaphors] = useState<string[]>([])

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <Input
          placeholder="Buscar metáfora por tema..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {metaphors.length === 0 && (
          <p className="text-xs text-muted-foreground">Busque por um tema ou palavra-chave.</p>
        )}
        {metaphors.map((meta, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="italic text-sm flex-1">"{meta}"</span>
            <Button variant="outline" size="sm" onClick={() => onInsert(meta)}>
              Inserir
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function EmotionsPanel({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (emotions: string[]) => void
}) {
  const emotions = [
    "Alegria",
    "Alívio",
    "Amor",
    "Ansiedade",
    "Confusão",
    "Conexão",
    "Coragem",
    "Culpa",
    "Desapego",
    "Desilusão",
    "Desprezo",
    "Empoderamento",
    "Empolgação",
    "Encantamento",
    "Esperança",
    "Euforia",
    "Gratidão",
    "Inveja",
    "Liberdade",
    "Medo",
    "Melancolia",
    "Nostalgia",
    "Otimismo",
    "Orgulho",
    "Paixão",
    "Paz",
    "Raiva",
    "Saudade",
    "Solidão",
    "Tensão",
    "Ternura",
    "Tristeza",
    "Vergonha",
  ]

  const toggleEmotion = (emotion: string) => {
    if (selected.includes(emotion)) {
      onChange(selected.filter((e) => e !== emotion))
    } else {
      onChange([...selected, emotion])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {emotions.map((emotion) => (
        <Button
          key={emotion}
          variant={selected.includes(emotion) ? "default" : "outline"}
          size="sm"
          onClick={() => toggleEmotion(emotion)}
        >
          {emotion}
        </Button>
      ))}
    </div>
  )
}
