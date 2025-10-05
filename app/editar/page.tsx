'use client'

import React, { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { Textarea } from '~/components/ui/textarea'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Badge } from '~/components/ui/badge'
import { Loader2, Wand, RefreshCw, Zap, Lightbulb, Copy, Save, Music } from 'lucide-react'

// Mock data - substitua pela sua API real
const mockProjects = [
  { id: '1', title: 'Amor de Verão', genre: 'Sertanejo', lyrics: '[VERSO 1]\nO calor do verão\nAquece nosso coração\n\n[REFRAO]\nÉ amor, é paixão\nNessa estação' },
  { id: '2', title: 'Noite Estrelada', genre: 'MPB', lyrics: '[VERSO 1]\nA noite caiu\nE as estrelas apareceram\n\n[REFRAO]\nSob o céu estrelado\nMeu coração se entregou' },
  { id: '3', title: 'Caminhos', genre: 'Rock', lyrics: '[VERSO 1]\nCaminhos se cruzam\nDestinos se encontram\n\n[REFRAO]\nSeguindo em frente\nSem olhar pra trás' }
]

export default function EditarPage() {
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [lyrics, setLyrics] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [improvementType, setImprovementType] = useState('rimas')
  const [customInstruction, setCustomInstruction] = useState('')

  const improvementOptions = [
    { value: 'rimas', label: 'Melhorar Rimas', description: 'Aprimora as rimas e fluência' },
    { value: 'estrutura', label: 'Otimizar Estrutura', description: 'Ajusta a estrutura musical' },
    { value: 'emocao', label: 'Intensificar Emoção', description: 'Aumenta o impacto emocional' },
    { value: 'originalidade', label: 'Aumentar Originalidade', description: 'Torna a letra mais única' },
    { value: 'metricas', label: 'Ajustar Métricas', description: 'Corrige sílabas e ritmo' },
    { value: 'custom', label: 'Personalizado', description: 'Instruções específicas' }
  ]

  const handleProjectSelect = (projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId)
    if (project) {
      setSelectedProject(projectId)
      setLyrics(project.lyrics)
    }
  }

  const handleImprove = async () => {
    if (!lyrics.trim()) {
      alert('Cole ou selecione uma letra para editar')
      return
    }

    setIsLoading(true)
    
    // Simulação de API - substitua pela sua chamada real
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Melhoria simulada baseada no tipo selecionado
      let improvedLyrics = lyrics
      
      switch (improvementType) {
        case 'rimas':
          improvedLyrics = lyrics + '\n\n[VERSO MELHORADO]\nCom rimas mais ricas e fluentes\nEm versos tão eloquentes'
          break
        case 'estrutura':
          improvedLyrics = lyrics + '\n\n[PONTE ADICIONADA]\nEntre versos e refrão\nUma ponte surgiu\nCom nova emoção'
          break
        case 'emocao':
          improvedLyrics = lyrics + '\n\n[REFRAO INTENSIFICADO]\nCom força e sentimento\nUm grito no vento'
          break
        case 'custom':
          improvedLyrics = lyrics + `\n\n[MELHORIA PERSONALIZADA]\n${customInstruction || 'Implementando suas instruções...'}`
          break
        default:
          improvedLyrics = lyrics + '\n\n[MELHORIA APLICADA]\nSua letra foi aprimorada!'
      }
      
      setLyrics(improvedLyrics)
    } catch (error) {
      console.error('Erro ao melhorar letra:', error)
      alert('Erro ao processar a letra. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedProjectData = mockProjects.find(p => p.id === selectedProject)

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-8 max-w-none">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Wand className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Editar com Assistente</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Use a inteligência artificial para aprimorar suas letras automaticamente
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Seleção */}
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Projeto</CardTitle>
            <CardDescription>
              Escolha um projeto existente ou cole uma letra
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="project-select">Projetos Salvos</Label>
              <Select value={selectedProject} onValueChange={handleProjectSelect}>
                <SelectTrigger id="project-select">
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  {mockProjects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <span>{project.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {project.genre}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground text-center">
              — OU —
            </div>

            <div>
              <Label htmlFor="lyrics-input">Cole sua letra</Label>
              <Textarea
                id="lyrics-input"
                placeholder="Cole a letra que deseja editar aqui..."
                value={!selectedProject ? lyrics : ''}
                onChange={(e) => {
                  if (!selectedProject) setLyrics(e.target.value)
                }}
                disabled={!!selectedProject}
                className="min-h-[100px]"
              />
            </div>

            {selectedProjectData && (
              <Card className="bg-muted/50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedProjectData.title}</p>
                      <Badge variant="secondary" className="text-xs">
                        {selectedProjectData.genre}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedProject('')
                        setLyrics('')
                      }}
                    >
                      Trocar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Painel de Edição */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Editor de Letras</CardTitle>
            <CardDescription>
              Edite sua letra e use o assistente para melhorias
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Sua letra aparecerá aqui... Ou cole uma letra no campo ao lado."
              className="min-h-[300px] font-mono text-sm"
            />
            
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => navigator.clipboard.writeText(lyrics)}
                disabled={!lyrics}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
              <Button variant="outline" onClick={() => setLyrics('')}>
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Painel de Melhorias */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Assistente de Melhorias
          </CardTitle>
          <CardDescription>
            Escolha o tipo de melhoria que deseja aplicar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {improvementOptions.map(option => (
              <Button
                key={option.value}
                variant={improvementType === option.value ? "default" : "outline"}
                className="h-auto py-3 flex flex-col items-center gap-2"
                onClick={() => setImprovementType(option.value)}
              >
                <Lightbulb className="h-4 w-4" />
                <span className="text-xs">{option.label}</span>
              </Button>
            ))}
          </div>

          {improvementType === 'custom' && (
            <div>
              <Label htmlFor="custom-instruction">Instruções Personalizadas</Label>
              <Input
                id="custom-instruction"
                placeholder="Ex: Tornar mais romântico, adicionar metáforas, etc."
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleImprove}
              disabled={isLoading || !lyrics.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Wand className="h-4 w-4 mr-2" />
                  Aplicar Melhoria
                </>
              )}
            </Button>
            
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reverter
            </Button>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Dica:</strong> O assistente mantém o estilo original enquanto aplica melhorias técnicas. 
                Você pode aplicar múltiplas melhorias em sequência.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exemplos Rápidos */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Melhorias Rápidas</CardTitle>
          <CardDescription>
            Ações instantâneas para sua letra
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="flex flex-col h-auto py-3">
              <Music className="h-4 w-4 mb-1" />
              <span className="text-xs">Analisar Métrica</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-3">
              <RefreshCw className="h-4 w-4 mb-1" />
              <span className="text-xs">Reescrever Refrão</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-3">
              <Zap className="h-4 w-4 mb-1" />
              <span className="text-xs">Otimizar Hook</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-3">
              <Save className="h-4 w-4 mb-1" />
              <span className="text-xs">Salvar Versão</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
