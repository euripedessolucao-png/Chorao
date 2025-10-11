"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import Link from "next/link"

const genres = ["Todos", "Sertanejo", "Pagode", "MPB", "Rock"]

export function GalleryHeader() {
  const [activeFilter, setActiveFilter] = useState("Todos")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-left">Minhas Letras</h1>
        <Button asChild size="default" className="bg-primary hover:bg-primary/90">
          <Link href="/criar">
            <Plus className="mr-2 h-4 w-4" />
            Novo Projeto
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por título ou tema..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-10 bg-card border-border"
        />
      </div>

      {/* Genre Filters */}
      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => (
          <Button
            key={genre}
            variant={activeFilter === genre ? "default" : "outline"}
            onClick={() => setActiveFilter(genre)}
            size="sm"
            className={activeFilter === genre ? "bg-primary hover:bg-primary/90" : "hover:bg-accent"}
          >
            {genre}
          </Button>
        ))}
      </div>
    </div>
  )
}
