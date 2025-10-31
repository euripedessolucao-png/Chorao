# 🏗️ ARQUITETURA COMPLETA DO SISTEMA - CHORÃO COMPOSITOR

## 📋 VISÃO GERAL

O sistema foi completamente reestruturado baseando-se no **gerador de refrão** que sempre funcionou corretamente. A nova arquitetura segue o princípio de **geração por blocos** com **múltiplas opções** e **seleção inteligente**.

---

## 🎯 FLUXO PRINCIPAL

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    ENTRADA DO USUÁRIO                        │
│  (Gênero, Tema, Título, Requisitos Adicionais)             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              ROTA DE API (generate-lyrics)                   │
│  • Valida entrada                                            │
│  • Inicia processo de geração                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         GERAÇÃO DE REFRÃO (Ponto de Partida)                │
│  • Gera 3 opções de refrão                                   │
│  • Calcula score de cada opção                               │
│  • Seleciona melhor refrão (maior score)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│      GERAÇÃO DE OUTROS BLOCOS (Baseados no Refrão)          │
│  • INTRO (4 linhas, máx 10 sílabas)                         │
│  • VERSE (4 linhas, máx 11 sílabas)                         │
│  • BRIDGE (4 linhas, máx 11 sílabas)                        │
│  • OUTRO (2-4 linhas, máx 9 sílabas)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              MONTAGEM DA MÚSICA COMPLETA                     │
│  Estrutura:                                                  │
│  1. [Intro]                                                  │
│  2. [Verso 1]                                                │
│  3. [Refrão]                                                 │
│  4. [Verso 2]                                                │
│  5. [Refrão]                                                 │
│  6. [Ponte]                                                  │
│  7. [Refrão Final]                                           │
│  8. [Outro]                                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         CORREÇÃO DE SÍLABAS (UnifiedSyllableManager)         │
│  • Aplica elisões de canto (d'amor, cê, pra, tô)           │
│  • Reescreve versos longos (IA primeiro, corte depois)      │
│  • Respeita vírgulas (metade/metade)                        │
│  • Remove palavras "penduradas"                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         COMPLETAR LINHAS QUEBRADAS (LyricsCompletionEngine)  │
│  • Detecta linhas incompletas                                │
│  • Usa contexto para reescrever                              │
│  • Valida 8-12 sílabas cantáveis                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              FORMATAÇÃO FINAL                                │
│  • LineStacker (empilhamento de linhas)                      │
│  • Instrumentação (formatInstrumentationForAI)               │
│  • Capitalização (capitalizeLines)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    SAÍDA FINAL                               │
│  • Letra completa e formatada                                │
│  • Metadata (score, método, qualidade)                       │
└─────────────────────────────────────────────────────────────┘
\`\`\`

---

## 📁 ESTRUTURA DE ARQUIVOS

### 🎵 **Validação e Correção** (`lib/validation/`)

\`\`\`
lib/validation/
├── singing-syllable-counter.ts          ✅ Contador de sílabas cantáveis
│   └── countSyllablesSingingPtBr()      → Usa elisões reais (d'amor, cê, pra)
│
├── intelligent-rewriter.ts              ✅ Reescrita inteligente
│   ├── _rewriteWithinSyllables()        → Tenta IA primeiro, corte depois
│   └── enforceSyllableLimitAll()        → Aplica limite de 12 sílabas
│
├── lyrics-completion-engine.ts          ✅ Completar linhas quebradas
│   ├── completeBrokenLines()            → Detecta e completa linhas
│   ├── isBrokenLine()                   → Detecta padrões de quebra
│   └── rewriteBrokenLine()              → Reescreve com IA
│
└── chorus-optimizer.ts                  ✅ Otimizador de refrão
    ├── enforceChorusRules()             → Hook no topo e final
    ├── applySertanejoChorusShaping()    → 4 linhas, 9-12 sílabas
    └── fixBrokenChorus()                → Reescreve refrões sem sentido
\`\`\`

### 🎼 **Gerenciamento de Sílabas** (`lib/syllable-management/`)

\`\`\`
lib/syllable-management/
└── unified-syllable-manager.ts          ✅ Gerenciador unificado
    ├── processSongWithBalance()         → Processa música completa
    ├── getSyllableRules()               → Regras por gênero
    └── validateLine()                   → Valida linha individual
\`\`\`

### 🎭 **Orquestração** (`lib/orchestrator/`)

\`\`\`
lib/orchestrator/
└── meta-composer.ts                     ✅ Compositor principal
    ├── compose()                        → Orquestra todo o processo
    ├── applyGenreSpecificValidation()   → Validação por gênero
    └── calculateComprehensiveScore()    → Calcula score final
\`\`\`

### 🌐 **Rotas de API** (`app/api/`)

\`\`\`
app/api/
├── generate-lyrics/route.ts             ✅ Geração de letras
│   ├── generateChorusOptions()          → Gera 3 opções de refrão
│   ├── generateOtherBlocks()            → Gera outros blocos
│   └── assembleCompleteSong()           → Monta música completa
│
├── rewrite-lyrics/route.ts              ✅ Reescrita de letras
│   ├── generateBlockVariations()        → Gera variações de blocos
│   ├── assembleCombinations()           → Monta combinações
│   └── selectBestCombination()          → Seleciona melhor
│
└── generate-chorus/route.ts             ✅ Geração de refrões
    └── POST()                           → Gera 5 opções de refrão
\`\`\`

---

## 🔗 DEPENDÊNCIAS E IMPORTS

### ✅ **Imports Corretos**

\`\`\`typescript
// Contador de sílabas cantáveis
import { countSyllablesSingingPtBr } from "@/lib/validation/singing-syllable-counter"

// Reescrita inteligente
import { enforceSyllableLimitAll, _rewriteWithinSyllables } from "@/lib/validation/intelligent-rewriter"

// Completar linhas quebradas
import { LyricsCompletionEngine } from "@/lib/validation/lyrics-completion-engine"

// Otimizador de refrão
import { enforceChorusRules, fixBrokenChorus } from "@/lib/validation/chorus-optimizer"

// Gerenciador unificado
import { UnifiedSyllableManager } from "@/lib/syllable-management/unified-syllable-manager"

// AI SDK
import { generateText } from "ai"
\`\`\`

### ❌ **Imports Antigos (Removidos)**

\`\`\`typescript
// ❌ NÃO USAR MAIS
import { fixIncompleteVerses } from "@/lib/validation/verse-completeness-validator"
import { countPoeticSyllables } from "@/lib/validation/syllable-counter-brasileiro"
\`\`\`

---

## 🎯 REGRAS DE SÍLABAS POR GÊNERO

| Gênero | Mínimo | Ideal | Máximo |
|--------|--------|-------|--------|
| Sertanejo Moderno | 8 | 10 | 12 |
| Sertanejo Raiz | 8 | 9 | 12 |
| Gospel | 8 | 10 | 12 |
| Funk | 6 | 8 | 10 |
| Pagode | 8 | 9 | 11 |

---

## 🔄 FLUXO DE REESCRITA

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│              ENTRADA (Letra Original)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│      GERAÇÃO DE VARIAÇÕES DE BLOCOS (3 opções cada)         │
│  • INTRO (3 variações)                                       │
│  • VERSE (3 variações)                                       │
│  • CHORUS (3 variações)                                      │
│  • BRIDGE (3 variações)                                      │
│  • OUTRO (3 variações)                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         MONTAGEM DE COMBINAÇÕES (3 combinações)              │
│  • Combinação 1: Variação A de cada bloco                   │
│  • Combinação 2: Variação B de cada bloco                   │
│  • Combinação 3: Variação C de cada bloco                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         SELEÇÃO DA MELHOR COMBINAÇÃO                         │
│  • Valida sílabas de cada combinação                        │
│  • Calcula score (sílabas + estrutura)                      │
│  • Seleciona combinação com maior score                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         CORREÇÃO E FORMATAÇÃO (mesmo fluxo de geração)       │
└─────────────────────────────────────────────────────────────┘
\`\`\`

---

## 🎨 SISTEMA DE ELISÕES DE CANTO

### Elisões Naturais (Sinalefa)
\`\`\`typescript
"de amor" → "d'amor"      // 2 sílabas → 1 sílaba
"em um" → "num"           // 2 sílabas → 1 sílaba
"que eu" → "queeu"        // 2 sílabas → 1 sílaba
"meu amor" → "meuamor"    // 3 sílabas → 2 sílabas
\`\`\`

### Contrações Brasileiras
\`\`\`typescript
"você" → "cê"             // 2 sílabas → 1 sílaba
"estou" → "tô"            // 2 sílabas → 1 sílaba
"para" → "pra"            // 2 sílabas → 1 sílaba
"está" → "tá"             // 2 sílabas → 1 sílaba
\`\`\`

---

## 📊 SISTEMA DE SCORES

### Score de Bloco (0-100)
- **Base**: 50 pontos
- **Número de linhas**: +5 pontos por linha (máx 20)
- **Diversidade de palavras**: +2 pontos por palavra única (máx 20)
- **Estrutura completa** (≥4 linhas): +10 pontos

### Score de Combinação (0-100)
- **Sílabas válidas**: 0-50 pontos
- **Estrutura**: 0-50 pontos (baseado em número de linhas)

### Score Final (0-100)
- **Base**: 75 pontos
- **Sílabas válidas**: +15 pontos
- **Score de gênero** (≥80): +10 pontos
- **Terceira via aplicada**: +8 pontos
- **Criatividade ousada**: +7 pontos

---

## 🚨 DETECÇÃO DE LINHAS QUEBRADAS

### Padrões Detectados
\`\`\`typescript
// Frases cortadas
/\b(que|o|a|os|as|um|uma|de|do|da|no|na|em|por|pra|meu|minha)\s*$/i

// Estruturas incompletas
/^[^,]+,\s*[^,]?$/
/,\s*$/

// Palavras incompletas
/coraçã$/
/inspiraçã$/
/razã$/

// Linhas muito curtas
(line) => line.split(/\s+/).filter(w => w.length > 2).length <= 2
\`\`\`

---

## ✅ CHECKLIST DE VALIDAÇÃO

### Antes de Retornar a Letra
- [ ] Todas as linhas têm 8-12 sílabas cantáveis
- [ ] Nenhuma linha termina com preposição/artigo
- [ ] Nenhuma palavra está cortada (coraçã, inspiraçã)
- [ ] Refrão tem hook no topo e final (se fornecido)
- [ ] Refrão tem 4-6 linhas (enxuto e cantável)
- [ ] Estrutura completa (Intro → Versos → Refrão → Ponte → Outro)
- [ ] Instrumentação adicionada
- [ ] Capitalização aplicada

---

## 🔧 TROUBLESHOOTING

### Problema: Versos cortados
**Solução**: `LyricsCompletionEngine.completeBrokenLines()`

### Problema: Versos muito longos
**Solução**: `enforceSyllableLimitAll()` com `_rewriteWithinSyllables()`

### Problema: Refrão sem sentido
**Solução**: `fixBrokenChorus()`

### Problema: Palavras "penduradas"
**Solução**: Regex de limpeza em `intelligent-rewriter.ts`

---

## 📝 NOTAS IMPORTANTES

1. **Máximo de sílabas é 12** (não 11)
2. **IA tenta reescrever PRIMEIRO**, corte é fallback
3. **Vírgulas dividem em metade/metade** para respiração
4. **Hook vai no topo E final do FINAL CHORUS**
5. **Refrão limitado a 6 linhas** (enxuto e cantável)
6. **Elisões são aplicadas automaticamente** no contador

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Sistema de geração por blocos implementado
2. ✅ Sistema de reescrita por variações implementado
3. ✅ Sistema de correção de sílabas unificado
4. ✅ Sistema de completar linhas quebradas
5. ✅ Sistema de otimização de refrão
6. ⏳ Testes de integração completos
7. ⏳ Validação de qualidade em produção

---

**Última atualização**: 2025-01-31
**Versão**: 2.0.0 (Baseado no gerador de refrão)
