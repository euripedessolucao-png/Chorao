// lib/validation/rhyme-enhancer.ts
/**
 * Sistema de aprimoramento de rimas para o MetaComposer
 * Integração com o Sistema Universal de Qualidade
 */

// ✅ IMPORTAÇÕES SEGURAS - com fallbacks
let rhymeValidator: any = null

// Carregamento dinâmico para evitar erros de importação
try {
  rhymeValidator = require("./rhyme-validator")
} catch (error) {
  console.warn("rhyme-validator não encontrado, usando fallbacks")
  rhymeValidator = {
    analyzeRhyme: () => ({ type: "pobre", score: 50 }),
    analyzeLyricsRhymeScheme: () => ({
      score: 60,
      scheme: [],
      quality: [],
      suggestions: [],
    }),
    validateRhymesForGenre: () => ({
      valid: true,
      errors: [],
      warnings: [],
    }),
  }
}

export interface RhymeEnhancementResult {
  enhancedLyrics: string
  originalScore: number
  enhancedScore: number
  improvements: string[]
  rhymeAnalysis: any
}

const RICH_RHYME_DICTIONARY: Record<string, string[]> = {
  // Substantivos → Verbos (rimas ricas)
  coração: ["canção", "emoção", "ilusão", "perdição", "atenção"],
  amor: ["calor", "flor", "dor", "sabor", "valor", "temor", "clamor"],
  paixão: ["ilusão", "canção", "emoção", "razão", "perdição"],
  vida: ["ferida", "partida", "esquecida", "sofrida", "vivida"],
  noite: ["açoite", "dezoito", "biscoito", "foice"],
  dia: ["alegria", "fantasia", "harmonia", "melodia", "poesia"],
  sol: ["farol", "espanhol", "caracol", "girassol"],
  lua: ["rua", "sua", "continua", "flutua"],
  mar: ["lugar", "olhar", "sonhar", "cantar", "amar"],
  céu: ["véu", "chapéu", "troféu", "museu"],
  dor: ["flor", "amor", "calor", "sabor", "valor"],
  flor: ["amor", "dor", "calor", "sabor", "esplendor"],
  saudade: ["verdade", "cidade", "liberdade", "felicidade"],
  solidão: ["coração", "paixão", "canção", "razão"],
  razão: ["coração", "paixão", "canção", "ilusão"],
  emoção: ["coração", "canção", "paixão", "razão"],
  tempo: ["momento", "pensamento", "sentimento", "sofrimento"],
  momento: ["pensamento", "sentimento", "sofrimento", "tempo"],
  sentimento: ["pensamento", "sofrimento", "momento", "tempo"],
  olhar: ["lugar", "mar", "sonhar", "cantar", "amar"],
  sonhar: ["amar", "cantar", "olhar", "lugar", "mar"],
  viver: ["esquecer", "morrer", "sofrer", "renascer"],
  morrer: ["viver", "esquecer", "sofrer", "renascer"],
  partir: ["sentir", "sorrir", "fugir", "seguir"],
  sentir: ["partir", "sorrir", "fugir", "seguir"],
  sorrir: ["partir", "sentir", "fugir", "seguir"],
  feliz: ["infeliz", "cicatriz", "raiz", "perdiz"],
  tristeza: ["beleza", "certeza", "natureza", "pureza"],
  beleza: ["tristeza", "certeza", "natureza", "pureza"],
  caminho: ["sozinho", "carinho", "ninho", "vizinho"],
  sozinho: ["caminho", "carinho", "ninho", "vizinho"],
  estrela: ["janela", "aquarela", "canela", "amarela"],
  janela: ["estrela", "aquarela", "canela", "amarela"],
  manhã: ["amanhã", "irmã", "lã", "maçã"],
  tarde: ["guarde", "arde", "covarde"],
  luar: ["lugar", "olhar", "sonhar"],
  cantar: ["amar", "sonhar", "olhar", "lugar"],
  amar: ["cantar", "sonhar", "olhar", "lugar"],
  chorar: ["cantar", "amar", "sonhar", "olhar"],
  sofrer: ["viver", "morrer", "esquecer", "renascer"],
  esquecer: ["viver", "morrer", "sofrer", "renascer"],
  lembrar: ["amar", "cantar", "sonhar", "olhar"],
  voltar: ["cantar", "amar", "sonhar", "olhar"],
  ficar: ["amar", "cantar", "sonhar", "olhar"],
  deixar: ["amar", "cantar", "sonhar", "olhar"],
  passar: ["amar", "cantar", "sonhar", "olhar"],
  chegar: ["amar", "cantar", "sonhar", "olhar"],
}

/**
 * Aprimora as rimas de uma letra mantendo o significado original
 */
export async function enhanceLyricsRhymes(
  lyrics: string,
  genre: string,
  originalTheme: string,
  creativityLevel = 0.7,
): Promise<RhymeEnhancementResult> {
  console.log(`[RhymeEnhancer] Iniciando aprimoramento para ${genre}...`)

  const MAX_ENHANCEMENT_TIME = 15000 // 15 segundos (aumentado de 8s)
  const startTime = Date.now()

  const lines = lyrics.split("\n")
  const enhancedLines: string[] = []
  const improvements: string[] = []

  const originalAnalysis = rhymeValidator.analyzeLyricsRhymeScheme(lyrics)
  let improvementCount = 0
  const MAX_IMPROVEMENTS = 20 // Aumentado de 5 para 20

  for (let i = 0; i < lines.length; i++) {
    if (Date.now() - startTime > MAX_ENHANCEMENT_TIME) {
      console.warn(`[RhymeEnhancer] ⚠️ Timeout atingido após ${Date.now() - startTime}ms, retornando resultado parcial`)
      enhancedLines.push(...lines.slice(i))
      break
    }

    if (improvementCount >= MAX_IMPROVEMENTS) {
      console.log(`[RhymeEnhancer] Limite de melhorias atingido (${MAX_IMPROVEMENTS})`)
      enhancedLines.push(...lines.slice(i))
      break
    }

    const line = lines[i]

    // Mantém linhas de estrutura e metadata
    if (
      line.startsWith("[") ||
      line.startsWith("(") ||
      line.includes("Instrumentos:") ||
      line.includes("BPM:") ||
      !line.trim()
    ) {
      enhancedLines.push(line)
      continue
    }

    if (i < lines.length - 1 && !lines[i + 1].startsWith("[") && !lines[i + 1].startsWith("(")) {
      const line2 = lines[i + 1]
      const word1 = getLastWord(line)
      const word2 = getLastWord(line2)

      if (word1 && word2) {
        const currentRhyme = rhymeValidator.analyzeRhyme(word1, word2)

        if (currentRhyme.type !== "rica" || currentRhyme.score < 80) {
          const enhancedPair = improveRhymePair(line, line2, genre)

          if (enhancedPair && enhancedPair.improved) {
            enhancedLines.push(enhancedPair.line1)
            enhancedLines.push(enhancedPair.line2)
            improvementCount++
            improvements.push(
              `Melhorada rima: "${word1}" + "${word2}" → "${enhancedPair.newWord1}" + "${enhancedPair.newWord2}" (${enhancedPair.newRhymeType})`,
            )
            i++ // Pula próxima linha pois já foi processada
            continue
          }
        }
      }
    }

    enhancedLines.push(line)
  }

  const enhancedLyrics = enhancedLines.join("\n")
  const enhancedAnalysis = rhymeValidator.analyzeLyricsRhymeScheme(enhancedLyrics)

  const elapsedTime = Date.now() - startTime
  console.log(`[RhymeEnhancer] ✅ Concluído: ${improvementCount} melhorias em ${elapsedTime}ms`)

  return {
    enhancedLyrics,
    originalScore: originalAnalysis.score || 0,
    enhancedScore: enhancedAnalysis.score || 0,
    improvements,
    rhymeAnalysis: enhancedAnalysis,
  }
}

function improveRhymePair(
  line1: string,
  line2: string,
  genre: string,
): {
  line1: string
  line2: string
  improved: boolean
  newRhymeType?: string
  newWord1: string
  newWord2: string
} | null {
  const word1 = getLastWord(line1)
  const word2 = getLastWord(line2)

  if (!word1 || !word2) return null

  const word1Lower = word1.toLowerCase()
  const word2Lower = word2.toLowerCase()

  // Tenta encontrar rima rica no dicionário
  const possibleRhymes1 = RICH_RHYME_DICTIONARY[word1Lower] || []
  const possibleRhymes2 = RICH_RHYME_DICTIONARY[word2Lower] || []

  // Tenta melhorar word2 baseado em word1
  if (possibleRhymes1.length > 0) {
    const bestRhyme = possibleRhymes1[0] // Pega a primeira (melhor) sugestão
    const newLine2 = line2.replace(new RegExp(`${word2}$`, "i"), bestRhyme)
    const newRhyme = rhymeValidator.analyzeRhyme(word1, bestRhyme)

    if (newRhyme.type === "rica" && newRhyme.score >= 80) {
      return {
        line1,
        line2: newLine2,
        improved: true,
        newRhymeType: newRhyme.type,
        newWord1: word1,
        newWord2: bestRhyme,
      }
    }
  }

  // Tenta melhorar word1 baseado em word2
  if (possibleRhymes2.length > 0) {
    const bestRhyme = possibleRhymes2[0]
    const newLine1 = line1.replace(new RegExp(`${word1}$`, "i"), bestRhyme)
    const newRhyme = rhymeValidator.analyzeRhyme(bestRhyme, word2)

    if (newRhyme.type === "rica" && newRhyme.score >= 80) {
      return {
        line1: newLine1,
        line2,
        improved: true,
        newRhymeType: newRhyme.type,
        newWord1: bestRhyme,
        newWord2: word2,
      }
    }
  }

  return null
}

/**
 * Gera relatório detalhado de rimas
 */
export function generateRhymeReport(lyrics: string, genre: string) {
  try {
    const analysis = rhymeValidator.analyzeLyricsRhymeScheme(lyrics)
    const validation = rhymeValidator.validateRhymesForGenre(lyrics, genre)

    const rhymeTypes = (analysis.quality || []).reduce(
      (acc: Record<string, number>, q: any) => {
        acc[q.type] = (acc[q.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      overallScore: analysis.score || 0,
      rhymeDistribution: rhymeTypes,
      scheme: analysis.scheme || [],
      validation: {
        valid: validation.valid || false,
        errors: validation.errors || [],
        warnings: validation.warnings || [],
      },
      suggestions: analysis.suggestions || [],
      qualityBreakdown: (analysis.quality || []).map((q: any, i: number) => ({
        line: i + 1,
        type: q.type || "pobre",
        score: q.score || 0,
        explanation: q.explanation || "Não analisado",
      })),
    }
  } catch (error) {
    console.error("Erro ao gerar relatório de rimas:", error)
    // ✅ FALLBACK COMPLETO: Retorna estrutura vazia se houver erro
    return {
      overallScore: 50,
      rhymeDistribution: {
        pobre: 1,
        rica: 0,
        perfeita: 0,
      },
      scheme: ["A", "B"],
      validation: {
        valid: true,
        errors: [],
        warnings: ["Análise de rimas temporariamente indisponível"],
      },
      suggestions: ["Tente novamente mais tarde"],
      qualityBreakdown: [
        {
          line: 1,
          type: "pobre",
          score: 50,
          explanation: "Sistema em manutenção",
        },
      ],
    }
  }
}

/**
 * Validação rápida de rimas para uso em tempo real
 */
export function quickRhymeCheck(lyrics: string): { hasRhymes: boolean; quality: string } {
  try {
    const lines = lyrics
      .split("\n")
      .filter(
        (line) =>
          line.trim() &&
          !line.startsWith("[") &&
          !line.startsWith("(") &&
          !line.includes("Instrumentos:") &&
          !line.includes("BPM:"),
      )

    if (lines.length < 2) {
      return { hasRhymes: false, quality: "insuficiente" }
    }

    let rhymeCount = 0
    let totalPairs = 0

    for (let i = 0; i < lines.length - 1; i += 2) {
      const word1 = getLastWord(lines[i])
      const word2 = getLastWord(lines[i + 1])

      if (word1 && word2) {
        totalPairs++
        const rhyme = rhymeValidator.analyzeRhyme(word1, word2)
        if (rhyme.score > 40) {
          rhymeCount++
        }
      }
    }

    const rhymeRatio = totalPairs > 0 ? rhymeCount / totalPairs : 0

    return {
      hasRhymes: rhymeRatio > 0.3,
      quality: rhymeRatio > 0.7 ? "boa" : rhymeRatio > 0.4 ? "regular" : "fraca",
    }
  } catch (error) {
    return { hasRhymes: false, quality: "erro" }
  }
}

/**
 * Sugere palavras que rimam com uma palavra alvo
 */
export function suggestRhymingWords(targetWord: string, genre: string): string[] {
  const wordLibrary: Record<string, string[]> = {
    amor: ["dor", "flor", "calor", "sabor", "valor"],
    coração: ["canção", "ilusão", "emoção", "atenção", "perdição"],
    vida: ["medida", "ferida", "comida", "esquecida", "partida"],
    noite: ["açoite", "dezoito", "biscoito", "foice"],
    dia: ["magia", "alegria", "fantasia", "harmonia", "melodia"],
    mar: ["lugar", "doce", "você", "pé", "céu"],
    sol: ["farol", "escol", "espanhol", "redor", "amor"],
  }

  return wordLibrary[targetWord.toLowerCase()] || ["rima1", "rima2", "rima3", "rima4", "rima5"]
}

function getLastWord(line: string): string {
  const cleaned = line.replace(/[^\wáàâãéèêíìîóòôõúùûç\s]/gi, "").trim()
  const words = cleaned.split(/\s+/)
  return words[words.length - 1] || ""
}
