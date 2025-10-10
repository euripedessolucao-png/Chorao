import { validateSingleChorus } from "@/lib/validation/validateChorus"

describe("Validação de Refrão", () => {
  it("deve aprovar refrão chiclete moderno", () => {
    const chorus = {
      id: 1,
      lines: [
        "Dona de mim, vou pra praia!",
        "O biquíni que você odiava!",
        "Vivo tudo que eu quiser,",
        "Minha vida, minha lei!",
      ],
    }

    const result = validateSingleChorus(chorus)
    expect(result.isValid).toBe(true)
    expect(result.stickyHookFound).toBeTruthy()
    expect(result.isVisual).toBe(true)
    expect(result.score).toBeGreaterThanOrEqual(90)
  })

  it('deve rejeitar refrão com "lágrimas" e sem gancho', () => {
    const chorus = {
      id: 1,
      lines: ["Minhas lágrimas caem no travesseiro", "Não vivo sem você, meu mundo desabou"],
    }

    const result = validateSingleChorus(chorus)
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e) => e.includes("lágrimas"))).toBe(true)
    expect(result.errors.some((e) => e.includes("mundo desabou"))).toBe(true)
  })

  it("deve aceitar refrão de 2 linhas", () => {
    const chorus = {
      id: 1,
      lines: ["Tô em outra vibe!", "Meu coração não volta mais!"],
    }

    const result = validateSingleChorus(chorus)
    expect(result.isValid).toBe(true)
  })

  it("deve rejeitar refrão de 3 linhas", () => {
    const chorus = {
      id: 1,
      lines: ["Linha 1", "Linha 2", "Linha 3"],
    }

    const result = validateSingleChorus(chorus)
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e) => e.includes("2 ou 4 linhas"))).toBe(true)
  })

  it("deve dar score alto para refrão com hook comercial", () => {
    const chorus = {
      id: 1,
      lines: ["Dona de mim, livre e feliz", "Meu troco, minha escolha, meu país"],
    }

    const result = validateSingleChorus(chorus)
    expect(result.score).toBeGreaterThan(85)
    expect(result.stickyHookFound).toBeTruthy()
  })
})
