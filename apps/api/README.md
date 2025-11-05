# Backend API - Networking Groups Platform

API REST construída com Fastify, TypeScript, Prisma seguindo princípios de Clean Architecture.

## Arquitetura

### Clean Architecture - Camadas

```
┌─────────────────────────────────┐
│   HTTP Layer (Fastify)          │  ← Controllers, Routes, Schemas (Zod)
├─────────────────────────────────┤
│   Application Layer              │  ← Use Cases, DTOs, Ports
├─────────────────────────────────┤
│   Domain Layer                   │  ← Entities, Value Objects, Business Rules
├─────────────────────────────────┤
│   Infrastructure Layer           │  ← Repositories (Prisma), External Services
└─────────────────────────────────┘
```

### Responsabilidades das Camadas

**Domain** (`src/domain/`)
- Entidades de negócio com regras de validação
- Value Objects imutáveis
- Sem dependências externas

**Application** (`src/application/`)
- Use Cases: orquestração de lógica de negócio
- Ports: interfaces de repositórios e serviços
- DTOs: objetos de transferência de dados
- Services: utilitários de domínio (hash, token)

**Infrastructure** (`src/infra/`)
- Repositórios Prisma implementando ports
- Serviços externos (email, filas)
- Cliente Prisma

**HTTP** (`src/http/`)
- Controllers: delegação para use cases
- Routes: definição de endpoints
- Schemas: validação Zod
- Middleware: autenticação, logs

## Estrutura de Pastas

```
src/
├── @types/               # Declarações TypeScript
├── config/
│   ├── env.ts           # Validação de variáveis de ambiente (Zod)
│   └── logger.ts        # Configuração do Pino
├── domain/
│   ├── entities/
│   │   ├── intent.ts    # Entidade Intent
│   │   ├── invite.ts    # Entidade Invite
│   │   └── member.ts    # Entidade Member
│   └── value-objects/   # (Futuros VOs)
├── application/
│   ├── use-cases/
│   │   ├── create-intent.ts
│   │   ├── list-intents.ts
│   │   ├── approve-intent.ts
│   │   ├── reject-intent.ts
│   │   ├── validate-invite.ts
│   │   └── register-with-invite.ts
│   ├── dto/
│   │   ├── intent-dto.ts
│   │   ├── invite-dto.ts
│   │   └── member-dto.ts
│   ├── ports/
│   │   ├── intent-repository.ts
│   │   ├── invite-repository.ts
│   │   └── member-repository.ts
│   └── services/
│       ├── token-service.ts
│       └── hash-service.ts
├── infra/
│   ├── db/prisma/
│   │   ├── client.ts
│   │   └── repositories/
│   │       ├── prisma-intent-repository.ts
│   │       ├── prisma-invite-repository.ts
│   │       └── prisma-member-repository.ts
│   └── mail/
│       └── console-mailer.ts   # Mock (MVP)
├── http/
│   ├── server.ts              # Aplicação Fastify
│   ├── controllers/
│   │   ├── intent-controller.ts
│   │   └── invite-controller.ts
│   ├── routes/
│   │   ├── public/
│   │   │   ├── intent-routes.ts
│   │   │   └── invite-routes.ts
│   │   └── admin/
│   │       └── intent-routes.ts
│   ├── schemas/
│   │   ├── intent-schemas.ts
│   │   └── invite-schemas.ts
│   └── middleware/
│       └── admin-auth.ts      # Autenticação admin (x-admin-key)
├── plugins/
│   └── prisma.ts              # Plugin Fastify para Prisma
└── tests/
    ├── unit/                   # Testes unitários (use cases)
    └── integration/            # Testes de integração (rotas)
```

## Use Cases Implementados

### 1. CreateIntentUseCase
- **Input**: `{ fullName, email, phone?, notes? }`
- **Output**: `{ intent: IntentDTO }`
- **Regras**:
  - Email único (se já existe intent PENDING, falha)
  - Cria intent com status PENDING

### 2. ListIntentsUseCase
- **Input**: `{ status?, page?, pageSize? }`
- **Output**: `{ items, total, page, pageSize, totalPages }`
- **Regras**: Paginação, filtro por status

### 3. ApproveIntentUseCase
- **Input**: `{ intentId, reviewedBy }`
- **Output**: `{ intent, invite }`
- **Regras**:
  - Intent deve estar PENDING
  - Gera token único (64 chars hex)
  - Define expiração (7 dias default)
  - Cria invite com status PENDING
  - Atualiza intent para APPROVED

### 4. RejectIntentUseCase
- **Input**: `{ intentId, reviewedBy }`
- **Output**: `{ intent }`
- **Regras**:
  - Intent deve estar PENDING
  - Atualiza intent para REJECTED

### 5. ValidateInviteUseCase
- **Input**: `{ token }`
- **Output**: `{ valid, reason?, intentId?, expiresAt? }`
- **Regras**:
  - Verifica se token existe
  - Verifica se não foi usado
  - Verifica se não expirou
  - Se expirado, atualiza status para EXPIRED

### 6. RegisterWithInviteUseCase
- **Input**: `{ token, name, email, phone?, password }`
- **Output**: `{ member }`
- **Regras**:
  - Valida invite (não usado, não expirado)
  - Verifica email único
  - Hash de senha (Argon2)
  - Cria membro com status ACTIVE
  - Marca invite como USED
  - **Transação Prisma** garante atomicidade

## Endpoints

### Públicos

#### `POST /api/intents`
Submeter intenção de participação.

**Body**:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "notes": "Interested in networking"
}
```

**Response 201**:
```json
{
  "intent": {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "john@example.com",
    "status": "PENDING",
    "createdAt": "2025-01-04T..."
  }
}
```

#### `GET /api/invites/:token`
Validar token de convite.

**Response 200** (válido):
```json
{
  "valid": true,
  "intentId": "uuid",
  "expiresAt": "2025-01-11T..."
}
```

**Response 410** (inválido):
```json
{
  "valid": false,
  "reason": "expired" // ou "used" | "invalid"
}
```

#### `POST /api/invites/:token/register`
Registrar membro com convite.

**Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123"
}
```

**Response 201**:
```json
{
  "member": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "MEMBER",
    "status": "ACTIVE",
    "createdAt": "2025-01-04T..."
  }
}
```

### Admin (Header: `x-admin-key`)

#### `GET /api/admin/intents?status=PENDING&page=1&pageSize=20`
Listar intenções.

**Response 200**:
```json
{
  "items": [
    {
      "id": "uuid",
      "fullName": "John Doe",
      "email": "john@example.com",
      "status": "PENDING",
      "createdAt": "2025-01-04T...",
      "reviewedAt": null,
      "reviewedBy": null
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1
}
```

#### `POST /api/admin/intents/:id/approve`
Aprovar intenção.

**Response 201**:
```json
{
  "intent": {
    "id": "uuid",
    "status": "APPROVED",
    "reviewedAt": "2025-01-04T...",
    "reviewedBy": "admin"
  },
  "invite": {
    "id": "uuid",
    "token": "64-char-hex-token",
    "expiresAt": "2025-01-11T..."
  }
}
```

#### `POST /api/admin/intents/:id/reject`
Rejeitar intenção.

**Response 200**:
```json
{
  "intent": {
    "id": "uuid",
    "status": "REJECTED",
    "reviewedAt": "2025-01-04T...",
    "reviewedBy": "admin"
  }
}
```

## Desenvolvimento

### Adicionar Novo Use Case

1. **Criar entidade (se necessário)** em `src/domain/entities/`
2. **Criar port** em `src/application/ports/`
3. **Implementar use case** em `src/application/use-cases/`
4. **Criar DTO** em `src/application/dto/`
5. **Implementar repositório** em `src/infra/db/prisma/repositories/`
6. **Criar controller** em `src/http/controllers/`
7. **Criar schemas Zod** em `src/http/schemas/`
8. **Registrar rotas** em `src/http/routes/`
9. **Escrever testes** em `tests/`

### Padrões de Código

- **Sem `any`**: use `unknown` e refine com Zod
- **Strict TypeScript**: todas flags habilitadas
- **Nomenclatura**:
  - Use cases: `XyzUseCase`
  - DTOs: `XyzDTO`
  - Repositories: `XyzRepository` (interface), `PrismaXyzRepository` (implementação)
  - Schemas: `xyzSchema`
- **Errors**: usar `throw new Error('message')` ou classes customizadas
- **Controllers**: apenas delegação, sem lógica de negócio

### Testes

```bash
# Unitários (use cases com mocks)
pnpm test

# Integração (rotas com DB in-memory)
pnpm test:integration

# Coverage
pnpm test:coverage

# Watch
pnpm test:watch
```

## Configuração

### Variáveis de Ambiente

```env
NODE_ENV=development|test|production
PORT=3333
DATABASE_URL=file:./dev.db
DB_PROVIDER=sqlite|postgresql
JWT_SECRET=min-32-chars-secret
ADMIN_KEY=your-admin-key
INVITE_TTL_DAYS=7
```

Validação automática via Zod em `src/config/env.ts`.

## Segurança

- **Hash de senhas**: Argon2
- **Admin auth**: Header `x-admin-key` (MVP)
- **CORS**: Configurado para dev (* ) e prod (restrito)
- **Rate limiting**: A implementar
- **Validação de entrada**: Zod em todas rotas
- **SQL Injection**: Protegido pelo Prisma (parametrized queries)

## Observability

- **Logs estruturados**: Pino (JSON)
- **Health checks**:
  - `GET /healthz` - Liveness
  - `GET /readyz` - Readiness (testa DB)
- **Request ID**: `x-request-id` header
- **Metrics**: A implementar (Prometheus)

## Troubleshooting

### Prisma Client não encontrado
```bash
pnpm prisma:generate
```

### Migrations falhando
```bash
# Reset DB (CUIDADO: apaga dados)
pnpm prisma migrate reset

# Ou force push
pnpm prisma db push --accept-data-loss
```

### Port 3333 em uso
```bash
# Windows
netstat -ano | findstr :3333
taskkill /PID <pid> /F

# Linux/Mac
lsof -ti:3333 | xargs kill
```

## Performance

- **Indexes**: Criados em colunas filtradas (status, email, createdAt)
- **Paginação**: Cursor-based recomendado para listas grandes
- **Connection pool**: Configurado no Prisma
- **Caching**: A implementar (Redis)

## Próximos Passos

- [ ] Implementar autenticação JWT
- [ ] RBAC com @casl/ability
- [ ] Rate limiting com @fastify/rate-limit
- [ ] Background jobs com Bull
- [ ] Email service (SendGrid/Mailgun)
- [ ] Testes E2E
- [ ] OpenTelemetry tracing
- [ ] Prometheus metrics

## Referências

- [Fastify Documentation](https://www.fastify.io/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Zod Documentation](https://zod.dev/)
