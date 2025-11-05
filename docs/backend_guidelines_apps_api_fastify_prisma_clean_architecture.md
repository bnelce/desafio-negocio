# Backend Guidelines – `apps/api`

> Diretrizes oficiais para o backend com **Fastify + TypeScript + Prisma**, seguindo **Clean Architecture** (Handlers/Controllers → Use Cases → Ports/Repositories → Infra). Spec‑driven development: o contrato vive em `apps/api/src/specs` e direciona tipos, validação e tests.

---

## 1) Princípios
- **Independência de frameworks**: a regra de negócio (application/domain) não depende de Fastify/Prisma.
- **Boundary explícito**: Handlers mapeiam HTTP ⇄ Use Cases (DTO in/out) e não contêm regra de negócio.
- **Validação única**: Zod nos boundaries (HTTP, env), tipos inferidos pro restante.
- **Observabilidade by default**: logs estruturados, health/readiness, métricas, correlação (requestId).
- **Testabilidade**: use‑cases puros com mocks de ports; integração cobre adapters (Fastify/Prisma).

---

## 2) Estrutura de Pastas
```
apps/api/
  src/
    @types/
    config/            # env (zod), logger, constants de runtime
    constants/
    domain/            # entidades, value-objects (regras imutáveis)
      entities/
      value-objects/
    application/       # orquestra regras de domínio
      use-cases/
      dto/
      services/        # utilidades de domínio (token, ttl, hash)
      ports/           # interfaces (Repositories, Mailer, Queue)
    infra/             # implementações de ports + integrações
      db/
        prisma/
          client.ts
          mappers/
          repositories/      # Prisma*Repository.ts
      mail/
        console-mailer.ts
      queue/
        bull.ts
    plugins/
      prisma.ts
      auth/jwt.ts
      cors.ts
      swagger.ts
      rate-limit.ts (opcional)
    http/
      server.ts
      routes/
        public/
          intents.routes.ts
          invites.routes.ts
        admin/
          intents.routes.ts
      controllers/           # 1 arquivo por endpoint (fino)
      schemas/               # zod schemas (input/output)
    specs/                   # OpenAPI + zod-openapi (fonte de verdade)
    generated/               # tipos/clients gerados
    tests/
      unit/
      integration/
    utils/
  prisma/
    schema.prisma
    migrations/
  vitest.config.ts
  tsconfig.json
```

---

## 3) Ciclo de Requisição
1. **Plugin chain**: logger → cors → swagger → jwt → prisma → rate-limit.
2. **Roteador** chama **controller** do endpoint.
3. **Controller** valida entrada (Zod), cria **Use Case** via factory, chama `execute`.
4. **Use Case** orquestra ports (repositórios, mailer, queue) e retorna DTO de saída.
5. **Controller** formata resposta (status code + body tipado), e registra métricas/eventos.

---

## 4) Handlers/Controllers
- Uma função por arquivo, **sem** regra de negócio.
- Sempre com **schema Zod** de `body`, `params`, `query` e **response**.
- Mapear **códigos HTTP** corretamente (201 em criação, 204 em deleção sem body, 400/401/403/404/409/422/429/500 conforme caso).

```ts
// http/controllers/public/create-intent.controller.ts
export async function createIntentController(app: FastifyInstance) {
  app.post('/api/intents', {
    schema: { body: IntentCreateSchema, response: { 201: IntentCreatedSchema } }
  }, async (req, reply) => {
    const uc = makeCreateIntent(app) // factory injeta ports
    const out = await uc.execute(req.body)
    return reply.code(201).send(out)
  })
}
```

---

## 5) Use Cases (Application)
- Classe/função **pura** com dependências injetadas (ports) via **factory**.
- Nomear `execute(input): Promise<output>`.
- **Não** lançar erros genéricos; usar erros de domínio (ex.: `InviteExpiredError`) e mapear no controller.

```ts
// application/use-cases/create-intent.ts
export class CreateIntent {
  constructor(private intents: IntentsRepository) {}
  async execute(input: IntentCreateDTO): Promise<IntentCreatedDTO> {
    const exists = await this.intents.findByEmail(input.email)
    if (exists) throw new IntentConflictError('email already submitted')
    const intent = await this.intents.create(input)
    return { id: intent.id, status: 'PENDING' }
  }
}
```

---

## 6) Ports & Repositórios
- **Ports** em `application/ports`: interfaces agnósticas.
- **Infra** implementa ports (Prisma*Repository) e faz mapping entidade/record.
- Transações: passar **`prisma.$transaction`** ou **Unit of Work** no port quando for multi‑agregado.

```ts
// application/ports/intents-repo.ts
export interface IntentsRepository {
  create(data: IntentCreateDTO): Promise<Intent>
  findByEmail(email: string): Promise<Intent | null>
}
```

---

## 7) Validação & Schemas
- Zod em `http/schemas` (ou por feature).
- **Response schema** obrigatório para Swagger consistir com o retorno.
- Reuso: exportar `type` via `z.infer<typeof XSchema>`.

---

## 8) Erros & Respostas
- Envelope de erro padrão: `{ error: { code, message, details? } }`.
- Mapear erros de domínio → HTTP no controller.
- Logar `warn` para 4xx (exceto 401/403 com parcimônia) e `error` para 5xx.

---

## 9) Segurança
- **Auth**: `@fastify/jwt` (MVP: admin key → depois usuários). Usar `app.addHook('onRequest', app.authenticate)` em rotas admin.
- **RBAC**: opcional `@casl/ability` no controller/use case (verificar capability antes de executar).
- **CORS**: restrito em produção.
- **Headers**: `x-request-id`, `x-correlation-id` (propagar em logs e respostas).
- **Rate limit**: plugin nas rotas públicas que podem sofrer abuso.
- **Input hardening**: schemas Zod com `strip` e enums; nunca confiar em dados do client.

---

## 10) Configuração & Env
- `config/env.ts` com Zod (ex.: `JWT_SECRET`, `DATABASE_URL`, `INVITE_TTL_DAYS`).
- Carregar **uma vez** no boot e expor em `app.config` via plugin.
- `dotenv` somente em dev/tests.

---

## 11) Prisma & Banco
- **Migrations** versionadas; sem `prisma db push` em prod.
- **Indices** para filtros frequentes (email, status, createdAt DESC).
- **Paginação**: cursor (preferível) ou `skip/take` com ordenação estável.
- **Transações**: `prisma.$transaction` (com `interactiveTransactions` quando necessário).
- **Soft delete**: campo `deletedAt` quando aplicável (não no MVP se não precisar).

---

## 12) Background Jobs
- `bull` + Redis (opcional) para emails/integrações.
- Definir **jobs idempotentes**; retries exponenciais; dead‑letter queue para análise.

---

## 13) Arquivos & Uploads
- `@fastify/multipart` com limites (tamanho, tipos). Salvar em objeto storage (futuro) ou temp local.
- Validar extensão/MIME; varrer metadados sensíveis.

---

## 14) Observabilidade
- **Logger**: pino com nível por ambiente, formatação JSON.
- **Health**: `/healthz` (liveness) e `/readyz` (prisma conectado, Redis ok) — 200/503.
- **Métricas**: middleware para latência, contadores por rota, taxa de erro.

---

## 15) Documentação (Swagger/OpenAPI)
- Schemas Zod exportados via `zod-to-openapi` **ou** manter OpenAPI em `specs/` e validar respostas no runtime.
- Expor `/docs` com `@fastify/swagger-ui`. Versão do contrato = versão da API.

---

## 16) Versionamento de API
- Prefixo `/api` (v0). Ao quebrar contrato, criar `/api/v1` e manter compatibilidade temporária.

---

## 17) Padrões de Endpoints
- **Coleções**: `GET /resource`, `POST /resource`.
- **Item**: `GET /resource/:id`, `PATCH /resource/:id`, `DELETE /resource/:id`.
- **Ações**: `POST /resource/:id/action` (ex.: `/intents/:id/approve`).
- **Paginação**: `?cursor=...&limit=20` ou `?page=1&pageSize=20` (padronizar no projeto; cursors preferidos).

---

## 18) Idempotência & Conflitos
- `Idempotency-Key` para POSTs sensíveis (futuro).
- Responder **409** em duplicidades conhecidas (e.g., intent já existente por email).

---

## 19) Testes
- **Unit (application/domain)**: usar mocks de ports (vitest mock/`vi.fn()` ou `vitest-mock-extended`).
- **Integração (http/infra)**: **Supertest** com **sqlite:memory** e migrations reais.
- **Cobertura**: 80%+ nos use‑cases e 70%+ geral do módulo MVP.
- Seeds dedicados para cenários.

---

## 20) CI/CD & Qualidade
- Pipeline: lint → typecheck → unit → build → integration → (e2e opcional).
- Fail rápido em breaking schema (comparar OpenAPI da branch vs main).
- Docker multi‑stage (node:alpine), rodar `prisma migrate deploy` no entrypoint.

---

## 21) Segurança Operacional
- Segredos no Secret Manager/variáveis seguras; **não** commitar `.env`.
- Rotacionar chaves/JWT; clocks skew tolerados.
- Cabeçalhos de segurança (HSTS atrás do proxy, no gateway/Ingress).

---

## 22) Exemplo de Fábrica (DI leve)
```ts
// infra/factories/make-create-intent.ts
export function makeCreateIntent(app: FastifyInstance) {
  const intents = new PrismaIntentsRepository(app.prisma)
  return new CreateIntent(intents)
}
```

---

## 23) Convenções de Código
- TS estrito; `noImplicitAny`, `exactOptionalPropertyTypes`.
- Nomenclatura: `XRepository`, `CreateX`, `XSchema`, `XDTO`.
- Nunca usar `any`; preferir `unknown`→refinar com Zod.
- Evitar `utils` genéricos sem propósito; criar módulos coesos.

---

## 24) Roteiro de MVP (checklist)
- [ ] Schemas Prisma + migrations + seed
- [ ] Plugins: prisma, auth, swagger, cors, rate‑limit
- [ ] Rotas públicas: `POST /api/intents`, `GET /api/invites/:token`
- [ ] Rotas admin (auth): `GET /api/admin/intents`, `POST /api/admin/intents/:id/approve`, `.../reject`
- [ ] Tests unit + integração
- [ ] Docs `/docs` ok, health/readiness ok

---
**Fim das diretrizes do backend.**

