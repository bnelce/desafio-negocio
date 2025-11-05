import { PrismaClient } from '@prisma/client'
import {
  InviteRepository,
  CreateInviteData,
  UpdateInviteStatusData,
} from '@/application/ports/invite-repository'
import { Invite } from '@/domain/entities/invite'

export class PrismaInviteRepository implements InviteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateInviteData): Promise<Invite> {
    const invite = await this.prisma.invite.create({
      data: {
        intentId: data.intentId,
        token: data.token,
        expiresAt: data.expiresAt,
      },
    })

    return invite
  }

  async findById(id: string): Promise<Invite | null> {
    const invite = await this.prisma.invite.findUnique({
      where: { id },
    })

    return invite
  }

  async findByToken(token: string): Promise<Invite | null> {
    const invite = await this.prisma.invite.findUnique({
      where: { token },
    })

    return invite
  }

  async findByIntentId(intentId: string): Promise<Invite | null> {
    const invite = await this.prisma.invite.findUnique({
      where: { intentId },
    })

    return invite
  }

  async updateStatus(data: UpdateInviteStatusData): Promise<Invite> {
    const invite = await this.prisma.invite.update({
      where: { id: data.id },
      data: {
        status: data.status,
      },
    })

    return invite
  }
}
