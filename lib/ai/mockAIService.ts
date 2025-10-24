// lib/mocks/lyric-mocks.ts

/**
 * Simula resposta da IA com letra completa
 * ALINHADA com as regras de "Sertanejo Moderno Feminino"
 */
export async function mockGenerateLyric(theme: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 800))

  return `[PART A - Verse 1 - Solo voice with firm confidence; acoustic guitar and bass marking the vaneira rhythm]
Mudei o corte, rasguei teu retrato,
Meu salário paga o que eu quero agora.
Carro novo, estrada sem volta,
Tô em outra vibe, dona de mim.

[PART B - Chorus - All instruments enter with full force; drums drive a danceable beat, accordion leads]
Tô em outra vibe, o mundo me chama,
Biquíni novo, sem tua drama.
Meu troco é meu, e eu digo: "É só!",
Hoje eu brilho sozinha, sem teu "não"!

[PART A2 - Verse 2 - Music softens slightly, letting the lyrics cut through with attitude]
Teu "olhar alheio" era normal pra ti,
Mas meu decote virava um sermão ali.
Pra mim, só tristeza, um mundo sem cor,
Hoje eu danço sozinha, sem teu falso amor.

[PART C - Bridge - Dramatic pause; just a soft acoustic guitar arpeggio and a sustained accordion note remain]
Da tua cela, eu fiz minha força,
Quebrei as grades, findou a carcaça!
Hoje eu grito forte: Me encontrei!

[PART B - Final Chorus - Maximum energy, vocalist ad-libs over the top, crowd sings along loudly]
Tô em outra vibe, o mundo me chama,
Biquíni novo, sem tua drama.
Meu troco é meu, e eu digo: "É só!",
Hoje eu brilho sozinha, sem teu "não"!

(Audience: "É nóis!")
(Back vocal: "sem teu não!")`
}

/**
 * Simula gerador de 5 refrões
 * RESPEITANDO métrica (máx 12 sílabas) e linguagem permitida
 */
export async function mockGenerateChoruses(theme: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 600))

  return `[REFRÃO 1]
Dona de mim, vou pra praia!
Biquíni novo, sem tua drama!
Vivo tudo que eu quiser,
Minha vida, minha lei!

[REFRÃO 2]
Meu troco é meu, e eu digo: "É só!"
Tô rindo, sem teu "eu te amo"!
O que era proibido ontem,
Hoje é meu show!

[REFRÃO 3]
Tô em outra vibe, não volto mais!
Meu coração não cabe em teus "talvez"!

[REFRÃO 4]
PIX pago, biquíni novo,
Sorriso meu, não é de rosto!

[REFRÃO 5]
Livre, leve, sem teu "não"!
Meu nome agora é "vou sim"!`
}
