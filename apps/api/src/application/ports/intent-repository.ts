import { Intent, IntentStatus } from '@/domain/entities/intent'

export interface CreateIntentData {
  fullName: string
  email: string
  phone?: string
  notes?: string
}

export interface UpdateIntentStatusData {
  id: string
  status: IntentStatus
  reviewedBy: string
}

export interface ListIntentsParams {
  status?: IntentStatus
  page?: number
  pageSize?: number
}

export interface IntentRepository {
  create(data: CreateIntentData): Promise<Intent>
  findById(id: string): Promise<Intent | null>
  findByEmail(email: string): Promise<Intent | null>
  list(params: ListIntentsParams): Promise<{ items: Intent[]; total: number }>
  updateStatus(data: UpdateIntentStatusData): Promise<Intent>
}
