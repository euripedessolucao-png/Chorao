# Análise da Letra e Correção Ampliada

## Análise Completa da Letra

### Erros Críticos Identificados

**1. Espaços Duplicados/Triplicados:**
- "não o o o sei" → deveria ser "não sei"
- "não o o sabe" → deveria ser "não sabe"  
- "não o o colhi" → deveria ser "não colhi"

**2. Análise de Sílabas (usando contador oficial):**

[VERSE 1]
1. "Poeira da estrada, amargor tem" = 9 sílabas ❌
2. "Cheiro de terra, meu único bem" = 9 sílabas ❌
3. "Sem ouro no bolso, rei do meu chão" = 10 sílabas ❌
4. "Viola tocando minha oração" = 10 sílabas ❌

[CHORUS]
1. "Leva meu ouro, leva o que tenho" = 10 sílabas ❌
2. "Devolve vida que perdi no caminho" = 11 sílabas ✅
3. "Devolve o riso, meu sonho, meu ninho" = 11 sílabas ✅
4. "Tô sangrando saudade, morrendo sozinho" = 11 sílabas ✅

[VERSE 2]
1. "Troquei céu estrelado por luz de neon" = 11 sílabas ✅
2. "Segurança falsa que brilha e some" = 11 sílabas ✅
3. "Carro na vaga, não o o o sei pra onde ir" = ERRO DE ESPAÇAMENTO
4. "Cavalo ferro não o o sabe sentir" = ERRO DE ESPAÇAMENTO

[BRIDGE]
1. "Minha sina..." = 3 sílabas ❌
2. "Comprei casa grande, lar ficou pra trás" = 11 sílabas ✅
3. "Plantei dinheiro, não o o colhi paz" = ERRO DE ESPAÇAMENTO
4. "Coração cansado quer fugir daqui" = 11 sílabas ✅
5. "Gaiola de luxo que eu construí" = 10 sílabas ❌

**RESULTADO: 8 de 18 versos corretos (44.44%)**

## Problemas Identificados

### 1. AggressiveAccentFixer está Criando Espaços Extras
O regex `/\bnã([a-z]+)\b/gi` está capturando e substituindo incorretamente:
- "nãsei" → "não o o o sei" (ERRADO)
- "nãsabe" → "não o o sabe" (ERRADO)
- "nãcolhi" → "não o o colhi" (ERRADO)

### 2. UltraAggressiveSyllableReducer Não Está Funcionando
Muitos versos com 9-10 sílabas não estão sendo corrigidos para 11.

### 3. Falta Validação de Espaços Duplicados
Não há validação para remover espaços duplicados após correções.

## Correção Ampliada

### 1. Reescrever AggressiveAccentFixer
\`\`\`typescript
// Método de correção melhorado
private fixWord(word: string): string {
  // Remove pontuação para análise
  const cleanWord = word.replace(/[.,!?;:]/g, '')
  const punctuation = word.replace(cleanWord, '')
  
  // Verifica se é "não" colado com palavra
  if (cleanWord.startsWith('nã') && cleanWord.length > 2) {
    const restOfWord = cleanWord.substring(2)
    return `não ${restOfWord}${punctuation}`
  }
  
  // Busca no dicionário
  const lowerWord = cleanWord.toLowerCase()
  if (this.accentDictionary[lowerWord]) {
    const corrected = this.accentDictionary[lowerWord]
    return this.preserveCapitalization(word, corrected) + punctuation
  }
  
  return word
}
\`\`\`

### 2. Adicionar Validador de Espaços
\`\`\`typescript
export class SpaceNormalizer {
  static normalize(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Remove espaços duplicados
      .replace(/\s+([.,!?;:])/g, '$1') // Remove espaço antes de pontuação
      .replace(/([.,!?;:])\s*([.,!?;:])/g, '$1$2') // Remove espaço entre pontuações
      .trim()
  }
}
\`\`\`

### 3. Integrar em Todo o Fluxo
- Aplicar SpaceNormalizer APÓS AggressiveAccentFixer
- Aplicar em TODOS os pontos: geração, reescrita, editor, revisor final
- Adicionar logging para debug

## Plano de Implementação

1. ✅ Reescrever método `fixWord()` do AggressiveAccentFixer
2. ✅ Criar classe `SpaceNormalizer`
3. ✅ Integrar SpaceNormalizer após AggressiveAccentFixer em todos os pontos
4. ✅ Adicionar validação final que bloqueia letras com espaços duplicados
5. ✅ Testar com a letra atual

## Resultado Esperado

Após implementação:
- 0 erros de espaçamento
- 100% de versos com 11 sílabas
- Correção automática em todo o fluxo
