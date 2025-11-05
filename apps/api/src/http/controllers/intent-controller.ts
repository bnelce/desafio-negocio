import { FastifyRequest, FastifyReply } from 'fastify'
import { CreateIntentUseCase } from '@/application/use-cases/create-intent'
import { ListIntentsUseCase } from '@/application/use-cases/list-intents'
import { ApproveIntentUseCase } from '@/application/use-cases/approve-intent'
import { RejectIntentUseCase } from '@/application/use-cases/reject-intent'
import { PrismaIntentRepository } from '@/infra/db/prisma/repositories/prisma-intent-repository'
import { PrismaInviteRepository } from '@/infra/db/prisma/repositories/prisma-invite-repository'
import { prisma } from '@/infra/db/prisma/client'
import {
  CreateIntentBody,
  ListIntentsQuery,
  IntentIdParam,
} from '@/http/schemas/intent-schemas'

export class IntentController {
  static async create(
    request: FastifyRequest<{ Body: CreateIntentBody }>,
    reply: FastifyReply
  ) {
    try {
      const intentRepository = new PrismaIntentRepository(prisma)
      const useCase = new CreateIntentUseCase(intentRepository)

      const result = await useCase.execute(request.body)

      return reply.status(201).send(result)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({
          error: {
            code: 'BAD_REQUEST',
            message: error.message,
          },
        })
      }
      throw error
    }
  }

  static async list(
    request: FastifyRequest<{ Querystring: ListIntentsQuery }>,
    reply: FastifyReply
  ) {
    try {
      const intentRepository = new PrismaIntentRepository(prisma)
      const useCase = new ListIntentsUseCase(intentRepository)

      const result = await useCase.execute(request.query)

      return reply.status(200).send(result)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({
          error: {
            code: 'BAD_REQUEST',
            message: error.message,
          },
        })
      }
      throw error
    }
  }

  static async approve(
    request: FastifyRequest<{ Params: IntentIdParam }>,
    reply: FastifyReply
  ) {
    try {
      const intentRepository = new PrismaIntentRepository(prisma)
      const inviteRepository = new PrismaInviteRepository(prisma)
      const useCase = new ApproveIntentUseCase(intentRepository, inviteRepository)

      const result = await useCase.execute({
        intentId: request.params.id,
        reviewedBy: 'admin', // TODO: Get from auth context when JWT is implemented
      })

      return reply.status(201).send(result)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({
          error: {
            code: 'BAD_REQUEST',
            message: error.message,
          },
        })
      }
      throw error
    }
  }

  static async reject(
    request: FastifyRequest<{ Params: IntentIdParam }>,
    reply: FastifyReply
  ) {
    try {
      const intentRepository = new PrismaIntentRepository(prisma)
      const useCase = new RejectIntentUseCase(intentRepository)

      const result = await useCase.execute({
        intentId: request.params.id,
        reviewedBy: 'admin', // TODO: Get from auth context when JWT is implemented
      })

      return reply.status(200).send(result)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({
          error: {
            code: 'BAD_REQUEST',
            message: error.message,
          },
        })
      }
      throw error
    }
  }
}
