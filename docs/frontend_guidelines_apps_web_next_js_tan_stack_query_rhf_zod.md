# Frontend Guidelines – `apps/web`

> Padrões e boas práticas para o projeto Next.js (App Router) com Tailwind + shadcn/ui, TanStack Query, React Hook Form e Zod. Estas diretrizes são vinculadas ao contrato da API em `apps/api/src/specs` (spec‑driven development).

---

## 1) Arquitetura & Pastas
```
apps/web/
  app/                      # App Router
    (public)/intent        # rotas públicas
    (admin)/admin          # rotas administrativas (protegidas)
    (secure)/...           # rotas autenticadas (futuro)
    layout.tsx             # layout raiz
    page.tsx               # landing (se houver)
  components/              # UI reusável (shadcn/ui + wrappers)
  features/                # telas + lógica de domínio da feature
    intents/
      components/
      hooks/
      pages/
      types.ts
  lib/                     # helpers genéricos (fetcher, queryClient, cn util)
  services/                # clientes HTTP tipados (gerados da spec)
  hooks/                   # hooks compartilhados (ex: useToast, useAuth)
  styles/                  # globals.css, tokens
  tests/                   # RTL + vitest
  env.mjs                  # validação de env (zod)
```

### Regras gerais
- **Separar feature por pasta** dentro de `features/`.
- **Componentes puros e acessíveis** em `components/` (sem lógica de dados; lógica vai para hooks / features).
- **Nada de imports relativos quebráveis** como `../../../` — usar `tsconfig` paths (`@/components`, `@/features/...`).

---

## 2) Styleguide de Código
- **TypeScript estrito** (`"strict": true`).
- **ESLint + Prettier** com regras de acessibilidade (jsx‑a11y) e React.
- **Nomes**: componentes PascalCase, hooks `useX`, schemas Zod `XSchema`.
- **Side‑effects** somente em hooks. Componentes devem ser funcionais e previsíveis.
- **Evitar `any`**; preferir tipos inferidos a partir dos schemas Zod/clients gerados.

---

## 3) UI/Design System
- **Tailwind** para layout/spacing/typography.
- **shadcn/ui** para componentes base (Button, Input, Dialog, Sheet, Table, Form, Toast).
- Criar **wrappers** quando precisar padronizar comportamento (ex: `<FormField>` com mensagens de erro padrão).
- **Tokens** (cores, espaçamentos) centralizados no `globals.css` e config Tailwind.

### Acessibilidade
- Usar componentes shadcn que já respeitam ARIA.
- Todo form control deve ter **label** (visível ou `sr-only`), `aria-invalid` em erros e `aria-describedby` para mensagens.
- Atalhos de teclado e foco visível em elementos interativos.

---

## 4) Navegação (App Router)
- **Server Components por padrão** para páginas/listas estáticas ou que se beneficiem de SSR.
- **Client Components** quando houver interação com estado local, formulários, TanStack Query, ou APIs do browser.
- **Metadata** por rota (SEO básico).
- **Layout**: `layout.tsx` define providers globais (QueryClientProvider, Theme, Toaster).

---

## 5) Data‑Fetching (TanStack Query)
- **Query Keys**: `['intents', { status, page }]` (sempre estáveis e serializáveis).
- **Stale/Cache times**: escolha conservadora (ex.: `staleTime: 30_000`).
- **Prefetch SSR** quando fizer sentido (ex.: lista admin), usando `dehydrate` no server.
- **Mutations**: `onSuccess` deve **invalida** as queries relevantes; usar **optimistic updates** com cautela.

```ts
// lib/queryClient.ts
export const getQueryClient = () => new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } }
})
```

---

## 6) Forms (RHF + Zod)
- **Zod** como fonte de verdade do form (parse/validation).
- Mensagem de erro **curta e objetiva**; exibir abaixo do campo.
- **`zodResolver`** para integrar com RHF; **defaultValues** definidos via schema.

```ts
const IntentSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

export type IntentInput = z.infer<typeof IntentSchema>
```

---

## 7) Serviço HTTP & Spec‑Driven
- O **contrato** vive em `apps/api/src/specs`.
- Gerar cliente tipado (por exemplo, `openapi-typescript` + `ky` ou `zodios`) e colocar em `apps/web/services/`.
- Toda função de serviço retorna **tipos do contrato**; componentes não devem acoplar em `fetch` bruto.

```ts
// services/intents.ts (exemplo genérico)
export async function createIntent(input: IntentInput) {
  return api.POST('/api/intents', { json: input }).json<{ id: string; status: 'PENDING' }>()
}
```

---

## 8) Estado Global x Local
- **TanStack Query** para **server state** (coisas que vêm da API).
- **Zustand** (se necessário) para **UI state** local e efêmero (ex.: filtros abertos, modal aberta). Evitar Redux.

---

## 9) Erros, Loading & UX
- **Skeletons**/**spinners** consistentes (componente `<LoadingState />`).
- **Toasts** para feedback de ações (sucesso/erro).
- **ErrorBoundary** por feature (App Router suporta segmentos com `error.tsx`).
- Em casos de erro 401/403, redirecionar para rota de login/admin conforme fluxo de auth.

---

## 10) Acesso à API & Segurança
- **Base URL** por env (`NEXT_PUBLIC_API_BASE_URL`).
- **Credenciais** nunca no client; tokens via cookies HttpOnly quando houver auth de membros.
- Sanitizar toda entrada do usuário com Zod; não confiar em dados do client.
- CORS restrito em produção (lado servidor), mesmo com SSR.

---

## 11) Performance
- **`next/image`** para otimizar imagens.
- **Code‑splitting**: `dynamic()` para componentes pesados/modais.
- **Memorização**: `useMemo/useCallback` quando necessário; evitar re-renders por props instáveis.
- **Lista grandes**: paginação ou virtualização.

---

## 12) Testes (RTL + Vitest)
- **Unit**: hooks e componentes puros.
- **Integration**: páginas com TanStack Query mockado.
- **e2e** (opcional): Playwright contra um ambiente de dev.
- Cobertura mínima 70% nas features críticas (intents, invites, register).

```ts
render(<IntentForm />)
await user.type(screen.getByLabelText(/nome/i), 'Maria Silva')
await user.click(screen.getByRole('button', { name: /enviar/i }))
expect(await screen.findByText(/enviado/i)).toBeInTheDocument()
```

---

## 13) Acessos/Admin
- **Admin key** (MVP) enviada pelo servidor via cookie seguro para acessar `/admin/*`.
- No futuro: JWT + RBAC vindo da API; proteger **actions/mutations** no client conforme claims.

---

## 14) Convenções de Commits & PR
- **Conventional Commits** (`feat:`, `fix:`, `chore:`, `refactor:`...).
- **PR Checklist**:
  - [ ] Seguiu o contrato de `apps/api/src/specs`
  - [ ] Tem testes (ou justificativa)
  - [ ] Sem `any`/`eslint-disable` sem motivo
  - [ ] Acessibilidade básica checada
  - [ ] Perf: sem renders desnecessários

---

## 15) Deploy & Observabilidade
- **Vercel** ou container Docker para `apps/web`.
- Variáveis em runtime via `NEXT_PUBLIC_*` para configs públicas.
- **Sentry** (opcional) para erros no client; logs de UI (apenas metadados, sem PII).

---

## 16) Exemplos Rápidos

### 16.1 Página pública `/intent`
- Server component com `IntentForm` (client), submit → `createIntent()`; toast de sucesso.

### 16.2 Lista admin `/admin/intents`
- SSR com prefetch + dehydrate; filtro por status; approve/reject via mutations com invalidation em `['intents']`.

### 16.3 Cadastro via token `/register?token=...`
- Na montagem, valida token (`GET /api/invites/:token`), renderiza form (RHF/Zod) e envia `POST /api/invites/:token/register`.

---

## 17) Linters/Configs recomendados
- `eslint-config-next` + `@tanstack/eslint-plugin-query` + `eslint-plugin-jsx-a11y`.
- `tsconfig` com `paths` para `@/*`.
- Husky + lint-staged para format/tsc/test em pre-commit (opcional).

---

## 18) Roadmap de UI (MVP)
1. Landing/`/intent`
2. Admin: `/admin/intents`
3. `/register?token=...`
4. (Opcional) `/dashboard` ou `/intros`

---
**Fim das diretrizes do frontend.**

