export type MemberRole = 'ADMIN' | 'MEMBER'
export type MemberStatus = 'ACTIVE' | 'INACTIVE'

export interface Member {
  id: string
  name: string
  email: string
  phone?: string | null
  role: MemberRole
  status: MemberStatus
  password?: string | null
  createdAt: Date
  updatedAt: Date
}

export class MemberEntity {
  constructor(private readonly props: Member) {}

  get id(): string {
    return this.props.id
  }

  get name(): string {
    return this.props.name
  }

  get email(): string {
    return this.props.email
  }

  get phone(): string | null | undefined {
    return this.props.phone
  }

  get role(): MemberRole {
    return this.props.role
  }

  get status(): MemberStatus {
    return this.props.status
  }

  get password(): string | null | undefined {
    return this.props.password
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  isAdmin(): boolean {
    return this.props.role === 'ADMIN'
  }

  isActive(): boolean {
    return this.props.status === 'ACTIVE'
  }

  isInactive(): boolean {
    return this.props.status === 'INACTIVE'
  }

  toJSON(): Omit<Member, 'password'> {
    const { password: _password, ...rest } = this.props
    return rest
  }
}
