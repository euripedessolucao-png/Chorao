"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Download, Trash2 } from "lucide-react"

// Mock data for example projects
const projects = [
  {
    id: 1,
    title: "Coração Sertanejo",
    genre: "Sertanejo Moderno",
    preview: "No meio do sertão, meu coração bateu\nQuando vi seus olhos, o mundo estremeceu",
    date: "2024-01-15",
    color: "bg-blue-500",
  },
  {
    id: 2,
    title: "Saudade de Você",
    genre: "Pagode",
    preview: "A saudade aperta, o peito dói demais\nSem você aqui, não tenho mais paz",
    date: "2024-01-14",
    color: "bg-green-500",
  },
  {
    id: 3,
    title: "Noite de Lua",
    genre: "MPB",
    preview: "Sob a luz da lua, nosso amor nasceu\nNa melodia suave, o tempo esqueceu",
    date: "2024-01-13",
    color: "bg-purple-500",
  },
  {
    id: 4,
    title: "Estrada da Vida",
    genre: "Sertanejo Raiz",
    preview: "Na estrada da vida, eu sigo a cantar\nCom minha viola, vou te encontrar",
    date: "2024-01-12",
    color: "bg-blue-500",
  },
  {
    id: 5,
    title: "Festa no Pagode",
    genre: "Pagode",
    preview: "A festa começou, o pagode rolou\nNo som do pandeiro, meu coração sambou",
    date: "2024-01-11",
    color: "bg-green-500",
  },
  {
    id: 6,
    title: "Tempestade",
    genre: "Rock",
    preview: "Como uma tempestade, você chegou\nMeu mundo inteiro, você transformou",
    date: "2024-01-10",
    color: "bg-red-500",
  },
]

export function GalleryGrid() {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Edit className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">Nenhum projeto ainda</h3>
        <p className="text-muted-foreground mb-6">Comece criando sua primeira letra musical</p>
        <Button size="lg" className="bg-primary hover:bg-primary/90">
          <Edit className="mr-2 h-5 w-5" />
          Criar Primeira Letra
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {projects.map((project) => (
        <Card
          key={project.id}
          className="group relative overflow-hidden border-border bg-card hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1"
        >
          <div className="p-6 space-y-4">
            {/* Header with Title and Genre Badge */}
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-bold text-foreground line-clamp-1">{project.title}</h3>
              <Badge className={`${project.color} text-white shrink-0`}>{project.genre}</Badge>
            </div>

            {/* Preview Text */}
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-2 min-h-[3rem]">
              {project.preview}
            </div>

            {/* Date */}
            <p className="text-xs text-muted-foreground">
              Modificado em {new Date(project.date).toLocaleDateString("pt-BR")}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="default" className="flex-1 bg-primary hover:bg-primary/90">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button size="sm" variant="outline" className="hover:bg-accent bg-transparent">
                <Download className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="hover:bg-destructive hover:text-destructive-foreground bg-transparent"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Hover Effect Border */}
          <div className="absolute inset-0 border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
        </Card>
      ))}
    </div>
  )
}
