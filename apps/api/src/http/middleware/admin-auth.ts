import { FastifyRequest, FastifyReply } from 'fastify'
import { env } from '@/config/env'

export async function requireAdminKey(request: FastifyRequest, reply: FastifyReply) {
  const adminKey = request.headers['x-admin-key']

  if (!adminKey || adminKey !== env.ADMIN_KEY) {
    return reply.status(401).send({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing admin key',
      },
    })
  }
}
