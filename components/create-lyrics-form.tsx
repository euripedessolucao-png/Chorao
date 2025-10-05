'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

// Componentes UI básicos - substitua pelos seus componentes reais
const Button = ({ children, onClick, disabled, className = '', variant = 'default', size = 'default', ...props }: any) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-900",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200"
  }
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-8 px-3 text-xs",
    lg: "h-11 px-8"
  }
  
  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

const Card = ({ children, className = '' }: any) => (
  <div className={`rounded-lg border bg-white shadow-sm ${className}`}>
    {children}
  </div>
)

const CardHeader = ({ children, className = '' }: any) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
)

const CardTitle = ({ children, className = '' }: any) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
)

const CardDescription = ({ children, className = '' }: any) => (
  <p className={`text-sm text-gray-600 ${className}`}>
    {children}
  </p>
)

const CardContent = ({ children, className = '' }: any) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
)

const Input = ({ className = '', ...props }: any) => (
  <input 
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
)

const Textarea = ({ className = '', ...props }: any) => (
  <textarea 
    className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
)

const Label = ({ children, className = '', ...props }: any) => (
  <label 
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    {...props}
  >
    {children}
  </label>
)

const Select = ({ children, value, onValueChange, ...props }: any) => (
  <select 
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    {...props}
  >
    {children}
  </select>
)

const SelectTrigger = ({ children, ...props }: any) => <div {...props}>{children}</div>
const SelectValue = ({ placeholder }: any) => <option value="">{placeholder}</option>
const SelectContent = ({ children }: any) => <>{children}</>

const SelectItem = ({ children, value }: any) => (
  <option value={value}>{children}</option>
)

const Badge = ({ children, variant = 'default', className = '' }: any) => {
  const variants = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    outline: "border border-gray-300 text-gray-700"
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

// Ícones (usando emoji como fallback)
const Loader2 = () => <span>🔄</span>
const Music = () => <span>🎵</span>
const Zap = () => <span>⚡</span>
const Wand = () => <span>✨</span>
const Search = () => <span>🔍</span>
const Copy = () => <span>📋</span>
const Save = () => <span>💾</span>
const RefreshCw = () => <span>🔄</span>
const AlertTriangle = () => <span>⚠️</span>

// Sistema de métricas por gênero brasileiro
const BRAZILIAN_GENRE_METRICS = {
  // Sertanejo Moderno
  "Sertanejo Moderno": { syllablesPerLine: 6, bpm: 90, structure: "VERSO-REFRAO-PONTE" },
  
  // Sertanejo Tradicional
  "Sertanejo": { syllablesPerLine: 7, bpm: 85, structure: "VERSO-REFRAO-PONTE" },
  "Sertanejo Universitário": { syllablesPerLine: 6, bpm: 95, structure: "VERSO-REFRAO" },
  "Sertanejo Sofrência": { syllablesPerLine: 8, bpm: 75, structure: "VERSO-REFRAO-PONTE" },
  "Sertanejo Raiz": { syllablesPerLine: 10, bpm: 80, structure: "VERSO-REFRAO" },
  
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
  
  let syllableCount = 0
  let i = 0
  
  while (i < cleanWord.length) {
    const currentChar = cleanWord[i]
    
    if ('aeiouáéíóúâêîôûàèìòùãõ'.includes(currentChar)) {
      syllableCount++
      
      if (i + 1 < cleanWord.length) {
        const nextChar = cleanWord[i + 1]
        if (('aeo'.includes(currentChar) && 'iu'.includes(nextChar)) ||
            ('iu'.includes(currentChar) && 'aeo'.includes(nextChar))) {
          i++
        }
      }
    }
    i++
  }
  
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
    <Card className="border-yellow-200 bg-yellow-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle />
          <span className="font-medium text-yellow-800">
            Ajuste de Métrica Recomendado
          </span>
        </div>
        <p className="text-sm text-yellow-700 mb-2">
          <strong>{genre}</strong> recomenda até <strong>{maxSyllables} sílabas</strong> por linha. 
          {problematicLines.length} linha(s) precisam de ajuste:
        </p>
        <div className="space-y-1 text-xs max-h-20 overflow-y-auto">
          {problematicLines.slice(0, 5).map((item, idx) => (
            <div key={idx} className="flex justify-between items-start">
              <span className="text-yellow-800 flex-1">
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
        if (!line.trim() || 
            line.trim().startsWith('[') || 
            line.trim().startsWith('(') ||
            line.includes('Instrumental:')) {
          return line
        }
        
        const syllableCount = countPortugueseSyllables(line)
        if (syllableCount <= maxSyllables) return line
        
        const words = line.split(' ')
        if (words.length <= 2) return line
        
        let splitIndex = Math.floor(words.length / 2)
        
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
        <>
          <Loader2 />
          Corrigindo...
        </>
      ) : (
        <>
          <RefreshCw />
          Corrigir Métrica
        </>
      )}
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
    { id: '1', name: 'Sertanejo Moderno' },
    { id: '2', name: 'Sertanejo' },
    { id: '3', name: 'Sertanejo Universitário' },
    { id: '4', name: 'Sertanejo Sofrência' },
    { id: '5', name: 'Sertanejo Raiz' },
    { id: '6', name: 'Pagode' },
    { id: '7', name: 'Samba' },
    { id: '8', name: 'Forró' },
    { id: '9', name: 'Axé' },
    { id: '10', name: 'MPB' },
    { id: '11', name: 'Bossa Nova' },
    { id: '12', name: 'Rock' },
    { id: '13', name: 'Pop' },
    { id: '14', name: 'Funk' },
    { id: '15', name: 'Gospel' },
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
                  <SelectValue placeholder="Escolha o gênero" />
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
                </Select>
                {formData.genre && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
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
                  <SelectValue placeholder="Selecione o nível" />
                  <SelectItem value="low">Conservador</SelectItem>
                  <SelectItem value="medium">Equilibrado</SelectItem>
                  <SelectItem value="high">Ousado</SelectItem>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !formData.genre || !formData.theme}
              >
                {isLoading ? (
                  <>
                    <Loader2 />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Music />
                    Gerar Letra com Métrica {currentMetrics.syllablesPerLine}s
                  </>
                )}
              </Button>

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start gap-2">
                  <Zap />
                  <div className="text-sm text-green-800">
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
                <Wand />
              </Button>
            </div>
            {formData.genre && generatedLyrics && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
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
                  <Loader2 />
                  <p className="text-gray-600">Criando sua letra...</p>
                  {formData.genre && (
                    <p className="text-sm text-gray-600 mt-2">
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
                      <Copy />
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
                    <Save />
                    Salvar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-600">
                <div className="text-center">
                  <Music />
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