# Frontend - Networking Groups Platform

Frontend web application built with Next.js 14, TypeScript, TanStack Query, and Tailwind CSS.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS + shadcn/ui components
- **HTTP Client**: Type-safe fetch wrappers

## Features Implemented

### ✅ Public Pages

#### `/` - Home Page
- Landing page with navigation
- Links to submit intent, register, and admin dashboard

#### `/intent` - Submit Participation Intent
- Form to submit participation interest
- Validation with Zod
- Success/error feedback
- Redirects to home after submission

#### `/register?token=...` - Member Registration
- Token validation on page load
- Registration form (only if token is valid)
- Password confirmation
- Account creation

### ✅ Admin Pages

#### `/admin/intents` - Intent Management Dashboard
- List all intents with filtering (ALL, PENDING, APPROVED, REJECTED)
- Approve/reject intents
- Real-time updates with TanStack Query
- Copy invite tokens

## Project Structure

```
apps/web/
├── app/
│   ├── intent/
│   │   └── page.tsx           # Submit intent page
│   ├── register/
│   │   └── page.tsx           # Register with token page
│   ├── admin/
│   │   └── intents/
│   │       └── page.tsx       # Admin dashboard
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   ├── providers.tsx          # TanStack Query provider
│   └── globals.css            # Global styles
├── components/
│   └── ui/                    # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── toast.tsx
│       └── toaster.tsx
├── hooks/
│   └── use-toast.ts           # Toast notifications hook
├── lib/
│   ├── api.ts                 # API client
│   ├── types.ts               # TypeScript types
│   ├── utils.ts               # Utility functions
│   └── query-client.ts        # TanStack Query config
└── services/                  # API services (future)
```

## Development

### Prerequisites
- Backend API running on http://localhost:3333
- Node.js 20+
- pnpm 8+

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3333
NEXT_PUBLIC_APP_NAME=NetworkingX
```

### Run Development Server

```bash
pnpm dev
```

Application will be available at http://localhost:3000

### Build for Production

```bash
pnpm build
pnpm start
```

## Features

### Forms & Validation
- React Hook Form for form state management
- Zod schemas for validation
- Real-time error messages
- Loading states during submission

### API Integration
- Type-safe API client
- TanStack Query for data fetching & caching
- Automatic retry on failure
- Optimistic updates

### UI/UX
- Responsive design (mobile-first)
- Loading indicators
- Toast notifications for feedback
- Accessible components (ARIA labels)
- Error boundaries

## Pages in Detail

### Home Page (`/`)
Simple landing page with:
- Brief description
- CTA buttons to main actions
- Clean, professional design

### Submit Intent (`/intent`)
**Fields**:
- Full Name (required, min 3 chars)
- Email (required, valid email)
- Phone (optional)
- Notes (optional, textarea)

**Flow**:
1. User fills form
2. Client-side validation
3. POST to `/api/intents`
4. Success toast + redirect home
5. Or error toast if failed

### Register (`/register?token=...`)
**Flow**:
1. Extract token from URL
2. Validate token via GET `/api/invites/:token`
3. If invalid: show error + link to submit intent
4. If valid: show registration form

**Fields**:
- Name (required, min 3 chars)
- Email (required, valid email)
- Phone (optional)
- Password (required, min 8 chars)
- Confirm Password (must match)

**Submission**:
1. POST to `/api/invites/:token/register`
2. Success: toast + redirect home
3. Error: show error message

### Admin Dashboard (`/admin/intents`)
**Features**:
- Filter by status (ALL, PENDING, APPROVED, REJECTED)
- List intents with details
- Approve button (generates invite token)
- Reject button
- Copy invite URL to clipboard

**Authentication**:
- Uses `x-admin-key` header (MVP)
- TODO: Implement proper JWT auth

## Adding New Components

### shadcn/ui Components

To add more shadcn/ui components:

```bash
# Example: add Select component
npx shadcn-ui@latest add select
```

### Custom Components

Create in `components/` directory:

```tsx
// components/custom-card.tsx
import { Card } from '@/components/ui/card'

export function CustomCard() {
  return <Card>...</Card>
}
```

## API Client Usage

### GET Request
```tsx
import { api } from '@/lib/api'

const data = await api.get<ResponseType>('/api/endpoint')
```

### POST Request
```tsx
const data = await api.post<ResponseType>('/api/endpoint', {
  key: 'value'
})
```

### With Headers
```tsx
const data = await api.get<ResponseType>('/api/endpoint', {
  headers: { 'x-admin-key': 'key' }
})
```

## TanStack Query Usage

### Query
```tsx
import { useQuery } from '@tanstack/react-query'

const { data, isLoading, error } = useQuery({
  queryKey: ['intents'],
  queryFn: () => api.get('/api/intents')
})
```

### Mutation
```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()

const mutation = useMutation({
  mutationFn: (data) => api.post('/api/intents', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['intents'] })
  }
})
```

## Styling

### Tailwind Classes
Use utility classes for styling:

```tsx
<div className="flex items-center gap-4 p-6 bg-gray-100 rounded-lg">
  ...
</div>
```

### Using cn() Utility
Combine classes conditionally:

```tsx
import { cn } from '@/lib/utils'

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  className
)}>
```

## Performance Optimizations

- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Use `next/image` (when needed)
- **Query Caching**: TanStack Query caches API responses
- **Lazy Loading**: Components loaded on-demand

## Accessibility

- All form inputs have labels
- ARIA attributes on interactive elements
- Keyboard navigation support
- Focus visible states
- Color contrast meets WCAG standards

## Future Enhancements

- [ ] JWT authentication
- [ ] Protected routes with middleware
- [ ] Pagination for admin list
- [ ] Search functionality
- [ ] Export intents to CSV
- [ ] Dark mode toggle
- [ ] i18n (internationalization)
- [ ] E2E tests with Playwright

## Troubleshooting

### Port 3000 already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

### API connection refused
- Ensure backend is running on port 3333
- Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`

### Build errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
pnpm install
pnpm build
```

## Contributing

When adding new features:
1. Create TypeScript types in `lib/types.ts`
2. Add API methods if needed
3. Use TanStack Query for data fetching
4. Follow existing component patterns
5. Add proper error handling
6. Test all user flows

---

**Status**: Frontend 100% funcional ✅

Todas as páginas principais implementadas e funcionando!
