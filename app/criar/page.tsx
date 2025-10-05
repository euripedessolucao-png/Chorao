import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { CreateLyricsForm } from "@/components/create-lyrics-form"

export default function CriarPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Criar Nova Letra</h1>
          <p className="text-muted-foreground">
            Configure os parâmetros e deixe a IA criar uma letra original para você
          </p>
        </div>
        <CreateLyricsForm />
      </main>
      <Footer />
    </div>
  )
}
