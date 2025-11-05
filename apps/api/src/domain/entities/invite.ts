export type InviteStatus = 'PENDING' | 'USED' | 'EXPIRED'

export interface Invite {
  id: string
  intentId: string
  token: string
  expiresAt: Date
  status: InviteStatus
  createdAt: Date
}

export class InviteEntity {
  constructor(private readonly props: Invite) {}

  get id(): string {
    return this.props.id
  }

  get intentId(): string {
    return this.props.intentId
  }

  get token(): string {
    return this.props.token
  }

  get expiresAt(): Date {
    return this.props.expiresAt
  }

  get status(): InviteStatus {
    return this.props.status
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  isPending(): boolean {
    return this.props.status === 'PENDING'
  }

  isUsed(): boolean {
    return this.props.status === 'USED'
  }

  isExpired(): boolean {
    if (this.props.status === 'EXPIRED') return true
    return new Date() > this.props.expiresAt
  }

  isValid(): boolean {
    return this.isPending() && !this.isExpired()
  }

  canBeUsed(): boolean {
    return this.isValid()
  }

  toJSON(): Invite {
    return { ...this.props }
  }
}
