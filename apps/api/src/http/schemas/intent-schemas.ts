import { z } from 'zod'

export const createIntentSchema = z.object({
  body: z.object({
    fullName: z.string().min(3, 'Full name must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    notes: z.string().optional(),
  }),
})

export const listIntentsQuerySchema = z.object({
  querystring: z.object({
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
    page: z.coerce.number().min(1).optional(),
    pageSize: z.coerce.number().min(1).max(100).optional(),
  }),
})

export const intentIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid intent ID'),
  }),
})

export type CreateIntentBody = z.infer<typeof createIntentSchema>['body']
export type ListIntentsQuery = z.infer<typeof listIntentsQuerySchema>['querystring']
export type IntentIdParam = z.infer<typeof intentIdParamSchema>['params']
