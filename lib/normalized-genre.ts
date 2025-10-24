import { GENRE_CONFIGS } from "@/lib/genre-config"

/**
 * Normaliza o nome do gênero para corresponder exatamente às chaves do GENRE_CONFIGS
 */
export function normalizeGenreName(genre: string): string {
  const normalized = genre.trim()

  // Verifica se já existe exatamente no GENRE_CONFIGS
  if (GENRE_CONFIGS[normalized]) {
    return normalized
  }

  // Mapeamento de variações comuns para nomes oficiais
  const genreMap: Record<string, string> = {
    sertanejo: "Sertanejo Moderno",
    "sertanejo moderno": "Sertanejo Moderno",
    "sertanejo raiz": "Sertanejo Raiz",
    "sertanejo universitario": "Sertanejo Universitário",
    "sertanejo universitário": "Sertanejo Universitário",
    "sertanejo romantico": "Sertanejo Romântico",
    "sertanejo romântico": "Sertanejo Romântico",
    funk: "Funk Carioca",
    "funk carioca": "Funk Carioca",
    pagode: "Pagode",
    samba: "Samba",
    mpb: "MPB",
    forro: "Forró",
    forró: "Forró",
    arrocha: "Arrocha",
    gospel: "Gospel",
    bachata: "Bachata",
    "bachata brasileira": "Bachata Brasileira",
  }

  const lowerGenre = normalized.toLowerCase()

  // Busca no mapeamento
  if (genreMap[lowerGenre]) {
    return genreMap[lowerGenre]
  }

  // Busca parcial (ex: "Sertanejo Moderno Feminino" contém "Sertanejo")
  for (const [key, value] of Object.entries(genreMap)) {
    if (lowerGenre.includes(key)) {
      return value
    }
  }

  // Se não encontrar, retorna o original
  return normalized
}

/**
 * Obtém a instrumentação específica do gênero
 */
export function getGenreInstrumentation(genre: string): string[] {
  const normalizedGenre = normalizeGenreName(genre)
  const config = GENRE_CONFIGS[normalizedGenre]

  if (!config) {
    return ["Violão", "Guitarra", "Baixo", "Bateria"]
  }

  // Retorna instrumentação do config ou padrão
  return config.instrumentation || ["Violão", "Guitarra", "Baixo", "Bateria"]
}

/**
 * Formata a instrumentação para IA de canto com instruções em inglês
 */
export function formatInstrumentationForAI(genre: string): string {
  const instruments = getGenreInstrumentation(genre)
  const normalizedGenre = normalizeGenreName(genre)

  // Tradução de instrumentos para inglês
  const instrumentTranslation: Record<string, string> = {
    Violão: "Acoustic Guitar",
    Guitarra: "Electric Guitar",
    Baixo: "Bass",
    Bateria: "Drums",
    Teclado: "Keyboard",
    Sanfona: "Accordion",
    Zabumba: "Zabumba",
    Triângulo: "Triangle",
    Pandeiro: "Pandeiro",
    Cavaquinho: "Cavaquinho",
    Tantã: "Tantã",
    Surdo: "Surdo",
    Agogô: "Agogô",
    Cuíca: "Cuíca",
    Repique: "Repique",
    Tamborim: "Tamborim",
    Saxofone: "Saxophone",
    Trompete: "Trumpet",
    Trombone: "Trombone",
    Flauta: "Flute",
    Violino: "Violin",
    Viola: "Viola",
    Contrabaixo: "Double Bass",
    Piano: "Piano",
    Órgão: "Organ",
    Sintetizador: "Synthesizer",
    Percussão: "Percussion",
    "Backing Vocals": "Backing Vocals",
    Coro: "Choir",
  }

  const translatedInstruments = instruments.map((inst) => instrumentTranslation[inst] || inst)

  return `\n\n---\n[Instrumentation]\nGenre: ${normalizedGenre}\nInstruments: ${translatedInstruments.join(", ")}\n---`
}

/**
 * Adiciona instrumentação ao final da letra formatada
 */
export function addInstrumentationToLyrics(lyrics: string, genre: string): string {
  // Remove instrumentação existente se houver
  const cleanedLyrics = lyrics.replace(/\n*---\n\[Instrumentation\][\s\S]*?---\n*/g, "")

  // Adiciona nova instrumentação
  const instrumentation = formatInstrumentationForAI(genre)

  return cleanedLyrics.trim() + instrumentation
}
