import { Intent, IntentStatus } from '@/domain/entities/intent'

export interface IntentDTO {
  id: string
  fullName: string
  email: string
  phone?: string | null
  notes?: string | null
  status: IntentStatus
  createdAt: Date
  reviewedAt?: Date | null
  reviewedBy?: string | null
}

export class IntentMapper {
  static toDTO(intent: Intent): IntentDTO {
    return {
      id: intent.id,
      fullName: intent.fullName,
      email: intent.email,
      phone: intent.phone,
      notes: intent.notes,
      status: intent.status,
      createdAt: intent.createdAt,
      reviewedAt: intent.reviewedAt,
      reviewedBy: intent.reviewedBy,
    }
  }
}
