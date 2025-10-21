# VALIDAÇÃO BLOQUEANTE: MÁXIMO 11 SÍLABAS

## REGRA INEGOCIÁVEL

**EM QUALQUER LUGAR DO APLICATIVO:**
- Máximo 11 sílabas por verso
- Acima disso não é possível ser cantada
- Se passa não é letra
- Validação BLOQUEANTE em todas as etapas

## IMPLEMENTAÇÃO

### 1. AbsoluteSyllableEnforcer

Novo validador que:
- ✅ Valida se TODOS os versos têm no máximo 11 sílabas
- ✅ Retorna false se encontrar QUALQUER verso com mais de 11 sílabas
- ✅ Força correção removendo palavras agressivamente se necessário

### 2. Integração no MetaComposer

Validação aplicada em 2 momentos críticos:
1. **ANTES do processamento**: Valida letra bruta da IA
2. **APÓS pós-processamento**: Valida letra final

Se falhar:
- Iterações 1-2: REGENERA letra completa
- Iteração 3 (última): FORÇA correção removendo palavras

### 3. Técnicas de Correção Forçada

Quando necessário forçar correção (última iteração):

1. **Remove artigos**: o, a, os, as, um, uma
2. **Remove possessivos**: meu, minha, meus, minhas
3. **Remove advérbios**: muito, mais, ainda, hoje
4. **Remove conectivos**: mas, e, que, quando
5. **Remove última palavra**: drástico, mas garante limite

## LOGS

\`\`\`
[MetaComposer-TURBO] 🚨 VALIDAÇÃO ABSOLUTA: Máximo 11 sílabas por verso (BLOQUEANTE)
[MetaComposer-TURBO] 🚨 Validação ABSOLUTA de 11 sílabas...
[MetaComposer-TURBO] ✅ APROVADO: Todos os versos têm no máximo 11 sílabas
\`\`\`

Ou em caso de violação:

\`\`\`
[MetaComposer-TURBO] ❌ BLOQUEADO: 3 verso(s) com mais de 11 sílabas
  Linha 5: "Troquei minha paz por papel colorido" (12 sílabas)
  Linha 8: "Deixei meu riacho por um som perdido" (12 sílabas)
  Linha 15: "Compro remédio, pagando os meus medos" (12 sílabas)
[MetaComposer-TURBO] 🔄 REGENERANDO devido a violação de 11 sílabas...
\`\`\`

## GARANTIA

Com esta implementação, é **IMPOSSÍVEL** que uma letra com mais de 11 sílabas seja aprovada em qualquer lugar do aplicativo.
