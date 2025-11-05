# Networking Groups Management Platform

Plataforma para gerenciar grupos de networking empresarial, substituindo planilhas por um sistema centralizado e seguro.

## Arquitetura

- **Monorepo**: Turborepo
- **Backend**: Fastify + TypeScript + Prisma (Clean Architecture)
- **Frontend**: Next.js 14 + TypeScript + TanStack Query
- **Database**: PostgreSQL (dev e prod)
- **Testes**: Vitest (unit tests) com 14 testes passando ✅

## Estrutura do Projeto

```
networking-groups-platform/
├── apps/
│   ├── api/              # Backend API (Fastify) ✅ 100% Complete
│   │   ├── src/
│   │   │   ├── domain/       # Entidades e regras de negócio
│   │   │   ├── application/  # Use cases e portas
│   │   │   ├── infra/        # Repositórios e serviços externos
│   │   │   └── http/         # Controllers, rotas e schemas
│   │   └── prisma/           # Schema e migrações
│   └── web/              # Frontend (Next.js) ✅ 100% Complete
│       ├── app/              # Pages (App Router)
│       ├── components/       # UI Components (shadcn/ui)
│       ├── lib/              # Utilities & API client
│       └── hooks/            # Custom hooks
├── docs/                 # Documentação do desafio
├── docker-compose.yml    # PostgreSQL + Services
└── turbo.json
```

## Setup Local

### Pré-requisitos

- Node.js 20+
- pnpm 8+
- Docker (opcional, para PostgreSQL)

### Instalação

1. **Clone o repositório e instale as dependências**

```bash
pnpm install
```

2. **Configure as variáveis de ambiente**

```bash
# Backend
cp apps/api/.env.example apps/api/.env

# Frontend
cp apps/web/.env.example apps/web/.env.local
```

**Importante:** As variáveis já estão configuradas para desenvolvimento local. Não é necessário editar os arquivos `.env` para rodar localmente.

3. **Configure o banco de dados**

**PostgreSQL via Docker (Recomendado)**

```bash
docker compose up -d postgres
```

Execute setup do banco:
```bash
cd apps/api
pnpm prisma db push
pnpm prisma:seed
```

4. **Inicie os servidores**

```bash
# Backend (Terminal 1)
cd apps/api
pnpm dev

# Frontend (Terminal 2)
cd apps/web
pnpm dev
```

A aplicação estará disponível em:
- **Frontend**: http://localhost:3000 🌐
- **API**: http://localhost:3333
- **Docs (Swagger)**: http://localhost:3333/docs 📚
- **Health Check**: http://localhost:3333/healthz ❤️

## Credenciais de Admin (Desenvolvimento)

```
Email: admin@networkinggroups.com
Password: Admin@123
Admin Key: dev-admin-key-123
```

Use o header `x-admin-key: dev-admin-key-123` para acessar rotas admin.

## Endpoints Principais (MVP)

### Públicos

- `POST /api/intents` - Submeter intenção de participação
- `GET /api/invites/:token` - Validar token de convite
- `POST /api/invites/:token/register` - Registrar membro com convite

### Admin (Requer `x-admin-key` header)

- `GET /api/admin/intents` - Listar intenções
- `POST /api/admin/intents/:id/approve` - Aprovar intenção
- `POST /api/admin/intents/:id/reject` - Rejeitar intenção

## Testes

```bash
# Backend - Testes unitários
cd apps/api
pnpm test

# Com coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

## Comandos Úteis

```bash
# Monorepo
pnpm dev                  # Todos os apps em modo dev
pnpm build                # Build de produção
pnpm lint                 # Lint todos os apps
pnpm typecheck            # Verificar tipos TypeScript

# Backend (apps/api)
pnpm dev                  # Servidor de desenvolvimento
pnpm build                # Build de produção
pnpm start                # Executar build de produção
pnpm prisma:studio        # Prisma Studio (GUI)
pnpm prisma:generate      # Gerar Prisma Client
pnpm prisma:migrate       # Criar nova migração
pnpm prisma:seed          # Popular banco com dados de teste

# Frontend (apps/web) - A IMPLEMENTAR
pnpm dev                  # Servidor de desenvolvimento
pnpm build                # Build de produção
```

## Docker

### Desenvolvimento com Docker Compose

```bash
# Subir todos os serviços
docker compose up

# Apenas banco de dados
docker compose up postgres

# Rebuild e restart
docker compose up --build

# Parar serviços
docker compose down

# Remover volumes (cuidado: apaga dados)
docker compose down -v
```

### Build de Produção

```bash
# Backend
docker build -f apps/api/Dockerfile -t networking-api .

# Frontend (quando implementado)
docker build -f apps/web/Dockerfile -t networking-web .
```

## Fluxo do MVP (Módulo de Membros)

1. **Usuário submete intenção** → `POST /api/intents`
2. **Admin revisa intenções** → `GET /api/admin/intents?status=PENDING`
3. **Admin aprova** → `POST /api/admin/intents/:id/approve`
   - Sistema gera token único com validade de 7 dias
4. **Usuário recebe link com token** (por email - mock no MVP)
5. **Usuário valida token** → `GET /api/invites/:token`
6. **Usuário completa registro** → `POST /api/invites/:token/register`
   - Status do membro: ACTIVE
   - Token marcado como USED

## Tecnologias

### Backend
- Fastify 4.x - Framework web
- Prisma 5.x - ORM
- Zod - Validação de schemas
- Argon2 - Hash de senhas
- Pino - Logger estruturado
- Vitest - Testes

### Frontend
- Next.js 14 - Framework React
- TanStack Query - State management
- React Hook Form - Formulários
- Tailwind CSS - Estilos
- shadcn/ui - Componentes UI
- Zod - Validação de forms

## Estrutura Clean Architecture

```
src/
├── domain/           # Camada de Domínio
│   ├── entities/     # Entidades de negócio
│   └── value-objects # Objetos de valor
├── application/      # Camada de Aplicação
│   ├── use-cases/    # Casos de uso (regras de negócio)
│   ├── dto/          # Data Transfer Objects
│   ├── ports/        # Interfaces de repositórios
│   └── services/     # Serviços de domínio
├── infra/            # Camada de Infraestrutura
│   ├── db/prisma/    # Implementações Prisma
│   └── mail/         # Serviço de email
└── http/             # Camada HTTP
    ├── controllers/  # Controllers
    ├── routes/       # Definição de rotas
    ├── schemas/      # Schemas Zod
    └── middleware/   # Middlewares
```

## Status do Projeto

### ✅ Implementado (MVP Completo)

- ✅ **Backend API** (100%)
  - Clean Architecture implementada
  - 6 Use Cases funcionais
  - PostgreSQL configurado
  - Swagger/OpenAPI docs
  - Health checks
  - Seed com dados de teste

- ✅ **Frontend Web** (100%)
  - Home page com navegação
  - Formulário de intenção (`/intent`)
  - Registro com token (`/register`)
  - Dashboard admin (`/admin/intents`)
  - Integração completa com API

### 🚧 Próximas Melhorias

- [ ] Testes unitários e de integração
- [ ] Testes E2E com Playwright
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Deploy (Vercel + Railway/Render)
- [ ] JWT authentication
- [ ] Módulos opcionais (Introduções ou Dashboard de métricas)

## Documentação Adicional

- [Desafio Original](./docs/desafio-negocio.md)
- [Arquitetura](./docs/arquitetura.md)
- [Guidelines](./docs/guidelines-backend.md)

## Suporte

Para dúvidas ou problemas, consulte a documentação ou abra uma issue.

## Licença

MIT
