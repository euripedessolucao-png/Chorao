// lib/validation/parser.ts

// Tipos
export type SectionType = "intro" | "verse" | "chorus" | "bridge" | "outro"

export interface ParsedSection {
  type: SectionType
  lines: string[]
  raw: string
}

// ✅ Interface 100% compatível com chorus-validator.ts
export interface ChorusOption {
  chorus: string;
  style: string;
  score: number;
  justification: string;
  lines: string[];
}

// Mapeamento de rótulos para tipos
const SECTION_LABELS: Record<string, SectionType> = {
  INTRO: "intro",
  INTRODUÇÃO: "intro",
  VERSE: "verse", 
  VERSO: "verse",
  "PART A": "verse",
  "PART A1": "verse",
  "PART A2": "verse",
  "PARTE A": "verse",
  CHORUS: "chorus",
  REFRÃO: "chorus",
  REFRAO: "chorus",
  "PART B": "chorus",
  "PARTE B": "chorus",
  BRIDGE: "bridge",
  PONTE: "bridge",
  "PART C": "bridge",
  "PARTE C": "bridge",
  SOLO: "bridge",
  OUTRO: "outro",
  FINAL: "outro",
}

// Regex melhorada para detectar seções
const SECTION_REGEX = /\[([^\]]+)\]([\s\S]*?)(?=\n\[|$)/g

// Regex para refrões
const CHORUS_REGEX = /\[(REFRÃO|REFRAO|CHORUS|PART B)\s*(\d*)\][\s\S]*?(?=\[|$)/gi

// Limpa e formata linhas de letra
function cleanLyricLines(text: string): string[] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => {
      // Remove linhas vazias, acordes, comentários, etc.
      return line && 
             line.length > 0 &&
             !line.startsWith('(') && 
             !line.endsWith(')') &&
             !line.match(/^[A-G][#b]?m?(7|9|11|13)?(\s|$)/) && // acordes
             !line.match(/^[xX]\s*\d+$/) && // repetições como "x2"
             !line.match(/^\/\//) && // comentários
             !line.match(/^\*/) && // marcadores
             line.length > 1 // linhas muito curtas provavelmente são acordes
    })
    .map(line => line.replace(/\(.*?\)/g, '').trim()) // remove parênteses
    .filter(line => line.length > 0) // remove linhas que ficaram vazias após limpeza
}

// Detecta o tipo de seção baseado no header
function detectSectionType(header: string): SectionType {
  const upperHeader = header.toUpperCase().trim()
  
  // Procura match exato primeiro
  for (const [label, sectionType] of Object.entries(SECTION_LABELS)) {
    if (upperHeader === label || upperHeader.includes(label)) {
      return sectionType
    }
  }
  
  // Fallbacks inteligentes
  if (upperHeader.match(/(INTRO|INTRODUÇÃO)/)) return "intro"
  if (upperHeader.match(/(VERSE|VERSO|PARTE? A)/)) return "verse"
  if (upperHeader.match(/(CHORUS|REFRAO|REFRÃO|PARTE? B)/)) return "chorus"
  if (upperHeader.match(/(BRIDGE|PONTE|SOLO|PARTE? C)/)) return "bridge"
  if (upperHeader.match(/(OUTRO|FINAL)/)) return "outro"
  
  // Default para verse se não conseguir identificar
  return "verse"
}

/**
 * Parseia seções completas de uma letra de música
 */
export function parseLyricSections(lyricText: string): ParsedSection[] {
  if (!lyricText?.trim()) return []
  
  const sections: ParsedSection[] = []
  const matches = [...lyricText.matchAll(SECTION_REGEX)]

  for (const match of matches) {
    const header = match[1].trim()
    const content = match[2].trim()
    
    if (!content) continue
    
    const type = detectSectionType(header)
    const lines = cleanLyricLines(content)
    
    if (lines.length > 0) {
      sections.push({
        type,
        lines,
        raw: match[0].trim()
      })
    }
  }

  return sections
}

/**
 * Parseia opções de refrão - 100% COMPATÍVEL com validateChorusBatch
 */
export function parseChorusOptions(text: string): ChorusOption[] {
  if (!text?.trim()) return []
  
  const matches = [...text.matchAll(CHORUS_REGEX)]
  const choruses: ChorusOption[] = []

  matches.forEach((match, index) => {
    const header = match[1]
    const number = match[2] ? parseInt(match[2]) : index + 1
    
    // Extrai e limpa o conteúdo
    const rawContent = match[0]
      .replace(new RegExp(`\\[${header}\\s*${number}\\]`, 'i'), '')
      .trim()
    
    const lines = cleanLyricLines(rawContent)
    
    if (lines.length > 0) {
      choruses.push({
        chorus: lines.join('\n'), // string completa para análise
        lines: lines, // array de linhas para validação detalhada
        style: 'sertanejo', // padrão
        score: 0, // será calculado pelo validador
        justification: '' // será preenchido pelo validador
      })
    }
  })

  return choruses
}

/**
 * Extrai apenas refrões de uma letra completa
 */
export function extractChorusesFromLyrics(lyricText: string): ChorusOption[] {
  const sections = parseLyricSections(lyricText)
  const chorusSections = sections.filter(section => section.type === "chorus")
  
  return chorusSections.map((section, index) => ({
    chorus: section.lines.join('\n'),
    lines: section.lines,
    style: 'sertanejo',
    score: 0,
    justification: ''
  }))
}

/**
 * Função utilitária para parsear texto misto (seções + refrões específicos)
 */
export function parseMixedContent(content: string): {
  sections: ParsedSection[],
  choruses: ChorusOption[]
} {
  return {
    sections: parseLyricSections(content),
    choruses: parseChorusOptions(content)
  }
}

/**
 * Valida se um texto contém estrutura básica de música
 */
export function hasBasicSongStructure(text: string): boolean {
  const sections = parseLyricSections(text)
  const hasVerse = sections.some(s => s.type === 'verse')
  const hasChorus = sections.some(s => s.type === 'chorus')
  
  return hasVerse && hasChorus && sections.length >= 2
}

/**
 * Conta estatísticas básicas da letra
 */
export function analyzeLyricStructure(lyricText: string) {
  const sections = parseLyricSections(lyricText)
  
  return {
    totalSections: sections.length,
    sectionBreakdown: sections.reduce((acc, section) => {
      acc[section.type] = (acc[section.type] || 0) + 1
      return acc
    }, {} as Record<SectionType, number>),
    totalLines: sections.reduce((sum, section) => sum + section.lines.length, 0),
    hasIntro: sections.some(s => s.type === 'intro'),
    hasBridge: sections.some(s => s.type === 'bridge'),
    hasOutro: sections.some(s => s.type === 'outro')
  }
}
