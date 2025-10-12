export const GENRE_CONFIGS = {
  "Sertanejo Moderno Feminino": {
    year_range: "2024-2025",
    reference_artists: ["Ana Castela", "Maiara & Maraisa", "Luísa Sonza", "Simaria", "Naiara Azevedo"],
    core_principles: {
      theme: "Empoderamento feminino com leveza, autonomia e celebração da liberdade",
      tone: "Confidente, irônico, cotidiano, com atitude suave e final feliz",
      narrative_arc: "Início (controle do ex) → Meio (despertar/libertação) → Fim (celebração autônoma)",
    },
    language_rules: {
      allowed: {
        concrete_objects: [
          "biquíni",
          "PIX",
          "salário",
          "chapéu",
          "praia",
          "conta",
          "decote",
          "carro",
          "espelho",
          "anéis",
        ],
        actions: ["cortei", "paguei", "saí", "rasguei", "usei", "dancei", "voei", "quebrei", "aprendi", "sorri"],
        phrases: ["meu troco", "você não previu", "faço em dobro", "minha lei", "tô em outra vibe", "dona de mim"],
      },
      forbidden: {
        abstract_metaphors: [
          "floresço",
          "alma perdida",
          "mar de dor",
          "bonança",
          "brisa me inflama",
          "castelo de areia",
        ],
        ex_saudade: ["falta da sua voz", "meu coração chora", "volta pra mim", "não consigo viver sem você"],
        aggressive_tone: ["odeio você", "se fuder", "vou te destruir"],
      },
      style: "Coloquial, direto, como conversa real entre amigas. Evite poesia rebuscada.",
    },
    structure_rules: {
      verse: { lines: 4, purpose: "Apresentar conflito ou transformação com detalhes concretos" },
      chorus: {
        lines_options: [2, 4],
        forbidden_lines: 3,
        required_elements: ["Gancho grudento", "Contraste claro", "Afirmação de liberdade"],
      },
      bridge: { lines_min: 2, lines_max: 4, purpose: "Clímax de libertação — foco em ação, não em drama" },
    },
    prosody_rules: {
      syllable_count: {
        with_comma: { max_before_comma: 7, max_after_comma: 5, total_max: 12 },
        without_comma: { min: 5, max: 7, acceptable_up_to: 8 },
      },
      breathability: "Toda linha deve caber em um fôlego natural ao cantar (máximo 12 sílabas)",
      verse_counting_rule:
        "Uma linha com vírgula (ex: 6+6, 7+5 ou 5+7 sílabas) conta como 2 VERSOS na estrutura total, não 1 verso",
    },
    harmony_and_rhythm: {
      key: "C major",
      allowed_chords: ["C", "Dm", "Em", "F", "G", "Am", "G7"],
      forbidden_chords: ["A", "E", "B", "Bb", "F#", "C#", "Ab"],
      bpm_range: { min: 88, max: 96, ideal: 94 },
      rhythm_style: "Sertanejo pop com groove moderado",
    },
  },
  "Sertanejo Moderno Masculino": {
    year_range: "2024-2025",
    reference_artists: [
      "Gusttavo Lima",
      "Israel & Rodolffo",
      "Luan Santana",
      "Zé Neto & Cristiano",
      "Henrique & Juliano",
    ],
    core_principles: {
      theme: "Vulnerabilidade com atitude, celebração da vida simples, superação com leveza",
      tone: "Confidente, sincero, às vezes brincalhão, com toque de saudade saudável",
      narrative_arc: "Início (erro ou dor) → Meio (reflexão ou cura com amigos) → Fim (nova chance ou paz interior)",
    },
    language_rules: {
      allowed: {
        concrete_objects: ["cerveja", "violão", "boteco", "estrada", "caminhonete", "chapéu", "mala", "varanda"],
        actions: ["errei", "aprendi", "segui", "curei", "bebi", "cantei", "perdoei", "cresci"],
        phrases: ["tô em paz comigo", "errei mas cresci", "amor que prende não é amor", "meu refúgio é o boteco"],
      },
      forbidden: {
        toxic_masculinity: ["ela me traiu vou destruir", "mulher é tudo igual", "não choro sou homem"],
        excessive_drama: ["não vivo sem você", "meu mundo desabou", "só penso em você"],
        generic_clichés: ["lágrimas no travesseiro", "noite sem luar", "coração partido em mil"],
      },
      style: "Direto, honesto, com toque de poesia cotidiana. Pode ser romântico, mas nunca possessivo.",
    },
    structure_rules: {
      verse: { lines: 4, purpose: "Contar uma história real: erro, saudade saudável, ou momento de cura" },
      chorus: {
        lines_options: [2, 4],
        forbidden_lines: 3,
        required_elements: ["Gancho emocional ou celebratório", "Referência concreta", "Mensagem de superação"],
      },
    },
    prosody_rules: {
      syllable_count: {
        with_comma: { max_before_comma: 7, max_after_comma: 5, total_max: 12 },
        without_comma: { min: 5, max: 8, acceptable_up_to: 9 },
      },
      verse_counting_rule:
        "Uma linha com vírgula (ex: 6+6, 7+5 ou 5+7 sílabas) conta como 2 VERSOS na estrutura total, não 1 verso",
    },
    harmony_and_rhythm: {
      key: "G major",
      allowed_chords: ["G", "Am", "Bm", "C", "D", "Em", "D7"],
      forbidden_chords: ["A", "E", "B", "Bb", "F#", "C#", "Ab"],
      bpm_range: { min: 90, max: 100, ideal: 95 },
      rhythm_style: "Sertanejo moderno com groove marcado",
    },
  },
  "Sertanejo Universitário": {
    year_range: "2010-2025",
    reference_artists: ["Jorge & Mateus", "Henrique & Juliano", "Marília Mendonça"],
    core_principles: {
      theme: "Relacionamentos modernos, festas, vida universitária",
      tone: "Descontraído, romântico, celebratório",
      narrative_arc: "Início (situação) → Meio (desenvolvimento) → Fim (resolução ou festa)",
    },
    language_rules: {
      allowed: {
        concrete_objects: ["cerveja", "balada", "carro", "celular", "festa", "amigos"],
        actions: ["bebi", "dancei", "liguei", "esqueci", "curti", "aproveitei"],
        phrases: ["tô na balada", "esquece o ex", "bora curtir", "vida que segue"],
      },
      forbidden: {
        old_cliches: ["coração partido", "lágrimas no travesseiro", "solidão me mata"],
      },
      style: "Coloquial, jovem, direto",
    },
    structure_rules: {
      verse: { lines: 4, purpose: "Contar história de forma leve e direta" },
      chorus: {
        lines_options: [2, 4],
        forbidden_lines: 3,
        required_elements: ["Gancho grudento", "Fácil de cantar junto"],
      },
    },
    prosody_rules: {
      syllable_count: {
        with_comma: { max_before_comma: 7, max_after_comma: 5, total_max: 12 },
        without_comma: { min: 5, max: 8, acceptable_up_to: 9 },
      },
      verse_counting_rule:
        "Uma linha com vírgula (ex: 6+6, 7+5 ou 5+7 sílabas) conta como 2 VERSOS na estrutura total, não 1 verso",
    },
    harmony_and_rhythm: {
      key: "G major",
      allowed_chords: ["G", "C", "D", "Em", "Am"],
      bpm_range: { min: 95, max: 105, ideal: 100 },
      rhythm_style: "Sertanejo universitário com groove animado",
    },
  },
  "Forró Pé de Serra": {
    year_range: "1940-2025",
    reference_artists: ["Luiz Gonzaga", "Dominguinhos", "Trio Nordestino"],
    core_principles: {
      theme: "Nordeste, saudade, amor, festa junina",
      tone: "Alegre, nostálgico, regional",
      narrative_arc: "História do sertão com emoção autêntica",
    },
    language_rules: {
      allowed: {
        concrete_objects: ["sanfona", "xote", "baião", "sertão", "lua", "forró"],
        actions: ["dançar", "tocar", "cantar", "lembrar", "voltar"],
        phrases: ["meu sertão", "terra querida", "forró bom", "sanfona chora"],
      },
      forbidden: {
        modern_slang: ["tô na vibe", "manda o pix", "story"],
      },
      style: "Regional nordestino, poético mas acessível",
    },
    structure_rules: {
      verse: { lines: 4, purpose: "Contar história do nordeste" },
      chorus: {
        lines_options: [2, 4],
        forbidden_lines: 3,
        required_elements: ["Melodia marcante", "Fácil de dançar"],
      },
    },
    prosody_rules: {
      syllable_count: {
        with_comma: { max_before_comma: 7, max_after_comma: 5, total_max: 12 },
        without_comma: { min: 5, max: 8, acceptable_up_to: 9 },
      },
      verse_counting_rule: "Uma linha com vírgula (6+6, 7+5 ou 5+7 sílabas) conta como 2 VERSOS na estrutura total",
    },
    harmony_and_rhythm: {
      key: "A major",
      allowed_chords: ["A", "D", "E", "F#m", "Bm"],
      bpm_range: { min: 110, max: 130, ideal: 120 },
      rhythm_style: "Forró tradicional com zabumba, triângulo e sanfona",
    },
  },
  "Funk Carioca": {
    year_range: "2024-2025",
    reference_artists: ["MC Ryan SP", "Pedro Sampaio", "Anitta (funk)", "MC Daniel", "Ludmilla"],
    core_principles: {
      theme:
        "Autoestima, empoderamento, festa consciente, amor com respeito — não apologia à violência ou objetificação",
      tone: "Ritmo marcado, frases curtas, repetitivo e grudento",
      narrative_arc: "Afirmação → Convite → Celebração",
    },
    language_rules: {
      allowed: {
        concrete_objects: ["paredão", "rolê", "zap", "story", "look", "beat", "flow", "baile", "favela", "quebrada"],
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
        toxic_content: [
          "mulher objeto",
          "violência",
          "drogas explícitas",
          "machismo",
          "apologia ao crime",
          "objetificação",
        ],
        generic_cliches: ["põe a mão no alto", "vamos curtir a noite", "a festa tá bombando", "todo mundo junto"],
      },
      style: "Direto, repetitivo, com gírias urbanas ('mano', 'véio', 'bicho'). Tom confiante e empoderado.",
    },
    structure_rules: {
      verse: { lines: 4, purpose: "Versos curtos e diretos, estabelecendo atitude e contexto" },
      chorus: {
        lines_options: [2],
        forbidden_lines: [3, 4],
        required_elements: ["Grudento e repetitivo", "Máximo 6 sílabas por linha", "Frase de impacto", "Sem vírgulas"],
      },
    },
    prosody_rules: {
      syllable_count: {
        with_comma: { max_before_comma: 6, max_after_comma: 6, total_max: 12 },
        without_comma: { min: 3, max: 6, acceptable_up_to: 6 },
      },
      verse_counting_rule: "Funk usa versos curtos. Uma linha com vírgula (6+6) conta como 2 VERSOS",
    },
    harmony_and_rhythm: {
      key: "C minor",
      allowed_chords: ["Cm", "Fm", "Gm", "Ab", "Bb"],
      bpm_range: { min: 120, max: 140, ideal: 130 },
      rhythm_style: "Batida marcada do funk com graves pesados (paredão)",
    },
  },
  "Funk Melody": {
    year_range: "2024-2025",
    reference_artists: ["MC Ryan SP", "Pedro Sampaio", "Anitta (funk)", "MC Daniel", "Ludmilla"],
    core_principles: {
      theme:
        "Autoestima, empoderamento, festa consciente, amor com respeito — não apologia à violência ou objetificação",
      tone: "Ritmo marcado, frases curtas, repetitivo e grudento",
      narrative_arc: "Afirmação → Convite → Celebração",
    },
    language_rules: {
      allowed: {
        concrete_objects: ["paredão", "rolê", "zap", "story", "look", "beat", "flow", "baile", "favela", "quebrada"],
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
        toxic_content: [
          "mulher objeto",
          "violência",
          "drogas explícitas",
          "machismo",
          "apologia ao crime",
          "objetificação",
        ],
        generic_cliches: ["põe a mão no alto", "vamos curtir a noite", "a festa tá bombando", "todo mundo junto"],
      },
      style: "Direto, repetitivo, com gírias urbanas ('mano', 'véio', 'bicho'). Tom confiante e empoderado.",
    },
    structure_rules: {
      verse: { lines: 4, purpose: "Versos curtos e diretos, estabelecendo atitude e contexto" },
      chorus: {
        lines_options: [2],
        forbidden_lines: [3, 4],
        required_elements: ["Grudento e repetitivo", "Máximo 6 sílabas por linha", "Frase de impacto", "Sem vírgulas"],
      },
    },
    prosody_rules: {
      syllable_count: {
        with_comma: { max_before_comma: 6, max_after_comma: 6, total_max: 12 },
        without_comma: { min: 3, max: 6, acceptable_up_to: 6 },
      },
      verse_counting_rule: "Funk usa versos curtos. Uma linha com vírgula (6+6) conta como 2 VERSOS",
    },
    harmony_and_rhythm: {
      key: "C minor",
      allowed_chords: ["Cm", "Fm", "Gm", "Ab", "Bb"],
      bpm_range: { min: 120, max: 140, ideal: 130 },
      rhythm_style: "Batida marcada do funk com graves pesados (paredão)",
    },
  },
  "Funk Ostentação": {
    year_range: "2024-2025",
    reference_artists: ["MC Ryan SP", "Pedro Sampaio", "Anitta (funk)", "MC Daniel", "Ludmilla"],
    core_principles: {
      theme:
        "Autoestima, empoderamento, festa consciente, amor com respeito — não apologia à violência ou objetificação",
      tone: "Ritmo marcado, frases curtas, repetitivo e grudento",
      narrative_arc: "Afirmação → Convite → Celebração",
    },
    language_rules: {
      allowed: {
        concrete_objects: ["paredão", "rolê", "zap", "story", "look", "beat", "flow", "baile", "favela", "quebrada"],
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
        toxic_content: [
          "mulher objeto",
          "violência",
          "drogas explícitas",
          "machismo",
          "apologia ao crime",
          "objetificação",
        ],
        generic_cliches: ["põe a mão no alto", "vamos curtir a noite", "a festa tá bombando", "todo mundo junto"],
      },
      style: "Direto, repetitivo, com gírias urbanas ('mano', 'véio', 'bicho'). Tom confiante e empoderado.",
    },
    structure_rules: {
      verse: { lines: 4, purpose: "Versos curtos e diretos, estabelecendo atitude e contexto" },
      chorus: {
        lines_options: [2],
        forbidden_lines: [3, 4],
        required_elements: ["Grudento e repetitivo", "Máximo 6 sílabas por linha", "Frase de impacto", "Sem vírgulas"],
      },
    },
    prosody_rules: {
      syllable_count: {
        with_comma: { max_before_comma: 6, max_after_comma: 6, total_max: 12 },
        without_comma: { min: 3, max: 6, acceptable_up_to: 6 },
      },
      verse_counting_rule: "Funk usa versos curtos. Uma linha com vírgula (6+6) conta como 2 VERSOS",
    },
    harmony_and_rhythm: {
      key: "C minor",
      allowed_chords: ["Cm", "Fm", "Gm", "Ab", "Bb"],
      bpm_range: { min: 120, max: 140, ideal: 130 },
      rhythm_style: "Batida marcada do funk com graves pesados (paredão)",
    },
  },
  "Funk Consciente": {
    year_range: "2024-2025",
    reference_artists: ["MC Ryan SP", "Pedro Sampaio", "Anitta (funk)", "MC Daniel", "Ludmilla"],
    core_principles: {
      theme:
        "Autoestima, empoderamento, festa consciente, amor com respeito — não apologia à violência ou objetificação",
      tone: "Ritmo marcado, frases curtas, repetitivo e grudento",
      narrative_arc: "Afirmação → Convite → Celebração",
    },
    language_rules: {
      allowed: {
        concrete_objects: ["paredão", "rolê", "zap", "story", "look", "beat", "flow", "baile", "favela", "quebrada"],
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
        toxic_content: [
          "mulher objeto",
          "violência",
          "drogas explícitas",
          "machismo",
          "apologia ao crime",
          "objetificação",
        ],
        generic_cliches: ["põe a mão no alto", "vamos curtir a noite", "a festa tá bombando", "todo mundo junto"],
      },
      style: "Direto, repetitivo, com gírias urbanas ('mano', 'véio', 'bicho'). Tom confiante e empoderado.",
    },
    structure_rules: {
      verse: { lines: 4, purpose: "Versos curtos e diretos, estabelecendo atitude e contexto" },
      chorus: {
        lines_options: [2],
        forbidden_lines: [3, 4],
        required_elements: ["Grudento e repetitivo", "Máximo 6 sílabas por linha", "Frase de impacto", "Sem vírgulas"],
      },
    },
    prosody_rules: {
      syllable_count: {
        with_comma: { max_before_comma: 6, max_after_comma: 6, total_max: 12 },
        without_comma: { min: 3, max: 6, acceptable_up_to: 6 },
      },
      verse_counting_rule: "Funk usa versos curtos. Uma linha com vírgula (6+6) conta como 2 VERSOS",
    },
    harmony_and_rhythm: {
      key: "C minor",
      allowed_chords: ["Cm", "Fm", "Gm", "Ab", "Bb"],
      bpm_range: { min: 120, max: 140, ideal: 130 },
      rhythm_style: "Batida marcada do funk com graves pesados (paredão)",
    },
  },
  "Pagode Romântico": {
    year_range: "1990-2025",
    reference_artists: ["Thiaguinho", "Péricles", "Ferrugem", "Sorriso Maroto"],
    core_principles: {
      theme: "Amor, saudade, relacionamentos, superação",
      tone: "Romântico, sincero, emotivo",
      narrative_arc: "Situação amorosa → Sentimento → Resolução ou aceitação",
    },
    language_rules: {
      allowed: {
        concrete_objects: ["cerveja", "mesa de bar", "violão", "samba", "roda"],
        actions: ["sofri", "amei", "perdi", "ganhei", "dancei", "cantei"],
        phrases: ["amor da minha vida", "saudade bateu", "coração apaixonado"],
      },
      forbidden: {
        aggressive_tone: ["odeio", "vingança", "destruir"],
      },
      style: "Poético mas acessível, com emoção genuína",
    },
    structure_rules: {
      verse: { lines: 4, purpose: "Contar história de amor com detalhes" },
      chorus: {
        lines_options: [2, 4],
        forbidden_lines: 3,
        required_elements: ["Melodia marcante", "Emoção clara"],
      },
    },
    prosody_rules: {
      syllable_count: {
        with_comma: { max_before_comma: 7, max_after_comma: 5, total_max: 12 },
        without_comma: { min: 5, max: 8, acceptable_up_to: 9 },
      },
      verse_counting_rule: "Uma linha com vírgula (6+6, 7+5 ou 5+7 sílabas) conta como 2 VERSOS na estrutura total",
    },
    harmony_and_rhythm: {
      key: "D major",
      allowed_chords: ["D", "G", "A", "Bm", "Em", "F#m"],
      bpm_range: { min: 95, max: 110, ideal: 100 },
      rhythm_style: "Pagode com cavaquinho, pandeiro e tantã",
    },
  },
  "Gospel Contemporâneo": {
    year_range: "2010-2025",
    reference_artists: ["Gabriela Rocha", "Thalles Roberto", "Preto no Branco"],
    core_principles: {
      theme: "Fé, esperança, gratidão, adoração",
      tone: "Inspirador, positivo, edificante",
      narrative_arc: "Situação difícil → Fé → Vitória ou paz",
    },
    language_rules: {
      allowed: {
        concrete_objects: ["cruz", "altar", "céu", "luz", "caminho"],
        actions: ["louvar", "adorar", "crer", "confiar", "vencer"],
        phrases: ["Deus é fiel", "milagre aconteceu", "fé que move montanhas"],
      },
      forbidden: {
        negative_theology: ["Deus castiga", "merecimento por obras"],
      },
      style: "Inspirador, poético, acessível",
    },
    structure_rules: {
      verse: { lines: 4, purpose: "Contar testemunho ou louvor" },
      chorus: {
        lines_options: [2, 4],
        forbidden_lines: 3,
        required_elements: ["Mensagem clara de fé", "Fácil de cantar em grupo"],
      },
    },
    prosody_rules: {
      syllable_count: {
        with_comma: { max_before_comma: 7, max_after_comma: 5, total_max: 12 },
        without_comma: { min: 5, max: 8, acceptable_up_to: 9 },
      },
      breathability: "Toda linha deve caber em um fôlego natural ao cantar",
      verse_counting_rule:
        "Uma linha com vírgula (ex: 6+6, 7+5 ou 5+7 sílabas) conta como 2 VERSOS na estrutura total, não 1 verso",
    },
    harmony_and_rhythm: {
      key: "C major",
      allowed_chords: ["C", "F", "G", "Am", "Dm", "Em"],
      bpm_range: { min: 80, max: 95, ideal: 88 },
      rhythm_style: "Pop gospel com instrumentação moderna",
    },
  },
} as const

export type GenreConfig = (typeof GENRE_CONFIGS)[keyof typeof GENRE_CONFIGS]

export function getGenreConfig(genre: string): GenreConfig & { name: string } {
  const config = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS]

  if (!config) {
    return {
      name: genre,
      year_range: "2024-2025",
      reference_artists: [] as any,
      core_principles: {
        theme: "Música brasileira contemporânea" as any,
        tone: "Autêntico e natural" as any,
        narrative_arc: "Início → Desenvolvimento → Conclusão" as any,
      },
      language_rules: {
        allowed: {
          concrete_objects: [],
          actions: [],
          phrases: [],
        },
        forbidden: {},
        style: "Coloquial, brasileiro, com palavras simples do dia-a-dia",
      },
      structure_rules: {
        verse: { lines: 4, purpose: "Contar história de forma clara" },
        chorus: {
          lines_options: [2, 4],
          forbidden_lines: 3,
          required_elements: ["Gancho grudento", "Fácil de memorizar"],
        },
      },
      prosody_rules: {
        syllable_count: {
          with_comma: { max_before_comma: 7, max_after_comma: 5, total_max: 12 },
          without_comma: { min: 5, max: 8, acceptable_up_to: 9 },
        },
        breathability: "Toda linha deve caber em um fôlego natural ao cantar",
        verse_counting_rule:
          "Uma linha com vírgula (ex: 6+6, 7+5 ou 5+7 sílabas) conta como 2 VERSOS na estrutura total, não 1 verso",
      },
      harmony_and_rhythm: {
        key: "C major" as any,
        allowed_chords: ["C", "F", "G", "Am", "Dm", "Em"],
        bpm_range: { min: 90, max: 110, ideal: 100 },
        rhythm_style: "Ritmo brasileiro moderno",
      },
    }
  }

  return {
    name: genre,
    ...config,
  }
}

export function validateLyrics(
  lyrics: string,
  genre: string,
): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  const config = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS]
  if (!config) {
    return { valid: true, errors: [], warnings: ["Gênero não encontrado nas configurações"] }
  }

  // Validar palavras proibidas
  const lyricsLower = lyrics.toLowerCase()
  if (config.language_rules.forbidden) {
    Object.entries(config.language_rules.forbidden).forEach(([category, words]) => {
      words.forEach((word: string) => {
        if (lyricsLower.includes(word.toLowerCase())) {
          errors.push(`Palavra/frase proibida encontrada (${category}): "${word}"`)
        }
      })
    })
  }

  // Validar contagem de sílabas
  const lines = lyrics.split("\n").filter((line) => line.trim() && !line.startsWith("["))
  lines.forEach((line, index) => {
    const syllables = countSyllables(line)
    const rules = config.prosody_rules.syllable_count

    if (line.includes(",")) {
      const [before, after] = line.split(",")
      const beforeCount = countSyllables(before)
      const afterCount = countSyllables(after)

      if (beforeCount > rules.with_comma.max_before_comma) {
        warnings.push(`Linha ${index + 1}: Muitas sílabas antes da vírgula (${beforeCount})`)
      }
      if (afterCount > rules.with_comma.max_after_comma) {
        warnings.push(`Linha ${index + 1}: Muitas sílabas depois da vírgula (${afterCount})`)
      }
    } else {
      if (syllables < rules.without_comma.min || syllables > rules.without_comma.acceptable_up_to) {
        warnings.push(`Linha ${index + 1}: Contagem de sílabas fora do ideal (${syllables})`)
      }
    }
  })

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

function countSyllables(text: string): number {
  const cleaned = text.replace(/[^\wáàâãéèêíìîóòôõúùûç\s]/gi, "").toLowerCase()
  const words = cleaned.split(/\s+/).filter(Boolean)

  let total = 0
  words.forEach((word) => {
    // Contagem aproximada de sílabas
    const vowels = word.match(/[aeiouáàâãéèêíìîóòôõúùû]/gi)
    total += vowels ? vowels.length : 1
  })

  return total
}

export const INSTRUMENTATION_RULES = {
  "Sertanejo Moderno Feminino": {
    required: "(Instrumental: acoustic guitar, electric guitar, drums, bass)",
    optional: ["keyboard", "harmonica", "backing vocals"],
    format: "Sempre entre parênteses, em inglês, após o nome da seção",
  },
  "Sertanejo Moderno Masculino": {
    required: "(Instrumental: acoustic guitar, electric guitar, drums, bass)",
    optional: ["harmonica", "accordion", "backing vocals"],
    format: "Sempre entre parênteses, em inglês, após o nome da seção",
  },
  "Sertanejo Universitário": {
    required: "(Instrumental: acoustic guitar, electric guitar, drums, bass)",
    optional: ["keyboard", "harmonica", "backing vocals"],
    format: "Sempre entre parênteses, em inglês, após o nome da seção",
  },
  "Forró Pé de Serra": {
    required: "(Instrumental: zabumba, triângulo, sanfona)",
    optional: ["percussion", "vocals"],
    format: "Sempre entre parênteses, em inglês, após o nome da seção",
  },
  "Funk Carioca": {
    required: "(Instrumental: 808 bass, percussion, synth)",
    optional: ["vocals", "samples", "effects"],
    format: "Sempre entre parênteses, em inglês, após o nome da seção",
  },
  "Funk Melody": {
    required: "(Instrumental: 808 bass, percussion, synth)",
    optional: ["vocals", "samples", "effects"],
    format: "Sempre entre parênteses, em inglês, após o nome da seção",
  },
  "Funk Ostentação": {
    required: "(Instrumental: 808 bass, percussion, synth)",
    optional: ["vocals", "samples", "effects"],
    format: "Sempre entre parênteses, em inglês, após o nome da seção",
  },
  "Funk Consciente": {
    required: "(Instrumental: 808 bass, percussion, synth)",
    optional: ["vocals", "samples", "effects"],
    format: "Sempre entre parênteses, em inglês, após o nome da seção",
  },
  "Pagode Romântico": {
    required: "(Instrumental: cavaquinho, pandeiro, tantã)",
    optional: ["vocals", "acoustic guitar"],
    format: "Sempre entre parênteses, em inglês, após o nome da seção",
  },
  "Gospel Contemporâneo": {
    required: "(Instrumental: acoustic guitar, electric guitar, drums, bass)",
    optional: ["keyboard", "vocals"],
    format: "Sempre entre parênteses, em inglês, após o nome da seção",
  },
} as const
