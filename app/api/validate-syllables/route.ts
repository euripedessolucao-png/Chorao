import { NextResponse } from "next/server"
import { validateLyricsSyllables } from "@/lib/validation/syllable-counter-brasileiro"
import { AbsoluteSyllableEnforcer } from "@/lib/validation/absolute-syllable-enforcer"

export async function POST(request: Request) {
  try {
    const { lyrics, maxSyllables = 12 } = await request.json()

    if (!lyrics || typeof lyrics !== "string") {
      return NextResponse.json({ error: "Letra é obrigatória para validação" }, { status: 400 })
    }

    const validation = validateLyricsSyllables(lyrics, maxSyllables)

    return NextResponse.json(validation)
  } catch (error) {
    console.error("[API] Erro na validação de sílabas:", error)
    return NextResponse.json(
      {
        error: "Erro interno na validação",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
