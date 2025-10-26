# Sistema de Rimas Ricas - Documentação Completa

## Visão Geral

O sistema de validação de rimas foi implementado para garantir a qualidade poética das letras, especialmente para gêneros que exigem rimas ricas como o Sertanejo Raiz.

## Tipos de Rima

### 1. Rima Rica (Score: 100)
**Definição**: Rima entre palavras de classes gramaticais DIFERENTES
**Exemplos**:
- "amor" (substantivo) + "cantar" (verbo) ✓
- "flor" (substantivo) + "melhor" (adjetivo) ✓
- "coração" (substantivo) + "perdão" (substantivo) ✗ (rima pobre)

### 2. Rima Pobre (Score: 60)
**Definição**: Rima entre palavras da MESMA classe gramatical
**Exemplos**:
- "coração" + "paixão" (ambos substantivos)
- "amar" + "cantar" (ambos verbos)
- "belo" + "amarelo" (ambos adjetivos)

### 3. Rima Perfeita/Consoante (Score: 80)
**Definição**: Som completo igual a partir da última vogal tônica
**Exemplos**:
- "jardim" + "capim"
- "porteira" + "bananeira"
- "viola" + "sacola"

### 4. Rima Toante/Assonante (Score: 50)
**Definição**: Apenas as vogais são iguais, consoantes diferentes
**Exemplos**:
- "saltava" + "mata" (vogais: a-a)
- "amor" + "calor" (vogais: o-o)

### 5. Rima Falsa (Score: 0-20)
**Definição**: Não há rima ou a semelhança é muito fraca
**Exemplos**:
- "amor" + "casa"
- "flor" + "tempo"

## Regras por Gênero

### Sertanejo Raiz
**Exigências**:
- Mínimo 50% de rimas ricas
- ZERO rimas falsas permitidas
- Rimas perfeitas (consoantes) preferidas
- Tradição da moda de viola exige alta qualidade

**Exemplos de Sertanejo Raiz**:
\`\`\`
Verso 1: "No sertão onde eu nasci" (nasci = verbo)
Verso 2: "A viola me fez sorrir" (sorrir = verbo) ✗ POBRE

Verso 1: "No sertão onde eu nasci" (nasci = verbo)
Verso 2: "Meu coração sempre quis" (quis = verbo) ✗ POBRE

Verso 1: "No sertão onde eu nasci" (nasci = verbo)
Verso 2: "Terra boa de raiz" (raiz = substantivo) ✓ RICA
\`\`\`

### Sertanejo Moderno
**Exigências**:
- Mínimo 30% de rimas ricas
- Até 20% de rimas falsas permitidas
- Rimas devem soar naturais

### MPB
**Exigências**:
- Alta qualidade geral (score > 70)
- Evitar rimas clichês ("amor/dor", "paixão/ilusão")
- Criatividade e surpresa valorizadas

### Pagode/Samba
**Exigências**:
- Rimas naturais e fluidas
- Variedade para evitar monotonia
- Não quebrar o swing

## Implementação Técnica

### Arquivo: `lib/validation/rhyme-validator.ts`

**Funções Principais**:

1. `analyzeRhyme(word1, word2)`: Analisa duas palavras e retorna tipo e qualidade da rima
2. `analyzeLyricsRhymeScheme(lyrics)`: Analisa esquema completo de rimas (ABAB, AABB, etc.)
3. `validateRhymesForGenre(lyrics, genre)`: Valida rimas específicas para cada gênero

**Classes Gramaticais**:
- Substantivos: amor, dor, coração, paixão, flor, etc.
- Verbos: amar, cantar, dançar, sonhar, chorar, etc.
- Adjetivos: belo, triste, feliz, sozinho, perdido, etc.

## Integração nas APIs

### generate-lyrics/route.ts
\`\`\`typescript
const rhymeValidation = validateRhymesForGenre(finalLyrics, genero)
if (!rhymeValidation.valid) {
  console.log("[v0] Avisos de rima:", rhymeValidation.warnings)
  console.log("[v0] Erros de rima:", rhymeValidation.errors)
}
\`\`\`

### rewrite-lyrics/route.ts
\`\`\`typescript
const rhymeValidation = validateRhymesForGenre(finalLyrics, generoConversao)
return NextResponse.json({
  letra: finalLyrics,
  rhymeAnalysis: rhymeValidation.analysis,
  rhymeWarnings: rhymeValidation.warnings,
})
\`\`\`

## Exemplos Práticos

### Exemplo 1: Sertanejo Raiz (CORRETO)
\`\`\`
[VERSE 1]
Na porteira do curral (curral = substantivo)
Meu cavalo vai passar (passar = verbo) ✓ RICA
A viola toca bem (bem = advérbio)
Meu sertão é meu também (também = advérbio) ✗ POBRE
\`\`\`

### Exemplo 2: Sertanejo Raiz (INCORRETO)
\`\`\`
[VERSE 1]
O amor que eu senti (senti = verbo)
No sertão onde vivi (vivi = verbo) ✗ POBRE
A saudade me machuca (machuca = verbo)
Meu coração não se acostuma (acostuma = verbo) ✗ POBRE
\`\`\`

## Sugestões de Melhoria

O sistema gera sugestões automáticas:
- "Aumente o uso de rimas ricas (palavras de classes gramaticais diferentes)"
- "Reduza rimas pobres (mesma classe gramatical) e varie mais"
- "Corrija rimas falsas ou fracas para melhorar a musicalidade"

## Manutenção Futura

Para adicionar novos gêneros ou ajustar regras:

1. Edite `lib/validation/rhyme-validator.ts`
2. Adicione regras específicas em `validateRhymesForGenre()`
3. Atualize as instruções nos prompts das APIs
4. Teste com letras reais do gênero

## Referências

- Poesia Brasileira: Rimas ricas vs pobres
- Tradição da Moda de Viola
- Composição Musical Brasileira 2024-2025
