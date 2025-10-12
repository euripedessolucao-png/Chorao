# GUIA DE ATUALIZAÇÕES FUTURAS
**Como manter o sistema atual e organizado**

## 📅 ATUALIZAÇÕES ANUAIS (2026, 2027...)

### 1. **Atualizar Gêneros Musicais**
**Arquivo:** `lib/genre-config.ts`
**Frequência:** Anual (início do ano)

**Passos:**
1. Pesquisar artistas em destaque do ano anterior
2. Identificar novos hits e tendências
3. Atualizar `reference_artists` com nomes atuais
4. Atualizar `year_range` para o ano corrente
5. Revisar `core_principles` se houver mudanças no gênero
6. Atualizar `forbidden` se surgirem novos clichês

**Exemplo:**
\`\`\`typescript
"Sertanejo Moderno Masculino": {
  year_range: "2026-2027", // <-- ATUALIZAR ANO
  reference_artists: ["Artista Novo 2026", "Hit do Ano", ...], // <-- NOVOS ARTISTAS
  // ... resto da config
}
\`\`\`

### 2. **Revisar Regras Anti-Forçação**
**Arquivo:** `lib/validation/anti-forcing-validator.ts`
**Frequência:** Semestral

**Passos:**
1. Analisar letras geradas que tiveram problemas
2. Identificar novas palavras-chave sendo forçadas
3. Adicionar novas regras ao array `ANTI_FORCING_RULES`

**Exemplo:**
\`\`\`typescript
{
  keyword: "nova_palavra_2026",
  allowedContexts: ["contexto1", "contexto2"],
  genre: "genero",
  description: "Descrição da regra"
}
\`\`\`

### 3. **Atualizar Manual do Usuário**
**Arquivo:** `app/manual/page.tsx`
**Frequência:** Quando houver novas funcionalidades

**Passos:**
1. Adicionar nova seção em `manualSections` se necessário
2. Atualizar FAQ com novas perguntas comuns
3. Revisar exemplos para refletir tendências atuais

## 🔧 MANUTENÇÃO CONTÍNUA

### 1. **Monitorar Qualidade das Gerações**
- Coletar feedback dos usuários
- Identificar padrões de erros
- Ajustar prompts nas APIs se necessário

### 2. **Otimizar Prompts**
**Arquivos:** `app/api/*/route.ts`
- Se letras estiverem muito curtas: aumentar requisitos de estrutura
- Se letras estiverem muito longas: reduzir requisitos
- Se linguagem estiver rebuscada: reforçar regra de simplicidade

### 3. **Adicionar Novos Gêneros**
**Arquivo:** `lib/genre-config.ts`

**Template para novo gênero:**
\`\`\`typescript
"Novo Gênero": {
  year_range: "2026-2027",
  reference_artists: ["Artista 1", "Artista 2", "Artista 3"],
  core_principles: {
    theme: "Temas principais do gênero",
    tone: "Tom emocional característico",
    narrative_arc: "Estrutura narrativa típica"
  },
  language_rules: {
    allowed: {
      concrete_objects: ["objeto1", "objeto2"],
      actions: ["ação1", "ação2"],
      phrases: ["frase1", "frase2"]
    },
    forbidden: {
      excessive_drama: ["clichê1", "clichê2"],
      generic_cliches: ["genérico1", "genérico2"]
    },
    style: "Descrição do estilo de linguagem"
  },
  structure_rules: {
    verse_structure: "Estrutura dos versos",
    chorus_rules: "Regras do refrão",
    syllable_rules: "Regras de sílabas"
  },
  harmony_and_rhythm: {
    bpm_range: { min: 80, ideal: 100, max: 120 },
    time_signature: "4/4",
    key_preferences: ["C", "G", "D"]
  }
}
\`\`\`

## 📝 CHECKLIST DE ATUALIZAÇÃO ANUAL

- [ ] Pesquisar hits e artistas do ano anterior
- [ ] Atualizar `year_range` em todos os gêneros
- [ ] Atualizar `reference_artists` com nomes atuais
- [ ] Revisar `core_principles` para mudanças de tendência
- [ ] Testar gerações com novos artistas de referência
- [ ] Atualizar manual com exemplos atuais
- [ ] Revisar FAQ para novas dúvidas comuns
- [ ] Adicionar novas regras anti-forçação se necessário
- [ ] Testar todas as funcionalidades
- [ ] Coletar feedback inicial dos usuários

## 🎯 PRINCÍPIOS DE MANUTENÇÃO

1. **Sempre pesquisar antes de atualizar** - Use web search para dados reais
2. **Manter consistência** - Seguir o padrão existente
3. **Documentar mudanças** - Atualizar este guia quando necessário
4. **Testar antes de publicar** - Verificar que tudo funciona
5. **Preservar regras universais** - Não mudar o core do sistema

## 🚀 SISTEMA PREPARADO PARA O FUTURO
Este guia garante que o sistema permaneça atual e organizado por anos.
