'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Loader2, Music, Zap, Wand, Search } from 'lucide-react'

// Mock API client - substitua pelo seu cliente real
const apiClient = {
  generateLyrics: async (data: any) => {
    // Simulação de API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          lyrics: `[INTRO]\nUma nova história vai começar\n\n[VERSO 1]\n${data.theme} na melodia do coração\nCada verso escrito com emoção\n\n[REFRAO]\nEsta música é pra você cantar\nE no ritmo da vida dançar`,
          title: `Música sobre ${data.theme}`
        })
      }, 2000)
    })
  }
}

export default function CreatePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [generatedLyrics, setGeneratedLyrics] = useState('')
  const [title, setTitle] = useState('')

  const [formData, setFormData] = useState({
    genre: '',
    theme: '',
    creativityLevel: 'medium' as 'low' | 'medium' | 'high',
  })

  const genres = [
    { id: '1', name: 'Sertanejo' },
    { id: '2', name: 'Pop' },
    { id: '3', name: 'Rock' },
    { id: '4', name: 'MPB' },
    { id: '5', name: 'Funk' },
    { id: '6', name: 'Pagode' },
  ]

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.genre || !formData.theme) {
      alert('Por favor, preencha o gênero e o tema')
      return
    }

    setIsLoading(true)
    try {
      const result: any = await apiClient.generateLyrics(formData)
      setGeneratedLyrics(result.lyrics)
      setTitle(result.title)
    } catch (error) {
      console.error('Erro ao gerar letra:', error)
      alert('Erro ao gerar letra. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-8 max-w-none">
      <h1 className="text-3xl font-bold mb-6">Criar Nova Letra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel de Parâmetros */}
        <Card>
          <CardHeader>
            <CardTitle>Parâmetros da Letra</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <Label htmlFor="genre">Gênero Musical *</Label>
                <Select
                  value={formData.genre}
                  onValueChange={(value) => setFormData({ ...formData, genre: value })}
                >
                  <SelectTrigger id="genre">
                    <SelectValue placeholder="Escolha o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map((genre) => (
                      <SelectItem key={genre.id} value={genre.name}>
                        {genre.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="theme">Tema *</Label>
                <Input
                  id="theme"
                  placeholder="Digite o tema da sua música..."
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="creativityLevel">Nível de Criatividade</Label>
                <Select
                  value={formData.creativityLevel}
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setFormData({ ...formData, creativityLevel: value })
                  }
                >
                  <SelectTrigger id="creativityLevel">
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Conservador</SelectItem>
                    <SelectItem value="medium">Equilibrado</SelectItem>
                    <SelectItem value="high">Ousado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !formData.genre || !formData.theme}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Music className="mr-2 h-4 w-4" />
                    Gerar Letra
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {/* Abrir diálogo de hook */}}
              >
                <Zap className="mr-2 h-4 w-4" />
                Gerar Hook
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Painel de Resultado */}
        <Card className="h-full flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-center gap-2">
              <div className="flex-1">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título da Música"
                  className="text-xl font-bold"
                  disabled={!generatedLyrics}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                title="Sugerir títulos"
                disabled={!generatedLyrics}
              >
                <Wand className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-grow flex flex-col">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Criando sua letra...</p>
                </div>
              </div>
            ) : generatedLyrics ? (
              <div className="space-y-4 flex flex-col flex-grow">
                <Textarea
                  value={generatedLyrics}
                  onChange={(e) => setGeneratedLyrics(e.target.value)}
                  className="flex-grow min-h-[400px] font-mono text-sm"
                  placeholder="Sua letra aparecerá aqui..."
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={() => navigator.clipboard.writeText(generatedLyrics)}
                    variant="outline"
                    className="flex-1"
                  >
                    Copiar Letra
                  </Button>
                  <Button 
                    onClick={() => {/* Salvar projeto */}}
                    className="flex-1"
                  >
                    Salvar Projeto
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Preencha os parâmetros e gere sua primeira letra!</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}