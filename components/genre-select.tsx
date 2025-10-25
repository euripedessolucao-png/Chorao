"use client"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GENRE_HIERARCHY } from "@/lib/genres"

interface GenreSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function GenreSelect({ value, onValueChange, placeholder = "Selecione o gênero", className }: GenreSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(GENRE_HIERARCHY).map(([parent, data]) => (
          <SelectGroup key={parent}>
            <SelectLabel className="font-semibold text-primary">{data.label}</SelectLabel>
            {data.subgenres.map((subgenre) => (
              <SelectItem key={subgenre.name} value={subgenre.name} className="pl-6">
                {subgenre.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}
