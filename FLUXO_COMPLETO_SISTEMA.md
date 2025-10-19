# 🎵 FLUXO COMPLETO DO SISTEMA DE COMPOSIÇÃO

**Versão:** 2.0
**Data:** 2025-01-19
**Status:** Documentação Oficial

## 📋 VISÃO GERAL

O sistema de composição é orquestrado pelo **MetaComposer** que integra múltiplos subsistemas para garantir qualidade máxima das letras geradas.

## 🔄 FLUXO PRINCIPAL

\`\`\`
USUÁRIO
   ↓
[API: /api/generate-lyrics ou /api/rewrite-lyrics]
   ↓
MetaComposer.compose(request)
   ↓
┌─────────────────────────────────────────────┐
│  ETAPA 1: GERAÇÃO INICIAL                   │
│  ├─ Reescrita? → generateRewrite()          │
│  ├─ Refrões preservados? → generateWith...  │
│  └─ Geração direta? → generateDirectLyrics()│
└─────────────────────────────────────────────┘
   ↓
┌─────────────────────────────────────────────┐
│  ETAPA 2: ANÁLISE TERCEIRA VIA              │
│  ├─ analisarTerceiraVia()                   │
│  │   ├─ Originalidade (evita clichês)       │
│  │   ├─ Profundidade emocional              │
│  │   ├─ Técnica compositiva                 │
│  │   └─ Adequação ao gênero                 │
│  └─ analisarMelodiaRitmo()                  │
│      ├─ Flow score                          │
│      ├─ Padrões rítmicos                    │
│      └─ Sugestões melódicas                 │
└─────────────────────────────────────────────┘
   ↓
┌─────────────────────────────────────────────┐
│  ETAPA 3: CORREÇÕES TERCEIRA VIA            │
│  (Se score < 75)                            │
│  ├─ Para cada linha que precisa correção:  │
│  │   └─ applyTerceiraViaToLine()           │
│  │       └─ ThirdWayEngine.generateThird... │
│  └─ Re-análise após correções               │
└─────────────────────────────────────────────┘
   ↓
┌─────────────────────────────────────────────┐
│  ETAPA 4: CORREÇÃO DE SÍLABAS              │
│  ├─ SyllableEnforcer.enforceSyllableLimits()│
│  │   ├─ Verifica cada linha                │
│  │   ├─ Corrige se fora do range 7-12      │
│  │   └─ Mantém significado original         │
│  └─ Retorna letra corrigida                │
└─────────────────────────────────────────────┘
   ↓
┌─────────────────────────────────────────────┐
│  ETAPA 5: POLIMENTO UNIVERSAL               │
│  (Se applyFinalPolish = true)              │
│  ├─ applyRhymeEnhancement()                │
│  │   └─ Melhora rimas para atingir 60% ricas│
│  ├─ Correção de sílabas linha por linha    │
│  │   └─ ThirdWayEngine para ajustes finos  │
│  └─ applyPerformanceFormatting()           │
│      └─ Tags em inglês, versos em português│
└─────────────────────────────────────────────┘
   ↓
┌─────────────────────────────────────────────┐
│  ETAPA 6: AVALIAÇÃO DE QUALIDADE           │
│  ├─ calculateQualityScore()                │
│  │   ├─ Terceira Via: 40%                  │
│  │   ├─ Melodic Flow: 30%                  │
│  │   ├─ Syllable Compliance: 20%           │
│  │   └─ Rhyme Quality: 10%                 │
│  └─ Verifica critério de parada            │
│      └─ score >= 0.8 && terceiraVia >= 75  │
└─────────────────────────────────────────────┘
   ↓
┌─────────────────────────────────────────────┐
│  ETAPA 7: FORMATAÇÃO FINAL                 │
│  ├─ Extrai título                          │
│  ├─ Aplica formatação performática         │
│  │   ├─ Tags em inglês: [Verse], [Chorus] │
│  │   ├─ Versos em português                │
│  │   └─ Lista única de instrumentos        │
│  └─ Monta metadata completo                │
└─────────────────────────────────────────────┘
   ↓
RESULTADO FINAL
   ↓
USUÁRIO
\`\`\`

## 🎯 SUBSISTEMAS CRÍTICOS

### 1. Terceira Via (`lib/terceira-via.ts`)
**Responsabilidade:** Análise de qualidade compositiva

\`\`\`typescript
analisarTerceiraVia(lyrics, genre, theme) {
  // Retorna:
  // - originalidade: 0-100
  // - profundidade_emocional: 0-100
  // - tecnica_compositiva: 0-100
  // - adequacao_genero: 0-100
  // - score_geral: média ponderada
  // - sugestoes: array de melhorias
  // - pontos_fortes: array de acertos
  // - pontos_fracos: array de problemas
}
\`\`\`

### 2. Third Way Engine (`lib/third-way-converter.ts`)
**Responsabilidade:** Correções avançadas linha por linha

\`\`\`typescript
ThirdWayEngine.generateThirdWayLine(
  line,
  genre,
  genreConfig,
  context,
  isPerformanceMode,
  additionalRequirements
) {
  // Usa IA para melhorar linha específica
  // Mantém contexto e significado
  // Aplica regras do gênero
}
\`\`\`

### 3. Syllable Enforcer (`lib/validation/syllableEnforcer.ts`)
**Responsabilidade:** Garantir contagem silábica correta

\`\`\`typescript
SyllableEnforcer.enforceSyllableLimits(
  lyrics,
  syllableTarget: { min: 7, max: 12, ideal: 10 },
  genre
) {
  // Corrige linhas fora do range
  // Mantém significado original
  // Retorna letra corrigida + número de correções
}
\`\`\`

### 4. Rhyme Validator (`lib/validation/rhyme-validator.ts`)
**Responsabilidade:** Análise e classificação de rimas

\`\`\`typescript
analyzeRhyme(word1, word2) {
  // Retorna:
  // - type: "rica" | "pobre" | "perfeita" | "toante" | "falsa"
  // - score: 0-100
  // - explanation: string
}

analyzeLyricsRhymeScheme(lyrics) {
  // Retorna:
  // - scheme: ["A", "B", "A", "B", ...]
  // - quality: array de RhymeQuality
  // - score: 0-100
  // - suggestions: array de melhorias
}
\`\`\`

### 5. Rhyme Enhancer (`lib/validation/rhyme-enhancer.ts`)
**Responsabilidade:** Melhorar qualidade das rimas

\`\`\`typescript
enhanceLyricsRhymes(lyrics, genre, theme, creativity) {
  // Identifica rimas fracas
  // Sugere melhorias
  // Aplica correções mantendo significado
  // Retorna letra melhorada + análise
}
\`\`\`

### 6. Genre Config (`lib/genre-config.ts`)
**Responsabilidade:** Configurações específicas por gênero

\`\`\`typescript
getGenreConfig(genre) {
  // Retorna:
  // - core_principles: tema, tom, arco narrativo
  // - language_rules: permitido, proibido, estilo
  // - structure_rules: verso, refrão, ponte
  // - prosody_rules: sílabas, respirabilidade, empilhamento
  // - harmony_and_rhythm: acordes, BPM, estilo rítmico
}
\`\`\`

## 🔄 ITERAÇÕES E QUALIDADE

### Sistema de Iterações
\`\`\`typescript
MAX_ITERATIONS = 3

while (iterations < MAX_ITERATIONS) {
  // Gera/melhora letra
  // Analisa qualidade
  // Verifica critério de parada
  
  if (qualityScore >= 0.8 && 
      terceiraViaScore >= 75 && 
      melodicScore >= 70) {
    break // Qualidade atingida
  }
}
\`\`\`

### Critério de Parada
- **Quality Score:** >= 0.8 (80%)
- **Terceira Via:** >= 75/100
- **Melodic Flow:** >= 70/100

## 📊 METADATA RETORNADO

\`\`\`typescript
{
  lyrics: string,
  title: string,
  metadata: {
    iterations: number,
    finalScore: number,
    polishingApplied: boolean,
    preservedChorusesUsed: boolean,
    rhymeScore: number,
    rhymeTarget: number,
    structureImproved: boolean,
    terceiraViaAnalysis: TerceiraViaAnalysis,
    melodicAnalysis: any,
    performanceMode: "standard" | "performance"
  }
}
\`\`\`

## 🎨 FORMATAÇÃO PERFORMÁTICA

### Modo Performance
\`\`\`
[Intro] (Instrumental: acoustic guitar, electric guitar)

[Verse 1]
Verso em português aqui
Mais um verso em português

[Chorus]
Refrão grudento em português
Muito repetitivo

[Bridge]
Ponte em português

[Outro] (Instrumental: fade out)

Instruments: acoustic guitar, electric guitar, drums, bass
Rhythm: Sertanejo Moderno
BPM: 94
\`\`\`

### Modo Standard
\`\`\`
[Intro]

Verso em português aqui
Mais um verso em português

[Refrão]
Refrão grudento em português
Muito repetitivo

[Ponte]
Ponte em português

[Final]
\`\`\`

## 🚀 COMUNICAÇÃO COMPOSITOR-IA

### Respeito ao Ritmo Solicitado
\`\`\`typescript
// Se usuário pedir "piseiro"
if (request.rhythm === "piseiro" || 
    request.additionalRequirements?.includes("piseiro")) {
  // Sistema usa configuração específica de piseiro
  // BPM, instrumentos, estrutura adaptados
}
\`\`\`

### Requisitos Adicionais
\`\`\`typescript
request.additionalRequirements = "Quero um piseiro animado com sanfona"
// Sistema detecta:
// - Ritmo: piseiro
// - Mood: animado
// - Instrumento específico: sanfona
// E adapta a geração
\`\`\`

## 📝 OBSERVAÇÕES IMPORTANTES

1. **Nunca pular etapas** - Cada etapa é crítica para qualidade
2. **Sempre re-analisar** - Após correções, sempre re-analisa
3. **Respeitar limites** - 12 sílabas é MÁXIMO absoluto
4. **Manter contexto** - Correções devem manter significado original
5. **Formatação consistente** - Tags em inglês, versos em português
6. **Lista única de instrumentos** - Evitar duplicação no final

---

**Este fluxo é o coração do sistema. Qualquer alteração deve ser cuidadosamente avaliada.**
