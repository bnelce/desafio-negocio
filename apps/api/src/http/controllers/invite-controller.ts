import { FastifyRequest, FastifyReply } from 'fastify'
import { ValidateInviteUseCase } from '@/application/use-cases/validate-invite'
import { RegisterWithInviteUseCase } from '@/application/use-cases/register-with-invite'
import { PrismaInviteRepository } from '@/infra/db/prisma/repositories/prisma-invite-repository'
import { PrismaMemberRepository } from '@/infra/db/prisma/repositories/prisma-member-repository'
import { prisma } from '@/infra/db/prisma/client'
import {
  InviteTokenParam,
  RegisterWithInviteBody,
  RegisterWithInviteParams,
} from '@/http/schemas/invite-schemas'

export class InviteController {
  static async validate(
    request: FastifyRequest<{ Params: InviteTokenParam }>,
    reply: FastifyReply
  ) {
    try {
      const inviteRepository = new PrismaInviteRepository(prisma)
      const useCase = new ValidateInviteUseCase(inviteRepository)

      const result = await useCase.execute({
        token: request.params.token,
      })

      if (!result.valid) {
        return reply.status(410).send(result)
      }

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

  static async register(
    request: FastifyRequest<{ Params: RegisterWithInviteParams; Body: RegisterWithInviteBody }>,
    reply: FastifyReply
  ) {
    try {
      const inviteRepository = new PrismaInviteRepository(prisma)
      const memberRepository = new PrismaMemberRepository(prisma)
      const useCase = new RegisterWithInviteUseCase(inviteRepository, memberRepository)

      const result = await useCase.execute({
        token: request.params.token,
        ...request.body,
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
}
