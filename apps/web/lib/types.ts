// Intent types
export type IntentStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface Intent {
  id: string
  fullName: string
  email: string
  phone?: string | null
  notes?: string | null
  status: IntentStatus
  createdAt: string
  reviewedAt?: string | null
  reviewedBy?: string | null
}

export interface CreateIntentInput {
  fullName: string
  email: string
  phone?: string
  notes?: string
}

export interface CreateIntentResponse {
  intent: Intent
}

// Invite types
export type InviteStatus = 'PENDING' | 'USED' | 'EXPIRED'

export interface Invite {
  id: string
  intentId: string
  token: string
  expiresAt: string
  status: InviteStatus
  createdAt: string
}

export interface ValidateInviteResponse {
  valid: boolean
  reason?: 'expired' | 'used' | 'invalid'
  intentId?: string
  expiresAt?: string
}

export interface RegisterMemberInput {
  name: string
  email: string
  phone?: string
  password: string
}

export interface Member {
  id: string
  name: string
  email: string
  phone?: string | null
  role: 'ADMIN' | 'MEMBER'
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
}

export interface RegisterMemberResponse {
  member: Member
}

// List intents
export interface ListIntentsParams {
  status?: IntentStatus
  page?: number
  pageSize?: number
}

export interface ListIntentsResponse {
  items: Intent[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Approve intent
export interface ApproveIntentResponse {
  intent: Intent
  invite: Invite
}

// Reject intent
export interface RejectIntentResponse {
  intent: Intent
}
