// __tests__/chorus-validation.test.ts

import { validateLyrics } from "@/lib/genre-config"

describe("Validação de Refrão - Sertanejo Moderno Feminino", () => {
  const genre = "Sertanejo Moderno Feminino"

  it("deve aprovar refrão chiclete moderno", () => {
    const chorusText = `[CHORUS]
Dona de mim, vou pra praia!
O biquíni que você odiava!
Vivo tudo que eu quiser,
Minha vida, minha lei!`

    const result = validateLyrics(chorusText, genre)
    expect(result.valid).toBe(true)
    // Nota: validLyrics não detecta "gancho" ou "visual" — isso é feito no MetaComposer
  })

  it('deve rejeitar refrão com "lágrimas" e "mundo desabou"', () => {
    const chorusText = `[CHORUS]
Minhas lágrimas caem no travesseiro
Não vivo sem você, meu mundo desabou`

    const result = validateLyrics(chorusText, genre)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes("lágrimas"))).toBe(true)
    expect(result.errors.some(e => e.includes("mundo desabou"))).toBe(true)
  })

  it("deve aceitar refrão de 2 linhas (permitido no Sertanejo Moderno)", () => {
    const chorusText = `[CHORUS]
Tô em outra vibe!
Meu coração não volta mais!`

    const result = validateLyrics(chorusText, genre)
    expect(result.valid).toBe(true)
  })

  it("deve rejeitar refrão com palavras proibidas do gênero", () => {
    const chorusText = `[CHORUS]
Meu coração no chão
Floresço na saudade`

    const result = validateLyrics(chorusText, genre)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes("coração no chão"))).toBe(true)
    expect(result.errors.some(e => e.includes("floresço"))).toBe(true)
  })

  it("deve validar refrão com métrica correta (≤12 sílabas)", () => {
    const chorusText = `[CHORUS]
Dona de mim, livre e feliz
Meu troco, minha escolha, meu país`

    const result = validateLyrics(chorusText, genre)
    expect(result.valid).toBe(true)
  })
})
