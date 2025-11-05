import { Invite, InviteStatus } from '@/domain/entities/invite'

export interface InviteDTO {
  id: string
  intentId: string
  token: string
  expiresAt: Date
  status: InviteStatus
  createdAt: Date
}

export class InviteMapper {
  static toDTO(invite: Invite): InviteDTO {
    return {
      id: invite.id,
      intentId: invite.intentId,
      token: invite.token,
      expiresAt: invite.expiresAt,
      status: invite.status,
      createdAt: invite.createdAt,
    }
  }
}
