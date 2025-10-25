import { validateSertanejoLyrics } from "@/lib/validation/validateLyrics"

describe("Validação de Letra Completa", () => {
  it('deve rejeitar letra com "coração no chão"', () => {
    const sections = [
      { type: "verse", lines: ["Meu coração no chão"] },
      { type: "chorus", lines: ["Enquanto eu choro"] },
    ]

    const result = validateSertanejoLyrics(sections)
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e) => e.includes("coração no chão"))).toBe(true)
    expect(result.score).toBeLessThan(70)
  })

  it('deve aprovar letra moderna com "dona de mim" e "meu troco"', () => {
    const sections = [
      { type: "verse", lines: ["Mudei o corte, desatei o laço"] },
      { type: "chorus", lines: ["Dona de mim, vou pra praia!", 'Meu troco, e eu digo: "É só!"'] },
    ]

    const result = validateSertanejoLyrics(sections)
    expect(result.isValid).toBe(true)
    expect(result.score).toBeGreaterThanOrEqual(85)
  })

  it("deve rejeitar refrão com 3 linhas", () => {
    const sections = [{ type: "chorus", lines: ["Linha 1", "Linha 2", "Linha 3"] }]

    const result = validateSertanejoLyrics(sections)
    expect(result.errors.some((e) => e.includes("2 ou 4 linhas"))).toBe(true)
  })

  it("deve aprovar letra com elementos visuais modernos", () => {
    const sections = [
      { type: "verse", lines: ["No biquíni novo, vou pra praia"] },
      { type: "chorus", lines: ["Mando um PIX e digo tchau", "Minha vida, minhas regras"] },
    ]

    const result = validateSertanejoLyrics(sections)
    expect(result.isValid).toBe(true)
    expect(result.score).toBeGreaterThan(80)
  })
})
