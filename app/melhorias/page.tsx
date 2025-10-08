"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { TrendingUp, Lightbulb, MessageSquare, ThumbsUp, Clock, CheckCircle, AlertCircle, Sparkles } from "lucide-react"
import { useState } from "react"

const improvementCategories = [
  { id: "funcionalidade", label: "Nova Funcionalidade", icon: Sparkles, color: "bg-purple-100 text-purple-800" },
  { id: "melhoria", label: "Melhoria", icon: TrendingUp, color: "bg-blue-100 text-blue-800" },
  { id: "bug", label: "Correção de Bug", icon: AlertCircle, color: "bg-red-100 text-red-800" },
  { id: "sugestao", label: "Sugestão", icon: Lightbulb, color: "bg-yellow-100 text-yellow-800" },
]

const recentSuggestions = [
  {
    id: 1,
    title: "Adicionar exportação para PDF",
    description: "Permitir exportar letras diretamente em formato PDF com formatação profissional",
    category: "funcionalidade",
    votes: 45,
    status: "em-analise",
    date: "2024-01-15",
  },
  {
    id: 2,
    title: "Melhorar validação de métricas",
    description: "Tornar a validação de métricas mais precisa para diferentes gêneros musicais",
    category: "melhoria",
    votes: 32,
    status: "planejado",
    date: "2024-01-14",
  },
  {
    id: 3,
    title: "Adicionar modo colaborativo",
    description: "Permitir que múltiplos usuários trabalhem na mesma letra simultaneamente",
    category: "funcionalidade",
    votes: 28,
    status: "em-analise",
    date: "2024-01-13",
  },
  {
    id: 4,
    title: "Integração com Spotify",
    description: "Conectar com Spotify para analisar letras de músicas favoritas",
    category: "funcionalidade",
    votes: 56,
    status: "implementado",
    date: "2024-01-10",
  },
]

const statusConfig = {
  "em-analise": { label: "Em Análise", icon: Clock, color: "bg-yellow-100 text-yellow-800" },
  planejado: { label: "Planejado", icon: CheckCircle, color: "bg-blue-100 text-blue-800" },
  implementado: { label: "Implementado", icon: CheckCircle, color: "bg-green-100 text-green-800" },
}

export default function MelhoriasPage() {
  const [selectedCategory, setSelectedCategory] = useState("")
  const [suggestion, setSuggestion] = useState("")

  const handleSubmit = () => {
    if (!suggestion.trim() || !selectedCategory) {
      alert("Por favor, preencha todos os campos")
      return
    }

    alert("Sugestão enviada com sucesso! Obrigado pelo feedback.")
    setSuggestion("")
    setSelectedCategory("")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Melhorias e Sugestões</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ajude-nos a melhorar o Chorão Compositor com suas ideias e feedback
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Submit Suggestion */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-6 w-6" />
                  Enviar Sugestão
                </CardTitle>
                <CardDescription>Compartilhe suas ideias para tornar o app ainda melhor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Categoria</label>
                  <div className="grid grid-cols-2 gap-3">
                    {improvementCategories.map((cat) => {
                      const Icon = cat.icon
                      return (
                        <Button
                          key={cat.id}
                          variant={selectedCategory === cat.id ? "default" : "outline"}
                          className="justify-start h-auto py-3"
                          onClick={() => setSelectedCategory(cat.id)}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {cat.label}
                        </Button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Sua Sugestão</label>
                  <Textarea
                    placeholder="Descreva sua ideia ou sugestão de melhoria..."
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <Button onClick={handleSubmit} className="w-full" size="lg">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Enviar Sugestão
                </Button>
              </CardContent>
            </Card>

            {/* Recent Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle>Sugestões Recentes</CardTitle>
                <CardDescription>Veja o que outros usuários estão sugerindo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSuggestions.map((item) => {
                    const category = improvementCategories.find((c) => c.id === item.category)
                    const status = statusConfig[item.status as keyof typeof statusConfig]
                    const StatusIcon = status.icon

                    return (
                      <div
                        key={item.id}
                        className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{item.title}</h3>
                          <Badge className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {category && (
                              <Badge variant="outline" className={category.color}>
                                {category.label}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">{item.date}</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {item.votes}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sugestões Totais</span>
                  <span className="text-2xl font-bold">161</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Implementadas</span>
                  <span className="text-2xl font-bold text-green-600">42</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Em Análise</span>
                  <span className="text-2xl font-bold text-yellow-600">73</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Planejadas</span>
                  <span className="text-2xl font-bold text-blue-600">46</span>
                </div>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Diretrizes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                    <span>Seja específico e claro na descrição</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                    <span>Explique o problema que sua sugestão resolve</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                    <span>Vote em sugestões que você também gostaria de ver</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                    <span>Seja respeitoso com outros usuários</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              <CardContent className="p-6 text-center">
                <Lightbulb className="h-12 w-12 mx-auto mb-4" />
                <h3 className="font-bold mb-2">Tem uma ideia brilhante?</h3>
                <p className="text-sm opacity-90 mb-4">Sua sugestão pode ser a próxima funcionalidade implementada!</p>
                <Button variant="secondary" className="w-full">
                  Enviar Agora
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
