// lib/genre-config.ts
import { countPoeticSyllables } from "./validation/syllable-counter"

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
      verse: { lines: "4-5", purpose: "Apresentar conflito ou transformação com detalhes concretos" },
      chorus: {
        lines_options: [4],
        forbidden_lines: [2, 3],
        required_elements: ["Gancho grudento", "Contraste claro", "Afirmação de liberdade", "MUITO REPETITIVO"],
      },
      bridge: { lines_min: 4, lines_max: 4, purpose: "Clímax de libertação — foco em ação, não em drama" },
      duration: "2:30-3:00 (estrutura lean para streaming)",
    },
    prosody_rules: {
      syllable_count: {
        absolute_max: 12,
        rule: "NUNCA exceder 12 sílabas poéticas por verso - limite humano de canto",
      },
      breathability: "Toda linha deve caber em um fôlego natural ao cantar (máximo 12 sílabas)",
      verse_stacking: "UM VERSO POR LINHA (empilhamento brasileiro) - exceto quando segundo é continuação direta",
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
      "Luan Santana",
      "Zé Neto & Cristiano",
      "Henrique & Juliano",
      "Israel & Rodolffo",
    ],
    core_principles: {
      theme: "Superação com leveza, celebração da vida simples, vulnerabilidade com atitude, novas chances",
      tone: "Confidente, sincero, brincalhão quando apropriado, com saudade saudável (não tóxica)",
      narrative_arc: "Início (erro ou dor) → Meio (reflexão ou cura com amigos) → Fim (nova chance ou paz interior)",
    },
    language_rules: {
      allowed: {
        concrete_objects: [
          "cerveja",
          "violão",
          "boteco",
          "estrada",
          "caminhonete",
          "chapéu",
          "mala",
          "varanda",
          "canudinho",
        ],
        actions: ["errei", "aprendi", "segui", "curei", "bebi", "cantei", "perdoei", "cresci", "superei"],
        phrases: [
          "tô em paz comigo",
          "errei mas cresci",
          "amor que prende não é amor",
          "meu refúgio é o boteco",
          "vida que segue",
        ],
      },
      forbidden: {
        toxic_masculinity: ["ela me traiu vou destruir", "mulher é tudo igual", "não choro sou homem"],
        excessive_drama: ["não vivo sem você", "meu mundo desabou", "só penso em você", "morro sem você"],
        generic_cliches: ["lágrimas no travesseiro", "noite sem luar", "coração partido em mil", "solidão me mata"],
      },
      style: "Direto, honesto, com toque de poesia cotidiana. Pode ser romântico, mas nunca possessivo ou dramático.",
    },
    structure_rules: {
      verse: { lines: "4-5", purpose: "Contar uma história real: erro, saudade saudável, ou momento de cura" },
      chorus: {
        lines_options: [4],
        forbidden_lines: [2, 3],
        required_elements: [
          "Gancho emocional ou celebratório",
          "Referência concreta",
          "Mensagem de superação",
          "MUITO REPETITIVO",
        ],
      },
      bridge: { lines_min: 4, lines_max: 4, purpose: "Momento de reflexão ou virada emocional" },
      duration: "2:30-3:00 (estrutura lean para streaming)",
    },
    prosody_rules: {
      syllable_count: {
        absolute_max: 12,
        rule: "NUNCA exceder 12 sílabas poéticas por verso - limite humano de canto",
      },
      breathability: "Toda linha deve caber em um fôlego natural ao cantar (máximo 12 sílabas)",
      verse_stacking: "UM VERSO POR LINHA (empilhamento brasileiro) - exceto quando segundo é continuação direta",
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
  "Sertanejo Raiz": {
    year_range: "2024-2025",
    reference_artists: ["Almir Sater", "Gabriel Sater", "Chitãozinho & Xororó", "Sérgio Reis", "Renato Teixeira"],
    core_principles: {
      theme:
        "Vida rural autêntica, natureza, tradições do campo, saudade da terra, histórias genuínas do sertão, preservação das raízes",
      tone: "Nostálgico, autêntico, respeitoso com as tradições, poético mas acessível, com alma caipira",
      narrative_arc:
        "Situação do campo ou memória → Reflexão sobre tradições ou natureza → Mensagem de preservação ou saudade saudável",
    },
    language_rules: {
      allowed: {
        concrete_objects: [
          "viola caipira",
          "sanfona",
          "sertão",
          "roça",
          "enxada",
          "boiadeiro",
          "porteira",
          "curral",
          "lua",
          "estrela",
          "rio",
          "mata",
          "cavalo",
          "carroça",
          "chaleira",
          "fogão de lenha",
        ],
        actions: [
          "plantar",
          "colher",
          "tocar viola",
          "cantar",
          "lembrar",
          "saudade",
          "trabalhar",
          "amanhecer",
          "anoitecer",
          "cavalgar",
        ],
        phrases: [
          "modão das antigas",
          "raiz sertaneja",
          "viola caipira",
          "saudade do sertão",
          "terra querida",
          "vida simples",
          "tradição que não se perde",
          "alma caipira",
        ],
      },
      forbidden: {
        modern_urban: ["balada", "paredão", "story", "zap", "PIX", "viral", "trending", "selfie", "app", "internet"],
        electric_instruments: ["guitarra elétrica", "sintetizador", "bateria eletrônica", "808"],
        pop_slang: ["tô na vibe", "manda o papo", "tá ligado", "tipo assim"],
      },
      style:
        "Poético, com vocabulário rural autêntico, respeitando o linguajar caipira tradicional. Evita gírias urbanas modernas.",
    },
    structure_rules: {
      verse: {
        lines: 4,
        purpose: "Contar história do campo, memórias rurais, ou reflexões sobre a vida simples com autenticidade",
      },
      chorus: {
        lines_options: [2, 4],
        forbidden_lines: 3,
        required_elements: [
          "Melodia tradicional marcante",
          "Fácil de cantar em dupla (harmonias)",
          "Mensagem de preservação ou saudade",
        ],
      },
      bridge: {
        lines_min: 2,
        lines_max: 4,
        purpose: "Momento de reflexão sobre tradições ou natureza — pode ter solo de viola",
      },
    },
    prosody_rules: {
      syllable_count: {
        with_comma: { max_before_comma: 7, max_after_comma: 5, total_max: 12 },
        without_comma: { min: 6, max: 10, acceptable_up_to: 12 },
      },
      breathability: "Toda linha deve caber em um fôlego natural ao cantar, respeitando o ritmo da moda de viola",
      verse_counting_rule:
        "Uma linha com vírgula (ex: 6+6, 7+5 ou 5+7 sílabas) conta como 2 VERSOS na estrutura total, não 1 verso",
    },
    harmony_and_rhythm: {
      key: "G major",
      allowed_chords: ["G", "C", "D", "Em", "Am", "A7", "D7"],
      forbidden_chords: ["Acordes com 7M", "9", "11", "13", "diminutos", "aumentados"],
      bpm_range: { min: 80, max: 100, ideal: 90 },
      rhythm_style:
        "Moda de viola tradicional com viola caipira de 10 cordas, sanfona, violão acústico. SEM instrumentos elétricos ou eletrônicos. Pode ter influências de blues e rock acústico (estilo Almir Sater) mas mantendo a essência raiz.",
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
    reference_artists: ["MC Ryan SP", "MC Hariel", "MC IG", "Ludmilla", "Anitta"],
    core_principles: {
      theme:
        "Autoestima, empoderamento, conquista, celebração da quebrada, respeito — NUNCA apologia à violência ou objetificação",
      tone: "Ritmo marcado, frases curtas, repetitivo e grudento, confiante",
      narrative_arc: "Afirmação de valor → Convite ou desafio → Celebração ou conquista",
    },
    language_rules: {
      allowed: {
        concrete_objects: [
          "paredão",
          "rolê",
          "zap",
          "story",
          "look",
          "beat",
          "flow",
          "baile",
          "favela",
          "quebrada",
          "nave",
          "grife",
        ],
        actions: [
          "mandar ver",
          "chamar pra dançar",
          "brilhar",
          "mandar o flow",
          "jogar o cabelo",
          "rebolar",
          "dominar a pista",
          "conquistar",
          "evoluir",
        ],
        phrases: [
          "Tô no meu flow",
          "Meu beat é pesado",
          "Respeita meu espaço",
          "Sou dona de mim",
          "Vim pra brilhar",
          "Tô no comando",
          "Da quebrada pro mundo",
          "Evoluí",
        ],
      },
      forbidden: {
        toxic_content: [
          "mulher objeto",
          "violência explícita",
          "drogas explícitas",
          "machismo",
          "apologia ao crime",
          "objetificação sexual",
        ],
        generic_cliches: ["põe a mão no alto", "vamos curtir a noite", "a festa tá bombando", "todo mundo junto"],
      },
      style: "Direto, repetitivo, com gírias urbanas atuais ('mano', 'tropa', 'bonde'). Tom confiante e empoderado.",
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
      bpm_range: { min: 120, max: 150, ideal: 130 },
      rhythm_style: "Batida marcada do funk com graves pesados (paredão) ou funk 150 BPM para TikTok",
    },
  },
  "Funk Melody": {
    year_range: "2024-2025",
    reference_artists: ["MC Ryan SP", "MC Hariel", "MC IG", "Ludmilla", "Anitta"],
    core_principles: {
      theme:
        "Autoestima, empoderamento, conquista, celebração da quebrada, respeito — NUNCA apologia à violência ou objetificação",
      tone: "Ritmo marcado, frases curtas, repetitivo e grudento, confiante",
      narrative_arc: "Afirmação de valor → Convite ou desafio → Celebração ou conquista",
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
      bpm_range: { min: 120, max: 140, ideal: 128 },
      rhythm_style: "Batida marcada do funk com graves pesados (paredão)",
    },
  },
  "Funk Consciente": {
    year_range: "2024-2025",
    reference_artists: ["MC Ryan SP", "MC Hariel", "MC IG", "Ludmilla", "Anitta"],
    core_principles: {
      theme:
        "Temas sociais, empoderamento da quebrada, superação, respeito, consciência social — NUNCA apologia à violência",
      tone: "Ritmo marcado, mensagem forte, repetitivo e grudento, consciente",
      narrative_arc: "Realidade da quebrada → Reflexão ou luta → Superação ou mensagem social",
    },
    language_rules: {
      allowed: {
        concrete_objects: ["quebrada", "favela", "comunidade", "luta", "sonho", "conquista", "respeito"],
        actions: ["lutar", "vencer", "resistir", "conquistar", "evoluir", "respeitar", "representar"],
        phrases: [
          "Da quebrada pro mundo",
          "Respeita a origem",
          "Evoluí sem esquecer",
          "Consciência é poder",
          "Quebrada unida",
        ],
      },
      forbidden: {
        toxic_content: ["apologia ao crime", "violência explícita", "drogas explícitas", "machismo", "objetificação"],
        generic_cliches: ["põe a mão no alto", "vamos curtir a noite"],
      },
      style: "Direto, com mensagem social forte, gírias urbanas conscientes. Tom de superação e orgulho da origem.",
    },
    structure_rules: {
      verse: { lines: 4, purpose: "Versos com mensagem social, realidade da quebrada, superação" },
      chorus: {
        lines_options: [2],
        forbidden_lines: [3, 4],
        required_elements: ["Grudento e repetitivo", "Mensagem social clara", "Frase de impacto"],
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
      rhythm_style: "Batida marcada do funk com graves pesados, mensagem forte",
    },
  },
  "Pagode Romântico": {
    year_range: "2024-2025",
    reference_artists: ["Menos É Mais", "Thiaguinho", "Sorriso Maroto", "Ferrugem", "Dilsinho"],
    core_principles: {
      theme: "Amor autêntico, saudade saudável, superação, celebração da vida, nostalgia positiva",
      tone: "Romântico, sincero, emotivo mas não dramático, com leveza e autenticidade",
      narrative_arc: "Situação amorosa → Sentimento genuíno → Resolução ou aceitação com maturidade",
    },
    language_rules: {
      allowed: {
        concrete_objects: ["cerveja", "mesa de bar", "violão", "samba", "roda", "pagode", "resenha", "tardezinha"],
        actions: ["sofri", "amei", "perdi", "ganhei", "dancei", "cantei", "superei", "curei", "aprendi"],
        phrases: ["amor da minha vida", "saudade bateu", "coração apaixonado", "resenha boa", "pagode é vida"],
      },
      forbidden: {
        aggressive_tone: ["odeio", "vingança", "destruir", "te odeio"],
        excessive_drama: ["morro sem você", "não vivo mais", "meu mundo acabou"],
      },
      style: "Poético mas acessível, com emoção genuína e autenticidade. Linguagem do dia-a-dia com toque romântico.",
    },
    structure_rules: {
      verse: { lines: 4, purpose: "Contar história de amor com detalhes autênticos e emoção real" },
      chorus: {
        lines_options: [2, 4],
        forbidden_lines: 3,
        required_elements: ["Melodia marcante", "Emoção clara", "Fácil de cantar junto"],
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
      rhythm_style: "Pagode com cavaquinho, pandeiro e tantã - ritmo contagiante",
    },
  },
  "Gospel Contemporâneo": {
    year_range: "2024-2025",
    reference_artists: ["Gabriela Rocha", "Isadora Pompeo", "Thalles Roberto", "Valesca Mayssa", "Kailane Frauches"],
    core_principles: {
      theme: "Fé autêntica, esperança, gratidão, adoração, confiança em Deus, testemunho de vida",
      tone: "Inspirador, positivo, edificante, jovem e atual",
      narrative_arc: "Situação difícil ou louvor → Fé e confiança → Vitória, paz ou adoração",
    },
    language_rules: {
      allowed: {
        concrete_objects: ["cruz", "altar", "céu", "luz", "caminho", "promessa", "milagre"],
        actions: ["louvar", "adorar", "crer", "confiar", "vencer", "testemunhar", "agradecer"],
        phrases: [
          "Deus é fiel",
          "milagre aconteceu",
          "fé que move montanhas",
          "Ele cuida dos detalhes",
          "não há o que temer",
        ],
      },
      forbidden: {
        negative_theology: ["Deus castiga", "merecimento por obras", "Deus pune"],
        manipulation: ["dê dinheiro para ser abençoado", "prosperidade garantida"],
      },
      style:
        "Inspirador, poético mas acessível, com linguagem jovem e atual. Produção sofisticada com elementos modernos.",
    },
    structure_rules: {
      verse: { lines: 4, purpose: "Contar testemunho, louvor ou situação de fé" },
      chorus: {
        lines_options: [2, 4],
        forbidden_lines: 3,
        required_elements: ["Mensagem clara de fé", "Fácil de cantar em grupo", "Melodia marcante"],
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
      rhythm_style: "Pop gospel com instrumentação moderna, elementos eletrônicos sutis, produção sofisticada",
    },
  },
  MPB: {
    year_range: "2024-2025",
    reference_artists: ["Djavan", "Marisa Monte", "Gilberto Gil", "Caetano Veloso", "Gal Costa"],
    core_principles: {
      theme: "Temas sociais, culturais, amor sofisticado, identidade brasileira, fusão de tradições",
      tone: "Poético, sofisticado, reflexivo, com riqueza lírica",
      narrative_arc: "Observação ou situação → Reflexão profunda → Insight ou mensagem cultural",
    },
    language_rules: {
      allowed: {
        concrete_objects: ["violão", "samba", "bossa", "mar", "cidade", "rua", "gente", "Brasil"],
        actions: ["cantar", "dançar", "sentir", "viver", "amar", "resistir", "celebrar"],
        phrases: ["Brasil profundo", "alma brasileira", "ritmo que nos une", "tradição e inovação"],
      },
      forbidden: {
        simplistic_cliches: ["amor perfeito", "felizes para sempre"],
        commercial_pop: ["hit do verão", "balada top"],
      },
      style: "Poético, sofisticado, com riqueza lírica e fusão de estilos. Linguagem elevada mas acessível.",
    },
    structure_rules: {
      verse: { lines: 4, purpose: "Desenvolver narrativa ou reflexão com profundidade lírica" },
      chorus: {
        lines_options: [2, 4],
        forbidden_lines: 3,
        required_elements: ["Mensagem cultural ou emocional forte", "Melodia memorável"],
      },
    },
    prosody_rules: {
      syllable_count: {
        with_comma: { max_before_comma: 7, max_after_comma: 5, total_max: 12 },
        without_comma: { min: 5, max: 10, acceptable_up_to: 12 },
      },
      verse_counting_rule: "Uma linha com vírgula (6+6, 7+5 ou 5+7 sílabas) conta como 2 VERSOS na estrutura total",
    },
    harmony_and_rhythm: {
      key: "Variable",
      allowed_chords: ["Complexos e jazzísticos permitidos"],
      bpm_range: { min: 70, max: 120, ideal: 90 },
      rhythm_style: "Fusão de samba, bossa nova, tropicália, rock, pop, eletrônico - ecleticismo característico",
    },
  },
  Bachata: {
    year_range: "2024-2025",
    reference_artists: ["Romeo Santos", "Prince Royce", "Aventura", "Grupo Extra", "Pinto Picasso"],
    core_principles: {
      theme: "Amor romântico, saudade, paixão, relacionamentos modernos, bachata urbana",
      tone: "Romântico, sensual, emotivo, com toque urbano contemporâneo",
      narrative_arc: "Situação amorosa → Sentimento profundo → Declaração ou resolução",
    },
    language_rules: {
      allowed: {
        concrete_objects: ["corazón", "amor", "besos", "noche", "luna", "baile"],
        actions: ["amar", "bailar", "sentir", "extrañar", "soñar", "besar"],
        phrases: ["mi amor", "te extraño", "eres mi vida", "bachata del alma"],
      },
      forbidden: {
        aggressive_tone: ["odio", "venganza"],
        modern_slang_excess: ["emoji", "selfie", "viral"],
      },
      style: "Romântico, poético, com sensualidade elegante. Pode ter toque urbano mas mantém romantismo.",
    },
    structure_rules: {
      verse: { lines: 4, purpose: "Desenvolver história de amor com emoção" },
      chorus: {
        lines_options: [2, 4],
        forbidden_lines: 3,
        required_elements: ["Melodia romântica marcante", "Fácil de dançar"],
      },
    },
    prosody_rules: {
      syllable_count: {
        with_comma: { max_before_comma: 7, max_after_comma: 5, total_max: 12 },
        without_comma: { min: 6, max: 9, acceptable_up_to: 10 },
      },
      verse_counting_rule: "Uma linha com vírgula (6+6, 7+5 ou 5+7 sílabas) conta como 2 VERSOS na estrutura total",
    },
    harmony_and_rhythm: {
      key: "A minor",
      allowed_chords: ["Am", "Dm", "E", "F", "G", "C"],
      bpm_range: { min: 120, max: 140, ideal: 128 },
      rhythm_style: "Bachata tradicional ou urbana com guitarra característica e bongô",
    },
  },
  Arrocha: {
    year_range: "2024-2025",
    reference_artists: ["Pablo", "Nadson Ferinha", "Thiago Aquino", "Unha Pintada", "Tierry"],
    core_principles: {
      theme: "Traição, desilusão amorosa, sofrimento romântico, arrependimento, saudade intensa",
      tone: "Melancólico, emotivo, dramático mas autêntico, com sofrimento genuíno",
      narrative_arc: "Traição ou perda → Sofrimento e reflexão → Aceitação ou esperança de volta",
    },
    language_rules: {
      allowed: {
        concrete_objects: ["cama", "foto", "celular", "mensagem", "bebida", "bar", "madrugada"],
        actions: ["sofrer", "chorar", "lembrar", "perdoar", "voltar", "errar", "trair"],
        phrases: ["quem ama não machuca", "você me traiu", "saudade dói", "volta pra mim", "te perdoo"],
      },
      forbidden: {
        violence: ["vou te matar", "vingança violenta"],
        excessive_vulgarity: ["palavrões pesados"],
      },
      style: "Emotivo, direto, com drama autêntico. Linguagem do dia-a-dia com carga emocional forte.",
    },
    structure_rules: {
      verse: { lines: 4, purpose: "Contar história de traição ou desilusão com detalhes emocionais" },
      chorus: {
        lines_options: [2, 4],
        forbidden_lines: 3,
        required_elements: ["Gancho emocional forte", "Fácil de cantar junto", "Carga dramática"],
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
      key: "E minor",
      allowed_chords: ["Em", "Am", "D", "G", "C", "B7"],
      bpm_range: { min: 70, max: 85, ideal: 75 },
      rhythm_style: "Arrocha lento e melódico com teclado e guitarra",
    },
  },
  Samba: {
    year_range: "2024-2025",
    reference_artists: ["Alcione", "Zeca Pagodinho", "Diogo Nogueira", "Martinho da Vila", "Beth Carvalho"],
    core_principles: {
      theme: "Vida, alegria, saudade, amor, resistência cultural, celebração da cultura brasileira",
      tone: "Alegre, nostálgico, autêntico, com swing característico",
      narrative_arc: "Situação cotidiana → Reflexão ou celebração → Mensagem de vida ou alegria",
    },
    language_rules: {
      allowed: {
        concrete_objects: ["pandeiro", "cavaquinho", "roda de samba", "mesa de bar", "cerveja", "feijoada"],
        actions: ["sambar", "cantar", "dançar", "celebrar", "resistir", "viver"],
        phrases: ["samba é vida", "roda de samba", "alegria do povo", "cultura brasileira"],
      },
      forbidden: {
        modern_excess: ["viral", "trending", "hashtag"],
      },
      style: "Autêntico, com swing, linguagem do povo mas poética. Celebração da cultura brasileira.",
    },
    structure_rules: {
      verse: { lines: 4, purpose: "Contar história de vida, amor ou celebração cultural" },
      chorus: {
        lines_options: [2, 4],
        forbidden_lines: 3,
        required_elements: ["Melodia marcante", "Fácil de cantar em roda", "Swing característico"],
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
      key: "C major",
      allowed_chords: ["C", "G", "Am", "F", "Dm", "E7", "A7", "D7"],
      bpm_range: { min: 100, max: 130, ideal: 115 },
      rhythm_style: "Samba tradicional com pandeiro, cavaquinho, surdo e tamborim",
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
          concrete_objects: [] as any,
          actions: [] as any,
          phrases: [] as any,
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
    } as unknown as GenreConfig & { name: string }
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

  // Validar contagem de sílabas - USANDO O NOVO SISTEMA
  const lines = lyrics.split("\n").filter((line) => line.trim() && !line.startsWith("["))
  lines.forEach((line, index) => {
    const syllables = countPoeticSyllables(line) // ← CORRIGIDO: usa o novo sistema
    const rules = config.prosody_rules.syllable_count

    if ("with_comma" in rules && line.includes(",")) {
      const [before, after] = line.split(",")
      const beforeCount = countPoeticSyllables(before) // ← CORRIGIDO
      const afterCount = countPoeticSyllables(after) // ← CORRIGIDO

      if (beforeCount > rules.with_comma.max_before_comma) {
        warnings.push(`Linha ${index + 1}: Muitas sílabas antes da vírgula (${beforeCount})`)
      }
      if (afterCount > rules.with_comma.max_after_comma) {
        warnings.push(`Linha ${index + 1}: Muitas sílabas depois da vírgula (${afterCount})`)
      }
    } else if ("absolute_max" in rules) {
      // For Sertanejo Moderno genres with absolute_max rule
      if (syllables > rules.absolute_max) {
        errors.push(`Linha ${index + 1}: Excede o limite de ${rules.absolute_max} sílabas (${syllables})`)
      }
    } else if ("without_comma" in rules) {
      // For genres with without_comma rules
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

export const SUB_GENRE_INSTRUMENTS = {
  // Sertanejo sub-genres
  arrocha: {
    instruments: "keyboard, acoustic guitar, bass, light percussion",
    bpm_range: { min: 70, max: 85, ideal: 75 },
    rhythm: "Arrocha",
    style_note: "Arrocha lento e melódico",
  },
  vanera: {
    instruments: "accordion, acoustic guitar, bass, drums",
    bpm_range: { min: 110, max: 130, ideal: 120 },
    rhythm: "Vanera",
    style_note: "Vanera dançante",
  },
  modão: {
    instruments: "acoustic guitar, electric guitar, bass, drums, harmonica",
    bpm_range: { min: 85, max: 95, ideal: 90 },
    rhythm: "Modão",
    style_note: "Modão tradicional",
  },

  // Forró sub-genres
  xote: {
    instruments: "zabumba, triangle, accordion",
    bpm_range: { min: 100, max: 120, ideal: 110 },
    rhythm: "Xote",
    style_note: "Xote tradicional",
  },
  baião: {
    instruments: "zabumba, triangle, accordion, guitar",
    bpm_range: { min: 120, max: 140, ideal: 130 },
    rhythm: "Baião",
    style_note: "Baião animado",
  },

  // Pagode sub-genres
  "pagode 90": {
    instruments: "cavaquinho, pandeiro, tantã, surdo, acoustic guitar",
    bpm_range: { min: 95, max: 110, ideal: 100 },
    rhythm: "Pagode 90",
    style_note: "Pagode anos 90",
  },
  "pagode romântico": {
    instruments: "cavaquinho, pandeiro, tantã, acoustic guitar",
    bpm_range: { min: 90, max: 105, ideal: 95 },
    rhythm: "Pagode Romântico",
    style_note: "Pagode romântico",
  },
} as const

export function detectSubGenre(additionalRequirements: string | undefined): {
  subGenre: string | null
  instruments: string | null
  bpm: number | null
  rhythm: string | null
  styleNote: string | null
} {
  if (!additionalRequirements) {
    return { subGenre: null, instruments: null, bpm: null, rhythm: null, styleNote: null }
  }

  const text = additionalRequirements.toLowerCase()

  for (const [subGenre, config] of Object.entries(SUB_GENRE_INSTRUMENTS)) {
    if (text.includes(subGenre)) {
      return {
        subGenre,
        instruments: config.instruments,
        bpm: config.bpm_range.ideal,
        rhythm: config.rhythm,
        styleNote: config.style_note,
      }
    }
  }

  return { subGenre: null, instruments: null, bpm: null, rhythm: null, styleNote: null }
}

export const GENRE_RHYTHMS = {
  "Sertanejo Moderno Feminino": "Sertanejo Moderno",
  "Sertanejo Moderno Masculino": "Sertanejo Moderno",
  "Sertanejo Universitário": "Sertanejo Universitário",
  "Sertanejo Raiz": "Toada",
  "Forró Pé de Serra": "Forró Pé de Serra",
  "Funk Carioca": "Funk Carioca",
  "Funk Melody": "Funk Melody",
  "Funk Consciente": "Funk Consciente",
  "Pagode Romântico": "Pagode Romântico",
  "Gospel Contemporâneo": "Gospel Pop",
  MPB: "MPB",
  Bachata: "Bachata",
  Arrocha: "Arrocha",
  Samba: "Samba de Raiz",
} as const

export function getGenreRhythm(genre: string): string {
  return GENRE_RHYTHMS[genre as keyof typeof GENRE_RHYTHMS] || genre
}
