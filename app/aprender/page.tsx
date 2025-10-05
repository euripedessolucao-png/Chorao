'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { 
  BookOpen, BrainCircuit, Music, Rocket, Target, 
  GraduationCap, Play, CheckCircle 
} from 'lucide-react'

const learningModules = [
  {
    id: "fundamentos",
    title: "Fundamentos da Composição",
    description: "Aprenda os conceitos básicos para começar a compor letras",
    icon: BookOpen,
    level: "Iniciante",
    color: "bg-blue-100 dark:bg-blue-900",
    borderColor: "border-blue-300 dark:border-blue-700",
    lessons: 4,
    completed: 0
  },
  {
    id: "tecnicas-avancadas",
    title: "Técnicas Avançadas",
    description: "Eleve sua composição com técnicas usadas por profissionais",
    icon: BrainCircuit,
    level: "Intermediário",
    color: "bg-purple-100 dark:bg-purple-900",
    borderColor: "border-purple-300 dark:border-purple-700",
    lessons: 3,
    completed: 0
  },
  {
    id: "generos-musicais",
    title: "Gêneros Musicais",
    description: "Domine as características específicas de cada estilo",
    icon: Music,
    level: "Todos os níveis",
    color: "bg-amber-100 dark:bg-amber-900",
    borderColor: "border-amber-300 dark:border-amber-700",
    lessons: 4,
    completed: 0
  },
  {
    id: "composicao-profissional",
    title: "Composição Profissional",
    description: "Técnicas avançadas para composição em nível profissional",
    icon: Rocket,
    level: "Avançado",
    color: "bg-green-100 dark:bg-green-900",
    borderColor: "border-green-300 dark:border-green-700",
    lessons: 4,
    completed: 0
  },
  {
    id: "desafios-praticos",
    title: "Desafios Práticos",
    description: "Coloque suas habilidades à prova com desafios reais",
    icon: Target,
    level: "Todos os níveis",
    color: "bg-red-100 dark:bg-red-900",
    borderColor: "border-red-300 dark:border-red-700",
    lessons: 4,
    completed: 0
  }
]

export default function AprenderPage() {
  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-8 max-w-none">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Aprender Composição</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Domine a arte da composição musical com nossas aulas estruturadas e desafios práticos
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="mb-8 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="text-2xl font-bold mb-2">Seu Progresso</h3>
              <p className="text-muted-foreground">
                Comece sua jornada na composição musical
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">0</div>
                <div className="text-sm text-muted-foreground">Concluídos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">19</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <Button>
                <Play className="h-4 w-4 mr-2" />
                Começar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {learningModules.map((module) => {
          const Icon = module.icon
          return (
            <Card 
              key={module.id} 
              className={`hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${module.borderColor} hover:scale-105`}
            >
              <CardHeader className={`pb-3 ${module.color} rounded-t-lg`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="secondary" className={module.level === "Iniciante" ? "bg-green-100 text-green-800" : 
                      module.level === "Intermediário" ? "bg-blue-100 text-blue-800" : 
                      module.level === "Avançado" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}>
                      {module.level}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {module.completed}/{module.lessons}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <CardTitle className="text-xl mb-2">{module.title}</CardTitle>
                <p className="text-muted-foreground mb-4">{module.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{Math.round((module.completed / module.lessons) * 100)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(module.completed / module.lessons) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" variant={module.completed === 0 ? "default" : "outline"}>
                    {module.completed === 0 ? (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Começar
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Continuar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Call to Action */}
      <Card className="mt-12 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Pronto para compor sua primeira música?</h3>
          <p className="mb-6 opacity-90">
            Aprenda as técnicas e depois coloque em prática criando suas próprias letras
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="secondary" size="lg">
              <GraduationCap className="h-5 w-5 mr-2" />
              Ver Primeira Aula
            </Button>
            <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary" size="lg">
              <Music className="h-5 w-5 mr-2" />
              Criar Letra Agora
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}