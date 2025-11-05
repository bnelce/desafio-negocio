import Fastify from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { env } from '@/config/env'
import { logger } from '@/config/logger'
import prismaPlugin from '@/plugins/prisma'

// Routes
import { intentRoutes } from './routes/public/intent-routes'
import { inviteRoutes } from './routes/public/invite-routes'
import { adminIntentRoutes } from './routes/admin/intent-routes'

const app = Fastify({
  logger,
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'reqId',
})

// Register plugins
async function bootstrap() {
  // CORS
  await app.register(cors, {
    origin: env.NODE_ENV === 'production' ? false : '*',
    credentials: true,
  })

  // Prisma
  await app.register(prismaPlugin)

  // Swagger
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Networking Groups API',
        description: 'API for managing business networking groups',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'Intents', description: 'Participation intents endpoints' },
        { name: 'Invites', description: 'Invite management endpoints' },
        { name: 'Admin - Intents', description: 'Admin endpoints for intent management' },
      ],
    },
  })

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  })

  // Health checks
  app.get('/healthz', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  app.get('/readyz', async () => {
    try {
      await app.prisma.$queryRaw`SELECT 1`
      return { status: 'ok', database: 'connected' }
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })

  // Register routes
  await app.register(intentRoutes, { prefix: '/api' })
  await app.register(inviteRoutes, { prefix: '/api' })
  await app.register(adminIntentRoutes, { prefix: '/api/admin' })

  // Error handler
  app.setErrorHandler((error, _request, reply) => {
    if (error.validation) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.validation,
        },
      })
    }

    logger.error(error)

    return reply.status(500).send({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      },
    })
  })

  // Start server
  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' })
    logger.info(`Server listening on http://localhost:${env.PORT}`)
    logger.info(`Documentation available at http://localhost:${env.PORT}/docs`)
  } catch (err) {
    logger.error(err)
    process.exit(1)
  }
}

// Handle graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing server gracefully...')
  await app.close()
  process.exit(0)
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

// Start the server
bootstrap().catch((err) => {
  logger.error(err)
  process.exit(1)
})
