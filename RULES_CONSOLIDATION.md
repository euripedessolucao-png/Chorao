# 📋 CONSOLIDAÇÃO DE REGRAS DO SISTEMA

## ✅ PROBLEMA RESOLVIDO

Antes tínhamos regras espalhadas em múltiplos arquivos, causando:
- ❌ Conflitos entre regras
- ❌ Redundância de código
- ❌ Dificuldade de manutenção
- ❌ Uma regra quebrando outra

## ✅ SOLUÇÃO IMPLEMENTADA

### 1. **Fonte Única de Verdade**

Todas as regras universais agora estão em:
\`\`\`
lib/rules/universal-rules.ts
\`\`\`

### 2. **Hierarquia Clara de Prioridades**

\`\`\`
1º Requisitos Adicionais do Usuário (PRIORIDADE ABSOLUTA)
2º Regras Universais (universal-rules.ts)
3º Regras Específicas do Gênero (genre-config.ts)
4º Sugestões Criativas da IA (menor prioridade)
\`\`\`

### 3. **Motor de Regras Centralizado**

\`\`\`
lib/rules/rule-engine.ts
\`\`\`

Aplica TODAS as regras em ordem de prioridade e retorna validação completa.

## 📁 ESTRUTURA ORGANIZADA

\`\`\`
lib/
├── rules/
│   ├── universal-rules.ts      ← FONTE ÚNICA DE VERDADE
│   └── rule-engine.ts           ← MOTOR DE APLICAÇÃO
├── genre-config.ts              ← Regras específicas por gênero
├── validation/
│   ├── anti-forcing-validator.ts
│   ├── rhyme-validator.ts
│   ├── syllableUtils.ts
│   └── ...
└── ...
\`\`\`

## 🎯 REGRAS UNIVERSAIS CONSOLIDADAS

### 1. Linguagem Simples e Coloquial
- Palavras do dia-a-dia brasileiro
- PROIBIDO: vocabulário rebuscado

### 2. Limite de 12 Sílabas
- Máximo absoluto (fisiológico)
- Combinações: 6+6, 7+5, 5+7

### 3. Rimas Ricas
- Configuração por gênero
- Sertanejo Raiz: 50% mínimo
- Validação automática

### 4. Anti-Forçação
- Evitar artificialidade
- Fluxo natural obrigatório

### 5. Metáforas Respeitadas
- Requisitos Adicionais têm prioridade absoluta

### 6. Terceira Via
- Aplicada em todas as gerações

### 7. Capitalização Profissional
- Primeira letra maiúscula
- Preserva nomes próprios

### 8. Formato para IAs Musicais
- Estrutura em inglês
- Letras em português
- Instrumentos em inglês

### 9. Duração Comercial
- 3:30 minutos padrão
- Exceção: Sertanejo Moderno

### 10. Contexto Integrado
- Refrão/Hook usam contexto existente

## 🔄 COMO USAR

### Em APIs:

\`\`\`typescript
import { buildUniversalRulesPrompt } from '@/lib/rules/rule-engine'

const prompt = `
${buildUniversalRulesPrompt(genre)}

${genreSpecificRules}

${userAdditionalRequirements}
`
\`\`\`

### Em Validadores:

\`\`\`typescript
import { validateWithAllRules } from '@/lib/rules/rule-engine'

const result = await validateWithAllRules(lyrics, genre, additionalRequirements)

if (!result.valid) {
  console.error('Erros:', result.errors)
  console.warn('Avisos:', result.warnings)
}
\`\`\`

## 🎉 BENEFÍCIOS

1. ✅ **Uma única fonte de verdade** - Sem conflitos
2. ✅ **Hierarquia clara** - Prioridades bem definidas
3. ✅ **Fácil manutenção** - Atualizar em um só lugar
4. ✅ **Validação consistente** - Mesmas regras em todas as APIs
5. ✅ **Código limpo** - Sem redundâncias

## 🔮 ATUALIZAÇÕES FUTURAS

Para adicionar/modificar regras:

1. Edite `lib/rules/universal-rules.ts`
2. Atualize `lib/rules/rule-engine.ts` se necessário
3. Todas as APIs automaticamente usarão as novas regras

**Nunca mais** adicione regras diretamente nos prompts das APIs!
