# 🚀 Quick Start Guide

## Pré-requisitos

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose

## Setup Rápido

### 1. Instalar Dependências

```bash
pnpm install
```

### 2. Iniciar PostgreSQL

```bash
docker compose up -d postgres
```

Aguarde o container ficar saudável (~10 segundos).

### 3. Configurar Banco de Dados

```bash
cd apps/api
pnpm prisma db push
pnpm prisma:seed
```

### 4. Iniciar Backend

```bash
# No diretório apps/api
pnpm dev
```

✅ **Backend rodando em: http://localhost:3333**
📚 **Documentação API: http://localhost:3333/docs**

### 5. Testar API

#### Criar Intenção de Participação
```bash
curl -X POST http://localhost:3333/api/intents \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "notes": "Interested in networking"
  }'
```

#### Listar Intenções (Admin)
```bash
curl http://localhost:3333/api/admin/intents?status=PENDING \
  -H "x-admin-key: dev-admin-key-123"
```

#### Aprovar Intenção (Admin)
```bash
curl -X POST http://localhost:3333/api/admin/intents/{intentId}/approve \
  -H "x-admin-key: dev-admin-key-123"
```

## Credenciais

### Admin
- **Email**: admin@networkinggroups.com
- **Password**: Admin@123
- **Admin Key**: dev-admin-key-123

### Intents de Teste
- john@example.com (PENDING)
- jane@example.com (PENDING)

## Estrutura do Projeto

```
desafio-negocio/
├── apps/
│   ├── api/              ✅ Backend completo (Fastify + Prisma)
│   └── web/              🚧 Frontend (Next.js 14) - em desenvolvimento
├── docs/                 📄 Documentação do desafio
└── docker-compose.yml    🐳 PostgreSQL configurado
```

## Endpoints Principais

### Públicos
- `POST /api/intents` - Submeter intenção
- `GET /api/invites/:token` - Validar convite
- `POST /api/invites/:token/register` - Registrar membro

### Admin (Header: `x-admin-key`)
- `GET /api/admin/intents` - Listar intenções
- `POST /api/admin/intents/:id/approve` - Aprovar
- `POST /api/admin/intents/:id/reject` - Rejeitar

### Health Checks
- `GET /healthz` - Liveness probe
- `GET /readyz` - Readiness probe (verifica DB)

## Troubleshooting

### Backend não inicia
```bash
# Verificar se PostgreSQL está rodando
docker compose ps

# Verificar logs
docker compose logs postgres

# Recriar banco
cd apps/api
pnpm prisma db push --force-reset
pnpm prisma:seed
```

### Erro de variáveis de ambiente
```bash
# Verificar se .env existe
ls apps/api/.env

# Se não existir, criar baseado no exemplo
cp .env.example apps/api/.env
```

### Port 3333 em uso
```bash
# Windows
netstat -ano | findstr :3333
taskkill /PID <pid> /F

# Linux/Mac
lsof -ti:3333 | xargs kill
```

## Próximos Passos

### Frontend (em desenvolvimento)
```bash
cd apps/web
pnpm install
pnpm dev
```

### Executar Testes
```bash
cd apps/api
pnpm test
pnpm test:coverage
```

## Documentação Completa

- [README Principal](./README.md)
- [Backend API](./apps/api/README.md)
- [Arquitetura](./docs/arquitetura.md)
- [Guidelines Backend](./docs/guidelines-backend.md)

## Suporte

- Swagger UI: http://localhost:3333/docs (interface interativa)
- Issues: Consulte a documentação completa
- Health: http://localhost:3333/healthz

---

**Status**: Backend 100% funcional ✅ | Frontend em desenvolvimento 🚧
