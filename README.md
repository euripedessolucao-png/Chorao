# Chorão - Compositor

Assistente de composição musical com IA que cria letras originais em qualquer gênero, humor ou estilo.

## 📚 Documentação

Para documentação completa, consulte o [Índice de Documentação](INDICE_DOCUMENTACAO.md).

**Documentos principais:**
- [Status do Sistema](STATUS_FINAL_SISTEMA.md) - Estado atual e organização
- [Arquitetura](ARQUITETURA_ORGANIZADA.md) - Estrutura técnica detalhada
- [Regras de Formato](REGRAS_FORMATO_FINAL.md) - Formato de saída das letras
- [Limite de Sílabas](LIMITE_11_SILABAS_ABSOLUTO.md) - Regra absoluta de 11 sílabas
- [Guia de Atualizações](FUTURE_UPDATES_GUIDE.md) - Como atualizar o sistema

## 🎯 Funcionalidades

### Criação de Letras
Geração completa com IA, validação automática de métrica e prosódia, suporte a múltiplos gêneros.

### Reescrita de Letras
Reescrita inteligente mantendo tema, otimização de rimas e intensificação emocional.

### Editor com Assistente
Ferramentas de edição em tempo real, busca de rimas, metáforas e salvamento automático.

### Galeria de Projetos
Visualização, edição e download de todos os projetos organizados por gênero.

### Aprendizado
Módulos educacionais, exercícios interativos e análise de IA para feedback.

## 🏗️ Estrutura do Projeto

\`\`\`
├── app/                      # Páginas Next.js
│   ├── criar/               # Criar nova letra
│   ├── reescrever/          # Reescrever letras
│   ├── editar/              # Editor com assistente
│   ├── galeria/             # Galeria de projetos
│   ├── aula/                # Módulos de aprendizado
│   └── api/                 # Rotas de API
├── components/              # Componentes React
│   └── ui/                 # Componentes shadcn/ui
├── lib/                     # Lógica e configurações
│   ├── constants/          # Constantes centralizadas
│   ├── genres/             # Regras por gênero (2024-2025)
│   ├── validation/         # Sistema de validação
│   ├── terceira-via/       # Sistema Terceira Via
│   └── orchestrator/       # MetaComposer (orquestrador)
└── docs/                    # Documentação completa
\`\`\`

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS v4** - Estilização
- **shadcn/ui** - Componentes UI
- **AI SDK** - Integração com OpenAI
- **Vercel** - Deploy e hospedagem

## 🎵 Gêneros Suportados (2024-2025)

Cada gênero possui regras específicas atualizadas:

- Sertanejo Moderno
- Forró
- Funk
- Pagode
- MPB
- Samba
- Gospel
- Pop Brasileiro
- Rock Brasileiro
- Bachata Brasileira

## 💻 Desenvolvimento

\`\`\`bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar testes
npm test
\`\`\`

## 🔐 Variáveis de Ambiente

\`\`\`env
OPENAI_API_KEY=sua_chave_aqui
\`\`\`

## 📦 Deploy

Configurado para deploy automático na Vercel via GitHub.

## 📄 Licença

Todos os direitos reservados.
