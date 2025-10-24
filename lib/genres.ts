// lib/genres/genre-system.ts

/**
 * Definição de um gênero musical com metadados
 */
export interface GenreMetadata {
  /** Nome exibido na UI */
  label: string
  /** Subgêneros com metadados próprios */
  subgenres: SubgenreMetadata[]
  /** Características estilísticas (opcional) */
  stylisticTraits?: string[]
}

export interface SubgenreMetadata {
  /** Nome do subgênero */
  name: string
  /** Rótulo amigável */
  label: string
  /** Descrição curta (para IA ou tooltips) */
  description?: string
  /** Palavras-chave associadas */
  keywords?: string[]
}

/**
 * Hierarquia de gêneros com metadados completos
 */
export const GENRE_HIERARCHY = {
  Sertanejo: {
    label: "Sertanejo",
    stylisticTraits: ["narrativa romântica", "rima rica", "voz em dueto"],
    subgenres: [
      { name: "Sertanejo Moderno Feminino", label: "Moderno (Feminino)" },
      { name: "Sertanejo Moderno Masculino", label: "Moderno (Masculino)" },
      { name: "Sertanejo Universitário", label: "Universitário" },
      { name: "Sertanejo Raiz", label: "Raiz", keywords: ["viola", "roça", "tradição"] },
      {
        name: "Sertanejo Sofrência",
        label: "Sofrência",
        keywords: ["dor de cotovelo", "choro", "fim de relacionamento"],
      },
      { name: "Sertanejo Romântico", label: "Romântico", keywords: ["declaração", "paixão", "lua"] },
    ],
  },
  Forró: {
    label: "Forró",
    stylisticTraits: ["ritmo dançante", "sanfona", "temas de festa"],
    subgenres: [
      { name: "Forró Pé de Serra", label: "Pé de Serra" },
      { name: "Forró Eletrônico", label: "Eletrônico" },
      { name: "Forró Universitário", label: "Universitário" },
    ],
  },
  Funk: {
    label: "Funk",
    stylisticTraits: ["batida repetitiva", "flow rítmico", "temas urbanos"],
    subgenres: [
      { name: "Funk Carioca", label: "Carioca" },
      { name: "Funk Melody", label: "Melody" },
      { name: "Funk Ostentação", label: "Ostentação" },
      { name: "Funk Consciente", label: "Consciente", keywords: ["crítica social", "reflexão"] },
    ],
  },
  Pagode: {
    label: "Pagode",
    stylisticTraits: ["pandeiro", "temas de amor e cotidiano", "swing suave"],
    subgenres: [
      { name: "Pagode Romântico", label: "Romântico" },
      { name: "Pagode 90", label: "Anos 90" },
      { name: "Pagode Baiano", label: "Baiano" },
    ],
  },
  MPB: {
    label: "MPB",
    stylisticTraits: ["letra poética", "harmonia complexa", "experimentação"],
    subgenres: [
      { name: "MPB Clássica", label: "Clássica (60–80)" },
      { name: "MPB Moderna", label: "Moderna (90–atual)" },
    ],
  },
  Samba: {
    label: "Samba",
    stylisticTraits: ["percussão marcante", "rima interna", "temas sociais"],
    subgenres: [
      { name: "Samba de Raiz", label: "de Raiz" },
      { name: "Samba Pagode", label: "Pagode" },
      { name: "Samba Enredo", label: "Enredo" },
      { name: "Samba Rock", label: "Rock" },
    ],
  },
  Gospel: {
    label: "Gospel",
    stylisticTraits: ["mensagens de fé", "coros poderosos", "temas de superação"],
    subgenres: [
      { name: "Gospel Contemporâneo", label: "Contemporâneo" },
      { name: "Gospel Tradicional", label: "Tradicional" },
      { name: "Gospel Sertanejo", label: "Sertanejo Gospel" },
    ],
  },
  Pop: {
    label: "Pop",
    stylisticTraits: ["gancho marcante", "produção polida", "apelo comercial"],
    subgenres: [
      { name: "Pop Brasileiro", label: "Brasileiro" },
      { name: "Pop Internacional", label: "Internacional" },
      { name: "Pop Rock", label: "Rock" },
    ],
  },
  Rock: {
    label: "Rock",
    stylisticTraits: ["guitarra distorcida", "energia crua", "atitude"],
    subgenres: [
      { name: "Rock Nacional", label: "Nacional" },
      { name: "Rock Alternativo", label: "Alternativo" },
      { name: "Rock Clássico", label: "Clássico" },
    ],
  },
  Bachata: {
    label: "Bachata",
    stylisticTraits: ["ritmo sensual", "guiro", "temas de amor e desamor"],
    subgenres: [
      { name: "Bachata Tradicional", label: "Tradicional" },
      { name: "Bachata Moderna", label: "Moderna" },
    ],
  },
  "Outros Gêneros": {
    label: "Outros Gêneros",
    subgenres: [
      { name: "Axé", label: "Axé" },
      { name: "Bossa Nova", label: "Bossa Nova" },
      { name: "Reggae", label: "Reggae" },
      { name: "Hip Hop", label: "Hip Hop" },
      { name: "Trap", label: "Trap" },
      { name: "R&B", label: "R&B" },
    ],
  },
} as const

// ✅ Inferência de tipos
export type MainGenre = keyof typeof GENRE_HIERARCHY
export type Subgenre = (typeof GENRE_HIERARCHY)[MainGenre]["subgenres"][number]["name"]
export type AnyGenre = MainGenre | Subgenre

/**
 * Lista plana de todos os gêneros (principais + subgêneros)
 */
export const FLAT_GENRES = Object.entries(GENRE_HIERARCHY).flatMap(([mainGenre, data]) => [
  mainGenre,
  ...data.subgenres.map((sg) => sg.name),
]) as readonly AnyGenre[]

/**
 * Mapeamento reverso: subgênero → gênero principal
 */
export const SUBGENRE_TO_MAIN_GENRE = Object.entries(GENRE_HIERARCHY).reduce(
  (acc, [mainGenre, data]) => {
    data.subgenres.forEach((sub) => {
      acc[sub.name as Subgenre] = mainGenre as MainGenre
    })
    return acc
  },
  {} as Record<Subgenre, MainGenre>,
)

/**
 * Normaliza um nome de gênero para comparação (case-insensitive, remove acentos)
 */
function normalizeGenre(genre: string): string {
  return genre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

/**
 * Encontra o gênero principal a partir de qualquer string (flexível)
 */
export function findMainGenre(input: string): MainGenre | null {
  if (!input) return null

  const normalizedInput = normalizeGenre(input)

  // Verifica se é um gênero principal
  for (const mainGenre of Object.keys(GENRE_HIERARCHY) as MainGenre[]) {
    if (normalizeGenre(mainGenre) === normalizedInput) {
      return mainGenre
    }
  }

  // Verifica se é um subgênero
  for (const [subgenre, mainGenre] of Object.entries(SUBGENRE_TO_MAIN_GENRE)) {
    if (normalizeGenre(subgenre) === normalizedInput) {
      return mainGenre as MainGenre
    }
  }

  // Busca parcial (útil para inputs de IA)
  for (const mainGenre of Object.keys(GENRE_HIERARCHY) as MainGenre[]) {
    if (normalizedInput.includes(normalizeGenre(mainGenre))) {
      return mainGenre
    }
  }

  return null
}

/**
 * Humores e emoções (agora com tipagem segura)
 */
export const MOODS = [
  "Feliz",
  "Triste",
  "Nostálgico",
  "Apaixonado",
  "Revoltado",
  "Esperançoso",
  "Melancólico",
  "Empolgado",
  "Reflexivo",
  "Confiante",
] as const

export type Mood = (typeof MOODS)[number]

export const EMOTIONS = [
  "Alegria",
  "Alívio",
  "Amor",
  "Ansiedade",
  "Confusão",
  "Conexão",
  "Coragem",
  "Culpa",
  "Desapego",
  "Desilusão",
  "Desprezo",
  "Empolgação",
  "Empoderamento",
  "Encantamento",
  "Esperança",
  "Euforia",
  "Gratidão",
  "Inveja",
  "Liberdade",
  "Medo",
  "Melancolia",
  "Nostalgia",
  "Orgulho",
  "Paixão",
  "Paz",
  "Raiva",
  "Saudade",
  "Solidão",
  "Tensão",
  "Ternura",
  "Tristeza",
  "Vergonha",
] as const

export type Emotion = (typeof EMOTIONS)[number]
