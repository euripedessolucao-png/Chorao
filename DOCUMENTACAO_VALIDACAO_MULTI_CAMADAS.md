# SISTEMA DE VALIDAÇÃO MULTI-CAMADAS

## REGRA DE OURO
**Cada passo da letra só segue se atender TODAS as regras.**

## CAMADAS DE VALIDAÇÃO

### 1. SÍLABAS (BLOQUEANTE) ⛔
- **Regra:** Máximo 11 sílabas poéticas por verso
- **Exceção:** Versos com vírgula final (enjambement)
- **Ação se falhar:** Aplica correção automática ou regenera

### 2. NARRATIVA (BLOQUEANTE) ⛔
- **Regra:** Começo, meio e fim claros
- **Regra:** Continuidade entre versos
- **Regra:** Sem mudanças abruptas de assunto
- **Ação se falhar:** Regenera com foco em narrativa

### 3. RIMAS (BLOQUEANTE) ⛔
- **Regra:** Esquema de rimas adequado ao gênero
- **Regra:** Qualidade mínima de rimas (rica/pobre/toante)
- **Regra:** Sem rimas falsas (exceto gêneros que permitem)
- **Ação se falhar:** Regenera com foco em rimas

### 4. GRAMÁTICA (BLOQUEANTE) ⛔
- **Regra:** Português correto
- **Regra:** Concordância verbal e nominal
- **Regra:** Uso correto de pronomes e crase
- **Ação se falhar:** Regenera

### 5. ANTI-FORCING (BLOQUEANTE) ⛔
- **Regra:** Palavras-chave só com contexto narrativo
- **Regra:** Sem absurdos tipo "biquíni no altar"
- **Ação se falhar:** Regenera

### 6. EMOÇÃO (NÃO BLOQUEANTE) ⚠️
- **Regra:** Densidade emocional entre 0.3 e 0.8
- **Regra:** Emoção autêntica, não forçada
- **Ação se falhar:** Aviso, mas não bloqueia

## FLUXO DE VALIDAÇÃO

\`\`\`
1. Gera letra
2. Valida TODAS as camadas
3. Se TODAS passarem → ✅ APROVADO
4. Se alguma falhar → Tenta corrigir automaticamente
5. Se correção funcionar → ✅ APROVADO
6. Se correção falhar → Regenera (até 5 tentativas)
7. Se esgotar tentativas → ❌ ERRO (prompts precisam ajuste)
\`\`\`

## SCORES

- **100/100:** Perfeito em todas as camadas
- **90-99:** Excelente, pequenos ajustes
- **80-89:** Bom, alguns avisos
- **70-79:** Aceitável, precisa melhorias
- **< 70:** Reprovado, regenera

## PRIORIDADES

1. **NARRATIVA** - História coerente e envolvente
2. **SÍLABAS** - Métrica perfeita (11 sílabas)
3. **RIMAS** - Qualidade e esquema corretos
4. **GRAMÁTICA** - Português impecável
5. **ANTI-FORCING** - Naturalidade
6. **EMOÇÃO** - Autenticidade

## IMPLEMENTAÇÃO

- `validateAllLayers()` - Valida letra completa
- `validateSingleVerse()` - Valida verso individual
- `generateWithValidation()` - Gera com validação automática
- `AutoSyllableCorrector` - Correção automática de sílabas

## RESULTADO

**Qualidade 100% garantida** - Nenhuma letra sai sem passar em TODAS as validações bloqueantes.
