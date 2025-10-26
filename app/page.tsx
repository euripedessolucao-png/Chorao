import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, RefreshCw, FolderOpen, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative overflow-hidden bg-gradient-to-br from-purple-100 via-purple-50 to-background dark:from-purple-950/20 dark:via-purple-900/10 dark:to-background pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">Perfect - Composer</h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
            Seu assistente de composição que cria letras originais em qualquer gênero, humor ou estilo. Edite, analise e
            aperfeiçoe suas letras em minutos.
          </p>
          <p className="text-base text-primary mb-8 max-w-3xl mx-auto italic font-medium">
            Todo o conteúdo e as ferramentas do app seguem as principais metodologias e práticas de ensino musical
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

      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Análise e Avaliação</h2>

          <Card className="mb-12">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                <CardTitle>Avaliação Automática de Qualidade</CardTitle>
              </div>
              <CardDescription>
                Avalie seus projetos automaticamente e receba sugestões de melhoria com notas de 1 a 10.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button className="bg-primary">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Avaliar Todos os Projetos
                </Button>
                <Button variant="outline">Mostrar Projetos</Button>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-3xl font-bold text-center mb-12">Recursos</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Music className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Gerar Letras</CardTitle>
                <CardDescription>
                  Crie letras originais em qualquer gênero, humor ou estilo com apenas alguns cliques.
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
                <CardDescription>Refine seções específicas das suas letras mantendo o fluxo geral.</CardDescription>
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
                <CardDescription>Organize e salve seus projetos de letras para fácil acesso e edição.</CardDescription>
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
