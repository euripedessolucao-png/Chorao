# VALIDAÇÃO DE NARRATIVA FLUÍDA

## Objetivo

Garantir que TODA letra gerada ou reescrita tenha uma **narrativa fluída e coerente**, com começo, meio e fim, onde cada verso contribui para contar a história sem cortes abruptos.

## Validações Implementadas

### 1. Estrutura Narrativa (Começo, Meio, Fim)

**Começo (30 pontos):**
- Apresentação da situação ou personagem
- Identificado por: `[Intro]`, `[Verse 1]`, `[PART A]`

**Meio (30 pontos):**
- Desenvolvimento da história
- Identificado por: `[Verse 2]`, `[Bridge]`, `[PART A2]`

**Fim (20 pontos):**
- Conclusão ou resolução
- Identificado por: `[Outro]`, `[Chorus final]`, `[PART B]` repetido

### 2. Continuidade Entre Versos (20 pontos)

**Detecta mudanças abruptas verificando:**
- Palavras em comum entre versos consecutivos
- Conectores temporais (então, depois, agora, mas, e)
- Continuidade emocional (mesma emoção ou transição lógica)

**Transições lógicas aceitas:**
- Negativo → Neutro → Positivo
- Mesma emoção mantida
- Conectores explícitos

### 3. Contribuição de Cada Verso

**Verifica se cada verso:**
- Tem pelo menos 3 palavras (não é fragmento)
- Não é repetitivo demais (máximo 2x, exceto refrão)
- Adiciona informação nova à história

## Score de Narrativa

- **100-90**: Narrativa perfeita, fluída e coerente
- **89-70**: Narrativa boa, aprovada
- **69-50**: Narrativa fraca, precisa melhorias
- **<50**: Narrativa inadequada, REJEITAR

## Integração no MetaComposer

### Validação Final

O MetaComposer aplica validação de narrativa em **TODAS** as letras antes de retornar:

\`\`\`typescript
const narrativeValidation = validateNarrativeFlow(lyrics, genre)
if (!narrativeValidation.isValid) {
  // Adiciona warnings ou erros críticos
  // Se score < 70, REGENERA
}
\`\`\`

### Feedback Específico

- "Falta apresentação clara no início"
- "Falta desenvolvimento da história"
- "Falta conclusão ou resolução"
- "Detectadas X mudanças abruptas na narrativa"
- "X versos muito curtos ou vazios"
- "Verso repetido Xx sem ser refrão"

## Exemplos

### ✅ NARRATIVA BOA

\`\`\`
[PART A - Verse 1]
Churrasco na brasa, cerveja no ponto
Viola animada, noite é um encanto

[PART B - Chorus]
Vem pra Goiás, o amor vai te abraçar
Terra de gente boa, vem celebrar

[PART A2 - Verse 2]
Morena sorrindo, perfume no ar
Dança comigo, deixa o tempo passar

[PART B - Chorus]
Vem pra Goiás, o amor vai te abraçar
Terra de gente boa, vem celebrar
\`\`\`

**Por quê é boa:**
- Começo: Apresenta cenário (churrasco, viola)
- Meio: Desenvolve com personagem (morena)
- Fim: Refrão repetido conclui convite
- Continuidade: Mesma emoção positiva, conectores implícitos
- Cada verso adiciona informação nova

### ❌ NARRATIVA RUIM

\`\`\`
[Verse 1]
Churrasco na brasa
Nem coração

[Verse 2]
Sou goiano, vivo com emoção!
Cidade grande, luzes neon
\`\`\`

**Por quê é ruim:**
- Versos quebrados ("Nem coração" incompleto)
- Mudança abrupta (churrasco → cidade grande)
- Sem continuidade emocional ou temporal
- Versos não contribuem para história coerente

## Garantias do Sistema

1. **NUNCA** retorna letra com narrativa score < 70
2. **SEMPRE** valida continuidade entre versos
3. **DETECTA** mudanças abruptas e corrige
4. **GARANTE** que cada verso contribui para a história
5. **REGENERA** se narrativa inadequada (até 3 tentativas)

## Para Geração E Reescrita

Ambas as APIs (`generate-lyrics` e `rewrite-lyrics`) usam o MetaComposer, portanto:

- ✅ Validação de narrativa aplicada em AMBAS
- ✅ Continuidade garantida em AMBAS
- ✅ Começo-meio-fim verificado em AMBAS
- ✅ Cada verso trabalhado individualmente em AMBAS

**A narrativa fluída é GARANTIDA em todo o sistema!**
