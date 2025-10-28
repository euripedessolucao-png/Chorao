import { GENRE_CONFIGS, INSTRUMENTATION_RULES } from "@/lib/genre-config"

/**
 * Normaliza o nome do gênero para corresponder exatamente às chaves do GENRE_CONFIGS
 */
export function normalizeGenreName(genre: string): string {
  const normalized = genre.trim()

  // Verifica se já existe exatamente no GENRE_CONFIGS
  if (normalized in GENRE_CONFIGS) {
    return normalized
  }

  const genreMap: Record<string, string> = {
    // Sertanejo - mantém específico, não mapeia para genérico
    "sertanejo raiz": "Sertanejo Raiz",
    "sertanejo de raiz": "Sertanejo Raiz",
    "sertanejo universitario": "Sertanejo Universitário",
    "sertanejo universitário": "Sertanejo Universitário",
    "sertanejo romantico": "Sertanejo Romântico",
    "sertanejo romântico": "Sertanejo Romântico",
    "sertanejo moderno feminino": "Sertanejo Moderno Feminino",
    "sertanejo moderno masculino": "Sertanejo Moderno Masculino",
    // Outros gêneros
    funk: "Funk Carioca",
    "funk carioca": "Funk Carioca",
    "funk melody": "Funk Melody",
    "funk consciente": "Funk Consciente",
    pagode: "Pagode Romântico",
    "pagode romantico": "Pagode Romântico",
    "pagode romântico": "Pagode Romântico",
    samba: "Samba",
    mpb: "MPB",
    forro: "Forró Pé de Serra",
    forró: "Forró Pé de Serra",
    "forro pe de serra": "Forró Pé de Serra",
    "forró pé de serra": "Forró Pé de Serra",
    arrocha: "Arrocha",
    gospel: "Gospel Contemporâneo",
    "gospel contemporaneo": "Gospel Contemporâneo",
    "gospel contemporâneo": "Gospel Contemporâneo",
    bachata: "Bachata",
  }

  const lowerGenre = normalized.toLowerCase()

  // Busca exata no mapeamento primeiro
  if (genreMap[lowerGenre]) {
    return genreMap[lowerGenre]
  }

  // Busca parcial APENAS se não encontrou exata
  // Prioriza matches mais específicos
  if (lowerGenre.includes("raiz")) {
    return "Sertanejo Raiz"
  }
  if (lowerGenre.includes("moderno feminino")) {
    return "Sertanejo Moderno Feminino"
  }
  if (lowerGenre.includes("moderno masculino")) {
    return "Sertanejo Moderno Masculino"
  }
  if (lowerGenre.includes("universitário") || lowerGenre.includes("universitario")) {
    return "Sertanejo Universitário"
  }

  // Se não encontrar, retorna o original
  return normalized
}

/**
 * Obtém a instrumentação específica do gênero
 */
export function getGenreInstrumentation(genre: string): string[] {
  const normalizedGenre = normalizeGenreName(genre)

  if (normalizedGenre in INSTRUMENTATION_RULES) {
    const instrumentation = INSTRUMENTATION_RULES[normalizedGenre as keyof typeof INSTRUMENTATION_RULES]
    // Parse the required instruments from the format "(Instrumental: ...)"
    const match = instrumentation.required.match(/\$\$Instrumental: ([^)]+)\$\$/)
    if (match) {
      return match[1].split(", ").map((inst) => inst.trim())
    }
  }

  return ["Violão", "Guitarra", "Baixo", "Bateria"]
}

/**
 * Extrai instrumentos dos colchetes de performance na letra
 */
export function extractInstrumentsFromLyrics(lyrics: string): string[] {
  const instruments = new Set<string>()
  const lines = lyrics.split("\n")

  for (const line of lines) {
    // Procura por padrões como [PART A - Verse 1 - acoustic guitar, bass, light percussion]
    const match = line.match(/\[.*?-\s*([^\]]+)\]/)
    if (match) {
      const instrumentsPart = match[1]
      // Verifica se contém instrumentos (não é apenas "Verse 1" ou "Chorus")
      if (
        instrumentsPart.includes(",") ||
        instrumentsPart.match(/guitar|bass|drum|percussion|accordion|viola|sanfona/i)
      ) {
        const instList = instrumentsPart.split(",").map((inst) => inst.trim())
        instList.forEach((inst) => {
          // Filtra apenas instrumentos válidos
          if (inst && !inst.match(/^(verse|chorus|bridge|part|intro|outro)/i)) {
            instruments.add(inst)
          }
        })
      }
    }
  }

  return Array.from(instruments)
}

/**
 * Formata a instrumentação para IA de canto com instruções em inglês
 */
export function formatInstrumentationForAI(genre: string, lyrics?: string): string {
  const normalizedGenre = normalizeGenreName(genre)

  let instruments: string[]
  if (lyrics) {
    const extractedInstruments = extractInstrumentsFromLyrics(lyrics)
    instruments = extractedInstruments.length > 0 ? extractedInstruments : getGenreInstrumentation(genre)
  } else {
    instruments = getGenreInstrumentation(genre)
  }

  // Tradução de instrumentos para inglês
  const instrumentTranslation: Record<string, string> = {
    Violão: "Acoustic Guitar",
    "viola caipira": "Viola Caipira",
    "acoustic guitar": "Acoustic Guitar",
    Guitarra: "Electric Guitar",
    "electric guitar": "Electric Guitar",
    Baixo: "Bass",
    bass: "Bass",
    Bateria: "Drums",
    drums: "Drums",
    "light percussion": "Light Percussion",
    percussion: "Percussion",
    Teclado: "Keyboard",
    Sanfona: "Accordion",
    sanfona: "Accordion",
    accordion: "Accordion",
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

  const translatedInstruments = instruments.map((inst) => {
    const lower = inst.toLowerCase()
    return instrumentTranslation[inst] || instrumentTranslation[lower] || inst
  })

  // Remove duplicatas e capitaliza
  const uniqueInstruments = Array.from(new Set(translatedInstruments))

  return `\n\n(Instrumentation)\n(Genre: ${normalizedGenre})\n(Instruments: ${uniqueInstruments.join(", ")})`
}

/**
 * Adiciona instrumentação ao final da letra formatada
 */
export function addInstrumentationToLyrics(lyrics: string, genre: string): string {
  // Remove instrumentação existente se houver
  const cleanedLyrics = lyrics.replace(/\n*---\n\[Instrumentation\][\s\S]*?---\n*/g, "")

  const instrumentation = formatInstrumentationForAI(genre, cleanedLyrics)

  return cleanedLyrics.trim() + instrumentation
}
