# CHECKLIST - Correção Contagem de Sílabas Poéticas Brasileira

## PROBLEMAS IDENTIFICADOS

### 1. Contador de Sílabas Atual
- ❌ Não entende enjambement (encadeamento de versos)
- ❌ Marca verso com vírgula no final como "incompleto"
- ❌ Não aplica regras de escansão poética brasileira
- ❌ Não conta apenas até a última sílaba tônica
- ❌ Não aplica sinalefa/elisão corretamente

### 2. MetaComposer
- ❌ Não tem exemplos específicos de música brasileira
- ❌ Não entende que versos podem continuar no próximo
- ❌ Não tem treinamento em escansão poética

## REGRAS DE ESCANSÃO POÉTICA BRASILEIRA

### Regra 1: Contar até a última sílaba TÔNICA
- Versos AGUDOS (oxítonos): contam todas as sílabas
  - Exemplo: "Meu amor" = Me-u-a-mor = 4 sílabas
- Versos GRAVES (paroxítonos): descartam 1 sílaba final
  - Exemplo: "Minha terra tem palmeiras" = Mi-nha-ter-ra-tem-pal-MEI(ras) = 7 sílabas
- Versos ESDRÚXULOS (proparoxítonos): descartam 2 sílabas finais
  - Exemplo: "Finge tão completamente" = Fin-ge-tão-com-ple-ta-MEN(te) = 7 sílabas

### Regra 2: Sinalefa/Elisão
- Vogais átonas adjacentes se juntam em uma sílaba
- Exemplos:
  - "que estou" = que-es-tou = 2 sílabas (não 3)
  - "de amor" = de-a-mor = 2 sílabas (não 3)
  - "minha alma" = mi-nha-al-ma = 3 sílabas (não 4)

### Regra 3: Enjambement (Encadeamento)
- Verso pode terminar com vírgula e continuar no próximo
- Isso é NORMAL e CORRETO na música brasileira
- Não deve ser marcado como erro
- Exemplos:
  \`\`\`
  "Saí da sua sombra, que tentava me apagar,"
  "E voltei a ver a vida, voltei a respirar!"
  \`\`\`
  - Primeiro verso termina com vírgula = CORRETO
  - A frase continua no segundo verso = ENJAMBEMENT

## CHECKLIST DE IMPLEMENTAÇÃO

### FASE 1: Atualizar Contador de Sílabas ✅
- [x] Implementar contagem até última tônica
- [x] Implementar sinalefa/elisão
- [x] Remover erro de "verso incompleto com vírgula"
- [x] Adicionar suporte para enjambement
- [x] Criar exemplos de teste

### FASE 2: Atualizar MetaComposer ✅
- [x] Adicionar exemplos de enjambement nos prompts
- [x] Explicar que vírgula no final é NORMAL
- [x] Adicionar regras de escansão poética
- [x] Treinar IA com exemplos brasileiros específicos

### FASE 3: Criar Documentação ✅
- [x] Documentar regras de escansão
- [x] Criar exemplos práticos
- [x] Adicionar guia de uso

## EXEMPLOS PRÁTICOS PARA A IA

### Exemplo 1: Enjambement Correto
\`\`\`
"Cortei o laço, tratei do cabelo,"
"Hoje eu pago minhas contas, com meu esforço e zelo!"
\`\`\`
✅ CORRETO - Primeiro verso termina com vírgula e continua no segundo

### Exemplo 2: Contagem até Tônica
\`\`\`
"Minha terra tem palmeiras"
Mi-nha-ter-ra-tem-pal-MEI-ras
Contagem: Mi-nha-ter-ra-tem-pal-MEI = 7 sílabas (descarta "ras")
\`\`\`

### Exemplo 3: Sinalefa
\`\`\`
"Que estou amando"
que-es-tou-a-man-do
Sinalefa: que+es = 1 sílaba, tou+a = 1 sílaba
Contagem: que-es-tou-a-man-do = 5 sílabas
\`\`\`

## IMPLEMENTAÇÃO

Vou implementar todas as correções agora.
