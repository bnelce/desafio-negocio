# Plataforma de Gestão para Grupos de Networking

> Documento de Arquitetura (Tarefa 1 – 40%)

## 1) Visão Geral
A plataforma digitaliza a gestão de um grupo de networking orientado à geração de negócios, substituindo planilhas por um sistema centralizado com módulos de Membros, Comunicação, Reuniões/Presenças, Indicações (referências), Agradecimentos ("obrigados"), Performance (dashboards/relatórios) e Financeiro (mensalidades). O objetivo é garantir **simplicidade**, **segurança**, **escalabilidade progressiva** e **facilidade de entrega contínua**.

### Não Funcionais
- **Disponibilidade inicial**: 99% (sem HA obrigatório no MVP; gateway e DB com backups automáticos).
- **Escalabilidade**: horizontal no backend (stateless) e no frontend; DB com estratégia de índices, partições (futuro) e read replicas (futuro).
- **Segurança**: OWASP ASVS nível básico, autenticação por token (MVP: Admin com env var), RBAC para membros/admin (futuro próximo), audit log.
- **Observabilidade**: logs estruturados (JSON), métricas (HTTP, DB), tracing (OpenTelemetry-ready).
- **Qualidade**: TDD/BDD para fluxos críticos (admissão de membros), Jest + RTL no FE; Jest/Supertest no BE.
- **Entrega**: CI/CD (lint, testes, build, migrations), versionamento semântico.

## 2) Arquitetura Lógica
```mermaid
flowchart LR
  subgraph Web[Cliente]
    U[Usuário/Membro]
    A[Admin]
  end

  subgraph FE[Frontend Next.js/React]
    P1[App Router / Pages]
    Ctx[State Mgmt / TanStack Query]
    UI[Design System / Componentes]
  end

  subgraph API[Backend Fastify (Clean Arch)]
    RT[Routes/Controllers]
    UC[Use Cases]
    VAL[Zod Validators]
    REP[Repositories (Interfaces)]
  end

  subgraph INFRA[Infra / Adapters]
    PRISMA[Prisma ORM]
    MAIL[Mailer (mock no MVP)]
    QUEUE[Queue/Jobs (futuro)]
  end

  subgraph DB[(Database)]
    SQL[(PostgreSQL/SQLite)]
  end

  U-->FE
  A-->FE
  FE-->RT
  RT-->VAL
  RT-->UC
  UC-->REP
  REP-->PRISMA
  PRISMA-->SQL
  UC--"convite/token"-->MAIL
```

**Escolhas de stack (MVP)**:
- **Frontend**: Next.js + React, App Router, TypeScript, TanStack Query, Zod, React Hook Form, Tailwind + shadcn/ui.
- **Backend**: **Node.js + Fastify** (TypeScript) com **Clean Architecture** (Handlers/Controllers → Use Cases → Repositories → DB). Validação com **Zod** (type‑provider), **Prisma** na camada de infra, **JWT** via `@fastify/jwt`, `@fastify/swagger` para docs. DI leve via factories.
- **Banco**: **SQLite** para simplicidade local/CI e **PostgreSQL** para ambientes persistentes. ORM: **Prisma**.
- **Testes**: **Vitest** (unit/integration), **Supertest** (HTTP), React Testing Library; Playwright (E2E opcional).

## 3) Domínios e Regras
### 3.1 Membros
- Intenção de participação (pública). Admin **aprova/recusa**. Ao aprovar, gera **Convite** com **token** único e expiração.
- Cadastro completo apenas via link com token válido.
- Estado do membro: `PENDING_INTENT → INVITED → ACTIVE → INACTIVE`.

### 3.2 Comunicação/Engajamento
- Avisos/Comunicados (feed simples, visível a membros ativos).
- Presença em reuniões: check-in por evento + membro.

### 3.3 Geração de Negócios
- Indicações: emissor → destinatário, descrição, potencial R$, status (`NEW`, `IN_PROGRESS`, `WON`, `LOST`).
- “Obrigados”: registro de agradecimento vinculado a indicação com `status = WON`.

### 3.4 Performance
- 1:1 entre membros (data, notas, objetivos). Dashboards: totais por período; KPIs por membro e pelo grupo.

### 3.5 Financeiro
- Mensalidades: plano, valor, geração de cobranças, status (pendente/pago/atrasado). Integrações de pagamento ficam **fora do MVP** (simulação de status).

## 4) Modelo de Dados (ERD)
```mermaid
erDiagram
  MEMBER ||--o{ INTENT : submits
  MEMBER ||--o{ ATTENDANCE : has
  MEMBER ||--o{ INTRODUCTION : sends
  MEMBER ||--o{ INTRODUCTION : receives
  MEMBER ||--o{ ONEONONE : participates
  INTRODUCTION ||--o{ THANKYOU : has
  MEMBER ||--o{ INVOICE : owns
  INVITE ||--|| INTENT : fulfills

  MEMBER {
    uuid id PK
    string name
    string email UQ
    string phone
    string role  // admin, member
    string status // ACTIVE/INACTIVE
    timestamptz createdAt
    timestamptz updatedAt
  }

  INTENT {
    uuid id PK
    string fullName
    string email
    string phone
    string notes
    string status // PENDING/APPROVED/REJECTED
    timestamptz createdAt
    timestamptz reviewedAt
    string reviewedBy // admin id
  }

  INVITE {
    uuid id PK
    uuid intentId FK
    string token UQ
    timestamptz expiresAt
    string status // PENDING/USED/EXPIRED
    timestamptz createdAt
  }

  ATTENDANCE {
    uuid id PK
    uuid memberId FK
    uuid meetingId FK
    bool present
    timestamptz createdAt
  }

  MEETING {
    uuid id PK
    string title
    date date
    string type // weekly, special
    timestamptz createdAt
  }

  INTRODUCTION {
    uuid id PK
    uuid fromMemberId FK
    uuid toMemberId FK
    string description
    numeric amount // potencial
    string status // NEW/IN_PROGRESS/WON/LOST
    timestamptz createdAt
    timestamptz updatedAt
  }

  THANKYOU {
    uuid id PK
    uuid introductionId FK
    string note
    timestamptz createdAt
  }

  ONEONONE {
    uuid id PK
    uuid memberAId FK
    uuid memberBId FK
    date date
    string notes
    timestamptz createdAt
  }

  INVOICE {
    uuid id PK
    uuid memberId FK
    numeric amount
    string period // YYYY-MM
    string status // PENDING/PAID/LATE
    timestamptz dueAt
    timestamptz paidAt
    timestamptz createdAt
  }
```

> **Notas**: No MVP podemos **não** materializar todos os agregados (ex: ONEONONE/INVOICE) caso a opção de módulo opcional seja apenas “Indicações” ou “Dashboard”. Mas o ERD já prevê a evolução.

## 5) Estrutura de Pastas (Turborepo só com `apps`)
```
apps/web/                      # Next.js (App Router)
  app/(public)/intent          # página pública de intenção
  app/(admin)/admin            # área do admin (protegida por env)
  app/(secure)/...             # áreas autenticadas (etapa 2)
  components/
  lib/
  hooks/
  services/                    # client da API (fetch wrappers tipados)
  tests/
  .eslintrc.cjs
  tsconfig.json

apps/api/                      # Fastify (TypeScript)
  src/
    @types/
    config/                    # env (zod), logger
    constants/
    domain/                    # entidades e regras de domínio
      entities/
      value-objects/
    application/               # use-cases, dto, services (token, ttl)
      use-cases/
      dto/
      ports/                   # interfaces Repository, Mailer
    infra/
      db/
        prisma/
          client.ts
          repositories/        # Prisma*Repository.ts (implements ports)
      mail/
        console-mailer.ts
      queue/
        bull.ts
    plugins/
      auth/                    # jwt plugin, hooks de autorização
      prisma.ts
      swagger.ts
      cors.ts
    http/
      server.ts
      routes/
        admin/
          intents.routes.ts
        public/
          intents.routes.ts
          invites.routes.ts
      controllers/
        admin/
        public/
      schemas/
    lib/
    services/
      sapDataBridge/
    tests/
      integration/
      unit/
    utils/
    specs/                     # OpenAPI + Zod (fonte de verdade)
    generated/                 # tipos/clients gerados a partir da spec
  prisma/
    schema.prisma
    migrations/
  package.json
  vitest.config.ts
  tsconfig.json
  .eslintrc.cjs

# Sem outros packages (sem packages/*). Tudo fica dentro de `apps/web` e `apps/api`.
```

## 6) Estratégia de Estado/Cache no Frontend
- **TanStack Query** para cache de requests (intenções, convites, indicações, dashboards).
- **Fetch layer** tipado a partir dos **schemas Zod/OpenAPI** gerados de `apps/api/src/specs`.
- **Suspense/SSR** para listas administrativas; SSG em páginas estáticas (landing).

## 7) Definição de API (REST) – MVP – *Fastify Handlers → Use Cases* (REST) – MVP – *Fastify Handlers → Use Cases*
> Controllers finos (parse/validação Zod, mapping) chamam **Use Cases** puros; estes dependem de **ports** (interfaces) para Repositórios/Mailer.

### Convenções
### Convenções
- JSON, `application/json`.
- Padrão de erro `{ error: { code, message, details? } }`.
- Paginação: `?page=1&pageSize=20`.
- Autorização: (MVP admin) `x-admin-key: <env>`; sessões de membro ficam para etapa 2.

### 7.1 Intenção de Participação
**POST** `/api/intents`
- **Request**
```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "notes": "string"
}
```
- **Response 201**
```json
{ "id": "uuid", "status": "PENDING" }
```

**GET** `/api/admin/intents?status=PENDING`
- **Headers**: `x-admin-key`
- **Response 200**
```json
{
  "items": [
    {"id":"uuid","fullName":"...","email":"...","phone":"...","notes":"...","status":"PENDING","createdAt":"..."}
  ],
  "page":1,
  "pageSize":20,
  "total": 1
}
```

**POST** `/api/admin/intents/{id}/approve`
- **Headers**: `x-admin-key`
- **Response 201**
```json
{ "inviteId":"uuid", "token":"<one-time>", "expiresAt":"2025-12-31T23:59:59Z" }
```

**POST** `/api/admin/intents/{id}/reject`
- **Headers**: `x-admin-key`
- **Response 200** `{ "status":"REJECTED" }`

### 7.2 Cadastro Completo via Token (Convite)
**GET** `/api/invites/{token}`
- **Response 200** `{ "valid": true, "intentId":"uuid", "expiresAt":"..." }`
- **Response 410** `{ "valid": false, "reason":"expired|used|invalid" }`

**POST** `/api/invites/{token}/register`
- **Request**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "password": "string"
}
```
- **Response 201** `{ "memberId": "uuid", "status":"ACTIVE" }`

### 7.3 Indicações (Opção A)
**POST** `/api/intros`
- **Auth**: membro (futuro: JWT)
- **Request**
```json
{ "toMemberId":"uuid", "description":"string", "amount": 1000 }
```
- **Response 201** `{ "id":"uuid","status":"NEW" }`

**GET** `/api/intros?mine=sent|received`
- **Response 200** `{"items": [ {"id":"...","from":"...","to":"...","status":"NEW"} ] }`

**PATCH** `/api/intros/{id}`
- **Request** `{ "status": "IN_PROGRESS|WON|LOST" }`
- **Response 200** `{ "id":"uuid","status":"WON" }`

### 7.4 Dashboard (Opção B)
**GET** `/api/dashboard?period=2025-11`
- **Response 200**
```json
{
  "activeMembers": 42,
  "introsInMonth": 18,
  "thanksInMonth": 7
}
```

## 8) Segurança
- **MVP**: Área admin protegida por **chave** via `x-admin-key` (setada no `.env`) + rate limit + CORS restrito.
- **Evolução**: Auth com JWT + refresh token; RBAC (admin, member); password hashing com Argon2; resets via email; MFA opcional.
- **Dados**: Encriptação em repouso (DB provider) e em trânsito (HTTPS). Secrets em Secret Manager.

## 9) Estratégia de Testes
- **Unitários (application/domain)**: use-cases e entidades (mocks de ports com `ts-mockito`/`vitest-mock-extended`). Meta: 80%+ nas regras críticas.
- **Integração (infra/http)**: controllers/rotas com **Supertest** e banco **sqlite:memory** com Prisma.
- **E2E**: opcional com Playwright/REST client.
- **Contract tests**: Schemas Zod/OpenAPI versionados em `packages/specs` e validados no CI.

## 10) Deploy & Operação
- **Ambientes**: `dev`, `staging`, `prod`.
- **Build**: Docker multi-stage para `apps/web` e `apps/api`; variáveis em `.env` (dev) e Secret Manager (stg/prod).
- **DB**: Prisma Migrate; seeds para usuários admin de teste; backup automático.
- **Observabilidade**: pino p/ logs; health-check `/healthz` no Fastify.

## 11) UI/UX – Páginas do MVP
- **Pública**: `/intent` (form de intenção).
- **Admin**: `/admin/intents` (lista + aprovar/recusar); `/admin/intent/:id` (detalhe); `/admin/settings` (chave admin & configs).
- **Convite/Cadastro**: `/register?token=...`.
- **Opcional A – Indicações**: `/intros`, `/intros/mine`.
- **Opcional B – Dashboard**: `/dashboard`.

## 12) Design System & Componentização
- **Átomos**: Button, Input, Select, Badge, Alert, Card, Table.
- **Moléculas**: IntentForm, InviteBanner, IntroCard, KPIWidget.
- **Organismos**: IntentListTable, AdminToolbar, DashboardGrid.
- **Templates**: AdminLayout, PublicLayout, SecureLayout.

## 13) Especificação Dirigida por Especificações (Spec‑Driven Development)
1. **Fonte de verdade** em `packages/specs`: OpenAPI + Zod.
2. **Geração de tipos/clients** para FE e API.
3. **Use Cases como testes**: a spec vira teste que começa falhando (red → green → refactor).
4. **Adaptação mínima em Controllers**: só parsing/validação e mapeamento DTO ⇄ entidade.

### 13.1 OpenAPI (trecho)
```yaml
openapi: 3.0.3
info:
  title: Networking Groups API
  version: 0.1.0
paths:
  /api/intents:
    post:
      summary: Create a participation intent
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/IntentCreate'
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/IntentCreated'
  /api/admin/intents:
    get:
      summary: List intents
      parameters:
        - in: query
          name: status
          schema: { type: string, enum: [PENDING, APPROVED, REJECTED] }
      responses:
        '200': { description: Ok }
components:
  schemas:
    IntentCreate:
      type: object
      required: [fullName, email]
      properties:
        fullName: { type: string, minLength: 3 }
        email: { type: string, format: email }
        phone: { type: string }
        notes: { type: string }
    IntentCreated:
      type: object
      required: [id, status]
      properties:
        id: { type: string, format: uuid }
        status: { type: string, enum: [PENDING] }
```

## 14) Roadmap de Implementação (Tarefa 2)
1. **Prisma**: `schema.prisma` (INTENT, INVITE, MEMBER) + migrations + seed admin.
2. **Plugins Fastify**: `prisma.ts`, `auth/jwt.ts`, `swagger.ts`, `cors.ts`.
3. **HTTP**: `server.ts` com type‑provider Zod, registro de plugins e rotas públicas/admin.
4. **Use Cases**: `CreateIntent`, `ListIntents`, `ApproveIntent`, `RejectIntent`, `ValidateInvite`, `RegisterWithInvite`.
5. **Controllers/Routes**: mapear endpoints ✕ use cases, respostas tipadas.
6. **Testes**: unit (use-cases), integração (Supertest) usando sqlite:memory.
7. **Frontend**: `/intent`, `/admin/intents`, `/register`.
8. **Ops**: Dockerfile + docker‑compose, README.

## 16) Esqueletos de Código (resumo)
> Abaixo seguem trechos essenciais para acelerar o start do backend Fastify.

### 16.1 `prisma/schema.prisma`
```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = env("DB_PROVIDER") url = env("DATABASE_URL") }

model Member {
  id         String   @id @default(uuid())
  name       String
  email      String   @unique
  phone      String?
  role       String   @default("member") // admin|member
  status     String   @default("ACTIVE") // ACTIVE|INACTIVE
  password   String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  intents    Intent[]
  invoices   Invoice[]
}

model Intent {
  id          String   @id @default(uuid())
  fullName    String
  email       String
  phone       String?
  notes       String?
  status      String   @default("PENDING") // PENDING|APPROVED|REJECTED
  createdAt   DateTime @default(now())
  reviewedAt  DateTime?
  reviewedBy  String?
  invite      Invite?
}

model Invite {
  id         String   @id @default(uuid())
  intentId   String   @unique
  token      String   @unique
  expiresAt  DateTime
  status     String   @default("PENDING") // PENDING|USED|EXPIRED
  createdAt  DateTime @default(now())
  intent     Intent   @relation(fields: [intentId], references: [id])
}

model Invoice {
  id        String   @id @default(uuid())
  memberId  String
  amount    Decimal  @db.Decimal(10,2)
  period    String   // YYYY-MM
  status    String   @default("PENDING")
  dueAt     DateTime
  paidAt    DateTime?
  createdAt DateTime @default(now())
  member    Member   @relation(fields: [memberId], references: [id])
}
```

### 16.2 `src/plugins/prisma.ts`
```ts
import fp from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'

declare module 'fastify' { interface FastifyInstance { prisma: PrismaClient } }

export default fp(async (app) => {
  const prisma = new PrismaClient()
  await prisma.$connect()
  app.decorate('prisma', prisma)
  app.addHook('onClose', async () => prisma.$disconnect())
})
```

### 16.3 `src/plugins/auth/jwt.ts`
```ts
import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'

export default fp(async (app) => {
  app.register(jwt, { secret: app.config.JWT_SECRET })
  app.decorate('authenticate', async (req) => {
    await req.jwtVerify()
  })
})

declare module 'fastify' {
  interface FastifyInstance { authenticate: any }
}
```

### 16.4 `src/http/server.ts`
```ts
import Fastify from 'fastify'
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import prisma from '../plugins/prisma'
import jwt from '../plugins/auth/jwt'
import { registerPublicRoutes } from './routes/public'
import { registerAdminRoutes } from './routes/admin'

export const buildServer = () => {
  const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>()
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.register(cors, { origin: true })
  app.register(swagger, { openapi: { info: { title: 'API', version: '0.1.0' } } })
  app.register(swaggerUi)

  app.register(prisma)
  app.register(jwt)

  app.get('/healthz', async () => ({ ok: true }))

  app.register(registerPublicRoutes, { prefix: '/api' })
  app.register(registerAdminRoutes, { prefix: '/api/admin' })

  return app
}

if (require.main === module) {
  const app = buildServer()
  app.listen({ port: Number(process.env.PORT) || 3333, host: '0.0.0.0' })
}
```

### 16.5 Rotas & Handlers (exemplo)
`src/http/routes/public/intents.routes.ts`
```ts
import { z } from 'zod'
import { FastifyInstance } from 'fastify'
import { CreateIntent } from '../../../application/use-cases/create-intent'

export async function registerPublicRoutes(app: FastifyInstance) {
  app.post('/intents', {
    schema: { body: z.object({ fullName: z.string().min(3), email: z.string().email(), phone: z.string().optional(), notes: z.string().optional() }) }
  }, async (req, reply) => {
    const uc = new CreateIntent(app.prisma)
    const id = await uc.execute(req.body)
    return reply.code(201).send({ id, status: 'PENDING' })
  })
}
```

`src/application/use-cases/create-intent.ts`
```ts
import { PrismaClient } from '@prisma/client'
export class CreateIntent {
  constructor(private prisma: PrismaClient) {}
  async execute(input: { fullName: string; email: string; phone?: string; notes?: string }) {
    const intent = await this.prisma.intent.create({ data: input })
    return intent.id
  }
}
```

`src/http/routes/admin/intents.routes.ts`
```ts
import { z } from 'zod'
import { FastifyInstance } from 'fastify'

export async function registerAdminRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate)

  app.get('/intents', async (_req, _reply) => {
    const items = await app.prisma.intent.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'desc' } })
    return { items, page: 1, pageSize: items.length, total: items.length }
  })

  app.post('/intents/:id/approve', {
    schema: { params: z.object({ id: z.string().uuid() }) }
  }, async (req, reply) => {
    const { id } = req.params as any
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await app.prisma.intent.update({ where: { id }, data: { status: 'APPROVED', reviewedAt: new Date() } })
    const inv = await app.prisma.invite.create({ data: { intentId: id, token, expiresAt } })
    return reply.code(201).send({ inviteId: inv.id, token, expiresAt })
  })
}
```

### 16.6 `.env` (exemplo)
```
NODE_ENV=development
PORT=3333
DB_PROVIDER=postgresql
DATABASE_URL=postgresql://user:pass@localhost:5432/app
JWT_SECRET=supersecret
INVITE_TTL_DAYS=7
```

### 16.7 Scripts pnpm
```
"dev": "pnpm tsx watch src/http/server.ts",
"build": "tsc",
"start": "node dist/index.js",
"prisma": "prisma",
"test": "cross-env NODE_ENV=test vitest run",
"test:ui": "cross-env NODE_ENV=test vitest --ui"
```

## 15) Variáveis de Ambiente (exemplo)
```
DATABASE_URL=postgresql://user:pass@host:5432/app
ADMIN_KEY=supersecret
INVITE_TTL_DAYS=7
NEXT_PUBLIC_APP_NAME=NetworkingX
```

```
DATABASE_URL=postgresql://user:pass@host:5432/app
ADMIN_KEY=supersecret
INVITE_TTL_DAYS=7
NEXT_PUBLIC_APP_NAME=NetworkingX
```

---
**Fim do Documento**

