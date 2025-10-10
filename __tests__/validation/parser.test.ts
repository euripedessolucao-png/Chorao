import { parseLyricSections, parseChorusOptions } from "@/lib/validation/parser"

describe("Parser de Letras", () => {
  it("deve parsear seções com [PART A – Verse 1]", () => {
    const input = `[PART A – Verse 1]
Mudei o corte, desatei o laço,
Da tua sombra, eu me desfaço.

[PART B – Chorus]
Tô em outra vibe, o mundo me chama,
Na minha pele, só a brisa me inflama.`

    const sections = parseLyricSections(input)
    expect(sections).toHaveLength(2)
    expect(sections[0].type).toBe("verse")
    expect(sections[0].lines).toEqual(["Mudei o corte, desatei o laço,", "Da tua sombra, eu me desfaço."])
    expect(sections[1].type).toBe("chorus")
  })

  it("deve ignorar linhas de acordes (G, C, etc.)", () => {
    const input = `[VERSE]
G
Mudei o corte,
C
Desatei o laço.`

    const sections = parseLyricSections(input)
    expect(sections[0].lines).toEqual(["Mudei o corte,", "Desatei o laço."])
  })

  it("deve parsear estrutura completa de Sertanejo Moderno", () => {
    const input = `[INTRO]
(Instrumental)

[PART A – Verse 1]
Linha 1
Linha 2

[PART B – Chorus]
Refrão linha 1
Refrão linha 2

[PART C – Bridge]
Ponte linha 1`

    const sections = parseLyricSections(input)
    expect(sections.length).toBeGreaterThan(0)
    expect(sections.some((s) => s.type === "verse")).toBe(true)
    expect(sections.some((s) => s.type === "chorus")).toBe(true)
    expect(sections.some((s) => s.type === "bridge")).toBe(true)
  })
})

describe("Parser de Refrões", () => {
  it("deve parsear 5 refrões com [REFRÃO 1], [REFRÃO 2], etc.", () => {
    const input = `[REFRÃO 1]
Dona de mim, vou pra praia!
O biquíni que você odiava!

[REFRÃO 2]
Meu troco, e eu digo: "É só!"`

    const choruses = parseChorusOptions(input)
    expect(choruses).toHaveLength(2)
    expect(choruses[0].id).toBe(1)
    expect(choruses[0].lines).toEqual(["Dona de mim, vou pra praia!", "O biquíni que você odiava!"])
  })

  it("deve parsear refrões com scores e estilos", () => {
    const input = `[REFRÃO 1 - COMERCIAL MÁXIMO (10/10)]
Linha 1
Linha 2

[REFRÃO 2 - POÉTICO COMERCIAL (8/10)]
Linha 3
Linha 4`

    const choruses = parseChorusOptions(input)
    expect(choruses).toHaveLength(2)
    expect(choruses[0].id).toBe(1)
    expect(choruses[1].id).toBe(2)
  })
})
