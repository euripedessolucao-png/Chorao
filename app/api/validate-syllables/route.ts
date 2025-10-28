import { NextResponse } from "next/server"
import { validateSyllablesByGenre } from "@/lib/validation/absolute-syllable-enforcer"

export async function POST(request: Request) {
  try {
    const { lyrics, genre = "sertanejo", maxSyllables } = await request.json()

    if (!lyrics || typeof lyrics !== "string") {
      return NextResponse.json({ error: "Letra é obrigatória para validação" }, { status: 400 })
    }

    const validation = validateSyllablesByGenre(lyrics, genre)

    return NextResponse.json({
      isValid: validation.isValid,
      violations: validation.violations,
      message: validation.message,
      maxSyllables: validation.maxSyllables,
    })
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
