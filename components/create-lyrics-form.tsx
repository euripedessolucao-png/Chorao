// app/components/CreatePage.tsx
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { apiClient } from '~/client/api'
import { useToast } from '~/client/utils'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Checkbox,
  Slider,
  Badge,
} from '~/components/ui'
import {
  Loader2,
  RefreshCw,
  Zap,
  Music,
  ChevronRight,
  Search,
  Wand,
  X,
} from 'lucide-react'

function CreatePage() {
  const [useDirectStyle, setUseDirectStyle] = useState(false)
  const [useBachataTemplate, setUseBachataTemplate] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [emotions, setEmotions] = useState<string[]>([])
  const [selectedTrends, setSelectedTrends] = useState<string[]>([])

  const [formData, setFormData] = useState({
    genre: '',
    subgenre: '',
    theme: '',
    avoidWords: '',
    additionalRequirements: '',
    creativityLevel: 'medium' as 'low' | 'medium' | 'high' | 'experimental',
    formatStyle: 'standard' as 'standard' | 'performance',
  })

  const [subgenres, setSubgenres] = useState<Array<{ id: string; name: string }>>([])
  const [generatedLyrics, setGeneratedLyrics] = useState('')
  const [title, setTitle] = useState('')
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  // Carregar gêneros
  const { data: genres } = useQuery(['genres'], apiClient.getGenres)

  // Buscar subgêneros quando o gênero mudar
  useEffect(() => {
    if (formData.genre && genres && genres.length > 0) {
      const selected = genres.find((g: any) => g.name === formData.genre)
      if (selected) {
        apiClient
          .getSubgenresByGenre({ genreId: selected.id })
          .then((result) => {
            setSubgenres(result)
            if (formData.subgenre && !result.find((s: any) => s.name === formData.subgenre)) {
              setFormData((prev) => ({ ...prev, subgenre: '' }))
            }
          })
          .catch((error) => {
            console.error('Erro ao buscar subgêneros:', error)
            setSubgenres([])
          })
      } else {
        setSubgenres([])
        setFormData((prev) => ({ ...prev, subgenre: '' }))
      }
    } else {
      setSubgenres([])
      setFormData((prev) => ({ ...prev, subgenre: '' }))
    }
  }, [formData.genre, genres])

  // Selecionar automaticamente o gênero mais comercial
  useEffect(() => {
    if (genres && genres.length > 0 && !formData.genre) {
      const comercialPriority = [
        'Pop',
        'Sertanejo',
        'Funk',
        'Pagode',
        'Forró',
        'MPB',
        'Rock',
        'Reggae',
        'Bossa Nova',
        'Samba',
      ]

      const mostCommercialGenre = comercialPriority.find((priorityGenre) =>
        genres.find((g: any) =>
          g.name.toLowerCase().includes(priorityGenre.toLowerCase())
        )
      )

      if (mostCommercialGenre) {
        const selectedGenre = genres.find((g: any) =>
          g.name.toLowerCase().includes(mostCommercialGenre.toLowerCase())
        )
        if (selectedGenre) {
          setFormData((prev) => ({ ...prev, genre: selectedGenre.name }))
        }
      } else if (genres.length > 0) {
        const firstGenre = genres[0]
        if (firstGenre) {
          setFormData((prev) => ({ ...prev, genre: firstGenre.name }))
        }
      }
    }
  }, [genres, formData.genre])

  const [useMetricsControl, setUseMetricsControl] = useState(false)
  const [syllablesPerLine, setSyllablesPerLine] = useState<number>(8)
  const [bpm, setBpm] = useState(80)

  const GENRE_METRICS_DEFAULTS: Record<string, { bpm: number; syllablesPerLine: number }> = {
    'Sertanejo Sofrência': { bpm: 75, syllablesPerLine: 5 },
    'Sertanejo Universitário': { bpm: 88, syllablesPerLine: 6 },
    'Gospel Louvor': { bpm: 110, syllablesPerLine: 8 },
    'Gospel Adoração': { bpm: 70, syllablesPerLine: 8 },
    'Pagode Brasil': { bpm: 95, syllablesPerLine: 7 },
    'MPB Brasil': { bpm: 90, syllablesPerLine: 9 },
    'Pop': { bpm: 110, syllablesPerLine: 8 },
    'Rock': { bpm: 120, syllablesPerLine: 8 },
    'Country': { bpm: 100, syllablesPerLine: 8 },
    'Sertanejo Moderno': { bpm: 90, syllablesPerLine: 7 },
    'Sertanejo Raiz': { bpm: 80, syllablesPerLine: 10 },
    'default': { bpm: 80, syllablesPerLine: 8 },
  }

  const GENRE_METRICS_RANGES: Record<
    string,
    {
      bpm: { min: number; max: number }
      syllablesPerLine: { min: number; max: number }
    }
  > = {
    'Sertanejo Sofrência': {
      bpm: { min: 60, max: 90 },
      syllablesPerLine: { min: 4, max: 8 },
    },
    'Sertanejo Universitário': {
      bpm: { min: 80, max: 110 },
      syllablesPerLine: { min: 5, max: 9 },
    },
    'Gospel Louvor': {
      bpm: { min: 90, max: 140 },
      syllablesPerLine: { min: 6, max: 12 },
    },
    'Gospel Adoração': {
      bpm: { min: 60, max: 85 },
      syllablesPerLine: { min: 7, max: 11 },
    },
    'Pagode Brasil': {
      bpm: { min: 85, max: 115 },
      syllablesPerLine: { min: 6, max: 10 },
    },
    'MPB Brasil': {
      bpm: { min: 70, max: 120 },
      syllablesPerLine: { min: 6, max: 12 },
    },
    'Pop': { bpm: { min: 90, max: 130 }, syllablesPerLine: { min: 6, max: 10 } },
    'Rock': { bpm: { min: 100, max: 150 }, syllablesPerLine: { min: 6, max: 11 } },
    'Country': {
      bpm: { min: 80, max: 130 },
      syllablesPerLine: { min: 6, max: 10 },
    },
    'Sertanejo Moderno': {
      bpm: { min: 80, max: 120 },
      syllablesPerLine: { min: 6, max: 9 },
    },
    'Sertanejo Raiz': {
      bpm: { min: 70, max: 100 },
      syllablesPerLine: { min: 8, max: 12 },
    },
    'default': {
      bpm: { min: 40, max: 160 },
      syllablesPerLine: { min: 4, max: 16 },
    },
  }

  const metricRanges = useMemo(() => {
    return GENRE_METRICS_RANGES[formData.genre] || GENRE_METRICS_RANGES.default
  }, [formData.genre])

  useEffect(() => {
    if (formData.genre) {
      const defaults = GENRE_METRICS_DEFAULTS[formData.genre] || GENRE_METRICS_DEFAULTS.default
      if (defaults) {
        setBpm(defaults.bpm)
        setSyllablesPerLine(defaults.syllablesPerLine)
      }
    }
  }, [formData.genre])

  const generateMutation = useMutation(apiClient.generateLyrics, {
    onSuccess: (data) => {
      setGeneratedLyrics(data.lyrics)
      setTitle(data.title)
      setErrorDetails(null)
      toast({
        title: 'Letra gerada com sucesso!',
        description: 'Sua letra foi criada e está pronta para edição.',
      })
    },
    onError: (error: any) => {
      setErrorDetails(error.message || 'Erro desconhecido')
      toast({
        title: 'Erro ao gerar letra',
        description: 'Ocorreu um erro ao gerar a letra. Tente novamente.',
        variant: 'destructive',
      })
    },
  })

  const saveMutation = useMutation(apiClient.createProject, {
    onSuccess: () => {
      queryClient.invalidateQueries(['projects'])
      toast({
        title: 'Projeto salvo',
        description: 'Suas letras foram salvas com sucesso',
      })
      router.push('/')
    },
  })

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.genre || !formData.theme) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha o gênero e o tema.',
        variant: 'destructive',
      })
      return
    }

    const themeWithReq = formData.additionalRequirements
      ? `${formData.theme}\n\nRequisitos adicionais: ${formData.additionalRequirements}`
      : formData.theme

    generateMutation.mutate({
      genre: formData.genre,
      subgenre: formData.subgenre || undefined,
      theme: themeWithReq,
      avoidWords: formData.avoidWords || undefined,
      creativityLevel: formData.creativityLevel,
      formatStyle: formData.formatStyle,
      directStyleMode: useDirectStyle || undefined,
      bachataTemplateMode: useBachataTemplate || undefined,
    })
  }

  const handleSave = () => {
    if (!title || !generatedLyrics) {
      toast({
        title: 'Dados incompletos',
        description: 'Por favor, gere uma letra e defina um título antes de salvar.',
        variant: 'destructive',
      })
      return
    }

    saveMutation.mutate({
      title: title.trim(),
      lyrics: generatedLyrics,
      genre: formData.genre,
      theme: formData.theme,
    })
  }

  return (
    <div className="w-full max-w-none">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Painel de Parâmetros */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Parâmetros da Letra</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-4 p-4 bg-accent/50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <Music className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">Gênero Musical</h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="genre" className="text-sm font-medium">
                        Gênero Principal *
                      </Label>
                      <Select
                        value={formData.genre}
                        onValueChange={(value) => {
                          setFormData({
                            ...formData,
                            genre: value,
                            subgenre: '',
                          })
                        }}
                      >
                        <SelectTrigger id="genre" className="mt-1">
                          <SelectValue placeholder="Escolha o gênero principal" />
                        </SelectTrigger>
                        <SelectContent>
                          {genres?.map((genre: any) => (
                            <SelectItem key={genre.id} value={genre.name}>
                              {genre.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {subgenres.length > 0 && (
                      <div>
                        <Label htmlFor="subgenre" className="text-sm font-medium">
                          Subgênero
                          <span className="text-muted-foreground ml-1">(opcional)</span>
                        </Label>
                        <Select
                          value={formData.subgenre}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              subgenre: value === 'none' ? '' : value,
                            })
                          }
                        >
                          <SelectTrigger id="subgenre" className="mt-1">
                            <SelectValue placeholder="Refine o estilo (opcional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              <span className="text-muted-foreground">Nenhum subgênero</span>
                            </SelectItem>
                            {subgenres.map((subgenre: any) => (
                              <SelectItem key={subgenre.id} value={subgenre.name}>
                                {subgenre.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {formData.genre && (
                      <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-md">
                        <Badge variant="secondary" className="text-xs">
                          {formData.genre}
                        </Badge>
                        {formData.subgenre && (
                          <>
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            <Badge variant="outline" className="text-xs">
                              {formData.subgenre}
                            </Badge>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="theme">Tema *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="theme"
                      placeholder="Digite o tema da sua música"
                      value={formData.theme}
                      onChange={(e) =>
                        setFormData({ ...formData, theme: e.target.value })
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title="Buscar mais temas"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="formatStyle">Estilo de Formatação</Label>
                  <Select
                    value={formData.formatStyle}
                    onValueChange={(value: 'standard' | 'performance') =>
                      setFormData({ ...formData, formatStyle: value })
                    }
                  >
                    <SelectTrigger id="formatStyle">
                      <SelectValue placeholder="Selecione o estilo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Padrão</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="avoidWords">Evitar palavras (separadas por vírgula)</Label>
                  <Input
                    id="avoidWords"
                    placeholder="Ex: coraçãozinho, saudadezinha"
                    value={formData.avoidWords}
                    onChange={(e) =>
                      setFormData({ ...formData, avoidWords: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="additional-requirements">Requisitos Adicionais</Label>
                  <Textarea
                    id="additional-requirements"
                    placeholder="Elementos específicos que você queira incluir..."
                    value={formData.additionalRequirements}
                    onChange={(e) =>
                      setFormData({ ...formData, additionalRequirements: e.target.value })
                    }
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <Label htmlFor="creativityLevel">Nível de Criatividade</Label>
                  <Select
                    value={formData.creativityLevel}
                    onValueChange={(value: 'low' | 'medium' | 'high' | 'experimental') =>
                      setFormData({ ...formData, creativityLevel: value })
                    }
                  >
                    <SelectTrigger id="creativityLevel">
                      <SelectValue placeholder="Selecione o nível de criatividade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Conservador</SelectItem>
                      <SelectItem value="medium">Equilibrado</SelectItem>
                      <SelectItem value="high">Ousado</SelectItem>
                      <SelectItem value="experimental">Experimental</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="useMetricsControl"
                      checked={useMetricsControl}
                      onCheckedChange={(checked) =>
                        setUseMetricsControl(Boolean(checked))
                      }
                    />
                    <Label htmlFor="useMetricsControl" className="font-semibold">
                      Controle de Métrica e Ritmo
                    </Label>
                  </div>
                  {useMetricsControl && (
                    <div className="pl-6 space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor="bpm">BPM</Label>
                          <span className="text-sm font-medium text-primary">{bpm}</span>
                        </div>
                        <Slider
                          id="bpm"
                          min={metricRanges.bpm.min}
                          max={metricRanges.bpm.max}
                          step={1}
                          value={[bpm]}
                          onValueChange={(value) => value[0] !== undefined && setBpm(value[0])}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor="syllablesPerLine">Sílabas por Linha</Label>
                          <span className="text-sm font-medium text-primary">
                            {syllablesPerLine}
                          </span>
                        </div>
                        <Slider
                          id="syllablesPerLine"
                          min={metricRanges.syllablesPerLine.min}
                          max={metricRanges.syllablesPerLine.max}
                          step={1}
                          value={[syllablesPerLine]}
                          onValueChange={(value) =>
                            value[0] !== undefined && setSyllablesPerLine(value[0])
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  variant={useDirectStyle ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setUseDirectStyle((v) => !v)}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Estilo direto e objetivo
                </Button>

                <Button
                  type="button"
                  variant={useBachataTemplate ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setUseBachataTemplate((v) => !v)}
                >
                  <Music className="mr-2 h-4 w-4" />
                  Modelo Bachata‑Sertaneja
                </Button>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={generateMutation.isLoading || !formData.genre || !formData.theme}
                >
                  {generateMutation.isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Gerar Letra
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Painel Central - Letra Gerada */}
        <div className="lg:col-span-2">
          {errorDetails && (
            <div className="mb-4 border-2 border-red-700 bg-red-100 dark:bg-red-900/70 text-red-900 dark:text-red-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <X className="h-5 w-5 text-red-700" />
                <span className="font-bold">Erro técnico</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-5 w-5 p-0"
                  onClick={() => setErrorDetails(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <pre className="whitespace-pre-wrap text-xs max-h-40 overflow-auto">
                {errorDetails}
              </pre>
            </div>
          )}

          <Card className="h-full">
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
                  disabled={!generatedLyrics || !formData.genre}
                >
                  <Wand className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {generateMutation.isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Gerando sua letra...</p>
                  </div>
                </div>
              ) : generatedLyrics ? (
                <div className="space-y-4">
                  <Textarea
                    value={generatedLyrics}
                    onChange={(e) => setGeneratedLyrics(e.target.value)}
                    className="min-h-64 font-mono text-sm"
                    placeholder="Sua letra aparecerá aqui..."
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saveMutation.isLoading}>
                      {saveMutation.isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Salvar Projeto'
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setGeneratedLyrics('')}>
                      Limpar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <Music className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Configure os parâmetros e gere sua primeira letra</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CreatePage