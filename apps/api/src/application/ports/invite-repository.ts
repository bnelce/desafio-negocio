import { Invite, InviteStatus } from '@/domain/entities/invite'

export interface CreateInviteData {
  intentId: string
  token: string
  expiresAt: Date
}

export interface UpdateInviteStatusData {
  id: string
  status: InviteStatus
}

export interface InviteRepository {
  create(data: CreateInviteData): Promise<Invite>
  findById(id: string): Promise<Invite | null>
  findByToken(token: string): Promise<Invite | null>
  findByIntentId(intentId: string): Promise<Invite | null>
  updateStatus(data: UpdateInviteStatusData): Promise<Invite>
}
