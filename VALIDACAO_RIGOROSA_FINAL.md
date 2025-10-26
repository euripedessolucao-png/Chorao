# VALIDAÇÃO RIGOROSA FINAL - ZERO TOLERÂNCIA A ERROS

## Objetivo
Garantir que NENHUMA letra com problemas chegue ao usuário. O MetaComposer agora é EXTREMAMENTE rigoroso e rejeita qualquer letra que não seja perfeita.

## Erros Críticos Detectados (ZERO TOLERÂNCIA)

### 1. Versos com Mais de 11 Sílabas
- **Limite absoluto**: 11 sílabas poéticas
- **Ação**: REJEITA e REGENERA imediatamente
- **Correção emergencial**: Remove palavras do meio, preserva rimas

### 2. Versos Incompletos ou Quebrados
**Detecta:**
- Versos muito curtos (< 3 palavras)
- Estrutura gramatical inválida: "Vou medo, sem falha!"
- Frases sem sentido: "Você decote um charme"
- Falta de verbo principal
- Aspas não fechadas
- Vírgulas soltas no final
- Termina com preposição/artigo

**Ação**: Trata como ERRO CRÍTICO, não apenas aviso

### 3. Narrativa Sem Continuidade
**Detecta:**
- Mudanças abruptas de assunto (> 1 = erro crítico)
- Falta de começo, meio ou fim
- Score de narrativa < 75
- Versos que não contribuem para a história

**Ação**: REJEITA se narrativa insuficiente

### 4. Integridade de Versos < 80%
- Se mais de 20% dos versos têm problemas = ERRO CRÍTICO
- **Ação**: REGENERA completamente

## Validações Aplicadas (6 Camadas)

### Camada 1: Detecção Pré-Geração
- Valida prompt e requisitos
- Configura limites de sílabas (7-11)

### Camada 2: Validação Pós-IA
- Detecta violações críticas imediatamente
- Se encontrar, REGENERA (até 3 tentativas)

### Camada 3: Análise Terceira Via
- Score mínimo: 75/100
- Penaliza clichês e falta de originalidade
- Aplica correções inteligentes

### Camada 4: Correção de Sílabas
- SyllableEnforcer garante 7-11 sílabas
- Correção emergencial se necessário

### Camada 5: Validação de Integridade
- validateVerseIntegrity: detecta versos quebrados
- validateNarrativeFlow: garante continuidade
- validateVerseContribution: cada verso contribui

### Camada 6: Validação Final Rigorosa
- **ZERO erros críticos permitidos**
- Integridade mínima: 80%
- Narrativa mínima: 75
- Se falhar: REGENERA ou aplica correções emergenciais

## Critérios de Aprovação

Uma letra SÓ é aprovada se:
- ✅ ZERO versos com > 11 sílabas
- ✅ ZERO versos quebrados ou incompletos
- ✅ Integridade ≥ 80%
- ✅ Narrativa ≥ 75 (começo-meio-fim)
- ✅ Continuidade (≤ 1 mudança abrupta)
- ✅ Estrutura completa (verso + refrão)
- ✅ Rimas adequadas ao gênero

## Correções Emergenciais

Se última iteração e ainda há problemas:

1. **Versos longos**: Remove palavras do meio, preserva rimas
2. **Versos curtos**: Remove completamente
3. **Aspas abertas**: Fecha automaticamente
4. **Versos sem sentido**: Remove

## Resultado Esperado

**IMPOSSÍVEL** que uma letra com problemas chegue ao usuário:
- Narrativa sempre fluída e coerente
- Versos sempre completos e com sentido
- Sílabas sempre dentro do limite (7-11)
- História sempre com começo, meio e fim
- Cada verso contribui para a narrativa

## Para Desenvolvedores

Ao adicionar novas validações:
1. Adicione em `validateFinalLyrics()`
2. Trate como ERRO CRÍTICO se impacta qualidade
3. Adicione correção emergencial se possível
4. Teste com letras problemáticas
5. Documente aqui

**Lembre-se**: É melhor REGENERAR do que entregar letra com problemas!
