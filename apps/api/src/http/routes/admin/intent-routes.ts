import { FastifyInstance } from 'fastify'
import { IntentController } from '@/http/controllers/intent-controller'
import { listIntentsQuerySchema, intentIdParamSchema } from '@/http/schemas/intent-schemas'
import { requireAdminKey } from '@/http/middleware/admin-auth'

export async function adminIntentRoutes(app: FastifyInstance) {
  // Apply admin authentication to all routes
  app.addHook('preHandler', requireAdminKey)

  app.get(
    '/intents',
    {
      schema: {
        tags: ['Admin - Intents'],
        summary: 'List intents',
        description: 'List all participation intents with optional filtering',
        querystring: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
            page: { type: 'number' },
            pageSize: { type: 'number' },
          },
        },
        headers: {
          type: 'object',
          properties: {
            'x-admin-key': { type: 'string' },
          },
          required: ['x-admin-key'],
        },
        response: {
          200: {
            description: 'List of intents',
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    fullName: { type: 'string' },
                    email: { type: 'string' },
                    phone: { type: 'string', nullable: true },
                    notes: { type: 'string', nullable: true },
                    status: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    reviewedAt: { type: 'string', format: 'date-time', nullable: true },
                    reviewedBy: { type: 'string', nullable: true },
                  },
                },
              },
              total: { type: 'number' },
              page: { type: 'number' },
              pageSize: { type: 'number' },
              totalPages: { type: 'number' },
            },
          },
        },
      },
    },
    IntentController.list
  )

  app.post(
    '/intents/:id/approve',
    {
      schema: {
        tags: ['Admin - Intents'],
        summary: 'Approve intent',
        description: 'Approve a participation intent and generate invite token',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
          required: ['id'],
        },
        headers: {
          type: 'object',
          properties: {
            'x-admin-key': { type: 'string' },
          },
          required: ['x-admin-key'],
        },
        response: {
          201: {
            description: 'Intent approved and invite created',
            type: 'object',
            properties: {
              intent: { type: 'object' },
              invite: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  token: { type: 'string' },
                  expiresAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
    IntentController.approve
  )

  app.post(
    '/intents/:id/reject',
    {
      schema: {
        tags: ['Admin - Intents'],
        summary: 'Reject intent',
        description: 'Reject a participation intent',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
          required: ['id'],
        },
        headers: {
          type: 'object',
          properties: {
            'x-admin-key': { type: 'string' },
          },
          required: ['x-admin-key'],
        },
        response: {
          200: {
            description: 'Intent rejected',
            type: 'object',
            properties: {
              intent: { type: 'object' },
            },
          },
        },
      },
    },
    IntentController.reject
  )
}
