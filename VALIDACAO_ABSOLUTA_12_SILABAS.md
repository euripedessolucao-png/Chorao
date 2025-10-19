# VALIDAÇÃO ABSOLUTA: NUNCA MAIS DE 12 SÍLABAS

## 🚨 REGRA CRÍTICA INVIOLÁVEL

**NENHUM VERSO PODE TER MAIS DE 12 SÍLABAS POÉTICAS**

Esta é a regra mais importante do sistema. Não é uma sugestão, é um LIMITE ABSOLUTO.

## 🛡️ CAMADAS DE PROTEÇÃO

### 1. VALIDAÇÃO PRÉ-GERAÇÃO
- MetaComposer garante que `syllableTarget.max` nunca ultrapasse 12
- Prompts de IA incluem instrução explícita: "MÁXIMO 12 sílabas por verso"

### 2. VALIDAÇÃO PÓS-GERAÇÃO
- `detectCriticalViolations()` verifica TODOS os versos
- Se houver violações, REGENERA a letra (até 3 tentativas)

### 3. CORREÇÃO AUTOMÁTICA
- `SyllableEnforcer.enforceSyllableLimits()` corrige versos longos
- Preserva rimas removendo palavras do MEIO do verso

### 4. VALIDAÇÃO PÓS-CORREÇÃO
- Verifica novamente após correção automática
- Se ainda houver violações, aplica correção emergencial

### 5. CORREÇÃO EMERGENCIAL
- `applyEmergencyCorrection()` é o último recurso
- Remove palavras do meio, preserva início e fim (rimas)
- Garante que NENHUM verso saia com >12 sílabas

### 6. VALIDAÇÃO FINAL ABSOLUTA
- Antes de retornar resultado, verifica uma última vez
- Se houver violações, aplica correção emergencial novamente
- **NUNCA retorna letra com versos >12 sílabas**

## ❌ O QUE NUNCA DEVE ACONTECER

\`\`\`
❌ "Meu coração dispara quando você chega perto de mim" (13 sílabas)
❌ "Sou goiano de coração, vivo com muita emoção" (13 sílabas)
\`\`\`

## ✅ O QUE DEVE ACONTECER

\`\`\`
✅ "Coração acelera quando cê vem perto" (10 sílabas)
✅ "Sou goiano, vivo com emoção" (9 sílabas)
\`\`\`

## 🔧 TÉCNICAS DE CORREÇÃO

### Contrações Brasileiras
- "você" → "cê"
- "está" → "tá"
- "para" → "pra"
- "estou" → "tô"

### Remoção Inteligente
- Remove palavras do MEIO do verso
- NUNCA remove do final (preserva rimas)
- NUNCA remove do início (preserva sentido)

### Exemplo de Correção
\`\`\`
Original: "Meu coração dispara quando você chega perto" (12s) ✅
Longo: "Meu coração dispara quando você chega perto de mim" (13s) ❌

Correção automática:
1. Tenta contrações: "Meu coração dispara quando cê chega perto" (11s) ✅

Correção emergencial (se necessário):
2. Remove do meio: "Coração dispara quando cê chega perto" (10s) ✅
\`\`\`

## 📊 MONITORAMENTO

O sistema loga TODAS as violações:
\`\`\`
[MetaComposer-TURBO] ❌ VIOLAÇÃO CRÍTICA: 2 versos com >12 sílabas
  Linha 5: "Meu coração..." (13 sílabas)
  Linha 12: "Sou goiano..." (13 sílabas)
[MetaComposer-TURBO] 🔄 Regenerando devido a violações críticas...
\`\`\`

## 🎯 GARANTIA

Com estas 6 camadas de proteção, é **IMPOSSÍVEL** que um verso com mais de 12 sílabas chegue ao usuário.

Se isso acontecer, há um bug crítico que deve ser corrigido imediatamente.
