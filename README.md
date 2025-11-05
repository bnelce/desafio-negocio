# Networking Groups Management Platform

Plataforma para gerenciar grupos de networking empresarial, substituindo planilhas por um sistema centralizado e seguro.

## Arquitetura

- **Monorepo**: Turborepo
- **Backend**: Fastify + TypeScript + Prisma (Clean Architecture)
- **Frontend**: Next.js 14 + TypeScript + TanStack Query
- **Database**: SQLite (dev) / PostgreSQL (prod)

## Estrutura do Projeto

```
networking-groups-platform/
├── apps/
│   ├── api/              # Backend API (Fastify)
│   │   ├── src/
│   │   │   ├── domain/       # Entidades e regras de negócio
│   │   │   ├── application/  # Use cases e portas
│   │   │   ├── infra/        # Repositórios e serviços externos
│   │   │   └── http/         # Controllers, rotas e schemas
│   │   └── prisma/           # Schema e migrações
│   └── web/              # Frontend (Next.js) - A IMPLEMENTAR
├── docs/                 # Documentação do desafio
├── docker-compose.yml
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
cp .env.example apps/api/.env
```

Edite `apps/api/.env` conforme necessário.

3. **Configure o banco de dados**

**Opção A: SQLite (Desenvolvimento local)**

```bash
cd apps/api
pnpm prisma db push
pnpm prisma:seed
```

**Opção B: PostgreSQL via Docker**

```bash
docker compose up -d postgres
```

Altere `apps/api/.env`:
```env
DB_PROVIDER=postgresql
DATABASE_URL="postgresql://networking:networking123@localhost:5432/networking_groups"
```

Execute as migrações:
```bash
cd apps/api
pnpm prisma:migrate:deploy
pnpm prisma:seed
```

4. **Inicie o servidor de desenvolvimento**

```bash
# Backend
cd apps/api
pnpm dev

# Ou use o Turbo na raiz
pnpm dev
```

O servidor estará disponível em:
- API: http://localhost:3333
- Documentação (Swagger): http://localhost:3333/docs
- Health Check: http://localhost:3333/healthz

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

### Frontend (Próxima Fase)
- Next.js 14 - Framework React
- TanStack Query - State management
- React Hook Form - Formulários
- Tailwind CSS - Estilos
- shadcn/ui - Componentes UI

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

## Próximos Passos

- [ ] Implementar frontend (apps/web)
- [ ] Páginas públicas: `/intent` e `/register`
- [ ] Área admin: `/admin/intents`
- [ ] Testes E2E com Playwright
- [ ] CI/CD pipeline
- [ ] Deploy (Vercel + Railway/Render)
- [ ] Módulos opcionais (Introduções ou Dashboard)

## Documentação Adicional

- [Desafio Original](./docs/desafio-negocio.md)
- [Arquitetura](./docs/arquitetura.md)
- [Guidelines](./docs/guidelines-backend.md)

## Suporte

Para dúvidas ou problemas, consulte a documentação ou abra uma issue.

## Licença

MIT
