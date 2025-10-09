"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Download, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock data for example projects
const projects = [
  {
    id: 1,
    title: "Coração Sertanejo",
    genre: "Sertanejo Moderno",
    preview: "No meio do sertão, meu coração bateu\nQuando vi seus olhos, o mundo estremeceu",
    lyrics:
      "No meio do sertão, meu coração bateu\nQuando vi seus olhos, o mundo estremeceu\nSob o céu estrelado, nosso amor nasceu\nE na viola cantada, o destino escreveu\n\n[Refrão]\nÉ você, meu amor sertanejo\nNo seu abraço encontro o que desejo\nÉ você, minha estrela guia\nIluminando toda a minha vida",
    date: "2024-01-15",
    color: "bg-blue-500",
  },
  {
    id: 2,
    title: "Saudade de Você",
    genre: "Pagode",
    preview: "A saudade aperta, o peito dói demais\nSem você aqui, não tenho mais paz",
    lyrics:
      "A saudade aperta, o peito dói demais\nSem você aqui, não tenho mais paz\nO pagode toca, mas não me faz sorrir\nSó penso em você, quero te ouvir\n\n[Refrão]\nVolta pra mim, meu amor\nSem você a vida não tem cor\nVolta pra mim, por favor\nMeu coração só bate por você",
    date: "2024-01-14",
    color: "bg-green-500",
  },
  {
    id: 3,
    title: "Noite de Lua",
    genre: "MPB",
    preview: "Sob a luz da lua, nosso amor nasceu\nNa melodia suave, o tempo esqueceu",
    lyrics:
      "Sob a luz da lua, nosso amor nasceu\nNa melodia suave, o tempo esqueceu\nEntre versos e acordes, nos encontramos\nE na poesia da noite, nos amamos\n\n[Refrão]\nLua testemunha do nosso amor\nGuarda em teu brilho essa canção\nLua que ilumina a escuridão\nÉ testemunha do meu coração",
    date: "2024-01-13",
    color: "bg-purple-500",
  },
  {
    id: 4,
    title: "Estrada da Vida",
    genre: "Sertanejo Raiz",
    preview: "Na estrada da vida, eu sigo a cantar\nCom minha viola, vou te encontrar",
    lyrics:
      "Na estrada da vida, eu sigo a cantar\nCom minha viola, vou te encontrar\nPelas curvas do destino, vou caminhando\nE no som da natureza, vou sonhando\n\n[Refrão]\nEstrada sem fim, leva-me até você\nNa poeira do caminho, vou te ver\nEstrada da vida, meu guia fiel\nMe leva pro céu, me leva pro céu",
    date: "2024-01-12",
    color: "bg-blue-500",
  },
  {
    id: 5,
    title: "Festa no Pagode",
    genre: "Pagode",
    preview: "A festa começou, o pagode rolou\nNo som do pandeiro, meu coração sambou",
    lyrics:
      "A festa começou, o pagode rolou\nNo som do pandeiro, meu coração sambou\nA galera animada, o clima esquentou\nE na roda de samba, o amor chegou\n\n[Refrão]\nVem sambar, vem dançar\nNessa festa não pode parar\nVem sambar, vem curtir\nO pagode vai até o sol sair",
    date: "2024-01-11",
    color: "bg-green-500",
  },
  {
    id: 6,
    title: "Tempestade",
    genre: "Rock",
    preview: "Como uma tempestade, você chegou\nMeu mundo inteiro, você transformou",
    lyrics:
      "Como uma tempestade, você chegou\nMeu mundo inteiro, você transformou\nCom a força de um raio, me atingiu\nE no trovão do amor, me envolveu\n\n[Refrão]\nTempestade de emoções\nInvadindo meus pensamentos\nTempestade que me faz viver\nE me faz renascer",
    date: "2024-01-10",
    color: "bg-red-500",
  },
]

export function GalleryGrid() {
  const router = useRouter()

  const handleEdit = (project: (typeof projects)[0]) => {
    // Salva os dados do projeto no localStorage para carregar no editor
    localStorage.setItem(
      "editingProject",
      JSON.stringify({
        id: project.id,
        title: project.title,
        lyrics: project.lyrics,
        genre: project.genre,
      }),
    )
    // Navega para a página de edição
    router.push("/editar")
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
              <Button
                size="sm"
                variant="default"
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => handleEdit(project)}
              >
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
