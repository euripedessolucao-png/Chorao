# LIMITE DE 12 SÍLABAS - REGRA UNIVERSAL INVIOLÁVEL

## PRINCÍPIO FUNDAMENTAL

**NUNCA, EM HIPÓTESE ALGUMA, ULTRAPASSAR 12 SÍLABAS POÉTICAS POR VERSO**

Este não é um guideline ou sugestão. É uma **REGRA FISIOLÓGICA ABSOLUTA** baseada em:

1. **Capacidade pulmonar humana** - Um fôlego natural comporta no máximo 12 sílabas cantadas
2. **Clareza de dicção** - Acima de 12 sílabas, a dicção fica comprometida
3. **Padrões da indústria** - Todos os hits 2024-2025 respeitam este limite
4. **Respiração do cantor** - Versos longos causam fadiga e perda de qualidade vocal

## ONDE ESTE LIMITE ESTÁ IMPLEMENTADO

### 1. Validadores
- `lib/validation/syllable-counter.ts` - `validateSyllableLimit(line, maxSyllables = 12)`
- `lib/validation/syllableEnforcer.ts` - `STRICT_MAX_SYLLABLES = 12`
- `lib/validation/sertanejo-moderno-validator.ts` - `MAX_SYLLABLES_ABSOLUTE = 12`

### 2. Regras Universais
- `lib/rules/universal-rules.ts` - `max_syllables: 12`
- `lib/genre-config.ts` - Todos os gêneros respeitam máximo de 12

### 3. MetaComposer
- `lib/orchestrator/meta-composer.ts` - `getGenreSyllableConfig()` retorna max: 12

### 4. Third Way Engine
- `lib/third-way-converter.ts` - Valida e comprime linhas acima de 12 sílabas
- `lib/terceira-via.ts` - Análise considera 12 como limite absoluto

## COMO O SISTEMA GARANTE ESTE LIMITE

### Etapa 1: Geração
- Prompts de IA incluem instrução explícita: "MÁXIMO 12 SÍLABAS"
- Temperatura controlada para evitar criatividade excessiva

### Etapa 2: Validação
- `SyllableEnforcer.enforceSyllableLimits()` valida TODAS as linhas
- Linhas acima de 12 sílabas são REJEITADAS e reescritas

### Etapa 3: Correção Inteligente
- `ThirdWayEngine` aplica compressão inteligente
- Mantém significado e rima enquanto reduz sílabas
- Usa técnicas como:
  - Remoção de artigos desnecessários
  - Substituição por sinônimos mais curtos
  - Elisão poética natural

### Etapa 4: Polimento Final
- Última verificação antes de retornar ao usuário
- Qualquer linha > 12 sílabas é corrigida ou removida

## EXEMPLOS DE CORREÇÃO

### ❌ ERRADO (13 sílabas)
\`\`\`
"Vem pra Goiás, o amor vai te abraçar aqui"
\`\`\`

### ✅ CORRETO (11 sílabas)
\`\`\`
"Vem pra Goiás, o amor vai te abraçar"
\`\`\`

### ❌ ERRADO (14 sílabas)
\`\`\`
"A mesma canção que une de tudo um pouco sempre"
\`\`\`

### ✅ CORRETO (10 sílabas)
\`\`\`
"A canção que une tudo sempre"
\`\`\`

## TÉCNICAS DE COMPRESSÃO

Quando uma linha excede 12 sílabas, aplicamos (nesta ordem):

1. **Remoção de redundâncias**
   - "que é" → "que"
   - "vai estar" → "estará"

2. **Substituição por sinônimos curtos**
   - "abraçar" → "abraçar" (manter se possível)
   - "sempre" → "sempre" (palavras-chave mantidas)

3. **Elisão poética**
   - "de o" → "do"
   - "para a" → "pra"

4. **Reestruturação criativa**
   - Manter significado e emoção
   - Preservar rimas
   - Ajustar ordem das palavras

## MONITORAMENTO

### Logs de Validação
\`\`\`typescript
console.log(`[v0] Linha ${index}: ${syllables} sílabas`)
if (syllables > 12) {
  console.error(`[v0] VIOLAÇÃO: Linha excede 12 sílabas!`)
}
\`\`\`

### Métricas de Qualidade
- Score reduzido em -10 pontos por linha > 12 sílabas
- Composição rejeitada se > 10% das linhas violam o limite

## EXCEÇÕES

**NÃO HÁ EXCEÇÕES**

Mesmo em casos especiais:
- ❌ "Mas a frase fica incompleta" - Reescreva a frase
- ❌ "Mas perde a rima" - Encontre outra rima
- ❌ "Mas é mais expressivo" - Expressão dentro de 12 sílabas

## RESPONSABILIDADE

Qualquer desenvolvedor que modificar o código DEVE:

1. ✅ Verificar se mantém o limite de 12 sílabas
2. ✅ Testar com letras reais
3. ✅ Validar com `countPoeticSyllables()`
4. ✅ Documentar qualquer mudança relacionada a sílabas

## TESTES OBRIGATÓRIOS

Antes de qualquer deploy:

\`\`\`typescript
// Teste 1: Validação básica
const line = "Sua linha de teste aqui"
const syllables = countPoeticSyllables(line)
assert(syllables <= 12, "Linha excede 12 sílabas!")

// Teste 2: Validação de letra completa
const result = validateLyricsSyllables(lyrics, 12)
assert(result.valid, "Letra contém linhas > 12 sílabas!")

// Teste 3: Enforcement
const enforced = await SyllableEnforcer.enforceSyllableLimits(lyrics, {min: 7, max: 12, ideal: 10}, genre)
assert(enforced.violations.length === 0, "Enforcement falhou!")
\`\`\`

## CONCLUSÃO

O limite de 12 sílabas não é negociável. É a base da qualidade musical e da viabilidade de performance. Qualquer código que permita ultrapassar este limite deve ser considerado um BUG CRÍTICO e corrigido imediatamente.

**CRIATIVIDADE EXISTE DENTRO DOS LIMITES, NÃO QUEBRANDO-OS.**
