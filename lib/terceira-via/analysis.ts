import { getGenreConfig } from "../genre-config"
import { ADVANCED_BRAZILIAN_METRICS } from "./third-way-converter"
import { countPoeticSyllables } from "../validation/syllable-counter"

export interface TerceiraViaAnalysis {
  originalidade: number
  profundidade_emocional: number
  tecnica_compositiva: number
  adequacao_genero: number
  score_geral: number
  sugestoes: string[]
  pontos_fortes: string[]
  pontos_fracos: string[]
  metric_analysis: {
    syllable_compliance: number
    poetic_contractions: number
    genre_rhythm_match: number
    structural_integrity: number
  }
}

export function analisarMelodiaRitmo(
  lyrics: string,
  genre: string,
): {
  flow_score: number
  rhythmic_patterns: string[]
  melodic_suggestions: string[]
} {
  const lines = lyrics.split("\n").filter((line) => line.trim() && !line.startsWith("[") && !line.startsWith("("))

  let flow_score = 70
  const rhythmic_patterns: string[] = []
  const melodic_suggestions: string[] = []

  const syllablePatterns = lines.map((line) => countPoeticSyllables(line))
  const uniquePatterns = [...new Set(syllablePatterns)]

  if (uniquePatterns.length >= 3) {
    flow_score += 15
    rhythmic_patterns.push(`Variação rítmica boa: ${uniquePatterns.join("-")} sílabas`)
  } else {
    melodic_suggestions.push("Use mais variação no número de sílabas entre versos")
  }

  const poeticContractions = ["d'amor", "qu'eu", "s'eu", "meuamor", "tualma", "sualma"]

  let contractionCount = 0
  poeticContractions.forEach((contraction) => {
    if (lyrics.toLowerCase().includes(contraction)) {
      contractionCount++
    }
  })

  if (contractionCount > 0) {
    flow_score += 10
    rhythmic_patterns.push(`${contractionCount} contrações poéticas aplicadas`)
  }

  return {
    flow_score: Math.min(100, flow_score),
    rhythmic_patterns,
    melodic_suggestions,
  }
}

export function analisarTerceiraVia(lyrics: string, genre: string, theme: string): TerceiraViaAnalysis {
  const sugestoes: string[] = []
  const pontos_fortes: string[] = []
  const pontos_fracos: string[] = []

  const cliches = [
    "coração partido",
    "lágrimas no travesseiro",
    "noite sem luar",
    "amor eterno",
    "para sempre",
    "meu mundo desabou",
    "vazio na alma",
    "dor no peito",
    "solidão imensa",
    "saudade mata",
    "fim do mundo",
    "sem rumo",
    "perdido",
    "não aguento mais",
    "vida sem sentido",
    "noite fria",
    "coração na mão",
    "alma gêmea",
    "destino cruel",
    "prisioneiro do amor",
    "escravo dos sentimentos",
  ]

  let clicheCount = 0
  cliches.forEach((cliche) => {
    if (lyrics.toLowerCase().includes(cliche)) {
      clicheCount++
      pontos_fracos.push(`Clichê detectado: "${cliche}"`)
    }
  })

  const originalidade = Math.max(0, 100 - clicheCount * 12)

  const emocoes_profundas = [
    "vulnerabilidade",
    "crescimento",
    "transformação",
    "libertação",
    "cura",
    "aceitação",
    "aprendizado",
    "superação",
    "renascimento",
    "evolução",
    "entendimento",
    "maturidade",
    "resiliência",
    "coragem",
    "verdade",
    "autenticidade",
    "consciência",
    "presença",
    "integridade",
  ]

  const imagens_concretas = [
    "café esfriou",
    "porta fechada",
    "foto desbotada",
    "sofá vazio",
    "telefone mudo",
    "janela aberta",
    "chuva no vidro",
    "relógio parado",
    "copo sujo",
    "livro aberto",
    "escada escura",
    "elevador quebrado",
    "ônibus errado",
    "calçada molhada",
    "luz amarela",
    "vento na varanda",
    "cheiro de terra",
    "sombra no corredor",
  ]

  let profundidadeCount = 0
  let imagensCount = 0

  emocoes_profundas.forEach((emocao) => {
    if (lyrics.toLowerCase().includes(emocao)) {
      profundidadeCount++
      pontos_fortes.push(`Emoção profunda: "${emocao}"`)
    }
  })

  imagens_concretas.forEach((imagem) => {
    if (lyrics.toLowerCase().includes(imagem)) {
      imagensCount++
      pontos_fortes.push(`Imagem concreta: "${imagem}"`)
    }
  })

  const profundidade_emocional = Math.min(100, profundidadeCount * 12 + imagensCount * 8 + 40)

  const lines = lyrics
    .split("\n")
    .filter((line) => line.trim() && !line.startsWith("[") && !line.startsWith("(") && !line.includes("Instruments:"))

  const hasRhyme = lines.length >= 2 && checkAdvancedRhyme(lines[0], lines[1])
  const hasStructure = lyrics.includes("[VERSE") && lyrics.includes("[CHORUS")
  const hasBridge = lyrics.includes("[BRIDGE")
  const syllableCompliance = calculateSyllableCompliance(lines, genre)

  let tecnica = 50
  if (hasRhyme) {
    tecnica += 15
    pontos_fortes.push("Rimas bem estruturadas")
  }

  if (hasStructure) {
    tecnica += 15
    pontos_fortes.push("Estrutura clara e organizada")
  }

  if (hasBridge) {
    tecnica += 10
    pontos_fortes.push("Presença de ponte/desenvolvimento")
  }

  tecnica += Math.round(syllableCompliance * 10)

  const melodiaRitmo = analisarMelodiaRitmo(lyrics, genre)
  tecnica = Math.min(100, tecnica + Math.round((melodiaRitmo.flow_score - 70) / 3))

  const config = getGenreConfig(genre)
  let adequacao = 70

  const genreMetrics = ADVANCED_BRAZILIAN_METRICS[genre as keyof typeof ADVANCED_BRAZILIAN_METRICS]
  if (genreMetrics) {
    const avgSyllables = lines.reduce((sum, line) => sum + countPoeticSyllables(line), 0) / lines.length
    const targetSyllables = genreMetrics.syllablesPerLine

    if (Math.abs(avgSyllables - targetSyllables) <= 2) {
      adequacao += 15
      pontos_fortes.push(`Métrica perfeita para ${genre} (${avgSyllables.toFixed(1)} sílabas/verso)`)
    }
  }

  const score_geral = Math.round(originalidade * 0.25 + profundidade_emocional * 0.3 + tecnica * 0.25 + adequacao * 0.2)

  if (originalidade < 75) {
    sugestoes.push("🎯 Substitua clichês por observações pessoais únicas da sua experiência")
  }

  if (profundidade_emocional < 75) {
    sugestoes.push("💫 Explore emoções mais complexas: vulnerabilidade, transformação, cura")
  }

  if (tecnica < 75) {
    sugestoes.push("🎵 Trabalhe estrutura (verso-refrão-ponte) e rimas internas")
  }

  melodiaRitmo.melodic_suggestions.forEach((suggestion) => {
    sugestoes.push(suggestion)
  })

  return {
    originalidade,
    profundidade_emocional,
    tecnica_compositiva: tecnica,
    adequacao_genero: adequacao,
    score_geral,
    sugestoes,
    pontos_fortes,
    pontos_fracos,
    metric_analysis: {
      syllable_compliance: Math.round(syllableCompliance * 100),
      poetic_contractions: melodiaRitmo.flow_score,
      genre_rhythm_match: adequacao,
      structural_integrity: tecnica,
    },
  }
}

function checkAdvancedRhyme(line1: string, line2: string): boolean {
  const getLastStressedSyllable = (line: string): string => {
    const words = line.trim().split(/\s+/)
    const lastWord = words[words.length - 1]?.toLowerCase().replace(/[^\wáàâãéèêíìîóòôõúùûç]/gi, "") || ""

    if (!lastWord) return ""

    if (lastWord.match(/[áàâãéèêíìîóòôõúùû]/)) {
      return lastWord
    }

    if (lastWord.length <= 3 || lastWord.match(/[rsz]$/i)) {
      return lastWord.slice(-2)
    }

    return lastWord.slice(-3, -1)
  }

  const rhyme1 = getLastStressedSyllable(line1)
  const rhyme2 = getLastStressedSyllable(line2)

  if (!rhyme1 || !rhyme2) return false

  return (
    rhyme1 === rhyme2 ||
    rhyme1.slice(-2) === rhyme2.slice(-2) ||
    rhyme1.replace(/[^aeiou]/gi, "") === rhyme2.replace(/[^aeiou]/gi, "")
  )
}

function calculateSyllableCompliance(lines: string[], genre: string): number {
  if (lines.length === 0) return 0

  const genreMetrics = ADVANCED_BRAZILIAN_METRICS[genre as keyof typeof ADVANCED_BRAZILIAN_METRICS]
  if (!genreMetrics) return 0.7

  const compliantLines = lines.filter((line) => {
    const syllables = countPoeticSyllables(line)
    return syllables >= genreMetrics.syllablesPerLine - 2 && syllables <= genreMetrics.maxSyllables
  })

  return compliantLines.length / lines.length
}

export function analisarTendenciasCompositivas(
  lyricsArray: string[],
  genre: string,
): {
  cliches_comuns: string[]
  pontos_evolucao: string[]
  estilo_identificado: string
} {
  const allLyrics = lyricsArray.join(" ").toLowerCase()

  const cliches_comuns = [
    "coração partido",
    "lágrimas",
    "noite sem luar",
    "amor eterno",
    "para sempre",
    "vazio",
    "solidão",
    "saudade",
    "dor no peito",
  ].filter((cliche) => allLyrics.includes(cliche))

  const pontos_evolucao: string[] = []

  if (cliches_comuns.length > 2) {
    pontos_evolucao.push("Forte dependência de clichês emocionais")
  }

  const imagens_presentes = ["café", "porta", "janela", "chuva", "sofá", "foto", "telefone", "rua"].filter((imagem) =>
    allLyrics.includes(imagem),
  )

  if (imagens_presentes.length >= 3) {
    pontos_evolucao.push("Bom uso de imagens concretas do cotidiano")
  }

  const estilo_identificado =
    cliches_comuns.length > 3 ? "Tradicional" : imagens_presentes.length > 4 ? "Terceira Via" : "Misto"

  return {
    cliches_comuns,
    pontos_evolucao,
    estilo_identificado,
  }
}
