// __tests__/parser.test.ts

import { parseLyricSections } from "@/lib/validation/parser"

describe("Parser de Letras", () => {
  it("deve parsear seções com [PART A - Verse 1]", () => {
    const input = `[PART A - Verse 1 - Solo voice with firm confidence; acoustic guitar and bass marking the vaneira rhythm]
Mudei o corte, desatei o laço,
Da tua sombra, eu me desfaço.

[PART B - Chorus - All instruments enter with full force; drums drive a danceable beat, accordion leads]
Tô em outra vibe, o mundo me chama,
Na minha pele, só a brisa me inflama.`

    const sections = parseLyricSections(input)
    expect(sections).toHaveLength(2)
    expect(sections[0].type).toBe("verse")
    expect(sections[0].lines).toEqual([
      "Mudei o corte, desatei o laço,",
      "Da tua sombra, eu me desfaço."
    ])
    expect(sections[1].type).toBe("chorus")
  })

  it("deve parsear estrutura completa de Sertanejo Moderno", () => {
    const input = `[PART A - Verse 1 - ...]
Linha 1
Linha 2

[PART B - Chorus - ...]
Refrão linha 1
Refrão linha 2

[PART C - Bridge - ...]
Ponte linha 1

[PART B - Final Chorus - ...]
Refrão final linha 1
Refrão final linha 2`

    const sections = parseLyricSections(input)
    expect(sections.length).toBe(4)
    expect(sections.filter(s => s.type === "verse")).toHaveLength(1)
    expect(sections.filter(s => s.type === "chorus")).toHaveLength(2)
    expect(sections.some(s => s.type === "bridge")).toBe(true)
  })

  it("deve ignorar instruções entre parênteses", () => {
    const input = `[PART A - Verse 1 - ...]
Linha 1
(Audience: "É nóis!")
Linha 2
(Back vocal: "sem teu não!")`

    const sections = parseLyricSections(input)
    expect(sections[0].lines).toEqual(["Linha 1", "Linha 2"])
  })
})

// NOTA: parseChorusOptions não é mais usado
// A API de gerar refrão retorna JSON diretamente, não texto parseável
