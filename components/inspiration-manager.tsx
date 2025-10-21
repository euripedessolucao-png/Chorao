"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X, Plus } from "lucide-react"
import { toast } from "sonner"

type Inspiration = {
  id: number
  text: string
  type: "text" | "image" | "audio" | "link"
  date: string
}

type InspirationManagerProps = {
  onInspirationsChange?: (inspirations: Inspiration[]) => void
}

export function InspirationManager({ onInspirationsChange }: InspirationManagerProps) {
  const [inspirationText, setInspirationText] = useState("")
  const [savedInspirations, setSavedInspirations] = useState<Inspiration[]>([])

  // Carregar inspirações salvas do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("inspirations")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSavedInspirations(parsed)
        onInspirationsChange?.(parsed)
      } catch (error) {
        console.error("Erro ao carregar inspirações:", error)
      }
    }
  }, [])

  // Adicionar nova inspiração
  const handleAddInspiration = () => {
    if (!inspirationText.trim()) {
      toast.error("Digite algo antes de adicionar")
      return
    }

    const newInspiration: Inspiration = {
      id: Date.now(),
      text: inspirationText.trim(),
      type: "text",
      date: new Date().toISOString(),
    }

    const updated = [...savedInspirations, newInspiration]
    setSavedInspirations(updated)
    localStorage.setItem("inspirations", JSON.stringify(updated))
    onInspirationsChange?.(updated)

    setInspirationText("")
    toast.success("Inspiração adicionada ao diário!")
  }

  // Remover inspiração
  const handleRemoveInspiration = (id: number) => {
    const updated = savedInspirations.filter((i) => i.id !== id)
    setSavedInspirations(updated)
    localStorage.setItem("inspirations", JSON.stringify(updated))
    onInspirationsChange?.(updated)

    toast.success("Inspiração removida")
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Textarea
          placeholder="Adicione uma inspiração textual..."
          value={inspirationText}
          onChange={(e) => setInspirationText(e.target.value)}
          rows={3}
          className="text-xs"
        />
        <Button size="sm" variant="secondary" className="w-full" onClick={handleAddInspiration}>
          <Plus className="h-3 w-3 mr-1" />
          Adicionar Inspiração
        </Button>
      </div>

      {savedInspirations.length > 0 ? (
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Inspirações Salvas ({savedInspirations.length})</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {savedInspirations.map((inspiration) => (
              <div key={inspiration.id} className="bg-muted/50 rounded p-2 text-xs relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveInspiration(inspiration.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
                <p className="pr-6 whitespace-pre-wrap">{inspiration.text}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(inspiration.date).toLocaleDateString("pt-BR")}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center">Nenhuma inspiração salva ainda.</p>
      )}
    </div>
  )
}
