import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { RewriteLyricsForm } from "@/components/rewrite-lyrics-form"

export default function ReescreverPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Reestruture sua letra em outro gênero musical</h1>
          <p className="text-muted-foreground">
            Cole sua letra existente e transforme-a em um novo gênero mantendo a essência original
          </p>
        </div>
        <RewriteLyricsForm />
      </main>
      <Footer />
    </div>
  )
}
