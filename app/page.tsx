import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Music, RefreshCw, FolderOpen, Pencil } from "lucide-react"
import Link from "next/link"

const mockProjects = [
  {
    id: "1",
    title: "Letra Reescrita (Terceira Via) - Sertanejo / Separação",
    genre: "Sertanejo",
    date: "28/01/2025",
    lyrics: "[INTRO] (acoustic guitar, melancholic arpeggios)\n\n[PART A - Verse 1]\nTeu riso que antes era meu...",
  },
  {
    id: "2",
    title: "DONA DE MIM NEW",
    genre: "Sertanejo",
    date: "25/01/2025",
    lyrics: "[INTRO] Acordeão plays a short, direct, melodic melody over a pulsating electronic beat...",
  },
  {
    id: "3",
    title: "Letra Reescrita (Terceira Via) - Sertanejo / amor e falta de sintonia",
    genre: "Sertanejo",
    date: "19/01/2025",
    lyrics: "[INTRO] Nossas paixão se misturou em um instante. Vejo a saudade no espelho...",
  },
  {
    id: "4",
    title: "A vida passa ligeiro",
    genre: "Sertanejo",
    date: "19/01/2025",
    lyrics: "[INTRO] Slow and melancholic viola caipira arpeggios with subtle bass...",
  },
  {
    id: "5",
    title: "Minha estrelinha",
    genre: "Sertanejo",
    date: "22/09/2025",
    lyrics: "[INTRO] Eu guardo no peito\nA vida sobre tudo...",
  },
  {
    id: "6",
    title: "A lembrança me fere",
    genre: "Sertanejo",
    date: "20/09/2025",
    lyrics: "[INTRO] Slow and melancholic viola caipira arpeggios...",
  },
  {
    id: "7",
    title: "Preso no seu Adeus",
    genre: "Sertanejo",
    date: "19/01/2025",
    lyrics: "[INTRO] Te guardo no peito\nA vida sobre tudo...",
  },
  {
    id: "8",
    title: "A lembrança me desfaz",
    genre: "Sertanejo",
    date: "19/01/2025",
    lyrics: "[INTRO] A beautiful accordion begins the melody...",
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative overflow-hidden bg-gradient-to-br from-purple-100 via-purple-50 to-background dark:from-purple-950/20 dark:via-purple-900/10 dark:to-background pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">Chorão - Compositor</h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
            Seu assistente de composição que cria letras originais em qualquer gênero, humor ou estilo
          </p>
          <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
            Edite, analise e aperfeiçoe suas letras em minutos
          </p>
          <p className="text-base text-primary/80 mb-8 max-w-3xl mx-auto italic">
            Todo o conteúdo é de ferramentas do app seguem as principais metodologias e práticas de ensino musical
            reconhecidas no Brasil.
          </p>
          <Link href="/criar">
            <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90">
              <Music className="mr-2 h-5 w-5" />
              Criar Nova Letra
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Seus Projetos</h2>
            <Link href="/criar">
              <Button variant="outline">Novo Projeto</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">{project.genre}</Badge>
                    <span className="text-xs text-muted-foreground">{project.date}</span>
                  </div>
                  <CardTitle className="text-base line-clamp-2">{project.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{project.lyrics}</p>
                  <Link href="/editar">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar Letra
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Recursos</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Music className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Gerar Letras</CardTitle>
                <CardDescription>
                  Crie letras originais em qualquer gênero, humor ou estilo apenas alguns cliques.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/criar">
                  <Button variant="outline" className="w-full bg-transparent">
                    Começar Agora
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <RefreshCw className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Reescrever Letras</CardTitle>
                <CardDescription>
                  Refine versões específicas das suas letras transferindo-as de fácil acesso.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/reescrever">
                  <Button variant="outline" className="w-full bg-transparent">
                    Reescrever Agora
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <FolderOpen className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Salvar Projetos</CardTitle>
                <CardDescription>Organize e salve seus projetos de letras com fácil acesso e edição.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/galeria">
                  <Button variant="outline" className="w-full bg-transparent">
                    Ver Galeria
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
