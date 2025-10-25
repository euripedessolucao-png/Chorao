docs/
├── INDICE_DOCUMENTACAO.md
├── README.md
├── STATUS_FINAL_SISTEMA.md
├── ARQUITETURA_ORGANIZADA.md
│
├── regras/
│   ├── LIMITE_12_SILABAS_FISIOLOGICO.md     ← ATUALIZADO!
│   ├── REGRAS_FORMATO_FINAL.md
│   ├── EMPILHAMENTO_BRASILEIRO.md
│   ├── FORMATO_PERFORMANCE_IA.md            ← RENOMEADO!
│   └── PERFORMANCE_INSTRUCTIONS_GUIDE.md
│
├── analises/
│   ├── ANALISE_COMPLETA_SISTEMA.md
│   ├── ANALISE_HITS_2024_2025.md
│   ├── RHYME_SYSTEM_DOCUMENTATION.md
│   ├── SERTANEJO_MODERNO_2024.md
│   └── VALIDACAO_SERTANEJO_MODERNO_2025.md
│
└── manutencao/
    ├── FUTURE_UPDATES_GUIDE.md
    └── RULES_CONSOLIDATION.md


    📚 Índice da Documentação – Sistema de Composição Musical Brasileira
SVG content

📖 Documentação Principal
1. README.md
Visão geral, funcionalidades, requisitos e guia de instalação.

2. STATUS_FINAL_SISTEMA.md
Status atual: o que está pronto, em teste e pendente. Inclui checklist de validação Vercel.

3. ARQUITETURA_ORGANIZADA.md
Fluxo de dados, estrutura de pastas, integração entre frontend, backend e IA.

🎯 Regras e Padrões
✅ Atualizado para refletir métrica real: até 12 sílabas 

4. LIMITE_12_SILABAS_FISIOLOGICO.md
(renomeado de LIMITE_11_SILABAS_ABSOLUTO.md)
Explica o limite fisiológico de 12 sílabas como padrão universal, com exceções por gênero. 

5. REGRAS_FORMATO_FINAL.md
Formato de saída: tags em inglês, versos em português, instruções de instrumentação.

6. EMPILHAMENTO_BRASILEIRO.md
Padrão de um verso por linha, com regras para divisão em versos com vírgula (ex: 7+5).

7. FORMATO_PERFORMANCE_IA.md
(renomeado de FORMATO_LIMPO_PERFORMANCE.md)
Como estruturar letras para IAs musicais (Suno, Udio, etc.). 

8. PERFORMANCE_INSTRUCTIONS_GUIDE.md
Instruções detalhadas de dinâmica, vocal e instrumentação por seção.

🎵 Análises e Referências
9. ANALISE_COMPLETA_SISTEMA.md
Comparação entre sistema legado e atualizado (precisão, desempenho, consistência).

10. ANALISE_HITS_2024_2025.md
Estudo de 50+ sucessos brasileiros: métrica, rima, tema, estrutura.

11. RHYME_SYSTEM_DOCUMENTATION.md
Sistema de rimas ricas vs. pobres vs. falsas, com regras por gênero.

12. SERTANEJO_MODERNO_2024.md
Características de Sertanejo Moderno Feminino/Masculino: linguagem, temas, métrica.

13. VALIDACAO_SERTANEJO_MODERNO_2025.md
Checklist de validação para sertanejo moderno (palavras proibidas, clichês, métrica).

🔧 Manutenção e Atualizações
14. FUTURE_UPDATES_GUIDE.md
Como adicionar novos gêneros, atualizar regras e integrar novas IAs.

15. RULES_CONSOLIDATION.md
Hierarquia de prioridades:

Requisitos do usuário
Regras universais
Regras de gênero (genre-config.ts)
Sugestões da IA
