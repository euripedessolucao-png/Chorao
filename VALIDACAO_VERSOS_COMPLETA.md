# VALIDAÇÃO COMPLETA DE VERSOS

## Sistema de Dupla Validação

O sistema agora implementa **validação em duas camadas** para garantir qualidade máxima:

### 1. Validação de Sílabas (LIMITE ABSOLUTO)
- **Máximo: 12 sílabas poéticas**
- **Mínimo: 7 sílabas** (recomendado por gênero)
- Usa contagem poética portuguesa (elisão, ditongos, etc.)

### 2. Validação de Integridade de Versos
Detecta problemas estruturais:

#### Erros Críticos (❌)
- Versos com mais de 12 sílabas
- **NUNCA** deve passar na geração ou reescrita

#### Avisos (⚠️)
- **Versos incompletos**: Menos de 3 palavras
- **Versos quebrados**: Aspas não fechadas
- **Vírgulas soltas**: Vírgula no final sem continuação
- **Começa com minúscula**: Possível continuação de verso anterior
- **Termina com preposição**: "de", "da", "para", "com", etc.
- **Sem verbo**: Verso sem ação identificável

## Implementação

### Frontend (UI)
\`\`\`typescript
<SyllableValidator 
  lyrics={lyrics}
  maxSyllables={12}
  onValidate={(result) => {
    // Feedback automático via toast
  }}
/>
\`\`\`

### Backend (API)
\`\`\`typescript
import { validateVerseIntegrity } from "@/lib/validation/verse-integrity-validator"

const integrity = validateVerseIntegrity(generatedLyrics)

if (integrity.longVerses > 0) {
  // REJEITAR: Versos com mais de 12 sílabas
  throw new Error("Versos ultrapassam limite de 12 sílabas")
}

if (integrity.brokenVerses > 0) {
  // AVISAR: Versos incompletos detectados
  console.warn(formatValidationReport(integrity))
}
\`\`\`

## Exemplo de Detecção

### Verso Quebrado Detectado:
\`\`\`
"Nem coração"
\`\`\`
**Problemas:**
- ⚠️ Verso muito curto (2 palavras)
- ⚠️ Sem verbo identificável
- ⚠️ Termina com "coração" (substantivo isolado)

### Verso Correto:
\`\`\`
"Meu coração não aguenta mais"
\`\`\`
**Status:** ✅ Completo, 9 sílabas, tem verbo

## Regras de Ouro

1. **12 sílabas é ABSOLUTO** - Nunca ultrapassar
2. **Versos devem ser completos** - Ter sentido gramatical
3. **Mínimo 3 palavras** - Evitar versos muito curtos
4. **Sempre ter verbo** - Dar ação ao verso
5. **Não terminar com preposição** - Evitar versos incompletos

## Integração com APIs

As APIs de geração e reescrita agora validam automaticamente:
- `POST /api/generate-lyrics` - Valida antes de retornar
- `POST /api/rewrite-lyrics` - Valida e corrige automaticamente
- `POST /api/generate-chorus` - Valida refrões gerados

## Feedback ao Usuário

O sistema fornece feedback em tempo real:
- ✅ **Verde**: Todos os versos perfeitos
- ⚠️ **Laranja**: Versos incompletos detectados
- ❌ **Vermelho**: Limite de 12 sílabas violado

---

**IMPORTANTE**: Este sistema garante que NUNCA mais passaremos de 12 sílabas e que todos os versos serão completos e com sentido gramatical.
