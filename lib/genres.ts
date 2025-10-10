export const GENRE_HIERARCHY = {
  Sertanejo: {
    label: "Sertanejo",
    subgenres: [
      "Sertanejo Moderno Feminino",
      "Sertanejo Moderno Masculino",
      "Sertanejo Universitário",
      "Sertanejo Raiz",
      "Sertanejo Sofrência",
      "Sertanejo Romântico",
    ],
  },
  Forró: {
    label: "Forró",
    subgenres: ["Forró Pé de Serra", "Forró Eletrônico", "Forró Universitário"],
  },
  Funk: {
    label: "Funk",
    subgenres: ["Funk Carioca", "Funk Melody", "Funk Ostentação", "Funk Consciente"],
  },
  Pagode: {
    label: "Pagode",
    subgenres: ["Pagode Romântico", "Pagode 90", "Pagode Baiano"],
  },
  MPB: {
    label: "MPB",
    subgenres: ["MPB Clássica", "MPB Moderna"],
  },
  Samba: {
    label: "Samba",
    subgenres: ["Samba de Raiz", "Samba Pagode", "Samba Enredo", "Samba Rock"],
  },
  Gospel: {
    label: "Gospel",
    subgenres: ["Gospel Contemporâneo", "Gospel Tradicional", "Gospel Sertanejo"],
  },
  Pop: {
    label: "Pop",
    subgenres: ["Pop Brasileiro", "Pop Internacional", "Pop Rock"],
  },
  Rock: {
    label: "Rock",
    subgenres: ["Rock Nacional", "Rock Alternativo", "Rock Clássico"],
  },
  Bachata: {
    label: "Bachata",
    subgenres: ["Bachata Tradicional", "Bachata Moderna"],
  },
  "Outros Gêneros": {
    label: "Outros Gêneros",
    subgenres: ["Axé", "Bossa Nova", "Reggae", "Hip Hop", "Trap", "R&B"],
  },
} as const

export const FLAT_GENRES = Object.entries(GENRE_HIERARCHY).flatMap(([parent, data]) => [parent, ...data.subgenres])

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
