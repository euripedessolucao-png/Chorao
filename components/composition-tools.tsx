"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Loader2 } from "lucide-react"

// RhymeSuggester Component
export function RhymeSuggester({
  onSelectRhyme,
}: {
  onSelectRhyme: (word: string) => void
}) {
  const [word, setWord] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [rhymes, setRhymes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fallbackRhymes: Record<string, string[]> = {
    amor: ["dor", "flor", "cor", "calor", "valor", "clamor"],
    coração: ["paixão", "emoção", "canção", "solidão", "razão", "ilusão"],
    vida: ["partida", "ferida", "querida", "perdida", "sofrida", "corrida"],
    saudade: ["verdade", "cidade", "liberdade", "vontade", "amizade", "idade"],
    sonho: ["orgulho", "redonho", "medonho", "tristonho"],
    tempo: ["momento", "vento", "tormento", "lamento", "contento"],
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (word.trim()) {
        setIsLoading(true)
        // Simula busca de rimas
        setTimeout(() => {
          const lowercaseWord = word.toLowerCase()
          setRhymes(fallbackRhymes[lowercaseWord] || [])
          setIsLoading(false)
        }, 500)
      } else {
        setRhymes([])
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [word])

  const handleSelectRhyme = (selectedWord: string) => {
    onSelectRhyme(selectedWord)
    setIsOpen(false)
    setWord("")
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          Encontrar Rimas
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-2">
          <h3 className="font-medium">Buscar Rimas</h3>
          <Input placeholder="Digite uma palavra" value={word} onChange={(e) => setWord(e.target.value)} />
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : rhymes.length > 0 ? (
              <div className="grid grid-cols-1 gap-1">
                {rhymes.map((rhyme, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => handleSelectRhyme(rhyme)}
                  >
                    {rhyme}
                  </Button>
                ))}
              </div>
            ) : word ? (
              <p className="text-sm text-muted-foreground py-2">Nenhuma rima encontrada</p>
            ) : (
              <p className="text-sm text-muted-foreground py-2">Digite uma palavra para encontrar rimas</p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// SynonymSuggester Component
export function SynonymSuggester({
  onSelectSynonym,
}: {
  onSelectSynonym: (word: string) => void
}) {
  const [word, setWord] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [synonyms, setSynonyms] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fallbackSynonyms: Record<string, string[]> = {
    amor: ["paixão", "afeto", "carinho", "ternura", "adoração"],
    feliz: ["alegre", "contente", "satisfeito", "radiante", "jubiloso"],
    triste: ["melancólico", "abatido", "deprimido", "desanimado"],
    bonito: ["belo", "lindo", "formoso", "atraente", "encantador"],
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (word.trim()) {
        setIsLoading(true)
        setTimeout(() => {
          const lowercaseWord = word.toLowerCase()
          setSynonyms(fallbackSynonyms[lowercaseWord] || [])
          setIsLoading(false)
        }, 500)
      } else {
        setSynonyms([])
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [word])

  const handleSelectSynonym = (selectedWord: string) => {
    onSelectSynonym(selectedWord)
    setIsOpen(false)
    setWord("")
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          Encontrar Sinônimos
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-2">
          <h3 className="font-medium">Buscar Sinônimos</h3>
          <Input placeholder="Digite uma palavra" value={word} onChange={(e) => setWord(e.target.value)} />
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : synonyms.length > 0 ? (
              <div className="grid grid-cols-1 gap-1">
                {synonyms.map((synonym, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => handleSelectSynonym(synonym)}
                  >
                    {synonym}
                  </Button>
                ))}
              </div>
            ) : word ? (
              <p className="text-sm text-muted-foreground py-2">Nenhum sinônimo encontrado</p>
            ) : (
              <p className="text-sm text-muted-foreground py-2">Digite uma palavra para encontrar sinônimos</p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// LineCompleter Component
export function LineCompleter({
  onCompleteLine,
  genre,
  mood,
}: {
  onCompleteLine: (line: string) => void
  genre: string
  mood: string
}) {
  const [partialLine, setPartialLine] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [completedLine, setCompletedLine] = useState("")

  const handleCompleteLine = async () => {
    if (!partialLine.trim()) return

    setIsLoading(true)
    // Simula completar verso
    setTimeout(() => {
      setCompletedLine(`${partialLine} e o coração se entrega`)
      setIsLoading(false)
    }, 1000)
  }

  const handleSelectCompletion = () => {
    if (completedLine) {
      onCompleteLine(completedLine)
      setIsOpen(false)
      setPartialLine("")
      setCompletedLine("")
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          Completar Verso
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="space-y-3">
          <h3 className="font-medium">Completar Verso</h3>
          <div>
            <Input
              placeholder="Digite o início do verso..."
              value={partialLine}
              onChange={(e) => setPartialLine(e.target.value)}
            />
            <div className="mt-2">
              <Button
                size="sm"
                className="w-full"
                onClick={handleCompleteLine}
                disabled={isLoading || !partialLine.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completando...
                  </>
                ) : (
                  "Gerar Sugestão"
                )}
              </Button>
            </div>
          </div>

          {completedLine && (
            <div className="mt-2 space-y-2">
              <div className="p-2 bg-muted rounded-md">
                <p className="text-sm">{completedLine}</p>
              </div>
              <Button size="sm" className="w-full" onClick={handleSelectCompletion}>
                Usar Esta Sugestão
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ExpressionSuggester Component
export function ExpressionSuggester({
  onSelectExpression,
}: {
  onSelectExpression: (expression: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  const expressions = [
    "como um raio de sol",
    "nas asas do vento",
    "sob o céu estrelado",
    "entre sonhos e realidade",
    "no silêncio da noite",
  ]

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          Expressões Estratégicas
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-2">
          <h3 className="font-medium">Expressões Estratégicas</h3>
          <div className="grid grid-cols-1 gap-1">
            {expressions.map((expression, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => {
                  onSelectExpression(expression)
                  setIsOpen(false)
                }}
              >
                {expression}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
