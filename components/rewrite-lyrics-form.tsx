'use client'

import React, { useState } from 'react'

// Componentes UI básicos (os mesmos do CreatePage)
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

// Ícones
const Loader2 = () => <span>🔄</span>
const Music = () => <span>🎵</span>
const Zap = () => <span>⚡</span>
const Wand = () => <span>✨</span>
const Copy = () => <span>📋</span>
const Save = () => <span>💾</span>
const RefreshCw = () => <span>🔄</span>
const AlertTriangle = () => <span>⚠️</span>
const CheckCircle = () => <span>✅</span>

// Sistema de métricas por gênero brasileiro (mesmo do CreatePage)
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

// Função para contar sílabas em português (mesma do CreatePage)
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

// Mock data
const mockProjects = [
  { 
    id: '1', 
    title: 'Amor de Verão', 
    genre: 'Sertanejo Moderno', 
    lyrics: '[VERSO 1]\nO calor do verão aquece nosso coração de uma forma especial\n\n[REFRAO]\nÉ amor, é paixão nessa estação maravilhosa da vida' 
  },
  { 
    id: '2', 
    title: 'Noite Estrelada', 
    genre: 'MPB', 
    lyrics: '[VERSO 1]\nA noite caiu lentamente sobre a cidade adormecida\n\n[REFRAO]\nSob o céu estrelado meu coração se entregou completamente' 
  },
  { 
    id: '3', 
    title: 'Caminhos', 
    genre: 'Rock', 
    lyrics: '[VERSO 1]\nCaminhos se cruzam em um destino desconhecido\n\n[REFRAO]\nSeguindo em frente sem nunca olhar para trás' 
  }
]

const rewriteOptions = [
  { value: 'melhorar-rimas', label: 'Melhorar Rimas', description: 'Aprimora rimas e fluência poética' },
  { value: 'otimizar-metrica', label: 'Otimizar Métrica', description: 'Ajusta sílabas e ritmo' },
  { value: 'simplificar', label: 'Simplificar', description: 'Torna a linguagem mais acessível' },
  { value: 'enriquecer', label: 'Enriquecer', description: 'Adiciona metáforas e imagens' },
  { value: 'modernizar', label: 'Modernizar', description: 'Atualiza para linguagem contemporânea' },
  { value: 'intensificar', label: 'Intensificar', description: 'Aumenta impacto emocional' }
]

export default function RewritePage() {
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [originalLyrics, setOriginalLyrics] = useState('')
  const [rewrittenLyrics, setRewrittenLyrics] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [rewriteType, setRewriteType] = useState('otimizar-metrica')
  const [genre, setGenre] = useState('')
  const [customInstruction, setCustomInstruction] = useState('')

  const handleProjectSelect = (projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId)
    if (project) {
      setSelectedProject(projectId)
      setOriginalLyrics(project.lyrics)
      setGenre(project.genre)
      setRewrittenLyrics('')
    }
  }

  const handleRewrite = async () => {
    if (!originalLyrics.trim()) {
      alert('Cole ou selecione uma letra para reescrever')
      return
    }

    setIsLoading(true)
    setRewrittenLyrics('')
    
    try {
      const metrics = BRAZILIAN_GENRE_METRICS[genre] || BRAZILIAN_GENRE_METRICS.default
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      let result = originalLyrics
      
      switch (rewriteType) {
        case 'otimizar-metrica':
          result = originalLyrics + `\n\n[VERSO OTIMIZADO]\nCom métrica perfeita de ${metrics.syllablesPerLine} sílabas\nRitmo ajustado pra ${metrics.bpm} BPM\n\n✅ Métrica otimizada para ${genre}`
          break
        case 'melhorar-rimas':
          result = originalLyrics + `\n\n[VERSO APRIMORADO]\nRimas ricas e bem cuidadas\nFluindo como águas calmas\n\n✅ Rimas aprimoradas`
          break
        case 'simplificar':
          result = originalLyrics + `\n\n[VERSO SIMPLIFICADO]\nPalavras mais leves\nSentimento mais puro\n\n✅ Linguagem simplificada`
          break
        case 'custom':
          result = originalLyrics + `\n\n[VERSO PERSONALIZADO]\n${customInstruction || 'Aplicando suas instruções...'}\n\n✅ Personalização aplicada`
          break
        default:
          result = originalLyrics + `\n\n[VERSO REESCRITO]\nVersão melhorada e refinada\nCom toque especial\n\n✅ Reescrita concluída`
      }
      
      setRewrittenLyrics(result)
    } catch (error) {
      console.error('Erro ao reescrever letra:', error)
      alert('Erro ao processar a letra. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const currentMetrics = genre ? 
    BRAZILIAN_GENRE_METRICS[genre] : 
    BRAZILIAN_GENRE_METRICS.default

  const selectedProjectData = mockProjects.find(p => p.id === selectedProject)

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-8 max-w-none">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <RefreshCw />
          </div>
          <h1 className="text-4xl font-bold">Reescrever Letra</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Aprimore suas letras com correção automática de métrica e melhorias inteligentes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Seleção */}
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Letra</CardTitle>
            <CardDescription>
              Escolha um projeto ou cole sua letra
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="project-select">Projetos Salvos</Label>
              <Select value={selectedProject} onValueChange={handleProjectSelect}>
                <SelectValue placeholder="Selecione um projeto" />
                {mockProjects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span>{project.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {project.genre}
                        </Badge>
                      </div>
                      {BRAZILIAN_GENRE_METRICS[project.genre] && (
                        <Badge variant="secondary" className="text-xs">
                          {BRAZILIAN_GENRE_METRICS[project.genre].syllablesPerLine}s
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="text-sm text-gray-500 text-center">
              — OU —
            </div>

            <div>
              <Label htmlFor="original-lyrics">Cole sua letra</Label>
              <Textarea
                id="original-lyrics"
                placeholder="Cole a letra que deseja reescrever..."
                value={!selectedProject ? originalLyrics : ''}
                onChange={(e) => {
                  if (!selectedProject) {
                    setOriginalLyrics(e.target.value)
                    setRewrittenLyrics('')
                  }
                }}
                disabled={!!selectedProject}
                className="min-h-[120px]"
              />
            </div>

            <div>
              <Label htmlFor="genre-select">Gênero da Letra</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectValue placeholder="Selecione o gênero" />
                {Object.keys(BRAZILIAN_GENRE_METRICS)
                  .filter(g => g !== 'default')
                  .map(genreName => (
                  <SelectItem key={genreName} value={genreName}>
                    <div className="flex items-center justify-between w-full">
                      <span>{genreName}</span>
                      <Badge variant="outline" className="text-xs">
                        {BRAZILIAN_GENRE_METRICS[genreName].syllablesPerLine}s
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </Select>
            </div>

            {selectedProjectData && (
              <Card className="bg-gray-50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedProjectData.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {selectedProjectData.genre}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {BRAZILIAN_GENRE_METRICS[selectedProjectData.genre]?.syllablesPerLine || 8}s
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProject('')
                        setOriginalLyrics('')
                        setGenre('')
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

        {/* Painel de Original */}
        <Card>
          <CardHeader>
            <CardTitle>Letra Original</CardTitle>
            <CardDescription>
              Sua letra antes das melhorias
            </CardDescription>
            {genre && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">
                  {currentMetrics.syllablesPerLine}s/linha
                </Badge>
                <Badge variant="outline">
                  {currentMetrics.bpm}BPM
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={originalLyrics}
              onChange={(e) => setOriginalLyrics(e.target.value)}
              placeholder="Letra original aparecerá aqui..."
              className="min-h-[300px] font-mono text-sm"
            />
            
            {originalLyrics && genre && (
              <MetricValidator lyrics={originalLyrics} genre={genre} />
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigator.clipboard.writeText(originalLyrics)}
                disabled={!originalLyrics}
                size="sm"
              >
                <Copy />
                Copiar
              </Button>
              {originalLyrics && genre && (
                <AutoFixMetrics 
                  lyrics={originalLyrics}
                  genre={genre}
                  onFixed={setOriginalLyrics}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Painel de Resultado */}
        <Card>
          <CardHeader>
            <CardTitle>Letra Reescrita</CardTitle>
            <CardDescription>
              Versão aprimorada com métrica corrigida
            </CardDescription>
            {genre && rewrittenLyrics && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary">
                  {currentMetrics.syllablesPerLine}s/linha
                </Badge>
                <Badge variant="secondary">
                  {currentMetrics.bpm}BPM
                </Badge>
                <CheckCircle />
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-center">
                  <Loader2 />
                  <p className="text-gray-600">Reescrevendo letra...</p>
                  {genre && (
                    <p className="text-sm text-gray-600 mt-2">
                      Aplicando métrica de {currentMetrics.syllablesPerLine} sílabas
                    </p>
                  )}
                </div>
              </div>
            ) : rewrittenLyrics ? (
              <>
                <Textarea
                  value={rewrittenLyrics}
                  onChange={(e) => setRewrittenLyrics(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                  placeholder="Letra reescrita aparecerá aqui..."
                />
                
                {genre && (
                  <MetricValidator lyrics={rewrittenLyrics} genre={genre} />
                )}
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(rewrittenLyrics)}
                    size="sm"
                  >
                    <Copy />
                    Copiar
                  </Button>
                  {genre && (
                    <AutoFixMetrics 
                      lyrics={rewrittenLyrics}
                      genre={genre}
                      onFixed={setRewrittenLyrics}
                    />
                  )}
                  <Button size="sm" className="ml-auto">
                    <Save />
                    Salvar
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-600">
                <div className="text-center">
                  <Wand />
                  <p>Reescreva uma letra para ver o resultado</p>
                  {genre && (
                    <p className="text-sm mt-2">
                      Métrica: {currentMetrics.syllablesPerLine} sílabas/linha
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Painel de Opções de Reescrita */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap />
            Opções de Reescrita
          </CardTitle>
          <CardDescription>
            Escolha como deseja melhorar sua letra
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {rewriteOptions.map(option => (
              <Button
                key={option.value}
                variant={rewriteType === option.value ? "default" : "outline"}
                className="h-auto py-3 flex flex-col items-center gap-2"
                onClick={() => setRewriteType(option.value)}
              >
                <RefreshCw />
                <span className="text-xs text-center">{option.label}</span>
              </Button>
            ))}
          </div>

          {rewriteType === 'custom' && (
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

          <div className="flex gap-3 items-center">
            <Button
              onClick={handleRewrite}
              disabled={isLoading || !originalLyrics.trim() || !genre}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 />
                  Processando...
                </>
              ) : (
                <>
                  <Wand />
                  Reescrever com Métrica {currentMetrics.syllablesPerLine}s
                </>
              )}
            </Button>
            
            {genre && (
              <div className="text-sm text-gray-600 text-center min-w-[120px]">
                <div>{currentMetrics.syllablesPerLine}s/linha</div>
                <div>{currentMetrics.bpm} BPM</div>
              </div>
            )}
          </div>

          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-2">
              <Music />
              <div className="text-sm text-green-800">
                <strong>Sistema de Métrica Ativo:</strong> Sua letra será reescrita automaticamente 
                com a métrica ideal para <strong>{genre || 'o gênero selecionado'}</strong>. 
                Versos longos serão corrigidos automaticamente.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}