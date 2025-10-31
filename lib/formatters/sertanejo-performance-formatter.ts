// lib/formatters/sertanejo-performance-formatter.ts - NOVO ARQUIVO CRIADO

/**
 * FORMATADOR DE PERFORMANCE SERTANEJA
 * 
 * Converte letras padrão para formato de performance ao vivo
 * com marcações de back vocals, instrumentação e dinâmica
 */

export interface PerformanceFormatOptions {
  includeBackVocals?: boolean
  includeInstrumentation?: boolean
  includeDynamics?: boolean
  style?: 'moderno' | 'raiz' | 'universitário'
}

/**
 * Formata letra para performance sertaneja ao vivo
 */
export function formatSertanejoPerformance(
  lyrics: string, 
  genre: string = 'sertanejo',
  options: PerformanceFormatOptions = {}
): string {
  const {
    includeBackVocals = true,
    includeInstrumentation = true, 
    includeDynamics = true,
    style = detectSertanejoStyle(genre)
  } = options

  let formattedLyrics = lyrics

  // 1. FORMATA SEÇÕES PARA PERFORMANCE
  formattedLyrics = formatSections(formattedLyrics, style)

  // 2. ADICIONA BACK VOCALS (HARMONIAS)
  if (includeBackVocals) {
    formattedLyrics = addBackVocals(formattedLyrics, style)
  }

  // 3. ADICIONA INSTRUMENTAÇÃO
  if (includeInstrumentation) {
    formattedLyrics = addInstrumentation(formattedLyrics, genre, style)
  }

  // 4. ADICIONA DINÂMICA DE PERFORMANCE
  if (includeDynamics) {
    formattedLyrics = addPerformanceDynamics(formattedLyrics, style)
  }

  return formattedLyrics.trim()
}

/**
 * Detecta estilo sertanejo baseado no gênero
 */
function detectSertanejoStyle(genre: string): 'moderno' | 'raiz' | 'universitário' {
  const genreLower = genre.toLowerCase()
  
  if (genreLower.includes('raiz') || genreLower.includes('modão')) {
    return 'raiz'
  }
  
  if (genreLower.includes('universitário') || genreLower.includes('universitario')) {
    return 'universitário'
  }
  
  return 'moderno'
}

/**
 * Formata seções com estilo de performance
 */
function formatSections(lyrics: string, style: string): string {
  const lines = lyrics.split('\n')
  const formattedLines: string[] = []
  
  let inChorus = false
  let chorusCount = 0

  for (const line of lines) {
    const trimmed = line.trim()
    
    if (!trimmed) {
      formattedLines.push('')
      continue
    }

    // Detecta tipo de seção
    if (isSectionHeader(trimmed)) {
      inChorus = isChorusSection(trimmed)
      
      if (inChorus) {
        chorusCount++
      }
      
      // Formata cabeçalho de seção
      const formattedSection = formatSectionHeader(trimmed, style, chorusCount)
      formattedLines.push(formattedSection)
    } else {
      // Formata linha de letra
      const formattedLine = formatLyricLine(trimmed, inChorus, style)
      formattedLines.push(formattedLine)
    }
  }

  return formattedLines.join('\n')
}

/**
 * Verifica se é cabeçalho de seção
 */
function isSectionHeader(line: string): boolean {
  return /^\s*\[.+\]\s*$/.test(line) || /^\s*###\s*\[.+\]\s*$/.test(line)
}

/**
 * Verifica se é seção de refrão
 */
function isChorusSection(section: string): boolean {
  const sectionLower = section.toLowerCase()
  return sectionLower.includes('chorus') || 
         sectionLower.includes('refrão') || 
         sectionLower.includes('refrao')
}

/**
 * Formata cabeçalho de seção
 */
function formatSectionHeader(header: string, style: string, chorusCount: number): string {
  let cleanHeader = header.replace(/^###\s*/, '').replace(/[\[\]]/g, '').trim()
  
  // Adiciona numeração para refrões repetidos
  if (isChorusSection(header) && chorusCount > 1) {
    cleanHeader = `${cleanHeader} ${chorusCount}`
  }
  
  switch (style) {
    case 'raiz':
      return `🎵 [${cleanHeader.toUpperCase()}]`
    
    case 'universitário':
      return `🎤 [${cleanHeader}]`
    
    case 'moderno':
    default:
      return `🎶 [${cleanHeader}]`
  }
}

/**
 * Formata linha de letra para performance
 */
function formatLyricLine(line: string, inChorus: boolean, style: string): string {
  // Remove marcações existentes
  const cleanLine = line.replace(/\(.*?\)/g, '').trim()
  
  if (!cleanLine) return ''
  
  // Adiciona formatação baseada no estilo e contexto
  if (inChorus) {
    return formatChorusLine(cleanLine, style)
  } else {
    return formatVerseLine(cleanLine, style)
  }
}

/**
 * Formata linha de refrão
 */
function formatChorusLine(line: string, style: string): string {
  switch (style) {
    case 'raiz':
      return `  ${line}  🎶` // Centralizado com emoji
      
    case 'universitário':
      return `🎤 ${line} 👏` // Com emoji de microfone e palmas
      
    case 'moderno':
    default:
      return `🎵 ${line} 🎵` // Envolto em emojis musicais
  }
}

/**
 * Formata linha de verso
 */
function formatVerseLine(line: string, style: string): string {
  switch (style) {
    case 'raiz':
      return `  ${line}` // Indentado
      
    case 'universitário':
      return `🎸 ${line}` // Com emoji de violão
      
    case 'moderno':
    default:
      return `   ${line}` // Indentação leve
  }
}

/**
 * Adiciona marcações de back vocals
 */
function addBackVocals(lyrics: string, style: string): string {
  const lines = lyrics.split('\n')
  const formattedLines: string[] = []
  
  let previousWasChorus = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    
    formattedLines.push(line)
    
    // Adiciona back vocal após refrões
    if (isChorusSection(trimmed)) {
      previousWasChorus = true
    } else if (previousWasChorus && !isSectionHeader(trimmed) && trimmed && i < lines.length - 1) {
      const nextLine = lines[i + 1]?.trim()
      if (!nextLine || isSectionHeader(nextLine)) {
        // Fim do refrão - adiciona back vocal
        const backVocal = generateBackVocal(line, style)
        if (backVocal) {
          formattedLines.push(backVocal)
        }
        previousWasChorus = false
      }
    }
  }
  
  return formattedLines.join('\n')
}

/**
 * Gera linha de back vocal apropriada
 */
function generateBackVocal(line: string, style: string): string {
  const cleanLine = line.replace(/[🎵🎤🎶👏]/g, '').trim()
  
  if (!cleanLine) return ''
  
  // Extrai palavras-chave para harmonização
  const words = cleanLine.split(/\s+/).filter(word => word.length > 2)
  const keyWords = words.slice(-2) // Últimas 2 palavras
  
  if (keyWords.length === 0) return ''
  
  switch (style) {
    case 'raiz':
      return `  (Harmonia: ${keyWords.join(' ')})`
      
    case 'universitário':
      return `  (Back vocal: ${keyWords.join(' ~ ')})`
      
    case 'moderno':
    default:
      return `  (🎤 ${keyWords.join(' ')})`
  }
}

/**
 * Adiciona marcações de instrumentação
 */
function addInstrumentation(lyrics: string, genre: string, style: string): string {
  const lines = lyrics.split('\n')
  const formattedLines: string[] = []
  
  let instrumentSectionAdded = false
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    formattedLines.push(line)
    
    // Adiciona instrumentação após o primeiro cabeçalho
    if (!instrumentSectionAdded && isSectionHeader(trimmed)) {
      const instrumentation = generateInstrumentation(genre, style)
      formattedLines.push(instrumentation)
      instrumentSectionAdded = true
    }
  }
  
  return formattedLines.join('\n')
}

/**
 * Gera marcação de instrumentação
 */
function generateInstrumentation(genre: string, style: string): string {
  const genreLower = genre.toLowerCase()
  
  if (genreLower.includes('raiz')) {
    return '  (Instrumentação: viola caipira, sanfona, violão)'
  }
  
  if (genreLower.includes('universitário')) {
    return '  (Instrumentação: violão, guitarra, bateria, baixo)'
  }
  
  // Sertanejo moderno padrão
  return '  (Instrumentação: violão, guitarra elétrica, bateria, baixo, teclado)'
}

/**
 * Adiciona dinâmica de performance
 */
function addPerformanceDynamics(lyrics: string, style: string): string {
  const lines = lyrics.split('\n')
  const formattedLines: string[] = []
  
  let inBridge = false
  let inFinalChorus = false
  let chorusCount = 0

  for (const line of lines) {
    const trimmed = line.trim()
    
    if (isSectionHeader(trimmed)) {
      // Conta refrões para dinâmica final
      if (isChorusSection(trimmed)) {
        chorusCount++
      }
      
      // Detecta ponte para intensidade
      inBridge = isBridgeSection(trimmed)
      
      // Detecta refrão final para climax
      if (isChorusSection(trimmed) && chorusCount >= 2) {
        inFinalChorus = true
      }
      
      formattedLines.push(line)
    } else if (trimmed && !trimmed.startsWith('(')) {
      // Adiciona dinâmica às linhas de letra
      const dynamicLine = addLineDynamics(line, inBridge, inFinalChorus, style)
      formattedLines.push(dynamicLine)
    } else {
      formattedLines.push(line)
    }
  }
  
  return formattedLines.join('\n')
}

/**
 * Verifica se é seção de ponte
 */
function isBridgeSection(section: string): boolean {
  const sectionLower = section.toLowerCase()
  return sectionLower.includes('bridge') || 
         sectionLower.includes('ponte') ||
         sectionLower.includes('clímax')
}

/**
 * Adiciona dinâmica a linha individual
 */
function addLineDynamics(line: string, inBridge: boolean, inFinalChorus: boolean, style: string): string {
  const cleanLine = line.replace(/[🎵🎤🎶👏]/g, '').trim()
  
  if (!cleanLine) return line
  
  if (inFinalChorus) {
    // Refrão final - mais intensidade
    return `🎶 ${cleanLine.toUpperCase()} 🎶`
  }
  
  if (inBridge) {
    // Ponte - construção emocional
    return `✨ ${cleanLine} ✨`
  }
  
  return line // Mantém original para versos normais
}

/**
 * Utilitário: Verifica se deve usar formatação de performance
 */
export function shouldUsePerformanceFormat(genre: string, performanceMode?: string): boolean {
  if (performanceMode === 'performance') return true
  if (performanceMode === 'standard') return false
  
  // Auto-detecta baseado no gênero
  const genreLower = genre.toLowerCase()
  return genreLower.includes('sertanejo') || 
         genreLower.includes('pagode') ||
         genreLower.includes('ao vivo')
}

/**
 * Remove formatação de performance (para edição)
 */
export function stripPerformanceFormatting(lyrics: string): string {
  return lyrics
    .replace(/[🎵🎤🎶👏✨🎸]/g, '') // Remove emojis
    .replace(/\(.*?\)/g, '') // Remove parênteses
    .replace(/\s+/g, ' ') // Normaliza espaços
    .replace(/\[(.*?)\]/g, '[$1]') // Limpa seções
    .trim()
}

export default {
  formatSertanejoPerformance,
  shouldUsePerformanceFormat,
  stripPerformanceFormatting
}
