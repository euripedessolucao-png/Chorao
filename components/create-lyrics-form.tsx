'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Badge } from '~/components/ui/badge'
import { AlertTriangle, Loader2, Music, Zap, Wand, Search, Copy, Save, RefreshCw } from 'lucide-react'

// Sistema de métricas por gênero brasileiro
const BRAZILIAN_GENRE_METRICS = {
const genres = [
  { id: '1', name: 'Sertanejo Moderno' }, // ← ADICIONADO NO TOPO
  { id: '2', name: 'Sertanejo' },
  { id: '3', name: 'Sertanejo Universitário' },
  { id: '4', name: 'Sertanejo Sofrência' },
  { id: '5', name: 'Sertanejo Raiz' },
  // ... outros gêneros
]

// ATUALIZE o objeto BRAZILIAN_GENRE_METRICS:
const BRAZILIAN_GENRE_METRICS = {
  // Sertanejo Moderno - NOVO (adicionar no topo)
  "Sertanejo Moderno": { syllablesPerLine: 6, bpm: 90, structure: "VERSO-REFRAO-PONTE" },
  
  // Sertanejo existentes (manter)
  "Sertanejo": { syllablesPerLine: 7, bpm: 85, structure: "VERSO-REFRAO-PONTE" },
  "Sertanejo Universitário": { syllablesPerLine: 6, bpm: 95, structure: "VERSO-REFRAO" },
  "Sertanejo Sofrência": { syllablesPerLine: 8, bpm: 75, structure: "VERSO-REFRAO-PONTE" },
  "Sertanejo Raiz": { syllablesPerLine: 10, bpm: 80, structure: "VERSO-REFRAO" },
  
  // ... resto igual
}
  
  // Pagode e Samba
  "Pagode": { syllablesPerLine: 7, bpm: 100, structure: "VERSO-REFRAO" },
  "Samba": { syllablesPerLine: 7, bpm: 105, structure: "VERSO-REFRAO-PONTE" },
  "Pagode Brasileiro": { syllablesPerLine: 7, bpm: 100, structure: "VERSO-REFRAO" },
  
  // Forró e Axé
  "Forró": { syllablesPerLine: 8, bpm: 120, structure: "VERSO-REFRAO" },
  "Axé": { syllablesPerLine: 6, bpm: 130, structure: "VERSO-REFRAO" },
  
  // MPB e Bossa Nova
  "MPB": { syllablesPerLine: 9, bpm: 90, structure: "VERSO-REFRAO-PONTE" },
  "Bossa Nova": { syllablesPerLine: 8, bpm: 70, structure: "VERSO-REFRAO" },
  "MPB Brasil": { syllablesPerLine: 9, bpm: 90, structure: "VERSO-REFRAO-PONTE" },
  
  // Rock e Pop Brasileiro
  "Rock": { syllablesPerLine: 8, bpm: 115, structure: "VERSO-REFRAO-SOLO" },
  "Rock Brasileiro": { syllablesPerLine: 8, bpm: 115, structure: "VERSO-REFRAO-SOLO" },
  "Pop": { syllablesPerLine: 7, bpm: 110, structure: "VERSO-REFRAO-PONTE" },
  "Pop Brasileiro": { syllablesPerLine: 7, bpm: 110, structure: "VERSO-REFRAO-PONTE" },
  
  // Funk e Brega
  "Funk": { syllablesPerLine: 6, bpm: 125, structure: "REFRAO-VERSO" },
  "Funk Brasileiro": { syllablesPerLine: 6, bpm: 125, structure: "REFRAO-VERSO" },
  "Brega": { syllablesPerLine: 8, bpm: 95, structure: "VERSO-REFRAO" },
  
  // Gospel
  "Gospel": { syllablesPerLine: 8, bpm: 85, structure: "VERSO-REFRAO-PONTE" },
  "Gospel Louvor": { syllablesPerLine: 8, bpm: 110, structure: "VERSO-REFRAO" },
  "Gospel Adoração": { syllablesPerLine: 8, bpm: 70, structure: "VERSO-REFRAO-PONTE" },
  
  // Internacional
  "Country": { syllablesPerLine: 8, bpm: 100, structure: "VERSO-REFRAO" },
  
  // Padrão
  "default": { syllablesPerLine: 8, bpm: 100, structure: "VERSO-REFRAO" }
}

// Função para contar sílabas em português
function countPortugueseSyllables(word: string): number {
  if (!word.trim()) return 0
  
  const cleanWord = word.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zà-úâ-ûã-õä-üç]/g, "")
  
  if (cleanWord.length === 0) return 0
  
  // Regras básicas de divisão silábica em português
  let syllableCount = 0
  let i = 0
  
  while (i < cleanWord.length) {
    const currentChar = cleanWord[i]
    
    // Vogais contam como sílabas
    if ('aeiouáéíóúâêîôûàèìòùãõ'.includes(currentChar)) {
      syllableCount++
      
      // Verificar ditongos
      if (i + 1 < cleanWord.length) {
        const nextChar = cleanWord[i + 1]
        // Ditongos crescentes e decrescentes
        if (('aeo'.includes(currentChar) && 'iu'.includes(nextChar)) ||
            ('iu'.includes(currentChar) && 'aeo'.includes(nextChar))) {
          i++ // Pula próxima vogal do ditongo
        }
      }
    }
    i++
  }
  
  // Mínimo 1 sílaba por palavra
  return Math.max(1, syllableCount)
}

// Componente de validação de métrica
function MetricValidator({ lyrics, genre }: { lyrics: string; genre: string }) {
  const metrics = BRAZILIAN_GENRE_METRICS[genre] || BRAZILIAN_GENRE_METRICS.default
  const maxSyllables = metrics.syllablesPerLine
  
  const lines = lyrics.split('\n').filter(line => {
    const trimmed = line.trim()
    return trimmed && 
           !trimmed.startsWith('[') && 
           !trimmed.startsWith('(') &&
           !trimmed.includes('Instrumental:')
  })
  
  const problematicLines = lines
    .map((line, index) => ({ 
      line, 
      originalIndex: lines.findIndex(l => l === line),
      syllables: countPortugueseSyllables(line)
    }))
    .filter(item => item.syllables > maxSyllables)
  
  if (problematicLines.length === 0) return null
  
  return (
    <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <span className="font-medium text-yellow-800 dark:text-yellow-200">
            Ajuste de Métrica Recomendado
          </span>
        </div>
        <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
          <strong>{genre}</strong> recomenda até <strong>{maxSyllables} sílabas</strong> por linha. 
          {problematicLines.length} linha(s) precisam de ajuste:
        </p>
        <div className="space-y-1 text-xs max-h-20 overflow-y-auto">
          {problematicLines.slice(0, 5).map((item, idx) => (
            <div key={idx} className="flex justify-between items-start">
              <span className="text-yellow-800 dark:text-yellow-200 flex-1">
                "{item.line.length > 35 ? item.line.substring(0, 35) + '...' : item.line}"
              </span>
              <span className="text-yellow-600 font-medium ml-2">
                {item.syllables}s
              </span>
            </div>
          ))}
          {problematicLines.length > 5 && (
            <div className="text-yellow-600 text-xs">
              +{problematicLines.length - 5} linhas com métrica longa
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Botão de correção automática
function AutoFixMetrics({ lyrics, genre, onFixed }: { 
  lyrics: string; 
  genre: string; 
  onFixed: (fixedLyrics: string) => void 
}) {
  const [isFixing, setIsFixing] = useState(false)
  
  const fixMetrics = async () => {
    setIsFixing(true)
    
    try {
      const metrics = BRAZILIAN_GENRE_METRICS[genre] || BRAZILIAN_GENRE_METRICS.default
      const maxSyllables = metrics.syllablesPerLine
      
      const lines = lyrics.split('\n')
      const fixedLines = lines.map(line => {
        // Não modificar seções, instruções ou linhas vazias
        if (!line.trim() || 
            line.trim().startsWith('[') || 
            line.trim().startsWith('(') ||
            line.includes('Instrumental:')) {
          return line
        }
        
        const syllableCount = countPortugueseSyllables(line)
        if (syllableCount <= maxSyllables) return line
        
        // Estratégia de correção: dividir linha longa no ponto natural
        const words = line.split(' ')
        if (words.length <= 2) return line // Não dividir linhas muito curtas
        
        // Encontrar ponto natural para divisão (após vírgula ou no meio)
        let splitIndex = Math.floor(words.length / 2)
        
        // Tentar encontrar vírgula para divisão natural
        for (let i = 0; i < words.length - 1; i++) {
          if (words[i].endsWith(',') || words[i].endsWith(';')) {
            splitIndex = i + 1
            break
          }
        }
        
        const firstLine = words.slice(0, splitIndex).join(' ')
        const secondLine = words.slice(splitIndex).join(' ')
        
        return `${firstLine}\n${secondLine}`
      })
      
      onFixed(fixedLines.join('\n'))
    } catch (error) {
      console.error('Erro ao corrigir métrica:', error)
    } finally {
      setIsFixing(false)
    }
  }
  
  const metrics = BRAZILIAN_GENRE_METRICS[genre] || BRAZILIAN_GENRE_METRICS.default
  const hasLongLines = lyrics.split('\n').some(line => {
    if (!line.trim() || line.trim().startsWith('[') || line.trim().startsWith('(')) return false
    return countPortugueseSyllables(line) > metrics.syllablesPerLine
  })
  
  if (!hasLongLines) return null
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={fixMetrics}
      disabled={isFixing}
      className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
    >
      {isFixing ? (
        <Loader2 className="h-3 w-3 animate-spin mr-1" />
      ) : (
        <RefreshCw className="h-3 w-3 mr-1" />
      )}
      Corrigir Métrica
    </Button>
  )
}

// Mock API client
const apiClient = {
  generateLyrics: async (data: any) => {
    const metrics = BRAZILIAN_GENRE_METRICS[data.genre] || BRAZILIAN_GENRE_METRICS.default
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          lyrics: `[INTRO]\nUma nova história vai começar\n\n[VERSO 1]\n${data.theme} na melodia do coração\nCada verso escrito com emoção\n\n[REFRAO]\nEsta música é pra você cantar\nE no ritmo da vida dançar\n\nMétrica: ${metrics.syllablesPerLine} sílabas/linha | BPM: ${metrics.bpm}`,
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
    { id: '2', name: 'Sertanejo Universitário' },
    { id: '3', name: 'Sertanejo Sofrência' },
    { id: '4', name: 'Sertanejo Raiz' },
    { id: '5', name: 'Pagode' },
    { id: '6', name: 'Samba' },
    { id: '7', name: 'Forró' },
    { id: '8', name: 'Axé' },
    { id: '9', name: 'MPB' },
    { id: '10', name: 'Bossa Nova' },
    { id: '11', name: 'Rock' },
    { id: '12', name: 'Pop' },
    { id: '13', name: 'Funk' },
    { id: '14', name: 'Gospel' },
  ]

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.genre || !formData.theme) {
      alert('Por favor, preencha o gênero e o tema')
      return
    }

    setIsLoading(true)
    setGeneratedLyrics('')
    
    try {
      const metrics = BRAZILIAN_GENRE_METRICS[formData.genre] || BRAZILIAN_GENRE_METRICS.default
      
      const promptWithMetrics = {
        ...formData,
        metrics: {
          syllablesPerLine: metrics.syllablesPerLine,
          bpm: metrics.bpm,
          structure: metrics.structure
        },
        instruction: `CRIE LETRA COM MÁXIMO ${metrics.syllablesPerLine} SÍLABAS POR LINHA. Gênero: ${formData.genre}. Estrutura: ${metrics.structure}. BPM: ${metrics.bpm}`
      }

      const result: any = await apiClient.generateLyrics(promptWithMetrics)
      setGeneratedLyrics(result.lyrics)
      setTitle(result.title)
    } catch (error) {
      console.error('Erro ao gerar letra:', error)
      alert('Erro ao gerar letra. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const currentMetrics = formData.genre ? 
    BRAZILIAN_GENRE_METRICS[formData.genre] : 
    BRAZILIAN_GENRE_METRICS.default

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-8 max-w-none">
      <h1 className="text-3xl font-bold mb-6">Criar Nova Letra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel de Parâmetros */}
        <Card>
          <CardHeader>
            <CardTitle>Parâmetros da Letra</CardTitle>
            <CardDescription>
              Configure o gênero e tema para gerar sua letra
            </CardDescription>
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
                        <div className="flex items-center justify-between w-full">
                          <span>{genre.name}</span>
                          {BRAZILIAN_GENRE_METRICS[genre.name] && (
                            <Badge variant="outline" className="text-xs ml-2">
                              {BRAZILIAN_GENRE_METRICS[genre.name].syllablesPerLine}s
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.genre && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                    <div className="flex justify-between">
                      <span>Métrica:</span>
                      <span className="font-medium">{currentMetrics.syllablesPerLine} sílabas/linha</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ritmo:</span>
                      <span className="font-medium">{currentMetrics.bpm} BPM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estrutura:</span>
                      <span className="font-medium">{currentMetrics.structure}</span>
                    </div>
                  </div>
                )}
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
                    Gerar Letra com Métrica {currentMetrics.syllablesPerLine}s
                  </>
                )}
              </Button>

              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-800 dark:text-green-300">
                    <strong>Sistema de Métrica Ativo:</strong> Sua letra será gerada automaticamente 
                    com a métrica ideal para <strong>{formData.genre || 'o gênero selecionado'}</strong>
                  </div>
                </div>
              </div>
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
            {formData.genre && generatedLyrics && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">
                  {currentMetrics.syllablesPerLine}s/linha
                </Badge>
                <Badge variant="outline">
                  {currentMetrics.bpm}BPM
                </Badge>
                <Badge variant="outline">
                  {currentMetrics.structure}
                </Badge>
              </div>
            )}
          </CardHeader>

          <CardContent className="flex-grow flex flex-col">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Criando sua letra...</p>
                  {formData.genre && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Aplicando métrica de {currentMetrics.syllablesPerLine} sílabas/linha
                    </p>
                  )}
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
                
                {/* Validação de Métrica */}
                <MetricValidator lyrics={generatedLyrics} genre={formData.genre} />
                
                <div className="flex gap-2 justify-between items-center">
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => navigator.clipboard.writeText(generatedLyrics)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar
                    </Button>
                    <AutoFixMetrics 
                      lyrics={generatedLyrics}
                      genre={formData.genre}
                      onFixed={setGeneratedLyrics}
                    />
                  </div>
                  <Button 
                    onClick={() => {/* Salvar projeto */}}
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Salvar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Preencha os parâmetros e gere sua primeira letra!</p>
                  {formData.genre && (
                    <p className="text-sm mt-2">
                      Métrica automática: {currentMetrics.syllablesPerLine} sílabas/linha
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}













