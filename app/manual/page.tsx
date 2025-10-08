"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  BookOpen,
  Search,
  Music,
  RefreshCw,
  Pencil,
  FolderOpen,
  Settings,
  HelpCircle,
  Video,
  FileText,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"

const manualSections = [
  {
    id: "introducao",
    title: "Introdução",
    icon: BookOpen,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    topics: [
      "Bem-vindo ao Chorão Compositor",
      "Como começar",
      "Visão geral das funcionalidades",
      "Dicas para iniciantes",
    ],
  },
  {
    id: "criar-letras",
    title: "Criar Letras",
    icon: Music,
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    topics: [
      "Como criar uma nova letra",
      "Escolher gênero e humor",
      "Usar inspirações e sensações",
      "Validar métricas",
      "Salvar projetos",
    ],
  },
  {
    id: "reescrever",
    title: "Reescrever Letras",
    icon: RefreshCw,
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950",
    topics: [
      "Selecionar letra para reescrever",
      "Opções de reescrita",
      "Terceira Via explicada",
      "Converter entre gêneros",
      "Otimizar métricas",
    ],
  },
  {
    id: "editar",
    title: "Editar Projetos",
    icon: Pencil,
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    topics: [
      "Abrir projeto existente",
      "Ferramentas de edição",
      "Encontrar rimas e sinônimos",
      "Completar versos",
      "Salvar alterações",
    ],
  },
  {
    id: "galeria",
    title: "Galeria de Projetos",
    icon: FolderOpen,
    color: "text-pink-500",
    bgColor: "bg-pink-50 dark:bg-pink-950",
    topics: [
      "Visualizar todos os projetos",
      "Filtrar e buscar",
      "Organizar por gênero",
      "Exportar projetos",
      "Compartilhar letras",
    ],
  },
  {
    id: "configuracoes",
    title: "Configurações",
    icon: Settings,
    color: "text-gray-500",
    bgColor: "bg-gray-50 dark:bg-gray-950",
    topics: ["Preferências do usuário", "Tema claro/escuro", "Backup automático", "Integrações", "Conta e perfil"],
  },
]

const faqItems = [
  {
    question: "Como funciona a Terceira Via?",
    answer:
      "A Terceira Via é um processo automático que gera duas variações (A e B) da sua letra e combina os melhores elementos de cada uma para criar a versão final otimizada.",
  },
  {
    question: "Posso usar o app offline?",
    answer: "Não, o Chorão Compositor requer conexão com internet para acessar os modelos de IA e gerar letras.",
  },
  {
    question: "Como salvar meus projetos?",
    answer:
      "Clique no botão 'Salvar Projeto' em qualquer página de criação ou edição. Seus projetos ficam salvos na nuvem e podem ser acessados de qualquer dispositivo.",
  },
  {
    question: "Quantos projetos posso criar?",
    answer: "Não há limite! Você pode criar quantos projetos quiser e organizá-los na Galeria.",
  },
]

export default function ManualPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Manual do Usuário</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Aprenda a usar todas as funcionalidades do Chorão Compositor
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar no manual..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Start */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-6 w-6" />
              Início Rápido
            </CardTitle>
            <CardDescription>Assista ao vídeo tutorial de 5 minutos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <Button size="lg">
                <Video className="h-5 w-5 mr-2" />
                Assistir Tutorial
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Manual Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {manualSections.map((section) => {
            const Icon = section.icon
            return (
              <Card key={section.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className={section.bgColor}>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`h-6 w-6 ${section.color}`} />
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    {section.topics.map((topic, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full mt-4 bg-transparent">
                    <FileText className="h-4 w-4 mr-2" />
                    Ler Seção
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-6 w-6" />
              Perguntas Frequentes
            </CardTitle>
            <CardDescription>Respostas para as dúvidas mais comuns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <div key={index} className="border-b border-border pb-4 last:border-0">
                  <h3 className="font-semibold mb-2">{item.question}</h3>
                  <p className="text-muted-foreground text-sm">{item.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="mt-8 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Precisa de mais ajuda?</h3>
            <p className="mb-6 opacity-90">Nossa equipe de suporte está pronta para ajudar você</p>
            <Button variant="secondary" size="lg">
              <HelpCircle className="h-5 w-5 mr-2" />
              Contatar Suporte
            </Button>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
