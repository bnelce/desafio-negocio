export type IntentStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface Intent {
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

export class IntentEntity {
  constructor(private readonly props: Intent) {}

  get id(): string {
    return this.props.id
  }

  get fullName(): string {
    return this.props.fullName
  }

  get email(): string {
    return this.props.email
  }

  get phone(): string | null | undefined {
    return this.props.phone
  }

  get notes(): string | null | undefined {
    return this.props.notes
  }

  get status(): IntentStatus {
    return this.props.status
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get reviewedAt(): Date | null | undefined {
    return this.props.reviewedAt
  }

  get reviewedBy(): string | null | undefined {
    return this.props.reviewedBy
  }

  isPending(): boolean {
    return this.props.status === 'PENDING'
  }

  isApproved(): boolean {
    return this.props.status === 'APPROVED'
  }

  isRejected(): boolean {
    return this.props.status === 'REJECTED'
  }

  canBeApproved(): boolean {
    return this.isPending()
  }

  canBeRejected(): boolean {
    return this.isPending()
  }

  toJSON(): Intent {
    return { ...this.props }
  }
}
