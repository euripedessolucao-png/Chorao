'use client'

import React, { useState } from 'react'

// Sistema de métricas por gênero brasileiro
const BRAZILIAN_GENRE_METRICS = {
  "Sertanejo Moderno": { syllablesPerLine: 6, bpm: 90, structure: "VERSO-REFRAO-PONTE" },
  "Sertanejo": { syllablesPerLine: 7, bpm: 85, structure: "VERSO-REFRAO-PONTE" },
  "Sertanejo Universitário": { syllablesPerLine: 6, bpm: 95, structure: "VERSO-REFRAO" },
  "Sertanejo Sofrência": { syllablesPerLine: 8, bpm: 75, structure: "VERSO-REFRAO-PONTE" },
  "Sertanejo Raiz": { syllablesPerLine: 10, bpm: 80, structure: "VERSO-REFRAO" },
  "Pagode": { syllablesPerLine: 7, bpm: 100, structure: "VERSO-REFRAO" },
  "Samba": { syllablesPerLine: 7, bpm: 105, structure: "VERSO-REFRAO-PONTE" },
  "Forró": { syllablesPerLine: 8, bpm: 120, structure: "VERSO-REFRAO" },
  "Axé": { syllablesPerLine: 6, bpm: 130, structure: "VERSO-REFRAO" },
  "MPB": { syllablesPerLine: 9, bpm: 90, structure: "VERSO-REFRAO-PONTE" },
  "Bossa Nova": { syllablesPerLine: 8, bpm: 70, structure: "VERSO-REFRAO" },
  "Rock": { syllablesPerLine: 8, bpm: 115, structure: "VERSO-REFRAO-SOLO" },
  "Pop": { syllablesPerLine: 7, bpm: 110, structure: "VERSO-REFRAO-PONTE" },
  "Funk": { syllablesPerLine: 6, bpm: 125, structure: "REFRAO-VERSO" },
  "Gospel": { syllablesPerLine: 8, bpm: 85, structure: "VERSO-REFRAO-PONTE" },
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
      
      // Simulação de API
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

  // Validar métrica
  const validateMetrics = (lyrics: string) => {
    if (!genre || !lyrics) return null
    
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
        syllables: countPortugueseSyllables(line)
      }))
      .filter(item => item.syllables > maxSyllables)
    
    return problematicLines
  }

  const originalProblematicLines = validateMetrics(originalLyrics)
  const rewrittenProblematicLines = validateMetrics(rewrittenLyrics)

  const selectedProjectData = mockProjects.find(p => p.id === selectedProject)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">🔄</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Reescrever Letra</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Aprimore suas letras com correção automática de métrica e melhorias inteligentes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Painel de Seleção */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Selecionar Letra</h2>
            <p className="text-gray-600 mb-6">Escolha um projeto ou cole sua letra</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projetos Salvos
                </label>
                <select 
                  value={selectedProject}
                  onChange={(e) => handleProjectSelect(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione um projeto</option>
                  {mockProjects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.title} ({project.genre})
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-sm text-gray-500 text-center">— OU —</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cole sua letra
                </label>
                <textarea
                  value={!selectedProject ? originalLyrics : ''}
                  onChange={(e) => {
                    if (!selectedProject) {
                      setOriginalLyrics(e.target.value)
                      setRewrittenLyrics('')
                    }
                  }}
                  disabled={!!selectedProject}
                  placeholder="Cole a letra que deseja reescrever..."
                  className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gênero da Letra
                </label>
                <select 
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione o gênero</option>
                  {Object.keys(BRAZILIAN_GENRE_METRICS)
                    .filter(g => g !== 'default')
                    .map(genreName => (
                    <option key={genreName} value={genreName}>
                      {genreName} ({BRAZILIAN_GENRE_METRICS[genreName].syllablesPerLine}s)
                    </option>
                  ))}
                </select>
              </div>

              {selectedProjectData && (
                <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{selectedProjectData.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                          {selectedProjectData.genre}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                          {BRAZILIAN_GENRE_METRICS[selectedProjectData.genre]?.syllablesPerLine || 8}s
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProject('')
                        setOriginalLyrics('')
                        setGenre('')
                      }}
                      className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                    >
                      Trocar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Painel de Original */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Letra Original</h2>
              <p className="text-gray-600">Sua letra antes das melhorias</p>
              {genre && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                    {currentMetrics.syllablesPerLine}s/linha
                  </span>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                    {currentMetrics.bpm}BPM
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <textarea
                value={originalLyrics}
                onChange={(e) => setOriginalLyrics(e.target.value)}
                placeholder="Letra original aparecerá aqui..."
                className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[300px]"
              />
              
              {originalProblematicLines && originalProblematicLines.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span>⚠️</span>
                    <span className="font-medium text-yellow-800">
                      Ajuste de Métrica Recomendado
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    <strong>{genre}</strong> recomenda até <strong>{currentMetrics.syllablesPerLine} sílabas</strong> por linha. 
                    {originalProblematicLines.length} linha(s) precisam de ajuste.
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(originalLyrics)}
                  disabled={!originalLyrics}
                  className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center disabled:opacity-50"
                >
                  <span className="mr-2">📋</span>
                  Copiar
                </button>
                
                {originalProblematicLines && originalProblematicLines.length > 0 && (
                  <button
                    onClick={() => {
                      const fixed = originalLyrics.split('\n').map(line => {
                        if (countPortugueseSyllables(line) > currentMetrics.syllablesPerLine) {
                          const words = line.split(' ')
                          if (words.length > 2) {
                            const mid = Math.floor(words.length / 2)
                            return words.slice(0, mid).join(' ') + '\n' + words.slice(mid).join(' ')
                          }
                        }
                        return line
                      }).join('\n')
                      setOriginalLyrics(fixed)
                    }}
                    className="bg-yellow-100 border border-yellow-300 text-yellow-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 flex items-center"
                  >
                    <span className="mr-2">🔄</span>
                    Corrigir Métrica
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Painel de Resultado */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Letra Reescrita</h2>
              <p className="text-gray-600">Versão aprimorada com métrica corrigida</p>
              {genre && rewrittenLyrics && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                    {currentMetrics.syllablesPerLine}s/linha
                  </span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                    {currentMetrics.bpm}BPM
                  </span>
                  <span>✅</span>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-center">
                    <span className="animate-spin text-4xl mb-4 block">🔄</span>
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
                  <textarea
                    value={rewrittenLyrics}
                    onChange={(e) => setRewrittenLyrics(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[300px]"
                    placeholder="Letra reescrita aparecerá aqui..."
                  />
                  
                  {rewrittenProblematicLines && rewrittenProblematicLines.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span>⚠️</span>
                        <span className="font-medium text-yellow-800">
                          Ajuste de Métrica Recomendado
                        </span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        <strong>{genre}</strong> recomenda até <strong>{currentMetrics.syllablesPerLine} sílabas</strong> por linha. 
                        {rewrittenProblematicLines.length} linha(s) precisam de ajuste.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(rewrittenLyrics)}
                      className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                    >
                      <span className="mr-2">📋</span>
                      Copiar
                    </button>
                    
                    {rewrittenProblematicLines && rewrittenProblematicLines.length > 0 && (
                      <button
                        onClick={() => {
                          const fixed = rewrittenLyrics.split('\n').map(line => {
                            if (countPortugueseSyllables(line) > currentMetrics.syllablesPerLine) {
                              const words = line.split(' ')
                              if (words.length > 2) {
                                const mid = Math.floor(words.length / 2)
                                return words.slice(0, mid).join(' ') + '\n' + words.slice(mid).join(' ')
                              }
                            }
                            return line
                          }).join('\n')
                          setRewrittenLyrics(fixed)
                        }}
                        className="bg-yellow-100 border border-yellow-300 text-yellow-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 flex items-center"
                      >
                        <span className="mr-2">🔄</span>
                        Corrigir Métrica
                      </button>
                    )}
                    
                    <button className="bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center ml-auto">
                      <span className="mr-2">💾</span>
                      Salvar
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-600">
                  <div className="text-center">
                    <span className="text-4xl mb-4 block">✨</span>
                    <p>Reescreva uma letra para ver o resultado</p>
                    {genre && (
                      <p className="text-sm mt-2">
                        Métrica: {currentMetrics.syllablesPerLine} sílabas/linha
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Painel de Opções de Reescrita */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span>⚡</span>
            Opções de Reescrita
          </h2>
          <p className="text-gray-600 mb-6">Escolha como deseja melhorar sua letra</p>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {rewriteOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setRewriteType(option.value)}
                  className={`py-3 px-4 rounded-md text-sm font-medium flex flex-col items-center gap-2 ${
                    rewriteType === option.value 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>🔄</span>
                  <span className="text-xs text-center">{option.label}</span>
                </button>
              ))}
            </div>

            {rewriteType === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instruções Personalizadas
                </label>
                <input
                  type="text"
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  placeholder="Ex: Tornar mais romântico, adicionar metáforas, etc."
                  className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <div className="flex gap-3 items-center">
              <button
                onClick={handleRewrite}
                disabled={isLoading || !originalLyrics.trim() || !genre}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">🔄</span>
                    Processando...
                  </>
                ) : (
                  <>
                    <span className="mr-2">✨</span>
                    Reescrever com Métrica {currentMetrics.syllablesPerLine}s
                  </>
                )}
              </button>
              
              {genre && (
                <div className="text-sm text-gray-600 text-center min-w-[120px]">
                  <div>{currentMetrics.syllablesPerLine}s/linha</div>
                  <div>{currentMetrics.bpm} BPM</div>
                </div>
              )}
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start">
                <span className="text-green-600 mr-2 mt-0.5">🎵</span>
                <div className="text-sm text-green-800">
                  <strong>Sistema de Métrica Ativo:</strong> Sua letra será reescrita automaticamente 
                  com a métrica ideal para <strong>{genre || 'o gênero selecionado'}</strong>. 
                  Versos longos serão corrigidos automaticamente.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}