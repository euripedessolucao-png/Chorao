# Meta-Compositor - Sistema Autônomo de Composição Inteligente

## Propósito

O Meta-Compositor é uma camada de orquestração que garante que TODAS as regras e conhecimentos do sistema sejam aplicados de forma autônoma e inteligente em cada composição.

## Arquitetura

\`\`\`
User Request
    ↓
Meta-Composer.compose()
    ↓
    ├─ 1. Geração com Terceira Via (linha por linha)
    ├─ 2. Validação Completa (todas as regras)
    ├─ 3. Cálculo de Qualidade (score 0-1)
    └─ 4. Refinamento Autônomo (se necessário)
    ↓
Final Output (validado e refinado)
\`\`\`

## Regras Orquestradas

1. **Terceira Via** - Força criatividade dentro de restrições
2. **Anti-Forçação** - Coerência narrativa > palavras-chave
3. **Regras Universais** - Linguagem simples, 12 sílabas máx, empilhamento
4. **Regras de Gênero** - Específicas de cada estilo musical
5. **Prioridade de Requisitos** - Sempre no topo da hierarquia

## Como Usar

\`\`\`typescript
import { MetaComposer } from "@/lib/orchestrator/meta-composer"

const result = await MetaComposer.compose({
  genre: "Sertanejo Moderno Feminino",
  theme: "Superação após término",
  mood: "Empoderado",
  additionalRequirements: "Usar gírias modernas",
  creativity: "equilibrado",
})

console.log(result.lyrics)
console.log(`Qualidade: ${result.metadata.finalScore}`)
\`\`\`

## Reversibilidade

Para desativar o Meta-Compositor e voltar ao sistema anterior:

1. Não use `MetaComposer.compose()` nas APIs
2. Continue usando `ThirdWayEngine` diretamente
3. O sistema antigo permanece intacto e funcional

## Benefícios

- ✅ Validação automática de todas as regras
- ✅ Refinamento autônomo até atingir qualidade mínima
- ✅ Score de qualidade objetivo (0-1)
- ✅ Rastreamento de iterações e refinamentos
- ✅ Modular e reversível
