# ARQUITETURA ORGANIZADA DO SISTEMA

## Estrutura de Pastas

\`\`\`
lib/
├── constants/
│   └── syllable-limits.ts          # Limites centralizados de sílabas
├── validation/
│   ├── index.ts                    # Barrel export de validadores
│   ├── syllable-counter.ts         # Contador de sílabas poéticas
│   ├── syllableEnforcer.ts         # Enforcer de limites
│   ├── verse-integrity-validator.ts # Validador de integridade
│   ├── rhyme-validator.ts          # Validador de rimas
│   └── sertanejo-moderno-validator.ts # Validador específico
├── terceira-via/
│   ├── index.ts                    # Barrel export
│   ├── terceira-via-core.ts        # Lógica principal
│   ├── third-way-converter.ts      # Engine de conversão
│   └── analysis.ts                 # Funções de análise
├── orchestrator/
│   └── meta-composer.ts            # Orquestrador principal
└── genre-config.ts                 # Configurações de gêneros
\`\`\`

## Princípios de Organização

### 1. Centralização de Constantes
- **Arquivo**: `lib/constants/syllable-limits.ts`
- **Propósito**: Único ponto de verdade para limites de sílabas
- **Benefício**: Mudanças em um lugar afetam todo o sistema

### 2. Barrel Exports
- **Arquivos**: `lib/validation/index.ts`, `lib/terceira-via/index.ts`
- **Propósito**: Simplificar imports
- **Uso**: `import { validateVerseIntegrity } from '@/lib/validation'`

### 3. Separação de Responsabilidades
- **Validação**: Tudo em `lib/validation/`
- **Terceira Via**: Tudo em `lib/terceira-via/`
- **Orquestração**: `lib/orchestrator/`

### 4. Compatibilidade Retroativa
- **Arquivo**: `lib/terceira-via.ts`
- **Propósito**: Re-exporta de `lib/terceira-via/` para não quebrar imports antigos

## Como Adicionar Novas Funcionalidades

### Novo Validador
1. Criar arquivo em `lib/validation/novo-validador.ts`
2. Adicionar export em `lib/validation/index.ts`
3. Usar: `import { novoValidador } from '@/lib/validation'`

### Nova Análise Terceira Via
1. Adicionar função em `lib/terceira-via/analysis.ts`
2. Export automático via `lib/terceira-via/index.ts`

### Novo Limite de Sílabas
1. Editar `lib/constants/syllable-limits.ts`
2. Mudança se propaga automaticamente

## Imports Recomendados

\`\`\`typescript
// ✅ BOM - Usa barrel exports
import { validateVerseIntegrity, enforceSyllableCount } from '@/lib/validation'
import { applyTerceiraViaToLine, analisarTerceiraVia } from '@/lib/terceira-via'
import { SYLLABLE_LIMITS, getSyllableLimits } from '@/lib/constants/syllable-limits'

// ❌ EVITAR - Imports diretos
import { validateVerseIntegrity } from '@/lib/validation/verse-integrity-validator'
\`\`\`

## Checklist de Manutenção

- [ ] Todos os limites de sílabas usam `SYLLABLE_LIMITS`
- [ ] Validadores exportados via `lib/validation/index.ts`
- [ ] Terceira Via consolidada em `lib/terceira-via/`
- [ ] Sem arquivos duplicados na raiz
- [ ] Documentação atualizada
