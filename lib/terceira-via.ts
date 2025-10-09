export interface TerceiraViaAnalysis {
  originalidade: number // 0-100
  profundidade_emocional: number // 0-100
  tecnica_compositiva: number // 0-100
  adequacao_genero: number // 0-100
  score_geral: number // 0-100
  sugestoes: string[]
  pontos_fortes: string[]
  pontos_fracos: string[]
}

export function analisarTerceiraVia(lyrics: string, genre: string, theme: string): TerceiraViaAnalysis {
  const sugestoes: string[] = []
  const pontos_fortes: string[] = []
  const pontos_fracos: string[] = []

  // Análise de originalidade
  const cliches = ["coração partido", "lágrimas no travesseiro", "noite sem luar", "amor eterno", "para sempre"]

  let clicheCount = 0
  cliches.forEach((cliche) => {
    if (lyrics.toLowerCase().includes(cliche)) {
      clicheCount++
      pontos_fracos.push(`Clichê detectado: "${cliche}"`)
    }
  })

  const originalidade = Math.max(0, 100 - clicheCount * 20)

  // Análise de profundidade emocional
  const emocoes_profundas = ["vulnerabilidade", "crescimento", "transformação", "libertação", "cura"]

  let profundidadeCount = 0
  emocoes_profundas.forEach((emocao) => {
    if (lyrics.toLowerCase().includes(emocao)) {
      profundidadeCount++
      pontos_fortes.push(`Emoção profunda: "${emocao}"`)
    }
  })

  const profundidade_emocional = Math.min(100, profundidadeCount * 25 + 50)

  // Análise técnica
  const lines = lyrics.split("\n").filter((line) => line.trim() && !line.startsWith("["))
  const hasRhyme = lines.length >= 2 && checkRhyme(lines[0], lines[1])
  const hasStructure = lyrics.includes("[VERSE") && lyrics.includes("[CHORUS")

  let tecnica = 50
  if (hasRhyme) {
    tecnica += 25
    pontos_fortes.push("Rimas bem estruturadas")
  }
  if (hasStructure) {
    tecnica += 25
    pontos_fortes.push("Estrutura clara e organizada")
  }

  // Adequação ao gênero
  const config = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS]
  let adequacao = 70

  if (config) {
    // Verificar se usa linguagem permitida
    const allowedWords = config.language_rules.allowed.phrases || []
    let allowedCount = 0
    allowedWords.forEach((phrase: string) => {
      if (lyrics.toLowerCase().includes(phrase.toLowerCase())) {
        allowedCount++
      }
    })

    if (allowedCount > 0) {
      adequacao = Math.min(100, 70 + allowedCount * 10)
      pontos_fortes.push(`Linguagem adequada ao gênero (${allowedCount} expressões típicas)`)
    }
  }

  // Score geral
  const score_geral = Math.round(originalidade * 0.3 + profundidade_emocional * 0.3 + tecnica * 0.2 + adequacao * 0.2)

  // Sugestões baseadas na análise
  if (originalidade < 70) {
    sugestoes.push("Evite clichês. Use imagens concretas e específicas do cotidiano brasileiro.")
  }
  if (profundidade_emocional < 70) {
    sugestoes.push("Aprofunde as emoções. Mostre vulnerabilidade e transformação genuínas.")
  }
  if (tecnica < 70) {
    sugestoes.push("Melhore a técnica: trabalhe rimas, métrica e estrutura das seções.")
  }
  if (adequacao < 70) {
    sugestoes.push(`Use mais expressões típicas do ${genre} para conectar com o público.`)
  }

  return {
    originalidade,
    profundidade_emocional,
    tecnica_compositiva: tecnica,
    adequacao_genero: adequacao,
    score_geral,
    sugestoes,
    pontos_fortes,
    pontos_fracos,
  }
}

function checkRhyme(line1: string, line2: string): boolean {
  const getLastWord = (line: string) => {
    const words = line.trim().split(/\s+/)
    return words[words.length - 1]?.toLowerCase().replace(/[^\wáàâãéèêíìîóòôõúùûç]/gi, "") || ""
  }

  const word1 = getLastWord(line1)
  const word2 = getLastWord(line2)

  if (!word1 || !word2) return false

  // Verificar se as últimas 2-3 letras são iguais (rima simples)
  const end1 = word1.slice(-3)
  const end2 = word2.slice(-3)

  return end1 === end2 || word1.slice(-2) === word2.slice(-2)
}

import { GENRE_CONFIGS } from "./genre-config"
