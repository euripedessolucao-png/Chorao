# Documentação: Contagem de Sílabas Poéticas Brasileira

## Implementação Completa

### Regras Implementadas

#### 1. Escansão Francesa (Conta até a última tônica)
\`\`\`
Exemplo: "Minha terra tem palmeiras"
Contagem gramatical: Mi-nha-ter-ra-tem-pal-mei-ras (8 sílabas)
Contagem poética: Mi-nha-ter-ra-tem-pal-MEI (7 sílabas)
                                              ↑ última tônica
Descarta: "ras" (átona final)
\`\`\`

#### 2. Sinalefa/Elisão (Junta vogais adjacentes)
\`\`\`
Exemplo: "Essa que estou amando"
Sem sinalefa: Es-sa / que / es-tou / a-man-do (7 sílabas)
Com sinalefa: Es-sa / que-es / tou / a-man-do (6 sílabas)
                        ↑ vogais se juntam
\`\`\`

#### 3. Enjambement (Versos que continuam)
\`\`\`
Exemplo:
"Cortei o laço que me prendia,"  ← termina com vírgula
"Tratei do cabelo e me libertei"  ← continua a frase

✓ VÁLIDO: Vírgula indica continuação
✓ Contador NÃO marca como erro
✓ MetaComposer entende que é correto
\`\`\`

### Tipos de Versos

#### Versos Agudos (terminam em tônica)
\`\`\`
"Eu vou seguir meu caminho sem olHAR"
                                  ↑ tônica final
Sílabas poéticas = sílabas gramaticais
\`\`\`

#### Versos Graves (terminam em paroxítona)
\`\`\`
"Minha terra tem palmEIras"
                      ↑ tônica
                       ras ← descarta
Sílabas poéticas = sílabas gramaticais - 1
\`\`\`

#### Versos Esdrúxulos (terminam em proparoxítona)
\`\`\`
"Que momento mágico e fantÁStico"
                          ↑ tônica
                           ti-co ← descarta 2
Sílabas poéticas = sílabas gramaticais - 2
\`\`\`

### Exemplos Práticos de Música Brasileira

#### Sertanejo Moderno
\`\`\`
✓ "Cortei o laço, tratei do cabelo" (11 sílabas)
✓ "Saí da sombra que tentava me apagar," (11 sílabas + vírgula = enjambement)
✓ "Voltei a ver a vida, voltei a respirar!" (11 sílabas)
\`\`\`

#### Funk/Trap
\`\`\`
✓ "Tô na pista, tô na vibe, tô no flow" (10 sílabas)
✓ "Chama as mina, pega a bike, vamo pro show" (11 sílabas)
\`\`\`

#### Forró
\`\`\`
✓ "Vem dançar comigo nesse forró bom" (10 sílabas)
✓ "Segura na minha mão e vem pro salão" (11 sílabas)
\`\`\`

### Integração com MetaComposer

O MetaComposer agora entende:

1. **Enjambement é correto**
   - Versos com vírgula podem ter mais de 11 sílabas
   - A frase completa no próximo verso

2. **Contagem poética vs. gramatical**
   - Usa escansão francesa (até última tônica)
   - Aplica sinalefa automaticamente

3. **Exemplos claros para a IA**
   - Prompts incluem exemplos de escansão
   - IA aprende a contar corretamente

### Status da Implementação

✅ Contador de sílabas atualizado
✅ Suporte a enjambement
✅ Escansão francesa implementada
✅ Sinalefa/elisão funcionando
⏳ MetaComposer precisa ser atualizado com exemplos

### Próximos Passos

1. Atualizar prompts do MetaComposer com exemplos de escansão
2. Adicionar treinamento específico sobre enjambement
3. Testar com letras reais de música brasileira
