import { InviteRepository } from '@/application/ports/invite-repository'
import { InviteEntity } from '@/domain/entities/invite'

export interface ValidateInviteInput {
  token: string
}

export interface ValidateInviteOutput {
  valid: boolean
  reason?: 'expired' | 'used' | 'invalid'
  intentId?: string
  expiresAt?: Date
}

export class ValidateInviteUseCase {
  constructor(private readonly inviteRepository: InviteRepository) {}

  async execute(input: ValidateInviteInput): Promise<ValidateInviteOutput> {
    // Find invite by token
    const invite = await this.inviteRepository.findByToken(input.token)

    if (!invite) {
      return {
        valid: false,
        reason: 'invalid',
      }
    }

    const inviteEntity = new InviteEntity(invite)

    // Check if used
    if (inviteEntity.isUsed()) {
      return {
        valid: false,
        reason: 'used',
      }
    }

    // Check if expired
    if (inviteEntity.isExpired()) {
      // Update status to expired if not already
      if (invite.status === 'PENDING') {
        await this.inviteRepository.updateStatus({
          id: invite.id,
          status: 'EXPIRED',
        })
      }

      return {
        valid: false,
        reason: 'expired',
      }
    }

    return {
      valid: true,
      intentId: invite.intentId,
      expiresAt: invite.expiresAt,
    }
  }
}
