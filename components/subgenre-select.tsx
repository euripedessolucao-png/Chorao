"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SubgenreSelectProps {
  genre: string
  value: string
  onValueChange: (value: string) => void
}

const SUBGENRES: Record<string, { value: string; label: string }[]> = {
  "Sertanejo Moderno Feminino": [
    { value: "moderno", label: "Moderno" },
    { value: "arrocha", label: "Arrocha" },
    { value: "vanera", label: "Vanera" },
  ],
  "Sertanejo Moderno Masculino": [
    { value: "moderno", label: "Moderno" },
    { value: "arrocha", label: "Arrocha" },
    { value: "vanera", label: "Vanera" },
    { value: "modão", label: "Modão" },
  ],
  "Sertanejo Universitário": [
    { value: "universitário", label: "Universitário" },
    { value: "arrocha", label: "Arrocha" },
  ],
  "Sertanejo Raiz": [
    { value: "toada", label: "Toada" },
    { value: "modão", label: "Modão" },
    { value: "vanera", label: "Vanera" },
  ],
  "Forró Pé de Serra": [
    { value: "xote", label: "Xote" },
    { value: "baião", label: "Baião" },
    { value: "piseiro", label: "Piseiro" },
  ],
  "Pagode Romântico": [
    { value: "pagode romântico", label: "Romântico" },
    { value: "pagode 90", label: "Anos 90" },
  ],
  Samba: [
    { value: "samba de raiz", label: "Samba de Raiz" },
    { value: "pagode", label: "Pagode" },
  ],
}

export function SubgenreSelect({ genre, value, onValueChange }: SubgenreSelectProps) {
  const subgenres = SUBGENRES[genre] || []

  if (subgenres.length === 0) {
    return null
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-9 text-sm">
        <SelectValue placeholder="Selecione o ritmo" />
      </SelectTrigger>
      <SelectContent>
        {subgenres.map((subgenre) => (
          <SelectItem key={subgenre.value} value={subgenre.value}>
            {subgenre.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
