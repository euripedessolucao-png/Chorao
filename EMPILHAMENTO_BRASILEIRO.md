# PADRÃO OURO DE EMPILHAMENTO BRASILEIRO

## PRINCÍPIO FUNDAMENTAL
**UM VERSO POR LINHA = ESTRUTURA CLARA**

Este é o formato padrão da indústria musical brasileira para composição de letras.

## REGRAS ABSOLUTAS

### 1. Empilhamento Obrigatório
- **CADA VERSO EM UMA LINHA SEPARADA**
- NUNCA junte dois versos na mesma linha
- **EXCEÇÃO ÚNICA**: Apenas quando o segundo verso é continuação DIRETA do primeiro

### 2. Por Que Empilhar?
- ✅ Facilita contagem de sílabas
- ✅ Formato padrão da indústria brasileira
- ✅ Melhor visualização da estrutura
- ✅ Mais fácil para o cantor ler
- ✅ Permite validação técnica precisa

## ESTRUTURA POR SEÇÃO

### VERSE (Verso)
- **6-8 linhas empilhadas**
- Função: Apresentar história, personagem, contexto
- Cada linha: máximo 12 sílabas poéticas

### PRE-CHORUS (Pré-Refrão)
- **2-4 linhas empilhadas**
- Função: Preparar emocionalmente para o refrão
- Transição suave, aumenta tensão

### CHORUS (Refrão)
- **4 linhas empilhadas (PADRÃO OURO)**
- Função: GANCHO - momento mais importante
- Primeira linha deve grudar na cabeça
- Cada linha: 8-10 sílabas (ideal para melodia)

### BRIDGE (Ponte)
- **4-6 linhas empilhadas**
- Função: Mudança de perspectiva, clímax emocional
- Quebra o padrão, prepara para final

### OUTRO (Final)
- **2-4 linhas empilhadas**
- Função: Conclusão ou fade out
- Deixa saudade, frase final marcante

## EXEMPLOS

### ✅ CORRETO (Empilhado)
\`\`\`
[VERSE 1]
Se quer saber de mim
Pergunte para mim
Se for falar do que passou
Conta a parte que você errou
Não vem com esse papo furado
Dizendo que foi enganado
\`\`\`

### ❌ ERRADO (Não Empilhado)
\`\`\`
[VERSE 1]
Se quer saber de mim, pergunte para mim
Se for falar do que passou, conta a parte que você errou
Não vem com esse papo furado dizendo que foi enganado
\`\`\`

### ✅ EXCEÇÃO VÁLIDA (Continuação Direta)
\`\`\`
[VERSE 1]
E eu que sempre acreditei
No amor que a gente fez
E agora você me deixa
Com esse vazio na pele
Com essa saudade que dói
E não passa, não sai de mim, não me deixa em paz
\`\`\`
*Nota: Últimos versos são continuação direta - pode ficar na mesma linha*

## VARIAÇÃO POR GÊNERO

### Sertanejo Raiz
- VERSE: 6-8 linhas (tradicional)
- CHORUS: 4 linhas (rígido)
- Estrutura mais tradicional

### Sertanejo Moderno
- VERSE: 6-8 linhas (flexível)
- CHORUS: 4 linhas (pode variar para 3-5 em casos especiais)
- PRE-CHORUS: 2-4 linhas (mais comum)
- Permite mais variação criativa

### Funk
- VERSE: 4-6 linhas (mais curto)
- CHORUS: 4 linhas (repetitivo)
- Estrutura mais direta e repetitiva

### Pagode/Samba
- VERSE: 6-8 linhas
- CHORUS: 4 linhas
- BRIDGE: 4-6 linhas (importante)
- Estrutura tradicional respeitada

## IMPLEMENTAÇÃO TÉCNICA

### Validação Automática
\`\`\`typescript
// Verifica se versos estão empilhados
const hasStackingIssues = verseLines.some(line => {
  const words = line.split(' ').filter(w => w.length > 2)
  // Se linha tem mais de 12 palavras, provavelmente tem 2 versos juntos
  return words.length > 12
})
\`\`\`

### Contagem de Linhas
\`\`\`typescript
// VERSE deve ter 6-8 linhas
if (verseLines.length < 6) {
  issues.push(`VERSO muito curto: ${verseLines.length} linhas (mínimo 6)`)
}

// CHORUS deve ter exatamente 4 linhas
if (chorusLines.length !== 4) {
  issues.push(`REFRÃO com ${chorusLines.length} linhas (deve ter 4 exatas)`)
}
\`\`\`

## PRIORIDADES

1. **UM VERSO POR LINHA** (90% dos casos)
2. **MÁXIMO 12 SÍLABAS POR VERSO**
3. **FRASE COMPLETA EM CADA LINHA**
4. **ESTRUTURA CLARA E ORGANIZADA**

## INTEGRAÇÃO COM SISTEMA

### APIs Atualizadas
- ✅ `app/api/generate-lyrics/route.ts` - Geração com empilhamento
- ✅ `app/api/rewrite-lyrics/route.ts` - Reescrita com empilhamento
- ✅ `app/api/generate-chorus/route.ts` - Refrão empilhado
- ✅ `app/api/generate-hook/route.ts` - Hook empilhado

### Validadores
- ✅ `lib/validation/structureValidator.ts` - Valida empilhamento
- ✅ `lib/validation/syllableUtils.ts` - Conta sílabas por linha
- ✅ `components/syllable-validator.tsx` - UI de validação

## MENSAGENS DE ERRO

### Verso Não Empilhado
\`\`\`
❌ VERSOS NÃO EMPILHADOS - detectado 2 versos na mesma linha
\`\`\`

### Estrutura Incorreta
\`\`\`
❌ VERSO muito curto: 4 linhas (mínimo 6)
❌ REFRÃO com 5 linhas (deve ter EXATAMENTE 4)
❌ PRÉ-REFRÃO com 1 linha (mínimo 2)
\`\`\`

## CONCLUSÃO

O empilhamento brasileiro é **OBRIGATÓRIO** e **NÃO NEGOCIÁVEL** para:
- Facilitar trabalho do compositor
- Permitir validação técnica precisa
- Seguir padrão da indústria
- Garantir qualidade profissional

**SEMPRE EMPILHE OS VERSOS!**
