import { IntentRepository } from '@/application/ports/intent-repository'
import { IntentDTO, IntentMapper } from '@/application/dto/intent-dto'
import { IntentEntity } from '@/domain/entities/intent'

export interface RejectIntentInput {
  intentId: string
  reviewedBy: string
}

export interface RejectIntentOutput {
  intent: IntentDTO
}

export class RejectIntentUseCase {
  constructor(private readonly intentRepository: IntentRepository) {}

  async execute(input: RejectIntentInput): Promise<RejectIntentOutput> {
    // Find intent
    const intent = await this.intentRepository.findById(input.intentId)

    if (!intent) {
      throw new Error('Intent not found')
    }

    // Verify intent can be rejected
    const intentEntity = new IntentEntity(intent)

    if (!intentEntity.canBeRejected()) {
      throw new Error(`Intent cannot be rejected. Current status: ${intent.status}`)
    }

    // Update intent status
    const updatedIntent = await this.intentRepository.updateStatus({
      id: input.intentId,
      status: 'REJECTED',
      reviewedBy: input.reviewedBy,
    })

    return {
      intent: IntentMapper.toDTO(updatedIntent),
    }
  }
}
