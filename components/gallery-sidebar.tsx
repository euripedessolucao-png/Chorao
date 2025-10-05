import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Music, TrendingUp, Clock } from "lucide-react"

const stats = [
  { label: "Total de Projetos", value: "15", icon: Music },
  { label: "Sertanejo", value: "8", icon: TrendingUp },
  { label: "Em Andamento", value: "3", icon: Clock },
]

const tags = [
  { name: "Amor", count: 12, size: "text-2xl" },
  { name: "Saudade", count: 8, size: "text-xl" },
  { name: "Festa", count: 6, size: "text-lg" },
  { name: "Paixão", count: 5, size: "text-base" },
  { name: "Alegria", count: 4, size: "text-base" },
  { name: "Nostalgia", count: 3, size: "text-sm" },
]

export function GallerySidebar() {
  return (
    <div className="space-y-6">
      {/* Statistics Card */}
      <Card className="p-6 border-border bg-card">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Estatísticas</h3>
        <div className="space-y-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
                <span className="text-2xl font-bold text-foreground">{stat.value}</span>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Tags Cloud Card */}
      <Card className="p-6 border-border bg-card">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Tags Mais Usadas</h3>
        <div className="flex flex-wrap gap-3 justify-center">
          {tags.map((tag) => (
            <Badge
              key={tag.name}
              variant="outline"
              className={`${tag.size} font-semibold cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all px-4 py-2`}
            >
              {tag.name}
              <span className="ml-2 text-xs opacity-70">({tag.count})</span>
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  )
}
