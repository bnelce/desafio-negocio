import { FastifyInstance } from 'fastify'
import { IntentController } from '@/http/controllers/intent-controller'

export async function intentRoutes(app: FastifyInstance) {
  app.post(
    '/intents',
    {
      schema: {
        tags: ['Intents'],
        summary: 'Create participation intent',
        description: 'Submit a participation intent for review',
        body: {
          type: 'object',
          properties: {
            fullName: { type: 'string', minLength: 3 },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            notes: { type: 'string' },
          },
          required: ['fullName', 'email'],
        },
        response: {
          201: {
            description: 'Intent created successfully',
            type: 'object',
            properties: {
              intent: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  fullName: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string', nullable: true },
                  notes: { type: 'string', nullable: true },
                  status: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
    IntentController.create
  )
}
