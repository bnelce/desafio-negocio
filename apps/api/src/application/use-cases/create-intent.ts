import { IntentRepository } from '@/application/ports/intent-repository'
import { IntentDTO, IntentMapper } from '@/application/dto/intent-dto'

export interface CreateIntentInput {
  fullName: string
  email: string
  phone?: string
  notes?: string
}

export interface CreateIntentOutput {
  intent: IntentDTO
}

export class CreateIntentUseCase {
  constructor(private readonly intentRepository: IntentRepository) {}

  async execute(input: CreateIntentInput): Promise<CreateIntentOutput> {
    // Check if email already has a pending intent
    const existingIntent = await this.intentRepository.findByEmail(input.email)

    if (existingIntent && existingIntent.status === 'PENDING') {
      throw new Error('An intent with this email is already pending review')
    }

    // Create new intent
    const intent = await this.intentRepository.create({
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      notes: input.notes,
    })

    return {
      intent: IntentMapper.toDTO(intent),
    }
  }
}
