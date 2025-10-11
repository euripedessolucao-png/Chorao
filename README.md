# Chorão - Compositor

Assistente de composição musical com IA que cria letras originais em qualquer gênero, humor ou estilo.

## Estrutura do Projeto

\`\`\`
├── app/                      # Páginas Next.js
│   ├── criar/               # Criar nova letra
│   ├── reescrever/          # Reescrever letras existentes
│   ├── editar/              # Editor com assistente
│   ├── galeria/             # Galeria de projetos
│   ├── aula/                # Módulos de aprendizado
│   ├── manual/              # Manual do usuário
│   └── api/                 # Rotas de API
│       ├── generate-lyrics/ # Geração de letras
│       ├── rewrite-lyrics/  # Reescrita de letras
│       ├── generate-chorus/ # Geração de refrões
│       └── analyze-exercise/# Análise de exercícios
├── components/              # Componentes React
│   ├── ui/                 # Componentes shadcn/ui
│   ├── navigation.tsx      # Navegação principal
│   ├── genre-select.tsx    # Seletor de gêneros
│   └── gallery-grid.tsx    # Grid de projetos
├── lib/                     # Utilitários e configurações
│   ├── genres/             # Regras por gênero (2024-2025)
│   │   ├── sertanejo_moderno_2024.ts
│   │   ├── forro_2024.ts
│   │   ├── funk_2024.ts
│   │   ├── pagode_2024.ts
│   │   ├── mpb_2024.ts
│   │   ├── samba_2024.ts
│   │   ├── gospel_2024.ts
│   │   ├── pop_brasileiro_2024.ts
│   │   ├── rock_brasileiro_2024.ts
│   │   └── bachata_brasileira_2024.ts
│   ├── metrics.ts          # Funções de métrica consolidadas
│   ├── genre-config.ts     # Configurações de gêneros
│   └── validation/         # Sistema de validação
│       ├── parser.ts
│       ├── validateLyrics.ts
│       └── validateChorus.ts
└── __tests__/              # Testes unitários
    └── validation/
\`\`\`

## Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS v4** - Estilização
- **shadcn/ui** - Componentes UI
- **AI SDK** - Integração com OpenAI
- **Sonner** - Notificações toast
- **Vercel** - Deploy e hospedagem

## Funcionalidades

### Criação de Letras
- Geração de letras completas com IA
- Suporte a múltiplos gêneros e sub-gêneros
- Validação automática de métrica e prosódia
- Geração de refrões com score comercial
- Diário de inspiração (texto, imagem, áudio, link)

### Reescrita de Letras
- Reescrita inteligente mantendo tema
- Otimização de rimas e métrica
- Intensificação emocional
- Versão comercial automática

### Editor com Assistente
- Ferramentas de edição em tempo real
- Busca de rimas e sinônimos
- Metáforas inteligentes
- Sensações e emoções
- Salvamento automático

### Galeria de Projetos
- Visualização de todos os projetos
- Edição rápida
- Download em formato texto
- Organização por gênero e data

### Aprendizado
- Módulos educacionais completos
- Exercícios interativos
- Análise de IA para feedback
- Desafios práticos

## Regras de Gêneros

Cada gênero possui regras específicas atualizadas para 2024-2025:

- **Prosódia**: Sílabas por linha, ritmo, cadência
- **Harmonia**: Progressões de acordes típicas
- **Elementos Visuais**: Referências concretas para clipes
- **Elementos Proibidos**: Clichês ultrapassados
- **Requisitos Comerciais**: Hooks, repetibilidade, fechamento emocional

As regras estão organizadas em arquivos separados em `/lib/genres/` para facilitar atualizações futuras sem sobrepor outras regras existentes.

## Desenvolvimento

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

## Variáveis de Ambiente

\`\`\`env
OPENAI_API_KEY=sua_chave_aqui
\`\`\`

## Deploy

O projeto está configurado para deploy automático na Vercel via GitHub.

## Licença

Todos os direitos reservados.
