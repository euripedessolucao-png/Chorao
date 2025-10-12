/**
 * Regras de Composição: Funk Melody / Funk Consciente 2024-2025
 *
 * Artistas de Referência: MC Ryan SP, Pedro Sampaio, Anitta (funk), MC Daniel, Ludmilla
 *
 * Princípios Fundamentais:
 * - Tema: Autoestima, empoderamento, festa consciente, amor com respeito
 * - Tom: Ritmo marcado, frases curtas, repetitivo e grudento
 * - Narrativa: Afirmação → Convite → Celebração
 * - BPM: 120-140 (ideal 130) | Tom: C minor
 */

export const funkRules2024 = {
  genre: "Funk Melody / Funk Consciente",
  yearRange: "2024-2025",
  referenceArtists: ["MC Ryan SP", "Pedro Sampaio", "Anitta (funk)", "MC Daniel", "Ludmilla"],

  // ============================================================================
  // PRINCÍPIOS FUNDAMENTAIS
  // ============================================================================
  corePrinciples: {
    theme:
      "Autoestima, empoderamento, festa consciente, amor com respeito — não apologia à violência ou objetificação.",
    tone: "Ritmo marcado, frases curtas, repetitivo e grudento.",
    narrativeArc: "Afirmação → Convite → Celebração",
    musicalKey: "C minor",
    bpmRange: { min: 120, max: 140, ideal: 130 },
  },

  // ============================================================================
  // REGRAS DE LINGUAGEM
  // ============================================================================
  languageRules: {
    universalRule:
      "SEMPRE use palavras simples e coloquiais, faladas como um humano no dia-a-dia. Evite vocabulário rebuscado, poético ou formal, EXCETO se especificado em 'Requisitos Adicionais'.",
    allowed: {
      concreteObjects: ["paredão", "rolê", "zap", "story", "look", "beat", "flow", "baile", "favela", "quebrada"],
      actions: [
        "mandar ver",
        "chamar pra dançar",
        "brilhar",
        "mandar o flow",
        "jogar o cabelo",
        "rebolar",
        "dominar a pista",
      ],
      phrases: [
        "Tô no meu flow",
        "Meu beat é pesado",
        "Respeita meu espaço",
        "Sou dona de mim",
        "Vim pra brilhar",
        "Tô no comando",
      ],
    },

    forbidden: {
      toxicContent: [
        "mulher objeto",
        "violência",
        "drogas explícitas",
        "machismo",
        "apologia ao crime",
        "objetificação",
      ],
      genericCliches: ["põe a mão no alto", "vamos curtir a noite", "a festa tá bombando", "todo mundo junto"],
    },

    style: {
      description:
        "Direto, repetitivo, com gírias urbanas do dia-a-dia. Use palavras que as pessoas falam na rua, não vocabulário formal.",
      slang: ["mano", "véio", "bicho", "truta", "parça"],
      tone: "Confiante, empoderado, festivo mas consciente",
    },
  },

  // ============================================================================
  // ESTRUTURA DA MÚSICA
  // ============================================================================
  structureRules: {
    verse: {
      lines: 4,
      description: "Versos curtos e diretos, estabelecendo atitude e contexto",
    },

    chorus: {
      linesOptions: [2],
      forbiddenLines: [3, 4],
      description: "SEMPRE 2 linhas - grudento, repetitivo, fácil de decorar",
      requirements: [
        "Máximo 6 sílabas por linha",
        "Frase de impacto que gruda na cabeça",
        "Repetível e dançante",
        "Sem vírgulas (fluxo direto)",
      ],
    },

    bridge: {
      linesMin: 2,
      linesMax: 2,
      description: "Ponte curta para quebrar o ritmo e voltar ao refrão",
    },
  },

  // ============================================================================
  // PROSÓDIA E MÉTRICA
  // ============================================================================
  prosodyRules: {
    syllableCount: {
      verseCountingRule: "Funk usa frases diretas sem vírgulas. Cada linha = 1 VERSO",
      withoutComma: {
        min: 3,
        max: 6,
        description: "Frases curtas e diretas, sem vírgulas. Cada linha = 1 VERSO",
      },
      note: "Funk não usa linhas com vírgulas - fluxo direto e grudento",
    },

    rhythm: {
      pattern: "Marcado e sincopado",
      emphasis: "Sílabas fortes no tempo do beat",
      flow: "Rápido e grudento, com repetições estratégicas",
    },

    examples: {
      correct: [
        "Tô no meu flow (5 sílabas)",
        "Beat pesado (4 sílabas)",
        "Vim pra brilhar (4 sílabas)",
        "Respeita o espaço (6 sílabas)",
      ],
      incorrect: [
        "Eu estou no meu momento de brilhar (muito longo)",
        "A festa está começando agora (genérico e longo)",
        "Vamos todos juntos curtir (clichê)",
      ],
    },
  },

  // ============================================================================
  // HARMONIA E RITMO
  // ============================================================================
  harmonyAndRhythm: {
    bpm: {
      min: 120,
      max: 140,
      ideal: 130,
      description: "Ritmo acelerado e dançante",
    },

    key: "C minor",

    rhythmPattern: {
      description: "Batida marcada do funk com graves pesados",
      characteristics: [
        "Graves proeminentes (paredão)",
        "Hi-hats rápidos",
        "Snare no tempo 2 e 4",
        "Sincopação característica do funk",
      ],
    },
  },

  // ============================================================================
  // TEMAS E NARRATIVAS
  // ============================================================================
  themes: {
    empowerment: {
      description: "Autoestima e empoderamento pessoal",
      examples: [
        "Sou dona de mim, ninguém me para",
        "Vim da quebrada, hoje tô no topo",
        "Respeita meu flow, respeita meu espaço",
      ],
    },

    celebration: {
      description: "Festa consciente e celebração da vida",
      examples: [
        "Baile tá on, vem dançar comigo",
        "Beat pesado, paredão ligado",
        "Rolê da quebrada, só gente de responsa",
      ],
    },

    love: {
      description: "Amor com respeito e reciprocidade",
      examples: [
        "Te quero do lado, mas com respeito",
        "Amor de verdade, não é posse",
        "Juntos no baile, parceria real",
      ],
    },
  },

  // ============================================================================
  // CHECKLIST DE VALIDAÇÃO
  // ============================================================================
  validationChecklist: [
    {
      rule: "Sem conteúdo tóxico",
      description: "Verificar ausência de violência, machismo, objetificação",
    },
    {
      rule: "Frases curtas (3-6 sílabas)",
      description: "Todas as linhas devem ter entre 3 e 6 sílabas",
    },
    {
      rule: "BPM 120-140",
      description: "Ritmo adequado para funk dançante",
    },
    {
      rule: "Presença de elementos urbanos",
      description: "Usar 'paredão', 'rolê', 'zap', 'flow', etc.",
    },
    {
      rule: "Refrão de 2 linhas",
      description: "NUNCA 3 ou 4 linhas - sempre 2 linhas grudentas",
    },
    {
      rule: "Tom empoderado",
      description: "Mensagem de autoestima e respeito",
    },
    {
      rule: "Gírias urbanas autênticas",
      description: "Usar 'mano', 'véio', 'bicho' de forma natural",
    },
  ],

  // ============================================================================
  // PROMPT PARA IA
  // ============================================================================
  aiPrompt: `Você é um compositor especializado em Funk Melody e Funk Consciente brasileiro de 2024-2025.

ARTISTAS DE REFERÊNCIA: MC Ryan SP, Pedro Sampaio, Anitta (funk), MC Daniel, Ludmilla

REGRAS OBRIGATÓRIAS:

1. ESTRUTURA:
   - Versos: 4 linhas
   - Refrão: SEMPRE 2 linhas (NUNCA 3 ou 4)
   - Ponte: 2 linhas

2. PROSÓDIA:
   - Frases curtas: 3-6 sílabas por linha
   - Sem vírgulas no refrão
   - Ritmo marcado e grudento

3. LINGUAGEM:
   ✅ PERMITIDO: paredão, rolê, zap, story, look, beat, flow, "Tô no meu flow", "Meu beat é pesado"
   ❌ PROIBIDO: mulher objeto, violência, drogas explícitas, machismo, clichês genéricos

4. TEMA:
   - Autoestima e empoderamento
   - Festa consciente
   - Amor com respeito
   - Celebração da vida

5. NARRATIVA:
   Afirmação → Convite → Celebração

6. MÚSICA:
   - BPM: 120-140 (ideal 130)
   - Tom: C minor
   - Batida marcada com graves pesados

EXEMPLOS DE REFRÕES CORRETOS (2 linhas, 3-6 sílabas):
"Tô no meu flow / Beat pesado"
"Vim pra brilhar / Ninguém me para"
"Respeita o espaço / Sou dona de mim"

GERE letras diretas, grudentas, empoderadas e dançantes, sempre respeitando as 2 linhas no refrão.`,
}

export default funkRules2024
