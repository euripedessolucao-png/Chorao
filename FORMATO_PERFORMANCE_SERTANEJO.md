# Formato de Performance - Sertanejo Moderno

## Visão Geral

O sertanejo moderno possui um formato de saída EXCLUSIVO com instruções detalhadas de performance, instrumentação e dinâmica. Este formato só é aplicado quando:
- Gênero: Sertanejo Moderno
- Modo: `performanceMode: "performance"`

## Estrutura do Formato

### Seções com Instruções

Cada seção da música recebe instruções detalhadas entre colchetes:

\`\`\`
[PART A - Verse 1 - Solo voice with firm confidence; acoustic guitar and bass marking the vaneira rhythm]
\`\`\`

### Elementos de Performance

#### 1. Audience Cues (Interação com Público)
\`\`\`
(Audience: "Aôôô potência!")
(Audience: "É nóis!")
(Audience: "Véio!")
\`\`\`

#### 2. Performance Actions (Ações do Vocalista)
\`\`\`
(Performance: Vocalist points to the crowd, smiling)
(Performance: Vocalist raises fist in the air)
\`\`\`

#### 3. Backing Vocals
\`\`\`
(Back vocal: "Agora é minha praia!")
\`\`\`

#### 4. Dinâmicas
\`\`\`
(whispered)
(slowly builds tension)
(with intensity)
\`\`\`

#### 5. Solo Instrumental
\`\`\`
[INSTRUMENTAL SOLO - Energetic accordion solo for 16 seconds; full band returns with power, drums and bass lock into a tight groove]
\`\`\`

## Mapeamento de Seções

### PART A - Verse 1
- **Instrumentação**: Solo voice with firm confidence; acoustic guitar and bass marking the vaneira rhythm
- **Dinâmica**: Moderate
- **Estilo Vocal**: Confident, storytelling

### PART B - Chorus (1ª vez)
- **Instrumentação**: All instruments enter with full force; drums drive a danceable beat, accordion leads
- **Dinâmica**: Full energy
- **Estilo Vocal**: Passionate, powerful
- **Extras**: Audience cues

### PART A2 - Verse 2
- **Instrumentação**: Music softens slightly, letting the lyrics cut through with attitude
- **Dinâmica**: Moderate with attitude
- **Estilo Vocal**: Direct, with edge

### PART B - Chorus (2ª vez)
- **Instrumentação**: Music explodes back with even more energy; vocalist sings with passion and defiance
- **Dinâmica**: Maximum energy
- **Estilo Vocal**: Defiant, celebratory
- **Extras**: Performance actions

### PART C - Bridge
- **Instrumentação**: Dramatic pause; just a soft acoustic guitar arpeggio and a sustained accordion note remain
- **Dinâmica**: Minimal, building tension
- **Estilo Vocal**: Emotional, building
- **Extras**: Dynamic cues (whispered, slowly builds tension)

### INSTRUMENTAL SOLO
- **Duração**: 16 seconds
- **Instrumento**: Accordion
- **Estilo**: Energetic, full band returns with power

### PART B - Final Chorus
- **Instrumentação**: Maximum energy, vocalist ad-libs over the top, crowd sings along loudly
- **Dinâmica**: Explosive
- **Estilo Vocal**: Triumphant, interactive
- **Extras**: Backing vocals, audience participation

### OUTRO
- **Instrumentação**: Instruments begin to fade, leaving the accordion and the hook echoing
- **Dinâmica**: Fading
- **Estilo Vocal**: Soft, reflective
- **Extras**: Whispered repetitions

## Exemplo Completo

\`\`\`
[PART A - Verse 1 - Solo voice with firm confidence; acoustic guitar and bass marking the vaneira rhythm]
Dei um trato no cabelo... mas o nosso laço eu cortei primeiro.
Hoje eu mesma pago as contas, com meu próprio dinheiro!
Eu saí da sua sombra... que insistia em me apagar,
E voltei a ver a vida... voltei a respirar!

[PART B - Chorus - All instruments enter with full force; drums drive a danceable beat, accordion leads]
Dona de mim!
Dona de mim, o mundo agora é minha praia!
Vou usar aquele biquíni que pra você era uma falha!
Vou viver tudo que um dia sua boca me proibiu...
(Audience: "Aôôô potência!")

[PART A2 - Verse 2 - Music softens slightly, letting the lyrics cut through with attitude]
Achava lindo o decote... da vizinha ali do lado,
Mas se o meu era parecido... era um escândalo danado!
Na rua, seu olho corria, sem o mínimo disfarce...
Em casa, era o cansaço... e o silêncio que falasse.

[PART B - Chorus - Music explodes back with even more energy; vocalist sings with passion and defiance]
Dona de mim!
Dona de mim, o mundo agora é minha praia!
Vou usar aquele biquíni que pra você era uma falha!
Vou viver tudo que um dia sua boca me proibiu...
(Performance: Vocalist points to the crowd, smiling)

[PART C - Bridge - Dramatic pause; just a soft acoustic guitar arpeggio and a sustained accordion note remain]
Você foi o juiz e o júri... sentenciou meu valor...
(slowly builds tension)
Mas o martelo bateu e, pra seu pavor, a ré se libertou!
Pra ser finalmente... dona de mim!
(Audience screams as the band kicks back in)

[INSTRUMENTAL SOLO - Energetic accordion solo for 16 seconds; full band returns with power, drums and bass lock into a tight groove]

[PART B - Final Chorus - Maximum energy, vocalist ad-libs over the top, crowd sings along loudly]
Dona de mim!
Dona de mim, o mundo agora é minha praia! (Back vocal: "Agora é minha praia!")
Vou usar aquele biquíni que pra você era uma falha!
Vou viver tudo que um dia sua boca me proibiu...

[OUTRO - Instruments begin to fade, leaving the accordion and the hook echoing]
Dona de mim...
(whispered) Agora eu sou...
Dona de mim...
(Music stops abruptly with a final, powerful chord hit)

Dona de mim!
Dona de mim!
\`\`\`

## Como Usar

### Na API
\`\`\`typescript
const result = await MetaComposer.compose({
  genre: "sertanejo-moderno",
  theme: "empoderamento feminino",
  mood: "confiante",
  performanceMode: "performance", // ← ATIVA O FORMATO
})
\`\`\`

### No Frontend
\`\`\`typescript
const response = await fetch("/api/generate-lyrics", {
  method: "POST",
  body: JSON.stringify({
    genre: "sertanejo-moderno",
    theme: "superação",
    mood: "forte",
    performanceMode: "performance", // ← ATIVA O FORMATO
  }),
})
\`\`\`

## Notas Importantes

1. **Exclusivo para Sertanejo Moderno**: Este formato só é aplicado para o gênero sertanejo moderno
2. **Modo Performance**: Requer `performanceMode: "performance"` na requisição
3. **Instruções Automáticas**: As instruções são geradas automaticamente baseadas na estrutura da letra
4. **Aleatoriedade Controlada**: Audience cues e performance actions são adicionados aleatoriamente para variedade
5. **Preserva Letra**: O conteúdo da letra (versos) permanece intacto, apenas as instruções são adicionadas
