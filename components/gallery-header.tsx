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
    <div className="space-y-6">
      {/* Title and New Project Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-foreground">Minhas Letras</h1>
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
          <Link href="/criar">
            <Plus className="mr-2 h-5 w-5" />
            Novo Projeto
          </Link>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por título ou tema..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 bg-card border-border"
        />
      </div>

      {/* Genre Filters */}
      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => (
          <Button
            key={genre}
            variant={activeFilter === genre ? "default" : "outline"}
            onClick={() => setActiveFilter(genre)}
            className={activeFilter === genre ? "bg-primary hover:bg-primary/90" : "hover:bg-accent"}
          >
            {genre}
          </Button>
        ))}
      </div>
    </div>
  )
}
