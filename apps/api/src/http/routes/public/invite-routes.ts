import { FastifyInstance } from 'fastify'
import { InviteController } from '@/http/controllers/invite-controller'
import { inviteTokenParamSchema, registerWithInviteSchema } from '@/http/schemas/invite-schemas'

export async function inviteRoutes(app: FastifyInstance) {
  app.get(
    '/invites/:token',
    {
      schema: {
        tags: ['Invites'],
        summary: 'Validate invite token',
        description: 'Check if an invite token is valid',
        params: inviteTokenParamSchema.shape.params,
        response: {
          200: {
            description: 'Invite is valid',
            type: 'object',
            properties: {
              valid: { type: 'boolean' },
              intentId: { type: 'string' },
              expiresAt: { type: 'string', format: 'date-time' },
            },
          },
          410: {
            description: 'Invite is invalid, expired, or used',
            type: 'object',
            properties: {
              valid: { type: 'boolean' },
              reason: { type: 'string', enum: ['expired', 'used', 'invalid'] },
            },
          },
        },
      },
    },
    InviteController.validate
  )

  app.post(
    '/invites/:token/register',
    {
      schema: {
        tags: ['Invites'],
        summary: 'Register with invite',
        description: 'Complete member registration using a valid invite token',
        params: registerWithInviteSchema.shape.params,
        body: registerWithInviteSchema.shape.body,
        response: {
          201: {
            description: 'Member registered successfully',
            type: 'object',
            properties: {
              member: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string', nullable: true },
                  role: { type: 'string' },
                  status: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
    InviteController.register
  )
}
