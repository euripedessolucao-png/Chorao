# AggressiveAccentFixer Ampliado - Documentação Completa

## Pesquisa Realizada

Pesquisei na web sobre:
1. **Erros comuns em letras de música brasileira** (sertanejo, MPB, forró)
2. **Contrações informais do português brasileiro**
3. **Palavras mais usadas em música brasileira**

## Descobertas da Pesquisa

### Erros Comuns Identificados
- **Concordância verbal**: "as mina pira" (deveria ser "piram")
- **Concordância nominal**: "os nosso sentimento" (deveria ser "nossos sentimentos")
- **Redundância**: "saio pra fora", "há dez mil anos atrás"

### Contrações Informais Comuns
- **você** → vc, cê, voce
- **está** → tá, ta
- **estou** → tô, to
- **nós** → nóis, nos
- **também** → tbm, tambem
- **para** → pra
- **bênção** → bença

### Palavras Mais Usadas (Estudo Ecad 2022)
1. amor (101.479 repetições)
2. Deus
3. vida
4. coração
5. saudade
6. forró (8.381 repetições)

## Implementação

### Dicionário Ampliado
Adicionei **50+ palavras** ao dicionário, incluindo:
- Todas as contrações informais comuns
- Palavras mais usadas em música brasileira
- Palavras com acentuação frequentemente erradas
- Verbos conjugados comuns

### Padrões de Correção
Adicionei padrões para:
- "não" colado com qualquer palavra
- "pra" colado com artigos
- "de" colado com artigos
- "em" colado com artigos

### Integração Completa

O AggressiveAccentFixer agora está presente em:

1. **syllable-counter.ts** - ANTES de contar sílabas ← **NOVO!**
2. **MetaComposer.generateSingleVersion** - PRÉ-geração (letra original)
3. **MetaComposer.generateSingleVersion** - PÓS-geração (letra gerada)
4. **MetaComposer.generateSingleVersion** - Após Terceira Via
5. **MetaComposer.generateSingleVersion** - Após polimento
6. **MetaComposer.generateSingleVersion** - Correção final (ultimateFix)
7. **MultiGenerationEngine** - FASE 2 (cada variação)

## Resultado Esperado

Com essas mudanças, o AggressiveAccentFixer agora:
- ✅ Corrige TODOS os erros comuns da música brasileira
- ✅ Está presente do INÍCIO ao FIM do fluxo
- ✅ Corrige até no contador de sílabas final
- ✅ Resolve cada detalhe que escapar durante o curso
- ✅ Apresenta solução final se algo escapar no contador

## Logging

Adicionado logging detalhado com `[v0]` em todos os pontos para rastrear:
- Quando o AggressiveAccentFixer é aplicado
- Quais correções foram feitas
- Se o texto foi modificado antes de contar sílabas
</markdown>
