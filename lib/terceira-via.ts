import { generateText } from "ai"
import { getGenreConfig } from "./genre-config"

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

// ✅ CONFIGURAÇÕES POR GÊNERO PARA ANÁLISE
const GENRE_CONFIGS = {
  "Sertanejo": {
    language_rules: {
      allowed: {
        phrases: ["cê", "tô", "pra", "tá", "né", "uai", "bah", "meu bem", "moço", "morena"]
      },
      avoided: {
        phrases: ["palavrões pesados", "gírias muito regionais", "termos técnicos"]
      }
    }
  },
  "Sertanejo Moderno": {
    language_rules: {
      allowed: {
        phrases: ["cê", "tô", "pra", "tá", "né", "festa", "balada", "zap", "rede social"]
      },
      avoided: {
        phrases: ["linguagem muito formal", "termos antiquados"]
      }
    }
  },
  "MPB": {
    language_rules: {
      allowed: {
        phrases: ["vida", "tempo", "mar", "rio", "vento", "luz", "sombra", "caminho"]
      },
      avoided: {
        phrases: ["gírias muito modernas", "termos muito coloquiais"]
      }
    }
  },
  "Funk": {
    language_rules: {
      allowed: {
        phrases: ["baila", "curte", "faz", "vem", "vai", "chama", "solta", "bota"]
      },
      avoided: {
        phrases: ["linguagem formal", "termos poéticos complexos"]
      }
    }
  },
  "default": {
    language_rules: {
      allowed: {
        phrases: ["cê", "tô", "pra", "vida", "coração", "tempo"]
      },
      avoided: {
        phrases: ["clichês", "linguagem muito complexa"]
      }
    }
  }
}

export function analisarTerceiraVia(lyrics: string, genre: string, theme: string): TerceiraViaAnalysis {
  const sugestoes: string[] = []
  const pontos_fortes: string[] = []
  const pontos_fracos: string[] = []

  // ✅ ANÁLISE DE ORIGINALIDADE
  const cliches = [
    "coração partido", "lágrimas no travesseiro", "noite sem luar", "amor eterno", 
    "para sempre", "meu mundo desabou", "vazio na alma", "dor no peito",
    "solidão imensa", "saudade mata", "fim do mundo", "sem rumo", "perdido",
    "não aguento mais", "vida sem sentido", "noite fria", "coração na mão"
  ]

  let clicheCount = 0
  cliches.forEach((cliche) => {
    if (lyrics.toLowerCase().includes(cliche)) {
      clicheCount++
      pontos_fracos.push(`Clichê detectado: "${cliche}"`)
    }
  })

  const originalidade = Math.max(0, 100 - (clicheCount * 15))

  // ✅ ANÁLISE DE PROFUNDIDADE EMOCIONAL
  const emocoes_profundas = [
    "vulnerabilidade", "crescimento", "transformação", "libertação", "cura",
    "aceitação", "aprendizado", "superação", "renascimento", "evolução",
    "entendimento", "maturidade", "resiliência", "coragem", "verdade"
  ]

  const imagens_concretas = [
    "café esfriou", "porta fechada", "foto desbotada", "sofá vazio", "telefone mudo",
    "janela aberta", "chuva no vidro", "relógio parado", "copo sujo", "livro aberto",
    "escada escura", "elevador quebrado", "ônibus errado", "calçada molhada"
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

  const profundidade_emocional = Math.min(100, (profundidadeCount * 15) + (imagensCount * 10) + 30)

  // ✅ ANÁLISE TÉCNICA COMPOSITIVA
  const lines = lyrics.split("\n").filter((line) => 
    line.trim() && 
    !line.startsWith("[") && 
    !line.startsWith("(") &&
    !line.includes("Instruments:")
  )

  const hasRhyme = lines.length >= 2 && checkRhyme(lines[0], lines[1])
  const hasStructure = lyrics.includes("[VERSE") && lyrics.includes("[CHORUS")
  const hasVariation = lines.length >= 8 // Mínimo de versos para ter variação

  let tecnica = 40 // Base
  if (hasRhyme) {
    tecnica += 20
    pontos_fortes.push("Rimas bem estruturadas")
  } else {
    pontos_fracos.push("Rimas fracas ou ausentes")
  }

  if (hasStructure) {
    tecnica += 20
    pontos_fortes.push("Estrutura clara e organizada")
  } else {
    pontos_fracos.push("Estrutura musical indefinida")
  }

  if (hasVariation) {
    tecnica += 20
    pontos_fortes.push("Desenvolvimento narrativo adequado")
  } else {
    pontos_fracos.push("Pouca variação temática")
  }

  // ✅ ADEQUAÇÃO AO GÊNERO
  const config = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS] || GENRE_CONFIGS.default
  let adequacao = 60 // Base

  // Verificar se usa linguagem permitida
  const allowedWords = config.language_rules.allowed.phrases || []
  let allowedCount = 0
  allowedWords.forEach((phrase: string) => {
    if (lyrics.toLowerCase().includes(phrase.toLowerCase())) {
      allowedCount++
    }
  })

  if (allowedCount > 0) {
    adequacao = Math.min(100, 60 + (allowedCount * 8))
    pontos_fortes.push(`Linguagem adequada ao ${genre} (${allowedCount} expressões típicas)`)
  } else {
    pontos_fracos.push(`Pouca conexão com linguagem do ${genre}`)
  }

  // ✅ SCORE GERAL (PONDERAÇÃO INTELIGENTE)
  const score_geral = Math.round(
    originalidade * 0.25 + 
    profundidade_emocional * 0.30 + 
    tecnica * 0.25 + 
    adequacao * 0.20
  )

  // ✅ SUGESTÕES BASEADAS NA ANÁLISE
  if (originalidade < 70) {
    sugestoes.push("🔧 Evite clichês. Use imagens concretas e específicas do cotidiano brasileiro.")
  }
  
  if (profundidade_emocional < 70) {
    sugestoes.push("💫 Aprofunde as emoções. Mostre vulnerabilidade e transformação genuínas.")
  }
  
  if (tecnica < 70) {
    sugestoes.push("🎵 Melhore a técnica: trabalhe rimas, métrica e estrutura das seções.")
  }
  
  if (adequacao < 70) {
    sugestoes.push(`🎯 Use mais expressões típicas do ${genre} para conectar com o público.`)
  }

  // ✅ SUGESTÕES ESPECÍFICAS BASEADAS NOS PONTOS FRACOS
  if (pontos_fracos.some(p => p.includes("Clichê"))) {
    sugestoes.push("✨ Substitua clichês por observações pessoais únicas da sua experiência.")
  }

  if (pontos_fracos.some(p => p.includes("Rimas"))) {
    sugestoes.push("📝 Experimente rimas internas e assonâncias para maior naturalidade.")
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

// ✅ VERIFICAÇÃO DE RIMAS MELHORADA
function checkRhyme(line1: string, line2: string): boolean {
  const getLastWord = (line: string) => {
    const words = line.trim().split(/\s+/)
    const lastWord = words[words.length - 1]?.toLowerCase().replace(/[^\wáàâãéèêíìîóòôõúùûç]/gi, "") || ""
    return lastWord
  }

  const word1 = getLastWord(line1)
  const word2 = getLastWord(line2)

  if (!word1 || !word2 || word1.length < 2 || word2.length < 2) return false

  // ✅ RIMA RICA (últimas 3 letras iguais)
  const end1 = word1.slice(-3)
  const end2 = word2.slice(-3)

  // ✅ RIMA MÉDIA (últimas 2 letras iguais)  
  const end1_2 = word1.slice(-2)
  const end2_2 = word2.slice(-2)

  // ✅ ASSONÂNCIA (vogais finais similares)
  const vowels1 = word1.replace(/[^aeiouáàâãéèêíìîóòôõúùû]/gi, '').slice(-2)
  const vowels2 = word2.replace(/[^aeiouáàâãéèêíìîóòôõúùû]/gi, '').slice(-2)

  return end1 === end2 || end1_2 === end2_2 || vowels1 === vowels2
}

// ✅ APLICAÇÃO DA TERCEIRA VIA EM LINHAS ESPECÍFICAS
export async function applyTerceiraViaToLine(
  line: string,
  index: number,
  context: string,
  isPerformanceMode: boolean,
  additionalRequirements?: string,
): Promise<string> {
  // Skip structural markers and empty lines
  if (!line.trim() || line.startsWith("[") || line.startsWith("(") || line.includes("Instruments:")) {
    return line
  }

  // Skip if line is already well-formed
  if (line.length > 50 || line.match(/[.!?;:]$/)) {
    return line
  }

  try {
    console.log(`[TerceiraVia] 🔧 Aplicando na linha ${index}: "${line.substring(0, 40)}..."`)

    // ✅ DETECTA SE PRECISA DE MELHORIA
    const cliches = [
      "coração partido", "lágrimas no travesseiro", "noite sem luar", "amor eterno", 
      "para sempre", "meu mundo desabou", "vazio na alma", "dor no peito",
      "solidão imensa", "saudade mata", "fim do mundo", "sem rumo"
    ]

    let needsImprovement = false
    for (const cliche of cliches) {
      if (line.toLowerCase().includes(cliche)) {
        needsImprovement = true
        console.log(`[TerceiraVia] 🚨 Clichê detectado: "${cliche}"`)
        break
      }
    }

    // ✅ TAMBÉM VERIFICA LINHAS MUITO CURTAS/GENÉRICAS
    if (!needsImprovement && (line.length < 15 || line.split(' ').length < 3)) {
      needsImprovement = true
      console.log(`[TerceiraVia] 📏 Linha muito curta/genérica: "${line}"`)
    }

    if (!needsImprovement) {
      console.log(`[TerceiraVia] ✅ Linha ${index} não precisa de melhoria`)
      return line
    }

    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout na Terceira Via")), 8000),
    )

    // ✅ PROMPT AVANÇADO PARA TERCEIRA VIA
    const prompt = `TERCEIRA VIA - COMPOSIÇÃO INTELIGENTE

LINHA ORIGINAL: "${line}"
CONTEXTO: ${context}
${additionalRequirements ? `REQUISITOS: ${additionalRequirements}` : ''}

PRINCÍPIOS DA TERCEIRA VIA:
🎯 EVITE: Clichês, abstrações vagas, frases genéricas
🎯 USE: Imagens concretas do cotidiano brasileiro, observações pessoais únicas
🎯 MANTENHA: Métrica natural, linguagem coloquial autêntica
🎯 FOCO: Verdade emocional, vulnerabilidade genuína, transformação

EXEMPLOS DE MELHORIA:
❌ "Meu coração está partido" 
✅ "O café da manhã ficou na mesa, frio"

❌ "Estou perdido na vida"
✅ "Pego o ônibus errado toda manhã sem querer"

❌ "A solidão me consome"  
✅ "A TV fica ligada na sala vazia até amanhecer"

Reescreva APENAS esta linha aplicando os princípios da Terceira Via.
Retorne SOMENTE a linha reescita, sem explicações:`

    const aiPromise = generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.7,
    })

    const { text } = (await Promise.race([aiPromise, timeoutPromise])) as { text: string }

    const improvedLine = text.trim()
      .replace(/^["']|["']$/g, "")
      .replace(/^.*?:/, "") // Remove prefixos
      .split('\n')[0] // Pega apenas primeira linha

    console.log(`[TerceiraVia] ✅ Linha ${index} melhorada: "${improvedLine}"`)
    return improvedLine || line

  } catch (error) {
    console.error(`[TerceiraVia] ❌ Erro na linha ${index}:`, error)
    return line
  }
}

// ✅ ANALISADOR DE TENDÊNCIAS PARA MÚLTIPLAS LETRAS
export function analisarTendenciasCompositivas(lyricsArray: string[], genre: string): {
  cliches_comuns: string[]
  pontos_evolucao: string[]
  estilo_identificado: string
} {
  const allLyrics = lyricsArray.join(' ').toLowerCase()
  
  const cliches_comuns = [
    "coração partido", "lágrimas", "noite sem luar", "amor eterno", 
    "para sempre", "vazio", "solidão", "saudade", "dor no peito"
  ].filter(cliche => allLyrics.includes(cliche))

  const pontos_evolucao: string[] = []
  
  if (cliches_comuns.length > 2) {
    pontos_evolucao.push("Forte dependência de clichês emocionais")
  }

  const imagens_presentes = [
    "café", "porta", "janela", "chuva", "sofá", "foto", "telefone", "rua"
  ].filter(imagem => allLyrics.includes(imagem))

  if (imagens_presentes.length >= 3) {
    pontos_evolucao.push("Bom uso de imagens concretas do cotidiano")
  }

  const estilo_identificado = cliches_comuns.length > 3 ? "Tradicional" : 
                             imagens_presentes.length > 4 ? "Terceira Via" : "Misto"

  return {
    cliches_comuns,
    pontos_evolucao,
    estilo_identificado
  }
}
