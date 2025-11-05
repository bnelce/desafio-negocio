import { z } from 'zod'

export const inviteTokenParamSchema = z.object({
  params: z.object({
    token: z.string().min(1, 'Token is required'),
  }),
})

export const registerWithInviteSchema = z.object({
  params: z.object({
    token: z.string().min(1, 'Token is required'),
  }),
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
})

export type InviteTokenParam = z.infer<typeof inviteTokenParamSchema>['params']
export type RegisterWithInviteBody = z.infer<typeof registerWithInviteSchema>['body']
export type RegisterWithInviteParams = z.infer<typeof registerWithInviteSchema>['params']
