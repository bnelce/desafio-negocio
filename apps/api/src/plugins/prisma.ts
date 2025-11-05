import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { prisma } from '@/infra/db/prisma/client'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: typeof prisma
  }
}

const prismaPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('prisma', prisma)

  fastify.addHook('onClose', async () => {
    await prisma.$disconnect()
  })
}

export default fp(prismaPlugin)
