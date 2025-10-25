// Simula resposta da IA com letra completa
export async function mockGenerateLyric(theme: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 800)) // Simula delay

  return `[INTRO]
(Acoustic guitar)

[PART A – Verse 1]
Mudei o corte, desatei o laço,
Da tua sombra, eu me desfaço.
Meu próprio rumo, eu mesma traço,
Na liberdade, floresço e me refaço.

[PART B – Chorus]
Tô em outra vibe, o mundo me chama,
Na minha pele, só a brisa me inflama.
Aquele biquíni, que te dava um nó,
Hoje é meu troco, e eu digo: "É só!"

[PART A2 – Verse 2]
Teu "olhar alheio" era normal pra ti,
Mas meu decote virava um sermão ali.
Pra mim, só tristeza, um mundo sem cor,
Hoje eu brilho sozinha, sem teu falso amor.

[PART C – Bridge]
Da tua cela, eu fiz minha força,
Quebrei as grades, findou a carcaça!
Hoje eu grito forte: Me encontrei, e a vida me abraça!

[OUTRO]
Sou dona de mim, ninguém me alcança!
Meu coração, hoje é só bonança.`
}

// Simula gerador de 5 refrões
export async function mockGenerateChoruses(theme: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 600))

  return `[REFRÃO 1]
Dona de mim, vou pra praia!
O biquíni que você odiava!
Vivo tudo que eu quiser,
Minha vida, minha lei!

[REFRÃO 2]
Meu troco, e eu digo: "É só!"
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
