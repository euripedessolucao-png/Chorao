"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Download, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type Project = {
  id: number
  title: string
  genre: string
  lyrics: string
  chords?: string
  date: string
}

export function GalleryGrid() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    const loadProjects = () => {
      try {
        const stored = localStorage.getItem("projects")
        if (stored) {
          const parsed = JSON.parse(stored)
          setProjects(parsed)
        }
      } catch (error) {
        toast.error("Erro ao carregar projetos")
      }
    }

    loadProjects()

    const handleStorageChange = () => {
      loadProjects()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const handleEdit = (project: Project) => {
    localStorage.setItem(
      "editingProject",
      JSON.stringify({
        id: project.id,
        title: project.title,
        lyrics: project.lyrics,
        genre: project.genre,
        chords: project.chords || "",
      }),
    )
    router.push("/editar")
  }

  const handleDelete = (projectId: number) => {
    try {
      const updatedProjects = projects.filter((p) => p.id !== projectId)
      localStorage.setItem("projects", JSON.stringify(updatedProjects))
      setProjects(updatedProjects)
      toast.success("Projeto deletado com sucesso!")
    } catch (error) {
      toast.error("Erro ao deletar projeto")
    }
  }

  const handleDownload = (project: Project) => {
    const content = `${project.title}\n\nGênero: ${project.genre}\n\n${project.chords ? `Acordes:\n${project.chords}\n\n` : ""}Letra:\n${project.lyrics}`
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${project.title.replace(/[^a-z0-9]/gi, "_")}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Projeto baixado com sucesso!")
  }

  const getGenreColor = (genre: string) => {
    const colors: Record<string, string> = {
      "Sertanejo Moderno": "bg-blue-500",
      Sertanejo: "bg-blue-600",
      "Sertanejo Universitário": "bg-blue-400",
      Pagode: "bg-green-500",
      Samba: "bg-green-600",
      Forró: "bg-orange-500",
      MPB: "bg-purple-500",
      Rock: "bg-red-500",
      Pop: "bg-pink-500",
      Funk: "bg-yellow-500",
      Gospel: "bg-indigo-500",
      Bachata: "bg-rose-500",
    }
    return colors[genre] || "bg-gray-500"
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Edit className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">Nenhum projeto ainda</h3>
        <p className="text-muted-foreground mb-6">Comece criando sua primeira letra musical</p>
        <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => router.push("/criar")}>
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
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-bold text-foreground line-clamp-1">{project.title}</h3>
              <Badge className={`${getGenreColor(project.genre)} text-white shrink-0`}>{project.genre}</Badge>
            </div>

            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-2 min-h-[3rem]">
              {project.lyrics.split("\n").slice(0, 2).join("\n")}
            </div>

            <p className="text-xs text-muted-foreground">
              Modificado em {new Date(project.date).toLocaleDateString("pt-BR")}
            </p>

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="default"
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => handleEdit(project)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="hover:bg-accent bg-transparent"
                onClick={() => handleDownload(project)}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                onClick={() => handleDelete(project.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="absolute inset-0 border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
        </Card>
      ))}
    </div>
  )
}
