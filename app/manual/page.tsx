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
  ChevronRight,
  Sparkles,
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
      "Escolher gênero e sub-gênero",
      "Usar inspirações e sensações",
      "Gerar refrões comerciais",
      "Validar métricas automaticamente",
      "Salvar projetos na galeria",
    ],
  },
  {
    id: "reescrever",
    title: "Reescrever Letras",
    icon: RefreshCw,
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950",
    topics: [
      "Colar letra existente",
      "Opções de reescrita avançadas",
      "Terceira Via: O cérebro do sistema",
      "Converter entre gêneros",
      "Otimizar métricas e prosódia",
      "Comparar versões",
    ],
  },
  {
    id: "editar",
    title: "Editar Projetos",
    icon: Pencil,
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    topics: [
      "Abrir projeto da galeria",
      "Ferramentas de edição em tempo real",
      "Encontrar rimas e sinônimos",
      "Completar versos automaticamente",
      "Validação de métricas ao vivo",
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
      "Visualizar todos os projetos salvos",
      "Filtrar por gênero e data",
      "Buscar por título ou conteúdo",
      "Editar projetos existentes",
      "Exportar para TXT/PDF",
      "Deletar projetos",
    ],
  },
  {
    id: "terceira-via",
    title: "Terceira Via",
    icon: Sparkles,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
    topics: [
      "O que é a Terceira Via?",
      "Como funciona o processo A + B → Final",
      "Otimização automática de métricas",
      "Análise de pontos fortes",
      "Aplicação em todos os gêneros",
      "Visualizar análise detalhada",
    ],
  },
  {
    id: "configuracoes",
    title: "Configurações",
    icon: Settings,
    color: "text-gray-500",
    bgColor: "bg-gray-50 dark:bg-gray-950",
    topics: [
      "Preferências de gênero padrão",
      "Nível de criatividade",
      "Qualidade do modelo de IA",
      "Tema claro/escuro",
      "Exportar/Importar dados",
    ],
  },
]

const faqItems = [
  {
    question: "Como funciona a Terceira Via?",
    answer:
      "A Terceira Via é o cérebro do Chorão Compositor. Para cada linha da sua letra, o sistema gera silenciosamente duas variações (A e B): a Variação A foca em métrica perfeita e fluidez, enquanto a Variação B explora criatividade e emoção. O sistema então analisa os pontos fortes de cada variação e combina os melhores elementos para criar a versão final otimizada. Esse processo acontece automaticamente em todas as gerações de letras, versos e refrões, garantindo qualidade superior sem esforço manual.",
  },
  {
    question: "Quais gêneros musicais são suportados?",
    answer:
      "O Chorão Compositor suporta 11 gêneros principais com sub-gêneros específicos: Sertanejo (Moderno, Universitário, Raiz, Sofrência, Romântico), Forró (Pé de Serra, Eletrônico, Universitário), Funk (Carioca, Melody, Ostentação, Consciente), Pagode (Romântico, 90, Baiano), MPB (Clássica, Moderna), Samba (de Raiz, Pagode, Enredo, Rock), Gospel (Contemporâneo, Tradicional, Sertanejo), Pop (Brasileiro, Internacional, Rock), Rock (Nacional, Alternativo, Clássico), Bachata (Tradicional, Moderna) e Outros Gêneros. Cada gênero tem regras específicas de prosódia, métrica e estilo atualizadas para 2024-2025.",
  },
  {
    question: "Como gerar refrões comerciais e grudentos?",
    answer:
      "Na aba Criar ou Reescrever, clique no botão 'Gerar Refrão' no painel esquerdo. O sistema gerará 5 variações de refrão otimizadas para o gênero selecionado, cada uma com score comercial (1-10) e justificativa. Para Sertanejo Moderno, os refrões seguem regras específicas: 2 ou 4 linhas (nunca 3), prosódia com máximo 6 sílabas antes/depois da vírgula, elementos visuais modernos (biquíni, PIX, story), e fechamento emocional positivo. A melhor opção comercial é destacada automaticamente.",
  },
  {
    question: "Posso converter letras entre gêneros diferentes?",
    answer:
      "Sim! Na aba Reescrever, cole sua letra existente e selecione o gênero de destino no campo 'Gênero de Conversão'. O sistema aplicará a Terceira Via para adaptar a letra ao novo gênero, ajustando métrica, vocabulário, estrutura e estilo, enquanto preserva a mensagem emocional central. Você pode escolher conservar as imagens originais ou criar novas metáforas.",
  },
  {
    question: "Como funciona a validação de métricas?",
    answer:
      "O sistema valida automaticamente cada linha da sua letra usando regras específicas do gênero selecionado. Para cada gênero, há um número ideal de sílabas por linha (ex: Sertanejo Moderno = 6 sílabas, MPB = 9 sílabas). Linhas problemáticas são destacadas em vermelho com sugestões de correção. A Terceira Via garante que todas as linhas geradas automaticamente já tenham métrica perfeita.",
  },
  {
    question: "Posso salvar e editar meus projetos depois?",
    answer:
      "Sim! Clique em 'Salvar Projeto' em qualquer aba (Criar, Reescrever, Editar) para salvar sua letra no navegador. Todos os projetos salvos aparecem na Galeria, onde você pode visualizar, editar, exportar (TXT/PDF) ou deletar. Os projetos são salvos localmente no seu navegador e persistem entre sessões.",
  },
  {
    question: "O que são as 'Inspirações do Diário'?",
    answer:
      "O Diário de Inspiração permite adicionar referências que influenciam a geração da letra. Você pode adicionar texto livre, imagens (que são analisadas pela IA), áudios (transcritos automaticamente) ou links de músicas/vídeos. Essas inspirações são processadas e incorporadas no contexto da geração, tornando a letra mais personalizada e alinhada com suas ideias.",
  },
  {
    question: "Como usar as Metáforas Inteligentes?",
    answer:
      "No painel esquerdo das abas Criar e Reescrever, digite um tema no campo 'Buscar Metáforas' (ex: 'amor', 'saudade', 'liberdade'). O sistema gerará metáforas criativas e adequadas ao gênero selecionado. Clique em uma metáfora para adicioná-la ao contexto da geração. As metáforas são otimizadas para cada gênero - por exemplo, Sertanejo Moderno evita metáforas abstratas e prefere imagens visuais concretas.",
  },
]

export default function ManualPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const filteredSections = manualSections.filter(
    (section) =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.topics.some((topic) => topic.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const filteredFAQ = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
          {filteredSections.map((section) => {
            const Icon = section.icon
            const isExpanded = expandedSection === section.id

            return (
              <Card
                key={section.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
              >
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
            <CardDescription>Respostas detalhadas para as dúvidas mais comuns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {filteredFAQ.map((item, index) => (
                <div key={index} className="border-b border-border pb-6 last:border-0">
                  <h3 className="font-semibold mb-3 text-lg">{item.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
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
