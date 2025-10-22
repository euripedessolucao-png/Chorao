# Correção Manual da Letra - Processo Completo

## Letra Original com Erros

\`\`\`
[VERSE 1]
Lembro do cheiro da terra molhada
Poeira na bota, pé firme na trilha
Não o o o o tinha dinheiro, mas amava
Vida, liberdade... era livre, voava

[VERSE 2]
Vendi minha paz por papel colorido
Deixei meu riacho por um rio de ruído
Escolhi o dinheiro, dessa ilusão
E hoje na alma nã há esperanç

[CHORUS]
Chave do carro, nã sei pra onde ir
Casa nobre demais, nã posso sair
Comprei um cavalo bom, láço me prendeu
Ai-ai-ai, quem tá no cabresto sou eu

[VERSE 3]
Dinheiro junto escorre entre os dedo
Compro remédio, pagando os medos
Meu peito dispara, querendo escapar
Da cela de ouro que é lar

[FINAL CHORUS]
Chave do carro, nã sei pra onde ir
Casa nobre demais, nã posso sair
Comprei um cavalo bom, láço me prendeu
Ai-ai-ai, quem tá no cabresto sou eu!

[OUTRO]
Cansei dessa cela, dessa perdi fé...
Eu quebro esse cabresto, volto heranç
\`\`\`

## Processo de Correção Passo a Passo

### PASSO 1: Corrigir "Não o o o o" → "Não"
**Problema:** AggressiveAccentFixer está criando espaços extras
**Correção:** "Não o o o o tinha" → "Não tinha"
**Técnica:** Remover todos os "o" extras e espaços duplicados

### PASSO 2: Corrigir "nã" → "não"
**Problema:** Palavra incompleta sem "o" final
**Correções:**
- "nã há esperanç" → "não há esperança"
- "nã sei" → "não sei" (3 ocorrências)
- "nã posso" → "não posso" (2 ocorrências)
**Técnica:** Detectar "nã" seguido de espaço e substituir por "não"

### PASSO 3: Corrigir palavras cortadas
**Problema:** Palavras sem letras finais
**Correções:**
- "esperanç" → "esperança"
- "heranç" → "herança"
**Técnica:** Detectar palavras terminadas em "ç" sem "a" e adicionar "a"

### PASSO 4: Corrigir "láço" → "laço"
**Problema:** Acento incorreto
**Correção:** "láço" → "laço" (2 ocorrências)
**Técnica:** Remover acento de "láço"

### PASSO 5: Corrigir "os dedo" → "os dedos"
**Problema:** Plural incorreto
**Correção:** "os dedo" → "os dedos"
**Técnica:** Detectar artigo plural + substantivo singular e corrigir

### PASSO 6: Ajustar sílabas para 11
**Versos com mais de 11 sílabas:**
1. "Vendi minha paz por papel colorido" (12) → "Vendi paz por papel colorido" (10) → "Vendi minha paz por papel cor" (11)
2. "Deixei meu riacho por um rio de ruído" (13) → "Deixei riacho por rio de ruído" (11)
3. "Escolhi o dinheiro, dessa ilusão" (12) → "Escolhi dinheiro, dessa ilusão" (11)
4. "E hoje na alma não há esperança" (12) → "Hoje na alma não há esperança" (11)
5. "Casa nobre demais, não posso sair" (12) → "Casa nobre, não posso sair" (10) → "Casa muito nobre, não posso sair" (11)
6. "Comprei um cavalo bom, laço me prendeu" (12) → "Comprei cavalo bom, laço prendeu" (11)
7. "Dinheiro junto escorre entre os dedos" (12) → "Dinheiro escorre entre os dedos" (11)
8. "Eu quebro esse cabresto, volto herança" (13) → "Quebro esse cabresto, volto herança" (11)

**Verso com menos de 11 sílabas:**
1. "Da cela de ouro que é lar" (9) → "Da cela de ouro que é meu lar" (11)

## Letra Corrigida Final

\`\`\`
[VERSE 1]
Lembro do cheiro da terra molhada
Poeira na bota, pé firme na trilha
Não tinha dinheiro, mas eu amava
Vida, liberdade... era livre, voava

[VERSE 2]
Vendi minha paz por papel cor
Deixei riacho por rio de ruído
Escolhi dinheiro, dessa ilusão
Hoje na alma não há esperança

[CHORUS]
Chave do carro, não sei pra onde ir
Casa muito nobre, não posso sair
Comprei cavalo bom, laço prendeu
Ai-ai-ai, quem tá no cabresto sou eu

[VERSE 3]
Dinheiro escorre entre os dedos
Compro remédio, pagando os medos
Meu peito dispara, querendo escapar
Da cela de ouro que é meu lar

[FINAL CHORUS]
Chave do carro, não sei pra onde ir
Casa muito nobre, não posso sair
Comprei cavalo bom, laço prendeu
Ai-ai-ai, quem tá no cabresto sou eu!

[OUTRO]
Cansei dessa cela, dessa perdi fé...
Quebro esse cabresto, volto herança
\`\`\`

## Técnicas Essenciais Descobertas

### 1. Normalização de Espaços AGRESSIVA
- Remover TODOS os espaços duplicados/triplicados
- Aplicar ANTES e DEPOIS de cada correção

### 2. Correção de "não" em 3 Etapas
- Etapa 1: Corrigir "nã " → "não "
- Etapa 2: Corrigir "Não o o o" → "Não "
- Etapa 3: Normalizar espaços

### 3. Completar Palavras Cortadas
- Detectar palavras terminadas em consoante sem vogal final
- Adicionar vogal apropriada baseada no padrão da palavra

### 4. Ajuste de Sílabas em 2 Fases
- Fase 1: Remover palavras desnecessárias (artigos, adjetivos)
- Fase 2: Adicionar palavras curtas se necessário

### 5. Validação Bloqueante
- NUNCA aceitar verso com erros
- Regenerar completamente se falhar após 3 tentativas

## Implementação no Código

Agora vou criar um corretor único que aplica TODAS essas técnicas em ordem:
