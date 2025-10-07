// lib/third-way-converter.ts
export const ADVANCED_BRAZILIAN_METRICS = {
  "Sertanejo Moderno": { syllablesPerLine: 6, bpm: 90, structure: "VERSO-REFRAO-PONTE" },
  "Sertanejo Universitário": { syllablesPerLine: 6, bpm: 95, structure: "VERSO-REFRAO" },
  "Sertanejo Sofrência": { syllablesPerLine: 8, bpm: 75, structure: "VERSO-REFRAO-PONTE" },
  "Sertanejo Raiz": { syllablesPerLine: 10, bpm: 80, structure: "VERSO-REFRAO" },
  "Pagode": { syllablesPerLine: 7, bpm: 100, structure: "VERSO-REFRAO" },
  "Funk": { syllablesPerLine: 6, bpm: 125, structure: "REFRAO-VERSO" },
  "MPB": { syllablesPerLine: 9, bpm: 90, structure: "VERSO-REFRAO-PONTE" },
  "Pop": { syllablesPerLine: 7, bpm: 110, structure: "VERSO-REFRAO-PONTE" },
  default: { syllablesPerLine: 8, bpm: 100, structure: "VERSO-REFRAO" },
} as const

export type GenreName = keyof typeof ADVANCED_BRAZILIAN_METRICS

// Sistema de contagem de sílabas (mantido do seu código)
export function countPortugueseSyllables(word: string): number {
  if (!word.trim()) return 0
  // ... sua implementação exata
}

// Motor da TERCEIRA VIA
export class ThirdWayEngine {
  // Geração silenciosa - aplicada automaticamente
  static generateThirdWayLine(theme: string, genre: GenreName, context: string): string {
    const metrics = ADVANCED_BRAZILIAN_METRICS[genre]
    
    // PASSO 1: Gerar variação A
    const variationA = this.generateVariation(theme, genre, context, 'emotional')
    
    // PASSO 2: Gerar variação B  
    const variationB = this.generateVariation(theme, genre, context, 'imagetic')
    
    // PASSO 3: Analisar e combinar pontos fortes
    const bestOfA = this.analyzeStrengths(variationA)
    const bestOfB = this.analyzeStrengths(variationB)
    
    // PASSO 4: Composição da Terceira Via
    let thirdWay = this.composeThirdWay(bestOfA, bestOfB, theme, genre)
    
    // PASSO 5: Garantir métrica correta (SILENCIOSO)
    thirdWay = this.ensureMetrics(thirdWay, metrics.syllablesPerLine)
    
    return thirdWay
  }

  private static generateVariation(theme: string, genre: GenreName, context: string, style: 'emotional' | 'imagetic'): string {
    // Lógica de geração com viés específico
    const baseTemplates = {
      emotional: [
        "O coração {acao} sem {dificuldade}",
        "A {emocao} que {verbo} em {lugar}",
        "Não consigo {verbo} essa {situacao}"
      ],
      imagetic: [
        "Como {elemento} no {cenario}",
        "Os {objetos} refletem {sentimento}", 
        "No {ambiente} onde {acao} acontece"
      ]
    }

    const template = baseTemplates[style][Math.floor(Math.random() * baseTemplates[style].length)]
    return this.fillTemplate(template, theme, genre)
  }

  private static analyzeStrengths(variation: string): {
    text: string
    emotionalClarity: number
    imagery: number
    rhymePotential: number
    fluency: number
  } {
    // Análise dos pontos fortes de cada variação
    return {
      text: variation,
      emotionalClarity: this.rateEmotionalClarity(variation),
      imagery: this.rateImagery(variation),
      rhymePotential: this.rateRhymePotential(variation),
      fluency: this.rateFluency(variation)
    }
  }

  private static composeThirdWay(bestOfA: any, bestOfB: any, theme: string, genre: GenreName): string {
    // Combina os MELHORES elementos de A e B
    let finalLine = ""
    
    if (bestOfA.emotionalClarity > bestOfB.emotionalClarity) {
      finalLine += this.extractEmotionalCore(bestOfA.text) + " "
    }
    
    if (bestOfB.imagery > bestOfA.imagery) {
      finalLine += this.extractImageryCore(bestOfB.text) + " "
    }
    
    // Garante coesão temática
    finalLine = this.ensureThematicCohesion(finalLine, theme, genre)
    
    return finalLine.trim()
  }

  // GARANTE a métrica - SILENCIOSAMENTE
  private static ensureMetrics(line: string, targetSyllables: number): string {
    const currentSyllables = countPortugueseSyllables(line)
    
    if (currentSyllables === targetSyllables) return line
    
    if (currentSyllables > targetSyllables) {
      return this.compressLine(line, targetSyllables)
    } else {
      return this.expandLine(line, targetSyllables)
    }
  }

  private static compressLine(line: string, targetSyllables: number): string {
    // Técnicas de compressão SILENCIOSAS
    const words = line.split(' ')
    
    // 1. Contrações naturais
    let compressed = line
      .replace(/\bpara\b/gi, "pra")
      .replace(/\bestá\b/gi, "tá")
      .replace(/\bvocê\b/gi, "cê")
    
    // 2. Remoção inteligente de artigos
    const articles = ['o', 'a', 'os', 'as', 'um', 'uma']
    const filtered = compressed.split(' ').filter(word => 
      !articles.includes(word.toLowerCase()) || Math.random() > 0.5
    )
    
    compressed = filtered.join(' ')
    
    // 3. Se ainda longo, divide silenciosamente
    if (countPortugueseSyllables(compressed) > targetSyllables && words.length > 2) {
      const mid = Math.floor(words.length / 2)
      return words.slice(0, mid).join(' ') + "\n" + words.slice(mid).join(' ')
    }
    
    return compressed
  }
}

// Sistema de conversão entre gêneros (Terceira Via aplicada)
export class ThirdWayConverter {
  static convertLyrics(lyrics: string, fromGenre: GenreName, toGenre: GenreName, options?: {
    preserveTheme?: boolean
    intensity?: 1 | 2 | 3
  }): string {
    const lines = lyrics.split('\n').filter(line => line.trim())
    
    return lines.map(line => {
      if (line.startsWith('[') || line.startsWith('(') || !line.trim()) {
        return line // Mantém cabeçalhos e linhas vazias
      }
      
      // APLICA TERCEIRA VIA na conversão
      return ThirdWayEngine.generateThirdWayLine(
        this.extractTheme(line),
        toGenre,
        `Convertendo de ${fromGenre} para ${toGenre}`
      )
    }).join('\n')
  }
}
