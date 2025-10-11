"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BookOpenIcon,
  GraduationCapIcon,
  BrainCircuitIcon,
  MusicIcon,
  RocketIcon,
  TargetIcon,
  StarIcon,
  ChevronRightIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function AulaPage() {
  const router = useRouter()
  const [activeModule, setActiveModule] = useState<string | null>(null)

  const learningModules = [
    {
      id: "fundamentos",
      title: "Fundamentos da Composição",
      description: "Aprenda os conceitos básicos para começar a compor letras",
      icon: <BookOpenIcon className="h-5 w-5" />,
      level: "Iniciante",
      color: "bg-blue-100 dark:bg-blue-900",
      borderColor: "border-blue-300 dark:border-blue-700",
      iconColor: "text-blue-500",
      lessons: [
        {
          id: "estrutura-musica",
          title: "Estrutura de uma Música",
          description: "Aprenda sobre versos, refrão, ponte e outras partes",
          duration: "15 min",
        },
        {
          id: "rimas-basicas",
          title: "Rimas Básicas",
          description: "Entenda os diferentes tipos de rimas e como usá-las",
          duration: "20 min",
        },
      ],
    },
    {
      id: "tecnicas-avancadas",
      title: "Técnicas Avançadas",
      description: "Eleve sua composição com técnicas usadas por profissionais",
      icon: <BrainCircuitIcon className="h-5 w-5" />,
      level: "Intermediário",
      color: "bg-purple-100 dark:bg-purple-900",
      borderColor: "border-purple-300 dark:border-purple-700",
      iconColor: "text-purple-500",
      lessons: [
        {
          id: "primeiro-mandamento",
          title: "Primeiro Mandamento para Escrever Letras",
          description: "Princípios fundamentais para criar letras que prendem a atenção",
          duration: "20 min",
        },
        {
          id: "tecnica-das-caixas",
          title: "Técnica das Caixas",
          description: "Método estruturado para organizar ideias e criar letras completas",
          duration: "30 min",
        },
        {
          id: "exercicios-para-comecar",
          title: "3 Exercícios para Começar a Compor",
          description: "Exercícios práticos para destravar sua criatividade compositiva",
          duration: "25 min",
        },
      ],
    },
    {
      id: "generos-musicais",
      title: "Gêneros Musicais",
      description: "Domine as características específicas de cada estilo",
      icon: <MusicIcon className="h-5 w-5" />,
      level: "Todos os níveis",
      color: "bg-amber-100 dark:bg-amber-900",
      borderColor: "border-amber-300 dark:border-amber-700",
      iconColor: "text-amber-500",
      lessons: [
        {
          id: "sertanejo-lesson",
          title: "Sertanejo Brasileiro",
          description: "Domine as características específicas do sertanejo",
          duration: "30 min",
        },
        {
          id: "mpb",
          title: "MPB e Bossa Nova",
          description: "A sofisticação da Música Popular Brasileira",
          duration: "30 min",
        },
        {
          id: "rock-pop-mpb",
          title: "Rock e Pop Brasileiro",
          description: "Composição, história e técnicas do rock e pop nacional",
          duration: "25 min",
        },
      ],
    },
    {
      id: "composicao-profissional",
      title: "Composição Profissional",
      description: "Técnicas avançadas para composição em nível profissional",
      icon: <RocketIcon className="h-5 w-5" />,
      level: "Avançado",
      color: "bg-green-100 dark:bg-green-900",
      borderColor: "border-green-300 dark:border-green-700",
      iconColor: "text-green-500",
      lessons: [
        {
          id: "refroes-memoraveis",
          title: "Refrões Memoráveis",
          description: "Como criar refrões que grudam na mente do ouvinte",
          duration: "30 min",
        },
        {
          id: "colaboracao",
          title: "Colaboração e Co-escrita",
          description: "Técnicas para compor em parceria com outros artistas",
          duration: "25 min",
        },
        {
          id: "adaptacao-mercado",
          title: "Adaptação para o Mercado",
          description: "Como ajustar suas composições para o mercado atual",
          duration: "30 min",
        },
      ],
    },
    {
      id: "desafios-praticos",
      title: "Desafios Práticos",
      description: "Coloque suas habilidades à prova com desafios reais",
      icon: <TargetIcon className="h-5 w-5" />,
      level: "Todos os níveis",
      color: "bg-red-100 dark:bg-red-900",
      borderColor: "border-red-300 dark:border-red-700",
      iconColor: "text-red-500",
      lessons: [
        {
          id: "desafio-iniciante",
          title: "Desafio Iniciante",
          description: "Crie uma letra simples com tema e estrutura definidos",
          duration: "45 min",
        },
        {
          id: "desafio-intermediario",
          title: "Desafio Intermediário",
          description: "Componha com restrições técnicas específicas",
          duration: "60 min",
        },
        {
          id: "desafio-avancado",
          title: "Desafio Avançado",
          description: "Crie uma letra complexa com múltiplas camadas de significado",
          duration: "90 min",
        },
      ],
    },
    {
      id: "exemplos-excelencia",
      title: "Exemplos de Excelência",
      description: "Exemplos de composições de alta qualidade para estudo",
      icon: <StarIcon className="h-5 w-5" />,
      level: "Referência",
      color: "bg-emerald-100 dark:bg-emerald-900",
      borderColor: "border-emerald-300 dark:border-emerald-700",
      iconColor: "text-emerald-500",
      lessons: [
        {
          id: "composicoes-referencia",
          title: "Composições de Referência",
          description: "Exemplos reais de composições de excelência",
          duration: "30 min",
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-4 pt-20">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCapIcon className="h-6 w-6 text-primary" />
            Aprendizado de Composição
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Aprenda a compor letras do básico ao avançado com nosso assistente IA
          </p>
        </div>

        {/* Cartão de boas-vindas */}
        <Card className="mb-6 bg-gradient-to-r from-primary/20 to-accent/30 backdrop-blur-sm dark:from-primary/10 dark:to-accent/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-primary/10 p-4 rounded-full">
                <BrainCircuitIcon className="h-12 w-12 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Cérebro IA de Composição</h2>
                <p className="mb-4">
                  Nosso assistente inteligente vai guiar você através de lições interativas, desafios práticos e
                  feedback personalizado para desenvolver suas habilidades de composição.
                </p>
                <p className="text-sm text-muted-foreground">
                  Escolha um módulo abaixo para começar sua jornada de aprendizado ou retomar de onde parou.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Módulos de aprendizado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 w-full">
          {learningModules.map((module) => (
            <Card
              key={module.id}
              className={`border-2 transition-all duration-300 hover:shadow-lg ${
                activeModule === module.id ? module.borderColor : "border-border"
              }`}
            >
              <CardHeader
                className={`${module.color} transition-colors duration-300 cursor-pointer`}
                onClick={() => setActiveModule(module.id === activeModule ? null : module.id)}
              >
                <div className="flex justify-between items-center">
                  <div
                    className={`w-10 h-10 rounded-full ${module.iconColor} bg-background flex items-center justify-center`}
                  >
                    {module.icon}
                  </div>
                  <Badge variant="outline" className="bg-background/80">
                    {module.level}
                  </Badge>
                </div>
                <CardTitle className="mt-2">{module.title}</CardTitle>
                <CardDescription className="text-foreground/80">{module.description}</CardDescription>
              </CardHeader>
              <CardContent
                className={`${
                  activeModule === module.id ? "max-h-[500px]" : "max-h-0"
                } overflow-hidden transition-all duration-500`}
              >
                <div className="space-y-3 pt-2">
                  {module.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="border rounded-md p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => {
                        router.push(`/aula/${module.id}/${lesson.id}`)
                      }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-sm">{lesson.title}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {lesson.duration}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{lesson.description}</p>
                      <Button variant="ghost" size="sm" className="mt-2 w-full justify-between">
                        Começar Lição
                        <ChevronRightIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
