# REFORMULAÇÃO COMPLETA: NARRATIVA PRIMEIRO

## PROBLEMA IDENTIFICADO

O sistema atual prioriza REGRAS TÉCNICAS sobre NARRATIVA:
- ❌ Prioridade 1: 11 sílabas (ABSOLUTO)
- ❌ Prioridade 2: Rimas perfeitas
- ❌ Prioridade 3: Gramática
- ❌ Prioridade 4: Narrativa

**RESULTADO:** Letras tecnicamente corretas mas sem alma, com versos forçados para atender rimas/sílabas.

---

## APRENDIZADO COM COMPOSITORES BRASILEIROS

### CHICO BUARQUE & CAETANO VELOSO
- **Prioridade 1:** HISTÓRIA que precisa ser contada
- **Prioridade 2:** EMOÇÃO autêntica
- **Prioridade 3:** TÉCNICA a serviço da narrativa

**Exemplo:** Chico Buarque em "Cotidiano" conta uma história de rotina opressiva. A técnica (rimas, métrica) SERVE à narrativa, não o contrário.

### ANÁLISE DE HITS 2024-2025
- **62% são colaborações** - foco em CONEXÃO emocional
- **34% são ao vivo** - foco em PERFORMANCE e ENERGIA
- **Chorus memorável** > rimas perfeitas
- **Linguagem coloquial** > gramática formal
- **História envolvente** > métrica perfeita

---

## NOVA HIERARQUIA DE PRIORIDADES

### PRIORIDADE MÁXIMA (Não negociável)
1. **NARRATIVA COERENTE** - História com começo-meio-fim
2. **EMOÇÃO AUTÊNTICA** - Sentimento real, não forçado
3. **CONEXÃO COM OUVINTE** - Linguagem coloquial, temas relacionáveis

### PRIORIDADE ALTA (Essencial)
4. **CHORUS MEMORÁVEL** - Gruda na cabeça, fácil de cantar
5. **GRAMÁTICA FUNCIONAL** - Frases completas que fazem sentido
6. **FLUXO NATURAL** - Versos que fluem sem forçar

### PRIORIDADE MÉDIA (Importante mas flexível)
7. **MÉTRICA POÉTICA** - Ideal 11 sílabas, aceitável 9-13
8. **RIMAS FUNCIONAIS** - 40-60% de rimas, qualidade > quantidade
9. **ESTRUTURA MUSICAL** - Formato adequado ao gênero

---

## REFORMULAÇÃO DO METACOMPOSER

### MUDANÇAS NOS PROMPTS

**ANTES:**
\`\`\`
REGRAS ABSOLUTAS:
1. LIMITE DE 11 SÍLABAS (INEGOCIÁVEL)
2. GRAMÁTICA PERFEITA
3. NARRATIVA FLUÍDA
\`\`\`

**DEPOIS:**
\`\`\`
OBJETIVO PRINCIPAL: Contar uma HISTÓRIA ENVOLVENTE

COMO CONTAR UMA BOA HISTÓRIA:
1. COMEÇO: Apresente a situação/problema de forma clara
   - Quem é o personagem?
   - Qual é o conflito/situação?
   - Por que o ouvinte deve se importar?

2. MEIO: Desenvolva a transformação/conflito
   - O que mudou?
   - Como o personagem reagiu?
   - Qual é a jornada emocional?

3. FIM: Resolução com impacto emocional
   - Como a história termina?
   - Qual é a mensagem/sentimento final?
   - O ouvinte sai transformado?

TÉCNICA A SERVIÇO DA NARRATIVA:
- Se um verso precisa de 13 sílabas para contar a história direito, USE 13 sílabas
- Se uma rima força a narrativa, IGNORE a rima
- Se a gramática formal quebra o fluxo, use linguagem coloquial
- NUNCA sacrifique a história pela técnica
\`\`\`

### NOVO SISTEMA DE VALIDAÇÃO

**ORDEM DE VALIDAÇÃO:**
1. ✅ **Narrativa Coerente** (score ≥ 80) - BLOQUEANTE
2. ✅ **Emoção Autêntica** (sem clichês forçados) - BLOQUEANTE
3. ✅ **Chorus Memorável** (repetitivo, grudento) - BLOQUEANTE
4. ⚠️ **Gramática Funcional** (frases completas) - WARNING se < 90%
5. ⚠️ **Métrica Poética** (9-13 sílabas) - WARNING se < 80%
6. ℹ️ **Rimas** (40-60%) - INFO apenas

---

## EXEMPLOS PRÁTICOS

### EXEMPLO 1: Verso Forçado vs. Verso Natural

**ANTES (Forçado para rimar):**
\`\`\`
"Pago tudo do meu jeito, sem ninguém pra dar conselho" (15 sílabas - ERRO)
→ Sistema força: "Pago tudo do meu jeito, sem conselho" (11 sílabas - perde sentido)
\`\`\`

**DEPOIS (Narrativa primeiro):**
\`\`\`
"Pago minhas contas sozinha, não preciso de opinião" (13 sílabas - OK!)
→ Mantém a história completa: independência financeira + autonomia
→ Sílabas flexíveis para servir à narrativa
\`\`\`

### EXEMPLO 2: Rima Forçada vs. Narrativa Fluída

**ANTES (Forçado para rimar):**
\`\`\`
"Cortei o laço que me prendia ao passado sombrio" (forçado)
"Agora vivo minha vida sem nenhum desvio" (rima forçada)
\`\`\`

**DEPOIS (Narrativa natural):**
\`\`\`
"Cortei o laço que me prendia"
"Agora vivo do meu jeito"
→ Não rima perfeitamente, mas a história flui naturalmente
\`\`\`

### EXEMPLO 3: Gramática Formal vs. Coloquial Autêntica

**ANTES (Formal demais):**
\`\`\`
"Eu não posso mais aceitar essa situação"
"Preciso seguir em frente sem hesitação"
\`\`\`

**DEPOIS (Coloquial autêntico):**
\`\`\`
"Não dá mais pra aceitar isso"
"Vou seguir meu rumo, sem olhar pra trás"
→ Linguagem real, como brasileiros falam
\`\`\`

---

## IMPLEMENTAÇÃO TÉCNICA

### 1. REFORMULAR PROMPTS DO METACOMPOSER

\`\`\`typescript
// NOVO PROMPT - NARRATIVA PRIMEIRO
const narrativeFirstPrompt = `
Você é um CONTADOR DE HISTÓRIAS através da música brasileira.

SEU OBJETIVO: Contar uma história ENVOLVENTE sobre: ${theme}

═══════════════════════════════════════════════════════════════
PASSO 1: PLANEJE A HISTÓRIA (ANTES DE ESCREVER QUALQUER VERSO)
═══════════════════════════════════════════════════════════════

COMEÇO (Verse 1):
- Qual é a situação inicial?
- Quem é o personagem?
- Qual é o conflito/problema?

MEIO (Verse 2 + Bridge):
- O que acontece?
- Como o personagem reage?
- Qual é a transformação?

FIM (Final Chorus):
- Como a história termina?
- Qual é a mensagem final?
- Que sentimento fica?

═══════════════════════════════════════════════════════════════
PASSO 2: ESCREVA A HISTÓRIA (TÉCNICA SERVE À NARRATIVA)
═══════════════════════════════════════════════════════════════

REGRAS DE OURO:

1. NARRATIVA > TÉCNICA
   - Se precisa de mais sílabas para contar direito, USE
   - Se uma rima força a história, IGNORE a rima
   - NUNCA sacrifique a história pela métrica

2. LINGUAGEM AUTÊNTICA
   - Fale como brasileiros falam: "cê", "tô", "pra"
   - Use gírias e expressões regionais
   - Seja coloquial, não formal

3. EMOÇÃO REAL
   - Evite clichês: "coração partido", "lágrimas caem"
   - Use detalhes concretos: "biquíni", "PIX", "story"
   - Mostre, não conte: "Cortei o cabelo" > "Mudei"

4. CHORUS GRUDENTO
   - Frases curtas e repetitivas
   - Fácil de cantar junto
   - Gruda na cabeça imediatamente

═══════════════════════════════════════════════════════════════
PASSO 3: REVISE A HISTÓRIA (NÃO A TÉCNICA)
═══════════════════════════════════════════════════════════════

✓ A história faz sentido do começo ao fim?
✓ Cada verso contribui para a narrativa?
✓ A emoção é autêntica?
✓ O chorus gruda na cabeça?
✓ A linguagem é coloquial e natural?

NÃO PERGUNTE:
❌ Todos os versos têm 11 sílabas?
❌ Todas as rimas são perfeitas?
❌ A gramática é formal?

LEMBRE-SE: Você está contando uma HISTÓRIA, não fazendo um exercício de métrica.
`
\`\`\`

### 2. REFORMULAR VALIDAÇÃO

\`\`\`typescript
// NOVA ORDEM DE VALIDAÇÃO
private static validateFinalLyrics(lyrics: string, genre: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  // 1. NARRATIVA (BLOQUEANTE)
  const narrativeScore = validateNarrativeFlow(lyrics, genre)
  if (narrativeScore.score < 80) {
    errors.push(`Narrativa fraca (${narrativeScore.score}/100)`)
    errors.push(...narrativeScore.feedback)
  }
  
  // 2. EMOÇÃO AUTÊNTICA (BLOQUEANTE)
  const clicheCount = detectCliches(lyrics)
  if (clicheCount > 3) {
    errors.push(`Muitos clichês detectados (${clicheCount})`)
  }
  
  // 3. CHORUS MEMORÁVEL (BLOQUEANTE)
  const chorusScore = analyzeChorusMemorability(lyrics)
  if (chorusScore < 70) {
    errors.push(`Chorus não é memorável o suficiente (${chorusScore}/100)`)
  }
  
  // 4. GRAMÁTICA (WARNING)
  const grammarScore = validateGrammar(lyrics)
  if (grammarScore < 90) {
    warnings.push(`Algumas frases incompletas (${grammarScore}% corretas)`)
  }
  
  // 5. MÉTRICA (WARNING)
  const syllableCompliance = validateSyllables(lyrics, 9, 13) // Flexível!
  if (syllableCompliance < 80) {
    warnings.push(`Algumas linhas fora da métrica ideal (${syllableCompliance}%)`)
  }
  
  // 6. RIMAS (INFO)
  const rhymeScore = analyzeRhymes(lyrics)
  // Não bloqueia, apenas informa
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}
\`\`\`

### 3. ADICIONAR EXEMPLOS DE COMPOSITORES BRASILEIROS

\`\`\`typescript
const EXEMPLOS_NARRATIVA_FORTE = `
EXEMPLO 1 - Chico Buarque "Cotidiano":
"Todo dia ela faz tudo sempre igual"
→ Estabelece rotina opressiva (COMEÇO)

"Me sacode às seis horas da manhã"
→ Detalhe concreto, não clichê

"Me sorri um sorriso pontual"
→ "Sorriso pontual" = emoção complexa em 2 palavras

EXEMPLO 2 - Caetano Veloso "Você Não Entende Nada":
"Quando eu chego em casa nada me consola"
→ Situação clara e emocional

"Você está sempre aflita"
→ Conflito estabelecido

"Com lágrimas nos olhos, diz que não entendo nada"
→ Clímax emocional

APRENDA COM ELES:
- Detalhes concretos > abstrações
- Emoções complexas em poucas palavras
- Narrativa clara sem explicar demais
- Técnica invisível, história visível
`
\`\`\`

---

## RESULTADO ESPERADO

### ANTES (Técnica primeiro):
\`\`\`
"Cortei o laço, tratei do cabelo" (11 sílabas ✓, mas genérico)
"Pago tudo do meu jeito, sem conselho" (11 sílabas ✓, mas cortado)
"Saí da sombra que tentava me apagar" (11 sílabas ✓, mas clichê)
\`\`\`

### DEPOIS (Narrativa primeiro):
\`\`\`
"Cortei o cabelo curto, bem curtinho" (10 sílabas, detalhe concreto)
"Pago minhas contas sozinha, sem pedir opinião" (13 sílabas, história completa)
"Saí daquela casa que me sufocava" (11 sílabas, emoção específica)
\`\`\`

**DIFERENÇA:**
- Detalhes concretos ("cabelo curto, bem curtinho")
- História completa ("sem pedir opinião")
- Emoção específica ("me sufocava" > "me apagar")
- Métrica flexível para servir à narrativa

---

## PRÓXIMOS PASSOS

1. ✅ Reformular prompts do MetaComposer (PRIORIDADE MÁXIMA)
2. ✅ Reformular sistema de validação (PRIORIDADE MÁXIMA)
3. ✅ Adicionar exemplos de compositores brasileiros
4. ✅ Criar função `analyzeChorusMemorability()`
5. ✅ Criar função `detectCliches()`
6. ✅ Atualizar documentação para usuários

---

## CONCLUSÃO

**ANTES:** Sistema técnico que gera letras corretas mas sem alma
**DEPOIS:** Sistema narrativo que gera histórias envolventes com técnica a serviço da emoção

**FILOSOFIA:**
> "A técnica deve ser INVISÍVEL. O ouvinte deve sentir a HISTÓRIA, não contar as sílabas."
> - Inspirado em Chico Buarque e Caetano Veloso
