import { Card } from "@/components/ui/card"
import { Clock, RefreshCw, ImageIcon, GraduationCap } from "lucide-react"
import Link from "next/link"

const features = [
  {
    title: "Projetos Recentes",
    description: "Acesse rapidamente suas últimas composições e continue de onde parou",
    icon: Clock,
    gradient: "from-blue-500/20 to-cyan-500/20",
    href: "/galeria",
  },
  {
    title: "Reescrever Letras",
    description: "Transforme e aperfeiçoe suas letras com sugestões inteligentes",
    icon: RefreshCw,
    gradient: "from-purple-500/20 to-pink-500/20",
    href: "/reescrever",
  },
  {
    title: "Galeria",
    description: "Explore uma coleção de letras inspiradoras e exemplos criativos",
    icon: ImageIcon,
    gradient: "from-orange-500/20 to-red-500/20",
    href: "/galeria",
  },
  {
    title: "Aprender",
    description: "Tutoriais e dicas para melhorar suas habilidades de composição",
    icon: GraduationCap,
    gradient: "from-green-500/20 to-emerald-500/20",
    href: "/aprender",
  },
]

export function FeaturesGrid() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Link key={index} href={feature.href}>
                <Card className="group relative p-8 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 cursor-pointer overflow-hidden">
                  {/* Background gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="mb-4 inline-flex p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>

                    <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>

                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>

                  {/* Hover arrow */}
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
