import { IntentRepository } from '@/application/ports/intent-repository'
import { InviteRepository } from '@/application/ports/invite-repository'
import { IntentDTO, IntentMapper } from '@/application/dto/intent-dto'
import { InviteDTO, InviteMapper } from '@/application/dto/invite-dto'
import { TokenService } from '@/application/services/token-service'
import { IntentEntity } from '@/domain/entities/intent'
import { env } from '@/config/env'

export interface ApproveIntentInput {
  intentId: string
  reviewedBy: string
}

export interface ApproveIntentOutput {
  intent: IntentDTO
  invite: InviteDTO
}

export class ApproveIntentUseCase {
  constructor(
    private readonly intentRepository: IntentRepository,
    private readonly inviteRepository: InviteRepository
  ) {}

  async execute(input: ApproveIntentInput): Promise<ApproveIntentOutput> {
    // Find intent
    const intent = await this.intentRepository.findById(input.intentId)

    if (!intent) {
      throw new Error('Intent not found')
    }

    // Verify intent can be approved
    const intentEntity = new IntentEntity(intent)

    if (!intentEntity.canBeApproved()) {
      throw new Error(`Intent cannot be approved. Current status: ${intent.status}`)
    }

    // Check if invite already exists
    const existingInvite = await this.inviteRepository.findByIntentId(intent.id)

    if (existingInvite) {
      throw new Error('Intent already has an invite')
    }

    // Generate token and expiration
    const token = TokenService.generate()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + env.INVITE_TTL_DAYS)

    // Update intent status
    const updatedIntent = await this.intentRepository.updateStatus({
      id: input.intentId,
      status: 'APPROVED',
      reviewedBy: input.reviewedBy,
    })

    // Create invite
    const invite = await this.inviteRepository.create({
      intentId: intent.id,
      token,
      expiresAt,
    })

    return {
      intent: IntentMapper.toDTO(updatedIntent),
      invite: InviteMapper.toDTO(invite),
    }
  }
}
