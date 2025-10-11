import { SERTANEJO_MODERNO_2024 } from "./sertanejo_moderno_2024"
import { FORRO_2024 } from "./forro_2024"
import { MPB_2024 } from "./mpb_2024"
import { GOSPEL_2024 } from "./gospel_2024"
import { POP_BRASILEIRO_2024 } from "./pop_brasileiro_2024"
import { ROCK_BRASILEIRO_2024 } from "./rock_brasileiro_2024"
import { SAMBA_2024 } from "./samba_2024"
import { BACHATA_BRASILEIRA_2024 } from "./bachata_brasileira_2024"
import { funkRules2024 } from "./funk_2024"

export const GENRE_RULES = {
  "Sertanejo Moderno": SERTANEJO_MODERNO_2024,
  "Forró Pé de Serra": FORRO_2024,
  "Forró Universitário": FORRO_2024,
  "Forró Eletrônico": FORRO_2024,
  "Funk Carioca": funkRules2024,
  "Funk Melody": funkRules2024,
  "Funk Ostentação": funkRules2024,
  "Funk Consciente": funkRules2024,
  "MPB Clássica": MPB_2024,
  "MPB Moderna": MPB_2024,
  "Gospel Contemporâneo": GOSPEL_2024,
  "Gospel Tradicional": GOSPEL_2024,
  "Gospel Sertanejo": GOSPEL_2024,
  "Pop Brasileiro": POP_BRASILEIRO_2024,
  "Pop Internacional": POP_BRASILEIRO_2024,
  "Pop Rock": POP_BRASILEIRO_2024,
  "Rock Nacional": ROCK_BRASILEIRO_2024,
  "Rock Alternativo": ROCK_BRASILEIRO_2024,
  "Rock Clássico": ROCK_BRASILEIRO_2024,
  "Samba de Raiz": SAMBA_2024,
  "Samba Pagode": SAMBA_2024,
  "Samba Enredo": SAMBA_2024,
  "Samba Rock": SAMBA_2024,
  "Pagode Romântico": SAMBA_2024,
  "Pagode 90": SAMBA_2024,
  "Pagode Baiano": SAMBA_2024,
  "Bachata Tradicional": BACHATA_BRASILEIRA_2024,
  "Bachata Moderna": BACHATA_BRASILEIRA_2024,
} as const

export type GenreKey = keyof typeof GENRE_RULES

export function getGenreRules(genre: string) {
  return GENRE_RULES[genre as GenreKey] || SERTANEJO_MODERNO_2024
}
