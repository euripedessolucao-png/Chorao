/**
 * REGRA UNIVERSAL ANTI-FORÇAÇÃO
 *
 * Este validador garante que palavras-chave específicas de gêneros
 * só sejam usadas quando há contexto narrativo adequado.
 *
 * Objetivo: Evitar absurdos como "ela de biquíni no altar" ou
 * "paredão no boteco" que surgem quando a IA força palavras
 * só para "cumprir regras" sem coerência narrativa.
 */

export interface AntiForcingRule {
  keyword: string
  allowedContexts: string[]
  genre: string
  description: string
}

// Regras por gênero - palavras que precisam de contexto
const ANTI_FORCING_RULES: AntiForcingRule[] = [
  // Sertanejo
  {
    keyword: "biquíni",
    allowedContexts: ["praia", "sol", "verão", "mar", "areia", "piscina", "calor", "corpo"],
    genre: "sertanejo",
    description: "Só use 'biquíni' em contextos de praia/verão",
  },
  {
    keyword: "pix",
    allowedContexts: ["conta", "pagar", "dinheiro", "salário", "autonomia", "transferência", "banco"],
    genre: "sertanejo",
    description: "Só use 'PIX' em contextos financeiros",
  },
  {
    keyword: "boteco",
    allowedContexts: ["amigos", "mano", "chopp", "violão", "noite", "cerveja", "mesa", "bar"],
    genre: "sertanejo",
    description: "Só use 'boteco' em contextos sociais/noturno",
  },
  {
    keyword: "chapéu",
    allowedContexts: ["roça", "fazenda", "campo", "sol", "cowboy", "rodeio", "festa"],
    genre: "sertanejo",
    description: "Só use 'chapéu' em contextos rurais/festivos",
  },

  // Funk
  {
    keyword: "paredão",
    allowedContexts: ["som", "carro", "rolê", "festa", "beat", "grave", "música", "baile"],
    genre: "funk",
    description: "Só use 'paredão' em contextos de som/festa",
  },
  {
    keyword: "zap",
    allowedContexts: ["mensagem", "story", "ligação", "responder", "celular", "foto", "áudio"],
    genre: "funk",
    description: "Só use 'zap' em contextos de comunicação digital",
  },
  {
    keyword: "baile",
    allowedContexts: ["dança", "funk", "favela", "comunidade", "noite", "festa", "pista"],
    genre: "funk",
    description: "Só use 'baile' em contextos de festa/dança",
  },

  // Gospel
  {
    keyword: "altar",
    allowedContexts: ["igreja", "oração", "fé", "graça", "louvor", "culto", "templo"],
    genre: "gospel",
    description: "Só use 'altar' em contextos religiosos",
  },
  {
    keyword: "graça",
    allowedContexts: ["deus", "céu", "fé", "milagre", "bondade", "salvação", "perdão"],
    genre: "gospel",
    description: "Só use 'graça' em contextos espirituais",
  },
  {
    keyword: "cruz",
    allowedContexts: ["jesus", "sacrifício", "salvação", "fé", "redenção", "calvário"],
    genre: "gospel",
    description: "Só use 'cruz' em contextos cristãos",
  },

  // Rock
  {
    keyword: "guitarra",
    allowedContexts: ["palco", "banda", "som", "rock", "amplificador", "solo", "música"],
    genre: "rock",
    description: "Só use 'guitarra' em contextos musicais",
  },
  {
    keyword: "rua",
    allowedContexts: ["cidade", "muro", "protesto", "liberdade", "asfalto", "noite", "urbano"],
    genre: "rock",
    description: "Só use 'rua' em contextos urbanos/rebeldes",
  },

  // Samba/Pagode
  {
    keyword: "cavaquinho",
    allowedContexts: ["pagode", "quintal", "roda", "samba", "pandeiro", "música", "festa"],
    genre: "samba",
    description: "Só use 'cavaquinho' em contextos de samba/pagode",
  },
  {
    keyword: "chopinho",
    allowedContexts: ["boteco", "amigos", "fim de semana", "mesa", "bar", "conversa"],
    genre: "samba",
    description: "Só use 'chopinho' em contextos sociais",
  },

  // Bachata
  {
    keyword: "dança",
    allowedContexts: ["corpo", "noite", "ritmo", "colado", "luz baixa", "música", "pista"],
    genre: "bachata",
    description: "Só use 'dança' em contextos românticos/musicais",
  },

  // Forró
  {
    keyword: "sanfona",
    allowedContexts: ["triângulo", "zabumba", "forró", "baião", "pé-de-serra", "música", "festa"],
    genre: "forro",
    description: "Só use 'sanfona' em contextos de forró",
  },
  {
    keyword: "piseiro",
    allowedContexts: ["dançar", "pista", "forrozão", "festa", "música", "pé"],
    genre: "forro",
    description: "Só use 'piseiro' em contextos de dança/festa",
  },

  // MPB
  {
    keyword: "janela",
    allowedContexts: ["cidade", "chuva", "observar", "refletir", "casa", "vista", "solidão"],
    genre: "mpb",
    description: "Só use 'janela' em contextos contemplativos",
  },
  {
    keyword: "ônibus",
    allowedContexts: ["rua", "cidade", "cotidiano", "viagem", "trabalho", "povo"],
    genre: "mpb",
    description: "Só use 'ônibus' em contextos urbanos/cotidianos",
  },

  // Pop
  {
    keyword: "look",
    allowedContexts: ["espelho", "fotos", "desfile", "autoestima", "roupa", "estilo"],
    genre: "pop",
    description: "Só use 'look' em contextos de moda/autoestima",
  },
  {
    keyword: "club",
    allowedContexts: ["noite", "dançar", "festa", "cidade", "música", "pista"],
    genre: "pop",
    description: "Só use 'club' em contextos de festa/noite",
  },
]

/**
 * Valida se uma linha usa palavras-chave com contexto narrativo adequado
 */
export function validateAgainstForcing(
  line: string,
  fullLyric: string,
  genre: string,
): { isValid: boolean; warning: string | null; keyword?: string } {
  const lowerLine = line.toLowerCase()
  const lowerFull = fullLyric.toLowerCase()

  // Normalizar nome do gênero para matching
  const normalizedGenre = genre.toLowerCase().replace(/\s+/g, "")

  const genreRules = ANTI_FORCING_RULES.filter((rule) => {
    const ruleGenre = rule.genre.toLowerCase().replace(/\s+/g, "")
    return normalizedGenre.includes(ruleGenre) || ruleGenre.includes(normalizedGenre)
  })

  for (const rule of genreRules) {
    if (lowerLine.includes(rule.keyword)) {
      // Verifica se há contexto permitido na linha OU na letra inteira
      const hasContext = rule.allowedContexts.some(
        (ctx) => lowerLine.includes(ctx.toLowerCase()) || lowerFull.includes(ctx.toLowerCase()),
      )

      if (!hasContext) {
        return {
          isValid: false,
          warning: `"${rule.keyword}" usado sem contexto narrativo. ${rule.description}. Contextos válidos: ${rule.allowedContexts.slice(0, 3).join(", ")}`,
          keyword: rule.keyword,
        }
      }
    }
  }

  return { isValid: true, warning: null }
}

/**
 * Valida toda a letra contra forçação de palavras-chave
 */
export function validateFullLyricAgainstForcing(
  lyrics: string,
  genre: string,
): { isValid: boolean; warnings: string[]; score: number } {
  const lines = lyrics.split("\n").filter((line) => line.trim())
  const warnings: string[] = []
  let violations = 0

  for (const line of lines) {
    const result = validateAgainstForcing(line, lyrics, genre)
    if (!result.isValid && result.warning) {
      warnings.push(`Linha "${line.trim()}": ${result.warning}`)
      violations++
    }
  }

  // Score: 100 - (20 pontos por violação, mínimo 0)
  const score = Math.max(0, 100 - violations * 20)

  return {
    isValid: violations === 0,
    warnings,
    score,
  }
}

/**
 * Retorna todas as regras para um gênero específico
 */
export function getAntiForcingRulesForGenre(genre: string): AntiForcingRule[] {
  const normalizedGenre = genre.toLowerCase().replace(/\s+/g, "")
  return ANTI_FORCING_RULES.filter((rule) => {
    const ruleGenre = rule.genre.toLowerCase().replace(/\s+/g, "")
    return normalizedGenre.includes(ruleGenre) || ruleGenre.includes(normalizedGenre)
  })
}
