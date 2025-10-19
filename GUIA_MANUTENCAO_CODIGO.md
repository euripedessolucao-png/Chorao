# 🛠️ Guia de Manutenção do Código

## Sistema: Chorão Compositor
## Versão: 2.0 (Pós-Melhorias)
## Data: 2025-01-19

---

## 📁 ESTRUTURA DO PROJETO

### Arquivos Principais

#### APIs
- **`app/api/generate-lyrics/route.ts`**: API de criação de letras
- **`app/api/rewrite-lyrics/route.ts`**: API de reescrita de letras

#### Orquestração
- **`lib/orchestrator/meta-composer.ts`**: Orquestrador principal do sistema
- **`lib/terceira-via.ts`**: Sistema de análise Terceira Via
- **`lib/third-way-converter.ts`**: Motor ThirdWayEngine

#### Validação
- **`lib/validation/syllable-counter.ts`**: Contador de sílabas poéticas
- **`lib/validation/syllableEnforcer.ts`**: Corretor de sílabas
- **`lib/validation/rhyme-validator.ts`**: Validador de rimas
- **`lib/validation/rhyme-enhancer.ts`**: Melhorador de rimas

#### Utilitários
- **`lib/genre-config.ts`**: Configurações por gênero
- **`lib/utils/capitalize-lyrics.ts`**: Capitalização automática
- **`lib/utils/line-stacker.ts`**: Empilhamento de versos

---

## 🔧 COMO FAZER MUDANÇAS SEGURAS

### 1. Antes de Modificar Qualquer Código

\`\`\`bash
# 1. Leia o arquivo completo
# 2. Entenda o contexto e dependências
# 3. Verifique se há testes relacionados
# 4. Documente a mudança que pretende fazer
\`\`\`

### 2. Regras de Ouro

#### ❌ NUNCA FAÇA:
- Alterar regras de composição sem consultar
- Remover validações de sílabas ou rimas
- Modificar o fluxo Terceira Via → MetaComposer
- Alterar configurações de gênero sem testar
- Remover tratamento de erros

#### ✅ SEMPRE FAÇA:
- Leia o código antes de editar
- Mantenha comentários atualizados
- Teste mudanças localmente
- Documente novas funcionalidades
- Preserve backward compatibility

---

## 📝 PADRÕES DE CÓDIGO

### Comentários

\`\`\`typescript
// ✅ BOM: Comentário descritivo

// ❌ RUIM: Comentário vago
// mudança aqui
\`\`\`

### Funções

\`\`\`typescript
// ✅ BOM: Nome descritivo e documentação
/**
 * Aplica formatação performática na letra
 * @param lyrics - Letra original
 * @param genre - Gênero musical
 * @param rhythm - Ritmo específico
 * @returns Letra formatada com tags em inglês
 */
function applyPerformanceFormatting(
  lyrics: string, 
  genre: string, 
  rhythm: string
): string {
  // ... implementação
}

// ❌ RUIM: Nome genérico sem documentação
function format(text: string): string {
  // ... implementação
}
\`\`\`

### Tratamento de Erros

\`\`\`typescript
// ✅ BOM: Try-catch com fallback
try {
  const result = await MetaComposer.compose(request)
  return result
} catch (error) {
  console.error('[Create-Song] Erro:', error)
  // Fallback para sistema simplificado
  return await fallbackGeneration(request)
}

// ❌ RUIM: Sem tratamento
const result = await MetaComposer.compose(request)
return result
\`\`\`

---

## 🎯 ÁREAS CRÍTICAS (CUIDADO EXTRA)

### 1. Sistema de Sílabas
**Arquivo**: `lib/validation/syllable-counter.ts`

**Por que é crítico**: Base de toda a métrica poética

**Ao modificar**:
- Teste com múltiplos exemplos
- Verifique elisões (de amor → d'amor)
- Confirme sinalefas (sua alma → sualma)
- Valide com letras reais

### 2. MetaComposer
**Arquivo**: `lib/orchestrator/meta-composer.ts`

**Por que é crítico**: Orquestra todo o processo

**Ao modificar**:
- Não altere o fluxo principal
- Preserve chamadas à Terceira Via
- Mantenha validações de sílabas
- Teste com diferentes gêneros

### 3. Formatação Performática
**Arquivos**: 
- `app/api/generate-lyrics/route.ts` (função `applyPerformanceFormatting`)
- `app/api/rewrite-lyrics/route.ts` (função `applyPerformanceFormatting`)

**Por que é crítico**: Define formato final da letra

**Ao modificar**:
- Mantenha tags em inglês
- Preserve versos em português
- Não quebre estrutura de instrumentos
- Teste com modo padrão e performático

---

## 🐛 DEBUGGING

### Logs Importantes

\`\`\`typescript
// Use prefixo [v0] para logs de debug
console.log("[v0] Valor da variável:", variable)

// Use prefixos específicos por módulo
console.log("[MetaComposer] Score final:", score)
console.log("[TerceiraVia] Análise completa:", analysis)
console.log("[Create-Song] Parâmetros:", params)
\`\`\`

### Pontos de Verificação

1. **Entrada da API**: Verifique parâmetros recebidos
2. **Antes do MetaComposer**: Confirme configuração
3. **Após Terceira Via**: Verifique análise
4. **Após SyllableEnforcer**: Confirme correções
5. **Antes da formatação**: Valide letra bruta
6. **Saída final**: Confirme formato correto

---

## 📊 TESTES RECOMENDADOS

### Teste Manual Básico

\`\`\`bash
# 1. Criar letra (modo padrão)
POST /api/generate-lyrics
{
  "genero": "Sertanejo Moderno",
  "tema": "amor perdido",
  "humor": "melancólico",
  "performanceMode": "standard"
}

# 2. Criar letra (modo performático)
POST /api/generate-lyrics
{
  "genero": "Sertanejo Moderno",
  "tema": "amor perdido",
  "humor": "melancólico",
  "performanceMode": "performance"
}

# 3. Reescrever letra
POST /api/rewrite-lyrics
{
  "lyrics": "...",
  "genero": "Sertanejo Moderno",
  "performanceMode": "performance"
}
\`\`\`

### Checklist de Validação

- [ ] Letra gerada sem erros
- [ ] Tags em inglês: `[VERSE 1 - ...]`
- [ ] Versos em português
- [ ] Instrumentos em inglês no final
- [ ] Sem duplicação de instrumentos
- [ ] Sem símbolos ** ou ##
- [ ] Máximo 12 sílabas por verso
- [ ] Score final > 70

---

## 🚨 PROBLEMAS COMUNS E SOLUÇÕES

### Problema 1: "Unexpected token 'A', 'An error o'... is not valid JSON"

**Causa**: API retornando texto em vez de JSON

**Solução**:
\`\`\`typescript
// Sempre retorne JSON estruturado
return NextResponse.json({
  error: "Mensagem de erro",
  details: error.message
}, { status: 500 })
\`\`\`

### Problema 2: Loop infinito na reescrita

**Causa**: Condição de parada não atingida

**Solução**:
\`\`\`typescript
// Adicione timeout de segurança
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error("Timeout")), 45000)
)
const result = await Promise.race([compositionPromise, timeoutPromise])
\`\`\`

### Problema 3: Instrumentos duplicados

**Causa**: Não verificar se já existem

**Solução**:
\`\`\`typescript
let hasInstruments = false
// ... verificar nas linhas
if (!hasInstruments) {
  // Adicionar instrumentos
}
\`\`\`

---

## 📚 RECURSOS ADICIONAIS

### Documentação Relacionada
- `FORMATO_LIMPO_PERFORMANCE.md`: Guia de formatação
- `SISTEMA_TRATAMENTO_ERROS.md`: Tratamento de erros
- `EMPILHAMENTO_BRASILEIRO.md`: Regras de empilhamento
- `REGRAS_FORMATO_FINAL.md`: Regras consolidadas

### Contatos
- **Desenvolvedor Principal**: [Seu nome]
- **Repositório**: [Link do GitHub]
- **Documentação**: [Link da documentação]

---

## ✅ CHECKLIST ANTES DE COMMIT

- [ ] Código testado localmente
- [ ] Comentários atualizados
- [ ] Documentação atualizada
- [ ] Sem console.log desnecessários
- [ ] Tratamento de erros implementado
- [ ] Backward compatibility preservada
- [ ] Testes manuais realizados

---

**Última atualização**: 2025-01-19
**Versão do sistema**: 2.0
**Status**: ✅ Produção
