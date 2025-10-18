# Sistema de Tratamento de Erros - Chorão Compositor

## Visão Geral

Este documento descreve o sistema robusto de tratamento de erros implementado em todas as APIs e componentes do Chorão Compositor para garantir que **sempre retornamos JSON válido**, mesmo em caso de erro.

## Problema Resolvido

**Erro Original:**
\`\`\`
Unexpected token 'A', "An error o"... is not valid JSON
\`\`\`

**Causa:** A API estava retornando mensagens de erro em texto simples em vez de JSON válido, causando falha no parse do frontend.

## Solução Implementada

### 1. API de Reescrita (`/api/rewrite-lyrics/route.ts`)

#### Validação de Entrada
\`\`\`typescript
// ✅ Parse seguro do JSON com tratamento de erro
async function safeJsonParse(request: Request) {
  try {
    const text = await request.text()
    if (!text || text.trim() === "") {
      throw new Error("Body vazio")
    }
    return JSON.parse(text)
  } catch (error) {
    throw new Error("JSON inválido no corpo da requisição")
  }
}
\`\`\`

#### Tratamento de Erros em Camadas
\`\`\`typescript
export async function POST(request: Request) {
  // CAMADA 1: Parse do JSON
  try {
    body = await safeJsonParse(request)
  } catch (error) {
    return NextResponse.json(
      {
        error: "JSON inválido",
        details: "O corpo da requisição não contém JSON válido",
        suggestion: "Verifique se está enviando application/json"
      },
      {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      }
    )
  }

  // CAMADA 2: Validação de dados
  if (!letraOriginal || !finalGenero) {
    return NextResponse.json(
      { error: "Dados obrigatórios faltando", ... },
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }

  // CAMADA 3: Processamento
  try {
    // ... processamento da reescrita
  } catch (rewriteError) {
    return NextResponse.json(
      {
        error: "Erro ao processar reescrita",
        details: errorMessage,
        suggestion: "Tente simplificar os requisitos"
      },
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }

  // CAMADA 4: Erro inesperado
  catch (error) {
    return NextResponse.json(
      {
        error: "Erro interno",
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
\`\`\`

### 2. API de Geração (`/api/generate-lyrics/route.ts`)

#### Estrutura Similar com Try-Catch Aninhados
\`\`\`typescript
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validações
    if (!genero) {
      return NextResponse.json(
        { error: "Gênero é obrigatório", ... },
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Try-catch interno para composição
    try {
      if (extractedChoruses.length > 0) {
        finalLyrics = await generateWithPreservedChoruses(...)
      } else if (universalPolish) {
        const result = await MetaComposer.compose(...)
        finalLyrics = result.lyrics
      } else {
        finalLyrics = await generateNormally(...)
      }
    } catch (compositionError) {
      return NextResponse.json(
        {
          error: "Erro ao compor letra",
          details: errorMessage,
          suggestion: "Tente ajustar os parâmetros"
        },
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    // Sucesso
    return NextResponse.json(
      { letra: finalLyrics, ... },
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao processar requisição", ... },
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
\`\`\`

### 3. MetaComposer (`/lib/orchestrator/meta-composer.ts`)

#### Validação Robusta de Entrada
\`\`\`typescript
static async compose(request: CompositionRequest): Promise<CompositionResult> {
  // ✅ Validação detalhada
  if (!request.genre || !request.theme || !request.mood) {
    const missingParams = []
    if (!request.genre) missingParams.push("genre")
    if (!request.theme) missingParams.push("theme")
    if (!request.mood) missingParams.push("mood")
    
    throw new Error(
      `Parâmetros obrigatórios faltando: ${missingParams.join(", ")}. ` +
      `Recebido: genre="${request.genre}", theme="${request.theme}", mood="${request.mood}"`
    )
  }

  // ✅ Try-catch principal
  try {
    while (iterations < this.MAX_ITERATIONS) {
      // ✅ Try-catch para geração com fallback
      try {
        rawLyrics = await this.generateIntelligentLyrics(...)
      } catch (generationError) {
        if (iterations === 1) {
          // Fallback para modo simplificado
          rawLyrics = await this.generateIntelligentLyrics(..., false)
        } else {
          throw generationError
        }
      }

      // ✅ Try-catch para Terceira Via
      try {
        terceiraViaLyrics = await this.applyTerceiraViaToLyrics(...)
      } catch (terceiraViaError) {
        terceiraViaLyrics = rawLyrics // Usa original
      }

      // ✅ Try-catch para polimento
      try {
        finalLyrics = await this.applyGenreSpecificPolish(...)
      } catch (polishError) {
        finalLyrics = enforcedResult.correctedLyrics // Usa sem polimento
      }
    }
  } catch (compositionError) {
    // ✅ Retorna melhor resultado parcial se disponível
    if (bestResult) {
      return bestResult
    }
    throw new Error(`Falha crítica na composição: ${errorMessage}`)
  }

  // ✅ Validação final
  if (!bestResult) {
    throw new Error(`Falha ao gerar composição após ${iterations} iterações`)
  }

  return bestResult
}
\`\`\`

## Princípios do Sistema

### 1. **Sempre Retornar JSON**
- Todas as respostas de erro são objetos JSON válidos
- Headers `Content-Type: application/json` sempre definidos
- Estrutura consistente: `{ error, details, suggestion }`

### 2. **Camadas de Proteção**
- Parse de JSON com validação
- Validação de dados obrigatórios
- Try-catch em operações críticas
- Fallbacks automáticos
- Erro genérico final

### 3. **Fallbacks Inteligentes**
- Se modo avançado falhar → tenta modo simples
- Se Terceira Via falhar → usa letra original
- Se polimento falhar → usa letra sem polimento
- Se tudo falhar → retorna melhor resultado parcial

### 4. **Logs Detalhados**
\`\`\`typescript
console.log("[API] === INICIANDO REQUISIÇÃO ===")
console.log("[API] ✅ JSON parseado com sucesso")
console.log("[API] ❌ ERRO CRÍTICO: Falha no parse")
console.log("[MetaComposer] 🔄 Tentando modo simplificado...")
console.log("[MetaComposer] ⚠️ Erro na Terceira Via, usando original")
\`\`\`

### 5. **Mensagens de Erro Úteis**
\`\`\`typescript
{
  error: "Erro ao processar reescrita",
  details: "MetaComposer failed: Invalid syllable count",
  suggestion: "Tente simplificar os requisitos ou usar modo normal",
  step: "processamento_reescrita",
  timestamp: "2025-01-18T10:30:00.000Z"
}
\`\`\`

## Estrutura de Resposta Padrão

### Sucesso
\`\`\`json
{
  "success": true,
  "letra": "...",
  "titulo": "...",
  "metadata": {
    "genre": "Sertanejo",
    "mode": "universal",
    "polishingApplied": true,
    "timestamp": "2025-01-18T10:30:00.000Z"
  }
}
\`\`\`

### Erro de Validação (400)
\`\`\`json
{
  "error": "Gênero é obrigatório",
  "details": "Por favor, selecione um gênero musical",
  "received": {
    "genero": null,
    "tema": "amor"
  }
}
\`\`\`

### Erro de Processamento (500)
\`\`\`json
{
  "error": "Erro ao compor letra",
  "details": "MetaComposer failed after 3 iterations",
  "suggestion": "Tente ajustar os parâmetros ou simplificar os requisitos",
  "metadata": {
    "genre": "Sertanejo",
    "mode": "universal",
    "iterations": 3
  }
}
\`\`\`

### Erro Interno (500)
\`\`\`json
{
  "error": "Erro interno ao reescrever letra",
  "details": "Unexpected error in syllable enforcement",
  "suggestion": "Tente novamente ou entre em contato com o suporte",
  "step": "erro_inesperado",
  "timestamp": "2025-01-18T10:30:00.000Z"
}
\`\`\`

## Checklist de Implementação

- [x] API de reescrita com tratamento robusto
- [x] API de geração com tratamento robusto
- [x] MetaComposer com fallbacks
- [x] Validação de entrada em todas as APIs
- [x] Headers JSON em todas as respostas
- [x] Logs detalhados para debugging
- [x] Mensagens de erro úteis
- [x] Documentação completa

## Testando o Sistema

### Teste 1: JSON Inválido
\`\`\`bash
curl -X POST http://localhost:3000/api/rewrite-lyrics \
  -H "Content-Type: application/json" \
  -d "invalid json"
\`\`\`

**Resposta Esperada:**
\`\`\`json
{
  "error": "JSON inválido",
  "details": "O corpo da requisição não contém JSON válido"
}
\`\`\`

### Teste 2: Dados Faltando
\`\`\`bash
curl -X POST http://localhost:3000/api/rewrite-lyrics \
  -H "Content-Type: application/json" \
  -d '{"letraOriginal": "teste"}'
\`\`\`

**Resposta Esperada:**
\`\`\`json
{
  "error": "Gênero é obrigatório",
  "receivedGenero": null
}
\`\`\`

### Teste 3: Erro de Processamento
\`\`\`bash
curl -X POST http://localhost:3000/api/rewrite-lyrics \
  -H "Content-Type: application/json" \
  -d '{"letraOriginal": "x", "genero": "Sertanejo", "tema": "amor"}'
\`\`\`

**Resposta Esperada:**
\`\`\`json
{
  "success": true,
  "letra": "...",
  "metadata": { ... }
}
\`\`\`

## Manutenção

### Ao Adicionar Nova API
1. Implementar `safeJsonParse` ou validação similar
2. Adicionar try-catch em camadas
3. Garantir headers JSON em todas as respostas
4. Adicionar logs detalhados
5. Testar com dados inválidos

### Ao Modificar Lógica Existente
1. Manter estrutura de try-catch
2. Preservar fallbacks
3. Atualizar mensagens de erro
4. Testar cenários de erro

## Conclusão

O sistema de tratamento de erros garante que:
- ✅ Nunca retornamos texto simples em vez de JSON
- ✅ Todas as respostas têm estrutura consistente
- ✅ Erros são informativos e acionáveis
- ✅ Fallbacks automáticos mantêm o sistema funcionando
- ✅ Logs detalhados facilitam debugging
- ✅ Melhor experiência para o usuário
