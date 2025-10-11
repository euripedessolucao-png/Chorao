"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  BookOpenIcon,
  LightbulbIcon,
  PencilIcon,
  SparklesIcon,
  Loader2Icon,
} from "lucide-react"
import { toast } from "sonner"

const lessonsData: Record<string, any> = {
  fundamentos: {
    "estrutura-musica": {
      title: "Estrutura de uma Música",
      description: "Aprenda sobre versos, refrão, ponte e outras partes",
      steps: [
        {
          type: "content",
          title: "O que é a estrutura de uma música?",
          content:
            "A estrutura é o esqueleto da música, determinando como as partes (versos, refrão, ponte, etc.) se organizam para criar uma narrativa musical envolvente. Quase toda música popular segue padrões estruturais reconhecíveis que facilitam a conexão do ouvinte.\n\nPartes mais comuns:\n- Introdução\n- Versos\n- Pré-Refrão (opcional)\n- Refrão\n- Ponte\n- Solo (opcional)\n- Conclusão (outro)\n\nCada parte tem uma função própria e contribui para o impacto emocional da canção.",
        },
        {
          type: "example",
          title: "Exemplo de Estrutura Clássica",
          content:
            "[INTRO]\n(Instrumental: violão e percussão suave)\n\n[VERSO 1]\nAcordo às seis da manhã\nCafé quente, pão na mesa\nA vida é assim, vai e vem\nEntre a pressa e a beleza\n\n[REFRÃO]\nA vida é assim, simples demais\nEntre sorrisos e um café\nO que importa é ter paz\nE acreditar que vai dar pé\n\n[VERSO 2]\nNo escritório, o relógio marca\nMais um dia pra vencer\nMas no peito a esperança embarca\nNum sonho de viver\n\n[REFRÃO]\n(Repete)\n\n[PONTE]\nE se a gente parasse um segundo\nPra sentir o vento no rosto?\nTalvez o sentido do mundo\nEsteja bem mais perto do nosso gosto\n\n[REFRÃO FINAL]\n(Repete com fade out)",
        },
        {
          type: "interactive",
          title: "Identificando a Estrutura",
          content:
            "Analise a música de exemplo acima e identifique quantas seções diferentes ela possui. Liste-as na ordem em que aparecem.",
          expectedAnswer: ["intro", "verso", "refrão", "ponte", "outro", "6", "seis"],
          feedback: {
            positive:
              "Excelente! Você identificou corretamente: Intro, Verso 1, Refrão, Verso 2, Refrão, Ponte e Refrão Final. Esta é uma estrutura clássica!",
            negative:
              "A estrutura é: Intro, Verso 1, Refrão, Verso 2, Refrão, Ponte e Refrão Final. Cada seção tem um propósito específico na narrativa da música.",
          },
        },
        {
          type: "exercise",
          title: "Exercício Prático",
          content:
            "Crie um esqueleto estrutural para uma música sobre um tema de sua escolha. Inclua: Intro, Verso 1, Refrão, Verso 2, Ponte e Refrão final.",
          aiPrompt:
            "Analise esta estrutura de música criada pelo usuário. Avalie se ela inclui todas as seções pedidas e se há uma progressão lógica. Forneça feedback construtivo.",
        },
        {
          type: "summary",
          title: "Resumo da Lição",
          content:
            "Você aprendeu:\n- As principais seções de uma música\n- Como cada seção tem um propósito específico\n- Como analisar a estrutura de músicas existentes\n- Como criar seu próprio esqueleto estrutural\n\nA estrutura é a base sobre a qual você construirá sua composição!",
        },
      ],
    },
    "rimas-basicas": {
      title: "Rimas Básicas",
      description: "Entenda os diferentes tipos de rimas e como usá-las",
      steps: [
        {
          type: "content",
          title: "Introdução às Rimas",
          content:
            "As rimas são essenciais na música brasileira. Elas criam musicalidade, memorização e conexão entre versos. Existem rimas perfeitas (sonoridade exata), imperfeitas (semelhantes), internas (no meio do verso) e externas (final do verso).",
        },
        {
          type: "example",
          title: "Exemplos de Rimas",
          content:
            "- Perfeita: 'amor' / 'dor'\n- Imperfeita: 'noite' / 'longe'\n- Rimas internas: 'Eu canto e encanto seu olhar'\n- Rima alternada (ABAB):\n'Quando eu penso em você (A)\nO mundo fica mais bonito (B)\nNo balanço do viver (A)\nMe encontro no infinito (B)'",
        },
        {
          type: "interactive",
          title: "Identificando Rimas",
          content:
            "Analise a quadra abaixo e indique o padrão de rimas:\n\n'Saudade bate no peito\nNoite cai devagar\nMeu caminho eu aceito\nSó pra te encontrar'\n\nDigite o padrão:",
          expectedAnswer: ["abab"],
          feedback: {
            positive: "Correto! O padrão é ABAB: 'peito' rima com 'aceito' (A), 'devagar' rima com 'encontrar' (B).",
            negative: "O padrão é ABAB. 'peito' rima com 'aceito' (A), 'devagar' rima com 'encontrar' (B).",
          },
        },
        {
          type: "exercise",
          title: "Exercício: Criando Rimas",
          content: "Crie uma estrofe de 4 versos usando o padrão de rima emparelhada (AABB).",
          aiPrompt:
            "Analise a estrofe criada. Verifique se o padrão AABB foi seguido. Dê dicas para melhorar as rimas e o ritmo.",
        },
        {
          type: "summary",
          title: "Resumo da Lição",
          content:
            "Você aprendeu os principais tipos e padrões de rima usados na música brasileira. Continue praticando!",
        },
      ],
    },
  },
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const moduleId = params?.moduleId as string
  const lessonId = params?.lessonId as string

  const [currentStep, setCurrentStep] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [feedbackVisible, setFeedbackVisible] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const lesson = lessonsData[moduleId]?.[lessonId]

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 pt-24">
          <Card>
            <CardContent className="p-6">
              <p>Lição não encontrada.</p>
              <Button onClick={() => router.push("/aula")} className="mt-4">
                Voltar para Aulas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const steps = lesson.steps || []
  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setUserInput("")
      setFeedbackVisible(false)
      setAiAnalysis("")
    } else {
      toast.success("Lição concluída!")
      router.push("/aula")
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setUserInput("")
      setFeedbackVisible(false)
      setAiAnalysis("")
    }
  }

  const handleCheckAnswer = () => {
    if (currentStepData.type === "interactive" && currentStepData.expectedAnswer) {
      const userAnswer = userInput.toLowerCase().trim()
      const correct = currentStepData.expectedAnswer.some((answer: string) => userAnswer.includes(answer.toLowerCase()))
      setIsCorrect(correct)
      setFeedbackVisible(true)
    }
  }

  const handleAIAnalysis = async () => {
    if (!userInput.trim()) {
      toast.error("Por favor, escreva algo antes de solicitar análise.")
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/analyze-exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise: currentStepData.content,
          userAnswer: userInput,
          aiPrompt: currentStepData.aiPrompt,
        }),
      })

      if (!response.ok) throw new Error("Erro ao analisar")

      const data = await response.json()
      setAiAnalysis(data.analysis)
      toast.success("Análise concluída!")
    } catch (error) {
      toast.error("Erro ao analisar exercício. Tente novamente.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getStepIcon = (type: string) => {
    switch (type) {
      case "content":
        return <BookOpenIcon className="h-5 w-5" />
      case "example":
        return <LightbulbIcon className="h-5 w-5" />
      case "interactive":
        return <SparklesIcon className="h-5 w-5" />
      case "exercise":
        return <PencilIcon className="h-5 w-5" />
      case "summary":
        return <CheckCircleIcon className="h-5 w-5" />
      default:
        return <BookOpenIcon className="h-5 w-5" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push("/aula")} className="mb-4">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Voltar para Aulas
          </Button>
          <h1 className="text-3xl font-bold">{lesson.title}</h1>
          <p className="text-muted-foreground mt-2">{lesson.description}</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Passo {currentStep + 1} de {steps.length}
            </span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Content */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              {getStepIcon(currentStepData.type)}
              <CardTitle>{currentStepData.title}</CardTitle>
            </div>
            <Badge variant="outline" className="w-fit">
              {currentStepData.type === "content" && "Conteúdo"}
              {currentStepData.type === "example" && "Exemplo"}
              {currentStepData.type === "interactive" && "Interativo"}
              {currentStepData.type === "exercise" && "Exercício"}
              {currentStepData.type === "summary" && "Resumo"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{currentStepData.content}</p>
            </div>

            {/* Interactive/Exercise Input */}
            {(currentStepData.type === "interactive" || currentStepData.type === "exercise") && (
              <div className="mt-6 space-y-4">
                <Textarea
                  placeholder="Digite sua resposta aqui..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  rows={6}
                  className="resize-none"
                />

                <div className="flex gap-2">
                  {currentStepData.type === "interactive" && (
                    <Button onClick={handleCheckAnswer} disabled={!userInput.trim()}>
                      Verificar Resposta
                    </Button>
                  )}
                  {currentStepData.type === "exercise" && (
                    <Button onClick={handleAIAnalysis} disabled={!userInput.trim() || isAnalyzing}>
                      {isAnalyzing ? (
                        <>
                          <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        "Solicitar Análise IA"
                      )}
                    </Button>
                  )}
                </div>

                {/* Feedback */}
                {feedbackVisible && currentStepData.feedback && (
                  <Card className={isCorrect ? "border-green-500" : "border-amber-500"}>
                    <CardContent className="p-4">
                      <p className="font-semibold mb-2">{isCorrect ? "✅ Correto!" : "💡 Vamos revisar"}</p>
                      <p className="text-sm">
                        {isCorrect ? currentStepData.feedback.positive : currentStepData.feedback.negative}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* AI Analysis */}
                {aiAnalysis && (
                  <Card className="border-primary">
                    <CardContent className="p-4">
                      <p className="font-semibold mb-2">🤖 Análise da IA</p>
                      <p className="text-sm whitespace-pre-wrap">{aiAnalysis}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? "Concluir Lição" : "Próximo"}
            {currentStep < steps.length - 1 && <ArrowRightIcon className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  )
}
